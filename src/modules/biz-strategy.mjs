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
import { BIZ_ENDPOINTS, BIZ_TOOLS } from "./biz-tools-spec.mjs";

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

const HANDLERS = {
  "/v1/biz/decision-tree": decisionTree,
  "/v1/biz/critical-path": criticalPath,
  "/v1/biz/swot": swot,
  "/v1/biz/bcg": bcg,
  "/v1/biz/positioning-map": positioning,
  "/v1/biz/unit-economics-runway": economics,
  "/v1/biz/priorities": priorities,
  "/v1/tax/kr/business-calendar": businessCalendar,
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
