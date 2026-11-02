import {test} from 'node:test';
import assert from 'node:assert/strict';
import {calculateSeverancePay} from '../src/modules/labor.mjs';
import {calculateHealthInsurance} from '../src/modules/insurance.mjs';
import worker from '../src/worker.mjs';
const base={startDate:'2024-01-01',endDate:'2026-01-01',threeMonthSalary:9000000};
test('severance never turns missing or mixed whole-period hours into entitlement',async()=>{
 for(const condition of ['unknown','mixed']){
  const r=calculateSeverancePay({...base,weeklyHoursCondition:condition});assert.equal(r.isEligible,null);assert.equal(r.severancePay,null);assert.equal(r.meetsServiceYear,true);
 }
 assert.equal(calculateSeverancePay(base).isEligible,null);
 const below=calculateSeverancePay({...base,weeklyHoursCondition:'all_below_15'});assert.equal(below.isEligible,false);assert.equal(below.severancePay,0);
 const yes=calculateSeverancePay({...base,weeklyHoursCondition:'all_at_least_15'});assert.equal(yes.isEligible,true);assert.ok(yes.severancePay>0);assert.equal(yes.eligibility.isFinalDecision,false);
 const url='https://api.oiyo.net/v1/labor/kr/severance-pay?'+new URLSearchParams(base);
 const omitted=await worker.fetch(new Request(url));assert.equal((await omitted.json()).severancePay,null);
 for(const value of ['true','','all_at_least_15 '])assert.equal((await worker.fetch(new Request(url+'&weeklyHoursCondition='+encodeURIComponent(value)))).status,400);
});
test('dependent income screening cannot decide unmodeled family and statutory exceptions',async()=>{
 for(const input of [{},{businessIncome:25000000},{hasBusinessRegistration:true,businessIncome:1000}]){
  const r=calculateHealthInsurance(input).dependentEligibility;assert.equal(r.isEligible,null);assert.equal(r.status,'review_required');assert.equal(r.isFinalDecision,false);assert.ok(r.unassessedCriteria.length>=5);assert.ok(r.source.startsWith('https://www.nhis.or.kr/'));
 }
 const r=await worker.fetch(new Request('https://api.oiyo.net/v1/insurance/health'));assert.equal((await r.json()).dependentEligibility.isEligible,null);
});
