import { KR_RATES_2026 } from "./kr-rates-2026.mjs";
import { KR_RATES_2027 } from "./kr-rates-2027.mjs";

export function koreaYear(now = new Date()) {
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) throw new Error("Invalid reference date");
  return Number(new Intl.DateTimeFormat("en", { year: "numeric", timeZone: "Asia/Seoul" }).format(now));
}

export function minimumWageForYear(year = koreaYear()) {
  // 2026-10-25: only omitted year selects the KST default; blank/unknown years fail.
  if (!Number.isInteger(year) || ![2026, 2027].includes(year)) throw new Error("Supported years: 2026, 2027");
  const is2027 = year === 2027;
  const hourly = is2027 ? KR_RATES_2027.minimumWage.value : KR_RATES_2026.minimumWage;
  return {
    jurisdiction: "KR", year, currency: "KRW", hourly,
    effectiveFrom: `${year}-01-01`, effectiveTo: `${year}-12-31`,
    legalStatus: "enacted", checkedAt: "2026-10-25",
    sourceUrl: "https://minimumwage.go.kr/minWage/policy/decisionMain.do",
    examples: { eightHours: hourly * 8, month209Hours: hourly * 209 },
    assumptions: { dailyHours: 8, monthlyHours: 209, monthlyExampleNotUniversalSalary: true },
    payrollSupported: !is2027,
    ...(is2027 ? { insurance: KR_RATES_2027.insurance, insuranceEvidence: KR_RATES_2027.insuranceEvidence } : {}),
  };
}
