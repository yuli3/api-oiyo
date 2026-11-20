// 전문 실무 계산·길잡이 도구 스키마 (2026-11-17). CHOSEUN: "기존 전문 자격증의 업무범위에 필요한 모든 도구와 스킬 추가".
// tools.oiyo.net 역량 지도(/ko/pro-competency-map/)의 빈칸을 채운 도구와 같은 계산이에요.
// Data and formulas: tools-oiyo src/lib/pro-practice-2026.ts, pro-practice-guides-2026.ts (vendored by scripts/sync-tools-tax.mjs).
// Information and calculation only: no fine decision, tariff classification, reserve certification, loss adjusting, audit opinion or filing.
import { GUIDES } from "./vendor/tools-tax/pro-practice-guides-2026.mjs";

const fn = (name, description, properties, required = []) => ({ type: "function", function: { name, description, parameters: { type: "object", properties, required } } });
const num = (description, minimum, maximum) => ({ type: "number", description, ...(minimum !== undefined ? { minimum } : {}), ...(maximum !== undefined ? { maximum } : {}) });
const date = (description) => ({ type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$", description });
const yes = (description) => ({ type: "boolean", description });

export const PRACTICE_TOOLS = [
  fn("calculate_kr_fine_reduction",
    "South Korea administrative fine (과태료) under 질서위반행위규제법: 20% reduction for voluntary payment within the opinion period (제18조, 시행령 제5조), 50% reduction for vulnerable people (시행령 제2조의2; the larger single reduction is applied), late-payment surcharge 3% plus 1.2% per month up to 60 months (제24조), and the opinion deadline from the notice date. Not traffic 범칙금.",
    {
      fine: num("Fine amount on the advance notice (KRW)", 0, 1e12),
      noticeDate: date("Date the advance notice was received, YYYY-MM-DD"),
      opinionDays: { type: "integer", minimum: 10, maximum: 90, description: "Opinion period on the notice in days (at least 10, default 10)" },
      when: { type: "string", enum: ["early", "due", "late"], description: "early = within the opinion period, due = after imposition but before the payment due date, late = after the due date" },
      monthsLate: { type: "integer", minimum: 0, maximum: 120, description: "Months past the payment due date (when late)" },
      vulnerable: yes("기초생활수급자·차상위·중증장애인·미성년자 등 (시행령 제2조의2)"),
    }, ["fine", "when"]),
  fn("calculate_kr_import_duty",
    "South Korea import duty and VAT: customs value = (price + freight + insurance) × customs FX rate (관세법 제30조), duty = value × rate, VAT = (value + duty) × 10%. Compares the general rate with an FTA preferential rate (only with proof of origin, FTA관세특례법 제8조) and checks the personal direct-purchase exemption (goods price ≤ USD 150, USD 200 from the US). Rates come from the user (HS code lookup at the customs law portal); no tariff classification. Excludes individual consumption/liquor taxes.",
    {
      price: num("Goods price in USD", 0, 1e9),
      freight: num("Freight in USD", 0, 1e9),
      insurance: num("Insurance in USD", 0, 1e9),
      fx: num("Customs FX rate, KRW per USD", 1, 1e5),
      baseRate: num("General/WTO duty rate as a fraction, e.g. 0.13", 0, 10),
      ftaRate: num("FTA preferential rate as a fraction (omit or equal to baseRate if none)", 0, 10),
      hasOrigin: yes("Has a certificate/proof of origin"),
      personal: yes("Personal-use direct purchase"),
      fromUS: yes("Shipped from the United States"),
    }, ["price", "fx", "baseRate"]),
  fn("simulate_ifrs17_csm",
    "Teaching model of IFRS 17 (K-IFRS 1117) general measurement: present value of premiums (start of year) vs claims and expenses (end of year) plus acquisition cost and a risk adjustment (% of outflow PV) → fulfilment cash flows, initial contractual service margin (CSM) or loss component, and the yearly CSM release with interest accretion and equal coverage units. Illustration only, not reserve certification.",
    {
      premium: num("Annual premium (KRW)", 0, 1e12),
      years: { type: "integer", minimum: 1, maximum: 40, description: "Coverage years" },
      claims: num("Expected claims per year (KRW)", 0, 1e12),
      expense: num("Maintenance expense per year (KRW)", 0, 1e12),
      acquisition: num("One-off acquisition cost (KRW)", 0, 1e12),
      rate: num("Discount rate as a fraction, e.g. 0.03", -0.05, 0.2),
      ra: num("Risk adjustment as a fraction of the outflow PV, e.g. 0.05", 0, 1),
    }, ["premium", "years", "claims", "rate"]),
  fn("calculate_kics_ratio",
    "Teaching model of the Korean insurance solvency ratio K-ICS: basic required capital = √(Σ ρij·Ri·Rj) over life/long-term, general non-life, market and credit risk (illustrative Solvency II-like correlations), plus operational risk minus tax adjustment; ratio = available capital ÷ required capital, with prompt corrective action bands (100% / 50% / 0%). Not the supervisory calculation.",
    {
      available: num("Available capital (KRW)", -1e15, 1e15),
      life: num("Life and long-term non-life underwriting risk (KRW)", 0, 1e15),
      nonlife: num("General non-life underwriting risk (KRW)", 0, 1e15),
      market: num("Market risk (KRW)", 0, 1e15),
      credit: num("Credit risk (KRW)", 0, 1e15),
      operational: num("Operational risk (KRW)", 0, 1e15),
      taxAdj: num("Tax adjustment (KRW)", 0, 1e15),
    }, ["available"]),
  fn("calculate_insurance_claim_payout",
    "Insurance payout from (a) permanent disability: sum insured × disability rate, rates of several body parts added and capped at 100%, pre-existing disability of the same part deducted (Korean standard policy disability table); or (b) a fault-based loss: damage × (1 − own fault %) − deductible, capped at the policy limit (민법 제396조·제763조). Calculation only; not loss adjusting or a fault ruling.",
    {
      kind: { type: "string", enum: ["disability", "fault"], description: "disability = 후유장해 보험금, fault = 과실상계 보상" },
      sum: num("Disability sum insured (KRW)", 0, 1e12),
      rates: { type: "array", maxItems: 6, items: num("Disability rate as a fraction, e.g. 0.5", 0, 1), description: "Rates per body part" },
      prior: num("Pre-existing disability rate of the same part, fraction", 0, 1),
      damage: num("Damage amount (KRW)", 0, 1e12),
      fault: num("Own fault as a fraction", 0, 1),
      deductible: num("Deductible (KRW)", 0, 1e12),
      limit: num("Policy limit (KRW, 0 = none)", 0, 1e12),
    }, ["kind"]),
  fn("analyze_journal_entries",
    "Journal-entry analytics for audit and internal control: Benford first-digit distribution with MAD conformity (Nigrini bands), weekend/Korean public holiday postings, exact duplicates (date+account+amount), amounts just below an approval limit (95-100%), round millions and period-end postings; returns counts and the riskiest entries first. Signals are an order to review, not evidence of fraud or an audit opinion.",
    {
      entries: {
        type: "array", minItems: 1, maxItems: 1500, description: "Journal lines",
        items: { type: "object", properties: { date: date("Posting date YYYY-MM-DD"), account: { type: "string", maxLength: 60, description: "Account name" }, amount: num("Amount (KRW)", -1e15, 1e15), memo: { type: "string", maxLength: 80, description: "Description" }, user: { type: "string", maxLength: 30, description: "Entered by" } }, required: ["date", "amount"] },
      },
      approvalLimit: num("Approval limit (KRW); amounts at 95-100% of it are flagged", 0, 1e15),
      top: { type: "integer", minimum: 1, maximum: 100, description: "How many flagged entries to return (default 30)" },
    }, ["entries"]),
  fn("get_kr_practice_guide",
    "Korean practice checklists for work next to licensed professions: business permit filings (restaurant/cafe, online retail, beauty), foreigner stay deadlines (registration 90 days, address change 15 days, extension window), public e-portals (Hometax, 4 social insurances/Work24, Internet Registry, e-Court, UNI-PASS, Patent-ro) and how to read professional documents (loss adjustment report, appraisal report, broker's confirmation statement, patent specification/claims, import declaration documents). Returns what to prepare, what to check (with statute citations), deadlines computed from given dates (first day excluded, holiday roll-over), official links and who may act as representative. Information only; no filing or drafting.",
    {
      guide: { type: "string", enum: GUIDES.map((g) => g.slug), description: "Guide slug. Omit to list guides and cases." },
      case: { type: "string", maxLength: 40, description: "Case id within the guide (from the list). Omit to get every case of the guide." },
      dates: { type: "object", description: "Start dates keyed by deadline id from a previous call, YYYY-MM-DD. Up to 10 keys." },
    }),
  fn("check_insurance_explanation_record",
    "Insurance sales record check under the Korean Financial Consumer Protection Act: suitability items (제17조), material explanations (제19조, incl. replacement comparison when switching), how the explanation document was delivered and how understanding was confirmed (signature, seal or recording). Returns missing items, the cooling-off outer date (청약일 + 30 days, 제46조), the 10-year retention date (제28조) and a copy-ready Korean record text. Not an official compliance determination.",
    {
      customer: { type: "string", maxLength: 40, description: "Customer initials or label (avoid full personal data)" },
      product: { type: "string", maxLength: 80, description: "Product name" },
      date: date("Application date YYYY-MM-DD"),
      suitability: { type: "array", maxItems: 5, items: { type: "string", enum: ["purpose", "age", "income", "asset", "risk"] }, description: "Suitability items checked" },
      explained: { type: "array", maxItems: 7, items: { type: "string", enum: ["coverage", "exclusion", "premium", "surrender", "disclosure", "withdraw", "compare"] }, description: "Material items explained" },
      delivered: { type: "string", enum: ["paper", "email", "app"], description: "How the explanation document was given" },
      confirm: { type: "string", enum: ["sign", "seal", "record"], description: "How understanding was confirmed" },
      replace: yes("Replacing an existing policy"),
      note: { type: "string", maxLength: 300, description: "Notes" },
    }),
];

export const PRACTICE_ENDPOINTS = {
  calculate_kr_fine_reduction: { path: "/v1/law/kr/fine-reduction", method: "POST" },
  calculate_kr_import_duty: { path: "/v1/customs/kr/import-duty", method: "POST" },
  simulate_ifrs17_csm: { path: "/v1/insurance/ifrs17-csm", method: "POST" },
  calculate_kics_ratio: { path: "/v1/insurance/kics-ratio", method: "POST" },
  calculate_insurance_claim_payout: { path: "/v1/insurance/claim-payout", method: "POST" },
  analyze_journal_entries: { path: "/v1/audit/journal-entries", method: "POST" },
  get_kr_practice_guide: { path: "/v1/law/kr/practice-guide", method: "POST" },
  check_insurance_explanation_record: { path: "/v1/insurance/explanation-record", method: "POST" },
};
