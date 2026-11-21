// GENERATED from tools-oiyo src/lib/kr-franchise-housing-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 가맹사업 계약 기한과 공동주택 관리 점검 (2026-11-20, 전문 직군 전수조사 #12 새 직업: 가맹거래사·주택관리사 영역).
// 같은 코드가 oiyo-kr-law-guide 스킬 scripts/guide.mjs calc franchise / calc apartment 로 들어가요. 기한·요건 점검이고 대리·자문을 하지 않아요.
// 근거:
// - 가맹사업거래의 공정화에 관한 법률: 제7조 ③(정보공개서 제공 후 14일, 변호사·가맹거래사 자문을 받으면 7일 지나야 가맹금 수령·계약 체결),
//   제9조 ⑤(중소기업이 아니거나 가맹점 100개 이상 가맹본부는 예상매출액 산정서 서면 제공), 제10조(정보공개서 미제공·허위 등은 계약일부터 4개월 안 서면으로 가맹금 반환 요구,
//   가맹본부는 요구일부터 1개월 안 반환), 제11조 ①(가맹계약서를 14일 전에 제공), 제13조(만료 180일 전부터 90일 전까지 갱신 요구, 전체 기간 10년까지 갱신요구권,
//   같은 기간 안에 가맹본부가 거절·조건 변경을 통지하지 않으면 같은 조건으로 갱신된 것으로 봐요), 제14조(해지는 2개월 이상 유예기간을 두고 위반 사실을 밝혀 2회 이상 서면 통지).
// - 공동주택관리법: 제2조 ①·시행령 제2조(의무관리대상: 300세대 이상, 150세대 이상 승강기 또는 중앙집중식·지역난방, 150세대 이상 주상복합),
//   제23조 ④(관리비 등 다음 달 말일까지 공개), 제29조 ②(장기수선계획 3년마다 검토), 제30조·시행령 제31조(사용검사일부터 1년 지난 날이 속하는 달부터 장기수선충당금 적립),
//   제36조·시행령 제36조 별표 4(하자담보책임기간: 내력구조부 10년, 대지조성·철근콘크리트·철골·조적·지붕·방수 5년, 급배수·난방·전기·소방 등 설비 3년, 마감공사 2년;
//   전유부분은 인도일, 공용부분은 사용검사일부터), 제37조 ①(하자보수 청구를 받으면 15일 안에 보수하거나 계획을 알려요).
import { dueDate } from "./kr-expert-guide-2026.mjs";

export const FH_AS_OF = "2026-11-20";

const shift = (from        , rule                                                    ) => dueDate(rule, from)?.due ?? from;
const plain = (iso        , months        ) => {
  const [Y, M, D] = iso.split("-").map(Number);
  const d = new Date(Date.UTC(Y, M - 1 + months, 1));
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(D, last));
  return d.toISOString().slice(0, 10);
};
const addDays = (iso        , n        ) => new Date(Date.parse(iso) + n * 86_400_000).toISOString().slice(0, 10);

                                                                                                                                                                           
                                                                                                              

export function franchiseCheck(x                )         {
  const out         = [];
  if (x.infoGiven) {
    const earliest = addDays(x.infoGiven, (x.advised ? 7 : 14) + 1);
    out.push({ id: "cooling", label: `정보공개서를 받고 ${x.advised ? 7 : 14}일이 지난 뒤(${earliest}부터) 가맹금을 내거나 계약할 수 있어요`, date: earliest, tone: "info", cite: "가맹사업법 제7조 ③" });
    if (x.signed && x.signed < earliest) out.push({ id: "cooling-breach", label: "숙려기간 안에 계약했어요. 가맹금 반환을 요구할 수 있는 사유예요.", tone: "warn", cite: "가맹사업법 제10조 ①" });
  } else if (x.signed) out.push({ id: "no-info", label: "정보공개서를 받지 않았다면 가맹금 반환을 요구할 수 있어요.", tone: "warn", cite: "가맹사업법 제10조 ①" });
  if (x.contractGiven) {
    const earliest = addDays(x.contractGiven, 15);
    out.push({ id: "contract-doc", label: `가맹계약서는 계약 14일 전에 받아야 해요(${earliest}부터 서명)`, date: earliest, tone: x.signed && x.signed < earliest ? "warn" : "info", cite: "가맹사업법 제11조 ①" });
  }
  if (x.signed) out.push({ id: "refund", label: "가맹금 반환 서면 요구 마감(계약일부터 4개월)", date: shift(x.signed, { months: 4 }), tone: "info", cite: "가맹사업법 제10조 ①" });
  if (x.bigHq !== undefined) out.push({ id: "forecast", label: x.bigHq ? "가맹점 100개 이상이거나 중소기업이 아닌 가맹본부라 예상매출액 산정서를 서면으로 받아야 해요." : "예상매출액 산정서 서면 제공 의무 대상은 아니지만, 말로 들은 매출 예상은 근거 자료를 요청해 두세요.", tone: x.bigHq ? "warn" : "info", cite: "가맹사업법 제9조 ⑤" });
  if (x.currentEnd) {
    out.push({ id: "renew-open", label: "갱신 요구 시작(만료 180일 전)", date: addDays(x.currentEnd, -180), tone: "info", cite: "가맹사업법 제13조 ①" });
    out.push({ id: "renew-close", label: "갱신 요구 마감(만료 90일 전). 이때까지 본부가 거절·조건 변경을 알리지 않으면 같은 조건으로 갱신돼요.", date: addDays(x.currentEnd, -90), tone: "info", cite: "가맹사업법 제13조 ①·④" });
  }
  if (x.firstStart) out.push({ id: "renew-right", label: "갱신요구권이 보장되는 마지막 날(최초 계약부터 10년)", date: plain(x.firstStart, 120), tone: "info", cite: "가맹사업법 제13조 ②" });
  out.push({ id: "termination", label: "본부가 계약을 해지하려면 2개월 이상 유예기간을 두고 위반 사실을 밝혀 2회 이상 서면으로 알려야 해요. 이 절차가 없으면 해지 효력이 없어요.", tone: "info", cite: "가맹사업법 제14조" });
  return out.sort((a, b) => (a.date ?? "9999").localeCompare(b.date ?? "9999"));
}

                                                                                                                                                               

export function mandatoryManagement(x                ) {
  const h = Math.max(0, Math.floor(Number(x.households) || 0));
  const reasons           = [];
  if (h >= 300) reasons.push("300세대 이상");
  if (h >= 150 && x.elevator) reasons.push("150세대 이상 + 승강기");
  if (h >= 150 && x.centralHeating) reasons.push("150세대 이상 + 중앙집중식·지역난방");
  if (h >= 150 && x.mixedUse) reasons.push("150세대 이상 주상복합");
  return { mandatory: reasons.length > 0, reasons, note: reasons.length ? "주택관리업자에게 맡기거나 자치관리해야 하고, 관리사무소장은 주택관리사(보)를 둬야 해요." : "의무관리대상이 아니에요. 입주자등 2/3 이상 동의로 의무관리대상으로 전환할 수 있어요(150세대 이상 등)." };
}

export const DEFECT_PERIODS = [
  { years: 2, label: "마감공사(미장·도장·도배·타일·수장 등)" },
  { years: 3, label: "설비공사(급배수·난방·환기·전기·소방·승강기 등)·옥외공사" },
  { years: 5, label: "대지조성·철근콘크리트·철골·조적·지붕·방수공사" },
  { years: 10, label: "내력구조부(기둥·내력벽·보·바닥·지붕틀 등)" },
];

export function apartmentSchedule(x                , today = new Date(Date.now() + 9 * 3_600_000).toISOString().slice(0, 10) /* 한국 날짜 */) {
  const items         = [];
  if (x.useApproval) {
    for (const p of DEFECT_PERIODS) items.push({ id: `defect-common-${p.years}`, label: `공용부분 하자담보 ${p.years}년 끝: ${p.label}`, date: plain(x.useApproval, p.years * 12), tone: "info", cite: "공동주택관리법 제36조, 시행령 별표 4" });
    const y1 = plain(x.useApproval, 12);
    items.push({ id: "repair-fund", label: "장기수선충당금 적립 시작 달", date: `${y1.slice(0, 7)}-01`, tone: "info", cite: "공동주택관리법 제30조, 시행령 제31조" });
    let review = plain(x.useApproval, 36);
    while (review < today) review = plain(review, 36);
    items.push({ id: "repair-plan", label: "다음 장기수선계획 정기 검토(3년마다, 사용검사일 기준 어림)", date: review, tone: "info", cite: "공동주택관리법 제29조 ②" });
  }
  if (x.handover) for (const p of DEFECT_PERIODS.slice(0, 3)) items.push({ id: `defect-unit-${p.years}`, label: `우리 집(전유부분) 하자담보 ${p.years}년 끝: ${p.label}`, date: plain(x.handover, p.years * 12), tone: "info", cite: "공동주택관리법 제36조, 시행령 별표 4" });
  return { mandatory: mandatoryManagement(x), items: items.sort((a, b) => (a.date ?? "").localeCompare(b.date ?? "")).map((i) => ({ ...i, passed: !!i.date && i.date < today })) };
}

export const FH_NOTE = "가맹계약과 공동주택 관리의 법정 기한·요건을 점검해요. 계약서 특약과 관리규약이 더 유리하면 그것을 따르고, 분쟁은 한국공정거래조정원(가맹)이나 공동주택관리 분쟁조정위원회·하자심사분쟁조정위원회에서 조정해요.";
