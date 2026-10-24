import { McpServer, createMcpHandler } from "@modelcontextprotocol/server";
import * as z from "zod";
import { TOOLS_SPEC, TOOL_ENDPOINTS } from "./tools-spec.mjs";

const ALLOWED_ORIGINS = new Set([
  "https://api.oiyo.net", "https://oiyo.net", "https://tools.oiyo.net",
]);

function inputSchema(parameters) {
  const required = new Set(parameters.required || []);
  const shape = {};
  for (const [name, property] of Object.entries(parameters.properties)) {
    let schema;
    if (property.enum) schema = z.union(property.enum.map(value => z.literal(value)));
    else if (property.type === "boolean") schema = z.boolean();
    else if (property.type === "integer") schema = z.number().int().safe();
    else if (property.type === "number") schema = z.number().finite();
    else if (property.type === "string") schema = z.string().max(200);
    else throw new Error("Unsupported tool schema type");
    if (property.type === "number" || property.type === "integer") {
      if (property.minimum !== undefined) schema = schema.min(property.minimum);
      if (property.maximum !== undefined) schema = schema.max(property.maximum);
    }
    if (property.description) schema = schema.describe(property.description);
    shape[name] = required.has(name) ? schema : schema.optional();
  }
  return z.strictObject(shape);
}

export function createCalculationServer(dispatch) {
  const server = new McpServer({ name: "oiyo-calculations", version: "1.0.0" });
  for (const { function: tool } of TOOLS_SPEC.tools) {
    const endpoint = TOOL_ENDPOINTS[tool.name];
    if (!endpoint) throw new Error("Tool endpoint missing");
    server.registerTool(tool.name, {
      title: tool.name.replaceAll("_", " "), description: tool.description,
      inputSchema: inputSchema(tool.parameters),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    }, async (args) => {
      // 2026-10-25: route through the in-process REST dispatcher, never public HTTP,
      // so MCP cannot acquire a second formula or send birth/financial inputs elsewhere.
      const url = new URL(endpoint.path, "https://api.oiyo.net");
      const options = { method: endpoint.method || "GET" };
      if (options.method === "POST") {
        options.headers = { "Content-Type": "application/json" };
        options.body = JSON.stringify(args);
      } else {
        for (const [key, value] of Object.entries(args)) url.searchParams.set(key, String(value));
      }
      const response = await dispatch(new Request(url, options));
      const result = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(result) }],
        structuredContent: result, isError: !response.ok,
      };
    });
  }
  return server;
}

export async function handleMcp(request, dispatch) {
  const headers = {
    "Cache-Control": "no-store", "X-Robots-Tag": "noindex",
    "X-Content-Type-Options": "nosniff",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept, MCP-Protocol-Version, Mcp-Method, Mcp-Name",
    Vary: "Origin",
  };
  const origin = request.headers.get("Origin");
  if (origin && !ALLOWED_ORIGINS.has(origin)) return Response.json({ error: "origin_not_allowed" }, { status: 403, headers });
  if (origin) headers["Access-Control-Allow-Origin"] = origin;
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (request.method !== "POST") return Response.json({ error: "method_not_allowed" }, { status: 405, headers: { ...headers, Allow: "POST, OPTIONS" } });
  // No server subscriptions, persistence, or shared session state in this gateway.
  const handler = createMcpHandler(() => createCalculationServer(dispatch), {
    responseMode: "auto", maxRequestBodySize: 32768, maxSubscriptions: 0,
  });
  try {
    const response = await handler.fetch(request);
    // SDK-owned output is bounded by our fixed catalog and deterministic calculations.
    // Materialize before closing the request-scoped legacy transport (SSE compatibility).
    const body = await response.text();
    const merged = new Headers(response.headers);
    for (const [key, value] of Object.entries(headers)) merged.set(key, value);
    return new Response(body || null, { status: response.status, headers: merged });
  } finally {
    await handler.close();
  }
}
