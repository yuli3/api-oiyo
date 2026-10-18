/**
 * Static metadata, documentation templates, and verification assets for api.oiyo.net
 */

export const DOCS_HTML = `<!doctype html>
<html lang="ko">
  <head>
    <title>OIYO API Reference (B2A Compute Gateway)</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="msvalidate.01" content="783A69A1E6B2817777BDE8F3083852CD" />
    <meta name="description" content="OIYO API: LLM 토큰 0개, 외부 의존 0개의 결정적 연산 전용 B2A 게이트웨이. 달력, 노동, 금융, 공과금, 단위변환, 사주 OpenAPI 명세." />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="canonical" href="https://api.oiyo.net/docs" />
  </head>
  <body>
    <main>
      <h1>OIYO API 사용 안내</h1>
      <p>달력·한국 노동·생활 계산·단위 변환을JSON으로 호출하는 결정적 연산 API예요. 요청·응답과 입력 조건은 아래 OpenAPI 문서에서 확인할 수 있어요.</p>
      <p>세금·수당 결과는 모의계산이며 신고·수급 자격 확정이나 전문가 상담을 대체하지 않아요. 근로소득세는 연간 환산 추정치예요. 사주 연주·월주는 단순 근사이며 정밀 절기·시간대 계산을 제공하지 않아요.</p>
      <nav aria-label="API 참고 자료"><a href="/openapi.json">OpenAPI 명세</a> · <a href="/tools.json">에이전트 도구 정의</a> · <a href="/llms-full.txt">전체 사용 가이드</a> · <a href="/health">서비스 상태</a></nav>
      <p>공개 문서 화면은 방문 통계와 광고를 사용해요. JSON API 응답에는 브라우저 통계·광고 스크립트를 넣지 않아요. <a href="https://blog.oiyo.net/ko/privacy/">개인정보 처리방침</a></p>
    </main>
    <script id="api-reference" data-url="/openapi.json"></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
    <!-- OIYO_BROWSER_TAGS -->
  </body>
</html>`;

export const ROBOTS_TXT = `User-agent: *
Allow: /
Allow: /docs
Allow: /openapi.json
Allow: /tools.json
Allow: /llms.txt
Allow: /llms-full.txt
Allow: /health
Disallow: /v1/

Sitemap: https://api.oiyo.net/sitemap.xml
`;

// 2026-10-17: only /docs is indexable. "/" is noindex (JSON index / docs alias) and the
// machine files carry X-Robots-Tag: noindex, so listing them here would contradict that.
export const SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://api.oiyo.net/docs</loc>
    <changefreq>weekly</changefreq>
  </url>
</urlset>`;

export const LLMS_TXT = `# OIYO API (api.oiyo.net)
> High-performance, deterministic computational APIs for AI agents and web applications. Zero LLM tokens, zero external subscriptions.

## Base URL
https://api.oiyo.net

## Specifications
- OpenAPI 3.0: https://api.oiyo.net/openapi.json
- Agent Tool Schemas: https://api.oiyo.net/tools.json
- Interactive Docs: https://api.oiyo.net/docs
- Full Agent Guide: https://api.oiyo.net/llms-full.txt

## Endpoints
- GET /health: Health status check
- GET /openapi.json: OpenAPI 3.0.3 specification
- GET /tools.json: OpenAI/Claude function-calling tool declarations
- GET /llms-full.txt: Full reference with parameter details & curl samples
- GET /v1/kr/calendar/holidays?year=2026: South Korea statutory public and substitute holidays
- GET /v1/kr/calendar/is-business-day?date=YYYY-MM-DD: Working day vs holiday determination
- POST /v1/astrology/saju/calculate: Sexagenary cycle (60 Gapja) four pillars and five elements distribution
- GET /v1/labor/kr/unemployment-benefits?wage=...&age=...&period=...&hours=...: Statutory unemployment benefits simulation
- GET /v1/labor/kr/weekly-allowance?hourlyWage=...&hours=...&tax=...: Weekly holiday allowance computation
- GET /v1/labor/kr/overtime-pay?hourlyWage=...&overtimeHours=...&nightHours=...: Overtime & night wage premiums
- GET /v1/labor/kr/net-salary?salary=...&isAnnual=...&nonTaxable=...&dependents=...: 2026 Net salary & 4 major insurances calculation
- GET /v1/labor/kr/severance-pay?startDate=...&endDate=...&threeMonthSalary=...: Statutory severance pay calculation
- GET /v1/labor/kr/annual-leave?yearsOfService=...&hourlyWage=...&unusedDays=...: Statutory annual leave days & unused leave pay
- GET /v1/military/kr/service-calculator?enlistmentDate=...&branch=...: South Korea military service milestones & promotion dates
- GET /v1/energy/kr/gas-bill?usageM3=...&type=...: City gas heating/cooking bill calculator
- GET /v1/math/units/convert?value=...&from=...&to=...: Exact engineering unit converter (length, area, mass, temperature)
- GET /v1/finance/cagr?initialValue=...&finalValue=...&years=...: Compound Annual Growth Rate (CAGR) calculation
- GET /v1/finance/compound-interest?principal=...&rate=...&years=...&monthlyContribution=...: Compound interest & savings simulator

## Operational Guarantees
- All responses are UTF-8 JSON.
- CORS enabled (Access-Control-Allow-Origin: *).
- Deterministic output without application-level result storage. Browser documentation uses analytics and advertising; infrastructure access logs are outside this statement.
`;

export const LLMS_FULL_TXT = `# OIYO API - Complete AI Agent Reference Manual (llms-full.txt)
> Host: https://api.oiyo.net
> Protocol: HTTPS REST / JSON
> Purpose: Deterministic computational endpoints for AI agents. Outputs depend on model assumptions, input validation and documented scope; statutory or astronomical accuracy is not guaranteed.

## Standard Error Response
All endpoints return standard HTTP error status codes (400, 404, 405) with JSON payload:
\`\`\`json
{ "error": "Human readable error description" }
\`\`\`

---

## 1. Calendar Services

### GET /v1/kr/calendar/holidays
Returns the implemented public/substitute holiday list for South Korea. Solar terms are not returned. Check the current year range and response contract in /openapi.json.
- Query Parameters:
  - \`year\` (integer, optional, default: current year): e.g. 2026
- Example:
  \`curl "https://api.oiyo.net/v1/kr/calendar/holidays?year=2026"\`

### GET /v1/kr/calendar/is-business-day
Checks if a date is a South Korea working business day or a public holiday/weekend.
- Query Parameters:
  - \`date\` (string, required, format YYYY-MM-DD): e.g. 2026-10-16
- Response:
  \`\`\`json
  { "date": "2026-10-16", "isBusinessDay": true, "isWeekend": false, "isHoliday": false, "dayOfWeek": "금요일" }
  \`\`\`

---

## 2. Astrology & Four Pillars

### POST /v1/astrology/saju/calculate
Computes the traditional Korean sexagenary cycle (60 Gapja) four pillars and five elements balance.
This is a simplified model: the year boundary approximates February 4 and the month pillar uses Gregorian months. It does not perform precise solar-term, birthplace or timezone correction. Do not treat it as a precision astronomical calendar or diagnosis.
- Request Body (JSON):
  \`\`\`json
  { "year": 1995, "month": 5, "day": 12, "hour": 14, "isLunar": false }
  \`\`\`
- Response:
  Contains yearPillar, monthPillar, dayPillar, hourPillar, and fiveElementsDistribution.

---

## 3. Statutory Labor Standards (South Korea)

### GET /v1/labor/kr/unemployment-benefits
- Query Parameters:
  - \`wage\` (number, monthly wage in KRW)
  - \`age\` ("under" | "over")
  - \`period\` ("p1" | "p2" | "p3" | "p4" | "p5"; insured-period bands are defined in /openapi.json)
  - \`hours\` (number, daily working hours, default 8)

### GET /v1/labor/kr/weekly-allowance
- Query Parameters:
  - \`hourlyWage\` (number, KRW)
  - \`hours\` (number, weekly contractual hours >= 15)
  - \`tax\` ("none" | "freelance" | "four", optional)

### GET /v1/labor/kr/overtime-pay
- Query Parameters:
  - \`hourlyWage\` (number, KRW)
  - \`overtimeHours\` (number, hours > 8h/day or 40h/week, 1.5x)
  - \`nightHours\` (number, 22:00-06:00, 0.5x)
  - \`holidayHours8orLess\` (number, 1.5x)
  - \`holidayHoursOver8\` (number, 2.0x)

### GET /v1/labor/kr/net-salary
- Query Parameters:
  - \`salary\` (number, monthly or annual salary in KRW)
  - \`isAnnual\` (boolean, default false)
  - \`nonTaxable\` (number, non-taxable allowance in KRW, default 200,000)
  - \`dependents\` (integer, number of dependents, default 1)
  - \`payMonth\` (YYYY-MM, optional, default 2026-07; selects pension base bounds)
- Rates: 2026 statutory (effective 2026-01-01). Income tax is an annualized estimate, not the NTS withholding table.

### GET /v1/labor/kr/severance-pay
- Query Parameters:
  - \`startDate\` (YYYY-MM-DD)
  - \`endDate\` (YYYY-MM-DD)
  - \`threeMonthSalary\` (number, total 3-month salary in KRW)
  - \`annualBonus\` (number, optional)
  - \`annualLeaveAllowance\` (number, optional)

### GET /v1/labor/kr/annual-leave
- Query Parameters:
  - \`yearsOfService\` (number, continuous service years)
  - \`hourlyWage\` (number, default 10,320 KRW — 2026 minimum wage)
  - \`unusedDays\` (number, optional)

---

## 4. Military Service Milestones

### GET /v1/military/kr/service-calculator
- Query Parameters:
  - \`enlistmentDate\` (YYYY-MM-DD, required)
  - \`branch\` ("army" | "marines" | "navy" | "airforce" | "public", default army)
  - \`currentDate\` (YYYY-MM-DD, optional)

---

## 5. Utilities & Energy

### GET /v1/energy/kr/gas-bill
- Query Parameters:
  - \`usageM3\` (number, volume in m³, default 50)
  - \`type\` ("heating" | "cooking", default heating)
  - \`calorific\` (number, optional MJ/m³, default 42.8)

---

## 6. Unit Conversion

### GET /v1/math/units/convert
Universal deterministic conversion for area, length, mass, and temperature.
- Query Parameters:
  - \`value\` (number, required)
  - \`from\` (string, e.g. "pyeong", "m2", "sqft", "ha", "cm", "inch", "ft", "kg", "lb", "c", "f")
  - \`to\` (string, e.g. "m2", "pyeong", "sqft", "ft", "inch", "lb", "kg", "f", "c")
- Example:
  \`curl "https://api.oiyo.net/v1/math/units/convert?value=33&from=pyeong&to=m2"\`

---

## 7. Finance & Investment

### GET /v1/finance/cagr
Calculates Compound Annual Growth Rate (CAGR) and Rule of 72 doubling horizon.
- Query Parameters:
  - \`initialValue\` (number, required, > 0): Beginning asset or investment value
  - \`finalValue\` (number, required, >= 0): Ending asset value
  - \`years\` (number, required, > 0): Investment duration in years
- Example:
  \`curl "https://api.oiyo.net/v1/finance/cagr?initialValue=10000000&finalValue=20000000&years=5"\`
- Response:
  \`\`\`json
  {
    "initialValue": 10000000,
    "finalValue": 20000000,
    "years": 5,
    "cagr": 0.1487,
    "cagrPercent": 14.87,
    "totalReturn": 1.0,
    "totalReturnPercent": 100.0,
    "multiplier": 2.0,
    "ruleOf72Years": 4.84,
    "annualBreakdown": [...]
  }
  \`\`\`

### GET /v1/finance/compound-interest
Simulates compound interest growth with optional monthly recurring contributions.
- Query Parameters:
  - \`principal\` (number, default 10,000,000): Initial lump sum
  - \`rate\` (number, default 7): Annual yield / interest rate in percent (%)
  - \`years\` (number, default 10): Duration in years
  - \`monthlyContribution\` (number, default 0): Additional monthly savings
  - \`compoundingFrequency\` ("monthly" | "annually", default "monthly")
- Example:
  \`curl "https://api.oiyo.net/v1/finance/compound-interest?principal=10000000&rate=8&years=10&monthlyContribution=500000"\`
- Response:
  Returns final balance, total principal, total interest earned, ROI percentage, Rule of 72, and annual progress chart data.
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

// API-specific file supplied by the user on 2026-10-18; not a meta-verification token.
export const CURRENT_NAVER_VERIFICATION_HTML = `naver-site-verification: naver30ca6024e3afe9efab466a8203cc4f7c.html`;

export const DOCS_BROWSER_TAGS = `<aside aria-label="광고" data-manual-ad="api-docs-end" hidden>
<p>광고</p><ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-9541920090543312" data-ad-slot="2768903568" data-ad-format="auto" data-full-width-responsive="true"></ins></aside>
<style>[data-manual-ad="api-docs-end"]{margin:48px 16px 24px;min-height:300px;padding-top:16px}[data-manual-ad="api-docs-end"][hidden]{display:none}[data-manual-ad="api-docs-end"] p{text-align:center}</style>
<script>
(function(){
  if(location.hostname!=='api.oiyo.net'||location.pathname!=='/docs')return;
  window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments)};
  gtag('js',new Date());gtag('config','G-915L6V38X6',{page_location:location.origin+location.pathname});
  var ga=document.createElement('script');ga.async=true;ga.src='https://www.googletagmanager.com/gtag/js?id=G-915L6V38X6';document.head.appendChild(ga);
  var host=document.querySelector('[data-manual-ad="api-docs-end"]');if(!host)return;host.hidden=false;
  var ins=host.querySelector('ins');
  if('MutationObserver'in window)new MutationObserver(function(){if(ins.getAttribute('data-ad-status')==='unfilled')host.hidden=true}).observe(ins,{attributes:true,attributeFilter:['data-ad-status']});
  function fill(){if(host.dataset.requested)return;host.dataset.requested='1';var loader=document.createElement('script');loader.async=true;loader.crossOrigin='anonymous';loader.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9541920090543312';document.head.appendChild(loader);(window.adsbygoogle=window.adsbygoogle||[]).push({})}
  if(!('IntersectionObserver'in window)){fill();return}
  var io=new IntersectionObserver(function(entries){if(entries.some(function(e){return e.isIntersecting})){fill();io.disconnect()}},{rootMargin:'300px'});io.observe(host);
})();
</script>`;

export const INDEXNOW_TXT = `0f2131ccadd8edf19887c99ca7aa9f4795a4cae4`;
