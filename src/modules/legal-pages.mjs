// 2026-11-25 (싱크탱크 RT-02): Claude 커넥터 디렉터리·ChatGPT 앱 등재에 필요한 개인정보·이용약관·지원 페이지.
// 사실만 적는다: 계정·API 키 없음, 도구 입력을 저장하지 않음, 집계 계측(usage.mjs)과 Cloudflare 기본 로그만 있음.
// usage.mjs·rate-limit.mjs·wrangler.jsonc observability가 바뀌면 이 문구도 같이 고친다.

export const LEGAL_UPDATED = "2026-11-25";
export const SUPPORT_EMAIL = "support@oiyo.net";

const page = (title, body) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} · OIYO Calculations API</title>
<style>body{font:16px/1.65 system-ui,-apple-system,"Apple SD Gothic Neo",sans-serif;max-width:46rem;margin:0 auto;padding:2rem 1rem;color:#1f2933;background:#fff}h1{font-size:1.6rem}h2{font-size:1.15rem;margin-top:2rem}a{color:#0b6e4f}small{color:#52606d}@media (prefers-color-scheme:dark){body{background:#111827;color:#e5e7eb}a{color:#6ee7b7}small{color:#9ca3af}}</style>
</head><body>
<h1>${title}</h1>
<p><small>OIYO Calculations API and MCP server (api.oiyo.net, api-oiyo.861106.workers.dev) · Last updated ${LEGAL_UPDATED}</small></p>
${body}
<p><small><a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="/support">Support</a> · <a href="/docs">API docs</a> · <a href="https://github.com/yuli3/api-oiyo">Source</a></small></p>
</body></html>`;

export const PRIVACY_HTML = page("Privacy policy", `
<p>The OIYO Calculations API runs deterministic calculators (South Korea salary, tax, labor, welfare and calendar tools, plus tools for other countries). It is used without an account, sign-in or API key.</p>
<h2>What we collect</h2>
<ul>
<li><strong>Tool inputs are not stored.</strong> The numbers and dates you send (salary, birth date, prices and so on) are used only to compute the answer and are discarded when the response is sent. We do not keep them in any database.</li>
<li><strong>Aggregate usage counts.</strong> For each request we record the path, HTTP method and status class, response time, the visitor's country code, a client type (browser, bot or other), and for MCP requests the JSON-RPC method and the client software name it reports. We do not record query strings, request bodies, tool arguments or IP addresses in these counts.</li>
<li><strong>Abuse protection.</strong> A per-IP request limit (300 per minute) is counted by our host, Cloudflare, in short-lived counters that are not stored by us.</li>
<li><strong>Hosting logs.</strong> Cloudflare, which hosts the service, keeps operational request logs (time, URL, status and connection metadata) for a few days for debugging and security, under the <a href="https://www.cloudflare.com/privacypolicy/">Cloudflare privacy policy</a>.</li>
</ul>
<h2>What we do not do</h2>
<ul>
<li>No cookies, tracking pixels or advertising on API and MCP responses.</li>
<li>No sale or sharing of data with third parties, and no use of inputs to train models. There is no AI model inside the service.</li>
<li>No access to your files, accounts or other tools. Every tool is read-only.</li>
</ul>
<h2>Links in results</h2>
<p>Results include a link to the matching interactive calculator on tools.oiyo.net. That website has its own <a href="https://oiyo.net/en/legal/privacy/">privacy policy</a>, which covers its analytics and ads.</p>
<h2>Retention and contact</h2>
<p>Aggregate usage counts are kept for up to 90 days. Questions or deletion requests: <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
<h2>한국어 요약</h2>
<p>계정·API 키 없이 쓰는 계산 서비스예요. 입력한 금액·날짜는 계산에만 쓰고 저장하지 않아요. 경로·상태·응답 시간·국가 코드 같은 집계만 남기고 IP·입력값은 남기지 않아요. 문의: ${SUPPORT_EMAIL}</p>
`);

export const TERMS_HTML = page("Terms of use", `
<ul>
<li><strong>Free to use.</strong> The API and MCP server are free and need no sign-up. A fair-use limit of about 300 requests per minute per client applies.</li>
<li><strong>Estimates, not advice.</strong> Results are estimates computed from published statutes, rates and official calendars as of each tool's stated date. They are not tax, legal, payroll, financial or investment advice, and they do not replace a filing, an official notice or a qualified professional. Each Korean tax result lists its statute basis and what it does not cover.</li>
<li><strong>No guarantee.</strong> The service is provided "as is", without warranty of accuracy, availability or fitness for a purpose. Rates and laws change; check the official source before you act.</li>
<li><strong>Acceptable use.</strong> Do not use the service to break the law, to overload it, or to present its results as official government figures.</li>
<li><strong>Changes.</strong> Tools may be added, changed or removed. These terms may be updated; the date above shows the latest version.</li>
<li><strong>Contact.</strong> <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></li>
</ul>
<h2>한국어 요약</h2>
<p>무료이며 가입이 필요 없어요. 결과는 공개된 법령·요율로 낸 추정치이고 세무·법률·재무 자문이 아니에요. 실제 신고·결정 전에는 공식 기관이나 전문가에게 확인하세요.</p>
`);

export const SUPPORT_HTML = page("Support", `
<p>Email <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a> (Korean or English). We usually reply within 3 business days (Korea time).</p>
<h2>Connect</h2>
<ul>
<li>MCP endpoint (Streamable HTTP, no auth): <code>https://api-oiyo.861106.workers.dev/mcp</code></li>
<li>Korea welfare tools only: <code>/mcp/welfare</code> · Outside Korea only: <code>/mcp/world</code></li>
<li>REST and OpenAPI: <a href="/docs">api.oiyo.net/docs</a></li>
</ul>
<h2>Reporting a wrong result</h2>
<p>Send the tool name, the input you used and the result you expected (with the official source if you have it). Bugs and feature requests are also welcome as <a href="https://github.com/yuli3/api-oiyo/issues">GitHub issues</a>.</p>
`);
