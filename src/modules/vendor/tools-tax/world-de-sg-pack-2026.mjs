// GENERATED from tools-oiyo src/lib/world-de-sg-pack-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// New countries: Germany and Singapore, first pack (2026-11-22, world pro-gap #9).
// DE: Einkommensteuertarif 2026 (§32a EStG), Kündigungsfristen (§622 BGB), Mindestlohn and Minijob, E-Rechnung timeline.
// SG: income tax (IRAS, YA 2024 onwards), CPF contributions from 1 January 2026, statutory notice period (Employment Act, MOM).
// General information only: not tax or legal advice. Facts: /mnt/project-files/notes/de-sg-facts-2026-11-22.md
// Not computed because not verified: DE Kirchensteuer, Kinderfreibetrag, Kündigungsschutzgesetz;
// SG YA 2026 rebate, CPF for wages of $750 or less, CPF rounding rules.

export const DESG_AS_OF = "2026-11-22";
                                            
                                                               
                                                                              

const ok = (s         ) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
const pos = (n         ) => Math.max(0, Number(n) || 0);
const parts = (s        ) => s.split("-").map(Number)                            ;
const iso = (y        , m        , d        ) => new Date(Date.UTC(y, m - 1, d)).toISOString().slice(0, 10);
const lastDay = (y        , m        ) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const addDays = (s        , n        ) => { const [y, m, d] = parts(s); return iso(y, m, d + n); };
const addMonths = (s        , n        ) => { const [y, m, d] = parts(s); const t = new Date(Date.UTC(y, m - 1 + n, 1)); const ty = t.getUTCFullYear(), tm = t.getUTCMonth() + 1; return iso(ty, tm, Math.min(d, lastDay(ty, tm))); };
const monthEnd = (s        ) => { const [y, m] = parts(s); return iso(y, m, lastDay(y, m)); };
/** Full years from a to b (b's anniversary counts). */
const fullYears = (a        , b        ) => { const [y1, m1, d1] = parts(a), [y2, m2, d2] = parts(b); return y2 - y1 - (m2 < m1 || (m2 === m1 && d2 < d1) ? 1 : 0); };
const r2 = (n        ) => Math.round(n * 100) / 100;

// ── Germany: Einkommensteuer 2026 ───────────────────────────────────
export const DE_ZONES = [12_348, 17_799, 69_878, 277_825]         ;
/** Tarif §32a Abs. 1 EStG ab VZ 2026, for one person (Grundtabelle). */
export function deTarif(zvE        ) {
  const x = Math.floor(pos(zvE));
  let t        ;
  if (x <= 12_348) t = 0;
  else if (x <= 17_799) { const y = (x - 12_348) / 10_000; t = (914.51 * y + 1_400) * y; }
  else if (x <= 69_878) { const z = (x - 17_799) / 10_000; t = (173.1 * z + 2_397) * z + 1_034.87; }
  else if (x <= 277_825) t = 0.42 * x - 11_135.63;
  else t = 0.45 * x - 19_470.38;
  return Math.floor(t);
}
/** Solidaritätszuschlag (§§ 3, 4 SolZG; Freigrenze § 3 Abs. 3, ab VZ 2026 per § 6 Abs. 27): 5.5%, capped at 11.9% of the excess over the Freigrenze. */
export const DE_SOLI_FREIGRENZE = { single: 20_350, joint: 40_700 }         ;
export function deSoli(incomeTax        , joint = false) {
  const base = pos(incomeTax), fg = joint ? DE_SOLI_FREIGRENZE.joint : DE_SOLI_FREIGRENZE.single;
  if (base <= fg) return 0;
  return Math.floor(Math.min(base * 0.055, (base - fg) * 0.119) * 100) / 100;
}
export function deIncomeTax(x                                  ) {
  const zvE = Math.floor(pos(x.zvE));
  const tax = x.joint ? 2 * deTarif(Math.floor(zvE / 2)) : deTarif(zvE);
  const per = x.joint ? Math.floor(zvE / 2) : zvE;
  const marginal = per <= 12_348 ? 0 : per <= 17_799 ? (2 * 914.51 * ((per - 12_348) / 10_000) + 1_400) / 100 : per <= 69_878 ? (2 * 173.1 * ((per - 17_799) / 10_000) + 2_397) / 100 : per <= 277_825 ? 42 : 45;
  const soli = deSoli(tax, !!x.joint);
  const items          = [
    { tone: "info", text: soli ? `Solidaritätszuschlag: ${soli.toFixed(2).replace(".", ",")} € (5,5 %, gemildert bis 11,9 % des Betrags über der Freigrenze von ${x.joint ? "40.700" : "20.350"} € Einkommensteuer).` : `Kein Solidaritätszuschlag: die Einkommensteuer liegt nicht über der Freigrenze von ${x.joint ? "40.700" : "20.350"} €.`, cite: "§§ 3, 4 SolZG" },
    { tone: "info", text: `Tarif ab 2026: bis 12.348 € (Grundfreibetrag) keine Steuer, danach steigender Satz bis 42 % ab 69.879 € und 45 % ab 277.826 €${x.joint ? "; Splitting: doppelte Steuer auf die Hälfte des gemeinsamen Einkommens" : ""}.`, cite: "§ 32a EStG" },
    { tone: "info", text: "Eingabe ist das zu versteuernde Einkommen (nach Werbungskosten, Sonderausgaben und Freibeträgen), nicht das Bruttogehalt.", cite: "§ 32a EStG" },
    { tone: "warn", text: "Kirchensteuer, Kinderfreibetrag (auch seine Wirkung auf den Solidaritätszuschlag), Abgeltungsteuer und Progressionsvorbehalt sind hier nicht berechnet.", cite: "—" },
  ];
  return { asOf: DESG_AS_OF, zvE, joint: !!x.joint, tax, soli, total: Math.round((tax + soli) * 100) / 100, average: zvE ? r2((tax / zvE) * 100) : 0, marginal: r2(marginal), items };
}

// ── Germany: Kündigungsfrist ────────────────────────────────────────
export const DE_EMPLOYER_STEPS                                    = [[2, 1], [5, 2], [8, 3], [10, 4], [12, 5], [15, 6], [20, 7]];
export function deNoticePeriod(x                                                                                              ) {
  if (!ok(x.noticeDate)) return { asOf: DESG_AS_OF, end: null, rule: "", years: null, dates: []           , items: [{ tone: "warn"        , text: "Bitte das Datum angeben, an dem die Kündigung zugeht.", cite: "—" }] };
  const years = ok(x.startDate) && x.startDate  <= x.noticeDate ? fullYears(x.startDate , x.noticeDate) : null;
  let end        , rule        ;
  if (x.probation) { end = addDays(x.noticeDate, 14); rule = "Probezeit: 2 Wochen"; }
  else {
    const step = x.by === "employer" && years !== null ? [...DE_EMPLOYER_STEPS].reverse().find(([y]) => years >= y) : undefined;
    if (step) { end = monthEnd(addMonths(x.noticeDate, step[1])); rule = `${step[1]} Monat${step[1] > 1 ? "e" : ""} zum Monatsende (Beschäftigung ${step[0]} Jahre oder länger)`; }
    else {
      const earliest = addDays(x.noticeDate, 28);
      const [y, m, d] = parts(earliest);
      end = d <= 15 ? iso(y, m, 15) : monthEnd(earliest);
      rule = "4 Wochen zum 15. oder zum Monatsende";
    }
  }
  const items          = [
    { tone: "info", text: `${rule}. Letzter Tag des Arbeitsverhältnisses: ${end}.`, cite: "§ 622 BGB" },
    { tone: "info", text: "Die längeren Fristen nach Beschäftigungsdauer gelten für die Kündigung durch den Arbeitgeber. Für Arbeitnehmer darf keine längere Frist vereinbart werden als für den Arbeitgeber.", cite: "§ 622 Abs. 2, 6 BGB" },
    { tone: "warn", text: "Die Beschäftigungsdauer wird hier bis zum Tag des Zugangs gezählt. Arbeits- oder Tarifvertrag können andere Fristen vorsehen. Ob die Kündigung wirksam ist (Kündigungsschutzgesetz, Sonderkündigungsschutz), wird nicht geprüft.", cite: "—" },
  ];
  if (x.probation) items.push({ tone: "info", text: "Die 2-Wochen-Frist gilt während einer vereinbarten Probezeit von höchstens 6 Monaten.", cite: "§ 622 Abs. 3 BGB" });
  return { asOf: DESG_AS_OF, end, rule, years, dates: [{ id: "end", label: "Ende des Arbeitsverhältnisses", date: end, cite: "§ 622 BGB" }]           , items };
}

// ── Germany: Mindestlohn and Minijob ────────────────────────────────
export const DE_MIN_WAGE                                = [["2026-01-01", 13.9], ["2027-01-01", 14.6]];
export const DE_MINIJOB                                = [["2026-01-01", 603], ["2027-01-01", 633]];
const at = (t                    , d        ) => { const row = [...t].reverse().find(([f]) => d >= f); return row ? row[1] : null; };
export function deMinimumWage(x                                                          ) {
  const d = ok(x.date) ? x.date : DESG_AS_OF;
  const min = at(DE_MIN_WAGE, d), mini = at(DE_MINIJOB, d);
  const hourly = pos(x.hourly), hours = pos(x.monthlyHours);
  const below = min !== null && hourly > 0 && hourly < min;
  const maxMinijobHours = min && mini ? Math.floor((mini / min) * 100) / 100 : null;
  const items          = [];
  if (min === null) items.push({ tone: "warn", text: "Für Daten vor 2026 sind hier keine Werte hinterlegt.", cite: "—" });
  else {
    items.push({ tone: below ? "warn" : "info", text: below ? `${hourly.toFixed(2)} € liegt unter dem Mindestlohn von ${min.toFixed(2)} € brutto pro Stunde.` : `Mindestlohn: ${min.toFixed(2)} € brutto pro Stunde.`, cite: "bundesregierung.de" });
    items.push({ tone: "info", text: `Minijob-Grenze: ${mini} € im Monat. Beim Mindestlohn sind das höchstens ${maxMinijobHours} Stunden im Monat.`, cite: "bundesregierung.de" });
    items.push({ tone: "info", text: "Ab 1. Januar 2027: 14,60 € pro Stunde und Minijob-Grenze 633 €.", cite: "bundesregierung.de" });
  }
  return { asOf: DESG_AS_OF, minimumWage: min, minijobLimit: mini, belowMinimum: below, monthlyPay: r2(hourly * hours), overMinijob: mini !== null && hourly * hours > mini, maxMinijobHours, items };
}

// ── Germany: E-Rechnung ─────────────────────────────────────────────
export function deEInvoice(x                                           ) {
  const big = pos(x.turnover2026) > 800_000;
  const issue = big ? "2027-01-01" : "2028-01-01";
  const dates          = [
    { id: "receive", label: "E-Rechnungen empfangen können (alle inländischen Unternehmer)", date: "2025-01-01", cite: "IHK Stuttgart (15.10.2026)" },
    { id: "issue", label: big ? "E-Rechnungen ausstellen (Vorjahresumsatz über 800.000 €)" : "E-Rechnungen ausstellen (alle inländischen Unternehmen, B2B)", date: issue, cite: "IHK Stuttgart (15.10.2026)" },
  ];
  const items          = [
    { tone: "info", text: big ? "Mit mehr als 800.000 € Umsatz 2026 gilt die Pflicht zum Ausstellen ab 1. Januar 2027." : "Bis 800.000 € Umsatz 2026 gilt 2027 noch die Übergangsregel; ab 1. Januar 2028 müssen alle inländischen Unternehmen für B2B-Umsätze im Inland E-Rechnungen ausstellen.", cite: "IHK Stuttgart" },
    { tone: "good", text: "Ausgenommen: Kleinbetragsrechnungen (§ 33 UStDV, derzeit bis 250 €), Fahrausweise (§ 34 UStDV) und steuerfreie Umsätze nach § 4 Nr. 8 bis 29 UStG. Rechnungen an Endverbraucher (B2C) sind nicht erfasst.", cite: "IHK Stuttgart" },
    { tone: "warn", text: "Kleinunternehmer müssen keine E-Rechnungen ausstellen, aber empfangen können. Formate und Sanktionen werden hier nicht geprüft.", cite: "IHK Stuttgart" },
  ];
  return { asOf: DESG_AS_OF, issueFrom: issue, issuing: ok(x.today) ? x.today  >= issue : null, dates, items };
}

// ── Singapore: income tax (IRAS, YA 2024 onwards) ──────────────────
/** [upper bound of band, rate %]. */
export const SG_RESIDENT_BANDS                                 = [[20_000, 0], [30_000, 2], [40_000, 3.5], [80_000, 7], [120_000, 11.5], [160_000, 15], [200_000, 18], [240_000, 19], [280_000, 19.5], [320_000, 20], [500_000, 22], [1_000_000, 23], [Infinity, 24]];
export const SG_REBATE                                             = { 2024: [50, 200], 2025: [60, 200] };
export const sgResidentTax = (chargeable        ) => { const c = pos(chargeable); let t = 0, lo = 0; for (const [hi, r] of SG_RESIDENT_BANDS) { if (c > lo) t += (Math.min(c, hi) - lo) * r / 100; lo = hi; } return r2(t); };
export function sgIncomeTax(x                                                                                                               ) {
  const ya = Math.floor(Number(x.ya) || 2026);
  const items          = [];
  let tax        , marginal        ;
  if (x.resident) {
    const c = pos(x.chargeableIncome);
    tax = sgResidentTax(c);
    marginal = SG_RESIDENT_BANDS.find(([hi]) => c <= hi) [1];
    items.push({ tone: "info", text: `Resident rates from YA 2024: 0% on the first $20,000, rising to 24% above $1,000,000. Marginal rate here: ${marginal}%.`, cite: "IRAS individual income tax rates" });
  } else {
    const emp = pos(x.employmentIncome ?? x.chargeableIncome), other = pos(x.otherIncome);
    const flat = r2(emp * 0.15), prog = sgResidentTax(emp);
    const empTax = Math.max(flat, prog);
    tax = r2(empTax + other * 0.24);
    marginal = other > 0 ? 24 : flat >= prog ? 15 : SG_RESIDENT_BANDS.find(([hi]) => emp <= hi) [1];
    items.push({ tone: "info", text: "Non-resident: employment income is taxed at 15% or at resident rates, whichever gives more tax; other income such as director's fees at 24%.", cite: "IRAS individual income tax rates" });
  }
  const reb = x.resident ? SG_REBATE[ya] : undefined;
  const rebate = reb ? Math.min(r2(tax * reb[0] / 100), reb[1]) : 0;
  if (x.resident) items.push(reb ? { tone: "good", text: `YA ${ya} personal income tax rebate: ${reb[0]}% of tax, capped at $${reb[1]}.`, cite: "IRAS" } : { tone: "warn", text: `A rebate for YA ${ya} is not on the IRAS page we checked, so none is applied.`, cite: "—" });
  items.push({ tone: "warn", text: "Enter chargeable income (after expenses, donations and reliefs). Tax residence and reliefs are not worked out here.", cite: "—" });
  return { asOf: DESG_AS_OF, ya, resident: x.resident, tax, rebate, payable: r2(tax - rebate), marginal, items };
}

// ── Singapore: CPF contributions from 1 January 2026 ───────────────
export const SG_OW_CEILING = 8_000;
/** [max age, employer %, employee %] for wages above $750 a month. */
export const SG_CPF_2026                                             = [[55, 17, 20], [60, 16, 18], [65, 12.5, 12.5], [70, 9, 7.5], [Infinity, 7.5, 5]];
export function sgCpf(x                                      ) {
  const wage = pos(x.monthlyWage), age = pos(x.age);
  const band = SG_CPF_2026.find(([a]) => age <= a) ;
  const label = age <= 55 ? "55 and below" : age <= 60 ? "above 55 to 60" : age <= 65 ? "above 60 to 65" : age <= 70 ? "above 65 to 70" : "above 70";
  if (wage <= 750) return { asOf: DESG_AS_OF, computed: false, ageBand: label, employerRate: band[1], employeeRate: band[2], employer: null, employee: null, total: null, cappedWage: null, items: [{ tone: "warn"        , text: "For monthly wages of $750 or less, lower phased-in rates apply. They are not computed here.", cite: "cpf.gov.sg" }] };
  const base = Math.min(wage, SG_OW_CEILING);
  const employer = r2((base * band[1]) / 100), employee = r2((base * band[2]) / 100);
  const items          = [
    { tone: "info", text: `Age ${label}: employer ${band[1]}% and employee ${band[2]}% of ordinary wages (total ${band[1] + band[2]}%).`, cite: "CPF contribution rates from 1 January 2026" },
    { tone: "info", text: `Ordinary wages count up to the Ordinary Wage ceiling of $${SG_OW_CEILING.toLocaleString("en-SG")} a month from 1 January 2026${wage > SG_OW_CEILING ? "; wages above it are not counted" : ""}. The annual salary ceiling is $102,000.`, cite: "CPF changes in 2026" },
    { tone: "warn", text: "Amounts here are not rounded. CPF rounding rules, additional wages (bonuses) and the senior worker Transition Offset are not applied.", cite: "—" },
  ];
  if (age > 55 && age <= 65) items.push({ tone: "info", text: "From 1 January 2026 rates for ages above 55 to 65 rose by 1.5 points (employer +0.5, employee +1).", cite: "cpf.gov.sg" });
  return { asOf: DESG_AS_OF, computed: true, ageBand: label, employerRate: band[1], employeeRate: band[2], cappedWage: base, employer, employee, total: r2(employer + employee), takeHomeAfterCpf: r2(wage - employee), items };
}

// ── Singapore: notice period ────────────────────────────────────────
export const SG_NOTICE                                                           = [[26, 1, "1 day"], [104, 7, "1 week"], [260, 14, "2 weeks"], [Infinity, 28, "4 weeks"]];
export function sgNotice(x                                                                  ) {
  if (!ok(x.startDate) || !ok(x.noticeDate) || x.noticeDate < x.startDate) return { asOf: DESG_AS_OF, lastDay: null, days: null, rule: "", dates: []           , items: [{ tone: "warn"        , text: "Enter the start date and the date notice is given.", cite: "—" }] };
  const years = fullYears(x.startDate, x.noticeDate);
  const weeks = (Date.parse(x.noticeDate) - Date.parse(x.startDate)) / 86_400_000 / 7;
  const contract = pos(x.contractDays);
  let days        , rule        ;
  if (contract > 0) { days = Math.floor(contract); rule = `Notice period in the contract: ${days} days`; }
  else {
    const row = years >= 5 ? SG_NOTICE[3] : years >= 2 ? SG_NOTICE[2] : weeks >= 26 ? SG_NOTICE[1] : SG_NOTICE[0];
    days = row[1]; rule = `No period in the contract: ${row[2]} for this length of service`;
  }
  const last = addDays(x.noticeDate, days - 1);
  const items          = [
    { tone: "info", text: `${rule}. The notice period includes the day notice is given, public holidays, rest days and non-working days, so the last day is ${last}.`, cite: "MOM termination with notice" },
    { tone: "info", text: "Notice must be in writing. The period is the same for employer and employee. Either side can pay salary in lieu of notice instead; CPF is not payable on salary in lieu.", cite: "MOM" },
    { tone: "warn", text: "Notice can be waived by mutual agreement, preferably in writing. Whether a dismissal is wrongful is not checked here.", cite: "MOM" },
  ];
  return { asOf: DESG_AS_OF, lastDay: last, days, rule, dates: [{ id: "last", label: "Last day of the notice period", date: last, cite: "MOM" }]           , items };
}

export const DESG_HELP = { de: "Finanzamt, Arbeitsgericht-Rechtsantragstelle oder Gewerkschaft", sg: "IRAS, CPF Board and MOM / TADM" }         ;
