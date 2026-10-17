// Real Estate calculation module for South Korea B2A
// Pure mathematical and statutory formulas for Brokerage Fees & Acquisition Tax

/**
 * Calculates statutory brokerage commission fee (부동산 중개보수 요율 및 상한액)
 * Based on Korean Licensed Real Estate Agents Act & Municipal Ordinances
 * @param {Object} params
 * @param {string} [params.transactionType="sale"] - "sale" (매매/교환), "lease" (임대차/전월세)
 * @param {string} [params.propertyType="residential"] - "residential" (주택), "officetel" (주거용 오피스텔), "general" (상가/토지 등)
 * @param {number} params.amount - Transaction amount (or calculated lease base amount) in KRW (> 0)
 */
export function calculateBrokerageFee({
  transactionType = "sale",
  propertyType = "residential",
  amount,
}) {
  const amt = Number(amount);
  if (isNaN(amt) || amt <= 0) {
    throw new Error("Amount must be a positive number");
  }

  let rate = 0.009; // default general
  let limit = null;

  if (propertyType === "officetel") {
    rate = transactionType === "sale" ? 0.005 : 0.004;
  } else if (propertyType === "residential") {
    if (transactionType === "sale") {
      if (amt < 50000000) {
        rate = 0.006;
        limit = 250000;
      } else if (amt < 200000000) {
        rate = 0.005;
        limit = 800000;
      } else if (amt < 900000000) {
        rate = 0.004;
      } else if (amt < 1200000000) {
        rate = 0.005;
      } else if (amt < 1500000000) {
        rate = 0.006;
      } else {
        rate = 0.007;
      }
    } else {
      // Lease
      if (amt < 50000000) {
        rate = 0.005;
        limit = 200000;
      } else if (amt < 100000000) {
        rate = 0.004;
        limit = 300000;
      } else if (amt < 600000000) {
        rate = 0.003;
      } else if (amt < 1200000000) {
        rate = 0.004;
      } else if (amt < 1500000000) {
        rate = 0.005;
      } else {
        rate = 0.006;
      }
    }
  }

  let fee = amt * rate;
  if (limit !== null && fee > limit) {
    fee = limit;
  }

  const roundedFee = Math.round(fee);
  const vat = Math.round(roundedFee * 0.10); // 부가세 10%
  const totalWithVat = roundedFee + vat;

  return {
    transactionType,
    propertyType,
    amount: amt,
    statutoryMaxRatePercent: Number((rate * 100).toFixed(2)),
    limitAmount: limit,
    brokerageFee: roundedFee,
    vat,
    totalWithVat,
  };
}

/**
 * Calculates statutory acquisition tax for residential property (주택 취득세 및 부가세)
 * @param {Object} params
 * @param {number} params.price - Purchase price in KRW (> 0)
 * @param {string} [params.houseCount="1"] - "1", "2_non_reg", "2_reg", "3_non_reg", "3_reg", "4_multi"
 * @param {boolean} [params.areaOver85=false] - Whether exclusive area exceeds 85 sqm
 * @param {boolean} [params.isFirstHome=false] - First-time home buyer tax discount eligible
 */
export function calculateAcquisitionTax({
  price,
  houseCount = "1",
  areaOver85 = false,
  isFirstHome = false,
}) {
  const p = Number(price);
  if (isNaN(p) || p <= 0) {
    throw new Error("Price must be a positive number");
  }

  let baseRate = 0.01;
  if (houseCount === "1" || houseCount === "2_non_reg") {
    if (p <= 600000000) {
      baseRate = 0.01;
    } else if (p <= 900000000) {
      baseRate = (p * (2 / 300000000) - 3) / 100;
    } else {
      baseRate = 0.03;
    }
  } else if (houseCount === "2_reg" || houseCount === "3_non_reg") {
    baseRate = 0.08;
  } else {
    baseRate = 0.12;
  }

  let mainTax = p * baseRate;
  let discountAmount = 0;

  if (Boolean(isFirstHome) && p <= 1200000000) {
    discountAmount = Math.min(mainTax, 2000000);
    mainTax = Math.max(0, mainTax - discountAmount);
  }

  const eduRate = baseRate <= 0.03 ? baseRate * 0.1 : 0.004;
  const educationTax = p * eduRate;

  const ruralRate = Boolean(areaOver85) ? (baseRate >= 0.08 ? 0.01 : 0.002) : 0;
  const ruralTax = p * ruralRate;

  const totalTax = Math.round(mainTax + educationTax + ruralTax);

  return {
    price: p,
    houseCount,
    areaOver85: Boolean(areaOver85),
    isFirstHome: Boolean(isFirstHome),
    baseRatePercent: Number((baseRate * 100).toFixed(2)),
    mainTax: Math.round(mainTax),
    educationTax: Math.round(educationTax),
    ruralTax: Math.round(ruralTax),
    discountAmount: Math.round(discountAmount),
    totalTax,
  };
}

/**
 * Calculates South Korean residential property tax and comprehensive real estate holding tax (재산세 및 종합부동산세)
 * @param {Object} params
 * @param {number} params.price - Official public price (공시가격) in KRW (> 0)
 * @param {string} [params.ownerType="single"] - "single" (1세대 1주택 단독명의) or "multi" (다주택자/공동명의)
 * @param {number} [params.houseCount=1] - Total owned houses (1, 2, 3+)
 * @param {boolean} [params.includeUrban=true] - Include urban area tax (0.14%)
 * @param {number} [params.ageRatePercent=0] - Age deduction percent (0, 20, 30, 40)
 * @param {number} [params.holdRatePercent=0] - Holding period deduction percent (0, 20, 40, 50)
 */
export function calculatePropertyTax({
  price,
  ownerType = "single",
  houseCount = 1,
  includeUrban = true,
  ageRatePercent = 0,
  holdRatePercent = 0,
}) {
  const p = Number(price);
  if (isNaN(p) || p <= 0) {
    throw new Error("Price must be a positive number");
  }

  const isSingle = ownerType === "single";
  const count = Number(houseCount) || 1;

  // 1. Property Tax (주택분 재산세)
  const propTaxBase = p * 0.6; // Fair market value ratio 60%
  let propBaseTax = 0;

  if (isSingle && p <= 900000000) {
    // 1-homeowner special discounted rates
    if (propTaxBase <= 60000000) {
      propBaseTax = propTaxBase * 0.0005;
    } else if (propTaxBase <= 150000000) {
      propBaseTax = 30000 + (propTaxBase - 60000000) * 0.001;
    } else if (propTaxBase <= 300000000) {
      propBaseTax = 120000 + (propTaxBase - 150000000) * 0.002;
    } else {
      propBaseTax = 420000 + (propTaxBase - 300000000) * 0.0035;
    }
  } else {
    // Standard rates
    if (propTaxBase <= 60000000) {
      propBaseTax = propTaxBase * 0.001;
    } else if (propTaxBase <= 150000000) {
      propBaseTax = 60000 + (propTaxBase - 60000000) * 0.0015;
    } else if (propTaxBase <= 300000000) {
      propBaseTax = 195000 + (propTaxBase - 150000000) * 0.0025;
    } else {
      propBaseTax = 570000 + (propTaxBase - 300000000) * 0.004;
    }
  }

  const urbanTax = Boolean(includeUrban) ? propTaxBase * 0.0014 : 0;
  const eduTax = propBaseTax * 0.2;
  const totalPropTax = Math.round(propBaseTax + urbanTax + eduTax);

  // 2. Comprehensive Holding Tax (종합부동산세)
  const exemption = isSingle ? 1200000000 : 900000000;
  const excess = p - exemption;
  const isCompSubject = excess > 0;

  let compTaxBase = 0;
  let compRawTax = 0;
  let compPropDeduct = 0;
  let compAgeDeduct = 0;
  let compNetBase = 0;
  let compRuralTax = 0;
  let totalCompTax = 0;

  if (isCompSubject) {
    compTaxBase = excess * 0.6; // Fair market value ratio 60%

    if (count >= 3 && !isSingle) {
      // 3+ homes heavy rate
      if (compTaxBase <= 300000000) {
        compRawTax = compTaxBase * 0.005;
      } else if (compTaxBase <= 600000000) {
        compRawTax = 1500000 + (compTaxBase - 300000000) * 0.007;
      } else if (compTaxBase <= 1200000000) {
        compRawTax = 3600000 + (compTaxBase - 600000000) * 0.01;
      } else if (compTaxBase <= 2500000000) {
        compRawTax = 9600000 + (compTaxBase - 1200000000) * 0.02;
      } else if (compTaxBase <= 5000000000) {
        compRawTax = 35600000 + (compTaxBase - 2500000000) * 0.03;
      } else if (compTaxBase <= 9400000000) {
        compRawTax = 110600000 + (compTaxBase - 5000000000) * 0.04;
      } else {
        compRawTax = 286600000 + (compTaxBase - 9400000000) * 0.05;
      }
    } else {
      // General rate (1 home or <= 2 homes)
      if (compTaxBase <= 300000000) {
        compRawTax = compTaxBase * 0.005;
      } else if (compTaxBase <= 600000000) {
        compRawTax = 1500000 + (compTaxBase - 300000000) * 0.007;
      } else if (compTaxBase <= 1200000000) {
        compRawTax = 3600000 + (compTaxBase - 600000000) * 0.01;
      } else if (compTaxBase <= 2500000000) {
        compRawTax = 9600000 + (compTaxBase - 1200000000) * 0.013;
      } else if (compTaxBase <= 5000000000) {
        compRawTax = 26500000 + (compTaxBase - 2500000000) * 0.015;
      } else if (compTaxBase <= 9400000000) {
        compRawTax = 64000000 + (compTaxBase - 5000000000) * 0.02;
      } else {
        compRawTax = 152000000 + (compTaxBase - 9400000000) * 0.027;
      }
    }

    compPropDeduct = compTaxBase * 0.0024;
    compNetBase = Math.max(0, compRawTax - compPropDeduct);

    if (isSingle) {
      const totalDeductPercent = Math.min(80, Number(ageRatePercent || 0) + Number(holdRatePercent || 0));
      if (totalDeductPercent > 0) {
        compAgeDeduct = compNetBase * (totalDeductPercent / 100);
        compNetBase = Math.max(0, compNetBase - compAgeDeduct);
      }
    }

    compRuralTax = compNetBase * 0.2;
    totalCompTax = Math.round(compNetBase + compRuralTax);
  }

  const totalAnnualHoldingTax = totalPropTax + totalCompTax;

  return {
    officialPrice: p,
    ownerType,
    houseCount: count,
    propertyTax: {
      taxBase: Math.round(propTaxBase),
      baseTax: Math.round(propBaseTax),
      urbanTax: Math.round(urbanTax),
      educationTax: Math.round(eduTax),
      total: totalPropTax,
      julyInstallment: Math.round(totalPropTax / 2),
      septemberInstallment: totalPropTax - Math.round(totalPropTax / 2),
    },
    comprehensiveTax: {
      isSubject: isCompSubject,
      exemptionAmount: exemption,
      taxBase: Math.round(compTaxBase),
      rawTax: Math.round(compRawTax),
      propertyTaxDeduction: Math.round(compPropDeduct),
      singleHomeownerDeduction: Math.round(compAgeDeduct),
      netBaseTax: Math.round(compNetBase),
      ruralSpecialTax: Math.round(compRuralTax),
      total: totalCompTax,
    },
    totalAnnualHoldingTax,
  };
}

/**
 * Diagnoses HUG Jeonse Deposit Return Guarantee (HUG 전세보증금 반환보증 126% 룰 진단 및 보증료 산출)
 * Based on Korea Housing & Urban Guarantee Corporation (HUG) statutory criteria (공시가 140% × 전세가율 90% = 126%)
 * @param {Object} params
 * @param {number} params.officialPrice - Publicly declared housing price (공시가격) in KRW
 * @param {number} params.jeonseDeposit - Jeonse deposit amount (전세보증금) in KRW
 * @param {number} [params.seniorDebt=0] - Senior lien / mortgage amount (선순위 채권액) in KRW
 * @param {string} [params.propertyType="apartment"] - "apartment" or "villa" (includes officetel/multi-family)
 * @param {string} [params.discountType="none"] - "none", "youth" (50%), "newlywed" (40%), "multi-child" (40%)
 * @param {number} [params.termMonths=24] - Lease term in months (default 24)
 * @returns {Object} Diagnosis results and guarantee fee breakdown
 */
export function diagnoseHugGuarantee({
  officialPrice,
  jeonseDeposit,
  seniorDebt = 0,
  propertyType = "apartment",
  discountType = "none",
  termMonths = 24,
}) {
  const p = Number(officialPrice);
  const dep = Number(jeonseDeposit);
  const senior = Math.max(0, Number(seniorDebt) || 0);
  const months = Math.max(1, Number(termMonths) || 24);

  if (isNaN(p) || p <= 0) {
    throw new Error("officialPrice must be a positive number");
  }
  if (isNaN(dep) || dep <= 0) {
    throw new Error("jeonseDeposit must be a positive number");
  }

  // 1. 산정 주택가격 = 공시가격 × 140%
  const calculatedHousePrice = Math.round(p * 1.4);

  // 2. 최대 보증가능 전세금 = 공시가격 × 126% (주택가격 × 90%)
  const maxAllowedDeposit = Math.round(p * 1.26);

  // 3. 선순위 채권 한도 = 주택가격 × 60%
  const seniorDebtLimit = Math.round(calculatedHousePrice * 0.6);

  // 4. 비율 계산
  const depositRatio = (dep / p) * 100;
  const debtRatio = calculatedHousePrice > 0 ? ((senior + dep) / calculatedHousePrice) * 100 : 0;
  const seniorRatio = calculatedHousePrice > 0 ? (senior / calculatedHousePrice) * 100 : 0;

  // 5. 적격성 판정
  const rejectReasons = [];
  if (dep > maxAllowedDeposit) {
    rejectReasons.push(
      `전세보증금이 공시가격의 126%(${maxAllowedDeposit.toLocaleString()}원)를 초과했습니다.`
    );
  }
  if (senior > seniorDebtLimit) {
    rejectReasons.push(
      `선순위 채권(${senior.toLocaleString()}원)이 주택가격의 60%(${seniorDebtLimit.toLocaleString()}원)를 초과했습니다.`
    );
  }
  if (debtRatio > 90) {
    rejectReasons.push(
      `선순위 채권과 전세보증금 합산 부채비율(${debtRatio.toFixed(1)}%)이 90%를 초과했습니다.`
    );
  }

  const isEligible = rejectReasons.length === 0;

  // 6. 보증료율 계산
  const isApt = propertyType === "apartment";
  let annualFeeRate = 0.00128; // default
  if (isApt) {
    annualFeeRate = debtRatio <= 80 ? 0.00115 : 0.00128;
  } else {
    annualFeeRate = debtRatio <= 80 ? 0.00139 : 0.00154;
  }

  // 감면율
  let discountRate = 0;
  if (discountType === "youth") {
    discountRate = 0.5; // 청년 50% 감면
  } else if (discountType === "newlywed" || discountType === "multi-child") {
    discountRate = 0.4; // 신혼부부/다자녀 40% 감면
  }

  const annualFee = Math.round(dep * annualFeeRate * (1 - discountRate));
  const totalGuaranteeFee = Math.round(dep * annualFeeRate * (months / 12) * (1 - discountRate));

  return {
    officialPrice: p,
    jeonseDeposit: dep,
    seniorDebt: senior,
    propertyType,
    calculatedHousePrice,
    maxAllowedDeposit,
    seniorDebtLimit,
    depositRatio: Number(depositRatio.toFixed(2)),
    debtRatio: Number(debtRatio.toFixed(2)),
    seniorRatio: Number(seniorRatio.toFixed(2)),
    isEligible,
    verdict: isEligible ? "eligible" : "ineligible",
    rejectReasons,
    guaranteeFee: {
      termMonths: months,
      baseAnnualFeeRate: annualFeeRate,
      discountType,
      discountRate,
      annualFee,
      totalGuaranteeFee,
    },
    criteria: {
      housePriceMultiplier: 1.4,
      maxJeonseRatio: 0.9,
      effectiveJeonseRule: 1.26,
      seniorDebtMaxRatio: 0.6,
      totalDebtMaxRatio: 0.9,
    },
  };
}

