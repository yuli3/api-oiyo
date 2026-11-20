// 법령 길잡이 도구 스키마 (2026-11-16, 11-17 보험 분야 추가), spread into BIZ_TOOLS by biz-tools-spec.mjs.
// WHY: CHOSEUN asked for agents that act like Korean licensed advisers and ask clarifying questions first.
// Korean law reserves the titles and the representation work (세무사법 제20조, 공인회계사법 제11조,
// 공인노무사법 제8조·제27조, 행정사법 제3조, 법무사법 제3조, 변호사법 제109조), so these tools return
// legal information, statute citations, deadlines and the questions to ask — never filings or advice.
// Data and formulas: tools-oiyo src/lib/kr-expert-guide-2026.ts (vendored by scripts/sync-tools-tax.mjs).
import { TOPICS } from "./vendor/tools-tax/kr-expert-guide-2026.mjs";

const DOMAIN = { type: "string", enum: ["tax", "accounting", "labor", "admin", "court", "insurance", "customs", "ip", "appraisal", "realty", "building", "health", "family", "welfare"], description: "tax = 세금(세무사), accounting = 회계·장부(공인회계사), labor = 노동(공인노무사), admin = 행정(행정사), court = 등기·법원 서류(법무사), insurance = 보험(보험계리사·손해사정사·등록 설계사), customs = 관세·통관(관세사), ip = 특허·상표(변리사), appraisal = 감정평가·보상(감정평가사), realty = 부동산 중개(공인중개사), building = 건축·인허가(건축사), health = 보건·의료 이용(의료인·약사), family = 가사·이혼(변호사), welfare = 복지급여(사회복지사, 대행은 행정사)" };
const fn = (name, description, properties, required = []) => ({ type: "function", function: { name, description, parameters: { type: "object", properties, required } } });

export const LAW_GUIDE_TOOLS = [
  fn("get_kr_professional_scope",
    "Legal scope of Korean licensed professions — 세무사 (tax), 공인회계사 (accounting/audit), 공인노무사 (labor), 행정사 (administrative), 법무사 (court documents/registry), 보험계리사·손해사정사·보험설계사 (insurance actuarial, loss adjusting, registered sales), 관세사 (customs), 변리사 (patents/trademarks), 감정평가사 (appraisal), 공인중개사 (real estate brokerage) — with the statute article, the work a non-licensed person may not do as a business, the title-protection rules, free public help lines, and a who-can-do-what matrix (incl. 변호사). Use it to tell users what an AI legal-information assistant may and may not do, and when to hand off to a licensed professional.",
    { domain: { ...DOMAIN, description: `${DOMAIN.description}. Omit for all six.` } }),
  fn("start_kr_law_intake",
    "Clarify-first intake for Korean tax, accounting, labor, administrative, court/registry, insurance, customs, patent/trademark, appraisal/compensation and real estate brokerage problems (e.g. a tax notice, missed filing, inheritance/gift filing, home sale, bookkeeping duty, external audit test, dismissal, unpaid wages, workplace harassment, industrial accident, business suspension, permit refusal, fines, information disclosure, inheritance renunciation, ownership transfer registration, collecting a debt, jeonse deposit, corporate change registration, cancelling an insurance policy within the cooling-off period, illegal-contract termination, a denied/reduced insurance claim or rescission for non-disclosure, for insurance agents: gift (special benefit) limit and policy-replacement checks, overseas direct-purchase duty exemption, customs duty correction/refund/appeal, patent grace period after self-disclosure, patent/trademark rejection response, expropriation compensation objection, official land price objection, brokerage fee and transaction report, broker liability). Call it BEFORE answering: send the user's situation (or a topic id) and any answers collected so far; it returns the next 1-3 questions to ask (with why each matters), deadlines computed from the answers (first day excluded, month-end rules, weekend/holiday roll-over; national tax also skips Workers' Day) with days left, warnings with statute citations, plain-language statutes with law.go.kr links, OIYO calculators, documents to bring, free public help lines and when a licensed professional is needed. Legal information only — not tax/labor/legal representation.",
    {
      situation: { type: "string", maxLength: 500, description: "The user's situation in their own words (Korean works best). Used to pick the topic when topic is omitted." },
      topic: { type: "string", enum: TOPICS.map((t) => t.id), description: "Topic id from a previous call. Overrides situation." },
      domain: { ...DOMAIN, description: "Optional: restrict topic matching to one field" },
      answers: { type: "object", description: "Answers collected so far, keyed by the question keys this tool returned (strings, numbers in KRW / months / days, YYYY-MM-DD dates, 'yes'/'no'). Up to 20 keys." },
      today: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$", description: "Reference date YYYY-MM-DD for days left (default: today in Asia/Seoul)" },
      limit: { type: "integer", minimum: 1, maximum: 6, description: "How many next questions to return (default 3)" },
    }),
  fn("search_kr_statutes",
    "Search a curated index of about 130 Korean statute articles used in everyday tax, accounting, labor, administrative, court/registry, insurance, customs, IP, appraisal and real estate matters (국세기본법, 소득세법, 상속세 및 증여세법, 부가가치세법, 지방세법, 법인세법, 외부감사법, 상법, 근로기준법, 근로자퇴직급여 보장법, 고용보험법, 산재보험법, 행정절차법, 행정기본법, 행정심판법, 행정소송법, 민원처리법, 정보공개법, 질서위반행위규제법, 민법, 민사소송법, 부동산등기 특별조치법, 주택임대차보호법, 보험업법, 금융소비자보호법, 관세법, 관세사법, 특허법, 상표법, 변리사법, 토지보상법, 부동산공시법, 감정평가법, 공인중개사법, 부동산거래신고법, 변호사법 ...). Returns the article, a plain-Korean summary (not the official text) and a law.go.kr link.",
    {
      query: { type: "string", maxLength: 100, description: "Keywords, e.g. 경정청구, 부당해고 구제신청, 임차권등기, 과태료 이의제기" },
      domain: { ...DOMAIN, description: "Optional field filter" },
      limit: { type: "integer", minimum: 1, maximum: 20, description: "Max results (default 8)" },
    }, ["query"]),
];

export const LAW_GUIDE_ENDPOINTS = {
  get_kr_professional_scope: { path: "/v1/law/kr/professional-scope", method: "POST" },
  start_kr_law_intake: { path: "/v1/law/kr/intake", method: "POST" },
  search_kr_statutes: { path: "/v1/law/kr/statutes", method: "POST" },
};
