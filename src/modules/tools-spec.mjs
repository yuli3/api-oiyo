/**
 * OpenAPI & Agent Function Calling Tool Specification for api.oiyo.net
 * Standard tool schemas directly consumable by OpenAI, Anthropic, Gemini, and LangChain agents.
 */

export const TOOLS_SPEC = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  version: "1.2.0",
  service: "api.oiyo.net",
  description: "Deterministic B2A tool specifications for LLM agent function calling (OpenAI / Claude / Gemini / AutoGen compatible)",
  baseUrl: "https://api.oiyo.net",
  tools: [
    {
      type: "function",
      function: {
        name: "get_kr_holidays",
        description: "Get official South Korea public holidays, substitute holidays, and solar terms for a given year.",
        parameters: {
          type: "object",
          properties: {
            year: { type: "integer", description: "Calendar year (e.g. 2026)" },
          },
          required: ["year"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "check_kr_business_day",
        description: "Determines if a given date is a South Korea working business day or a public holiday/weekend.",
        parameters: {
          type: "object",
          properties: {
            date: { type: "string", description: "Date in YYYY-MM-DD format" },
          },
          required: ["date"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "calculate_saju_astrology",
        description: "Computes traditional Korean Sexagenary Cycle (60 Gapja) Four Pillars and Five Elements (오행) balance from birth datetime and solar/lunar calendar.",
        parameters: {
          type: "object",
          properties: {
            year: { type: "integer", description: "Birth year" },
            month: { type: "integer", description: "Birth month (1-12)" },
            day: { type: "integer", description: "Birth day (1-31)" },
            hour: { type: "integer", description: "Birth hour (0-23, optional)" },
            minute: { type: "integer", description: "Birth minute (0-59, optional)" },
            isLunar: { type: "boolean", description: "True if lunar calendar" },
            isLeapMonth: { type: "boolean", description: "True if lunar leap month" },
          },
          required: ["year", "month", "day"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "calculate_unemployment_benefits",
        description: "Simulates statutory South Korean unemployment benefits (실업급여) duration, daily benefit rate, and total expected payout.",
        parameters: {
          type: "object",
          properties: {
            wage: { type: "number", description: "Pre-tax average monthly wage before dismissal in KRW" },
            age: { type: "string", enum: ["under", "over"], description: "Whether age is under 50 ('under') or 50 and older / disabled ('over')" },
            period: { type: "string", enum: ["p1", "p3", "p5", "p10", "p10plus"], description: "Employment insurance contribution period bracket" },
            hours: { type: "number", description: "Daily contractual working hours (default 8)" },
          },
          required: ["wage", "age", "period"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "calculate_weekly_allowance",
        description: "Calculates statutory South Korean weekly holiday allowance (주휴수당) for part-time and hourly workers.",
        parameters: {
          type: "object",
          properties: {
            hourlyWage: { type: "number", description: "Hourly wage in KRW (minimum wage: 10,320 KRW)" },
            hours: { type: "number", description: "Contractual working hours per week (must be >= 15 for allowance)" },
            tax: { type: "string", enum: ["none", "income33", "fourMajor"], description: "Tax deduction option" },
          },
          required: ["hourlyWage", "hours"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "calculate_overtime_pay",
        description: "Calculates statutory overtime, night, and holiday allowances under Korean Labor Standards Act.",
        parameters: {
          type: "object",
          properties: {
            hourlyWage: { type: "number", description: "Base ordinary hourly wage in KRW" },
            overtimeHours: { type: "number", description: "Overtime hours exceeding 8h/day or 40h/week (1.5x)" },
            nightHours: { type: "number", description: "Night hours worked between 22:00 and 06:00 (additional 0.5x)" },
            holidayHours8orLess: { type: "number", description: "Holiday hours up to 8 hours (1.5x)" },
            holidayHoursOver8: { type: "number", description: "Holiday hours exceeding 8 hours (2.0x)" },
          },
          required: ["hourlyWage"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "calculate_net_salary",
        description: "Calculates net monthly take-home salary after 4 major social insurances and statutory income tax in South Korea.",
        parameters: {
          type: "object",
          properties: {
            salary: { type: "number", description: "Gross monthly or annual salary in KRW" },
            isAnnual: { type: "boolean", description: "True if salary parameter is annual base pay" },
            nonTaxable: { type: "number", description: "Monthly non-taxable amount (meal subsidy etc., default 200,000 KRW)" },
            dependents: { type: "integer", description: "Number of dependents including self (default 1)" },
          },
          required: ["salary"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "calculate_severance_pay",
        description: "Calculates statutory severance retirement pay (퇴직금) under Korea Labor Standards Act.",
        parameters: {
          type: "object",
          properties: {
            startDate: { type: "string", description: "Enlistment/joining date in YYYY-MM-DD" },
            endDate: { type: "string", description: "Resignation/leaving date in YYYY-MM-DD" },
            threeMonthSalary: { type: "number", description: "Total gross base salary received during last 3 months in KRW" },
            annualBonus: { type: "number", description: "Annual bonus paid during previous year in KRW" },
            annualLeaveAllowance: { type: "number", description: "Annual unused leave cash-out allowance in KRW" },
          },
          required: ["startDate", "endDate", "threeMonthSalary"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "calculate_annual_leave",
        description: "Calculates statutory annual paid leave days (연차 휴가) and unused leave cash-out allowance by years of service.",
        parameters: {
          type: "object",
          properties: {
            yearsOfService: { type: "number", description: "Continuous service duration in completed years" },
            hourlyWage: { type: "number", description: "Base ordinary hourly wage in KRW" },
            dailyHours: { type: "number", description: "Daily regular working hours (default 8)" },
            unusedDays: { type: "number", description: "Number of unused leave days to cash out" },
          },
          required: ["yearsOfService"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "calculate_military_service",
        description: "Calculates South Korea mandatory military service duration, completion rate, remaining days, and rank promotion dates.",
        parameters: {
          type: "object",
          properties: {
            enlistmentDate: { type: "string", description: "Enlistment date in YYYY-MM-DD" },
            branch: { type: "string", enum: ["army", "marines", "navy", "airforce", "public"], description: "Military branch (default army 18m)" },
            currentDate: { type: "string", description: "Reference evaluation date (default today)" },
          },
          required: ["enlistmentDate"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "calculate_gas_bill",
        description: "Calculates South Korea residential city gas invoice amount based on cubic meters used and heating/cooking tariff.",
        parameters: {
          type: "object",
          properties: {
            usageM3: { type: "number", description: "Gas meter volume in cubic meters (m³)" },
            type: { type: "string", enum: ["heating", "cooking"], description: "Usage tariff type (default heating)" },
            calorific: { type: "number", description: "Optional regional average calorific value in MJ/m³ (default 42.8)" },
          },
          required: ["usageM3"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "convert_units",
        description: "Universal deterministic unit conversion for area (pyeong ↔ m², sqft, ha), length, mass, and temperature.",
        parameters: {
          type: "object",
          properties: {
            value: { type: "number", description: "Numeric quantity to convert" },
            from: { type: "string", description: "Source unit (e.g. 'pyeong', 'm2', 'sqft', 'kg', 'lb', 'c', 'f')" },
            to: { type: "string", description: "Target unit (e.g. 'm2', 'pyeong', 'ft', 'inch', 'lb', 'f', 'c')" },
          },
          required: ["value", "from", "to"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "calculate_cagr",
        description: "Calculates Compound Annual Growth Rate (CAGR, 연평균 복합 성장률), total ROI, and Rule of 72 milestone.",
        parameters: {
          type: "object",
          properties: {
            initialValue: { type: "number", description: "Initial investment or starting asset amount" },
            finalValue: { type: "number", description: "Final asset value or future valuation" },
            years: { type: "number", description: "Investment or operational time horizon in years" },
          },
          required: ["initialValue", "finalValue", "years"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "calculate_compound_interest",
        description: "Simulates compound interest growth with initial principal, annual yield, recurring monthly contributions, and annual balance trajectory.",
        parameters: {
          type: "object",
          properties: {
            principal: { type: "number", description: "Initial lump sum principal investment amount in KRW or local currency" },
            rate: { type: "number", description: "Annual return / interest rate in percent (e.g. 7 for 7%)" },
            years: { type: "number", description: "Investment duration in years" },
            monthlyContribution: { type: "number", description: "Optional monthly recurring savings or investment amount" },
            compoundingFrequency: { type: "string", enum: ["monthly", "annually"], description: "Compounding cycle (default monthly)" },
          },
          required: ["principal", "rate", "years"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "calculate_health_insurance",
        description: "Calculates South Korea regional health insurance premiums and evaluates dependent (피부양자) eligibility under 2024-2026 statutory rules.",
        parameters: {
          type: "object",
          properties: {
            businessIncome: { type: "number", description: "Annual business income (사업소득금액) in KRW" },
            financialIncome: { type: "number", description: "Annual financial income (이자/배당소득) in KRW" },
            otherIncome: { type: "number", description: "Other annual income (근로/연금 등) in KRW" },
            propertyTaxBase: { type: "number", description: "Property tax base (재산세 과세표준) in KRW" },
            hasBusinessRegistration: { type: "boolean", description: "Whether registered as a business owner" },
          },
        },
      },
    },
    {
      type: "function",
      function: {
        name: "diagnose_hug_guarantee",
        description: "Diagnoses HUG Jeonse Deposit Return Guarantee eligibility (126% rule, 60% senior debt limit, 90% debt ratio limit) and calculates statutory guarantee fee.",
        parameters: {
          type: "object",
          properties: {
            officialPrice: { type: "number", description: "Publicly declared housing price (공시가격) in KRW" },
            jeonseDeposit: { type: "number", description: "Jeonse deposit amount (전세보증금) in KRW" },
            seniorDebt: { type: "number", description: "Senior lien / mortgage amount (선순위 채권액) in KRW" },
            propertyType: { type: "string", enum: ["apartment", "villa"], description: "Type of property" },
            discountType: { type: "string", enum: ["none", "youth", "newlywed", "multi-child"], description: "Statutory fee discount type" },
            termMonths: { type: "number", description: "Lease term in months (default 24)" },
          },
          required: ["officialPrice", "jeonseDeposit"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "calculate_capital_gains_tax",
        description: "Calculates South Korea Real Estate Capital Gains Tax with 1-home 1.2 billion KRW exemption, high-value house apportionment, and up to 80% special long-term holding deduction.",
        parameters: {
          type: "object",
          properties: {
            transferPrice: { type: "number", description: "Selling / transfer price in KRW" },
            acquisitionPrice: { type: "number", description: "Buying / acquisition price in KRW" },
            expenses: { type: "number", description: "Necessary capital expenses (brokerage, remodel, acquisition tax) in KRW" },
            houseType: { type: "string", enum: ["1home_exempt", "1home_non_exempt", "multi_general"], description: "Taxation category" },
            holdingYears: { type: "number", description: "Holding period in years" },
            residenceYears: { type: "number", description: "Actual residence period in years" },
          },
          required: ["transferPrice", "acquisitionPrice"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "compare_vat_tax",
        description: "Compares South Korea Value-Added Tax (VAT) between General Taxpayer (10% with full deduction/refund) and Simplified Taxpayer (15-40% value-added rate, 48M exemption, no refund).",
        parameters: {
          type: "object",
          properties: {
            revenue: { type: "number", description: "Annual gross revenue (공급대가, VAT-inclusive) in KRW" },
            purchase: { type: "number", description: "Annual gross purchases with tax invoices in KRW" },
            industryType: { type: "string", enum: ["food_retail", "manufacturing", "construction_logistics", "service", "real_estate_professional"], description: "Industry classification" },
          },
          required: ["revenue"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "calculate_inheritance_gift_tax",
        description: "Calculates South Korea 2026 statutory inheritance and gift tax, progressive tax brackets (10-50%), relationship deductions, and voluntary filing discount.",
        parameters: {
          type: "object",
          properties: {
            mode: { type: "string", enum: ["gift", "inheritance"], description: "Calculation mode" },
            assetValue: { type: "number", description: "Gross market value of assets in KRW" },
            debtValue: { type: "number", description: "Liabilities or debts assumed in KRW" },
            relationship: { type: "string", enum: ["spouse", "child_adult", "child_minor", "parent", "other_relative", "other"], description: "Beneficiary relationship" },
            hasSpouse: { type: "boolean", description: "Whether surviving spouse exists (inheritance mode only)" },
            isGenerationSkipping: { type: "boolean", description: "Generation skipping surcharge (30%)" },
            hasVoluntaryReporting: { type: "boolean", description: "3% voluntary filing tax credit" },
          },
          required: ["assetValue"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "calculate_loan_refinance",
        description: "Calculates loan refinancing savings, prepayment penalty fees with 3-year sliding taper, and break-even point in months.",
        parameters: {
          type: "object",
          properties: {
            loanBalance: { type: "number", description: "Remaining loan balance in KRW" },
            currentRate: { type: "number", description: "Existing loan annual interest rate in %" },
            newRate: { type: "number", description: "New loan annual interest rate in %" },
            penaltyRate: { type: "number", description: "Prepayment penalty rate in % (default 1.2)" },
            elapsedMonths: { type: "number", description: "Months elapsed since loan origination (0-36)" },
            incidentalCosts: { type: "number", description: "Incidental refinancing fees in KRW" },
          },
          required: ["loanBalance", "currentRate", "newRate"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "calculate_card_tax_deduction",
        description: "Calculates South Korea 2026 year-end card tax deduction, 25% threshold, credit (15%) vs check (30%) rates, and golden ratio strategy.",
        parameters: {
          type: "object",
          properties: {
            annualSalary: { type: "number", description: "Gross annual salary (비과세 제외) in KRW" },
            creditCardSpend: { type: "number", description: "Annual credit card spending in KRW" },
            checkCardSpend: { type: "number", description: "Annual check/debit card and cash receipt spending in KRW" },
            cultureSpend: { type: "number", description: "Book, performing arts, museum spending in KRW" },
            traditionalMarketSpend: { type: "number", description: "Traditional market and public transit spending in KRW" },
          },
          required: ["annualSalary"],
        },
      },
    },
  ],
};
