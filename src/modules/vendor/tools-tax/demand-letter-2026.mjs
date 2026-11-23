// GENERATED from tools-oiyo src/lib/demand-letter-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 내용증명 작성 도우미 (2026-11-23, CHOSEUN "사람들이 전문가를 찾아가는 니즈"). 계산 없음.
// 사용자가 넣은 사실로 독촉·통지 문안의 뼈대만 만들어요. 법률 판단이나 서류 작성 대행이 아니에요.
// 내용증명은 우체국(창구·인터넷우체국)에서 같은 문서 3부로 보내요(발송인·수취인·우체국 보관).
export const DEMAND_LETTER_AS_OF = "2026-11-23";

                                                                                
                           
                   
                                         
                                             
                       
                                                                       
                                       
                                
                                  
                 
  

export const LETTER_TYPES                                                                       = [
  { id: "loan", title: "빌려준 돈(대여금) 반환 요청", sinceLabel: "빌려준 날", law: "민법 제598조(소비대차)" },
  { id: "deposit", title: "임대차 보증금 반환 요청", sinceLabel: "임대차 종료일", law: "주택임대차보호법 제3조의3(임차권등기명령)" },
  { id: "wage", title: "밀린 임금·퇴직금 지급 요청", sinceLabel: "퇴직일", law: "근로기준법 제36조(퇴직 후 14일 안 지급)" },
  { id: "payment", title: "물품·용역 대금 지급 요청", sinceLabel: "납품·완료일", law: "민법 제387조(이행기와 이행지체)" },
  { id: "nonrenewal", title: "임대차 갱신 거절(계약 종료) 통지", sinceLabel: "계약 만료일", law: "주택임대차보호법 제6조(만료 6개월~2개월 전 통지)" },
];

const won = (n         ) => (n && n > 0 ? `금 ${Math.round(n).toLocaleString("ko-KR")}원` : "금 ○○○원");
const d = (s         ) => (s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? `${s.slice(0, 4)}년 ${Number(s.slice(5, 7))}월 ${Number(s.slice(8, 10))}일` : "○○○○년 ○월 ○일");

export function buildDemandLetter(x             ) {
  const t = LETTER_TYPES.find((l) => l.id === x.type);
  if (!t) throw new Error("type");
  const sender = (x.sender || "").trim() || "발신인 ○○○";
  const receiver = (x.receiver || "").trim() || "수신인 ○○○";
  const pay = x.account?.trim() ? ` 아래 계좌(${x.account.trim()})로` : "";
  const facts = x.facts?.trim() ? `\n\n${x.facts.trim()}` : "";
  let body        ;
  switch (x.type) {
    case "loan":
      body = `발신인은 ${d(x.since)} 수신인에게 ${won(x.amount)}을 빌려드렸습니다.${facts}\n\n아직 이 돈을 돌려받지 못했으므로, ${d(x.dueDate)}까지${pay} ${won(x.amount)}을 갚아 주시기 바랍니다. 기한까지 갚지 않으시면 지급명령 신청 등 법적 절차를 진행할 수 있음을 알려드립니다.`;
      break;
    case "deposit":
      body = `발신인은 수신인과 맺은 임대차계약이 ${d(x.since)} 끝났으나 보증금 ${won(x.amount)}을 아직 돌려받지 못했습니다.${facts}\n\n${d(x.dueDate)}까지${pay} 보증금 ${won(x.amount)}을 돌려주시기 바랍니다. 돌려받지 못하면 임차권등기명령 신청, 보증금반환 청구 등 법적 절차를 진행할 수 있음을 알려드립니다.`;
      break;
    case "wage":
      body = `발신인은 ${d(x.since)} 퇴직하였으나 임금·퇴직금 ${won(x.amount)}을 아직 받지 못했습니다.${facts}\n\n${d(x.dueDate)}까지${pay} ${won(x.amount)}을 지급해 주시기 바랍니다. 지급되지 않으면 고용노동부 진정 등 절차를 진행할 수 있음을 알려드립니다.`;
      break;
    case "payment":
      body = `발신인은 ${d(x.since)} 수신인에게 물품·용역을 공급하였으나 대금 ${won(x.amount)}을 아직 받지 못했습니다.${facts}\n\n${d(x.dueDate)}까지${pay} ${won(x.amount)}을 지급해 주시기 바랍니다. 지급되지 않으면 지급명령 신청 등 법적 절차를 진행할 수 있음을 알려드립니다.`;
      break;
    default:
      body = `발신인은 수신인과 맺은 임대차계약이 ${d(x.since)} 만료됨에 따라, 계약을 갱신하지 않고 만료일에 종료함을 알려드립니다.${facts}\n\n만료일에 보증금${x.amount ? ` ${won(x.amount)}` : ""}을${pay} 돌려주시기 바랍니다.`;
  }
  const head = [`제목: ${t.title}`, "", `수신인: ${receiver}${x.receiverAddress?.trim() ? ` (${x.receiverAddress.trim()})` : ""}`, `발신인: ${sender}${x.senderAddress?.trim() ? ` (${x.senderAddress.trim()})` : ""}`, ""].join("\n");
  const foot = `\n\n${d(x.today)}\n발신인 ${sender} (서명 또는 날인)`;
  return {
    title: t.title,
    law: t.law,
    text: head + body + foot,
    tips: [
      "같은 문서 3부를 우체국 창구나 인터넷우체국에서 내용증명으로 보내요(발송인·수취인·우체국 보관).",
      "금액·날짜는 계약서·이체 내역과 꼭 맞춰요. 사실이 아닌 내용이나 위협하는 말은 쓰지 않아요.",
      x.type === "nonrenewal" ? "갱신 거절은 만료 6개월 전부터 2개월 전까지 상대방에게 닿아야 해요(임차인은 2개월 전까지)." : "내용증명만으로 시효가 끝까지 멈추지는 않아요. 보낸 뒤 6개월 안에 지급명령·소송 등을 해야 해요(민법 제174조).",
      "이 문안은 사용자가 넣은 사실로 만든 뼈대예요. 다툼이 크면 대한법률구조공단 132에 먼저 물어보세요.",
    ],
  };
}
