/**
 * Static metadata, documentation templates, and verification assets for api.oiyo.net
 */

export const DOCS_HTML = `<!doctype html>
<html lang="ko">
  <head>
    <title>OIYO API Reference (B2A Compute Gateway)</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="OIYO API: LLM 토큰 0개, 외부 의존 0개의 결정적 연산 전용 B2A 게이트웨이. 달력, 노동, 공과금, 단위변환, 사주 OpenAPI 명세." />
    <meta name="naver-site-verification" content="e1043bad51e3be143affbe491f12354fa985fa6a" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="canonical" href="https://api.oiyo.net/docs" />
  </head>
  <body>
    <script id="api-reference" data-url="/openapi.json"></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`;

export const ROBOTS_TXT = `User-agent: *
Allow: /
Allow: /docs
Allow: /openapi.json
Allow: /llms.txt
Allow: /health
Disallow: /v1/

Sitemap: https://api.oiyo.net/sitemap.xml
`;

export const SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://api.oiyo.net/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://api.oiyo.net/docs</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://api.oiyo.net/openapi.json</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://api.oiyo.net/llms.txt</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

export const LLMS_TXT = `# OIYO API (api.oiyo.net)
> High-performance, deterministic computational APIs for AI agents and web applications. Zero LLM tokens, zero external subscriptions.

## Base URL
https://api.oiyo.net

## OpenAPI 3.0 Specification
- Schema: https://api.oiyo.net/openapi.json
- Interactive Reference: https://api.oiyo.net/docs

## Endpoints
- GET /health: Health status check
- GET /openapi.json: OpenAPI 3.0.3 specification
- GET /v1/kr/calendar/holidays?year=2026: South Korea statutory public and substitute holidays
- GET /v1/kr/calendar/is-business-day?date=YYYY-MM-DD: Working day vs holiday determination
- POST /v1/astrology/saju/calculate: Sexagenary cycle (60 Gapja) four pillars and five elements distribution
- GET /v1/labor/kr/unemployment-benefits?wage=...&age=...&period=...&hours=...: Statutory unemployment benefits simulation
- GET /v1/labor/kr/weekly-allowance?hourlyWage=...&hours=...&tax=...: Weekly holiday allowance computation
- GET /v1/labor/kr/overtime-pay?hourlyWage=...&overtimeHours=...&nightHours=...: Overtime & night wage premiums
- GET /v1/military/kr/service-calculator?enlistmentDate=...&branch=...: South Korea military service milestones & promotion dates
- GET /v1/energy/kr/gas-bill?usageM3=...&type=...: City gas heating/cooking bill calculator
- GET /v1/math/units/convert?value=...&from=...&to=...: Exact engineering unit converter (length, area, mass, temperature)

## Operational Guarantees
- All responses are UTF-8 JSON.
- CORS enabled (Access-Control-Allow-Origin: *).
- Deterministic output without server storage or tracking.
`;

export const ADS_TXT = `google.com, pub-9541920090543312, DIRECT, f08c47fec0942fa0
`;

export const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="22" fill="url(#g)" />
  <path d="M35 32 L18 50 L35 68" stroke="#ffffff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none" />
  <path d="M65 32 L82 50 L65 68" stroke="#ffffff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none" />
  <line x1="56" y1="26" x2="44" y2="74" stroke="#ffffff" stroke-width="7" stroke-linecap="round" />
</svg>`;

export const NAVER_VERIFICATION_HTML = `naver-site-verification: naverfeb1d8514db116d06b5d11e882ee9d1c.html`;

export const INDEXNOW_TXT = `0f2131ccadd8edf19887c99ca7aa9f4795a4cae4`;
