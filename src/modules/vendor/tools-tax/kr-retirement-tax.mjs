// GENERATED from tools-oiyo src/lib/kr-retirement-tax.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 퇴직소득세 (소득세법 제48조 퇴직소득공제, 제55조 기본세율). Moved from Blog in W8 (2026-10-27).
// Blog used pre-2023 progressive deductions with a 14% second bracket; the brackets now come from
// the shared rate registry (kr-rates-2026.mjs), so retirement and income tax read the same table.
import { progressiveIncomeTax } from "../../kr-rates-2026.mjs";

/** 제48조①1 근속연수공제(2023 귀속~). */
export function serviceYearDeduction(years        )         {
  if (years <= 5) return years * 1_000_000;
  if (years <= 10) return 5_000_000 + (years - 5) * 2_000_000;
  if (years <= 20) return 15_000_000 + (years - 10) * 2_500_000;
  return 40_000_000 + (years - 20) * 3_000_000;
}

/** 제48조①2 환산급여공제. */
export function convertedSalaryDeduction(converted        )         {
  if (converted <= 8_000_000) return converted;
  if (converted <= 70_000_000) return 8_000_000 + (converted - 8_000_000) * 0.6;
  if (converted <= 100_000_000) return 45_200_000 + (converted - 70_000_000) * 0.55;
  if (converted <= 300_000_000) return 61_700_000 + (converted - 100_000_000) * 0.45;
  return 151_700_000 + (converted - 300_000_000) * 0.35;
}

export function retirementIncomeTax(grossSeverance        , serviceYears        ) {
  const gross = Math.max(0, grossSeverance);
  const years = Math.max(1, Math.ceil(serviceYears));
  const serviceDeduction = Math.min(gross, serviceYearDeduction(years));
  const convertedSalary = Math.round(((gross - serviceDeduction) * 12) / years);
  const salaryDeduction = convertedSalaryDeduction(convertedSalary);
  const convertedTaxBase = Math.max(0, convertedSalary - salaryDeduction);
  const convertedCalculatedTax = progressiveIncomeTax(convertedTaxBase);
  const nationalTax = Math.floor((convertedCalculatedTax / 12) * years);
  const localTax = Math.floor(nationalTax * 0.1);
  const totalTax = nationalTax + localTax;
  return {
    gross, years, serviceDeduction, convertedSalary, salaryDeduction, convertedTaxBase, convertedCalculatedTax,
    nationalTax, localTax, totalTax, netPayout: Math.max(0, gross - totalTax), effectiveTaxRate: gross > 0 ? (totalTax / gross) * 100 : 0,
  };
}
