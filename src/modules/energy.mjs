// Energy and Utilities calculation module for South Korea
// Statutory reference: Korea Gas Corporation & Metropolitan City Gas Supply Regulations

// 서울도시가스 주택용 요금표(2026-10-01 시행): 기본요금 월 1,250원, 취사·난방 같은 단가 22.5268원/MJ.
// https://www.seoulgas.co.kr/mobile/payment/gasPayTable — 공급사·지역마다 다르므로 응답에 기준을 함께 준다.
const TARIFF_SUPPLIER = "서울도시가스 (서울)";
const TARIFF_EFFECTIVE_FROM = "2026-10-01";
const BASE_FEE_RESIDENTIAL = 1250; // KRW per month
const HEATING_UNIT_PRICE_MJ = 22.5268; // KRW/MJ, residential
const COOKING_UNIT_PRICE_MJ = 22.5268; // KRW/MJ, residential (same tariff since the unified 주택용 rate)
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
    tariffSupplier: TARIFF_SUPPLIER,
    tariffEffectiveFrom: TARIFF_EFFECTIVE_FROM,
    usageCharge,
    supplyPrice,
    vat,
    totalBilled,
  };
}
