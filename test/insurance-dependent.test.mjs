import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateHealthInsurance } from '../src/modules/insurance.mjs';

test('dependent income test ignores interest+dividends of 10M or less and counts all above', () => {
  const at10m = calculateHealthInsurance({ financialIncome: 10_000_000, otherIncome: 15_000_000 });
  assert.equal(at10m.dependentEligibility.basicCriteriaMet, true);
  const above = calculateHealthInsurance({ financialIncome: 10_000_001, otherIncome: 10_000_000 });
  assert.equal(above.dependentEligibility.basicCriteriaMet, false);
  const earned = calculateHealthInsurance({ otherIncome: 20_000_001 });
  assert.equal(earned.dependentEligibility.basicCriteriaMet, false);
});
test('property 5.4억–9억 band uses counted income', () => {
  const r = calculateHealthInsurance({ propertyTaxBase: 600_000_000, financialIncome: 9_000_000, otherIncome: 2_000_000 });
  assert.equal(r.dependentEligibility.basicCriteriaMet, true); // counted income 2M ≤ 10M (9M financial not counted)
});
