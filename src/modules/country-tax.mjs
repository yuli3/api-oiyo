// 각국 세무·회계 현지판 핸들러 (2026-11-21, 1차 일본). 스키마: country-tax-spec.mjs. 계산은 tools-oiyo와 같은 vendored 파일이에요.
import { JP_TAX_AS_OF, JP_TAX_NOTE, jpAppealDeadlines, jpBlueReturn, jpConsumptionTax, jpDepreciation, jpPenalty, jpTaxCalendar } from "./vendor/tools-tax/jp-tax-pack-2026.mjs";

const JA = "https://tools.oiyo.net/ja/";
const jpToday = () => new Date(Date.now() + 9 * 3_600_000).toISOString().slice(0, 10); // 일본 날짜(JST = KST)

export function makeCountryTaxHandlers() {
  const jp = (slug, body) => ({ asOf: JP_TAX_AS_OF, country: "JP", ...(Array.isArray(body) ? { deadlines: body } : body), page: `${JA}${slug}/`, note: JP_TAX_NOTE });
  return {
    "/v1/tax/jp/calendar": (i) => jp("jp-tax-calendar", jpTaxCalendar({ ...i, today: i.today ?? jpToday() })),
    "/v1/tax/jp/blue-return": (i) => jp("aoiro-shinkoku-deduction-calculator", jpBlueReturn(i)),
    "/v1/tax/jp/consumption-tax": (i) => jp("consumption-tax-invoice-check", jpConsumptionTax(i)),
    "/v1/tax/jp/penalty": (i) => jp("kasanzei-entaizei-calculator", jpPenalty(i)),
    "/v1/tax/jp/appeal-deadlines": (i) => jp("kasanzei-entaizei-calculator", jpAppealDeadlines(i)),
    "/v1/tax/jp/depreciation": (i) => jp("genka-shokyaku-calculator", jpDepreciation(i)),
  };
}
