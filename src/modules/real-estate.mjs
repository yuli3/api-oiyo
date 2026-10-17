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
