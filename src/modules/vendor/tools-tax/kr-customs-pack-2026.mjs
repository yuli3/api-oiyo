// GENERATED from tools-oiyo src/lib/kr-customs-pack-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 관세 실무 팩 (2026-11-20, 전문 직군 전수조사 #5): 여행자 휴대품 세금, 해외직구 같은 날 합산과세, FTA 부가가치기준(RVC), 간이정액환급.
// 같은 코드가 oiyo-kr-law-guide 스킬 scripts/guide.mjs calc customs 로 들어가요. 어림 계산이고 세관 결정을 대신하지 않아요.
// 근거:
// - 여행자 휴대품: 관세법 제96조(여행자 휴대품 면세, 자진신고 감면), 시행규칙 제48조(기본 면세 범위), 제81조(간이세율), 제241조 ⑤(미신고 가산세).
//   2026-11 기준 기사·관세청 안내로 확인: 800달러, 자진신고 30%(한도 20만 원), 미신고 40%(2년 안 2회 이상 60%), 술 2병·2L·400달러, 담배 200개비, 향수 100ml.
//   간이세율 20%는 일반 물품 기준이고 술·고가 시계·보석 등은 품목 세율이 따로 붙어요 → rate로 바꿔 넣어요.
// - 해외직구: 관세법 제94조, 시행규칙 제45조(자가사용 물품가격 150달러, 미국발 200달러 이하 면세; 같은 날 입항한 물품은 합산해 판단).
//   과세가격은 물품가격 + 운임(관세법 제30조), 부가세 10%는 과세가격 + 관세에 매겨요(부가가치세법 제29조 ②).
// - RVC: FTA관세특례법 제7조와 각 협정 원산지 규정. 공제법 = (조정가치 − 비원산지재료가치) / 조정가치, 집적법 = 원산지재료가치 / 조정가치.
//   기준 비율은 협정·품목마다 달라 사용자가 넣어요.
// - 간이정액환급: 수출용원재료에 대한 관세 등 환급에 관한 특례법 제13조(중소기업 간이정액환급), 제14조(수출신고수리일부터 2년 안 청구).
//   환급액 = 수출금액(FOB 원화) 1만 원당 정액환급률표 금액.
export const CUSTOMS_AS_OF = "2026-11-20";

const pos = (v         ) => Math.max(0, Number(v) || 0);
const floor10 = (n        ) => Math.floor(n / 10) * 10;

// ---- 여행자 휴대품 ----
export const TRAVELER = {
  allowanceUsd: 800,
  simpleRate: 0.2,
  selfReportRate: 0.3,
  selfReportCap: 200_000,
  penaltyRate: 0.4,
  repeatPenaltyRate: 0.6,
};

/** 800달러와 별도로 면세되는 것. */
export const TRAVELER_EXTRA = ["술 2병 이하·합계 2L 이하·400달러 이하(19세 이상)", "담배 200개비(19세 이상)", "향수 100ml 이하", "농림축산물 10만 원 이하(품목별 5kg·총 40kg)"];

                             
                                        
                   
                    
             
                                      
                
                       
                                           
                                    
  

/** 휴대품 세금: (합계 − 800달러) × 환율 × 간이세율, 자진신고 30% 감면(한도 있음), 미신고면 가산세. */
export function travelerTax(x               ) {
  const over = Math.max(0, pos(x.totalUsd) - TRAVELER.allowanceUsd);
  const base = Math.round(over * pos(x.fx));
  const rate = x.rate ?? TRAVELER.simpleRate;
  const tax = floor10(base * rate);
  const caught = x.caught ?? "no";
  const reduction = x.selfReport && caught === "no" ? Math.min(floor10(tax * TRAVELER.selfReportRate), TRAVELER.selfReportCap) : 0;
  const penalty = caught === "no" ? 0 : floor10(tax * (caught === "repeat" ? TRAVELER.repeatPenaltyRate : TRAVELER.penaltyRate));
  return { overUsd: over, base, rate, tax, reduction, penalty, total: tax - reduction + penalty };
}

// ---- 해외직구 같은 날 합산과세 ----
                                                                                                                                               

/**
 * 같은 날 입항하는 주문을 묶어 면세 기준을 넘는지 봐요. 넘으면 그날 물품 전체가 과세돼요.
 * 미국발과 그 밖이 섞이면 150달러 기준으로 봐요(보수적으로).
 */
export function directBundles(orders               , fx        , dutyRate = 0.08) {
  const byDay = new Map                       ();
  for (const o of orders) byDay.set(o.arrival, [...(byDay.get(o.arrival) ?? []), o]);
  return [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([arrival, list]) => {
    const price = list.reduce((s, o) => s + pos(o.priceUsd), 0);
    const limit = list.every((o) => o.fromUs) ? 200 : 150;
    const taxed = price > limit;
    const value = Math.round((price + list.reduce((s, o) => s + pos(o.shippingUsd), 0)) * pos(fx));
    const duty = taxed ? floor10(value * dutyRate) : 0;
    const vat = taxed ? floor10((value + duty) * 0.1) : 0;
    return { arrival, orders: list.map((o) => o.label), priceUsd: price, limit, taxed, value, duty, vat, total: duty + vat };
  });
}

// ---- FTA 부가가치기준 ----
                                                                                                                                                                  

export function rvc(x          ) {
  const v = pos(x.value);
  if (!v) return { rate: 0, pass: false, headroom: 0 };
  const rate = x.method === "build-up" ? pos(x.originating) / v : (v - pos(x.nonOriginating)) / v;
  const pct = Math.round(rate * 10000) / 100;
  // 공제법이면 비원산지재료를 얼마까지 더 써도 되는지(여유분).
  const headroom = x.method === "build-down" ? Math.max(0, Math.floor((v * (100 - pos(x.threshold))) / 100 - pos(x.nonOriginating) + 1e-9)) : Math.max(0, Math.floor(pos(x.originating) - (v * pos(x.threshold)) / 100 + 1e-9));
  return { rate: pct, pass: pct >= pos(x.threshold), headroom };
}

// ---- 간이정액환급 ----
                                                                                                                     

export function simpleRefund(x             ) {
  const units = Math.floor(pos(x.fobKrw) / 10_000);
  const amount = units * pos(x.perTenThousand);
  let due                = null;
  if (x.accepted) {
    const [Y, M, D] = x.accepted.split("-").map(Number);
    const d = new Date(Date.UTC(Y + 2, M - 1, D));
    if (d.getUTCDate() !== D) d.setUTCDate(0);
    due = d.toISOString().slice(0, 10);
  }
  return { units, amount, due };
}

export const CUSTOMS_NOTE = "관세 어림 계산이에요. 품목별 세율·개별소비세·주세, 원산지 판정, 환급률표는 세관(유니패스)과 관세사 확인이 필요해요. 신고 대리는 관세사 업무예요.";
