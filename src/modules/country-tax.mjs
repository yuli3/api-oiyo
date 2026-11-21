// 각국 세무·회계 현지판 핸들러 (2026-11-21, 1차 일본·2차 미국·3차 프랑스). 스키마: country-tax-spec.mjs. 계산은 tools-oiyo와 같은 vendored 파일이에요.
import { JP_TAX_AS_OF, JP_TAX_NOTE, jpAppealDeadlines, jpBlueReturn, jpConsumptionTax, jpDepreciation, jpPenalty, jpTaxCalendar } from "./vendor/tools-tax/jp-tax-pack-2026.mjs";

import { US_TAX_AS_OF, US_TAX_NOTE, usAppealDeadlines, usDepreciation, usEstimatedTax, usPenalty, usSelfEmployment, usTaxCalendar } from "./vendor/tools-tax/us-tax-pack-2026.mjs";
import { FR_TAX_AS_OF, FR_TAX_NOTE, frAmortissement, frClaimDeadline, frMicro, frPenalty, frTaxCalendar, frTvaFranchise } from "./vendor/tools-tax/fr-tax-pack-2026.mjs";
import { ES_TAX_AS_OF, ES_TAX_NOTE, esAmortizacion, esAutonomo, esIva, esPlazos, esRecargo, esSancion, esTaxCalendar } from "./vendor/tools-tax/es-tax-pack-2026.mjs";
import { CN_TAX_AS_OF, CN_TAX_NOTE, cnAppealDeadlines, cnBusinessIncome, cnComprehensive, cnDepreciation, cnLateFee, cnSmallProfitCit, cnSmallScaleVat, cnTaxCalendar } from "./vendor/tools-tax/cn-tax-pack-2026.mjs";

const FRP = "https://tools.oiyo.net/fr/";
const ESP = "https://tools.oiyo.net/es/";
const ZHP = "https://tools.oiyo.net/zh/";
const cnToday = () => new Date(Date.now() + 8 * 3_600_000).toISOString().slice(0, 10); // 北京时间
const esToday = () => new Date(Date.now() + 1 * 3_600_000).toISOString().slice(0, 10); // Madrid (hora de invierno)
const frToday = () => new Date(Date.now() + 1 * 3_600_000).toISOString().slice(0, 10); // Paris (heure d'hiver)
const EN = "https://tools.oiyo.net/en/";
const usToday = () => new Date(Date.now() - 5 * 3_600_000).toISOString().slice(0, 10); // US Eastern (standard time) date
const JA = "https://tools.oiyo.net/ja/";
const jpToday = () => new Date(Date.now() + 9 * 3_600_000).toISOString().slice(0, 10); // 일본 날짜(JST = KST)

export function makeCountryTaxHandlers() {
  const jp = (slug, body) => ({ asOf: JP_TAX_AS_OF, country: "JP", ...(Array.isArray(body) ? { deadlines: body } : body), page: `${JA}${slug}/`, note: JP_TAX_NOTE });
  const us = (slug, body) => ({ asOf: US_TAX_AS_OF, country: "US", ...(Array.isArray(body) ? { deadlines: body } : body), page: `${EN}${slug}/`, note: US_TAX_NOTE });
  const fr = (slug, body) => ({ asOf: FR_TAX_AS_OF, country: "FR", ...(Array.isArray(body) ? { deadlines: body } : body), page: `${FRP}${slug}/`, note: FR_TAX_NOTE });
  const es = (slug, body) => ({ asOf: ES_TAX_AS_OF, country: "ES", ...(Array.isArray(body) ? { deadlines: body } : body), page: `${ESP}${slug}/`, note: ES_TAX_NOTE });
  const cn = (slug, body) => ({ asOf: CN_TAX_AS_OF, country: "CN", ...(Array.isArray(body) ? { deadlines: body } : body), page: `${ZHP}${slug}/`, note: CN_TAX_NOTE });
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
    "/v1/tax/fr/calendar": (i) => fr("calendrier-fiscal-entreprise", frTaxCalendar({ ...i, today: i.today ?? frToday() })),
    "/v1/tax/fr/micro-entrepreneur": (i) => fr("micro-entrepreneur-cotisations-impot", frMicro(i)),
    "/v1/tax/fr/vat-franchise": (i) => fr("franchise-tva-seuils", frTvaFranchise(i)),
    "/v1/tax/fr/penalty": (i) => fr("interet-de-retard-majoration", frPenalty(i)),
    "/v1/tax/fr/claim-deadline": (i) => fr("interet-de-retard-majoration", frClaimDeadline(i)),
    "/v1/tax/fr/depreciation": (i) => fr("amortissement-lineaire-degressif", frAmortissement(i)),
    "/v1/tax/es/calendar": (i) => es("calendario-fiscal-autonomos-2026", esTaxCalendar({ ...i, today: i.today ?? esToday() })),
    "/v1/tax/es/autonomo": (i) => es("cuota-autonomos-tramos-irpf", esAutonomo(i)),
    "/v1/tax/es/vat": (i) => es("iva-tipos-recargo-equivalencia", esIva(i)),
    "/v1/tax/es/late-filing": (i) => es("recargo-extemporaneo-sanciones-plazos", esRecargo(i)),
    "/v1/tax/es/sanction": (i) => es("recargo-extemporaneo-sanciones-plazos", esSancion(i)),
    "/v1/tax/es/appeal-deadlines": (i) => es("recargo-extemporaneo-sanciones-plazos", esPlazos(i)),
    "/v1/tax/es/depreciation": (i) => es("amortizacion-tablas-oficiales", esAmortizacion(i)),
    "/v1/tax/cn/calendar": (i) => cn("china-tax-filing-calendar-2026", cnTaxCalendar({ ...i, today: i.today ?? cnToday() })),
    "/v1/tax/cn/business-income": (i) => cn("china-business-income-tax-calculator", cnBusinessIncome(i)),
    "/v1/tax/cn/comprehensive-income": (i) => cn("china-business-income-tax-calculator", cnComprehensive(i)),
    "/v1/tax/cn/small-profit-cit": (i) => cn("china-business-income-tax-calculator", cnSmallProfitCit(i)),
    "/v1/tax/cn/small-scale-vat": (i) => cn("china-small-scale-vat-threshold", cnSmallScaleVat(i)),
    "/v1/tax/cn/late-payment": (i) => cn("china-late-payment-surcharge-appeal", cnLateFee(i)),
    "/v1/tax/cn/appeal-deadlines": (i) => cn("china-late-payment-surcharge-appeal", cnAppealDeadlines(i)),
    "/v1/tax/cn/depreciation": (i) => cn("china-depreciation-calculator", cnDepreciation(i)),
  };
}
