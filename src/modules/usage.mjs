// 2026-10-27 세운 결정(도구 계측 선행): api.oiyo.net은 호출 수를 전혀 남기지 않았다.
// 요청마다 Workers Analytics Engine에 한 점을 쓴다. 쿼리 문자열·본문·IP는 남기지 않는다
// (급여·생년월일 같은 입력이 쿼리에 실리기 때문). 바인딩이 없으면(테스트·로컬) 아무 일도 안 한다.

const MAX_PATH = 96;

export function clientKind(userAgent) {
  const ua = userAgent || "";
  if (/bot|crawl|spider|slurp|bingpreview|facebookexternalhit/i.test(ua)) return "bot";
  if (/^Mozilla\//.test(ua)) return "browser";
  return ua ? "client" : "none";
}

// channel: "rest"(직접 호출) · "mcp"(/mcp 전송 요청) · "mcp-tool"(MCP가 내부에서 부른 REST 경로)
// 2026-11-21: /mcp 요청의 99%가 initialize·tools/list 확인 요청이고 대부분 "other"로만 남았다.
// MCP 전송 요청에만 JSON-RPC 메서드, initialize의 clientInfo.name, user-agent 첫 제품명을 덧붙인다.
// 셋 다 클라이언트 소프트웨어 이름이고 도구 입력(arguments)은 읽지도 남기지도 않는다.
const SAFE = /[^a-z0-9._/-]+/g;
const clean = (v, n) => String(v ?? "").toLowerCase().replace(SAFE, "-").replace(/^-+|-+$/g, "").slice(0, n);

export function uaProduct(userAgent) {
  const first = String(userAgent || "").trim().split(/\s+/)[0] || "";
  return clean(first.split("/")[0], 30);
}

export function mcpPeek(text) {
  let msg;
  try { msg = JSON.parse(text); } catch { return { rpc: "(unparsed)", client: "" }; }
  const list = Array.isArray(msg) ? msg : [msg];
  const methods = [...new Set(list.map(m => clean(m?.method || (m?.result !== undefined || m?.error ? "(response)" : "(none)"), 40)))].sort();
  const init = list.find(m => m?.method === "initialize");
  return { rpc: methods.join("+").slice(0, 80), client: clean(init?.params?.clientInfo?.name, 40) };
}

export function usagePoint(request, response, latencyMs, channel = "rest", medium = "", peek = null) {
  const url = new URL(request.url);
  const status = response?.status ?? 0;
  // 없는 주소는 임의 문자열이라 그대로 쓰면 카디널리티만 늘고 쓸모가 없다.
  const path = status === 404 ? "(not-found)" : url.pathname.slice(0, MAX_PATH);
  return {
    indexes: [path],
    // blob 7 (2026-11-12 MCP pilot): registry ref or client family for /mcp, "" otherwise. No inputs.
    // blob 8-10 (2026-11-21, MCP transport only): JSON-RPC method(s), initialize clientInfo.name, UA product.
    blobs: [path, request.method, channel, `${Math.floor(status / 100)}xx`, request.cf?.country || "XX", clientKind(request.headers.get("user-agent")), medium,
      ...(peek ? [peek.rpc, peek.client, uaProduct(request.headers.get("user-agent"))] : [])],
    doubles: [status, Math.max(0, Math.round(latencyMs))],
  };
}

export function recordUsage(env, request, response, latencyMs, channel, medium, peek = null) {
  const dataset = env?.API_USAGE;
  if (!dataset || typeof dataset.writeDataPoint !== "function") return;
  try {
    dataset.writeDataPoint(usagePoint(request, response, latencyMs, channel, medium, peek));
  } catch {
    // 계측 실패가 응답을 막으면 안 된다.
  }
}
