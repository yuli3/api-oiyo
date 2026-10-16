// Deterministic Universal Unit Converter Module
// Pure mathematical conversion engine without external dependencies

const LENGTH_TO_METER = {
  m: 1,
  cm: 0.01,
  mm: 0.001,
  km: 1000,
  inch: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
  mile: 1609.344,
};

const AREA_TO_M2 = {
  m2: 1,
  pyeong: 3.305785, // 1평 = 400/121 m² ≈ 3.305785 m²
  sqft: 0.09290304,
  ha: 10000,
  ac: 4046.8564224,
};

const WEIGHT_TO_KG = {
  kg: 1,
  g: 0.001,
  mg: 0.000001,
  lb: 0.45359237,
  oz: 0.028349523125,
};

/**
 * Universal unit converter
 * @param {Object} params
 * @param {number} params.value - Numeric value to convert
 * @param {string} params.from - Source unit
 * @param {string} params.to - Target unit
 */
export function convertUnits({ value, from, to }) {
  const val = Number(value);
  if (isNaN(val)) {
    throw new Error("Invalid numeric value for conversion");
  }

  const src = String(from || "").toLowerCase().trim();
  const dst = String(to || "").toLowerCase().trim();

  // 1. Temperature special handling
  if ((src === "c" || src === "f" || src === "k") && (dst === "c" || dst === "f" || dst === "k")) {
    let cVal;
    if (src === "c") cVal = val;
    else if (src === "f") cVal = (val - 32) * (5 / 9);
    else cVal = val - 273.15;

    let res;
    if (dst === "c") res = cVal;
    else if (dst === "f") res = cVal * (9 / 5) + 32;
    else res = cVal + 273.15;

    return {
      type: "temperature",
      inputValue: val,
      fromUnit: src,
      outputValue: Number(res.toFixed(4)),
      toUnit: dst,
    };
  }

  // 2. Length
  if (LENGTH_TO_METER[src] && LENGTH_TO_METER[dst]) {
    const inMeters = val * LENGTH_TO_METER[src];
    const out = inMeters / LENGTH_TO_METER[dst];
    return {
      type: "length",
      inputValue: val,
      fromUnit: src,
      outputValue: Number(out.toFixed(6)),
      toUnit: dst,
    };
  }

  // 3. Area
  if (AREA_TO_M2[src] && AREA_TO_M2[dst]) {
    const inM2 = val * AREA_TO_M2[src];
    const out = inM2 / AREA_TO_M2[dst];
    return {
      type: "area",
      inputValue: val,
      fromUnit: src,
      outputValue: Number(out.toFixed(6)),
      toUnit: dst,
    };
  }

  // 4. Weight
  if (WEIGHT_TO_KG[src] && WEIGHT_TO_KG[dst]) {
    const inKg = val * WEIGHT_TO_KG[src];
    const out = inKg / WEIGHT_TO_KG[dst];
    return {
      type: "weight",
      inputValue: val,
      fromUnit: src,
      outputValue: Number(out.toFixed(6)),
      toUnit: dst,
    };
  }

  throw new Error(`Unsupported or mismatched unit conversion: from '${src}' to '${dst}'`);
}
