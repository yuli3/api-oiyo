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
 * @param {string} [params.relationship="unknown"] - Relationship to the employee: spouse, lineal_ascendant, lineal_descendant, sibling, unknown
 * @param {boolean|null} [params.isMarried=null] - Whether the dependent candidate is married (both spouses must meet the income test)
 * @param {boolean|null} [params.spouseMeetsIncomeCriteria=null] - For a married candidate: whether the spouse also meets the income test
 * @param {number|null} [params.age=null] - Candidate age (sibling test: under 30 or 65+)
 * @param {boolean|null} [params.siblingUnmarried=null] - Sibling is unmarried (divorced/widowed counts as unmarried)
 * @param {boolean|null} [params.isDisabledOrMerit=null] - Registered disabled person, national merit or veteran-compensation wounded
 * @param {boolean|null} [params.hasHousingRentalIncome=null] - Business income includes housing rental income
 * @returns {Object} Insurance breakdown and dependent eligibility evaluation
 */
export function calculateHealthInsurance({
  businessIncome = 0,
  financialIncome = 0,
  otherIncome = 0,
  propertyTaxBase = 0,
  hasBusinessRegistration = false,
  relationship = "unknown",
  isMarried = null,
  spouseMeetsIncomeCriteria = null,
  age = null,
  siblingUnmarried = null,
  isDisabledOrMerit = null,
  hasHousingRentalIncome = null,
}) {
  const RELATIONSHIPS = ["spouse", "lineal_ascendant", "lineal_descendant", "sibling", "unknown"];
  if (!RELATIONSHIPS.includes(relationship)) throw new RangeError("Invalid relationship");
  const ageNum = age === null || age === undefined || age === "" ? null : Number(age);
  if (ageNum !== null && !(Number.isFinite(ageNum) && ageNum >= 0 && ageNum <= 130)) throw new RangeError("Invalid age");
  const bizInc = Math.max(0, Number(businessIncome) || 0);
  const finInc = Math.max(0, Number(financialIncome) || 0);
  const othInc = Math.max(0, Number(otherIncome) || 0);
  const propBase = Math.max(0, Number(propertyTaxBase) || 0);
  // 2026-11-03: housing rental income counts as registered business income even without
  // a business registration (별표1의2 사업소득 요건), so it gets no 500만 unregistered allowance.
  const rentalAsRegistered = hasHousingRentalIncome === true && bizInc > 0;
  const isRegistered = Boolean(hasBusinessRegistration) || rentalAsRegistered;

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

  if (isDisabledOrMerit === true) {
    // 장애인·국가유공자·보훈보상 상이자: registration does not matter, up to 500만 allowed.
    if (bizInc > 5000000) {
      disqualificationReasons.push(
        `사업소득이 ${Math.round(bizInc).toLocaleString()}원으로 장애인·국가유공자 등 예외 기준(500만 원)을 넘었어요.`
      );
    }
  } else if (isRegistered && bizInc > 0) {
    disqualificationReasons.push(
      rentalAsRegistered && !hasBusinessRegistration
        ? `주택임대소득은 사업자등록이 없어도 등록한 것으로 봐서, 사업소득(${Math.round(bizInc).toLocaleString()}원)이 있으면 피부양자 자격을 잃어요.`
        : `사업자등록 상태에서 사업소득(${Math.round(bizInc).toLocaleString()}원)이 발생해서 피부양자 자격을 잃어요.`
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

  if (isMarried === true && spouseMeetsIncomeCriteria === false) {
    disqualificationReasons.push("기혼자는 부부 모두 소득 요건을 충족해야 해요. 배우자가 요건을 넘으면 두 사람 모두 피부양자가 될 수 없어요.");
  }

  if (relationship === "sibling") {
    if (ageNum !== null && isDisabledOrMerit !== true && ageNum >= 30 && ageNum < 65) {
      disqualificationReasons.push(`형제자매는 30세 미만이거나 65세 이상이어야 해요(장애인·국가유공자 등 예외). 입력한 나이는 ${ageNum}세예요.`);
    }
    if (siblingUnmarried === false) {
      disqualificationReasons.push("형제자매는 미혼(이혼·사별 포함)이어야 해요.");
    }
    if (propBase > 180000000) {
      disqualificationReasons.push(`형제자매는 재산세 과세표준 1.8억 원 이하여야 해요. 입력한 값은 ${Math.round(propBase).toLocaleString()}원이에요.`);
    }
  }

  const unassessedCriteria = ["부양관계·동거 여부", "공단의 소득자료 반영·인정 예외"];
  if (isMarried === null || (isMarried === true && spouseMeetsIncomeCriteria === null)) unassessedCriteria.push("기혼자의 배우자 소득요건");
  if (relationship === "unknown") unassessedCriteria.push("관계별 요건(형제자매의 나이·혼인·재산 등)");
  if (relationship === "sibling" && (ageNum === null || siblingUnmarried === null)) unassessedCriteria.push("형제자매의 나이·혼인 요건");
  if (hasHousingRentalIncome === null && bizInc > 0) unassessedCriteria.push("주택임대소득");
  if (isDisabledOrMerit === null) unassessedCriteria.push("장애인·국가유공자 등 사업소득 예외");

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
      unassessedCriteria,
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
