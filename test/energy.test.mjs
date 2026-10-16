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
  assert.equal(res.baseFee, 1000);
  // usage charge = 2140 * 22.15 = 47401
  assert.equal(res.usageCharge, 47401);
  // supplyPrice = 1000 + 47401 = 48401
  assert.equal(res.supplyPrice, 48401);
  // vat = 4840
  assert.equal(res.vat, 4840);
  // total = floor(48401 + 4840, -1) = 53240
  assert.equal(res.totalBilled, 53240);
});

test("calculateCityGasBill calculates cooking bill with lower rate", () => {
  const res = calculateCityGasBill({
    usageM3: 10,
    usageType: "cooking",
  });

  // 10 * 42.8 = 428 MJ
  // usage charge = 428 * 21.05 = 9009
  // supply = 1000 + 9009 = 10009
  // vat = 1000
  // total = 11000
  assert.equal(res.usageCharge, 9009);
  assert.equal(res.totalBilled, 11000);
});
