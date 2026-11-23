// Copies the practice office map (floors = countries, rooms = tax/labor/admin/legal/plan) from tools-oiyo into this Worker.
// WHY 2026-11-23: visit_practice_office must list the same tools, skills, help and intake questions as tools.oiyo.net/ko/pro-office/.
//   node --experimental-strip-types scripts/sync-practice-office.mjs [path/to/tools-oiyo]
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const toolsDir = resolve(process.argv[2] ?? resolve(repoRoot, "../tools-oiyo"));
const office = await import(pathToFileURL(resolve(toolsDir, "src/data/pro-office.ts")).href);
const copy = await import(pathToFileURL(resolve(toolsDir, "src/data/pro-office-copy.ts")).href);
const floors = Object.fromEntries(Object.keys(office.FLAGS).map((id) => [id, office.floor(id)]));
const langs = Object.fromEntries(Object.entries(copy.OFFICE_COPY).map(([loc, c]) => [loc, { rooms: c.rooms, roomDesc: c.roomDesc, intake: c.intake, countries: c.countries }]));
const data = { asOf: office.OFFICE_AS_OF, rooms: office.ROOMS, slugs: office.OFFICE_SLUGS, floors, langs };
writeFileSync(resolve(repoRoot, "src/modules/vendor/practice-office.mjs"), `// GENERATED from tools-oiyo src/data/pro-office.ts by scripts/sync-practice-office.mjs. Do not edit here.\nexport const PRACTICE_OFFICE = ${JSON.stringify(data)};\n`);
console.log(`practice office: ${Object.keys(floors).length} floors, ${Object.keys(langs).length} languages`);
