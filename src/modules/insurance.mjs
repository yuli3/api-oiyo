// National Health Insurance module for South Korea B2A
// Pure mathematical and statutory formulas for Regional Health Insurance & Dependent Eligibility (2024~2026 Phase 2 reform)

/**
 * Calculates statutory property score (재산세 과세표준 등급점수표 - 60등급 요약 표준 구간)
 * Basic deduction: 50,000,000 KRW
 * Point value: 208.4 KRW per score point
 * @param {number} taxBase - Property tax base (재산세 과세표준) in KRW
 * @returns {number} Property score points
 */
export function calculatePropertyScore(taxBase) {
  const netBase = Math.max(0, Number(taxBase) - 50000000); // 5천만원 기본공제
  if (netBase <= 0) return 0;
  if (netBase <= 12000000) return 22;
  if (netBase <= 24000000) return 55;
  if (netBase <= 36000000) return 86;
  if (netBase <= 48000000) return 117;
  if (netBase <= 60000000) return 147;
  if (netBase <= 80000000) return 188;
  if (netBase <= 100000000) return 228;
  if (netBase <= 150000000) return 308;
  if (netBase <= 200000000) return 385;
  if (netBase <= 300000000) return 530;
  if (netBase <= 500000000) return 760;
  if (netBase <= 800000000) return 1020;
  return 1300;
}

/**
 * Calculates Regional National Health Insurance & Evaluates Dependent (피부양자) Eligibility
 * @param {Object} params
 * @param {number} [params.businessIncome=0] - Annual business income (사업소득금액) in KRW
 * @param {number} [params.financialIncome=0] - Annual financial income (이자/배당소득) in KRW
 * @param {number} [params.otherIncome=0] - Other annual income (근로/연금 등) in KRW
 * @param {number} [params.propertyTaxBase=0] - Property tax base (재산세 과세표준) in KRW
 * @param {boolean} [params.hasBusinessRegistration=false] - Whether registered as a business owner
 * @returns {Object} Insurance breakdown and dependent eligibility evaluation
 */
export function calculateHealthInsurance({
  businessIncome = 0,
  financialIncome = 0,
  otherIncome = 0,
  propertyTaxBase = 0,
  hasBusinessRegistration = false,
}) {
  const bizInc = Math.max(0, Number(businessIncome) || 0);
  const finInc = Math.max(0, Number(financialIncome) || 0);
  const othInc = Math.max(0, Number(otherIncome) || 0);
  const propBase = Math.max(0, Number(propertyTaxBase) || 0);
  const isRegistered = Boolean(hasBusinessRegistration);

  const totalAnnualIncome = bizInc + finInc + othInc;

  // 1. 소득분 건강보험료 (2026 소득정률제 7.19%)
  // 연소득 336만원 초과 시 부과
  let monthlyIncomePrem = 0;
  if (totalAnnualIncome > 3360000) {
    monthlyIncomePrem = (totalAnnualIncome / 12) * 0.0719;
  }

  // 2. 재산분 건강보험료 (기본공제 5,000만원, 점수당 208.4원)
  const propertyScore = calculatePropertyScore(propBase);
  const monthlyPropertyPrem = propertyScore * 208.4;

  // 3. 건강보험료 합산 및 최저보험료(19,780원) 적용
  let monthlyHealthPrem = monthlyIncomePrem + monthlyPropertyPrem;
  const isMinPremiumApplied = monthlyHealthPrem < 19780;
  if (isMinPremiumApplied) {
    monthlyHealthPrem = 19780;
  }

  // 4. 장기요양보험료 (건강보험료의 13.14%)
  const monthlyCarePrem = monthlyHealthPrem * 0.1314;

  const roundedHealth = Math.round(monthlyHealthPrem);
  const roundedCare = Math.round(monthlyCarePrem);
  const totalMonthly = roundedHealth + roundedCare;
  const totalAnnual = totalMonthly * 12;

  // 5. 피부양자 자격 요건 판정
  const disqualificationReasons = [];

  if (totalAnnualIncome > 20000000) {
    disqualificationReasons.push(
      `연간 합산 소득이 ${Math.round(totalAnnualIncome).toLocaleString()}원으로 기준(2,000만 원)을 초과했습니다.`
    );
  }

  if (isRegistered && bizInc > 0) {
    disqualificationReasons.push(
      `사업자등록 상태에서 사업소득(${Math.round(bizInc).toLocaleString()}원)이 발생하여 피부양자 자격이 상실됩니다.`
    );
  } else if (!isRegistered && bizInc > 5000000) {
    disqualificationReasons.push(
      `미등록 사업소득(프리랜서 등)이 ${Math.round(bizInc).toLocaleString()}원으로 기준(500만 원)을 초과했습니다.`
    );
  }

  if (propBase > 900000000) {
    disqualificationReasons.push(
      `재산세 과세표준이 ${Math.round(propBase).toLocaleString()}원으로 법정 상한(9억 원)을 초과했습니다.`
    );
  } else if (propBase > 540000000 && totalAnnualIncome > 10000000) {
    disqualificationReasons.push(
      `재산세 과세표준이 5.4억 원을 초과하고 연간 소득이 1,000만 원을 초과했습니다.`
    );
  }

  const isEligible = disqualificationReasons.length === 0;

  return {
    monthlyIncomePremium: Math.round(monthlyIncomePrem),
    monthlyPropertyPremium: Math.round(monthlyPropertyPrem),
    monthlyHealthPremium: Math.round(monthlyHealthPrem),
    monthlyCarePremium: Math.round(monthlyCarePrem),
    monthlyTotal: Math.round(totalMonthly),
    annualTotal: Math.round(totalAnnual),
    propertyScore,
    isMinPremiumApplied,
    dependentEligibility: {
      isEligible,
      status: isEligible ? "eligible" : "disqualified",
      reasons: disqualificationReasons,
      summary: isEligible
        ? "피부양자 자격을 유지할 수 있습니다."
        : "피부양자 자격 상실 대상입니다. 지역가입자로 건강보험료가 부과됩니다.",
    },
    meta: {
      incomeTaxRate: 0.0709,
      careRate: 0.1295,
      propertyPointValue: 208.4,
      minHealthPremium: 19780,
      propertyDeduction: 50000000,
    },
  };
}
