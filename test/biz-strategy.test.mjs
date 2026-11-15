// Business strategy endpoints (2026-11-15): formulas come from tools-oiyo biz-strategy / biz-checklist via scripts/sync-tools-tax.mjs.
import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.mjs";

async function call(path, params, method = "POST") {
  const url = new URL(path, "https://api.oiyo.net");
  const options = { method };
  if (method === "POST") {
    options.body = JSON.stringify(params);
    options.headers = { "Content-Type": "application/json" };
  } else for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const response = await worker.fetch(new Request(url, options));
  return { status: response.status, body: await response.json() };
}

test("decision tree: options rollback, breakeven probability, full tree", async () => {
  const options = [{ label: "새 사업", successProb: 0.3, ifSuccess: 1000, ifFail: -200 }, { label: "현상 유지", successProb: 1, ifSuccess: 400, ifFail: 400 }];
  const { status, body } = await call("/v1/biz/decision-tree", { options });
  assert.equal(status, 200);
  assert.equal(body.result.ev, 400);
  assert.equal(body.comparison.best, "현상 유지");
  assert.equal(body.comparison.options[0].breakevenSuccessProb, 0.5); // 0.5×1000 + 0.5×(−200) = 400
  const tree = { label: "출시?", kind: "decision", branches: [
    { label: "출시", cost: 100, node: { label: "반응", kind: "chance", branches: [
      { label: "좋음", prob: 0.4, node: { kind: "outcome", value: 500 } }, { label: "나쁨", prob: 0.6, node: { kind: "outcome", value: 50 } }] } },
    { label: "보류", node: { kind: "outcome", value: 90 } }] };
  const full = await call("/v1/biz/decision-tree", { tree });
  assert.equal(full.status, 200);
  assert.equal(full.body.result.ev, 130); // 0.4×500 + 0.6×50 − 100
  assert.deepEqual(full.body.result.path, ["출시"]);
  assert.equal((await call("/v1/biz/decision-tree", { tree, options })).status, 400);
  const bad = await call("/v1/biz/decision-tree", { tree: { kind: "chance", branches: [{ label: "x", prob: 2, node: { kind: "outcome", value: 1 } }] } });
  assert.equal(bad.status, 400);
  assert.match(bad.body.problems.join(), /prob/);
});

test("critical path: PERT duration, dates, refuses unknown deps and cycles", async () => {
  const tasks = [{ id: "a", name: "기획", duration: 3 }, { id: "b", name: "디자인", duration: 5, deps: ["a"] }, { id: "c", name: "개발", duration: 10, deps: ["a"], optimistic: 7, pessimistic: 16 }, { id: "d", name: "출시", duration: 0, deps: ["b", "c"] }];
  const { status, body } = await call("/v1/biz/critical-path", { tasks, deadline: 14, startDate: "2026-11-16" });
  assert.equal(status, 200);
  assert.equal(body.result.duration, 13.5);
  assert.deepEqual(body.result.criticalPath, ["a", "c", "d"]);
  assert.ok(body.onTimeProbability > 0.5 && body.onTimeProbability < 1);
  assert.equal(body.dates[0].start, "2026-11-16");
  const unknown = await call("/v1/biz/critical-path", { tasks: [{ id: "a", name: "A", duration: 1, deps: ["z"] }] });
  assert.equal(unknown.status, 400);
  const cycle = await call("/v1/biz/critical-path", { tasks: [{ id: "a", name: "A", duration: 1, deps: ["b"] }, { id: "b", name: "B", duration: 1, deps: ["a"] }] });
  assert.equal(cycle.status, 400);
  assert.match(cycle.body.problems[0], /cycle/);
});

test("SWOT, BCG and positioning", async () => {
  const swot = await call("/v1/biz/swot", { items: [{ kind: "S", text: "충성 고객", impact: 5 }, { kind: "W", text: "작은 팀", impact: 2 }, { kind: "O", text: "AI 수요", impact: 4 }, { kind: "T", text: "대기업", impact: 5 }] });
  assert.equal(swot.status, 200);
  assert.equal(swot.body.result.stance, "ST");
  const bcg = await call("/v1/biz/bcg", { units: [{ name: "A", revenue: 60, marketGrowth: 0.03, share: 0.4, rivalShare: 0.2 }, { name: "B", revenue: 20, marketGrowth: 0.2, share: 0.05, rivalShare: 0.15 }] });
  assert.equal(bcg.status, 200);
  assert.deepEqual(bcg.body.result.rows.map((r) => r.quadrant), ["cashCow", "question"]);
  assert.equal(bcg.body.result.rows[0].label, "캐시카우");
  const pos = await call("/v1/biz/positioning-map", { brands: [{ name: "우리", x: 5, y: 5, ours: true }, { name: "A", x: 6, y: 5 }, { name: "B", x: -8, y: -8 }] });
  assert.equal(pos.status, 200);
  assert.equal(pos.body.result.brands.find((b) => b.ours).nearest, "A");
  assert.equal((await call("/v1/biz/positioning-map", { brands: [{ name: "A", x: 1, y: 1 }, { name: "A", x: 2, y: 2 }] })).status, 400);
  assert.equal((await call("/v1/biz/positioning-map", { brands: [{ name: "A", x: 11, y: 1 }, { name: "B", x: 2, y: 2 }] })).status, 400);
});

test("unit economics, runway and break-even groups", async () => {
  const { status, body } = await call("/v1/biz/unit-economics-runway", { arpu: 50000, grossMargin: 0.8, monthlyChurn: 0.05, cac: 200000, fixedCost: 1000, price: 30, variableCost: 10 });
  assert.equal(status, 200);
  assert.equal(body.unitEconomics.ltv, 800000);
  assert.equal(body.unitEconomics.paybackMonths, 5);
  assert.equal(body.breakEven.units, 50);
  assert.equal(body.runway, null);
  const run = await call("/v1/biz/unit-economics-runway", { cash: 100, revenue: 10, revenueGrowth: 0, expenses: 30, expenseGrowth: 0, months: 12 });
  assert.equal(run.body.runway.zeroMonth, 6);
  assert.equal(run.body.runway.defaultAlive, false);
  assert.equal((await call("/v1/biz/unit-economics-runway", {})).status, 400);
});

test("priorities: RICE order and weighted flips", async () => {
  const rice = await call("/v1/biz/priorities", { method: "rice", items: [{ name: "a", reach: 100, impact: 1, confidence: 0.8, effort: 2 }, { name: "b", reach: 1000, impact: 0.5, confidence: 0.5, effort: 5 }] });
  assert.deepEqual(rice.body.result.map((x) => x.name), ["b", "a"]);
  const w = await call("/v1/biz/priorities", { method: "weighted", criteria: [{ name: "비용", weight: 0.5 }, { name: "속도", weight: 0.5 }], options: [{ name: "X", scores: [5, 1] }, { name: "Y", scores: [2, 3] }] });
  assert.equal(w.body.result.ranked[0].name, "X");
  assert.equal((await call("/v1/biz/priorities", { method: "weighted", criteria: [{ name: "a", weight: 1 }], options: [{ name: "X", scores: [1, 2] }, { name: "Y", scores: [1] }] })).status, 400);
});

test("business calendar: holiday-shifted due dates, checklist, GET coercion and refusals", async () => {
  const { status, body } = await call("/v1/tax/kr/business-calendar", { year: 2026, entity: "corp", vat: "general", employer: true, role: "bookkeeper" }, "GET");
  assert.equal(status, 200);
  const vat = body.events.find((e) => e.title.includes("1기 부가세 예정신고"));
  assert.equal(vat.statutory, "2026-04-25");
  assert.equal(vat.due, "2026-04-27"); // Saturday → Monday
  assert.ok(body.checklist.mustDo.length && body.checklist.mustNotDo.length);
  assert.ok(body.basis.length && body.notCovered.length && body.disclaimer);
  assert.equal((await call("/v1/tax/kr/business-calendar", { year: 2026, entity: "corp", vat: "general", employer: true, extra: 1 }, "GET")).status, 400);
  assert.equal((await call("/v1/tax/kr/business-calendar", { year: 2019, entity: "corp", vat: "general", employer: true }, "GET")).status, 400);
  assert.equal((await call("/v1/biz/swot", {}, "GET")).status, 405);
});
