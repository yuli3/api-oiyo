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
export function usagePoint(request, response, latencyMs, channel = "rest") {
  const url = new URL(request.url);
  const status = response?.status ?? 0;
  // 없는 주소는 임의 문자열이라 그대로 쓰면 카디널리티만 늘고 쓸모가 없다.
  const path = status === 404 ? "(not-found)" : url.pathname.slice(0, MAX_PATH);
  return {
    indexes: [path],
    blobs: [path, request.method, channel, `${Math.floor(status / 100)}xx`, request.cf?.country || "XX", clientKind(request.headers.get("user-agent"))],
    doubles: [status, Math.max(0, Math.round(latencyMs))],
  };
}

export function recordUsage(env, request, response, latencyMs, channel) {
  const dataset = env?.API_USAGE;
  if (!dataset || typeof dataset.writeDataPoint !== "function") return;
  try {
    dataset.writeDataPoint(usagePoint(request, response, latencyMs, channel));
  } catch {
    // 계측 실패가 응답을 막으면 안 된다.
  }
}
