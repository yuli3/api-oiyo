// GENERATED from tools-oiyo src/lib/household-checkup-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 가계 재무 건강검진 (2026-11-23, CHOSEUN "재무설계사를 찾아가는 니즈"). 세금·법률 계산이 아니에요.
// 재무 상담 첫 시간에 보는 네 가지 비율을 구하고, 흔히 쓰는 참고선과 비교만 해요. 상품 추천은 하지 않아요.
export const HOUSEHOLD_CHECKUP_AS_OF = "2026-11-23";

                            
                                     
                                                    
                                      
                                           
                                           
                                           
  

/** 참고선: 법·규정이 아니라 재무 상담에서 흔히 쓰는 어림 기준이에요(은행권 DSR 40%는 대출 규제 기준). */
export const CHECKUP_LINES = {
  emergencyMonths: [3, 6], // 생활비 3~6개월
  savingRate: 20, // 실수령의 20% 이상
  debtRate: 40, // 실수령의 40% 이하(은행권 DSR 40% 참고)
  insuranceRate: 10, // 실수령의 10% 이하
}         ;

                                       
export function householdCheckup(x              ) {
  const v = (n        , k        ) => { if (!(n >= 0) || n > 1e12) throw new Error(k); return n; };
  const net = v(x.monthlyNet, "monthlyNet");
  if (net <= 0) throw new Error("monthlyNet");
  const spend = v(x.monthlySpend, "monthlySpend"), save = v(x.monthlySaving, "monthlySaving"), debt = v(x.monthlyDebtPay, "monthlyDebtPay"), ins = v(x.monthlyInsurance, "monthlyInsurance"), fund = v(x.emergencyFund, "emergencyFund");
  const pct = (a        ) => Math.round((a / net) * 1000) / 10;
  const L = CHECKUP_LINES;
  const months = spend > 0 ? Math.round((fund / spend) * 10) / 10 : null;
  const leftover = net - spend - save - debt - ins;
  const items                                                                                            = [
    {
      id: "emergency", label: "비상금", value: months === null ? "-" : `생활비 ${months}개월치`, line: `${L.emergencyMonths[0]}~${L.emergencyMonths[1]}개월`,
      status: months === null ? "watch" : months >= L.emergencyMonths[0] ? "good" : months >= 1 ? "watch" : "fix",
      tip: "갑자기 일이 끊기거나 큰 지출이 생겨도 대출 없이 버틸 수 있는 돈이에요. 바로 찾을 수 있는 곳에 둬요.",
    },
    {
      id: "saving", label: "저축률", value: `${pct(save)}%`, line: `${L.savingRate}% 이상`,
      status: pct(save) >= L.savingRate ? "good" : pct(save) >= L.savingRate / 2 ? "watch" : "fix",
      tip: "월급날 먼저 떼어 두는 방식이 잘 지켜져요. 절세계좌(연금저축·IRP·ISA)를 먼저 채울지 비교해 보세요.",
    },
    {
      id: "debt", label: "대출 상환 비율", value: `${pct(debt)}%`, line: `${L.debtRate}% 이하`,
      status: pct(debt) <= L.debtRate * 0.75 ? "good" : pct(debt) <= L.debtRate ? "watch" : "fix",
      tip: "금리가 높은 대출부터 갚는 순서를 정해요. 정책 대환·채무조정 대상인지도 확인해요.",
    },
    {
      id: "insurance", label: "보장성 보험료 비율", value: `${pct(ins)}%`, line: `${L.insuranceRate}% 이하`,
      status: pct(ins) <= L.insuranceRate * 0.8 ? "good" : pct(ins) <= L.insuranceRate ? "watch" : "fix",
      tip: "실손이 겹치지 않는지, 만기·납입 기간이 남은 기간과 맞는지 증권을 펴고 확인해요. 해지는 새 가입 뒤에 따져요.",
    },
  ];
  return {
    asOf: HOUSEHOLD_CHECKUP_AS_OF,
    items,
    leftover,
    leftoverPct: pct(leftover),
    fixFirst: items.filter((i) => i.status === "fix").map((i) => i.id),
    note: "참고선은 법이나 규정이 아니라 재무 상담에서 흔히 쓰는 어림 기준이에요. 상품 추천·투자 권유가 아니에요.",
  };
}
