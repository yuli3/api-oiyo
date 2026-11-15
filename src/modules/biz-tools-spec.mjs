// Business strategy tool schemas (2026-11-15), spread into TOOLS_SPEC.tools by tools-spec.mjs.
// WHY: founders, management teams, bookkeepers and tax advisers asked for decision trees, timelines,
// SWOT/BCG/positioning, unit economics and the Korean filing calendar as agent tools. These schemas are
// the single source for MCP input validation (mcp.mjs), REST validation (biz-strategy.mjs) and OpenAPI.

const str = (description, maxLength = 120) => ({ type: "string", maxLength, description });
const num = (description, minimum, maximum) => ({ type: "number", description, ...(minimum !== undefined && { minimum }), ...(maximum !== undefined && { maximum }) });
const obj = (properties, required) => ({ type: "object", properties, required });
const list = (items, maxItems, description, minItems) => ({ type: "array", items, maxItems, description, ...(minItems !== undefined && { minItems }) });
const fn = (name, description, properties, required = []) => ({ type: "function", function: { name, description, parameters: { type: "object", properties, required } } });

export const BIZ_TOOLS = [
  fn("evaluate_decision_tree",
    "Decision tree expected value with rollback: give simple options (success probability, payoff if success / fail, upfront cost) or a full tree of decision / chance / outcome nodes. Returns the best path, expected value, outcome distribution, worst/best case, probability of loss, and for options the success probability at which the best choice would flip. Same engine as tools.oiyo.net.",
    {
      question: str("The decision being made, e.g. '신규 매장을 열까?'"),
      options: list(obj({
        label: str("Option name"),
        successProb: num("Probability the option succeeds, 0..1 (1 = certain)", 0, 1),
        ifSuccess: num("Payoff if it succeeds (any currency, before cost)"),
        ifFail: num("Payoff if it fails"),
        cost: num("Upfront cost of choosing it, subtracted from both payoffs", 0),
      }, ["label", "successProb", "ifSuccess", "ifFail"]), 8, "2-8 simple options. Give options or tree, not both.", 1),
      tree: { type: "object", description: "Full tree instead of options. Node: {label, kind: 'decision'|'chance'|'outcome', value (outcome only), branches: [{label, prob (chance branches, 0..1), cost, node}]}. Max 12 levels and 200 nodes." },
    }),
  fn("schedule_critical_path",
    "Project schedule by critical path method (CPM) with PERT three-point estimates: earliest/latest start and finish, slack and critical tasks, project duration, standard deviation and the probability of finishing by a deadline. Optional start date converts days to calendar dates (weekends skipped when workdaysOnly). Refuses unknown dependency ids and cycles. Same engine as tools.oiyo.net.",
    {
      tasks: list(obj({
        id: str("Unique task id", 40),
        name: str("Task name"),
        duration: num("Most likely duration in days (0 = milestone)", 0, 3650),
        deps: list(str("Predecessor task id", 40), 20, "Ids of tasks that must finish first"),
        optimistic: num("Optimistic duration in days (PERT)", 0, 3650),
        pessimistic: num("Pessimistic duration in days (PERT)", 0, 3650),
        progress: num("Share done, 0..1", 0, 1),
        owner: str("Owner", 60),
      }, ["id", "name", "duration"]), 80, "1-80 tasks", 1),
      deadline: num("Deadline in days from the start, for the on-time probability", 0, 36500),
      startDate: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$", description: "Project start date YYYY-MM-DD" },
      workdaysOnly: { type: "boolean", description: "Count only Monday-Friday when converting to dates" },
    }, ["tasks"]),
  fn("analyze_swot",
    "SWOT analysis with TOWS strategy pairs and the internal/external factor evaluation (IFE/EFE) and IE matrix: impact 1-5 decides the stance (SO attack, ST diversify, WO turnaround, WT defend); weight and rating 1-4 give IFE/EFE totals (2.5 is average) and the grow / hold / harvest cell. Same engine as tools.oiyo.net.",
    {
      items: list(obj({
        kind: { type: "string", enum: ["S", "W", "O", "T"], description: "S strength, W weakness, O opportunity, T threat" },
        text: str("The factor", 200),
        impact: num("How big it is, 1..5 (default 3)", 1, 5),
        weight: num("IFE/EFE weight, 0..1 (normalised within S+W and O+T)", 0, 1),
        rating: num("IFE/EFE rating 1..4 (default 2.5)", 1, 4),
      }, ["kind", "text"]), 40, "1-40 factors", 1),
    }, ["items"]),
  fn("classify_bcg_portfolio",
    "BCG growth-share matrix: classifies each business unit as star, cash cow, question mark or dog from market growth and relative market share (our share ÷ largest rival's share; if we lead, ÷ the runner-up), with revenue mix by quadrant, the recommended move and portfolio warnings. Ratios are decimals. Same engine as tools.oiyo.net.",
    {
      units: list(obj({
        name: str("Business unit or product"),
        revenue: num("Revenue (bubble size)", 0),
        marketGrowth: num("Annual market growth, e.g. 0.12", -1, 10),
        share: num("Our market share, 0..1", 0, 1),
        rivalShare: num("Largest competitor's share (runner-up's if we lead), 0..1", 0, 1),
      }, ["name", "revenue", "marketGrowth", "share", "rivalShare"]), 20, "1-20 units", 1),
      growthThreshold: num("High-growth line, default 0.1", -1, 1),
      shareThreshold: num("Relative share line, default 1.0", 0.01, 10),
    }, ["units"]),
  fn("map_brand_positioning",
    "Marketing positioning map on two axes (-10..10 each): nearest competitor and distance for every brand, brands crowded together, and the largest empty spot on the map (optionally pulled toward a customer ideal point). Same engine as tools.oiyo.net.",
    {
      brands: list(obj({
        name: str("Brand"),
        x: num("Horizontal axis position, -10..10", -10, 10),
        y: num("Vertical axis position, -10..10", -10, 10),
        ours: { type: "boolean", description: "Our brand" },
      }, ["name", "x", "y"]), 12, "2-12 brands", 2),
      idealX: num("Customer ideal point, horizontal", -10, 10),
      idealY: num("Customer ideal point, vertical", -10, 10),
    }, ["brands"]),
  fn("calculate_unit_economics_runway",
    "Startup and small business economics in one call; give any complete group. Unit economics (arpu, grossMargin, monthlyChurn, cac): LTV, LTV/CAC grade, CAC payback months. Runway (cash, revenue, expenses, monthly growth rates): month-by-month cash, the month cash runs out, break-even month and whether the company is default alive. Break-even (fixedCost, price, variableCost): units and revenue. Same engine as tools.oiyo.net.",
    {
      arpu: num("Monthly revenue per customer", 0),
      grossMargin: num("Gross margin, 0..1", 0, 1),
      monthlyChurn: num("Monthly churn, 0..1", 0, 1),
      cac: num("Customer acquisition cost", 0),
      discountRate: num("Annual discount rate for LTV, default 0", 0, 1),
      cash: num("Cash in the bank now"),
      revenue: num("Monthly revenue now", 0),
      revenueGrowth: num("Monthly revenue growth, e.g. 0.05", -1, 1),
      expenses: num("Monthly expenses now, including cost of sales", 0),
      expenseGrowth: num("Monthly expense growth", -1, 1),
      months: { type: "integer", minimum: 1, maximum: 120, description: "Months to project, default 36" },
      fixedCost: num("Fixed cost for the break-even period", 0),
      price: num("Unit price", 0),
      variableCost: num("Variable cost per unit", 0),
    }),
  fn("rank_priorities",
    "Prioritise work or choose between options. method 'rice': Reach × Impact × Confidence ÷ Effort ranking. method 'weighted': weighted decision matrix (scores per criterion, weights normalised) with the weight each criterion would need to flip first and second place. Same engine as tools.oiyo.net.",
    {
      method: { type: "string", enum: ["rice", "weighted"], description: "rice or weighted" },
      items: list(obj({
        name: str("Item"),
        reach: num("People or events affected in the period", 0),
        impact: num("Impact: 0.25 tiny, 0.5 low, 1 medium, 2 high, 3 massive", 0, 10),
        confidence: num("Confidence, 0..1", 0, 1),
        effort: num("Effort in person-months (> 0)", 0.01),
      }, ["name", "reach", "impact", "confidence", "effort"]), 50, "RICE items (method rice)"),
      criteria: list(obj({ name: str("Criterion"), weight: num("Weight (normalised to sum 1)", 0) }, ["name", "weight"]), 12, "Criteria (method weighted)"),
      options: list(obj({
        name: str("Option"),
        scores: list({ type: "number", minimum: 0, maximum: 100 }, 12, "One score per criterion, same order (e.g. 1-5)"),
      }, ["name", "scores"]), 20, "Options (method weighted)"),
    }, ["method"]),
  fn("get_kr_business_tax_calendar",
    "South Korea business filing calendar for one year (부가세·법인세·종합소득세·원천세·지급명세서·고용산재 보수총액): statutory date and the actual due date moved past weekends and public holidays (국세기본법 제5조), with the statute for each. Optional stage or role adds the must-do / must-not-do checklist for founders, management teams, bookkeepers and tax advisers. December fiscal year-end; estimate, not tax advice.",
    {
      year: { type: "integer", minimum: 2025, maximum: 2030, description: "Calendar year" },
      entity: { type: "string", enum: ["corp", "indiv"], description: "corp (법인) or indiv (개인사업자)" },
      vat: { type: "string", enum: ["general", "simple", "exempt"], description: "VAT type: general (일반), simple (간이), exempt (면세)" },
      employer: { type: "boolean", description: "Pays employees or freelancers (withholding obligations)" },
      halfYearWithholding: { type: "boolean", description: "Approved for half-yearly withholding tax filing" },
      sincere: { type: "boolean", description: "Subject to 성실신고확인" },
      from: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$", description: "Also list the next 5 deadlines on or after this date (YYYY-MM-DD)" },
      stage: { type: "string", enum: ["start", "firstSale", "hire", "corp", "invest", "closing", "grow"], description: "Add the checklist for this stage" },
      role: { type: "string", enum: ["ceo", "team", "bookkeeper", "advisor"], description: "Add the checklist for this role" },
    }, ["year", "entity", "vat", "employer"]),
];

export const BIZ_ENDPOINTS = {
  evaluate_decision_tree: { path: "/v1/biz/decision-tree", method: "POST" },
  schedule_critical_path: { path: "/v1/biz/critical-path", method: "POST" },
  analyze_swot: { path: "/v1/biz/swot", method: "POST" },
  classify_bcg_portfolio: { path: "/v1/biz/bcg", method: "POST" },
  map_brand_positioning: { path: "/v1/biz/positioning-map", method: "POST" },
  calculate_unit_economics_runway: { path: "/v1/biz/unit-economics-runway", method: "POST" },
  rank_priorities: { path: "/v1/biz/priorities", method: "POST" },
  get_kr_business_tax_calendar: { path: "/v1/tax/kr/business-calendar" },
};
