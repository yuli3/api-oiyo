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
        description: "Returns official South Korea public holidays, substitute holidays, and solar terms for a given year.",
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
        description: "Calculates statutory weekly holiday allowance under Labor Standards Act Art. 55.",
        parameters: [
          { name: "hourlyWage", in: "query", required: false, schema: { type: "number", default: 10030 }, description: "Hourly wage in KRW (min 10,030)" },
          { name: "hours", in: "query", required: false, schema: { type: "number", default: 20 }, description: "Weekly contractual working hours" },
          { name: "tax", in: "query", required: false, schema: { type: "string", enum: ["none", "freelance", "four"], default: "none" }, description: "Tax deduction mode" }
        ],
        responses: {
          "200": {
            description: "Weekly holiday allowance and wage breakdown",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    isEligible: { type: "boolean" },
                    allowanceHours: { type: "number" },
                    weeklyAllowance: { type: "number" },
                    effectiveHourlyWage: { type: "number" },
                    grossMonthlyWage: { type: "number" },
                    netMonthlyWage: { type: "number" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/v1/labor/kr/net-salary": {
      get: {
        summary: "South Korea 2026 Net Salary & 4 Major Insurances",
        description: "Calculates statutory 4 major public insurances (national pension, health, care, employment) and progressive income tax to compute take-home pay.",
        parameters: [
          { name: "salary", in: "query", required: false, schema: { type: "number", default: 3500000 }, description: "Gross salary in KRW" },
          { name: "isAnnual", in: "query", required: false, schema: { type: "boolean", default: false }, description: "True if salary is annual, false if monthly" },
          { name: "nonTaxable", in: "query", required: false, schema: { type: "number", default: 200000 }, description: "Non-taxable monthly allowance (e.g. meals 200k)" },
          { name: "dependents", in: "query", required: false, schema: { type: "integer", default: 1 }, description: "Number of dependents including earner" }
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
        description: "Calculates legal retirement benefits under Act on the Guarantee of Employees' Retirement Benefits Art. 8.",
        parameters: [
          { name: "startDate", in: "query", required: true, schema: { type: "string", format: "date", default: "2023-01-01" }, description: "Start date (YYYY-MM-DD)" },
          { name: "endDate", in: "query", required: true, schema: { type: "string", format: "date", default: "2026-01-01" }, description: "End date (YYYY-MM-DD)" },
          { name: "threeMonthSalary", in: "query", required: false, schema: { type: "number", default: 9000000 }, description: "Total salary for the last 3 months" },
          { name: "annualBonus", in: "query", required: false, schema: { type: "number", default: 0 }, description: "Total annual bonus" },
          { name: "annualLeaveAllowance", in: "query", required: false, schema: { type: "number", default: 0 }, description: "Unused annual leave allowance" }
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
        description: "Calculates statutory annual leave days under Labor Standards Act Art. 60 and cash-out allowance for unused days.",
        parameters: [
          { name: "yearsOfService", in: "query", required: false, schema: { type: "number", default: 1 }, description: "Completed years of service" },
          { name: "hourlyWage", in: "query", required: false, schema: { type: "number", default: 10030 }, description: "Ordinary hourly wage" },
          { name: "dailyHours", in: "query", required: false, schema: { type: "number", default: 8 }, description: "Daily working hours" },
          { name: "unusedDays", in: "query", required: false, schema: { type: "number", default: 0 }, description: "Remaining unused leave days" }
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
          { name: "hourlyWage", in: "query", schema: { type: "integer", default: 10030 }, description: "Base hourly wage (KRW)" },
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
    }
  }
};

