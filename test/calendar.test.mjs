import test from "node:test";
import assert from "node:assert/strict";
import { getHolidays, isBusinessDay } from "../src/modules/calendar.mjs";

test("getHolidays returns valid 2026 holidays with substitutes", () => {
  const holidays = getHolidays(2026);
  assert.ok(Array.isArray(holidays));
  assert.ok(holidays.length >= 15);

  // 3·1절(일요일)에 따른 3월 2일 대체공휴일 확인
  const sub31 = holidays.find((h) => h.date === "2026-03-02");
  assert.ok(sub31);
  assert.equal(sub31.is_substitute, true);
  assert.equal(sub31.name, "3·1절 대체공휴일");

  // 설날 당일 확인
  const seollal = holidays.find((h) => h.date === "2026-02-17");
  assert.ok(seollal);
  assert.equal(seollal.name, "설날");
});

test("isBusinessDay correctly identifies business days and holidays", () => {
  // 평일 정상 영업일
  const friday = isBusinessDay("2026-10-16");
  assert.equal(friday.is_business_day, true);
  assert.equal(friday.day_of_week, "Friday");
  assert.equal(friday.reason, null);

  // 주말 토요일
  const saturday = isBusinessDay("2026-10-17");
  assert.equal(saturday.is_business_day, false);
  assert.equal(saturday.day_of_week, "Saturday");
  assert.equal(saturday.reason, "토요일");

  // 공휴일 (신정)
  const newYear = isBusinessDay("2026-01-01");
  assert.equal(newYear.is_business_day, false);
  assert.equal(newYear.reason, "신정");

  // 대체공휴일 (2026-03-02)
  const subHoliday = isBusinessDay("2026-03-02");
  assert.equal(subHoliday.is_business_day, false);
  assert.equal(subHoliday.reason, "3·1절 대체공휴일");
});
