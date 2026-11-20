// Business strategy endpoints for REST and MCP (2026-11-15).
// WHY: founders, management teams, bookkeepers and tax advisers asked for decision trees, project timelines,
// SWOT/BCG/positioning, unit economics, prioritisation and the Korean filing calendar. Formulas live in
// tools-oiyo src/lib/biz-strategy.ts and biz-checklist.ts (vendored, tested, same as the tools.oiyo.net
// pages). This file validates input against the tool schema in biz-tools-spec.mjs (the same schema MCP
// uses), refuses unknown inputs instead of guessing, and shapes the answer.
import {
  BIZ_AS_OF, BCG_LABEL, SWOT_STANCE, addDays, bcgMatrix, breakEven, compareOptions, deadlineProbability, evaluateTree,
  factorScore, ieMatrix, positioningMap, riceScores, runway, scheduleCpm, swotPosition, treeFromOptions, unitEconomics,
  weightedDecision,
} from "./vendor/tools-tax/biz-strategy.mjs";
import { AREA_LABEL, CHECKLIST_AS_OF, filterItems, taxCalendar, upcoming } from "./vendor/tools-tax/biz-checklist.mjs";
import {
  INFLUENCER_CHECKS, OPS_AS_OF, PMI_TEMPLATE, acquisitionCheck, campaignSupply, influencerDeal, marketEntry, materialSwitch, orderAllocation,
  proportionTest, qualityRecovery, rebateCheck, sampleSizePerGroup,
} from "./vendor/tools-tax/biz-ops.mjs";
import {
  WELFARE_AS_OF, averageDailyWage, breakEvenReturn, dbVsDc, injuryLeavePay, maternityLeavePay, monthlyRentCredit, spouseLeavePay,
  wageGuarantee, workChildCredit, ordinaryWage, fixedOvertimeCheck, longTermCareCopay,
  dismissalNoticePay, shutdownAllowance, reducedHoursPay, probationMinWage, leavePromotionSchedule, voluntaryQuitCheck, directPaymentCheck, youthRentSupport, housingLoanBest, specialSupplyCheck,
} from "./vendor/tools-tax/kr-welfare-2026.mjs";
import { HOME_TAX_AS_OF, comprehensiveRealEstateTax, rentalIncomeTax } from "./vendor/tools-tax/kr-home-tax-2026.mjs";
import { HOUSEHOLD_TAX_AS_OF, dependentsTax, majorShareholderTax, familyLoanGift, freeUseGift, lowPriceSale, commercialRentCheck, smeYouthReduction, yellowUmbrella, vatTypeCompare, businessCarExpense, overseasCompare, officetelHouseCount, ticketPresaleTax, inheritedValuation, filingDeadlines } from "./vendor/tools-tax/kr-household-tax-2026.mjs";
import { DISCLAIMER as LAW_DISCLAIMER, LAW_GUIDE_AS_OF, PROFESSIONS, SCOPE_MATRIX, TOPICS, findStatutes, intake, statuteUrl, suggestTopics } from "./vendor/tools-tax/kr-expert-guide-2026.mjs";
import { BIZ_ENDPOINTS, BIZ_TOOLS } from "./biz-tools-spec.mjs";
import { makePracticeHandlers } from "./practice.mjs";

export const BIZ_DISCLAIMER =
  "Decision support from the numbers you gave, not investment, legal or tax advice. Probabilities and estimates are yours; check filing dates with 홈택스 and statutes on law.go.kr.";
const TAX_DISCLAIMER =
  "Estimate for planning only, not tax advice or tax representation (세무사법 제2조 세무대리 아님). December fiscal year-end; confirm notices and extensions on 홈택스.";

const MAX_BODY = 65536;
const TREE_MAX_DEPTH = 12;
const TREE_MAX_NODES = 200;

class InputError extends Error {
  constructor(problems) {
    super("invalid_input");
    this.problems = problems;
  }
}

const SCHEMAS = Object.fromEntries(BIZ_TOOLS.map(({ function: f }) => [BIZ_ENDPOINTS[f.name].path, f.parameters]));
export const BIZ_PATHS = Object.keys(SCHEMAS);

// JSON Schema subset used by biz-tools-spec.mjs. Query strings (GET) are coerced to numbers/booleans.
function check(schema, raw, name, problems, coerce) {
  if (schema.type === "object") {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) { problems.push(`${name}: an object`); return undefined; }
    if (!schema.properties) return raw;
    const out = {};
    for (const key of Object.keys(raw)) if (!Object.hasOwn(schema.properties, key)) problems.push(`${name ? `${name}.` : ""}${key}: unknown input`);
    for (const [key, prop] of Object.entries(schema.properties)) {
      const path = name ? `${name}.${key}` : key;
      const value = raw[key];
      if (value === undefined || value === null || value === "") {
        if ((schema.required || []).includes(key)) problems.push(`${path}: required`);
        continue;
      }
      out[key] = check(prop, value, path, problems, coerce);
    }
    return out;
  }
  if (schema.type === "array") {
    if (!Array.isArray(raw)) { problems.push(`${name}: an array`); return undefined; }
    if (schema.minItems !== undefined && raw.length < schema.minItems) problems.push(`${name}: at least ${schema.minItems} item(s)`);
    if (schema.maxItems !== undefined && raw.length > schema.maxItems) { problems.push(`${name}: at most ${schema.maxItems} items`); return undefined; }
    return raw.map((v, i) => check(schema.items, v, `${name}[${i}]`, problems, coerce));
  }
  if (schema.type === "boolean") {
    if (raw === true || (coerce && raw === "true")) return true;
    if (raw === false || (coerce && raw === "false")) return false;
    problems.push(`${name}: true or false`);
    return undefined;
  }
  if (schema.type === "string") {
    if (typeof raw !== "string") { problems.push(`${name}: a string`); return undefined; }
    if (schema.enum && !schema.enum.includes(raw)) problems.push(`${name}: one of ${schema.enum.join(", ")}`);
    if (raw.length > (schema.maxLength ?? 200)) problems.push(`${name}: at most ${schema.maxLength ?? 200} characters`);
    if (schema.pattern && !new RegExp(schema.pattern).test(raw)) problems.push(`${name}: format ${schema.description ?? schema.pattern}`);
    return raw;
  }
  const value = coerce && typeof raw === "string" && raw.trim() !== "" ? Number(raw) : raw;
  if (typeof value !== "number" || !Number.isFinite(value) || Math.abs(value) > Number.MAX_SAFE_INTEGER) {
    problems.push(`${name}: a finite number`);
    return undefined;
  }
  if (schema.type === "integer" && !Number.isInteger(value)) problems.push(`${name}: a whole number`);
  if (schema.minimum !== undefined && value < schema.minimum) problems.push(`${name}: ≥ ${schema.minimum}`);
  if (schema.maximum !== undefined && value > schema.maximum) problems.push(`${name}: ≤ ${schema.maximum}`);
  return value;
}

export function parseBizInput(path, raw, coerce = false) {
  const problems = [];
  const input = check(SCHEMAS[path], raw, "", problems, coerce);
  if (problems.length) throw new InputError(problems);
  return input;
}

const unique = (values, name) => {
  const seen = new Set();
  const dup = values.filter((v) => (seen.has(v) ? true : (seen.add(v), false)));
  return dup.length ? [`${name}: names must be unique (${[...new Set(dup)].join(", ")})`] : [];
};

// Full trees are free-form JSON, so they are checked here: kinds, labels, probabilities, depth and size.
function readTree(raw) {
  const problems = [];
  let count = 0;
  const node = (n, path, depth) => {
    if (++count > TREE_MAX_NODES) { if (count === TREE_MAX_NODES + 1) problems.push(`tree: at most ${TREE_MAX_NODES} nodes`); return null; }
    if (depth > TREE_MAX_DEPTH) { problems.push(`${path}: at most ${TREE_MAX_DEPTH} levels`); return null; }
    if (!n || typeof n !== "object" || Array.isArray(n)) { problems.push(`${path}: a node object`); return null; }
    for (const key of Object.keys(n)) if (!["id", "label", "kind", "value", "branches"].includes(key)) problems.push(`${path}.${key}: unknown input`);
    const label = n.label ?? "";
    if (typeof label !== "string" || label.length > 120) problems.push(`${path}.label: a string up to 120 characters`);
    const id = typeof n.id === "string" && n.id.length <= 40 ? n.id : `n${count}`;
    if (n.kind === "outcome") {
      if (typeof n.value !== "number" || !Number.isFinite(n.value)) problems.push(`${path}.value: a finite number`);
      if (n.branches !== undefined) problems.push(`${path}.branches: outcome nodes have no branches`);
      return { id, label, kind: "outcome", value: n.value };
    }
    if (n.kind !== "decision" && n.kind !== "chance") { problems.push(`${path}.kind: one of decision, chance, outcome`); return null; }
    if (!Array.isArray(n.branches) || n.branches.length < 1 || n.branches.length > 10) { problems.push(`${path}.branches: 1-10 branches`); return null; }
    const branches = n.branches.map((b, i) => {
      const bp = `${path}.branches[${i}]`;
      if (!b || typeof b !== "object" || Array.isArray(b)) { problems.push(`${bp}: a branch object`); return null; }
      for (const key of Object.keys(b)) if (!["label", "prob", "cost", "node"].includes(key)) problems.push(`${bp}.${key}: unknown input`);
      if (typeof (b.label ?? "") !== "string" || (b.label ?? "").length > 120) problems.push(`${bp}.label: a string up to 120 characters`);
      if (n.kind === "chance" && (typeof b.prob !== "number" || b.prob < 0 || b.prob > 1)) problems.push(`${bp}.prob: a probability 0..1`);
      if (n.kind === "decision" && b.prob !== undefined) problems.push(`${bp}.prob: only chance branches take prob`);
      if (b.cost !== undefined && (typeof b.cost !== "number" || !Number.isFinite(b.cost))) problems.push(`${bp}.cost: a finite number`);
      const child = node(b.node, `${bp}.node`, depth + 1);
      return { label: b.label ?? "", ...(b.prob !== undefined && { prob: b.prob }), ...(b.cost !== undefined && { cost: b.cost }), node: child };
    });
    return { id, label, kind: n.kind, branches };
  };
  const tree = node(raw, "tree", 0);
  if (problems.length) throw new InputError(problems);
  return tree;
}

function decisionTree(i) {
  if (!i.options === !i.tree) throw new InputError(["options or tree: give exactly one"]);
  if (i.options) {
    const problems = unique(i.options.map((o) => o.label), "options");
    if (problems.length) throw new InputError(problems);
    const comparison = compareOptions(i.options);
    return {
      asOf: BIZ_AS_OF, mode: "options",
      result: evaluateTree(treeFromOptions(i.question ?? "", i.options)),
      comparison: {
        options: i.options.map((o, k) => ({ label: o.label, expectedValue: comparison.evs[k], breakevenSuccessProb: comparison.breakeven[k] })),
        best: i.options[comparison.best].label,
      },
      method: "Expected value rollback: chance node = Σ prob × value, decision node = best branch minus its cost. breakevenSuccessProb is the success probability at which that option would tie the best of the others.",
      disclaimer: BIZ_DISCLAIMER,
    };
  }
  return {
    asOf: BIZ_AS_OF, mode: "tree", result: evaluateTree(readTree(i.tree)),
    method: "Expected value rollback; chance probabilities that do not sum to 1 are rescaled and reported in warnings.",
    disclaimer: BIZ_DISCLAIMER,
  };
}

function criticalPath(i) {
  const ids = i.tasks.map((t) => t.id);
  const problems = unique(ids, "tasks id");
  const known = new Set(ids);
  for (const t of i.tasks) for (const d of t.deps ?? []) {
    if (d === t.id) problems.push(`tasks ${t.id}: depends on itself`);
    else if (!known.has(d)) problems.push(`tasks ${t.id}: unknown dependency '${d}'`);
  }
  if (problems.length) throw new InputError(problems);
  const schedule = scheduleCpm(i.tasks);
  const cycle = schedule.errors.find((e) => e.includes("순환"));
  if (cycle) throw new InputError([`tasks: dependencies form a cycle (${cycle.split(": ")[1]?.split(". ")[0] ?? ""})`]);
  const dates = i.startDate
    ? schedule.tasks.map((t) => ({ id: t.id, start: addDays(i.startDate, t.es, i.workdaysOnly), finish: addDays(i.startDate, Math.max(t.es, t.ef - 1), i.workdaysOnly), latestFinish: addDays(i.startDate, Math.max(t.ls, t.lf - 1), i.workdaysOnly) }))
    : null;
  return {
    asOf: BIZ_AS_OF, result: schedule,
    deadline: i.deadline ?? null,
    onTimeProbability: i.deadline !== undefined ? deadlineProbability(schedule.duration, schedule.stdDev, i.deadline) : null,
    dates, finishDate: i.startDate ? addDays(i.startDate, Math.max(0, schedule.duration - 1), i.workdaysOnly) : null,
    method: "CPM forward/backward pass on PERT expected durations (o + 4m + p) / 6; on-time probability uses a normal approximation over the critical path variance. Days are counted from day 0.",
    disclaimer: BIZ_DISCLAIMER,
  };
}

function swot(i) {
  const position = swotPosition(i.items);
  const ife = factorScore(i.items.filter((x) => x.kind === "S" || x.kind === "W"));
  const efe = factorScore(i.items.filter((x) => x.kind === "O" || x.kind === "T"));
  return {
    asOf: BIZ_AS_OF, result: { ...position, stanceLabel: SWOT_STANCE[position.stance], ife, efe, ie: ieMatrix(ife.total, efe.total) },
    method: "Stance from impact totals (S − W, O − T). IFE/EFE: weights normalised to 1, rating 1-4, 2.5 = average; IE matrix bands ≥ 3 strong, ≥ 2 average.",
    disclaimer: BIZ_DISCLAIMER,
  };
}

function bcg(i) {
  const problems = unique(i.units.map((u) => u.name), "units");
  if (problems.length) throw new InputError(problems);
  const result = bcgMatrix(i.units, i.growthThreshold ?? 0.1, i.shareThreshold ?? 1);
  return {
    asOf: BIZ_AS_OF, result: { ...result, rows: result.rows.map((r) => ({ ...r, label: BCG_LABEL[r.quadrant].name, move: BCG_LABEL[r.quadrant].move })) },
    method: "Relative share = our share ÷ largest rival share; quadrant by growthThreshold and shareThreshold.",
    disclaimer: BIZ_DISCLAIMER,
  };
}

function positioning(i) {
  const problems = unique(i.brands.map((b) => b.name), "brands");
  if ((i.idealX === undefined) !== (i.idealY === undefined)) problems.push("idealX and idealY: give both or neither");
  if (problems.length) throw new InputError(problems);
  const ideal = i.idealX !== undefined ? { x: i.idealX, y: i.idealY } : undefined;
  return {
    asOf: BIZ_AS_OF, result: positioningMap(i.brands, ideal),
    method: "Euclidean distance on the -10..10 map; the gap is the largest circle with no brand inside the inner 85% of the map (weighted toward the ideal point when given).",
    disclaimer: BIZ_DISCLAIMER,
  };
}

const GROUPS = {
  unitEconomics: ["arpu", "grossMargin", "monthlyChurn", "cac"],
  runway: ["cash", "revenue", "revenueGrowth", "expenses", "expenseGrowth"],
  breakEven: ["fixedCost", "price", "variableCost"],
};

function economics(i) {
  const given = Object.entries(GROUPS).filter(([, keys]) => keys.some((k) => i[k] !== undefined));
  const problems = [];
  if (!given.length) problems.push(`give one complete group: ${Object.entries(GROUPS).map(([g, k]) => `${g} (${k.join(", ")})`).join("; ")}`);
  for (const [group, keys] of given) {
    const missing = keys.filter((k) => i[k] === undefined);
    if (missing.length) problems.push(`${group}: also give ${missing.join(", ")}`);
  }
  if (problems.length) throw new InputError(problems);
  const has = (g) => given.some(([name]) => name === g);
  return {
    asOf: BIZ_AS_OF,
    unitEconomics: has("unitEconomics") ? unitEconomics(i) : null,
    runway: has("runway") ? runway(i) : null,
    breakEven: has("breakEven") ? breakEven(i.fixedCost, i.price, i.variableCost) : null,
    method: "LTV = monthly contribution × (1 + r) ÷ (r + churn), r = annual discount ÷ 12; payback = CAC ÷ monthly contribution. Runway compounds monthly growth; default alive = break-even before cash runs out. null means infinite (e.g. no churn).",
    disclaimer: BIZ_DISCLAIMER,
  };
}

function priorities(i) {
  if (i.method === "rice") {
    if (!i.items?.length) throw new InputError(["items: required for method rice"]);
    return {
      asOf: BIZ_AS_OF, method: "rice", result: riceScores(i.items),
      formula: "score = reach × impact × confidence ÷ effort",
      disclaimer: BIZ_DISCLAIMER,
    };
  }
  const problems = [];
  if (!i.criteria?.length) problems.push("criteria: required for method weighted");
  if (!i.options?.length || i.options.length < 2) problems.push("options: at least 2 for method weighted");
  if (problems.length) throw new InputError(problems);
  problems.push(...unique(i.options.map((o) => o.name), "options"));
  for (const o of i.options) if (o.scores.length !== i.criteria.length) problems.push(`options ${o.name}: ${i.criteria.length} scores, one per criterion`);
  if (problems.length) throw new InputError(problems);
  return {
    asOf: BIZ_AS_OF, method: "weighted", result: weightedDecision(i.criteria, i.options),
    formula: "total = Σ weight × score (weights normalised to 1). flips: the weight a criterion would need (others rescaled) for second place to tie first; null = cannot flip.",
    disclaimer: BIZ_DISCLAIMER,
  };
}

function businessCalendar(i) {
  const { events, holidaysKnown } = taxCalendar(i.year, i);
  const checklist = i.stage || i.role
    ? filterItems({ stages: i.stage ? [i.stage] : [], roles: i.role ? [i.role] : [] }).map((x) => ({ ...x, areaLabel: AREA_LABEL[x.area] }))
    : null;
  return {
    asOf: CHECKLIST_AS_OF, year: i.year, isEstimate: true,
    events, upcoming: i.from ? upcoming(events, i.from) : null,
    holidaysKnown,
    checklist: checklist && { mustDo: checklist.filter((x) => x.kind === "do"), mustNotDo: checklist.filter((x) => x.kind === "dont") },
    basis: [
      "국세기본법 제5조(기한이 토요일·일요일·공휴일·대체공휴일·근로자의 날이면 다음 날)",
      "각 일정의 basis에 신고·납부 근거 조문",
    ],
    notCovered: [
      "사업연도가 12월 말이 아닌 법인, 연장·납부기한 직권연장, 개별 고지서 금액",
      holidaysKnown ? "임시공휴일은 지정되면 바뀔 수 있어요" : `${i.year}년 공휴일 목록이 아직 없어 토·일만 반영했어요`,
    ],
    disclaimer: TAX_DISCLAIMER,
  };
}

// ───── 2026-11-16: 운영 문제 8유형 ─────
const OPS_NOTE = "Each result names the departments affected; amounts above contract (hold) and missing data are reported for a person to approve, never auto-resolved.";
const ops = (result, method, extra = {}) => ({ asOf: OPS_AS_OF, result, method, ...extra, note: OPS_NOTE, disclaimer: BIZ_DISCLAIMER });

function campaign(i) {
  return ops(campaignSupply(i), "Weekly balance: stock + capacity − demand. Extra production x per week from week lead+1 is the smallest x with cumulative supply ≥ cumulative demand + safety stock in every week.");
}
function influencer(i) {
  return ops(influencerDeal(i), "orders = views × clickRate × conversionRate; contribution = revenue × grossMargin − fee − performance fee. Withholding: 사업소득 3% + local 10% (소득세법 제129조), 기타소득 20% after 60% expenses + local (8.8%).", { checklist: INFLUENCER_CHECKS });
}
function quality(i) {
  const problems = unique(i.customers.map((c) => c.name), "customers");
  if (problems.length) throw new InputError(problems);
  return ops(qualityRecovery(i), "Recall scope costs use recall cost for units in market and remake cost for units replaced. Allocation rules: priority, highest penalty first, pro rata; cheapestRule has the lowest total penalty.", { basis: ["화장품법 제5조의2(위해화장품 회수 의무): safety issues follow the statutory recall regardless of cost"] });
}
function materials(i) {
  const problems = unique(i.candidates.map((c) => c.name), "candidates");
  if (problems.length) throw new InputError(problems);
  return ops(materialSwitch(i), "Cost and speed are rescaled 1-5 across candidates (cheapest / fastest = 5); quality and supply use the given 1-5 scores; total = weighted average.");
}
function bigOrder(i) {
  const problems = unique(i.existing.map((o) => o.name), "existing");
  if (i.newOrder.minQty !== undefined && i.newOrder.minQty > i.newOrder.qty) problems.push("newOrder.minQty: at most newOrder.qty");
  if (problems.length) throw new InputError(problems);
  return ops(orderAllocation(i), "Existing orders are filled by locked first, then by margin + penalty per unit; profit = delivered margin − shortfall penalties + new order margin − overtime cost.");
}
function marketTest(i) {
  const planGiven = i.baseline !== undefined || i.lift !== undefined;
  const testKeys = ["convA", "nA", "convB", "nB"];
  const testGiven = testKeys.some((k) => i[k] !== undefined);
  const problems = [];
  if (!planGiven && !testGiven && !i.entry) problems.push("give baseline+lift, convA+nA+convB+nB, or entry");
  if (planGiven && (i.baseline === undefined || i.lift === undefined)) problems.push("baseline and lift: give both");
  if (testGiven && testKeys.some((k) => i[k] === undefined)) problems.push(`A/B test: give ${testKeys.join(", ")}`);
  if (testGiven && (i.convA > i.nA || i.convB > i.nB)) problems.push("conversions cannot exceed visitors");
  if (problems.length) throw new InputError(problems);
  return ops({
    sampleSizePerGroup: planGiven ? sampleSizePerGroup(i.baseline, i.lift, 0.05, i.power ?? 0.8) : null,
    test: testGiven ? { ...proportionTest(i.convA, i.nA, i.convB, i.nB), significantAt5pct: proportionTest(i.convA, i.nA, i.convB, i.nB).pValue < 0.05 } : null,
    entry: i.entry ? marketEntry(i.entry) : null,
  }, "Two-proportion sample size (two-sided alpha 0.05) and pooled z-test. Entry: go if payback ≤ 12 months, extend if ≤ 24, otherwise stop.");
}
function rebates(i) {
  const problems = unique(i.partners.map((p) => p.name), "partners");
  if (problems.length) throw new InputError(problems);
  return ops(rebateCheck(i), "Tier by period sales (or group sales when aggregation is allowed); due = floor(sales × rate). Flags: block = request above contract, review = below contract, related-party rate above the unrelated range, or a group that would change tier if combined.");
}
function acquisition(i) {
  return ops(acquisitionCheck(i), "New shares = price × stock ÷ share price; interest after tax = price × (1 − stock) × rate × (1 − tax); synergy ramps linearly; payback counts target income + after-tax synergy − interest against price + after-tax integration cost.", { pmiTemplate: PMI_TEMPLATE, basis: ["독점규제 및 공정거래에 관한 법률 제11조(기업결합 신고) may apply"] });
}

// ───── 2026-11-16: 생활 지원금·노동권 6종 ─────
const WELFARE_DISCLAIMER =
  "Estimate for planning only. Final amounts are decided by 국세청, 고용센터 and 근로복지공단. Free help: 고용노동부 1350, 대한법률구조공단 132, 근로복지공단 1588-0075, 국세청 126.";
const TOOLS_KO = "https://tools.oiyo.net/ko/";
const welfare = (result, method, basis, apply, page) => ({ asOf: WELFARE_AS_OF, result, method, basis, apply, page: `${TOOLS_KO}${page}/`, disclaimer: WELFARE_DISCLAIMER });

function workChild(i) {
  return welfare(workChildCredit(i), "EITC: phase-in to the household maximum, flat, then linear phase-out to the income cap. CTC per child: 1M KRW to the flat end (21M single earner / 25M dual), then down to 500K just below 70M. Assets ≥ 170M → 50%, ≥ 240M → 0; late filing 95%. A household with children under 18 counts as oneEarner, not single.",
    ["조세특례제한법 제100조의3·제100조의5(근로장려금)", "제100조의28·제100조의29(자녀장려금)"],
    ["Regular application May 1-31 (홈택스, 손택스, ARS 1544-9944); wage-only earners may apply half-yearly in March and September", "Late application to November 30 at 95%", "Usually paid late August"],
    "work-child-incentive-calculator");
}
function maternity(i) {
  const kind = i.kind ?? "single";
  return welfare({ maternity: maternityLeavePay({ ...i, kind }), spouse: spouseLeavePay(i.monthlyWage, i.priorityFirm) },
    "Daily = monthly ordinary wage ÷ 30 (minimum wage floor 2,156,880 KRW/month). Insurance pays min(daily, cap ÷ days) for all days at priority-support employers, or only the last 30 (multiple 45, premature 40) days at large employers; the first 60 (75) days are paid leave the employer owes in full.",
    ["근로기준법 제74조", "남녀고용평등법 제18조·제18조의2", "고용보험법 제75조·제76조", "고용노동부고시 제2026-67호"],
    ["Employer files the leave confirmation with the job centre", "Apply on 고용24 from 1 month after leave starts (large employers: after 60 days), within 12 months after leave ends", "Needs 180 insured days before leave ends"],
    "maternity-leave-pay-calculator");
}
function guarantee(i) {
  return welfare(wageGuarantee(i), "Insolvency: per-month (severance per-year) cap by age at retirement × min(unpaid months, 6 — or 3 before 2026-08-20) plus the last 3 years of severance. Simple (retired): wages from the last 3 months up to 7M, severance up to 7M, total 10M. Simple (employed): wages up to 7M.",
    ["임금채권보장법 제7조·제7조의2", "시행령 제7조", "대지급금 상한액 고시(2026-08-20 개정)"],
    ["File an unpaid-wage petition with the labour office (1350)", "Simple payment: get the confirmation of unpaid wages, then a court order or judgment; start within 2 years after retirement and apply within 1 year of the final judgment", "Insolvency payment: apply to 근로복지공단 after the court decision or the labour office's recognition", "Free litigation help: 대한법률구조공단 132"],
    "unpaid-wage-guarantee-calculator");
}
function injury(i) {
  if (i.avgDailyWage === undefined && i.threeMonthWages === undefined) throw new InputError(["give avgDailyWage or threeMonthWages"]);
  const avg = i.avgDailyWage ?? averageDailyWage(i.threeMonthWages, i.calendarDays ?? 92, i.annualBonus ?? 0);
  return welfare({ avgDailyWage: Math.round(avg), ...injuryLeavePay({ avgDailyWage: avg, days: i.days }) },
    "70% of min(average daily wage, 268,299). If that is at or below 80% of the minimum compensation base (66,048), 90% of the average wage capped at 66,048, raised to the minimum wage (82,560) when lower. Treatment of 3 days or less pays nothing (employer owes 60% leave compensation).",
    ["산업재해보상보험법 제36조·제52조·제54조", "고용노동부고시 제2025-84호"],
    ["Apply for treatment (요양급여) with 근로복지공단; employer consent is not required", "Claim leave pay monthly with the doctor's note; claims expire after 3 years", "Not modelled: reduction from age 61 after 2 years of treatment, partial leave pay"],
    "industrial-accident-leave-pay-calculator");
}
function rent(i) {
  return welfare(monthlyRentCredit(i), "credit = min(rent paid, 10M) × 17% (salary ≤ 55M / comprehensive ≤ 45M) or 15% (≤ 80M / 70M), capped by tax before credit; local income tax falls by 10% of the credit.",
    ["조세특례제한법 제95조의2", "시행령 제95조"],
    ["Homeless head of household (or member when the head does not claim) on December 31; home ≤ 85㎡ or standard price ≤ 400M KRW; registered at the address", "Submit the lease and transfer records in year-end settlement; otherwise in May filing or a refund claim within 5 years"],
    "monthly-rent-tax-credit-calculator");
}
function pension(i) {
  const r = dbVsDc(i);
  return welfare({ ...r, breakEvenReturn: breakEvenReturn(i) }, "DB = monthly wage × (1 + growth)^yearsLeft × (served + left). DC = wage × served moved now, then each year balance × (1 + return) + that year's monthly wage. Nominal, pre-tax; retirement income tax is the same for the same amount.",
    ["근로자퇴직급여 보장법 제13조·제20조"],
    ["Check the company pension rules: switching DC back to DB is usually not allowed", "Consider switching before a wage-peak cut", "Guaranteed-only products can make DC worse than DB"],
    "retirement-pension-db-dc-calculator");
}
function ordinary(i) {
  return welfare(ordinaryWage(i), "Monthly ordinary wage = base + fixed allowances + annual regular bonus ÷ 12 (before the ruling: bonus left out when conditional). Hourly = monthly ÷ contracted hours. Premiums: overtime ×1.5, night +0.5, holiday ×1.5 (≤ 8 h) / ×2 (> 8 h); under 5 employees hours × 1.0 only.",
    ["근로기준법 제56조", "시행령 제6조", "대법원 2024. 12. 19. 선고 2020다247190·2023다302838 전원합의체 판결"],
    ["The ruling applies to wages from 2024-12-19 (earlier periods only in pending cases)", "Pay slips must show how overtime pay is calculated (since 2021)", "Unpaid differences: file a petition at labor.moel.go.kr or call 1350; claims expire after 3 years"],
    "ordinary-wage-calculator");
}
function fixedOt(i) {
  return welfare(fixedOvertimeCheck(i), "Hourly = pay excluding the fixed allowance ÷ contracted hours; statutory premium for actual hours (overtime ×1.5, night +0.5, holiday ×1.5 / ×2; under 5 employees ×1.0); shortfall = max(0, statutory − fixed) × min(months, 36).",
    ["근로기준법 제56조·제49조(3년)·제37조(퇴직 후 14일, 지연이자 20%)", "대법원 2008다6052"],
    ["Keep evidence of hours: entry logs, transit cards, message and e-mail times", "Ask the employer, then file an unpaid-wage petition (labor.moel.go.kr, 1350); no fee", "Where hours are measurable, a lump-sum wage contract can be void"],
    "fixed-overtime-pay-checker");
}
function cre(i) {
  return { ...welfare(comprehensiveRealEstateTax(i), "base = floor((Σ official prices − deduction) × 60%, 1,000); progressive rates; − property tax × (base × property-tax fair ratio × 0.4%) ÷ standard-rate property tax; × (1 − min(80%, age + holding credit)) for one-house; + 20% rural special tax. Year-on-year 150% cap and exclusions (registered rentals, temporary two houses, inherited houses) not modelled.",
    ["종합부동산세법 제8조·제9조", "시행령 제2조의4·제4조의3", "농어촌특별세법 제5조"],
    ["Notice from 국세청 in late November; pay December 1-15 (홈택스)", "Over 2.5M KRW: part may be paid within 6 months", "Joint-owned single house: apply for the one-house election September 16-30"],
    "comprehensive-real-estate-tax-calculator"), asOf: HOME_TAX_AS_OF };
}
function rentalTax(i) {
  return { ...welfare(rentalIncomeTax(i), "revenue = rent (+ deemed rent for 3+ houses); separate = (revenue × (1 − 60%/50%) − 4M/2M) × 14% when revenue ≤ 20M; comprehensive = basic income tax(other base + revenue × (1 − expense rate)) − basic income tax(other base); both + 10% local income tax.",
    ["소득세법 제12조·제25조·제64조의2", "시행령 제53조"],
    ["Business status report by February 10 (홈택스)", "Report in the May comprehensive income tax filing even when choosing separate taxation", "Unregistered rental business: 0.2% penalty of revenue may apply", "2026: two-house owners with a high-price house and deposits over 1.2B may owe deemed rent; confirm with the tax office"],
    "housing-rental-income-tax-calculator"), asOf: HOME_TAX_AS_OF };
}
function longTermCare(i) {
  return welfare(longTermCareCopay(i), "Home: min(use, grade limit) × 15% (× 0.6 or 0.4 with reductions, 0 for basic recipients) + use above the limit in full. Facility: daily rate × days × 20% (same reductions) + non-covered daily cost × days.",
    ["노인장기요양보험법 제40조", "시행령 제15조의8", "보건복지부고시 제2025-247호(2026년 장기요양급여비용)"],
    ["Apply for long-term care recognition at 국민건강보험공단 (1577-1000): 65+, or under 65 with a geriatric disease", "Assessment visit and doctor's note; a grade is issued in about 30 days", "Grades 3-5 need committee approval for facility care; the cognitive grade cannot use facilities"],
    "long-term-care-copay-calculator");
}
function dependents(i) {
  return { ...welfare(dependentsTax(i), "Each person: age rule by relation (disabled or basic-livelihood: any age), income test (wage only: total pay ≤ 5M; otherwise wage − earned income deduction + other income amount ≤ 1M), living together for siblings/grandchildren/foster children, no double claims. Tax with and without = year-end settlement (basic deductions 1.5M each, 70+ 1M, disabled 2M, single parent 1M / woman head 0.5M, child tax credit, estimated social insurance, no other deductions) incl. local income tax; perPerson = tax saved when that person is added last.",
    ["소득세법 제50조·제51조·제53조·제59조의2", "소득세법 시행령 제106조"],
    ["Claim in the January-February year-end settlement; ask family members for consent to share 홈택스 data", "Working couples: one person per dependant, usually the higher-rate earner", "Missed a dependant: file a correction claim (경정청구) within 5 years"],
    "dependent-deduction-checker"), asOf: HOUSEHOLD_TAX_AS_OF };
}
function majorStock(i) {
  return { ...welfare(majorShareholderTax(i), "Major if value at previous year-end ≥ 5B KRW or stake ≥ 1% / 2% / 4% (KOSPI / KOSDAQ / KONEX). Base = gain − 2.5M basic deduction; tax = base × 20% up to 300M + 25% above (non-SME under 1 year: 30% flat); + 10% local income tax. ifMajor = the tax if the seller were major; cutToAvoid = value to sell before year-end to fall under 5B (stake rule separate).",
    ["소득세법 제94조①3호·제103조·제104조①11호", "소득세법 시행령 제157조"],
    ["Preliminary return within 2 months after the end of the half-year of the sale (Jan-Jun sales: end of August; Jul-Dec: end of February)", "Final return in May of the next year", "Largest shareholders include related parties (spouse, lineal relatives) when testing the 5B line"],
    "stock-major-shareholder-tax-calculator"), asOf: HOUSEHOLD_TAX_AS_OF };
}

/* 노동권 묶음 A (2026-11-16) */
function dismissalNotice(i) {
  return welfare(dismissalNoticePay({ weeklyHours: 40, exception: "none", fivePlus: true, ...i }), "hourly = monthly ordinary wage ÷ monthly paid hours ((weekly + weekly/5) × 365/7/12, 40 h = 209); daily = hourly × min(8, weekly/5); amount = daily × 30 unless notice ≥ 30 days, service < 3 months or a 제26조 exception.",
    ["근로기준법 제26조·제27조·제28조·제49조", "시행령 별표 1", "시행규칙 별표(해고예고 예외)"],
    ["Ask the employer, then file an unpaid-wage petition at labor.moel.go.kr (1350); claims expire after 3 years", "Notice pay does not make the dismissal lawful; with 5+ employees file an unfair-dismissal remedy at the regional Labor Relations Commission within 3 months", "Free legal aid: 132"],
    "dismissal-notice-pay-calculator");
}
function shutdown(i) {
  return welfare(shutdownAllowance({ calendarDays: 92, paidDuringShutdown: 0, approvedReduction: false, fivePlus: true, ...i }), "avgDaily = 3-month wages ÷ calendar days; 70% option = (avgDaily × days − paid) × 0.7; ordinary option = ordinary daily (monthly × 12 ÷ 365) × days − paid, allowed only when 70% of average wage exceeds the ordinary wage; minimum = 0 with commission approval or under 5 employees.",
    ["근로기준법 제2조·제46조·제49조", "시행령 제26조·별표 1"],
    ["Paid on the regular payday; unpaid allowance is unpaid wages (labor.moel.go.kr, 1350)", "Employers can apply for employment retention support (고용유지지원금) at work24.go.kr", "Handling of weekly paid holidays during a shutdown can differ; confirm with 1350"],
    "shutdown-allowance-calculator");
}
function reducedHours(i) {
  return welfare(reducedHoursPay({ beforeHours: 40, ...i }), "first = clamp(wage, 0.5M, 2.5M) × min(10, cut) ÷ before; rest = clamp(wage × 0.8, 0.5M, 1.6M) × max(0, cut − 10) ÷ before; employer pay = wage × after ÷ before; valid only for 15-35 hours after.",
    ["고용보험법 제73조의2", "시행령 제104조의2(2026 상한 250만·160만 원)", "남녀고용평등법 제19조의2~제19조의4"],
    ["Child aged 12 or under (grade 6 or lower); 180+ insured days", "Ask the employer 30 days before; 1 year plus twice the unused parental leave (up to 3 years), in units of 1 month or more", "Apply at work24.go.kr from 1 month after the start, within 12 months after the end"],
    "reduced-hours-childcare-pay-calculator");
}
function probation(i) {
  return welfare(probationMinWage(i), "minimum = 10,320 × 0.9 = 9,288 KRW when contract ≥ 12 months or open-ended AND fewer than 3 months into probation AND not a simple manual job; otherwise 10,320. Shortfall = max(0, minimum − hourly) × monthly hours.",
    ["최저임금법 제5조②·제28조", "시행령 제3조", "고용노동부고시(단순노무업무)", "2026 최저임금 10,320원"],
    ["Ask the employer for the difference, then file a petition at labor.moel.go.kr (1350); claims expire after 3 years", "After 3 months of service, dismissal still needs 30 days' notice or notice pay (근로기준법 제26조)"],
    "probation-minimum-wage-checker");
}
function leavePromotion(i) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(i.periodEnd ?? "") || Number.isNaN(Date.parse(i.periodEnd))) throw new InputError(["periodEnd: a date YYYY-MM-DD"]);
  const steps = leavePromotionSchedule(i.kind, i.periodEnd);
  return welfare({ kind: i.kind, periodEnd: i.periodEnd, steps }, "Dates follow the wording of 제61조: the period ends at the end of periodEnd; 'N months before' counts back from the next day; 'within 10 days' includes the first day; 'by N months before' is the day before that point.",
    ["근로기준법 제60조·제61조", "시행령 별표 1"],
    ["Prompts and designations must be written and individual (e-mail or e-approval counts; group notices may not)", "If the worker comes to work on a designated day, the employer must clearly refuse the work, or leave pay is still owed", "If any step is missing, unused leave can be claimed as pay within 3 years"],
    "annual-leave-promotion-planner");
}

function voluntaryQuit(i) {
  return welfare(voluntaryQuitCheck(i), "Each chosen reason is matched to 별표 2; item 1 needs months ≥ 2, commuting ≥ 3 h round trip, family care ≥ 30 days + refused leave, health and pregnancy/childcare need refused leave. likely = a reason holds and insured days ≥ 180; check = something is missing; unlikely = no reason chosen.",
    ["고용보험법 제40조·제58조·제87조", "시행규칙 제101조②·별표 2(개정 2024. 7. 1.)"],
    ["Register as a job seeker and apply for eligibility at work24.go.kr with the evidence listed per reason", "Even if the separation code says personal reasons, the employment center can recognise a justified reason", "Benefits can only be paid within 12 months after leaving; an appeal (심사청구) is possible within 90 days"],
    "voluntary-quit-unemployment-checker");
}
function subcontractDirect(i) {
  return welfare(directPaymentCheck(i), "outstanding = work value − received from prime; eligible = ground holds (requests for items 1, 3, 4; 2+ missed installments for item 3) and no prime stop request; direct = min(outstanding, client's unpaid amount to prime); late interest = outstanding × 15.5% × days past 60 ÷ 365 (owed by the prime).",
    ["하도급거래 공정화에 관한 법률 제13조①③⑧·제14조", "공정거래위원회 지연이율 고시(연 15.5%)", "건설산업기본법 제35조"],
    ["Send the client a certified-mail request for direct payment with the contract, acceptance records and invoices", "Claim the rest and late interest from the prime; KFTC complaint or free subcontract mediation (한국공정거래조정원)", "Construction work: also check 건설산업기본법 제35조 and public-works payment systems"],
    "subcontract-direct-payment-checker");
}

function familyLoan(i) {
  return { ...welfare(familyLoanGift(i), "benefit = principal × 4.6% − principal × agreed rate; gift = benefit when ≥ 10M KRW a year (else 0), recomputed yearly; giftTax = progressive gift tax on (gift − deductionLeft) less 3% filing credit; zeroRateMaxPrincipal = largest interest-free principal under 10M; safeRate = 4.6% − 10M ÷ principal (agree a rate above it); lenderTax = interest received × 27.5%.",
    ["상속세 및 증여세법 제41조의4", "시행령 제31조의4", "시행규칙 제10조의5(적정이자율 4.6%)", "소득세법 제129조(비영업대금이익 25%)"],
    ["Write a loan agreement with principal, rate and repayment schedule; date-stamp it (notary or certified mail)", "Repay interest and principal by bank transfer on schedule and keep records", "If a gift arises, file within 3 months after the end of the month (hometax.go.kr)"],
    "family-loan-interest-checker"), asOf: HOUSEHOLD_TAX_AS_OF };
}
function freeUse(i) {
  return { ...welfare(freeUseGift(i), "fiveYear = value × 2% × Σ(1/1.1^n, n = 1..5) ≈ value × 7.58%; a gift when ≥ 100M KRW and not co-residing with the owner (valueLine ≈ 1.319B KRW); collateral benefit = loan × 4.6% − interest paid, a gift when ≥ 10M; tax = progressive gift tax after deductionLeft less 3% filing credit.",
    ["상속세 및 증여세법 제37조", "시행령 제27조", "시행규칙 제10조(연 2%)·제10조의5(4.6%)", "제43조(중복 시 큰 이익 하나)"],
    ["If taxable, file gift tax within 3 months after the end of the month free use started", "Living with the owner is excluded: keep resident registration and proof of living together", "Paying market rent by bank transfer removes the gift; the owner then reports rental income"],
    "parent-house-free-use-gift-checker"), asOf: HOUSEHOLD_TAX_AS_OF };
}
function lowPrice(i) {
  return { ...welfare(lowPriceSale(i), "diff = market − price; buyer gift when diff ≥ giftLine = min(30% × market, 300M), gift = diff − giftLine; seller recalculated at market value when diff ≥ transferLine = min(5% × market, 300M); noGiftAbove / noRecalcAbove = safe price thresholds.",
    ["상속세 및 증여세법 제35조①", "시행령 제26조", "소득세법 제101조①", "소득세법 시행령 제167조③", "상속세 및 증여세법 제44조(배우자·직계 양도 증여 추정)"],
    ["Get an appraisal or collect comparable sales as evidence of market value before signing", "Pay the price by bank transfer; unpaid or returned money can turn the whole price into a gift", "Buyer files gift tax within 3 months, seller files capital gains within 2 months after the end of the month"],
    "family-low-price-sale-checker"), asOf: HOUSEHOLD_TAX_AS_OF };
}
function commercialRent(i) {
  return { ...welfare(commercialRentCheck(i), "converted = deposit + rent × 100; covered when ≤ regional limit; maxDeposit = deposit × 1.05; maxRent = rent × 1.05 + (deposit − newDeposit, if lowered) × min(12%, base rate × 4.5) ÷ 12; tooSoon when an increase comes within 12 months; verdict ok | over | tooSoon | notCovered; combinedRate = increase with deposit and rent merged at the conversion rate (reference).",
    ["상가건물 임대차보호법 제2조·제10조의2·제11조·제12조", "시행령 제2조(환산보증금 기준)", "시행령 제4조(5%)", "시행령 제5조(12%, 기준금리 4.5배)"],
    ["Reply in writing that you do not agree to the part above the 5% cap", "Request renewal 6 to 1 months before expiry; renewal rights last 10 years from the first contract", "Free mediation: 상가건물임대차분쟁조정위원회 (대한법률구조공단 132)"],
    "commercial-rent-increase-checker"), asOf: HOUSEHOLD_TAX_AS_OF };
}

function smeYouth(i) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(i.start ?? "")) throw new InputError(["start: a month YYYY-MM"]);
  return { ...welfare(smeYouthReduction(i), "Eligible when age at contract − military months (max 72) ÷ 12 is 15-34. Year-end tax is computed twice (with social insurance estimated at 4.75% pension and health + long-term care + employment); reduction = 90% of earned-income tax capped at 2M (+10% local). endMonth = month containing the day 5 years after starting; fiveYear assumes the same salary.",
    ["조세특례제한법 제30조", "시행령 제27조"],
    ["Hand the employer the reduction application (with a military record if service is subtracted); withholding drops from the next payroll", "Missed years can be refunded through a correction claim (경정청구) within 5 years", "Excluded industries include professional services, finance and insurance"],
    "sme-youth-income-tax-reduction-calculator"), asOf: HOUSEHOLD_TAX_AS_OF };
}
function umbrella(i) {
  return { ...welfare(yellowUmbrella(i), "basisIncome = business income (ceo: salary − earned income deduction, only if salary ≤ 80M); limit 6M / 5M / 4M / 2M at ≤ 40M / ≤ 60M / ≤ 100M / above; deduction = min(paid, limit); saved = (tax(base) − tax(base − deduction)) × 1.1 with base = basisIncome − otherDeductions.",
    ["조세특례제한법 제86조의3", "시행령 제80조의3", "중소기업협동조합법 제115조"],
    ["Join through the KBIZ 노란우산 site or a bank with the business registration", "Enter the payment certificate amount in the May global income tax return (or year-end settlement for CEOs)", "Voluntary cancellation taxes deducted payments and interest as other income (16.5%)"],
    "yellow-umbrella-deduction-calculator"), asOf: HOUSEHOLD_TAX_AS_OF };
}
function vatType(i) {
  return { ...welfare(vatTypeCompare(i), "general = sales ÷ 1.1 × 10% − purchases ÷ 1.1 × 10% − card credit (refund if negative); simple = 0 if sales < 48M, else sales × sector rate × 10% − purchases × 0.5% − card credit, floored at 0; card credit = card sales × 1.3%, cap 10M; simpleAllowed when sales < 104M (48M for professional/real estate); saving = general − simple.",
    ["부가가치세법 제36조·제46조·제61조·제63조·제69조·제70조", "시행령 제109조·제111조"],
    ["Choose the type at business registration on hometax.go.kr", "Simplified files once a year (January 25), general twice (January and July 25)", "Giving up simplified status locks you into general for 3 years"],
    "general-vs-simplified-vat-calculator"), asOf: HOUSEHOLD_TAX_AS_OF };
}

function businessCar(i) {
  return { ...welfare(businessCarExpense(i), "depreciation = price ÷ 5 (own), lease fee (lease) or rent × 70% (rent); total = depreciation + rest of rent + other costs; ratio = logbook share, or min(1, 15M ÷ total) without a logbook; carriedOver = max(0, depreciation × ratio − 8M); deductible = total × ratio − carriedOver; taxSaved = deductible × marginalRate.",
    ["법인세법 제27조의2", "소득세법 제33조의2", "법인세법 시행령 제50조의2", "소득세법 시행령 제78조의3"],
    ["Insure the car with business-only (employee-driver) coverage", "Keep the NTS business-car logbook (date, purpose, distance); commuting counts as business", "File the business-car expense statement with the corporate or global income tax return"],
    "business-car-expense-calculator"), asOf: HOUSEHOLD_TAX_AS_OF };
}
function overseasEtf(i) {
  return { ...welfare(overseasCompare(i), "direct = max(0, gain − 2.5M) × 22%; etf = gain × 15.4% + (part of gain above 20M with other interest/dividends) × (marginalRate − 15.4%); isa = max(0, gain − 2M or 4M) × 9.9%; breakEven = 2.5M × 22% ÷ (22% − 15.4%).",
    ["소득세법 제17조·제94조①3호·제103조·제104조", "소득세법 시행령 제26조의2", "조세특례제한법 제91조의18"],
    ["Realise overseas gains across years to use the 2.5M deduction each year and offset losses in the same year", "Hold domestically listed overseas ETFs inside ISA or pension accounts to defer or cut tax", "Overseas capital gains are filed in May of the next year"],
    "overseas-stock-vs-etf-tax-calculator"), asOf: HOUSEHOLD_TAX_AS_OF };
}

const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s ?? "") && !Number.isNaN(Date.parse(s));
function officetel(i) {
  if (!isDate(i.acquired)) throw new InputError(["acquired: a date YYYY-MM-DD"]);
  return { ...welfare(officetelHouseCount(i), "acquisitionCount = acquired ≥ 2020-08-12 and property tax as housing and not smallNew; heavyCount (capital-gains surcharge, 종부세) = residential use and not smallNew; exemptCount = residential use; smallNew = first sale of a 2024-01-10~2027-12-31 new build, ≤ 60㎡, ≤ 600M metro / 300M elsewhere; officetelTax = price × 4.6%; nextExtra = next-home acquisition tax with − without the officetel in the count.",
    ["지방세법 제13조의2·제13조의3", "지방세법 시행령 제28조의4", "소득세법 제88조 7호", "종합부동산세법 제8조", "주택공급에 관한 규칙 제2조"],
    ["Check the property tax bill: officetels taxed as 건축물 (business) are outside the acquisition-tax count", "A tenant's resident registration usually makes the officetel residential for capital gains and 종부세", "Officetels never affect housing-subscription homelessness"],
    "officetel-house-count-checker"), asOf: HOUSEHOLD_TAX_AS_OF };
}
function ticketPresale(i) {
  return { ...welfare(ticketPresaleTax(i), "ticket: exempt if original, oneHouseExempt and salePrice ≤ 1.2B (above: taxable share (sale − 1.2B) ÷ sale); long-term deduction only for original members on preApprovalGain by yearsToApproval (table 1, table 2 if exempt and lived 2+ years); rate 70% (< 1 year), 60% (< 2 years), else 6-45%. presale: 70% (< 1 year) else 60%, no deduction. base = taxable − longTerm − 2.5M; +10% local tax.",
    ["소득세법 제89조①4호", "소득세법 제95조②", "소득세법 제103조", "소득세법 제104조①", "소득세법 시행령 제166조"],
    ["File the preliminary return within 2 months from the end of the month of sale", "Member rights and pre-sale rights acquired from 2021 count as houses when selling another home", "Settlement money, regulated-area surcharges and the replacement-house exemption are not covered"],
    "redevelopment-ticket-vs-presale-tax-calculator"), asOf: HOUSEHOLD_TAX_AS_OF };
}
function inheritedHouse(i) {
  return { ...welfare(inheritedValuation(i), "For value v in {official, appraisal}: inheritance base = v + otherEstate − (500M lump sum + spouse deduction) − (appraisal fee up to 5M for the appraisal case); inheritance = 10-50% − 3% filing credit; transfer = capital gains tax on salePrice − v (heir owns another house, no surcharge, long-term deduction from inheritance date, no short-term rate); total = inheritance + transfer + fee.",
    ["상속세 및 증여세법 제60조·제61조", "상속세 및 증여세법 시행령 제20조의3·제49조", "소득세법 시행령 제163조⑨"],
    ["Appraisals count only within 6 months before or after death (one appraiser if the standard price is 1B or less, otherwise two)", "Similar apartment sales within the valuation window override the official price", "Decide before the inheritance tax deadline (6 months from the end of the month of death)"],
    "inherited-house-appraisal-vs-official-price-calculator"), asOf: HOUSEHOLD_TAX_AS_OF };
}
function filingDeadline(i) {
  if (!isDate(i.date)) throw new InputError(["date: a date YYYY-MM-DD"]);
  return { ...welfare(filingDeadlines(i), "filingDue = last day of (month of date + 6) for inheritance (+9 abroad) or + 3 for gift; credit = tax × 3%; if lateDays > 0: noFiling = tax × 20% × (1 − relief) with relief 50% (≤ 30 days), 30% (≤ 90), 20% (≤ 180); latePayment = tax × 0.022% × lateDays; pay = tax + penalties (no credit).",
    ["상속세 및 증여세법 제4조④·제67조·제68조·제69조", "지방세법 제20조①", "소득세법 제74조", "국세기본법 제47조의2·제47조의4·제48조②", "민법 제1019조", "가족관계의 등록 등에 관한 법률 제84조"],
    ["File on Hometax or at the tax office; tax above 10M can be paid in instalments, above 20M by annual instalments with collateral", "Real estate also needs a separate acquisition tax return at the city or district office", "If late, file as soon as possible to get the late-filing relief"],
    "inheritance-gift-filing-deadline-calculator"), asOf: HOUSEHOLD_TAX_AS_OF };
}

function youthRent(i) {
  return welfare(youthRentSupport(i), "youthLine = 2026 median income (youth household size) × 60%; parentLine = median (parents' household size) × 100%, skipped from age 30 or when exempt; rent ≤ 600k, or rent + deposit × 2.5% ÷ 12 ≤ 700k; deposit ≤ 50M; monthly = min(200k, rent) − housing benefit; total = monthly × 24.",
    ["국토교통부 청년월세 지원 (2026 계속사업)", "2026년 기준 중위소득 (보건복지부 고시)"],
    ["Apply on Bokjiro or at the local community center during the announced intake (2026: 30 Mar to 29 May)", "Bring the lease, rent transfer records and family relation certificate", "Local rent programs (Seoul, Incheon, etc.) cannot be received at the same time"],
    "youth-monthly-rent-support-checker");
}
function policyLoans(i) {
  return welfare(housingLoanBest(i), "Each product checks its 2026 income, net-asset (buy 511M, jeonse 345M), price or deposit and area (85㎡) limits; maxLoan = min(product cap, price × LTV 70% (80% first-time outside the capital region) or deposit × 70%/80%, or rent × 24 up to 600k). Rates are the published ranges; banks set the final rate and limit (LTV, DTI 60%, credit).",
    ["주택도시기금 기금e든든 상품 안내 2026", "2025-06-27 가계부채 관리 방안 (기금 한도 축소)"],
    ["Check eligibility and apply online at nhuf.molit.go.kr, then the trustee bank reviews", "Jeonse loans: apply before the balance date; purchase loans: within 3 months of registration", "An electronic real estate contract lowers the 버팀목 rate by 0.1%p"],
    "policy-housing-loan-eligibility-checker");
}

function specialSupply(i) {
  return welfare(specialSupplyCheck(i), "ratio = monthlyIncome ÷ urban worker monthly income for the household size (LH table: ≤3 7,533,763; 4 8,802,202; 5 9,326,985; …); each type passes its membership test, then priority / general / lottery by its income lines (dual-income lines higher) and the asset test (private 331M real estate for lottery; public 215.5M real estate and 45.42M car).",
    ["주택공급에 관한 규칙 제40조~제47조의3", "LH 공급유형별 소득·자산 기준"],
    ["Check the income and asset table in the announcement on applyhome.co.kr — it prevails", "Special supply can be won only once in a lifetime; the subscription account needs 6+ months and the regional deposit", "Private first-time single-person households may apply only to lottery units of 60㎡ or less"],
    "special-supply-eligibility-checker");
}

/* 법령 길잡이 (2026-11-16): legal information, deadlines and clarifying questions — not representation. */
const LAW_PAGE = { tax: "tax-law-guide", accounting: "accounting-law-guide", labor: "labor-law-guide", admin: "administrative-law-guide", court: "registry-court-law-guide", insurance: "insurance-law-guide", customs: "customs-law-guide", ip: "ip-law-guide", appraisal: "appraisal-law-guide", realty: "realty-brokerage-law-guide", building: "building-permit-law-guide", health: "medical-care-law-guide", family: "divorce-family-law-guide", welfare: "welfare-benefit-law-guide" };
const seoulToday = () => new Date(Date.now() + 9 * 3_600_000).toISOString().slice(0, 10);
function lawAnswers(raw = {}) {
  const entries = Object.entries(raw);
  const problems = [];
  if (entries.length > 20) problems.push("answers: at most 20 keys");
  for (const [k, v] of entries) {
    if (!/^[A-Za-z][A-Za-z0-9]{0,30}$/.test(k)) problems.push(`answers.${k.slice(0, 32)}: a question key`);
    else if (!(typeof v === "boolean" || (typeof v === "number" && Number.isFinite(v)) || (typeof v === "string" && v.length <= 40))) problems.push(`answers.${k}: a string (≤40), number or boolean`);
  }
  if (problems.length) throw new InputError(problems);
  return raw;
}
function professionalScope(i) {
  const list = i.domain ? [PROFESSIONS[i.domain]] : Object.values(PROFESSIONS);
  return {
    asOf: LAW_GUIDE_AS_OF,
    professions: list.map((p) => ({ ...p, scopeUrl: statuteUrl(p.scopeCite), exclusive: p.exclusive.map((x) => ({ ...x, url: statuteUrl(x.cite) })), page: `${TOOLS_KO}${LAW_PAGE[p.domain]}/` })),
    matrix: SCOPE_MATRIX,
    namingRule: "Do not present yourself as 세무사, 공인회계사, 공인노무사, 행정사 or 법무사 or a similar title, and do not advertise representation work (세무사법 제20조②③, 공인회계사법 제11조, 공인노무사법 제8조③·제27조②, 행정사법 제3조②, 법무사법 제3조②). Call the assistant a legal-information guide (법령 길잡이).",
    disclaimer: LAW_DISCLAIMER,
  };
}
function lawIntake(i) {
  const answers = lawAnswers(i.answers);
  const today = i.today ?? seoulToday();
  const suggestions = i.topic ? [] : suggestTopics(i.situation ?? "", i.domain, 3);
  const topicId = i.topic ?? suggestions[0]?.id;
  if (!topicId) {
    const pool = TOPICS.filter((t) => !i.domain || t.domain === i.domain).map((t) => ({ id: t.id, domain: t.domain, label: t.label }));
    return { asOf: LAW_GUIDE_AS_OF, matched: false, ask: "어떤 일이 있었는지 아래 주제 중 가까운 것을 골라 주세요(또는 상황을 한두 문장 더 알려 주세요).", topics: pool, disclaimer: LAW_DISCLAIMER };
  }
  const r = intake(topicId, answers, today, i.limit ?? 3);
  return {
    asOf: LAW_GUIDE_AS_OF,
    today,
    matched: true,
    ...r,
    alternatives: suggestions.slice(1),
    howToUse: r.nextQuestions.length
      ? "Ask the user these questions (2-3 at a time, with the 'why'), then call again with topic and the collected answers. If a deadline is urgent (≤14 days) tell the user first."
      : "All questions answered. Answer with: one-line conclusion, deadline table (task, due date, D-day, statute), warnings, calculators, documents, free help, and when a licensed professional is needed.",
    page: `${TOOLS_KO}${LAW_PAGE[r.topic.domain]}/`,
  };
}
function statutes(i) {
  return { asOf: LAW_GUIDE_AS_OF, results: findStatutes(i.query, i.domain, i.limit ?? 8).map((s) => ({ ...s, url: statuteUrl(s) })), note: "plain is a plain-Korean summary, not the official text; confirm the article at law.go.kr", disclaimer: LAW_DISCLAIMER };
}

const HANDLERS = {
  "/v1/biz/decision-tree": decisionTree,
  "/v1/biz/critical-path": criticalPath,
  "/v1/biz/swot": swot,
  "/v1/biz/bcg": bcg,
  "/v1/biz/positioning-map": positioning,
  "/v1/biz/unit-economics-runway": economics,
  "/v1/biz/priorities": priorities,
  "/v1/tax/kr/business-calendar": businessCalendar,
  "/v1/biz/campaign-supply": campaign,
  "/v1/biz/influencer-deal": influencer,
  "/v1/biz/quality-recovery": quality,
  "/v1/biz/alternative-materials": materials,
  "/v1/biz/big-order": bigOrder,
  "/v1/biz/market-test": marketTest,
  "/v1/biz/sales-rebates": rebates,
  "/v1/biz/acquisition": acquisition,
  "/v1/benefits/kr/work-child-incentive": workChild,
  "/v1/benefits/kr/maternity-leave-pay": maternity,
  "/v1/labor/kr/wage-guarantee": guarantee,
  "/v1/labor/kr/injury-leave-pay": injury,
  "/v1/tax/kr/monthly-rent-credit": rent,
  "/v1/labor/kr/retirement-pension-db-dc": pension,
  "/v1/labor/kr/ordinary-wage": ordinary,
  "/v1/labor/kr/fixed-overtime-check": fixedOt,
  "/v1/tax/kr/comprehensive-real-estate-tax": cre,
  "/v1/tax/kr/housing-rental-income-tax": rentalTax,
  "/v1/benefits/kr/long-term-care-copay": longTermCare,
  "/v1/tax/kr/dependent-deduction": dependents,
  "/v1/tax/kr/stock-major-shareholder": majorStock,
  "/v1/labor/kr/dismissal-notice-pay": dismissalNotice,
  "/v1/labor/kr/shutdown-allowance": shutdown,
  "/v1/benefits/kr/reduced-hours-childcare-pay": reducedHours,
  "/v1/labor/kr/probation-minimum-wage": probation,
  "/v1/labor/kr/annual-leave-promotion": leavePromotion,
  "/v1/labor/kr/voluntary-quit-unemployment": voluntaryQuit,
  "/v1/business/kr/subcontract-direct-payment": subcontractDirect,
  "/v1/tax/kr/family-loan-interest": familyLoan,
  "/v1/tax/kr/parent-house-free-use": freeUse,
  "/v1/tax/kr/family-low-price-sale": lowPrice,
  "/v1/lease/kr/commercial-rent-increase": commercialRent,
  "/v1/tax/kr/sme-youth-reduction": smeYouth,
  "/v1/tax/kr/yellow-umbrella": umbrella,
  "/v1/tax/kr/vat-type-compare": vatType,
  "/v1/tax/kr/business-car-expense": businessCar,
  "/v1/tax/kr/overseas-stock-vs-etf": overseasEtf,
  "/v1/tax/kr/officetel-house-count": officetel,
  "/v1/tax/kr/ticket-vs-presale": ticketPresale,
  "/v1/tax/kr/inherited-house-valuation": inheritedHouse,
  "/v1/tax/kr/inheritance-gift-filing-deadline": filingDeadline,
  "/v1/benefits/kr/youth-rent-support": youthRent,
  "/v1/benefits/kr/policy-housing-loans": policyLoans,
  "/v1/benefits/kr/special-supply": specialSupply,
  "/v1/law/kr/professional-scope": professionalScope,
  "/v1/law/kr/intake": lawIntake,
  "/v1/law/kr/statutes": statutes,
  // 2026-11-17: 전문 실무 계산·길잡이 8종(practice.mjs)
  ...makePracticeHandlers(InputError),
};

export function calculateBiz(path, raw, coerce = false) {
  return HANDLERS[path](parseBizInput(path, raw, coerce));
}

/** REST entry. Returns null when the path is not a business route. */
export async function handleBiz(request, url, headers) {
  if (!Object.hasOwn(HANDLERS, url.pathname)) return null;
  const method = request.method;
  const isGetRoute = url.pathname === "/v1/tax/kr/business-calendar";
  const allowed = isGetRoute ? ["GET", "HEAD", "POST"] : ["POST"];
  if (!allowed.includes(method)) {
    return Response.json({ error: "method_not_allowed" }, { status: 405, headers: { ...headers, Allow: allowed.join(", ") } });
  }
  let raw = Object.fromEntries(url.searchParams);
  let coerce = true;
  if (method === "POST") {
    try {
      const text = await request.text();
      if (text.length > MAX_BODY) return Response.json({ error: "invalid_input", problems: [`body: at most ${MAX_BODY} bytes`] }, { status: 413, headers });
      const body = JSON.parse(text);
      if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
      raw = body;
      coerce = false;
    } catch {
      return Response.json({ error: "invalid_input", problems: ["body: a JSON object"] }, { status: 400, headers });
    }
  }
  try {
    const result = calculateBiz(url.pathname, raw, coerce);
    return new Response(method === "HEAD" ? null : JSON.stringify(result), { status: 200, headers });
  } catch (err) {
    if (err instanceof InputError) return Response.json({ error: "invalid_input", problems: err.problems }, { status: 400, headers });
    throw err;
  }
}
