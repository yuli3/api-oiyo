// GENERATED from tools-oiyo src/lib/kr-desks-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 직업별 창구·인생 사건 내비 (2026-11-23, CHOSEUN "도구, 스킬 추가. 새로운 아이디어 브레인스토밍").
// 계산 없음: 해야 할 일·기한·이어지는 도구·무료 창구만 모아요. 기한은 법령에 적힌 것만 쓰고, 금액은 각 계산기에서 계산해요.
export const KR_DESKS_AS_OF = "2026-11-23";

                                                       
                                                                    
                                                                                                                                                                             

const T = (href        , title        )           => ({ href, title });

export const KR_DESKS         = [
  // ── 직업별 창구 ──
  {
    id: "creator", kind: "job", icon: "🎬", title: "유튜버·크리에이터", who: "광고·후원·협찬 수익이 있는 1인 창작자",
    keywords: ["유튜버", "유튜브", "크리에이터", "인플루언서", "애드센스", "협찬", "후원", "스트리머", "블로거"],
    steps: [
      { when: "수익이 계속 생기면", what: "사업자등록 여부부터 정해요. 사업을 시작한 날부터 20일 안에 신청해요.", law: "부가가치세법 제8조" },
      { when: "협찬·광고 계약 때", what: "현물 협찬도 소득이에요. 계약서에 금액·대가·광고 표시 의무를 적어 둬요." },
      { when: "매년 1월·7월", what: "일반과세자라면 부가가치세 확정신고(1월 25일, 7월 25일)를 해요. 해외 플랫폼에서 외화로 받은 수익은 영세율 대상인지 확인해요.", law: "부가가치세법 제48·49조" },
      { when: "매년 2월 10일", what: "면세 사업자라면 사업장현황신고를 해요.", law: "소득세법 제78조" },
      { when: "매년 5월", what: "종합소득세 신고: 장부를 쓸지, 경비율로 추계할지 비교해요.", law: "소득세법 제70조" },
    ],
    tools: [T("/ko/influencer-deal-calculator/", "협찬·광고 단가 계산"), T("/ko/general-vs-simplified-vat-calculator/", "일반 vs 간이과세"), T("/ko/expense-ratio-calculator/", "경비율 계산"), T("/ko/bookkeeping-vs-estimate-calculator/", "장부 vs 추계"), T("/ko/exempt-business-report-checker/", "사업장현황신고 확인"), T("/ko/comprehensive-income-tax-calculator/", "종합소득세 계산")],
    help: ["국세청 126", "홈택스 사업자등록 신청"],
  },
  {
    id: "rider", kind: "job", icon: "🛵", title: "배달 라이더·플랫폼 노동자", who: "배달·대리운전·퀵서비스 등 플랫폼으로 일하는 사람",
    keywords: ["라이더", "배달", "배민", "쿠팡이츠", "대리운전", "퀵", "플랫폼", "특고", "노무제공자"],
    steps: [
      { when: "일을 시작할 때", what: "산재보험·고용보험 가입 대상인지 확인해요. 노무제공자도 적용 대상이에요." },
      { when: "다쳤을 때", what: "산재 신청과 요양 중 휴업급여를 먼저 확인해요." },
      { when: "매달", what: "플랫폼이 3.3%를 떼고 지급하면 사업소득이에요. 지급명세를 모아 둬요." },
      { when: "매년 5월", what: "종합소득세 신고로 떼인 3.3%의 일부를 돌려받을 수 있어요. 경비율과 장부를 비교해요.", law: "소득세법 제70조" },
      { when: "일이 끊겼을 때", what: "고용보험 가입 기간이 있으면 구직급여 대상인지 확인해요." },
    ],
    tools: [T("/ko/freelancer-tax-calculator/", "프리랜서 3.3% 환급 계산"), T("/ko/expense-ratio-calculator/", "경비율 계산"), T("/ko/industrial-accident-leave-pay-calculator/", "산재 휴업급여"), T("/ko/unemployment-benefits-calculator/", "실업급여 계산"), T("/ko/fuel-cost-calculator/", "유류비 계산")],
    help: ["근로복지공단 1588-0075", "국세청 126", "고용노동부 1350"],
  },
  {
    id: "cafe", kind: "job", icon: "☕", title: "카페·음식점 사장", who: "직원을 둔 작은 가게",
    keywords: ["카페", "음식점", "식당", "자영업", "가게", "사장님", "프랜차이즈", "알바"],
    steps: [
      { when: "개업 전", what: "영업신고(위생)와 사업자등록을 해요. 사업자등록은 시작일부터 20일 안이에요.", law: "부가가치세법 제8조" },
      { when: "직원을 뽑을 때", what: "근로계약서를 쓰고 4대보험을 신고해요. 주휴수당·수습 최저임금을 확인해요." },
      { when: "매달 10일", what: "직원 급여에서 뗀 원천세를 신고·납부해요.", law: "소득세법 제128조" },
      { when: "매년 1월·7월", what: "부가가치세 확정신고(1월 25일, 7월 25일). 의제매입세액공제와 카드 매출 세액공제를 챙겨요.", law: "부가가치세법 제48·49조" },
      { when: "매년 5월", what: "종합소득세 신고. 노란우산공제 소득공제도 확인해요.", law: "소득세법 제70조" },
    ],
    tools: [T("/ko/permit-document-checklist/", "영업신고 서류"), T("/ko/weekly-holiday-pay-calculator/", "주휴수당"), T("/ko/probation-minimum-wage-checker/", "수습 최저임금"), T("/ko/labor-cost-calculator/", "인건비 계산"), T("/ko/vat-credit-calculator/", "의제매입·카드 세액공제"), T("/ko/yellow-umbrella-deduction-calculator/", "노란우산공제"), T("/ko/franchise-contract-check/", "가맹계약 점검")],
    help: ["국세청 126", "고용노동부 1350", "소상공인시장진흥공단 1357"],
  },
  {
    id: "shop", kind: "job", icon: "🛒", title: "온라인 쇼핑몰·스마트스토어", who: "온라인으로 물건을 파는 사업자",
    keywords: ["쇼핑몰", "스마트스토어", "온라인 판매", "통신판매", "구매대행", "해외직구", "오픈마켓", "셀러"],
    steps: [
      { when: "시작할 때", what: "사업자등록 후 통신판매업 신고를 해요." },
      { when: "판매 화면", what: "청약철회 7일 같은 소비자 권리를 안내해요." },
      { when: "수입해 팔 때", what: "관세·FTA 원산지와 수입 부가세를 확인해요." },
      { when: "매년 1월·7월", what: "부가가치세 확정신고(1월 25일, 7월 25일). 일반과세와 간이과세를 비교해요.", law: "부가가치세법 제48·49조" },
      { when: "매년 5월", what: "종합소득세 신고.", law: "소득세법 제70조" },
    ],
    tools: [T("/ko/general-vs-simplified-vat-calculator/", "일반 vs 간이과세"), T("/ko/vat-calculator/", "부가세 계산"), T("/ko/import-duty-fta-calculator/", "수입 관세·FTA"), T("/ko/consumer-refund-law-guide/", "소비자 환불 법령"), T("/ko/unit-economics-runway-calculator/", "단위 경제성")],
    help: ["국세청 126", "관세청 125", "한국소비자원 1372"],
  },
  {
    id: "dev", kind: "job", icon: "💻", title: "프리랜서 개발자·디자이너", who: "외주 계약으로 일하는 1인 전문가",
    keywords: ["프리랜서", "외주", "개발자", "디자이너", "1인", "용역", "3.3", "계약서"],
    steps: [
      { when: "계약 전", what: "외주 계약서의 대금·지급일·지식재산권·하자 책임을 읽어요." },
      { when: "대금을 받을 때", what: "3.3% 원천징수인지, 세금계산서를 발행하는지 정해요." },
      { when: "대금이 밀릴 때", what: "지연이자와 소멸시효를 세어 봐요." },
      { when: "매년 5월", what: "종합소득세 신고로 3.3% 환급 여부를 확인해요.", law: "소득세법 제70조" },
      { when: "수입이 커지면", what: "개인사업자와 법인을 비교해요." },
    ],
    tools: [T("/ko/freelance-contract-check/", "외주 계약서 점검"), T("/ko/freelancer-tax-calculator/", "프리랜서 3.3% 환급"), T("/ko/legal-interest-calculator/", "지연이자"), T("/ko/statute-limitations-calculator/", "소멸시효"), T("/ko/incorporation-calculator/", "법인 전환 비교")],
    help: ["국세청 126", "대한법률구조공단 132"],
  },
  // ── 인생 사건 내비 ──
  {
    id: "marriage", kind: "event", icon: "💍", title: "결혼", who: "결혼을 앞두거나 막 결혼한 부부",
    keywords: ["결혼", "혼인", "신혼", "웨딩", "혼인신고"],
    steps: [
      { when: "준비", what: "예산을 나누고 결혼자금 증여 공제를 확인해요." },
      { when: "혼인신고 뒤", what: "신혼부부 특별공급·정책 대출 자격을 확인해요." },
      { when: "그해 연말정산", what: "배우자 공제와 부양가족 중복을 정리해요." },
    ],
    tools: [T("/ko/wedding-planning-calculator/", "결혼 예산"), T("/ko/gift-tax-calculator/", "증여세(결혼·출산 공제)"), T("/ko/special-supply-eligibility-checker/", "특별공급 자격"), T("/ko/policy-housing-loan-eligibility-checker/", "정책 대출 자격"), T("/ko/dependent-deduction-checker/", "부양가족 공제")],
    help: ["정부24", "마이홈 1600-1004"],
  },
  {
    id: "birth", kind: "event", icon: "👶", title: "출산·육아", who: "아이가 태어나거나 태어날 가정",
    keywords: ["출산", "임신", "육아", "출생", "아기", "육아휴직", "출산휴가"],
    steps: [
      { when: "출생 뒤 1개월 안", what: "출생신고를 해요.", law: "가족관계의 등록 등에 관한 법률 제44조" },
      { when: "출산 전후", what: "출산전후휴가 급여와 육아휴직 급여를 계산해요." },
      { when: "복귀 뒤", what: "육아기 근로시간 단축 급여와 자녀장려금을 확인해요." },
      { when: "예방접종", what: "접종 일정을 달력으로 받아요." },
    ],
    tools: [T("/ko/maternity-leave-pay-calculator/", "출산전후휴가 급여"), T("/ko/parental-leave-calculator/", "육아휴직 급여"), T("/ko/reduced-hours-childcare-pay-calculator/", "근로시간 단축 급여"), T("/ko/work-child-incentive-calculator/", "근로·자녀장려금"), T("/ko/vaccination-schedule/", "예방접종 일정"), T("/ko/benefit-finder/", "받을 수 있는 지원 찾기")],
    help: ["복지로 129", "고용노동부 1350"],
  },
  {
    id: "move", kind: "event", icon: "📦", title: "이사·전월세", who: "집을 옮기거나 새로 계약하는 사람",
    keywords: ["이사", "전세", "월세", "전입", "확정일자", "임대차", "보증금"],
    steps: [
      { when: "계약 전", what: "전세보증 가입 가능 여부와 중개보수를 확인해요." },
      { when: "이사한 뒤 14일 안", what: "전입신고를 해요. 확정일자와 함께 하면 보증금을 지키는 데 도움이 돼요.", law: "주민등록법 제16조" },
      { when: "그해 연말정산", what: "월세 세액공제와 청년 월세 지원을 확인해요." },
    ],
    tools: [T("/ko/jeonse-guarantee-calculator/", "전세보증 가입 확인"), T("/ko/brokerage-calculator/", "중개보수"), T("/ko/jeonse-monthly-converter/", "전월세 전환"), T("/ko/monthly-rent-tax-credit-calculator/", "월세 세액공제"), T("/ko/youth-monthly-rent-support-checker/", "청년 월세 지원")],
    help: ["대한법률구조공단 132", "주택도시보증공사 1566-9009"],
  },
  {
    id: "quit", kind: "event", icon: "🚪", title: "이직·퇴사", who: "회사를 그만두거나 옮기는 근로자",
    keywords: ["퇴사", "이직", "해고", "권고사직", "퇴직금", "실업급여", "사직"],
    steps: [
      { when: "퇴사 전", what: "퇴직금과 퇴직소득세, 남은 연차수당을 계산해요." },
      { when: "퇴사 뒤 14일 안", what: "회사는 퇴직금·임금을 지급해야 해요.", law: "근로자퇴직급여 보장법 제9조" },
      { when: "퇴사 뒤 바로", what: "실업급여 대상인지 확인하고 구직 등록을 해요. 자진 퇴사도 예외 사유가 있어요." },
      { when: "건강보험", what: "지역가입자 보험료와 임의계속가입을 비교해요." },
      { when: "다음 해 5월 또는 새 회사 연말정산", what: "중도퇴사 연말정산을 마무리해요." },
    ],
    tools: [T("/ko/severance-calculator/", "퇴직금 계산"), T("/ko/retirement-tax-calculator/", "퇴직소득세"), T("/ko/unemployment-benefits-calculator/", "실업급여"), T("/ko/voluntary-quit-unemployment-checker/", "자진 퇴사 실업급여"), T("/ko/health-insurance-leaver-settlement/", "퇴사 건강보험 정산"), T("/ko/midyear-leaver-year-end-settlement/", "중도퇴사 연말정산")],
    help: ["고용노동부 1350", "국민건강보험공단 1577-1000"],
  },
  {
    id: "retire", kind: "event", icon: "🌅", title: "은퇴", who: "연금을 받기 시작하거나 은퇴를 준비하는 사람",
    keywords: ["은퇴", "노후", "연금", "국민연금", "퇴직연금", "기초연금"],
    steps: [
      { when: "5년 전부터", what: "국민연금을 일찍 받을지, 늦출지 비교해요." },
      { when: "퇴직연금", what: "DB와 DC, 연금 수령과 일시금을 비교해요." },
      { when: "연금 수령 뒤", what: "사적연금 1,500만 원 기준 분리과세와 종합과세를 비교해요." },
      { when: "생활비", what: "지원 제도와 기초연금 대상인지 확인해요." },
    ],
    tools: [T("/ko/national-pension-early-deferred-calculator/", "국민연금 조기·연기"), T("/ko/retirement-pension-db-dc-calculator/", "퇴직연금 DB vs DC"), T("/ko/private-pension-separate-tax-calculator/", "사적연금 과세 비교"), T("/ko/pension-optimizer-calculator/", "연금 계좌 최적화"), T("/ko/benefit-finder/", "받을 수 있는 지원 찾기")],
    help: ["국민연금공단 1355", "금융감독원 1332"],
  },
  {
    id: "death", kind: "event", icon: "🕯️", title: "가족이 돌아가셨을 때", who: "상속 절차를 맡은 가족",
    keywords: ["사망", "상속", "장례", "유산", "상속포기", "한정승인", "유족"],
    steps: [
      { when: "1개월 안", what: "사망신고를 해요.", law: "가족관계의 등록 등에 관한 법률 제84·85조" },
      { when: "3개월 안", what: "빚이 많다면 상속포기나 한정승인을 법원에 신청해요.", law: "민법 제1019조" },
      { when: "6개월 안(사망한 달의 말일부터)", what: "상속세를 신고·납부해요.", law: "상속세 및 증여세법 제67조" },
      { when: "그 뒤", what: "상속 부동산 등기와 상속분을 정리해요." },
    ],
    tools: [T("/ko/after-death-checklist/", "사망 뒤 할 일 순서"), T("/ko/inheritance-gift-filing-deadline-calculator/", "상속·증여 신고 기한"), T("/ko/inheritance-share-calculator/", "법정 상속분·유류분"), T("/ko/inheritance-tax-calculator/", "상속세 계산"), T("/ko/self-registration-cost-calculator/", "셀프 등기 비용")],
    help: ["정부24 안심상속", "대한법률구조공단 132", "국세청 126"],
  },
];

export const deskById = (id        ) => KR_DESKS.find((d) => d.id === id);

/** 질문 문장에서 맞는 창구를 찾아요 (키워드 일치 수 순). */
export function findDesks(question        , kind                  , limit = 3)         {
  const q = (question ?? "").toLowerCase();
  return KR_DESKS.filter((d) => !kind || d.kind === kind)
    .map((d) => ({ d, score: d.keywords.filter((k) => q.includes(k.toLowerCase())).length + (q.includes(d.title.toLowerCase()) ? 2 : 0) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, Math.min(limit, 10)))
    .map((x) => x.d);
}
