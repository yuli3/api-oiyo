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

/**
 * Calculates South Korea 2026 Net Salary and 4 Major Insurances (실수령액 모의계산)
 * @param {Object} params
 * @param {number} [params.salary=3500000] - Salary in KRW
 * @param {boolean} [params.isAnnual=false] - Whether salary is annual or monthly
 * @param {number} [params.nonTaxable=200000] - Non-taxable income (식대 등 비과세, default 200,000)
 * @param {number} [params.dependents=1] - Number of dependents (본인 포함 부양가족 수)
 */
export function calculateNetSalary({
  salary = 3500000,
  isAnnual = false,
  nonTaxable = 200000,
  dependents = 1,
}) {
  const grossMonthly = isAnnual ? Math.floor(salary / 12) : Math.floor(salary);
  const nonTax = Math.min(grossMonthly, Math.max(0, Number(nonTaxable) || 0));
  const taxable = Math.max(0, grossMonthly - nonTax);

  // 1. National Pension (국민연금) 4.5% (기준소득월액 상한 6,170,000원, 하한 390,000원)
  const pensionBase = Math.min(6170000, Math.max(390000, taxable));
  const nationalPension = Math.round(pensionBase * 0.045);

  // 2. Health Insurance (건강보험) 3.545%
  const healthInsurance = Math.round(taxable * 0.03545);

  // 3. Long-term Care Insurance (장기요양보험) 건강보험료의 12.95%
  const longTermCare = Math.round(healthInsurance * 0.1295);

  // 4. Employment Insurance (고용보험) 0.9%
  const employmentInsurance = Math.round(taxable * 0.009);

  const totalInsurance = nationalPension + healthInsurance + longTermCare + employmentInsurance;

  // 5. Income Tax (근로소득세 간이세액 추정치: 국세청 간이세액표 2026 기준 다단계 누진공식)
  const depCount = Math.max(1, Number(dependents) || 1);
  let incomeTax = 0;
  if (taxable > 1060000) {
    if (taxable <= 3000000) {
      incomeTax = Math.floor((taxable - 1000000) * 0.03);
    } else if (taxable <= 5000000) {
      incomeTax = Math.floor(60000 + (taxable - 3000000) * 0.08);
    } else if (taxable <= 8000000) {
      incomeTax = Math.floor(220000 + (taxable - 5000000) * 0.16);
    } else {
      incomeTax = Math.floor(700000 + (taxable - 8000000) * 0.24);
    }
    // 부양가족 감면 (1인 초과당 약 15,000원 감면)
    if (depCount > 1) {
      incomeTax = Math.max(0, incomeTax - (depCount - 1) * 15000);
    }
  }

  // 6. Local Income Tax (지방소득세) 소득세의 10%
  const localTax = Math.floor(incomeTax * 0.1);
  const totalTax = incomeTax + localTax;

  const totalDeductions = totalInsurance + totalTax;
  const netPay = grossMonthly - totalDeductions;
  const deductionRate = grossMonthly > 0 ? Number(((totalDeductions / grossMonthly) * 100).toFixed(2)) : 0;

  return {
    year: 2026,
    grossMonthly,
    grossAnnual: grossMonthly * 12,
    nonTaxable: nonTax,
    taxable,
    insurances: {
      nationalPension,
      healthInsurance,
      longTermCare,
      employmentInsurance,
      totalInsurance,
    },
    taxes: {
      incomeTax,
      localTax,
      totalTax,
    },
    totalDeductions,
    netPayMonthly: netPay,
    netPayAnnual: netPay * 12,
    deductionRatePercentage: deductionRate,
  };
}

/**
 * Calculates South Korea Statutory Severance Pay (법정 퇴직금 계산)
 * Statutory reference: Act on the Guarantee of Employees' Retirement Benefits Art. 8
 * @param {Object} params
 * @param {string} params.startDate - Enlistment / join date (YYYY-MM-DD)
 * @param {string} params.endDate - Resignation / leave date (YYYY-MM-DD)
 * @param {number} [params.threeMonthSalary=9000000] - Total base salary of last 3 months
 * @param {number} [params.annualBonus=0] - Total annual bonuses (연간 상여금 총액)
 * @param {number} [params.annualLeaveAllowance=0] - Unused annual leave allowance paid in past year
 * @param {number} [params.hourlyWage=10030] - Ordinary hourly wage for comparison
 * @param {number} [params.dailyHours=8] - Contractual hours per day
 */
export function calculateSeverancePay({
  startDate,
  endDate,
  threeMonthSalary = 9000000,
  annualBonus = 0,
  annualLeaveAllowance = 0,
  hourlyWage = 10030,
  dailyHours = 8,
}) {
  const start = new Date(startDate || "2024-01-01");
  const end = new Date(endDate || "2026-01-01");
  const diffTime = end.getTime() - start.getTime();
  const serviceDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1);

  const isEligible = serviceDays >= 365;

  // 3-month bonus and leave share
  const bonusShare = Math.floor((Number(annualBonus) || 0) * (3 / 12));
  const leaveShare = Math.floor((Number(annualLeaveAllowance) || 0) * (3 / 12));
  const totalThreeMonthWage = (Number(threeMonthSalary) || 0) + bonusShare + leaveShare;

  // Standard 3-month day count: approx 91~92 days
  const threeMonthDays = 92;
  const dailyAverageWage = totalThreeMonthWage > 0 ? Math.floor(totalThreeMonthWage / threeMonthDays) : 0;

  // Ordinary daily wage check (통상임금 비교: 근로기준법 제2조 제2항)
  const wage = Math.max(10030, Number(hourlyWage) || 10030);
  const hours = Math.max(1, Math.min(8, Number(dailyHours) || 8));
  const dailyOrdinaryWage = wage * hours;

  const effectiveDailyWage = Math.max(dailyAverageWage, dailyOrdinaryWage);

  // Formula: (1일 평균임금 x 30일) x (재직일수 / 365)
  const severancePay = isEligible
    ? Math.floor(effectiveDailyWage * 30 * (serviceDays / 365))
    : 0;

  return {
    year: 2026,
    serviceDays,
    isEligible,
    dailyAverageWage,
    dailyOrdinaryWage,
    effectiveDailyWage,
    appliedWageType: effectiveDailyWage === dailyOrdinaryWage ? "ordinary_wage" : "average_wage",
    severancePay,
  };
}

/**
 * Calculates South Korea Statutory Annual Leave Entitlement & Unused Allowance (연차유급휴가 및 연차수당)
 * Statutory reference: Labor Standards Act Art. 60, 61
 * @param {Object} params
 * @param {number} [params.yearsOfService=1] - Completed years of service
 * @param {number} [params.hourlyWage=10030] - Ordinary hourly wage in KRW
 * @param {number} [params.dailyHours=8] - Contractual working hours per day
 * @param {number} [params.unusedDays=0] - Remaining unused leave days
 */
export function calculateAnnualLeave({
  yearsOfService = 1,
  hourlyWage = 10030,
  dailyHours = 8,
  unusedDays = 0,
}) {
  const years = Math.max(0, Number(yearsOfService) || 0);
  const wage = Math.max(10030, Number(hourlyWage) || 10030);
  const hours = Math.max(1, Math.min(8, Number(dailyHours) || 8));
  const unused = Math.max(0, Number(unusedDays) || 0);

  let statutoryDays = 0;
  if (years < 1) {
    statutoryDays = 11; // 1년 미만 매월 1일 개근 시 최대 11일
  } else {
    // 1년 이상: 기본 15일 + 3년차부터 매 2년마다 1일 가산, 최대 25일
    const additionalDays = Math.floor((years - 1) / 2);
    statutoryDays = Math.min(25, 15 + additionalDays);
  }

  const dailyWage = wage * hours;
  const unusedAllowance = Math.floor(unused * dailyWage);

  return {
    year: 2026,
    yearsOfService: years,
    statutoryLeaveDays: statutoryDays,
    dailyOrdinaryWage: dailyWage,
    unusedDays: unused,
    unusedLeaveAllowance: unusedAllowance,
  };
}


