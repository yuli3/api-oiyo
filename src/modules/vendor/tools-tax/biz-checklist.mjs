// GENERATED from tools-oiyo src/lib/biz-checklist.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 반드시 할 것 / 하지 말 것 + 사업자 세무·노무 일정 (2026-11-14 확인).
// 법·세무 항목은 근거 조문을 붙이고, 경영 원칙 항목은 "경험칙"으로 표시해요(법적 의무가 아니에요).
// 신고 기한이 토·일·공휴일이면 다음 영업일(국세기본법 제5조) — kr-business-day.ts의 공휴일 표를 써요.
// 근로소득 간이지급명세서 매월 제출은 2027-01-01 지급분부터(소득세법 제164조의3, 2026년 귀속까지는 반기 제출).
import { holidaysKnown, krTaxDeadline } from "./kr-business-day.mjs";

export const CHECKLIST_AS_OF = "2026-11-14";

                                                             
                                                                                            
                                                                    

export const ROLE_LABEL                       = { ceo: "대표·창업자", team: "경영팀", bookkeeper: "경리·총무", advisor: "세무사·회계사" };
export const STAGE_LABEL                        = {
  start: "창업 준비", firstSale: "첫 매출", hire: "첫 직원 채용", corp: "법인 운영", invest: "투자 유치", closing: "결산·신고", grow: "성장·확장",
};
export const AREA_LABEL                       = { tax: "세무", labor: "노무", legal: "법무", money: "자금", strategy: "경영 원칙" };

                           
             
                      
             
                  
                
               
              
                       
                 
                             
                
 

const ALL         = ["ceo", "team", "bookkeeper", "advisor"];

export const MUST_ITEMS             = [
  // ── 창업 준비 ──
  { id: "biz-reg", kind: "do", area: "tax", stages: ["start"], roles: ["ceo", "advisor"], text: "사업 시작일부터 20일 안에 사업자등록하기", why: "등록 전 매입세액도 일정 범위에서 공제받고, 세금계산서를 주고받을 수 있어요.", basis: "부가가치세법 제8조", risk: "미등록가산세 공급가액의 1%" },
  { id: "separate-money", kind: "do", area: "money", stages: ["start", "corp"], roles: ["ceo", "bookkeeper"], text: "회사 돈과 개인 돈 통장·카드 나누기", why: "증빙이 깔끔해야 경비 인정과 세무조사 대응이 쉬워요. 법인은 대표라도 회사 돈을 마음대로 쓸 수 없어요.", basis: "소득세법 제160조의5(복식부기의무자 사업용계좌)" },
  { id: "cofounder-agreement", kind: "do", area: "legal", stages: ["start"], roles: ["ceo", "team"], text: "공동창업자 지분·역할·이탈 시 처리를 계약서로 남기기", why: "가장 흔한 초기 분쟁이에요. 지분 베스팅(4년, 1년 클리프)과 퇴사 시 지분 반환 조건을 정해 둬요." },
  { id: "trademark", kind: "do", area: "legal", stages: ["start"], roles: ["ceo"], text: "브랜드 이름을 쓰기 전에 상표 검색·출원하기", why: "먼저 출원한 사람이 권리를 가져요. 이름을 알린 뒤 빼앗기면 바꾸는 비용이 커요.", basis: "상표법 제35조(선출원)" },
  { id: "validate-problem", kind: "do", area: "strategy", stages: ["start"], roles: ["ceo", "team"], text: "만들기 전에 고객 10명 이상과 문제부터 이야기하기", why: "실패한 스타트업이 가장 많이 꼽는 이유가 '시장이 원하지 않음'이에요. JTBD 인터뷰로 고객이 이미 돈·시간을 쓰는 문제인지 확인해요." },
  { id: "no-5050", kind: "dont", area: "strategy", stages: ["start"], roles: ["ceo", "team"], text: "결정권자 없는 50:50 지분으로 시작하지 않기", why: "의견이 갈리면 아무것도 결정할 수 없어요. 지분이 같아도 최종 결정권자나 교착 해소 방법을 정해요." },
  { id: "no-verbal-outsource", kind: "dont", area: "legal", stages: ["start", "grow"], roles: ["ceo", "team"], text: "외주 개발·디자인을 말로만 맡기지 않기", why: "결과물 저작권·소스코드 소유, 하자 보수, 대금 지급 시점을 계약서에 적지 않으면 회사 자산이 되지 않아요.", basis: "저작권법 제9조·제45조" },

  // ── 첫 매출 ──
  { id: "tax-invoice", kind: "do", area: "tax", stages: ["firstSale"], roles: ["bookkeeper", "advisor"], text: "공급할 때 세금계산서 발급하기(월합계는 다음 달 10일까지)", why: "법인과 직전 연도 공급가액 8천만 원 이상 개인은 전자세금계산서가 의무이고, 발급 다음 날까지 국세청에 전송해요.", basis: "부가가치세법 제32조·제34조, 시행령 제68조", risk: "미발급가산세 공급가액의 2%" },
  { id: "cash-receipt", kind: "do", area: "tax", stages: ["firstSale"], roles: ["ceo", "bookkeeper"], text: "현금영수증 의무발행업종이면 10만 원 이상 현금 거래에 바로 발급하기", why: "소비자가 요청하지 않아도 발급해야 해요.", basis: "소득세법 제162조의3", risk: "미발급액의 20% 가산세" },
  { id: "vat-reserve", kind: "dont", area: "money", stages: ["firstSale", "grow"], roles: ["ceo", "bookkeeper"], text: "받은 부가세를 운영비로 쓰지 않기", why: "매출에 붙은 10%는 고객에게 맡아 둔 돈이에요. 신고 달에 한꺼번에 나가 현금이 막히는 가장 흔한 원인이에요. 별도 통장에 떼어 둬요." },
  { id: "qualified-proof", kind: "do", area: "tax", stages: ["firstSale", "corp"], roles: ["bookkeeper"], text: "3만 원 넘는 지출은 세금계산서·카드·현금영수증으로 받기", why: "간이영수증만 있으면 경비는 인정돼도 증빙불비가산세가 붙어요. 업무추진비는 3만 원 초과 시 적격증빙이 없으면 경비가 안 돼요.", basis: "법인세법 제25조·제116조, 소득세법 제160조의2", risk: "증빙불비가산세 2%" },
  { id: "one-customer", kind: "dont", area: "strategy", stages: ["firstSale", "grow"], roles: ["ceo", "team"], text: "한 고객에게 매출 절반 이상을 기대지 않기", why: "그 고객이 떠나거나 단가를 깎으면 회사가 흔들려요. 상위 1곳 비중을 매달 봐요." },

  // ── 첫 직원 채용 ──
  { id: "contract", kind: "do", area: "labor", stages: ["hire"], roles: ["ceo", "bookkeeper"], text: "일 시작 전에 근로계약서를 써서 한 부 건네기", why: "임금·근로시간·휴일·연차를 서면으로 적고 교부해야 해요. 단시간·기간제도 같아요.", basis: "근로기준법 제17조", risk: "500만 원 이하 벌금" },
  { id: "insurance", kind: "do", area: "labor", stages: ["hire"], roles: ["bookkeeper", "advisor"], text: "4대보험 취득 신고는 입사한 다음 달 15일까지", why: "늦으면 소급 보험료와 과태료가 함께 나와요. 두루누리 지원 대상인지도 확인해요.", basis: "고용보험법 제15조, 국민연금법 제21조, 국민건강보험법 제11조" },
  { id: "payslip", kind: "do", area: "labor", stages: ["hire"], roles: ["bookkeeper"], text: "월급날마다 임금명세서 주기", why: "기본급·수당별 계산 방법과 공제 내역을 적어야 해요.", basis: "근로기준법 제48조 제2항", risk: "500만 원 이하 과태료" },
  { id: "min-wage", kind: "dont", area: "labor", stages: ["hire"], roles: ["ceo", "bookkeeper"], text: "수습이라도 최저임금보다 적게 주지 않기", why: "1년 이상 계약의 수습 3개월만 90%까지 줄일 수 있고, 단순노무직은 감액할 수 없어요.", basis: "최저임금법 제5조·제6조", risk: "3년 이하 징역 또는 2천만 원 이하 벌금" },
  { id: "late-wage", kind: "dont", area: "labor", stages: ["hire", "grow"], roles: ["ceo"], text: "임금·퇴직금을 늦게 주지 않기", why: "임금은 매달 1회 이상 정한 날에, 퇴직금은 퇴직 후 14일 안에 줘야 해요. 체불은 형사처벌 대상이에요.", basis: "근로기준법 제36조·제43조, 근로자퇴직급여 보장법 제9조" },
  { id: "harassment-edu", kind: "do", area: "labor", stages: ["hire"], roles: ["bookkeeper"], text: "직장 내 성희롱 예방교육 1년에 한 번 하기", why: "직원 수와 관계없이 의무예요(10명 미만은 자료 배포로 갈음 가능).", basis: "남녀고용평등법 제13조", risk: "500만 원 이하 과태료" },
  { id: "rules-10", kind: "do", area: "labor", stages: ["grow"], roles: ["ceo", "bookkeeper"], text: "상시 10명이 되면 취업규칙 만들어 신고하기", why: "근로자에게 불리하게 바꿀 때는 과반 동의가 필요해요.", basis: "근로기준법 제93조·제94조" },
  { id: "dismissal", kind: "dont", area: "labor", stages: ["hire", "grow"], roles: ["ceo", "team"], text: "말로 해고하거나 30일 전 예고 없이 내보내지 않기", why: "해고 사유와 시기는 서면으로 알려야 하고, 5명 이상 사업장은 정당한 이유가 필요해요.", basis: "근로기준법 제23조·제26조·제27조" },
  { id: "runway-hire", kind: "dont", area: "money", stages: ["hire", "grow"], roles: ["ceo", "team"], text: "런웨이 6개월 미만일 때 고정 인건비 늘리지 않기", why: "투자 유치에 보통 3~6개월이 걸려요. 채용 전에 런웨이 계산기로 채용 후 소진 달을 확인해요." },

  // ── 법인 운영 ──
  { id: "no-loan-to-ceo", kind: "dont", area: "tax", stages: ["corp"], roles: ["ceo", "bookkeeper", "advisor"], text: "법인 돈을 대표가 개인적으로 가져다 쓰지 않기(가지급금)", why: "회사가 이자를 받은 것으로 보고(인정이자) 법인세를 매기고, 못 갚으면 대표 상여로 소득세까지 나와요.", basis: "법인세법 제28조·제52조, 시행령 제89조·제106조" },
  { id: "registry", kind: "do", area: "legal", stages: ["corp"], roles: ["ceo", "advisor"], text: "임원·본점·목적이 바뀌면 2주 안에 변경등기하기", why: "임원 임기 만료(이사 3년)도 등기 대상이에요. 늦으면 대표 개인에게 과태료가 나와요.", basis: "상법 제317조·제383조, 제635조", risk: "500만 원 이하 과태료" },
  { id: "shareholder-meeting", kind: "do", area: "legal", stages: ["corp", "closing"], roles: ["ceo", "advisor"], text: "결산 후 정기주주총회 열어 재무제표 승인받고 의사록 남기기", why: "배당·임원 보수 한도·퇴직금 규정도 주총 결의가 있어야 경비 인정에 유리해요.", basis: "상법 제365조·제449조" },
  { id: "exec-pay-rules", kind: "do", area: "tax", stages: ["corp"], roles: ["ceo", "advisor"], text: "임원 보수·상여·퇴직금 규정을 정관이나 주총 결의로 먼저 정하기", why: "규정 없이 준 임원 상여·퇴직금은 경비로 인정되지 않을 수 있어요.", basis: "법인세법 시행령 제43조·제44조" },
  { id: "fake-expense", kind: "dont", area: "tax", stages: ["corp", "closing"], roles: ALL, text: "가짜 경비·가공 인건비 넣지 않기", why: "부정과소신고가산세 40%에 조세범 처벌까지 갈 수 있어요. 가족 인건비는 실제 근무 기록이 있어야 해요.", basis: "국세기본법 제47조의3, 조세범 처벌법 제3조", risk: "부정과소신고가산세 40%" },
  { id: "privacy", kind: "do", area: "legal", stages: ["firstSale", "corp"], roles: ["ceo", "team"], text: "고객 개인정보는 목적을 알리고 동의받아 필요한 만큼만 모으기", why: "개인정보 처리방침 공개와 안전조치가 필요해요.", basis: "개인정보 보호법 제15조·제29조·제30조" },
  { id: "safety", kind: "do", area: "labor", stages: ["grow"], roles: ["ceo"], text: "상시 5명 이상이면 안전보건관리체계 갖추기", why: "2024-01-27부터 5명 이상 사업장도 중대재해처벌법 대상이에요.", basis: "중대재해 처벌 등에 관한 법률 제4조" },

  // ── 투자 유치 ──
  { id: "joint-guarantee", kind: "dont", area: "legal", stages: ["invest"], roles: ["ceo"], text: "대표 개인 연대책임·주식매수청구 조항을 확인 없이 서명하지 않기", why: "회사가 어려워질 때 대표 개인 재산으로 투자금을 물어줘야 할 수 있어요. 전문가 검토 후 서명해요." },
  { id: "cap-table", kind: "do", area: "money", stages: ["invest"], roles: ["ceo", "team", "advisor"], text: "투자 전후 지분표(cap table)와 희석을 미리 계산하기", why: "옵션 풀, 전환사채·SAFE 전환까지 넣어야 실제 지분이 보여요." },
  { id: "kpi-monthly", kind: "do", area: "strategy", stages: ["invest", "grow"], roles: ["ceo", "team"], text: "매달 같은 지표(매출, 번레이트, 런웨이, LTV/CAC)를 같은 형식으로 보고하기", why: "투자자 신뢰와 내부 의사결정 속도가 함께 올라가요." },

  // ── 결산·신고 ──
  { id: "deadline-calendar", kind: "do", area: "tax", stages: ["closing", "corp"], roles: ["bookkeeper", "advisor"], text: "아래 세무 일정을 달력에 넣고 1주 전에 자료 넘기기", why: "기한 다음 날부터 무신고·납부지연 가산세가 붙어요.", basis: "국세기본법 제47조의2·제47조의4", risk: "무신고가산세 20%, 납부지연 하루 0.022%" },
  { id: "withholding", kind: "do", area: "tax", stages: ["hire", "closing"], roles: ["bookkeeper"], text: "직원·프리랜서에게 준 돈은 다음 달 10일까지 원천세 신고·납부", why: "프리랜서 3.3%, 일용직, 근로소득 모두 원천징수 대상이에요.", basis: "소득세법 제128조", risk: "원천징수납부지연가산세 최대 10%" },
  { id: "advisor-early", kind: "do", area: "tax", stages: ["closing"], roles: ["ceo", "advisor"], text: "결산 전(11~12월)에 세무사와 절세·결산 방향 미리 잡기", why: "연구인력개발비·고용증대 세액공제, 감가상각 방법은 연말 전에 준비해야 쓸 수 있어요." },
  { id: "miss-deadline-sunday", kind: "dont", area: "tax", stages: ["closing"], roles: ["bookkeeper"], text: "기한 마지막 날에 처음 홈택스 열지 않기", why: "마감일은 접속이 몰려요. 공인인증·권한 위임 문제로 넘어가는 일이 많아요." },
  { id: "sunk-cost", kind: "dont", area: "strategy", stages: ["grow"], roles: ["ceo", "team"], text: "이미 쓴 돈(매몰비용) 때문에 안 되는 사업을 붙잡지 않기", why: "의사결정은 앞으로 들어갈 돈과 얻을 것만 비교해요. 의사결정 트리로 계속·중단을 같은 기준으로 봐요." },
  { id: "spread-bets", kind: "dont", area: "strategy", stages: ["grow"], roles: ["ceo", "team"], text: "물음표 사업 여러 개에 조금씩 나눠 투자하지 않기", why: "BCG에서 물음표는 크게 밀거나 접어야 해요. 어중간하면 모두 개(dog)가 되기 쉬워요." },
];

export function filterItems(opts                                                      ) {
  return MUST_ITEMS.filter(
    (i) =>
      (!opts.roles?.length || i.roles.some((r) => opts.roles .includes(r))) &&
      (!opts.stages?.length || i.stages.some((s) => opts.stages .includes(s))) &&
      (!opts.areas?.length || opts.areas.includes(i.area)),
  );
}

// ───────────────────────── 세무·노무 일정 ─────────────────────────

                             
                           
               
                                       
                         
                    
                      
                                
                  
                    
 

                                
                          
                    
                         
              
                
             
                
                
 

const ymd = (d      ) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const lastDay = (y        , m        ) => new Date(y, m, 0).getDate();

/** 한 해(1~12월)의 신고·납부 일정. 12월 결산 법인 기준이에요. */
export function taxCalendar(year        , p            ) {
  const out                  = [];
  const add = (m        , day                 , title        , area      , basis        , note         ) => {
    const d = new Date(year, m - 1, day === "last" ? lastDay(year, m) : day);
    out.push({ statutory: ymd(d), due: ymd(krTaxDeadline(d)), title, area, basis, note });
  };
  // 부가가치세
  if (p.vat === "general") {
    add(1, 25, `${year - 1}년 2기 부가세 확정신고·납부`, "tax", "부가가치세법 제49조");
    add(7, 25, "1기 부가세 확정신고·납부", "tax", "부가가치세법 제49조");
    if (p.entity === "corp") {
      add(4, 25, "1기 부가세 예정신고·납부", "tax", "부가가치세법 제48조", "직전 과세기간 공급가액 1.5억 원 미만 법인은 고지서로 납부");
      add(10, 25, "2기 부가세 예정신고·납부", "tax", "부가가치세법 제48조", "직전 과세기간 공급가액 1.5억 원 미만 법인은 고지서로 납부");
    } else {
      add(4, 25, "1기 부가세 예정고지 납부", "tax", "부가가치세법 제48조 제3항", "고지서가 오면 납부(직전 기 납부세액의 절반)");
      add(10, 25, "2기 부가세 예정고지 납부", "tax", "부가가치세법 제48조 제3항", "고지서가 오면 납부(직전 기 납부세액의 절반)");
    }
  } else if (p.vat === "simple") {
    add(1, 25, `${year - 1}년 간이과세자 부가세 신고·납부`, "tax", "부가가치세법 제67조");
    add(7, 25, "간이과세자 예정부과 납부", "tax", "부가가치세법 제66조", "고지서가 오면 납부");
  } else if (p.entity === "indiv") {
    add(2, 10, `${year - 1}년 면세사업자 사업장현황신고`, "tax", "소득세법 제78조");
  }
  // 소득세·법인세
  if (p.entity === "corp") {
    add(3, 31, `${year - 1}년 법인세 신고·납부`, "tax", "법인세법 제60조", "12월 결산 법인. 분납은 1천만 원 초과분");
    if (p.sincere) add(4, 30, `${year - 1}년 법인세 신고(성실신고확인)`, "tax", "법인세법 제60조의2");
    add(p.sincere ? 5 : 4, p.sincere ? 31 : 30, `${year - 1}년 법인지방소득세 신고·납부`, "tax", "지방세법 제103조의23");
    add(8, 31, "법인세 중간예납", "tax", "법인세법 제63조", "직전 연도 산출세액 기준 또는 가결산. 중간예납세액 50만 원 미만 중소기업은 제외");
  } else {
    add(p.sincere ? 6 : 5, p.sincere ? 30 : 31, `${year - 1}년 종합소득세·개인지방소득세 신고·납부`, "tax", p.sincere ? "소득세법 제70조의2" : "소득세법 제70조");
    add(11, 30, "종합소득세 중간예납(고지)", "tax", "소득세법 제65조", "고지서가 오면 납부");
  }
  // 원천세·지급명세서·4대보험
  if (p.employer) {
    if (p.halfYearWithholding) {
      add(1, 10, `${year - 1}년 하반기 원천세 신고·납부(반기)`, "tax", "소득세법 제128조 제2항");
      add(7, 10, "상반기 원천세 신고·납부(반기)", "tax", "소득세법 제128조 제2항");
    } else {
      for (let m = 1; m <= 12; m++) add(m, 10, `${m === 1 ? 12 : m - 1}월 지급분 원천세 신고·납부`, "tax", "소득세법 제128조");
    }
    add(2, "last", `${year - 1}년 이자·배당·기타소득 지급명세서 제출`, "tax", "소득세법 제164조");
    add(3, 10, `${year - 1}년 근로·퇴직소득 지급명세서 제출(연말정산)`, "tax", "소득세법 제164조");
    if (year <= 2027) add(1, 31, `${year - 1}년 하반기 근로소득 간이지급명세서`, "tax", "소득세법 제164조의3", "2027년 지급분부터 매월 제출로 바뀌어요");
    if (year <= 2026) add(7, 31, "상반기 근로소득 간이지급명세서", "tax", "소득세법 제164조의3");
    for (let m = 1; m <= 12; m++) add(m, "last", `${m === 1 ? 12 : m - 1}월 지급분 사업·일용소득 간이지급명세서${(m === 1 ? year - 1 : year) >= 2027 ? "(근로소득 포함)" : ""}`, "tax", "소득세법 제164조·제164조의3");
    add(3, 15, `${year - 1}년 고용·산재보험 보수총액신고`, "labor", "고용보험 및 산업재해보상보험의 보험료징수 등에 관한 법률 제16조의10");
    add(12, 31, "다음 해 상반기 원천세 반기납부 신청", "tax", "소득세법 시행령 제186조", "상시 20명 이하 사업장");
  }
  out.sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : 0));
  return { events: out, holidaysKnown: holidaysKnown(year) };
}

/** 오늘 이후 가장 가까운 n개 일정 */
export function upcoming(events                 , today        , n = 5) {
  return events.filter((e) => e.due >= today).slice(0, n);
}

// ───────────────────────── 이번 달 백오피스 한 장 (2026-11-20, 다음 10종 #6) ─────────────────────────
// 1인·소상공인이 "이번 달 무엇을, 언제까지, 어디서" 하는지 한 장으로 봐요. 위 taxCalendar에 매월 하는 노무 일(4대보험료,
// 급여명세서), 입사·퇴사 때 생기는 기한, 월합계 세금계산서 마감, 기한은 없지만 매달 하면 좋은 장부 정리를 더해요.
// 근거: 국민건강보험법 제78조·국민연금법 제89조(보험료 다음 달 10일), 근로기준법 제17조(근로계약서)·제36조(금품청산 14일)·
// 제48조②(임금명세서), 국민연금법 시행규칙·국민건강보험법 시행규칙·고용보험법 제15조(취득·상실 신고 다음 달 15일),
// 근로자퇴직급여 보장법 제9조(퇴직금 14일), 부가가치세법 제34조③(월합계 세금계산서 다음 달 10일).

                                                  
                                         
                  
 

                              
                                
                   
                                             
                    
 

                            
              
                
             
                
                
                
                     
                
                
                               
                    
                    
 

const WHERE                              = [
  [/지방소득세/, "위택스(wetax.go.kr) 또는 홈택스에서 이어서", undefined],
  [/원천세/, "홈택스 › 신고/납부 › 원천세", "/ko/salary-calculator/"],
  [/간이지급명세서|지급명세서/, "홈택스 › 지급명세서·자료제출", undefined],
  [/부가세|부가가치세/, "홈택스 › 신고/납부 › 부가가치세", "/ko/vat-calculator/"],
  [/사업장현황/, "홈택스 › 신고/납부 › 사업장현황신고", undefined],
  [/종합소득세/, "홈택스 › 신고/납부 › 종합소득세", "/ko/comprehensive-income-tax-calculator/"],
  [/법인세/, "홈택스 › 신고/납부 › 법인세", undefined],
  [/보수총액/, "4대사회보험 정보연계센터(EDI) 또는 고용·산재 토탈서비스", undefined],
  [/반기납부/, "홈택스 › 신청/제출 › 원천징수 반기별 납부 승인 신청", undefined],
];
const whereOf = (title        ) => WHERE.find(([re]) => re.test(title)) ?? [/./, "홈택스", undefined];

const iso = (d      ) => ymd(d);
const addDays = (s        , n        ) => {
  const [y, m, d] = s.split("-").map(Number);
  return iso(new Date(y, m - 1, d + n));
};
const nextMonth15 = (s        ) => {
  const [y, m] = s.split("-").map(Number);
  return iso(new Date(y, m, 15));
};
const validDate = (s         )              => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(s).getTime());

/** month "YYYY-MM"의 할 일. today를 주면 지난 일·남은 날을 붙여요. */
export function monthlyBackoffice(month        , p              , ev              = {}, today         ) {
  const m0 = /^(\d{4})-(\d{2})$/.exec(month);
  if (!m0) throw new Error("month: YYYY-MM");
  const y = +m0[1];
  const m = +m0[2];
  const first = `${month}-01`;
  const last = `${month}-${String(lastDay(y, m)).padStart(2, "0")}`;
  const inMonth = (d        ) => d >= first && d <= last;
  const roll = (s        ) => iso(krTaxDeadline(new Date(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10))));
  const tasks              = [];
  // 법정 기한이 이달이면 휴일로 다음 달 초로 밀려도 이달 할 일로 봐요.
  const thisMonth = new Set           ();

  for (const e of taxCalendar(y, p).events) {
    if (!e.statutory.startsWith(month)) continue;
    const [, where, tool] = whereOf(e.title);
    const t            = { due: e.due, title: e.title, area: e.area, basis: e.basis, where, tool, note: e.note };
    tasks.push(t);
    thisMonth.add(t);
  }
  if (p.vat === "general") {
    tasks.push({ due: roll(`${month}-10`), title: "지난달 공급분 월합계·일괄 세금계산서 발급 마감", area: "tax", basis: "부가가치세법 제34조③", where: "홈택스 › 전자세금계산서 발급", note: "거래할 때 바로 발급했으면 할 일 없음. 늦게 발급하면 가산세 1%" });
  }
  if (p.employer) {
    tasks.push({ due: roll(`${month}-10`), title: "지난달분 4대보험료 납부", area: "labor", basis: "국민건강보험법 제78조·국민연금법 제89조", where: "4대사회보험 정보연계센터(EDI) 고지서·자동이체", note: "자동이체면 잔액만 확인" });
    if (p.payday && p.payday >= 1 && p.payday <= 31) {
      const d = `${month}-${String(Math.min(p.payday, lastDay(y, m))).padStart(2, "0")}`;
      tasks.push({ due: d, title: "월급 지급과 임금명세서 주기", area: "labor", basis: "근로기준법 제43조·제48조②", where: "회사(문자·메일·메신저로 줘도 돼요)", tool: "/ko/salary-calculator/", note: "명세서에 기본급·수당·공제 항목과 계산 방법을 적어요. 안 주면 과태료" });
    }
  }
  for (const h of (ev.hires ?? []).filter(validDate)) {
    if (inMonth(h)) tasks.push({ due: h, title: `입사(${h}) 근로계약서 써서 1부 주기`, area: "labor", basis: "근로기준법 제17조", where: "회사", note: "임금·근로시간·휴일·연차를 적어요" });
    tasks.push({ due: roll(nextMonth15(h)), title: `입사(${h}) 4대보험 취득신고`, area: "labor", basis: "국민연금법 시행규칙 제2조·국민건강보험법 시행규칙 제4조·고용보험법 제15조", where: "4대사회보험 정보연계센터(EDI)", note: "입사한 달의 다음 달 15일까지" });
  }
  for (const l of (ev.leaves ?? []).filter(validDate)) {
    tasks.push({ due: addDays(l, 14), title: `퇴사(${l}) 월급·퇴직금 등 모두 정산`, area: "labor", basis: "근로기준법 제36조·근로자퇴직급여 보장법 제9조", where: "회사", tool: "/ko/severance-calculator/", note: "14일 안에. 합의하면 늦출 수 있어요" });
    tasks.push({ due: roll(nextMonth15(l)), title: `퇴사(${l}) 4대보험 상실신고`, area: "labor", basis: "국민연금법 시행규칙 제3조·국민건강보험법 시행규칙 제4조·고용보험법 제15조", where: "4대사회보험 정보연계센터(EDI)", note: "실업급여를 받으려면 이직 사유를 정확히 적어요" });
  }
  if (m === 1 && p.employer) tasks.push({ due: `${month}-01`, title: "새해 최저임금 반영 확인", area: "labor", basis: "최저임금법 제6조·제10조", where: "회사", tool: "/ko/labor-cost-calculator/" });

  const relevant = tasks.filter((t) => t.due <= last || thisMonth.has(t));
  const out = relevant
    .map((t) => {
      if (!today || !validDate(today)) return t;
      const left = Math.round((new Date(t.due).getTime() - new Date(today).getTime()) / 86_400_000);
      return { ...t, daysLeft: left, overdue: left < 0 };
    })
    .sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : 0));
  const later = tasks.filter((t) => t.due > last && !thisMonth.has(t)).sort((a, b) => (a.due < b.due ? -1 : 1));
  const routine = [
    { title: "지난달 통장·카드 내역을 장부로 정리", tool: "/ko/bookkeeping-data-bridge/", note: "미분류·불공제 항목을 이달 안에 없애 두면 신고 달이 편해요" },
    { title: "받을 돈·줄 돈 맞추기(미수금·미지급금)", note: "늦어지는 거래처는 이달 안에 연락해요" },
    { title: "다음 달 큰 지출(부가세·종소세·보험료) 미리 떼어 두기", note: "통장을 하나 따로 두면 편해요" },
  ];
  const area = (a      ) => out.filter((t) => t.area === a).length;
  return {
    month,
    summary: `${month} 할 일 ${out.length}가지(세무 ${area("tax")}, 노무 ${area("labor")})${later.length ? `, 다음 달로 넘어가는 기한 ${later.length}가지` : ""}.`,
    tasks: out,
    later,
    routine,
    holidaysKnown: holidaysKnown(y),
  };
}
