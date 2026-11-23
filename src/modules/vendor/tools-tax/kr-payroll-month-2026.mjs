// GENERATED from tools-oiyo src/lib/kr-payroll-month-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 급여 담당자용 새 계산 2종 (2026-11-23, 실무 오피스 새 계산 3종, 세운 승인 "3종 모두 만들기").
// 사실 파일: company-brain projects/oiyo-ecosystem/facts/kr-payroll-new-calcs-2026-11-23.md (Mac에서 법령 원문 확인).
//
// 1) 간이세액표 월 원천징수: 소득세법 시행령 [별표 2] <개정 2026. 2. 27.> 표 그대로, 1천만 원 초과는 원문 산식,
//    8세 이상 20세 이하 자녀 차감(주3: 20,830 / 45,830 / +33,330), 11명 초과(주4), 80·100·120% 선택(시행령 제194조).
//    지방소득세는 소득세의 10%(지방세법 제103조의13). 10원 미만은 버려요(국세청 예시 20,180원 × 80% = 16,140원).
// 2) 입사·퇴사 달 4대보험: 국민건강보험법 제69조②(취득일 다음 달부터 상실일 전날이 속한 달까지, 1일 취득이면 그 달부터),
//    국민연금법 제17조(같은 원칙, 1일 취득이나 본인 희망이면 그 달부터), 제12조·건보법 제9조(퇴사 다음 날 상실),
//    노인장기요양보험법 제8조(건강보험과 함께 징수), 보험료징수법 제16조의4(고용·산재: 월 중간 입사는 다음 달부터, 1일이면 그 달부터).
//    월 보험료는 kr-rates-2026 employeeInsurance2026(2026 요율·상하한)을 그대로 써요.
//    고용보험 퇴사 달 처리는 원문 미확인이라 "확인 필요"로만 표시하고 금액을 더하지 않아요.
import { WITHHOLDING_10M, WITHHOLDING_TABLE } from "./kr-withholding-table-2026.mjs";
import { employeeInsurance2026 } from "../../kr-rates-2026.mjs";

export const PAYROLL_MONTH_AS_OF = "2026-11-23";
const floor10 = (n        ) => Math.floor(Math.round(n * 1e6) / 1e7) * 10;

/** 가족 수(1~)에 해당하는 표 값. 11명 초과는 주4. */
function byFamily(row                   , family        )         {
  const f = Math.max(1, Math.floor(family));
  if (f <= 11) return row[f - 1];
  const t10 = row[9];
  const t11 = row[10];
  return t11 - (t10 - t11) * (f - 11);
}

/** 원문 산식(월급여 1천만 원 초과)의 가산액. pay는 원 단위. */
export function aboveTenMillion(pay        )         {
  const x = pay;
  if (x <= 10_000_000) return 0;
  if (x <= 14_000_000) return (x - 10_000_000) * 0.98 * 0.35 + 25_000;
  if (x <= 28_000_000) return 1_397_000 + (x - 14_000_000) * 0.98 * 0.38;
  if (x <= 30_000_000) return 6_610_600 + (x - 28_000_000) * 0.98 * 0.4;
  if (x <= 45_000_000) return 7_394_600 + (x - 30_000_000) * 0.4;
  if (x <= 87_000_000) return 13_394_600 + (x - 45_000_000) * 0.42;
  return 31_034_600 + (x - 87_000_000) * 0.45;
}

/** 8세 이상 20세 이하 자녀 차감액(별표2 주3, 2026.2.27 개정) */
export function childReduction(children        )         {
  const c = Math.max(0, Math.floor(children));
  if (c === 0) return 0;
  if (c === 1) return 20_830;
  return 45_830 + Math.max(0, c - 2) * 33_330;
}

                                   
                            
              
                            
                 
                             
                    
                              
                         
 

                                    
                         
                   
                                    
                                               
                         
                        
                  
                        
                    
                   
                
                                    
                      
 

export function simplifiedWithholding(input                  )                    {
  const pay = Math.max(0, input.pay);
  const k = pay / 1000;
  const ratio = input.ratio ?? 100;
  let tableTax = 0;
  let bracket                               = null;
  const first = WITHHOLDING_TABLE[0];
  const belowTable = k < first[0];
  if (pay > 10_000_000) {
    tableTax = byFamily(WITHHOLDING_10M, input.family) + aboveTenMillion(pay);
  } else if (k >= 10_000) {
    tableTax = byFamily(WITHHOLDING_10M, input.family);
    bracket = { from: 10_000, to: 10_000 };
  } else if (!belowTable) {
    // 이분 탐색: from ≤ k < to
    let lo = 0;
    let hi = WITHHOLDING_TABLE.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (WITHHOLDING_TABLE[mid][0] <= k) lo = mid;
      else hi = mid - 1;
    }
    const row = WITHHOLDING_TABLE[lo];
    tableTax = byFamily(row.slice(2), input.family);
    bracket = { from: row[0], to: row[1] };
  }
  tableTax = Math.max(0, Math.floor(tableTax));
  const cr = childReduction(input.children ?? 0);
  const baseTax = Math.max(0, tableTax - cr);
  const incomeTax = floor10((baseTax * ratio) / 100);
  const localTax = floor10(incomeTax * 0.1);
  return { tableTax, bracket, childReduction: cr, baseTax, ratio, incomeTax, localTax, total: incomeTax + localTax, belowTable };
}

// ───────────── 입사·퇴사 달 4대보험 ─────────────

                                 
                       
               
                                     
                 
                        
                     
                                      
                                 
                                            
                      
 

                            
                
                  
                 
               
                     
                                 
                           
                
                  
 

const ym = (s        ) => s.slice(0, 7);
const addMonth = (m        , n        ) => {
  const [y, mo] = m.split("-").map(Number);
  const d = new Date(Date.UTC(y, mo - 1 + n, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
};

export function joinLeaveMonths(input                )                                                                                                                                      {
  const joinMonth = ym(input.join);
  const onFirst = input.join.slice(8, 10) === "01";
  const firstHealthMonth = onFirst ? joinMonth : addMonth(joinMonth, 1);
  const firstPensionMonth = onFirst || input.pensionFromJoinMonth ? joinMonth : addMonth(joinMonth, 1);
  const firstEmploymentMonth = onFirst ? joinMonth : addMonth(joinMonth, 1);
  // 상실일 = 마지막 근무일 다음 날 → "상실일 전날이 속한 달" = 마지막 근무일이 속한 달
  const lastMonth = input.leave ? ym(input.leave) : null;
  const until = lastMonth ?? input.untilMonth ?? addMonth(joinMonth, 2);
  const lines              = [];
  for (let cur = joinMonth; cur <= until; cur = addMonth(cur, 1)) {
    const inRange = (start        ) => cur >= start && (lastMonth === null || cur <= lastMonth);
    const mm = employeeInsurance2026(input.monthlyPay, { payMonth: cur });
    const pension = inRange(firstPensionMonth) ? mm.nationalPension : 0;
    const health = inRange(firstHealthMonth) ? mm.healthInsurance : 0;
    const care = inRange(firstHealthMonth) ? mm.longTermCare : 0;
    const isLeaveMonth = lastMonth !== null && cur === lastMonth;
    const employmentCheck = isLeaveMonth && inRange(firstEmploymentMonth);
    const employment = inRange(firstEmploymentMonth) && !employmentCheck ? mm.employmentInsurance : 0;
    const notes           = [];
    if (cur === joinMonth && !onFirst) notes.push(input.pensionFromJoinMonth ? "월 중간 입사: 건강·고용은 다음 달부터, 국민연금은 희망해서 이 달부터" : "월 중간 입사: 이 달은 4대보험료 없음(다음 달부터)");
    if (cur === joinMonth && onFirst) notes.push("1일 입사: 이 달부터 부과");
    if (isLeaveMonth) notes.push("퇴사 달: 연금·건강은 이 달까지 부과. 고용보험 퇴사 달은 실제 보수로 정산(금액 확인 필요)");
    if (lastMonth !== null && cur === lastMonth && cur === joinMonth && !onFirst && !input.pensionFromJoinMonth) notes.push("같은 달 입사·퇴사: 시작 달보다 끝 달이 앞서 부과 달 없음(공단 확인 권장)");
    lines.push({ month: cur, pension, health, care, employment, employmentCheck, total: pension + health + care + employment, notes });
  }
  return { lines, firstPensionMonth, firstHealthMonth, firstEmploymentMonth, lastMonth };
}
