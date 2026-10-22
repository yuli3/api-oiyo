import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateWeeklyAllowance } from '../src/modules/labor.mjs';
import worker from '../src/worker.mjs';

test('weekly allowance preserves a below-minimum entered wage and warns rather than rewriting it', () => {
  const result = calculateWeeklyAllowance({ hourlyWage: 10000, weeklyHours: 20 });
  assert.equal(result.hourlyWage, 10000);
  assert.equal(result.weeklyAllowance, 40000);
  assert.equal(result.baseWeeklyWage, 200000);
  assert.ok(result.warnings.includes('below_2026_minimum_wage'));
});

test('hours alone are not a legal eligibility determination; missing confirmations remain unknown', () => {
  const unknown = calculateWeeklyAllowance({ hourlyWage: 10320, weeklyHours: 20 });
  assert.equal(unknown.isEligible, null);
  assert.equal(unknown.eligibility.status, 'unknown');
  assert.equal(unknown.eligibility.hoursThresholdMet, true);
  assert.equal(unknown.weeklyAllowance, 41280);
  assert.equal(unknown.allowanceAssumesEligibility, true);
  const confirmed = calculateWeeklyAllowance({ hourlyWage: 10320, weeklyHours: 20, employedWholeWeek: true, completedScheduledDays: true });
  assert.equal(confirmed.isEligible, true);
  assert.equal(confirmed.eligibility.status, 'self_confirmed');
  assert.equal(confirmed.allowanceAssumesEligibility, false);
  const incomplete = calculateWeeklyAllowance({ hourlyWage: 10320, weeklyHours: 20, employedWholeWeek: false });
  assert.equal(incomplete.isEligible, false);
  assert.equal(incomplete.weeklyAllowance, 0);
  assert.equal(incomplete.totalWeeklyWage, 206400);
  const below = calculateWeeklyAllowance({ hourlyWage: 10320, weeklyHours: 14.9 });
  assert.equal(below.isEligible, false);
  assert.equal(below.eligibility.hoursThresholdMet, false);
});

test('weekly amounts expose the comparison model, floor policy and nonstatutory monthly conversion', () => {
  const result = calculateWeeklyAllowance({ hourlyWage: 10320, weeklyHours: 40 });
  assert.equal(result.totalWeeklyWage, 495360);
  assert.equal(result.grossMonthlyWage, 2152339);
  assert.equal(result.isEstimate, true);
  assert.equal(result.calculationModel.id, '40h_5day_proportional_comparison');
  assert.equal(result.calculationModel.weeksPerMonth, 4.345);
  assert.equal(result.calculationModel.roundingPolicy, 'floor_weekly_components_then_monthly_totals');
  assert.equal(result.calculationModel.isStatutoryMonthlyMinimum, false);
  assert.ok(result.sources.includes('https://www.law.go.kr/expcInfoP.do?expcSeq=340053'));
});

test('weekly calculation rejects invalid numeric and condition inputs instead of fabricating defaults', () => {
  for (const value of [NaN, Infinity, -1]) {
    assert.throws(() => calculateWeeklyAllowance({ hourlyWage: value }), RangeError);
    assert.throws(() => calculateWeeklyAllowance({ weeklyHours: value }), RangeError);
  }
  assert.throws(() => calculateWeeklyAllowance({ weeklyHours: 169 }), RangeError);
  assert.throws(() => calculateWeeklyAllowance({ hourlyWage: Number.MAX_SAFE_INTEGER }), RangeError);
  assert.throws(() => calculateWeeklyAllowance({ taxType: 'unsupported' }), RangeError);
  assert.throws(() => calculateWeeklyAllowance({ completedScheduledDays: 'false' }), RangeError);
});

test('weekly HTTP accepts explicit confirmations and rejects blank/nonfinite or malformed inputs', async () => {
  const base = 'https://api.oiyo.net/v1/labor/kr/weekly-allowance';
  for (const query of ['hourlyWage=', 'hours=', 'hourlyWage=NaN', 'hours=Infinity', 'hours=-1', 'hours=169', 'tax=', 'tax=other', 'employedWholeWeek=1', 'completedScheduledDays=']) {
    assert.equal((await worker.fetch(new Request(`${base}?${query}`))).status, 400, query);
  }
  const response = await worker.fetch(new Request(`${base}?hourlyWage=10000&hours=20&employedWholeWeek=true&completedScheduledDays=true`));
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.isEligible, true);
  assert.equal(result.hourlyWage, 10000);
  assert.equal(result.weeklyAllowance, 40000);
  const missing = await (await worker.fetch(new Request(base))).json();
  assert.equal(missing.isEligible, null);
  const absent = await (await worker.fetch(new Request(`${base}?hours=20&employedWholeWeek=true&completedScheduledDays=false`))).json();
  assert.equal(absent.weeklyAllowance, 0);
  const head = await worker.fetch(new Request(base, { method: 'HEAD' }));
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
});

test('published OpenAPI states nullable eligibility, condition inputs and the monthly comparison limitation', async () => {
  const spec = await (await worker.fetch(new Request('https://api.oiyo.net/openapi.json'))).json();
  const endpoint = spec.paths['/v1/labor/kr/weekly-allowance'].get;
  assert.ok(endpoint.parameters.some(parameter => parameter.name === 'employedWholeWeek'));
  assert.ok(endpoint.parameters.some(parameter => parameter.name === 'completedScheduledDays'));
  assert.equal(endpoint.responses['200'].content['application/json'].schema.properties.isEligible.nullable, true);
  assert.match(endpoint.description, /4\.345/);
  assert.match(endpoint.description, /209/);
  assert.ok(endpoint.responses['400']);
});
