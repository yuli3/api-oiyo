// GENERATED from tools-oiyo src/lib/expert-visit-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 전문가 상담 전 준비 (2026-11-23, CHOSEUN "사람들이 세무사·노무사·회계사·법무사·행정사·중개사·재무설계사를 찾아가는 니즈를 찾아 도구·스킬 추가").
// 계산 없음. 사람들이 자주 맡기는 일(중개 플랫폼 서비스 목록, 각 자격법의 업무 범위)을 모아
// "먼저 혼자 해 볼 수 있는 도구 → 챙겨 갈 서류 → 무료 공식 창구"로 이어 줘요.
// 이름 경계: 우리 도구 이름에 자격 이름을 붙이지 않아요. 여기서는 "누구를 찾아갈지" 안내할 때만 직업 이름을 써요.
import { KR_DESKS } from "./kr-desks-2026.mjs";

export const EXPERT_VISIT_AS_OF = "2026-11-23";

                                                                                                                                
                                                                                                                                                                                     

const t = (href        , title        ) => ({ href, title });

export const EXPERTS           = [
  {
    id: "tax", icon: "🧾", name: "세무사", scope: "세금 신고·불복 대리, 세무 상담, 장부 작성 대행", law: "세무사법 제2조", guide: "/ko/tax-law-guide/",
    needs: [
      { id: "income", q: "종합소득세 신고(프리랜서·사업자)", keywords: ["종합소득세", "종소세", "5월", "3.3", "프리랜서 신고"], tools: [t("/ko/comprehensive-income-tax-calculator/", "종합소득세 계산"), t("/ko/freelancer-tax-calculator/", "3.3% 환급"), t("/ko/expense-ratio-calculator/", "경비율")] },
      { id: "book", q: "장부를 맡길지(기장) 혼자 할지", keywords: ["기장", "장부", "기장료", "간편장부", "복식부기"], tools: [t("/ko/bookkeeping-vs-estimate-calculator/", "장부 vs 추계"), t("/ko/general-vs-simplified-vat-calculator/", "일반 vs 간이과세")] },
      { id: "home", q: "집 팔 때 양도소득세", keywords: ["양도세", "양도소득세", "집 팔", "1세대 1주택", "비과세"], tools: [t("/ko/capital-gains-tax-calculator/", "양도소득세"), t("/ko/temporary-two-house-tax-calculator/", "일시적 2주택")] },
      { id: "gift", q: "상속·증여세", keywords: ["증여세", "상속세", "증여", "상속", "부모님 돈"], tools: [t("/ko/gift-tax-calculator/", "증여세"), t("/ko/inheritance-tax-calculator/", "상속세"), t("/ko/inheritance-gift-filing-deadline-calculator/", "신고 기한"), t("/ko/family-loan-interest-checker/", "가족 간 차용 이자")] },
      { id: "notice", q: "세무서 안내문·고지서, 경정청구 환급", keywords: ["고지서", "안내문", "경정청구", "가산세", "세무조사"], tools: [t("/ko/appeal-deadline-calculator/", "불복 기한"), t("/ko/tax-penalty-calculator/", "가산세")], desk: "taxnotice" },
    ],
    bring: ["신분증과 홈택스 로그인 수단", "지난해 신고서·원천징수영수증·지급명세서", "통장 거래 내역과 카드 사용 내역", "계약서·영수증 등 비용 증빙", "받은 안내문·고지서(받은 날짜 메모)"],
    free: ["국세청 126", "세무서 납세자보호담당관(영세납세자 무료 국선대리인)", "마을세무사(지자체 무료 상담)"],
    lawyerWhen: "조세 소송(행정소송)은 변호사가 대리해요.",
  },
  {
    id: "labor", icon: "🤝", name: "공인노무사", scope: "노동 사건 대리(구제신청 등), 노무 서류 작성, 노무관리 진단, 노동 상담", law: "공인노무사법 제2조", guide: "/ko/labor-law-guide/",
    needs: [
      { id: "dismissal", q: "부당해고 구제신청", keywords: ["해고", "부당해고", "권고사직", "구제신청"], tools: [t("/ko/dismissal-notice-pay-calculator/", "해고예고수당"), t("/ko/appeal-deadline-calculator/", "구제신청 기한")], desk: "dismissal" },
      { id: "unpaid", q: "임금체불·퇴직금 진정", keywords: ["체불", "월급", "퇴직금", "대지급금", "진정"], tools: [t("/ko/unpaid-wage-guarantee-calculator/", "대지급금"), t("/ko/severance-calculator/", "퇴직금")], desk: "unpaid" },
      { id: "harassment", q: "직장 내 괴롭힘", keywords: ["괴롭힘", "갑질", "폭언"], tools: [t("/ko/labor-law-guide/", "노동 법령 길잡이")], desk: "harassment" },
      { id: "accident", q: "산재 신청", keywords: ["산재", "다쳤", "업무상 재해", "요양"], tools: [t("/ko/industrial-accident-leave-pay-calculator/", "휴업급여"), t("/ko/industrial-injury-disability-calculator/", "장해급여"), t("/ko/industrial-accident-report-deadline/", "산재 보고 기한")] },
      { id: "employer", q: "(사업주) 근로계약·주휴·연장수당·4대보험", keywords: ["사업주", "근로계약서", "주휴", "4대보험", "알바", "인건비"], tools: [t("/ko/weekly-holiday-pay-calculator/", "주휴수당"), t("/ko/overtime-pay-calculator/", "연장·야간수당"), t("/ko/labor-cost-calculator/", "인건비"), t("/ko/workforce-schedule-check/", "상시 근로자 수")] },
    ],
    bring: ["근로계약서", "급여명세서·통장 입금 내역", "출퇴근 기록(교통카드·메신저·사진)", "해고·징계 통지서", "녹음·메신저·진단서 같은 증거"],
    free: ["고용노동부 1350", "노동위원회 무료 권리구제 대리인(저소득 근로자)", "근로복지공단 1588-0075"],
    lawyerWhen: "민사·형사 소송(임금 청구 소송, 형사 고소 대리)은 변호사 영역이에요.",
  },
  {
    id: "cpa", icon: "📊", name: "공인회계사", scope: "회계감사, 재무 자문, 기업가치 평가, 세무 대리", law: "공인회계사법 제2조", guide: "/ko/accounting-law-guide/",
    needs: [
      { id: "audit", q: "외부감사 대상인지", keywords: ["외부감사", "외감", "감사 대상"], tools: [t("/ko/accounting-schedule-calculator/", "외감 대상 판정·감가상각")] },
      { id: "value", q: "비상장주식·회사 가치 평가", keywords: ["비상장", "주식 가치", "기업가치", "투자 유치", "지분"], tools: [t("/ko/unlisted-share-valuation-calculator/", "비상장주식 평가"), t("/ko/dcf-valuation-calculator/", "DCF 가치평가")] },
      { id: "incorp", q: "법인 전환", keywords: ["법인 전환", "법인 설립", "개인사업자 법인"], tools: [t("/ko/incorporation-calculator/", "법인 vs 개인"), t("/ko/incorporation-conversion-calculator/", "법인 전환 비용")] },
      { id: "corptax", q: "법인세 세무조정", keywords: ["법인세", "세무조정", "결산"], tools: [t("/ko/corporate-tax-adjustment-calculator/", "세무조정")] },
    ],
    bring: ["재무제표(최근 3년)", "법인 등기부등본·주주명부", "계정별 원장·통장 내역", "주요 계약서"],
    free: ["중소기업 통합콜센터 1357", "국세청 126"],
    lawyerWhen: "지분 분쟁·소송은 변호사 영역이에요.",
  },
  {
    id: "court", icon: "🏛️", name: "법무사", scope: "등기·공탁 신청 대리, 법원·검찰 제출 서류 작성", law: "법무사법 제2조", guide: "/ko/registry-court-law-guide/",
    needs: [
      { id: "registry", q: "상속·매매 등기(셀프 등기 가능 여부)", keywords: ["등기", "상속등기", "소유권이전", "셀프 등기", "근저당 말소"], tools: [t("/ko/self-registration-cost-calculator/", "셀프 등기 비용"), t("/ko/acquisition-tax-calculator/", "취득세")] },
      { id: "collect", q: "내용증명·지급명령으로 돈 받기", keywords: ["내용증명", "지급명령", "빌려준 돈", "대여금", "미수금"], tools: [t("/ko/demand-letter-builder/", "내용증명 작성 도우미"), t("/ko/litigation-cost-calculator/", "소송 비용")], desk: "lend" },
      { id: "deposit", q: "보증금 반환·임차권등기명령", keywords: ["임차권등기", "보증금 반환", "전세금"], tools: [t("/ko/demand-letter-builder/", "내용증명 작성 도우미"), t("/ko/auction-distribution-calculator/", "경매 배당")], desk: "deposit" },
      { id: "rehab", q: "개인회생·파산 신청 서류", keywords: ["개인회생", "파산", "빚", "채무"], tools: [t("/ko/personal-rehabilitation-calculator/", "개인회생 변제금")] },
      { id: "deposit-court", q: "공탁", keywords: ["공탁", "변제공탁"], tools: [t("/ko/court-deposit-interest-calculator/", "공탁금 이자")] },
    ],
    bring: ["신분증·인감증명서(필요할 때)", "등기부등본", "가족관계증명서·제적등본(상속)", "계약서·차용증·이체 내역", "법원에서 받은 서류"],
    free: ["대한법률구조공단 132", "인터넷등기소·전자소송 도움말", "법원 민원실(나홀로소송)"],
    lawyerWhen: "소송 대리(법정에서 대신 다투는 일)는 변호사만 할 수 있어요.",
  },
  {
    id: "admin", icon: "🏢", name: "행정사", scope: "행정기관 제출 서류 작성·제출 대행, 인허가·체류 민원", law: "행정사법 제2조", guide: "/ko/administrative-law-guide/",
    needs: [
      { id: "suspension", q: "영업정지·면허취소 행정심판", keywords: ["영업정지", "행정심판", "면허취소", "행정처분"], tools: [t("/ko/appeal-deadline-calculator/", "행정심판 기한"), t("/ko/license-points-calculator/", "벌점·과징금")], desk: "suspension" },
      { id: "permit", q: "인허가·등록 서류", keywords: ["인허가", "허가", "영업신고", "등록 서류"], tools: [t("/ko/permit-document-checklist/", "인허가 서류 체크")] },
      { id: "visa", q: "체류자격·비자", keywords: ["비자", "체류", "외국인", "F-2", "F-27", "출입국"], tools: [t("/ko/visa-stay-status-guide/", "체류자격 안내"), t("/ko/f27-points-calculator/", "점수제 계산")] },
      { id: "fine", q: "과태료 이의제기·감경", keywords: ["과태료", "이의제기", "감경"], tools: [t("/ko/fine-reduction-calculator/", "과태료 감경")] },
    ],
    bring: ["처분·통지서(받은 날짜 메모)", "사업자등록증·영업신고증", "그동안 낸 서류 사본", "사정(초범·매출 피해 등)을 보여 줄 자료"],
    free: ["정부민원안내콜센터 110", "외국인종합안내센터 1345", "중앙행정심판위원회 온라인행정심판"],
    lawyerWhen: "행정소송 대리는 변호사 영역이에요.",
  },
  {
    id: "broker", icon: "🏠", name: "공인중개사", scope: "등록 사무소에서 매매·임대차 중개, 확인·설명, 거래계약서 작성", law: "공인중개사법 제2조·제25조", guide: "/ko/realty-brokerage-law-guide/",
    needs: [
      { id: "lease", q: "전월세 계약 전 확인(등기부·선순위)", keywords: ["전세 계약", "월세 계약", "등기부", "선순위", "깡통", "전세사기"], tools: [t("/ko/jeonse-guarantee-calculator/", "전세보증금 안전성"), t("/ko/jeonse-monthly-converter/", "전월세 전환")], desk: "move" },
      { id: "fee", q: "중개보수(복비)", keywords: ["중개보수", "복비", "중개수수료"], tools: [t("/ko/brokerage-calculator/", "중개보수")] },
      { id: "buy", q: "집 살 때 절차와 비용", keywords: ["매매", "집 사", "취득세", "잔금"], tools: [t("/ko/acquisition-tax-calculator/", "취득세"), t("/ko/dsr-calculator/", "DSR 대출 한도")], desk: "homebuy" },
      { id: "buyrent", q: "전세 vs 매매 vs 월세", keywords: ["전세 vs", "매매 vs", "살까 말까"], tools: [t("/ko/jeonse-vs-buy-calculator/", "전세 vs 매매"), t("/ko/jeonse-vs-rent-calculator/", "전세 vs 월세")] },
    ],
    bring: ["신분증", "등기부등본(당일 발급)", "건축물대장", "계약금 이체 계좌 명의 확인", "확정일자·전입신고 일정"],
    free: ["주택도시보증공사 1566-9009", "대한법률구조공단 132(주택임대차분쟁조정)", "시·군·구 부동산 중개 상담"],
    lawyerWhen: "보증금 반환 소송, 전세사기 고소는 변호사 영역이에요.",
  },
  {
    id: "plan", icon: "📈", name: "재무설계 상담(CFP·AFPK 등 민간 자격, 금융회사 상담)", scope: "가계 현금흐름·은퇴·보장 점검과 설계(국가자격 업무는 아니에요. 상품 판매와 분리해서 들어요)", law: "금융소비자보호법(판매·자문 규제)", guide: "/ko/money-planner/",
    needs: [
      { id: "checkup", q: "우리 집 돈 흐름 점검", keywords: ["가계부", "재무 점검", "돈 관리", "저축률", "비상금"], tools: [t("/ko/household-money-checkup/", "가계 재무 건강검진"), t("/ko/money-planner/", "월급 나누기")] },
      { id: "retire", q: "은퇴·연금 준비", keywords: ["은퇴", "노후", "연금", "국민연금"], tools: [t("/ko/national-pension-estimate-calculator/", "국민연금 예상액"), t("/ko/fire-retirement-calculator/", "은퇴 자금")] },
      { id: "account", q: "절세계좌(연금저축·IRP·ISA)", keywords: ["연금저축", "IRP", "ISA", "절세"], tools: [t("/ko/isa-vs-pension-calculator/", "ISA vs 연금저축"), t("/ko/tax-savings-roadmap/", "절세 로드맵")] },
      { id: "insurance", q: "보험 점검(리모델링)", keywords: ["보험 리모델링", "보험료", "실손", "보험 점검"], tools: [t("/ko/household-money-checkup/", "보험료 비율"), t("/ko/silson-insurance-generation-calculator/", "실손 세대별")] },
      { id: "debt", q: "대출 갚는 순서·갈아타기", keywords: ["대출", "대환", "갈아타기", "빚 갚"], tools: [t("/ko/loan-comparison-calculator/", "대출 비교"), t("/ko/dsr-calculator/", "DSR")] },
    ],
    bring: ["월 실수령액과 고정 지출", "예적금·투자·연금 잔액", "대출 금리·남은 기간", "보험 증권(보장 내용·납입 기간)", "목표(주택·교육·은퇴)와 시점"],
    free: ["금융감독원 1332 · 파인(fine.fss.or.kr)", "국민연금공단 노후준비서비스", "서민금융진흥원 1397"],
    lawyerWhen: "투자 손실 분쟁은 금융감독원 분쟁조정이나 변호사에게 물어보세요.",
  },
];

/** 질문 문장으로 맞는 전문가와 할 일을 찾아요. */
export function findExpertNeeds(question        , limit = 3) {
  const q = (question ?? "").toLowerCase();
  const hits                                                        = [];
  for (const e of EXPERTS) for (const n of e.needs) {
    const score = n.keywords.filter((k) => q.includes(k.toLowerCase())).length;
    if (score > 0) hits.push({ expert: e.id, need: n, score });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, Math.max(1, Math.min(limit, 10)));
}

export const expertById = (id        ) => EXPERTS.find((e) => e.id === id);
export const deskTitle = (id         ) => (id ? KR_DESKS.find((d) => d.id === id)?.title : undefined);
