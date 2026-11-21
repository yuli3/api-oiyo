// 전문 직군 전수조사 계산 20종 핸들러 (2026-11-21). 스키마: pro-gap-spec.mjs. 계산은 tools-oiyo와 같은 vendored 파일이에요.
import { CORP_TAX_AS_OF, CORP_TAX_NOTE, corpTax } from "./vendor/tools-tax/kr-corp-tax-2026.mjs";
import { PENALTY_AS_OF, PENALTY_NOTE, nextReductionStep, taxPenalty } from "./vendor/tools-tax/kr-tax-penalty-2026.mjs";
import { APPEAL_AS_OF, APPEAL_NOTE, appealDue, appealsFrom } from "./vendor/tools-tax/kr-appeal-deadlines-2026.mjs";
import { INHERIT_AS_OF, INHERIT_NOTE, legalHeirs, reserveShortfall } from "./vendor/tools-tax/kr-inheritance-share-2026.mjs";
import { AUCTION_AS_OF, AUCTION_NOTE, auctionDistribution } from "./vendor/tools-tax/kr-auction-distribution-2026.mjs";
import { CUSTOMS_AS_OF, CUSTOMS_NOTE, directBundles, rvc, simpleRefund, travelerTax } from "./vendor/tools-tax/kr-customs-pack-2026.mjs";
import { WORKFORCE_AS_OF, WORKFORCE_NOTE, checkSchedule, headcountThresholds } from "./vendor/tools-tax/kr-workforce-2026.mjs";
import { ACCT_AS_OF, ACCT_NOTE, bondSchedule, depreciation, externalAuditCheck, leaseSchedule } from "./vendor/tools-tax/kr-accounting-schedules-2026.mjs";
import { POINTS_AS_OF, POINTS_NOTE, licenseStatus, suspensionToSurcharge, violationPoints } from "./vendor/tools-tax/kr-license-points-2026.mjs";
import { APPRAISAL_AS_OF, APPRAISAL_NOTE, businessLoss, costApproach, incomeApproach, landCompensation, reconcile, relocationAllowance, salesComparison } from "./vendor/tools-tax/kr-appraisal-2026.mjs";
import { IP_AS_OF, IP_NOTE, ipDeadlines } from "./vendor/tools-tax/kr-ip-deadlines-2026.mjs";
import { VAT_CREDIT_AS_OF, VAT_CREDIT_NOTE, badDebtCredit, cardSalesCredit, deemedInputCredit } from "./vendor/tools-tax/kr-vat-credits-2026.mjs";
import { FH_AS_OF, FH_NOTE, apartmentSchedule, franchiseCheck } from "./vendor/tools-tax/kr-franchise-housing-2026.mjs";
import { AUDIT_DEFERRED_AS_OF, AUDIT_DEFERRED_NOTE, attributeSample, deferredTax, materiality, musSample } from "./vendor/tools-tax/kr-audit-deferred-2026.mjs";
import { DISABILITY_AS_OF, DISABILITY_NOTE, disabilityBenefit } from "./vendor/tools-tax/kr-injury-disability-2026.mjs";
import { DEPOSIT_AS_OF, DEPOSIT_NOTE, depositCheck } from "./vendor/tools-tax/kr-court-deposit-2026.mjs";
import { REG_AS_OF, REG_NOTE, selfRegistrationCost } from "./vendor/tools-tax/kr-self-registration-2026.mjs";
import { F27_AS_OF, F27_NOTE, f27Points } from "./vendor/tools-tax/kr-f27-points-2026.mjs";
import { NTS_PACK_AS_OF, NTS_PACK_NOTE, bookVsEstimate, exemptBusinessReport, pensionIncomeChoice, studentLoanRepayment, withholdingStatement } from "./vendor/tools-tax/kr-nts-pack-2026.mjs";

const TOOLS = "https://tools.oiyo.net/ko/";
const todayIso = () => new Date().toISOString().slice(0, 10);

/** biz-strategy.mjs의 InputError를 받아 핸들러를 만들어요(순환 import를 피하려고). */
export function makeProGapHandlers(InputError) {
  const need = (i, mode, keys) => {
    const missing = keys.filter((k) => i[k] === undefined);
    if (missing.length) throw new InputError(missing.map((k) => `${k}: required for mode=${mode}`));
  };
  const out = (asOf, slug, note, body) => ({ asOf, ...body, page: `${TOOLS}${slug}/`, note });

  function corporate(i) {
    return out(CORP_TAX_AS_OF, "corporate-tax-adjustment-calculator", CORP_TAX_NOTE, corpTax(i));
  }
  function penalty(i) {
    const today = i.today ?? todayIso();
    const r = taxPenalty(i, today);
    const next = i.kind === "withholding" ? null : nextReductionStep(i.kind, i.due, i.filed ?? today);
    return out(PENALTY_AS_OF, "tax-penalty-calculator", PENALTY_NOTE, { ...r, nextReduction: next });
  }
  function appeals(i) {
    const today = i.today ?? todayIso();
    const rows = i.key ? [appealDue(i.key, i.from, today)].filter(Boolean) : appealsFrom(i.from, today, i.domain);
    return out(APPEAL_AS_OF, "appeal-deadline-calculator", APPEAL_NOTE, { from: i.from, deadlines: rows });
  }
  function inheritance(i) {
    const family = { spouse: !!i.spouse, children: i.children ?? 0, parents: i.parents ?? 0, siblings: i.siblings ?? 0 };
    const { heirs } = legalHeirs(family);
    const ids = new Set(heirs.map((h) => h.id));
    const problems = [];
    for (const key of ["gifts", "bequests"]) {
      const v = i[key] ?? {};
      const entries = Object.entries(v);
      if (entries.length > 40) problems.push(`${key}: at most 40 heirs`);
      for (const [id, amount] of entries) {
        if (!ids.has(id)) problems.push(`${key}.${id.slice(0, 20)}: heir id, one of ${[...ids].join(", ") || "(no heirs)"}`);
        else if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 0 || amount > 1e13) problems.push(`${key}.${id}: amount in KRW`);
      }
    }
    if (problems.length) throw new InputError(problems);
    return out(INHERIT_AS_OF, "inheritance-share-calculator", INHERIT_NOTE, reserveShortfall({ family, estate: i.estate, debts: i.debts, gifts: i.gifts, bequests: i.bequests, thirdGifts: i.thirdGifts, thirdBequests: i.thirdBequests, death: i.death }));
  }
  function auction(i) {
    const { today, ...x } = i;
    const tenants = (x.tenants ?? []).map((t, k) => ({ label: t.label ?? `임차인 ${k + 1}`, ...t }));
    const claims = (x.claims ?? []).map((c, k) => ({ label: c.label ?? `채권 ${k + 1}`, ...c }));
    return out(AUCTION_AS_OF, "auction-distribution-calculator", AUCTION_NOTE, auctionDistribution({ ...x, tenants, claims }, today ?? todayIso()));
  }
  function customs(i) {
    const slug = "customs-practice-calculator";
    if (i.mode === "travel") { need(i, "travel", ["totalUsd", "fx"]); return out(CUSTOMS_AS_OF, slug, CUSTOMS_NOTE, { mode: i.mode, ...travelerTax({ totalUsd: i.totalUsd, fx: i.fx, rate: i.rate, selfReport: i.selfReport, caught: i.caught }) }); }
    if (i.mode === "direct") {
      need(i, "direct", ["orders", "fx"]);
      const orders = i.orders.map((o, k) => ({ label: o.label ?? `주문 ${k + 1}`, ...o }));
      return out(CUSTOMS_AS_OF, slug, CUSTOMS_NOTE, { mode: i.mode, days: directBundles(orders, i.fx, i.dutyRate ?? 0.08) });
    }
    if (i.mode === "rvc") { need(i, "rvc", ["value", "nonOriginating", "threshold", "method"]); return out(CUSTOMS_AS_OF, slug, CUSTOMS_NOTE, { mode: i.mode, ...rvc({ value: i.value, nonOriginating: i.nonOriginating, originating: i.originating, threshold: i.threshold, method: i.method }) }); }
    need(i, "refund", ["fobKrw", "perTenThousand"]);
    return out(CUSTOMS_AS_OF, slug, CUSTOMS_NOTE, { mode: i.mode, ...simpleRefund({ fobKrw: i.fobKrw, perTenThousand: i.perTenThousand, accepted: i.accepted }) });
  }
  function workforce(i) {
    const slug = "workforce-schedule-check";
    if (i.mode === "count") { need(i, "count", ["daily"]); return out(WORKFORCE_AS_OF, slug, WORKFORCE_NOTE, { mode: i.mode, thresholds: headcountThresholds(i.daily) }); }
    need(i, "schedule", ["shifts"]);
    const shifts = i.shifts.map((s, k) => ({ day: s.day ?? `${k + 1}일`, ...s }));
    return out(WORKFORCE_AS_OF, slug, WORKFORCE_NOTE, { mode: i.mode, ...checkSchedule({ shifts, small: !!i.small, minor: !!i.minor }) });
  }
  function accounting(i) {
    const slug = "accounting-schedule-calculator";
    if (i.mode === "depreciation") { need(i, "depreciation", ["cost", "years", "method"]); return out(ACCT_AS_OF, slug, ACCT_NOTE, { mode: i.mode, ...depreciation(i.cost, i.residual ?? 0, i.years, i.method, i.firstMonths ?? 12) }); }
    if (i.mode === "lease") { need(i, "lease", ["payment", "periods", "rate"]); return out(ACCT_AS_OF, slug, ACCT_NOTE, { mode: i.mode, ...leaseSchedule(i.payment, i.periods, i.rate, !!i.advance, i.directCost ?? 0) }); }
    if (i.mode === "bond") { need(i, "bond", ["face", "couponRate", "marketRate", "periods"]); return out(ACCT_AS_OF, slug, ACCT_NOTE, { mode: i.mode, ...bondSchedule(i.face, i.couponRate, i.marketRate, i.periods) }); }
    return out(ACCT_AS_OF, slug, ACCT_NOTE, { mode: i.mode, ...externalAuditCheck({ listed: !!i.listed, llc: !!i.llc, assets: i.assets ?? 0, liabilities: i.liabilities ?? 0, revenue: i.revenue ?? 0, employees: i.employees ?? 0, members: i.members ?? 0 }) });
  }
  function points(i) {
    const slug = "license-points-calculator";
    if (i.mode === "surcharge") { need(i, "surcharge", ["perDay"]); return out(POINTS_AS_OF, slug, POINTS_NOTE, { mode: i.mode, ...suspensionToSurcharge({ days: i.days, months: i.months, perDay: i.perDay, cap: i.cap }) }); }
    need(i, "status", ["events"]);
    const problems = [];
    const events = i.events.map((e, k) => {
      if (e.points === undefined && !e.violation) problems.push(`events[${k}]: points or violation`);
      const p = e.points ?? (e.violation ? violationPoints(e.violation, !!e.schoolZone) : 0);
      return { date: e.date, points: p, label: e.label ?? e.violation ?? "" };
    });
    if (problems.length) throw new InputError(problems);
    const asOf = i.asOf ?? todayIso();
    return out(POINTS_AS_OF, slug, POINTS_NOTE, { mode: i.mode, events, ...licenseStatus(events, asOf, { mileage: i.mileage ?? 0, education: !!i.education }) });
  }
  function appraisal(i) {
    const slug = "appraisal-compensation-calculator";
    const m = i.mode;
    let r;
    if (m === "cost") { need(i, m, ["replacementCost", "usefulLife", "age"]); r = costApproach({ replacementCost: i.replacementCost, usefulLife: i.usefulLife, age: i.age, residualRate: i.residualRate, land: i.land }); }
    else if (m === "comparison") { need(i, m, ["subjectArea", "comps"]); r = salesComparison(i.subjectArea, i.comps); }
    else if (m === "income") { need(i, m, ["grossIncome", "capRate"]); r = incomeApproach({ grossIncome: i.grossIncome, vacancy: i.vacancy, expenses: i.expenses, capRate: i.capRate }); }
    else if (m === "reconcile") { need(i, m, ["values"]); r = reconcile(i.values.map((v, k) => ({ label: v.label ?? `방식 ${k + 1}`, ...v }))); }
    else if (m === "land") { need(i, m, ["officialPrice", "area"]); r = landCompensation({ officialPrice: i.officialPrice, area: i.area, landChange: i.landChange, regional: i.regional, individual: i.individual, other: i.other }); }
    else if (m === "business") { need(i, m, ["annualProfit", "kind"]); r = businessLoss({ annualProfit: i.annualProfit, kind: i.kind, months: i.months, fixedCosts: i.fixedCosts, moving: i.moving, saleLoss: i.saleLoss }); }
    else { need(i, m, ["monthlySpending"]); r = relocationAllowance(i.monthlySpending, !!i.tenant); }
    return out(APPRAISAL_AS_OF, slug, APPRAISAL_NOTE, { mode: m, ...r });
  }
  function ip(i) {
    const { today, ...x } = i;
    return out(IP_AS_OF, "ip-deadline-calculator", IP_NOTE, { deadlines: ipDeadlines(x, today ?? todayIso()) });
  }
  function vat(i) {
    const slug = "vat-credit-calculator";
    if (i.mode === "deemed") { need(i, "deemed", ["type", "purchases", "taxBase"]); return out(VAT_CREDIT_AS_OF, slug, VAT_CREDIT_NOTE, { mode: i.mode, ...deemedInputCredit({ type: i.type, purchases: i.purchases, taxBase: i.taxBase, corp: !!i.corp }) }); }
    if (i.mode === "card") { need(i, "card", ["cardSales", "priorYearSupply"]); return out(VAT_CREDIT_AS_OF, slug, VAT_CREDIT_NOTE, { mode: i.mode, ...cardSalesCredit({ cardSales: i.cardSales, priorYearSupply: i.priorYearSupply, corp: !!i.corp, usedThisYear: i.usedThisYear, payable: i.payable }) }); }
    need(i, "bad-debt", ["amount", "supplied"]);
    return out(VAT_CREDIT_AS_OF, slug, VAT_CREDIT_NOTE, { mode: i.mode, ...badDebtCredit({ amount: i.amount, supplied: i.supplied, confirmed: i.confirmed }) });
  }
  function franchise(i) {
    return out(FH_AS_OF, "franchise-contract-check", FH_NOTE, { items: franchiseCheck(i) });
  }
  function apartment(i) {
    const { today, ...x } = i;
    return out(FH_AS_OF, "apartment-management-check", FH_NOTE, apartmentSchedule(x, today ?? todayIso()));
  }
  function deferred(i) {
    return out(AUDIT_DEFERRED_AS_OF, "accounting-schedule-calculator", AUDIT_DEFERRED_NOTE, deferredTax(i));
  }
  function auditPlan(i) {
    const m = i.benchmark ? materiality({ benchmark: i.benchmark, base: i.base ?? 0, pct: i.pct, risk: i.risk, trivialPct: i.trivialPct }) : null;
    if (!m && i.population === undefined && i.tolerableRate === undefined) throw new InputError(["benchmark, population or tolerableRate: give at least one"]);
    if (i.benchmark && i.base === undefined) throw new InputError(["base: required with benchmark"]);
    const tolerable = i.tolerable ?? m?.performance;
    const mus = i.population !== undefined ? musSample({ population: i.population, tolerable: tolerable ?? 0, expected: i.expected, confidence: i.confidence }) : null;
    const attribute = i.tolerableRate !== undefined ? attributeSample({ tolerableRate: i.tolerableRate, confidence: i.confidence, population: i.controlPopulation }) : null;
    return out(AUDIT_DEFERRED_AS_OF, "accounting-schedule-calculator", AUDIT_DEFERRED_NOTE, { materiality: m, mus, attribute });
  }
  function disability(i) {
    return out(DISABILITY_AS_OF, "industrial-injury-disability-calculator", DISABILITY_NOTE, disabilityBenefit(i));
  }
  function deposit(i) {
    return out(DEPOSIT_AS_OF, "court-deposit-interest-calculator", DEPOSIT_NOTE, depositCheck({ ...i, withdrawn: i.withdrawn ?? todayIso() }));
  }
  function registration(i) {
    return out(REG_AS_OF, "self-registration-cost-calculator", REG_NOTE, selfRegistrationCost(i));
  }
  function f27(i) {
    return out(F27_AS_OF, "f27-points-calculator", F27_NOTE, f27Points(i));
  }
  function statement(i) {
    return out(NTS_PACK_AS_OF, "withholding-statement-penalty-calculator", NTS_PACK_NOTE, withholdingStatement({ ...i, today: i.today ?? todayIso() }));
  }
  function studentLoan(i) {
    return out(NTS_PACK_AS_OF, "student-loan-repayment-calculator", NTS_PACK_NOTE, studentLoanRepayment(i));
  }
  function bookEstimate(i) {
    return out(NTS_PACK_AS_OF, "bookkeeping-vs-estimate-calculator", NTS_PACK_NOTE, bookVsEstimate(i));
  }
  function exemptReport(i) {
    return out(NTS_PACK_AS_OF, "exempt-business-report-checker", NTS_PACK_NOTE, exemptBusinessReport({ ...i, today: i.today ?? todayIso() }));
  }
  function pension(i) {
    return out(NTS_PACK_AS_OF, "private-pension-separate-tax-calculator", NTS_PACK_NOTE, pensionIncomeChoice(i));
  }

  return {
    "/v1/tax/kr/withholding-statement": statement,
    "/v1/tax/kr/student-loan-repayment": studentLoan,
    "/v1/tax/kr/bookkeeping-vs-estimate": bookEstimate,
    "/v1/tax/kr/exempt-business-report": exemptReport,
    "/v1/tax/kr/private-pension-tax": pension,
    "/v1/tax/kr/corporate-tax": corporate,
    "/v1/tax/kr/tax-penalty": penalty,
    "/v1/law/kr/appeal-deadlines": appeals,
    "/v1/law/kr/inheritance-reserve": inheritance,
    "/v1/law/kr/auction-distribution": auction,
    "/v1/customs/kr/practice": customs,
    "/v1/labor/kr/workforce-check": workforce,
    "/v1/accounting/schedule": accounting,
    "/v1/law/kr/license-points": points,
    "/v1/realestate/kr/appraisal-compensation": appraisal,
    "/v1/ip/kr/deadlines": ip,
    "/v1/tax/kr/vat-credits": vat,
    "/v1/law/kr/franchise-contract": franchise,
    "/v1/law/kr/apartment-management": apartment,
    "/v1/accounting/deferred-tax": deferred,
    "/v1/accounting/audit-plan": auditPlan,
    "/v1/labor/kr/injury-disability": disability,
    "/v1/law/kr/court-deposit": deposit,
    "/v1/realestate/kr/self-registration": registration,
    "/v1/immigration/kr/f27-points": f27,
  };
}
