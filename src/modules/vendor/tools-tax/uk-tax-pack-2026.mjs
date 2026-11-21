// GENERATED from tools-oiyo src/lib/uk-tax-pack-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// UK tax and accounting guide (2026-11-21, country localisation, second wave: United Kingdom). General information and
// estimates only: no personal tax advice, no agent services, no filing.
// The same code powers the oiyo-uk-tax-guide skill (scripts/calc.mjs) and the api.oiyo.net MCP tools (*_uk_*).
// Sources checked 2026-11-21 (company-brain projects/oiyo-ecosystem/uk-tax-pack-facts-2026-11-21.md): gov.uk pages on
// Self Assessment deadlines and penalties, Making Tax Digital for Income Tax, Corporation Tax, VAT (registration, rates,
// Flat Rate Scheme), Income Tax rates 2026-27, self-employed NI rates, HMRC interest rates, tax appeals, capital allowances,
// tax adviser registration, tax help; legislation.gov.uk TMA 1970 Sch 1AB para 3.
// Not verified (so not computed): Scottish income tax bands, MTD Q3/Q4 update dates, MTD penalty points, cash basis
// turnover limits after it became the default, HMRC interest rates before 2026-01-09.

export const UK_TAX_AS_OF = "2026-11-21";
export const UK_TAX_NOTE = "General information and estimates from gov.uk and legislation.gov.uk. This is not personal tax advice, and this tool does not act as your agent or file anything with HMRC. For your situation, contact HMRC or, on a low income, a free tax charity such as TaxAid.";

                                            
                                                                

const iso = (d      ) => d.toISOString().slice(0, 10);
const utc = (y        , m        , d        ) => new Date(Date.UTC(y, m - 1, d));
const days = (a        , b        ) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
const gbp = (n        ) => `£${Math.round(n).toLocaleString("en-GB")}`;
const addMonths = (s        , n        ) => {
  const [y, m, d] = s.split("-").map(Number);
  const last = new Date(Date.UTC(y, m - 1 + n + 1, 0)).getUTCDate();
  return iso(utc(y, m + n, Math.min(d, last)));
};
const addDays = (s        , n        ) => iso(new Date(Date.parse(s) + n * 86_400_000));

// ── 1. Deadlines ─────────────────────────────────────────────────────
                                                                                                    

/** taxYear = first calendar year of the tax year (2025 → 2025-26). */
export function ukTaxCalendar(x                                                                                                                       ) {
  const y = x.taxYear;
  const ty = `${y}-${String((y + 1) % 100).padStart(2, "0")}`;
  const ev            = [];
  const add = (id        , label        , date                    , cite        ) =>
    ev.push({ id, label, ...(date ? { date } : {}), cite, ...(date && x.today ? { daysLeft: days(x.today, date) } : {}) });
  const SA = "gov.uk Self Assessment deadlines";
  if (x.newToSA) add("register", `Tell HMRC you need to file a ${ty} return (first time, or no return needed for the previous year)`, `${y + 1}-10-05`, SA);
  add("paper", `Paper Self Assessment return for ${ty}`, `${y + 1}-10-31`, SA);
  add("online", `Online return and payment of the ${ty} balance, plus the first payment on account for ${y + 1}-${String((y + 2) % 100).padStart(2, "0")}`, `${y + 2}-01-31`, SA);
  add("poa2", `Second payment on account for ${y + 1}-${String((y + 2) % 100).padStart(2, "0")}`, `${y + 2}-07-31`, "gov.uk Pay your Self Assessment tax bill");
  if (x.mtd) {
    add("mtd-q1", `Making Tax Digital quarterly update 1 for ${ty} (6 April to 5 July)`, `${y}-08-07`, "gov.uk Making Tax Digital for Income Tax");
    add("mtd-q2", `Making Tax Digital quarterly update 2 for ${ty}`, `${y}-11-07`, "gov.uk Making Tax Digital for Income Tax");
    add("mtd-q3", "Quarterly updates 3 and 4: check the dates in your MTD software (not confirmed in our sources)", undefined, "gov.uk Making Tax Digital for Income Tax");
  }
  if (x.companyYearEnd) {
    add("ct-pay", "Corporation Tax payment: 9 months and 1 day after the accounting period ends", addDays(addMonths(x.companyYearEnd, 9), 1), "gov.uk Pay your Corporation Tax bill");
    add("ct-return", "Company Tax Return: 12 months after the accounting period ends", addMonths(x.companyYearEnd, 12), "gov.uk Company Tax Returns");
  }
  if (x.vatPeriodEnd) add("vat", "VAT Return and payment: usually 1 calendar month and 7 days after the period ends (must arrive by then even on a weekend or bank holiday)", addDays(addMonths(x.vatPeriodEnd, 1), 7), "gov.uk Submit a VAT Return");
  ev.sort((a, b) => (a.date ?? "9999").localeCompare(b.date ?? "9999"));
  const items           = [{ tone: "info", text: "If you register for Self Assessment after 5 October, your return is due 3 months after the date of HMRC's notice, but the payment date stays 31 January.", cite: SA }];
  return { taxYear: ty, events: ev, items };
}

// ── 2. Self-employed income tax and NI ───────────────────────────────
export const UK_2026 = { personalAllowance: 12_570, basicBand: 37_700, additionalFrom: 125_140, taperFrom: 100_000, class4Lower: 12_570, class4Upper: 50_270, class4Main: 0.06, class4Upper2: 0.02, class2SmallProfits: 7_105, class2Weekly: 3.65 }         ;

export function ukIncomeTax(total        ) {
  const t = Math.max(0, total);
  const pa = Math.max(0, UK_2026.personalAllowance - Math.max(0, Math.floor((t - UK_2026.taperFrom) / 2)));
  const taxable = Math.max(0, t - pa);
  const basic = Math.min(taxable, UK_2026.basicBand);
  const higher = Math.min(Math.max(0, taxable - UK_2026.basicBand), UK_2026.additionalFrom - UK_2026.basicBand);
  const additional = Math.max(0, taxable - UK_2026.additionalFrom);
  return { personalAllowance: pa, taxable, tax: Math.round((basic * 0.2 + higher * 0.4 + additional * 0.45) * 100) / 100 };
}

export function ukMtdStart(x                                                       ) {
  if ((x.qi2425 ?? 0) > 50_000) return "2026-04-06";
  if ((x.qi2526 ?? 0) > 30_000) return "2027-04-06";
  if ((x.qi2627 ?? 0) > 20_000) return "2028-04-06";
  return null;
}

export function ukSelfEmployed(x                                                                                             ) {
  const profit = Math.max(0, x.profit);
  const other = Math.max(0, x.otherIncome ?? 0);
  const all = ukIncomeTax(profit + other);
  const base = ukIncomeTax(other);
  const incomeTaxOnProfit = Math.round((all.tax - base.tax) * 100) / 100;
  const c4 = Math.round((Math.max(0, Math.min(profit, UK_2026.class4Upper) - UK_2026.class4Lower) * UK_2026.class4Main + Math.max(0, profit - UK_2026.class4Upper) * UK_2026.class4Upper2) * 100) / 100;
  const items           = [
    { tone: "info", text: `Income Tax (England, Wales, Northern Ireland bands): personal allowance ${gbp(all.personalAllowance)}, total Income Tax about ${gbp(all.tax)}, of which about ${gbp(incomeTaxOnProfit)} is on your profit.`, cite: "gov.uk Income Tax rates and Personal Allowances" },
    { tone: "info", text: `Class 4 NI: 6% on profits between £12,570 and £50,270, 2% above: ${gbp(c4)}.`, cite: "gov.uk Self-employed National Insurance rates" },
    profit >= UK_2026.class2SmallProfits
      ? { tone: "good", text: "Profits of £7,105 or more: Class 2 NI is treated as paid, so you pay nothing for it but still build State Pension.", cite: "gov.uk Self-employed National Insurance rates" }
      : { tone: "info", text: "Profits under £7,105: you can choose to pay voluntary Class 2 NI at £3.65 a week to protect your State Pension record.", cite: "gov.uk Self-employed National Insurance rates" },
  ];
  if (profit + other > UK_2026.taperFrom) items.push({ tone: "warn", text: "Income over £100,000: the personal allowance falls by £1 for every £2, and is nil from £125,140.", cite: "gov.uk Income Tax rates and Personal Allowances" });
  items.push({ tone: "info", text: "Scottish taxpayers have different Income Tax bands, which this tool does not calculate. Pension contributions, Gift Aid and student loan repayments are not included.", cite: "gov.uk Income Tax rates and Personal Allowances" });
  const mtd = ukMtdStart(x);
  if (mtd) items.push({ tone: "warn", text: `Making Tax Digital for Income Tax applies from ${mtd}: keep digital records and send quarterly updates.`, cite: "gov.uk Find out if and when you need to use Making Tax Digital for Income Tax" });
  return { personalAllowance: all.personalAllowance, incomeTax: all.tax, incomeTaxOnProfit, class4: c4, class2Due: profit < UK_2026.class2SmallProfits ? "voluntary" : "treated-as-paid", total: Math.round((incomeTaxOnProfit + c4) * 100) / 100, mtdFrom: mtd, items };
}

// ── 3. VAT registration and Flat Rate Scheme ─────────────────────────
export const UK_VAT = { register: 90_000, deregister: 88_000, frsJoin: 150_000, frsLeave: 230_000, rates: [0.2, 0.05, 0] }         ;

export function ukVatCheck(x                                                                            ) {
  const items           = [];
  let status                                                             ;
  if (!x.registered && (x.last12 > UK_VAT.register || (x.next30 ?? 0) > UK_VAT.register)) {
    status = "must-register";
    items.push({ tone: "warn", text: x.last12 > UK_VAT.register ? "Taxable turnover in the last 12 months is over £90,000: you must register for VAT." : "You expect more than £90,000 taxable turnover in the next 30 days alone: you must register now.", cite: "gov.uk Register for VAT" });
  } else if (x.registered && x.last12 < UK_VAT.deregister) {
    status = "can-deregister";
    items.push({ tone: "info", text: "Registered and taxable turnover under £88,000: you can ask to cancel your registration.", cite: "gov.uk VAT registration and deregistration thresholds" });
  } else if (x.registered) {
    status = "registered";
    items.push({ tone: "info", text: "Registered for VAT: charge 20% standard, 5% reduced or 0% zero rate depending on the goods or services.", cite: "gov.uk VAT rates" });
  } else {
    status = "below";
    items.push({ tone: "good", text: `Under the £90,000 threshold: registration is voluntary. Headroom over the last 12 months: ${gbp(UK_VAT.register - x.last12)}.`, cite: "gov.uk Register for VAT" });
  }
  if (x.next12 != null) items.push(x.next12 <= UK_VAT.frsJoin
    ? { tone: "info", text: "Expected taxable turnover up to £150,000 (excluding VAT) in the next 12 months: you can join the Flat Rate Scheme. You must leave if turnover including VAT goes over £230,000.", cite: "gov.uk VAT Flat Rate Scheme" }
    : { tone: "info", text: "Expected turnover over £150,000: you cannot join the Flat Rate Scheme.", cite: "gov.uk VAT Flat Rate Scheme" });
  return { status, threshold: UK_VAT.register, headroom: Math.max(0, UK_VAT.register - x.last12), items };
}

// ── 4. Penalties, interest, appeals ──────────────────────────────────
/** HMRC late payment interest (base rate + 4%). Rates before 2026-01-09 are not in our sources. */
export const UK_LATE_INTEREST                     = [["2026-01-09", 0.0775], ["2026-11-24", 0.08]];

export function ukInterest(amount        , from        , to        ) {
  let total = 0, unknownDays = 0;
  const start = from < to ? from : to;
  for (let d = start; d < to; d = addDays(d, 1)) {
    const r = [...UK_LATE_INTEREST].reverse().find(([since]) => d >= since)?.[1];
    if (r == null) unknownDays++;
    else total += amount * r / 365;
  }
  return { interest: Math.round(total * 100) / 100, unknownDays };
}

export function ukSaPenalties(x                                                                 ) {
  const due = `${x.taxYear + 2}-01-31`;
  const items           = [];
  let filing = 0, payment = 0;
  if (x.filed && x.filed > due) {
    filing = 100;
    const daily = Math.min(90, Math.max(0, days(addMonths(due, 3), x.filed)));
    filing += daily * 10;
    if (x.filed > addMonths(due, 6)) filing += Math.max(x.tax * 0.05, 300);
    if (x.filed > addMonths(due, 12)) filing += Math.max(x.tax * 0.05, 300);
    items.push({ tone: "warn", text: `Late return: £100${daily ? ` + £10 a day for ${daily} day(s) after 3 months` : ""}${x.filed > addMonths(due, 6) ? " + 5% of the tax or £300 at 6 months" : ""}${x.filed > addMonths(due, 12) ? " + another 5% or £300 at 12 months" : ""} = ${gbp(filing)}.`, cite: "gov.uk Self Assessment penalties" });
  }
  let interest = 0, unknownDays = 0;
  if (x.paid && x.paid > due) {
    for (const [after, label] of [[addDays(due, 30), "30 days"], [addMonths(due, 6), "6 months"], [addMonths(due, 12), "12 months"]]         ) if (x.paid > after) { payment += x.tax * 0.05; items.push({ tone: "warn", text: `Tax unpaid ${label} after the deadline: 5% of the unpaid tax.`, cite: "gov.uk Self Assessment penalties" }); }
    ({ interest, unknownDays } = ukInterest(x.tax, due, x.paid));
    items.push({ tone: "info", text: `Late payment interest at base rate + 4% (7.75% from 9 January 2026, 8.00% from 24 November 2026): about ${gbp(interest)}.${unknownDays ? ` ${unknownDays} day(s) before 9 January 2026 are not included because we have not checked that rate.` : ""}`, cite: "gov.uk HMRC interest rates for late and early payments" });
  }
  items.push({ tone: "info", text: "If you have joined Making Tax Digital for Income Tax, a different penalty system applies to updates, returns and payments. It is not calculated here.", cite: "gov.uk Penalties for Making Tax Digital for Income Tax" });
  return { due, filing: Math.round(filing), payment: Math.round(payment), interest, total: Math.round(filing + payment + interest), items };
}

export function ukAppealDeadlines(x                                         ) {
  const out                                                              = [];
  if (x.decision) out.push({ id: "appeal", label: "Appeal to HMRC or accept a review: usually within 30 days of the decision letter. After a review, 30 days to accept it or appeal to the tribunal.", date: addDays(x.decision, 30), cite: "gov.uk Disagree with a tax decision" });
  if (x.taxYear) out.push({ id: "overpayment", label: "Overpayment relief claim: 4 years after the end of the tax year", date: `${x.taxYear + 5}-04-05`, cite: "TMA 1970 Sch 1AB para 3(1)" });
  return out;
}

// ── 5. Capital allowances ────────────────────────────────────────────
export const UK_CA = { aia: 1_000_000, wdaMain: 0.14, wdaSpecial: 0.06, fya40From: "2026-01-01", fullExpensingFrom: "2023-04-01" }         ;

export function ukCapitalAllowances(x                                                                                                                                                   ) {
  const cost = Math.max(0, x.cost);
  const items           = [];
  const options                                                                   = [];
  if (x.cashBasis && !x.car) {
    items.push({ tone: "info", text: "Cash basis (the default for sole traders since 6 April 2024): you deduct equipment as an expense instead of claiming capital allowances, except for cars.", cite: "gov.uk Simpler income tax: cash basis" });
    return { options, wda: [], items };
  }
  const wdaRate = x.pool === "main" ? UK_CA.wdaMain : UK_CA.wdaSpecial;
  if (!x.car) {
    const aiaLeft = Math.max(0, UK_CA.aia - (x.aiaUsed ?? 0));
    options.push({ id: "aia", label: `Annual Investment Allowance (up to £1m a year; ${gbp(aiaLeft)} left)`, firstYear: Math.min(cost, aiaLeft), cite: "gov.uk Capital allowances" });
    if (x.company && x.date >= UK_CA.fullExpensingFrom) options.push(x.pool === "main"
      ? { id: "full-expensing", label: "Full expensing (companies, main-pool assets): 100%", firstYear: cost, cite: "gov.uk Capital allowances" }
      : { id: "fya50", label: "50% first year allowance (companies, special-rate assets)", firstYear: cost * 0.5, cite: "gov.uk Capital allowances" });
    if (x.pool === "main" && x.date >= UK_CA.fya40From) options.push({ id: "fya40", label: "40% first year allowance (main-rate assets bought from 1 January 2026, leased assets allowed)", firstYear: cost * 0.4, cite: "gov.uk Capital allowances" });
  } else items.push({ tone: "info", text: "Cars cannot use the AIA or full expensing; they go into a pool and get writing down allowances.", cite: "gov.uk Capital allowances" });
  options.push({ id: "wda", label: `Writing down allowance only: ${Math.round(wdaRate * 100)}% a year (${x.pool} rate pool)`, firstYear: cost * wdaRate, cite: "gov.uk Work out capital allowances: rates and pools" });
  const wda                                                      = [];
  let pool = cost;
  for (let i = 1; i <= Math.max(1, Math.min(20, x.years ?? 6)); i++) { const a = pool * wdaRate; pool -= a; wda.push({ year: i, allowance: Math.round(a), pool: Math.round(pool) }); }
  items.push({ tone: "warn", text: "The main pool writing down allowance is 14% for periods from April 2026 (18% before). For an accounting period that spans the change, the rate is not calculated here.", cite: "gov.uk Work out capital allowances: rates and pools" });
  return { options: options.map((o) => ({ ...o, firstYear: Math.round(o.firstYear) })), wda, items };
}

// ── 6. Who can help ──────────────────────────────────────────────────
export const UK_SCOPE = [
  { title: "Paid tax advisers must register with HMRC", body: "If you are paid to deal with HMRC on someone else's tax, HMRC treats you as a tax adviser and you need an agent services account, even if you do not call yourself a tax adviser, it is a side job or you have one client. Employers, in-house tax teams and free help for charities, friends or family are outside this.", cite: "gov.uk Check if and when you need to register as a tax adviser with HMRC (2026-11-17)" },
  { title: "What this site does", body: "It explains published rules, gives dates and estimates with official sources. It does not act for you with HMRC, does not file returns or appeals, does not advise on your own situation and does not recommend firms.", cite: "—" },
  { title: "Check who you hire", body: "Ask whether the adviser is registered with HMRC as an agent and which professional body they belong to, and check with that body.", cite: "gov.uk Check if and when you need to register as a tax adviser with HMRC" },
  { title: "HMRC help", body: "Online forms, webchat, the HMRC app, phone and post. Self Assessment and Income Tax enquiries: 0300 200 3300 (Relay UK: 18001 then 0300 200 3300).", cite: "gov.uk Contact HMRC; Income Tax enquiries" },
  { title: "Free independent advice", body: "If HMRC cannot sort it out and you are on a low income (about £380 a week or less), you can get free professional advice, for example from TaxAid. HMRC also funds voluntary organisations such as Advice Direct Scotland and Advice NI.", cite: "gov.uk Get help with tax; voluntary and community sector organisations" },
];
