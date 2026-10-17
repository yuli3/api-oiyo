/**
 * Calculates annual South Korean motor vehicle tax (자동차세 및 연납 할인)
 * @param {Object} params
 * @param {"ice"|"ev"} [params.powerType="ice"] - Internal combustion engine or Electric/Hydrogen
 * @param {number} [params.engineCc=1998] - Engine displacement in cc
 * @param {number} [params.vehicleAgeYears=0] - Years since first registration
 * @param {"jan"|"mar"|"jun"|"regular"} [params.prepaymentMonth="jan"] - Month of annual prepayment (연납)
 */
export function calculateCarTax({
  powerType = "ice",
  engineCc = 1998,
  vehicleAgeYears = 0,
  prepaymentMonth = "jan",
}) {
  const ageYears = parseInt(vehicleAgeYears, 10) || 0;
  let baseTax = 0;
  let eduTax = 0;
  let ageDiscountRate = 0;

  if (powerType === "ev") {
    // Electric/Hydrogen vehicle: flat 100,000 KRW + 30,000 KRW education tax
    baseTax = 100000;
    eduTax = 30000;
  } else {
    const cc = parseInt(engineCc, 10);
    if (isNaN(cc) || cc <= 0) {
      throw new Error("Engine displacement cc must be a positive number");
    }

    let ratePerCc = 200;
    if (cc <= 1000) ratePerCc = 80;
    else if (cc <= 1600) ratePerCc = 140;
    else ratePerCc = 200;

    let unadjustedBaseTax = cc * ratePerCc;

    // Age depreciation discount: from 3rd year, 5% per year, max 50%
    if (ageYears >= 3) {
      ageDiscountRate = Math.min(0.5, (ageYears - 2) * 0.05);
    }

    baseTax = Math.round(unadjustedBaseTax * (1 - ageDiscountRate));
    eduTax = Math.round(baseTax * 0.3); // 30% Local Education Tax
  }

  const subtotal = baseTax + eduTax;

  // Annual prepayment discounts (2026 guidelines: Jan 4.6%, Mar 3.8%, Jun 2.3%)
  let prepaymentDiscountRate = 0;
  if (prepaymentMonth === "jan") prepaymentDiscountRate = 0.046;
  else if (prepaymentMonth === "mar") prepaymentDiscountRate = 0.038;
  else if (prepaymentMonth === "jun") prepaymentDiscountRate = 0.023;

  const prepaymentDiscountAmount = Math.round(subtotal * prepaymentDiscountRate);
  const annualTax = Math.round(subtotal - prepaymentDiscountAmount);

  return {
    powerType,
    engineCc: powerType === "ev" ? null : parseInt(engineCc, 10),
    vehicleAgeYears: ageYears,
    ageDiscountRate: Number((ageDiscountRate * 100).toFixed(1)),
    baseTax,
    eduTax,
    prepaymentMonth,
    prepaymentDiscountRate: Number((prepaymentDiscountRate * 100).toFixed(1)),
    prepaymentDiscountAmount,
    annualTax,
  };
}

/**
 * Calculates South Korean motor vehicle acquisition tax (자동차 취득세)
 * @param {Object} params
 * @param {number} params.price - Vehicle acquisition price in KRW (> 0)
 * @param {"sedan"|"compact"|"van"|"commercial"} [params.vehicleType="sedan"]
 * @param {"none"|"hybrid"|"ev"} [params.ecoType="none"]
 */
export function calculateCarRegistration({
  price,
  vehicleType = "sedan",
  ecoType = "none",
}) {
  const p = Number(price);
  if (isNaN(p) || p <= 0) {
    throw new Error("Vehicle price must be a positive number in KRW");
  }

  let taxRatePercent = 7;
  let compactExemption = 0;

  if (vehicleType === "compact") {
    taxRatePercent = 4;
    compactExemption = 750000;
  } else if (vehicleType === "van") {
    taxRatePercent = 5;
  } else if (vehicleType === "commercial") {
    taxRatePercent = 4;
  } else {
    taxRatePercent = 7;
  }

  const grossTax = Math.round(p * (taxRatePercent / 100));
  let ecoDiscount = 0;

  if (vehicleType === "compact") {
    ecoDiscount = Math.min(grossTax, compactExemption);
  } else if (ecoType === "hybrid") {
    ecoDiscount = Math.min(grossTax, 400000);
  } else if (ecoType === "ev") {
    ecoDiscount = Math.min(grossTax, 1400000);
  }

  const netAcquisitionTax = Math.max(0, grossTax - ecoDiscount);

  return {
    price: p,
    vehicleType,
    ecoType,
    taxRatePercent,
    grossTax,
    ecoDiscount,
    netAcquisitionTax,
  };
}
