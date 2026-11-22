import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.mjs";
import { TOOLS_SPEC, TOOL_ENDPOINTS } from "../src/modules/tools-spec.mjs";
import { OPENAPI_SPEC } from "../src/modules/openapi.mjs";
import { SOURCE_PAGES, mcpMedium, sourcePageUrl } from "../src/modules/source-pages.mjs";

const fixtures = {
  get_kr_minimum_wage: { year: 2027 },
  get_kr_holidays: { year: 2026 },
  check_kr_business_day: { date: "2026-10-16" },
  calculate_saju_astrology: { year: 1990, month: 5, day: 15, hour: 14 },
  calculate_unemployment_benefits: { wage: 3000000, age: "under", period: "p3" },
  calculate_weekly_allowance: { hourlyWage: 10320, hours: 20, tax: "none", employedWholeWeek: true, completedScheduledDays: true },
  calculate_overtime_pay: { hourlyWage: 10320, overtimeHours: 2 },
  calculate_net_salary: { salary: 3500000 },
  calculate_severance_pay: { startDate: "2024-01-01", endDate: "2026-01-01", threeMonthSalary: 9000000 },
  calculate_annual_leave: { yearsOfService: 2 },
  calculate_military_service: { enlistmentDate: "2026-03-01", currentDate: "2026-10-16", branch: "army" },
  calculate_gas_bill: { usageM3: 50 },
  convert_units: { value: 1, from: "m", to: "cm" },
  calculate_cagr: { initialValue: 100, finalValue: 200, years: 5 },
  calculate_compound_interest: { principal: 1000000, rate: 5, years: 10 },
  calculate_health_insurance: { businessIncome: 30000000 },
  diagnose_hug_guarantee: { officialPrice: 300000000, jeonseDeposit: 200000000 },
  calculate_capital_gains_tax: { transferPrice: 500000000, acquisitionPrice: 400000000 },
  compare_vat_tax: { revenue: 50000000 },
  calculate_inheritance_gift_tax: { assetValue: 100000000, mode: "gift", relationship: "child_adult" },
  calculate_loan_refinance: { loanBalance: 200000000, currentRate: 4.8, newRate: 3.9 },
  calculate_card_tax_deduction: { annualSalary: 50000000 },
  calculate_kr_year_end_settlement: { salary: 50000000, persons: 1, withheld: 2000000 },
  calculate_kr_freelancer_income_tax: { revenue: 30000000 },
  calculate_kr_acquisition_tax: { price: 700000000 },
  calculate_kr_property_tax: { officialPrice: 500000000 },
  value_kr_unlisted_shares: { sharesOutstanding: 100000, netIncome1: 600000000, netIncome2: 500000000, netIncome3: 400000000, netAssets: 3000000000, heldShares: 60000 },
  calculate_kr_family_business_deduction: { businessValue: 10000000000, years: 15, size: "sme" },
  calculate_kr_incorporation_conversion: { realEstateMarket: 1000000000, realEstateCost: 400000000, holdYears: 10 },
  calculate_dcf_valuation: { revenue0: 10000000000, growth: 0.1, ebitMargin: 0.12, terminalGrowth: 0.02, shares: 1000000, wacc: 0.1 },
  evaluate_decision_tree: { question: "신규 매장?", options: [{ label: "열기", successProb: 0.4, ifSuccess: 500, ifFail: -100, cost: 50 }, { label: "보류", successProb: 1, ifSuccess: 60, ifFail: 60 }] },
  schedule_critical_path: { tasks: [{ id: "a", name: "기획", duration: 3 }, { id: "b", name: "개발", duration: 10, deps: ["a"], optimistic: 7, pessimistic: 16 }], deadline: 14, startDate: "2026-11-16", workdaysOnly: true },
  analyze_swot: { items: [{ kind: "S", text: "충성 고객", impact: 5, weight: 0.6, rating: 4 }, { kind: "T", text: "대기업 진입", impact: 4, weight: 1, rating: 2 }] },
  classify_bcg_portfolio: { units: [{ name: "매장", revenue: 3000, marketGrowth: 0.02, share: 0.18, rivalShare: 0.12 }, { name: "구독", revenue: 400, marketGrowth: 0.25, share: 0.02, rivalShare: 0.1 }] },
  map_brand_positioning: { brands: [{ name: "우리", x: -2, y: 4, ours: true }, { name: "A사", x: 7, y: 7 }, { name: "B사", x: -6, y: -5 }], idealX: 3, idealY: 6 },
  calculate_unit_economics_runway: { arpu: 50000, grossMargin: 0.7, monthlyChurn: 0.04, cac: 300000, cash: 300000000, revenue: 20000000, revenueGrowth: 0.06, expenses: 45000000, expenseGrowth: 0.01 },
  rank_priorities: { method: "weighted", criteria: [{ name: "비용", weight: 2 }, { name: "속도", weight: 1 }], options: [{ name: "X", scores: [5, 1] }, { name: "Y", scores: [2, 4] }] },
  get_kr_business_tax_calendar: { year: 2026, entity: "corp", vat: "general", employer: true, from: "2026-11-15", stage: "hire" },
  plan_kr_small_business_month: { month: "2026-12", entity: "indiv", vat: "general", employer: true, payday: 25, hires: ["2026-11-17"], today: "2026-11-20" },
  plan_campaign_supply: { demand: [100, 100, 300, 300, 100], openingStock: 100, capacityPerWeek: 150, leadTimeWeeks: 1 },
  evaluate_influencer_deal: { fee: 3000000, views: 200000, clickRate: 0.02, conversionRate: 0.05, aov: 30000, grossMargin: 0.7, payee: "freelancer" },
  plan_quality_recovery: { lots: [{ id: "L1", units: 1000, defectRate: 0.1, shippedRatio: 0.5 }], recallCostPerUnit: 500, remakeCostPerUnit: 2000, goodStock: 600, customers: [{ name: "A", demand: 600, priority: 2, penaltyPerUnit: 1000 }, { name: "B", demand: 400, priority: 1, penaltyPerUnit: 200 }] },
  compare_alternative_materials: { currentPrice: 1000, annualVolume: 100000, candidates: [{ name: "X", unitPrice: 900, quality: 4, supply: 3, testWeeks: 6, testCost: 5000000 }, { name: "Y", unitPrice: 800, quality: 2, supply: 2, testWeeks: 12, testCost: 8000000, needsFiling: true }], weights: { cost: 1, quality: 1, supply: 1, speed: 1 } },
  check_big_order_capacity: { capacity: 1000, existing: [{ name: "핵심", qty: 500, price: 100, unitCost: 60, penaltyPerUnit: 100, locked: true }, { name: "일반", qty: 300, price: 80, unitCost: 60, penaltyPerUnit: 5 }], newOrder: { name: "대형", qty: 500, price: 110, unitCost: 60 } },
  analyze_market_test: { baseline: 0.05, lift: 0.2, convA: 100, nA: 2000, convB: 140, nB: 2000 },
  check_sales_rebates: { tiers: [{ from: 0, rate: 0.01 }, { from: 100000000, rate: 0.03 }], partners: [{ name: "D1", sales: 60000000, group: "G", related: true, paid: 1800000 }, { name: "E", sales: 80000000, paid: 800000 }], aggregateGroups: false, armsLengthCheck: true },
  evaluate_acquisition: { price: 10000, targetNetIncome: 1000, acquirerNetIncome: 5000, acquirerShares: 1000, sharePrice: 50, stockPortion: 1, debtRate: 0.05, taxRate: 0.2, synergy: 0, rampYears: 1, integrationCost: 0, years: 12 },
  calculate_kr_work_child_incentive: { household: "oneEarner", income: 20000000, assets: 100000000, children: 1 },
  calculate_kr_maternity_leave_pay: { monthlyWage: 3000000, priorityFirm: true, kind: "single" },
  calculate_kr_wage_guarantee: { kind: "simpleRetired", age: 40, monthlyWage: 3000000, unpaidMonths: 3, unpaidSeverance: 9000000, serviceYears: 3 },
  calculate_kr_injury_leave_pay: { avgDailyWage: 150000, days: 30 },
  calculate_kr_monthly_rent_credit: { income: 50000000, incomeType: "wage", monthlyRent: 600000, months: 12 },
  compare_kr_retirement_pension: { monthlyWage: 4000000, yearsServed: 5, yearsLeft: 20, wageGrowth: 0.03, dcReturn: 0.04 },
  calculate_kr_ordinary_wage: { basePay: 2500000, fixedAllowances: 300000, bonusAnnual: 6000000, bonusConditional: true, overtime: 20, night: 0, holiday: 0 },
  check_kr_fixed_overtime_pay: { basePay: 2508000, fixedOtPay: 300000, overtime: 30, night: 0, holiday: 0 },
  calculate_kr_comprehensive_real_estate_tax: { prices: [1500000000], oneHouse: true },
  calculate_kr_long_term_care_copay: { grade: "3", kind: "home", reduction: "none" },
  check_kr_dependent_deduction: { salary: 50000000, married: true, people: [{ relation: "spouse", birthYear: 1990 }, { relation: "parent", birthYear: 1950 }] },
  calculate_kr_stock_major_shareholder_tax: { market: "kospi", heldValue: 6000000000, gain: 500000000, overOneYear: true },
  calculate_kr_dismissal_notice_pay: { monthlyOrdinaryWage: 2090000, noticeDays: 10, tenureMonths: 12 },
  calculate_kr_shutdown_allowance: { threeMonthWages: 9200000, monthlyOrdinaryWage: 3650000, shutdownDays: 10 },
  calculate_kr_reduced_hours_childcare_pay: { monthlyOrdinaryWage: 3000000, afterHours: 20 },
  check_kr_probation_minimum_wage: { hourlyWage: 9300, contractMonths: 0, monthsIntoProbation: 1, simpleLabor: false },
  plan_kr_annual_leave_promotion: { kind: "annual", periodEnd: "2026-12-31" },
  check_kr_voluntary_quit_unemployment: { reasons: ["unpaidWages"], months: 2, insuredDays: 200 },
  check_kr_subcontract_direct_payment: { cause: "twoMissed", missedInstallments: 2, requested: true, workValue: 50000000, receivedFromPrime: 10000000, ownerUnpaidToPrime: 30000000, daysSinceDelivery: 125 },
  check_kr_family_loan_interest: { principal: 300000000, rate: 0 },
  check_kr_parent_house_free_use: { propertyValue: 1500000000 },
  check_kr_family_low_price_sale: { marketValue: 1100000000, price: 700000000 },
  check_kr_commercial_rent_increase: { region: "seoul", deposit: 100000000, monthlyRent: 5000000, newDeposit: 100000000, newMonthlyRent: 5300000, monthsSinceLast: 24 },
  calculate_kr_sme_youth_tax_reduction: { salary: 36000000, ageAtContract: 29, start: "2026-03" },
  calculate_kr_yellow_umbrella_deduction: { kind: "business", income: 35000000, paid: 6000000 },
  compare_kr_general_vs_simplified_vat: { sector: "retail", sales: 100000000, purchases: 50000000 },
  calculate_kr_business_car_expense: { ownership: "own", amount: 60000000, otherCosts: 8000000, logbook: false },
  compare_kr_overseas_stock_vs_etf_tax: { gain: 10000000 },
  check_kr_officetel_house_count: { price: 250000000, acquired: "2023-05-01", residentialUse: true, otherHouses: 1, nextHomePrice: 800000000, nextRegulated: true },
  compare_kr_ticket_vs_presale_tax: { kind: "presale", gain: 100000000, holdYears: 1.5 },
  compare_kr_inherited_house_valuation: { official: 600000000, appraisal: 900000000, otherEstate: 200000000, spouse: false, salePrice: 1000000000, yearsAfter: 1 },
  plan_kr_after_death_tasks: { deathDate: "2026-03-10", realEstate: true, today: "2026-05-01" },
  plan_kr_inheritance_gift_filing_deadline: { kind: "gift", date: "2026-11-16", tax: 10000000 },
  check_kr_youth_rent_support: { age: 27, livesApart: true, ownsHome: false, youthIncome: 1400000, youthAssets: 30000000, parentIncome: 5000000, parentAssets: 300000000, deposit: 10000000, rent: 550000 },
  check_kr_special_supply: { sector: "private", householdSize: 3, monthlyIncome: 9000000, dualIncome: true, realEstate: 0, noHome: true, neverOwned: true, marriedYears: 2, childUnder2: false, minorChildren: 1, taxPaid5y: true, elderParent3y: false },
  find_kr_policy_housing_loans: { purpose: "jeonse", age: 28, income: 40000000, netAssets: 50000000, newlywed: false, children: 0, newbornWithin2y: false, firstTimeBuyer: true, metro: true, amount: 200000000 },
  get_kr_professional_scope: { domain: "labor" },
  start_kr_law_intake: { situation: "회사에서 문자로 해고 통보를 받았어요", answers: { size: "5plus", dismissDate: "2026-10-30" }, today: "2026-11-16" },
  search_kr_statutes: { query: "경정청구" },
  calculate_kr_fine_reduction: { fine: 500000, noticeDate: "2026-11-02", when: "early" },
  calculate_kr_import_duty: { price: 1000, freight: 50, fx: 1400, baseRate: 0.13, ftaRate: 0, hasOrigin: true },
  simulate_ifrs17_csm: { premium: 1000000, years: 10, claims: 600000, rate: 0.03 },
  calculate_kics_ratio: { available: 300e9, life: 100e9, market: 100e9 },
  calculate_insurance_claim_payout: { kind: "fault", damage: 10000000, fault: 0.3 },
  analyze_journal_entries: { entries: [{ date: "2026-03-07", account: "여비", amount: 4980000 }], approvalLimit: 5000000 },
  check_kr_privacy_breach_policy: { knownAt: "2026-11-20T09:00", affected: 1500 },
  calculate_kr_corporate_tax: { size: "sme", profit: 500000000, revenue: 10000000000, entertainment: 50000000 },
  calculate_kr_tax_penalty: { kind: "none", tax: 10000000, due: "2026-05-31", filed: "2026-06-20", today: "2026-06-20" },
  find_kr_appeal_deadlines: { from: "2026-11-02", domain: "tax", today: "2026-11-20" },
  calculate_kr_inheritance_reserve: { spouse: true, children: 2, estate: 1000000000, gifts: { child1: 300000000 }, bequests: { child1: 500000000 }, death: "2026-06-01" },
  simulate_kr_auction_distribution: { sale: 300000000, cost: 3000000, region: "seoul", baseDate: "2024-01-10", tenants: [{ label: "A", deposit: 50000000, date: "2024-03-01" }], claims: [{ label: "은행", amount: 200000000, date: "2024-01-10", kind: "mortgage" }], today: "2026-11-21" },
  calculate_kr_customs_practice: { mode: "travel", totalUsd: 1500, fx: 1400, selfReport: true },
  check_kr_workforce: { mode: "count", daily: [5, 6, 4, 5, 5, 3, 6, 5, 5, 4] },
  build_accounting_schedule: { mode: "depreciation", cost: 10000000, residual: 0, years: 5, method: "declining", firstMonths: 6 },
  calculate_kr_license_points: { mode: "status", events: [{ date: "2026-03-01", violation: "speed40" }, { date: "2026-08-01", violation: "signal", schoolZone: true }], asOf: "2026-11-21" },
  estimate_kr_appraisal_compensation: { mode: "land", officialPrice: 2000000, area: 100, landChange: 0.03, individual: 0.95 },
  plan_kr_ip_deadlines: { kind: "patent", filed: "2026-03-02", disclosed: "2025-12-01", today: "2026-11-21" },
  calculate_kr_vat_credits: { mode: "deemed", type: "restaurant-individual", purchases: 60000000, taxBase: 150000000 },
  check_kr_franchise_contract: { infoGiven: "2026-11-01", signed: "2026-11-10", currentEnd: "2027-12-31", firstStart: "2020-01-01" },
  check_kr_apartment_management: { households: 200, elevator: true, useApproval: "2022-05-10", handover: "2022-06-01", today: "2026-11-21" },
  calculate_kr_deferred_tax: { items: [{ label: "퇴직급여충당부채", amount: 100000000 }, { label: "일시상각충당금", amount: -40000000 }], rate: 0.209, openingNet: 5000000, currentTax: 30000000 },
  plan_kr_audit_materiality_sample: { benchmark: "pretax", base: 1000000000, population: 5000000000, tolerableRate: 0.05 },
  calculate_kr_injury_disability_benefit: { grade: 7, avgWage: 150000, healed: "2026-10-01" },
  check_kr_court_deposit: { amount: 30000000, deposited: "2025-03-02", withdrawn: "2026-11-20", ground: "refused" },
  estimate_kr_self_registration_cost: { price: 500000000, standardPrice: 350000000, metro: true, houses: 1, method: "efile" },
  calculate_kr_f27_points: { age: 31, degree: "master", korean: 4, income: 45000000 },
  check_kr_withholding_statement: { kind: "annual-wage", year: 2026, amount: 100000000, submitted: "2027-04-20" },
  calculate_kr_student_loan_repayment: { incomeType: "salary", amount: 40000000, loan: "undergrad" },
  check_kr_serious_accident: { deaths: 1, headcount: 30, date: "2026-11-02" },
  calculate_kr_accident_report_deadline: { date: "2026-11-10", lostDays3: true, today: "2026-11-21" },
  calculate_kr_safety_education_hours: { job: "other", hire: "regular", workers: 10, supervisors: 1 },
  check_kr_safety_staffing: { sector: "mfg-heavy", headcount: 120 },
  get_jp_tax_calendar: { year: 2027, prepaid: true, today: "2027-03-01" },
  calculate_jp_blue_return_deduction: { income: 5000000, otherDeductions: 600000 },
  check_jp_consumption_tax: { year: 2027, baseSales: 8000000, invoice: true, wasExempt: true, sales: 8000000, type: 5 },
  calculate_jp_penalty_tax: { kind: "none", stage: "audit", tax: 1000000 },
  calculate_jp_appeal_deadlines: { noticed: "2026-11-30" },
  calculate_jp_depreciation: { cost: 1200000, life: 4, acquired: "2026-10-15" },
  get_us_tax_calendar: { taxYear: 2026, selfEmployed: true, today: "2027-03-01" },
  calculate_us_self_employment_tax: { net: 80000, filing: "single" },
  calculate_us_estimated_tax: { priorTax: 10000, priorAgi: 100000, currentTax: 20000 },
  calculate_us_irs_penalty: { tax: 2000, due: "2027-04-15", filed: "2027-07-01", paid: "2027-07-01" },
  calculate_us_tax_appeal_deadlines: { notice: "2027-05-03" },
  calculate_us_depreciation: { cost: 10000, life: 5, placed: "2026-05-01", bonus: false },
  get_fr_tax_calendar: { year: 2027, is: true, cfe: true, tva: "simplifie", today: "2027-03-01" },
  calculate_fr_micro_entrepreneur: { activity: "services", ca: 50000, rfr: 20000, vl: true },
  check_fr_vat_franchise: { activity: "services", caPrev: 30000, ca: 42000 },
  calculate_fr_tax_penalty: { tax: 10000, fault: "retard", months: 3 },
  calculate_fr_claim_deadline: { eventYear: 2026 },
  calculate_fr_depreciation: { cost: 10000, life: 5, start: "2026-04-10", method: "degressif" },
  get_es_tax_calendar: { year: 2026, iva: true, pago: "130", sociedad: true, today: "2026-11-21" },
  calculate_es_autonomo_quota: { netMonthly: 2000, ingresos: 40000, gastos: 10000 },
  calculate_es_vat: { base: 1000, tipo: 21, recargo: true },
  calculate_es_late_filing_surcharge: { cuota: 2000, due: "2026-04-20", filed: "2026-07-21" },
  calculate_es_tax_sanction: { base: 10000, gravedad: "grave", acuerdo: "conformidad" },
  calculate_es_appeal_deadlines: { notificacion: "2026-01-31", finPlazoVoluntario: "2026-06-30" },
  calculate_es_depreciation: { elemento: "equipos-informaticos", coste: 2000, inicio: "2026-07-02" },
  get_cn_tax_calendar: { year: 2026, vat: "quarter", business: "month", today: "2026-11-21" },
  calculate_cn_business_income_tax: { taxable: 100000 },
  calculate_cn_comprehensive_income_tax: { income: 96000 },
  calculate_cn_small_profit_cit: { taxable: 1000000, employees: 20, assets: 3000000 },
  check_cn_small_scale_vat: { sales: 310000, period: "quarter" },
  calculate_cn_late_payment_surcharge: { tax: 10000, due: "2026-05-22", paid: "2026-06-21" },
  calculate_cn_tax_appeal_deadlines: { known: "2026-03-02", kind: "penalty" },
  calculate_cn_depreciation: { category: "electronics", cost: 30000, start: "2026-03-10" },
  get_uk_tax_calendar: { taxYear: 2025, mtd: true, companyYearEnd: "2026-03-31", today: "2026-11-21" },
  calculate_uk_self_employed_tax: { profit: 40000 },
  check_uk_vat_registration: { last12: 91000 },
  calculate_uk_sa_penalty: { tax: 2000, taxYear: 2024, filed: "2026-08-15", paid: "2026-03-15" },
  calculate_uk_late_payment_interest: { amount: 10000, from: "2026-01-31", to: "2026-03-15" },
  calculate_uk_tax_appeal_deadlines: { decision: "2026-11-21", taxYear: 2022 },
  calculate_uk_capital_allowances: { cost: 50000, pool: "main", company: true, date: "2026-06-01" },
  get_tw_tax_calendar: { year: 2026, company: true, today: "2026-11-21" },
  calculate_tw_income_tax: { year: 2025, salary: 1000000 },
  check_tw_business_tax: { serviceSales: 50000 },
  calculate_tw_late_fee: { tax: 100000, due: "2026-06-01", paid: "2026-06-04" },
  calculate_tw_tax_appeal_deadlines: { paymentPeriodEnd: "2026-06-10", paid: "2026-06-01" },
  calculate_tw_depreciation: { category: "computer", cost: 90000, start: "2026-10-05" },
  calculate_jp_labor_exit: { start: "2018-04-01", end: "2026-10-31", age: 40, insuredYears: 8, reason: "dismissal", dailyAverageWage: 12000, noticeDays: 10 },
  calculate_uk_labor_exit: { start: "2016-01-04", end: "2026-10-30", age: 45, weeklyPay: 800, incident: "2026-10-30" },
  check_us_labor_rights: { state: "CA", hourlyWage: 20, weeklyHours: 45, incident: "2026-10-01", employees: 150, layoffAtSite: 60, fired: true },
  calculate_fr_labor_exit: { start: "2016-03-01", end: "2026-09-30", monthlyReference: 3000 },
  calculate_es_labor_exit: { start: "2015-01-01", end: "2026-10-31", annualSalary: 30000, type: "improcedente", contributedDays: 2000 },
  calculate_cn_labor_exit: { start: "2018-03-01", end: "2026-10-31", monthlyWage: 12000, insuredYears: 8 },
  calculate_tw_labor_exit: { start: "2016-01-01", end: "2026-10-31", averageMonthlyWage: 50000, system: "new", insuredMonthlyWage: 45800 },
  check_jp_rental_deposit_notice: { rent: 80000, deposit: 160000, lease: "ordinary", noticeDate: "2026-12-01" },
  check_uk_tenancy_deposit_notice: { monthlyRent: 1300, deposit: 1600, received: "2026-11-01" },
  check_us_security_deposit_notice: { state: "CA", rent: 2000, deposit: 4000, moveOut: "2026-12-31", monthsLived: 14, region: "la" },
  check_fr_deposit_notice_irl: { lease: "vide", rentHC: 800, deposit: 800, keysReturned: "2026-12-01", sameInventory: true },
  check_es_fianza_preaviso: { rent: 1000, fianza: 1000, extraGuarantee: 0, company: false },
  check_cn_rental_contract_deposit: { termMonths: 12, written: true, deposit: 6000, rent: 3000 },
  check_tw_rental_deposit_termination: { rent: 20000, deposit: 50000 },
  start_world_law_intake: { country: "JP", question: "退去したのに敷金が返ってきません" },
  check_jp_cooling_off: { kind: "visit", documentReceived: "2026-11-20" },
  check_uk_cancellation_period: { kind: "goods", delivered: "2026-11-03" },
  check_fr_retractation: { kind: "biens", delivered: "2026-11-07" },
  check_es_desistimiento: { kind: "bienes", delivered: "2026-11-01" },
  check_cn_7day_return: { online: true, signedFor: "2026-11-11" },
  check_tw_7day_cancellation: { channel: "mail", received: "2026-11-10" },
  check_us_cooling_off: { place: "home", price: 500, saleDate: "2026-11-20" },
  calculate_jp_inheritance_gift_tax: { kind: "inheritance", estate: 100000000, heirs: 2, death: "2026-01-15" },
  calculate_uk_inheritance_tax: { estate: 600000, homeToDescendants: true, homeValue: 300000, death: "2026-03-10" },
  check_us_estate_gift_exclusion: { estate: 16000000, death: "2026-02-28" },
  calculate_fr_droits_succession: { part: 200000, relation: "enfant", death: "2026-05-31" },
  check_tw_estate_tax_deadline: { death: "2026-01-15" },
  check_jp_limitation_small_claims: { claim: "general", knew: "2022-04-01", couldExercise: "2022-04-01", amount: 300000 },
  check_uk_limitation_small_claims: { claim: "contract", accrued: "2021-06-01", amount: 2500 },
  check_ca_limitation_small_claims: { claim: "writtenContract", start: "2023-05-01", amount: 5000 },
  check_fr_prescription: { claim: "general", start: "2022-01-15", amount: 3000 },
  check_tw_limitation_small_claims: { claim: "shortTwoYear", start: "2025-03-01", amount: 80000 },
  check_cn_small_claims: { amount: 50000, provincialAverageWage: 120000 },
  calculate_jp_employer_cost: { monthly: 300000, age: 30 },
  calculate_uk_employer_cost: { annual: 30000, employees: 4, allowance: true },
  calculate_us_employer_cost: { annual: 100000 },
  calculate_es_employer_cost: { monthly: 2000, group: 4 },
  check_jp_company_calendar: { yearEnd: "2026-03-31", consumptionTax: true },
  check_uk_company_calendar: { yearEnd: "2026-03-31" },
  check_us_company_calendar: { yearEnd: "2026-12-31", entity: "ccorp" },
  check_fr_company_calendar: { yearEnd: "2025-12-31" },
  check_fr_einvoicing: { size: "pme" },
  calculate_jp_invoice_transition: { purchaseDate: "2026-11-22", taxAmount: 10000 },
  check_es_verifactu: { sociedades: false },
  check_us_residency: { current: 120, prior1: 120, prior2: 120 },
  check_uk_residency: { days: 100, residentInPrior3: true, ties: 2 },
  check_es_residency: { days: 200 },
  check_tw_residency: { days: 40, householdRegistration: true },
  check_jp_residency: { domicileInJapan: true },
  check_fr_residency: { foyerInFrance: true },
  calculate_de_income_tax: { zvE: 50000 },
  calculate_de_notice_period: { noticeDate: "2026-11-20", startDate: "2020-01-01", by: "employer" },
  check_de_minimum_wage: { date: "2026-11-22", hourly: 13 },
  check_de_einvoicing: { turnover2026: 500000 },
  calculate_sg_cpf: { monthlyWage: 5000, age: 30 },
  check_jp_withholding: { type: "royalty", amount: 1000 },
  check_us_withholding: { type: "royalty", amount: 1000 },
  check_fr_withholding: { type: "royalty", amount: 1000 },
  check_es_withholding: { type: "royalty", amount: 1000 },
  check_tw_withholding: { type: "royalty", amount: 1000 },
  check_de_withholding: { type: "royalty", amount: 1000 },
  calculate_jp_corporate_tax: { profit: 100000 },
  calculate_uk_corporate_tax: { profit: 100000 },
  calculate_us_corporate_tax: { profit: 100000 },
  calculate_fr_corporate_tax: { profit: 100000 },
  calculate_es_corporate_tax: { profit: 100000 },
  calculate_de_corporate_tax: { profit: 100000 },
  calculate_uk_home_purchase_tax: { price: 300000 },
  calculate_jp_home_purchase_tax: { price: 300000 },
  calculate_fr_home_purchase_tax: { price: 300000 },
  calculate_es_home_purchase_tax: { price: 300000 },
  calculate_cn_home_purchase_tax: { price: 300000 },
  calculate_de_inheritance_tax: { value: 1000000, relation: "child" },
  calculate_de_garnishment: { net: 2000 },
  check_de_withdrawal_deadline: { start: "2026-11-02", kind: "goods" },
  check_de_rent_deposit: { coldRent: 800 },
  check_de_limitation_period: { arose: "2026-03-10" },
  calculate_de_late_payment_b2b: { amount: 10000, due: "2026-08-01", paid: "2026-08-31" },
  calculate_fr_late_payment_b2b: { amount: 10000, due: "2026-08-01", paid: "2026-08-31" },
  calculate_es_late_payment_b2b: { amount: 10000, due: "2026-08-01", paid: "2026-08-31" },
  calculate_uk_late_payment_b2b: { amount: 10000, due: "2026-08-01", paid: "2026-08-31", baseRate: 3.75 },
  calculate_uk_maternity_pay: { weeklyEarnings: 600 },
  calculate_uk_child_benefit: { children: 2, adjustedNetIncome: 70000 },
  calculate_jp_childcare_leave_benefit: { monthlyWage: 300000, months: 12 },
  calculate_de_elterngeld: { netBefore: 2000 },
  calculate_de_kleinunternehmer_vat: { priorYear: 20000, currentYear: 60000 },
  calculate_sg_gst_registration: { forecastNext12: 1200000, forecastDate: "2026-09-02" },
  calculate_jp_overtime_cap_check: { special: true, months: [{ overtime: 60, holiday: 8 }, { overtime: 40 }] },
  calculate_uk_irregular_hours_holiday: { hours: [100, 80] },
  calculate_jp_court_fee: { value: 3000000, kind: "suit" },
  calculate_de_court_fee: { value: 5000 },
  check_tw_debt_clearance: { totalDebt: 3000000, hasBankDebt: true },
  check_es_second_chance: { priorExoneration: "none" },
  get_es_inheritance_deadline: { death: "2026-08-31" },
  calculate_uk_take_home: { annual: 35000 },
  calculate_us_take_home: { annual: 60000 },
  calculate_jp_take_home: { annual: 5000000 },
  calculate_fr_take_home: { annual: 40000 },
  calculate_es_take_home: { annual: 30000, pagas: "14" },
  calculate_sg_income_tax: { chargeableIncome: 80000, resident: true, ya: 2025 },
  calculate_sg_notice_period: { startDate: "2020-01-01", noticeDate: "2026-11-02" },
  compare_kr_bookkeeping_vs_estimate: { group: "c", prevRevenue: 80000000, revenue: 90000000, actualExpense: 30000000, simpleRate: 60, standardRate: 20, majorExpense: 20000000 },
  check_kr_exempt_business_report: { year: 2026, kind: "medical", unreported: 100000000, today: "2026-11-21" },
  compare_kr_private_pension_tax: { privatePension: 20000000, age: 66, publicPension: 12000000 },
  check_kr_freelance_contract: { contractText: "대금은 고객사로부터 결제를 받은 후 지급한다.", amount: 1000000, creative: true },
  get_kr_practice_guide: { guide: "visa-stay-status-guide", case: "arrival", dates: { register: "2026-09-01" } },
  check_insurance_explanation_record: { date: "2026-11-17", delivered: "paper", confirm: "sign" },
  calculate_kr_housing_rental_income_tax: { houses: 2, annualRent: 12000000, deposits: 0, registered: false, otherIncome: 40000000 },
};

function rpcRequest(method, params = {}, headers = {}) {
  return new Request("https://api.oiyo.net/mcp", {
    method: "POST", headers: {
      "Content-Type": "application/json", Accept: "application/json, text/event-stream",
      "MCP-Protocol-Version": "2026-07-28", "Mcp-Method": method,
      ...(params.name ? { "Mcp-Name": params.name } : {}), ...headers,
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params: {
      ...params, _meta: {
        "io.modelcontextprotocol/protocolVersion": "2026-07-28",
        "io.modelcontextprotocol/clientInfo": { name: "oiyo-regression", version: "1.0.0" },
        "io.modelcontextprotocol/clientCapabilities": {},
      },
    } }),
  });
}

async function rpc(method, params) {
  const response = await worker.fetch(rpcRequest(method, params));
  const body = await response.json();
  assert.equal(response.status, 200, JSON.stringify(body));
  return body;
}

test("MCP catalog is generated from the function schema SSOT", async () => {
  const body = await rpc("tools/list");
  assert.deepEqual(body.result.tools.map(t => t.name).sort(), TOOLS_SPEC.tools.map(t => t.function.name).sort());
  assert.deepEqual(Object.keys(TOOL_ENDPOINTS).sort(), Object.keys(fixtures).sort());
  for (const tool of body.result.tools) {
    assert.equal(tool.annotations.readOnlyHint, true);
    assert.equal(tool.inputSchema.additionalProperties, false);
    const endpoint = TOOL_ENDPOINTS[tool.name];
    assert.equal(OPENAPI_SPEC.paths[endpoint.path][(endpoint.method || "GET").toLowerCase()].operationId, tool.name);
  }
});

for (const [name, args] of Object.entries(fixtures)) {
  test(`MCP ${name} returns the same data as the public REST route`, async () => {
    const { path, method = "GET" } = TOOL_ENDPOINTS[name];
    const url = new URL(path, "https://api.oiyo.net");
    const options = { method };
    if (method === "POST") {
      options.body = JSON.stringify(args); options.headers = { "Content-Type": "application/json" };
    } else for (const [key, value] of Object.entries(args)) url.searchParams.set(key, String(value));
    const rest = await worker.fetch(new Request(url, options));
    assert.equal(rest.status, 200, await rest.clone().text());
    const expected = await rest.json();
    const body = await rpc("tools/call", { name, arguments: args });
    assert.equal(body.result.isError, false);
    const { sourcePage, ...restFields } = body.result.structuredContent;
    assert.deepEqual(restFields, expected);
    assert.deepEqual(JSON.parse(body.result.content[0].text), body.result.structuredContent);
    assert.equal(sourcePage, sourcePageUrl(name, "unknown"));
    assert.equal(body.result.content[1].text, `Interactive calculator (Korean, OIYO): ${sourcePage}`);
  });
}

test("MCP transport rejects invalid origins, media, methods and oversized bodies", async () => {
  assert.equal((await worker.fetch(rpcRequest("tools/list", {}, { Origin: "https://untrusted.example" }))).status, 403);
  assert.equal((await worker.fetch(new Request("https://api.oiyo.net/mcp"))).status, 405);
  assert.equal((await worker.fetch(new Request("https://api.oiyo.net/mcp", { method: "POST", headers: { "Content-Type": "text/plain" }, body: "{}" }))).status, 415);
  assert.equal((await worker.fetch(new Request("https://api.oiyo.net/mcp", { method: "POST", headers: { "Content-Type": "application/json" }, body: " ".repeat(32769) }))).status, 413);
  const response = await worker.fetch(rpcRequest("tools/list"));
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.equal(response.headers.get("X-Robots-Tag"), "noindex");
});

test("MCP validates arguments, unknown tools and version header mismatches", async () => {
  const bad = await rpc("tools/call", { name: "convert_units", arguments: { value: "1", from: "m", to: "cm" } });
  assert.ok(bad.error || bad.result?.isError);
  const extra = await rpc("tools/call", { name: "convert_units", arguments: { value: 1, from: "m", to: "cm", unknown: true } });
  assert.ok(extra.error || extra.result?.isError);
  const unknown = await rpc("tools/call", { name: "does_not_exist", arguments: {} });
  assert.ok(unknown.error || unknown.result?.isError);
  assert.equal((await worker.fetch(rpcRequest("tools/list", {}, { "MCP-Protocol-Version": "2025-06-18" }))).status, 400);
});

test("legacy initialize stays available without persistent sessions", async () => {
  const response = await worker.fetch(new Request("https://api.oiyo.net/mcp", {
    method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "legacy-test", version: "1" } } }),
  }));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("mcp-session-id"), null);
  assert.match(await response.text(), /2025-06-18/);
});

test("every MCP tool links back to an OIYO page with pilot UTM tags", () => {
  assert.deepEqual(Object.keys(SOURCE_PAGES).sort(), Object.keys(TOOL_ENDPOINTS).sort());
  for (const name of Object.keys(TOOL_ENDPOINTS)) {
    const url = new URL(sourcePageUrl(name, "smithery"));
    assert.match(url.origin, /^https:\/\/(tools\.)?oiyo\.net$/);
    // 2026-11-21: 각국 현지판(*_jp_* 등)은 그 나라 언어 페이지로 보내요.
    assert.ok(/^\/(ko|ja|en|fr|es|zh|de)\//.test(url.pathname) && url.pathname.endsWith("/"));
    // 2026-11-22: 비거주자 원천징수(*_withholding)는 6개국 공용 /en/ 페이지 하나로 보내요.
    const shared = /_withholding$|_court_fee$|^calculate_jp_overtime_cap_check$|^calculate_de_kleinunternehmer_vat$|^calculate_jp_childcare_leave_benefit$|^calculate_de_elterngeld$|_late_payment_b2b$|^calculate_(jp|uk|us|fr|es|de)_corporate_tax$/.test(name);
    if (shared) assert.ok(url.pathname.startsWith("/en/"), name);
    if (!shared && /_(jp)_/.test(name)) assert.ok(url.pathname.startsWith("/ja/"), name);
    if (!shared && /_(us)_/.test(name)) assert.ok(url.pathname.startsWith("/en/"), name);
    if (!shared && /_(fr)_/.test(name)) assert.ok(url.pathname.startsWith("/fr/"), name);
    if (!shared && /_(es)_/.test(name)) assert.ok(url.pathname.startsWith("/es/"), name);
    if (!shared && /_(cn|tw)_/.test(name)) assert.ok(url.pathname.startsWith("/zh/"), name);
    if (!shared && /_(uk)_/.test(name)) assert.ok(url.pathname.startsWith("/en/"), name);
    if (!shared && /_(de)_/.test(name)) assert.ok(url.pathname.startsWith("/de/"), name);
    if (!shared && /_(sg)_/.test(name)) assert.ok(url.pathname.startsWith("/en/"), name);
    assert.equal(url.searchParams.get("utm_source"), "mcp");
    assert.equal(url.searchParams.get("utm_medium"), "smithery");
    assert.equal(url.searchParams.get("utm_campaign"), "mcp-pilot");
    assert.equal(url.searchParams.get("utm_content"), name);
  }
});

test("MCP medium trusts only listed registry refs, then the client family", async () => {
  const req = (query, ua) => new Request(`https://api.oiyo.net/mcp${query}`, { method: "POST", headers: ua ? { "user-agent": ua } : {} });
  assert.equal(mcpMedium(req("?ref=glama", "Claude-User")), "glama");
  assert.equal(mcpMedium(req("?ref=<script>", "Claude-User")), "claude");
  assert.equal(mcpMedium(req("", "openai-mcp/1.0")), "chatgpt");
  assert.equal(mcpMedium(req("", "Cursor/2.1")), "cursor");
  assert.equal(mcpMedium(req("", "python-httpx/0.28")), "other");
  assert.equal(mcpMedium(req("", "")), "unknown");
  const call = await worker.fetch(new Request("https://api.oiyo.net/mcp?ref=cursor-directory", rpcRequest("tools/call", { name: "convert_units", arguments: { value: 1, from: "m", to: "cm" } })));
  const body = await call.json();
  assert.equal(new URL(body.result.structuredContent.sourcePage).searchParams.get("utm_medium"), "cursor-directory");
});

test("workers.dev host serves the same MCP tools and redirects everything else to api.oiyo.net", async () => {
  const init = { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", "User-Agent": "python-httpx/0.28.1" } };
  const list = await worker.fetch(new Request("https://api-oiyo.861106.workers.dev/mcp", { ...init, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "t", version: "1" } } }) }));
  assert.equal(list.status, 200);
  const tools = await worker.fetch(new Request("https://api-oiyo.861106.workers.dev/mcp", { ...init, headers: { ...init.headers, "MCP-Protocol-Version": "2025-06-18" }, body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }) }));
  assert.equal(tools.status, 200);
  const text = await tools.text();
  const payload = JSON.parse(text.startsWith("{") ? text : text.split("\n").find((l) => l.startsWith("data:")).slice(5));
  assert.equal(payload.result.tools.length, (await import("../src/modules/tools-spec.mjs")).TOOLS_SPEC.tools.length);
  const docs = await worker.fetch(new Request("https://api-oiyo.861106.workers.dev/docs?x=1"));
  assert.equal(docs.status, 301);
  assert.equal(docs.headers.get("Location"), "https://api.oiyo.net/docs?x=1");
  assert.equal((await worker.fetch(new Request("https://api-oiyo.861106.workers.dev/robots.txt"))).status, 301);
});

test("MCP Origin allowlist admits Glama health checks exactly, nothing broader", async () => {
  const init = (origin, host = "https://api-oiyo.861106.workers.dev") => new Request(`${host}/mcp`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", Origin: origin }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "glama", version: "1" } } }) });
  for (const host of ["https://api-oiyo.861106.workers.dev", "https://api.oiyo.net"]) {
    const ok = await worker.fetch(init("https://glama.ai", host));
    assert.equal(ok.status, 200);
    assert.equal(ok.headers.get("Access-Control-Allow-Origin"), "https://glama.ai");
  }
  for (const origin of ["https://evil.example", "https://www.glama.ai", "https://glama.ai.evil.example", "http://glama.ai", "https://x.glama.ai"]) {
    assert.equal((await worker.fetch(init(origin))).status, 403, origin);
  }
});

test("/mcp/ with a trailing slash is served as MCP on workers.dev and api.oiyo.net, never redirected", async () => {
  const headers = { "Content-Type": "application/json", Accept: "application/json, text/event-stream", "User-Agent": "node" };
  const initBody = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "glama", version: "1" } } });
  const listBody = JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
  const count = (await import("../src/modules/tools-spec.mjs")).TOOLS_SPEC.tools.length;
  for (const host of ["https://api-oiyo.861106.workers.dev", "https://api.oiyo.net"]) {
    const init = await worker.fetch(new Request(`${host}/mcp/`, { method: "POST", headers, body: initBody }));
    assert.equal(init.status, 200, host);
    assert.equal(init.headers.get("Location"), null);
    const list = await worker.fetch(new Request(`${host}/mcp/`, { method: "POST", headers: { ...headers, "MCP-Protocol-Version": "2025-06-18" }, body: listBody }));
    const text = await list.text();
    const payload = JSON.parse(text.startsWith("{") ? text : text.split("\n").find((l) => l.startsWith("data:")).slice(5));
    assert.equal(payload.result.tools.length, count);
    assert.equal((await worker.fetch(new Request(`${host}/mcp/`))).status, 405);
  }
  assert.equal((await worker.fetch(new Request("https://api-oiyo.861106.workers.dev/mcp/sse"))).status, 301, "non-MCP subpaths keep redirecting");
});

test("/.well-known/glama.json is served on both hosts and matches the repo glama.json", async () => {
  const { readFileSync } = await import("node:fs");
  const expected = JSON.parse(readFileSync(new URL("../glama.json", import.meta.url), "utf8"));
  for (const host of ["https://api-oiyo.861106.workers.dev", "https://api.oiyo.net"]) {
    const response = await worker.fetch(new Request(`${host}/.well-known/glama.json`));
    assert.equal(response.status, 200, host);
    assert.deepEqual(await response.json(), expected);
  }
});

test("/mcp/welfare serves only the welfare profile, with the same results as /mcp", async () => {
  const { MCP_PROFILES } = await import("../src/modules/mcp-profiles.mjs");
  const names = new Set(TOOLS_SPEC.tools.map(t => t.function.name));
  const profile = MCP_PROFILES.welfare.tools;
  assert.equal(new Set(profile).size, profile.length, "no duplicates");
  for (const name of profile) assert.ok(names.has(name), `${name} exists in TOOLS_SPEC`);
  const headers = { "Content-Type": "application/json", Accept: "application/json, text/event-stream", "User-Agent": "node", "MCP-Protocol-Version": "2025-06-18" };
  const parse = async (response) => { const text = await response.text(); return JSON.parse(text.startsWith("{") ? text : text.split("\n").find((l) => l.startsWith("data:")).slice(5)); };
  for (const host of ["https://api-oiyo.861106.workers.dev", "https://api.oiyo.net"]) {
    for (const path of ["/mcp/welfare", "/mcp/welfare/"]) {
      const init = await worker.fetch(new Request(`${host}${path}`, { method: "POST", headers, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "t", version: "1" } } }) }));
      assert.equal(init.status, 200, `${host}${path}`);
      assert.equal((await parse(init)).result.serverInfo.name, "oiyo-welfare");
      const list = await parse(await worker.fetch(new Request(`${host}${path}`, { method: "POST", headers, body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }) })));
      assert.deepEqual(list.result.tools.map(t => t.name).sort(), [...profile].sort());
    }
  }
  const call = (path, name) => worker.fetch(new Request(`https://api.oiyo.net${path}`, { method: "POST", headers, body: JSON.stringify({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name, arguments: fixtures[name] } }) }));
  const welfare = await parse(await call("/mcp/welfare", "calculate_kr_work_child_incentive"));
  const full = await parse(await call("/mcp", "calculate_kr_work_child_incentive"));
  assert.equal(welfare.result.isError, false);
  assert.deepEqual(welfare.result.structuredContent, full.result.structuredContent);
  const outside = await parse(await call("/mcp/welfare", "calculate_dcf_valuation"));
  assert.ok(outside.error || outside.result?.isError, "tools outside the profile are not callable");
});
