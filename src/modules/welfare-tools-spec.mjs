// Benefit and labor-rights tool schemas (2026-11-16), spread into BIZ_TOOLS by biz-tools-spec.mjs.
// WHY: low-income workers, new parents, unpaid or injured workers and tenants miss money they are owed.
// These schemas are the single source for MCP input validation, REST validation (biz-strategy.mjs) and
// OpenAPI. Formulas: tools-oiyo src/lib/kr-welfare-2026.ts (vendored by scripts/sync-tools-tax.mjs).

const num = (description, minimum, maximum) => ({ type: "number", description, ...(minimum !== undefined && { minimum }), ...(maximum !== undefined && { maximum }) });
const won = (description) => num(`${description} (KRW)`, 0, 1e12);
const bool = (description) => ({ type: "boolean", description });
const fn = (name, description, properties, required = []) => ({ type: "function", function: { name, description, parameters: { type: "object", properties, required } } });

export const WELFARE_TOOLS = [
  fn("calculate_kr_work_child_incentive",
    "Korean earned income tax credit (근로장려금) and child tax credit (자녀장려금) estimate for the 2026 application (2025 income): household type, combined total income, household assets (debts not deducted) and children under 18. Applies phase-in / maximum / phase-out bands, 50% cut at assets ≥ 170M KRW, nothing at ≥ 240M KRW, 95% for late filing. Returns both amounts, the band and how to apply.",
    {
      household: { type: "string", enum: ["single", "oneEarner", "twoEarner"], description: "single = no spouse or dependants; oneEarner = spouse earns under 3M KRW or supports a child/parent; twoEarner = spouse earns 3M KRW or more" },
      income: won("Combined household total income for the year (wages gross, business revenue × industry ratio)"),
      assets: won("Total assets of all household members on June 1 (housing, deposits incl. jeonse, savings, cars; debts not deducted)"),
      children: { type: "integer", minimum: 0, maximum: 20, description: "Dependent children under 18" },
      late: bool("Filed after May (June-November): paid at 95%"),
    }, ["household", "income", "assets", "children"]),
  fn("calculate_kr_maternity_leave_pay",
    "Korean maternity leave pay (출산전후휴가 급여) and spouse childbirth leave (배우자 출산휴가 20일) for 2026: monthly ordinary wage, priority-support (SME) employer or not, single / multiple / premature birth. Splits employer and employment-insurance shares with the 2026 caps (2.2M KRW per 30 days; 20-day spouse cap 1,684,210 KRW) and the minimum-wage floor.",
    {
      monthlyWage: won("Monthly ordinary wage (통상임금)"),
      priorityFirm: bool("Priority-support employer (most SMEs): insurance pays all leave days"),
      kind: { type: "string", enum: ["single", "multiple", "premature"], description: "single 90 days, multiple 120 days, premature 100 days" },
    }, ["monthlyWage", "priorityFirm"]),
  fn("calculate_kr_wage_guarantee",
    "Korean wage guarantee payment (대지급금) the state pays first for unpaid wages and severance: simple payment for retired workers (wages 7M + severance 7M, total 10M KRW), simple payment for current low-income workers (7M), or insolvency payment with age-based monthly caps (220/310/350/330/230만원) covering the last 6 months of wages when the insolvency decision is on or after 2026-08-20 (3 months before) and the last 3 years of severance.",
    {
      kind: { type: "string", enum: ["simpleRetired", "simpleEmployed", "insolvency"], description: "simpleRetired = retired, employer still exists; simpleEmployed = still employed; insolvency = rehabilitation, bankruptcy or recognised insolvency" },
      age: num("Age at retirement (or application if employed)", 15, 100),
      monthlyWage: won("Unpaid monthly wage"),
      unpaidMonths: { type: "integer", minimum: 0, maximum: 60, description: "Number of final months not paid" },
      unpaidSeverance: won("Total unpaid severance pay"),
      serviceYears: num("Years of service behind the severance", 0, 60),
      afterReform: bool("Insolvency decision on or after 2026-08-20 (default true)"),
    }, ["kind", "age", "monthlyWage", "unpaidMonths"]),
  fn("calculate_kr_injury_leave_pay",
    "Korean industrial accident leave pay (산재 휴업급여) for 2026: 70% of average daily wage, the low-income minimum-wage guarantee (82,560 KRW a day), the maximum compensation base 268,299 KRW, nothing when treatment is 3 days or less. Give avgDailyWage, or threeMonthWages with calendarDays.",
    {
      avgDailyWage: won("Average daily wage"),
      threeMonthWages: won("Wages in the 3 months before the accident (instead of avgDailyWage)"),
      calendarDays: { type: "integer", minimum: 89, maximum: 92, description: "Calendar days in those 3 months (default 92)" },
      annualBonus: won("Bonuses paid in the last year (3/12 added)"),
      days: { type: "integer", minimum: 0, maximum: 3650, description: "Days unable to work" },
    }, ["days"]),
  fn("calculate_kr_monthly_rent_credit",
    "Korean monthly rent tax credit (월세 세액공제, 조세특례제한법 제95조의2): 17% when total salary ≤ 55M KRW (comprehensive income ≤ 45M), 15% up to 80M (70M), rent up to 10M KRW a year, plus the 10% local income tax reduction. Optional tax before credit caps the credit.",
    {
      income: won("Total salary (wage earners) or comprehensive income amount"),
      incomeType: { type: "string", enum: ["wage", "comprehensive"], description: "wage = total salary, comprehensive = 종합소득금액" },
      monthlyRent: won("Monthly rent excluding maintenance fees"),
      months: { type: "integer", minimum: 0, maximum: 12, description: "Months of rent paid this year" },
      taxBeforeCredit: won("Income tax left before this credit (optional cap)"),
    }, ["income", "incomeType", "monthlyRent", "months"]),
  fn("compare_kr_retirement_pension",
    "Korean retirement pension DB vs DC comparison (퇴직연금 DB형 vs DC형): DB = final monthly wage × total years; DC = past DB accrual moved now plus one month's wage each year compounded at the return. Returns both amounts, the gap, year-by-year series and the break-even return.",
    {
      monthlyWage: won("Current average monthly wage"),
      yearsServed: num("Years of service so far", 0, 60),
      yearsLeft: { type: "integer", minimum: 0, maximum: 50, description: "Years until retirement" },
      wageGrowth: num("Annual wage growth, e.g. 0.03", -0.2, 0.5),
      dcReturn: num("Annual DC return after fees, e.g. 0.04", -0.2, 0.5),
    }, ["monthlyWage", "yearsServed", "yearsLeft", "wageGrowth", "dcReturn"]),
];

export const WELFARE_ENDPOINTS = {
  calculate_kr_work_child_incentive: { path: "/v1/benefits/kr/work-child-incentive", method: "POST" },
  calculate_kr_maternity_leave_pay: { path: "/v1/benefits/kr/maternity-leave-pay", method: "POST" },
  calculate_kr_wage_guarantee: { path: "/v1/labor/kr/wage-guarantee", method: "POST" },
  calculate_kr_injury_leave_pay: { path: "/v1/labor/kr/injury-leave-pay", method: "POST" },
  calculate_kr_monthly_rent_credit: { path: "/v1/tax/kr/monthly-rent-credit", method: "POST" },
  compare_kr_retirement_pension: { path: "/v1/labor/kr/retirement-pension-db-dc", method: "POST" },
};
