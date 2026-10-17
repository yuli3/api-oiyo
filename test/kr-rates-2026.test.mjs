// SSOT checks for src/modules/kr-rates-2026.mjs (2026-10-17, FAANG audit A-1, S-1~S-4).
// 1) Pins every 2026 value so a yearly change is a deliberate, reviewed edit.
// 2) Asserts parity with blog/src/lib/kr-payroll-2026.ts (Claude, verified 2026-10-12).
//    The blog checkout is found via OIYO_BLOG_DIR or a sibling path; CI has no blog checkout,
//    so the live-file comparison is skipped there and the pinned snapshot below still runs.
// 3) One official-value test vector per calculator.
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  KR_RATES_2026,
  RATES_EFFECTIVE_FROM,
  employeeInsurance2026,
  netSalary2026,
  pensionBounds,
  unemploymentDailyBenefit2026,
  unemploymentDays2026,
  parentalLeaveSchedule2026,
  regionalPropertyScore2026,
  regionalHealthPremium2026,
  earnedIncomeDeduction,
  progressiveIncomeTax,
  earnedIncomeTaxCredit,
} from "../src/modules/kr-rates-2026.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Flat RATES of blog/src/lib/kr-payroll-2026.ts mapped to this module.
const BLOG_KEYS = {
  minimumWage: KR_RATES_2026.minimumWage,
  pensionEmployee: KR_RATES_2026.pension.employee,
  healthEmployee: KR_RATES_2026.health.employee,
  longTermCareOfHealth: KR_RATES_2026.health.longTermCareOfHealth,
  employmentEmployee: KR_RATES_2026.employment.employee,
};
const BLOG_SNAPSHOT_2026_10_12 = {
  minimumWage: 10_320,
  pensionEmployee: 0.0475,
  healthEmployee: 0.03595,
  longTermCareOfHealth: 0.1314,
  employmentEmployee: 0.009,
};

function findBlogPayroll() {
  const candidates = [
    process.env.OIYO_BLOG_DIR,
    resolve(repoRoot, "../blog"),
    resolve(repoRoot, "../../blog"),
  ].filter(Boolean);
  for (const dir of candidates) {
    const file = resolve(dir, "src/lib/kr-payroll-2026.ts");
    if (existsSync(file)) return file;
  }
  return null;
}

function parseBlogRates(source) {
  const block = source.match(/export const RATES = \{([\s\S]*?)\} as const;/);
  assert.ok(block, "RATES block not found in blog kr-payroll-2026.ts");
  const out = {};
  for (const m of block[1].matchAll(/^\s*(\w+):\s*([\d_.]+),/gm)) out[m[1]] = Number(m[2].replaceAll("_", ""));
  return out;
}

test("pins 2026 statutory values", () => {
  assert.equal(RATES_EFFECTIVE_FROM, "2026-01-01");
  assert.equal(KR_RATES_2026.minimumWage, 10320);
  assert.equal(KR_RATES_2026.pension.total, 0.095);
  assert.equal(KR_RATES_2026.pension.employee, 0.0475);
  assert.deepEqual(pensionBounds("2026-03"), { fromMonth: "2025-07", toMonth: "2026-06", floor: 400000, cap: 6370000 });
  assert.deepEqual(pensionBounds("2026-07"), { fromMonth: "2026-07", toMonth: "2027-06", floor: 410000, cap: 6590000 });
  assert.equal(KR_RATES_2026.health.total, 0.0719);
  assert.equal(KR_RATES_2026.health.employee, 0.03595);
  assert.equal(KR_RATES_2026.health.longTermCareRate, 0.009448);
  assert.equal(KR_RATES_2026.health.longTermCareOfHealth, 0.1314);
  assert.equal(KR_RATES_2026.health.monthlyFloor, 20160);
  assert.equal(KR_RATES_2026.regional.incomeRate, 0.0719);
  assert.equal(KR_RATES_2026.regional.pointValue, 211.5);
  assert.equal(KR_RATES_2026.regional.propertyBasicDeduction, 100_000_000);
  assert.equal(KR_RATES_2026.regional.propertyScoreTable.length, 60);
  assert.equal(KR_RATES_2026.employment.employee, 0.009);
  assert.equal(KR_RATES_2026.unemployment.dailyCap, 68100);
  assert.equal(KR_RATES_2026.unemployment.dailyFloor8h, 66048);
  assert.equal(KR_RATES_2026.unemployment.dailyFloor8h, Math.floor(KR_RATES_2026.minimumWage * 0.8 * 8));
  assert.equal(KR_RATES_2026.parentalLeave.deferredShare, 0);
  assert.deepEqual(KR_RATES_2026.parentalLeave.sixPlusSixCaps, [2500000, 2500000, 3000000, 3500000, 4000000, 4500000]);
  assert.ok(Object.isFrozen(KR_RATES_2026.pension.bounds[0]));
});

test("parity with blog kr-payroll-2026.ts (pinned snapshot)", () => {
  assert.deepEqual(BLOG_KEYS, BLOG_SNAPSHOT_2026_10_12);
});

test("parity with blog kr-payroll-2026.ts (live file)", (t) => {
  const file = findBlogPayroll();
  if (!file) {
    t.skip("blog checkout not found; set OIYO_BLOG_DIR to run the live parity check");
    return;
  }
  const blog = parseBlogRates(readFileSync(file, "utf8"));
  for (const [key, value] of Object.entries(BLOG_KEYS)) {
    assert.equal(blog[key], value, `blog RATES.${key}`);
  }
});

test("vector: 실수령액 월 350만·비과세 20만·1인", () => {
  const r = netSalary2026({ salary: 3_500_000, nonTaxable: 200_000, dependents: 1 });
  assert.equal(r.taxable, 3_300_000);
  assert.equal(r.insurances.nationalPension, 156_750); // was 148,500 (4.5%)
  assert.equal(r.insurances.healthInsurance, 118_635); // was 116,985 (3.545%)
  assert.equal(r.insurances.longTermCare, 15_585); // was 15,150 (12.95%)
  assert.equal(r.insurances.employmentInsurance, 29_700);
  assert.equal(r.taxes.isEstimate, true);
});

test("vector: 4대보험 상·하한", () => {
  assert.equal(employeeInsurance2026(10_000_000).pensionBase, 6_590_000);
  assert.equal(employeeInsurance2026(10_000_000, { payMonth: "2026-01" }).pensionBase, 6_370_000);
  assert.equal(employeeInsurance2026(200_000).pensionBase, 410_000);
  assert.equal(employeeInsurance2026(200_000, { payMonth: "2026-06" }).pensionBase, 400_000);
  // 건강보험 보수월액보험료 하한 20,160원(전체) → 근로자 10,080원.
  assert.equal(employeeInsurance2026(100_000).healthInsurance, 10_080);
});

test("vector: 근로소득세 추정 구성요소", () => {
  assert.equal(earnedIncomeDeduction(39_600_000), 11_190_000); // 750만 + (3,960만−1,500만)×15%
  assert.equal(earnedIncomeDeduction(500_000_000), 20_000_000); // 한도
  assert.equal(progressiveIncomeTax(14_000_000), 840_000);
  assert.equal(progressiveIncomeTax(50_000_000), 840_000 + 5_400_000);
  assert.equal(earnedIncomeTaxCredit(1_000_000, 30_000_000), 550_000);
  assert.equal(earnedIncomeTaxCredit(3_000_000, 30_000_000), 740_000); // 한도 74만
  assert.equal(netSalary2026({ salary: 1_060_000, nonTaxable: 0 }).taxes.incomeTax, 0);
});

test("vector: 구직급여 하한·상한 (2026-01-01 이후 이직자)", () => {
  assert.equal(unemploymentDailyBenefit2026({ monthlyWage: 2_000_000 }).dailyBenefit, 66_048); // was 64,192
  assert.equal(unemploymentDailyBenefit2026({ monthlyWage: 5_000_000 }).dailyBenefit, 68_100); // was 66,000
  assert.equal(unemploymentDailyBenefit2026({ monthlyWage: 1_000_000, hoursPerDay: 4 }).dailyBenefit, 33_024); // 1350 상담 4H 표
  assert.equal(unemploymentDailyBenefit2026({ monthlyWage: 3_300_000 }).dailyBenefit, 66_048); // 110,000 × 60% = 66,000 < 하한
  assert.equal(unemploymentDailyBenefit2026({ monthlyWage: 3_390_000 }).dailyBenefit, 67_800); // 113,000 × 60%
  assert.equal(unemploymentDays2026("over", "p5"), 270);
  assert.equal(68_100 * 270 - 66_000 * 270, 567_000); // audit S-2: max under-statement
});

test("vector: 육아휴직급여 (사후지급 없음, 6+6 첫 달 250만)", () => {
  const g = parentalLeaveSchedule2026({ monthlyWage: 3_000_000, leaveMonths: 12 });
  assert.equal(g.totalBenefit, 23_100_000);
  assert.ok(g.monthlyBreakdown.every((m) => m.deferredAmount === 0 && m.upfrontPaid === m.grossAmount));
  const s = parentalLeaveSchedule2026({ monthlyWage: 5_000_000, leaveMonths: 7, isParental6Plus6: true });
  assert.equal(s.monthlyBreakdown[0].grossAmount, 2_500_000); // was 2,000,000
  assert.equal(s.monthlyBreakdown[6].grossAmount, 1_600_000);
});

test("vector: 지역가입자 건강보험료", () => {
  assert.equal(regionalPropertyScore2026(90_000_000), 0); // was 117 (5천만 공제)
  assert.equal(regionalPropertyScore2026(100_000_000), 0);
  assert.equal(regionalPropertyScore2026(104_500_000), 22); // 순 450만 → 1등급
  assert.equal(regionalPropertyScore2026(200_000_000), 439); // 순 1억 → 18등급
  assert.equal(regionalPropertyScore2026(10_000_000_000), 2_341); // 60등급

  const propertyOnly = regionalHealthPremium2026({ propertyTaxBase: 200_000_000 });
  assert.equal(propertyOnly.healthPremium, 113_000); // 20,160 + 439 × 211.5 = 113,008.5 → 10원 미만 절사
  assert.equal(propertyOnly.carePremium, 14_840);

  const business = regionalHealthPremium2026({ businessIncome: 30_000_000 });
  assert.equal(business.healthPremium, 179_750); // 250만 × 7.19%
  assert.equal(business.carePremium, 23_620); // 179,750 × 0.9448 / 7.19

  // 금융소득 1천만 이하 미반영, 근로·연금 50% 반영.
  assert.equal(regionalHealthPremium2026({ financialIncome: 10_000_000 }).assessedAnnualIncome, 0);
  assert.equal(regionalHealthPremium2026({ financialIncome: 12_000_000 }).assessedAnnualIncome, 12_000_000);
  assert.equal(regionalHealthPremium2026({ earnedOrPensionIncome: 24_000_000 }).assessedAnnualIncome, 12_000_000);
});
