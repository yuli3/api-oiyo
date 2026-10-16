// Labor calculation module for South Korea (2026 standards)
// Statutory references:
// - Unemployment benefits: Employment Insurance Act Art. 40-50
// - Weekly holiday allowance: Labor Standards Act Art. 55, Enforcement Decree Art. 30

const MIN_WAGE_2026 = 10030; // 2026 statutory minimum wage
const MAX_DAILY_BENEFIT = 66000; // Statutory cap

const DAYS_TABLE = {
  under: { p1: 120, p2: 150, p3: 180, p4: 210, p5: 240 },
  over: { p1: 120, p2: 180, p3: 210, p4: 240, p5: 270 },
};

/**
 * Calculates South Korea unemployment benefits (구직급여 모의계산)
 * @param {Object} params
 * @param {number} params.monthlyWage - Pre-tax monthly average wage (KRW)
 * @param {'under' | 'over'} [params.ageGroup='under'] - 'under' (<50 yrs) or 'over' (>=50 yrs or disabled)
 * @param {'p1'|'p2'|'p3'|'p4'|'p5'} [params.periodCode='p3'] - Insurance tenure code
 * @param {number} [params.hoursPerDay=8] - Daily working hours (1~8)
 */
export function calculateUnemploymentBenefits({
  monthlyWage = 3000000,
  ageGroup = "under",
  periodCode = "p3",
  hoursPerDay = 8,
}) {
  const effectiveHours = Math.max(1, Math.min(8, Number(hoursPerDay) || 8));
  const minDailyBenefit = Math.floor(MIN_WAGE_2026 * 0.8 * effectiveHours);

  const estimatedDailyWage = (Number(monthlyWage) || 0) / 30;
  let dailyBenefit = Math.floor(estimatedDailyWage * 0.6);

  let limitType = "standard";
  if (dailyBenefit >= MAX_DAILY_BENEFIT) {
    dailyBenefit = MAX_DAILY_BENEFIT;
    limitType = "cap_applied";
  } else if (dailyBenefit <= minDailyBenefit) {
    dailyBenefit = minDailyBenefit;
    limitType = "floor_applied";
  }

  const groupKey = ageGroup === "over" ? "over" : "under";
  const pKey = DAYS_TABLE[groupKey][periodCode] ? periodCode : "p3";
  const days = DAYS_TABLE[groupKey][pKey];
  const totalBenefit = dailyBenefit * days;
  const monthlyEquivalent = dailyBenefit * 30;

  return {
    year: 2026,
    statutoryMinimumWage: MIN_WAGE_2026,
    dailyBenefit,
    limitType,
    minDailyFloor: minDailyBenefit,
    maxDailyCap: MAX_DAILY_BENEFIT,
    scheduledDays: days,
    totalBenefit,
    monthlyEquivalent,
    isTaxFree: true,
  };
}

/**
 * Calculates South Korea weekly holiday allowance (주휴수당 계산)
 * @param {Object} params
 * @param {number} [params.hourlyWage=10030] - Hourly wage in KRW (min 10,030)
 * @param {number} [params.weeklyHours=20] - Total contractual hours per week
 * @param {'none'|'freelance'|'four'} [params.taxType='none'] - Deductions: 'none' (0%), 'freelance' (3.3%), 'four' (~9.4%)
 */
export function calculateWeeklyAllowance({
  hourlyWage = 10030,
  weeklyHours = 20,
  taxType = "none",
}) {
  const wage = Math.max(10030, Number(hourlyWage) || 10030);
  const hours = Math.max(0, Number(weeklyHours) || 0);

  const isEligible = hours >= 15;

  let allowanceHours = 0;
  if (isEligible) {
    if (hours >= 40) {
      allowanceHours = 8;
    } else {
      allowanceHours = (hours / 40) * 8;
    }
  }

  const baseWeeklyWage = Math.floor(hours * wage);
  const weeklyAllowance = Math.floor(allowanceHours * wage);
  const totalWeeklyWage = baseWeeklyWage + weeklyAllowance;
  const effectiveHourlyWage = hours > 0 ? Math.floor(totalWeeklyWage / hours) : wage;

  // Monthly equivalent = weekly * 4.345 weeks
  const grossMonthlyWage = Math.floor(totalWeeklyWage * 4.345);

  let deductionRate = 0;
  if (taxType === "freelance") deductionRate = 0.033;
  else if (taxType === "four") deductionRate = 0.094;

  const netMonthlyWage = Math.floor(grossMonthlyWage * (1 - deductionRate));

  return {
    year: 2026,
    hourlyWage: wage,
    weeklyHours: hours,
    isEligible,
    allowanceHours: Number(allowanceHours.toFixed(2)),
    weeklyAllowance,
    effectiveHourlyWage,
    baseWeeklyWage,
    totalWeeklyWage,
    grossMonthlyWage,
    deductionRate,
    netMonthlyWage,
  };
}

/**
 * Calculates South Korea overtime, night, and holiday pay (연장·야간·휴일근로 가산수당)
 * Statutory reference: Labor Standards Act Art. 56
 * @param {Object} params
 * @param {number} [params.hourlyWage=10030] - Base regular hourly wage (KRW)
 * @param {number} [params.overtimeHours=0] - Overtime hours (hours exceeding 8h/day or 40h/week, 1.5x)
 * @param {number} [params.nightHours=0] - Night work hours (22:00 ~ 06:00, +0.5x)
 * @param {number} [params.holidayHours8orLess=0] - Holiday work up to 8 hours (1.5x)
 * @param {number} [params.holidayHoursOver8=0] - Holiday work exceeding 8 hours (2.0x)
 */
export function calculateOvertimePay({
  hourlyWage = 10030,
  overtimeHours = 0,
  nightHours = 0,
  holidayHours8orLess = 0,
  holidayHoursOver8 = 0,
}) {
  const wage = Math.max(10030, Number(hourlyWage) || 10030);
  const otH = Math.max(0, Number(overtimeHours) || 0);
  const ntH = Math.max(0, Number(nightHours) || 0);
  const hol8H = Math.max(0, Number(holidayHours8orLess) || 0);
  const holOverH = Math.max(0, Number(holidayHoursOver8) || 0);

  // Overtime pay: 150% (base 100% + premium 50%)
  const overtimePay = Math.floor(otH * wage * 1.5);

  // Night work premium: +50% addition (if already in overtime or standard shift)
  const nightPay = Math.floor(ntH * wage * 0.5);

  // Holiday work: 150% for first 8 hours, 200% for hours exceeding 8 hours
  const holidayPayUnder8 = Math.floor(hol8H * wage * 1.5);
  const holidayPayOver8 = Math.floor(holOverH * wage * 2.0);
  const totalHolidayPay = holidayPayUnder8 + holidayPayOver8;

  const totalExtraPay = overtimePay + nightPay + totalHolidayPay;

  return {
    year: 2026,
    baseHourlyWage: wage,
    overtime: {
      hours: otH,
      rate: 1.5,
      pay: overtimePay,
    },
    night: {
      hours: ntH,
      rate: 0.5,
      pay: nightPay,
    },
    holiday: {
      hoursUnder8: hol8H,
      hoursOver8: holOverH,
      payUnder8: holidayPayUnder8,
      payOver8: holidayPayOver8,
      totalPay: totalHolidayPay,
    },
    totalExtraPay,
  };
}

