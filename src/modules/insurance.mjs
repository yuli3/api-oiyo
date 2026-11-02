// National Health Insurance module for South Korea B2A
// Regional (지역가입자) health insurance premium and dependent (피부양자) eligibility.
//
// 2026-10-17 (audit S-3): rates, the 1억 property deduction (since 2024-02), the full 60-grade
// property score table and the low-income floor rule now come from ./kr-rates-2026.mjs.
// The old code used 2025 rates, a 5천만 deduction and a 13-step shortcut table.

import { KR_RATES_2026, RATES_EFFECTIVE_FROM, regionalPropertyScore2026, regionalHealthPremium2026 } from "./kr-rates-2026.mjs";

/**
 * Statutory property score (국민건강보험법 시행령 별표4, 60등급).
 * @param {number} taxBase - Property tax base + rental deposit evaluation (KRW)
 * @returns {number} Property score points (0 when the 1억 basic deduction covers it)
 */
export function calculatePropertyScore(taxBase) {
  return regionalPropertyScore2026(taxBase);
}

/**
 * Calculates Regional National Health Insurance & Evaluates Dependent (피부양자) Eligibility
 * @param {Object} params
 * @param {number} [params.businessIncome=0] - Annual business income (사업소득금액) in KRW, 100% counted
 * @param {number} [params.financialIncome=0] - Annual interest/dividend income in KRW; ignored when ≤ 10M, fully counted above
 * @param {number} [params.otherIncome=0] - Annual earned/pension income (근로·연금소득) in KRW, 50% counted
 * @param {number} [params.propertyTaxBase=0] - Property tax base (재산세 과세표준 + 전월세 평가액) in KRW
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

  // 2026-11-02: interest + dividends of 10M KRW or less are not reported to NHIS as income,
  // so they do not count toward the dependent 20M test either (same rule regionalHealthPremium2026
  // applies). Above 10M the whole amount counts. Earned/pension income counts in full here; the
  // 50% factor is only for the regional premium.
  const countedFinancialIncome = finInc > 10000000 ? finInc : 0;
  const totalAnnualIncome = bizInc + countedFinancialIncome + othInc;
  const premium = regionalHealthPremium2026({
    businessIncome: bizInc,
    financialIncome: finInc,
    earnedOrPensionIncome: othInc,
    propertyTaxBase: propBase,
  });

  // 5. 피부양자 자격 요건 판정
  const disqualificationReasons = [];

  if (totalAnnualIncome > 20000000) {
    disqualificationReasons.push(
      `연간 합산 소득이 ${Math.round(totalAnnualIncome).toLocaleString()}원으로 기준(2,000만 원)을 넘었어요.`
    );
  }

  if (isRegistered && bizInc > 0) {
    disqualificationReasons.push(
      `사업자등록 상태에서 사업소득(${Math.round(bizInc).toLocaleString()}원)이 발생해서 피부양자 자격을 잃어요.`
    );
  } else if (!isRegistered && bizInc > 5000000) {
    disqualificationReasons.push(
      `미등록 사업소득(프리랜서 등)이 ${Math.round(bizInc).toLocaleString()}원으로 기준(500만 원)을 넘었어요.`
    );
  }

  if (propBase > 900000000) {
    disqualificationReasons.push(
      `재산세 과세표준이 ${Math.round(propBase).toLocaleString()}원으로 법정 상한(9억 원)을 넘었어요.`
    );
  } else if (propBase > 540000000 && totalAnnualIncome > 10000000) {
    disqualificationReasons.push(
      `재산세 과세표준이 5.4억 원을 초과하고 연간 소득이 1,000만 원을 넘었어요.`
    );
  }

  const isEligible = disqualificationReasons.length === 0;

  const H = KR_RATES_2026.health;
  const RG = KR_RATES_2026.regional;
  return {
    year: 2026,
    ratesEffectiveFrom: RATES_EFFECTIVE_FROM,
    monthlyIncomePremium: premium.incomePremium,
    monthlyPropertyPremium: premium.propertyPremium,
    monthlyHealthPremium: premium.healthPremium,
    monthlyCarePremium: premium.carePremium,
    monthlyTotal: premium.totalMonthly,
    annualTotal: premium.totalMonthly * 12,
    propertyScore: premium.propertyScore,
    assessedAnnualIncome: premium.assessedAnnualIncome,
    isMinPremiumApplied: premium.lowIncomeFloorApplied || premium.healthPremium === H.monthlyFloor,
    dependentEligibility: {
      // WHY 2026-11-02: NHIS 별표1/1의2 require family/support and exceptions
      // absent from these inputs. Numeric screening is not an eligibility verdict.
      isEligible: null,
      basicCriteriaMet: isEligible,
      status: "review_required",
      isFinalDecision: false,
      unassessedCriteria: ["부양관계·동거 여부", "기혼자의 배우자 소득요건", "형제자매의 나이·혼인·재산 요건", "주택임대소득", "장애인·국가유공자 등 사업소득 예외", "공단의 소득자료 반영·인정 예외"],
      source: "https://www.nhis.or.kr/nhis/policy/wbhada07400m01.do",
      reasons: disqualificationReasons,
      summary: isEligible
        ? "입력한 일반 소득·재산 기준에서 초과 항목이 없어요. 미검토 요건과 공단 확인이 남아 있어요."
        : "입력한 일반 기준에서 확인할 항목이 있어요. 예외 적용·자격 상실·지역가입 전환은 공단에 확인해 주세요.",
    },
    meta: {
      incomeTaxRate: RG.incomeRate,
      careRate: H.longTermCareOfHealth,
      longTermCareRate: H.longTermCareRate,
      propertyPointValue: RG.pointValue,
      minHealthPremium: H.monthlyFloor,
      maxHealthPremium: H.regionalMonthlyCap,
      propertyDeduction: RG.propertyBasicDeduction,
      financialIncomeExclusion: RG.financialIncomeExclusion,
      earnedOrPensionIncomeRatio: RG.earnedOrPensionIncomeRatio,
      excludes: "농어촌·재해 등 경감, 주택금융부채 공제, 세대 합산은 반영하지 않아요",
    },
  };
}
