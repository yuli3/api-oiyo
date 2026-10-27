// Labor calculation module for South Korea (2026 standards)
// Statutory references:
// - Unemployment benefits: Employment Insurance Act Art. 40-50
// - Weekly holiday allowance: Labor Standards Act Art. 55, Enforcement Decree Art. 30
//
// 2026-10-17: every rate now comes from ./kr-rates-2026.mjs (SSOT shared with tools and
// checked against blog kr-payroll-2026.ts). Do not add numeric rates here.
// Rate values match the Codex WIP branch codex/labor-accuracy-20261017 (10,320 / 68,100 /
// 4.75% / 3.595% / 13.14%), which first corrected them; this module centralizes them.

import {
  KR_RATES_2026,
  RATES_EFFECTIVE_FROM,
  netSalary2026,
  unemploymentDailyBenefit2026,
  unemploymentDays2026,
  parentalLeaveSchedule2026,
  employeeInsurance2026,
} from "./kr-rates-2026.mjs";

const MIN_WAGE_2026 = KR_RATES_2026.minimumWage;

// 2026-10-18: invalid payroll inputs must not become plausible defaults or JSON null.
function requireAmount(name, value, minimum = 0, maximum = Number.MAX_SAFE_INTEGER) {
  if (!Number.isFinite(value) || value < minimum || value > maximum) {
    throw new RangeError(`${name} must be finite and between ${minimum} and ${maximum}`);
  }
}

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
  const daily = unemploymentDailyBenefit2026({ monthlyWage, hoursPerDay });
  const days = unemploymentDays2026(ageGroup, periodCode);

  return {
    year: 2026,
    ratesEffectiveFrom: RATES_EFFECTIVE_FROM,
    statutoryMinimumWage: MIN_WAGE_2026,
    dailyBenefit: daily.dailyBenefit,
    limitType: daily.limitType,
    minDailyFloor: daily.minDailyFloor,
    maxDailyCap: daily.maxDailyCap,
    scheduledDays: days,
    totalBenefit: daily.dailyBenefit * days,
    monthlyEquivalent: daily.dailyBenefit * 30,
    isTaxFree: true,
  };
}

/**
 * Calculates South Korea weekly holiday allowance (주휴수당 계산)
 * @param {Object} params
 * @param {number} [params.hourlyWage=10320] - Entered hourly wage in KRW; below-minimum values are warned, not replaced
 * @param {number} [params.weeklyHours=20] - Four-week average contractual hours (actual employment period if shorter)
 * @param {boolean} [params.employedWholeWeek] - Self-confirmed seven-day employment relationship, not next-week employment
 * @param {boolean} [params.completedScheduledDays] - Self-confirmed attendance on obligated working days; public holidays without work obligation are not absence
 * @param {'none'|'freelance'|'four'} [params.taxType='none'] - Deductions: 'none' (0%), 'freelance' (3.3%), 'four' (~9.7%, 2026 근로자 부담 4대보험)
 */
export function calculateWeeklyAllowance({
  hourlyWage = MIN_WAGE_2026,
  weeklyHours = 20,
  taxType = "none",
  employedWholeWeek,
  completedScheduledDays,
}) {
  requireAmount('hourlyWage', hourlyWage);
  requireAmount('weeklyHours', weeklyHours, 0, 168);
  const wage = hourlyWage;
  const hours = weeklyHours;
  const warnings = wage < MIN_WAGE_2026 ? ['below_2026_minimum_wage'] : [];
  if (!['none', 'freelance', 'four'].includes(taxType)) throw new RangeError('taxType must be none, freelance or four');
  if (hours > 40) warnings.push('overtime_premiums_not_included');
  if (taxType === 'freelance') warnings.push('deduction_mode_does_not_determine_worker_status');

  for (const [name, value] of Object.entries({ employedWholeWeek, completedScheduledDays })) {
    if (value !== undefined && typeof value !== 'boolean') throw new RangeError(`${name} must be true or false when supplied`);
  }
  const hoursThresholdMet = hours >= 15;
  // WHY 2026-10-23: hours alone cannot establish weekly-holiday entitlement.
  // Unknown conditions retain a clearly marked what-if amount, not a grant decision.
  const isEligible = !hoursThresholdMet || employedWholeWeek === false || completedScheduledDays === false
    ? false : employedWholeWeek === true && completedScheduledDays === true ? true : null;

  let allowanceHours = 0;
  if (isEligible !== false) {
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
  // 2026 근로자 부담 4대보험 비율(국민연금·건강·장기요양·고용, 상하한 무시)을 정본에서 계산한다.
  else if (taxType === "four") deductionRate = employeeInsuranceRate2026();

  const netMonthlyWage = Math.floor(grossMonthlyWage * (1 - deductionRate));
  for (const [name, value] of Object.entries({ baseWeeklyWage, weeklyAllowance, totalWeeklyWage, grossMonthlyWage, netMonthlyWage })) {
    requireAmount(name, value);
  }

  return {
    year: 2026,
    ratesEffectiveFrom: RATES_EFFECTIVE_FROM,
    isEstimate: true,
    hourlyWage: wage,
    statutoryMinimumWage: MIN_WAGE_2026,
    warnings,
    weeklyHours: hours,
    isEligible,
    eligibility: {
      status: isEligible === null ? 'unknown' : isEligible ? 'self_confirmed' : 'conditions_not_met',
      hoursThresholdMet,
      employedWholeWeek: employedWholeWeek ?? null,
      completedScheduledDays: completedScheduledDays ?? null,
      isLegalDetermination: false,
      basis: 'Four-week average contractual hours (actual employment period if shorter); a seven-day employment relationship and attendance on obligated working days. No next-week employment requirement. Public holidays without a work obligation are not absence.',
    },
    allowanceAssumesEligibility: isEligible === null,
    calculationModel: {
      id: '40h_5day_proportional_comparison',
      description: 'Comparison assumes a normal 40-hour, five-day week: min(weekly contractual hours, 40) / 40 * 8. Other normal-work schedules may require a different calculation. Overtime premiums are excluded.',
      weeksPerMonth: 4.345,
      roundingPolicy: 'floor_weekly_components_then_monthly_totals',
      allowanceHoursDisplayDecimals: 2,
      isStatutoryMonthlyMinimum: false,
      monthlyCaveat: 'The 4.345-week projection is not an actual monthly payroll or the statutory 209-hour monthly minimum example. Component floors and monthly floors are comparison conventions, not a determination of legally required wage rounding.',
      deductionsCaveat: 'Deductions are a flat-rate scenario without insurance bases/caps, employment classification or individual income tax assessment.',
    },
    sources: [
      'https://1350.moel.go.kr/rtmview.do?id=1000278823&page=1&type=ALL',
      'https://1350.moel.go.kr/rtmview.do?id=1000320034',
      'https://www.law.go.kr/expcInfoP.do?expcSeq=340053',
    ],
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

function employeeInsuranceRate2026() {
  const sample = 3_000_000; // 상하한 밖이 아닌 금액에서 비율을 잰다
  return Number((employeeInsurance2026(sample).totalInsurance / sample).toFixed(4));
}

/**
 * Calculates South Korea overtime, night, and holiday pay (연장·야간·휴일근로 가산수당)
 * Statutory reference: Labor Standards Act Art. 56
 * @param {Object} params
 * @param {number} [params.hourlyWage=10320] - Base regular hourly wage (KRW)
 * @param {number} [params.overtimeHours=0] - Overtime hours (hours exceeding 8h/day or 40h/week, 1.5x)
 * @param {number} [params.nightHours=0] - Night work hours (22:00 ~ 06:00, +0.5x)
 * @param {number} [params.holidayHours8orLess=0] - Holiday work up to 8 hours (1.5x)
 * @param {number} [params.holidayHoursOver8=0] - Holiday work exceeding 8 hours (2.0x)
 */
export function calculateOvertimePay({
  hourlyWage = MIN_WAGE_2026,
  overtimeHours = 0,
  nightHours = 0,
  holidayHours8orLess = 0,
  holidayHoursOver8 = 0,
}) {
  // WHY 2026-10-25: silently replacing malformed wages/hours produces plausible pay.
  // Keep the existing minimum-wage policy, but reject invalid input before applying it.
  for (const [name, value] of Object.entries({ hourlyWage, overtimeHours, nightHours, holidayHours8orLess, holidayHoursOver8 })) requireAmount(name, value);
  const wage = Math.max(MIN_WAGE_2026, hourlyWage);
  const otH = overtimeHours;
  const ntH = nightHours;
  const hol8H = holidayHours8orLess;
  const holOverH = holidayHoursOver8;

  // Overtime pay: 150% (base 100% + premium 50%)
  const overtimePay = Math.floor(otH * wage * 1.5);

  // Night work premium: +50% addition (if already in overtime or standard shift)
  const nightPay = Math.floor(ntH * wage * 0.5);

  // Holiday work: 150% for first 8 hours, 200% for hours exceeding 8 hours
  const holidayPayUnder8 = Math.floor(hol8H * wage * 1.5);
  const holidayPayOver8 = Math.floor(holOverH * wage * 2.0);
  const totalHolidayPay = holidayPayUnder8 + holidayPayOver8;

  // 연장·휴일은 기본 100%를 포함한 총액, 야간은 가산 50%만이다. 합계는 "가산수당"만이 아니라 이 수당들의 합이다.
  // 가산 지급(제56조)은 상시 5명 이상 사업장에만 적용된다(제11조, 시행령 별표1).
  const totalExtraPay = overtimePay + nightPay + totalHolidayPay;
  for (const [name, value] of Object.entries({ overtimePay, nightPay, totalHolidayPay, totalExtraPay })) requireAmount(name, value);

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
    appliesTo: "상시 근로자 5명 이상 사업장 (근로기준법 제11조). 5명 미만이면 가산분 없이 일한 시간만큼만 받아요.",
  };
}

/**
 * Calculates South Korea 2026 Net Salary and 4 Major Insurances (실수령액 모의계산)
 * Insurance uses 2026 statutory rates; income tax is an annualized ESTIMATE (추정), not the
 * NTS 간이세액표 (2026-10-17: the old comment claimed the table but used an ad-hoc formula, audit A-2).
 * @param {Object} params
 * @param {number} [params.salary=3500000] - Salary in KRW
 * @param {boolean} [params.isAnnual=false] - Whether salary is annual or monthly
 * @param {number} [params.nonTaxable=200000] - Non-taxable income (식대 등 비과세, default 200,000)
 * @param {number} [params.dependents=1] - Number of dependents (본인 포함 부양가족 수)
 * @param {string} [params.payMonth="2026-07"] - Pay month YYYY-MM; selects pension base bounds (Jan–Jun 2026: 400k–6.37M, Jul 2026–: 410k–6.59M)
 */
export function calculateNetSalary({
  salary = 3500000,
  isAnnual = false,
  nonTaxable = 200000,
  dependents = 1,
  payMonth,
}) {
  const r = netSalary2026({ salary, isAnnual, nonTaxable, dependents, payMonth });
  const { insurances, taxes } = r;

  return {
    year: 2026,
    ratesEffectiveFrom: RATES_EFFECTIVE_FROM,
    grossMonthly: r.grossMonthly,
    grossAnnual: r.grossMonthly * 12,
    nonTaxable: r.nonTaxable,
    taxable: r.taxable,
    insurances: {
      nationalPension: insurances.nationalPension,
      healthInsurance: insurances.healthInsurance,
      longTermCare: insurances.longTermCare,
      employmentInsurance: insurances.employmentInsurance,
      totalInsurance: insurances.totalInsurance,
      pensionBase: insurances.pensionBase,
      pensionBaseBounds: insurances.pensionBounds,
    },
    taxes: {
      incomeTax: taxes.incomeTax,
      localTax: taxes.localTax,
      totalTax: taxes.totalTax,
      isEstimate: true,
      method: "annualized-estimate (not NTS simplified withholding table)",
    },
    totalDeductions: r.totalDeductions,
    netPayMonthly: r.netPayMonthly,
    netPayAnnual: r.netPayMonthly * 12,
    deductionRatePercentage: r.deductionRatePercentage,
    rates: {
      pensionEmployee: KR_RATES_2026.pension.employee,
      healthEmployee: KR_RATES_2026.health.employee,
      longTermCareOfHealth: KR_RATES_2026.health.longTermCareOfHealth,
      employmentEmployee: KR_RATES_2026.employment.employee,
    },
  };
}

/**
 * Calculates South Korea Statutory Severance Pay (법정 퇴직금 계산)
 * Statutory reference: Act on the Guarantee of Employees' Retirement Benefits Art. 8
 * @param {Object} params
 * @param {string} params.startDate - Enlistment / join date (YYYY-MM-DD)
 * @param {string} params.endDate - First date no longer employed, after last workday (YYYY-MM-DD)
 * @param {number} [params.threeMonthSalary=9000000] - Total base salary of last 3 months
 * @param {number} [params.annualBonus=0] - Total annual bonuses (연간 상여금 총액)
 * @param {number} [params.annualLeaveAllowance=0] - Unused annual leave allowance paid in past year
 * @param {number} [params.hourlyWage=10320] - Ordinary hourly wage for comparison
 * @param {number} [params.dailyHours=8] - Contractual hours per day
 */
export function calculateSeverancePay({
  startDate,
  endDate,
  threeMonthSalary = 9000000,
  annualBonus = 0,
  annualLeaveAllowance = 0,
  hourlyWage = MIN_WAGE_2026,
  dailyHours = 8,
}) {
  for (const [name, value] of Object.entries({ threeMonthSalary, annualBonus, annualLeaveAllowance, hourlyWage })) requireAmount(name, value);
  requireAmount("dailyHours", dailyHours, Number.MIN_VALUE, 8);
  // 2026-10-18: recover MOEL civil-date semantics lost during worktree cleanup.
  // Date otherwise silently normalizes February 30 or accepts time-of-day values.
  const parseDate = (value) => {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new RangeError("Dates must use YYYY-MM-DD");
    const date = new Date(`${value}T00:00:00Z`);
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0,10) !== value) throw new RangeError("Date does not exist");
    return date;
  };
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (end < start) throw new RangeError("End date precedes start date");
  const diffTime = end.getTime() - start.getTime();
  const serviceDays = Math.floor(diffTime / 86400000);

  // 2026-10-27: one calendar year is a tenure condition, unlike the /365
  // amount formula (MOEL Art. 4/8 guidance). Leap years can contain 365 days
  // before the first anniversary. Feb 29 rolls to March 1 in a non-leap year,
  // after completion of Feb 28; endDate is the first non-employed date.
  // Civil Act 159/160 calendar-period interpretation; not a full eligibility ruling.
  // https://www.law.go.kr/법령/민법/제160조
  const anniversary = new Date(start);
  anniversary.setUTCFullYear(start.getUTCFullYear() + 1);
  const isEligible = end >= anniversary;

  // 3-month bonus and leave share
  const bonusShare = Math.floor((Number(annualBonus) || 0) * (3 / 12));
  const leaveShare = Math.floor((Number(annualLeaveAllowance) || 0) * (3 / 12));
  const totalThreeMonthWage = (Number(threeMonthSalary) || 0) + bonusShare + leaveShare;

  // Calendar months differ in length; UTC avoids host timezone/DST drift.
  const month = end.getUTCMonth() - 3;
  const lastDay = new Date(Date.UTC(end.getUTCFullYear(), month + 1, 0)).getUTCDate();
  const periodStart = new Date(Date.UTC(end.getUTCFullYear(), month, Math.min(lastDay, end.getUTCDate())));
  const threeMonthDays = (end - periodStart) / 86400000;
  const dailyAverageWage = totalThreeMonthWage > 0 ? totalThreeMonthWage / threeMonthDays : 0;

  // Ordinary daily wage check (통상임금 비교: 근로기준법 제2조 제2항)
  const wage = Math.max(MIN_WAGE_2026, Number(hourlyWage) || MIN_WAGE_2026);
  const hours = dailyHours;
  const dailyOrdinaryWage = wage * hours;

  const effectiveDailyWage = Math.max(dailyAverageWage, dailyOrdinaryWage);

  // Formula: (1일 평균임금 x 30일) x (재직일수 / 365)
  const severancePay = isEligible
    ? Math.floor(effectiveDailyWage * 30 * (serviceDays / 365))
    : 0;

  for (const [name, value] of Object.entries({ totalThreeMonthWage, dailyOrdinaryWage, severancePay })) requireAmount(name, value);

  return {
    year: 2026,
    serviceDays,
    threeMonthDays,
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
 * @param {number} [params.hourlyWage=10320] - Ordinary hourly wage in KRW
 * @param {number} [params.dailyHours=8] - Contractual working hours per day
 * @param {number} [params.unusedDays=0] - Remaining unused leave days
 */
export function calculateAnnualLeave({
  yearsOfService = 1,
  hourlyWage = MIN_WAGE_2026,
  dailyHours = 8,
  unusedDays = 0,
  completedPerfectMonths,
}) {
  for (const [name, value] of Object.entries({ hourlyWage, unusedDays })) requireAmount(name, value);
  requireAmount("dailyHours", dailyHours, Number.MIN_VALUE, 8);
  if (!Number.isFinite(yearsOfService) || yearsOfService < 0) throw new RangeError("Invalid yearsOfService");
  const years = Math.max(0, Number(yearsOfService) || 0);
  const wage = Math.max(MIN_WAGE_2026, Number(hourlyWage) || MIN_WAGE_2026);
  const hours = dailyHours;
  const unused = Math.max(0, Number(unusedDays) || 0);

  let statutoryDays = 0;
  if (years < 1) {
    // 2026-10-18: 11 is a maximum, not an entitlement inferred from tenure.
    if (!Number.isInteger(completedPerfectMonths) || completedPerfectMonths < 0 || completedPerfectMonths > 11) {
      throw new RangeError("completedPerfectMonths is required (integer 0 to 11) for first-year accrual");
    }
    statutoryDays = completedPerfectMonths;
  } else {
    // 1년 이상: 기본 15일 + 3년차부터 매 2년마다 1일 가산, 최대 25일
    const additionalDays = Math.floor((years - 1) / 2);
    statutoryDays = Math.min(25, 15 + additionalDays);
  }

  const dailyWage = wage * hours;
  const unusedAllowance = Math.floor(unused * dailyWage);
  requireAmount("dailyOrdinaryWage", dailyWage);
  requireAmount("unusedLeaveAllowance", unusedAllowance);

  return {
    year: 2026,
    yearsOfService: years,
    statutoryLeaveDays: statutoryDays,
    dailyOrdinaryWage: dailyWage,
    unusedDays: unused,
    unusedLeaveAllowance: unusedAllowance,
  };
}

/**
 * Calculates South Korea Parental Leave Benefit & 6+6 Parent Special Scheme (육아휴직 급여 및 6+6 부모육아휴직제)
 * Statutory reference: Employment Insurance Act Art. 70, Enforcement Decree Art. 95, 95-3
 * 2026-10-17: the 25% deferred payment was abolished on 2025-01-01 and the 6+6 first-month cap
 * is 2.5M; totalDeferred stays in the response (always 0) so existing clients do not break.
 * @param {Object} params
 * @param {number} [params.monthlyWage=3500000] - Pre-tax monthly ordinary wage in KRW
 * @param {number} [params.leaveMonths=12] - Number of leave months (1~12, 1~18 for single parents or 6+6 with the other parent on 3+ months)
 * @param {boolean} [params.isParental6Plus6=false] - Whether 6+6 parent special scheme applies (same as mode "sixPlusSix")
 * @param {string} [params.mode] - "general" | "sixPlusSix" | "singleParent"
 * @param {number} [params.otherParentMonths=6] - 6+6 only: the other parent's leave months; special caps run to the shorter of the two
 */
export function calculateParentalLeave({
  monthlyWage = 3500000,
  leaveMonths = 12,
  isParental6Plus6 = false,
  mode,
  otherParentMonths,
}) {
  const wage = Math.max(0, Number(monthlyWage) || 3500000);
  const r = parentalLeaveSchedule2026({ monthlyWage: wage, leaveMonths, isParental6Plus6: Boolean(isParental6Plus6), mode, otherParentMonths });
  const is6Plus6 = r.mode === "sixPlusSix";

  return {
    year: 2026,
    ratesEffectiveFrom: RATES_EFFECTIVE_FROM,
    monthlyOrdinaryWage: wage,
    leaveMonths: r.months,
    isParental6Plus6: is6Plus6,
    mode: r.mode,
    maxMonths: r.maxMonths,
    specialCapMonths: r.specialUntil,
    totalBenefit: r.totalBenefit,
    totalUpfront: r.totalBenefit,
    totalDeferred: 0,
    monthlyAverage: r.monthlyAverage,
    monthlyBreakdown: r.monthlyBreakdown,
  };
}
