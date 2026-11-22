// GENERATED from tools-oiyo src/lib/world-take-home-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// Take-home pay for employees in five places (2026-11-22, world audience gap A1: everyday side).
// UK and US are new here; JP, FR and ES reuse the libraries behind the existing salary pages, so the numbers match them.
// Facts: /mnt/project-files/notes/take-home-pay-facts-2026-11-22.md. General information and estimates only: not tax advice.
// Not computed (not verified): UK pension or salary sacrifice, other tax codes, benefits in kind; US state and local tax,
// pre-tax deductions, credits, W-4 withholding tables.
import { UK_2026, ukIncomeTax } from "./uk-tax-pack-2026.mjs";
import { STANDARD_DEDUCTION_2026, SS_WAGE_BASE_2026, usIncomeTax,             } from "./us-tax-pack-2026.mjs";
import { jpSalary } from "./japan-salary.mjs";
import { frSalary } from "./france-salary.mjs";
import { esSalary } from "./spain-salary.mjs";

export const TAKE_HOME_AS_OF = "2026-11-22";
                                                                                   
const pos = (n         ) => Math.max(0, Number(n) || 0);
const r2 = (n        ) => Math.round(n * 100) / 100;

// ── UK 2026-27 (gov.uk Rates and thresholds for employers 2026 to 2027) ──
export const UK_NI_2026 = { pt: 12_570, uel: 50_270, main: 0.08, upper: 0.02 }         ;
export const UK_STUDENT_LOAN_2026 = { plan1: [26_900, 0.09], plan2: [29_385, 0.09], plan4: [33_795, 0.09], plan5: [25_000, 0.09], pg: [21_000, 0.06] }         ;
                                                       
/** Scottish bands on taxable income (after the personal allowance): [upper bound, rate]. */
export const SCOT_BANDS_2026                     = [[3_967, 0.19], [16_956, 0.2], [31_092, 0.21], [62_430, 0.42], [125_140, 0.45], [Infinity, 0.48]];

export function ukScottishTax(total        ) {
  const t = pos(total);
  const pa = Math.max(0, UK_2026.personalAllowance - Math.max(0, Math.floor((t - UK_2026.taperFrom) / 2)));
  const taxable = Math.max(0, t - pa);
  let tax = 0, lo = 0;
  for (const [hi, r] of SCOT_BANDS_2026) { if (taxable > lo) tax += (Math.min(taxable, hi) - lo) * r; lo = hi; }
  return { personalAllowance: pa, taxable, tax: r2(tax) };
}

export function ukTakeHome(x                                                          ) {
  const gross = pos(x.annual);
  const it = x.scotland ? ukScottishTax(gross) : ukIncomeTax(gross);
  const ni = r2(Math.max(0, Math.min(gross, UK_NI_2026.uel) - UK_NI_2026.pt) * UK_NI_2026.main + Math.max(0, gross - UK_NI_2026.uel) * UK_NI_2026.upper);
  const loans = [...new Set((x.loans ?? []).filter((l) => l in UK_STUDENT_LOAN_2026))];
  const loanLines = loans.map((l) => { const [th, rate] = UK_STUDENT_LOAN_2026[l]; return { plan: l, amount: r2(Math.max(0, gross - th) * rate) }; });
  const loan = r2(loanLines.reduce((a, b) => a + b.amount, 0));
  const net = r2(gross - it.tax - ni - loan);
  const items          = [
    { tone: "info", text: `${x.scotland ? "Scottish" : "England, Wales and Northern Ireland"} Income Tax 2026-27: personal allowance £${it.personalAllowance.toLocaleString("en-GB")}, tax about £${it.tax.toLocaleString("en-GB")}.`, cite: "gov.uk Rates and thresholds for employers 2026 to 2027" },
    { tone: "info", text: "Employee Class 1 National Insurance (category A): 8% between £12,570 and £50,270 a year, 2% above.", cite: "gov.uk Rates and thresholds for employers 2026 to 2027" },
    { tone: "warn", text: "Worked out for the whole tax year at one even rate. Pension contributions, salary sacrifice, other tax codes and benefits in kind are not included.", cite: "—" },
  ];
  if (gross > UK_2026.taperFrom) items.push({ tone: "warn", text: "Pay over £100,000: the personal allowance falls by £1 for every £2, and is nil from £125,140.", cite: "gov.uk Income Tax rates and Personal Allowances" });
  return { asOf: TAKE_HOME_AS_OF, currency: "GBP", gross, incomeTax: it.tax, ni, loan, loanLines, net, monthlyNet: r2(net / 12), items };
}

// ── US 2026 federal (IRS Topic 751; IR-2025-103) ──
export const US_FICA_2026 = { ss: 0.062, medicare: 0.0145, addl: 0.009, addlFrom: 200_000 }         ;

export function usTakeHome(x                                     ) {
  const gross = pos(x.annual);
  const filing         = x.filing === "mfj" ? "mfj" : "single";
  const taxable = Math.max(0, gross - STANDARD_DEDUCTION_2026[filing]);
  const fedTax = usIncomeTax(taxable, filing);
  const ss = r2(Math.min(gross, SS_WAGE_BASE_2026) * US_FICA_2026.ss);
  const medicare = r2(gross * US_FICA_2026.medicare);
  const addl = r2(Math.max(0, gross - US_FICA_2026.addlFrom) * US_FICA_2026.addl);
  const net = r2(gross - fedTax - ss - medicare - addl);
  const items          = [
    { tone: "info", text: `Federal income tax 2026 with the standard deduction ($${STANDARD_DEDUCTION_2026[filing].toLocaleString("en-US")}, ${filing === "mfj" ? "married filing jointly" : "single"}): about $${fedTax.toLocaleString("en-US")}.`, cite: "IR-2025-103" },
    { tone: "info", text: "Employee FICA: Social Security 6.2% up to $184,500, Medicare 1.45%, and 0.9% Additional Medicare withheld on wages over $200,000.", cite: "IRS Topic 751" },
    { tone: "warn", text: "State and local income tax, 401(k) and other pre-tax deductions, credits and the W-4 withholding tables are not included. This is the year's tax, not what each paycheck withholds.", cite: "—" },
  ];
  if (filing === "mfj" && gross > US_FICA_2026.addlFrom) items.push({ tone: "warn", text: "Married filing jointly: the Additional Medicare withheld may differ from what you finally owe on your return.", cite: "IRS Topic 751" });
  return { asOf: TAKE_HOME_AS_OF, currency: "USD", gross, filing, federalTax: fedTax, socialSecurity: ss, medicare, additionalMedicare: addl, net, monthlyNet: r2(net / 12), items };
}

// ── JP / FR / ES: same code as the existing salary pages ──
export function jpTakeHome(x                                                          ) {
  const r = jpSalary({ salary: pos(x.annual), age40: !!x.age40, health: Number(x.healthRate) > 0 ? Number(x.healthRate) : 0.0985 });
  return { asOf: TAKE_HOME_AS_OF, currency: "JPY", gross: pos(x.annual), monthlyGross: r.gross, socialMonthly: r.socialMonthly, incomeTaxMonthly: r.itaxM, residentTaxMonthly: r.rtaxM, monthlyNet: r.net, net: r.annualNet,
    items: [{ tone: "info", text: "令和8年分の概算: 協会けんぽ東京 9.85%（変更可）、厚生年金 9.15%、雇用保険 0.5%、子ども・子育て支援金、所得税（復興特別所得税込み）と住民税 10%＋均等割。", cite: "japan-salary（tools.oiyo.net/ja/japan-salary-calculator）" },
      { tone: "warn", text: "標準報酬月額は月額で近似、賞与・扶養・各種控除は含みません。住民税は前年所得で決まるため、実際の天引きとずれます。", cite: "—" }]            };
}
export function frTakeHome(x                                    ) {
  const r = frSalary({ gross: pos(x.annual), parts: Number(x.parts) >= 1 ? Number(x.parts) : 1 });
  return { asOf: TAKE_HOME_AS_OF, currency: "EUR", gross: pos(x.annual), cotisations: r.total, netBeforeIR: r.netBeforeIR, impotRevenu: r.ir, net: r.annualNet, monthlyNet: r.monthlyNet,
    items: [{ tone: "info", text: "Cotisations salariales simplifiées 2026 (PASS 48 060 €), CSG/CRDS 9,7 %, impôt sur le revenu au barème LF 2026 avec quotient familial.", cite: "france-salary (tools.oiyo.net/fr/france-salary-calculator)" },
      { tone: "warn", text: "Estimation : complémentaire santé, prévoyance, plafonnement du quotient familial et prélèvement à la source au taux personnalisé non pris en compte.", cite: "—" }]            };
}
export function esTakeHome(x                                                        ) {
  const r = esSalary({ gross: pos(x.annual), children: Math.floor(pos(x.children)), pagas: x.pagas === 14 ? 14 : 12 });
  return { asOf: TAKE_HOME_AS_OF, currency: "EUR", gross: pos(x.annual), seguridadSocial: r.total, irpf: r.irpf, net: r.annualNet, perPaga: r.perPaga, pagas: r.pagas,
    items: [{ tone: "info", text: "Cotizaciones del trabajador 2026 (base máxima 5.101,20 €/mes, MEI y solidaridad) e IRPF con escala estatal y autonómica supletoria.", cite: "spain-salary (tools.oiyo.net/es/spain-salary-calculator)" },
      { tone: "warn", text: "Estimación: la escala de cada comunidad autónoma y la retención real de la nómina pueden ser distintas.", cite: "—" }]            };
}
