// GENERATED from tools-oiyo src/lib/kr-court-deposit-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 공탁금 이자·시효와 변제공탁 요건 점검 (2026-11-21, 전문 직군 전수조사 남은 빈칸). 돈을 받지 않는 상대에게 갚거나 공탁금을 찾으려는 사람이 기한을 놓치지 않게 하는 용도예요.
// 같은 코드가 oiyo-kr-law-guide 스킬 scripts/guide.mjs calc deposit 로 들어가요. 공탁서 작성·신청 대리를 하지 않아요(법무사·변호사 업무).
// 근거(2026-11 확인):
// - 공탁금의 이자에 관한 규칙 제2조(대법원규칙 제3068호, 2022-10-01 시행): 연 1만분의 35(0.35%). 이전 연 0.1%.
//   이자 계산의 일수 기준은 규칙에 따로 없어 여기서는 맡긴 날부터 찾는 날까지 일할(365일)로 어림해요.
// - 공탁법 제9조 ③(공탁금 출급·회수청구권은 행사할 수 있는 때부터 10년 지나면 시효 소멸, 국고 귀속), ④(시효 전 안내), 공탁규칙 제61조·제62조.
// - 민법 제487조(변제공탁: 수령거절, 수령불능, 과실 없이 채권자를 알 수 없음), 제488조(채무이행지 공탁소), 공탁법 제5조의2(형사공탁 특례, 2022-12-09 시행).
export const DEPOSIT_AS_OF = "2026-11-21";
export const DEPOSIT_RATE = 0.0035;

const day = 86_400_000;
const parse = (s         ) => (s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? Date.parse(`${s}T00:00:00Z`) : NaN);
const addYears = (iso        , y        ) => {
  const [Y, M, D] = iso.split("-").map(Number);
  const d = new Date(Date.UTC(Y + y, M - 1, D));
  if (d.getUTCDate() !== D) d.setUTCDate(0);
  return d.toISOString().slice(0, 10);
};

                                                               
export const GROUNDS                         = {
  refused: "채권자가 받기를 거절해요(수령거절)",
  unable: "채권자가 받을 수 없어요(주소 불명·부재 등 수령불능)",
  unknown: "누가 채권자인지 과실 없이 알 수 없어요(채권자 불확지)",
  none: "해당 없음",
};

export function depositCheck(x                                                                                                                       ) {
  const amount = Math.max(0, Number(x.amount) || 0);
  const a = parse(x.deposited), b = parse(x.withdrawn);
  const days = Number.isFinite(a) && Number.isFinite(b) && b > a ? Math.round((b - a) / day) : 0;
  const interest = Math.floor((amount * DEPOSIT_RATE * days) / 365);
  const from = x.exercisable || x.deposited;
  const items                                                                   = [];
  const g = x.ground ?? "none";
  if (x.criminal) items.push({ tone: "info", text: "형사사건 피해자의 인적사항을 몰라도 형사공탁을 할 수 있어요. 사건이 계속 중인 법원 소재지 공탁소에 법원·사건번호로 피공탁자를 적어요.", cite: "공탁법 제5조의2" });
  else if (g === "none") items.push({ tone: "warn", text: "변제공탁은 채권자가 받기를 거절하거나, 받을 수 없거나, 과실 없이 채권자를 알 수 없을 때만 할 수 있어요. 먼저 갚겠다고 제공(이행 제공)한 기록을 남겨요.", cite: "민법 제487조" });
  else items.push({ tone: "good", text: `공탁 사유: ${GROUNDS[g]}. 채무 전액(이자·지연손해금 포함)을 채무이행지 공탁소에 맡겨야 채무가 없어져요.`, cite: "민법 제487조·제488조" });
  items.push({ tone: "info", text: `공탁금 이자는 연 ${DEPOSIT_RATE * 100}%예요(2022-10-01부터). 은행 예금보다 낮으니 오래 두지 않는 게 좋아요.`, cite: "공탁금의 이자에 관한 규칙 제2조" });
  return {
    amount, days, rate: DEPOSIT_RATE, interest,
    lapseOn: from ? addYears(from, 10) : null,
    lapseRule: "출급·회수할 수 있는 때부터 10년이 지나면 청구권이 없어지고 국고로 들어가요.",
    items,
  };
}

export const DEPOSIT_NOTE = "공탁금 이자와 시효를 어림하는 계산이에요. 이자는 공탁금보관은행이 출급·회수청구서로 계산하고, 일수 계산 방법은 실제 지급액과 조금 다를 수 있어요. 공탁서 작성과 신청은 직접 하거나 법무사·변호사에게 맡겨요.";
