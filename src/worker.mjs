import { getHolidays, isBusinessDay, calculateDday, calculateWorkdays } from "./modules/calendar.mjs";
import { calculateSaju } from "./modules/saju.mjs";
import {
  calculateUnemploymentBenefits,
  calculateWeeklyAllowance,
  calculateOvertimePay,
  calculateNetSalary,
  calculateSeverancePay,
  calculateAnnualLeave,
} from "./modules/labor.mjs";
import { convertUnits } from "./modules/units.mjs";
import { calculateMilitaryService } from "./modules/military.mjs";
import { calculateCityGasBill } from "./modules/energy.mjs";
import {
  calculateCAGR,
  calculateCompoundInterest,
  calculateInflation,
  calculateLoanRepayment,
  calculateStockAverage,
  calculateDividendYield,
  calculateYouthSavings,
  calculateDepositMaturity,
} from "./modules/finance.mjs";
import {
  calculateBrokerageFee,
  calculateAcquisitionTax,
} from "./modules/real-estate.mjs";
import {
  calculateCarTax,
  calculateCarRegistration,
} from "./modules/auto.mjs";
import { OPENAPI_SPEC } from "./modules/openapi.mjs";
import { TOOLS_SPEC } from "./modules/tools-spec.mjs";
import {
  DOCS_HTML,
  ROBOTS_TXT,
  SITEMAP_XML,
  LLMS_TXT,
  LLMS_FULL_TXT,
  ADS_TXT,
  FAVICON_SVG,
  NAVER_VERIFICATION_HTML,
  INDEXNOW_TXT,
} from "./modules/assets.mjs";

const commonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "public, max-age=3600",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // 1. CORS Preflight
    if (method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: commonHeaders,
      });
    }

    // 2. Health & Base Routes
    if (path === "/health" && (method === "GET" || method === "HEAD")) {
      return new Response(
        method === "HEAD" ? null : JSON.stringify({ status: "ok", service: "oiyo-api" }),
        { status: 200, headers: { ...commonHeaders, "Cache-Control": "no-store" } }
      );
    }

    // Interactive Docs (Scalar UI)
    if (
      (path === "/docs" || (path === "/" && request.headers.get("accept")?.includes("text/html"))) &&
      (method === "GET" || method === "HEAD")
    ) {
      return new Response(method === "HEAD" ? null : DOCS_HTML, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Robots.txt
    if (path === "/robots.txt" && (method === "GET" || method === "HEAD")) {
      return new Response(method === "HEAD" ? null : ROBOTS_TXT, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, max-age=86400",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Sitemap.xml
    if (path === "/sitemap.xml" && (method === "GET" || method === "HEAD")) {
      return new Response(method === "HEAD" ? null : SITEMAP_XML, {
        status: 200,
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control": "public, max-age=86400",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // llms.txt
    if (path === "/llms.txt" && (method === "GET" || method === "HEAD")) {
      return new Response(method === "HEAD" ? null : LLMS_TXT, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, max-age=86400",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // llms-full.txt
    if (path === "/llms-full.txt" && (method === "GET" || method === "HEAD")) {
      return new Response(method === "HEAD" ? null : LLMS_FULL_TXT, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, max-age=86400",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // tools.json (Agent function-calling definitions)
    if (path === "/tools.json" && (method === "GET" || method === "HEAD")) {
      return new Response(method === "HEAD" ? null : JSON.stringify(TOOLS_SPEC), {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // ads.txt
    if (path === "/ads.txt" && (method === "GET" || method === "HEAD")) {
      return new Response(method === "HEAD" ? null : ADS_TXT, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, max-age=86400",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Favicon
    if ((path === "/favicon.svg" || path === "/favicon.ico") && (method === "GET" || method === "HEAD")) {
      return new Response(method === "HEAD" ? null : FAVICON_SVG, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml; charset=utf-8",
          "Cache-Control": "public, max-age=604800",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Search Engine Verifications
    if (path === "/naverfeb1d8514db116d06b5d11e882ee9d1c.html" && (method === "GET" || method === "HEAD")) {
      return new Response(method === "HEAD" ? null : NAVER_VERIFICATION_HTML, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=86400",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    if (path === "/0f2131ccadd8edf19887c99ca7aa9f4795a4cae4.txt" && (method === "GET" || method === "HEAD")) {
      return new Response(method === "HEAD" ? null : INDEXNOW_TXT, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, max-age=86400",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    if (path === "/" && (method === "GET" || method === "HEAD")) {
      const info = {
        service: "oiyo-api",
        stage: "production-mvp",
        documentation: "/docs",
        openapi: "/openapi.json",
        tools: "/tools.json",
        llms: "/llms.txt",
        llmsFull: "/llms-full.txt",
        sitemap: "/sitemap.xml",
        endpoints: [
          "GET /health",
          "GET /docs",
          "GET /openapi.json",
          "GET /tools.json",
          "GET /llms.txt",
          "GET /llms-full.txt",
          "GET /sitemap.xml",
          "GET /v1/kr/calendar/holidays?year=2026",
          "GET /v1/kr/calendar/is-business-day?date=2026-10-16",
          "GET /v1/kr/calendar/dday?baseDate=2026-03-01&targetDate=2026-10-17",
          "GET /v1/kr/calendar/workdays?startDate=2026-03-01&endDate=2026-03-31",
          "POST /v1/astrology/saju/calculate",
          "GET /v1/labor/kr/unemployment-benefits?wage=3000000&age=under&period=p3&hours=8",
          "GET /v1/labor/kr/weekly-allowance?hourlyWage=10030&hours=20&tax=none",
          "GET /v1/labor/kr/overtime-pay?hourlyWage=10030&overtimeHours=10&nightHours=5",
          "GET /v1/labor/kr/net-salary?salary=3500000&isAnnual=false&nonTaxable=200000&dependents=1",
          "GET /v1/labor/kr/severance-pay?startDate=2024-01-01&endDate=2026-01-01&threeMonthSalary=9000000",
          "GET /v1/labor/kr/annual-leave?yearsOfService=2&hourlyWage=10030&unusedDays=5",
          "GET /v1/military/kr/service-calculator?enlistmentDate=2026-03-02&branch=army",
          "GET /v1/energy/kr/gas-bill?usageM3=50&type=heating",
          "GET /v1/math/units/convert?value=100&from=m2&to=pyeong",
          "GET /v1/finance/cagr?initialValue=10000000&finalValue=20000000&years=5",
          "GET /v1/finance/compound-interest?principal=10000000&rate=7&years=10&monthlyContribution=500000",
          "GET /v1/finance/inflation?baseYear=2000&targetYear=2026&amount=1000000",
          "GET /v1/finance/loan-repayment?principal=100000000&annualRate=4.5&months=360&method=equalPI",
        ],
      };
      return new Response(method === "HEAD" ? null : JSON.stringify(info), {
        status: 200,
        headers: commonHeaders,
      });
    }

    if (path === "/openapi.json" && (method === "GET" || method === "HEAD")) {
      return new Response(
        method === "HEAD" ? null : JSON.stringify(OPENAPI_SPEC),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // 3. Calendar: Holidays
    if (path === "/v1/kr/calendar/holidays") {
      if (method !== "GET" && method !== "HEAD") {
        return Response.json({ error: "method_not_allowed" }, { status: 405, headers: commonHeaders });
      }

      const year = url.searchParams.get("year") || new Date().getFullYear();
      try {
        const holidays = getHolidays(year);
        const body = { year: parseInt(year, 10), count: holidays.length, holidays };
        return new Response(method === "HEAD" ? null : JSON.stringify(body), {
          status: 200,
          headers: commonHeaders,
        });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 400, headers: commonHeaders });
      }
    }

    // 4. Calendar: Is Business Day
    if (path === "/v1/kr/calendar/is-business-day") {
      if (method !== "GET" && method !== "HEAD") {
        return Response.json({ error: "method_not_allowed" }, { status: 405, headers: commonHeaders });
      }

      const dateStr = url.searchParams.get("date");
      if (!dateStr) {
        return Response.json({ error: "Missing required query parameter: date (YYYY-MM-DD)" }, { status: 400, headers: commonHeaders });
      }

      try {
        const res = isBusinessDay(dateStr);
        return new Response(method === "HEAD" ? null : JSON.stringify(res), {
          status: 200,
          headers: commonHeaders,
        });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 400, headers: commonHeaders });
      }
    }

    // 4-1. Calendar: D-day
    if (path === "/v1/kr/calendar/dday") {
      if (method !== "GET" && method !== "HEAD") {
        return Response.json({ error: "method_not_allowed" }, { status: 405, headers: commonHeaders });
      }

      const baseDate = url.searchParams.get("baseDate") || new Date().toISOString().split("T")[0];
      const targetDate = url.searchParams.get("targetDate");
      const includeBaseDay = url.searchParams.get("includeBaseDay") === "true";

      if (!targetDate) {
        return Response.json(
          { error: "Missing required query parameter: targetDate (YYYY-MM-DD)" },
          { status: 400, headers: commonHeaders }
        );
      }

      try {
        const res = calculateDday(baseDate, targetDate, includeBaseDay);
        return new Response(method === "HEAD" ? null : JSON.stringify(res), {
          status: 200,
          headers: commonHeaders,
        });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 400, headers: commonHeaders });
      }
    }

    // 4-2. Calendar: Workdays Range
    if (path === "/v1/kr/calendar/workdays") {
      if (method !== "GET" && method !== "HEAD") {
        return Response.json({ error: "method_not_allowed" }, { status: 405, headers: commonHeaders });
      }

      const startDate = url.searchParams.get("startDate");
      const endDate = url.searchParams.get("endDate");

      if (!startDate || !endDate) {
        return Response.json(
          { error: "Missing required query parameters: startDate, endDate (YYYY-MM-DD)" },
          { status: 400, headers: commonHeaders }
        );
      }

      try {
        const res = calculateWorkdays(startDate, endDate);
        return new Response(method === "HEAD" ? null : JSON.stringify(res), {
          status: 200,
          headers: commonHeaders,
        });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 400, headers: commonHeaders });
      }
    }

    // 5. Saju: Calculate
    if (path === "/v1/astrology/saju/calculate") {
      if (method !== "POST") {
        return Response.json({ error: "method_not_allowed" }, { status: 405, headers: commonHeaders });
      }

      try {
        let payload;
        try {
          payload = await request.json();
        } catch {
          return Response.json({ error: "Malformed JSON body" }, { status: 400, headers: commonHeaders });
        }

        if (!payload.year || !payload.month || !payload.day) {
          return Response.json(
            { error: "Missing required fields: year, month, day" },
            { status: 400, headers: commonHeaders }
          );
        }

        const calculated = calculateSaju(payload);
        return new Response(JSON.stringify(calculated), {
          status: 200,
          headers: { ...commonHeaders, "Cache-Control": "no-store" },
        });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 400, headers: commonHeaders });
      }
    }

    // 6. Labor: Unemployment Benefits
    if (path === "/v1/labor/kr/unemployment-benefits") {
      if (method !== "GET" && method !== "HEAD") {
        return Response.json({ error: "method_not_allowed" }, { status: 405, headers: commonHeaders });
      }

      const monthlyWage = url.searchParams.get("wage") || 3000000;
      const ageGroup = url.searchParams.get("age") || "under";
      const periodCode = url.searchParams.get("period") || "p3";
      const hoursPerDay = url.searchParams.get("hours") || 8;

      try {
        const res = calculateUnemploymentBenefits({
          monthlyWage: Number(monthlyWage),
          ageGroup,
          periodCode,
          hoursPerDay: Number(hoursPerDay),
        });
        return new Response(method === "HEAD" ? null : JSON.stringify(res), {
          status: 200,
          headers: commonHeaders,
        });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 400, headers: commonHeaders });
      }
    }

    // 7. Labor: Weekly Holiday Allowance
    if (path === "/v1/labor/kr/weekly-allowance") {
      if (method !== "GET" && method !== "HEAD") {
        return Response.json({ error: "method_not_allowed" }, { status: 405, headers: commonHeaders });
      }

      const hourlyWage = url.searchParams.get("hourlyWage") || 10030;
      const weeklyHours = url.searchParams.get("hours") || 20;
      const taxType = url.searchParams.get("tax") || "none";

      try {
        const res = calculateWeeklyAllowance({
          hourlyWage: Number(hourlyWage),
          weeklyHours: Number(weeklyHours),
          taxType,
        });
        return new Response(method === "HEAD" ? null : JSON.stringify(res), {
          status: 200,
          headers: commonHeaders,
        });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 400, headers: commonHeaders });
      }
    }

    // 8. Math: Units Convert
    if (path === "/v1/math/units/convert") {
      if (method !== "GET" && method !== "HEAD") {
        return Response.json({ error: "method_not_allowed" }, { status: 405, headers: commonHeaders });
      }

      const value = url.searchParams.get("value");
      const from = url.searchParams.get("from");
      const to = url.searchParams.get("to");

      if (value === null || !from || !to) {
        return Response.json(
          { error: "Missing required query parameters: value, from, to" },
          { status: 400, headers: commonHeaders }
        );
      }

      try {
        const res = convertUnits({ value: Number(value), from, to });
        return new Response(method === "HEAD" ? null : JSON.stringify(res), {
          status: 200,
          headers: commonHeaders,
        });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 400, headers: commonHeaders });
      }
    }

    // 9. Labor: Overtime, Night, and Holiday Pay
    if (path === "/v1/labor/kr/overtime-pay") {
      if (method !== "GET" && method !== "HEAD") {
        return Response.json({ error: "method_not_allowed" }, { status: 405, headers: commonHeaders });
      }

      const hourlyWage = url.searchParams.get("hourlyWage") || 10030;
      const overtimeHours = url.searchParams.get("overtimeHours") || 0;
      const nightHours = url.searchParams.get("nightHours") || 0;
      const holidayHours8orLess = url.searchParams.get("holidayHours8orLess") || 0;
      const holidayHoursOver8 = url.searchParams.get("holidayHoursOver8") || 0;

      try {
        const res = calculateOvertimePay({
          hourlyWage: Number(hourlyWage),
          overtimeHours: Number(overtimeHours),
          nightHours: Number(nightHours),
          holidayHours8orLess: Number(holidayHours8orLess),
          holidayHoursOver8: Number(holidayHoursOver8),
        });
        return new Response(method === "HEAD" ? null : JSON.stringify(res), {
          status: 200,
          headers: commonHeaders,
        });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 400, headers: commonHeaders });
      }
    }

    // 10. Military: Service Milestones & Progress
    if (path === "/v1/military/kr/service-calculator") {
      if (method !== "GET" && method !== "HEAD") {
        return Response.json({ error: "method_not_allowed" }, { status: 405, headers: commonHeaders });
      }

      const enlistmentDate = url.searchParams.get("enlistmentDate");
      const branch = url.searchParams.get("branch") || "army";
      const currentDate = url.searchParams.get("currentDate");

      if (!enlistmentDate) {
        return Response.json(
          { error: "Missing required query parameter: enlistmentDate (format: YYYY-MM-DD)" },
          { status: 400, headers: commonHeaders }
        );
      }

      try {
        const res = calculateMilitaryService({ enlistmentDate, branch, currentDate });
        return new Response(method === "HEAD" ? null : JSON.stringify(res), {
          status: 200,
          headers: commonHeaders,
        });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 400, headers: commonHeaders });
      }
    }

    // 11. Energy: City Gas Bill
    if (path === "/v1/energy/kr/gas-bill") {
      if (method !== "GET" && method !== "HEAD") {
        return Response.json({ error: "method_not_allowed" }, { status: 405, headers: commonHeaders });
      }

      const usageM3 = url.searchParams.get("usageM3") || 50;
      const usageType = url.searchParams.get("type") || "heating";
      const customCalorific = url.searchParams.get("calorific");

      try {
        const res = calculateCityGasBill({
          usageM3: Number(usageM3),
          usageType,
          customCalorificValue: customCalorific ? Number(customCalorific) : undefined,
        });
        return new Response(method === "HEAD" ? null : JSON.stringify(res), {
          status: 200,
          headers: commonHeaders,
        });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 400, headers: commonHeaders });
      }
    }

    // 12. Labor: Net Salary & 4 Major Insurances
    if (path === "/v1/labor/kr/net-salary") {
      if (method !== "GET" && method !== "HEAD") {
        return Response.json({ error: "method_not_allowed" }, { status: 405, headers: commonHeaders });
      }

      const salary = url.searchParams.get("salary") || 3500000;
      const isAnnual = url.searchParams.get("isAnnual") === "true";
      const nonTaxable = url.searchParams.get("nonTaxable") || 200000;
      const dependents = url.searchParams.get("dependents") || 1;

      try {
        const res = calculateNetSalary({
          salary: Number(salary),
          isAnnual,
          nonTaxable: Number(nonTaxable),
          dependents: Number(dependents),
        });
        return new Response(method === "HEAD" ? null : JSON.stringify(res), {
          status: 200,
          headers: commonHeaders,
        });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 400, headers: commonHeaders });
      }
    }

    // 13. Labor: Statutory Severance Pay
    if (path === "/v1/labor/kr/severance-pay") {
      if (method !== "GET" && method !== "HEAD") {
        return Response.json({ error: "method_not_allowed" }, { status: 405, headers: commonHeaders });
      }

      const startDate = url.searchParams.get("startDate");
      const endDate = url.searchParams.get("endDate");
      const threeMonthSalary = url.searchParams.get("threeMonthSalary") || 9000000;
      const annualBonus = url.searchParams.get("annualBonus") || 0;
      const annualLeaveAllowance = url.searchParams.get("annualLeaveAllowance") || 0;
      const hourlyWage = url.searchParams.get("hourlyWage") || 10030;
      const dailyHours = url.searchParams.get("dailyHours") || 8;

      if (!startDate || !endDate) {
        return Response.json(
          { error: "Missing required query parameters: startDate, endDate (YYYY-MM-DD)" },
          { status: 400, headers: commonHeaders }
        );
      }

      try {
        const res = calculateSeverancePay({
          startDate,
          endDate,
          threeMonthSalary: Number(threeMonthSalary),
          annualBonus: Number(annualBonus),
          annualLeaveAllowance: Number(annualLeaveAllowance),
          hourlyWage: Number(hourlyWage),
          dailyHours: Number(dailyHours),
        });
        return new Response(method === "HEAD" ? null : JSON.stringify(res), {
          status: 200,
          headers: commonHeaders,
        });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 400, headers: commonHeaders });
      }
    }

    // 14. Labor: Annual Leave Entitlement & Unused Allowance
    if (path === "/v1/labor/kr/annual-leave") {
      if (method !== "GET" && method !== "HEAD") {
        return Response.json({ error: "method_not_allowed" }, { status: 405, headers: commonHeaders });
      }

      const yearsOfService = url.searchParams.get("yearsOfService") || 1;
      const hourlyWage = url.searchParams.get("hourlyWage") || 10030;
      const dailyHours = url.searchParams.get("dailyHours") || 8;
      const unusedDays = url.searchParams.get("unusedDays") || 0;

      try {
        const res = calculateAnnualLeave({
          yearsOfService: Number(yearsOfService),
          hourlyWage: Number(hourlyWage),
          dailyHours: Number(dailyHours),
          unusedDays: Number(unusedDays),
        });
        return new Response(method === "HEAD" ? null : JSON.stringify(res), {
          status: 200,
          headers: commonHeaders,
        });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 400, headers: commonHeaders });
      }
    }

    // 15. Finance: Compound Annual Growth Rate (CAGR)
    if (path === "/v1/finance/cagr") {
      if (method !== "GET" && method !== "HEAD") {
        return Response.json({ error: "method_not_allowed" }, { status: 405, headers: commonHeaders });
      }

      const initialValue = url.searchParams.get("initialValue");
      const finalValue = url.searchParams.get("finalValue");
      const years = url.searchParams.get("years");

      if (initialValue === null || finalValue === null || years === null) {
        return Response.json(
          { error: "Missing required query parameters: initialValue, finalValue, years" },
          { status: 400, headers: commonHeaders }
        );
      }

      try {
        const res = calculateCAGR({
          initialValue: Number(initialValue),
          finalValue: Number(finalValue),
          years: Number(years),
        });
        return new Response(method === "HEAD" ? null : JSON.stringify(res), {
          status: 200,
          headers: commonHeaders,
        });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 400, headers: commonHeaders });
      }
    }

    // 16. Finance: Compound Interest & Savings
    if (path === "/v1/finance/compound-interest") {
      if (method !== "GET" && method !== "HEAD") {
        return Response.json({ error: "method_not_allowed" }, { status: 405, headers: commonHeaders });
      }

      const principal = url.searchParams.get("principal") || 10000000;
      const rate = url.searchParams.get("rate") || 7;
      const years = url.searchParams.get("years") || 10;
      const monthlyContribution = url.searchParams.get("monthlyContribution") || 0;
      const compoundingFrequency = url.searchParams.get("compoundingFrequency") || "monthly";

      try {
        const res = calculateCompoundInterest({
          principal: Number(principal),
          rate: Number(rate),
          years: Number(years),
          monthlyContribution: Number(monthlyContribution),
          compoundingFrequency,
        });
        return new Response(method === "HEAD" ? null : JSON.stringify(res), {
          status: 200,
          headers: commonHeaders,
        });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 400, headers: commonHeaders });
      }
    }

    // 17. Finance: Inflation Value
    if (path === "/v1/finance/inflation") {
      if (method !== "GET" && method !== "HEAD") {
        return Response.json({ error: "method_not_allowed" }, { status: 405, headers: commonHeaders });
      }

      const baseYear = url.searchParams.get("baseYear");
      const targetYear = url.searchParams.get("targetYear") || 2026;
      const amount = url.searchParams.get("amount") || 1000000;

      if (!baseYear) {
        return Response.json(
          { error: "Missing required query parameter: baseYear" },
          { status: 400, headers: commonHeaders }
        );
      }

      try {
        const res = calculateInflation({
          baseYear: Number(baseYear),
          targetYear: Number(targetYear),
          amount: Number(amount),
        });
        return new Response(method === "HEAD" ? null : JSON.stringify(res), {
          status: 200,
          headers: commonHeaders,
        });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 400, headers: commonHeaders });
      }
    }

    // 18. Finance: Loan Repayment Schedule
    if (path === "/v1/finance/loan-repayment") {
      if (method !== "GET" && method !== "HEAD") {
        return Response.json({ error: "method_not_allowed" }, { status: 405, headers: commonHeaders });
      }

      const principal = url.searchParams.get("principal") || 100000000;
      const annualRate = url.searchParams.get("annualRate") || 4.5;
      const months = url.searchParams.get("months") || 360;
      const methodType = url.searchParams.get("method") || "equalPI";
      const graceMonths = url.searchParams.get("graceMonths") || 0;

      try {
        const res = calculateLoanRepayment({
          principal: Number(principal),
          annualRate: Number(annualRate),
          months: Number(months),
          method: methodType,
          graceMonths: Number(graceMonths),
        });
        return new Response(method === "HEAD" ? null : JSON.stringify(res), {
          status: 200,
          headers: commonHeaders,
        });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 400, headers: commonHeaders });
      }
    }

    // 19. Finance: Stock Average (물타기 평단가)
    if (path === "/v1/finance/stock-average") {
      if (method !== "GET" && method !== "HEAD") {
        return Response.json({ error: "method_not_allowed" }, { status: 405, headers: commonHeaders });
      }

      const currentShares = url.searchParams.get("currentShares") || 100;
      const currentPrice = url.searchParams.get("currentPrice") || 50000;
      const additionalShares = url.searchParams.get("additionalShares") || 50;
      const additionalPrice = url.searchParams.get("additionalPrice") || 40000;

      try {
        const res = calculateStockAverage({
          currentShares: Number(currentShares),
          currentPrice: Number(currentPrice),
          additionalShares: Number(additionalShares),
          additionalPrice: Number(additionalPrice),
        });
        return new Response(method === "HEAD" ? null : JSON.stringify(res), {
          status: 200,
          headers: commonHeaders,
        });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 400, headers: commonHeaders });
      }
    }

    // 20. Finance: Dividend Yield (배당수익률 및 월배당)
    if (path === "/v1/finance/dividend-yield") {
      if (method !== "GET" && method !== "HEAD") {
        return Response.json({ error: "method_not_allowed" }, { status: 405, headers: commonHeaders });
      }

      const sharePrice = url.searchParams.get("sharePrice") || 70000;
      const annualDividendPerShare = url.searchParams.get("annualDividendPerShare") || 3500;
      const sharesHeld = url.searchParams.get("sharesHeld") || 100;
      const dividendTaxRate = url.searchParams.get("dividendTaxRate") || 15.4;

      try {
        const res = calculateDividendYield({
          sharePrice: Number(sharePrice),
          annualDividendPerShare: Number(annualDividendPerShare),
          sharesHeld: Number(sharesHeld),
          dividendTaxRate: Number(dividendTaxRate),
        });
        return new Response(method === "HEAD" ? null : JSON.stringify(res), {
          status: 200,
          headers: commonHeaders,
        });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 400, headers: commonHeaders });
      }
    }

    // 21. Real Estate: Brokerage Fee (부동산 중개보수)
    if (path === "/v1/real-estate/brokerage-fee") {
      if (method !== "GET" && method !== "HEAD") {
        return Response.json({ error: "method_not_allowed" }, { status: 405, headers: commonHeaders });
      }

      const transactionType = url.searchParams.get("transactionType") || "sale";
      const propertyType = url.searchParams.get("propertyType") || "residential";
      const amount = url.searchParams.get("amount") || 500000000;

      try {
        const res = calculateBrokerageFee({
          transactionType,
          propertyType,
          amount: Number(amount),
        });
        return new Response(method === "HEAD" ? null : JSON.stringify(res), {
          status: 200,
          headers: commonHeaders,
        });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 400, headers: commonHeaders });
      }
    }

    // 22. Real Estate: Acquisition Tax (주택 취득세)
    if (path === "/v1/real-estate/acquisition-tax") {
      if (method !== "GET" && method !== "HEAD") {
        return Response.json({ error: "method_not_allowed" }, { status: 405, headers: commonHeaders });
      }

      const price = url.searchParams.get("price") || 650000000;
      const houseCount = url.searchParams.get("houseCount") || "1";
      const areaOver85 = url.searchParams.get("areaOver85") === "true";
      const isFirstHome = url.searchParams.get("isFirstHome") === "true";

      try {
        const res = calculateAcquisitionTax({
          price: Number(price),
          houseCount,
          areaOver85,
          isFirstHome,
        });
        return new Response(method === "HEAD" ? null : JSON.stringify(res), {
          status: 200,
          headers: commonHeaders,
        });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 400, headers: commonHeaders });
      }
    }

    // 23. Finance: Youth Savings (청년도약계좌)
    if (path === "/v1/finance/youth-savings") {
      if (method !== "GET" && method !== "HEAD") {
        return Response.json({ error: "method_not_allowed" }, { status: 405, headers: commonHeaders });
      }

      const monthlyDeposit = url.searchParams.get("monthlyDeposit") || 700000;
      const annualIncome = url.searchParams.get("annualIncome") || 36000000;
      const bankRate = url.searchParams.get("bankRate") || 5.5;
      const months = url.searchParams.get("months") || 60;

      try {
        const res = calculateYouthSavings({
          monthlyDeposit: Number(monthlyDeposit),
          annualIncome: Number(annualIncome),
          bankRate: Number(bankRate),
          months: parseInt(months, 10),
        });
        return new Response(method === "HEAD" ? null : JSON.stringify(res), {
          status: 200,
          headers: commonHeaders,
        });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 400, headers: commonHeaders });
      }
    }

    // 24. Finance: Deposit Maturity (예적금 만기 수령액)
    if (path === "/v1/finance/deposit-maturity") {
      if (method !== "GET" && method !== "HEAD") {
        return Response.json({ error: "method_not_allowed" }, { status: 405, headers: commonHeaders });
      }

      const type = url.searchParams.get("type") || "installment";
      const amount = url.searchParams.get("amount") || 500000;
      const annualRate = url.searchParams.get("annualRate") || 4.0;
      const months = url.searchParams.get("months") || 12;
      const taxType = url.searchParams.get("taxType") || "normal";

      try {
        const res = calculateDepositMaturity({
          type,
          amount: Number(amount),
          annualRate: Number(annualRate),
          months: parseInt(months, 10),
          taxType,
        });
        return new Response(method === "HEAD" ? null : JSON.stringify(res), {
          status: 200,
          headers: commonHeaders,
        });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 400, headers: commonHeaders });
      }
    }

    // 25. Auto: Annual Vehicle Tax (자동차세 및 연납 할인)
    if (path === "/v1/auto/tax") {
      if (method !== "GET" && method !== "HEAD") {
        return Response.json({ error: "method_not_allowed" }, { status: 405, headers: commonHeaders });
      }

      const powerType = url.searchParams.get("powerType") || "ice";
      const engineCc = url.searchParams.get("engineCc") || 1998;
      const vehicleAgeYears = url.searchParams.get("vehicleAgeYears") || 0;
      const prepaymentMonth = url.searchParams.get("prepaymentMonth") || "jan";

      try {
        const res = calculateCarTax({
          powerType,
          engineCc: Number(engineCc),
          vehicleAgeYears: parseInt(vehicleAgeYears, 10),
          prepaymentMonth,
        });
        return new Response(method === "HEAD" ? null : JSON.stringify(res), {
          status: 200,
          headers: commonHeaders,
        });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 400, headers: commonHeaders });
      }
    }

    // 26. Auto: Acquisition Tax (차량 취득세)
    if (path === "/v1/auto/registration") {
      if (method !== "GET" && method !== "HEAD") {
        return Response.json({ error: "method_not_allowed" }, { status: 405, headers: commonHeaders });
      }

      const price = url.searchParams.get("price") || 35000000;
      const vehicleType = url.searchParams.get("vehicleType") || "sedan";
      const ecoType = url.searchParams.get("ecoType") || "none";

      try {
        const res = calculateCarRegistration({
          price: Number(price),
          vehicleType,
          ecoType,
        });
        return new Response(method === "HEAD" ? null : JSON.stringify(res), {
          status: 200,
          headers: commonHeaders,
        });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 400, headers: commonHeaders });
      }
    }

    // 404 Fallback
    return new Response(
      JSON.stringify({ error: "not_found", message: `Route ${path} does not exist.` }),
      { status: 404, headers: commonHeaders }
    );
  },
};
