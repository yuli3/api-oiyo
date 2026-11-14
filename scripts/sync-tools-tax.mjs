// Copies the tested Korean personal-tax libraries from tools-oiyo (tools.oiyo.net) into this Worker.
// WHY 2026-11-09: MCP tools must use the same formulas as the public Tools pages, not a second copy
// written by hand. Run after a tools-oiyo tax change:
//   node scripts/sync-tools-tax.mjs [path/to/tools-oiyo]   (needs Node >= 22.13 for stripTypeScriptTypes)
// test/kr-personal-tax.test.mjs fails when the committed copy drifts from a local tools-oiyo checkout.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { stripTypeScriptTypes } from "node:module";

export const TOOLS_TAX_FILES = ["kr-vat-2026", "kr-payroll-2026", "kr-income-tax-2026", "kr-real-estate-tax", "kr-year-end-2026", "kr-advisory-2026"];
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
