// GENERATED from tools-oiyo src/lib/biz-strategy.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 경영 도구 계산 엔진 (2026-11-14). 기업가·경영팀·회계사·세무사·경리가 함께 쓰는 도구의 공용 계산.
// api 저장소가 이 파일을 그대로 복사해 MCP 도구로 내보내고, Claude 스킬(skills/oiyo-business-strategist)도
// 같은 파일에서 만든 스크립트로 계산해요. 화면 코드는 여기 숫자를 다시 계산하지 않아요.
//
// 1) 의사결정 트리: 결정 노드는 기대값이 가장 큰 가지, 확률 노드는 확률 가중 평균(롤백).
// 2) 일정: CPM(가장 이른·늦은 시작, 여유, 핵심 경로) + PERT 3점 추정과 마감 내 완료 확률.
// 3) SWOT/TOWS: 항목 점수로 전략 위치(SO·ST·WO·WT), 전문가 모드는 IFE·EFE 가중 평가(1~4점).
// 4) BCG 매트릭스: 시장성장률 × 상대 시장점유율로 스타·캐시카우·물음표·개를 나눠요.
// 5) 포지셔닝 맵: 이상점까지 거리, 가장 가까운 경쟁자, 비어 있는 자리(최대 빈 원) 찾기.
// 6) 단위경제·런웨이: LTV, CAC 회수 기간, LTV/CAC, 월별 현금 잔고와 흑자 전환 여부.
// 7) 우선순위: RICE·ICE 점수, 가중 의사결정표.
// 모두 법령이 아니라 일반 경영학 모형이에요. 숫자는 가정에 따라 크게 달라지니 민감도와 함께 봐요.

export const BIZ_AS_OF = "2026-11-14";

const fin = (n        ) => (Number.isFinite(n) ? n : 0);
const clamp = (n        , lo        , hi        ) => Math.min(hi, Math.max(lo, n));
const round = (n        , digits = 6) => {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
};

// ───────────────────────── 1. 의사결정 트리 ─────────────────────────

                      
                                                                           
                                                                         
                                                                  

                             
                
                                                  
                
                                           
                
                 
 

                                
             
                
                         
             
                         
                
                                                                                              
 

                             
                      
             
                                           
                                             
                
               
                          
                         
                 
                     
 

function normalizedProbs(branches              , warnings          , label        )           {
  const raw = branches.map((b) => Math.max(0, fin(b.prob ?? 0)));
  const sum = raw.reduce((a, b) => a + b, 0);
  if (sum <= 0) {
    warnings.push(`'${label}'의 확률이 모두 0이라 똑같이 나눴어요.`);
    return branches.map(() => 1 / Math.max(1, branches.length));
  }
  if (Math.abs(sum - 1) > 1e-6) warnings.push(`'${label}'의 확률 합이 ${round(sum * 100, 1)}%라 100%에 맞춰 비율로 조정했어요.`);
  return raw.map((p) => p / sum);
}

function evalNode(node          , warnings          , depth        )                {
  if (depth > 50) throw new Error("트리가 너무 깊어요(50단계 초과).");
  if (node.kind === "outcome") return { id: node.id, label: node.label, kind: "outcome", ev: fin(node.value), branches: [] };
  if (node.branches.length === 0) {
    warnings.push(`'${node.label}'에 가지가 없어 0으로 봤어요.`);
    return { id: node.id, label: node.label, kind: node.kind, ev: 0, branches: [] };
  }
  if (node.kind === "chance") {
    const probs = normalizedProbs(node.branches, warnings, node.label);
    const branches = node.branches.map((b, i) => {
      const child = evalNode(b.node, warnings, depth + 1);
      const cost = fin(b.cost ?? 0);
      return { label: b.label, prob: probs[i], cost, ev: child.ev - cost, node: child };
    });
    const ev = branches.reduce((s, b) => s + (b.prob ?? 0) * b.ev, 0);
    return { id: node.id, label: node.label, kind: "chance", ev, branches };
  }
  const branches = node.branches.map((b) => {
    const child = evalNode(b.node, warnings, depth + 1);
    const cost = fin(b.cost ?? 0);
    return { label: b.label, cost, ev: child.ev - cost, node: child };
  });
  let best = 0;
  branches.forEach((b, i) => {
    if (b.ev > branches[best].ev + 1e-9) best = i;
  });
  return { id: node.id, label: node.label, kind: "decision", ev: branches[best].ev, best, branches };
}

function collectProfile(node               , prob        , acc        , out                     ) {
  if (node.kind === "outcome" || node.branches.length === 0) {
    const v = round(acc + node.ev, 6);
    out.set(v, (out.get(v) ?? 0) + prob);
    return;
  }
  if (node.kind === "decision") {
    const b = node.branches[node.best ?? 0];
    collectProfile(b.node, prob, acc - b.cost, out);
    return;
  }
  for (const b of node.branches) collectProfile(b.node, prob * (b.prob ?? 0), acc - b.cost, out);
}

export function evaluateTree(tree          )             {
  const warnings           = [];
  const root = evalNode(tree, warnings, 0);
  const map = new Map                ();
  collectProfile(root, 1, 0, map);
  const profile = [...map.entries()].map(([value, prob]) => ({ value, prob: round(prob, 9) })).sort((a, b) => a.value - b.value);
  const path           = [];
  let cur                            = root;
  while (cur && cur.kind === "decision" && cur.branches.length) {
    const b                                    = cur.branches[cur.best ?? 0];
    path.push(b.label);
    cur = b.node;
  }
  return {
    root,
    ev: root.ev,
    profile,
    worst: profile.length ? profile[0].value : 0,
    best: profile.length ? profile[profile.length - 1].value : 0,
    lossProbability: round(profile.filter((p) => p.value < 0).reduce((s, p) => s + p.prob, 0), 9),
    path,
    warnings,
  };
}

/** 쉬운 모드: "선택지마다 성공 확률·성공 시·실패 시 결과"만 받아 트리를 만들어요. */
                               
                
                         
                      
                    
                 
                            
                
 

export function treeFromOptions(question        , options                )           {
  return {
    id: "root",
    label: question || "결정",
    kind: "decision",
    branches: options.map((o, i) => {
      const p = clamp(fin(o.successProb), 0, 1);
      const node           =
        p >= 1
          ? { id: `o${i}`, label: "확정", kind: "outcome", value: fin(o.ifSuccess) }
          : {
              id: `c${i}`,
              label: `${o.label} 결과`,
              kind: "chance",
              branches: [
                { label: "성공", prob: p, node: { id: `o${i}s`, label: "성공", kind: "outcome", value: fin(o.ifSuccess) } },
                { label: "실패", prob: 1 - p, node: { id: `o${i}f`, label: "실패", kind: "outcome", value: fin(o.ifFail) } },
              ],
            };
      return { label: o.label, cost: fin(o.cost ?? 0), node };
    }),
  };
}

/** 쉬운 모드 선택지별 기대값과, 성공 확률이 몇 %가 되면 1등 선택지가 바뀌는지(손익분기 확률). */
export function compareOptions(options                ) {
  const evs = options.map((o) => {
    const p = clamp(fin(o.successProb), 0, 1);
    return p * fin(o.ifSuccess) + (1 - p) * fin(o.ifFail) - fin(o.cost ?? 0);
  });
  let best = 0;
  evs.forEach((v, i) => {
    if (v > evs[best] + 1e-9) best = i;
  });
  const breakeven = options.map((o, i) => {
    // 이 선택지의 성공 확률 p만 바꿀 때, 다른 선택지 최고 기대값과 같아지는 p
    const others = evs.filter((_, j) => j !== i);
    if (!others.length) return null;
    const target = Math.max(...others);
    const span = fin(o.ifSuccess) - fin(o.ifFail);
    if (Math.abs(span) < 1e-12) return null;
    const p = (target + fin(o.cost ?? 0) - fin(o.ifFail)) / span;
    return p >= 0 && p <= 1 ? round(p, 6) : null;
  });
  return { evs, best, breakeven };
}

/** 한 선택지의 성공 확률을 0~100%로 움직일 때 각 선택지 기대값(그래프용). */
export function optionProbabilitySweep(options                , index        , steps = 20) {
  const out                                               = [];
  for (let k = 0; k <= steps; k++) {
    const p = k / steps;
    const next = options.map((o, i) => (i === index ? { ...o, successProb: p } : o));
    const r = compareOptions(next);
    out.push({ p, evs: r.evs, best: r.best });
  }
  return out;
}

// ───────────────────────── 2. 일정: CPM + PERT ─────────────────────────

                               
             
               
                                
                   
                  
                                                     
                      
                       
                     
                    
                 
 

                                                     
                   
                   
             
             
             
             
                
                    
                     
 

                                 
                         
                      
                   
                         
                           
                 
                   
 

export function pertExpected(o        , m        , p        ) {
  return (o + 4 * m + p) / 6;
}

/** 표준정규분포 누적확률(Abramowitz–Stegun 7.1.26, 오차 1.5e-7 이하) */
export function normalCdf(z        ) {
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return 0.5 * (1 + sign * y);
}

export function scheduleCpm(input                )                 {
  const errors           = [];
  const ids = new Set        ();
  const tasks = input.map((t) => {
    if (ids.has(t.id)) errors.push(`작업 id '${t.id}'가 중복돼요.`);
    ids.add(t.id);
    const m = Math.max(0, fin(t.duration));
    const o = t.optimistic === undefined ? m : Math.max(0, fin(t.optimistic));
    const p = t.pessimistic === undefined ? m : Math.max(0, fin(t.pessimistic));
    const lo = Math.min(o, m, p);
    const hi = Math.max(o, m, p);
    if (o > m || p < m) errors.push(`'${t.name}'의 낙관 ≤ 보통 ≤ 비관 순서가 아니라 정렬해서 썼어요.`);
    const mid = clamp(m, lo, hi);
    return {
      ...t,
      deps: (t.deps ?? []).filter((d) => d !== t.id),
      expected: pertExpected(lo, mid, hi),
      variance: ((hi - lo) / 6) ** 2,
      es: 0, ef: 0, ls: 0, lf: 0, slack: 0, critical: false, milestone: m === 0 && hi === 0,
    }                 ;
  });
  const byId = new Map(tasks.map((t) => [t.id, t]));
  for (const t of tasks) {
    const known = (t.deps ?? []).filter((d) => byId.has(d));
    if (known.length !== (t.deps ?? []).length) errors.push(`'${t.name}'의 선행 작업 중 없는 id가 있어 뺐어요.`);
    t.deps = known;
  }
  // 위상 정렬(Kahn). 순환이 있으면 순환에 걸린 작업은 선행 없이 계산하고 오류를 남겨요.
  const indeg = new Map(tasks.map((t) => [t.id, (t.deps ?? []).length]));
  const succ = new Map                  (tasks.map((t) => [t.id, []]));
  for (const t of tasks) for (const d of t.deps ?? []) succ.get(d) .push(t.id);
  const order           = [];
  const queue = tasks.filter((t) => indeg.get(t.id) === 0).map((t) => t.id);
  while (queue.length) {
    const id = queue.shift() ;
    order.push(id);
    for (const s of succ.get(id) ) {
      indeg.set(s, indeg.get(s)  - 1);
      if (indeg.get(s) === 0) queue.push(s);
    }
  }
  if (order.length < tasks.length) {
    const stuck = tasks.filter((t) => !order.includes(t.id));
    errors.push(`선행 관계가 돌고 돌아요(순환): ${stuck.map((t) => t.name).join(", ")}. 이 작업들은 선행 관계를 무시했어요.`);
    for (const t of stuck) {
      t.deps = (t.deps ?? []).filter((d) => order.includes(d));
      order.push(t.id);
    }
    // 순환 작업이 서로 의존하지 않게 했으니 succ도 다시 만들어요.
    for (const k of succ.keys()) succ.set(k, []);
    for (const t of tasks) for (const d of t.deps ?? []) succ.get(d) .push(t.id);
  }
  for (const id of order) {
    const t = byId.get(id) ;
    t.es = Math.max(0, ...(t.deps ?? []).map((d) => byId.get(d) .ef));
    t.ef = t.es + t.expected;
  }
  const duration = Math.max(0, ...tasks.map((t) => t.ef));
  for (const id of [...order].reverse()) {
    const t = byId.get(id) ;
    const s = succ.get(id) ;
    t.lf = s.length ? Math.min(...s.map((x) => byId.get(x) .ls)) : duration;
    t.ls = t.lf - t.expected;
    t.slack = round(t.ls - t.es, 6);
    t.critical = Math.abs(t.slack) < 1e-6;
  }
  // 핵심 경로: 시작에서 끝까지 여유 0인 작업을 이어 가장 긴 줄 하나
  const criticalPath           = [];
  let cur = tasks.filter((t) => t.critical && (t.deps ?? []).every((d) => !byId.get(d) .critical)).sort((a, b) => a.es - b.es)[0];
  while (cur) {
    criticalPath.push(cur.id);
    const nextId                     = succ.get(cur.id) .find((x) => byId.get(x) .critical && Math.abs(byId.get(x) .es - cur .ef) < 1e-6);
    cur = nextId ? byId.get(nextId)  : (undefined                            );
  }
  const stdDev = Math.sqrt(criticalPath.reduce((s, id) => s + byId.get(id) .variance, 0));
  for (const t of tasks) {
    t.es = round(t.es); t.ef = round(t.ef); t.ls = round(t.ls); t.lf = round(t.lf); t.expected = round(t.expected);
  }
  return { tasks, duration: round(duration), criticalPath, stdDev: round(stdDev), errors };
}

/** PERT: 기대 기간과 표준편차로 마감(일) 안에 끝낼 확률 */
export function deadlineProbability(duration        , stdDev        , deadline        ) {
  if (stdDev <= 0) return deadline >= duration ? 1 : 0;
  return round(normalCdf((deadline - duration) / stdDev), 6);
}

/** 작업 하나가 d일 늦어질 때 전체 기간이 얼마나 밀리는지(여유를 넘는 만큼). */
export function slipImpact(input                , taskId        , delayDays        ) {
  const base = scheduleCpm(input).duration;
  const next = input.map((t) =>
    t.id === taskId
      ? { ...t, duration: t.duration + delayDays, optimistic: t.optimistic === undefined ? undefined : t.optimistic + delayDays, pessimistic: t.pessimistic === undefined ? undefined : t.pessimistic + delayDays }
      : t,
  );
  const after = scheduleCpm(next).duration;
  return { base, after, projectDelay: round(after - base) };
}

/** 시작일(YYYY-MM-DD)에서 n일(작업일 또는 달력일) 뒤 날짜. 작업일은 토·일을 건너뛰어요. */
export function addDays(start        , days        , workdaysOnly = false)         {
  const [y, m, d] = start.split("-").map(Number);
  const date = new Date(Date.UTC(y, (m || 1) - 1, d || 1));
  let left = Math.ceil(Math.max(0, days) - 1e-9);
  if (!workdaysOnly) {
    date.setUTCDate(date.getUTCDate() + left);
  } else {
    while (date.getUTCDay() === 0 || date.getUTCDay() === 6) date.setUTCDate(date.getUTCDate() + 1);
    while (left > 0) {
      date.setUTCDate(date.getUTCDate() + 1);
      if (date.getUTCDay() !== 0 && date.getUTCDay() !== 6) left--;
    }
  }
  return date.toISOString().slice(0, 10);
}

// ───────────────────────── 3. SWOT / TOWS ─────────────────────────

                                             
                           
                 
               
                          
                  
                                                       
                  
                  
 

                                                   
export const SWOT_STANCE                                                      = {
  SO: { name: "공격(SO)", plain: "강점으로 기회를 잡는 공격 전략이 맞아요." },
  ST: { name: "다각화(ST)", plain: "강점으로 위협을 피하거나 막는 다각화 전략이 맞아요." },
  WO: { name: "방향 전환(WO)", plain: "기회를 살리려면 약점부터 메우는 방향 전환 전략이 맞아요." },
  WT: { name: "방어(WT)", plain: "약점과 위협이 겹쳐요. 줄이고 지키는 방어 전략부터 세워요." },
};

export function swotPosition(items            ) {
  const sum = (k          ) => items.filter((i) => i.kind === k && i.text.trim()).reduce((s, i) => s + clamp(fin(i.impact ?? 3), 0, 5), 0);
  const S = sum("S"), W = sum("W"), O = sum("O"), T = sum("T");
  const internal = S - W;
  const external = O - T;
  const stance             = internal >= 0 ? (external >= 0 ? "SO" : "ST") : external >= 0 ? "WO" : "WT";
  const top = (k          , n = 2) =>
    items.filter((i) => i.kind === k && i.text.trim()).sort((a, b) => fin(b.impact ?? 3) - fin(a.impact ?? 3)).slice(0, n).map((i) => i.text.trim());
  const pair = (a          , b          , verb        ) => a.flatMap((x) => b.slice(0, 1).map((y) => `${x} → ${y} ${verb}`));
  const tows                               = {
    SO: pair(top("S"), top("O"), "기회를 잡는 데 쓰기"),
    ST: pair(top("S"), top("T"), "위협을 막는 데 쓰기"),
    WO: pair(top("W"), top("O"), "기회를 위해 먼저 보완하기"),
    WT: pair(top("W"), top("T"), "겹치는 위험 줄이기"),
  };
  return { totals: { S, W, O, T }, internal, external, stance, tows };
}

/** IFE(내부: S·W) 또는 EFE(외부: O·T) 가중 점수. 가중치 합을 1로 맞추고 평점은 1~4로 잘라요. 2.5가 평균. */
export function factorScore(items            ) {
  const rows = items.filter((i) => i.text.trim());
  const wsum = rows.reduce((s, i) => s + Math.max(0, fin(i.weight ?? 0)), 0);
  const scored = rows.map((i) => {
    const w = wsum > 0 ? Math.max(0, fin(i.weight ?? 0)) / wsum : 1 / Math.max(1, rows.length);
    const r = clamp(Math.round(fin(i.rating ?? 2.5) * 2) / 2, 1, 4);
    return { text: i.text, kind: i.kind, weight: round(w, 6), rating: r, score: round(w * r, 6) };
  });
  return { rows: scored, total: round(scored.reduce((s, r) => s + r.score, 0), 4), weightsAdjusted: rows.length > 0 && Math.abs(wsum - 1) > 1e-6 };
}

/** IE 매트릭스(3×3): IFE·EFE 총점(1~4)으로 성장·유지·수확 셀 판정 */
export function ieMatrix(ife        , efe        ) {
  const band = (v        ) => (v >= 3 ? 0 : v >= 2 ? 1 : 2); // 0=강/높음, 1=중, 2=약/낮음
  const col = band(ife);
  const row = band(efe);
  const cell = row * 3 + col + 1; // 1..9 (I..IX)
  const strategy = row + col <= 1 ? "grow" : row + col === 2 ? "hold" : "harvest";
  const label = { grow: "성장·구축(공격 투자)", hold: "유지·보존(시장 침투·제품 개발)", harvest: "수확·철수(비용 축소·매각 검토)" }[strategy];
  return { cell, row, col, strategy, label };
}

// ───────────────────────── 4. BCG 매트릭스 ─────────────────────────

                          
               
                             
                  
                               
                       
                   
                
                                             
                     
 

                                                                  
export const BCG_LABEL                                                                     = {
  star: { name: "스타", plain: "빨리 크는 시장에서 앞서 있어요.", move: "점유율을 지키도록 계속 투자해요. 시장 성장이 느려지면 캐시카우가 돼요." },
  cashCow: { name: "캐시카우", plain: "성장이 느린 시장의 1등이라 돈을 벌어 줘요.", move: "투자는 유지 수준으로, 남는 현금은 스타·물음표에 보내요." },
  question: { name: "물음표", plain: "빨리 크는 시장인데 아직 뒤처져 있어요.", move: "이길 수 있는 곳만 골라 크게 투자하고, 아니면 접어요." },
  dog: { name: "개", plain: "성장도 느리고 점유율도 낮아요.", move: "틈새로 이익만 지키거나 정리·매각을 검토해요." },
};

export function bcgMatrix(units           , growthThreshold = 0.1, shareThreshold = 1) {
  const total = units.reduce((s, u) => s + Math.max(0, fin(u.revenue)), 0);
  const rows = units.map((u) => {
    const rivals = Math.max(1e-9, fin(u.rivalShare));
    const rms = round(Math.max(0, fin(u.share)) / rivals, 4);
    const g = fin(u.marketGrowth);
    const quadrant              = g >= growthThreshold ? (rms >= shareThreshold ? "star" : "question") : rms >= shareThreshold ? "cashCow" : "dog";
    return { ...u, relativeShare: rms, quadrant, revenueShare: total > 0 ? round(Math.max(0, fin(u.revenue)) / total, 4) : 0 };
  });
  const mix = (q             ) => round(rows.filter((r) => r.quadrant === q).reduce((s, r) => s + r.revenueShare, 0), 4);
  const byQuadrant = { star: mix("star"), cashCow: mix("cashCow"), question: mix("question"), dog: mix("dog") };
  const notes           = [];
  if (byQuadrant.cashCow < 0.2 && rows.length > 1) notes.push("캐시카우 매출 비중이 20% 미만이에요. 성장 투자에 쓸 현금이 어디서 오는지 확인해요.");
  if (byQuadrant.dog > 0.4) notes.push("개 사분면 매출이 40%를 넘어요. 정리하거나 틈새로 바꿀 사업을 골라요.");
  if (byQuadrant.question > 0.4) notes.push("물음표 비중이 커요. 모두에 조금씩 투자하면 다 개가 되기 쉬워요. 1~2개에 집중해요.");
  if (byQuadrant.star === 0 && rows.length > 1) notes.push("스타가 없어요. 다음 캐시카우가 될 사업이 비어 있어요.");
  return { rows, byQuadrant, notes, growthThreshold, shareThreshold };
}

// ───────────────────────── 5. 포지셔닝 맵 ─────────────────────────

                           
               
                 
            
            
                 
                 
                
 

export function positioningMap(brands            , ideal                           , bound = 10, grid = 40) {
  const pts = brands.map((b) => ({ ...b, x: clamp(fin(b.x), -bound, bound), y: clamp(fin(b.y), -bound, bound) }));
  const dist = (a                          , b                          ) => Math.hypot(a.x - b.x, a.y - b.y);
  const rows = pts.map((b) => {
    let nearest = "";
    let nd = Infinity;
    for (const o of pts) {
      if (o === b) continue;
      const d = dist(b, o);
      if (d < nd) { nd = d; nearest = o.name; }
    }
    return { name: b.name, x: b.x, y: b.y, ours: !!b.ours, nearest, nearestDistance: Number.isFinite(nd) ? round(nd, 3) : null, idealDistance: ideal ? round(dist(b, ideal), 3) : null };
  });
  // 비어 있는 자리: 격자 위에서 가장 가까운 브랜드까지 거리가 가장 먼 점(최대 빈 원 근사)
  let gap = { x: 0, y: 0, radius: 0 };
  if (pts.length) {
    for (let i = 0; i <= grid; i++) {
      for (let j = 0; j <= grid; j++) {
        // 가장자리 15%는 빼요(축 끝은 '빈자리'라기보다 극단이라 고객이 거의 없어요).
        const inner = bound * 0.85;
        const p = { x: -inner + (2 * inner * i) / grid, y: -inner + (2 * inner * j) / grid };
        const r = Math.min(...pts.map((b) => dist(p, b)));
        // 이상점이 있으면 이상점 쪽 빈자리를 우선(거리 패널티)
        const score = ideal ? r - 0.25 * dist(p, ideal) : r;
        const cur = ideal ? gap.radius - 0.25 * dist(gap, ideal) : gap.radius;
        if (score > cur + 1e-9) gap = { x: round(p.x, 3), y: round(p.y, 3), radius: round(r, 3) };
      }
    }
  }
  const crowded = rows.filter((r) => r.nearestDistance !== null && r.nearestDistance < bound * 0.15).map((r) => r.name);
  return { brands: rows, gap, crowded };
}

// ───────────────────────── 6. 단위경제·런웨이 ─────────────────────────

                                     
                         
               
                    
                      
                   
                       
                    
              
                              
                        
 

export function unitEconomics(i                    ) {
  const margin = Math.max(0, fin(i.arpu)) * clamp(fin(i.grossMargin), -1, 1);
  const churn = clamp(fin(i.monthlyChurn), 0, 1);
  const r = Math.max(0, fin(i.discountRate ?? 0)) / 12;
  // 월 이탈 c, 월 할인 r: LTV = m × Σ (1−c)^t/(1+r)^t (t=0..∞) = m × (1+r)/(r+c)
  const ltv = churn + r > 0 ? (margin * (1 + r)) / (r + churn) : Infinity;
  const lifetimeMonths = churn > 0 ? 1 / churn : Infinity;
  const payback = margin > 0 ? fin(i.cac) / margin : Infinity;
  const ratio = fin(i.cac) > 0 ? ltv / fin(i.cac) : Infinity;
  const grade = !Number.isFinite(ratio) ? "good" : ratio >= 3 ? "good" : ratio >= 1 ? "thin" : "losing";
  const gradeText = { good: "LTV/CAC 3배 이상: 고객을 더 사 와도 남아요.", thin: "1~3배: 남긴 하지만 고정비를 덮기엔 얇아요.", losing: "1배 미만: 고객을 데려올수록 손해예요." }[grade];
  return { contributionPerMonth: round(margin, 2), ltv: round(ltv, 2), lifetimeMonths: round(lifetimeMonths, 2), paybackMonths: round(payback, 2), ltvToCac: round(ratio, 3), grade, gradeText };
}

                              
               
                 
                  
                            
                        
                          
                   
                 
                        
                  
 

export function runway(i             ) {
  const horizon = clamp(Math.round(fin(i.months ?? 36)), 1, 120);
  let cash = fin(i.cash);
  let rev = Math.max(0, fin(i.revenue));
  let exp = Math.max(0, fin(i.expenses));
  const series                                                                                    = [];
  let zeroMonth                = null;
  let breakEvenMonth                = rev >= exp ? 0 : null;
  for (let m = 1; m <= horizon; m++) {
    const net = rev - exp;
    cash += net;
    series.push({ month: m, revenue: round(rev, 0), expenses: round(exp, 0), net: round(net, 0), cash: round(cash, 0) });
    if (zeroMonth === null && cash < 0) zeroMonth = m;
    rev *= 1 + fin(i.revenueGrowth);
    exp *= 1 + fin(i.expenseGrowth);
    if (breakEvenMonth === null && rev >= exp) breakEvenMonth = m;
  }
  const burn = Math.max(0, fin(i.expenses) - fin(i.revenue));
  const simpleRunway = burn > 0 ? fin(i.cash) / burn : Infinity;
  // 돈이 떨어지기 전에 흑자 전환하면 "기본 생존(default alive)"
  const defaultAlive = breakEvenMonth !== null && (zeroMonth === null || breakEvenMonth < zeroMonth);
  return { series, zeroMonth, breakEvenMonth, simpleRunwayMonths: round(simpleRunway, 2), netBurn: burn, defaultAlive };
}

/** 손익분기 판매량: 고정비 ÷ (단가 − 단위 변동비) */
export function breakEven(fixedCost        , price        , variableCost        ) {
  const cm = fin(price) - fin(variableCost);
  if (cm <= 0) return { units: Infinity, revenue: Infinity, contributionMargin: cm, cmRatio: fin(price) > 0 ? cm / fin(price) : 0 };
  const units = Math.ceil(fin(fixedCost) / cm);
  return { units, revenue: units * fin(price), contributionMargin: cm, cmRatio: round(cm / fin(price), 6) };
}

// ───────────────────────── 7. 우선순위·가중 의사결정 ─────────────────────────

                           
               
                        
                
                                              
                 
                
                     
                
                 
 

export function riceScores(items            ) {
  return items
    .map((it) => ({ ...it, score: fin(it.effort) > 0 ? round((Math.max(0, fin(it.reach)) * Math.max(0, fin(it.impact)) * clamp(fin(it.confidence), 0, 1)) / fin(it.effort), 3) : 0 }))
    .sort((a, b) => b.score - a.score);
}

export function iceScore(impact        , confidence        , ease        ) {
  return round(clamp(fin(impact), 0, 10) * clamp(fin(confidence), 0, 10) * clamp(fin(ease), 0, 10), 3);
}

                                    
               
                 
 

/** 가중 의사결정표: scores[option][criterion] (1~5 또는 1~10). 가중치 합을 1로 맞춰요. */
export function weightedDecision(criteria                     , options                                      ) {
  const wsum = criteria.reduce((s, c) => s + Math.max(0, fin(c.weight)), 0);
  const w = criteria.map((c) => (wsum > 0 ? Math.max(0, fin(c.weight)) / wsum : 1 / Math.max(1, criteria.length)));
  const rows = options.map((o) => ({ name: o.name, total: round(w.reduce((s, wi, k) => s + wi * fin(o.scores[k] ?? 0), 0), 4) }));
  const ranked = [...rows].sort((a, b) => b.total - a.total);
  // 1등과 2등의 차이를 뒤집으려면 각 기준 가중치가 얼마나 바뀌어야 하는지(민감도)
  const flips                                                       = [];
  if (ranked.length >= 2) {
    const a = options.find((o) => o.name === ranked[0].name) ;
    const b = options.find((o) => o.name === ranked[1].name) ;
    criteria.forEach((c, k) => {
      // 기준 k의 가중치를 x로 바꾸고 나머지는 비율 유지: total(x) = x·s_k + (1−x)·rest/(1−w_k)
      const rest = (o          ) => (1 - w[k] > 1e-12 ? w.reduce((s, wi, j) => (j === k ? s : s + wi * fin(o.scores[j] ?? 0)), 0) / (1 - w[k]) : 0);
      const da = fin(a.scores[k] ?? 0) - rest(a);
      const db = fin(b.scores[k] ?? 0) - rest(b);
      const denom = da - db;
      if (Math.abs(denom) < 1e-12) { flips.push({ criterion: c.name, weightNeeded: null }); return; }
      const x = (rest(b) - rest(a)) / denom;
      flips.push({ criterion: c.name, weightNeeded: x >= 0 && x <= 1 ? round(x, 4) : null });
    });
  }
  return { weights: w.map((x) => round(x, 6)), rows, ranked, flips };
}
