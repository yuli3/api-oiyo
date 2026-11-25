// GENERATED from tools-oiyo src/lib/kr-income-tax-mistakes-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 종합소득세 신고 전 "자주 틀리는 패턴" 점검 (2026-11-25, AI 빌더 조사 추천 3번 "거절·실수 패턴 점검기").
// 계산기가 아니라 점검기예요. 예/아니요/모름 몇 가지로, 신고 때 자주 빠뜨리거나 틀리는 패턴을 근거 조문과 함께 골라 줘요.
// 세액은 계산하지 않아요. 금액 기준(300만원·2천만원·1,500만원·100만원·500만원·4,800만원)은 법에 적힌 숫자만 써요.
// 근거(기준일 2026-11-25, 2026년 귀속 → 2027년 5월 신고):
// - 소득세법 제70조(5월 1일~31일 확정신고), 제70조의2(성실신고확인대상 6월 30일), 제73조(근로소득만 있으면 신고 안 해도 됨)
// - 제14조 제3항 제6호(금융소득 2천만원 이하 분리과세), 제8호(기타소득금액 300만원 이하 분리과세 선택), 제9호·제64조의4(사적연금 1,500만원 초과 시 합산 또는 분리과세 선택)
// - 제64조의2(주택임대 수입 2천만원 이하 분리과세 선택), 제168조(사업자등록)
// - 제50조(기본공제: 연 소득금액 100만원 이하, 근로소득만 있으면 총급여 500만원 이하), 시행령 제106조(한 사람은 한 명만 공제)
// - 제81조의5(무기장가산세 20%, 신규·직전 수입 4,800만원 미만 소규모사업자 제외), 시행령 제143조(단순경비율은 직전 연도 수입금액 기준)
// - 제127조(3.3% 원천징수는 미리 낸 세금, 신고로 정산), 국세기본법 제45조(수정신고)·제45조의2(경정청구 5년)·제45조의3(기한 후 신고)·제48조 제2항(빨리 고치면 가산세 감면)
// - 지방세법 제95조(개인지방소득세 신고)

export const MISTAKES_AS_OF = "2026-11-25";
                                          
                                                                    
                               
              
                
                  
                       
                     
               
                     
                     
             
                 
                  

export const MISTAKE_QUESTIONS                                                          = [
  { id: "wagePlus", label: "회사에서 연말정산을 받았고, 다른 소득(3.3% 프리랜서·사업·임대 등)도 있었나요?", why: "연말정산은 근로소득만 정산해요. 다른 소득이 있으면 5월에 합쳐 신고해요." },
  { id: "withheld33", label: "3.3%를 떼고 받은 돈(강의·외주·배달 등 사업소득)이 있나요?", why: "3.3%는 미리 낸 세금이라 신고해야 더 내거나 돌려받는 것이 정해져요." },
  { id: "otherOver300", label: "원고료·강연료 같은 기타소득에서 필요경비를 뺀 금액이 1년에 300만원을 넘나요?", why: "300만원 이하만 분리과세(이미 뗀 세금으로 끝)를 고를 수 있어요." },
  { id: "financialOver2000", label: "이자와 배당을 합쳐 1년에 2천만원을 넘나요?", why: "넘으면 다른 소득과 합쳐 신고해요." },
  { id: "pensionOver1500", label: "연금저축·퇴직연금에서 연금으로 받은 돈(공적연금 제외)이 1년에 1,500만원을 넘나요?", why: "넘으면 합산할지 분리과세할지 골라야 해요." },
  { id: "houseRent", label: "주택을 빌려주고 받은 월세·임대 수입이 있나요?", why: "연 2천만원 이하는 분리과세를 고를 수 있고, 사업자등록이 필요해요." },
  { id: "dependentShared", label: "부모님 같은 부양가족을 형제자매나 배우자도 공제받았을 수 있나요?", why: "한 사람은 한 명만 공제받아요." },
  { id: "dependentIncome", label: "공제받는 가족 중에 1년 소득금액이 100만원(근로소득만 있으면 총급여 500만원)을 넘는 사람이 있나요?", why: "넘으면 기본공제를 못 받아요." },
  { id: "noBooks", label: "사업소득을 장부 없이(경비율로) 신고하나요?", why: "장부 의무가 있는데 안 쓰면 가산세가 붙을 수 있어요." },
  { id: "rateChecked", label: "단순경비율을 쓸 수 있는지 작년 수입금액으로 확인했나요?", why: "작년 수입이 업종 기준을 넘으면 단순경비율을 못 써요." },
  { id: "pastMistake", label: "지난해 신고를 빠뜨렸거나 틀리게 한 것이 있나요?", why: "고치는 방법과 기한이 경우마다 달라요." },
];

                                                                                                                                                        

const P                                 = {
  wagePlus: { id: "wagePlus", tone: "warn", title: "연말정산을 했다고 끝난 게 아니에요", fix: "근로소득과 다른 종합소득을 합쳐 5월 31일까지 신고해요. 회사 원천징수영수증을 홈택스에서 함께 불러와요.", cite: "소득세법 제70조, 제73조" },
  withheld33: { id: "withheld33", tone: "info", title: "3.3% 떼인 돈은 신고해야 정산돼요", fix: "떼인 세금(기납부세액)을 빠뜨리지 말고 넣어요. 낸 세금이 더 많으면 돌려받고, 적으면 더 내요. 신고하지 않은 해는 기한 후 신고로 확인해요.", cite: "소득세법 제127조, 국세기본법 제45조의3", tools: [{ href: "/ko/freelancer-tax-calculator/", title: "프리랜서 세금 계산기" }] },
  otherOver300: { id: "otherOver300", tone: "warn", title: "기타소득 300만원을 넘으면 꼭 합쳐요", fix: "기타소득금액(필요경비를 뺀 금액)이 300만원을 넘으면 분리과세를 고를 수 없어요. 다른 소득과 합쳐 신고해요.", cite: "소득세법 제14조 제3항 제8호" },
  financialOver2000: { id: "financialOver2000", tone: "warn", title: "금융소득 2천만원을 넘으면 합쳐요", fix: "이자·배당이 2천만원을 넘으면 넘는 부분을 다른 소득과 합쳐 신고해요. 증권사·은행 원천징수 내역을 모두 모아요.", cite: "소득세법 제14조 제3항 제6호" },
  pensionOver1500: { id: "pensionOver1500", tone: "info", title: "사적연금 1,500만원을 넘으면 방식을 골라요", fix: "합산해서 신고할지, 분리과세할지 골라요. 다른 소득이 많으면 분리과세가 나을 수 있으니 둘 다 비교해요.", cite: "소득세법 제14조 제3항 제9호, 제64조의4", tools: [{ href: "/ko/private-pension-separate-tax-calculator/", title: "사적연금 분리 vs 종합과세 계산기" }] },
  houseRent: { id: "houseRent", tone: "info", title: "주택 임대 수입도 신고 대상이에요", fix: "1년 수입이 2천만원 이하면 분리과세와 합산 중 고를 수 있어요. 세무서 사업자등록을 했는지도 확인해요. 1주택 비과세 같은 예외는 계산기에서 확인해요.", cite: "소득세법 제64조의2, 제168조", tools: [{ href: "/ko/housing-rental-income-tax-calculator/", title: "주택임대소득세 계산기" }] },
  dependentShared: { id: "dependentShared", tone: "warn", title: "부양가족 중복 공제", fix: "한 가족은 한 사람만 공제받아요. 형제자매·배우자와 누가 공제받을지 먼저 정해요. 겹치면 나중에 세금과 가산세를 더 내요.", cite: "소득세법 제50조, 시행령 제106조, 국세기본법 제47조의3", tools: [{ href: "/ko/dependent-deduction-checker/", title: "부양가족 공제 판정기" }] },
  dependentIncome: { id: "dependentIncome", tone: "warn", title: "소득 있는 가족을 공제한 실수", fix: "1년 소득금액이 100만원(근로소득만 있으면 총급여 500만원)을 넘는 가족은 기본공제에서 빼요. 퇴직금·양도소득도 소득금액에 들어가요.", cite: "소득세법 제50조 제1항", tools: [{ href: "/ko/dependent-deduction-checker/", title: "부양가족 공제 판정기" }] },
  noBooks: { id: "noBooks", tone: "warn", title: "장부 없이 신고하면 무기장가산세", fix: "장부를 쓰지 않고 경비율로 신고하면 산출세액의 20%가 가산세로 붙을 수 있어요. 새로 시작했거나 작년 수입이 4,800만원 미만이면 빠져요. 간편장부라도 쓰면 줄일 수 있어요.", cite: "소득세법 제81조의5", tools: [{ href: "/ko/bookkeeping-vs-estimate-calculator/", title: "장부 vs 추계 신고 비교" }] },
  rateChecked: { id: "rateChecked", tone: "warn", title: "단순경비율을 쓸 수 있는지 먼저 확인", fix: "단순경비율은 작년 수입금액이 업종별 기준보다 적을 때만 써요. 넘으면 기준경비율이나 장부로 신고해요. 홈택스 신고 안내문에 내 유형이 나와요.", cite: "소득세법 시행령 제143조", tools: [{ href: "/ko/expense-ratio-calculator/", title: "경비율 vs 장부 소득 비교" }] },
  pastMistake: { id: "pastMistake", tone: "info", title: "지난 신고는 빨리 고칠수록 덜 내요", fix: "신고를 안 했으면 기한 후 신고, 덜 냈으면 수정신고, 더 냈으면 5년 안에 경정청구를 해요. 빨리 고치면 가산세를 줄여 줘요.", cite: "국세기본법 제45조, 제45조의2, 제45조의3, 제48조 제2항", tools: [{ href: "/ko/tax-penalty-calculator/", title: "가산세 계산기" }] },
};

// "예"일 때 실수 패턴이 되는 질문. rateChecked만 "아니요"일 때 걸려요.
const HIT_ON                                = {
  wagePlus: "yes", withheld33: "yes", otherOver300: "yes", financialOver2000: "yes", pensionOver1500: "yes", houseRent: "yes",
  dependentShared: "yes", dependentIncome: "yes", noBooks: "yes", rateChecked: "no", pastMistake: "yes",
};

export const ALWAYS                   = [
  { id: "deadline", tone: "info", title: "신고 기한", fix: "2027년 5월 1일부터 31일까지 신고·납부해요. 성실신고확인 대상이면 6월 30일까지예요. 기한이 토·일·공휴일이면 다음 날로 넘어가요.", cite: "소득세법 제70조, 제70조의2, 국세기본법 제5조" },
  { id: "local", tone: "info", title: "지방소득세도 함께", fix: "소득세와 따로 개인지방소득세도 신고·납부해요. 홈택스에서 신고를 마치면 위택스로 이어서 할 수 있어요.", cite: "지방세법 제95조" },
];

export function checkMistakes(a                ) {
  const hits                   = [];
  const unknown                                             = [];
  for (const q of MISTAKE_QUESTIONS) {
    const v = a[q.id];
    if (v === undefined || v === "unknown") unknown.push({ id: q.id, label: q.label });
    else if (v === HIT_ON[q.id]) hits.push(P[q.id]);
  }
  // rateChecked는 경비율로 신고하는 사람에게만 물어볼 뜻이 있어요. 장부를 쓴다고 답했으면 "모름"으로 남기지 않아요.
  const unk = a.noBooks === "no" ? unknown.filter((u) => u.id !== "rateChecked") : unknown;
  const answered = MISTAKE_QUESTIONS.length - unk.length;
  const memo = [
    `[종합소득세 신고 전 실수 점검] 기준일 ${MISTAKES_AS_OF}, 2026년 귀속(2027년 5월 신고)`,
    `걸린 패턴 ${hits.length}개, 모름 ${unk.length}개`,
    ...hits.map((h) => `! ${h.title}: ${h.fix} (${h.cite})`),
    ...unk.map((u) => `? 미확인: ${u.label}`),
    ...ALWAYS.map((h) => `* ${h.title}: ${h.fix} (${h.cite})`),
    "세액은 계산하지 않았어요. 법령 정보이며 세무 대리가 아니에요.",
  ].join("\n");
  return { asOf: MISTAKES_AS_OF, hits, unknown: unk, always: ALWAYS, answered, total: MISTAKE_QUESTIONS.length, memo };
}

export const isMistakeAnswer = (v         )          => v === "yes" || v === "no" || v === "unknown";
