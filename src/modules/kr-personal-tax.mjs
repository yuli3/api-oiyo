// Korean personal tax endpoints for REST and MCP (2026-11-09).
// WHY: the formulas live in tools-oiyo (tested, same as tools.oiyo.net pages); this file only checks
// inputs and shapes the answer. Design borrowed from UpstageAI/korean-tax-calc-mcp: refuse unknown
// inputs and unsupported tax years instead of guessing, and attach the statute basis to every result.
import { settleYearEnd, YEAR_END_AS_OF } from "./vendor/tools-tax/kr-year-end-2026.mjs";
import { freelancerSettlement, INCOME_TAX_AS_OF, SIMPLE_EXPENSE_940909 } from "./vendor/tools-tax/kr-income-tax-2026.mjs";
import { acquisitionTax, propertyTax, REAL_ESTATE_TAX_AS_OF } from "./vendor/tools-tax/kr-real-estate-tax.mjs";

export const PERSONAL_TAX_DISCLAIMER =
  "Estimate for reference only, not tax advice or tax representation (세무사법 제2조 세무대리 아님). Confirm with the National Tax Service or a licensed tax accountant before filing.";

class InputError extends Error {
  constructor(problems) {
    super("invalid_input");
    this.problems = problems;
  }
}

// kind: "amount" (KRW ≥ 0), "count" (integer ≥ min), "rate" (0..1), "boolean", or an array of allowed values.
const SPECS = {
  "/v1/tax/kr/year-end-settlement": {
    taxYears: [2026],
    fields: {
      salary: { kind: "amount", required: true },
      persons: { kind: "count", min: 1, fallback: 1 },
      otherIncome: { kind: "amount" },
      seniors: { kind: "count" },
      disabledPersons: { kind: "count" },
      womanHead: { kind: "boolean" },
      singleParent: { kind: "boolean" },
      nationalPension: { kind: "amount" },
      healthEmployment: { kind: "amount" },
      creditCardSpend: { kind: "amount" },
      debitCardSpend: { kind: "amount" },
      cultureSpend: { kind: "amount" },
      traditionalMarketSpend: { kind: "amount" },
      publicTransitSpend: { kind: "amount" },
      cardChildren: { kind: "count" },
      creditChildren: { kind: "count" },
      birthOrder: { kind: "count" },
      leaseLoanRepaid: { kind: "amount" },
      housingSubscriptionPaid: { kind: "amount" },
      insurancePremium: { kind: "amount" },
      medical: { kind: "amount" },
      medicalSpecific: { kind: "amount" },
      education: { kind: "amount" },
      educationSelf: { kind: "amount" },
      donation: { kind: "amount" },
      religiousDonation: { kind: "amount" },
      politicalDonation: { kind: "amount" },
      hometownDonation: { kind: "amount" },
      pensionSavings: { kind: "amount" },
      irp: { kind: "amount" },
      isaTransfer: { kind: "amount" },
      rent: { kind: "amount" },
      rentEligible: { kind: "boolean" },
      marriage: { kind: "boolean" },
      youthSme: { kind: "boolean" },
      withheld: { kind: "amount" },
    },
  },
  "/v1/tax/kr/freelancer-income-tax": {
    taxYears: [2025, 2026],
    fields: {
      revenue: { kind: "amount", required: true },
      expenseRate: { kind: "rate" },
      people: { kind: "count", min: 1, fallback: 1 },
      pensionPremium: { kind: "amount" },
    },
  },
  "/v1/tax/kr/acquisition-tax": {
    taxYears: [2026],
    fields: {
      price: { kind: "amount", required: true },
      houses: { kind: [1, 2, 3, 4], fallback: 1 },
      regulated: { kind: "boolean" },
      temporaryTwo: { kind: "boolean" },
      over85: { kind: "boolean" },
    },
  },
  "/v1/tax/kr/property-tax": {
    taxYears: [2026],
    fields: {
      officialPrice: { kind: "amount", required: true },
      oneHouse: { kind: "boolean", fallback: true },
      urbanArea: { kind: "boolean", fallback: true },
    },
  },
};

export const PERSONAL_TAX_PATHS = Object.keys(SPECS);

function readValue(raw, kind, name, problems) {
  if (Array.isArray(kind)) {
    const value = typeof raw === "string" ? Number(raw) : raw;
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
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > Number.MAX_SAFE_INTEGER) {
    problems.push(`${name}: a finite number ≥ 0`);
    return undefined;
  }
  if (kind === "rate" && value > 1) problems.push(`${name}: a ratio between 0 and 1 (e.g. 0.641)`);
  if (kind === "count" && !Number.isInteger(value)) problems.push(`${name}: a whole number`);
  return value;
}

/** Validates raw query/body values. Unknown keys and unsupported tax years are refused, never guessed. */
export function parsePersonalTaxInput(path, raw) {
  const spec = SPECS[path];
  const problems = [];
  const input = {};
  for (const key of Object.keys(raw)) {
    if (key !== "taxYear" && !Object.hasOwn(spec.fields, key)) problems.push(`${key}: unknown input`);
  }
  let taxYear = spec.taxYears.at(-1);
  if (raw.taxYear !== undefined) {
    taxYear = Number(raw.taxYear);
    if (!spec.taxYears.includes(taxYear)) problems.push(`taxYear: supported ${spec.taxYears.join(", ")} only (other years are not estimated)`);
  }
  for (const [name, field] of Object.entries(spec.fields)) {
    if (raw[name] === undefined || raw[name] === null) {
      if (field.required) problems.push(`${name}: required`);
      else if (field.fallback !== undefined) input[name] = field.fallback;
      continue;
    }
    const value = readValue(raw[name], field.kind, name, problems);
    if (field.kind === "count" && field.min !== undefined && value < field.min) problems.push(`${name}: at least ${field.min}`);
    input[name] = value;
  }
  if (problems.length) throw new InputError(problems);
  return { taxYear, input };
}

function yearEnd(taxYear, i) {
  const result = settleYearEnd({
    salary: i.salary, persons: i.persons, otherIncome: i.otherIncome,
    additional: { seniors: i.seniors, disabled: i.disabledPersons, womanHead: i.womanHead, singleParent: i.singleParent },
    nationalPension: i.nationalPension, healthEmployment: i.healthEmployment,
    housing: { leaseRepaid: i.leaseLoanRepaid, subscriptionPaid: i.housingSubscriptionPaid },
    card: { credit: i.creditCardSpend, debit: i.debitCardSpend, culture: i.cultureSpend, market: i.traditionalMarketSpend, transit: i.publicTransitSpend },
    cardChildren: i.cardChildren, creditChildren: i.creditChildren, birthOrder: i.birthOrder,
    insurancePremium: i.insurancePremium, medical: i.medical, medicalSpecific: i.medicalSpecific,
    education: i.education, educationSelf: i.educationSelf, donation: i.donation, religiousDonation: i.religiousDonation,
    politicalDonation: i.politicalDonation, hometownDonation: i.hometownDonation,
    pensionSavings: i.pensionSavings, irp: i.irp, isaTransfer: i.isaTransfer,
    rent: i.rent, rentEligible: i.rentEligible, marriage: i.marriage, youthSme: i.youthSme, withheld: i.withheld,
  });
  return {
    taxYear, asOf: YEAR_END_AS_OF, isEstimate: true, result,
    basis: [
      "소득세법 제47조(근로소득공제)·제50조(기본공제)·제51조(추가공제)·제52조(특별소득공제)·제55조(기본세율)",
      "소득세법 제59조(근로소득세액공제)·제59조의2(자녀세액공제)·제59조의3(연금계좌)·제59조의4(특별세액공제, ⑨ 표준세액공제 비교)",
      "조세특례제한법 제126조의2(신용카드 등 소득공제)·제87조(주택청약)·제95조의2(월세)·제30조(중소기업 취업 청년 감면)",
    ],
    notCovered: [
      "2026-08 세제개편안(2027 귀속 이후, 국회 통과 전)은 반영하지 않음",
      "장기주택저당차입금 이자 공제, 외국인 단일세율, 중도 입·퇴사 월할 계산",
      "부양가족 자격(나이·소득 요건)과 월세 요건은 사용자가 확인한 값을 그대로 씀",
    ],
    disclaimer: PERSONAL_TAX_DISCLAIMER,
  };
}

function freelancer(taxYear, i) {
  const rate = i.expenseRate ?? "simple";
  return {
    taxYear, asOf: INCOME_TAX_AS_OF, isEstimate: true,
    expenseMethod: rate === "simple"
      ? `단순경비율 940909 일반율 ${SIMPLE_EXPENSE_940909.rate * 100}% (수입 ${SIMPLE_EXPENSE_940909.split / 10_000}만 원 초과분 자가율 ${SIMPLE_EXPENSE_940909.selfRate * 100}%)`
      : `입력한 경비율 ${rate * 100}%`,
    result: freelancerSettlement(i.revenue, rate, i.people, i.pensionPremium ?? 0),
    basis: [
      "소득세법 제129조 ①3호(사업소득 원천징수 3%) + 지방소득세 0.3%",
      "소득세법 제55조(기본세율)·제50조(기본공제)·제51조의3(연금보험료공제)·제59조의4 ⑦(표준세액공제 7만 원)",
      "국세청 경비율 고시(940909 기타 자영업 인적용역)",
    ],
    notCovered: [
      "단순경비율 대상 여부(직전 연도 수입금액 기준)는 국세청이 정함. 기준경비율·장부 신고는 expenseRate로 직접 넣어야 함",
      "다른 종합소득 합산, 성실사업자 표준세액공제 12만 원, 전자신고세액공제",
    ],
    disclaimer: PERSONAL_TAX_DISCLAIMER,
  };
}

function acquisition(taxYear, i) {
  return {
    taxYear, asOf: REAL_ESTATE_TAX_AS_OF, isEstimate: true,
    result: acquisitionTax({ price: i.price, houses: i.houses, regulated: i.regulated ?? false, temporaryTwo: i.temporaryTwo ?? false, over85: i.over85 ?? false }),
    basis: [
      "지방세법 제11조 ①8호(주택 유상취득 1~3%, 6~9억 구간 산식)·제13조의2(다주택·조정대상지역 중과 8·12%)",
      "지방세법 제151조(지방교육세), 농어촌특별세법 제5조(전용 85㎡ 초과)",
    ],
    notCovered: [
      "생애최초·출산 감면, 법인·증여·상속 취득, 일시적 2주택 처분 기한 판정(사용자가 넣은 값 사용)",
      "주택 수 계산 자체(분양권·입주권·오피스텔 포함 여부)는 판단하지 않음",
    ],
    disclaimer: PERSONAL_TAX_DISCLAIMER,
  };
}

function property(taxYear, i) {
  return {
    taxYear, asOf: REAL_ESTATE_TAX_AS_OF, isEstimate: true,
    result: propertyTax(i.officialPrice, i.oneHouse, i.urbanArea),
    basis: [
      "지방세법 제111조(주택 표준세율)·제111조의2(1세대1주택 공시가격 9억 이하 특례세율)·제112조(도시지역분 0.14%)",
      "지방세법 시행령 제109조(공정시장가액비율 60%, 1세대1주택 43·44·45%), 지방세법 제151조(지방교육세 20%)",
    ],
    notCovered: [
      "세부담상한, 종합부동산세, 토지·건축물분 재산세, 지역자원시설세",
    ],
    disclaimer: PERSONAL_TAX_DISCLAIMER,
  };
}

const HANDLERS = {
  "/v1/tax/kr/year-end-settlement": yearEnd,
  "/v1/tax/kr/freelancer-income-tax": freelancer,
  "/v1/tax/kr/acquisition-tax": acquisition,
  "/v1/tax/kr/property-tax": property,
};

export function calculatePersonalTax(path, raw) {
  const { taxYear, input } = parsePersonalTaxInput(path, raw);
  try {
    return HANDLERS[path](taxYear, input);
  } catch (err) {
    // The tools libraries throw RangeError(name) for values outside their legal domain.
    if (err instanceof RangeError) throw new InputError([`${err.message}: out of range`]);
    throw err;
  }
}

/** REST entry. Returns null when the path is not a personal-tax route. */
export async function handlePersonalTax(request, url, headers) {
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
    const result = calculatePersonalTax(url.pathname, raw);
    return new Response(method === "HEAD" ? null : JSON.stringify(result), { status: 200, headers });
  } catch (err) {
    if (err instanceof InputError) return Response.json({ error: "invalid_input", problems: err.problems }, { status: 400, headers });
    throw err;
  }
}
