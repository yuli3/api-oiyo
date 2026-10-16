import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.mjs";

test("health identifies the service", async () => {
  const response = await worker.fetch(new Request("https://api.oiyo.net/health"));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok", service: "oiyo-api" });
  assert.equal(response.headers.get("X-Robots-Tag"), "noindex, nofollow");
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), "*");
});

test("root returns gateway catalog and openapi docs", async () => {
  const response = await worker.fetch(new Request("https://api.oiyo.net/"));
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.service, "oiyo-api");
  assert.ok(data.endpoints.length >= 7);

  const openapiRes = await worker.fetch(new Request("https://api.oiyo.net/openapi.json"));
  assert.equal(openapiRes.status, 200);
  const openapi = await openapiRes.json();
  assert.equal(openapi.openapi, "3.0.3");
});

test("calendar holidays endpoint returns valid JSON", async () => {
  const response = await worker.fetch(new Request("https://api.oiyo.net/v1/kr/calendar/holidays?year=2026"));
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.year, 2026);
  assert.ok(data.holidays.length > 0);
});

test("calendar is-business-day endpoint accurately determines working days", async () => {
  const res1 = await worker.fetch(new Request("https://api.oiyo.net/v1/kr/calendar/is-business-day?date=2026-10-16"));
  assert.equal(res1.status, 200);
  const data1 = await res1.json();
  assert.equal(data1.is_business_day, true);

  const res2 = await worker.fetch(new Request("https://api.oiyo.net/v1/kr/calendar/is-business-day?date=2026-03-02"));
  assert.equal(res2.status, 200);
  const data2 = await res2.json();
  assert.equal(data2.is_business_day, false);
});

test("saju calculate endpoint computes four pillars deterministically", async () => {
  const req = new Request("https://api.oiyo.net/v1/astrology/saju/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ year: 1990, month: 5, day: 15, hour: 14 }),
  });
  const res = await worker.fetch(req);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.pillars.year);
  assert.ok(data.pillars.day);
  assert.ok(data.five_elements);
});

test("labor unemployment-benefits endpoint returns accurate calculation", async () => {
  const res = await worker.fetch(new Request("https://api.oiyo.net/v1/labor/kr/unemployment-benefits?wage=3000000&age=under&period=p3"));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.year, 2026);
  assert.equal(data.scheduledDays, 180);
  assert.equal(data.dailyBenefit, 64192);
  assert.ok(data.totalBenefit > 0);
});

test("labor weekly-allowance endpoint returns allowance breakdown", async () => {
  const res = await worker.fetch(new Request("https://api.oiyo.net/v1/labor/kr/weekly-allowance?hourlyWage=10030&hours=20"));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.isEligible, true);
  assert.equal(data.allowanceHours, 4);
  assert.equal(data.weeklyAllowance, 40120);
});

test("math units convert endpoint performs accurate conversion", async () => {
  const res = await worker.fetch(new Request("https://api.oiyo.net/v1/math/units/convert?value=100&from=m2&to=pyeong"));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.type, "area");
  assert.equal(Math.round(data.outputValue), 30);
});

test("CORS OPTIONS preflight returns 204", async () => {
  const response = await worker.fetch(new Request("https://api.oiyo.net/v1/kr/calendar/holidays", { method: "OPTIONS" }));
  assert.equal(response.status, 204);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), "*");
});

test("labor overtime-pay endpoint calculates correct premiums", async () => {
  const res = await worker.fetch(new Request("https://api.oiyo.net/v1/labor/kr/overtime-pay?hourlyWage=10030&overtimeHours=10&nightHours=5"));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.baseHourlyWage, 10030);
  assert.equal(data.overtime.pay, Math.floor(10 * 10030 * 1.5));
  assert.equal(data.night.pay, Math.floor(5 * 10030 * 0.5));
});

test("military service-calculator endpoint returns milestones", async () => {
  const res = await worker.fetch(new Request("https://api.oiyo.net/v1/military/kr/service-calculator?enlistmentDate=2026-03-02&branch=army&currentDate=2026-09-02"));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.branch, "army");
  assert.equal(data.serviceMonths, 18);
  assert.equal(data.dischargeDate, "2027-09-01");
  assert.equal(data.currentRank, "일병");
});

test("energy gas-bill endpoint computes correct billing", async () => {
  const res = await worker.fetch(new Request("https://api.oiyo.net/v1/energy/kr/gas-bill?usageM3=50&type=heating"));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.usageM3, 50);
  assert.equal(data.energyConsumedMJ, 2140);
  assert.equal(data.totalBilled, 53240);
});

test("404 fallback for undefined routes", async () => {
  const response = await worker.fetch(new Request("https://api.oiyo.net/unknown"));
  assert.equal(response.status, 404);
  const data = await response.json();
  assert.equal(data.error, "not_found");
});

test("interactive docs returns HTML documentation", async () => {
  const res = await worker.fetch(new Request("https://api.oiyo.net/docs"));
  assert.equal(res.status, 200);
  assert.match(res.headers.get("Content-Type"), /text\/html/);
  const body = await res.text();
  assert.match(body, /@scalar\/api-reference/);
  assert.match(body, /e1043bad51e3be143affbe491f12354fa985fa6a/);
});

test("robots.txt returns correct crawl policy and sitemap link", async () => {
  const res = await worker.fetch(new Request("https://api.oiyo.net/robots.txt"));
  assert.equal(res.status, 200);
  const body = await res.text();
  assert.match(body, /Sitemap: https:\/\/api\.oiyo\.net\/sitemap\.xml/);
  assert.match(body, /Allow: \/docs/);
  assert.match(body, /Disallow: \/v1\//);
});

test("sitemap.xml returns valid urlset", async () => {
  const res = await worker.fetch(new Request("https://api.oiyo.net/sitemap.xml"));
  assert.equal(res.status, 200);
  assert.match(res.headers.get("Content-Type"), /application\/xml/);
  const body = await res.text();
  assert.match(body, /<loc>https:\/\/api\.oiyo\.net\/docs<\/loc>/);
});

test("llms.txt returns agent reference guide", async () => {
  const res = await worker.fetch(new Request("https://api.oiyo.net/llms.txt"));
  assert.equal(res.status, 200);
  const body = await res.text();
  assert.match(body, /# OIYO API/);
  assert.match(body, /Deterministic/i);
});

test("ads.txt returns official publisher record", async () => {
  const res = await worker.fetch(new Request("https://api.oiyo.net/ads.txt"));
  assert.equal(res.status, 200);
  const body = await res.text();
  assert.match(body, /pub-9541920090543312/);
});

test("favicon endpoints return valid SVG icon", async () => {
  const res = await worker.fetch(new Request("https://api.oiyo.net/favicon.svg"));
  assert.equal(res.status, 200);
  assert.match(res.headers.get("Content-Type"), /image\/svg\+xml/);
  const body = await res.text();
  assert.match(body, /<svg/);
});

test("search engine verification routes return tokens", async () => {
  const naver = await worker.fetch(new Request("https://api.oiyo.net/naverfeb1d8514db116d06b5d11e882ee9d1c.html"));
  assert.equal(naver.status, 200);
  const naverBody = await naver.text();
  assert.match(naverBody, /naverfeb1d8514db116d06b5d11e882ee9d1c/);

  const indexnow = await worker.fetch(new Request("https://api.oiyo.net/0f2131ccadd8edf19887c99ca7aa9f4795a4cae4.txt"));
  assert.equal(indexnow.status, 200);
  const indexnowBody = await indexnow.text();
  assert.match(indexnowBody, /0f2131ccadd8edf19887c99ca7aa9f4795a4cae4/);
});


