// GENERATED from tools-oiyo src/lib/kr-industrial-safety-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 산업안전 묶음 (2026-11-21, 역량 지도의 빈 분야). 중대재해 해당 판정·사고 보고 기한·안전보건교육 시간·안전보건 인력 선임 기준.
// 같은 코드가 oiyo-kr-law-guide 스킬 scripts/guide.mjs calc serious / report / education / staffing 으로 들어가요.
// 정보·계산만 해요. 신고서 작성·제출 대행이나 사건 대응 자문은 하지 않아요.
// 근거(국가법령정보센터 현행 원문 대조 2026-11-21, company-brain projects/oiyo-ecosystem/safety-pack-facts-2026-11-21.md):
// - 중대재해 처벌 등에 관한 법률(법률 제17907호): 제2조 2호(중대산업재해: 사망 1명↑, 같은 사고 6개월↑ 치료 부상 2명↑, 같은 유해요인 직업성 질병 1년 안 3명↑),
//   제3조(상시 5명 미만 제외), 부칙 제1조①(개인사업자·50명 미만·건설 50억 미만 공사는 2024-01-27부터), 제6조(사망 1년 이상 징역 또는 10억 이하 벌금 병과 가능,
//   부상·질병 7년 이하 또는 1억 이하, 5년 안 재범 1/2 가중), 제7조(법인 50억/10억 이하), 제15조(손해액 5배 이내).
// - 산업안전보건법(2026-10-27 시행): 제54조②·시행규칙 제3조·제67조(중대재해 = 사망 1명↑, 3개월↑ 요양 부상 동시 2명↑, 부상·질병 동시 10명↑, 지체 없이 전화·팩스 보고),
//   제57조③·시행규칙 제73조①(사망 또는 3일 이상 휴업 → 발생일부터 1개월 안 산업재해조사표), 제170조 3호(은폐는 1년 이하 징역 또는 1천만 원 이하 벌금),
//   시행령 별표 35(2026-07-28 개정: 중대재해 미보고·거짓 3,000만, 산재 미보고 700/1,000/1,500만, 거짓 1,500만).
// - 시행규칙 별표 4(2025-05-30 개정) 교육시간, 비고 3(50명 미만 도매업·숙박 및 음식점업 등은 1/2 이상).
// - 시행령 별표 2(안전보건관리책임자), 제24조(안전보건관리담당자), 별표 3(안전관리자), 별표 5(보건관리자), 제16조②·제20조②(300명 이상 전담).
// - 시행규칙 제37조②, 사업장 위험성평가에 관한 지침(고용노동부고시 제2026-73호, 2026-11-04 전부개정) 제13~16조.
import { dueDate } from "./kr-expert-guide-2026.mjs";

export const SAFETY_AS_OF = "2026-11-21";
export const SAFETY_NOTE = "법령 원문 기준으로 어림 판정해요. 실제 해당 여부·처벌은 수사·재판에서 사실관계로 정해져요. 보고·신고는 사업주가 직접 하고, 사건 대응은 노동청·안전 전문기관·변호사와 상의해요.";

                                            
                                                                    

const LAW = "중대재해처벌법";
const OSH = "산업안전보건법";

// ── 1. 중대재해 해당 판정 ────────────────────────────────────────────
                             
                                      
                                                          
                                                        
                                                    
                                                                
                                                          
                                        
                         
                                    
  

export function seriousAccident(x               ) {
  const deaths = x.deaths ?? 0;
  const cri = deaths >= 1 || (x.injured6m ?? 0) >= 2 || (x.illness1y ?? 0) >= 3;
  const osh = deaths >= 1 || (x.injured3m ?? 0) >= 2 || (x.injuredTotal ?? 0) >= 10;
  const report = deaths >= 1 || !!x.lostDays3 || (x.injured3m ?? 0) > 0 || (x.injured6m ?? 0) > 0;
  const head = x.headcount ?? 0;
  const applies = head >= 5 && (!x.date || x.date >= "2024-01-27" || head >= 50);
  const items               = [];
  if (cri) {
    const why = deaths >= 1 ? "사망자가 있어서" : (x.injured6m ?? 0) >= 2 ? "같은 사고로 6개월 이상 치료가 필요한 부상자가 2명 이상이라" : "같은 유해요인 직업성 질병자가 1년 안에 3명 이상이라";
    items.push({ tone: "warn", text: `${why} 중대재해처벌법의 중대산업재해에 해당해요.`, cite: `${LAW} 제2조 2호` });
  } else items.push({ tone: "good", text: "입력한 내용으로는 중대재해처벌법의 중대산업재해 기준(사망 1명, 6개월 치료 2명, 직업성 질병 1년 3명)에 못 미쳐요.", cite: `${LAW} 제2조 2호` });
  if (cri) {
    if (head < 5) items.push({ tone: "info", text: "상시근로자 5명 미만이면 사업주·경영책임자 처벌 규정(제2장)은 적용되지 않아요. 산업안전보건법 책임은 따로 있어요.", cite: `${LAW} 제3조` });
    else if (!applies) items.push({ tone: "info", text: "2024년 1월 27일 전 사고이고 50명 미만이라 그때는 적용이 유예됐어요.", cite: `${LAW} 부칙 제1조①` });
    else {
      items.push({ tone: "warn", text: deaths >= 1 ? "안전보건 확보 의무를 어겨 사망에 이르면 경영책임자는 1년 이상 징역 또는 10억 원 이하 벌금(같이 받을 수 있어요), 법인은 50억 원 이하 벌금이에요." : "안전보건 확보 의무를 어겨 부상·질병에 이르면 경영책임자는 7년 이하 징역 또는 1억 원 이하 벌금, 법인은 10억 원 이하 벌금이에요.", cite: `${LAW} 제6조·제7조` });
      items.push({ tone: "info", text: "형이 확정된 뒤 5년 안에 다시 범하면 형의 2분의 1까지 늘어나요. 고의·중대한 과실이면 손해액의 5배까지 배상 책임이 있어요.", cite: `${LAW} 제6조③·제15조` });
    }
  }
  if (osh) items.push({ tone: "warn", text: "산업안전보건법의 중대재해이기도 해요. 알게 되면 지체 없이 관할 지방고용노동관서에 전화·팩스 등으로 보고해요.", cite: `${OSH} 제54조②, 시행규칙 제3조·제67조` });
  if (report) items.push({ tone: "info", text: "사망자나 3일 이상 휴업이 필요한 부상·질병자가 있으면 발생일부터 1개월 안에 산업재해조사표를 내요.", cite: `${OSH} 제57조③, 시행규칙 제73조①` });
  return { criSerious: cri, oshSerious: osh, mustReport: report, actApplies: cri && head >= 5 && applies, items };
}

// ── 2. 사고 보고 기한과 과태료 ───────────────────────────────────────
export const REPORT_FINES = {
  seriousUnreported: [30_000_000, 30_000_000, 30_000_000],
  unreported: [7_000_000, 10_000_000, 15_000_000],
  falseReport: [15_000_000, 15_000_000, 15_000_000],
};

                                                                                                                                                        

export function accidentReport(x             ) {
  const must = (x.deaths ?? 0) >= 1 || !!x.lostDays3 || !!x.serious;
  const due = must ? dueDate({ months: 1 }, x.date) : null;
  const n = (x.nth ?? 1) - 1;
  const late = !!(due && x.reported && x.reported > due.due);
  const items               = [];
  if (x.serious) items.push({ tone: "warn", text: "중대재해는 기한을 세지 않고 알게 된 즉시(지체 없이) 보고해요. 안 하거나 거짓으로 하면 과태료 3,000만 원이에요.", cite: `${OSH} 제54조②, 시행령 별표 35` });
  if (due) {
    items.push({ tone: late ? "warn" : "info", text: `산업재해조사표 제출 마감: ${due.due}${due.shifted ? ` (${due.nominal}이 휴일이라 다음 날로 미뤘어요)` : ""}`, cite: `${OSH} 제57조③, 시행규칙 제73조①` });
    items.push({ tone: late ? "warn" : "info", text: `기한 안에 안 내면 과태료 ${(REPORT_FINES.unreported[n] / 10_000).toLocaleString("ko-KR")}만 원(${n + 1}차 기준, 1차 700·2차 1,000·3차 1,500만 원), 거짓으로 내면 1,500만 원이에요.`, cite: `시행령 별표 35` });
  } else items.push({ tone: "good", text: "사망이나 3일 이상 휴업이 아니면 산업재해조사표 제출 대상은 아니에요. 기록은 남겨 두어요.", cite: `시행규칙 제73조①` });
  items.push({ tone: "warn", text: "산업재해를 숨기거나 숨기도록 시키면 과태료가 아니라 형벌(1년 이하 징역 또는 1천만 원 이하 벌금)이에요.", cite: `${OSH} 제170조 3호` });
  const dday = due && x.today ? Math.round((Date.parse(due.due) - Date.parse(x.today)) / 86_400_000) : null;
  return { must, due: due?.due ?? null, dday, late, fine: late ? REPORT_FINES.unreported[n] : 0, items };
}

// ── 3. 안전보건교육 시간 ─────────────────────────────────────────────
                                                   
                                                          
                                                                                                                                    

export function safetyEducation(x          ) {
  const f = x.half ? 0.5 : 1;
  const short = x.hire === "daily" || x.hire === "week";
  const periodic = x.job === "other" ? 12 : 6;
  const onHire = x.hire === "regular" ? 8 : x.hire === "month" ? 4 : 1;
  const change = short ? 1 : 2;
  const w = Math.max(0, x.workers ?? 1);
  const s = Math.max(0, x.supervisors ?? 0);
  const perWorker = { periodicHalf: periodic * f, yearly: periodic * 2 * f, onHire: onHire * f, change: change * f };
  const items               = [
    { tone: "info", text: `정기교육은 반기마다 ${periodic * f}시간 이상이에요(${x.job === "office" ? "사무직" : x.job === "sales" ? "판매 업무" : "그 밖의 근로자"}).`, cite: "시행규칙 별표 4 제1호가목" },
    { tone: "info", text: `채용할 때 ${onHire * f}시간, 작업내용이 바뀔 때 ${change * f}시간 이상이에요.`, cite: "시행규칙 별표 4 제1호나·다목" },
  ];
  if (s) items.push({ tone: "info", text: `관리감독자는 해마다 ${16 * f}시간 이상이에요(${s}명 × ${16 * f}시간).`, cite: "시행규칙 별표 4 제1의2호" });
  if (x.construction && short) items.push({ tone: "info", text: "건설 일용근로자는 처음 건설 현장에 들어가기 전에 기초안전보건교육 4시간을 받아요.", cite: "시행규칙 별표 4 제1호마목" });
  items.push({ tone: "info", text: "위험 작업(별표 5)을 하면 특별교육이 따로 있어요(일반 16시간, 일용·1주 이하 2시간).", cite: "시행규칙 별표 4 제1호라목" });
  if (x.half) items.push({ tone: "info", text: "상시 50명 미만 도매업·숙박 및 음식점업 등은 교육시간을 2분의 1 이상으로 해요.", cite: "시행규칙 별표 4 비고 3" });
  return { perWorker, yearlyTotal: perWorker.yearly * w + 16 * f * s, items };
}

// ── 4. 안전보건 인력 선임 기준 ────────────────────────────────────────
// 대표 업종만 골라요. 별표 2·3·5는 업종 목록이 길어서, 목록에 없는 업종은 별표 원문을 봐요.
export const SECTORS = {
  "mfg-heavy": { label: "화학·금속·기계·전자·자동차·고무·플라스틱 제조", chief: 50, safety: "A", health: "1", officer: true },
  "mfg-food": { label: "식료품·음료 제조", chief: 50, safety: "A", health: "23", officer: true },
  transport: { label: "운수·창고업", chief: 100, safety: "A", health: "C", officer: false },
  retail: { label: "도매·소매업", chief: 100, safety: "B", health: "C", officer: false },
  food: { label: "숙박·음식점업", chief: 100, safety: "B", health: "C", officer: false },
  it: { label: "소프트웨어·정보서비스·금융·전문 서비스", chief: 300, safety: null, health: null, officer: false },
  construction: { label: "건설업", chief: 0, safety: "K", health: "K", officer: false },
}         ;
                                            

                                                                                                    

function safetyCount(group               , n        , amount        , civil         )                                         {
  if (group === "A") return n >= 500 ? { count: 2, band: "500명 이상" } : n >= 50 ? { count: 1, band: "50명 이상 500명 미만" } : null;
  if (group === "B") return n >= 1000 ? { count: 2, band: "1천명 이상" } : n >= 50 ? { count: 1, band: "50명 이상 1천명 미만" } : null;
  if (group === "K") {
    const e = amount / 100_000_000; // 억 원
    const first = civil ? 150 : 120;
    if (e < 50) return null;
    if (e < first) return { count: 1, band: `50억 이상 ${first}억 미만` };
    if (e < 800) return { count: 1, band: `${first}억 이상 800억 미만` };
    const bands                     = [[1500, 2], [2200, 3], [3000, 4], [3900, 5], [4900, 6], [6000, 7], [7200, 8], [8500, 9]];
    let lo = 800;
    for (const [hi, c] of bands) { if (e < hi) return { count: c, band: `${lo.toLocaleString("ko-KR")}억 이상 ${hi.toLocaleString("ko-KR")}억 미만` }; lo = hi; }
    return { count: -1, band: "8,500억 이상" };
  }
  return null;
}

function healthCount(group               , n        , amount        , civil         )                                         {
  if (group === "1") return n >= 500 ? { count: 2, band: n >= 2000 ? "2천명 이상" : "500명 이상 2천명 미만" } : n >= 50 ? { count: 1, band: "50명 이상 500명 미만" } : null;
  if (group === "23") return n >= 1000 ? { count: 2, band: n >= 3000 ? "3천명 이상" : "1천명 이상 3천명 미만" } : n >= 50 ? { count: 1, band: "50명 이상 1천명 미만" } : null;
  if (group === "C") return n >= 5000 ? { count: 2, band: "5천명 이상" } : n >= 50 ? { count: 1, band: "50명 이상 5천명 미만" } : null;
  if (group === "K") {
    const base = civil ? 1000 : 800;
    const e = amount / 100_000_000;
    if (e < base && n < 600) return null;
    const extra = Math.max(Math.floor((e - base) / 1400), Math.floor((n - 600) / 600), 0);
    return { count: 1 + extra, band: `${base}억 이상 또는 600명 이상(1,400억 원·600명마다 1명 더)` };
  }
  return null;
}

export function safetyStaffing(x            ) {
  const s = SECTORS[x.sector];
  const n = Math.max(0, x.headcount ?? 0);
  const amount = Math.max(0, x.amount ?? 0);
  const civil = !!x.civil;
  const isCon = x.sector === "construction";
  const chief = isCon ? amount >= 2_000_000_000 : n >= s.chief;
  const safety = safetyCount(s.safety, n, amount, civil);
  const health = healthCount(s.health, n, amount, civil);
  const officer = s.officer && n >= 20 && n < 50;
  const dedicated = n >= 300 || (isCon && amount >= (civil ? 15_000_000_000 : 12_000_000_000));
  const items               = [];
  items.push(chief
    ? { tone: "warn", text: `안전보건관리책임자를 두어야 해요(${isCon ? "공사금액 20억 원 이상" : `상시 ${s.chief}명 이상`}). 보통 사업장 대표가 맡아요.`, cite: "시행령 제14조①, 별표 2" }
    : { tone: "good", text: `안전보건관리책임자 의무 기준(${isCon ? "공사금액 20억 원" : `상시 ${s.chief}명`})에 못 미쳐요.`, cite: "시행령 별표 2" });
  if (safety) items.push({ tone: "warn", text: safety.count < 0 ? "안전관리자 수는 별표 3 원문 구간표(8,500억 원 이상)를 봐요." : `안전관리자 ${safety.count}명 이상(${safety.band})${dedicated ? ", 다른 업무를 겸하지 않는 전담이어야 해요" : ""}.`, cite: "시행령 제16조, 별표 3" });
  else items.push({ tone: "good", text: s.safety ? "안전관리자 선임 기준에는 못 미쳐요." : "이 업종은 별표 3 안전관리자 선임 대상 목록에 없어요.", cite: "시행령 별표 3" });
  if (health) items.push({ tone: "warn", text: `보건관리자 ${health.count}명 이상(${health.band})${n >= 300 ? ", 300명 이상이면 전담" : ""}.`, cite: "시행령 제20조, 별표 5" });
  else items.push({ tone: "good", text: s.health ? "보건관리자 선임 기준에는 못 미쳐요." : "이 업종은 별표 5 보건관리자 선임 대상 목록에 없어요.", cite: "시행령 별표 5" });
  if (officer) items.push({ tone: "warn", text: "상시 20명 이상 50명 미만 제조업 등은 안전보건관리담당자를 1명 이상 두어요.", cite: "시행령 제24조①" });
  if (!isCon && n >= 5) items.push({ tone: "info", text: "상시 5명 이상이면 중대재해처벌법의 안전보건관리체계 구축 의무가 있어요.", cite: `${LAW} 제3조·제4조` });
  items.push({ tone: "info", text: "위험성평가는 작업 시작 전 최초평가, 해마다 정기평가, 설비·작업 방법이 바뀔 때 수시평가를 해요. 매월·매주 상시평가를 하면 정기평가를 한 것으로 봐요.", cite: "시행규칙 제37조②, 고시 제2026-73호 제13~16조" });
  return { chief, safety: safety?.count ?? 0, health: health?.count ?? 0, officer, dedicated: dedicated && !!safety, items };
}
