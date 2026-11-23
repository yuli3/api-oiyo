// GENERATED from tools-oiyo src/lib/new-calc-5-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 새 계산 5종 (2026-11-23, CHOSEUN "5종 모두 만들기"). Facts: /mnt/project-files/notes/new-calc-5-facts-2026-11-23.md
// 확인되지 않은 값은 계산하지 않아요. 크리에이터 세금은 국세청 원문 확인 뒤에 추가해요.
import { retirementIncomeTax } from "./kr-retirement-tax.mjs";
import { unemploymentDailyBenefit2026, unemploymentDays2026 } from "../../kr-rates-2026.mjs";
export { jpFurusatoLimit, JP_FURUSATO_RATES } from "./jp-tax-pack-2026.mjs";
export { ukMarriageAllowance, UK_MA } from "./uk-tax-pack-2026.mjs";
export { caIncomeTax2025, CA_2025 } from "./us-tax-pack-2026.mjs";

export const NEW_CALC_5_AS_OF = "2026-11-23";

// ── 1. 국민연금 예상 노령연금 (국민연금공단 급여의 산정) ──
export const KR_NPS_FORMULA = {
  aValue: 3_193_511, // 2025.12~2026.11 지급사유 발생
  incomeFloor: 410_000, // 기준소득월액 하한 (2026.7~2027.6)
  incomeCap: 6_590_000, // 상한
  spouseYear: 306_630, // 부양가족연금 2026
  childParentYear: 204_360,
  minYears: 10,
}         ;

/** 가입 연도별 비례상수 (공단 표: 1988~98 2.4, 1999~2007 1.8, 2008 1.5에서 매년 0.015 감소~2025 1.245, 2026~ 1.29). */
export function npsConstant(year        )         {
  if (year <= 1998) return 2.4;
  if (year <= 2007) return 1.8;
  if (year <= 2025) return Math.round((1.5 - 0.015 * (year - 2008)) * 1000) / 1000;
  return 1.29;
}

                                 
                                
                                    
                                                     
                                     
                   
                                               
 

export function krPensionEstimate(x                ) {
  const N = KR_NPS_FORMULA;
  if (!Number.isInteger(x.startYear) || !Number.isInteger(x.endYear) || x.startYear < 1988 || x.endYear < x.startYear || x.endYear > 2080) throw new Error("years");
  if (!(x.monthlyIncome > 0) || x.monthlyIncome > 100_000_000) throw new Error("monthlyIncome");
  const gap = Math.max(0, Math.floor(x.gapMonths ?? 0));
  const deps = Math.max(0, Math.min(10, Math.floor(x.dependents ?? 0)));
  const B = Math.min(N.incomeCap, Math.max(N.incomeFloor, x.monthlyIncome));
  const A = N.aValue;
  const months                                           = [];
  for (let y = x.startYear; y <= x.endYear; y++) months.push({ year: y, m: 12, k: npsConstant(y) });
  // 안 낸 개월은 가장 최근 연도부터 빼요(보수적).
  let left = gap;
  for (let i = months.length - 1; i >= 0 && left > 0; i--) { const cut = Math.min(left, months[i].m); months[i].m -= cut; left -= cut; }
  const P = months.reduce((s, r) => s + r.m, 0);
  if (P <= 0) throw new Error("no months");
  const basicYear = months.reduce((s, r) => s + (r.year <= 1998 ? r.k * (A + 0.75 * B) : r.k * (A + B)) * (r.m / P), 0);
  const over20 = Math.max(0, P - 240);
  const basicWithBonus = basicYear * (1 + (0.05 * over20) / 12);
  const years = P / 12;
  const payRate = P < 120 ? 0 : P >= 240 ? 1 : 0.5 + (0.05 * (P - 120)) / 12;
  const annualBasic = Math.floor(basicWithBonus * payRate);
  const family = (x.spouse ? N.spouseYear : 0) + deps * N.childParentYear;
  const annual = annualBasic + (payRate > 0 ? family : 0);
  return {
    months: P,
    years: Math.round(years * 10) / 10,
    eligible: P >= 120,
    B,
    payRatePct: Math.round(payRate * 1000) / 10,
    monthlyBasic: Math.floor(annualBasic / 12),
    monthlyFamily: payRate > 0 ? Math.floor(family / 12) : 0,
    monthly: Math.floor(annual / 12),
    notes: [
      "현재 가치로 어림해요. 과거 소득의 재평가, 앞으로의 A값 변화, 수령 중 물가 반영은 넣지 않았어요.",
      "군복무·출산·실업 크레딧과 추납·반납은 빠져 있어요. 정확한 금액은 국민연금공단 「내 연금 알아보기」나 1355에서 확인하세요.",
      "가입기간이 10년(120개월)보다 짧으면 노령연금 대신 반환일시금을 받아요.",
    ],
  };
}

// ── 3. 퇴사 원스톱: 퇴직금·퇴직소득세·구직급여 (근로자퇴직급여 보장법 제8조, 소득세법 제48·55조, 고용보험법 제46조·별표1) ──
export function krQuitPlan(x                                                                                                                                                                                   ) {
  if (!(x.monthlyWage > 0) || x.monthlyWage > 1e9) throw new Error("monthlyWage");
  if (!(x.years >= 0 && x.years <= 60) || !(x.insuredYears >= 0 && x.insuredYears <= 60)) throw new Error("years");
  const bonus = Math.max(0, x.annualBonus ?? 0);
  const leave = Math.max(0, x.annualLeavePay ?? 0);
  const threeMonths = x.monthlyWage * 3 + (bonus * 3) / 12 + (leave * 3) / 12;
  const daily = threeMonths / 91;
  const gross = x.years < 1 ? 0 : Math.floor(daily * 30 * x.years);
  const tax = gross > 0 ? retirementIncomeTax(gross, Math.max(1, Math.ceil(x.years))) : null;
  const periodCode = x.insuredYears < 1 ? "p1" : x.insuredYears < 3 ? "p2" : x.insuredYears < 5 ? "p3" : x.insuredYears < 10 ? "p4" : "p5";
  const ub = unemploymentDailyBenefit2026({ monthlyWage: x.monthlyWage, hoursPerDay: x.hoursPerDay ?? 8 });
  const days = unemploymentDays2026(x.age50OrDisabled ? "over" : "under", periodCode);
  const unemploymentEligible = x.involuntary && x.insuredYears * 12 >= 6; // 피보험 단위기간 180일은 어림
  const unemploymentTotal = unemploymentEligible ? ub.dailyBenefit * days : 0;
  return {
    severanceGross: gross,
    severanceTax: tax?.totalTax ?? 0,
    severanceNet: tax?.netPayout ?? 0,
    unemploymentEligible,
    unemploymentDaily: ub.dailyBenefit,
    unemploymentDays: days,
    unemploymentTotal,
    total: (tax?.netPayout ?? 0) + unemploymentTotal,
    deadlines: [
      "퇴직 후 14일 안: 퇴직금·남은 임금 지급 (근로자퇴직급여 보장법 제9조)",
      "퇴직 다음 날부터 12개월 안: 구직급여를 다 받아야 해요 (고용보험법 제48조)",
      "다음 해 5월 또는 새 회사 연말정산: 중도퇴사 연말정산 마무리",
    ],
    notes: [
      "퇴직금은 1년 이상, 4주 평균 주 15시간 이상 일했을 때 생겨요. 3개월은 91일로 어림해요.",
      "구직급여는 비자발적 이직(권고사직·계약 만료 등)이고 이직 전 18개월 중 피보험 단위기간 180일 이상일 때 받아요. 자진 퇴사 예외는 별도 확인하세요.",
      "건강보험은 지역가입 보험료와 임의계속가입을 따로 비교하세요.",
    ],
  };
}

