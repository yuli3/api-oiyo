import test from "node:test";
import assert from "node:assert/strict";
import { calculateSaju } from "../src/modules/saju.mjs";

test("calculateSaju calculates sexagenary pillars and five elements distribution", () => {
  const result = calculateSaju({
    year: 1984,
    month: 5,
    day: 15,
    hour: 14,
    minute: 30,
  });

  assert.ok(result.day_master);
  assert.ok(result.day_master.stem);
  assert.ok(result.pillars.year.ganzhi);
  assert.ok(result.pillars.month.ganzhi);
  assert.ok(result.pillars.day.ganzhi);
  assert.ok(result.pillars.hour.ganzhi);

  // 오행 합 100% 검증
  const totalPercent = Object.values(result.five_elements).reduce(
    (sum, el) => sum + el.percentage,
    0
  );
  assert.ok(totalPercent >= 98 && totalPercent <= 102); // 반올림 오차 허용

  // 해석 텍스트나 사주 풀이가 전혀 없음을 검증
  assert.equal(result.interpretation, undefined);
  assert.equal(result.fortune, undefined);
});

test("calculateSaju handles null hour correctly", () => {
  const result = calculateSaju({
    year: 1995,
    month: 10,
    day: 20,
    hour: null,
  });

  assert.equal(result.pillars.hour, null);
  assert.ok(result.pillars.year);
  assert.ok(result.pillars.month);
  assert.ok(result.pillars.day);
});
