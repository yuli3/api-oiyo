// GENERATED from tools-oiyo src/lib/pension-countries.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// Private-pension tax relief, for the non-Korean pages of the three pension calculators (pension-calculator,
// pension-tax-calculator, pension-optimizer-calculator). Each locale page uses its own country's scheme, not the
// Korean 연금저축·IRP credit (세운 2026-10-19). Checked 2026-10-20:
// - Japan iDeCo (確定拠出年金法): 掛金は全額 小規模企業共済等掛金控除 (所得税・住民税). 月額の拠出限度額
//   (令和8年11月分まで → 令和8年12月分から, 厚生労働省 001620594.pdf, 松井証券 2026-07-31, マネックス 2026-05-14):
//   第1号・任意加入 68,000 → 75,000円 (国民年金基金・付加保険料と合算); 第2号 企業年金なし 23,000 → 62,000円;
//   第2号 企業年金あり・公務員 20,000円 (企業年金等と合算55,000円) → 62,000円 − 他制度掛金相当額; 第3号 23,000円
//   (据置). 12月分の掛金は翌年1月に引き落とされるので、所得控除は令和8年分が現行限度額、令和9年分から改正後.
//   掛金は月5,000円以上・1,000円単位. 一時金は退職所得: (一時金 − 退職所得控除) × 1/2, 退職所得控除 = 40万円 ×
//   掛金拠出年数 (最低80万円), 20年超は 800万円 + 70万円 × (年数 − 20) (国税庁 No.1420). 所得税は ×102.1%,
//   住民税 10%. 令和7年度改正で、iDeCo一時金の後に退職金を受け取る場合の調整期間は前年以前4年内 → 9年内.
//   新NISA (金融庁): つみたて投資枠 年120万円, 成長投資枠 年240万円, 生涯 1,800万円 (うち成長枠 1,200万円), 運用益
//   非課税. 課税口座の譲渡益・配当は 20.315%.
// - China 个人养老金 (财政部 税务总局公告2024年第21号, 自2024-01-01全国实施): 缴费按12,000元/年的限额在综合所得或
//   经营所得中据实扣除; 投资收益暂不征税; 领取时不并入综合所得, 单独按3%计税.
// - France PER (CGI art. 163 quatervicies, 154 bis): plafond salarié 2026 = 10 % des revenus professionnels nets 2025,
//   min 10 % du PASS 2025 (4 710 €), max 10 % de 8 PASS 2025 (37 680 €), moins les cotisations employeur (PERCOL,
//   PER obligatoire). TNS: 10 % du bénéfice 2026 ≤ 8 PASS 2026 + 15 % entre 1 et 8 PASS (PASS 2026 48 060 €), min
//   4 806 €, max 88 911 €. Report des plafonds non utilisés porté à 5 ans pour les plafonds nés à partir de 2026; plus
//   de déduction pour les versements après 70 ans (LF 2026). Sortie en capital: versements déduits au barème (sans
//   abattement de 10 %), gains au PFU 12,8 % + prélèvements sociaux 18,6 % (17,2 % → 18,6 % au 1er janvier 2026).
//   Sources: goodvest.fr (calcul plafond PER 2026), sapiendo-retraite.fr (PER 2026 loi de finances).
// - Spain planes de pensiones (LIRPF art. 51–52; Manual Renta 2025 AEAT, cuadro resumen reducciones): reducción de la
//   base imponible general = menor de 30 % de los rendimientos netos del trabajo y actividades y 1.500 € incrementados
//   en 8.500 € de contribuciones empresariales (y aportaciones del trabajador al mismo plan de empleo hasta: ×2,5 si la
//   contribución ≤ 500 € (máx. 1.250), 1.250 + 0,25 × (CE − 500) hasta 1.500 € (máx. 1.500), ×1 por encima (máx.
//   4.250); ×1 si el trabajo de esa empresa rinde más de 60.000 €) o 4.250 € de aportaciones de autónomos a planes de
//   empleo simplificados. Cónyuge: 1.000 € aparte. Rescate: rendimiento del trabajo en la base general; reducción del
//   40 % solo para la parte de aportaciones anteriores a 2007 cobrada en forma de capital. Base del ahorro 2026:
//   19 / 21 / 23 / 27 / 30 %. 2026 limits assumed unchanged from the Renta 2025 manual.

import { japanIncomeTax } from "./comprehensive-income-tax-countries.mjs";
import {
  bandTax,
  chinaAnnualTax,
  CN_ANNUAL_BRACKETS,
  ES_GENERAL_BANDS,
  FR_BAREME_2026,
  franceIncomeTax,
  jpIncomeTax,
  spainGeneralQuota,
  spainPersonalMinimum,
  spainWorkReduction,
} from "./year-end-settlement-countries.mjs";

                                                       
/** Which part of the calculator a page opens on. */
                                                                

export const PENSION_AS_OF = "2026-10-20";

const floorTo = (n        , unit        ) => Math.floor(n / unit) * unit;
const r2 = (n        ) => Math.round(n * 100) / 100;
const pos = (n        ) => Math.max(0, Number.isFinite(n) ? n : 0);

/** Future value of equal contributions paid at the end of each year, compounded yearly. */
export function fvAnnual(annual        , years        , rate        ) {
  const n = Math.max(0, Math.floor(years));
  if (rate === 0) return annual * n;
  return annual * ((1 + rate) ** n - 1) / rate;
}

// ── Japan ────────────────────────────────────────────────────────────────

                                                                               
/** "current" = 令和8年11月分まで (令和8年分の所得控除), "reform" = 令和8年12月分から (令和9年分以降). */
                                                 

/** iDeCo の月額拠出限度額. otherMonthly = 国民年金基金・付加保険料 (第1号) または 他制度掛金相当額 (企業年金あり). */
export function jpIdecoMonthlyLimit(category                 , period               , otherMonthly = 0) {
  const other = pos(otherMonthly);
  let limit        ;
  if (category === "first") limit = (period === "reform" ? 75_000 : 68_000) - other;
  else if (category === "employee") limit = period === "reform" ? 62_000 : 23_000;
  else if (category === "employee-corp") limit = period === "reform" ? 62_000 - other : Math.min(20_000, 55_000 - other);
  else limit = 23_000;
  const rounded = floorTo(pos(limit), 1000);
  return rounded >= 5_000 ? rounded : 0;
}

                                        
                 
                         
                      
                          
                  
                     
                          
                             
 

/** 掛金の所得控除で下がる所得税 (復興特別所得税込み) と翌年度の住民税. */
export function japanIdecoSaving(i                       ) {
  const base = {
    salary: i.salary,
    businessRevenue: 0,
    businessExpenses: 0,
    blueDeduction: 0         ,
    otherIncome: i.otherIncome,
    socialInsurance: i.socialInsurance,
    spouse: i.spouse,
    dependents: i.dependents,
    specificDependents: 0,
  };
  const before = japanIncomeTax({ ...base, otherDeductions: 0 });
  const after = japanIncomeTax({ ...base, otherDeductions: pos(i.annualContribution) });
  const incomeTax = before.incomeTax - after.incomeTax;
  const residentTax = before.residentTax - after.residentTax;
  return { before, after, incomeTax, residentTax, total: incomeTax + residentTax };
}

/** 退職所得控除 (勤続年数＝掛金拠出年数, 1年未満切上げ). */
export function jpRetirementDeduction(years        ) {
  const y = Math.max(1, Math.ceil(pos(years)));
  return y <= 20 ? Math.max(800_000, 400_000 * y) : 8_000_000 + 700_000 * (y - 20);
}

/** iDeCo を一時金で受け取ったときの税金 (退職所得, 分離課税). */
export function jpLumpSumTax(amount        , years        ) {
  const deduction = jpRetirementDeduction(years);
  const taxable = floorTo(pos(pos(amount) - deduction) / 2, 1000);
  const incomeTax = Math.floor(jpIncomeTax(taxable) * 1.021);
  const residentTax = floorTo(taxable * 0.1, 100);
  return { deduction, taxable, incomeTax, residentTax, total: incomeTax + residentTax };
}

export const JP_NISA_MONTHLY_MAX = 300_000; // (120万 + 240万) / 12
export const JP_NISA_LIFETIME = 18_000_000;
export const JP_TAXABLE_ACCOUNT_RATE = 0.20315;

                                 
                        
                            
                
                       
                              
                   
 

/** 毎月の積立を iDeCo → 新NISA → 課税口座 の順に振り分け、同じ利回りで運用した結果. */
export function japanPlan(i                ) {
  const months = Math.max(0, Math.floor(i.years * 12));
  const m = (1 + i.annualReturn) ** (1 / 12) - 1;
  const ideco = Math.min(pos(i.monthlyBudget), pos(i.idecoMonthlyLimit));
  const nisaFirst = Math.min(pos(i.monthlyBudget) - ideco, JP_NISA_MONTHLY_MAX);
  let room = pos(JP_NISA_LIFETIME - pos(i.nisaUsed));
  const bal = { ideco: 0, nisa: 0, taxable: 0 };
  const paid = { ideco: 0, nisa: 0, taxable: 0 };
  for (let k = 0; k < months; k++) {
    const nisa = Math.min(nisaFirst, room);
    room -= nisa;
    const taxable = pos(i.monthlyBudget) - ideco - nisa;
    bal.ideco = bal.ideco * (1 + m) + ideco;
    bal.nisa = bal.nisa * (1 + m) + nisa;
    bal.taxable = bal.taxable * (1 + m) + taxable;
    paid.ideco += ideco;
    paid.nisa += nisa;
    paid.taxable += taxable;
  }
  const taxableGainTax = Math.floor(pos(bal.taxable - paid.taxable) * JP_TAXABLE_ACCOUNT_RATE);
  const lumpSum = jpLumpSumTax(bal.ideco, i.years);
  return {
    idecoMonthly: ideco,
    nisaMonthly: nisaFirst,
    balances: { ideco: Math.round(bal.ideco), nisa: Math.round(bal.nisa), taxable: Math.round(bal.taxable) },
    paid,
    taxableGainTax,
    lumpSum,
    net: Math.round(bal.ideco + bal.nisa + bal.taxable) - taxableGainTax - lumpSum.total,
  };
}

// ── China ────────────────────────────────────────────────────────────────

export const CN_PERSONAL_PENSION_LIMIT = 12_000;
export const CN_PENSION_WITHDRAWAL_RATE = 0.03;

                                          
                        
                 
                          
                            
                     
                          
                       
 

export function chinaMarginalRate(taxable        ) {
  if (taxable <= 0) return 0;
  return (CN_ANNUAL_BRACKETS.find(([upper]) => taxable <= upper) ?? CN_ANNUAL_BRACKETS[CN_ANNUAL_BRACKETS.length - 1])[1];
}

export function chinaPensionSaving(i                         ) {
  const deduction = Math.min(pos(i.contribution), CN_PERSONAL_PENSION_LIMIT);
  const taxableBefore = r2(pos(i.income - 60_000 - pos(i.socialInsurance) - pos(i.specialAdditional) - pos(i.otherDeductions)));
  const taxableAfter = r2(pos(taxableBefore - deduction));
  const before = chinaAnnualTax(taxableBefore);
  const after = chinaAnnualTax(taxableAfter);
  return { deduction, taxableBefore, taxableAfter, before, after, saving: r2(before - after), marginal: chinaMarginalRate(taxableBefore) };
}

export function chinaPensionWithdrawalTax(amount        ) {
  return r2(pos(amount) * CN_PENSION_WITHDRAWAL_RATE);
}

                                                                 
                
                       
 

/** 每年缴费、按同一收益率滚存, 领取时3%; 净收益 = 累计少缴的个税 − 领取时的税. */
export function chinaPlan(i                ) {
  const s = chinaPensionSaving(i);
  const yearly = s.deduction;
  const balance = r2(fvAnnual(yearly, i.years, i.annualReturn));
  const principal = yearly * Math.max(0, Math.floor(i.years));
  const withdrawalTax = chinaPensionWithdrawalTax(balance);
  const savings = r2(s.saving * Math.max(0, Math.floor(i.years)));
  return { ...s, yearly, balance, principal, withdrawalTax, savings, net: r2(savings - withdrawalTax) };
}

// ── France ───────────────────────────────────────────────────────────────

export const FR_PASS_2025 = 47_100;
export const FR_PASS_2026 = 48_060;
export const FR_PFU_IR = 0.128;
export const FR_SOCIAL_LEVIES_2026 = 0.186;

/** Plafond épargne retraite 2026 d'un salarié: 10 % des revenus professionnels nets 2025, entre 4 710 € et 37 680 €. */
export function frPerCeilingSalarie(revenusPro2025        , employerContributions = 0) {
  const raw = Math.max(Math.round(FR_PASS_2025 * 0.1), Math.min(Math.round(pos(revenusPro2025) * 0.1), FR_PASS_2025 * 8 * 0.1));
  return Math.max(0, raw - pos(employerContributions));
}

/** Plafond « Madelin » 2026 d'un travailleur non salarié (art. 154 bis CGI). */
export function frPerCeilingTns(benefice2026        ) {
  const b = Math.min(pos(benefice2026), 8 * FR_PASS_2026);
  return Math.round(Math.max(FR_PASS_2026 * 0.1, b * 0.1 + Math.max(0, b - FR_PASS_2026) * 0.15));
}

/** Taux marginal d'imposition du foyer (barème par part, sans plafonnement du quotient familial). */
export function franceMarginalRate(revenu        , parts        ) {
  const perPart = pos(revenu) / Math.max(1, parts);
  return (FR_BAREME_2026.find(([upper]) => perPart <= upper) ?? FR_BAREME_2026[FR_BAREME_2026.length - 1])[1];
}

                                       
                                                             
                 
                  
                   
                    
                                             
                  
 

export function francePerSaving(i                      ) {
  const deduction = Math.min(pos(i.versement), pos(i.plafond));
  const before = franceIncomeTax(i.revenu, i.couple, i.children);
  const after = franceIncomeTax(pos(i.revenu - deduction), i.couple, i.children);
  return { deduction, before: before.impot, after: after.impot, saving: before.impot - after.impot, tmi: franceMarginalRate(i.revenu, before.parts), excess: pos(pos(i.versement) - deduction) };
}

                                     
                                                                      
                   
                                                      
                      
                                
                
                                                              
                           
                  
                                                                 
                      
 

/** Sortie en capital: versements déduits au barème, gains au PFU 12,8 % + prélèvements sociaux 18,6 %. */
export function francePerExit(i                    ) {
  const years = Math.max(1, Math.floor(i.spreadYears));
  const slice = pos(i.deducted) / years;
  const base = franceIncomeTax(i.retirementIncome, i.couple, 0).impot;
  const withSlice = franceIncomeTax(pos(i.retirementIncome) + slice, i.couple, 0).impot;
  const principalTax = (withSlice - base) * years;
  const gainsIr = Math.round(pos(i.gains) * FR_PFU_IR);
  const gainsSocial = Math.round(pos(i.gains) * FR_SOCIAL_LEVIES_2026);
  const total = principalTax + gainsIr + gainsSocial;
  const gross = pos(i.deducted) + pos(i.notDeducted) + pos(i.gains);
  return { principalTax, gainsIr, gainsSocial, total, gross, net: Math.round(gross - total) };
}

                                  
                 
                  
                   
                       
                  
                
                       
                           
                      
 

/** Budget annuel: PER jusqu'au plafond, le reste hors PER (gains au PFU 31,4 %). */
export function francePlan(i                 ) {
  const s = francePerSaving({ revenu: i.revenu, couple: i.couple, children: i.children, versement: i.annualBudget, plafond: i.plafond });
  const n = Math.max(0, Math.floor(i.years));
  const perYearly = s.deduction;
  const outsideYearly = pos(i.annualBudget) - perYearly;
  const perBalance = fvAnnual(perYearly, n, i.annualReturn);
  const exit = francePerExit({ deducted: perYearly * n, notDeducted: 0, gains: pos(perBalance - perYearly * n), retirementIncome: i.retirementIncome, couple: i.couple, spreadYears: i.spreadYears });
  const outsideBalance = fvAnnual(outsideYearly, n, i.annualReturn);
  const outsideTax = Math.round(pos(outsideBalance - outsideYearly * n) * (FR_PFU_IR + FR_SOCIAL_LEVIES_2026));
  const savings = s.saving * n;
  return {
    ...s,
    perYearly,
    outsideYearly,
    perBalance: Math.round(perBalance),
    exit,
    outsideBalance: Math.round(outsideBalance),
    outsideTax,
    savings,
    net: exit.net + Math.round(outsideBalance) - outsideTax + savings,
  };
}

// ── Spain ────────────────────────────────────────────────────────────────

export const ES_INDIVIDUAL_LIMIT = 1_500;
export const ES_EMPLOYER_INCREMENT = 8_500;
export const ES_AUTONOMO_INCREMENT = 4_250;

/** Base del ahorro 2026 (estatal + autonómica). */
export const ES_SAVINGS_BANDS                     = [
  [6_000, 0.19],
  [50_000, 0.21],
  [200_000, 0.23],
  [300_000, 0.27],
  [Infinity, 0.3],
];

/** Máximo de aportación propia del trabajador al plan de empleo que entra en el incremento de 8.500 €. */
export function esWorkerEmploymentCap(employerContribution        , workIncomeOver60k         ) {
  const ce = pos(employerContribution);
  if (workIncomeOver60k) return Math.min(ce, 4_250);
  if (ce <= 500) return Math.min(ce * 2.5, 1_250);
  if (ce <= 1_500) return Math.min(1_250 + 0.25 * (ce - 500), 1_500);
  return Math.min(ce, 4_250);
}

                                         
                                                       
                     
                                                       
                   
                                                                 
                           
                             
                                                                                                      
                   
                                                                   
                    
 

export function spainPensionLimit(i                        ) {
  const workerCap = esWorkerEmploymentCap(i.employer, i.workIncomeOver60k);
  const workerInIncrement = Math.min(pos(i.workerEmployment), workerCap);
  const increment = Math.min(ES_EMPLOYER_INCREMENT, pos(i.employer) + workerInIncrement + Math.min(pos(i.autonomo), ES_AUTONOMO_INCREMENT));
  // Lo que el trabajador aporta al plan de empleo por encima del coeficiente entra en el límite general de 1.500 €.
  const general = Math.min(ES_INDIVIDUAL_LIMIT, pos(i.individual) + pos(pos(i.workerEmployment) - workerCap));
  const absolute = general + increment;
  const thirtyPercent = r2(pos(i.netIncome) * 0.3);
  const reduction = r2(Math.min(absolute, thirtyPercent));
  const total = pos(i.individual) + pos(i.employer) + pos(i.workerEmployment) + pos(i.autonomo);
  return { workerCap, increment, general, absolute, thirtyPercent, reduction, total, excess: r2(pos(total - reduction)) };
}

                                          
                      
                         
                                                                                    
                   
                                                               
                       
                   
                  
                    
 

/** Cuota íntegra con y sin la reducción por aportaciones. */
export function spainPensionSaving(i                         ) {
  const gross = pos(i.grossSalary) + pos(i.employer);
  const previous = pos(gross - pos(i.socialSecurity));
  const netWork = gross > 0 ? pos(previous - 2_000) : 0;
  const activity = pos(i.activityNet ?? 0);
  // art. 20 LIRPF: sin reducción por rendimientos del trabajo si las demás rentas superan 6.500 €.
  const workReduction = gross > 0 && activity <= 6_500 ? r2(Math.min(netWork, pos(spainWorkReduction(previous)))) : 0;
  const base = r2(pos(netWork - workReduction + activity));
  const applied = r2(Math.min(base, pos(i.reduction)));
  const minimo = spainPersonalMinimum(i.children, i.over65);
  const before = spainGeneralQuota(base, minimo);
  const after = spainGeneralQuota(r2(base - applied), minimo);
  const marginal = (ES_GENERAL_BANDS.find(([upper]) => base <= upper) ?? ES_GENERAL_BANDS[ES_GENERAL_BANDS.length - 1])[1];
  return { netWork, netIncome: r2(netWork + activity), base, applied, minimo, before, after, saving: r2(before - after), marginal };
}

                                   
                 
                                                                                                                    
                  
                                                                                     
                    
                  
                                                                                   
                      
 

/** Rescate: rendimiento del trabajo que se suma a la base general del año en que se cobra. */
export function spainPensionRescue(i                  ) {
  const years = Math.max(1, Math.floor(i.spreadYears));
  const minimo = spainPersonalMinimum(0, i.over65);
  const baseTax = spainGeneralQuota(pos(i.otherBase), minimo);
  const reduction = years === 1 ? r2(Math.min(pos(i.pre2007), pos(i.amount)) * 0.4) : 0;
  const slice = pos(i.amount) / years;
  const extraFirst = spainGeneralQuota(pos(i.otherBase) + slice - reduction, minimo) - baseTax;
  const extraOther = spainGeneralQuota(pos(i.otherBase) + slice, minimo) - baseTax;
  const tax = r2(extraFirst + extraOther * (years - 1));
  return { reduction, slice: r2(slice), tax, net: r2(pos(i.amount) - tax), effective: i.amount > 0 ? tax / i.amount : 0 };
}

                                 
                       
                                                                 
                     
                                                
                       
                
                       
                    
                  
                      
 

/** Presupuesto anual: plan de pensiones hasta el límite, el resto en un fondo de inversión (ganancia en la base del ahorro). */
export function spainPlan(i                ) {
  const n = Math.max(0, Math.floor(i.years));
  const planYearly = Math.min(pos(i.annualBudget), pos(i.deductible));
  const outsideYearly = pos(i.annualBudget) - planYearly;
  const planBalance = r2(fvAnnual(planYearly, n, i.annualReturn));
  const rescue = spainPensionRescue({ amount: planBalance, pre2007: 0, otherBase: i.otherBase, over65: i.over65, spreadYears: i.spreadYears });
  const outsideBalance = r2(fvAnnual(outsideYearly, n, i.annualReturn));
  const outsideTax = r2(bandTax(pos(outsideBalance - outsideYearly * n), ES_SAVINGS_BANDS));
  const savings = r2(pos(i.annualSaving) * n);
  return { planYearly, outsideYearly, planBalance, rescue, outsideBalance, outsideTax, savings, net: r2(rescue.net + outsideBalance - outsideTax + savings) };
}
