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
