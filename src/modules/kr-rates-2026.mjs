// kr-rates-2026.mjs — single source of truth (SSOT) for 2026 Korean payroll and
// social-insurance values plus the small pure formulas that use them.
//
// WHY one module (2026-10-17, FAANG audit A-1/S-1~S-4): the same rates lived in
// four places (blog kr-payroll-2026.ts, blog salary-calculator, api labor.mjs,
// tools inline page JS) and the api/tools copies shipped 2025 values under a
// "2026" label. This file is the canonical copy:
//   - api-oiyo   src/modules/kr-rates-2026.mjs   (this file)
//   - tools-oiyo src/lib/kr-rates-2026.mjs        byte-identical copy (scripts/sync-kr-rates.mjs)
//   - blog       src/lib/kr-payroll-2026.ts       flat RATES (Claude 438751fb, 2026-10-12)
// Parity tests in api and tools fail if a shared value drifts from blog.
//
// To change a year: edit KR_RATES_2026 and the test vectors, not the formulas.
// Plain JS (no TS syntax) so the Worker, Node tests and Astro client bundles can
// all import it unchanged.

/** Date the 2026 rates took effect. Shown on pages as "기준일". */
export const RATES_EFFECTIVE_FROM = "2026-01-01";
/** Date each value below was last checked against the cited official source. */
export const RATES_VERIFIED_ON = "2026-10-17";

const deepFreeze = (value) => {
  if (value && typeof value === "object") {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
};

export const KR_RATES_2026 = deepFreeze({
  year: 2026,

  // 고용노동부고시 제2025-47호(2025-08-05) "2026년 적용 최저임금 고시": 시간급 10,320원.
  // https://www.law.go.kr/admRulLsInfoP.do?admRulSeq=2100000262710
  minimumWage: 10_320,

  pension: {
    // 국민연금법 제88조(2025-03 개정, 2026-01-01 시행): 9.0% → 9.5%, 사업장가입자 근로자 절반 4.75%.
    // https://www.nps.or.kr (2026 보험료율 안내), 보건복지부 보도자료 list_no=1488572
    total: 0.095,
    employee: 0.0475,
    // 기준소득월액 상·하한은 매년 7월분에 바뀐다(국민연금법 시행령 제5조).
    // 2025-07~2026-06: 하한 400,000 / 상한 6,370,000 — NPS EDI 업무안내(edi.nps.or.kr/cm/main/guide/edi_workguide_new.pdf)
    // 2026-07~2027-06: 하한 410,000 / 상한 6,590,000 — 보건복지부고시 제2026-31호(2026-02-02)
    //   https://www.law.go.kr/conAdmrulByLsPop.do?lsiSeq=237155
    bounds: [
      { fromMonth: "2025-07", toMonth: "2026-06", floor: 400_000, cap: 6_370_000 },
      { fromMonth: "2026-07", toMonth: "2027-06", floor: 410_000, cap: 6_590_000 },
    ],
    // 2026-10-17 기준 현재 적용 구간. 결정적 응답을 위해 "오늘"이 아니라 고정값을 쓴다.
    defaultPayMonth: "2026-07",
  },

  health: {
    // 국민건강보험법 시행령 제44조①(2025-12-23 개정): 1만분의 719 = 7.19%, 근로자 절반 3.595%.
    // https://www.nhis.or.kr/nhis/etc/20251204_banner_pop01.do
    total: 0.0719,
    employee: 0.03595,
    // 장기요양보험료율 0.9448%(소득 대비) = 건강보험료의 13.14%. 보건복지부 보도자료 list_no=1487817.
    // 공단 계산식은 건강보험료 × 0.9448% ÷ 7.19%라서 계산에는 longTermCareRate/total을 쓴다.
    longTermCareRate: 0.009448,
    longTermCareOfHealth: 0.1314,
    // 보건복지부고시 제2025-222호 "월별 건강보험료액의 상한과 하한에 관한 고시"(2026-01-01 시행).
    // https://www.law.go.kr/LSW/admRulInfoP.do?admRulSeq=2100000270472
    monthlyFloor: 20_160,
    employeeMonthlyCap: 9_183_480,
    regionalMonthlyCap: 4_591_740,
  },

  regional: {
    // 지역가입자: 소득월액 × 7.19% + 재산점수 × 211.5원(시행령 제44조②, 2025-12-23 개정).
    incomeRate: 0.0719,
    pointValue: 211.5,
    // 시행령 별표4(2024-02-13 개정): 재산 기본공제 1억원, 연소득 336만원 이하면 소득분 대신 하한 보험료.
    // https://www.law.go.kr/flDownload.do?bylClsCd=110201&flSeq=139783837&gubun=
    propertyBasicDeduction: 100_000_000,
    lowIncomeThresholdAnnual: 3_360_000,
    // 시행규칙 제44조: 이자·배당 합계 연 1천만원 이하는 미반영(초과 시 전액), 근로·연금소득은 50% 반영.
    financialIncomeExclusion: 10_000_000,
    earnedOrPensionIncomeRatio: 0.5,
    // 별표4 제3호 재산등급별 점수 60등급. [상한(만원, 이하), 점수]; 마지막 등급은 상한 없음.
    propertyScoreTable: [
      [450, 22], [900, 44], [1_350, 66], [1_800, 97], [2_250, 122], [2_700, 146], [3_150, 171], [3_600, 195],
      [4_050, 219], [4_500, 244], [5_020, 268], [5_590, 294], [6_220, 320], [6_930, 344], [7_710, 365], [8_590, 386],
      [9_570, 412], [10_700, 439], [11_900, 465], [13_300, 490], [14_800, 516], [16_400, 535], [18_300, 559], [20_400, 586],
      [22_700, 611], [25_300, 637], [28_100, 659], [31_300, 681], [34_900, 706], [38_800, 731], [43_200, 757], [48_100, 785],
      [53_600, 812], [59_700, 841], [66_500, 881], [74_000, 921], [82_400, 961], [91_800, 1_001], [103_000, 1_041], [114_000, 1_091],
      [127_000, 1_141], [142_000, 1_191], [158_000, 1_241], [176_000, 1_291], [196_000, 1_341], [218_000, 1_391], [242_000, 1_451], [270_000, 1_511],
      [300_000, 1_571], [330_000, 1_641], [363_000, 1_711], [399_300, 1_781], [439_230, 1_851], [483_153, 1_921], [531_468, 1_991], [584_615, 2_061],
      [643_077, 2_131], [707_385, 2_201], [778_124, 2_271], [Infinity, 2_341],
    ],
  },

  employment: {
    // 고용보험 실업급여 보험료율 1.8%, 근로자 0.9%(보험료징수법 시행령 제12조). 고용노동부 2026 고용보험 안내.
    total: 0.018,
    employee: 0.009,
  },

  unemployment: {
    // 고용보험법 제46조: 구직급여일액 = 기초일액 × 60%, 하한 = 최저임금 × 80% × 1일 소정근로시간.
    // 2026-01-01 이후 이직자: 상한 68,100원(기초일액 상한 113,500원), 8시간 하한 66,048원.
    // 고용노동부 보도자료 news_seq=18440, 1350 상담 https://1350.moel.go.kr/rtmview.do?id=1000324861
    replacementRate: 0.6,
    floorRatioOfMinimumWage: 0.8,
    dailyCap: 68_100,
    dailyFloor8h: 66_048,
    baseDailyWageCap: 113_500,
    // 고용보험법 별표1 소정급여일수. p1 <1년, p2 1~3년, p3 3~5년, p4 5~10년, p5 10년 이상.
    daysTable: {
      under: { p1: 120, p2: 150, p3: 180, p4: 210, p5: 240 },
      over: { p1: 120, p2: 180, p3: 210, p4: 240, p5: 270 },
    },
  },

  parentalLeave: {
    // 고용보험법 시행령 제95조(2025-01-01 시행): 1~3개월 100%·상한 250만, 4~6개월 100%·상한 200만,
    // 7개월~ 80%·상한 160만, 하한 70만. 25% 사후지급은 2025-01-01 폐지(휴직 중 전액 지급).
    // 6+6 부모 함께 육아휴직(시행령 제95조의3): 첫 6개월 100%, 월 상한 250·250·300·350·400·450만.
    // 고용노동부 보도자료(2024-12, bbs_seq=17412), 고용24 제도안내 SI00000402.
    general: [
      { fromMonth: 1, toMonth: 3, rate: 1.0, cap: 2_500_000 },
      { fromMonth: 4, toMonth: 6, rate: 1.0, cap: 2_000_000 },
      { fromMonth: 7, toMonth: 18, rate: 0.8, cap: 1_600_000 },
    ],
    floor: 700_000,
    sixPlusSixCaps: [2_500_000, 2_500_000, 3_000_000, 3_500_000, 4_000_000, 4_500_000],
    deferredShare: 0,
  },

  incomeTax: {
    // 근로소득세는 국세청 간이세액표를 구현하지 않았다. 아래 연간 환산식으로 "추정"만 한다.
    // 소득세법 제55조 기본세율(2023 귀속~): [과세표준 상한, 세율].
    brackets: [
      [14_000_000, 0.06], [50_000_000, 0.15], [88_000_000, 0.24], [150_000_000, 0.35],
      [300_000_000, 0.38], [500_000_000, 0.4], [1_000_000_000, 0.42], [Infinity, 0.45],
    ],
    personalDeductionPerPerson: 1_500_000, // 제50조 기본공제
    standardTaxCredit: 130_000, // 제59조의4⑨ 근로자 표준세액공제
    localIncomeTaxRate: 0.1, // 지방세법 제103조의3: 소득세의 10%
  },

  // 2026-10-17 추가(Gemini 상속·증여·카드공제 계산기 정본 이관). 페이지·엔드포인트가 숫자를 따로 쓰지 않게 한다.
  inheritanceGift: {
    // 상속세 및 증여세법 제26조 세율(시행 2026-01-02, 법률 제21065호). 2024·2025 정부안(최고세율 40%, 자녀공제 5억)은
    // 국회에서 통과되지 않아 2026에도 10~50% 5단계다. 국세청 증여세 개요 cntntsId=7728, 상속세 항목별 설명 cntntsId=7957.
    // [과세표준 상한, 세율, 누진공제]
    brackets: [
      [100_000_000, 0.1, 0],
      [500_000_000, 0.2, 10_000_000],
      [1_000_000_000, 0.3, 60_000_000],
      [3_000_000_000, 0.4, 160_000_000],
      [Infinity, 0.5, 460_000_000],
    ],
    // 제53조 증여재산공제(10년 합산 한도). relationship = 수증자가 증여자에게 어떤 관계인지.
    giftDeductions: {
      spouse: 600_000_000, // 배우자로부터
      child_adult: 50_000_000, // 직계존속으로부터(성년)
      child_minor: 20_000_000, // 직계존속으로부터(미성년)
      parent: 50_000_000, // 직계비속으로부터
      other_relative: 10_000_000, // 6촌 이내 혈족·4촌 이내 인척
      other: 0,
    },
    // 제53조의2 혼인·출산 증여재산공제: 직계존속으로부터 혼인신고일 전후 2년·출생일 2년 이내, 둘을 합쳐 평생 1억.
    marriageBirthDeduction: 100_000_000,
    // 제21조 일괄공제 5억, 제19조 배우자상속공제 최소 5억~최대 30억(법정상속분 한도).
    inheritanceLumpSum: 500_000_000,
    spouseInheritanceMin: 500_000_000,
    spouseInheritanceMax: 3_000_000_000,
    // 제27조·제57조 세대생략 할증 30%, 미성년자가 20억 초과를 받으면 40%.
    generationSkipSurcharge: 0.3,
    generationSkipSurchargeMinorLarge: 0.4,
    generationSkipMinorThreshold: 2_000_000_000,
    // 제69조 신고세액공제 3%.
    filingCredit: 0.03,
  },

  cardDeduction: {
    // 조세특례제한법 제126조의2(2025-12-23 개정, 2026-01-01 이후 지출분). 재정경제부 "이렇게 달라집니다" 2026 상반기.
    // https://www.law.go.kr/lsLinkCommonInfo.do?lsJoLnkSeq=1032251007
    thresholdRatio: 0.25,
    rates: { credit: 0.15, debitCash: 0.3, culture: 0.3, market: 0.4, transit: 0.4 },
    // 문화체육 사용분 30%는 총급여 7천만원 이하만. 초과자는 결제수단별 공제율에 포함된다.
    salaryTier: 70_000_000,
    // 기본한도 [자녀 0명, 1명, 2명 이상] — 2026 지출분부터 자녀 수에 따라 상향(~2028-12-31).
    baseLimitUpToTier: [3_000_000, 3_500_000, 4_000_000],
    baseLimitOverTier: [2_500_000, 2_750_000, 3_000_000],
    // 전통시장·대중교통·문화체육 추가한도(합산).
    extraLimitUpToTier: 3_000_000,
    extraLimitOverTier: 2_000_000,
  },
});

// ---------------------------------------------------------------------------
// Rounding helpers. NHIS/NPS 고지는 10원 미만을 버린다. 1e-6 보정은
// 700,000 × 0.009 = 6,299.999… 같은 부동소수 오차를 막는다(blog floor10과 동일).
export const floor10 = (won) => Math.floor(Math.round(won * 1e6) / 1e7) * 10;
const floorWon = (won) => Math.floor(Math.round(won * 1e6) / 1e6);
const num = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

/** 국민연금 기준소득월액 상·하한. payMonth "YYYY-MM"; 범위 밖이면 가장 가까운 구간. */
export function pensionBounds(payMonth = KR_RATES_2026.pension.defaultPayMonth) {
  const list = KR_RATES_2026.pension.bounds;
  const month = typeof payMonth === "string" && /^\d{4}-\d{2}$/.test(payMonth) ? payMonth : KR_RATES_2026.pension.defaultPayMonth;
  return list.find((b) => month >= b.fromMonth && month <= b.toMonth) ?? (month < list[0].fromMonth ? list[0] : list[list.length - 1]);
}

/** 직장가입자 근로자 부담 4대보험(산재 제외) 월액. */
export function employeeInsurance2026(taxableMonthly, { payMonth } = {}) {
  const R = KR_RATES_2026;
  const taxable = Math.max(0, num(taxableMonthly));
  const bounds = pensionBounds(payMonth);
  const pensionBase = Math.min(bounds.cap, Math.max(bounds.floor, taxable));
  // 연금·건강보험료는 전체 보험료를 10원 미만 절사한 뒤 노사가 절반씩 부담한다.
  const nationalPension = floor10(pensionBase * R.pension.total) / 2;
  const healthTotal = Math.min(R.health.employeeMonthlyCap, Math.max(R.health.monthlyFloor, floor10(taxable * R.health.total)));
  const healthInsurance = healthTotal / 2;
  const longTermCare = floor10((healthTotal * R.health.longTermCareRate) / R.health.total) / 2;
  const employmentInsurance = floorWon(taxable * R.employment.employee);
  return {
    pensionBase,
    pensionBounds: { floor: bounds.floor, cap: bounds.cap, fromMonth: bounds.fromMonth, toMonth: bounds.toMonth },
    nationalPension,
    healthInsurance,
    longTermCare,
    employmentInsurance,
    totalInsurance: nationalPension + healthInsurance + longTermCare + employmentInsurance,
  };
}

/** 소득세법 제47조 근로소득공제(한도 2,000만원). */
export function earnedIncomeDeduction(annualGross) {
  const g = Math.max(0, num(annualGross));
  let d;
  if (g <= 5_000_000) d = g * 0.7;
  else if (g <= 15_000_000) d = 3_500_000 + (g - 5_000_000) * 0.4;
  else if (g <= 45_000_000) d = 7_500_000 + (g - 15_000_000) * 0.15;
  else if (g <= 100_000_000) d = 12_000_000 + (g - 45_000_000) * 0.05;
  else d = 14_750_000 + (g - 100_000_000) * 0.02;
  return Math.min(20_000_000, Math.floor(d));
}

/** 소득세법 제55조 기본세율 산출세액. */
export function progressiveIncomeTax(taxBase) {
  let remaining = Math.max(0, num(taxBase));
  let lower = 0;
  let tax = 0;
  for (const [upper, rate] of KR_RATES_2026.incomeTax.brackets) {
    const slice = Math.min(remaining, upper - lower);
    if (slice <= 0) break;
    tax += slice * rate;
    remaining -= slice;
    lower = upper;
  }
  return Math.floor(tax);
}

/** 소득세법 제59조 근로소득세액공제(총급여별 한도 포함). */
export function earnedIncomeTaxCredit(computedTax, annualGross) {
  const t = Math.max(0, num(computedTax));
  const g = Math.max(0, num(annualGross));
  const raw = t <= 1_300_000 ? t * 0.55 : 715_000 + (t - 1_300_000) * 0.3;
  let limit;
  if (g <= 33_000_000) limit = 740_000;
  else if (g <= 70_000_000) limit = Math.max(660_000, 740_000 - (g - 33_000_000) * 0.008);
  else if (g <= 120_000_000) limit = Math.max(500_000, 660_000 - (g - 70_000_000) * 0.5);
  else limit = Math.max(200_000, 500_000 - (g - 120_000_000) * 0.5);
  return Math.floor(Math.min(raw, limit));
}

/**
 * 근로소득세 월 추정액(추정). 국세청 간이세액표가 아니다: 월 과세급여 × 12를 연간 총급여로 보고
 * 근로소득공제 → 기본공제(1인 150만) → 연금·건강·고용보험료 공제 → 기본세율 → 근로소득세액공제
 * → 표준세액공제 13만원을 적용한 뒤 12로 나눈다. 자녀세액공제·특별공제·비과세 감면은 넣지 않았다.
 */
export function estimateMonthlyIncomeTax2026({ taxableMonthly, dependents = 1, monthlyInsurance }) {
  const R = KR_RATES_2026.incomeTax;
  const taxable = Math.max(0, num(taxableMonthly));
  const people = Math.max(1, Math.floor(num(dependents, 1)));
  const ins = monthlyInsurance ?? employeeInsurance2026(taxable);
  const annualGross = taxable * 12;
  const earnedIncome = annualGross - earnedIncomeDeduction(annualGross);
  const taxBase = Math.max(
    0,
    earnedIncome - people * R.personalDeductionPerPerson - ins.nationalPension * 12 - (ins.healthInsurance + ins.longTermCare + ins.employmentInsurance) * 12,
  );
  const computed = progressiveIncomeTax(taxBase);
  const annualTax = Math.max(0, computed - earnedIncomeTaxCredit(computed, annualGross) - R.standardTaxCredit);
  const incomeTax = floor10(annualTax / 12);
  const localTax = floor10(incomeTax * R.localIncomeTaxRate);
  return { method: "annualized-estimate", isEstimate: true, annualTaxBase: taxBase, incomeTax, localTax, totalTax: incomeTax + localTax };
}

/** 월급(또는 연봉) → 4대보험·소득세(추정) 공제 후 실수령액. */
export function netSalary2026({ salary = 3_500_000, isAnnual = false, nonTaxable = 200_000, dependents = 1, payMonth } = {}) {
  const grossMonthly = Math.max(0, Math.floor(isAnnual ? num(salary) / 12 : num(salary)));
  const nonTax = Math.min(grossMonthly, Math.max(0, num(nonTaxable)));
  const taxable = grossMonthly - nonTax;
  const insurances = employeeInsurance2026(taxable, { payMonth });
  const taxes = estimateMonthlyIncomeTax2026({ taxableMonthly: taxable, dependents, monthlyInsurance: insurances });
  const totalDeductions = insurances.totalInsurance + taxes.totalTax;
  const netPayMonthly = grossMonthly - totalDeductions;
  return {
    grossMonthly,
    nonTaxable: nonTax,
    taxable,
    insurances,
    taxes,
    totalDeductions,
    netPayMonthly,
    deductionRatePercentage: grossMonthly > 0 ? Number(((totalDeductions / grossMonthly) * 100).toFixed(2)) : 0,
  };
}

/** 구직급여 1일액(고용보험법 제46조). monthlyWage/30을 기초일액 근사로 쓴다. */
export function unemploymentDailyBenefit2026({ monthlyWage = 3_000_000, hoursPerDay = 8 } = {}) {
  const U = KR_RATES_2026.unemployment;
  const hours = Math.max(1, Math.min(8, num(hoursPerDay, 8) || 8));
  const minDailyFloor = Math.floor(KR_RATES_2026.minimumWage * U.floorRatioOfMinimumWage * hours);
  const baseDailyWage = Math.max(0, num(monthlyWage)) / 30;
  let dailyBenefit = Math.floor(baseDailyWage * U.replacementRate);
  let limitType = "standard";
  if (dailyBenefit >= U.dailyCap) {
    dailyBenefit = U.dailyCap;
    limitType = "cap_applied";
  } else if (dailyBenefit <= minDailyFloor) {
    dailyBenefit = minDailyFloor;
    limitType = "floor_applied";
  }
  return { hours, baseDailyWage, dailyBenefit, limitType, minDailyFloor, maxDailyCap: U.dailyCap };
}

/** 소정급여일수(고용보험법 별표1). */
export function unemploymentDays2026(ageGroup = "under", periodCode = "p3") {
  const table = KR_RATES_2026.unemployment.daysTable[ageGroup === "over" ? "over" : "under"];
  return table[periodCode] ?? table.p3;
}

/** 육아휴직급여 월별 지급액(2025-01-01 개편, 사후지급 없음). */
export function parentalLeaveSchedule2026({ monthlyWage = 3_500_000, leaveMonths = 12, isParental6Plus6 = false } = {}) {
  const P = KR_RATES_2026.parentalLeave;
  const wage = Math.max(0, num(monthlyWage));
  const months = Math.max(1, Math.min(12, Math.floor(num(leaveMonths, 12)) || 12));
  const monthlyBreakdown = [];
  for (let m = 1; m <= months; m++) {
    let gross;
    let scheme;
    if (isParental6Plus6 && m <= P.sixPlusSixCaps.length) {
      gross = Math.min(wage, P.sixPlusSixCaps[m - 1]);
      scheme = "six_plus_six";
    } else {
      const tier = P.general.find((t) => m >= t.fromMonth && m <= t.toMonth) ?? P.general[P.general.length - 1];
      gross = Math.floor(Math.min(Math.max(wage * tier.rate, P.floor), tier.cap));
      scheme = "general";
    }
    monthlyBreakdown.push({ month: m, scheme, grossAmount: gross, upfrontPaid: gross, deferredAmount: 0 });
  }
  const totalBenefit = monthlyBreakdown.reduce((s, r) => s + r.grossAmount, 0);
  return { months, totalBenefit, monthlyAverage: Math.round(totalBenefit / months), monthlyBreakdown };
}

/** 지역가입자 재산점수(시행령 별표4). taxBase = 재산세 과세표준 + 전월세 평가액 합계(원). */
export function regionalPropertyScore2026(taxBase) {
  const net = Math.max(0, num(taxBase) - KR_RATES_2026.regional.propertyBasicDeduction);
  if (net <= 0) return 0;
  const netManwon = net / 10_000;
  return KR_RATES_2026.regional.propertyScoreTable.find(([upper]) => netManwon <= upper)[1];
}

/** 지역가입자 월 건강보험료·장기요양보험료(경감·감면 제외). */
export function regionalHealthPremium2026({ businessIncome = 0, financialIncome = 0, earnedOrPensionIncome = 0, propertyTaxBase = 0 } = {}) {
  const R = KR_RATES_2026;
  const fin = Math.max(0, num(financialIncome));
  const assessedAnnualIncome =
    Math.max(0, num(businessIncome)) +
    (fin > R.regional.financialIncomeExclusion ? fin : 0) +
    Math.max(0, num(earnedOrPensionIncome)) * R.regional.earnedOrPensionIncomeRatio;
  const lowIncome = assessedAnnualIncome <= R.regional.lowIncomeThresholdAnnual;
  // 별표4 단서: 연소득 336만원 이하는 소득분 대신 하한 보험료(20,160원)를 소득 몫으로 본다.
  const incomePremium = lowIncome ? R.health.monthlyFloor : (assessedAnnualIncome / 12) * R.regional.incomeRate;
  const propertyScore = regionalPropertyScore2026(propertyTaxBase);
  const propertyPremium = propertyScore * R.regional.pointValue;
  const raw = incomePremium + propertyPremium;
  const healthPremium = Math.min(R.health.regionalMonthlyCap, Math.max(R.health.monthlyFloor, floor10(raw)));
  const carePremium = floor10((healthPremium * R.health.longTermCareRate) / R.health.total);
  return {
    assessedAnnualIncome,
    lowIncomeFloorApplied: lowIncome,
    incomePremium: Math.floor(incomePremium),
    propertyScore,
    propertyPremium: Math.floor(propertyPremium),
    healthPremium,
    carePremium,
    totalMonthly: healthPremium + carePremium,
  };
}

// ---------------------------------------------------------------------------
// 상속·증여세, 카드 소득공제 (2026-10-17). 모의계산이며 10년 합산·평가·감정·가업상속 등은 넣지 않았다.

/** 상증세법 제26조 산출세액. 누진공제 방식. */
export function inheritanceGiftProgressiveTax(taxableBase) {
  const base = Math.max(0, num(taxableBase));
  if (base <= 0) return { tax: 0, rate: 0, progressiveDeduction: 0 };
  const [, rate, progressiveDeduction] = KR_RATES_2026.inheritanceGift.brackets.find(([upper]) => base <= upper);
  return { tax: Math.max(0, Math.floor(base * rate - progressiveDeduction)), rate, progressiveDeduction };
}

/**
 * 상속세·증여세 모의계산.
 * gift: 관계별 증여재산공제(+선택 시 혼인·출산 공제, 직계존속→자녀만). 10년 내 기존 증여는 반영하지 않는다.
 * inheritance: 일괄공제 5억 + 배우자상속공제(입력이 없으면 최소 5억). 기초·인적공제 선택, 금융재산공제 등은 제외.
 * @param {{ mode?: string, assetValue?: number, debtValue?: number, relationship?: string, marriageBirthDeduction?: number,
 *   hasSpouse?: boolean, spouseDeduction?: number, isGenerationSkipping?: boolean, isMinorRecipient?: boolean,
 *   hasVoluntaryReporting?: boolean }} params
 */
export function inheritanceGiftTax2026({
  mode = "gift",
  assetValue = 0,
  debtValue = 0,
  relationship = "spouse",
  marriageBirthDeduction = 0,
  hasSpouse = true,
  spouseDeduction,
  isGenerationSkipping = false,
  isMinorRecipient,
  hasVoluntaryReporting = true,
} = {}) {
  const G = KR_RATES_2026.inheritanceGift;
  const asset = num(assetValue, NaN);
  if (!Number.isFinite(asset) || asset < 0) throw new Error("assetValue must be a non-negative number");
  const debt = Math.max(0, num(debtValue));
  const netAssetValue = Math.max(0, asset - debt);
  const isGift = mode !== "inheritance";
  let deduction;
  let marriageBirthApplied = 0;
  if (isGift) {
    deduction = G.giftDeductions[relationship] ?? 0;
    if (relationship === "child_adult" || relationship === "child_minor") {
      marriageBirthApplied = Math.min(G.marriageBirthDeduction, Math.max(0, num(marriageBirthDeduction)));
      deduction += marriageBirthApplied;
    }
  } else {
    const spouse = hasSpouse
      ? Math.min(G.spouseInheritanceMax, Math.max(G.spouseInheritanceMin, num(spouseDeduction, G.spouseInheritanceMin)))
      : 0;
    deduction = G.inheritanceLumpSum + spouse;
  }
  const taxableBase = Math.max(0, netAssetValue - deduction);
  const { tax: calculatedTax, rate, progressiveDeduction } = inheritanceGiftProgressiveTax(taxableBase);
  const minor = isMinorRecipient ?? relationship === "child_minor";
  const surchargeRate = !isGenerationSkipping
    ? 0
    : minor && netAssetValue > G.generationSkipMinorThreshold
      ? G.generationSkipSurchargeMinorLarge
      : G.generationSkipSurcharge;
  const generationSkipSurcharge = Math.floor(calculatedTax * surchargeRate);
  const subtotalTax = calculatedTax + generationSkipSurcharge;
  const voluntaryReportCredit = hasVoluntaryReporting ? Math.floor(subtotalTax * G.filingCredit) : 0;
  const finalTax = Math.max(0, subtotalTax - voluntaryReportCredit);
  return {
    mode: isGift ? "gift" : "inheritance",
    netAssetValue,
    statutoryMaxDeduction: deduction,
    deductionAmount: Math.min(netAssetValue, deduction),
    marriageBirthDeductionApplied: marriageBirthApplied,
    taxableBase,
    bracketRate: rate,
    progressiveDeduction,
    calculatedTax,
    generationSkipSurchargeRate: surchargeRate,
    generationSkipSurcharge,
    voluntaryReportCredit,
    finalTax,
  };
}

/** 근로소득 과세표준 근사(총급여 − 근로소득공제 − 본인 기본공제). 카드공제 절세액 "추정"에만 쓴다. */
export function approxEarnedIncomeTaxBase(annualGross, dependents = 1) {
  const g = Math.max(0, num(annualGross));
  const people = Math.max(1, Math.floor(num(dependents, 1)));
  return Math.max(0, g - earnedIncomeDeduction(g) - people * KR_RATES_2026.incomeTax.personalDeductionPerPerson);
}

/** 소득세법 제55조 한계세율. */
export function marginalIncomeTaxRate(taxBase) {
  const base = Math.max(0, num(taxBase));
  return KR_RATES_2026.incomeTax.brackets.find(([upper]) => base <= upper)[1];
}

/**
 * 신용카드 등 소득공제(조특법 제126조의2) 모의계산. 국세청 소득공제신청서 별지 제74호의6 산식 순서를 따른다:
 * 최저사용금액(총급여 25%)은 신용카드 → 체크·현금·문화 → 전통시장·대중교통 순으로 채운다.
 * 총급여 7천만원 초과자의 문화체육 사용분은 결제수단을 모르므로 신용카드(15%)로 본다(보수적).
 * @param {{ annualSalary: number, creditCardSpend?: number, checkCardSpend?: number, cultureSpend?: number,
 *   traditionalMarketSpend?: number, publicTransitSpend?: number, children?: number }} params
 */
export function cardDeduction2026({
  annualSalary,
  creditCardSpend = 0,
  checkCardSpend = 0,
  cultureSpend = 0,
  traditionalMarketSpend = 0,
  publicTransitSpend = 0,
  children = 0,
} = {}) {
  const C = KR_RATES_2026.cardDeduction;
  const salary = num(annualSalary, NaN);
  if (!Number.isFinite(salary) || salary <= 0) throw new Error("annualSalary must be a positive number");
  const pos = (v) => Math.max(0, num(v));
  const upToTier = salary <= C.salaryTier;
  const culture = pos(cultureSpend);
  const credit = pos(creditCardSpend) + (upToTier ? 0 : culture);
  const debit = pos(checkCardSpend);
  const cultureEligible = upToTier ? culture : 0;
  const market = pos(traditionalMarketSpend);
  const transit = pos(publicTransitSpend);

  // 최저사용금액은 공제율이 낮은 순서로 채운다(별지 제74호의6 공제제외금액 산식과 같은 결과).
  const threshold = Math.floor(salary * C.thresholdRatio);
  let remaining = threshold;
  const takeAboveThreshold = (amount) => {
    const used = Math.min(amount, remaining);
    remaining -= used;
    return amount - used;
  };
  const creditEligible = takeAboveThreshold(credit);
  const checkEligible = takeAboveThreshold(debit);
  const cultureAbove = takeAboveThreshold(cultureEligible);
  const marketEligible = takeAboveThreshold(market);
  const transitEligible = takeAboveThreshold(transit);

  const creditDeduction = Math.floor(creditEligible * C.rates.credit);
  const checkDeduction = Math.floor(checkEligible * C.rates.debitCash);
  const cultureDeduction = Math.floor(cultureAbove * C.rates.culture);
  const marketDeduction = Math.floor(marketEligible * C.rates.market);
  const transitDeduction = Math.floor(transitEligible * C.rates.transit);
  const grossDeduction = creditDeduction + checkDeduction + cultureDeduction + marketDeduction + transitDeduction;
  const kids = Math.max(0, Math.min(2, Math.floor(num(children))));
  const baseLimit = (upToTier ? C.baseLimitUpToTier : C.baseLimitOverTier)[kids];
  const extraLimit = upToTier ? C.extraLimitUpToTier : C.extraLimitOverTier;
  const actualBaseDeduction = Math.min(grossDeduction, baseLimit);
  // 추가공제는 기본한도를 넘은 금액 중 문화·전통시장·대중교통 공제분까지만(최저사용금액 차감 후 금액으로 보수적 계산).
  const actualExtraDeduction = Math.min(
    grossDeduction - actualBaseDeduction,
    cultureDeduction + marketDeduction + transitDeduction,
    extraLimit,
  );
  const totalDeduction = actualBaseDeduction + actualExtraDeduction;
  const approxTaxBase = approxEarnedIncomeTaxBase(salary);
  const marginalRate = marginalIncomeTaxRate(approxTaxBase);
  const estimatedTaxRefund = Math.floor(totalDeduction * marginalRate * (1 + KR_RATES_2026.incomeTax.localIncomeTaxRate));
  return {
    threshold25Percent: threshold,
    totalSpend: credit + debit + cultureEligible + market + transit,
    cultureCountedAsCredit: !upToTier && culture > 0,
    thresholdMet: remaining === 0,
    creditDeduction,
    checkDeduction,
    cultureDeduction,
    marketDeduction,
    transitDeduction,
    grossDeduction,
    children: kids,
    baseLimit,
    extraLimit,
    actualBaseDeduction,
    actualExtraDeduction,
    totalDeduction,
    approxTaxBase,
    marginalRate,
    estimatedTaxRefund,
    isEstimate: true,
  };
}
