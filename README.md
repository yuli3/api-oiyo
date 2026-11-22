# OIYO Korea Calculators — MCP server

Deterministic calculators for South Korea: payroll and net salary, minimum wage, weekly holiday allowance, overtime, severance, annual leave, unemployment benefits, health insurance, year-end tax settlement, freelancer 3.3% income tax, acquisition/property/capital-gains/inheritance-gift tax, public holidays and business days, saju (Four Pillars), unit conversion and more.

- **Remote MCP endpoint (Streamable HTTP):** `https://api-oiyo.861106.workers.dev/mcp`
  (`https://api.oiyo.net/mcp` serves the same tools, but its site-wide bot protection may challenge some datacenter clients)
- **No sign-in, no API key.** Every tool is read-only.
- **No LLM inside.** Results are plain code, so the same input always gives the same output.
- REST + OpenAPI: <https://api.oiyo.net/docs> · [`openapi.json`](https://api.oiyo.net/openapi.json) · [`tools.json`](https://api.oiyo.net/tools.json) · [`llms.txt`](https://api.oiyo.net/llms.txt)
- Official MCP Registry name: `io.github.yuli3/oiyo-calculations`
- **Welfare & benefits only:** `https://api-oiyo.861106.workers.dev/mcp/welfare` (Registry `io.github.yuli3/oiyo-welfare`) serves 24 of the tools for people checking money they are owed: 근로·자녀장려금, 실업급여(자발적 퇴사 포함), 체불 대지급금, 산재 휴업급여, 휴업수당, 해고예고수당, 퇴직금·주휴·연장·연차, 출산휴가·육아기 단축 급여, 장기요양 본인부담, 건강보험료, 청년월세 지원, 정책 주거대출, 청약 특별공급, 전세보증 진단, 월세 세액공제, 부양가족 공제. Same formulas and results as `/mcp`.
- **Outside Korea only:** `https://api-oiyo.861106.workers.dev/mcp/world` (Registry `io.github.yuli3/oiyo-world`) serves the 147 country tools for Japan, the UK, the US, France, Spain, Germany, China, Taiwan, Singapore and Canada: take-home pay, employer cost, income/corporate/inheritance tax, withholding, tax calendars and penalties, VAT/GST registration, notice periods and severance, tenancy deposits, cooling-off periods, limitation periods and small claims, court fees, parental pay, plus `start_world_law_intake`. Same formulas and results as `/mcp`.

Each successful result includes a `sourcePage` link to the matching interactive calculator on [tools.oiyo.net](https://tools.oiyo.net/ko/) (Korean), where people can adjust inputs and read the explanation.

## Connect

### Claude (claude.ai / Desktop)
Settings → Connectors → **Add custom connector** → URL `https://api-oiyo.861106.workers.dev/mcp`.

### Claude Code
```bash
claude mcp add --transport http oiyo https://api-oiyo.861106.workers.dev/mcp
```

### Cursor
Add to `.cursor/mcp.json` (or use the [`.mcp.json`](./.mcp.json) in this repo):
```json
{ "mcpServers": { "oiyo-calculations": { "url": "https://api-oiyo.861106.workers.dev/mcp" } } }
```

### VS Code (GitHub Copilot agent mode)
`.vscode/mcp.json`:
```json
{ "servers": { "oiyo-calculations": { "type": "http", "url": "https://api-oiyo.861106.workers.dev/mcp" } } }
```

### ChatGPT
With developer mode enabled: Settings → Apps & Connectors → **Create** → MCP server URL `https://api-oiyo.861106.workers.dev/mcp`, authentication **None**.

### Grok (xAI API)
```json
{
  "model": "grok-4",
  "input": [{ "role": "user", "content": "What is the 2026 net monthly pay in Korea on a 3,500,000 KRW salary?" }],
  "tools": [{ "type": "mcp", "server_url": "https://api-oiyo.861106.workers.dev/mcp", "server_label": "oiyo" }]
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
| `value_kr_unlisted_shares` | South Korea unlisted share valuation for inheritance/gift tax (상증법 보충적 평가): net income value 3 : net asset value 2 (2:3 for real-estate-heavy companies), 80% net asset floor, 20% largest-shareholder premium unless exempt. |
| `calculate_kr_family_business_deduction` | South Korea family business inheritance deduction (가업상속공제): 30/40/60B KRW caps by years operated, non-business asset exclusion, inheritance tax with vs without it. |
| `calculate_kr_incorporation_conversion` | South Korea sole proprietor → corporation conversion: minimum capital, capital gains tax deferred under 조특법 제32조, 50% acquisition tax relief through 2027. |
| `calculate_dcf_valuation` | DCF enterprise and equity value: FCFF forecast, Gordon terminal value, CAPM WACC builder, WACC × growth sensitivity table. |
| `evaluate_decision_tree` | Decision tree expected value from simple options or a full decision/chance/outcome tree: best path, outcome distribution, loss probability, breakeven success probability. |
| `schedule_critical_path` | Project schedule by CPM with PERT estimates: slack, critical path, duration, on-time probability for a deadline, calendar dates. |
| `analyze_swot` | SWOT stance (SO/ST/WO/WT) with TOWS strategy pairs, IFE/EFE weighted scores and the IE matrix cell. |
| `classify_bcg_portfolio` | BCG matrix: star / cash cow / question mark / dog from market growth and relative share, revenue mix and recommended moves. |
| `map_brand_positioning` | Positioning map: nearest competitor per brand, crowded brands, largest empty spot, distance to a customer ideal point. |
| `calculate_unit_economics_runway` | LTV, LTV/CAC grade, CAC payback; monthly cash runway, break-even month and default alive; break-even units. |
| `rank_priorities` | RICE ranking or a weighted decision matrix with the weight each criterion would need to flip the winner. |
| `plan_campaign_supply` | Campaign stockout week, shortage, fill rate and extra weekly production needed after the lead time. |
| `evaluate_influencer_deal` | Creator deal: orders, ROAS, contribution, break-even conversion, Korean 3.3% / 8.8% withholding or VAT, disclosure checklist. |
| `plan_quality_recovery` | Quality incident: recall scope costs and allocation of remaining stock by priority, penalty or pro rata. |
| `compare_alternative_materials` | Raw material switch: annual saving, test cost payback, weeks to approval, weighted score. |
| `check_big_order_capacity` | Big order vs existing commitments under capacity: decline / full / partial / overtime / optimal profit. |
| `analyze_market_test` | Sample size, A/B z-test with p-value, overseas entry payback and go/extend/stop. |
| `check_sales_rebates` | Sales rebates: tier amounts, related-party groups, overpayment holds, arm's-length range, VAT/corporate tax notes. |
| `evaluate_acquisition` | Acquisition: EPS accretion/dilution, payback, synergy needed, 100-day integration template. |
| `calculate_kr_work_child_incentive` | 근로장려금·자녀장려금 for the 2026 application: bands, asset cut, late filing, how to apply. |
| `calculate_kr_maternity_leave_pay` | Maternity leave (90/120/100 days) and spouse leave (20 days) pay split between employer and employment insurance with 2026 caps. |
| `calculate_kr_wage_guarantee` | Unpaid-wage guarantee (대지급금): simple retired/employed, insolvency with age caps and the 2026-08-20 six-month expansion. |
| `calculate_kr_injury_leave_pay` | Industrial accident leave pay: 70%, minimum-wage guarantee, 2026 maximum base, 3-day rule. |
| `calculate_kr_monthly_rent_credit` | Monthly rent tax credit 17%/15% up to 10M KRW plus local income tax. |
| `compare_kr_retirement_pension` | Retirement pension DB vs DC with yearly series and break-even return. |
| `calculate_kr_ordinary_wage` | Ordinary wage (통상임금) hourly rate and overtime premiums before/after the 2024-12-19 Supreme Court ruling. |
| `check_kr_fixed_overtime_pay` | Fixed overtime allowance (포괄임금) shortfall against statutory premiums, up to 36 months. |
| `calculate_kr_comprehensive_real_estate_tax` | Comprehensive real estate holding tax on housing (종부세) with overlap and one-house credits. |
| `calculate_kr_long_term_care_copay` | Long-term care insurance copay (노인장기요양) by grade, home vs facility, 2026 limits. |
| `check_kr_dependent_deduction` | Year-end dependent deduction (부양가족) check by age, income and living together, with tax saved per person. |
| `calculate_kr_stock_major_shareholder_tax` | Listed stock major shareholder test (5B KRW or stake at previous year-end) and capital gains tax 20%/25%/30%. |
| `calculate_kr_dismissal_notice_pay` | Dismissal notice pay (해고예고수당): 30 days of ordinary wage without 30 days' notice, with the 제26조 exceptions. |
| `calculate_kr_shutdown_allowance` | Shutdown allowance (휴업수당): 70% of average wage, ordinary-wage alternative, partial-work deduction, 5+ employees. |
| `calculate_kr_reduced_hours_childcare_pay` | Reduced hours for childcare benefit 2026: first 10 h at 100% (cap 2.5M), rest 80% (cap 1.6M). |
| `check_kr_probation_minimum_wage` | Probation minimum wage: 90% (9,288 KRW) only for 1-year+ contracts, first 3 months, non-manual jobs. |
| `plan_kr_annual_leave_promotion` | Annual leave use promotion (연차 사용촉진) schedule under 근로기준법 제61조. |
| `check_kr_voluntary_quit_unemployment` | Justified reasons for voluntary resignation (별표 2) and 180 insured days for unemployment benefit. |
| `check_kr_subcontract_direct_payment` | Subcontract direct payment grounds (하도급법 제14조), payable range and 15.5% late interest. |
| `check_kr_family_loan_interest` | Family loan gift test: 4.6% statutory interest vs agreed rate, 10M KRW a year threshold, safe rate. |
| `check_kr_parent_house_free_use` | Rent-free use of a family home: value × 2% × 5-year PV ≥ 100M is a gift; free collateral too. |
| `check_kr_family_low_price_sale` | Below-market family sale: buyer gift (30%/300M) and seller capital gains at market value (5%/300M). |
| `calculate_kr_sme_youth_tax_reduction` | SME young-employee income tax reduction (조특법 제30조): 90%, 2M a year cap, end month. |
| `calculate_kr_yellow_umbrella_deduction` | 노란우산공제 income deduction limits (6M/5M/4M/2M) and tax saved. |
| `compare_kr_general_vs_simplified_vat` | General vs simplified VAT taxpayer: annual VAT by sector rate, exemption, refunds, invoice duty. |
| `calculate_kr_business_car_expense` | Business car expense limits: 15M KRW without a logbook, 8M depreciation cap with carry-over, lease/rent. |
| `compare_kr_overseas_stock_vs_etf_tax` | Overseas stocks direct (22% after 2.5M) vs domestic overseas ETF (15.4%, comprehensive above 20M) vs ISA. |
| `check_kr_officetel_house_count` | Officetel house count for acquisition tax, surcharge/종부세, one-house exemption and subscription; small new-build rule. |
| `compare_kr_ticket_vs_presale_tax` | Redevelopment member right (입주권) vs pre-sale right (분양권) capital gains tax. |
| `compare_kr_inherited_house_valuation` | Inherited house: official price vs appraisal, inheritance tax + later capital gains tax. |
| `plan_kr_inheritance_gift_filing_deadline` | Inheritance (6 months) / gift (3 months) filing deadlines, related dates and late penalties. |
| `check_kr_youth_rent_support` | Youth monthly rent support (200k × 24 months): age, income, assets, deposit and rent checks. |
| `check_kr_special_supply` | Housing subscription special supply eligibility and tier (newlywed, newborn, first-time, multi-child, elderly parent). |
| `find_kr_policy_housing_loans` | Housing and Urban Fund loans (디딤돌, 버팀목, 신생아 특례, 주택드림, 월세대출): eligibility, max loan, rate range. |
| `check_kr_commercial_rent_increase` | Commercial lease 5% rent increase cap, regional converted-deposit limits, 1-year rule, conversion rate. |
| `start_kr_law_intake` | Clarify-first intake for Korean tax/accounting/labor/administrative/court problems: next questions, deadlines (D-day), statutes, free help, when to see a licensed professional. |
| `search_kr_statutes` | Search ~80 everyday Korean statute articles with plain-Korean summaries and law.go.kr links. |
| `get_kr_professional_scope` | Legal scope and title rules of 세무사·공인회계사·공인노무사·행정사·법무사, with a who-can-do-what matrix. |
| `calculate_kr_housing_rental_income_tax` | Housing rental income tax: deemed rent, separate 14% vs comprehensive. |
| `get_kr_business_tax_calendar` | South Korea business filing calendar (VAT, corporate/income tax, withholding, payment statements) with holiday-shifted due dates, plus must-do / must-not-do checklists by stage or role. |

## Limits and disclaimers

- Tax, payroll and labor results are **estimates, not tax or legal advice**. Tax routes return `basis` (the legal articles used), `notCovered` and a disclaimer, and refuse unknown inputs or unsupported tax years instead of guessing.
- Saju results are a calendar calculation for entertainment and self-reflection. They are not a prediction or a diagnosis.
- Rates follow the published 2026 Korean rules (2027 where officially announced, e.g. the minimum wage).

## Privacy

Inputs (salaries, birth dates and so on) are computed in memory and not stored by the application. Aggregate usage counts keep only the route, status class, country, a coarse client family and, for MCP, the listing or client name. No query strings, request bodies or IP addresses are recorded. Site privacy policy: <https://oiyo.net/ko/legal/privacy/>.

## Support

Open an issue in this repository. Made by [OIYO](https://oiyo.net).
