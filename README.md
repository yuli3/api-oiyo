# OIYO Korea Calculators — MCP server

Deterministic calculators for South Korea: payroll and net salary, minimum wage, weekly holiday allowance, overtime, severance, annual leave, unemployment benefits, health insurance, year-end tax settlement, freelancer 3.3% income tax, acquisition/property/capital-gains/inheritance-gift tax, public holidays and business days, saju (Four Pillars), unit conversion and more.

- **Remote MCP endpoint (Streamable HTTP):** `https://api.oiyo.net/mcp`
- **No sign-in, no API key.** Every tool is read-only.
- **No LLM inside.** Results are plain code, so the same input always gives the same output.
- REST + OpenAPI: <https://api.oiyo.net/docs> · [`openapi.json`](https://api.oiyo.net/openapi.json) · [`tools.json`](https://api.oiyo.net/tools.json) · [`llms.txt`](https://api.oiyo.net/llms.txt)
- Official MCP Registry name: `io.github.yuli3/oiyo-calculations`

Each successful result includes a `sourcePage` link to the matching interactive calculator on [tools.oiyo.net](https://tools.oiyo.net/ko/) (Korean), where people can adjust inputs and read the explanation.

## Connect

### Claude (claude.ai / Desktop)
Settings → Connectors → **Add custom connector** → URL `https://api.oiyo.net/mcp`.

### Claude Code
```bash
claude mcp add --transport http oiyo https://api.oiyo.net/mcp
```

### Cursor
Add to `.cursor/mcp.json` (or use the [`.mcp.json`](./.mcp.json) in this repo):
```json
{ "mcpServers": { "oiyo-calculations": { "url": "https://api.oiyo.net/mcp" } } }
```

### VS Code (GitHub Copilot agent mode)
`.vscode/mcp.json`:
```json
{ "servers": { "oiyo-calculations": { "type": "http", "url": "https://api.oiyo.net/mcp" } } }
```

### ChatGPT
With developer mode enabled: Settings → Apps & Connectors → **Create** → MCP server URL `https://api.oiyo.net/mcp`, authentication **None**.

### Grok (xAI API)
```json
{
  "model": "grok-4",
  "input": [{ "role": "user", "content": "What is the 2026 net monthly pay in Korea on a 3,500,000 KRW salary?" }],
  "tools": [{ "type": "mcp", "server_url": "https://api.oiyo.net/mcp", "server_label": "oiyo" }]
}
```

## Tools

| Tool | What it does |
|---|---|
| `get_kr_minimum_wage` | Verified Korean minimum wage by year, effective dates and 8/209-hour examples. Not a 2027 net-salary calculator; uncollected insurance is unavailable. |
| `get_kr_holidays` | Get official South Korea public holidays, substitute holidays, and solar terms for a given year. |
| `check_kr_business_day` | Determines if a given date is a South Korea working business day or a public holiday/weekend. |
| `calculate_saju_astrology` | Computes traditional Korean Sexagenary Cycle (60 Gapja) Four Pillars and Five Elements (오행) balance from birth datetime and solar/lunar calendar. |
| `calculate_unemployment_benefits` | Simulates statutory South Korean unemployment benefits (실업급여) duration, daily benefit rate, and total expected payout. |
| `calculate_weekly_allowance` | Calculates statutory South Korean weekly holiday allowance (주휴수당) for part-time and hourly workers. |
| `calculate_overtime_pay` | Calculates statutory overtime, night, and holiday allowances under Korean Labor Standards Act. |
| `calculate_net_salary` | Calculates net monthly take-home salary after the 4 major social insurances (2026 statutory rates) and an ESTIMATED income tax (annualized estimate, not the NTS withholding table) in South Korea. |
| `calculate_severance_pay` | South Korean statutory severance arithmetic. Unknown or mixed four-week hours return null eligibility and amount; all-period self-confirmation is required for an estimate. |
| `calculate_annual_leave` | Calculates statutory annual paid leave days (연차 휴가) and unused leave cash-out allowance by years of service. |
| `calculate_military_service` | Calculates South Korea mandatory military service duration, completion rate, remaining days, and rank promotion dates. |
| `calculate_gas_bill` | Calculates South Korea residential city gas invoice amount based on cubic meters used and heating/cooking tariff. |
| `convert_units` | Universal deterministic unit conversion for area (pyeong ↔ m², sqft, ha), length, mass, and temperature. |
| `calculate_cagr` | Calculates Compound Annual Growth Rate (CAGR, 연평균 복합 성장률), total ROI, and Rule of 72 milestone. |
| `calculate_compound_interest` | Simulates compound interest growth with initial principal, annual yield, recurring monthly contributions, and annual balance trajectory. |
| `calculate_health_insurance` | Calculates Korean regional insurance premiums and preliminary income/property flags only. dependentEligibility.isEligible is null: family support, spouse/sibling conditions, housing rental income and statutory exceptions require NHIS review. |
| `diagnose_hug_guarantee` | Diagnoses HUG Jeonse Deposit Return Guarantee eligibility (126% rule, 60% senior debt limit, 90% debt ratio limit) and calculates statutory guarantee fee. |
| `calculate_capital_gains_tax` | Calculates South Korea Real Estate Capital Gains Tax with 1-home 1.2 billion KRW exemption, high-value house apportionment, and up to 80% special long-term holding deduction. |
| `compare_vat_tax` | Compares South Korea Value-Added Tax (VAT) between General Taxpayer (10% with full deduction/refund) and Simplified Taxpayer (15-40% value-added rate, 48M exemption, no refund). |
| `calculate_inheritance_gift_tax` | Calculates South Korea 2026 statutory inheritance and gift tax, progressive tax brackets (10-50%), relationship deductions, and voluntary filing discount. |
| `calculate_loan_refinance` | Calculates loan refinancing savings, prepayment penalty fees with 3-year sliding taper, and break-even point in months. |
| `calculate_card_tax_deduction` | Calculates South Korea 2026 year-end card tax deduction, 25% threshold, credit (15%) vs check (30%) rates, and golden ratio strategy. |
| `calculate_kr_year_end_settlement` | South Korea 2026 귀속 year-end tax settlement (연말정산) for a resident wage earner: income deductions, card deduction, special deductions/credits vs the 130,000 KRW standard credit (picks the lower tax), refund or extra payment when withheld tax is given. Same formulas as tools.oiyo.net. Refuses unknown inputs and tax years other than 2026; returns statute basis and what is not covered. Estimate, not tax advice. |
| `calculate_kr_freelancer_income_tax` | South Korea freelancer (3.3% withholding, 사업소득) May comprehensive income tax estimate: simple expense rate 940909 (64.1%, 49.7% above 40M KRW) or a given expense ratio, compared with the tax already withheld to show refund or extra payment. Same formulas as tools.oiyo.net. Tax years 2025 and 2026 only; refuses unknown inputs. |
| `calculate_kr_acquisition_tax` | South Korea 2026 housing acquisition tax (주택 취득세) with local education tax and rural special tax: 1-3% standard rate (6-900M KRW sliding formula) or 8%/12% multi-home surcharge. Same formulas as tools.oiyo.net. Returns statute basis; does not judge house counts or first-home relief. |
| `calculate_kr_property_tax` | South Korea 2026 housing property tax (주택 재산세) from the official price: fair market value ratio (43-45% for one-home households, 60% otherwise), one-home special rate up to 900M KRW, urban area tax and local education tax. Same formulas as tools.oiyo.net. Excludes comprehensive real estate holding tax and the burden cap. |

## Limits and disclaimers

- Tax, payroll and labor results are **estimates, not tax or legal advice**. Tax routes return `basis` (the legal articles used), `notCovered` and a disclaimer, and refuse unknown inputs or unsupported tax years instead of guessing.
- Saju results are a calendar calculation for entertainment and self-reflection. They are not a prediction or a diagnosis.
- Rates follow the published 2026 Korean rules (2027 where officially announced, e.g. the minimum wage).

## Privacy

Inputs (salaries, birth dates and so on) are computed in memory and not stored by the application. Aggregate usage counts keep only the route, status class, country, a coarse client family and, for MCP, the listing or client name. No query strings, request bodies or IP addresses are recorded. Site privacy policy: <https://oiyo.net/ko/legal/privacy/>.

## Support

Open an issue in this repository. Made by [OIYO](https://oiyo.net).
