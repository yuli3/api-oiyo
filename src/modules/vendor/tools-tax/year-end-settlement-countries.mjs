// GENERATED from tools-oiyo src/lib/year-end-settlement-countries.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// Settling a year's income tax on salary, for the non-Korean pages of the year-end settlement calculator.
// Each locale page uses its own country's procedure (세운 2026-10-19). Checked 2026-10-19:
// - Japan 年末調整 (所得税法 第190条): 令和8年分. 給与所得控除 最低74万円, 基礎控除 本則62万円＋特例
//   (合計所得489万円以下 104万円, 655万円以下 67万円), as in JapanSalaryCalculator. 年調年税額 =
//   (算出所得税額 − 住宅借入金等特別控除) × 102.1%, 100円未満切捨て. 生命保険料控除 (新制度):
//   各区分 2万円以下全額, 4万円以下 ×1/2+1万, 8万円以下 ×1/4+2万, 超 4万; 3区分合計 12万円 (所得税法 第76条).
//   配偶者控除 38万円 (本人の合計所得900万円以下), 一般扶養 38万円, 特定扶養 (19〜22歳) 63万円.
//   給与所得控除は年末調整では別表第五 (4千円刻み) で求めるが、ここでは算式で近似.
//   Sources: 国税庁 タックスアンサー No.1199, 1140, 1410, 2260, 2675; 令和8年分 年末調整のしかた.
// - China 个人所得税综合所得年度汇算 (个人所得税法 第2条・第6条・第11条): 年收入 − 60,000 − 专项扣除 (三险一金)
//   − 专项附加扣除 − 其他扣除, 按年度税率表 3%–45%. 专项附加扣除 (国发〔2023〕13号, 2026年未调整):
//   子女教育、3岁以下婴幼儿照护 每孩每月2,000元; 赡养老人 每月3,000元 (非独生子女分摊, 每人不超过1,500元);
//   住房租金 每月1,500/1,100/800元; 住房贷款利息 每月1,000元 (与租金二选一); 继续教育 每月400元或当年
//   3,600元; 大病医疗 超过15,000元部分, 限额80,000元. 应退(补)税额 = 已预缴税额 − 应纳税额.
//   Sources: chinatax.gov.cn 个人所得税专项附加扣除, yicai.com/news/102935159.html (2026 确认).
// - France: no year-end settlement. Prélèvement à la source is regularised in the summer after the
//   déclaration (CGI art. 204 A ff.). Barème 2026 sur revenus 2025: 0% ≤ 11 600, 11% ≤ 29 579, 30% ≤ 84 577,
//   41% ≤ 181 917, 45% au-delà; plafonnement du quotient familial 1 807 € par demi-part; décote 897 € (seul)
//   / 1 483 € (couple) − 45.25% de l'impôt; abattement 10% salaires min 509 €, max 14 555 €.
//   Sources: BOI-IR-LIQ-20-10 (actualité BOFiP 2026-04-07) via legifiscal.fr, weblex.fr (déduction 10%).
//   Parent isolé (case T), réductions et crédits d'impôt not modelled.
// - Spain declaración de la renta 2026: escala general estatal + autonómica supletoria (19/24/30/37/45/47%),
//   mínimo personal 5.550 € (6.700 € desde 65 años), mínimo por descendientes 2.400/2.700/4.000/4.500 €,
//   reducción por rendimientos del trabajo hasta 7.302 €, otros gastos 2.000 €, aportaciones a planes de
//   pensiones hasta 1.500 €. Resultado = cuota − retenciones. Real autonomic scales and deductions vary.
//   Sources: guiafiscal.es/irpf/tramos-irpf-2026/, LIRPF art. 19, 20, 51, 56–58, 63, 74. Same scale as
//   SpainSalaryCalculator.

                                                       

export const YEAR_END_AS_OF = "2026-10-19";

const floorTo = (n        , unit        ) => Math.floor(n / unit) * unit;
const r2 = (n        ) => Math.round(n * 100) / 100;

/** [upper bound of the band, marginal rate]. */
export function bandTax(base        , bands                    )         {
  let tax = 0;
  let lower = 0;
  for (const [upper, rate] of bands) {
    if (base <= lower) break;
    tax += (Math.min(base, upper) - lower) * rate;
    lower = upper;
  }
  return tax;
}

// ── Japan ────────────────────────────────────────────────────────────────

export function jpEmploymentDeduction(salary        ) {
  if (salary <= 2_200_000) return Math.min(salary, 740_000);
  if (salary <= 3_600_000) return Math.floor(salary * 0.3 + 80_000);
  if (salary <= 6_600_000) return Math.floor(salary * 0.2 + 440_000);
  if (salary <= 8_500_000) return Math.floor(salary * 0.1 + 1_100_000);
  return 1_950_000;
}

export function jpBasicDeduction(totalIncome        ) {
  if (totalIncome <= 4_890_000) return 1_040_000;
  if (totalIncome <= 6_550_000) return 670_000;
  if (totalIncome <= 23_500_000) return 620_000;
  if (totalIncome <= 24_000_000) return 480_000;
  if (totalIncome <= 24_500_000) return 320_000;
  if (totalIncome <= 25_000_000) return 160_000;
  return 0;
}

/** 新制度の1区分 (一般・介護医療・個人年金) の控除額. */
export function jpLifeInsuranceDeduction(premium        ) {
  if (premium <= 20_000) return Math.max(0, premium);
  if (premium <= 40_000) return Math.ceil(premium / 2 + 10_000);
  if (premium <= 80_000) return Math.ceil(premium / 4 + 20_000);
  return 40_000;
}

/** 所得税の速算表 (復興特別所得税を含まない). */
export function jpIncomeTax(taxable        ) {
  if (taxable <= 0) return 0;
  if (taxable <= 1_950_000) return Math.floor(taxable * 0.05);
  if (taxable <= 3_300_000) return Math.floor(taxable * 0.1 - 97_500);
  if (taxable <= 6_950_000) return Math.floor(taxable * 0.2 - 427_500);
  if (taxable <= 9_000_000) return Math.floor(taxable * 0.23 - 636_000);
  if (taxable <= 18_000_000) return Math.floor(taxable * 0.33 - 1_536_000);
  if (taxable <= 40_000_000) return Math.floor(taxable * 0.4 - 2_796_000);
  return Math.floor(taxable * 0.45 - 4_796_000);
}

                                    
                 
                           
                   
                          
                                
                                         
                  
                     
                             
                                           
                            
 

export function japanYearEnd(i                   ) {
  const employmentIncome = Math.max(0, i.salary - jpEmploymentDeduction(i.salary));
  const basic = jpBasicDeduction(employmentIncome);
  const life = Math.min(120_000, i.lifePremiums.reduce((s, p) => s + jpLifeInsuranceDeduction(p), 0));
  const spouse = i.spouse && employmentIncome <= 9_000_000 ? 380_000 : 0;
  const dependents = Math.max(0, i.dependents) * 380_000 + Math.max(0, i.specificDependents) * 630_000;
  const deductions = i.socialInsurance + life + basic + spouse + dependents;
  const taxable = floorTo(Math.max(0, employmentIncome - deductions), 1000);
  const computed = jpIncomeTax(taxable);
  const loanCredit = Math.min(computed, Math.max(0, i.housingLoanCredit));
  const annualTax = floorTo((computed - loanCredit) * 1.021, 100);
  return { employmentIncome, basic, life, spouse, dependents, deductions, taxable, computed, loanCredit, annualTax, refund: i.withheld - annualTax };
}

// ── China ────────────────────────────────────────────────────────────────

/** 综合所得年度税率表: [上限, 税率, 速算扣除数]. */
export const CN_ANNUAL_BRACKETS                             = [
  [36_000, 0.03, 0],
  [144_000, 0.1, 2_520],
  [300_000, 0.2, 16_920],
  [420_000, 0.25, 31_920],
  [660_000, 0.3, 52_920],
  [960_000, 0.35, 85_920],
  [Infinity, 0.45, 181_920],
];

                                                             

                                    
                                                 
                 
                  
                          
                                           
                   
                                                 
                         
                      
                    
                                      
                              
                                             
                  
                          
                
                  
 

export function chinaAnnualTax(taxable        ) {
  if (taxable <= 0) return 0;
  const [, rate, quick] = CN_ANNUAL_BRACKETS.find(([upper]) => taxable <= upper) ?? CN_ANNUAL_BRACKETS[CN_ANNUAL_BRACKETS.length - 1];
  return r2(taxable * rate - quick);
}

export function chinaYearEnd(i                   ) {
  const housing = i.mortgage ? 12_000 : i.rent === "none" ? 0 : Number(i.rent) * 12;
  const special =
    Math.max(0, i.children) * 24_000 +
    Math.min(3_000, Math.max(0, i.elderlyMonthly)) * 12 +
    housing +
    Math.max(0, i.continuingEducation) +
    Math.min(80_000, Math.max(0, i.medical));
  const taxable = Math.max(0, i.income - 60_000 - i.socialInsurance - special - i.other);
  const due = chinaAnnualTax(taxable);
  return { special, housing, taxable, due, refund: r2(i.prepaid - due) };
}

// ── France ───────────────────────────────────────────────────────────────

export const FR_BAREME_2026                     = [
  [11_600, 0],
  [29_579, 0.11],
  [84_577, 0.3],
  [181_917, 0.41],
  [Infinity, 0.45],
];
export const FR_QF_CEILING_PER_HALF = 1_807;

export function franceParts(couple         , children        ) {
  const n = Math.max(0, Math.floor(children));
  return (couple ? 2 : 1) + Math.min(n, 2) * 0.5 + Math.max(0, n - 2);
}

                                     
                                                                    
                     
                  
                   
                                                      
                   
 

/** Abattement de 10 % pour frais professionnels (min 509 €, max 14 555 € par salarié). */
export function franceSalaryAbattement(netTaxable        , earners = 1) {
  // The 10% minimum and maximum apply per earner; a couple is treated as one combined amount here.
  return Math.min(netTaxable, Math.max(509, Math.min(14_555 * earners, Math.round(netTaxable * 0.1))));
}

/** Impôt sur le revenu net imposable du foyer: barème 2026, quotient familial plafonné, décote. */
export function franceIncomeTax(revenu        , couple         , children        ) {
  const parts = franceParts(couple, children);
  const baseParts = couple ? 2 : 1;
  const taxWith = (p        ) => bandTax(Math.max(0, revenu) / p, FR_BAREME_2026) * p;
  const full = taxWith(parts);
  const base = taxWith(baseParts);
  const extraHalves = (parts - baseParts) * 2;
  const brut = Math.max(full, base - extraHalves * FR_QF_CEILING_PER_HALF);
  const capped = brut > full;
  const [ceiling, decoteBase] = couple ? [3_277, 1_483] : [1_982, 897];
  const decote = brut > 0 && brut < ceiling ? Math.min(brut, decoteBase - 0.4525 * brut) : 0;
  const impot = Math.max(0, Math.round(brut - Math.max(0, decote)));
  return { parts, brut: Math.round(brut), capped, decote: Math.round(Math.max(0, decote)), impot };
}

export function franceYearEnd(i                    ) {
  const abattement = franceSalaryAbattement(i.netTaxable, i.couple ? 2 : 1);
  const revenu = Math.max(0, i.netTaxable - abattement);
  const t = franceIncomeTax(revenu, i.couple, i.children);
  return { abattement, revenu, ...t, balance: Math.round(i.withheld - t.impot) };
}

// ── Spain ────────────────────────────────────────────────────────────────

/** Escala general estatal + autonómica supletoria (igual a la estatal), 2026. */
export const ES_GENERAL_BANDS                     = [
  [12_450, 0.19],
  [20_200, 0.24],
  [35_200, 0.3],
  [60_000, 0.37],
  [300_000, 0.45],
  [Infinity, 0.47],
];

const ES_DESCENDANT_MINIMUM = [2_400, 2_700, 4_000, 4_500];

                                    
                      
                         
                   
                   
                  
                                                                          
                      
 

export function spainWorkReduction(netWork        ) {
  if (netWork <= 14_852) return 7_302;
  if (netWork <= 17_673.52) return 7_302 - 1.75 * (netWork - 14_852);
  if (netWork <= 19_747.5) return 2_364.34 - 1.14 * (netWork - 17_673.52);
  return 0;
}

/** Mínimo personal (5.550 €, 6.700 € desde 65 años) + mínimo por descendientes. */
export function spainPersonalMinimum(children        , over65         ) {
  let minimo = over65 ? 6_700 : 5_550;
  for (let k = 0; k < Math.max(0, Math.floor(children)); k++) minimo += ES_DESCENDANT_MINIMUM[Math.min(k, 3)];
  return minimo;
}

/** Cuota íntegra general: escala sobre la base menos escala sobre el mínimo personal y familiar. */
export function spainGeneralQuota(base        , minimo        ) {
  return r2(Math.max(0, bandTax(base, ES_GENERAL_BANDS) - bandTax(Math.min(minimo, base), ES_GENERAL_BANDS)));
}

export function spainYearEnd(i                   ) {
  const netWork = Math.max(0, i.grossSalary - i.socialSecurity - 2_000);
  const reduction = Math.min(netWork, Math.max(0, spainWorkReduction(Math.max(0, i.grossSalary - i.socialSecurity))));
  const pension = Math.min(1_500, Math.max(0, i.pensionPlan));
  const base = Math.max(0, netWork - reduction - pension);
  const minimo = spainPersonalMinimum(i.children, i.over65);
  const cuota = spainGeneralQuota(base, minimo);
  return { netWork, reduction: r2(reduction), pension, base: r2(base), minimo, cuota, result: r2(cuota - i.withheld) };
}
