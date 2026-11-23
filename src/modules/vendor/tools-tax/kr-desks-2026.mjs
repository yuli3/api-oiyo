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
      { when: "매년 1월 1일~2월 10일", what: "면세사업자인 1인 미디어 창작자는 사업장현황신고를 해요. 홈택스 「1인미디어창작자 자료조회」로 지급명세서·외화 수취 수입을 불러올 수 있어요(11~12월분은 빠질 수 있어요).", law: "소득세법 제78조" },
      { when: "매년 5월", what: "종합소득세 신고: 장부를 쓸지, 경비율로 추계할지 비교해요.", law: "소득세법 제70조" },
    ],
    tools: [T("/ko/influencer-deal-calculator/", "협찬·광고 단가 계산"), T("/ko/expense-ratio-calculator/", "경비율 계산"), T("/ko/bookkeeping-vs-estimate-calculator/", "장부 vs 추계"), T("/ko/exempt-business-report-checker/", "사업장현황신고 확인"), T("/ko/comprehensive-income-tax-calculator/", "종합소득세 계산")],
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
  {
    id: "tutor", kind: "job", icon: "📚", title: "학원·과외 강사", who: "학원·학습지·개인 과외로 강의료를 받는 사람",
    keywords: ["강사", "학원", "과외", "학습지", "방문강사", "강의료", "튜터"],
    steps: [
      { when: "계약할 때", what: "근로계약인지 위탁(프리랜서) 계약인지 확인해요. 출퇴근·지휘감독을 받으면 근로자일 수 있고, 그러면 퇴직금·4대보험 판단이 달라져요." },
      { when: "강의료를 받을 때", what: "3.3%가 떼였다면 사업소득이에요. 지급명세를 모아 둬요." },
      { when: "학습지·방문강사라면", what: "노무제공자 고용보험·산재보험 대상인지 확인해요." },
      { when: "매년 5월", what: "종합소득세 신고로 떼인 3.3%의 일부를 돌려받을 수 있어요. 경비율과 장부를 비교해요.", law: "소득세법 제70조" },
      { when: "그만둘 때", what: "근로자였다면 퇴직금(1년 이상)과 실업급여를 확인해요." },
    ],
    tools: [T("/ko/freelancer-tax-calculator/", "프리랜서 3.3% 환급"), T("/ko/expense-ratio-calculator/", "경비율 계산"), T("/ko/comprehensive-income-tax-calculator/", "종합소득세 계산"), T("/ko/quit-one-stop-calculator/", "퇴사 원스톱"), T("/ko/unemployment-benefits-calculator/", "실업급여 계산")],
    help: ["국세청 126", "고용노동부 1350", "근로복지공단 1588-0075"],
  },
  {
    id: "landlord", kind: "job", icon: "🔑", title: "집주인(주택 임대)", who: "집을 전세·월세로 빌려주는 사람",
    keywords: ["집주인", "임대인", "주택임대", "임대소득", "월세 받", "전세 놓", "세입자"],
    steps: [
      { when: "계약한 날부터 30일 안", what: "주택 임대차 계약을 신고해요(대상 지역·금액이면). 임대인과 임차인 모두의 의무예요.", law: "부동산 거래신고 등에 관한 법률 제6조의2" },
      { when: "갱신 요구를 받으면", what: "차임·보증금 증액은 5%를 넘을 수 없어요.", law: "주택임대차보호법 제6조의3·제7조" },
      { when: "임대를 시작하면", what: "주택임대 사업자등록을 해요. 하지 않으면 가산세가 있어요.", law: "소득세법 제168조" },
      { when: "매년 5월", what: "임대 수입을 신고해요. 연 2천만 원 이하면 분리과세와 종합과세 중 고를 수 있어요.", law: "소득세법 제64조의2" },
      { when: "계약이 끝날 때", what: "보증금을 제때 돌려줘요. 늦으면 지연이자와 임차권등기 문제가 생겨요." },
    ],
    tools: [T("/ko/housing-rental-income-tax-calculator/", "주택임대소득세"), T("/ko/jeonse-monthly-converter/", "전월세 전환"), T("/ko/rental-yield-calculator/", "임대 수익률"), T("/ko/comprehensive-real-estate-tax-calculator/", "종합부동산세"), T("/ko/legal-interest-calculator/", "지연이자")],
    help: ["국세청 126", "대한법률구조공단 132", "정부민원안내 110"],
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
      { when: "계약 전", what: "등기부등본(소유자·근저당·압류)과 건축물대장을 보고, 선순위 채권과 보증금 합계가 집값의 몇 %인지 봐요. 전세보증 가입 가능 여부와 중개보수도 확인해요." },
      { when: "계약 전", what: "집주인에게 납세증명서(미납 국세·지방세)와 선순위 확정일자 현황을 요구할 수 있어요.", law: "주택임대차보호법 제3조의7" },
      { when: "이사한 뒤 14일 안", what: "전입신고를 해요. 확정일자와 함께 하면 보증금을 지키는 데 도움이 돼요.", law: "주민등록법 제16조" },
      { when: "그해 연말정산", what: "월세 세액공제와 청년 월세 지원을 확인해요." },
    ],
    tools: [T("/ko/jeonse-guarantee-calculator/", "전세보증 가입 확인"), T("/ko/brokerage-calculator/", "중개보수"), T("/ko/jeonse-monthly-converter/", "전월세 전환"), T("/ko/monthly-rent-tax-credit-calculator/", "월세 세액공제"), T("/ko/youth-monthly-rent-support-checker/", "청년 월세 지원")],
    help: ["대한법률구조공단 132", "주택도시보증공사 1566-9009"],
  },
  {
    id: "homebuy", kind: "event", icon: "🏡", title: "집 사기", who: "집을 사서 등기까지 마치려는 사람",
    keywords: ["집 사", "매수", "내 집", "주택 구입", "매매", "취득세", "등기", "잔금", "주담대"],
    steps: [
      { when: "계약 전", what: "대출 한도(DSR)와 정책 대출 자격, 중개보수를 먼저 계산해요." },
      { when: "계약한 날부터 30일 안", what: "부동산 거래신고를 해요. 보통 중개사무소가 신고해요.", law: "부동산 거래신고 등에 관한 법률 제3조" },
      { when: "취득일(잔금일)부터 60일 안", what: "취득세를 신고·납부해요.", law: "지방세법 제20조" },
      { when: "잔금일부터 60일 안", what: "소유권이전등기를 신청해요.", law: "부동산등기 특별조치법 제2조" },
      { when: "그해 연말정산", what: "주택담보대출 이자 공제 대상인지 확인해요." },
    ],
    tools: [T("/ko/dsr-calculator/", "DSR 대출 한도"), T("/ko/policy-housing-loan-eligibility-checker/", "정책 주택대출 자격"), T("/ko/brokerage-calculator/", "중개보수"), T("/ko/acquisition-tax-calculator/", "취득세"), T("/ko/self-registration-cost-calculator/", "셀프 등기 비용"), T("/ko/mortgage-calculator/", "주담대 상환")],
    help: ["정부민원안내 110", "인터넷등기소", "위택스(지방세)"],
  },
  {
    id: "accident", kind: "event", icon: "🚗", title: "교통사고", who: "교통사고를 내거나 당한 사람",
    keywords: ["교통사고", "사고", "자동차보험", "과실", "합의", "후유장해", "뺑소니", "추돌"],
    steps: [
      { when: "사고 직후", what: "다친 사람을 구호하고 경찰에 신고해요.", law: "도로교통법 제54조" },
      { when: "그날", what: "보험사에 사고를 접수하고 사진·블랙박스 영상을 남겨요." },
      { when: "치료 중", what: "과실 비율과 치료비 처리 방식을 확인해요. 실손보험과 겹치는지도 봐요." },
      { when: "합의 전", what: "후유장해와 과실 비율이 보험금에 미치는 영향을 계산해 봐요." },
      { when: "3년 안", what: "보험금 청구권은 3년이 지나면 소멸해요.", law: "상법 제662조" },
    ],
    tools: [T("/ko/traffic-accident-law-guide/", "교통사고 법령 길잡이"), T("/ko/disability-fault-claim-calculator/", "장해·과실 보험금"), T("/ko/silson-insurance-generation-calculator/", "실손 세대별 자기부담"), T("/ko/statute-limitations-calculator/", "소멸시효")],
    help: ["경찰 112", "금융감독원 1332", "대한법률구조공단 132"],
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
  // ── 전문가를 찾게 되는 일 (2026-11-23, CHOSEUN "사람들이 전문가를 찾아가는 니즈") ──
  {
    id: "dismissal", kind: "event", icon: "📄", title: "해고를 당했을 때", who: "해고 통보를 받은 근로자",
    keywords: ["해고", "부당해고", "권고사직", "잘렸", "해고예고", "구제신청", "징계"],
    steps: [
      { when: "통보를 받으면", what: "해고 사유와 날짜가 적힌 서면을 받았는지 확인해요. 서면이 없으면 효력이 없어요.", law: "근로기준법 제27조" },
      { when: "30일 전 예고가 없었다면", what: "해고예고수당(30일분 통상임금) 대상인지 확인해요.", law: "근로기준법 제26조" },
      { when: "해고된 날부터 3개월 안", what: "부당하다고 생각되면 노동위원회에 부당해고 구제신청을 해요. 상시 5명 이상 사업장이 대상이에요.", law: "근로기준법 제28조" },
      { when: "퇴직 후 14일 안", what: "임금·퇴직금을 정산받아요.", law: "근로기준법 제36조" },
      { when: "그다음", what: "비자발적 이직이면 구직급여를 신청해요." },
    ],
    tools: [T("/ko/dismissal-notice-pay-calculator/", "해고예고수당"), T("/ko/appeal-deadline-calculator/", "불복 기한 계산"), T("/ko/severance-calculator/", "퇴직금"), T("/ko/unemployment-benefits-calculator/", "실업급여"), T("/ko/labor-law-guide/", "노동 법령 길잡이")],
    help: ["고용노동부 1350", "노동위원회 (무료 권리구제 대리인 제도)", "대한법률구조공단 132"],
  },
  {
    id: "unpaid", kind: "event", icon: "💸", title: "월급·퇴직금이 밀렸을 때", who: "임금이나 퇴직금을 제때 못 받은 근로자",
    keywords: ["임금체불", "체불", "월급", "임금", "퇴직금 안", "퇴직금을 못", "대지급금", "진정"],
    steps: [
      { when: "퇴직했다면 14일 뒤부터", what: "그 뒤에도 못 받은 임금·퇴직금은 체불이에요. 지연이자도 붙어요.", law: "근로기준법 제36조·제37조" },
      { when: "바로", what: "근로계약서, 급여명세서, 통장 내역, 출퇴근 기록을 모아요." },
      { when: "준비되면", what: "고용노동부에 임금체불 진정을 내요(노동포털 온라인 가능)." },
      { when: "회사가 못 주면", what: "체불 임금등 확인서를 받아 대지급금을 신청할 수 있는지 봐요." },
      { when: "3년 안", what: "임금채권은 3년이 지나면 소멸해요.", law: "근로기준법 제49조" },
    ],
    tools: [T("/ko/unpaid-wage-guarantee-calculator/", "대지급금 계산"), T("/ko/severance-calculator/", "퇴직금"), T("/ko/legal-interest-calculator/", "지연이자"), T("/ko/statute-limitations-calculator/", "소멸시효")],
    help: ["고용노동부 1350", "근로복지공단 1588-0075", "대한법률구조공단 132"],
  },
  {
    id: "harassment", kind: "event", icon: "🛑", title: "직장 내 괴롭힘을 당할 때", who: "직장에서 괴롭힘을 겪거나 본 사람",
    keywords: ["괴롭힘", "갑질", "폭언", "따돌림", "직장 내", "모욕", "태움"],
    steps: [
      { when: "지금부터", what: "날짜·장소·말·목격자를 그때그때 적고, 메신저·녹음·진단서를 보관해요." },
      { when: "준비되면", what: "회사(사용자)에 신고해요. 누구든지 신고할 수 있어요.", law: "근로기준법 제76조의3" },
      { when: "신고 뒤", what: "회사는 지체 없이 조사하고, 피해자 보호(근무 장소 변경·유급휴가 등)를 해야 해요. 신고를 이유로 불리하게 대하면 안 돼요.", law: "근로기준법 제76조의3" },
      { when: "회사가 조치하지 않거나 사장이 가해자면", what: "고용노동부에 진정해요. 상시 5명 미만 사업장은 적용 범위를 먼저 확인하세요." },
      { when: "건강이 나빠졌다면", what: "업무상 질병으로 산재 신청이 가능한지 확인해요." },
    ],
    tools: [T("/ko/labor-law-guide/", "노동 법령 길잡이"), T("/ko/industrial-accident-leave-pay-calculator/", "산재 휴업급여"), T("/ko/voluntary-quit-unemployment-checker/", "자진 퇴사 실업급여 확인")],
    help: ["고용노동부 1350", "근로복지공단 1588-0075"],
  },
  {
    id: "lend", kind: "event", icon: "🤝", title: "빌려준 돈을 못 받을 때", who: "대여금·물품대금·용역대금을 못 받은 사람",
    keywords: ["빌려준 돈", "대여금", "돈을 안 갚", "돈을 못 받", "차용증", "지급명령", "내용증명", "받을 돈", "미수금"],
    steps: [
      { when: "먼저", what: "차용증, 이체 내역, 문자·카톡처럼 빌려준 사실과 금액을 보여 줄 증거를 모아요." },
      { when: "독촉할 때", what: "내용증명으로 금액·갚을 날짜를 적어 보내요. 기록이 남고 시효 중단의 기초가 돼요(6개월 안에 소송 등을 해야 해요).", law: "민법 제174조" },
      { when: "그래도 안 갚으면", what: "법원에 지급명령을 신청해요. 상대가 2주 안에 이의하지 않으면 확정돼요.", law: "민사소송법 제462조·제470조" },
      { when: "다툼이 있으면", what: "소송(3천만 원 이하는 소액사건)이나 조정을 해요." },
      { when: "기한", what: "일반 대여금은 10년, 상사채권은 5년이 지나면 소멸해요.", law: "민법 제162조, 상법 제64조" },
    ],
    tools: [T("/ko/demand-letter-builder/", "내용증명 작성 도우미"), T("/ko/legal-interest-calculator/", "지연이자"), T("/ko/statute-limitations-calculator/", "소멸시효"), T("/ko/litigation-cost-calculator/", "소송 비용")],
    help: ["대한법률구조공단 132", "전자소송(ecfs.scourt.go.kr)"],
  },
  {
    id: "deposit", kind: "event", icon: "🏚️", title: "전세·월세 보증금을 못 돌려받을 때", who: "계약이 끝났는데 보증금을 못 받은 임차인",
    keywords: ["보증금 안", "보증금을 못", "못 받", "못 돌려", "전세금 반환", "임차권등기", "깡통", "전세사기", "보증금 반환"],
    steps: [
      { when: "계약 끝나기 6개월~2개월 전", what: "갱신하지 않겠다는 뜻을 집주인에게 알려요(문자보다 내용증명이 확실해요).", law: "주택임대차보호법 제6조" },
      { when: "계약이 끝났는데 못 받으면", what: "이사 가기 전에 임차권등기명령을 신청하고 등기가 된 것을 확인해요. 그래야 대항력·우선변제권이 유지돼요.", law: "주택임대차보호법 제3조의3" },
      { when: "보증보험에 들었다면", what: "보증기관에 이행청구를 해요." },
      { when: "그래도 안 되면", what: "보증금반환 지급명령이나 소송, 주택임대차분쟁조정을 신청해요." },
    ],
    tools: [T("/ko/demand-letter-builder/", "내용증명 작성 도우미"), T("/ko/jeonse-guarantee-calculator/", "전세보증금 안전성"), T("/ko/auction-distribution-calculator/", "경매 배당 순서"), T("/ko/legal-interest-calculator/", "지연이자")],
    help: ["주택도시보증공사 1566-9009", "대한법률구조공단 132 (주택임대차분쟁조정)", "전세피해지원센터"],
  },
  {
    id: "taxnotice", kind: "event", icon: "✉️", title: "세무서 안내문·고지서를 받았을 때", who: "세금 고지·안내문을 받았거나 세금을 더 낸 것 같은 사람",
    keywords: ["고지서", "안내문", "세무서", "경정청구", "환급", "가산세", "과세예고", "세무조사", "이의신청"],
    steps: [
      { when: "받은 날", what: "무엇에 대한 것인지(세목·과세기간), 받은 날짜, 납부 기한을 적어 둬요." },
      { when: "과세예고 통지를 받았다면 30일 안", what: "과세전적부심사를 청구할 수 있어요.", law: "국세기본법 제81조의15" },
      { when: "고지(처분)를 안 날부터 90일 안", what: "이의신청·심사청구·심판청구 중 하나로 다툴 수 있어요.", law: "국세기본법 제61조·제66조·제68조" },
      { when: "세금을 더 냈다면 신고기한 후 5년 안", what: "경정청구로 돌려받을 수 있어요(빠뜨린 공제·감면).", law: "국세기본법 제45조의2" },
    ],
    tools: [T("/ko/appeal-deadline-calculator/", "불복 기한 계산"), T("/ko/tax-penalty-calculator/", "가산세 계산"), T("/ko/dependent-deduction-checker/", "놓친 부양가족 공제"), T("/ko/tax-law-guide/", "세법 길잡이")],
    help: ["국세청 126", "국세청 납세자보호담당관(무료 영세납세자 국선대리인)"],
  },
  {
    id: "suspension", kind: "event", icon: "🚫", title: "영업정지·면허취소 처분을 받았을 때", who: "행정처분 통지를 받은 사업자·운전자",
    keywords: ["영업정지", "행정처분", "면허취소", "면허정지", "행정심판", "과징금", "청소년 주류", "사전통지"],
    steps: [
      { when: "처분 전 사전통지를 받았다면", what: "정해진 기한 안에 의견을 제출해요. 사정(초범·매출 피해 등)과 증빙을 함께 내요.", law: "행정절차법 제21조·제27조" },
      { when: "처분이 있음을 안 날부터 90일 안(있은 날부터 180일 안)", what: "행정심판을 청구할 수 있어요. 급하면 집행정지도 함께 신청해요.", law: "행정심판법 제27조·제30조" },
      { when: "영업정지라면", what: "과징금으로 바꿀 수 있는 처분인지 확인해요." },
      { when: "행정소송은", what: "처분을 안 날부터 90일 안에 내요.", law: "행정소송법 제20조" },
    ],
    tools: [T("/ko/appeal-deadline-calculator/", "불복 기한 계산"), T("/ko/license-points-calculator/", "벌점·영업정지↔과징금"), T("/ko/fine-reduction-calculator/", "과태료 감경"), T("/ko/administrative-law-guide/", "행정 법령 길잡이")],
    help: ["국민권익위원회 110", "중앙행정심판위원회 온라인행정심판"],
  },
  {
    id: "claimrefused", kind: "event", icon: "🧾", title: "보험금 지급을 거절당했을 때", who: "보험사가 보험금을 거절하거나 깎은 사람",
    keywords: ["보험금 거절", "부지급", "보험금 삭감", "의료자문", "보험사", "보험금 청구"],
    steps: [
      { when: "먼저", what: "거절·삭감 사유를 서면으로 받아요. 약관의 어느 조항인지 확인해요." },
      { when: "의료자문 동의를 요청받으면", what: "동의 전에 어떤 자료가 누구에게 가는지 확인해요." },
      { when: "다투고 싶다면", what: "금융감독원 분쟁조정을 신청할 수 있어요." },
      { when: "3년 안", what: "보험금 청구권은 3년이 지나면 소멸해요.", law: "상법 제662조" },
    ],
    tools: [T("/ko/insurance-law-guide/", "보험 법령 길잡이"), T("/ko/silson-insurance-generation-calculator/", "실손 세대별 자기부담"), T("/ko/disability-fault-claim-calculator/", "장해·과실 보험금"), T("/ko/statute-limitations-calculator/", "소멸시효")],
    help: ["금융감독원 1332"],
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
