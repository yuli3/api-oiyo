// GENERATED from tools-oiyo src/lib/kr-ip-deadlines-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 특허·실용신안·디자인·상표 기한 한 장 (2026-11-20, 전문 직군 전수조사 #10). 출원인·스타트업·실무자가 권리가 사라지는 날을 놓치지 않게 하는 용도예요.
// 같은 코드가 oiyo-kr-law-guide 스킬 scripts/guide.mjs calc ip 로 들어가요. 기한 계산이고 출원·대리를 하지 않아요(변리 업무는 변리사).
// 근거:
// - 공지예외: 특허법 제30조(공개일부터 12개월 안 출원), 실용신안법 제11조 준용, 디자인보호법 제36조(12개월).
// - 우선권: 특허법 제54조(조약우선권 12개월), 제55조(국내우선권 1년), 디자인보호법 제51조·상표법 제46조(6개월).
// - PCT: 국제출원은 우선일부터 12개월(파리조약), 국내단계 서면 제출 우선일부터 2년 7개월(특허법 제203조).
// - 심사청구: 특허법 제59조 ②(출원일부터 3년), 실용신안법 제12조(3년).
// - 의견서: 거절이유 통지에 정한 기간(보통 2개월, 연장 가능). 거절결정 불복·재심사: 특허법 제67조의2·제132조의17, 상표법 제115조(등본 송달일부터 3개월).
// - 등록료: 특허법 제79조 ③(특허결정 등본 송달일부터 3개월), 제81조(그 뒤 6개월 추가납부, 가산). 4년차부터 연차료는 전년도에 내요(제79조 ①).
// - 존속: 특허 출원일 후 20년(제88조), 실용신안 10년(실용신안법 제22조), 디자인 출원일 후 20년(디자인보호법 제91조), 상표 등록일부터 10년(상표법 제83조),
//   상표 갱신 신청은 만료 1년 전부터 만료일까지, 만료 후 6개월 안에도 가능(제84조).
// - 말일이 공휴일(토요일·근로자의 날 포함)이면 다음 날(특허법 제14조 ④). 존속기간 만료일은 미루지 않아요.
import { dueDate } from "./kr-expert-guide-2026.mjs";

export const IP_AS_OF = "2026-11-20";
                                                                   
                       
               
                 
                    
                     
                        
                        
                           
                          
                      
  
                                                                                                                                      

const plain = (from        , months        ) => {
  const [Y, M, D] = from.split("-").map(Number);
  const d = new Date(Date.UTC(Y, M - 1 + months, 1));
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(D, last));
  return d.toISOString().slice(0, 10);
};
const span = (a        , b        ) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

export function ipDeadlines(x         , today = new Date(Date.now() + 9 * 3_600_000).toISOString().slice(0, 10) /* 한국 날짜 */)               {
  const out               = [];
  const add = (id        , label        , from                    , months        , cite        , note         ) => {
    if (!from) return;
    const r = dueDate({ months, tax: true }, from);
    if (r) out.push({ id, label, due: r.due, shifted: r.shifted, cite, note });
  };
  const fixed = (id        , label        , due        , cite        , note         ) => out.push({ id, label, due, shifted: false, cite, note });
  const tech = x.kind === "patent" || x.kind === "utility";
  if (x.kind !== "trademark") add("grace", "공지예외 주장 출원 마감(공개일부터 12개월)", x.disclosed, 12, x.kind === "design" ? "디자인보호법 제36조" : "특허법 제30조", x.filed ? `이미 ${x.filed}에 출원했다면 그때 공지예외를 주장했는지 확인해요(보완 기간이 있어요).` : "공개한 내용을 증명할 자료를 함께 내요.");
  const base = x.priority || x.filed;
  if (base) {
    add("paris", `해외 출원 우선권 주장 마감(${tech ? "12" : "6"}개월)`, base, tech ? 12 : 6, tech ? "특허법 제54조" : x.kind === "design" ? "디자인보호법 제51조" : "상표법 제46조");
    if (tech) {
      add("domestic-priority", "국내우선권 주장 출원 마감(1년)", base, 12, "특허법 제55조", "개량 발명을 묶어 다시 낼 때 써요.");
      add("pct", "PCT 국제출원 마감(우선일부터 12개월)", base, 12, "특허협력조약, 특허법 제54조");
      if (x.kind === "patent") add("pct-national", "PCT 국내단계 진입 마감(우선일부터 31개월)", base, 31, "특허법 제203조", "한국 기준이에요. 나라마다 30·31개월로 달라요.");
    }
  }
  if (tech && x.filed) add("exam", "심사청구 마감(출원일부터 3년)", x.filed, 36, x.kind === "patent" ? "특허법 제59조" : "실용신안법 제12조", "청구하지 않으면 취하한 것으로 봐요.");
  add("opinion", `의견서·보정서 제출 마감(${x.noticeMonths ?? 2}개월)`, x.noticeServed, x.noticeMonths ?? 2, "특허법 제63조, 상표법 제55조", "통지서에 적힌 기간이 우선이고, 기간 연장을 신청할 수 있어요.");
  add("rejection", "재심사청구·거절결정 불복심판 마감(3개월)", x.rejectionServed, 3, x.kind === "trademark" ? "상표법 제115조" : "특허법 제67조의2·제132조의17");
  if (x.decisionServed) {
    add("reg-fee", "설정등록료 납부 마감(3개월)", x.decisionServed, 3, "특허법 제79조 ③, 상표법 제72조");
    add("reg-fee-late", "설정등록료 추가납부 마감(그 뒤 6개월, 가산)", x.decisionServed, 9, "특허법 제81조");
  }
  if (x.registered) {
    if (x.kind === "trademark") {
      const exp = plain(x.registered, 120);
      fixed("term", "상표권 존속기간 만료(등록일부터 10년)", exp, "상표법 제83조");
      fixed("renew-open", "갱신등록 신청 시작(만료 1년 전)", plain(exp, -12), "상표법 제84조");
      fixed("renew-late", "갱신 늦은 신청 마감(만료 후 6개월, 가산)", plain(exp, 6), "상표법 제84조");
    } else if (x.filed) {
      const years = x.kind === "utility" ? 10 : 20;
      fixed("term", `존속기간 만료(출원일 후 ${years}년)`, plain(x.filed, years * 12), x.kind === "patent" ? "특허법 제88조" : x.kind === "utility" ? "실용신안법 제22조" : "디자인보호법 제91조", "연차료를 내야 유지돼요.");
      // 4년차분부터: 설정등록일의 해당일 전날까지(등록일 + n년)
      for (let y = 3; y < years; y++) {
        const due = plain(x.registered, y * 12);
        if (due >= today) {
          fixed("annuity", `${y + 1}년차 연차료 납부 마감`, due, "특허법 제79조 ①", `안 내면 6개월 안에 가산해 추가납부(${plain(due, 6)}까지), 그 뒤엔 권리가 소멸해요.`);
          break;
        }
      }
    }
  }
  return out.map((d) => ({ ...d, daysLeft: span(today, d.due) })).sort((a, b) => a.due.localeCompare(b.due));
}

export const IP_NOTE = "지식재산 기한 계산이에요. 통지서에 적힌 기간이 우선이고, 해외 출원 기한은 나라마다 달라요. 출원·심판 대리는 변리사 업무예요.";
