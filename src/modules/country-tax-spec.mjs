// 각국 세무·회계 현지판 MCP 스키마 (2026-11-21, 1차 일본). tools.oiyo.net /ja/ 6페이지·oiyo-jp-tax-guide 스킬과 같은 계산이에요.
// Data and formulas: tools-oiyo src/lib/jp-tax-pack-2026.ts (vendored by scripts/sync-tools-tax.mjs).
// General information and estimates only: no individual tax advice, no tax return preparation (Japan 税理士法 第52条).
const fn = (name, description, properties, required = []) => ({ type: "function", function: { name, description, parameters: { type: "object", properties, required } } });
const num = (description, minimum = 0, maximum = 1e13) => ({ type: "number", description, minimum, maximum });
const int = (description, minimum, maximum) => ({ type: "integer", description, minimum, maximum });
const date = (description) => ({ type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$", description });
const yes = (description) => ({ type: "boolean", description });
const pick = (values, description) => ({ type: "string", enum: values, description });
const JP = "Japan, as of 2026-11-21 (e-Gov current law and NTA Tax Answer). General information and estimates only; individual tax advice and return preparation are reserved to 税理士 (税理士法 第52条).";

export const COUNTRY_TAX_TOOLS = [
  fn("get_jp_tax_calendar",
    `Japanese sole proprietor tax deadlines for a year: income tax return and payment for the previous year (3/15, filing from 2/16, NTA No.2020), consumption tax for individuals (3/31, No.6601), prepaid income tax (予定納税) 7/31 and 11/30 when the base amount is 150,000 JPY or more (No.2040), and the blue return application (3/15, or within 2 months of opening a business on or after 1/16, No.2070). Weekend deadlines move to the next weekday (国税通則法 第10条②). ${JP}`,
    {
      year: int("Calendar year to list", 2024, 2035),
      started: date("Business opening date (only if opened that year)"),
      consumptionTax: yes("Taxable for consumption tax"),
      prepaid: yes("Has prepaid income tax (previous year tax 150,000 JPY+)"),
      today: date("Reference date YYYY-MM-DD for days left"),
    }, ["year"]),
  fn("calculate_jp_blue_return_deduction",
    `Compare Japanese income tax (2026 basic deduction, 2.1% reconstruction surtax) and resident tax income levy (10%, basic deduction 430,000) under white return and blue return special deductions of 100,000 / 550,000 / 650,000 JPY (措法 第25条の2, NTA No.2072), with yearly savings and requirements. ${JP}`,
    {
      income: num("Business income before the blue return deduction (JPY)"),
      otherDeductions: num("Income deductions other than the basic deduction, e.g. social insurance (JPY)"),
    }, ["income"]),
  fn("check_jp_consumption_tax",
    `Japanese consumption tax: whether you are taxable (base period sales over 10M JPY, specified period sales and wages both over 10M, or invoice registration; NTA No.6501) and the tax under the general method, simplified method (deemed purchase rates 90-40% by business type 1-6, base sales up to 50M, election required; No.6505), the 20% special rule (taxable periods including 2026-09-30) and the 30% rule for individuals in 2027-2028 (No.6498). Standard 10% rate only. ${JP}`,
    {
      year: int("Taxable period (calendar year for individuals)", 2023, 2035),
      baseSales: num("Taxable sales in the base period (2 years before, excl. tax, JPY)"),
      specSales: num("Taxable sales in the specified period (Jan-Jun of the previous year)"),
      specWages: num("Wages paid in the specified period"),
      invoice: yes("Registered as a qualified invoice issuer"),
      wasExempt: yes("Would be exempt without the invoice registration"),
      sales: num("This year's taxable sales at 10% (excl. tax, JPY)"),
      purchases: num("This year's taxable purchases at 10% (excl. tax, JPY)"),
      type: int("Simplified method business type 1-6 (1 wholesale 90% … 5 services 50%, 6 real estate 40%)", 1, 6),
      simpleFiled: yes("Filed the simplified method election"),
    }, ["year", "baseSales", "sales"]),
  fn("calculate_jp_penalty_tax",
    `Japanese additional taxes and delinquency tax: failure-to-file (5% voluntary; after notice 10/15/25%, after audit 15/20/30% on parts over 500,000 and 3,000,000 JPY; NTA No.2024), underpayment (none if voluntary; 5/10% after notice, 10/15% after audit above the larger of original tax and 500,000; No.2026), heavy additional tax 35%/40% (国税通則法 第68条), and 2026 delinquency tax 2.8% up to 2 months then 9.1% (No.9205). Tax base rounded down to 10,000 JPY, additional tax under 5,000 and delinquency under 1,000 are zero. ${JP}`,
    {
      kind: pick(["none", "under"], "none = late return (無申告), under = amended return (過少申告)"),
      stage: pick(["voluntary", "notice", "audit"], "voluntary = before audit notice, notice = after notice before audit, audit = after audit"),
      tax: num("Additional tax payable (JPY)"),
      original: num("Originally filed tax (amended returns)"),
      fraud: yes("Concealment or disguise found (heavy additional tax)"),
      deadline: date("Statutory payment deadline"),
      paid: date("Payment date"),
    }, ["kind", "stage", "tax"]),
  fn("calculate_jp_appeal_deadlines",
    `Japanese tax appeal deadlines (国税通則法 第77条): request for reinvestigation or for review within 3 months from the day after learning of the disposition, review within 1 month after a reinvestigation decision, and no appeal after 1 year from the disposition without justifiable reason. Weekend ends move to the next weekday. ${JP}`,
    {
      noticed: date("Date you learned of the disposition (notice received)"),
      reinvestigationDecided: date("Date the reinvestigation decision was received"),
      disposed: date("Date of the disposition, if different"),
    }, ["noticed"]),
  fn("calculate_jp_depreciation",
    `Japanese depreciation for sole proprietors: under 100,000 JPY expensed, under 200,000 lump-sum 3 years, SME blue filers under 400,000 (acquired from 2026-04-01; 300,000 before) expensed up to 3M a year until 2029-03-31 (措法 第28条の2, NTA No.2100), else straight-line with the 別表第八 rate (ceil(1/life, 3 decimals)), first year by months used, down to 1 JPY. ${JP}`,
    {
      cost: num("Acquisition cost (JPY)"),
      life: int("Statutory useful life in years (PC 4, car 6, kei car 4, wooden building 22)", 2, 50),
      acquired: date("Date first used in the business"),
      blue: yes("Blue return filer"),
      sme: yes("Small business (blue filer with up to 500 employees)"),
      years: int("Max schedule years", 1, 60),
    }, ["cost", "life", "acquired"]),
];

export const COUNTRY_TAX_ENDPOINTS = {
  get_jp_tax_calendar: { path: "/v1/tax/jp/calendar", method: "POST" },
  calculate_jp_blue_return_deduction: { path: "/v1/tax/jp/blue-return", method: "POST" },
  check_jp_consumption_tax: { path: "/v1/tax/jp/consumption-tax", method: "POST" },
  calculate_jp_penalty_tax: { path: "/v1/tax/jp/penalty", method: "POST" },
  calculate_jp_appeal_deadlines: { path: "/v1/tax/jp/appeal-deadlines", method: "POST" },
  calculate_jp_depreciation: { path: "/v1/tax/jp/depreciation", method: "POST" },
};
