// GENERATED from tools-oiyo src/lib/kr-incorporation-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 개인사업자 vs 법인 세금 비교 (2026년). Checked 2026-10-27.
// - 법인세율: 법인세법 제55조 제1항, 2025-12-02 국회 통과 개정으로 2026-01-01 이후 개시 사업연도부터
//   전 구간 1%p 인상: 2억 이하 10%, 200억 이하 20%, 3,000억 이하 22%, 초과 25%.
//   지방소득세 법인분은 같은 구간에 1/10 세율이라 법인세의 10%와 같아요.
// - 성실신고확인 대상 소규모 부동산임대 법인은 2억 이하 구간이 없어 최저 20%예요(제55조 제1항 단서).
// - 개인: 종합소득 기본세율(소득세법 제55조), 본인 기본공제 150만, 표준세액공제 7만(근로소득 있으면 13만).
// - 대표 급여: 근로소득공제(제47조), 근로소득세액공제(제59조), 표준세액공제 13만.
// - 배당소득 원천징수 14% + 지방 1.4% = 15.4%(연 2천만 원 이하 분리과세 가정).
import { basicIncomeTax, earnedIncomeDeduction, earnedIncomeTaxCredit, PERSONAL_DEDUCTION_PER_PERSON } from "./kr-payroll-2026.mjs";

export const INCORPORATION_AS_OF = "2026-10-27";
const EOK = 100_000_000;
const floor10 = (n        ) => Math.floor(Math.round(n) / 10) * 10;

const CORP_BRACKETS = [
  { upTo: 2 * EOK, rate: 0.1, minus: 0 },
  { upTo: 200 * EOK, rate: 0.2, minus: 20_000_000 },
  { upTo: 3000 * EOK, rate: 0.22, minus: 420_000_000 },
  { upTo: Infinity, rate: 0.25, minus: 9_420_000_000 },
]         ;

/** 2026 사업연도 법인세 산출세액(지방소득세 제외). smallRealEstate면 2억 이하 구간 없이 20%부터. */
export function corporateTax2026(base        , smallRealEstate = false)         {
  const b = Math.max(0, base);
  if (smallRealEstate && b <= 200 * EOK) return floor10(b * 0.2);
  const x = CORP_BRACKETS.find((r) => b <= r.upTo) ;
  return floor10(b * x.rate - x.minus);
}

/** 사업소득만 있는 개인사업자의 소득세 + 지방소득세. */
export function soleProprietorTax(profit        ) {
  const base = Math.max(0, profit - PERSONAL_DEDUCTION_PER_PERSON);
  const tax = floor10(Math.max(0, basicIncomeTax(base) - 70_000));
  const local = floor10(tax * 0.1);
  return { base, tax, local, total: tax + local };
}

/** 근로소득만 있는 대표 급여의 소득세 + 지방소득세(인적공제는 본인만). */
export function founderSalaryTax(salary        ) {
  const s = Math.max(0, salary);
  if (s === 0) return { base: 0, tax: 0, local: 0, total: 0 };
  const base = Math.max(0, s - earnedIncomeDeduction(s) - PERSONAL_DEDUCTION_PER_PERSON);
  const calculated = basicIncomeTax(base);
  const tax = floor10(Math.max(0, calculated - earnedIncomeTaxCredit(calculated, s) - 130_000));
  const local = floor10(tax * 0.1);
  return { base, tax, local, total: tax + local };
}

export const DIVIDEND_RATE = 0.154;

export function compareIncorporation(profit        , founderSalary        , smallRealEstate = false) {
  const p = Math.max(0, profit);
  const salary = Math.min(Math.max(0, founderSalary), p);
  const sole = soleProprietorTax(p);
  const corpBase = p - salary;
  const corpTax = corporateTax2026(corpBase, smallRealEstate);
  const corpLocal = floor10(corpTax * 0.1);
  const pay = founderSalaryTax(salary);
  const retained = Math.max(0, corpBase - corpTax - corpLocal);
  const dividendTax = floor10(retained * DIVIDEND_RATE);
  const corpKeep = corpTax + corpLocal + pay.total;
  const corpPayout = corpKeep + dividendTax;
  return { profit: p, salary, sole, corpBase, corpTax, corpLocal, pay, retained, dividendTax, corpKeep, corpPayout };
}
