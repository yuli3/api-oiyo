// Energy and Utilities calculation module for South Korea
// Statutory reference: Korea Gas Corporation & Metropolitan City Gas Supply Regulations

// Default heating and cooking MJ unit prices (KRW/MJ) - standard 2026 residential rates
const BASE_FEE_RESIDENTIAL = 1000; // KRW per month
const HEATING_UNIT_PRICE_MJ = 22.15; // KRW/MJ for residential heating
const COOKING_UNIT_PRICE_MJ = 21.05; // KRW/MJ for residential cooking
const AVG_CALORIFIC_VALUE = 42.8; // Average MJ per cubic meter (Nm3)
const CORRECTION_FACTOR = 1.0; // Volume temperature/pressure correction factor

/**
 * Calculates South Korea residential city gas bill (도시가스 요금 계산)
 * @param {Object} params
 * @param {number} params.usageM3 - Gas meter volume used in cubic meters (m³)
 * @param {'heating'|'cooking'} [params.usageType='heating'] - Residential usage type
 * @param {number} [params.customCalorificValue] - Optional regional average MJ/m³
 */
export function calculateCityGasBill({
  usageM3 = 50,
  usageType = "heating",
  customCalorificValue,
}) {
  const m3 = Math.max(0, Number(usageM3) || 0);
  const calorific = Number(customCalorificValue) > 0 ? Number(customCalorificValue) : AVG_CALORIFIC_VALUE;
  const unitPrice = usageType === "cooking" ? COOKING_UNIT_PRICE_MJ : HEATING_UNIT_PRICE_MJ;

  // Energy consumed in MJ = m³ × calorific × correction
  const energyConsumedMJ = Number((m3 * calorific * CORRECTION_FACTOR).toFixed(2));

  // Gas usage charge = MJ × unitPrice
  const usageCharge = Math.floor(energyConsumedMJ * unitPrice);

  // Supply price = base fee + usage charge
  const supplyPrice = BASE_FEE_RESIDENTIAL + usageCharge;

  // VAT = 10%
  const vat = Math.floor(supplyPrice * 0.1);

  // Total invoice = supplyPrice + vat (truncate under 10 KRW as per KOGAS billing practice)
  const totalBilled = Math.floor((supplyPrice + vat) / 10) * 10;

  return {
    usageM3: m3,
    usageType,
    calorificValueMJperM3: calorific,
    energyConsumedMJ,
    unitPriceKRWperMJ: unitPrice,
    baseFee: BASE_FEE_RESIDENTIAL,
    usageCharge,
    supplyPrice,
    vat,
    totalBilled,
  };
}
