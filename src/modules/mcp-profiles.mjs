// Focused MCP endpoints (2026-11-20). One 93-tool server is hard to discover and hard for a model to pick
// from, and nobody had published a Korean welfare / benefits MCP (survey 2026-11-20). A profile is only a
// filter over TOOLS_SPEC: same schemas, same in-process REST dispatcher, no second formula.
// Each profile has its own MCP Registry entry (registry/<name>/server.json).
export const MCP_PROFILES = {
  welfare: {
    serverName: "oiyo-welfare",
    paths: ["/mcp/welfare", "/mcp/welfare/"],
    tools: [
      // Income support and tax credits
      "calculate_kr_work_child_incentive",
      "calculate_kr_monthly_rent_credit",
      "check_kr_dependent_deduction",
      // Jobs: unemployment, unpaid wages, injury, leave
      "calculate_unemployment_benefits",
      "check_kr_voluntary_quit_unemployment",
      "calculate_kr_wage_guarantee",
      "calculate_kr_injury_leave_pay",
      "calculate_kr_shutdown_allowance",
      "calculate_kr_dismissal_notice_pay",
      "calculate_severance_pay",
      "calculate_weekly_allowance",
      "calculate_overtime_pay",
      "calculate_annual_leave",
      "calculate_kr_ordinary_wage",
      "get_kr_minimum_wage",
      "check_kr_probation_minimum_wage",
      // Family: birth, childcare, care
      "calculate_kr_maternity_leave_pay",
      "calculate_kr_reduced_hours_childcare_pay",
      "calculate_kr_long_term_care_copay",
      "calculate_health_insurance",
      // Housing
      "check_kr_youth_rent_support",
      "find_kr_policy_housing_loans",
      "check_kr_special_supply",
      "diagnose_hug_guarantee",
    ],
  },
};

const PATH_TO_PROFILE = new Map(
  Object.entries(MCP_PROFILES).flatMap(([name, profile]) => profile.paths.map(path => [path, name])),
);

export const PROFILE_PATHS = new Set(PATH_TO_PROFILE.keys());

export function profileForPath(path) {
  return PATH_TO_PROFILE.get(path) || null;
}
