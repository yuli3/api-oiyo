import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.mjs";
import { findTools } from "../src/modules/tool-finder.mjs";

const post = (body) => worker.fetch(new Request("https://api.oiyo.net/v1/catalog/find-tools", {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
}));

test("finder routes everyday Korean words to the right tools", () => {
  const cases = [
    ["퇴직금이랑 실업급여 얼마 받아요?", ["calculate_severance_pay", "calculate_unemployment_benefits"]],
    ["종부세 계산해줘", ["calculate_kr_comprehensive_real_estate_tax"]],
    ["군대 전역일", ["calculate_military_service"]],
    ["올해 공휴일 알려줘", ["get_kr_holidays"]],
  ];
  for (const [question, expected] of cases) {
    const result = findTools(question, 3);
    assert.equal(result.answerable, "likely", question);
    const names = result.tools.map((tool) => tool.name);
    for (const name of expected) assert.ok(names.includes(name), `${question} → ${name} in ${names}`);
  }
});

test("a country word picks that country's tool family", () => {
  assert.equal(findTools("일본 월급 실수령액", 3).tools[0].name, "calculate_jp_take_home");
  assert.equal(findTools("UK take-home pay", 3).tools[0].name, "calculate_uk_take_home");
  assert.equal(findTools("호주 실수령", 3).tools[0].name, "calculate_au_take_home");
});

test("finder says 'none' instead of guessing when nothing covers the question", () => {
  const result = findTools("강아지 사료 추천해줘", 5);
  assert.equal(result.answerable, "none");
  assert.deepEqual(result.tools, []);
  assert.match(result.note, /instead of estimating/);
});

test("finder never lists itself and returns callable metadata", () => {
  const result = findTools("find tools 퇴직금", 10);
  for (const tool of result.tools) {
    assert.notEqual(tool.name, "find_oiyo_tools");
    assert.ok(tool.endpoint?.path?.startsWith("/v1/"));
    assert.ok(Array.isArray(tool.inputs));
  }
});

test("REST finder validates input strictly", async () => {
  assert.equal((await post({ question: "퇴직금" })).status, 200);
  assert.equal((await post({ question: "" })).status, 400);
  assert.equal((await post({ question: "퇴직금", limit: 11 })).status, 400);
  assert.equal((await post({ question: "퇴직금", extra: 1 })).status, 400);
  assert.equal((await worker.fetch(new Request("https://api.oiyo.net/v1/catalog/find-tools"))).status, 405);
});
