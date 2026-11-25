# Korea Salary, Tax & Holiday Calculators (OIYO)

Run **300+ deterministic calculators** from one Actor: South Korea payroll, labor, tax, welfare and calendar tools, plus take-home pay and tax tools for 11 other countries. There is no LLM inside. The same input always gives the same output, and every result links to the matching interactive calculator on [tools.oiyo.net](https://tools.oiyo.net/ko/).

## What you can calculate

| Area | Examples |
|---|---|
| Korea payroll | `calculate_net_salary` (4 major insurances + estimated income tax), `calculate_weekly_allowance` (주휴수당), `calculate_overtime_pay`, `calculate_annual_leave`, `get_kr_minimum_wage` |
| Korea leaving a job | `calculate_severance_pay` (퇴직금), `calculate_unemployment_benefits` (실업급여), `calculate_kr_dismissal_notice_pay` |
| Korea tax | `calculate_kr_year_end_settlement` (연말정산), `calculate_kr_freelancer_income_tax` (3.3%), `calculate_kr_acquisition_tax`, `calculate_kr_property_tax`, `calculate_capital_gains_tax`, `calculate_inheritance_gift_tax` |
| Korea calendar | `get_kr_holidays` (public + substitute holidays, solar terms), `check_kr_business_day` |
| Other countries | `calculate_jp_take_home`, `calculate_uk_take_home`, `calculate_us_take_home`, `calculate_ca_take_home`, `calculate_au_take_home`, `calculate_fr_take_home`, `calculate_es_take_home`, plus Germany, China, Taiwan and Singapore tools |

Run once with **List tools** on to get every tool name with its argument schema. That run is free.

## Input

One calculation:

```json
{ "tool": "calculate_net_salary", "arguments": { "salary": 3500000 } }
```

A batch of up to 50:

```json
{
  "calls": [
    { "tool": "get_kr_holidays", "arguments": { "year": 2027 } },
    { "tool": "check_kr_business_day", "arguments": { "date": "2027-02-08" } },
    { "tool": "calculate_jp_take_home", "arguments": { "annual": 6000000 } }
  ]
}
```

Amounts are in the country's own currency (KRW for Korea, JPY for Japan, and so on).

## Output

One dataset item per call:

```json
{
  "tool": "check_kr_business_day",
  "ok": true,
  "input": { "date": "2026-12-25" },
  "result": { "date": "2026-12-25", "is_business_day": false, "reason": "기독탄신일" },
  "sourcePage": "https://tools.oiyo.net/ko/business-day-checker/"
}
```

When the input is refused (unknown field, unsupported tax year, missing value), the item has `"ok": false` and an `error` message. Calculators refuse to guess: they reject inputs they do not support instead of returning a made-up number.

## Pricing

Pay per event: you pay only for each **successful calculation**. Refused inputs, errors and the tool catalog are free.

## Use it from an AI agent

Through the [Apify MCP server](https://mcp.apify.com), agents can call this Actor as a tool. If you prefer a direct connection, the same tools are on the free public MCP endpoint `https://api-oiyo.861106.workers.dev/mcp` (official MCP Registry name `io.github.yuli3/oiyo-calculations`).

## Limits and accuracy

- Results are estimates from published statutes and rates (2026 tax year unless the tool says otherwise). They are not tax, legal or payroll advice. Each Korean tax result includes the statute basis and what it does not cover.
- Korean income tax in `calculate_net_salary` is an annualized estimate, not the NTS withholding table.
- Inputs stay in your run's dataset. The calculation server does not store arguments.

Source: [github.com/yuli3/api-oiyo](https://github.com/yuli3/api-oiyo) · Interactive calculators: [tools.oiyo.net](https://tools.oiyo.net/ko/)
