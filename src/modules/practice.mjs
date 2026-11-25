// 전문 실무 계산·길잡이 핸들러 (2026-11-17). 스키마: practice-spec.mjs. 계산은 tools-oiyo와 같은 vendored 파일이에요.
import { KR_HOLIDAYS } from "./vendor/tools-tax/kr-business-day.mjs";
import { analyzeEntries, claimPlain, claimResult, csmPlain, csmResult, dutyPlain, dutyResult, finePlain, fineResult, kicsPlain, kicsResult } from "./vendor/tools-tax/pro-practice-2026.mjs";
import { GUIDES, guideBySlug, guideDeadlines, recordCheck, recordText } from "./vendor/tools-tax/pro-practice-guides-2026.mjs";
import { PRIVACY_AS_OF, breachClock, checkPolicy, parseAt } from "./vendor/tools-tax/privacy-check-2026.mjs";
import { CONTRACT_AS_OF, checkContract } from "./vendor/tools-tax/freelance-contract-check-2026.mjs";
import { CHECKS_AS_OF, CLAUSES, contractCheck } from "./vendor/tools-tax/kr-office-checks-2026.mjs";
import { MISTAKE_QUESTIONS, checkMistakes, isMistakeAnswer } from "./vendor/tools-tax/kr-income-tax-mistakes-2026.mjs";

const TOOLS = "https://tools.oiyo.net/ko/";
const NOTE = "정보·계산 도구예요. 과태료 부과, 품목분류, 책임준비금·지급여력 산출, 손해사정, 감사의견, 신고·서류 대리를 하지 않아요.";
const HOLIDAYS = Object.entries(KR_HOLIDAYS).flatMap(([y, list]) => list.map((md) => `${y}-${md}`));
const fin = (n) => (Number.isFinite(n) ? n : null);

/** biz-strategy.mjs의 InputError를 받아 핸들러를 만들어요(순환 import를 피하려고). */
export function makePracticeHandlers(InputError) {

  function fine(i) {
    const input = { fine: i.fine, noticeDate: i.noticeDate ?? "", opinionDays: i.opinionDays ?? 10, when: i.when, monthsLate: i.monthsLate ?? 0, vulnerable: i.vulnerable ?? false };
    return { result: fineResult(input), plain: finePlain(input), page: `${TOOLS}fine-reduction-calculator/`, note: NOTE };
  }
  function duty(i) {
    const input = { price: i.price, freight: i.freight ?? 0, insurance: i.insurance ?? 0, fx: i.fx, baseRate: i.baseRate, ftaRate: i.ftaRate ?? i.baseRate, hasOrigin: i.hasOrigin ?? false, personal: i.personal ?? false, fromUS: i.fromUS ?? false };
    return { result: dutyResult(input), plain: dutyPlain(input), page: `${TOOLS}import-duty-fta-calculator/`, note: NOTE };
  }
  function csm(i) {
    const input = { premium: i.premium, years: i.years, claims: i.claims, expense: i.expense ?? 0, acquisition: i.acquisition ?? 0, rate: i.rate, ra: i.ra ?? 0 };
    return { result: csmResult(input), plain: csmPlain(input), page: `${TOOLS}ifrs17-csm-simulator/`, note: NOTE };
  }
  function kics(i) {
    const input = { available: i.available, life: i.life ?? 0, nonlife: i.nonlife ?? 0, market: i.market ?? 0, credit: i.credit ?? 0, operational: i.operational ?? 0, taxAdj: i.taxAdj ?? 0 };
    const r = kicsResult(input);
    return { result: { ...r, ratio: fin(r.ratio) }, plain: kicsPlain(input), correlation: "illustrative Solvency II-like correlations, not the supervisory K-ICS parameters", page: `${TOOLS}kics-solvency-ratio-calculator/`, note: NOTE };
  }
  function claim(i) {
    const input = { kind: i.kind, sum: i.sum ?? 0, rates: i.rates ?? [], prior: i.prior ?? 0, damage: i.damage ?? 0, fault: i.fault ?? 0, deductible: i.deductible ?? 0, limit: i.limit ?? 0 };
    if (input.kind === "disability" && !input.rates.length) throw new InputError(["rates: at least one disability rate for kind=disability"]);
    return { result: claimResult(input), plain: claimPlain(input), page: `${TOOLS}disability-fault-claim-calculator/`, note: NOTE };
  }
  function entries(i) {
    const rows = i.entries.map((e) => ({ date: e.date, account: e.account ?? "", amount: e.amount, memo: e.memo, user: e.user }));
    const r = analyzeEntries(rows, { approvalLimit: i.approvalLimit ?? 0, holidays: HOLIDAYS });
    return { ...r, flagged: r.flagged.slice(0, i.top ?? 30), page: `${TOOLS}journal-entry-analytics/`, note: "Signals are an order to review, not evidence of fraud. 감사의견은 감사인이 판단해요." };
  }
  function practiceGuide(i) {
    if (!i.guide) return { guides: GUIDES.map((g) => ({ slug: g.slug, title: g.title, cases: g.cases.map((c) => ({ id: c.id, label: c.label })), page: `${TOOLS}${g.slug}/` })), note: NOTE };
    const g = guideBySlug(i.guide);
    const dates = i.dates ?? {};
    const keys = Object.entries(dates);
    const problems = [];
    if (keys.length > 10) problems.push("dates: at most 10 keys");
    for (const [k, v] of keys) if (!/^[a-z0-9-]{1,30}$/.test(k) || typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) problems.push(`dates.${k.slice(0, 30)}: YYYY-MM-DD keyed by a deadline id`);
    const cases = i.case ? g.cases.filter((c) => c.id === i.case) : g.cases;
    if (i.case && !cases.length) problems.push(`case: one of ${g.cases.map((c) => c.id).join(", ")}`);
    if (problems.length) throw new InputError(problems);
    return { slug: g.slug, title: g.title, intro: g.intro, cases: cases.map((c) => ({ ...c, deadlines: guideDeadlines(c, dates) })), page: `${TOOLS}${g.slug}/`, note: NOTE };
  }
  function explanation(i) {
    const input = { customer: i.customer ?? "", product: i.product ?? "", date: i.date ?? "", suitability: i.suitability ?? [], explained: i.explained ?? [], delivered: i.delivered ?? "", confirm: i.confirm ?? "", replace: i.replace ?? false, note: i.note ?? "" };
    return { ...recordCheck(input), text: recordText(input), page: `${TOOLS}insurance-explanation-record/`, note: "개인 점검용이에요. 회사의 공식 확인서·녹취를 대신하지 않아요." };
  }

  function privacy(i) {
    const PNOTE = "판단 보조예요. 유출 신고·처리방침 작성을 대신하지 않아요. 문의: 개인정보침해신고센터 118, privacy.go.kr.";
    if (i.mode === "policy") {
      if (typeof i.policyText !== "string" || !i.policyText.trim()) throw new InputError(["policyText: the privacy policy text for mode=policy"]);
      const ctx = { website: !!i.website, outsource: !!i.outsource, thirdParty: !!i.thirdParty, overseas: !!i.overseas };
      return { asOf: PRIVACY_AS_OF, ...checkPolicy(i.policyText, ctx), page: `${TOOLS}privacy-breach-policy-check/`, note: PNOTE };
    }
    if (!parseAt(i.knownAt ?? "")) throw new InputError(["knownAt: YYYY-MM-DD or YYYY-MM-DDTHH:mm (when the breach became known)"]);
    const r = breachClock({ knownAt: i.knownAt, affected: i.affected ?? 0, sensitive: !!i.sensitive, hacking: !!i.hacking, contactUnknown: !!i.contactUnknown });
    return { asOf: PRIVACY_AS_OF, ...r, page: `${TOOLS}privacy-breach-policy-check/`, note: PNOTE };
  }

  function contract(i) {
    if (typeof i.contractText !== "string" || !i.contractText.trim()) throw new InputError(["contractText: the freelance or outsourcing contract text"]);
    const amount = i.amount === undefined || i.amount === null ? undefined : Number(i.amount);
    const r = checkContract(i.contractText, { creative: !!i.creative, registered: !!i.registered }, amount);
    return { asOf: CONTRACT_AS_OF, ...r, page: `${TOOLS}freelance-contract-check/`, note: "읽기 보조예요. 계약서를 대신 쓰거나 고치지 않아요. 고칠 부분은 상대와 합의하세요. 문의: 대한법률구조공단 132." };
  }

  function employmentContract(i) {
    const kinds = ["regular", "fixedTerm", "partTime"];
    const ids = CLAUSES.map((c) => c.id);
    const bad = [];
    if (!kinds.includes(i.kind)) bad.push("kind: regular | fixedTerm | partTime");
    if (!Array.isArray(i.written) || i.written.some((w) => !ids.includes(w))) bad.push(`written: array of ${ids.join(", ")}`);
    const hours = i.weeklyHours === undefined || i.weeklyHours === null ? undefined : Number(i.weeklyHours);
    if (hours !== undefined && !(Number.isFinite(hours) && hours >= 0 && hours <= 80)) bad.push("weeklyHours: 0-80");
    if (bad.length) throw new InputError(bad);
    const r = contractCheck({ kind: i.kind, small: !!i.small, weeklyHours: hours, written: [...new Set(i.written)], handedOver: !!i.handedOver });
    return { asOf: CHECKS_AS_OF, ...r, page: `${TOOLS}employment-contract-checker/`, note: "점검표예요. 계약서를 대신 쓰지 않아요. 표준근로계약서는 고용노동부 누리집에서 받을 수 있어요. 상담: 고용노동부 1350." };
  }

  function incomeTaxMistakes(i) {
    const bad = MISTAKE_QUESTIONS.filter((q) => i[q.id] !== undefined && !isMistakeAnswer(i[q.id])).map((q) => `${q.id}: yes | no | unknown`);
    if (bad.length) throw new InputError(bad);
    const a = Object.fromEntries(MISTAKE_QUESTIONS.filter((q) => i[q.id] !== undefined).map((q) => [q.id, i[q.id]]));
    const r = checkMistakes(a);
    return { ...r, hits: r.hits.map((h) => ({ ...h, tools: (h.tools ?? []).map((t) => ({ ...t, href: `https://tools.oiyo.net${t.href}` })) })), page: `${TOOLS}income-tax-filing-mistake-check/`, note: "점검기예요. 세액을 계산하거나 신고를 대신하지 않아요. 문의: 국세상담센터 126." };
  }

  return {
    "/v1/labor/kr/employment-contract": employmentContract,
    "/v1/tax/kr/income-tax-filing-mistakes": incomeTaxMistakes,
    "/v1/law/kr/freelance-contract": contract,
    "/v1/law/kr/privacy-check": privacy,
    "/v1/law/kr/fine-reduction": fine,
    "/v1/customs/kr/import-duty": duty,
    "/v1/insurance/ifrs17-csm": csm,
    "/v1/insurance/kics-ratio": kics,
    "/v1/insurance/claim-payout": claim,
    "/v1/audit/journal-entries": entries,
    "/v1/law/kr/practice-guide": practiceGuide,
    "/v1/insurance/explanation-record": explanation,
  };
}
