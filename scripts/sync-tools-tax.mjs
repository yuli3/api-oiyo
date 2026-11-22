// Copies the tested Korean personal-tax libraries from tools-oiyo (tools.oiyo.net) into this Worker.
// WHY 2026-11-09: MCP tools must use the same formulas as the public Tools pages, not a second copy
// written by hand. Run after a tools-oiyo tax change:
//   node scripts/sync-tools-tax.mjs [path/to/tools-oiyo]   (needs Node >= 22.13 for stripTypeScriptTypes)
// test/kr-personal-tax.test.mjs fails when the committed copy drifts from a local tools-oiyo checkout.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { stripTypeScriptTypes } from "node:module";

export const TOOLS_TAX_FILES = ["kr-vat-2026", "kr-payroll-2026", "kr-income-tax-2026", "kr-real-estate-tax", "kr-year-end-2026", "kr-advisory-2026", "kr-business-day", "biz-strategy", "biz-checklist", "biz-ops", "kr-welfare-2026", "kr-home-tax-2026", "kr-household-tax-2026", "kr-legal-2026", "kr-law-packs-2026", "kr-expert-guide-2026", "scenario", "pro-practice-2026", "pro-practice-guides-2026", "after-death-timeline-2026", "privacy-check-2026", "freelance-contract-check-2026", "kr-public-forms-2026", "kr-incorporation-2026", "kr-corp-tax-2026", "kr-tax-penalty-2026", "kr-appeal-deadlines-2026", "kr-inheritance-share-2026", "kr-auction-distribution-2026", "kr-customs-pack-2026", "kr-workforce-2026", "kr-accounting-schedules-2026", "kr-license-points-2026", "kr-appraisal-2026", "kr-ip-deadlines-2026", "kr-vat-credits-2026", "kr-franchise-housing-2026", "kr-audit-deferred-2026", "kr-injury-disability-2026", "kr-court-deposit-2026", "kr-self-registration-2026", "kr-f27-points-2026", "kr-nts-pack-2026", "kr-industrial-safety-2026", "japan-salary", "jp-tax-pack-2026", "us-tax-pack-2026", "fr-tax-pack-2026", "es-tax-pack-2026", "cn-tax-pack-2026", "uk-tax-pack-2026", "tw-tax-pack-2026", "world-labor-pack-2026", "world-tenancy-pack-2026", "world-law-intake-2026", "world-consumer-pack-2026", "world-inheritance-pack-2026", "world-limitation-pack-2026", "world-employer-cost-pack-2026", "world-company-calendar-2026", "world-einvoice-pack-2026", "world-tax-residency-2026", "world-de-sg-pack-2026", "france-salary", "spain-salary", "world-take-home-2026", "world-withholding-2026", "world-corporate-tax-2026", "world-home-purchase-2026", "de-life-law-2026", "world-late-payment-2026", "world-parental-pay-2026", "world-small-business-vat-2026", "acquisition-tax-countries"];
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const VENDOR_DIR = resolve(repoRoot, "src/modules/vendor/tools-tax");

export function renderToolsTaxFile(toolsDir, name) {
  const source = readFileSync(resolve(toolsDir, "src/lib", `${name}.ts`), "utf8");
  const code = stripTypeScriptTypes(source).replace(/from "\.\/([\w-]+)\.ts"/g, 'from "./$1.mjs"');
  return `// GENERATED from tools-oiyo src/lib/${name}.ts by scripts/sync-tools-tax.mjs. Do not edit here.\n${code}`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const toolsDir = resolve(process.argv[2] ?? resolve(repoRoot, "../tools-oiyo"));
  for (const name of TOOLS_TAX_FILES) writeFileSync(resolve(VENDOR_DIR, `${name}.mjs`), renderToolsTaxFile(toolsDir, name));
  console.log(`synced ${TOOLS_TAX_FILES.length} files from ${toolsDir}`);
}
