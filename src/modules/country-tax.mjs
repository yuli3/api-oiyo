// 각국 세무·회계 현지판 핸들러 (2026-11-21, 1차 일본·2차 미국). 스키마: country-tax-spec.mjs. 계산은 tools-oiyo와 같은 vendored 파일이에요.
import { JP_TAX_AS_OF, JP_TAX_NOTE, jpAppealDeadlines, jpBlueReturn, jpConsumptionTax, jpDepreciation, jpPenalty, jpTaxCalendar } from "./vendor/tools-tax/jp-tax-pack-2026.mjs";

import { US_TAX_AS_OF, US_TAX_NOTE, usAppealDeadlines, usDepreciation, usEstimatedTax, usPenalty, usSelfEmployment, usTaxCalendar } from "./vendor/tools-tax/us-tax-pack-2026.mjs";

const EN = "https://tools.oiyo.net/en/";
const usToday = () => new Date(Date.now() - 5 * 3_600_000).toISOString().slice(0, 10); // US Eastern (standard time) date
const JA = "https://tools.oiyo.net/ja/";
const jpToday = () => new Date(Date.now() + 9 * 3_600_000).toISOString().slice(0, 10); // 일본 날짜(JST = KST)

export function makeCountryTaxHandlers() {
  const jp = (slug, body) => ({ asOf: JP_TAX_AS_OF, country: "JP", ...(Array.isArray(body) ? { deadlines: body } : body), page: `${JA}${slug}/`, note: JP_TAX_NOTE });
  const us = (slug, body) => ({ asOf: US_TAX_AS_OF, country: "US", ...(Array.isArray(body) ? { deadlines: body } : body), page: `${EN}${slug}/`, note: US_TAX_NOTE });
  return {
    "/v1/tax/jp/calendar": (i) => jp("jp-tax-calendar", jpTaxCalendar({ ...i, today: i.today ?? jpToday() })),
    "/v1/tax/jp/blue-return": (i) => jp("aoiro-shinkoku-deduction-calculator", jpBlueReturn(i)),
    "/v1/tax/jp/consumption-tax": (i) => jp("consumption-tax-invoice-check", jpConsumptionTax(i)),
    "/v1/tax/jp/penalty": (i) => jp("kasanzei-entaizei-calculator", jpPenalty(i)),
    "/v1/tax/jp/appeal-deadlines": (i) => jp("kasanzei-entaizei-calculator", jpAppealDeadlines(i)),
    "/v1/tax/jp/depreciation": (i) => jp("genka-shokyaku-calculator", jpDepreciation(i)),
    "/v1/tax/us/calendar": (i) => us("us-tax-deadline-calendar", usTaxCalendar({ ...i, today: i.today ?? usToday() })),
    "/v1/tax/us/self-employment": (i) => us("self-employment-tax-qbi-calculator", usSelfEmployment(i)),
    "/v1/tax/us/estimated-tax": (i) => us("estimated-tax-safe-harbor-calculator", usEstimatedTax(i)),
    "/v1/tax/us/penalty": (i) => us("irs-penalty-interest-calculator", usPenalty(i)),
    "/v1/tax/us/appeal-deadlines": (i) => us("irs-penalty-interest-calculator", usAppealDeadlines(i)),
    "/v1/tax/us/depreciation": (i) => us("macrs-section-179-calculator", usDepreciation(i)),
  };
}
