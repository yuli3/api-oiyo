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

test("net-salary endpoint computes monthly net wage and insurance breakdown", async () => {
  const res = await worker.fetch(new Request("https://api.oiyo.net/v1/labor/kr/net-salary?salary=4000000&isAnnual=false&nonTaxable=200000&dependents=1"));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.grossMonthly, 4000000);
  assert.equal(data.taxable, 3800000);
  assert.ok(data.netPayMonthly > 3300000 && data.netPayMonthly < 3600000);
  assert.ok(data.insurances.nationalPension > 0);
  assert.ok(data.taxes.incomeTax > 0);
});

test("severance-pay endpoint computes statutory retirement pay", async () => {
  const res = await worker.fetch(new Request("https://api.oiyo.net/v1/labor/kr/severance-pay?startDate=2024-01-01&endDate=2026-01-01&threeMonthSalary=9000000"));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.isEligible, true);
  assert.ok(data.severancePay > 5500000);
});

test("annual-leave endpoint computes statutory entitlement and cash-out allowance", async () => {
  const res = await worker.fetch(new Request("https://api.oiyo.net/v1/labor/kr/annual-leave?yearsOfService=3&hourlyWage=12000&dailyHours=8&unusedDays=5"));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.statutoryLeaveDays, 16);
  assert.equal(data.unusedLeaveAllowance, 5 * 12000 * 8);
});

test("tools.json endpoint returns AI agent tool definitions", async () => {
  const res = await worker.fetch(new Request("https://api.oiyo.net/tools.json"));
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("Content-Type"), "application/json; charset=utf-8");
  const data = await res.json();
  assert.ok(Array.isArray(data.tools));
  assert.ok(data.tools.length >= 14);
  const toolNames = data.tools.map((t) => t.function.name);
  assert.ok(toolNames.includes("calculate_cagr"));
  assert.ok(toolNames.includes("calculate_compound_interest"));
});

test("llms-full.txt endpoint returns comprehensive documentation", async () => {
  const res = await worker.fetch(new Request("https://api.oiyo.net/llms-full.txt"));
  assert.equal(res.status, 200);
  const text = await res.text();
  assert.ok(text.includes("OIYO API - Complete AI Agent Reference Manual"));
  assert.ok(text.includes("/v1/finance/cagr"));
});

test("finance cagr endpoint calculates compound annual growth rate", async () => {
  const res = await worker.fetch(new Request("https://api.oiyo.net/v1/finance/cagr?initialValue=10000000&finalValue=20000000&years=5"));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.initialValue, 10000000);
  assert.equal(data.finalValue, 20000000);
  assert.equal(data.cagrPercent, 14.87);
  assert.equal(data.multiplier, 2.0);
});

test("finance compound-interest endpoint calculates interest and balance", async () => {
  const res = await worker.fetch(new Request("https://api.oiyo.net/v1/finance/compound-interest?principal=10000000&rate=7&years=10&monthlyContribution=500000"));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.principal, 10000000);
  assert.equal(data.totalPrincipal, 70000000);
  assert.ok(data.finalBalance > 70000000);
  assert.ok(data.totalInterest > 0);
});

test("calendar dday endpoint calculates days remaining accurately", async () => {
  const res = await worker.fetch(new Request("https://api.oiyo.net/v1/kr/calendar/dday?baseDate=2026-03-01&targetDate=2026-03-31"));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.daysRemaining, 30);
  assert.equal(data.code, "D-30");
  assert.equal(data.status, "future");
});

test("calendar workdays endpoint calculates working days excluding weekends and holidays", async () => {
  const res = await worker.fetch(new Request("https://api.oiyo.net/v1/kr/calendar/workdays?startDate=2026-03-01&endDate=2026-03-07"));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.totalDays, 7);
  // 2026-03-01 is Sunday (weekend), 2026-03-02 is 3.1 대체공휴일, 2026-03-07 is Saturday (weekend)
  // Workdays: March 3, 4, 5, 6 = 4 days
  assert.equal(data.workdays, 4);
  assert.equal(data.holidaysCount, 1);
});

test("finance inflation endpoint calculates purchasing power over time", async () => {
  const res = await worker.fetch(new Request("https://api.oiyo.net/v1/finance/inflation?baseYear=2000&targetYear=2026&amount=1000000"));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.baseYear, 2000);
  assert.equal(data.targetYear, 2026);
  assert.ok(data.adjustedAmount > 2000000);
  assert.ok(data.cpiGrowthPercent > 100);
});

test("finance loan-repayment endpoint calculates equal principal and interest schedule", async () => {
  const res = await worker.fetch(new Request("https://api.oiyo.net/v1/finance/loan-repayment?principal=100000000&annualRate=4.5&months=360&method=equalPI"));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.principal, 100000000);
  assert.ok(data.firstMonthlyPayment > 500000);
  assert.ok(data.totalInterest > 80000000);
  assert.equal(data.totalPayment, data.principal + data.totalInterest);
});

test("finance stock-average endpoint calculates blended average price", async () => {
  const res = await worker.fetch(new Request("https://api.oiyo.net/v1/finance/stock-average?currentShares=100&currentPrice=50000&additionalShares=100&additionalPrice=30000"));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.totalShares, 200);
  assert.equal(data.totalCost, 8000000);
  assert.equal(data.newAveragePrice, 40000);
  assert.equal(data.priceDiff, -10000);
  assert.equal(data.priceDiffPercent, -20);
});

test("finance dividend-yield endpoint calculates yield and net dividends", async () => {
  const res = await worker.fetch(new Request("https://api.oiyo.net/v1/finance/dividend-yield?sharePrice=50000&annualDividendPerShare=2500&sharesHeld=200&dividendTaxRate=15.4"));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.grossYieldPercent, 5.0);
  assert.equal(data.grossAnnualDividend, 500000);
  assert.equal(data.taxAmount, 77000);
  assert.equal(data.netAnnualDividend, 423000);
  assert.equal(data.netMonthlyDividend, 35250);
});

test("real-estate brokerage-fee endpoint calculates statutory commission limit", async () => {
  const res = await worker.fetch(new Request("https://api.oiyo.net/v1/real-estate/brokerage-fee?transactionType=sale&propertyType=residential&amount=500000000"));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.statutoryMaxRatePercent, 0.4);
  assert.equal(data.brokerageFee, 2000000);
  assert.equal(data.vat, 200000);
  assert.equal(data.totalWithVat, 2200000);
});

test("real-estate acquisition-tax endpoint calculates tax and first-home discount", async () => {
  const res = await worker.fetch(new Request("https://api.oiyo.net/v1/real-estate/acquisition-tax?price=500000000&houseCount=1&isFirstHome=true"));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.baseRatePercent, 1.0);
  // 500,000,000 * 1% = 5,000,000 mainTax. With 2,000,000 first home discount -> 3,000,000
  assert.equal(data.discountAmount, 2000000);
  assert.equal(data.mainTax, 3000000);
  assert.equal(data.educationTax, 500000); // 500,000,000 * 0.1%
  assert.equal(data.totalTax, 3500000);
});

test("finance youth-savings endpoint calculates government contribution and tax savings", async () => {
  const res = await worker.fetch(new Request("https://api.oiyo.net/v1/finance/youth-savings?monthlyDeposit=700000&annualIncome=30000000&bankRate=5.5&months=60"));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.monthlyDeposit, 700000);
  assert.equal(data.principal, 42000000);
  assert.equal(data.monthlyGovContribution, 23000); // capped at 23,000 for 30M income
  assert.equal(data.totalGovContribution, 23000 * 60);
  assert.ok(data.totalPayout > 48000000);
  assert.ok(data.effectiveYieldPercent > 15);
});

test("finance deposit-maturity endpoint calculates interest and net payout", async () => {
  const res = await worker.fetch(new Request("https://api.oiyo.net/v1/finance/deposit-maturity?type=lumpSum&amount=10000000&annualRate=4.0&months=12&taxType=normal"));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.principal, 10000000);
  assert.equal(data.grossInterest, 400000);
  assert.equal(data.taxAmount, 61600); // 15.4% of 400k
  assert.equal(data.netInterest, 338400);
  assert.equal(data.netPayout, 10338400);
});

test("auto tax endpoint calculates vehicle annual tax and prepayment discount", async () => {
  const res = await worker.fetch(new Request("https://api.oiyo.net/v1/auto/tax?powerType=ice&engineCc=1998&vehicleAgeYears=0&prepaymentMonth=jan"));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.powerType, "ice");
  assert.equal(data.baseTax, 1998 * 200); // 399,600
  assert.equal(data.eduTax, Math.round(399600 * 0.3)); // 119,880
  assert.equal(data.prepaymentDiscountRate, 4.6);
  assert.ok(data.annualTax < 519480);
});

test("auto registration endpoint calculates vehicle acquisition tax and eco discount", async () => {
  const res = await worker.fetch(new Request("https://api.oiyo.net/v1/auto/registration?price=35000000&vehicleType=sedan&ecoType=hybrid"));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.price, 35000000);
  assert.equal(data.taxRatePercent, 7);
  assert.equal(data.grossTax, 2450000); // 35M * 7%
  assert.equal(data.ecoDiscount, 400000); // Hybrid 400k discount
  assert.equal(data.netAcquisitionTax, 2050000);
});

test("labor unemployment-benefits endpoint calculates scheduled days and benefit amount", async () => {
  const res = await worker.fetch(new Request("https://api.oiyo.net/v1/labor/unemployment-benefits?wage=3500000&age=under&period=p3&hours=8"));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.scheduledDays, 180);
  assert.equal(data.dailyBenefit, 66000); // capped at 66,000
  assert.equal(data.totalBenefit, 66000 * 180);
});

test("labor parental-leave endpoint calculates standard and 6+6 special rates", async () => {
  // 1. Standard mode
  const res1 = await worker.fetch(new Request("https://api.oiyo.net/v1/labor/parental-leave?monthlyWage=3500000&leaveMonths=12&is6Plus6=false"));
  assert.equal(res1.status, 200);
  const data1 = await res1.json();
  assert.equal(data1.leaveMonths, 12);
  assert.ok(data1.totalBenefit > 20000000);
  assert.ok(data1.totalDeferred > 0);

  // 2. 6+6 special scheme mode
  const res2 = await worker.fetch(new Request("https://api.oiyo.net/v1/labor/parental-leave?monthlyWage=4000000&leaveMonths=6&is6Plus6=true"));
  assert.equal(res2.status, 200);
  const data2 = await res2.json();
  assert.equal(data2.isParental6Plus6, true);
  assert.equal(data2.totalDeferred, 0); // 100% upfront in first 6 months
  assert.ok(data2.totalBenefit >= 18000000);
});

test("real-estate brokerage-fee endpoint calculates statutory commission and VAT", async () => {
  const res = await worker.fetch(new Request("https://api.oiyo.net/v1/real-estate/brokerage-fee?transactionType=sale&propertyType=residential&amount=600000000"));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.transactionType, "sale");
  assert.equal(data.propertyType, "residential");
  assert.equal(data.amount, 600000000);
  assert.equal(data.statutoryMaxRatePercent, 0.4);
  assert.equal(data.brokerageFee, 2400000);
  assert.equal(data.vat, 240000);
  assert.equal(data.totalWithVat, 2640000);
});

test("real-estate property-tax endpoint calculates holding tax and 1-homeowner deductions", async () => {
  // 1-homeowner 10억 (below 12억, no comp tax)
  const res1 = await worker.fetch(new Request("https://api.oiyo.net/v1/real-estate/property-tax?price=1000000000&ownerType=single"));
  assert.equal(res1.status, 200);
  const data1 = await res1.json();
  assert.equal(data1.officialPrice, 1000000000);
  assert.equal(data1.comprehensiveTax.isSubject, false);
  assert.ok(data1.propertyTax.total > 0);
  assert.equal(data1.totalAnnualHoldingTax, data1.propertyTax.total);

  // Multi-homeowner 15억 (exceeds 9억)
  const res2 = await worker.fetch(new Request("https://api.oiyo.net/v1/real-estate/property-tax?price=1500000000&ownerType=multi&houseCount=2"));
  assert.equal(res2.status, 200);
  const data2 = await res2.json();
  assert.equal(data2.comprehensiveTax.isSubject, true);
  assert.ok(data2.comprehensiveTax.total > 0);
  assert.equal(data2.totalAnnualHoldingTax, data2.propertyTax.total + data2.comprehensiveTax.total);
});

test("saju elements-balance endpoint calculates seasonal support and day master strength", async () => {
  const res = await worker.fetch(new Request("https://api.oiyo.net/v1/saju/elements-balance?year=1990&month=5&day=15&hour=14"));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.dayMaster);
  assert.ok(data.fiveElementsDistribution);
  assert.ok(data.balanceAnalysis.strengthScore >= 0 && data.balanceAnalysis.strengthScore <= 100);
  assert.ok(["Strong", "Weak", "Balanced"].includes(data.balanceAnalysis.strengthLevel));
  assert.ok(data.yinYangBalance.yangPercentage + data.yinYangBalance.yinPercentage === 100);
  assert.ok(Array.isArray(data.favorableElements));
});

test("tax freelancer endpoint calculates 3.3% withholding and May refund accurately", async () => {
  const res = await worker.fetch(new Request("https://api.oiyo.net/v1/tax/freelancer?revenue=25000000&jobCode=developer&dependents=1"));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.revenue, 25000000);
  assert.equal(data.prepaidTax.total, 825000); // 3.3% of 25M
  assert.equal(data.expenseRatePercent, 64.1);
  assert.ok(data.recognizedExpense > 0);
  assert.ok(typeof data.isRefund === "boolean");
  assert.ok(data.refundAmount >= 0);
});

test("insurance health endpoint calculates monthly regional premium and evaluates dependent eligibility", async () => {
  // Case 1: High income & disqualified dependent
  const res1 = await worker.fetch(
    new Request("https://api.oiyo.net/v1/insurance/health?businessIncome=25000000&propertyTaxBase=100000000&hasBusinessRegistration=true")
  );
  assert.equal(res1.status, 200);
  const data1 = await res1.json();
  assert.ok(data1.monthlyIncomePremium > 0);
  assert.ok(data1.monthlyPropertyPremium > 0);
  assert.equal(data1.monthlyTotal, data1.monthlyHealthPremium + data1.monthlyCarePremium);
  assert.equal(data1.dependentEligibility.isEligible, false);
  assert.equal(data1.dependentEligibility.status, "disqualified");
  assert.ok(data1.dependentEligibility.reasons.length > 0);

  // Case 2: Low income, no property, dependent retained
  const res2 = await worker.fetch(
    new Request("https://api.oiyo.net/v1/insurance/health?businessIncome=3000000&propertyTaxBase=30000000&hasBusinessRegistration=false")
  );
  assert.equal(res2.status, 200);
  const data2 = await res2.json();
  assert.equal(data2.dependentEligibility.isEligible, true);
  assert.equal(data2.dependentEligibility.status, "eligible");
  assert.equal(data2.monthlyHealthPremium, 19780); // Min premium floor applied
});

test("real-estate hug-guarantee endpoint diagnoses 126% rule and calculates guarantee fee", async () => {
  // Case 1: Eligible apartment within 126% rule and debt limit
  const res1 = await worker.fetch(
    new Request("https://api.oiyo.net/v1/real-estate/hug-guarantee?officialPrice=300000000&jeonseDeposit=350000000&seniorDebt=20000000&propertyType=apartment&discountType=youth")
  );
  assert.equal(res1.status, 200);
  const data1 = await res1.json();
  assert.equal(data1.calculatedHousePrice, 420000000); // 300M * 1.4
  assert.equal(data1.maxAllowedDeposit, 378000000); // 300M * 1.26
  assert.equal(data1.isEligible, true);
  assert.equal(data1.verdict, "eligible");
  assert.equal(data1.guaranteeFee.discountRate, 0.5); // youth 50%
  assert.ok(data1.guaranteeFee.totalGuaranteeFee > 0);

  // Case 2: Ineligible (over 126% limit)
  const res2 = await worker.fetch(
    new Request("https://api.oiyo.net/v1/real-estate/hug-guarantee?officialPrice=200000000&jeonseDeposit=260000000&propertyType=villa")
  );
  assert.equal(res2.status, 200);
  const data2 = await res2.json();
  assert.equal(data2.maxAllowedDeposit, 252000000); // 200M * 1.26
  assert.equal(data2.isEligible, false);
  assert.equal(data2.verdict, "ineligible");
  assert.ok(data2.rejectReasons.length > 0);

  // Case 3: Missing required params
  const res3 = await worker.fetch(new Request("https://api.oiyo.net/v1/real-estate/hug-guarantee"));
  assert.equal(res3.status, 400);
});







