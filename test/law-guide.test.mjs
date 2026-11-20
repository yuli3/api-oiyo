import test from "node:test";
import assert from "node:assert/strict";
import { calculateBiz } from "../src/modules/biz-strategy.mjs";

test("law intake: situation → topic, next questions and deadlines", () => {
  const r = calculateBiz("/v1/law/kr/intake", { situation: "회사에서 문자로 해고 통보를 받았어요", answers: { size: "5plus", dismissDate: "2026-10-30" }, today: "2026-11-16" });
  assert.equal(r.matched, true);
  assert.equal(r.topic.id, "labor-dismissal");
  assert.equal(r.nextQuestions[0].key, "written");
  assert.equal(r.deadlines.find((d) => d.id === "remedy").due, "2027-02-01");
  assert.equal(r.page, "https://tools.oiyo.net/ko/labor-law-guide/");
  assert.match(r.disclaimer, /대리/);
});

test("law intake: no match lists topics; bad answers are refused", () => {
  const r = calculateBiz("/v1/law/kr/intake", { situation: "zzz", domain: "court" });
  assert.equal(r.matched, false);
  assert.ok(r.topics.every((t) => t.domain === "court"));
  assert.throws(() => calculateBiz("/v1/law/kr/intake", { topic: "tax-fix", answers: { dueDate: { x: 1 } } }), (e) => e.problems.some((p) => p.startsWith("answers.dueDate")));
  assert.throws(() => calculateBiz("/v1/law/kr/intake", { topic: "nope" }), (e) => e.problems.some((p) => p.startsWith("topic")));
});

test("statutes and professional scope", () => {
  assert.equal(calculateBiz("/v1/law/kr/statutes", { query: "임차권등기" }).results[0].id, "hla-3-3");
  const s = calculateBiz("/v1/law/kr/professional-scope", { domain: "tax" });
  assert.equal(s.professions.length, 1);
  assert.equal(s.professions[0].act, "세무사법");
  assert.ok(s.professions[0].exclusive.some((x) => x.cite.article === "제20조 제3항"));
  assert.equal(calculateBiz("/v1/law/kr/professional-scope", {}).professions.length, 16);
  assert.match(calculateBiz("/v1/law/kr/professional-scope", { domain: "family" }).professions[0].page, /divorce-family-law-guide\/$/);
  const ins = calculateBiz("/v1/law/kr/professional-scope", { domain: "insurance" });
  assert.equal(ins.professions[0].act, "보험업법");
  assert.match(ins.professions[0].page, /insurance-law-guide\/$/);
  assert.equal(calculateBiz("/v1/law/kr/statutes", { query: "보험 청약철회 15일" }).results[0].id, "fcp-46");
  assert.equal(calculateBiz("/v1/law/kr/statutes", { query: "온라인 쇼핑 청약철회" }).results[0].id, "ecom-17");
  const cu = calculateBiz("/v1/law/kr/professional-scope", { domain: "customs" });
  assert.equal(cu.professions[0].act, "관세사법");
  assert.match(cu.professions[0].page, /customs-law-guide\/$/);
  assert.match(calculateBiz("/v1/law/kr/professional-scope", { domain: "realty" }).professions[0].page, /realty-brokerage-law-guide\/$/);
  const appr = calculateBiz("/v1/law/kr/intake", { topic: "appr-expropriation", answers: { decisionDate: "2026-11-10" }, today: "2026-11-17" });
  assert.equal(appr.deadlines[0].due, "2026-12-10");
  assert.equal(calculateBiz("/v1/law/kr/statutes", { query: "공지예외" }).results[0].id, "pa-30");
});
