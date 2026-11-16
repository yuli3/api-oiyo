// 2026-11-12 MCP pilot #1 (세운 승인, company-brain mcp-distribution-brainstorm-2026-11-12.md):
// MCP answers had no link back to OIYO, so agent usage never returned a visit. Every successful
// tool result now names the human calculator page with UTM tags. Pages are Korean (/ko/) because
// the calculators are Korea-specific; all URLs were checked 200 on 2026-11-12.

const TOOLS = "https://tools.oiyo.net/ko/";

export const SOURCE_PAGES = Object.freeze({
  get_kr_minimum_wage: `${TOOLS}salary-calculator/`,
  get_kr_holidays: `${TOOLS}business-day-checker/`,
  check_kr_business_day: `${TOOLS}business-day-checker/`,
  calculate_saju_astrology: "https://oiyo.net/ko/saju/calculator/",
  calculate_unemployment_benefits: `${TOOLS}unemployment-benefits-calculator/`,
  calculate_weekly_allowance: `${TOOLS}weekly-holiday-pay-calculator/`,
  calculate_overtime_pay: `${TOOLS}overtime-pay-calculator/`,
  calculate_net_salary: `${TOOLS}salary-calculator/`,
  calculate_severance_pay: `${TOOLS}severance-calculator/`,
  calculate_annual_leave: `${TOOLS}annual-leave-calculator/`,
  calculate_military_service: `${TOOLS}military-service-calculator/`,
  calculate_gas_bill: `${TOOLS}gas-bill-calculator/`,
  convert_units: `${TOOLS}universal-converter/`,
  calculate_cagr: `${TOOLS}roi-calculator/`,
  calculate_compound_interest: `${TOOLS}compound-interest-calculator/`,
  calculate_health_insurance: `${TOOLS}health-insurance-calculator/`,
  diagnose_hug_guarantee: `${TOOLS}jeonse-guarantee-calculator/`,
  calculate_capital_gains_tax: `${TOOLS}capital-gains-tax-calculator/`,
  compare_vat_tax: `${TOOLS}vat-calculator/`,
  calculate_inheritance_gift_tax: `${TOOLS}inheritance-tax-calculator/`,
  calculate_loan_refinance: `${TOOLS}loan-calculator/`,
  calculate_card_tax_deduction: `${TOOLS}year-end-settlement-calculator/`,
  calculate_kr_year_end_settlement: `${TOOLS}year-end-settlement-calculator/`,
  calculate_kr_freelancer_income_tax: `${TOOLS}freelancer-tax-calculator/`,
  calculate_kr_acquisition_tax: `${TOOLS}acquisition-tax-calculator/`,
  calculate_kr_property_tax: `${TOOLS}property-tax-calculator/`,
  value_kr_unlisted_shares: `${TOOLS}unlisted-share-valuation-calculator/`,
  calculate_kr_family_business_deduction: `${TOOLS}family-business-inheritance-calculator/`,
  calculate_kr_incorporation_conversion: `${TOOLS}incorporation-conversion-calculator/`,
  calculate_dcf_valuation: `${TOOLS}dcf-valuation-calculator/`,
  evaluate_decision_tree: `${TOOLS}decision-tree-calculator/`,
  schedule_critical_path: `${TOOLS}project-timeline-planner/`,
  analyze_swot: `${TOOLS}swot-analysis/`,
  classify_bcg_portfolio: `${TOOLS}bcg-matrix/`,
  map_brand_positioning: `${TOOLS}positioning-map/`,
  calculate_unit_economics_runway: `${TOOLS}unit-economics-runway-calculator/`,
  rank_priorities: `${TOOLS}priority-decision-matrix/`,
  get_kr_business_tax_calendar: `${TOOLS}business-must-do-checklist/`,
  plan_campaign_supply: `${TOOLS}campaign-supply-planner/`,
  evaluate_influencer_deal: `${TOOLS}influencer-deal-calculator/`,
  plan_quality_recovery: `${TOOLS}quality-recovery-planner/`,
  compare_alternative_materials: `${TOOLS}alternative-material-review/`,
  check_big_order_capacity: `${TOOLS}big-order-capacity-check/`,
  analyze_market_test: `${TOOLS}market-test-calculator/`,
  check_sales_rebates: `${TOOLS}sales-rebate-checker/`,
  evaluate_acquisition: `${TOOLS}acquisition-integration-check/`,
  calculate_kr_work_child_incentive: `${TOOLS}work-child-incentive-calculator/`,
  calculate_kr_maternity_leave_pay: `${TOOLS}maternity-leave-pay-calculator/`,
  calculate_kr_wage_guarantee: `${TOOLS}unpaid-wage-guarantee-calculator/`,
  calculate_kr_injury_leave_pay: `${TOOLS}industrial-accident-leave-pay-calculator/`,
  calculate_kr_monthly_rent_credit: `${TOOLS}monthly-rent-tax-credit-calculator/`,
  compare_kr_retirement_pension: `${TOOLS}retirement-pension-db-dc-calculator/`,
  calculate_kr_ordinary_wage: `${TOOLS}ordinary-wage-calculator/`,
  check_kr_fixed_overtime_pay: `${TOOLS}fixed-overtime-pay-checker/`,
  calculate_kr_comprehensive_real_estate_tax: `${TOOLS}comprehensive-real-estate-tax-calculator/`,
  calculate_kr_housing_rental_income_tax: `${TOOLS}housing-rental-income-tax-calculator/`,
  calculate_kr_long_term_care_copay: `${TOOLS}long-term-care-copay-calculator/`,
  check_kr_dependent_deduction: `${TOOLS}dependent-deduction-checker/`,
  calculate_kr_stock_major_shareholder_tax: `${TOOLS}stock-major-shareholder-tax-calculator/`,
  calculate_kr_dismissal_notice_pay: `${TOOLS}dismissal-notice-pay-calculator/`,
  calculate_kr_shutdown_allowance: `${TOOLS}shutdown-allowance-calculator/`,
  calculate_kr_reduced_hours_childcare_pay: `${TOOLS}reduced-hours-childcare-pay-calculator/`,
  check_kr_probation_minimum_wage: `${TOOLS}probation-minimum-wage-checker/`,
  plan_kr_annual_leave_promotion: `${TOOLS}annual-leave-promotion-planner/`,
  check_kr_voluntary_quit_unemployment: `${TOOLS}voluntary-quit-unemployment-checker/`,
  check_kr_subcontract_direct_payment: `${TOOLS}subcontract-direct-payment-checker/`,
  check_kr_family_loan_interest: `${TOOLS}family-loan-interest-checker/`,
  check_kr_parent_house_free_use: `${TOOLS}parent-house-free-use-gift-checker/`,
  check_kr_family_low_price_sale: `${TOOLS}family-low-price-sale-checker/`,
  check_kr_commercial_rent_increase: `${TOOLS}commercial-rent-increase-checker/`,
  calculate_kr_sme_youth_tax_reduction: `${TOOLS}sme-youth-income-tax-reduction-calculator/`,
  calculate_kr_yellow_umbrella_deduction: `${TOOLS}yellow-umbrella-deduction-calculator/`,
  compare_kr_general_vs_simplified_vat: `${TOOLS}general-vs-simplified-vat-calculator/`,
  get_kr_professional_scope: `${TOOLS}law-guide/`,
  start_kr_law_intake: `${TOOLS}law-guide/`,
  search_kr_statutes: `${TOOLS}law-guide/`,
});

// Listings point at /mcp?ref=<registry>; only these values are trusted so the tag can't be abused.
const REGISTRY_REFS = new Set([
  "mcp-registry", "smithery", "glama", "cursor-directory", "pulsemcp", "mcp-so", "readme", "docs",
]);

// Otherwise guess the client from the User-Agent. Unknown agents collapse to "other".
const CLIENT_PATTERNS = [
  ["claude", /claude|anthropic/i],
  ["chatgpt", /openai|chatgpt/i],
  ["cursor", /cursor/i],
  ["grok", /grok|xai/i],
  ["vscode", /vscode|visual studio code/i],
  ["smithery", /smithery/i],
  ["glama", /glama/i],
];

export function mcpMedium(request) {
  const ref = new URL(request.url).searchParams.get("ref");
  if (ref && REGISTRY_REFS.has(ref)) return ref;
  const ua = request.headers.get("user-agent") || "";
  if (!ua) return "unknown";
  for (const [name, pattern] of CLIENT_PATTERNS) if (pattern.test(ua)) return name;
  return "other";
}

export function sourcePageUrl(toolName, medium) {
  const page = SOURCE_PAGES[toolName];
  if (!page) return null;
  const url = new URL(page);
  url.searchParams.set("utm_source", "mcp");
  url.searchParams.set("utm_medium", medium || "unknown");
  url.searchParams.set("utm_campaign", "mcp-pilot");
  url.searchParams.set("utm_content", toolName);
  return url.toString();
}
