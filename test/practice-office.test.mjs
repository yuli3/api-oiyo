import assert from "node:assert/strict";
import { test } from "node:test";
import { visitOffice } from "../src/modules/country-tax.mjs";

test("visit_practice_office lists rooms, then opens a room with intake, tools and help", () => {
  const lobby = visitOffice({ country: "KR", lang: "ko" });
  assert.equal(lobby.rooms.length, 5);
  assert.ok(lobby.page.endsWith("/ko/pro-office/"));
  const plan = visitOffice({ country: "KR", room: "plan", lang: "ko" });
  assert.equal(plan.intake.length, 5);
  assert.ok(plan.tools.some((t) => t.url.endsWith("/ko/national-pension-early-deferred-calculator/") && t.mcpTool === "compare_kr_national_pension_early_deferred"));
  assert.ok(plan.freeHelp.some((h) => h.includes("1332")));
  const de = visitOffice({ country: "DE", room: "plan" });
  assert.ok(de.tools.length >= 1 && de.skills.length === 1);
  assert.ok(visitOffice({ country: "XX" }).error);
  const pro = visitOffice({ country: "KR", room: "tax", audience: "pro" });
  assert.ok(pro.tools.every((t) => t.for === "practitioners"));
});
