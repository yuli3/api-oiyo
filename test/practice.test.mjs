import test from "node:test";
import assert from "node:assert/strict";
import { calculateBiz } from "../src/modules/biz-strategy.mjs";
import { BIZ_TOOLS } from "../src/modules/biz-tools-spec.mjs";

test("practice: 과태료·관세·CSM·K-ICS·보험금", () => {
  assert.equal(calculateBiz("/v1/law/kr/fine-reduction", { fine: 500000, when: "late", monthsLate: 10 }).result.pay, 575000);
  const d = calculateBiz("/v1/customs/kr/import-duty", { price: 1000, freight: 50, fx: 1400, baseRate: 0.13, ftaRate: 0, hasOrigin: true });
  assert.equal(d.result.fta.total, 147000);
  assert.equal(d.result.saving, 191100 + 166110 - 147000);
  assert.equal(calculateBiz("/v1/customs/kr/import-duty", { price: 190, fx: 1400, baseRate: 0.13, personal: true, fromUS: true }).result.exempt, true);
  assert.ok(calculateBiz("/v1/insurance/ifrs17-csm", { premium: 1000000, years: 10, claims: 600000, expense: 100000, acquisition: 300000, rate: 0.03, ra: 0.05 }).result.csm > 0);
  const k = calculateBiz("/v1/insurance/kics-ratio", { available: 100e9, life: 100e9, market: 100e9 });
  assert.equal(k.result.level, "advise");
  assert.equal(calculateBiz("/v1/insurance/kics-ratio", { available: 1 }).result.ratio, null);
  assert.equal(calculateBiz("/v1/insurance/claim-payout", { kind: "disability", sum: 1e8, rates: [0.5, 0.25] }).result.pay, 75e6);
  assert.equal(calculateBiz("/v1/insurance/claim-payout", { kind: "fault", damage: 1e7, fault: 0.3, deductible: 2e5 }).result.pay, 68e5);
  assert.throws(() => calculateBiz("/v1/insurance/claim-payout", { kind: "disability", sum: 1e8 }), (e) => e.problems[0].startsWith("rates"));
});

test("practice: 전표 분석, 길잡이, 설명 기록", () => {
  const e = calculateBiz("/v1/audit/journal-entries", { entries: [{ date: "2026-03-07", account: "여비", amount: 4980000 }, { date: "2026-03-07", account: "여비", amount: 4980000 }, { date: "2026-03-10", account: "외주", amount: 30000000 }], approvalLimit: 5000000 });
  assert.equal(e.total.duplicate, 2);
  assert.equal(e.total.belowLimit, 2);
  assert.ok(e.flagged.length <= 30);
  assert.ok(calculateBiz("/v1/law/kr/practice-guide", {}).guides.length >= 4);
  const g = calculateBiz("/v1/law/kr/practice-guide", { guide: "eportal-practice-guide", case: "insurance4", dates: { acquire: "2026-11-03" } });
  assert.equal(g.cases[0].deadlines[0].due, "2026-12-15");
  assert.throws(() => calculateBiz("/v1/law/kr/practice-guide", { guide: "eportal-practice-guide", case: "zzz" }), (x) => x.problems[0].startsWith("case"));
  assert.throws(() => calculateBiz("/v1/law/kr/practice-guide", { guide: "eportal-practice-guide", dates: { acquire: "11/3" } }));
  const r = calculateBiz("/v1/insurance/explanation-record", { date: "2026-11-17", suitability: ["purpose", "age", "income", "asset", "risk"], explained: ["coverage", "exclusion", "premium", "surrender", "disclosure", "withdraw"], delivered: "paper", confirm: "sign" });
  assert.equal(r.ok, true);
  assert.equal(r.keepUntil, "2036-11-17");
  assert.match(r.text, /금소법 제46조/);
});

test("practice: MCP 도구 이름 8개가 등록돼요", () => {
  const names = BIZ_TOOLS.map((t) => t.function.name);
  for (const n of ["calculate_kr_fine_reduction", "calculate_kr_import_duty", "simulate_ifrs17_csm", "calculate_kics_ratio", "calculate_insurance_claim_payout", "analyze_journal_entries", "get_kr_practice_guide", "check_insurance_explanation_record"]) assert.ok(names.includes(n), n);
});
