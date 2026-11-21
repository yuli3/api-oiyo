// GENERATED from tools-oiyo src/lib/us-tax-pack-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// US federal tax and accounting guide (2026-11-21, per-country localization #2: United States). General information and
// estimates only: no individual tax advice, no return preparation, no IRS representation (31 CFR Part 10, Circular 230).
// The same code ships in the oiyo-us-tax-guide skill (scripts/calc.mjs) and the api.oiyo.net MCP tools (*_us_*).
// Sources checked 2026-11-21 (company-brain projects/oiyo-ecosystem/us-tax-pack-facts-2026-11-21.md):
// - Deadlines: IRS Pub 509 (2026), 2026 Form 1040-ES; weekend/legal holiday rule (IRC 7503 as stated in Pub 509).
// - SE tax: IRS Topic 554/560 and SE tax page (15.3% on 92.35%, SS wage base $184,500, Additional Medicare 0.9%).
// - Brackets, standard deduction, QBI thresholds and the $400 minimum QBI deduction: IR-2025-103, Rev. Proc. 2025-32.
// - Estimated tax safe harbor: 2026 Form 1040-ES. Interest 2026 Q1-Q4 7/6/7/7%: irs.gov quarterly interest rates.
// - Penalties: IRS failure-to-file / failure-to-pay pages, Rev. Proc. 2025-32 §3.52 ($535 minimum for returns filed in 2027).
// - Appeals: Pub 556 (Tax Court 90/150 days), CDP FAQ (30 days), Topic 308 (refund claims 3 years / 2 years).
// - Depreciation: Rev. Proc. 2025-32 §3.24 (Section 179 $2,560,000 / $4,090,000), Pub 946 (bonus 100% after 2025-01-19,
//   MACRS Table A-1), 26 CFR 1.263(a)-1(f) (de minimis $2,500 / $5,000).
// - Scope: 31 CFR 10.3, IRS AFSP page, VITA/TCE, TAS, LITC pages.

export const US_TAX_AS_OF = "2026-11-21";
export const US_TAX_NOTE = "General information and estimates based on published IRS guidance and regulations. This is not tax advice and does not prepare or file returns. For your own situation, use IRS free help (VITA/TCE, Taxpayer Advocate Service, Low Income Taxpayer Clinics) or a CPA, enrolled agent or tax attorney.";

                                            
                                                                

const iso = (d      ) => d.toISOString().slice(0, 10);
const utc = (y        , m        , d        ) => new Date(Date.UTC(y, m - 1, d));
const days = (a        , b        ) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
const addDays = (isoDate        , n        ) => iso(new Date(Date.parse(isoDate) + n * 86_400_000));
const nthMonday = (y        , m        , n        ) => {
  const first = utc(y, m, 1).getUTCDay();
  return 1 + ((8 - first) % 7) + (n - 1) * 7;
};
const usd = (n        ) => `$${Math.round(n).toLocaleString("en-US")}`;

/** Federal legal holidays that can touch a tax deadline (Jan 1, MLK Day, DC Emancipation Day Apr 16 and its observed day). */
export function isUsHoliday(d      )          {
  const y = d.getUTCFullYear(), m = d.getUTCMonth() + 1, day = d.getUTCDate();
  if (m === 1 && day === 1) return true;
  if (m === 1 && day === nthMonday(y, 1, 3)) return true;
  if (m === 4) {
    const e = utc(y, 4, 16).getUTCDay();
    const observed = e === 6 ? 15 : e === 0 ? 17 : 16;
    if (day === observed) return true;
  }
  return false;
}
/** A deadline on a Saturday, Sunday or legal holiday moves to the next business day (Pub 509, IRC 7503). */
export function usShift(d      )       {
  let t = d;
  while (t.getUTCDay() === 0 || t.getUTCDay() === 6 || isUsHoliday(t)) t = new Date(t.getTime() + 86_400_000);
  return t;
}

// ── 1. Filing and payment calendar ────────────────────────────────────
                                                                                                                                                                                      
                                                                                                                          

export function usTaxCalendar(x               ) {
  const y = x.taxYear;
  const ev                  = [];
  const push = (id        , label        , nominal      , cite        ) => {
    const d = iso(usShift(nominal));
    ev.push({ id, label, date: d, nominal: iso(nominal), cite, ...(x.today ? { daysLeft: days(x.today, d) } : {}) });
  };
  push("1040", `Form 1040 for ${y}: file and pay`, utc(y + 1, 4, 15), "IRS Pub 509");
  if (x.extension) push("4868", `Extended Form 1040 for ${y} (Form 4868 filed by the April date; tax is still due in April)`, utc(y + 1, 10, 15), "IRS Pub 509");
  if (x.selfEmployed) {
    push("es1", `Estimated tax for ${y}, 1st payment (Form 1040-ES)`, utc(y, 4, 15), "2026 Form 1040-ES");
    push("es2", `Estimated tax for ${y}, 2nd payment`, utc(y, 6, 15), "2026 Form 1040-ES");
    push("es3", `Estimated tax for ${y}, 3rd payment`, utc(y, 9, 15), "2026 Form 1040-ES");
    push("es4", `Estimated tax for ${y}, 4th payment (skip it if you file and pay in full by the start of February)`, utc(y + 1, 1, 15), "2026 Form 1040-ES");
  }
  if (x.pays1099) push("1099nec", `Form 1099-NEC for ${y}: file with the IRS and give to contractors`, utc(y + 1, 1, 31), "IRS Pub 509");
  if (x.entity === "partnership" || x.entity === "scorp") push("entity", `${x.entity === "scorp" ? "Form 1120-S" : "Form 1065"} for calendar year ${y}`, utc(y + 1, 3, 15), "IRS Pub 509");
  if (x.entity === "ccorp") push("entity", `Form 1120 for calendar year ${y}`, utc(y + 1, 4, 15), "IRS Pub 509");
  ev.sort((a, b) => a.date.localeCompare(b.date));
  return { events: ev, note: "State returns and state estimated taxes have their own dates. Fiscal-year businesses use the 15th day of the 3rd or 4th month after year end." };
}

// ── 2. Self-employment tax, QBI and federal income tax ────────────────
                                      
export const STANDARD_DEDUCTION_2026 = { single: 16_100, mfj: 32_200 }         ;
export const BRACKETS_2026                                     = {
  single: [[12_400, 0.1], [50_400, 0.12], [105_700, 0.22], [201_775, 0.24], [256_225, 0.32], [640_600, 0.35], [Infinity, 0.37]],
  mfj: [[24_800, 0.1], [100_800, 0.12], [211_400, 0.22], [403_550, 0.24], [512_450, 0.32], [768_700, 0.35], [Infinity, 0.37]],
};
export const SS_WAGE_BASE_2026 = 184_500;
export const QBI_2026 = { single: { threshold: 201_750, end: 276_750 }, mfj: { threshold: 403_500, end: 553_500 } }         ;

export function usIncomeTax(taxable        , filing        )         {
  let tax = 0, lo = 0;
  for (const [hi, r] of BRACKETS_2026[filing]) {
    if (taxable <= lo) break;
    tax += (Math.min(taxable, hi) - lo) * r;
    lo = hi;
  }
  return Math.round(tax);
}

                                                                                             

export function usSelfEmployment(x         ) {
  const filing = x.filing ?? "single";
  const wages = Math.max(0, x.wages ?? 0);
  const base = Math.max(0, x.net) * 0.9235;
  const items           = [];
  const ss = x.net >= 400 ? Math.min(base, Math.max(0, SS_WAGE_BASE_2026 - wages)) * 0.124 : 0;
  const medicare = x.net >= 400 ? base * 0.029 : 0;
  const seTax = Math.round(ss + medicare);
  const addlThreshold = filing === "mfj" ? 250_000 : 200_000;
  const addlMedicare = x.net >= 400 ? Math.round(Math.max(0, base + wages - Math.max(addlThreshold, wages)) * 0.009) : 0;
  const halfSe = Math.round(seTax / 2);
  const agi = Math.max(0, x.net - halfSe + wages + (x.otherIncome ?? 0));
  const preQbiTaxable = Math.max(0, agi - STANDARD_DEDUCTION_2026[filing]);
  const qbiBase = Math.max(0, x.net - halfSe);
  const q = QBI_2026[filing];
  let qbi                = 0;
  if (preQbiTaxable <= q.threshold) {
    qbi = Math.min(qbiBase * 0.2, preQbiTaxable * 0.2);
    if (qbiBase >= 1_000) qbi = Math.max(qbi, Math.min(400, preQbiTaxable));
    qbi = Math.round(qbi);
  } else {
    qbi = null;
    items.push({ tone: "warn", text: `Taxable income is above the ${usd(q.threshold)} QBI threshold, so the wage/property limit and the specified service business rule apply (fully at ${usd(q.end)}). The QBI deduction is not estimated here.`, cite: "IRC 199A, Rev. Proc. 2025-32" });
  }
  const taxable = Math.max(0, preQbiTaxable - (qbi ?? 0));
  const incomeTax = usIncomeTax(taxable, filing);
  const total = seTax + addlMedicare + incomeTax;
  if (x.net > 0 && x.net < 400) items.push({ tone: "good", text: "Net self-employment earnings under $400 owe no SE tax.", cite: "IRS Topic 554" });
  items.push({ tone: "info", text: `SE tax is 15.3% of 92.35% of net earnings; the 12.4% Social Security part stops at the ${usd(SS_WAGE_BASE_2026)} wage base (W-2 wages count first). Half of it (${usd(halfSe)}) is deducted from income.`, cite: "IRS Topic 554, 2026 Form 1040-ES" });
  if (addlMedicare) items.push({ tone: "warn", text: `Additional Medicare Tax 0.9% above ${usd(addlThreshold)}: ${usd(addlMedicare)}.`, cite: "IRS Topic 560" });
  if (qbi) items.push({ tone: "info", text: `QBI deduction about ${usd(qbi)} (20%, at least $400 when QBI is $1,000 or more, from 2026).`, cite: "IRC 199A, Rev. Proc. 2025-32 §2.12" });
  items.push({ tone: "info", text: "Uses the 2026 standard deduction and brackets only. No credits, itemized deductions, retirement contributions, health insurance deduction or state tax.", cite: "IR-2025-103" });
  return { seTax, addlMedicare, halfSe, agi, qbi, taxable, incomeTax, total, effective: x.net > 0 ? total / x.net : 0, items };
}

// ── 3. Estimated tax safe harbor ──────────────────────────────────────
                                                                                                                                                                                         

export function usEstimatedTax(x                ) {
  const y = x.taxYear ?? 2026;
  const wh = Math.max(0, x.withholding ?? 0);
  const high = x.priorAgi > (x.mfs ? 75_000 : 150_000);
  const priorPct = high ? 1.1 : 1;
  const currentReq = Math.round(x.currentTax * 0.9);
  const priorReq = x.priorFullYear === false ? Infinity : Math.round(x.priorTax * priorPct);
  const required = Math.min(currentReq, priorReq);
  const owedAfterWh = x.currentTax - wh;
  const needed = owedAfterWh >= 1_000 && wh < required;
  const toPay = needed ? Math.max(0, required - wh) : 0;
  const per = Math.ceil(toPay / 4);
  const due = [utc(y, 4, 15), utc(y, 6, 15), utc(y, 9, 15), utc(y + 1, 1, 15)].map((d) => iso(usShift(d)));
  const schedule = due.map((date, i) => ({ date, amount: needed ? (i < 3 ? per : toPay - per * 3) : 0, paid: x.paid?.[i] ?? null }));
  const items           = [];
  if (!needed) items.push({ tone: "good", text: owedAfterWh < 1_000 ? "You expect to owe less than $1,000 after withholding, so estimated payments are not required." : "Withholding already covers the safe harbor amount.", cite: "2026 Form 1040-ES" });
  else items.push({ tone: "info", text: `Safe harbor: pay the smaller of 90% of this year's tax (${usd(currentReq)}) and ${high ? "110%" : "100%"} of last year's tax${priorReq === Infinity ? " (not available without a full prior-year return)" : ` (${usd(priorReq)})`}. After withholding, about ${usd(toPay)} in four payments.`, cite: "2026 Form 1040-ES" });
  if (high) items.push({ tone: "info", text: `Last year's AGI was over ${usd(x.mfs ? 75_000 : 150_000)}, so the prior-year option is 110%.`, cite: "2026 Form 1040-ES" });
  items.push({ tone: "info", text: "Short payments are charged at the underpayment interest rate (7% in 2026 Q1, 6% in Q2, 7% in Q3 and Q4) on Form 2210. Withholding counts as paid evenly through the year.", cite: "IRS quarterly interest rates, Form 2210" });
  return { required, toPay, needed, schedule, items };
}

// ── 4. Penalties and interest ─────────────────────────────────────────
/** Underpayment rate for individuals by calendar quarter. 2027 is not published yet: the last known rate is reused. */
export const US_INTEREST                         = { "2026-1": 0.07, "2026-2": 0.06, "2026-3": 0.07, "2026-4": 0.07 };
const rateOn = (isoDate        ) => {
  const y = Number(isoDate.slice(0, 4)), q = Math.floor((Number(isoDate.slice(5, 7)) - 1) / 3) + 1;
  return US_INTEREST[`${y}-${q}`] ?? US_INTEREST["2026-4"];
};
export const MIN_LATE_FILING_PENALTY_2027 = 535;

                                                                                                                                   

const monthsLate = (from        , to        ) => {
  if (to <= from) return 0;
  const [fy, fm, fd] = from.split("-").map(Number), [ty, tm, td] = to.split("-").map(Number);
  const whole = (ty - fy) * 12 + (tm - fm) - (td <= fd ? 1 : 0);
  return Math.max(1, whole + 1);
};

export function usPenalty(x              ) {
  const items           = [];
  const unpaid = Math.max(0, x.tax);
  const filed = x.filed;
  const paid = x.paid;
  const fileDue = x.extension ? iso(usShift(utc(Number(x.due.slice(0, 4)), 10, 15))) : x.due;
  const fileMonths = filed ? Math.min(5, monthsLate(fileDue, filed)) : 0;
  const payMonths = paid ? Math.min(50, monthsLate(x.due, paid)) : 0;
  const ftpRate = x.installment ? 0.0025 : 0.005;
  const ftp = Math.min(unpaid * 0.25, unpaid * ftpRate * payMonths);
  let ftf = 0;
  for (let m = 1; m <= fileMonths; m++) ftf += unpaid * (0.05 - (m <= payMonths ? ftpRate : 0));
  if (filed && days(fileDue, filed) > 60) ftf = Math.max(ftf, Math.min(MIN_LATE_FILING_PENALTY_2027, unpaid));
  let interest = 0;
  if (paid && paid > x.due) {
    let bal = unpaid + 0;
    for (let d = x.due; d < paid; d = addDays(d, 1)) bal *= 1 + rateOn(d) / 365;
    interest = bal - unpaid;
  }
  const r = { failureToFile: Math.round(ftf), failureToPay: Math.round(ftp), interest: Math.round(interest) };
  if (fileMonths) items.push({ tone: "warn", text: `Failure-to-file: 5% per month or part of a month, up to 25%, reduced by the failure-to-pay penalty for the same months${filed && days(fileDue, filed) > 60 ? `; at least ${usd(MIN_LATE_FILING_PENALTY_2027)} (or 100% of the tax, if less) when over 60 days late` : ""}: ${usd(r.failureToFile)}.`, cite: "IRS failure-to-file penalty, Rev. Proc. 2025-32 §3.52" });
  if (payMonths) items.push({ tone: "warn", text: `Failure-to-pay: ${x.installment ? "0.25% (approved payment plan)" : "0.5%"} per month, up to 25%: ${usd(r.failureToPay)}.`, cite: "IRS failure-to-pay penalty" });
  if (r.interest) items.push({ tone: "warn", text: `Interest compounds daily at the underpayment rate (2026: 7/6/7/7% by quarter; later quarters use 7% until published): ${usd(r.interest)}. Interest is not waived by penalty relief.`, cite: "IRC 6621/6622, IRS quarterly interest rates" });
  if (!fileMonths && !payMonths) items.push({ tone: "good", text: "Filed and paid on time: no late penalties.", cite: "IRS penalties" });
  items.push({ tone: "info", text: "First-time abatement can remove failure-to-file and failure-to-pay penalties if you had no penalties in the prior 3 years. The IRS has been moving it to automatic relief for 2025 returns onward.", cite: "IRS first-time abate page" });
  return { ...r, total: r.failureToFile + r.failureToPay + r.interest, fileMonths, payMonths, items };
}

// ── 5. Appeal and refund deadlines ────────────────────────────────────
export function usAppealDeadlines(x                                                                                                                       ) {
  const out                                                              = [];
  if (x.notice && (x.kind ?? "deficiency") === "deficiency") out.push({ id: "taxcourt", label: `Petition the U.S. Tax Court (${x.abroad ? 150 : 90} days from the notice of deficiency date)`, date: iso(usShift(new Date(Date.parse(x.notice) + (x.abroad ? 150 : 90) * 86_400_000))), cite: "IRS Pub 556 (IRC 6213)" });
  if (x.notice && x.kind === "cdp") out.push({ id: "cdp", label: "Request a Collection Due Process hearing (Form 12153, 30 days from the notice)", date: addDays(x.notice, 30), cite: "IRS CDP FAQ (IRC 6320/6330)" });
  if (x.filed) {
    const deemed = x.returnDue && x.filed < x.returnDue ? x.returnDue : x.filed;
    const threeY = `${Number(deemed.slice(0, 4)) + 3}${deemed.slice(4)}`;
    const twoY = x.paid ? `${Number(x.paid.slice(0, 4)) + 2}${x.paid.slice(4)}` : "";
    out.push({ id: "refund", label: "Claim a refund (3 years from filing, or 2 years from payment if later)", date: twoY > threeY ? twoY : threeY, cite: "IRS Topic 308 (IRC 6511)" });
  }
  return out;
}

// ── 6. Depreciation: de minimis, Section 179, bonus, MACRS ────────────
export const MACRS_HALF_YEAR = {
  5: [0.2, 0.32, 0.192, 0.1152, 0.1152, 0.0576],
  7: [0.1429, 0.2449, 0.1749, 0.1249, 0.0893, 0.0892, 0.0893, 0.0446],
}         ;
export const SEC179_2026 = { limit: 2_560_000, phaseOut: 4_090_000 };

                                                                                                                                                                                        

export function usDepreciation(x          ) {
  const items           = [];
  const cost = Math.max(0, x.cost);
  const deMinimis = x.afs ? 5_000 : 2_500;
  if (cost <= deMinimis) {
    items.push({ tone: "good", text: `${usd(cost)} is within the ${usd(deMinimis)} de minimis safe harbor per item or invoice, so you can expense it if you elect the safe harbor on your return.`, cite: "26 CFR 1.263(a)-1(f)" });
    return { treatment: "expense"         , sec179: 0, bonus: 0, schedule: [{ year: Number(x.placed.slice(0, 4)), amount: cost }], firstYear: cost, items };
  }
  const limit = Math.max(0, SEC179_2026.limit - Math.max(0, (x.totalPlaced ?? cost) - SEC179_2026.phaseOut));
  let s179 = Math.min(Math.max(0, x.sec179 ?? 0), cost, limit);
  if (x.businessIncome != null && s179 > x.businessIncome) {
    items.push({ tone: "warn", text: `Section 179 is limited to business income (${usd(x.businessIncome)}); the rest carries forward.`, cite: "Pub 946" });
    s179 = Math.max(0, x.businessIncome);
  }
  const acquired = x.acquired ?? x.placed;
  const bonusOk = acquired > "2025-01-19" && x.bonus !== false;
  const rest = cost - s179;
  const bonus = bonusOk ? rest : 0;
  const basis = rest - bonus;
  const startYear = Number(x.placed.slice(0, 4));
  const table = MACRS_HALF_YEAR[x.life];
  const schedule = table.map((p, i) => ({ year: startYear + i, amount: Math.round(basis * p) + (i === 0 ? s179 + bonus : 0) }));
  if (s179) items.push({ tone: "info", text: `Section 179 for 2026: up to ${usd(SEC179_2026.limit)}, reduced dollar for dollar above ${usd(SEC179_2026.phaseOut)} of property placed in service. You elected ${usd(s179)}.`, cite: "Rev. Proc. 2025-32 §3.24" });
  if (bonusOk && bonus) items.push({ tone: "info", text: `100% bonus depreciation applies to qualified property acquired after January 19, 2025: ${usd(bonus)} in the first year. You can elect out by class.`, cite: "Pub 946 (P.L. 119-21)" });
  if (!bonusOk && x.bonus !== false) items.push({ tone: "info", text: "Property acquired on or before January 19, 2025 uses the older phased-down bonus rate, which is not computed here.", cite: "Pub 946" });
  if (basis > 0) items.push({ tone: "info", text: `MACRS ${x.life}-year property, half-year convention (Pub 946 Table A-1): ${table.map((p) => `${(p * 100).toFixed(2)}%`).join(", ")}. If over 40% of the year's property is placed in service in the last quarter, the mid-quarter convention applies instead.`, cite: "Pub 946 Table A-1" });
  items.push({ tone: "info", text: "Passenger cars have yearly dollar caps (2026 amounts not yet published) and need over 50% business use for Section 179 and bonus.", cite: "Pub 946" });
  return { treatment: "depreciate"         , sec179: s179, bonus, schedule, firstYear: schedule[0].amount, items };
}

// ── 7. Who may give tax advice and represent you ──────────────────────
export const US_SCOPE = [
  { title: "Who can represent you before the IRS", body: "Attorneys, CPAs and enrolled agents have unlimited representation rights; enrolled actuaries and retirement plan agents in their areas. Annual Filing Season Program participants may represent only for returns they prepared and signed, and only before revenue agents and customer service.", cite: "31 CFR 10.3 (Circular 230), IRS AFSP page" },
  { title: "What this site does", body: "General explanations of published rules, deadline lists and estimates with links to IRS sources. It does not give advice on your specific facts, prepare or file returns, sign Form 2848, or recommend a preparer.", cite: "Circular 230" },
  { title: "Names", body: "This site does not call itself a CPA, enrolled agent or tax professional. Those titles are licensed or granted by state boards and the IRS.", cite: "31 CFR Part 10" },
  { title: "Free help: VITA and TCE", body: "Volunteer Income Tax Assistance for people generally earning up to about $70,000, people with disabilities and limited English speakers; Tax Counseling for the Elderly mainly for people 60 and older.", cite: "IRS free tax return preparation page" },
  { title: "Free help: Taxpayer Advocate Service", body: "Helps when an IRS problem is causing financial hardship or is not resolved through normal channels.", cite: "irs.gov/advocate" },
  { title: "Free help: Low Income Taxpayer Clinics", body: "Represent low-income taxpayers in disputes with the IRS (usually under $50,000 in dispute), independent from the IRS.", cite: "IRS LITC page" },
];
