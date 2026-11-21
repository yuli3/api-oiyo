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

export const JP_TAX_TOOLS = [
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


const US = "United States federal, tax year 2026, as of 2026-11-21 (IRS publications, Rev. Proc. 2025-32, eCFR). General information and estimates only; no individual advice, return preparation or IRS representation (31 CFR Part 10).";
const filing = pick(["single", "mfj"], "single or married filing jointly");

export const US_TAX_TOOLS = [
  fn("get_us_tax_calendar",
    `US federal tax deadlines for a tax year: Form 1040 (April 15 of the next year), Form 4868 extension (October 15), 1040-ES estimated tax (April 15, June 15, September 15, January 15), Form 1099-NEC (January 31), Forms 1065/1120-S (March 15) and 1120 (April 15), moved to the next business day for weekends, New Year's Day, MLK Day and DC Emancipation Day (IRS Pub 509). ${US}`,
    {
      taxYear: int("Tax year", 2024, 2035),
      selfEmployed: yes("Has self-employment income (estimated tax)"),
      pays1099: yes("Paid contractors (Form 1099-NEC)"),
      extension: yes("Will file Form 4868"),
      entity: pick(["none", "partnership", "scorp", "ccorp"], "Business entity return"),
      today: date("Reference date YYYY-MM-DD for days left"),
    }, ["taxYear"]),
  fn("calculate_us_self_employment_tax",
    `US 2026 self-employment tax (15.3% on 92.35% of net earnings, Social Security part capped at the $184,500 wage base after W-2 wages), Additional Medicare 0.9% above $200,000/$250,000, half-SE deduction, QBI deduction 20% with the $400 minimum (only below the $201,750/$403,500 threshold), and 2026 federal income tax with the standard deduction ($16,100/$32,200). ${US}`,
    {
      net: num("Net self-employment profit (Schedule C, USD)", -1e9, 1e10),
      filing,
      wages: num("W-2 wages (USD)"),
      otherIncome: num("Other taxable income (USD)"),
    }, ["net"]),
  fn("calculate_us_estimated_tax",
    `US estimated tax safe harbor (2026 Form 1040-ES): required when tax after withholding is $1,000+; pay the smaller of 90% of this year's tax and 100% of last year's (110% if last year's AGI was over $150,000, $75,000 married filing separately), split over the four due dates. ${US}`,
    {
      priorTax: num("Last year's total tax (USD)"),
      priorAgi: num("Last year's AGI (USD)"),
      mfs: yes("Married filing separately"),
      priorFullYear: yes("Last year's return covered 12 months (default true)"),
      currentTax: num("Expected total tax this year (USD)"),
      withholding: num("Expected withholding this year (USD)"),
      taxYear: int("Tax year (default 2026)", 2024, 2035),
    }, ["priorTax", "priorAgi", "currentTax"]),
  fn("calculate_us_irs_penalty",
    `US failure-to-file (5% per month or part, max 25%, reduced by failure-to-pay in the same month; minimum $535 or 100% of tax for returns filed in 2027 over 60 days late) and failure-to-pay (0.5% per month, 0.25% on an approved plan, max 25%) penalties, plus interest compounded daily at the underpayment rate (2026 quarters 7/6/7/7%; later quarters reuse 7% until published). ${US}`,
    {
      tax: num("Tax unpaid on the original due date (USD)"),
      due: date("Original due date"),
      filed: date("Date filed"),
      paid: date("Date paid"),
      extension: yes("Valid extension filed (filing due October 15)"),
      installment: yes("On an approved installment agreement"),
    }, ["tax", "due"]),
  fn("calculate_us_tax_appeal_deadlines",
    `US tax dispute deadlines: Tax Court petition 90 days after a notice of deficiency (150 if addressed outside the US, Pub 556), Collection Due Process hearing request 30 days (Form 12153), and refund claims within 3 years of filing or 2 years of payment, whichever is later (Topic 308). ${US}`,
    {
      notice: date("Date on the IRS notice"),
      kind: pick(["deficiency", "cdp"], "Notice of deficiency or collection due process notice"),
      abroad: yes("Notice addressed outside the United States"),
      filed: date("Date the return was filed (refund claims)"),
      returnDue: date("Original return due date (early returns count as filed on it)"),
      paid: date("Date the tax was paid"),
    }),
  fn("calculate_us_depreciation",
    `US business asset write-off for 2026: de minimis safe harbor $2,500 per item ($5,000 with an applicable financial statement, 26 CFR 1.263(a)-1(f)), Section 179 up to $2,560,000 reduced above $4,090,000 (Rev. Proc. 2025-32), 100% bonus for property acquired after 2025-01-19 (Pub 946), and MACRS 5- or 7-year half-year schedules (Table A-1). Passenger car caps for 2026 are not published and not applied. ${US}`,
    {
      cost: num("Business-use cost (USD)"),
      life: int("MACRS class: 5 (computers, vehicles) or 7 (furniture, equipment)", 5, 7),
      placed: date("Date placed in service"),
      acquired: date("Date acquired, if different"),
      afs: yes("Has an applicable (audited) financial statement"),
      sec179: num("Section 179 amount to elect (USD)"),
      totalPlaced: num("Total Section 179 property placed in service this year (USD)"),
      bonus: yes("Take bonus depreciation (default true)"),
      businessIncome: num("Business taxable income limit for Section 179 (USD)", -1e10, 1e10),
    }, ["cost", "life", "placed"]),
];

const FR = "France, as of 2026-11-21 (service-public.fr and BOFiP). General information and estimates only; no personalised advice, bookkeeping or filing.";

export const FR_TAX_TOOLS = [
  fn("get_fr_tax_calendar",
    `French business tax dates for a year: income tax return (opens in April; per-département deadlines published each spring), corporate tax instalments 15 March/June/September/December for calendar-year companies (BOI-IS-DECLA-20-10), CFE by 15 December (F23547), and VAT (réel simplifié: annual CA12 in May, 55% July and 40% December instalments; réel normal monthly, F23566). Weekend dates move to the next business day. ${FR}`,
    {
      year: int("Year", 2024, 2035),
      tva: pick(["franchise", "simplifie", "normal"], "VAT regime"),
      cfe: yes("Liable for CFE"),
      is: yes("Company subject to corporate tax (calendar year)"),
      today: date("Reference date YYYY-MM-DD for days left"),
    }, ["year"]),
  fn("calculate_fr_micro_entrepreneur",
    `French micro-entrepreneur 2026: turnover ceilings 203,100 EUR (sales, lodging) / 83,600 EUR (services, BNC) with exit after two consecutive years above (F32353); social contributions 12.3% / 21.2% / 25.6% / CIPAV 23.2% of turnover (F36232); taxable income after the 71% / 50% / 34% allowance and the progressive scale (2025 income scale, 2026 not yet voted, no family quotient cap) versus the versement libératoire 1% / 1.7% / 2.2% (allowed if N-2 reference income < 29,579 EUR per part, F23267). ${FR}`,
    {
      activity: pick(["vente", "services", "bnc", "cipav"], "vente = sales/lodging, services = BIC services, bnc = unregulated liberal profession, cipav = regulated (CIPAV)"),
      ca: num("Annual turnover collected (EUR)"),
      caPrev: num("Turnover last year (EUR)"),
      caPrev2: num("Turnover two years ago (EUR)"),
      rfr: num("Household reference tax income N-2 (EUR)"),
      parts: num("Household tax parts (quotient familial)", 1, 20),
      otherIncome: num("Other taxable household income (EUR)"),
      vl: yes("Opted for the versement libératoire"),
    }, ["activity", "ca"]),
  fn("check_fr_vat_franchise",
    `French VAT franchise en base 2026 (F21746): exempt while last year's turnover is at most 85,000 EUR (sales, lodging) or 37,500 EUR (services); VAT due immediately above 93,500 / 41,250 EUR this year, or from next 1 January between the two. The single 25,000 EUR threshold plan was abandoned. Rates 20/10/5.5/2.1%. ${FR}`,
    {
      activity: pick(["vente", "services"], "Sales/lodging or services"),
      caPrev: num("Turnover excl. VAT last year (EUR)"),
      ca: num("Turnover excl. VAT this year (EUR)"),
    }, ["activity", "caPrev", "ca"]),
  fn("calculate_fr_tax_penalty",
    `French late interest 0.20% per month (CGI 1727) and surcharges: late filing 10%, 40% if not filed within 30 days of a formal notice, 80% for hidden activity (CGI 1728); deliberate failure 40%, fraudulent manoeuvres 80% (CGI 1729). Income tax late filing (CGI 1758 A) is flagged, not computed. ${FR}`,
    {
      tax: num("Tax due (EUR)"),
      fault: pick(["retard", "retard-apres-mise-en-demeure", "defaut-apres-mise-en-demeure", "activite-occulte", "manquement-delibere", "manoeuvres-frauduleuses"], "Situation"),
      due: date("Payment deadline"),
      paid: date("Payment date"),
      months: int("Months late (overrides the dates)", 0, 600),
      incomeTax: yes("Personal income tax"),
    }, ["tax", "fault"]),
  fn("calculate_fr_claim_deadline",
    `French tax claim (réclamation contentieuse) deadline: 31 December of the second year after the assessment, payment or event; local direct taxes (taxe foncière, CFE) 31 December of the following year (LPF R*196-1, BOI-CTX-PREA-10-30). The administration answers in principle within 6 months. ${FR}`,
    {
      eventYear: int("Year of the assessment, payment or event", 2015, 2040),
      local: yes("Local direct tax"),
    }, ["eventYear"]),
  fn("calculate_fr_depreciation",
    `French depreciation schedule: straight-line with day-based pro rata from first use, or declining balance (coefficient 1.25 for 3-4 years, 1.75 for 5-6, 2.25 above 6, CGI 39 A) from the first day of the acquisition month with a switch to straight-line; small tools and office equipment up to 500 EUR excl. VAT expensed immediately (BOI-BIC-CHG-20-30-10). ${FR}`,
    {
      cost: num("Cost excl. VAT (EUR)"),
      life: int("Useful life in years", 1, 50),
      start: date("Acquisition or first-use date"),
      method: pick(["lineaire", "degressif"], "Straight-line or declining balance"),
      toolUnder500: yes("Small tool or office equipment"),
    }, ["cost", "life", "start"]),
];

export const COUNTRY_TAX_ENDPOINTS = {
  get_jp_tax_calendar: { path: "/v1/tax/jp/calendar", method: "POST" },
  calculate_jp_blue_return_deduction: { path: "/v1/tax/jp/blue-return", method: "POST" },
  check_jp_consumption_tax: { path: "/v1/tax/jp/consumption-tax", method: "POST" },
  calculate_jp_penalty_tax: { path: "/v1/tax/jp/penalty", method: "POST" },
  calculate_jp_appeal_deadlines: { path: "/v1/tax/jp/appeal-deadlines", method: "POST" },
  calculate_jp_depreciation: { path: "/v1/tax/jp/depreciation", method: "POST" },
  get_us_tax_calendar: { path: "/v1/tax/us/calendar", method: "POST" },
  calculate_us_self_employment_tax: { path: "/v1/tax/us/self-employment", method: "POST" },
  calculate_us_estimated_tax: { path: "/v1/tax/us/estimated-tax", method: "POST" },
  calculate_us_irs_penalty: { path: "/v1/tax/us/penalty", method: "POST" },
  calculate_us_tax_appeal_deadlines: { path: "/v1/tax/us/appeal-deadlines", method: "POST" },
  calculate_us_depreciation: { path: "/v1/tax/us/depreciation", method: "POST" },
  get_fr_tax_calendar: { path: "/v1/tax/fr/calendar", method: "POST" },
  calculate_fr_micro_entrepreneur: { path: "/v1/tax/fr/micro-entrepreneur", method: "POST" },
  check_fr_vat_franchise: { path: "/v1/tax/fr/vat-franchise", method: "POST" },
  calculate_fr_tax_penalty: { path: "/v1/tax/fr/penalty", method: "POST" },
  calculate_fr_claim_deadline: { path: "/v1/tax/fr/claim-deadline", method: "POST" },
  calculate_fr_depreciation: { path: "/v1/tax/fr/depreciation", method: "POST" },
};

export const COUNTRY_TAX_TOOLS = [...JP_TAX_TOOLS, ...US_TAX_TOOLS, ...FR_TAX_TOOLS];
