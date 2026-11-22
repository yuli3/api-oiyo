// GENERATED from tools-oiyo src/lib/world-employer-cost-pack-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// Employer-side payroll cost (2026-11-22, world pro-gap #5): JP, UK, US (federal), ES.
// General information only: not payroll advice, no filing. Estimates use the salary given; grade rounding, caps not listed and local rates can change the figure.
// Facts: /mnt/project-files/notes/employer-cost-facts-2026-11-22.md (協会けんぽ 令和8年度, 厚労省 雇用保険料率 令和8年度, 日本年金機構,
// HMRC rates and thresholds 2026 to 2027, SSA contribution and benefit base, IRS Topic 751, BOE Orden PJC/297/2026).
// Not computed because not verified: JP 子ども・子育て支援金 split, 健保 標準報酬 cap, 労災; US FUTA/SUTA; ES desempleo, FOGASA, FP, MEI, AT/EP; TW, FR, CN.

export const EMPLOYER_AS_OF = "2026-11-22";
                                            
                                                               
                                                                                              

const pos = (n         ) => Math.max(0, Number(n) || 0);
const r0 = (n        ) => Math.round(n);
const r2 = (n        ) => Math.round(n * 100) / 100;
const sum = (l         ) => l.reduce((a, b) => a + b.amount, 0);

// ── Japan (monthly, yen) ────────────────────────────────────────────
export const JP_HEALTH_TOKYO = 9.85;
export const JP_HEALTH_RANGE = { min: 9.21, max: 10.55 };
export const JP_CARE = 1.62;
export const JP_PENSION = 18.3;
export const JP_PENSION_GRADE = { min: 88_000, max: 650_000 };
export const JP_CHILD_LEVY = 0.36;
export const JP_EMPLOYMENT = { general: 8.5, agri: 9.5, construction: 10.5 }         ;
export const JP_EMPLOYMENT_WORKER = { general: 5, agri: 6, construction: 6 }         ;
                                                    

export function jpEmployerCost(x                                                                               ) {
  const pay = pos(x.monthly);
  const ind             = x.industry && x.industry in JP_EMPLOYMENT ? x.industry : "general";
  const hr = x.healthRate && x.healthRate >= JP_HEALTH_RANGE.min - 1 && x.healthRate <= JP_HEALTH_RANGE.max + 1 ? x.healthRate : JP_HEALTH_TOKYO;
  const care = (x.age ?? 30) >= 40 && (x.age ?? 30) <= 64;
  const pBase = Math.min(Math.max(pay, JP_PENSION_GRADE.min), JP_PENSION_GRADE.max);
  const lines          = [
    { id: "health", label: "健康保険（事業主負担・半分）", amount: r0((pay * hr) / 100 / 2), rate: `${hr}% ÷ 2`, cite: "協会けんぽ 令和8年度保険料率" },
    ...(care ? [{ id: "care", label: "介護保険（40〜64歳・半分）", amount: r0((pay * JP_CARE) / 100 / 2), rate: `${JP_CARE}% ÷ 2`, cite: "協会けんぽ 令和8年度保険料率" }] : []),
    { id: "pension", label: "厚生年金（事業主負担・半分）", amount: r0((pBase * JP_PENSION) / 100 / 2), rate: `${JP_PENSION}% ÷ 2`, cite: "日本年金機構 厚生年金保険の保険料" },
    { id: "child", label: "子ども・子育て拠出金（事業主のみ）", amount: r0((pBase * JP_CHILD_LEVY) / 100), rate: `${JP_CHILD_LEVY}%`, cite: "日本年金機構 保険料額表（令和8年10月分〜）" },
    { id: "employment", label: "雇用保険（事業主負担）", amount: r0((pay * JP_EMPLOYMENT[ind]) / 1000), rate: `${JP_EMPLOYMENT[ind]}/1000`, cite: "厚生労働省 令和8年度 雇用保険料率" },
  ];
  const employer = sum(lines);
  const items          = [
    { tone: "info", text: `月給をそのまま標準報酬月額とみなした概算です。実際は等級表で丸めます。厚生年金は${JP_PENSION_GRADE.min.toLocaleString("ja-JP")}円〜${JP_PENSION_GRADE.max.toLocaleString("ja-JP")}円の範囲で計算しています。`, cite: "日本年金機構" },
    { tone: "warn", text: "子ども・子育て支援金（0.23%、令和8年4月分から）の労使の分け方、健康保険の標準報酬の上限、労災保険料（業種別）は確認できていないので含めていません。", cite: "協会けんぽ" },
    { tone: "warn", text: "令和8年10月分からの保険料額表には、最初の24か月に事業主負担を増やす保険料調整制度の欄があります。対象や条件は確認していないので反映していません。", cite: "日本年金機構 保険料額表" },
  ];
  return { asOf: EMPLOYER_AS_OF, currency: "JPY", pay, employer, total: pay + employer, ratio: pay ? r2((employer / pay) * 100) : 0, lines, items, worker: { employment: r0((pay * JP_EMPLOYMENT_WORKER[ind]) / 1000) } };
}

// ── UK (annual, £) ──────────────────────────────────────────────────
export const UK_ER_RATE = 15;
export const UK_ST = 5_000;
export const UK_UST = 50_270;
export const UK_EMPLOYMENT_ALLOWANCE = 10_500;
export const UK_LEVY = { rate: 0.5, allowance: 15_000 };
                                                          
export const ukNicPerEmployee = (annual        , cat        = "standard") => r2((Math.max(0, pos(annual) - (cat === "standard" ? UK_ST : UK_UST)) * UK_ER_RATE) / 100);

export function ukEmployerCost(x                                                                               ) {
  const pay = pos(x.annual);
  const n = Math.max(1, Math.floor(pos(x.employees) || 1));
  const cat        = x.category ?? "standard";
  const nicEach = ukNicPerEmployee(pay, cat);
  const nicAll = r2(nicEach * n);
  const allowance = x.allowance ? Math.min(nicAll, UK_EMPLOYMENT_ALLOWANCE) : 0;
  const paybill = pay * n;
  const levy = r2(Math.max(0, (paybill * UK_LEVY.rate) / 100 - UK_LEVY.allowance));
  const lines          = [
    { id: "nic", label: `Employer Class 1 NICs (${n} × ${cat === "standard" ? "above £5,000" : "above £50,270"})`, amount: nicAll, rate: `${UK_ER_RATE}%`, cite: "HMRC rates and thresholds 2026 to 2027" },
    ...(allowance ? [{ id: "ea", label: "Employment Allowance", amount: -allowance, rate: `up to £${UK_EMPLOYMENT_ALLOWANCE.toLocaleString("en-GB")}`, cite: "HMRC rates and thresholds 2026 to 2027" }] : []),
    { id: "levy", label: "Apprenticeship Levy (pay bill × 0.5% − £15,000)", amount: levy, rate: "0.5%", cite: "HMRC rates and thresholds 2026 to 2027" },
  ];
  const employer = r2(sum(lines));
  const items          = [
    { tone: "info", text: cat === "standard" ? "Employer NICs are 15% of pay above the £5,000 secondary threshold (£96 a week, £417 a month)." : "For employees under 21 or apprentices under 25 the employer rate is 0% up to £50,270 and 15% above it.", cite: "HMRC rates and thresholds 2026 to 2027" },
    { tone: "warn", text: "Who can claim the Employment Allowance has conditions that are not checked here. Workplace pension contributions and Class 1A on benefits in kind are not included.", cite: "HMRC" },
  ];
  return { asOf: EMPLOYER_AS_OF, currency: "GBP", pay, employees: n, employer, perEmployee: r2(employer / n), total: r2(paybill + employer), ratio: paybill ? r2((employer / paybill) * 100) : 0, lines, items };
}

// ── US federal (annual, $) ──────────────────────────────────────────
export const US_WAGE_BASE_2026 = 184_500;
export const US_OASDI = 6.2;
export const US_HI = 1.45;
export const usFicaEmployer = (annual        ) => r2((Math.min(pos(annual), US_WAGE_BASE_2026) * US_OASDI) / 100 + (pos(annual) * US_HI) / 100);

export function usEmployerCost(x                    ) {
  const pay = pos(x.annual);
  const lines          = [
    { id: "oasdi", label: `Social Security (up to $${US_WAGE_BASE_2026.toLocaleString("en-US")})`, amount: r2((Math.min(pay, US_WAGE_BASE_2026) * US_OASDI) / 100), rate: `${US_OASDI}%`, cite: "IRS Topic 751; SSA contribution and benefit base" },
    { id: "hi", label: "Medicare (no cap)", amount: r2((pay * US_HI) / 100), rate: `${US_HI}%`, cite: "IRS Topic 751" },
  ];
  const employer = r2(sum(lines));
  const items          = [
    { tone: "info", text: pay > US_WAGE_BASE_2026 ? `Pay above $${US_WAGE_BASE_2026.toLocaleString("en-US")} has no more Social Security tax in 2026; Medicare continues.` : "Social Security is 6.2% and Medicare 1.45% of wages for the employer, matching the employee share.", cite: "IRS Topic 751" },
    { tone: "info", text: "Additional Medicare Tax (0.9% over $200,000) is withheld from the employee only. There is no employer match.", cite: "IRS Topic 751" },
    { tone: "warn", text: "Federal unemployment tax (FUTA), state unemployment insurance and workers' compensation are not included.", cite: "—" },
  ];
  return { asOf: EMPLOYER_AS_OF, currency: "USD", pay, employer, total: r2(pay + employer), ratio: pay ? r2((employer / pay) * 100) : 0, lines, items };
}

// ── Spain (monthly, €) ──────────────────────────────────────────────
export const ES_CC_EMPRESA = 23.6;
export const ES_BASE_MAX = 5_101.2;
export const ES_BASE_MIN = { 1: 1_989.3, 2: 1_649.7, 3: 1_435.2, 4: 1_424.4 }         ;
                                    

export function esEmployerCost(x                                      ) {
  const pay = pos(x.monthly);
  const g          = x.group && x.group in ES_BASE_MIN ? x.group : 4;
  const base = Math.min(Math.max(pay, ES_BASE_MIN[g]), ES_BASE_MAX);
  const lines          = [
    { id: "cc", label: "Contingencias comunes (empresa)", amount: r2((base * ES_CC_EMPRESA) / 100), rate: `${ES_CC_EMPRESA}%`, cite: "Orden PJC/297/2026, art. 4" },
  ];
  const employer = r2(sum(lines));
  const items          = [
    { tone: "info", text: `Base de cotización usada: ${base.toLocaleString("es-ES", { minimumFractionDigits: 2 })} € (entre la mínima del grupo ${g === 4 ? "4 a 7" : g} y la máxima de 5.101,20 €).`, cite: "Orden PJC/297/2026, art. 3" },
    { tone: "warn", text: "Solo incluye contingencias comunes. Desempleo, FOGASA, formación profesional, MEI y accidentes de trabajo no están verificados aquí y no se suman, así que el coste real es mayor.", cite: "—" },
  ];
  return { asOf: EMPLOYER_AS_OF, currency: "EUR", pay, base, employer, total: r2(pay + employer), ratio: pay ? r2((employer / pay) * 100) : 0, lines, items };
}

export const EMPLOYER_HELP = { jp: "年金事務所・協会けんぽ支部", uk: "HMRC employer helpline", us: "IRS", es: "Tesorería General de la Seguridad Social" }         ;
