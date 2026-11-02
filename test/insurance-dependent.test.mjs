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

test('married candidate fails when spouse does not meet the income test', () => {
  const r = calculateHealthInsurance({ otherIncome: 5_000_000, isMarried: true, spouseMeetsIncomeCriteria: false });
  assert.equal(r.dependentEligibility.basicCriteriaMet, false);
  const ok = calculateHealthInsurance({ otherIncome: 5_000_000, isMarried: true, spouseMeetsIncomeCriteria: true });
  assert.equal(ok.dependentEligibility.basicCriteriaMet, true);
  assert.ok(!ok.dependentEligibility.unassessedCriteria.includes('기혼자의 배우자 소득요건'));
  assert.equal(ok.dependentEligibility.isEligible, null);
});

test('sibling age, marital status and 1.8억 property tests', () => {
  assert.equal(calculateHealthInsurance({ relationship: 'sibling', age: 40, siblingUnmarried: true }).dependentEligibility.basicCriteriaMet, false);
  assert.equal(calculateHealthInsurance({ relationship: 'sibling', age: 29, siblingUnmarried: true }).dependentEligibility.basicCriteriaMet, true);
  assert.equal(calculateHealthInsurance({ relationship: 'sibling', age: 40, siblingUnmarried: true, isDisabledOrMerit: true }).dependentEligibility.basicCriteriaMet, true);
  assert.equal(calculateHealthInsurance({ relationship: 'sibling', age: 70, siblingUnmarried: false }).dependentEligibility.basicCriteriaMet, false);
  assert.equal(calculateHealthInsurance({ relationship: 'sibling', age: 70, siblingUnmarried: true, propertyTaxBase: 180_000_001 }).dependentEligibility.basicCriteriaMet, false);
  // the same property is fine for a parent
  assert.equal(calculateHealthInsurance({ relationship: 'lineal_ascendant', propertyTaxBase: 180_000_001 }).dependentEligibility.basicCriteriaMet, true);
});

test('housing rental income counts as registered; disabled/merit exception allows up to 5M', () => {
  assert.equal(calculateHealthInsurance({ businessIncome: 1_000_000, hasHousingRentalIncome: true }).dependentEligibility.basicCriteriaMet, false);
  assert.equal(calculateHealthInsurance({ businessIncome: 1_000_000, hasHousingRentalIncome: false }).dependentEligibility.basicCriteriaMet, true);
  assert.equal(calculateHealthInsurance({ businessIncome: 4_000_000, hasBusinessRegistration: true, isDisabledOrMerit: true }).dependentEligibility.basicCriteriaMet, true);
  assert.equal(calculateHealthInsurance({ businessIncome: 5_000_001, isDisabledOrMerit: true }).dependentEligibility.basicCriteriaMet, false);
});

test('invalid relationship is rejected', () => {
  assert.throws(() => calculateHealthInsurance({ relationship: 'cousin' }), RangeError);
});
