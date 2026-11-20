// 전문직 전수조사 계산기 14종 핸들러 (2026-11-21). 스키마: census-spec.mjs. 계산은 tools-oiyo와 같은 vendored 파일이에요.
// 입력 모양만 맞추고 계산은 하지 않아요. 결과에 asOf·page·note를 붙여요.
import { APPEAL_AS_OF, APPEAL_NOTE, APPEAL_RULES, appealDue, appealsFrom } from "./vendor/tools-tax/kr-appeal-deadlines-2026.mjs";
import { CORP_TAX_AS_OF, CORP_TAX_NOTE, corpTax } from "./vendor/tools-tax/kr-corp-tax-2026.mjs";
import { PENALTY_AS_OF, PENALTY_NOTE, nextReductionStep, taxPenalty } from "./vendor/tools-tax/kr-tax-penalty-2026.mjs";
import { AUCTION_AS_OF, AUCTION_NOTE, auctionDistribution } from "./vendor/tools-tax/kr-auction-distribution-2026.mjs";
import { INHERIT_AS_OF, INHERIT_NOTE, legalHeirs, reserveShortfall } from "./vendor/tools-tax/kr-inheritance-share-2026.mjs";
import { CUSTOMS_AS_OF, CUSTOMS_NOTE, TRAVELER_EXTRA, directBundles, rvc, simpleRefund, travelerTax } from "./vendor/tools-tax/kr-customs-pack-2026.mjs";
import { APPRAISAL_AS_OF, APPRAISAL_NOTE, businessLoss, costApproach, incomeApproach, landCompensation, relocationAllowance, salesComparison } from "./vendor/tools-tax/kr-appraisal-2026.mjs";
import { POINTS_AS_OF, POINTS_NOTE, licenseStatus, suspensionToSurcharge, violationPoints } from "./vendor/tools-tax/kr-license-points-2026.mjs";
import { ACCT_AS_OF, ACCT_NOTE, bondSchedule, depreciation, externalAuditCheck, leaseSchedule } from "./vendor/tools-tax/kr-accounting-schedules-2026.mjs";
import { VAT_CREDIT_AS_OF, VAT_CREDIT_NOTE, badDebtCredit, cardSalesCredit, deemedInputCredit } from "./vendor/tools-tax/kr-vat-credits-2026.mjs";
import { IP_AS_OF, IP_NOTE, ipDeadlines } from "./vendor/tools-tax/kr-ip-deadlines-2026.mjs";
import { WORKFORCE_AS_OF, WORKFORCE_NOTE, checkSchedule, headcountThresholds } from "./vendor/tools-tax/kr-workforce-2026.mjs";
import { FH_AS_OF, FH_NOTE, apartmentSchedule, franchiseCheck } from "./vendor/tools-tax/kr-franchise-housing-2026.mjs";

const TOOLS = "https://tools.oiyo.net/ko/";
const seoulToday = () => new Date(Date.now() + 9 * 3_600_000).toISOString().slice(0, 10);

/** 모드마다 꼭 필요한 입력이 빠졌으면 400으로 돌려보내요(추정하지 않아요). */
function need(InputError, i, keys, mode) {
  const missing = keys.filter((k) => i[k] === undefined || i[k] === null || i[k] === "");
  if (missing.length) throw new InputError(missing.map((k) => `${k}: required for ${mode}`));
}

export function makeCensusHandlers(InputError) {
  function appeal(i) {
    const today = i.today ?? seoulToday();
    if (!i.from) return { asOf: APPEAL_AS_OF, rules: APPEAL_RULES.map(({ rule, ...r }) => r), page: `${TOOLS}appeal-deadline-calculator/`, note: APPEAL_NOTE };
    if (i.key) {
      const r = appealDue(i.key, i.from, today);
      if (!r) throw new InputError([`key: one of the rule keys (call without from to list them)`]);
      const { rule, ...rest } = r;
      return { asOf: APPEAL_AS_OF, from: i.from, deadlines: [rest], page: `${TOOLS}appeal-deadline-calculator/`, note: APPEAL_NOTE };
    }
    const list = appealsFrom(i.from, today, i.domain).map(({ rule, ...rest }) => rest);
    if (i.domain && !list.length) throw new InputError([`domain: one of ${[...new Set(APPEAL_RULES.map((r) => r.domain))].join(", ")}`]);
    return { asOf: APPEAL_AS_OF, from: i.from, deadlines: list, page: `${TOOLS}appeal-deadline-calculator/`, note: APPEAL_NOTE };
  }

  function corporate(i) {
    return { asOf: CORP_TAX_AS_OF, ...corpTax(i), page: `${TOOLS}corporate-tax-adjustment-calculator/`, note: CORP_TAX_NOTE };
  }

  function penalty(i) {
    const today = i.today ?? seoulToday();
    const { today: _t, ...input } = i;
    const r = taxPenalty(input, today);
    const next = i.kind === "withholding" ? null : nextReductionStep(i.kind, i.due, i.filed ?? today);
    return { asOf: PENALTY_AS_OF, ...r, nextReduction: next, page: `${TOOLS}tax-penalty-calculator/`, note: PENALTY_NOTE };
  }

  function auction(i) {
    const { today, ...input } = i;
    const tenants = (input.tenants ?? []).map((t, n) => ({ label: t.label ?? `임차인 ${n + 1}`, ...t }));
    const claims = (input.claims ?? []).map((c, n) => ({ label: c.label ?? `${c.kind === "tax" ? "조세" : "저당권"} ${n + 1}`, ...c }));
    return { asOf: AUCTION_AS_OF, ...auctionDistribution({ ...input, tenants, claims }, today ?? seoulToday()), page: `${TOOLS}auction-distribution-calculator/`, note: AUCTION_NOTE };
  }

  function inheritance(i) {
    const family = { spouse: i.spouse, children: i.children, parents: i.parents ?? 0, siblings: i.siblings ?? 0 };
    const ids = new Set(legalHeirs(family).heirs.map((h) => h.id));
    const problems = [];
    for (const field of ["gifts", "bequests"]) {
      const obj = i[field] ?? {};
      const keys = Object.keys(obj);
      if (keys.length > 40) problems.push(`${field}: at most 40 heirs`);
      for (const k of keys) {
        if (!ids.has(k)) problems.push(`${field}.${k.slice(0, 20)}: heir id must be one of ${[...ids].join(", ") || "(no heirs)"}`);
        else if (typeof obj[k] !== "number" || !Number.isFinite(obj[k]) || obj[k] < 0) problems.push(`${field}.${k}: a non-negative KRW amount`);
      }
    }
    if (problems.length) throw new InputError(problems);
    const r = reserveShortfall({ family, estate: i.estate, debts: i.debts, gifts: i.gifts, bequests: i.bequests, thirdGifts: i.thirdGifts, thirdBequests: i.thirdBequests, death: i.death });
    return { asOf: INHERIT_AS_OF, ...r, page: `${TOOLS}inheritance-share-calculator/`, note: INHERIT_NOTE };
  }

  function customs(i) {
    const base = { asOf: CUSTOMS_AS_OF, mode: i.mode, page: `${TOOLS}customs-practice-calculator/`, note: CUSTOMS_NOTE };
    if (i.mode === "traveler") {
      need(InputError, i, ["totalUsd", "fx"], "mode=traveler");
      return { ...base, ...travelerTax({ totalUsd: i.totalUsd, fx: i.fx, rate: i.rate, selfReport: i.selfReport, caught: i.caught }), alsoExempt: TRAVELER_EXTRA };
    }
    if (i.mode === "direct") {
      need(InputError, i, ["orders", "fx"], "mode=direct");
      if (!i.orders.length) throw new InputError(["orders: at least one order"]);
      const orders = i.orders.map((o, n) => ({ label: o.label ?? `주문 ${n + 1}`, ...o }));
      return { ...base, days: directBundles(orders, i.fx, i.dutyRate ?? 0.08) };
    }
    if (i.mode === "rvc") {
      need(InputError, i, ["value", "threshold", "method"], "mode=rvc");
      if (i.method === "build-down") need(InputError, i, ["nonOriginating"], "method=build-down");
      else need(InputError, i, ["originating"], "method=build-up");
      return { ...base, ...rvc({ value: i.value, nonOriginating: i.nonOriginating ?? 0, originating: i.originating, threshold: i.threshold, method: i.method }) };
    }
    need(InputError, i, ["fobKrw", "perTenThousand"], "mode=refund");
    return { ...base, ...simpleRefund({ fobKrw: i.fobKrw, perTenThousand: i.perTenThousand, accepted: i.accepted }) };
  }

  function appraisal(i) {
    const base = { asOf: APPRAISAL_AS_OF, mode: i.mode, page: `${TOOLS}appraisal-compensation-calculator/`, note: APPRAISAL_NOTE };
    switch (i.mode) {
      case "cost":
        need(InputError, i, ["replacementCost", "usefulLife", "age"], "mode=cost");
        return { ...base, ...costApproach({ replacementCost: i.replacementCost, usefulLife: i.usefulLife, age: i.age, residualRate: i.residualRate, land: i.land }) };
      case "sales":
        need(InputError, i, ["subjectArea", "comps"], "mode=sales");
        if (!i.comps.length) throw new InputError(["comps: at least one comparable"]);
        return { ...base, ...salesComparison(i.subjectArea, i.comps) };
      case "income":
        need(InputError, i, ["grossIncome", "capRate"], "mode=income");
        return { ...base, ...incomeApproach({ grossIncome: i.grossIncome, vacancy: i.vacancy, expenses: i.expenses, capRate: i.capRate }) };
      case "land":
        need(InputError, i, ["officialPrice", "area"], "mode=land");
        return { ...base, ...landCompensation({ officialPrice: i.officialPrice, area: i.area, landChange: i.landChange, regional: i.regional, individual: i.individual, other: i.other }) };
      case "business":
        need(InputError, i, ["annualProfit", "kind"], "mode=business");
        return { ...base, ...businessLoss({ annualProfit: i.annualProfit, kind: i.kind, months: i.months, fixedCosts: i.fixedCosts, moving: i.moving, saleLoss: i.saleLoss }) };
      default:
        need(InputError, i, ["monthlySpending"], "mode=relocation");
        return { ...base, ...relocationAllowance(i.monthlySpending, !!i.tenant) };
    }
  }

  function license(i) {
    const base = { asOf: POINTS_AS_OF, mode: i.mode, page: `${TOOLS}license-points-calculator/`, note: POINTS_NOTE };
    if (i.mode === "surcharge") {
      need(InputError, i, ["perDay"], "mode=surcharge");
      if (!i.days && !i.monthsSuspended) throw new InputError(["days or monthsSuspended: the suspension length for mode=surcharge"]);
      return { ...base, ...suspensionToSurcharge({ days: i.days, months: i.monthsSuspended, perDay: i.perDay, cap: i.cap }) };
    }
    need(InputError, i, ["events"], "mode=status");
    const problems = [];
    const events = i.events.map((e, n) => {
      if (e.violation) {
        const pts = violationPoints(e.violation, !!e.schoolZone);
        return { date: e.date, points: pts, label: e.label ?? e.violation };
      }
      if (e.points === undefined) problems.push(`events[${n}]: points or violation`);
      return { date: e.date, points: e.points ?? 0, label: e.label ?? "" };
    });
    if (problems.length) throw new InputError(problems);
    const asOf = i.asOf ?? seoulToday();
    return { ...base, events, ...licenseStatus(events, asOf, { mileage: i.mileage, education: i.education }), date: asOf };
  }

  function accounting(i) {
    const base = { asOf: ACCT_AS_OF, mode: i.mode, page: `${TOOLS}accounting-schedule-calculator/`, note: ACCT_NOTE };
    switch (i.mode) {
      case "depreciation":
        need(InputError, i, ["cost", "years", "method"], "mode=depreciation");
        return { ...base, ...depreciation(i.cost, i.residual ?? 0, i.years, i.method, i.firstMonths ?? 12) };
      case "lease":
        need(InputError, i, ["payment", "periods", "rate"], "mode=lease");
        return { ...base, ...leaseSchedule(i.payment, i.periods, i.rate, !!i.advance, i.directCost ?? 0) };
      case "bond":
        need(InputError, i, ["face", "couponRate", "marketRate", "periods"], "mode=bond");
        return { ...base, ...bondSchedule(i.face, i.couponRate, i.marketRate, i.periods) };
      default:
        need(InputError, i, ["assets", "liabilities", "revenue", "employees"], "mode=audit");
        return { ...base, ...externalAuditCheck({ listed: i.listed, llc: i.llc, assets: i.assets, liabilities: i.liabilities, revenue: i.revenue, employees: i.employees, members: i.members }) };
    }
  }

  function vatCredits(i) {
    const base = { asOf: VAT_CREDIT_AS_OF, mode: i.mode, page: `${TOOLS}vat-credit-calculator/`, note: VAT_CREDIT_NOTE };
    if (i.mode === "deemed") {
      need(InputError, i, ["type", "purchases", "taxBase"], "mode=deemed");
      return { ...base, ...deemedInputCredit({ type: i.type, purchases: i.purchases, taxBase: i.taxBase, corp: i.corp }) };
    }
    if (i.mode === "card") {
      need(InputError, i, ["cardSales", "priorYearSupply"], "mode=card");
      return { ...base, ...cardSalesCredit({ cardSales: i.cardSales, priorYearSupply: i.priorYearSupply, corp: i.corp, usedThisYear: i.usedThisYear, payable: i.payable }) };
    }
    need(InputError, i, ["amount", "supplied"], "mode=baddebt");
    return { ...base, ...badDebtCredit({ amount: i.amount, supplied: i.supplied, confirmed: i.confirmed }) };
  }

  function ip(i) {
    const { today, ...input } = i;
    return { asOf: IP_AS_OF, deadlines: ipDeadlines(input, today ?? seoulToday()), page: `${TOOLS}ip-deadline-calculator/`, note: IP_NOTE };
  }

  function workforce(i) {
    const base = { asOf: WORKFORCE_AS_OF, mode: i.mode, page: `${TOOLS}workforce-schedule-check/`, note: WORKFORCE_NOTE };
    if (i.mode === "headcount") {
      need(InputError, i, ["daily"], "mode=headcount");
      return { ...base, thresholds: headcountThresholds(i.daily) };
    }
    need(InputError, i, ["shifts"], "mode=schedule");
    if (!i.shifts.length) throw new InputError(["shifts: at least one shift"]);
    return { ...base, ...checkSchedule({ shifts: i.shifts, small: i.small, minor: i.minor }) };
  }

  function franchise(i) {
    const { today, ...input } = i;
    const t = today ?? seoulToday();
    return { asOf: FH_AS_OF, items: franchiseCheck(input).map((x) => ({ ...x, passed: !!x.date && x.date < t })), page: `${TOOLS}franchise-contract-check/`, note: FH_NOTE };
  }

  function apartment(i) {
    const { today, ...input } = i;
    return { asOf: FH_AS_OF, ...apartmentSchedule(input, today ?? seoulToday()), page: `${TOOLS}apartment-management-check/`, note: FH_NOTE };
  }

  return {
    "/v1/law/kr/appeal-deadline": appeal,
    "/v1/tax/kr/corporate-tax": corporate,
    "/v1/tax/kr/tax-penalty": penalty,
    "/v1/law/kr/auction-distribution": auction,
    "/v1/law/kr/inheritance-share": inheritance,
    "/v1/customs/kr/practice": customs,
    "/v1/real-estate/kr/appraisal-compensation": appraisal,
    "/v1/law/kr/license-points": license,
    "/v1/accounting/schedule": accounting,
    "/v1/tax/kr/vat-credits": vatCredits,
    "/v1/law/kr/ip-deadlines": ip,
    "/v1/labor/kr/workforce": workforce,
    "/v1/law/kr/franchise-contract": franchise,
    "/v1/law/kr/apartment-management": apartment,
  };
}
