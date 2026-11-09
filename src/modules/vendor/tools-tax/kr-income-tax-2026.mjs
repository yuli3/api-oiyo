// GENERATED from tools-oiyo src/lib/kr-income-tax-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 종합소득세 estimate for 2025·2026 귀속 (same brackets and deductions), shared by the comprehensive
// income tax and freelancer 3.3% calculators. Checked 2026-10-27:
// - 기본세율 소득세법 제55조, 근로소득공제 제47조, 근로소득세액공제 제59조 (kr-payroll-2026.ts).
// - 표준세액공제 제59조의4 제7항: 근로소득이 있으면 13만 원, 없으면 7만 원(성실사업자 12만 원 제외).
// - 단순경비율: 국세청 고시, 940909(기타 자영업 인적용역) 2025년 귀속 일반율 64.1%, 수입금액 4천만 원
//   초과분은 자가율 49.7%(국세청 경비율 고시). 대상 여부는 직전 연도 수입금액으로 국세청이 정해요.
// - 사업소득 원천징수 3%(제129조 제1항 제3호) + 지방소득세 0.3%.
import { basicIncomeTax, earnedIncomeDeduction, earnedIncomeTaxCredit, PERSONAL_DEDUCTION_PER_PERSON } from "./kr-payroll-2026.mjs";

export const INCOME_TAX_AS_OF = "2026-10-27";
export const SIMPLE_EXPENSE_940909 = { rate: 0.641, selfRate: 0.497, split: 40_000_000 }         ;
export const WITHHOLDING_RATE = 0.03;

const floor10 = (n        ) => Math.floor(Math.round(n) / 10) * 10;

/** 단순경비율로 계산한 필요경비. 4천만 원 초과분은 자가율을 써요. */
export function simpleExpense(revenue        , rate         = SIMPLE_EXPENSE_940909.rate, selfRate         = SIMPLE_EXPENSE_940909.selfRate)         {
  const r = Math.max(0, revenue);
  const split = SIMPLE_EXPENSE_940909.split;
  return Math.round(r <= split ? r * rate : split * rate + (r - split) * selfRate);
}

                                 
                          
                         
                       
                 
                     
                      
                       
                 
                            
                         
                                     
                  
 

export function comprehensiveIncomeTax({ businessIncome, salary, otherIncome, people, pensionPremium, prepaid }                ) {
  const earned = Math.max(0, salary - earnedIncomeDeduction(salary));
  const business = Math.max(0, businessIncome);
  const other = Math.max(0, otherIncome);
  const total = earned + business + other;
  const deductions = Math.max(1, Math.floor(people)) * PERSONAL_DEDUCTION_PER_PERSON + Math.max(0, pensionPremium);
  const base = Math.max(0, total - deductions);
  const calculated = basicIncomeTax(base);
  // 근로소득세액공제는 산출세액 중 근로소득 몫에만 적용해요.
  const earnedShare = total > 0 ? calculated * (earned / total) : 0;
  const earnedCredit = salary > 0 ? earnedIncomeTaxCredit(earnedShare, salary) : 0;
  const standardCredit = salary > 0 ? 130_000 : 70_000;
  const determined = floor10(Math.max(0, calculated - earnedCredit - standardCredit));
  const local = floor10(determined * 0.1);
  const balance = determined - Math.max(0, prepaid);
  const localBalance = local - floor10(Math.max(0, prepaid) * 0.1);
  return { earned, business, other, total, deductions, base, calculated, credits: Math.min(calculated, earnedCredit + standardCredit), determined, local, balance, localBalance, due: balance + localBalance };
}

/** 3.3% 프리랜서: 수입과 경비율로 종합소득세를 추정하고 원천징수액과 비교해요. */
export function freelancerSettlement(revenue        , expenseRate                   , people        , pensionPremium        ) {
  const expense = expenseRate === "simple" ? simpleExpense(revenue) : Math.round(Math.max(0, revenue) * expenseRate);
  const withheld = floor10(Math.max(0, revenue) * WITHHOLDING_RATE);
  const r = comprehensiveIncomeTax({ businessIncome: revenue - expense, salary: 0, otherIncome: 0, people, pensionPremium, prepaid: withheld });
  return { ...r, revenue, expense, withheld, withheldLocal: floor10(withheld * 0.1) };
}
