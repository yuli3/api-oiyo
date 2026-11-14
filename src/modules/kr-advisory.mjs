// Korean tax/accounting advisory endpoints for REST and MCP (2026-11-14).
// WHY: accountants and tax advisers asked for valuation, family-business succession, incorporation and
// DCF tools. Formulas live in tools-oiyo src/lib/kr-advisory-2026.ts (vendored, tested, same as the
// tools.oiyo.net pages); this file only checks inputs and shapes the answer, like kr-personal-tax.mjs:
// unknown inputs are refused, never guessed, and every result carries basis / notCovered / disclaimer.
import {
  ADVISORY_AS_OF, valueUnlistedShares, familyBusinessInheritance, incorporationConversion, dcfValuation, dcfSensitivity, wacc,
} from "./vendor/tools-tax/kr-advisory-2026.mjs";

export const ADVISORY_DISCLAIMER =
  "Estimate for professional review only, not tax advice or tax representation (세무사법 제2조 세무대리 아님). Eligibility requirements are not judged; confirm against the statutes (law.go.kr) before filing.";

class InputError extends Error {
  constructor(problems) {
    super("invalid_input");
    this.problems = problems;
  }
}

// kind: "amount" (≥ 0), "signed" (any finite number), "rate" (0..1), "pct" (-1..1, e.g. growth),
// "count" (integer ≥ min), "boolean", or an array of allowed values.
const SPECS = {
  "/v1/tax/kr/unlisted-share-valuation": {
    fields: {
      sharesOutstanding: { kind: "count", min: 1, required: true },
      netIncome1: { kind: "signed", required: true },
      netIncome2: { kind: "signed", required: true },
      netIncome3: { kind: "signed", required: true },
      netAssets: { kind: "signed", required: true },
      goodwill: { kind: "amount", fallback: 0 },
      realEstateRatio: { kind: "rate", fallback: 0 },
      netAssetOnlyReason: { kind: "boolean", fallback: false },
      heldShares: { kind: "count", min: 0, required: true },
      isMajorityHolder: { kind: "boolean", fallback: false },
      premiumExempt: { kind: "boolean", fallback: true },
    },
  },
  "/v1/tax/kr/family-business-inheritance": {
    fields: {
      businessValue: { kind: "amount", required: true },
      unrelatedAssetRatio: { kind: "rate", fallback: 0 },
      years: { kind: "count", min: 0, required: true },
      size: { kind: ["sme", "midsize", "ineligible"], required: true },
      otherEstate: { kind: "amount", fallback: 0 },
      netFinancial: { kind: "amount", fallback: 0 },
      debts: { kind: "amount", fallback: 0 },
      funeralSpent: { kind: "amount", fallback: 0 },
      hasSpouse: { kind: "boolean", fallback: false },
      spouseInherited: { kind: "amount", fallback: 0 },
    },
  },
  "/v1/tax/kr/incorporation-conversion": {
    fields: {
      business: { kind: ["general", "realEstateRental", "consumptionService"], fallback: "general" },
      realEstateMarket: { kind: "amount", required: true },
      realEstateCost: { kind: "amount", required: true },
      holdYears: { kind: "amount", required: true },
      otherAssets: { kind: "amount", fallback: 0 },
      liabilities: { kind: "amount", fallback: 0 },
      acquisitionBase: { kind: "amount", fallback: 0 },
    },
  },
  "/v1/finance/dcf-valuation": {
    fields: {
      revenue0: { kind: "amount", required: true },
      growth: { kind: "pct", required: true },
      ebitMargin: { kind: "pct", required: true },
      taxRate: { kind: "rate", fallback: 0.22 },
      daRatio: { kind: "rate", fallback: 0 },
      capexRatio: { kind: "rate", fallback: 0 },
      nwcRatio: { kind: "pct", fallback: 0 },
      wacc: { kind: "rate" },
      riskFree: { kind: "rate" },
      beta: { kind: "amount" },
      marketPremium: { kind: "rate" },
      sizePremium: { kind: "rate" },
      preTaxCostOfDebt: { kind: "rate" },
      debtWeight: { kind: "rate" },
      terminalGrowth: { kind: "pct", required: true },
      netDebt: { kind: "signed", fallback: 0 },
      shares: { kind: "count", min: 1, required: true },
      years: { kind: [3, 4, 5, 6, 7, 8, 9, 10], fallback: 5 },
      midYear: { kind: "boolean", fallback: false },
    },
  },
};

export const ADVISORY_PATHS = Object.keys(SPECS);

function readValue(raw, kind, name, problems) {
  if (Array.isArray(kind)) {
    const value = typeof kind[0] === "number" && typeof raw === "string" ? Number(raw) : raw;
    if (!kind.includes(value)) problems.push(`${name}: one of ${kind.join(", ")}`);
    return value;
  }
  if (kind === "boolean") {
    if (raw === true || raw === "true") return true;
    if (raw === false || raw === "false") return false;
    problems.push(`${name}: true or false`);
    return undefined;
  }
  const value = typeof raw === "string" && raw.trim() !== "" ? Number(raw) : raw;
  if (typeof value !== "number" || !Number.isFinite(value) || Math.abs(value) > Number.MAX_SAFE_INTEGER) {
    problems.push(`${name}: a finite number`);
    return undefined;
  }
  if (kind !== "signed" && kind !== "pct" && value < 0) problems.push(`${name}: ≥ 0`);
  if (kind === "rate" && value > 1) problems.push(`${name}: a ratio between 0 and 1 (e.g. 0.22)`);
  if (kind === "pct" && (value < -1 || value > 1)) problems.push(`${name}: a ratio between -1 and 1 (e.g. 0.05)`);
  if (kind === "count" && !Number.isInteger(value)) problems.push(`${name}: a whole number`);
  return value;
}

export function parseAdvisoryInput(path, raw) {
  const spec = SPECS[path];
  const problems = [];
  const input = {};
  for (const key of Object.keys(raw)) if (!Object.hasOwn(spec.fields, key)) problems.push(`${key}: unknown input`);
  for (const [name, field] of Object.entries(spec.fields)) {
    if (raw[name] === undefined || raw[name] === null || raw[name] === "") {
      if (field.required) problems.push(`${name}: required`);
      else if (field.fallback !== undefined) input[name] = field.fallback;
      continue;
    }
    const value = readValue(raw[name], field.kind, name, problems);
    if (field.kind === "count" && field.min !== undefined && value < field.min) problems.push(`${name}: at least ${field.min}`);
    input[name] = value;
  }
  if (problems.length) throw new InputError(problems);
  return input;
}

function unlisted(i) {
  const result = valueUnlistedShares({ ...i, netIncome: [i.netIncome1, i.netIncome2, i.netIncome3] });
  return {
    asOf: ADVISORY_AS_OF, isEstimate: true, result,
    basis: [
      "상속세 및 증여세법 제63조 제1항 제1호 나목(보충적 평가)·제3항(최대주주 할증 20%)",
      "시행령 제54조(순손익가치 3 : 순자산가치 2, 부동산 등 50% 이상 2 : 3, 순자산가치 80% 하한, ④ 순자산가치만 평가)",
      "시행령 제56조 ①(최근 3년 가중 3·2·1, 음수면 0), 시행규칙 제17조(순손익가치환원율 10%)",
      "시행령 제53조 ⑥~⑧(할증 제외: 중소기업, 직전 3년 평균 매출 5천억 원 미만 중견기업, 3년 연속 결손 등)",
    ],
    notCovered: [
      "시가(매매사례가액·감정가액) 우선 적용 판단, 추정이익 평가(시행령 제56조 ②), 증자·감자 시 주식수 환산",
      "순손익액·순자산가액·영업권 산정 자체(입력값 그대로 사용), 평가심의위원회 심의",
      "2024·2026 세법개정안·발의안의 할증 폐지(국회 미통과)",
    ],
    disclaimer: ADVISORY_DISCLAIMER,
  };
}

function familyBusiness(i) {
  return {
    asOf: ADVISORY_AS_OF, isEstimate: true, result: familyBusinessInheritance(i),
    basis: [
      "상속세 및 증여세법 제18조의2 ①(10년 300억·20년 400억·30년 600억 원 한도, 중소기업·매출 5천억 미만 중견기업)",
      "시행령 제15조(가업상속재산 = 주식가액 × (1 − 사업무관자산 비율))",
      "제21조(일괄공제 5억 원, 가업상속공제와 별도)·제19조·제22조·제24조(공제 적용 한도)·제26조(세율)·제69조(신고세액공제 3%)",
    ],
    notCovered: [
      "피상속인·상속인 요건(지분 40%·10년 보유, 대표이사 재직, 2년 종사 등)과 사업무관자산 판정",
      "5년 사후관리 위반 추징, 납부유예·연부연납, 사전증여재산 합산, 영농·동거주택상속공제",
      "2026-08-03 세제개편안(2027-07-01 이후 상속분 한도·심사위원회·사후관리 개편, 정부안)",
    ],
    disclaimer: ADVISORY_DISCLAIMER,
  };
}

function conversion(i) {
  return {
    asOf: ADVISORY_AS_OF, isEstimate: true, result: incorporationConversion(i),
    basis: [
      "조세특례제한법 제32조(법인전환 양도소득세 이월과세: 소비성서비스업·주택 제외, ⑤ 5년 사후관리), 시행령 제29조 ②⑤(순자산가액 이상 자본금)",
      "소득세법 제95조(장기보유특별공제 표1)·제103조(기본공제 250만 원)·제104조(세율)",
      "지방세특례제한법 제57조의2 ④(취득세 50% 감면, 2027-12-31 취득분까지, 부동산임대·공급업 제외), 농어촌특별세법 제5조 ①1호(감면세액 20%)",
    ],
    notCovered: [
      "영업권 대가 과세, 포괄양수도 부가가치세, 과밀억제권역 취득세 중과, 지방교육세·농특세 10%, 등기·감정 비용",
      "업종 해당 여부와 현물출자·사업양수도 절차 요건(입력값 그대로 사용)",
    ],
    disclaimer: ADVISORY_DISCLAIMER,
  };
}

const WACC_PARTS = ["riskFree", "beta", "marketPremium", "sizePremium", "preTaxCostOfDebt", "debtWeight"];

function dcf(i) {
  let rate = i.wacc;
  let waccBuild = null;
  if (rate === undefined) {
    const missing = WACC_PARTS.filter((k) => i[k] === undefined && k !== "sizePremium");
    if (missing.length) throw new InputError([`wacc: give wacc, or ${missing.join(", ")} to build it with CAPM`]);
    waccBuild = wacc({ ...i, sizePremium: i.sizePremium ?? 0 });
    rate = waccBuild.wacc;
  }
  if (rate <= i.terminalGrowth) throw new InputError(["wacc: must be greater than terminalGrowth"]);
  const input = { ...i, wacc: rate };
  const valuation = dcfValuation(input);
  return {
    isEstimate: true, wacc: rate, waccBuild, result: valuation, sensitivity: dcfSensitivity(input),
    basis: [
      "FCFF = EBIT × (1 − tax) + D&A − CAPEX − ΔNWC; growth fades linearly to terminalGrowth by the final year",
      "Terminal value: Gordon growth on final-year FCFF; WACC = CAPM cost of equity + after-tax cost of debt",
      "Korean inheritance/gift tax valuation of unlisted shares uses 상증법 보충적 평가, not DCF (DCF only via 평가심의위원회, 시행령 제54조 ⑥)",
    ],
    notCovered: ["Non-operating assets, minority/marketability discounts, stock options, multi-stage explicit forecasts"],
    disclaimer: ADVISORY_DISCLAIMER,
  };
}

const HANDLERS = {
  "/v1/tax/kr/unlisted-share-valuation": unlisted,
  "/v1/tax/kr/family-business-inheritance": familyBusiness,
  "/v1/tax/kr/incorporation-conversion": conversion,
  "/v1/finance/dcf-valuation": dcf,
};

export function calculateAdvisory(path, raw) {
  return HANDLERS[path](parseAdvisoryInput(path, raw));
}

/** REST entry. Returns null when the path is not an advisory route. */
export async function handleAdvisory(request, url, headers) {
  if (!Object.hasOwn(SPECS, url.pathname)) return null;
  const method = request.method;
  if (method !== "GET" && method !== "POST" && method !== "HEAD") {
    return Response.json({ error: "method_not_allowed" }, { status: 405, headers });
  }
  let raw = Object.fromEntries(url.searchParams);
  if (method === "POST") {
    try {
      const body = await request.json();
      if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
      raw = body;
    } catch {
      return Response.json({ error: "invalid_input", problems: ["body: a JSON object"] }, { status: 400, headers });
    }
  }
  try {
    const result = calculateAdvisory(url.pathname, raw);
    return new Response(method === "HEAD" ? null : JSON.stringify(result), { status: 200, headers });
  } catch (err) {
    if (err instanceof InputError) return Response.json({ error: "invalid_input", problems: err.problems }, { status: 400, headers });
    throw err;
  }
}
