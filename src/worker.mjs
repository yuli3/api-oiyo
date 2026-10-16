import { getHolidays, isBusinessDay } from "./modules/calendar.mjs";
import { calculateSaju } from "./modules/saju.mjs";
import {
  calculateUnemploymentBenefits,
  calculateWeeklyAllowance,
  calculateOvertimePay,
} from "./modules/labor.mjs";
import { convertUnits } from "./modules/units.mjs";
import { calculateMilitaryService } from "./modules/military.mjs";
import { calculateCityGasBill } from "./modules/energy.mjs";
import { OPENAPI_SPEC } from "./modules/openapi.mjs";

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

    if (path === "/" && (method === "GET" || method === "HEAD")) {
      const info = {
        service: "oiyo-api",
        stage: "production-mvp",
        documentation: "/openapi.json",
        endpoints: [
          "GET /health",
          "GET /openapi.json",
          "GET /v1/kr/calendar/holidays?year=2026",
          "GET /v1/kr/calendar/is-business-day?date=2026-10-16",
          "POST /v1/astrology/saju/calculate",
          "GET /v1/labor/kr/unemployment-benefits?wage=3000000&age=under&period=p3&hours=8",
          "GET /v1/labor/kr/weekly-allowance?hourlyWage=10030&hours=20&tax=none",
          "GET /v1/labor/kr/overtime-pay?hourlyWage=10030&overtimeHours=10&nightHours=5",
          "GET /v1/military/kr/service-calculator?enlistmentDate=2026-03-02&branch=army",
          "GET /v1/energy/kr/gas-bill?usageM3=50&type=heating",
          "GET /v1/math/units/convert?value=100&from=m2&to=pyeong",
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
        { status: 200, headers: commonHeaders }
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


    // 404 Fallback
    return new Response(
      JSON.stringify({ error: "not_found", message: `Route ${path} does not exist.` }),
      { status: 404, headers: commonHeaders }
    );
  },
};
