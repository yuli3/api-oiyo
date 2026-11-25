// Apify Actor core (2026-11-25, RT-01 MCP·API 유료화 첫 시험).
// No Apify SDK import here, so the repo's `node --test` can check this file against the real worker.
// The Actor calls the public OIYO MCP endpoint statelessly (one JSON-RPC POST per call).
// It never logs or stores tool arguments outside the run's own dataset.

export const DEFAULT_ENDPOINT = "https://api-oiyo.861106.workers.dev/mcp?ref=apify";
export const MAX_CALLS = 50;
const NAME = /^[a-z][a-z0-9_]{2,80}$/;

export class InputError extends Error {}

// Accepts { tool, arguments } for one call, { calls: [{ tool, arguments }] } for a batch,
// or { listTools: true } for the free catalog. Returns { listTools, calls }.
export function normalizeInput(input = {}) {
  if (input === null || typeof input !== "object") throw new InputError("Input must be a JSON object.");
  if (input.listTools === true) return { listTools: true, calls: [] };
  const raw = Array.isArray(input.calls) && input.calls.length
    ? input.calls
    : input.tool ? [{ tool: input.tool, arguments: input.arguments }] : [];
  if (!raw.length) throw new InputError("Give `tool` (and `arguments`), a `calls` array, or set `listTools` to true.");
  if (raw.length > MAX_CALLS) throw new InputError(`At most ${MAX_CALLS} calls per run.`);
  const calls = raw.map((call, index) => {
    const tool = String(call?.tool ?? "").trim();
    if (!NAME.test(tool)) throw new InputError(`calls[${index}].tool is not a valid tool name.`);
    const args = call?.arguments ?? {};
    if (args === null || typeof args !== "object" || Array.isArray(args)) {
      throw new InputError(`calls[${index}].arguments must be an object.`);
    }
    return { tool, arguments: args };
  });
  return { listTools: false, calls };
}

// The worker answers with JSON or a one-message SSE stream depending on Accept; handle both.
export function parseRpcBody(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) return JSON.parse(trimmed);
  const data = trimmed.split(/\r?\n/).filter(line => line.startsWith("data:")).map(line => line.slice(5).trim());
  if (!data.length) throw new Error("Empty response from the calculation server.");
  return JSON.parse(data[data.length - 1]);
}

let nextId = 1;
async function rpc(fetchImpl, endpoint, method, params) {
  const response = await fetchImpl(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      "user-agent": "oiyo-apify-actor/1.0",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: nextId++, method, params }),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Calculation server returned HTTP ${response.status}.`);
  const message = parseRpcBody(text);
  if (message.error) throw new Error(message.error.message || "Calculation server error.");
  return message.result;
}

// One tool call → one dataset item. ok=false items are not charged.
export async function callTool(fetchImpl, endpoint, call) {
  try {
    const result = await rpc(fetchImpl, endpoint, "tools/call", { name: call.tool, arguments: call.arguments });
    const text = result?.content?.find(part => part.type === "text")?.text;
    if (result?.isError) return { tool: call.tool, ok: false, error: text || "The tool rejected the input.", input: call.arguments };
    return {
      tool: call.tool,
      ok: true,
      input: call.arguments,
      result: result?.structuredContent ?? (text ? safeJson(text) : null),
      sourcePage: result?.structuredContent?.sourcePage ?? null,
    };
  } catch (error) {
    return { tool: call.tool, ok: false, error: String(error?.message || error), input: call.arguments };
  }
}

export async function listTools(fetchImpl, endpoint) {
  const result = await rpc(fetchImpl, endpoint, "tools/list", {});
  return (result?.tools ?? []).map(tool => ({
    tool: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
  }));
}

function safeJson(text) {
  try { return JSON.parse(text); } catch { return { text }; }
}
