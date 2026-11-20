// GENERATED from tools-oiyo src/lib/pro-practice-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 전문 직업 역량 지도의 빈칸을 채우는 실무 계산 도구 (2026-11-17).
// 세운 "기존 전문 자격증의 업무범위에 필요한 모든 도구와 스킬 추가". 역량 지도: src/data/pro-competencies.ts
// 1) 과태료 자진납부 감경·가산금 (질서위반행위규제법)            → admin-fine
// 2) 수입 관세·부가세와 FTA 세율 비교 (관세법, FTA관세법)         → cu-hs
// 3) IFRS 17 보험계약마진(CSM) 원리 (일반모형, 설명용)            → act-reserve
// 4) 지급여력비율(K-ICS) 원리 (상관계수 합산, 설명용)             → act-solvency
// 5) 장해 지급률·과실 비율로 보는 보험금                          → adj-fault
// 6) 전표 데이터 분석(벤포드·주말·끝자리·중복·결재선)             → cpa-data
// 모두 정보·계산 도구예요. 과태료 부과, 품목분류, 책임준비금 산출, 손해사정, 감사의견을 대신하지 않아요.
import { fixedRange, josa, roughWon,                                                   } from "./scenario.mjs";
import { dueDate } from "./kr-expert-guide-2026.mjs";

// kr-money-scenarios.ts의 driverLine과 같아요. 스킬로 옮길 때 무거운 의존성을 피하려고 여기 둬요.
const driverLine = (top                        , what        ) =>
  top && top.span > 0
    ? `결과를 가장 크게 움직이는 건 ${josa(top.plain, "이에요", "예요")}. 이 값이 20% 늘거나 줄면 ${josa(what, "이", "가")} 약 ${roughWon(Math.min(top.low, top.high))}에서 ${roughWon(Math.max(top.low, top.high))} 사이로 바뀌어요.`
    : null;

const won = (n        ) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const pct1 = (r        ) => `${(Math.round(r * 1000) / 10).toLocaleString("ko-KR")}%`;
const clamp = (v        , lo        , hi        ) => Math.min(hi, Math.max(lo, Number.isFinite(v) ? v : lo));

// ───────────────────────── 1) 과태료 감경·가산금 ─────────────────────────
// 질서위반행위규제법 제16조(사전통지·의견제출 10일 이상), 제18조·시행령 제5조(의견제출 기한 안 자진납부 20% 범위 감경),
// 시행령 제2조의2(기초생활수급자·중증장애인·미성년자 등 50% 범위 감경), 제20조(이의제기 60일), 제24조(가산금 3%, 중가산금 매월 1.2%, 60개월 한도).

                           
                      
               
                   
                     
                        
                      
                                                              
                                 
                               
                     
                                   
                      
 

export const FINE_RULES = { early: 0.2, vulnerable: 0.5, addOn: 0.03, monthly: 0.012, maxMonths: 60, objectionDays: 60 }         ;

export function fineResult(i          ) {
  const fine = Math.max(0, i.fine);
  const months = i.when === "late" ? clamp(Math.floor(i.monthsLate), 0, FINE_RULES.maxMonths) : 0;
  const vulnerableCut = i.vulnerable ? Math.floor(fine * FINE_RULES.vulnerable) : 0;
  // 두 감경이 겹치면 기관마다 방식이 달라요. 여기서는 더 큰 감경 하나만 확정값으로 써요.
  const earlyCut = i.when === "early" ? Math.floor(fine * FINE_RULES.early) : 0;
  const cut = Math.max(vulnerableCut, earlyCut);
  const base = fine - cut;
  const addOn = i.when === "late" ? Math.floor(base * FINE_RULES.addOn) : 0;
  const heavy = i.when === "late" ? Math.floor(base * FINE_RULES.monthly * months) : 0;
  const pay = base + addOn + heavy;
  const opinionDue = i.noticeDate ? dueDate({ days: Math.max(10, Math.round(i.opinionDays)) }, i.noticeDate)?.due ?? "" : "";
  return { fine, cut, earlyCut, vulnerableCut, both: i.vulnerable && i.when === "early", base, addOn, heavy, months, pay, opinionDue, maxPay: base + Math.floor(base * 0.03) + Math.floor(base * 0.012 * 60) };
}
export const finePay = (i          ) => fineResult(i).pay;

export const FINE_ASSUMPTIONS                         = [
  { key: "fine", label: "과태료(사전통지 금액)", plain: "과태료", unit: "won", kind: "fact", get: (i) => i.fine, set: (i, v) => ({ ...i, fine: Math.max(0, v) }), range: fixedRange(10_000, 3_000_000) },
  { key: "monthsLate", label: "납부기한 경과 개월", plain: "늦게 낸 개월 수", unit: "months", kind: "assumption", get: (i) => i.monthsLate, set: (i, v) => ({ ...i, monthsLate: clamp(Math.round(v), 0, 72), when: v > 0 ? "late" : i.when }), range: fixedRange(0, 72), marks: [{ at: 60, label: "중가산금 한도 60개월" }] },
];

export const fineBridge = (i          )               => {
  const r = fineResult(i);
  return [
    { label: "통지된 과태료", value: r.fine, kind: "total" },
    { label: r.cut === r.vulnerableCut && r.cut > 0 ? "사회적 약자 감경 50%" : "자진납부 감경 20%", value: -r.cut, kind: "add" },
    { label: "가산금 3%", value: r.addOn, kind: "add" },
    { label: `중가산금 1.2% × ${r.months}개월`, value: r.heavy, kind: "add" },
    { label: "낼 금액", value: r.pay, kind: "total" },
  ];
};

export const fineCurve = (i          ) =>
  [0, 1, 6, 12, 24, 60].map((m) => ({ label: m === 0 ? "기한 안" : `${m}개월 늦게`, value: fineResult({ ...i, when: m === 0 ? "due" : "late", monthsLate: m }).pay, current: i.when === "late" ? m === Math.round(i.monthsLate) : m === 0 && i.when === "due" }));

export function finePlain(i          , top             ) {
  const r = fineResult(i);
  const reasons = [
    r.opinionDue ? `의견제출 기한은 ${r.opinionDue}까지예요. 이 안에 자진해서 내면 20%까지 줄어요(질서위반행위규제법 제18조, 시행령 제5조).` : "사전통지를 받은 날을 넣으면 자진납부 감경 기한을 계산해요.",
    "부과 통지를 받은 날부터 60일 안에 이의제기하면 부과 처분은 효력을 잃고 법원 재판으로 넘어가요(제20조). 이의제기하면 자진납부 감경은 받을 수 없어요.",
    i.when === "late" ? `납부기한이 지나면 가산금 3%, 그 뒤 1개월마다 1.2%가 60개월까지 붙어요(제24조). 최대 ${won(r.maxPay)}까지 늘어요.` : "납부기한을 넘기면 가산금 3%에 매달 1.2%씩 최대 75%까지 늘어요(제24조).",
  ];
  if (r.both) reasons.push("사회적 약자 감경과 자진납부 감경이 겹칠 때 함께 적용하는지는 행정청마다 달라요. 여기서는 큰 감경(50%) 하나만 반영했어요.");
  return {
    headline: `낼 금액은 ${won(r.pay)}이에요${r.cut ? ` (감경 ${won(r.cut)})` : ""}${r.addOn + r.heavy ? `, 늦게 내서 ${won(r.addOn + r.heavy)}이 더 붙었어요` : ""}.`,
    driver: driverLine(top, "낼 금액"),
    reasons,
  };
}

// ───────────────────────── 2) 수입 관세·FTA ─────────────────────────
// 과세가격 = 물품가격 + 운임 + 보험료(CIF, 관세법 제30조) × 과세환율. 관세 = 과세가격 × 세율.
// 부가가치세 = (과세가격 + 관세 + 개별소비세 등) × 10%(부가가치세법 제29조②). 개별소비세·주세 대상은 따로 확인해요.
// FTA 협정세율은 원산지증명이 있을 때만(FTA관세특례법 제8조). 개인 직구 면세: 물품가격 150달러(미국발 200달러) 이하(관세법 시행규칙 제45조).

                           
                 
                
               
                  
                
                    
                   
             
                          
                   
                 
                  
                    
                     
                    
                    
                  
                  
 

export const DUTY_EXAMPLES = [
  { label: "의류", rate: 0.13 },
  { label: "신발", rate: 0.13 },
  { label: "가방", rate: 0.08 },
  { label: "화장품", rate: 0.065 },
  { label: "노트북·휴대폰", rate: 0 },
]         ;

export function dutyResult(i          ) {
  const fx = Math.max(0, i.fx);
  const cif = (Math.max(0, i.price) + Math.max(0, i.freight) + Math.max(0, i.insurance)) * fx;
  const limit = i.fromUS ? 200 : 150;
  const exempt = i.personal && i.price <= limit;
  const calc = (rate        ) => {
    const duty = Math.floor(cif * Math.max(0, rate));
    const vat = Math.floor((cif + duty) * 0.1);
    return { duty, vat, total: duty + vat };
  };
  const base = calc(i.baseRate);
  const ftaUsable = i.hasOrigin && i.ftaRate < i.baseRate;
  const fta = calc(Math.min(i.baseRate, i.ftaRate));
  const chosen = exempt ? { duty: 0, vat: 0, total: 0 } : ftaUsable ? fta : base;
  return { cif, limit, exempt, base, fta, ftaUsable, saving: ftaUsable && !exempt ? base.total - fta.total : 0, chosen, landed: cif + chosen.total };
}
export const dutyTotal = (i          ) => dutyResult(i).chosen.total;

export const DUTY_ASSUMPTIONS                         = [
  { key: "price", label: "물품가격(USD)", plain: "물건값(달러)", unit: "amount", kind: "fact", get: (i) => i.price, set: (i, v) => ({ ...i, price: Math.max(0, v) }), range: fixedRange(0, 3000), marks: [{ at: 150, label: "직구 면세 150달러" }, { at: 200, label: "미국발 200달러" }] },
  { key: "fx", label: "과세환율", plain: "환율", unit: "amount", kind: "assumption", get: (i) => i.fx, set: (i, v) => ({ ...i, fx: Math.max(0, v) }), range: fixedRange(1100, 1700) },
  { key: "baseRate", label: "기본세율", plain: "관세율", unit: "rate", kind: "assumption", get: (i) => i.baseRate, set: (i, v) => ({ ...i, baseRate: clamp(v, 0, 1) }), range: fixedRange(0, 0.3) },
  { key: "freight", label: "운임(USD)", plain: "배송비(달러)", unit: "amount", kind: "assumption", get: (i) => i.freight, set: (i, v) => ({ ...i, freight: Math.max(0, v) }), range: fixedRange(0, 300) },
];

export const dutyCompare = (i          ) => {
  const r = dutyResult(i);
  return [
    { label: "기본세율", value: r.base.total, current: !r.ftaUsable && !r.exempt },
    { label: "FTA 협정세율", value: r.fta.total, current: r.ftaUsable && !r.exempt },
  ];
};

export function dutyPlain(i          , top             ) {
  const r = dutyResult(i);
  const reasons = [
    `과세가격은 물건값·운임·보험료를 더해 환율을 곱한 ${won(r.cif)}이에요(관세법 제30조).`,
    r.exempt
      ? `개인 사용 물품이고 물건값이 ${r.limit}달러 이하라 목록·간이 통관 면세 대상이에요. 같은 날 들어온 물건은 합쳐서 따지고, 판매용이면 면세가 안 돼요.`
      : `관세 ${won(r.chosen.duty)}에 (과세가격 + 관세)의 10%인 부가가치세 ${won(r.chosen.vat)}가 붙어요.`,
    r.ftaUsable ? `원산지증명이 있어서 FTA 세율을 쓰면 ${won(r.saving)} 줄어요(FTA관세특례법 제8조).` : i.ftaRate < i.baseRate ? "원산지증명서가 없으면 FTA 세율을 쓸 수 없어요. 수입신고 수리 전, 또는 수리 뒤 1년 안에 사후 적용을 신청할 수 있어요." : "FTA 세율이 기본세율보다 낮지 않으면 기본세율로 내요.",
    "세율은 품목분류(HS 코드)로 정해져요. 정확한 세율은 관세법령정보포털에서 HS 코드로 확인하세요.",
  ];
  return {
    headline: r.exempt ? "면세 기준 안이에요. 관세와 부가가치세가 0원이에요." : `세금은 모두 ${won(r.chosen.total)}이고, 물건이 들어오기까지 ${won(r.landed)}이 들어요.`,
    driver: driverLine(top, "세금"),
    reasons,
  };
}

// ───────────────────────── 3) IFRS 17 CSM(설명용) ─────────────────────────
// 일반모형: 이행현금흐름(FCF) = 미래 현금유출 현재가치 + 위험조정(RA) − 미래 현금유입 현재가치.
// FCF가 음수면 그 크기가 보험계약마진(CSM, 미실현 이익), 양수면 손실요소(처음부터 손실 인식).
// CSM은 할증(이자 부리) 뒤 보장 단위(여기서는 해마다 같음)에 따라 이익으로 풀려요.

                          
                     
                  
                
                          
                 
                
                  
                       
                      
            
               
                              
             
 

export function csmResult(i         ) {
  const n = clamp(Math.round(i.years), 1, 40);
  const r = clamp(i.rate, -0.05, 0.2);
  const v = (t        ) => 1 / Math.pow(1 + r, t);
  let pvIn = 0;
  let pvClaims = 0;
  let pvExp = 0;
  for (let t = 0; t < n; t++) {
    pvIn += i.premium * v(t);
    pvClaims += i.claims * v(t + 1);
    pvExp += i.expense * v(t + 1);
  }
  const acq = Math.max(0, i.acquisition);
  const ra = (pvClaims + pvExp) * Math.max(0, i.ra);
  const fcf = pvClaims + pvExp + acq + ra - pvIn;
  const csm = Math.max(0, -fcf);
  const loss = Math.max(0, fcf);
  const release                                                                                     = [];
  let open = csm;
  for (let t = 1; t <= n; t++) {
    const accrete = open * r;
    const released = (open + accrete) / (n - t + 1);
    const close = open + accrete - released;
    release.push({ year: t, open, accrete, released, close });
    open = close;
  }
  return { n, pvIn, pvClaims, pvExp, acq, ra, fcf, csm, loss, release, margin: pvIn > 0 ? csm / pvIn : 0 };
}
export const csmValue = (i         ) => {
  const r = csmResult(i);
  return r.csm - r.loss;
};

export const CSM_ASSUMPTIONS                        = [
  { key: "claims", label: "연 예상 보험금", plain: "해마다 나갈 보험금", unit: "won", kind: "assumption", get: (i) => i.claims, set: (i, v) => ({ ...i, claims: Math.max(0, v) }), range: fixedRange(0, 2_000_000) },
  { key: "rate", label: "할인율", plain: "할인율", unit: "rate", kind: "assumption", get: (i) => i.rate, set: (i, v) => ({ ...i, rate: clamp(v, -0.05, 0.2) }), range: fixedRange(0, 0.08) },
  { key: "ra", label: "위험조정 비율", plain: "불확실성 몫", unit: "rate", kind: "assumption", get: (i) => i.ra, set: (i, v) => ({ ...i, ra: clamp(v, 0, 1) }), range: fixedRange(0, 0.3) },
  { key: "expense", label: "연 유지비", plain: "해마다 드는 비용", unit: "won", kind: "assumption", get: (i) => i.expense, set: (i, v) => ({ ...i, expense: Math.max(0, v) }), range: fixedRange(0, 500_000) },
  { key: "premium", label: "연 보험료", plain: "연 보험료", unit: "won", kind: "fact", get: (i) => i.premium, set: (i, v) => ({ ...i, premium: Math.max(0, v) }), range: fixedRange(100_000, 3_000_000) },
];

export const csmBridge = (i         )               => {
  const r = csmResult(i);
  return [
    { label: "보험료 현재가치", value: r.pvIn, kind: "total" },
    { label: "보험금 현재가치", value: -r.pvClaims, kind: "add" },
    { label: "유지비 현재가치", value: -r.pvExp, kind: "add" },
    { label: "신계약비", value: -r.acq, kind: "add" },
    { label: "위험조정", value: -r.ra, kind: "add" },
    { label: r.csm > 0 ? "보험계약마진(CSM)" : "손실요소", value: -r.fcf, kind: "total" },
  ];
};

export function csmPlain(i         , top             ) {
  const r = csmResult(i);
  const first = r.release[0];
  return {
    headline: r.csm > 0 ? `처음 인식하는 보험계약마진(CSM)은 ${won(r.csm)}이에요. 보험료 현재가치의 ${pct1(r.margin)}이고 ${r.n}년에 걸쳐 이익으로 풀려요.` : `이 계약은 처음부터 손실이에요. 손실요소 ${won(r.loss)}을 바로 비용으로 인식해요.`,
    driver: driverLine(top, "CSM"),
    reasons: [
      `미래에 나갈 돈(보험금 ${won(r.pvClaims)} + 유지비 ${won(r.pvExp)} + 신계약비 ${won(r.acq)})과 위험조정 ${won(r.ra)}을 들어올 보험료 ${won(r.pvIn)}에서 빼요.`,
      r.csm > 0 && first ? `첫해에는 이자 ${won(first.accrete)}를 더한 뒤 ${won(first.released)}이 보험서비스 이익으로 풀려요.` : "손실 계약은 CSM이 0이고, 나중에 가정이 좋아지면 손실요소부터 되돌려요.",
      "할인율이 바뀌면 보험료와 보험금의 현재가치가 함께 바뀌어요. 보험금이 보험료보다 늦게 나갈수록 할인율의 영향이 커요. 실제 측정은 계약 묶음·보장 단위·할인율 곡선을 써요.",
    ],
  };
}

// ───────────────────────── 4) K-ICS 지급여력비율(설명용) ─────────────────────────
// 요구자본 = √(Σ ρᵢⱼ·Rᵢ·Rⱼ) + 운영위험 − 법인세 조정. 상관계수는 솔벤시 II 표준모형과 비슷한 예시예요(실제 계수는 감독규정 시행세칙).
// 적기시정조치(보험업감독규정): 100% 미만 경영개선권고, 50% 미만 경영개선요구, 0% 미만 경영개선명령.

                           
                    
               
                  
                 
                 
                      
                 
 

export const KICS_MODULES = ["life", "nonlife", "market", "credit"]         ;
export const KICS_LABEL                                                = { life: "생명·장기손해보험위험", nonlife: "일반손해보험위험", market: "시장위험", credit: "신용위험" };
/** 예시 상관계수(생명·일반·시장·신용 순서) */
export const KICS_CORR = [
  [1, 0, 0.25, 0.25],
  [0, 1, 0.25, 0.5],
  [0.25, 0.25, 1, 0.25],
  [0.25, 0.5, 0.25, 1],
]         ;

export function kicsResult(i          ) {
  const x = KICS_MODULES.map((k) => Math.max(0, i[k]));
  let s = 0;
  for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) s += KICS_CORR[a][b] * x[a] * x[b];
  const basic = Math.sqrt(s);
  const sum = x.reduce((p, c) => p + c, 0);
  const required = Math.max(0, basic + Math.max(0, i.operational) - Math.max(0, i.taxAdj));
  const ratio = required > 0 ? i.available / required : Infinity;
  const level = ratio < 0 ? "order" : ratio < 0.5 ? "demand" : ratio < 1 ? "advise" : "ok";
  return { basic, sum, diversification: sum - basic, required, ratio, level }         ;
}
export const kicsRatio = (i          ) => {
  const r = kicsResult(i).ratio;
  return Number.isFinite(r) ? r : 0;
};
export const KICS_LEVEL = { ok: "기준 충족(100% 이상)", advise: "경영개선권고 구간(100% 미만)", demand: "경영개선요구 구간(50% 미만)", order: "경영개선명령 구간(0% 미만)" }         ;

const kicsMoney = (key                , label        , plain        , kind                        = "assumption")                       => ({
  key, label, plain, unit: "won", kind, get: (i) => i[key], set: (i, v) => ({ ...i, [key]: Math.max(0, v) }), range: fixedRange(0, 2_000_000_000_000),
});
export const KICS_ASSUMPTIONS                         = [
  kicsMoney("available", "가용자본", "버틸 수 있는 자본", "fact"),
  kicsMoney("market", "시장위험액", "금리·주가 충격 손실"),
  kicsMoney("life", "생명·장기손해보험위험액", "사망·해지·장수 충격 손실"),
  kicsMoney("credit", "신용위험액", "거래 상대 부도 손실"),
  kicsMoney("nonlife", "일반손해보험위험액", "자동차·화재 등 손실"),
  kicsMoney("operational", "운영위험액", "업무 실수·사고 손실"),
];

export const kicsBridge = (i          )               => {
  const r = kicsResult(i);
  return [
    ...KICS_MODULES.map((k) => ({ label: KICS_LABEL[k], value: Math.max(0, i[k]), kind: "add"          })),
    { label: "단순 합계", value: r.sum, kind: "total" },
    { label: "분산효과", value: -r.diversification, kind: "add" },
    { label: "운영위험", value: Math.max(0, i.operational), kind: "add" },
    { label: "법인세 조정", value: -Math.max(0, i.taxAdj), kind: "add" },
    { label: "요구자본", value: r.required, kind: "total" },
  ];
};

export function kicsPlain(i          , top             ) {
  const r = kicsResult(i);
  const t = (n        ) => `${(Math.round(n / 1e8)).toLocaleString("ko-KR")}억 원`;
  return {
    headline: `지급여력비율은 ${Number.isFinite(r.ratio) ? pct1(r.ratio) : "계산 불가"}예요. ${KICS_LEVEL[r.level]}이에요.`,
    driver: top && top.span > 0 ? `비율을 가장 크게 움직이는 건 ${top.plain}이에요.` : null,
    reasons: [
      `위험액을 그냥 더하면 ${t(r.sum)}이지만, 위험이 한꺼번에 터지지 않는다고 보고 상관계수로 합치면 ${t(r.basic)}이에요. 분산효과 ${t(r.diversification)}만큼 줄어요.`,
      `요구자본 ${t(r.required)} 대비 가용자본 ${t(i.available)}이에요. 100% 아래로 내려가면 감독당국이 적기시정조치를 해요.`,
      "상관계수는 설명용 예시예요. 실제 K-ICS는 위험별 세부 충격 시나리오와 감독규정 시행세칙의 계수를 써요.",
    ],
  };
}

// ───────────────────────── 5) 장해·과실 비율 보험금 ─────────────────────────
// 장해: 보험가입금액 × 지급률. 같은 사고로 여러 부위면 지급률을 더하되 100%까지(표준약관 장해분류표 총칙). 기왕 장해가 있는 부위는 그만큼 빼요.
// 과실: 손해액 × (1 − 내 과실 비율) − 자기부담금, 보상 한도까지.

                            
                               
              
                       
                  
                         
                
                 
                
                     
                
 

export const DISABILITY_EXAMPLES = [
  { label: "한 눈 실명", rate: 0.5 },
  { label: "한 귀 청력 완전 상실", rate: 0.25 },
  { label: "척추 약간의 운동장해", rate: 0.1 },
  { label: "한 손 엄지 잃음", rate: 0.2 },
  { label: "한 다리 3대 관절 중 하나 약간의 기능장해", rate: 0.05 },
]         ;

export function claimResult(i           ) {
  if (i.kind === "disability") {
    const raw = i.rates.filter((r) => r > 0).reduce((a, b) => a + b, 0);
    const total = clamp(raw - Math.max(0, i.prior), 0, 1);
    const pay = Math.floor(Math.max(0, i.sum) * total);
    return { pay, total, raw, capped: raw > 1, offset: 0, minimum: total > 0 && total < 0.03 };
  }
  const f = clamp(i.fault, 0, 1);
  const offset = Math.floor(Math.max(0, i.damage) * f);
  const afterFault = Math.max(0, i.damage) - offset;
  const pay = Math.max(0, Math.min(i.limit > 0 ? i.limit : Infinity, afterFault - Math.max(0, i.deductible)));
  return { pay, total: 1 - f, raw: 0, capped: i.limit > 0 && afterFault - i.deductible > i.limit, offset, minimum: false };
}
export const claimPay = (i           ) => claimResult(i).pay;

export const CLAIM_ASSUMPTIONS                          = [
  { key: "fault", label: "내 과실 비율", plain: "내 잘못 비율", unit: "pct", kind: "assumption", get: (i) => i.fault, set: (i, v) => ({ ...i, fault: clamp(v, 0, 1) }), range: fixedRange(0, 1) },
  { key: "damage", label: "손해액", plain: "손해 본 금액", unit: "won", kind: "fact", get: (i) => i.damage, set: (i, v) => ({ ...i, damage: Math.max(0, v) }), range: fixedRange(0, 50_000_000) },
  { key: "rate0", label: "주된 부위 지급률", plain: "장해 비율", unit: "pct", kind: "assumption", get: (i) => i.rates[0] ?? 0, set: (i, v) => ({ ...i, rates: [clamp(v, 0, 1), ...i.rates.slice(1)] }), range: fixedRange(0, 1), marks: [{ at: 0.03, label: "3% 미만은 보통 지급 안 함" }] },
  { key: "sum", label: "보험가입금액", plain: "가입 금액", unit: "won", kind: "fact", get: (i) => i.sum, set: (i, v) => ({ ...i, sum: Math.max(0, v) }), range: fixedRange(10_000_000, 300_000_000) },
];

export const faultCurve = (i           ) =>
  [0, 0.1, 0.2, 0.3, 0.5, 0.7].map((f) => ({ label: `내 과실 ${Math.round(f * 100)}%`, value: claimResult({ ...i, kind: "fault", fault: f }).pay, current: Math.abs(f - i.fault) < 0.001 }));

export function claimPlain(i           , top             ) {
  const r = claimResult(i);
  if (i.kind === "disability") {
    return {
      headline: `장해 보험금은 ${won(r.pay)}이에요(가입금액 ${won(i.sum)} × 지급률 ${pct1(r.total)}).`,
      driver: driverLine(top, "보험금"),
      reasons: [
        r.capped ? "부위별 지급률을 더하면 100%를 넘지만, 한 사고의 장해 지급률은 100%까지예요." : "같은 사고로 여러 부위를 다치면 부위별 지급률을 더해요.",
        i.prior > 0 ? `같은 부위에 원래 있던 장해 ${pct1(i.prior)}는 빼고 계산해요.` : "같은 부위에 원래 있던 장해가 있으면 그만큼 빼요.",
        r.minimum ? "상해 후유장해는 보통 지급률 3% 이상부터 줘요. 가입한 약관을 확인하세요." : "장해는 치료가 끝나 고정된 상태로 판정해요. 사고일부터 180일 안에 확정되지 않으면 180일째 상태로 판정하는 약관이 많아요.",
        "지급률은 표준약관 장해분류표 기준이에요. 판정이 다르면 보험사와 합의한 제3 의료기관에서 다시 판정받을 수 있어요.",
      ],
    };
  }
  return {
    headline: `받을 보험금은 ${won(r.pay)}이에요. 내 과실 ${pct1(i.fault)}만큼 ${won(r.offset)}이 빠졌어요.`,
    driver: driverLine(top, "보험금"),
    reasons: [
      `손해액 ${won(i.damage)}에서 내 과실 몫을 빼요(과실상계, 민법 제396조·제763조).`,
      i.deductible > 0 ? `자기부담금 ${won(i.deductible)}을 빼요.` : "자기부담금이 있으면 그만큼 더 빠져요.",
      r.capped ? `보상 한도 ${won(i.limit)}까지만 받아요.` : "보상 한도를 넘으면 한도까지만 받아요.",
      "자동차 사고 과실 비율은 손해보험협회 과실비율 인정기준을 써요. 다툼이 있으면 과실비율분쟁심의위원회에 심의를 청구할 수 있어요.",
    ],
  };
}

// ───────────────────────── 6) 전표 데이터 분석 ─────────────────────────
// 감사·내부통제에서 흔히 쓰는 전수 점검: 벤포드 첫 자리, 주말·공휴일 입력, 끝자리 0, 같은 금액 중복, 결재 한도 바로 아래, 결산일 근처.

                        
               
                  
                 
                
                
 

export const BENFORD = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => Math.log10(1 + 1 / d));

export function parseEntries(text        )                                     {
  const rows          = [];
  let skipped = 0;
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;
    const cells = (t.includes("\t") ? t.split("\t") : t.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)).map((c) => c.trim().replace(/^"|"$/g, ""));
    const date = (cells[0] ?? "").replace(/[./]/g, "-");
    const amount = Number((cells[2] ?? "").replace(/[,\s원]/g, ""));
    if (!/^\d{4}-\d{1,2}-\d{1,2}$/.test(date) || !Number.isFinite(amount)) {
      skipped++;
      continue;
    }
    const [y, m, d] = date.split("-").map(Number);
    rows.push({ date: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`, account: cells[1] ?? "", amount, memo: cells[3], user: cells[4] });
  }
  return { rows, skipped };
}

                             
                   
                 
                     
                      
                     
 

export function analyzeEntries(rows         , opts                                                 = { approvalLimit: 0 }) {
  const holidays = new Set(opts.holidays ?? []);
  const counts = new Array(9).fill(0);
  let benfordN = 0;
  const key = (e       ) => `${e.date}|${e.account}|${e.amount}`;
  const seen = new Map                ();
  for (const e of rows) seen.set(key(e), (seen.get(key(e)) ?? 0) + 1);
  const flagged                                        = [];
  const total = { weekend: 0, round: 0, duplicate: 0, belowLimit: 0, periodEnd: 0 };
  for (const e of rows) {
    const abs = Math.abs(e.amount);
    if (abs >= 10) {
      const first = Number(String(Math.floor(abs)).replace(/^0+/, "")[0]);
      if (first >= 1 && first <= 9) {
        counts[first - 1]++;
        benfordN++;
      }
    }
    const dt = new Date(`${e.date}T00:00:00Z`);
    const dow = dt.getUTCDay();
    const last = new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth() + 1, 0)).getUTCDate();
    const flags             = {
      weekend: dow === 0 || dow === 6 || holidays.has(e.date.slice(5)) || holidays.has(e.date),
      round: abs >= 1_000_000 && abs % 1_000_000 === 0,
      duplicate: (seen.get(key(e)) ?? 0) > 1,
      belowLimit: opts.approvalLimit > 0 && abs < opts.approvalLimit && abs >= opts.approvalLimit * 0.95,
      periodEnd: dt.getUTCDate() > last - 3 || (dt.getUTCMonth() === 0 && dt.getUTCDate() <= 5),
    };
    let any = false;
    for (const k of Object.keys(flags)                        ) {
      if (flags[k]) {
        total[k]++;
        any = true;
      }
    }
    if (any) flagged.push({ entry: e, flags });
  }
  const observed = counts.map((c) => (benfordN ? c / benfordN : 0));
  const mad = benfordN ? observed.reduce((a, o, i) => a + Math.abs(o - BENFORD[i]), 0) / 9 : 0;
  // Nigrini 첫 자리 MAD 기준: 0.006 이하 아주 잘 맞음, 0.012 이하 맞음, 0.015 이하 경계, 그 위는 안 맞음.
  const fit = !benfordN ? "none" : mad <= 0.006 ? "close" : mad <= 0.012 ? "acceptable" : mad <= 0.015 ? "marginal" : "nonconform";
  const score = (f            ) => (f.duplicate ? 3 : 0) + (f.belowLimit ? 3 : 0) + (f.weekend ? 2 : 0) + (f.round ? 1 : 0) + (f.periodEnd ? 1 : 0);
  flagged.sort((a, b) => score(b.flags) - score(a.flags) || Math.abs(b.entry.amount) - Math.abs(a.entry.amount));
  return { n: rows.length, benfordN, counts, observed, mad, fit, total, flagged };
}

export const BENFORD_FIT = { none: "숫자가 부족해요", close: "아주 잘 맞아요", acceptable: "맞는 편이에요", marginal: "경계예요", nonconform: "벤포드 분포와 달라요" }         ;

export const SAMPLE_ENTRIES = [
  "2026-03-02,소모품비,183400,사무용품,kim",
  "2026-03-03,접대비,1250000,거래처 식사,lee",
  "2026-03-07,여비교통비,4980000,출장,park",
  "2026-03-07,여비교통비,4980000,출장,park",
  "2026-03-10,외주용역비,30000000,용역 계약금,lee",
  "2026-03-12,소모품비,27600,커피,kim",
  "2026-03-15,복리후생비,1340000,야유회,choi",
  "2026-03-18,광고선전비,2150000,온라인 광고,kim",
  "2026-03-20,지급수수료,118800,카드 수수료,kim",
  "2026-03-24,수선비,1960000,에어컨 수리,park",
  "2026-03-30,외주용역비,4990000,자문료,lee",
  "2026-03-31,잡손실,10000000,정산 차이,lee",
].join("\n");
