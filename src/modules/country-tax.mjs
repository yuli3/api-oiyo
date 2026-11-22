// 각국 세무·회계 현지판 핸들러 (2026-11-21, 1차 일본·2차 미국·3차 프랑스·4차 스페인·5차 중국·2차 영국·대만). 스키마: country-tax-spec.mjs. 계산은 tools-oiyo와 같은 vendored 파일이에요.
import { JP_TAX_AS_OF, JP_TAX_NOTE, jpAppealDeadlines, jpBlueReturn, jpConsumptionTax, jpDepreciation, jpPenalty, jpTaxCalendar } from "./vendor/tools-tax/jp-tax-pack-2026.mjs";

import { US_TAX_AS_OF, US_TAX_NOTE, usAppealDeadlines, usDepreciation, usEstimatedTax, usPenalty, usSelfEmployment, usTaxCalendar } from "./vendor/tools-tax/us-tax-pack-2026.mjs";
import { FR_TAX_AS_OF, FR_TAX_NOTE, frAmortissement, frClaimDeadline, frMicro, frPenalty, frTaxCalendar, frTvaFranchise } from "./vendor/tools-tax/fr-tax-pack-2026.mjs";
import { ES_TAX_AS_OF, ES_TAX_NOTE, esAmortizacion, esAutonomo, esIva, esPlazos, esRecargo, esSancion, esTaxCalendar } from "./vendor/tools-tax/es-tax-pack-2026.mjs";
import { UK_TAX_AS_OF, UK_TAX_NOTE, ukAppealDeadlines, ukCapitalAllowances, ukInterest, ukSaPenalties, ukSelfEmployed, ukTaxCalendar, ukVatCheck } from "./vendor/tools-tax/uk-tax-pack-2026.mjs";
import { TW_TAX_AS_OF, TW_TAX_NOTE, twAppealDeadlines, twBusinessTax, twDepreciation, twIncomeTax, twLateFee, twTaxCalendar } from "./vendor/tools-tax/tw-tax-pack-2026.mjs";
import { intake as worldIntake } from "./vendor/tools-tax/world-law-intake-2026.mjs";
import { caLimitation, cnSmallClaims, frLimitation, jpLimitation, twLimitation, ukLimitation } from "./vendor/tools-tax/world-limitation-pack-2026.mjs";
import { frSuccession, jpGift, jpInheritance, twEstate, ukInheritance, usEstateGift } from "./vendor/tools-tax/world-inheritance-pack-2026.mjs";
import { cnCoolingOff, esCoolingOff, frCoolingOff, jpCoolingOff, twCoolingOff, ukCoolingOff, usCoolingOff } from "./vendor/tools-tax/world-consumer-pack-2026.mjs";
import { TENANCY_AS_OF, cnTenancy, esTenancy, frTenancy, jpTenancy, twTenancy, ukTenancy, usTenancy } from "./vendor/tools-tax/world-tenancy-pack-2026.mjs";
import { LABOR_AS_OF, cnLaborExit, esLaborExit, frLaborExit, jpLaborExit, twLaborExit, ukLaborExit, usLaborExit } from "./vendor/tools-tax/world-labor-pack-2026.mjs";
import { CN_TAX_AS_OF, CN_TAX_NOTE, cnAppealDeadlines, cnBusinessIncome, cnComprehensive, cnDepreciation, cnLateFee, cnSmallProfitCit, cnSmallScaleVat, cnTaxCalendar } from "./vendor/tools-tax/cn-tax-pack-2026.mjs";

const FRP = "https://tools.oiyo.net/fr/";
const ESP = "https://tools.oiyo.net/es/";
const ZHP = "https://tools.oiyo.net/zh/";
const ukToday = () => new Date().toISOString().slice(0, 10); // London (GMT in winter)
const twToday = () => new Date(Date.now() + 8 * 3_600_000).toISOString().slice(0, 10); // 臺北時間
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
  const uk = (slug, body) => ({ asOf: UK_TAX_AS_OF, country: "GB", ...(Array.isArray(body) ? { deadlines: body } : body), page: `${EN}${slug}/`, note: UK_TAX_NOTE });
  const tw = (slug, body) => ({ asOf: TW_TAX_AS_OF, country: "TW", ...(Array.isArray(body) ? { deadlines: body } : body), page: `${ZHP}${slug}/`, note: TW_TAX_NOTE });
  const LABOR_NOTE = "General information and estimates only: no legal advice, no representation, no filing. Values that could not be verified are flagged in items, not computed. Check with the local labour office or a qualified professional.";
  const lab = (base, slug, body) => ({ asOf: LABOR_AS_OF, ...body, page: `${base}${slug}/`, note: LABOR_NOTE });
  const TENANCY_NOTE = "General information and estimates only: no legal advice, no representation, no filing. Values that could not be verified are flagged in items, not computed. Check with a free local housing advice service or a qualified professional.";
  const ten = (base, slug, body) => ({ asOf: TENANCY_AS_OF, ...body, page: `${base}${slug}/`, note: TENANCY_NOTE });
  const CONSUMER_NOTE = "General information only: no legal advice, no representation, no notices sent. Holiday calendars and unverified rules are flagged in items, not computed. Send the notice early and keep proof; check with a free local consumer advice service.";
  const con = (base, slug, body) => ({ ...body, page: `${base}${slug}/`, note: CONSUMER_NOTE });
  const INHERITANCE_NOTE = "General information and estimates only: no tax advice, no representation, no filing. Values that could not be verified are flagged in items, not computed. Check with the tax office or a qualified professional.";
  const inh = (base, slug, body) => ({ ...body, page: `${base}${slug}/`, note: INHERITANCE_NOTE });
  const CLAIMS_NOTE = "General information only: no legal advice, no representation, no filing. The limitation date is an estimate from the start date given; interruption, suspension and discovery rules are not applied. Act well before it.";
  const clm = (base, slug, body) => ({ ...body, page: `${base}${slug}/`, note: CLAIMS_NOTE });
  return {
    "/v1/claims/jp": (i) => clm(JA, "japan-shometsu-jiko-shogaku-sosho", jpLimitation(i)),
    "/v1/claims/uk": (i) => clm(EN, "uk-limitation-period-small-claims", ukLimitation(i)),
    "/v1/claims/us-ca": (i) => clm(EN, "california-statute-of-limitations-small-claims", caLimitation(i)),
    "/v1/claims/fr": (i) => clm(FRP, "delai-prescription-dette-injonction", frLimitation(i)),
    "/v1/claims/tw": (i) => clm(ZHP, "taiwan-statute-limitation-small-claims", twLimitation(i)),
    "/v1/claims/cn": (i) => clm(ZHP, "china-small-claims-threshold", cnSmallClaims(i)),
    "/v1/inheritance/jp": (i) => inh(JA, "japan-inheritance-gift-tax-deadline", i.kind === "gift" ? jpGift(i) : jpInheritance(i)),
    "/v1/inheritance/uk": (i) => inh(EN, "uk-inheritance-tax-threshold-deadline", ukInheritance(i)),
    "/v1/inheritance/us": (i) => inh(EN, "us-estate-gift-tax-exclusion-2026", usEstateGift(i)),
    "/v1/inheritance/fr": (i) => inh(FRP, "droits-succession-abattement-delai", frSuccession(i)),
    "/v1/inheritance/tw": (i) => inh(ZHP, "taiwan-estate-tax-filing-deadline", twEstate(i)),
    "/v1/consumer/jp": (i) => con(JA, "japan-cooling-off-deadline", jpCoolingOff(i)),
    "/v1/consumer/uk": (i) => con(EN, "uk-consumer-cancellation-period", ukCoolingOff(i)),
    "/v1/consumer/fr": (i) => con(FRP, "delai-retractation-achat-distance", frCoolingOff(i)),
    "/v1/consumer/es": (i) => con(ESP, "plazo-desistimiento-compra-online", esCoolingOff(i)),
    "/v1/consumer/cn": (i) => con(ZHP, "china-7-day-return-deadline", cnCoolingOff(i)),
    "/v1/consumer/tw": (i) => con(ZHP, "taiwan-7-day-cancellation", twCoolingOff(i)),
    "/v1/consumer/us": (i) => con(EN, "ftc-cooling-off-rule-deadline", usCoolingOff(i)),
    "/v1/law/world/intake": (i) => ({ ...worldIntake(i), page: `${EN}world-law-guide/` }),
    "/v1/tenancy/jp": (i) => ten(JA, "japan-rental-deposit-notice-checker", jpTenancy(i)),
    "/v1/tenancy/uk": (i) => ten(EN, "england-tenancy-deposit-notice-checker", ukTenancy(i)),
    "/v1/tenancy/us": (i) => ten(EN, "california-new-york-security-deposit-notice", usTenancy(i)),
    "/v1/tenancy/fr": (i) => ten(FRP, "depot-de-garantie-preavis-irl", frTenancy(i)),
    "/v1/tenancy/es": (i) => ten(ESP, "fianza-alquiler-preaviso-actualizacion", esTenancy(i)),
    "/v1/tenancy/cn": (i) => ten(ZHP, "china-rental-contract-deposit-check", cnTenancy(i)),
    "/v1/tenancy/tw": (i) => ten(ZHP, "taiwan-rental-deposit-termination", twTenancy(i)),
    "/v1/labor/jp": (i) => lab(JA, "japan-dismissal-unemployment-checker", jpLaborExit(i)),
    "/v1/labor/uk": (i) => lab(EN, "uk-redundancy-notice-tribunal-calculator", ukLaborExit(i)),
    "/v1/labor/us": (i) => lab(EN, "us-wage-layoff-deadline-checker", usLaborExit(i)),
    "/v1/labor/fr": (i) => lab(FRP, "indemnite-licenciement-delais-prudhommes", frLaborExit(i)),
    "/v1/labor/es": (i) => lab(ESP, "indemnizacion-despido-paro-plazos", esLaborExit(i)),
    "/v1/labor/cn": (i) => lab(ZHP, "china-severance-compensation-calculator", cnLaborExit(i)),
    "/v1/labor/tw": (i) => lab(ZHP, "taiwan-severance-notice-calculator", twLaborExit(i)),
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
    "/v1/tax/uk/calendar": (i) => uk("uk-self-assessment-deadlines-2026", ukTaxCalendar({ ...i, today: i.today ?? ukToday() })),
    "/v1/tax/uk/self-employed": (i) => uk("uk-self-employed-tax-ni-calculator", ukSelfEmployed(i)),
    "/v1/tax/uk/vat-registration": (i) => uk("uk-vat-registration-threshold-check", ukVatCheck(i)),
    "/v1/tax/uk/penalty": (i) => uk("hmrc-late-filing-penalty-interest-calculator", ukSaPenalties(i)),
    "/v1/tax/uk/interest": (i) => uk("hmrc-late-filing-penalty-interest-calculator", ukInterest(i.amount, i.from, i.to)),
    "/v1/tax/uk/appeal-deadlines": (i) => uk("hmrc-late-filing-penalty-interest-calculator", ukAppealDeadlines(i)),
    "/v1/tax/uk/capital-allowances": (i) => uk("uk-capital-allowances-aia-calculator", ukCapitalAllowances(i)),
    "/v1/tax/tw/calendar": (i) => tw("taiwan-tax-filing-calendar-2026", twTaxCalendar({ ...i, today: i.today ?? twToday() })),
    "/v1/tax/tw/income-tax": (i) => tw("taiwan-income-tax-calculator", twIncomeTax(i)),
    "/v1/tax/tw/business-tax": (i) => tw("taiwan-business-tax-threshold", twBusinessTax(i)),
    "/v1/tax/tw/late-fee": (i) => tw("taiwan-late-tax-penalty-appeal", twLateFee(i)),
    "/v1/tax/tw/appeal-deadlines": (i) => tw("taiwan-late-tax-penalty-appeal", twAppealDeadlines(i)),
    "/v1/tax/tw/depreciation": (i) => tw("taiwan-depreciation-calculator", twDepreciation(i)),
  };
}
