// 각국 세무·회계 현지판 핸들러 (2026-11-21, 1차 일본·2차 미국·3차 프랑스·4차 스페인·5차 중국·2차 영국·대만). 스키마: country-tax-spec.mjs. 계산은 tools-oiyo와 같은 vendored 파일이에요.
import { PRACTICE_OFFICE } from "./vendor/practice-office.mjs";
import { krPensionEstimate, krQuitPlan, jpFurusatoLimit, ukMarriageAllowance, caIncomeTax2025 } from "./vendor/tools-tax/new-calc-5-2026.mjs";
import { KR_DESKS, KR_DESKS_AS_OF, deskById, findDesks } from "./vendor/tools-tax/kr-desks-2026.mjs";
import { EXPERTS, EXPERT_VISIT_AS_OF, expertById, findExpertNeeds } from "./vendor/tools-tax/expert-visit-2026.mjs";
import { LETTER_TYPES, buildDemandLetter } from "./vendor/tools-tax/demand-letter-2026.mjs";
import { householdCheckup } from "./vendor/tools-tax/household-checkup-2026.mjs";
import { buildConsultMemo } from "./vendor/tools-tax/consult-memo-2026.mjs";
import { JP_TAX_AS_OF, JP_TAX_NOTE, jpAppealDeadlines, jpBlueReturn, jpConsumptionTax, jpDepreciation, jpPenalty, jpTaxCalendar } from "./vendor/tools-tax/jp-tax-pack-2026.mjs";

import { US_TAX_AS_OF, US_TAX_NOTE, usAppealDeadlines, usDepreciation, usEstimatedTax, usPenalty, usSelfEmployment, usTaxCalendar } from "./vendor/tools-tax/us-tax-pack-2026.mjs";
import { FR_TAX_AS_OF, FR_TAX_NOTE, frAmortissement, frClaimDeadline, frMicro, frPenalty, frTaxCalendar, frTvaFranchise } from "./vendor/tools-tax/fr-tax-pack-2026.mjs";
import { ES_TAX_AS_OF, ES_TAX_NOTE, esAmortizacion, esAutonomo, esIva, esPlazos, esRecargo, esSancion, esTaxCalendar } from "./vendor/tools-tax/es-tax-pack-2026.mjs";
import { UK_TAX_AS_OF, UK_TAX_NOTE, ukAppealDeadlines, ukCapitalAllowances, ukInterest, ukSaPenalties, ukSelfEmployed, ukTaxCalendar, ukVatCheck } from "./vendor/tools-tax/uk-tax-pack-2026.mjs";
import { TW_TAX_AS_OF, TW_TAX_NOTE, twAppealDeadlines, twBusinessTax, twDepreciation, twIncomeTax, twLateFee, twTaxCalendar } from "./vendor/tools-tax/tw-tax-pack-2026.mjs";
import { intake as worldIntake } from "./vendor/tools-tax/world-law-intake-2026.mjs";
import { twDebtClearance, esSecondChance, esInheritanceDeadline } from "./vendor/tools-tax/world-fresh-start-2026.mjs";
import { jpCourtFee, deCourtFee } from "./vendor/tools-tax/world-court-fees-2026.mjs";
import { jpOvertimeCheck, ukIrregularHoliday } from "./vendor/tools-tax/world-labor-practice-2026.mjs";
import { deKleinunternehmer, sgGstRegistration } from "./vendor/tools-tax/world-small-business-vat-2026.mjs";
import { ukMaternityPay, ukChildBenefit, jpChildcareLeave, jpChildAllowance, deElterngeld } from "./vendor/tools-tax/world-parental-pay-2026.mjs";
import { lateInterest } from "./vendor/tools-tax/world-late-payment-2026.mjs";
import { erbschaftsteuer, mietkaution, pfaendung, verjaehrung, widerruf } from "./vendor/tools-tax/de-life-law-2026.mjs";
import { us401kLimit, usIraLimit, rothIraLimit, tradVsRoth, ukPensionRelief } from "./vendor/tools-tax/country-pension-4.mjs";
import { socialSecurityTable, pmiDates, ukStudentLoan, nisaPlan } from "./vendor/tools-tax/country-finance-2.mjs";
import { lisaPlan, cpfRefund } from "./vendor/tools-tax/country-finance-3.mjs";
import { caStressTest, cnComboLoan, jpHousingLoanCredit } from "./vendor/tools-tax/country-finance-5.mjs";
import { krNpsEarlyDefer, twLaborPensionVoluntary, deRiester, deBasisrente, auSuper } from "./vendor/tools-tax/plan-gap-4-2026.mjs";
import { jpIdecoMonthlyLimit, japanIdecoSaving, chinaPensionSaving, francePerSaving, frPerCeilingSalarie, spainPensionLimit } from "./vendor/tools-tax/pension-countries.mjs";
import { homePurchaseTax } from "./vendor/tools-tax/world-home-purchase-2026.mjs";
import { corporateTax } from "./vendor/tools-tax/world-corporate-tax-2026.mjs";
import { withholding } from "./vendor/tools-tax/world-withholding-2026.mjs";
import { ukTakeHome, usTakeHome, jpTakeHome, frTakeHome, esTakeHome } from "./vendor/tools-tax/world-take-home-2026.mjs";
import { usRefund2026, jpKakutei2026, caTakeHome2026, auTakeHome } from "./vendor/tools-tax/world-tax-season-2027.mjs";
import { deEInvoice, deIncomeTax, deMinimumWage, deNoticePeriod, sgCpf, sgIncomeTax, sgNotice } from "./vendor/tools-tax/world-de-sg-pack-2026.mjs";
import { esResidency, frResidency, jpResidency, twResidency, ukStatutoryResidence, usSubstantialPresence } from "./vendor/tools-tax/world-tax-residency-2026.mjs";
import { esVerifactu, frEInvoice, jpInvoiceTransition } from "./vendor/tools-tax/world-einvoice-pack-2026.mjs";
import { frCompanyCalendar, jpCompanyCalendar, ukCompanyCalendar, usCompanyCalendar } from "./vendor/tools-tax/world-company-calendar-2026.mjs";
import { esEmployerCost, jpEmployerCost, ukEmployerCost, usEmployerCost } from "./vendor/tools-tax/world-employer-cost-pack-2026.mjs";
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

// 실무 오피스 방문 (2026-11-23): tools.oiyo.net 오피스와 같은 층·방 데이터 (scripts/sync-practice-office.mjs).
export function visitOffice(i) {
  const O = PRACTICE_OFFICE;
  const lang = O.langs[i?.lang] ? i.lang : "en";
  const L = O.langs[lang];
  // Korea-only rooms (insurance, realty, biz, welfare) are named in ko and en only.
  const nm = (k, id) => L[k][id] ?? O.langs.en[k][id] ?? O.langs.ko[k][id];
  const fl = O.floors[i?.country];
  if (!fl) return { error: `country must be one of ${Object.keys(O.floors).join(", ")}` };
  const page = `https://tools.oiyo.net/${lang}/${O.slugs[lang]}/`;
  const base = { asOf: O.asOf, country: fl.id, floor: `${fl.flag} ${L.countries[fl.id]}`, page, mcpServer: fl.mcp, note: "General information only: no legal, tax or investment advice, representation or filing. Check the free official help for individual cases." };
  if (!i?.room) return { ...base, rooms: fl.rooms.map((r) => ({ id: r.id, name: nm("rooms", r.id), about: nm("roomDesc", r.id), tools: r.tools.length, open: r.tools.length > 0 })) };
  const r = fl.rooms.find((x) => x.id === i.room);
  if (!r) return { ...base, error: `room must be one of ${fl.rooms.map((x) => x.id).join(", ")}` };
  const tools = r.tools.filter((t) => !i?.audience || t.who === i.audience).map((t) => ({ title: t.title, url: `https://tools.oiyo.net${t.href}`, for: t.who === "pro" ? "practitioners" : "clients", ...(t.mcp ? { mcpTool: t.mcp } : {}) }));
  return { ...base, room: r.id, name: nm("rooms", r.id), about: nm("roomDesc", r.id), intake: nm("intake", r.id), tools, skills: r.skills.map((k) => ({ name: k.id, download: `https://tools.oiyo.net${k.zip}` })), freeHelp: r.help, open: tools.length > 0 };
}

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
  const EMP_NOTE = "General estimate only: not payroll or tax advice, no filing. Items listed as not included were not verified and are not added.";
  const emp = (base, slug, body) => ({ ...body, page: `${base}${slug}/`, note: EMP_NOTE });
  const CAL_NOTE = "General information only: not tax or company-law advice, no filing. Weekends move to Monday; public holidays are not applied.";
  const cal = (base, slug, body) => ({ ...body, page: `${base}${slug}/`, note: CAL_NOTE });
  const FRESH_START_NOTE = "General information only: debt relief conditions and deadlines, not legal advice, nothing filed.";
  const COURT_FEE_NOTE = "General information only: statutory court fees, not legal advice, nothing filed.";
  const LABOR_PRACTICE_NOTE = "General information only: working-time caps and holiday accrual, not legal advice, nothing filed.";
  const SMALL_VAT_NOTE = "General information only: VAT/GST registration status, not tax advice, nothing filed.";
  const PARENTAL_NOTE = "General information only: statutory parental pay and child benefit, eligibility not checked, no claims filed.";
  const LATE_NOTE = "General information only: statutory late payment interest between businesses, not legal advice, no claims filed.";
  const DE_LIFE_NOTE = "Allgemeine Information, keine Rechts- oder Steuerberatung. General information only, not legal or tax advice.";
  const PLAN_NOTE = "General information only: scheme limits, tax relief and loan figures from official rules. Not financial, tax or investment advice; no product is recommended.";
  const T = "https://tools.oiyo.net";
  const pl = (page, body) => ({ ...(body ?? { error: "Check the inputs." }), page: `${T}${page}`, note: PLAN_NOTE });
  const S = (v) => (v === undefined || v === null ? "" : String(v));
  const n = (v, d = 0) => (Number.isFinite(Number(v)) && v !== "" && v !== null && v !== undefined ? Number(v) : d);
  const HOME_NOTE = "General information only: taxes on buying a home from official rates, not tax or legal advice; fees not included.";
  const CIT_NOTE = "General information only: national statutory rate on the taxable profit given, not tax advice, no filing.";
  const WHT_NOTE = "General information only: domestic rate before any tax treaty, not tax advice, no filing.";
  const TH_NOTE = "General estimate for one year: not tax advice and not the payroll withholding. Items listed as not included were not verified and are not added.";
  const DSG_NOTE = "General information only: not tax or legal advice.";
  const DEP = "https://tools.oiyo.net/de/";
  const dsg = (url, body) => ({ ...body, page: url, note: DSG_NOTE });
  const RES_NOTE = "General information only: not tax advice; tax treaties can override the result.";
  const res = (url, body) => ({ ...body, page: url, note: RES_NOTE });
  const EIN_NOTE = "General information only: not tax advice, no filing, no software certification.";
  const ein = (base, slug, body) => ({ ...body, page: `${base}${slug}/`, note: EIN_NOTE });
  return {
    "/v1/withholding/jp": (i) => ({ ...withholding({ ...i, country: "JP" }), page: `${EN}withholding-tax-non-resident-payments/`, note: WHT_NOTE }),
    "/v1/withholding/us": (i) => ({ ...withholding({ ...i, country: "US" }), page: `${EN}withholding-tax-non-resident-payments/`, note: WHT_NOTE }),
    "/v1/withholding/fr": (i) => ({ ...withholding({ ...i, country: "FR" }), page: `${EN}withholding-tax-non-resident-payments/`, note: WHT_NOTE }),
    "/v1/withholding/es": (i) => ({ ...withholding({ ...i, country: "ES" }), page: `${EN}withholding-tax-non-resident-payments/`, note: WHT_NOTE }),
    "/v1/withholding/tw": (i) => ({ ...withholding({ ...i, country: "TW" }), page: `${EN}withholding-tax-non-resident-payments/`, note: WHT_NOTE }),
    "/v1/withholding/de": (i) => ({ ...withholding({ ...i, country: "DE" }), page: `${EN}withholding-tax-non-resident-payments/`, note: WHT_NOTE }),
    "/v1/corporate-tax/jp": (i) => ({ ...corporateTax({ ...i, country: "JP" }), page: `${EN}corporate-tax-calculator-2026/`, note: CIT_NOTE }),
    "/v1/corporate-tax/uk": (i) => ({ ...corporateTax({ ...i, country: "UK" }), page: `${EN}corporate-tax-calculator-2026/`, note: CIT_NOTE }),
    "/v1/corporate-tax/us": (i) => ({ ...corporateTax({ ...i, country: "US" }), page: `${EN}corporate-tax-calculator-2026/`, note: CIT_NOTE }),
    "/v1/corporate-tax/fr": (i) => ({ ...corporateTax({ ...i, country: "FR" }), page: `${EN}corporate-tax-calculator-2026/`, note: CIT_NOTE }),
    "/v1/corporate-tax/es": (i) => ({ ...corporateTax({ ...i, country: "ES" }), page: `${EN}corporate-tax-calculator-2026/`, note: CIT_NOTE }),
    "/v1/corporate-tax/de": (i) => ({ ...corporateTax({ ...i, country: "DE" }), page: `${EN}corporate-tax-calculator-2026/`, note: CIT_NOTE }),
    "/v1/home-purchase/uk": (i) => ({ ...homePurchaseTax({ ...i, country: "UK" }), page: `${EN}uk-stamp-duty-calculator-2026/`, note: HOME_NOTE }),
    "/v1/home-purchase/jp": (i) => ({ ...homePurchaseTax({ ...i, country: "JP" }), page: "https://tools.oiyo.net/ja/acquisition-tax-calculator/", note: HOME_NOTE }),
    "/v1/home-purchase/fr": (i) => ({ ...homePurchaseTax({ ...i, country: "FR" }), page: "https://tools.oiyo.net/fr/acquisition-tax-calculator/", note: HOME_NOTE }),
    "/v1/home-purchase/es": (i) => ({ ...homePurchaseTax({ ...i, country: "ES" }), page: "https://tools.oiyo.net/es/acquisition-tax-calculator/", note: HOME_NOTE }),
    "/v1/home-purchase/cn": (i) => ({ ...homePurchaseTax({ ...i, country: "CN" }), page: "https://tools.oiyo.net/zh/acquisition-tax-calculator/", note: HOME_NOTE }),
    "/v1/de/inheritance-tax": (i) => ({ ...erbschaftsteuer(i), page: "https://tools.oiyo.net/de/erbschaftsteuer-rechner-2026/", note: DE_LIFE_NOTE }),
    "/v1/de/garnishment": (i) => ({ ...pfaendung(i), page: "https://tools.oiyo.net/de/pfaendungsfreigrenze-rechner-2026/", note: DE_LIFE_NOTE }),
    "/v1/de/withdrawal": (i) => ({ ...widerruf(i), page: "https://tools.oiyo.net/de/widerruf-kaution-verjaehrung-rechner/", note: DE_LIFE_NOTE }),
    "/v1/de/rent-deposit": (i) => ({ ...mietkaution(i), page: "https://tools.oiyo.net/de/widerruf-kaution-verjaehrung-rechner/", note: DE_LIFE_NOTE }),
    "/v1/de/limitation": (i) => ({ ...verjaehrung(i), page: "https://tools.oiyo.net/de/widerruf-kaution-verjaehrung-rechner/", note: DE_LIFE_NOTE }),
    "/v1/late-payment/de": (i) => ({ ...lateInterest({ ...i, country: "DE" }), page: `${EN}b2b-late-payment-interest-calculator/`, note: LATE_NOTE }),
    "/v1/late-payment/fr": (i) => ({ ...lateInterest({ ...i, country: "FR" }), page: `${EN}b2b-late-payment-interest-calculator/`, note: LATE_NOTE }),
    "/v1/late-payment/es": (i) => ({ ...lateInterest({ ...i, country: "ES" }), page: `${EN}b2b-late-payment-interest-calculator/`, note: LATE_NOTE }),
    "/v1/late-payment/uk": (i) => ({ ...lateInterest({ ...i, country: "UK" }), page: `${EN}b2b-late-payment-interest-calculator/`, note: LATE_NOTE }),
    "/v1/parental/uk-maternity-pay": (i) => ({ ...ukMaternityPay(i), page: `${EN}parental-pay-calculator-2026/`, note: PARENTAL_NOTE }),
    "/v1/parental/uk-child-benefit": (i) => ({ ...ukChildBenefit(i), page: `${EN}parental-pay-calculator-2026/`, note: PARENTAL_NOTE }),
    "/v1/parental/jp-childcare-leave": (i) => ({ ...jpChildcareLeave(i), page: `${EN}parental-pay-calculator-2026/`, note: PARENTAL_NOTE }),
    "/v1/parental/jp-child-allowance": (i) => ({ ...jpChildAllowance(i), page: `${EN}parental-pay-calculator-2026/`, note: PARENTAL_NOTE }),
    "/v1/parental/de-elterngeld": (i) => ({ ...deElterngeld(i), page: `${EN}parental-pay-calculator-2026/`, note: PARENTAL_NOTE }),
    "/v1/small-business-vat/de": (i) => ({ ...deKleinunternehmer(i), page: `${EN}small-business-vat-registration-check/`, note: SMALL_VAT_NOTE }),
    "/v1/small-business-vat/sg": (i) => ({ ...sgGstRegistration(i), page: `${EN}small-business-vat-registration-check/`, note: SMALL_VAT_NOTE }),
    "/v1/labor-practice/jp-overtime": (i) => ({ ...jpOvertimeCheck(i), page: `${EN}overtime-cap-holiday-accrual-check/`, note: LABOR_PRACTICE_NOTE }),
    "/v1/labor-practice/uk-holiday": (i) => ({ ...ukIrregularHoliday(i), page: `${EN}overtime-cap-holiday-accrual-check/`, note: LABOR_PRACTICE_NOTE }),
    "/v1/court-fee/jp": (i) => ({ ...jpCourtFee(i), page: `${EN}court-fee-calculator-japan-germany/`, note: COURT_FEE_NOTE }),
    "/v1/court-fee/de": (i) => ({ ...deCourtFee(i), page: `${EN}court-fee-calculator-japan-germany/`, note: COURT_FEE_NOTE }),
    "/v1/fresh-start/tw-debt": (i) => ({ ...twDebtClearance(i), page: "https://tools.oiyo.net/zh/taiwan-debt-clearance-checker/", note: FRESH_START_NOTE }),
    "/v1/fresh-start/es-second-chance": (i) => ({ ...esSecondChance(i), page: "https://tools.oiyo.net/es/segunda-oportunidad-plazo-sucesiones/", note: FRESH_START_NOTE }),
    "/v1/fresh-start/es-inheritance": (i) => ({ ...esInheritanceDeadline(i), page: "https://tools.oiyo.net/es/segunda-oportunidad-plazo-sucesiones/", note: FRESH_START_NOTE }),
    "/v1/take-home/uk": (i) => ({ ...ukTakeHome(i), page: `${EN}uk-take-home-pay-calculator-2026/`, note: TH_NOTE }),
    "/v1/take-home/us": (i) => ({ ...usTakeHome(i), page: `${EN}us-take-home-pay-calculator-2026/`, note: TH_NOTE }),
    "/v1/take-home/jp": (i) => ({ ...jpTakeHome(i), page: `${JA}japan-salary-calculator/`, note: TH_NOTE }),
    "/v1/tax-season/us-refund": (i) => ({ ...usRefund2026(i), page: `${EN}us-tax-refund-estimator-2026/`, note: TH_NOTE }),
    "/v1/tax-season/jp-kakutei": (i) => ({ ...jpKakutei2026(i), page: `${JA}kakutei-shinkoku-2027-calculator/`, note: TH_NOTE }),
    "/v1/take-home/ca": (i) => ({ ...caTakeHome2026(i), page: `${EN}canada-take-home-pay-calculator-2026/`, note: TH_NOTE }),
    "/v1/take-home/au": (i) => ({ ...auTakeHome(i), page: `${EN}australia-take-home-pay-calculator-2026-27/`, note: TH_NOTE }),
    "/v1/take-home/fr": (i) => ({ ...frTakeHome(i), page: `${FRP}france-salary-calculator/`, note: TH_NOTE }),
    "/v1/planning/us/retirement-limits": (i) => pl("/en/us-401k-ira-limits-calculator/", { k401: us401kLimit(n(i?.age, 40)), ira: usIraLimit(n(i?.age, 40)), roth: rothIraLimit(n(i?.age, 40), n(i?.magi), i?.filing ?? "single") }),
    "/v1/planning/us/traditional-vs-roth": (i) => pl("/en/us-401k-ira-limits-calculator/", tradVsRoth({ contribution: n(i?.contribution), years: n(i?.years, 30), growth: n(i?.growth, 0.06), rateNow: n(i?.rateNow, 0.22), rateLater: n(i?.rateLater, 0.12) })),
    "/v1/planning/us/social-security": (i) => pl("/en/social-security-claiming-age-calculator/", socialSecurityTable(S(i?.birthDate), S(i?.pia), S(i?.lifeAge ?? 85))),
    "/v1/planning/us/pmi": (i) => pl("/en/pmi-removal-date-calculator/", pmiDates(S(i?.value), S(i?.loan), S(i?.rate), S(i?.years ?? 30), i?.extra ? S(i.extra) : "")),
    "/v1/planning/uk/pension-relief": (i) => pl("/en/uk-pension-tax-relief-calculator/", ukPensionRelief({ earnings: n(i?.earnings), netContribution: n(i?.netContribution) })),
    "/v1/planning/uk/lifetime-isa": (i) => pl("/en/lifetime-isa-bonus-calculator/", lisaPlan(S(i?.age), S(i?.balance ?? 0), S(i?.yearly), S(i?.growth ?? 4), S(i?.targetAge ?? 50))),
    "/v1/planning/uk/student-loan": (i) => pl("/en/uk-student-loan-plan-2-plan-5-calculator/", ukStudentLoan(i?.plan === "plan5" ? "plan5" : "plan2", S(i?.balance), S(i?.salary), S(i?.growth ?? 2), S(i?.base ?? 4.1), S(i?.thresholdGrowth ?? 0))),
    "/v1/planning/jp/nisa": (i) => pl("/ja/nisa-limit-planner/", nisaPlan(S(i?.used ?? 0), S(i?.usedGrowth ?? 0), S(i?.monthly), S(i?.growthYear ?? 0), S(i?.startYear ?? 2026))),
    "/v1/planning/jp/ideco": (i) => pl("/ja/pension-optimizer-calculator/", { monthlyLimit: jpIdecoMonthlyLimit(i?.category ?? "employee", i?.period === "reform" ? "reform" : "current", n(i?.otherMonthly)), saving: i?.salary ? japanIdecoSaving({ salary: n(i.salary), otherIncome: n(i.otherIncome), socialInsurance: n(i.socialInsurance), spouse: !!i.spouse, dependents: n(i.dependents), annualContribution: n(i.annualContribution) }) : null }),
    "/v1/planning/jp/housing-loan-credit": (i) => pl("/ja/housing-loan-deduction-calculator/", jpHousingLoanCredit({ loan: n(i?.loan), annualRatePct: n(i?.annualRatePct), termYears: n(i?.termYears, 35), borrowingLimit: n(i?.borrowingLimit), creditYears: Number(i?.creditYears) === 10 ? 10 : 13, incomeTax: n(i?.incomeTax), residentTaxCap: n(i?.residentTaxCap, 97500) })),
    "/v1/planning/cn/personal-pension": (i) => pl("/zh/personal-pension-tax-calculator/", chinaPensionSaving({ income: n(i?.income), socialInsurance: n(i?.socialInsurance), specialAdditional: n(i?.specialAdditional), otherDeductions: n(i?.otherDeductions), contribution: n(i?.contribution) })),
    "/v1/planning/cn/combo-loan": (i) => pl("/zh/housing-provident-fund-combo-loan-calculator/", cnComboLoan({ fundAmount: n(i?.fundAmount), fundRatePct: n(i?.fundRatePct), commercialAmount: n(i?.commercialAmount), commercialRatePct: n(i?.commercialRatePct), years: n(i?.years, 30), method: i?.method === "principal" ? "principal" : "annuity" })),
    "/v1/planning/fr/per": (i) => { const plafond = n(i?.plafond) > 0 ? n(i.plafond) : frPerCeilingSalarie(n(i?.revenusPro2025, n(i?.revenu))); return pl("/fr/pension-optimizer-calculator/", { plafond, ...francePerSaving({ revenu: n(i?.revenu), couple: !!i?.couple, children: n(i?.children), versement: n(i?.versement), plafond }) }); },
    "/v1/planning/es/pension-plan": (i) => pl("/es/pension-optimizer-calculator/", spainPensionLimit({ individual: n(i?.individual), employer: n(i?.employer), workerEmployment: n(i?.workerEmployment), workIncomeOver60k: !!i?.workIncomeOver60k, autonomo: n(i?.autonomo), netIncome: n(i?.netIncome) })),
    "/v1/planning/sg/cpf-housing-refund": (i) => pl("/en/cpf-housing-refund-calculator/", cpfRefund(S(i?.upfront), S(i?.monthly ?? 0), S(i?.months ?? 0), S(i?.rate ?? 2.5), S(i?.price), S(i?.loan ?? 0))),
    "/v1/planning/ca/stress-test": (i) => pl("/en/canada-mortgage-stress-test-calculator/", caStressTest({ grossAnnualIncome: n(i?.grossAnnualIncome), contractRatePct: n(i?.contractRatePct), amortizationYears: n(i?.amortizationYears, 25), propertyTaxMonthly: n(i?.propertyTaxMonthly), heatingMonthly: n(i?.heatingMonthly), condoFeesMonthly: n(i?.condoFeesMonthly), otherDebtMonthly: n(i?.otherDebtMonthly) })),
    "/v1/planning/kr/national-pension-timing": (i) => pl("/ko/national-pension-early-deferred-calculator/", krNpsEarlyDefer({ birthYear: n(i?.birthYear), monthly: n(i?.monthly), mode: i?.mode === "defer" ? "defer" : "early", earlyYears: n(i?.earlyYears, 1), deferMonths: n(i?.deferMonths, 12), deferSharePct: n(i?.deferSharePct, 100), untilAge: n(i?.untilAge, 85) })),
    "/v1/planning/tw/labor-pension-voluntary": (i) => pl("/zh/taiwan-labor-pension-voluntary-contribution/", twLaborPensionVoluntary({ monthlyWage: n(i?.monthlyWage), voluntaryPct: n(i?.voluntaryPct, 6), marginalRatePct: n(i?.marginalRatePct, 5) })),
    "/v1/planning/de/riester-ruerup": (i) => pl("/de/riester-ruerup-rechner/", { riester: deRiester({ vorjahresEinnahmen: n(i?.vorjahresEinnahmen), eigenbeitrag: n(i?.eigenbeitrag), kinderVor2008: n(i?.kinderVor2008), kinderAb2008: n(i?.kinderAb2008), berufseinsteiger: i?.berufseinsteiger === true, grenzsteuersatzPct: n(i?.grenzsteuersatzPct, 30) }), basisrente: i?.basisrenteBeitrag === undefined ? null : deBasisrente({ jahr: n(i?.basisrenteJahr, 2026) === 2025 ? 2025 : 2026, beitrag: n(i?.basisrenteBeitrag), grvBeitraegeGesamt: n(i?.grvBeitraegeGesamt), zusammen: i?.zusammen === true, grenzsteuersatzPct: n(i?.grenzsteuersatzPct, 30) }) }),
    "/v1/planning/kr/national-pension-estimate": (i) => pl("/ko/national-pension-estimate-calculator/", krPensionEstimate({ startYear: n(i?.startYear), endYear: n(i?.endYear), monthlyIncome: n(i?.monthlyIncome), gapMonths: n(i?.gapMonths), spouse: i?.spouse === true, dependents: n(i?.dependents) })),
    "/v1/planning/kr/quit": (i) => pl("/ko/quit-one-stop-calculator/", krQuitPlan({ monthlyWage: n(i?.monthlyWage), years: n(i?.years), annualBonus: n(i?.annualBonus), annualLeavePay: n(i?.annualLeavePay), insuredYears: n(i?.insuredYears), age50OrDisabled: i?.age50OrDisabled === true, involuntary: i?.involuntary === true })),
    "/v1/planning/jp/furusato-limit": (i) => pl("/ja/furusato-nozei-limit-calculator/", jpFurusatoLimit({ residentIncomeLevy: n(i?.residentIncomeLevy), incomeTaxRatePct: n(i?.incomeTaxRatePct, 10), donation: i?.donation === undefined ? undefined : n(i?.donation) })),
    "/v1/planning/uk/marriage-allowance": (i) => pl("/en/uk-marriage-allowance-calculator/", ukMarriageAllowance({ lowerIncome: n(i?.lowerIncome), higherIncome: n(i?.higherIncome), scotland: i?.scotland === true, married: i?.married !== false })),
    "/v1/planning/us/california-income-tax": (i) => pl("/en/california-income-tax-calculator-2025/", caIncomeTax2025({ taxableIncome: n(i?.taxableIncome), filing: i?.filing === "mfj" ? "mfj" : "single" })),
    "/v1/planning/au/super-caps": (i) => pl("/en/australia-super-contribution-caps-calculator/", auSuper({ year: i?.year === "2026-27" ? "2026-27" : "2025-26", salary: n(i?.salary), salarySacrifice: n(i?.salarySacrifice), personalDeductible: n(i?.personalDeductible), unusedCarryForward: n(i?.unusedCarryForward), tsbUnder500k: i?.tsbUnder500k === true, div293Income: n(i?.div293Income, n(i?.salary)), nonConcessional: n(i?.nonConcessional), marginalRatePct: n(i?.marginalRatePct) })),
    "/v1/take-home/es": (i) => ({ ...esTakeHome({ ...i, pagas: Number(i?.pagas) === 14 ? 14 : 12 }), page: `${ESP}spain-salary-calculator/`, note: TH_NOTE }),
    "/v1/de/income-tax": (i) => dsg(`${DEP}einkommensteuer-rechner-2026/`, deIncomeTax(i)),
    "/v1/de/notice": (i) => dsg(`${DEP}kuendigungsfrist-rechner/`, deNoticePeriod(i)),
    "/v1/de/minimum-wage": (i) => dsg(`${DEP}kuendigungsfrist-rechner/`, deMinimumWage(i)),
    "/v1/de/einvoice": (i) => dsg(`${DEP}e-rechnung-pflicht-ab-wann/`, deEInvoice(i)),
    "/v1/sg/cpf": (i) => dsg(`${EN}singapore-cpf-contribution-calculator-2026/`, sgCpf(i)),
    "/v1/sg/income-tax": (i) => dsg(`${EN}singapore-income-tax-calculator/`, sgIncomeTax(i)),
    "/v1/sg/notice": (i) => dsg(`${EN}singapore-notice-period-calculator/`, sgNotice(i)),
    "/v1/residency/us": (i) => res(`${EN}us-substantial-presence-test-calculator/`, usSubstantialPresence(i)),
    "/v1/residency/uk": (i) => res(`${EN}uk-statutory-residence-test-calculator/`, ukStatutoryResidence(i)),
    "/v1/residency/es": (i) => res(`${ESP}residencia-fiscal-espana-183-dias/`, esResidency(i)),
    "/v1/residency/tw": (i) => res(`${ZHP}taiwan-tax-resident-183-31-days/`, twResidency(i)),
    "/v1/residency/jp": (i) => res(`${JA}zeirishi-law-scope/`, jpResidency(i)),
    "/v1/residency/fr": (i) => res(`${FRP}conseil-fiscal-qui-peut/`, frResidency(i)),
    "/v1/einvoice/fr": (i) => ein(FRP, "facturation-electronique-calendrier-entreprise", frEInvoice(i)),
    "/v1/einvoice/jp": (i) => ein(JA, "japan-invoice-keika-sochi-70", jpInvoiceTransition(i)),
    "/v1/einvoice/es": (i) => ein(ESP, "verifactu-plazo-obligatorio-2027", esVerifactu(i)),
    "/v1/company-calendar/jp": (i) => cal(JA, "japan-hojin-shinkoku-kigen-calendar", jpCompanyCalendar(i)),
    "/v1/company-calendar/uk": (i) => cal(EN, "uk-company-accounts-ct600-deadlines", ukCompanyCalendar(i)),
    "/v1/company-calendar/us": (i) => cal(EN, "us-business-tax-return-due-dates", usCompanyCalendar(i)),
    "/v1/company-calendar/fr": (i) => cal(FRP, "delai-approbation-depot-comptes-annuels", frCompanyCalendar(i)),
    "/v1/employer/jp": (i) => emp(JA, "japan-employer-social-insurance-cost", jpEmployerCost(i)),
    "/v1/employer/uk": (i) => emp(EN, "uk-employer-national-insurance-2026", ukEmployerCost(i)),
    "/v1/employer/us": (i) => emp(EN, "us-employer-payroll-tax-fica-2026", usEmployerCost(i)),
    "/v1/employer/es": (i) => emp(ESP, "coste-empresa-seguridad-social-2026", esEmployerCost({ ...i, group: i.group ? Math.round(i.group) : undefined })),
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
    "/v1/office/visit": (i) => visitOffice(i),
    "/v1/kr/life-desk": (i) => {
      const full = (d) => ({ ...d, tools: d.tools.map((t) => ({ ...t, url: `${T}${t.href}` })) });
      const kind = i?.kind === "job" || i?.kind === "event" ? i.kind : undefined;
      if (i?.id) { const d = deskById(String(i.id)); return d ? { asOf: KR_DESKS_AS_OF, desk: full(d) } : { error: "unknown id" }; }
      if (i?.question) return { asOf: KR_DESKS_AS_OF, matches: findDesks(String(i.question), kind).map(full), page: `${T}/ko/${kind === "event" ? "life-event-navigator" : "job-desk"}/` };
      return { asOf: KR_DESKS_AS_OF, desks: KR_DESKS.filter((d) => !kind || d.kind === kind).map((d) => ({ id: d.id, kind: d.kind, title: d.title })) };
    },
    "/v1/kr/expert-visit": (i) => {
      const link = (t) => ({ ...t, url: `${T}${t.href}` });
      const full = (e) => ({ ...e, guide: `${T}${e.guide}`, needs: e.needs.map((n) => ({ ...n, tools: n.tools.map(link) })) });
      const page = `${T}/ko/before-expert-visit/`;
      if (i?.id) { const e = expertById(String(i.id)); return e ? { asOf: EXPERT_VISIT_AS_OF, expert: full(e), page } : { error: "unknown id" }; }
      if (i?.question) return { asOf: EXPERT_VISIT_AS_OF, matches: findExpertNeeds(String(i.question)).map((h) => { const e = expertById(h.expert); return { expert: h.expert, name: e?.name, need: { ...h.need, tools: h.need.tools.map(link) }, bring: e?.bring, free: e?.free, lawyerWhen: e?.lawyerWhen }; }), page };
      return { asOf: EXPERT_VISIT_AS_OF, experts: EXPERTS.map((e) => ({ id: e.id, name: e.name, scope: e.scope })), page };
    },
    "/v1/kr/demand-letter": (i) => {
      if (!LETTER_TYPES.some((t) => t.id === i?.type)) return { error: "type must be one of " + LETTER_TYPES.map((t) => t.id).join(", ") };
      return { ...buildDemandLetter(i), page: `${T}/ko/demand-letter-builder/` };
    },
    "/v1/kr/consult-memo": (i) => {
      if (!String(i?.situation ?? "").trim()) return { error: "situation is required" };
      return { ...buildConsultMemo(i), page: `${T}/ko/consult-memo-builder/` };
    },
    "/v1/planning/kr/household-checkup": (i) => ({ ...householdCheckup(i), page: `${T}/ko/household-money-checkup/` }),
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
