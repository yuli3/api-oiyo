import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateAnnualLeave, calculateSeverancePay } from '../src/modules/labor.mjs';
import worker from '../src/worker.mjs';

test('labor functions reject invalid amounts and working hours instead of fabricating defaults', () => {
  for (const value of [NaN, Infinity, -1]) {
    assert.throws(() => calculateAnnualLeave({ unusedDays: value }), RangeError);
    assert.throws(() => calculateSeverancePay({ startDate: '2025-01-01', endDate: '2026-01-01', threeMonthSalary: value }), RangeError);
  }
  for (const dailyHours of [0, 9, Infinity]) assert.throws(() => calculateAnnualLeave({ dailyHours }), RangeError);
  assert.equal(calculateAnnualLeave({ unusedDays: 0.5, hourlyWage: 12000, dailyHours: 4 }).unusedLeaveAllowance, 24000);
});

test('HTTP rejects explicit blank and nonfinite input while retaining omitted defaults', async () => {
  for (const query of ['unusedDays=', 'unusedDays=-1', 'hourlyWage=Infinity', 'dailyHours=9', 'yearsOfService=', 'yearsOfService=Infinity']) {
    const response = await worker.fetch(new Request('https://api.oiyo.net/v1/labor/kr/annual-leave?' + query));
    assert.equal(response.status, 400, query);
  }
  assert.equal((await worker.fetch(new Request('https://api.oiyo.net/v1/labor/kr/annual-leave'))).status, 200);
  const response = await worker.fetch(new Request('https://api.oiyo.net/v1/labor/kr/severance-pay?startDate=2025-01-01&endDate=2026-01-01&threeMonthSalary='));
  assert.equal(response.status, 400);
});

test('fractional contractual hours are not silently rounded up to one hour', () => {
  assert.equal(calculateAnnualLeave({ hourlyWage: 12000, dailyHours: 0.5, unusedDays: 1 }).unusedLeaveAllowance, 6000);
  assert.equal(calculateSeverancePay({ startDate: '2025-01-01', endDate: '2026-01-01', threeMonthSalary: 0, hourlyWage: 12000, dailyHours: 0.5 }).dailyOrdinaryWage, 6000);
});

test('unrepresentable calculated amounts fail rather than losing monetary precision', () => {
  assert.throws(() => calculateAnnualLeave({ hourlyWage: Number.MAX_SAFE_INTEGER, unusedDays: 2 }), RangeError);
  assert.throws(() => calculateSeverancePay({ startDate: '2025-01-01', endDate: '2026-01-01', hourlyWage: Number.MAX_SAFE_INTEGER }), RangeError);
});
