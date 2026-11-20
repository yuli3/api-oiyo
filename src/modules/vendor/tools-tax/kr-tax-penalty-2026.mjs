// GENERATED from tools-oiyo src/lib/kr-tax-penalty-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 국세 가산세 통합 어림 (2026-11-20, 전문 직군 전수조사 3번). 부가세 가산세 도구(vat-penalty-calculator)를 소득세·법인세·양도세·
// 상속·증여세·원천세로 넓힌 계산이에요. 같은 코드가 kr-tax-advisor 스킬 calc.mjs penalty로 들어가요.
// 근거(국세기본법):
// - 무신고 제47조의2: 일반 20%, 부정 40%. 복식부기의무자·법인은 수입금액의 0.07%(부정 0.14%)와 비교해 큰 금액.
// - 과소신고·초과환급 제47조의3: 일반 10%, 부정 40%.
// - 납부지연 제47조의4: 미납세액 × 경과일수 × 0.022%. 원천징수 납부지연은 3% + 일 0.022%, 합계 10% 한도(제47조의5).
// - 감면 제48조 ②: 수정신고 1개월 90%·3개월 75%·6개월 50%·1년 30%·1년 6개월 20%·2년 10%,
//   기한후신고 1개월 50%·3개월 30%·6개월 20%. 경정할 것을 미리 알고 낸 경우(세무조사 통지 등)는 감면이 없어요. 납부지연 가산세는 감면되지 않아요.
export const PENALTY_AS_OF = "2026-11-20";
const floor10 = (n        ) => Math.floor(Math.round(n) / 10) * 10;
const pos = (n                    ) => Math.max(0, Number(n) || 0);
const DAY = 86_400_000;
const parse = (s         ) => (s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(`${s}T00:00:00Z`) : null);
const addMonths = (d      , m        ) => {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + m, 1));
  const last = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)).getUTCDate();
  return new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), Math.min(d.getUTCDate(), last)));
};

const AMEND_STEPS                     = [[1, 0.9], [3, 0.75], [6, 0.5], [12, 0.3], [18, 0.2], [24, 0.1]];
const LATE_STEPS                     = [[1, 0.5], [3, 0.3], [6, 0.2]];

/** 법정신고기한(due) 뒤 filed까지 지난 개월 구간에 맞는 감면율. */
export function reductionRate(kind                  , due        , filed        )         {
  const d = parse(due), f = parse(filed);
  if (!d || !f || f <= d) return 0;
  for (const [m, r] of kind === "none" ? LATE_STEPS : AMEND_STEPS) if (f <= addMonths(d, m)) return r;
  return 0;
}

                            
                                                               
                                         
                                  
              
                  
                                        
                   
                  
              
                                 
                 
                                       
                
                                   
                    
  

export function taxPenalty(x              , today         ) {
  const tax = pos(x.tax);
  const due = parse(x.due);
  const paidStr = x.paid || (x.kind === "withholding" ? "" : x.filed) || today || "";
  const paid = parse(paidStr);
  const days = due && paid && paid > due ? Math.round((paid.getTime() - due.getTime()) / DAY) : 0;
  if (x.kind === "withholding") {
    const delay = floor10(Math.min(tax * 0.1, tax * 0.03 + tax * 0.00022 * days));
    return { kind: x.kind, tax, days, filingRate: 0, filingBase: 0, reduction: 0, filing: 0, delay, total: delay, cite: "국세기본법 제47조의5" };
  }
  let filingRate = x.kind === "none" ? (x.fraud ? 0.4 : 0.2) : x.fraud ? 0.4 : 0.1;
  let filingBase = tax * filingRate;
  if (x.kind === "none" && pos(x.revenue) > 0) {
    const alt = pos(x.revenue) * (x.fraud ? 0.0014 : 0.0007);
    if (alt > filingBase) { filingBase = alt; filingRate = tax > 0 ? alt / tax : 0; }
  }
  const reduction = x.noticed || !x.filed ? 0 : reductionRate(x.kind, x.due, x.filed);
  const filing = floor10(filingBase * (1 - reduction));
  const delay = floor10(tax * 0.00022 * days);
  return { kind: x.kind, tax, days, filingRate, filingBase: floor10(filingBase), reduction, filing, delay, total: filing + delay, cite: x.kind === "none" ? "국세기본법 제47조의2·제47조의4·제48조" : "국세기본법 제47조의3·제47조의4·제48조" };
}

/** 오늘 신고·납부하면 vs 한 달 더 미루면: 감면 구간이 바뀌는 날을 보여 줘요. */
export function nextReductionStep(kind                  , due        , filed        )                                         {
  const d = parse(due), f = parse(filed);
  if (!d || !f) return null;
  for (const [m, r] of kind === "none" ? LATE_STEPS : AMEND_STEPS) {
    const end = addMonths(d, m);
    if (f <= end) return { until: end.toISOString().slice(0, 10), rate: r };
  }
  return null;
}

export const PENALTY_NOTE = "가산세 어림이에요. 부가세의 세금계산서 관련 가산세, 영수증·증빙 가산세처럼 따로 붙는 가산세는 빠져 있어요. 세무조사 통지를 받은 뒤 내는 신고는 감면이 없어요.";
