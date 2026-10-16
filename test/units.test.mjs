import test from "node:test";
import assert from "node:assert/strict";
import { convertUnits } from "../src/modules/units.mjs";

test("convertUnits area: m2 to pyeong", () => {
  const res = convertUnits({ value: 84, from: "m2", to: "pyeong" });
  assert.equal(res.type, "area");
  assert.equal(res.fromUnit, "m2");
  assert.equal(res.toUnit, "pyeong");
  // 84 / 3.305785 ≈ 25.41
  assert.equal(Math.round(res.outputValue), 25);
});

test("convertUnits length: meter to feet", () => {
  const res = convertUnits({ value: 1.8, from: "m", to: "ft" });
  assert.equal(res.type, "length");
  // 1.8 / 0.3048 ≈ 5.9055
  assert.equal(res.outputValue > 5.9 && res.outputValue < 5.91, true);
});

test("convertUnits temperature: Celsius to Fahrenheit", () => {
  const res = convertUnits({ value: 25, from: "c", to: "f" });
  assert.equal(res.type, "temperature");
  assert.equal(res.outputValue, 77);
});

test("convertUnits throws on mismatched units", () => {
  assert.throws(() => {
    convertUnits({ value: 10, from: "m", to: "kg" });
  }, /Unsupported or mismatched unit conversion/);
});
