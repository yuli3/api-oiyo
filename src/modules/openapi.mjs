/**
 * OpenAPI 3.0 Specification for api.oiyo.net
 */

export const OPENAPI_SPEC = {
  openapi: "3.0.3",
  info: {
    title: "OIYO API (B2A Deterministic Engines)",
    version: "1.1.0",
    description: "High-performance, deterministic computational APIs for calendar, astrology, statutory labor, and unit conversions. Strictly non-interpretive and zero cost.",
  },
  servers: [
    { url: "https://api.oiyo.net", description: "Production Gateway" }
  ],
  paths: {
    "/health": {
      get: {
        summary: "Service Health Check",
        responses: {
          "200": {
            description: "Service is healthy",
            content: { "application/json": { schema: { type: "object", properties: { status: { type: "string" }, service: { type: "string" } } } } }
          }
        }
      }
    },
    "/v1/kr/calendar/holidays": {
      get: {
        summary: "South Korea Public Holidays",
        description: "Returns the implemented South Korea public and substitute holiday list for a given year. Solar terms are not returned.",
        parameters: [
          { name: "year", in: "query", required: false, schema: { type: "integer", default: 2026 }, description: "Calendar year (2024-2027)" }
        ],
        responses: {
          "200": {
            description: "List of public holidays",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    year: { type: "integer" },
                    count: { type: "integer" },
                    holidays: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          date: { type: "string", format: "date" },
                          name: { type: "string" },
                          isSubstitute: { type: "boolean" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/v1/kr/calendar/is-business-day": {
      get: {
        summary: "South Korea Business Day Checker",
        description: "Determines whether a specific date is a statutory business day or holiday in South Korea.",
        parameters: [
          { name: "date", in: "query", required: true, schema: { type: "string", format: "date" }, description: "Date in YYYY-MM-DD format" }
        ],
        responses: {
          "200": {
            description: "Business day evaluation result",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    date: { type: "string" },
                    isBusinessDay: { type: "boolean" },
                    dayOfWeek: { type: "string" },
                    holidayReason: { type: "string", nullable: true }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/v1/astrology/saju/calculate": {
      post: {
        summary: "Sexagenary Saju Deterministic Calculation",
        description: "Computes Four Pillars (Year, Month, Day, Hour sexagenary cycle) and Five Elements distribution without any subjective fortune-telling text.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["year", "month", "day"],
                properties: {
                  year: { type: "integer", example: 1990 },
                  month: { type: "integer", example: 5 },
                  day: { type: "integer", example: 15 },
                  hour: { type: "integer", example: 14 },
                  minute: { type: "integer", example: 30 }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Deterministic astrological components",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    pillars: {
                      type: "object",
                      properties: {
                        year: { type: "object" },
                        month: { type: "object" },
                        day: { type: "object" },
                        hour: { type: "object" }
                      }
                    },
                    fiveElementsDistribution: { type: "object" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/v1/labor/kr/unemployment-benefits": {
      get: {
        summary: "South Korea Unemployment Benefits Calculator",
        description: "Calculates statutory unemployment benefits under Employment Insurance Act with 2026 minimum wage floors and caps.",
        parameters: [
          { name: "wage", in: "query", required: false, schema: { type: "number", default: 3000000 }, description: "Pre-tax monthly wage in KRW" },
          { name: "age", in: "query", required: false, schema: { type: "string", enum: ["under", "over"], default: "under" }, description: "Age group: under 50 or over 50" },
          { name: "period", in: "query", required: false, schema: { type: "string", enum: ["p1", "p2", "p3", "p4", "p5"], default: "p3" }, description: "Tenure period code" },
          { name: "hours", in: "query", required: false, schema: { type: "integer", default: 8 }, description: "Daily contractual hours" }
        ],
        responses: {
          "200": {
            description: "Unemployment benefit calculation details",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    year: { type: "integer" },
                    dailyBenefit: { type: "number" },
                    scheduledDays: { type: "integer" },
                    totalBenefit: { type: "number" },
                    monthlyEquivalent: { type: "number" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/v1/labor/kr/weekly-allowance": {
      get: {
        summary: "South Korea Weekly Holiday Allowance Calculator",
        description: "South Korea only. A comparison estimate under a normal 40-hour/five-day schedule, not a legal eligibility determination. hours means four-week average contractual hours (actual employment period if shorter). isEligible is now nullable: omitted employment/attendance confirmations produce null and allowanceAssumesEligibility=true; existing monetary fields then show a conditional what-if scenario. Self-confirmation is not legal verification. Entered wages are preserved, including values below the 2026 minimum (warning only). Weekly components are floored to KRW, then monthly totals use 4.345 weeks and floor again; this is not actual payroll or the statutory 209-hour monthly minimum example. Other schedules may require a different allowance formula.",
        parameters: [
          { name: "hourlyWage", in: "query", required: false, schema: { type: "number", minimum: 0, maximum: Number.MAX_SAFE_INTEGER, default: 10320 }, description: "Entered hourly wage in KRW, never silently raised to the minimum; below 10,320 triggers a warning" },
          { name: "hours", in: "query", required: false, schema: { type: "number", minimum: 0, maximum: 168, default: 20 }, description: "Four-week average contractual hours, or actual employment period average if shorter; not extra hours actually worked. Hours over 40 omit overtime premiums in this comparison." },
          { name: "tax", in: "query", required: false, schema: { type: "string", enum: ["none", "freelance", "four"], default: "none" }, description: "Flat deduction scenario only; does not decide employee/self-employed status or actual insurance/tax liability" },
          { name: "employedWholeWeek", in: "query", required: false, schema: { type: "boolean" }, description: "Self-confirm seven-day employment relationship. No requirement to remain employed the following week. Omission remains unknown." },
          { name: "completedScheduledDays", in: "query", required: false, schema: { type: "boolean" }, description: "Self-confirm attendance on all obligated working days; a public holiday without a work obligation is not an absence. Omission remains unknown." }
        ],
        responses: {
          "200": {
            description: "Conditional weekly-holiday comparison and wage breakdown. Read eligibility/allowanceAssumesEligibility before interpreting monetary fields.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    isEligible: { type: "boolean", nullable: true, description: "null = conditions unknown; true = user self-confirmed conditions in this model, not a legal determination; false = threshold or a confirmed condition not met" },
                    isEstimate: { type: "boolean", enum: [true] },
                    hourlyWage: { type: "number", description: "Entered value, unchanged" },
                    statutoryMinimumWage: { type: "number" },
                    warnings: { type: "array", items: { type: "string" } },
                    allowanceAssumesEligibility: { type: "boolean" },
                    eligibility: { type: "object", properties: { status: { type: "string", enum: ["unknown", "self_confirmed", "conditions_not_met"] }, hoursThresholdMet: { type: "boolean" }, employedWholeWeek: { type: "boolean", nullable: true }, completedScheduledDays: { type: "boolean", nullable: true }, isLegalDetermination: { type: "boolean", enum: [false] }, basis: { type: "string" } } },
                    calculationModel: { type: "object", properties: { id: { type: "string" }, description: { type: "string" }, weeksPerMonth: { type: "number", enum: [4.345] }, roundingPolicy: { type: "string" }, allowanceHoursDisplayDecimals: { type: "integer" }, isStatutoryMonthlyMinimum: { type: "boolean", enum: [false] }, monthlyCaveat: { type: "string" }, deductionsCaveat: { type: "string" } } },
                    sources: { type: "array", items: { type: "string", format: "uri" } },
                    allowanceHours: { type: "number" },
                    weeklyAllowance: { type: "number" },
                    effectiveHourlyWage: { type: "number" },
                    grossMonthlyWage: { type: "number" },
                    netMonthlyWage: { type: "number" }
                  }
                }
              }
            }
          },
          "400": { description: "Invalid numeric value, blank input, unsupported deduction mode, or confirmation other than true/false" }
        }
      }
    },
    "/v1/labor/kr/net-salary": {
      get: {
        summary: "South Korea 2026 Net Salary & 4 Major Insurances",
        description: "Employee share of the 4 public insurances at 2026 statutory rates (pension 4.75%, health 3.595%, long-term care 13.14% of health, employment 0.9%; rates effective 2026-01-01). Income tax is an annualized ESTIMATE, not the NTS simplified withholding table (taxes.isEstimate=true).",
        parameters: [
          { name: "salary", in: "query", required: false, schema: { type: "number", default: 3500000 }, description: "Gross salary in KRW" },
          { name: "isAnnual", in: "query", required: false, schema: { type: "boolean", default: false }, description: "True if salary is annual, false if monthly" },
          { name: "nonTaxable", in: "query", required: false, schema: { type: "number", default: 200000 }, description: "Non-taxable monthly allowance (e.g. meals 200k)" },
          { name: "dependents", in: "query", required: false, schema: { type: "integer", default: 1 }, description: "Number of dependents including earner" },
          { name: "payMonth", in: "query", required: false, schema: { type: "string", pattern: "^\\d{4}-\\d{2}$", default: "2026-07" }, description: "Pay month (YYYY-MM). Selects pension base bounds: 2025-07~2026-06 400,000~6,370,000; 2026-07~2027-06 410,000~6,590,000" }
        ],
        responses: {
          "200": {
            description: "Detailed net pay and deduction breakdown",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    year: { type: "integer" },
                    grossMonthly: { type: "number" },
                    grossAnnual: { type: "number" },
                    nonTaxable: { type: "number" },
                    taxable: { type: "number" },
                    insurances: {
                      type: "object",
                      properties: {
                        nationalPension: { type: "number" },
                        healthInsurance: { type: "number" },
                        longTermCare: { type: "number" },
                        employmentInsurance: { type: "number" },
                        totalInsurance: { type: "number" }
                      }
                    },
                    taxes: {
                      type: "object",
                      properties: {
                        incomeTax: { type: "number" },
                        localTax: { type: "number" },
                        totalTax: { type: "number" }
                      }
                    },
                    totalDeductions: { type: "number" },
                    netPayMonthly: { type: "number" },
                    netPayAnnual: { type: "number" },
                    deductionRatePercentage: { type: "number" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/v1/labor/kr/severance-pay": {
      get: {
        summary: "South Korea Statutory Severance Pay Calculator",
        description: "Retirement-benefit simulation using actual preceding three calendar months. Weekly-hours eligibility and excluded wage periods are not assessed. Blank, nonfinite or negative numeric inputs are rejected.",
        parameters: [
          { name: "startDate", in: "query", required: true, schema: { type: "string", format: "date", default: "2023-01-01" }, description: "Start date (YYYY-MM-DD)" },
          { name: "endDate", in: "query", required: true, schema: { type: "string", format: "date", default: "2026-01-01" }, description: "First date no longer employed, after last workday (YYYY-MM-DD); excluded from service days" },
          { name: "threeMonthSalary", in: "query", required: false, schema: { type: "number", minimum: 0, maximum: Number.MAX_SAFE_INTEGER, default: 9000000 }, description: "Total salary for the last 3 months" },
          { name: "annualBonus", in: "query", required: false, schema: { type: "number", minimum: 0, maximum: Number.MAX_SAFE_INTEGER, default: 0 }, description: "Total annual bonus" },
          { name: "annualLeaveAllowance", in: "query", required: false, schema: { type: "number", minimum: 0, maximum: Number.MAX_SAFE_INTEGER, default: 0 }, description: "Unused annual leave allowance" },
          { name: "hourlyWage", in: "query", schema: { type: "number", minimum: 0, default: 10320 }, description: "Ordinary hourly wage; minimum-wage floor applied" },
          { name: "dailyHours", in: "query", schema: { type: "number", minimum: 0, exclusiveMinimum: true, maximum: 8, default: 8 }, description: "Daily contractual hours" }
        ],
        responses: {
          "200": {
            description: "Severance pay calculation and tenure days",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    serviceDays: { type: "integer" },
                    isEligible: { type: "boolean" },
                    dailyAverageWage: { type: "number" },
                    dailyOrdinaryWage: { type: "number" },
                    effectiveDailyWage: { type: "number" },
                    severancePay: { type: "number" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/v1/labor/kr/annual-leave": {
      get: {
        summary: "South Korea Statutory Annual Leave & Allowance Calculator",
        description: "Annual leave simulation. Workplace coverage, weekly-hours and attendance eligibility are not assessed. First-year accrual requires completedPerfectMonths. Unused days are supplied by the caller. Blank, nonfinite or negative numeric inputs are rejected.",
        parameters: [
          { name: "yearsOfService", in: "query", required: false, schema: { type: "number", minimum: 0, default: 1 }, description: "Completed years of service" },
          { name: "completedPerfectMonths", in: "query", required: false, schema: { type: "integer", minimum: 0, maximum: 11 }, description: "Required when yearsOfService is less than 1: actual completed perfect-attendance months, not the maximum first-year allowance" },
          { name: "hourlyWage", in: "query", required: false, schema: { type: "number", minimum: 0, maximum: Number.MAX_SAFE_INTEGER, default: 10320 }, description: "Ordinary hourly wage; minimum-wage floor applied" },
          { name: "dailyHours", in: "query", required: false, schema: { type: "number", minimum: 0, exclusiveMinimum: true, maximum: 8, default: 8 }, description: "Daily working hours" },
          { name: "unusedDays", in: "query", required: false, schema: { type: "number", minimum: 0, maximum: Number.MAX_SAFE_INTEGER, default: 0 }, description: "Remaining unused leave days, including fractional days" }
        ],
        responses: {
          "200": {
            description: "Statutory leave days and unused leave pay",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    yearsOfService: { type: "number" },
                    statutoryLeaveDays: { type: "integer" },
                    dailyOrdinaryWage: { type: "number" },
                    unusedDays: { type: "number" },
                    unusedLeaveAllowance: { type: "number" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/v1/math/units/convert": {
      get: {
        summary: "Universal Unit Converter",
        description: "Deterministic conversion between length, area, weight, and temperature units.",
        parameters: [
          { name: "value", in: "query", required: true, schema: { type: "number" }, description: "Numeric value to convert" },
          { name: "from", in: "query", required: true, schema: { type: "string" }, description: "Source unit (e.g. m2, pyeong, kg, lb, c, f)" },
          { name: "to", in: "query", required: true, schema: { type: "string" }, description: "Target unit (e.g. m2, pyeong, kg, lb, c, f)" }
        ],
        responses: {
          "200": {
            description: "Converted numeric result",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    type: { type: "string" },
                    inputValue: { type: "number" },
                    fromUnit: { type: "string" },
                    outputValue: { type: "number" },
                    toUnit: { type: "string" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/v1/labor/kr/overtime-pay": {
      get: {
        summary: "Overtime, Night, and Holiday Pay Calculator (연장·야간·휴일수당)",
        description: "Calculates statutory wage premiums under South Korea Labor Standards Act Art. 56.",
        parameters: [
          { name: "hourlyWage", in: "query", schema: { type: "integer", default: 10320 }, description: "Base hourly wage (KRW)" },
          { name: "overtimeHours", in: "query", schema: { type: "number", default: 0 }, description: "Overtime hours (1.5x)" },
          { name: "nightHours", in: "query", schema: { type: "number", default: 0 }, description: "Night hours between 22:00-06:00 (+0.5x)" },
          { name: "holidayHours8orLess", in: "query", schema: { type: "number", default: 0 }, description: "Holiday hours up to 8h (1.5x)" },
          { name: "holidayHoursOver8", in: "query", schema: { type: "number", default: 0 }, description: "Holiday hours exceeding 8h (2.0x)" }
        ],
        responses: {
          "200": {
            description: "Overtime pay breakdown",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    year: { type: "integer" },
                    baseHourlyWage: { type: "integer" },
                    totalExtraPay: { type: "integer" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/v1/military/kr/service-calculator": {
      get: {
        summary: "Military Service Progress and Milestones (군 복무일 및 진급 계산기)",
        description: "Calculates discharge date, days served, remaining days, progress %, and rank promotion dates under South Korea Military Service Act.",
        parameters: [
          { name: "enlistmentDate", in: "query", required: true, schema: { type: "string" }, description: "Enlistment date (YYYY-MM-DD)" },
          { name: "branch", in: "query", schema: { type: "string", enum: ["army", "marines", "navy", "airforce", "social"], default: "army" } },
          { name: "currentDate", in: "query", schema: { type: "string" }, description: "Reference date (YYYY-MM-DD, defaults to today)" }
        ],
        responses: {
          "200": {
            description: "Military service milestones and status",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    branch: { type: "string" },
                    serviceMonths: { type: "integer" },
                    enlistmentDate: { type: "string" },
                    dischargeDate: { type: "string" },
                    totalDays: { type: "integer" },
                    servedDays: { type: "integer" },
                    remainingDays: { type: "integer" },
                    progressPercent: { type: "number" },
                    currentRank: { type: "string" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/v1/energy/kr/gas-bill": {
      get: {
        summary: "City Gas Bill Calculator (도시가스 요금 계산기)",
        description: "Calculates residential city gas bills based on cubic meter meter usage, calorific MJ conversion, and KOGAS rates.",
        parameters: [
          { name: "usageM3", in: "query", schema: { type: "number", default: 50 }, description: "Gas meter volume in cubic meters (m³)" },
          { name: "type", in: "query", schema: { type: "string", enum: ["heating", "cooking"], default: "heating" }, description: "Usage type" },
          { name: "calorific", in: "query", schema: { type: "number" }, description: "Optional regional calorific value in MJ/m³" }
        ],
        responses: {
          "200": {
            description: "City gas bill breakdown",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    usageM3: { type: "number" },
                    energyConsumedMJ: { type: "number" },
                    supplyPrice: { type: "integer" },
                    vat: { type: "integer" },
                    totalBilled: { type: "integer" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/v1/finance/cagr": {
      get: {
        summary: "Compound Annual Growth Rate (CAGR 연평균 복합 성장률 계산기)",
        description: "Calculates CAGR, total return, multiplier, and Rule of 72 doubling years.",
        parameters: [
          { name: "initialValue", in: "query", required: true, schema: { type: "number" }, description: "Initial investment or base value (> 0)" },
          { name: "finalValue", in: "query", required: true, schema: { type: "number" }, description: "Final asset value (>= 0)" },
          { name: "years", in: "query", required: true, schema: { type: "number" }, description: "Investment duration in years (> 0)" }
        ],
        responses: {
          "200": {
            description: "CAGR metrics and yearly trajectory",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    initialValue: { type: "number" },
                    finalValue: { type: "number" },
                    years: { type: "number" },
                    cagr: { type: "number" },
                    cagrPercent: { type: "number" },
                    totalReturn: { type: "number" },
                    totalReturnPercent: { type: "number" },
                    multiplier: { type: "number" },
                    ruleOf72Years: { type: "number", nullable: true },
                    annualBreakdown: { type: "array" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/v1/finance/compound-interest": {
      get: {
        summary: "Compound Interest & Savings Simulator (복리 계산기)",
        description: "Simulates compound interest growth with optional monthly contributions and annual breakdown.",
        parameters: [
          { name: "principal", in: "query", schema: { type: "number", default: 10000000 }, description: "Initial principal amount" },
          { name: "rate", in: "query", schema: { type: "number", default: 7 }, description: "Annual return / interest rate in percent (%)" },
          { name: "years", in: "query", schema: { type: "number", default: 10 }, description: "Investment duration in years" },
          { name: "monthlyContribution", in: "query", schema: { type: "number", default: 0 }, description: "Recurring monthly deposit" },
          { name: "compoundingFrequency", in: "query", schema: { type: "string", enum: ["monthly", "annually"], default: "monthly" }, description: "Compounding cycle" }
        ],
        responses: {
          "200": {
            description: "Compound growth summary and year-by-year progression",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    principal: { type: "number" },
                    annualRatePercent: { type: "number" },
                    years: { type: "number" },
                    monthlyContribution: { type: "number" },
                    compoundingFrequency: { type: "string" },
                    finalBalance: { type: "integer" },
                    totalPrincipal: { type: "integer" },
                    totalInterest: { type: "integer" },
                    returnOnInvestmentPercent: { type: "number" },
                    ruleOf72Years: { type: "number", nullable: true },
                    annualBreakdown: { type: "array" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/v1/tax/inheritance-gift": {
      get: {
        summary: "Korea inheritance & gift tax estimate (2026 상속·증여세 추정)",
        description: "Statutory 5-bracket rates (10-50%) and deductions from the kr-rates-2026 SSOT, incl. 혼인·출산 증여공제 1억 and generation-skip surcharge (30%, minors over 2B KRW 40%). Excludes prior-gift aggregation and asset valuation; estimate only.",
        parameters: [
          { name: "mode", in: "query", schema: { type: "string", default: "gift", enum: ["gift", "inheritance"] }, description: "gift or inheritance" },
          { name: "assetValue", in: "query", schema: { type: "number", default: 500000000 }, description: "Gross asset value in KRW" },
          { name: "debtValue", in: "query", schema: { type: "number", default: 0 }, description: "Assumed debt (부담부증여) or estate debts in KRW" },
          { name: "relationship", in: "query", schema: { type: "string", default: "spouse" }, description: "Gift: recipient relationship to donor" },
          { name: "hasSpouse", in: "query", schema: { type: "boolean", default: true }, description: "Inheritance: surviving spouse exists" },
          { name: "spouseDeduction", in: "query", schema: { type: "number" }, description: "Inheritance: spouse deduction override (clamped 5억~30억)" },
          { name: "marriageBirthDeduction", in: "query", schema: { type: "number", default: 0 }, description: "Gift from lineal ascendant within 2 years of marriage/birth: amount up to 100000000, or true for the full 1억" },
          { name: "isGenerationSkipping", in: "query", schema: { type: "boolean", default: false }, description: "Gift/inheritance skips a generation" },
          { name: "isMinorRecipient", in: "query", schema: { type: "boolean" }, description: "Recipient is a minor (40% surcharge over 2B KRW)" },
          { name: "hasVoluntaryReporting", in: "query", schema: { type: "boolean", default: true }, description: "Apply 3% filing credit" }
        ],
        responses: {
          "200": {
            description: "Korea inheritance & gift tax estimate (2026 상속·증여세 추정)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    year: { type: "number" },
                    mode: { type: "string" },
                    assetValue: { type: "number" },
                    debtValue: { type: "number" },
                    netAssetValue: { type: "number" },
                    relationship: { type: "string" },
                    deductionAmount: { type: "number" },
                    statutoryMaxDeduction: { type: "number" },
                    marriageBirthDeductionApplied: { type: "number" },
                    taxableBase: { type: "number" },
                    bracketRatePercent: { type: "number" },
                    progressiveDeduction: { type: "number" },
                    calculatedTax: { type: "number" },
                    generationSkipSurchargeRatePercent: { type: "number" },
                    generationSkipSurcharge: { type: "number" },
                    voluntaryReportCredit: { type: "number" },
                    finalTax: { type: "number" },
                    effectiveRatePercent: { type: "number" },
                    notIncluded: { type: "array" }
                  }
                }
              }
            }
          },
          "400": { description: "Invalid input" }
        }
      },
      post: {
        summary: "Korea inheritance & gift tax estimate (2026 상속·증여세 추정)",
        description: "Same as GET; accepts the same fields as a JSON body.",
        requestBody: { content: { "application/json": { schema: { type: "object" } } } },
        responses: {
          "200": {
            description: "Korea inheritance & gift tax estimate (2026 상속·증여세 추정)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    year: { type: "number" },
                    mode: { type: "string" },
                    assetValue: { type: "number" },
                    debtValue: { type: "number" },
                    netAssetValue: { type: "number" },
                    relationship: { type: "string" },
                    deductionAmount: { type: "number" },
                    statutoryMaxDeduction: { type: "number" },
                    marriageBirthDeductionApplied: { type: "number" },
                    taxableBase: { type: "number" },
                    bracketRatePercent: { type: "number" },
                    progressiveDeduction: { type: "number" },
                    calculatedTax: { type: "number" },
                    generationSkipSurchargeRatePercent: { type: "number" },
                    generationSkipSurcharge: { type: "number" },
                    voluntaryReportCredit: { type: "number" },
                    finalTax: { type: "number" },
                    effectiveRatePercent: { type: "number" },
                    notIncluded: { type: "array" }
                  }
                }
              }
            }
          },
          "400": { description: "Invalid input" }
        }
      }
    },
    "/v1/finance/loan-refinance": {
      get: {
        summary: "Loan refinance break-even (대환대출 갈아타기 손익분기)",
        description: "Compares interest savings with the user-supplied prepayment penalty rate and incidental costs. The penalty rate is an input, not a bank-specific figure.",
        parameters: [
          { name: "loanBalance", in: "query", schema: { type: "number", default: 200000000 }, description: "Outstanding balance in KRW" },
          { name: "currentRate", in: "query", schema: { type: "number", default: 4.8 }, description: "Current annual rate (%)" },
          { name: "newRate", in: "query", schema: { type: "number", default: 3.9 }, description: "New annual rate (%)" },
          { name: "penaltyRate", in: "query", schema: { type: "number", default: 1.2 }, description: "Prepayment penalty rate (%) from your loan contract" },
          { name: "elapsedMonths", in: "query", schema: { type: "number", default: 12 }, description: "Months since the loan started" },
          { name: "incidentalCosts", in: "query", schema: { type: "number", default: 75000 }, description: "Stamp duty and other one-off costs in KRW" }
        ],
        responses: {
          "200": {
            description: "Loan refinance break-even (대환대출 갈아타기 손익분기)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    year: { type: "number" },
                    loanBalance: { type: "number" },
                    currentRatePercent: { type: "number" },
                    newRatePercent: { type: "number" },
                    rateDifferencePercent: { type: "number" },
                    monthlyInterestSavings: { type: "number" },
                    annualInterestSavings: { type: "number" },
                    prepaymentPenalty: { type: "number" },
                    incidentalCosts: { type: "number" },
                    totalSwitchingCost: { type: "number" },
                    elapsedMonths: { type: "number" },
                    breakEvenMonths: { type: "number" },
                    netSavings1Year: { type: "number" },
                    netSavings2Year: { type: "number" },
                    netSavings3Year: { type: "number" },
                    recommendation: { type: "string" },
                    verdict: { type: "string" }
                  }
                }
              }
            }
          },
          "400": { description: "Invalid input" }
        }
      }
    },
    "/v1/tax/card-deduction": {
      get: {
        summary: "Card income deduction estimate (2026 신용·체크카드 소득공제 추정)",
        description: "Year-end card deduction from the kr-rates-2026 SSOT: 25% threshold, category rates, salary-tier base limits raised by number of children, extra limits. Refund uses an approximate tax base; estimate only.",
        parameters: [
          { name: "annualSalary", in: "query", schema: { type: "number", default: 50000000 }, description: "Gross annual salary (총급여) in KRW" },
          { name: "creditCardSpend", in: "query", schema: { type: "number", default: 15000000 }, description: "Credit card spend" },
          { name: "checkCardSpend", in: "query", schema: { type: "number", default: 10000000 }, description: "Debit card and cash receipt spend" },
          { name: "cultureSpend", in: "query", schema: { type: "number", default: 1000000 }, description: "Books/performances/museums etc. (counted as credit over 70M salary)" },
          { name: "traditionalMarketSpend", in: "query", schema: { type: "number", default: 1200000 }, description: "Traditional market spend" },
          { name: "publicTransitSpend", in: "query", schema: { type: "number", default: 0 }, description: "Public transit spend" },
          { name: "children", in: "query", schema: { type: "integer", default: 0 }, description: "Number of children (raises base limit)" }
        ],
        responses: {
          "200": {
            description: "Card income deduction estimate (2026 신용·체크카드 소득공제 추정)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    year: { type: "number" },
                    annualSalary: { type: "number" },
                    threshold25Percent: { type: "number" },
                    totalSpend: { type: "number" },
                    cultureCountedAsCredit: { type: "boolean" },
                    thresholdMet: { type: "boolean" },
                    creditDeduction: { type: "number" },
                    checkDeduction: { type: "number" },
                    cultureDeduction: { type: "number" },
                    marketDeduction: { type: "number" },
                    transitDeduction: { type: "number" },
                    grossDeduction: { type: "number" },
                    children: { type: "number" },
                    baseLimit: { type: "number" },
                    extraLimit: { type: "number" },
                    actualBaseDeduction: { type: "number" },
                    actualExtraDeduction: { type: "number" },
                    totalDeduction: { type: "number" },
                    approxTaxBase: { type: "number" },
                    marginalRate: { type: "number" },
                    estimatedTaxRefund: { type: "number" },
                    isEstimate: { type: "boolean" },
                    excessSpend: { type: "number" },
                    marginalTaxRatePercent: { type: "number" },
                    goldenRuleRecommendation: { type: "string" },
                    notIncluded: { type: "array" }
                  }
                }
              }
            }
          },
          "400": { description: "Invalid input" }
        }
      }
    }
  }
};
