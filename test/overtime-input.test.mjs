import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateOvertimePay } from '../src/modules/labor.mjs';
import worker from '../src/worker.mjs';

test('overtime public function rejects invalid input and unrepresentable results', () => {
  for (const field of ['hourlyWage','overtimeHours','nightHours','holidayHours8orLess','holidayHoursOver8']) {
    for (const value of [-1, NaN, Infinity]) assert.throws(() => calculateOvertimePay({[field]:value}),RangeError,field);
  }
  assert.throws(()=>calculateOvertimePay({hourlyWage:Number.MAX_SAFE_INTEGER,overtimeHours:2}),RangeError);
  assert.equal(calculateOvertimePay({hourlyWage:12000,overtimeHours:0.5,nightHours:1}).totalExtraPay,15000);
});

test('overtime HTTP rejects blank, negative and nonfinite fields but keeps omitted defaults', async () => {
  for (const field of ['hourlyWage','overtimeHours','nightHours','holidayHours8orLess','holidayHoursOver8']) {
    for (const value of ['', '-1','NaN','Infinity','nope']) {
      const r=await worker.fetch(new Request(`https://api.oiyo.net/v1/labor/kr/overtime-pay?${field}=${value}`));
      assert.equal(r.status,400,`${field}=${value}`);
    }
  }
  const r=await worker.fetch(new Request('https://api.oiyo.net/v1/labor/kr/overtime-pay?hourlyWage=12000&overtimeHours=0.5&nightHours=1'));
  assert.equal(r.status,200);assert.equal((await r.json()).totalExtraPay,15000);
  assert.equal((await worker.fetch(new Request('https://api.oiyo.net/v1/labor/kr/overtime-pay'))).status,200);
});
