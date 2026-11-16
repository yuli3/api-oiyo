// GENERATED from tools-oiyo src/lib/biz-ops.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 운영 문제 8유형 계산 엔진 (2026-11-16).
// WHY: CHOSEUN asked for tools that solve the eight kinds of operating problems a consumer-goods group
// meets (campaign supply, influencer deals, quality recovery, alternative materials, big orders vs promises,
// overseas tests, sales rebates to related parties, acquisition and integration). Pure functions, no I/O:
// the tools.oiyo.net pages, api.oiyo.net MCP tools and the Claude skill all run this same file.
// Inputs are the user's numbers; anything a statute decides is stated with its article, never guessed.

export const OPS_AS_OF = "2026-11-16";

const fin = (n        ) => (Number.isFinite(n) ? n : 0);
const clamp = (n        , lo        , hi        ) => Math.min(hi, Math.max(lo, n));
const round = (n        , digits = 6) => {
  if (!Number.isFinite(n)) return n;
  const f = 10 ** digits;
  return Math.round(n * f) / f;
};
const sum = (xs          ) => xs.reduce((s, x) => s + x, 0);

// ───────────────────────── 1. 캠페인 수요·공급 일정 ─────────────────────────

                                      
                    
                   
              
                       
                      
                          
                                 
                        
                     
                       
 

export function campaignSupply(i                     ) {
  const cap = Math.max(0, fin(i.capacityPerWeek));
  const lead = Math.max(0, Math.round(fin(i.leadTimeWeeks)));
  const safety = Math.max(0, fin(i.safetyStock ?? 0));
  let stock = Math.max(0, fin(i.openingStock));
  let cumDemand = 0;
  let cumSupply = Math.max(0, fin(i.openingStock));
  const weeks                                                                                                       = [];
  let firstStockout                = null;
  let firstBelowSafety                = null;
  let extraPerWeek = 0;
  let unfixable = 0;
  i.demand.forEach((raw, k) => {
    const week = k + 1;
    const d = Math.max(0, fin(raw));
    cumDemand += d;
    cumSupply += cap;
    // 추가 생산 x를 (lead+1)주차부터 매주 넣으면 week주차까지 x × (week − lead)개가 더 들어와요.
    const deficit = cumDemand + safety - cumSupply;
    if (deficit > 0) {
      if (week > lead) extraPerWeek = Math.max(extraPerWeek, deficit / (week - lead));
      else unfixable = Math.max(unfixable, deficit);
    }
    const available = stock + cap;
    const shipped = Math.min(available, d);
    const shortage = d - shipped;
    stock = available - shipped;
    if (shortage > 0 && firstStockout === null) firstStockout = week;
    if (stock < safety && firstBelowSafety === null) firstBelowSafety = week;
    weeks.push({ week, demand: round(d, 2), supply: round(cap, 2), shipped: round(shipped, 2), shortage: round(shortage, 2), stock: round(stock, 2) });
  });
  const totalDemand = sum(weeks.map((w) => w.demand));
  const totalShortage = sum(weeks.map((w) => w.shortage));
  return {
    weeks,
    firstStockoutWeek: firstStockout,
    firstBelowSafetyWeek: firstBelowSafety,
    totalShortage: round(totalShortage, 2),
    fillRate: totalDemand > 0 ? round(1 - totalShortage / totalDemand, 4) : 1,
    extraPerWeek: Math.ceil(extraPerWeek - 1e-9),
    extraStartWeek: lead + 1,
    /** 리드타임 안에 생기는 부족분: 추가 생산으로는 못 막아요(재고 이동·수요 조정 필요) */
    unfixableShortage: Math.ceil(unfixable - 1e-9),
  };
}

// ───────────────────────── 2. 인플루언서 계약·집행 ─────────────────────────

                                                             
export const PAYEE_LABEL                                                                   = {
  freelancer: { name: "개인(계속 활동, 사업소득 3.3%)", rate: 0.033, basis: "소득세법 제129조 제1항 제3호(3%) + 지방소득세 10%" },
  oneOff: { name: "개인(일시 활동, 기타소득 8.8%)", rate: 0.088, basis: "소득세법 제21조·시행령 제87조(필요경비 60%), 제129조(20%) + 지방소득세 10%" },
  business: { name: "사업자(세금계산서, 부가세 10% 별도)", rate: 0, basis: "부가가치세법 제32조(세금계산서), 원천징수 없음" },
};

                                  
                   
              
               
                
                   
                    
                   
                         
                 
              
               
                      
                          
                           
                   
 

export function influencerDeal(i                 ) {
  const views = Math.max(0, fin(i.views));
  const clicks = views * clamp(fin(i.clickRate), 0, 1);
  const orders = clicks * clamp(fin(i.conversionRate), 0, 1);
  const revenue = orders * Math.max(0, fin(i.aov));
  const perf = revenue * clamp(fin(i.performanceRate ?? 0), 0, 1);
  const fee = Math.max(0, fin(i.fee));
  const totalCost = fee + perf;
  const contribution = revenue * clamp(fin(i.grossMargin), 0, 1) - totalCost;
  const p = PAYEE_LABEL[i.payee];
  const withholding = i.payee === "business" ? 0 : Math.floor((totalCost * p.rate) / 10) * 10;
  const unitMargin = Math.max(0, fin(i.aov)) * clamp(fin(i.grossMargin), 0, 1) * (1 - clamp(fin(i.performanceRate ?? 0), 0, 1));
  const breakEvenOrders = unitMargin > 0 ? fee / unitMargin : Infinity;
  return {
    clicks: round(clicks, 2), orders: round(orders, 2), revenue: round(revenue, 0),
    performanceFee: round(perf, 0), totalCost: round(totalCost, 0), contribution: round(contribution, 0),
    roas: totalCost > 0 ? round(revenue / totalCost, 3) : null,
    roi: totalCost > 0 ? round(contribution / totalCost, 3) : null,
    cpm: views > 0 ? round((totalCost / views) * 1000, 0) : null,
    cpa: orders > 0 ? round(totalCost / orders, 0) : null,
    breakEvenOrders: round(breakEvenOrders, 1),
    breakEvenConversion: clicks > 0 && Number.isFinite(breakEvenOrders) ? round(breakEvenOrders / clicks, 6) : null,
    withholding, netPaid: totalCost - withholding,
    vat: i.payee === "business" ? Math.round(totalCost * 0.1) : 0,
    payee: p,
  };
}

/** 계약 전 꼭 넣을 것(추천·보증 표시와 원천징수 등). */
export const INFLUENCER_CHECKS = [
  { text: "게시물 첫머리에 '광고'·'협찬' 등 경제적 이해관계를 표시하도록 계약서에 쓴다", basis: "표시·광고의 공정화에 관한 법률 제3조, 공정위 추천·보증 등에 관한 표시·광고 심사지침" },
  { text: "효능·효과 표현은 화장품법상 허용 범위(기능성 심사 내용) 안에서만 쓰게 한다", basis: "화장품법 제13조(부당한 표시·광고 금지)" },
  { text: "지급할 때 원천징수(3.3%·8.8%)하고 다음 달 10일까지 신고·납부, 지급명세서 제출", basis: "소득세법 제127조·제128조·제164조" },
  { text: "성과 수수료는 집계 기준(쿠폰 코드·추적 링크)과 반품 차감을 계약서에 정한다", basis: "경험칙" },
  { text: "게시 기간·삭제 금지·2차 활용(광고 소재) 범위와 대가를 따로 정한다", basis: "저작권법 제46조(이용허락)" },
];

// ───────────────────────── 3. 품질 이슈·공급 복구 ─────────────────────────

                             
             
                
                         
                     
                              
                       
 
                                   
               
                    
                 
                        
                   
                       
                         
 
                                       
                     
                               
                            
                  
                            
                        
                    
                                
 

                                                                

export function allocateSupply(supply        , customers                    , rule                ) {
  let left = Math.max(0, fin(supply));
  const alloc = new Map                (customers.map((c) => [c.name, 0]));
  const demandOf = (c                  ) => Math.max(0, fin(c.demand));
  if (rule === "proRata") {
    const total = sum(customers.map(demandOf));
    const share = total > 0 ? Math.min(1, left / total) : 0;
    for (const c of customers) alloc.set(c.name, Math.floor(demandOf(c) * share));
  } else {
    const order = [...customers].sort((a, b) =>
      rule === "priority" ? a.priority - b.priority || b.penaltyPerUnit - a.penaltyPerUnit : b.penaltyPerUnit - a.penaltyPerUnit || a.priority - b.priority,
    );
    for (const c of order) {
      const give = Math.min(left, demandOf(c));
      alloc.set(c.name, give);
      left -= give;
    }
  }
  const rows = customers.map((c) => {
    const given = alloc.get(c.name) ?? 0;
    const short = demandOf(c) - given;
    return { name: c.name, demand: demandOf(c), allocated: given, short, fillRate: demandOf(c) > 0 ? round(given / demandOf(c), 4) : 1, penalty: round(short * Math.max(0, fin(c.penaltyPerUnit)), 0) };
  });
  return { rule, rows, totalPenalty: sum(rows.map((r) => r.penalty)), totalShort: sum(rows.map((r) => r.short)) };
}

export function qualityRecovery(i                      ) {
  const lots = i.lots.map((l) => {
    const units = Math.max(0, fin(l.units));
    const defects = units * clamp(fin(l.defectRate), 0, 1);
    const inMarket = units * clamp(fin(l.shippedRatio), 0, 1);
    return { id: l.id, units, defects: round(defects, 1), inMarket: round(inMarket, 1), inWarehouse: round(units - inMarket, 1) };
  });
  const units = sum(lots.map((l) => l.units));
  const defects = sum(lots.map((l) => l.defects));
  const inMarket = sum(lots.map((l) => l.inMarket));
  const recall = Math.max(0, fin(i.recallCostPerUnit));
  const remake = Math.max(0, fin(i.remakeCostPerUnit));
  // 범위: 불량만 골라내기 vs 해당 로트 전량
  const scopes = [
    { scope: "defectsOnly", label: "불량품만 회수·교체", units: defects, cost: round(defects * (recall + remake), 0) },
    { scope: "marketLots", label: "시장에 나간 해당 로트 전량 회수", units: inMarket, cost: round(inMarket * (recall + remake), 0) },
    { scope: "allLots", label: "해당 로트 전량(창고 포함) 폐기·재생산", units, cost: round(inMarket * recall + units * remake, 0) },
  ];
  const usable = Math.max(0, fin(i.goodStock));
  const allocations = (["priority", "penalty", "proRata"]                    ).map((r) => allocateSupply(usable, i.customers, r));
  const best = allocations.reduce((a, b) => (b.totalPenalty < a.totalPenalty ? b : a));
  return { lots, totals: { units, defects: round(defects, 1), inMarket: round(inMarket, 1), defectRate: units > 0 ? round(defects / units, 4) : 0 }, scopes, allocations, cheapestRule: best.rule };
}

// ───────────────────────── 4. 대체 원료 검토 ─────────────────────────

                                    
               
                    
                     
                  
                            
                 
                     
                    
                 
                   
                                        
                        
 

                                
                       
                       
                                  
                         
                                                                            
                            
                       
 

export function materialSwitch(i               ) {
  const vol = Math.max(0, fin(i.annualVolume));
  const filing = Math.max(0, fin(i.filingWeeks ?? 8));
  const rows = i.candidates.map((c) => {
    const annualSaving = (fin(i.currentPrice) - fin(c.unitPrice)) * vol;
    const weeks = Math.max(0, fin(c.testWeeks)) + (c.needsFiling ? filing : 0);
    const payback = annualSaving > 0 ? (fin(c.testCost) / annualSaving) * 12 : Infinity;
    return { name: c.name, annualSaving: round(annualSaving, 0), weeksToApproval: weeks, paybackMonths: round(payback, 1), quality: c.quality, supply: c.supply, unitPrice: c.unitPrice };
  });
  // 점수 1~5로 맞추기: 원가는 가장 싼 것이 5, 속도는 가장 빠른 것이 5
  const prices = rows.map((r) => fin(r.unitPrice));
  const weeks = rows.map((r) => r.weeksToApproval);
  const scale = (v        , lo        , hi        , invert         ) => (hi - lo < 1e-9 ? 5 : 1 + 4 * (invert ? (hi - v) / (hi - lo) : (v - lo) / (hi - lo)));
  const w = i.weights;
  const wsum = Math.max(1e-9, w.cost + w.quality + w.supply + w.speed);
  const scored = rows.map((r) => {
    const s = {
      cost: scale(fin(r.unitPrice), Math.min(...prices), Math.max(...prices), true),
      quality: clamp(fin(r.quality), 1, 5),
      supply: clamp(fin(r.supply), 1, 5),
      speed: scale(r.weeksToApproval, Math.min(...weeks), Math.max(...weeks), true),
    };
    const total = (s.cost * w.cost + s.quality * w.quality + s.supply * w.supply + s.speed * w.speed) / wsum;
    return { ...r, scores: { cost: round(s.cost, 2), quality: s.quality, supply: s.supply, speed: round(s.speed, 2) }, total: round(total, 3) };
  });
  const ranked = [...scored].sort((a, b) => b.total - a.total);
  const warnings           = [];
  for (const r of scored) {
    if (r.quality < 3) warnings.push(`${r.name}: 품질 점수가 3 미만이라 원가가 싸도 고객 불만·반품 위험이 커요.`);
    if (r.annualSaving <= 0) warnings.push(`${r.name}: 지금 원료보다 비싸요. 공급 안정성 때문이 아니면 바꿀 이유가 약해요.`);
  }
  return { rows: scored, ranked, best: ranked[0]?.name ?? null, warnings };
}

// ───────────────────────── 5. 대형 수주 vs 기존 고객 약속 ─────────────────────────

                              
               
              
                
                   
                              
                         
                         
                   
 
                                       
                    
                   
                          
                                                                                            
                                    
                         
                            
 

function planProfit(i                      , newQty        , useExtra         ) {
  const cap = Math.max(0, fin(i.capacity)) + (useExtra ? Math.max(0, fin(i.extraCapacity ?? 0)) : 0);
  let left = cap - newQty;
  // 기존 약속은 지킬 가치(마진 + 위약금)가 큰 순서로 채워요. locked는 맨 앞.
  const order = [...i.existing].sort((a, b) => Number(!!b.locked) - Number(!!a.locked) || b.price - b.unitCost + b.penaltyPerUnit - (a.price - a.unitCost + a.penaltyPerUnit));
  const rows = order.map((o) => {
    const give = Math.max(0, Math.min(left, Math.max(0, fin(o.qty))));
    left -= give;
    const short = Math.max(0, fin(o.qty)) - give;
    return { name: o.name, qty: fin(o.qty), delivered: give, short, profit: give * (fin(o.price) - fin(o.unitCost)) - short * Math.max(0, fin(o.penaltyPerUnit)), locked: !!o.locked };
  });
  const used = cap - Math.max(0, left);
  const extraUsed = useExtra ? Math.max(0, used - Math.max(0, fin(i.capacity))) : 0;
  const newProfit = newQty * (fin(i.newOrder.price) - fin(i.newOrder.unitCost));
  const profit = sum(rows.map((r) => r.profit)) + newProfit - extraUsed * Math.max(0, fin(i.extraCostPerUnit ?? 0));
  const lockedBroken = rows.some((r) => r.locked && r.short > 0);
  return { newQty, useExtra, rows, extraUsed, profit: round(profit, 0), lockedBroken };
}

export function orderAllocation(i                      ) {
  const full = Math.max(0, fin(i.newOrder.qty));
  const min = clamp(fin(i.newOrder.minQty ?? full), 0, full);
  const lockedQty = sum(i.existing.filter((o) => o.locked).map((o) => Math.max(0, fin(o.qty))));
  const options                                                                     = [];
  const push = (key        , label        , q        , extra         ) => options.push({ key, label, ...planProfit(i, q, extra) });
  push("decline", "새 주문 거절", 0, false);
  push("full", "새 주문 전량 수락", full, false);
  // 일부 수락: 남는 능력만(기존 약속을 하나도 안 깨는 양) — 최소 수량 이상일 때만
  const spare = Math.max(0, fin(i.capacity) - sum(i.existing.map((o) => Math.max(0, fin(o.qty)))));
  if (spare >= min && spare < full) push("partial", `남는 능력만 수락(${Math.floor(spare)}개)`, Math.floor(spare), false);
  if (fin(i.extraCapacity ?? 0) > 0) push("fullExtra", "전량 수락 + 특근·외주", full, true);
  // 이익이 가장 큰 수락량을 찾아요(최소 수량 이상, 능력 안).
  const maxQ = Math.min(full, Math.max(0, fin(i.capacity) + Math.max(0, fin(i.extraCapacity ?? 0)) - lockedQty));
  let bestQ = 0;
  let bestP = planProfit(i, 0, true).profit;
  const steps = 100;
  for (let k = 1; k <= steps; k++) {
    const q = Math.round((maxQ * k) / steps);
    if (q < min) continue;
    const p = planProfit(i, q, true).profit;
    if (p > bestP) { bestP = p; bestQ = q; }
  }
  if (bestQ > 0 && !options.some((o) => o.newQty === bestQ && o.useExtra)) push("optimal", `이익 최대 수락량(${bestQ}개)`, bestQ, true);
  const valid = options.filter((o) => !o.lockedBroken && (o.newQty === 0 || o.newQty >= min));
  const best = valid.reduce((a, b) => (b.profit > a.profit ? b : a), valid[0] ?? options[0]);
  return { options, recommended: best.key, lockedQty, spareCapacity: spare };
}

// ───────────────────────── 6. 해외 시장 실험 ─────────────────────────

/** 표준정규 누적분포(Abramowitz-Stegun 26.2.17, 오차 < 7.5e-8) */
export function normCdf(z        ) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327 * Math.exp((-z * z) / 2);
  const p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return z >= 0 ? 1 - p : p;
}
/** 표준정규 역함수(Acklam) */
export function normInv(p        )         {
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const q = clamp(p, 1e-12, 1 - 1e-12);
  if (q < 0.02425) {
    const r = Math.sqrt(-2 * Math.log(q));
    return (((((c[0] * r + c[1]) * r + c[2]) * r + c[3]) * r + c[4]) * r + c[5]) / ((((d[0] * r + d[1]) * r + d[2]) * r + d[3]) * r + 1);
  }
  if (q > 1 - 0.02425) return -normInv(1 - q);
  const r = q - 0.5;
  const s = r * r;
  return ((((((a[0] * s + a[1]) * s + a[2]) * s + a[3]) * s + a[4]) * s + a[5]) * r) / (((((b[0] * s + b[1]) * s + b[2]) * s + b[3]) * s + b[4]) * s + 1);
}

/** 두 비율 비교(양측) 한 그룹당 필요한 표본 수 */
export function sampleSizePerGroup(baseline        , relativeLift        , alpha = 0.05, power = 0.8) {
  const p1 = clamp(fin(baseline), 1e-6, 1 - 1e-6);
  const p2 = clamp(p1 * (1 + fin(relativeLift)), 1e-6, 1 - 1e-6);
  const za = normInv(1 - alpha / 2);
  const zb = normInv(power);
  const pbar = (p1 + p2) / 2;
  const n = (za * Math.sqrt(2 * pbar * (1 - pbar)) + zb * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2))) ** 2 / (p2 - p1) ** 2;
  return Number.isFinite(n) ? Math.ceil(n) : Infinity;
}

/** 두 비율 z-검정(양측) */
export function proportionTest(convA        , nA        , convB        , nB        ) {
  const pa = nA > 0 ? convA / nA : 0;
  const pb = nB > 0 ? convB / nB : 0;
  const pool = nA + nB > 0 ? (convA + convB) / (nA + nB) : 0;
  const se = Math.sqrt(pool * (1 - pool) * (1 / Math.max(1, nA) + 1 / Math.max(1, nB)));
  const z = se > 0 ? (pb - pa) / se : 0;
  const pValue = 2 * (1 - normCdf(Math.abs(z)));
  const seDiff = Math.sqrt((pa * (1 - pa)) / Math.max(1, nA) + (pb * (1 - pb)) / Math.max(1, nB));
  return { rateA: round(pa, 6), rateB: round(pb, 6), lift: pa > 0 ? round(pb / pa - 1, 4) : null, z: round(z, 4), pValue: round(pValue, 6), ci95: [round(pb - pa - 1.96 * seDiff, 6), round(pb - pa + 1.96 * seDiff, 6)]                     };
}

                                  
                       
                   
               
                         
              
                             
                    
                            
                       
                              
                    
                              
                      
 

export function marketEntry(i                 ) {
  const orders = Math.max(0, fin(i.visitors)) * clamp(fin(i.conversionRate), 0, 1);
  const revenue = orders * Math.max(0, fin(i.aov));
  const contribution = revenue * (1 - clamp(fin(i.costRatio), 0, 1));
  const monthlyContribution = contribution * Math.max(0, fin(i.scaleFactor));
  const monthlyProfit = monthlyContribution - Math.max(0, fin(i.monthlyFixed));
  const payback = monthlyProfit > 0 ? Math.max(0, fin(i.entryCost)) / monthlyProfit : Infinity;
  const unitContribution = Math.max(0, fin(i.aov)) * (1 - clamp(fin(i.costRatio), 0, 1));
  const breakEvenConversion = unitContribution > 0 && fin(i.visitors) * fin(i.scaleFactor) > 0 ? fin(i.monthlyFixed) / unitContribution / (fin(i.visitors) * fin(i.scaleFactor)) : Infinity;
  const verdict = monthlyProfit <= 0 ? "stop" : payback <= 12 ? "go" : payback <= 24 ? "extend" : "stop";
  return {
    testOrders: round(orders, 1), testRevenue: round(revenue, 0), monthlyContribution: round(monthlyContribution, 0), monthlyProfit: round(monthlyProfit, 0),
    paybackMonths: round(payback, 1), breakEvenConversion: round(breakEvenConversion, 6), verdict,
    verdictText: { go: "회수 12개월 이내: 본 진출을 검토해요.", extend: "회수 12~24개월: 실험을 늘려 전환율·객단가를 더 확인해요.", stop: "적자이거나 회수가 24개월 넘게 걸려요: 조건을 바꾸거나 멈춰요." }[verdict],
  };
}

// ───────────────────────── 7. 판매장려금·특수관계 거래처 ─────────────────────────

                             
                     
               
             
               
 
                                
               
                
                               
                 
                    
                      
                
 
                              
                      
                            
                                      
                           
                                        
                           
 

export function tierRate(tiers              , sales        ) {
  const sorted = [...tiers].sort((a, b) => a.from - b.from);
  let r = 0;
  for (const t of sorted) if (sales >= t.from) r = t.rate;
  return r;
}

export function rebateCheck(i             ) {
  const groupSales = new Map                ();
  for (const p of i.partners) if (p.group) groupSales.set(p.group, (groupSales.get(p.group) ?? 0) + Math.max(0, fin(p.sales)));
  const rows = i.partners.map((p) => {
    const sales = Math.max(0, fin(p.sales));
    const basisSales = i.aggregateGroups && p.group ? groupSales.get(p.group)  : sales;
    const rate = tierRate(i.tiers, basisSales);
    const due = Math.floor(sales * rate);
    const paid = p.paid === undefined ? null : Math.max(0, fin(p.paid));
    return { name: p.name, group: p.group ?? null, related: !!p.related, sales, basisSales, rate, due, paid, diff: paid === null ? null : paid - due };
  });
  const unrelatedRates = rows.filter((r) => !r.related && r.sales > 0).map((r) => (r.paid ?? r.due) / r.sales);
  const lo = unrelatedRates.length ? Math.min(...unrelatedRates) : null;
  const hi = unrelatedRates.length ? Math.max(...unrelatedRates) : null;
  const flags                                                              = [];
  for (const r of rows) {
    if (r.diff !== null && r.diff > 0) flags.push({ name: r.name, level: "block", text: `계약 기준보다 ${r.diff.toLocaleString("ko-KR")}원 더 지급(요청)돼요. 초과분은 보류해요.` });
    if (r.diff !== null && r.diff < 0) flags.push({ name: r.name, level: "review", text: `계약 기준보다 ${(-r.diff).toLocaleString("ko-KR")}원 덜 지급돼요. 누락인지 확인해요.` });
    if (i.armsLengthCheck && r.related && r.sales > 0 && hi !== null) {
      const effective = (r.paid ?? r.due) / r.sales;
      if (effective > hi + 1e-9) flags.push({ name: r.name, level: "review", text: `특수관계 거래처 장려금률 ${(effective * 100).toFixed(2)}%가 일반 거래처 범위(${((lo ?? 0) * 100).toFixed(2)}~${(hi * 100).toFixed(2)}%)보다 높아요. 부당행위계산 부인 대상인지 검토해요.` });
    }
    if (!i.aggregateGroups && r.group && (groupSales.get(r.group) ?? 0) > r.sales) {
      const rateIfGrouped = tierRate(i.tiers, groupSales.get(r.group) );
      if (rateIfGrouped !== r.rate) flags.push({ name: r.name, level: "review", text: `묶음 '${r.group}'을 합치면 구간이 ${(r.rate * 100).toFixed(1)}% → ${(rateIfGrouped * 100).toFixed(1)}%로 바뀌어요. 계약이 합산을 허용하는지 확인해요.` });
    }
  }
  return {
    rows, totalDue: sum(rows.map((r) => r.due)), totalPaid: sum(rows.map((r) => r.paid ?? 0)),
    armsLengthRange: lo === null ? null : [round(lo, 6), round(hi , 6)]                    ,
    flags,
    taxNotes: [
      { text: "금전으로 주는 판매장려금은 부가세 과세표준에서 빼지 않아요(공급가액 그대로).", basis: "부가가치세법 제29조 제6항" },
      { text: "현물(제품)로 주면 사업상 증여로 보아 그 시가에 부가세가 붙을 수 있어요.", basis: "부가가치세법 제10조 제5항" },
      { text: "판매장려금·판매수당은 사전약정이 없어도 판매부대비용으로 손금이에요.", basis: "법인세법 시행령 제19조 제1호의2" },
      { text: "특수관계인에게 시가보다 많이 주면 차액을 손금에서 빼고 소득처분할 수 있어요(시가와 차이 3억 원 이상 또는 5% 이상).", basis: "법인세법 제52조, 시행령 제88조 제3항" },
      { text: "특수관계 거래처 간 내부거래는 공정거래법상 부당지원 행위 여부도 봐요.", basis: "독점규제 및 공정거래에 관한 법률 제45조 제1항 제9호" },
    ],
  };
}

// ───────────────────────── 8. 인수 검토·통합 ─────────────────────────

                                   
                          
                
                    
                          
                    
                            
                         
                 
                     
                                 
                       
               
                   
                  
                             
                  
                        
                    
                      
                          
                 
 

export function acquisitionCheck(i                  ) {
  const price = Math.max(0, fin(i.price));
  const stock = clamp(fin(i.stockPortion), 0, 1);
  const tax = clamp(fin(i.taxRate), 0, 1);
  const newShares = fin(i.sharePrice) > 0 ? (price * stock) / fin(i.sharePrice) : 0;
  const debt = price * (1 - stock);
  const interestAfterTax = debt * Math.max(0, fin(i.debtRate)) * (1 - tax);
  const shares = Math.max(1, fin(i.acquirerShares));
  const epsBefore = fin(i.acquirerNetIncome) / shares;
  const ramp = Math.max(1, Math.round(fin(i.rampYears)));
  const horizon = clamp(Math.round(fin(i.years ?? 7)), 1, 20);
  const series                                                                                                                         = [];
  let cum = -price - Math.max(0, fin(i.integrationCost)) * (1 - tax);
  let paybackYear                = null;
  for (let y = 1; y <= horizon; y++) {
    const syn = Math.max(0, fin(i.synergy)) * Math.min(1, y / ramp) * (1 - tax);
    const ni = fin(i.acquirerNetIncome) + fin(i.targetNetIncome) + syn - interestAfterTax;
    const eps = ni / (shares + newShares);
    // 회수: 대상 이익 + 시너지(세후)로 인수 대금과 통합 비용을 갚는다고 봐요(이자는 비용).
    cum += fin(i.targetNetIncome) + syn - interestAfterTax;
    if (paybackYear === null && cum >= 0) paybackYear = y;
    series.push({ year: y, synergyAfterTax: round(syn, 0), netIncome: round(ni, 0), eps: round(eps, 2), accretion: epsBefore !== 0 ? round(eps / epsBefore - 1, 6) : 0, cumulativeCash: round(cum, 0) });
  }
  // 1년차 주당이익이 줄지 않으려면 필요한 세전 시너지(1년차 실현분 기준)
  const neededNi = epsBefore * (shares + newShares);
  const gap = neededNi - (fin(i.acquirerNetIncome) + fin(i.targetNetIncome) - interestAfterTax);
  const synergyForBreakeven = gap <= 0 ? 0 : tax < 1 ? (gap / (1 - tax)) * ramp : Infinity;
  return {
    newShares: round(newShares, 0), debt: round(debt, 0), interestAfterTax: round(interestAfterTax, 0),
    epsBefore: round(epsBefore, 2), series,
    year1Accretion: series[0]?.accretion ?? 0, steadyAccretion: series[Math.min(ramp, horizon) - 1]?.accretion ?? 0,
    paybackYear, impliedPe: fin(i.targetNetIncome) > 0 ? round(price / fin(i.targetNetIncome), 2) : null,
    acquirerPe: fin(i.acquirerNetIncome) > 0 ? round((fin(i.sharePrice) * shares) / fin(i.acquirerNetIncome), 2) : null,
    synergyForBreakeven: round(synergyForBreakeven, 0),
  };
}

/** 인수 후 통합(PMI) 첫 100일 기본 작업. biz-strategy scheduleCpm에 넣어 일정을 그려요. */
export const PMI_TEMPLATE = [
  { id: "dd", name: "실사 결과 정리·위험 목록", duration: 10, deps: []             },
  { id: "tsa", name: "과도기 서비스 계약(TSA)·인력 유지", duration: 15, deps: ["dd"] },
  { id: "supply", name: "공급 계약·원료 품목 통합", duration: 30, deps: ["dd"], optimistic: 20, pessimistic: 50 },
  { id: "qa", name: "품질 기준·시험 성적 맞추기", duration: 25, deps: ["supply"], optimistic: 15, pessimistic: 40 },
  { id: "it", name: "ERP·회계 계정 통합", duration: 45, deps: ["tsa"], optimistic: 30, pessimistic: 70 },
  { id: "close", name: "첫 연결 결산", duration: 15, deps: ["it"] },
  { id: "synergy", name: "시너지 1차 점검(구매 단가)", duration: 10, deps: ["qa", "close"] },
];
