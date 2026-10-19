import test from "node:test";
import assert from "node:assert/strict";
import { calculateCityGasBill } from "../src/modules/energy.mjs";

test("calculateCityGasBill calculates standard heating bill", () => {
  const res = calculateCityGasBill({
    usageM3: 50,
    usageType: "heating",
  });

  // 50 * 42.8 * 1.0 = 2140 MJ
  assert.equal(res.usageM3, 50);
  assert.equal(res.energyConsumedMJ, 2140);
  assert.equal(res.baseFee, 1250);
  // usage charge = floor(2140 * 22.5268) = 48207
  assert.equal(res.usageCharge, 48207);
  // supplyPrice = 1250 + 48207 = 49457
  assert.equal(res.supplyPrice, 49457);
  // vat = 4945
  assert.equal(res.vat, 4945);
  // total = floor(49457 + 4945, -1) = 54400
  assert.equal(res.totalBilled, 54400);
});

test("calculateCityGasBill charges cooking at the same residential rate", () => {
  const res = calculateCityGasBill({
    usageM3: 10,
    usageType: "cooking",
  });

  // 10 * 42.8 = 428 MJ
  // usage charge = floor(428 * 22.5268) = 9641
  // supply = 1250 + 9641 = 10891
  // vat = 1089
  // total = floor(11980, -1) = 11980
  assert.equal(res.usageCharge, 9641);
  assert.equal(res.totalBilled, 11980);
});
