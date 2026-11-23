// GENERATED from tools-oiyo src/lib/consult-memo-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 상담 메모 만들기 (2026-11-24, CHOSEUN "자율적으로 상담자 니즈에 따른 도구와 스킬 계속 추가"). 계산 없음.
// 전문가 상담은 시간제로 비용이 나가는 경우가 많아, 첫 10분을 사실 정리에 쓰지 않도록
// 사용자가 넣은 내용으로 한 장짜리 메모(사건 요약, 날짜순 경과, 금액, 묻고 싶은 것, 가진 서류·빠진 서류)를 만들어요.
// 법률·세무 판단을 하지 않고, 넣지 않은 내용은 지어내지 않아요.
import { EXPERTS, expertById, findExpertNeeds } from "./expert-visit-2026.mjs";

export const CONSULT_MEMO_AS_OF = "2026-11-24";

                                                        
                         
                                                      
                               
                                 
                              
                           
                                  
                                                                 
  

const dateRe = /^\d{4}-\d{2}-\d{2}$/;
const clean = (s         ) => (s ?? "").replace(/\s+/g, " ").trim();

export function buildConsultMemo(x           ) {
  const situation = clean(x.situation);
  if (!situation) throw new Error("situation");
  const guess = findExpertNeeds(situation, 1)[0];
  const e = expertById(x.expert ?? "") ?? (guess ? expertById(guess.expert) : undefined);
  const events = (x.events ?? []).map((v) => ({ date: v.date && dateRe.test(v.date) ? v.date : "", what: clean(v.what) })).filter((v) => v.what)
    .sort((a, b) => (a.date && b.date ? a.date.localeCompare(b.date) : a.date ? -1 : b.date ? 1 : 0));
  const questions = (x.questions ?? []).map(clean).filter(Boolean).slice(0, 10);
  const have = new Set((x.have ?? []).map(clean).filter(Boolean));
  const bring = e?.bring ?? [];
  const missing = bring.filter((b) => !have.has(b));
  const amount = x.amount && x.amount > 0 && x.amount < 1e13 ? Math.round(x.amount) : undefined;
  const lines = [
    "[상담 메모]",
    `분야: ${e ? `${e.name} (${e.scope})` : "미정 — 아래 요약을 보고 상담 창구에서 안내받아요"}`,
    "",
    "1. 무슨 일인가요",
    situation,
    "",
    "2. 지금까지 경과 (날짜순)",
    ...(events.length ? events.map((v) => `- ${v.date || "날짜 미상"} ${v.what}`) : ["- (적지 않음)"]),
    "",
    `3. 관련 금액: ${amount ? `${amount.toLocaleString("ko-KR")}원` : "(적지 않음)"}`,
    `4. 원하는 결과: ${clean(x.wants) || "(적지 않음)"}`,
    "",
    "5. 묻고 싶은 것",
    ...(questions.length ? questions.map((q, i) => `${i + 1}) ${q}`) : ["1) (적지 않음)"]),
    "",
    "6. 챙긴 서류",
    ...(have.size ? [...have].map((h) => `- ${h}`) : ["- (없음)"]),
    ...(missing.length ? ["", "7. 더 챙기면 좋은 서류", ...missing.map((m) => `- ${m}`)] : []),
  ];
  const deadlines = events.length ? [] : ["경과에 날짜를 넣으면 상담할 때 기한(시효·불복·신고)을 바로 따질 수 있어요."];
  return {
    asOf: CONSULT_MEMO_AS_OF,
    expert: e?.id ?? null,
    text: lines.join("\n"),
    missing,
    free: e?.free ?? ["대한법률구조공단 132", "국세청 126", "고용노동부 1350"],
    tips: [
      ...deadlines,
      "상담 전에 비용(시간당·건당)과 무료 상담 범위를 먼저 물어봐요.",
      "메모는 사실만 적어요. 판단은 상담에서 받아요. 입력은 이 브라우저 밖으로 나가지 않아요.",
    ],
  };
}

export const MEMO_EXPERTS = EXPERTS.map((e) => ({ id: e.id, icon: e.icon, name: e.name, bring: e.bring }));
