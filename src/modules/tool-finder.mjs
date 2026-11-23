// Tool finder (2026-11-24). WHY: the full MCP server lists 300+ tools. A model with a small context
// either skips the catalog or picks a near-miss tool and reports its number as if it answered the
// question. NVIDIA Auto Ontology (reviewed 2026-11-24, company-brain projects/research/references/
// a2ui-auto-ontology-review-2026-11-24.md) solves the same problem for databases with two tools:
// `retrieve` (find the concept by meaning and by name) and `check_answerable` (say plainly when no
// concept covers the question). This is that idea over our own catalog, with no model and no index
// service: the tool names and descriptions in TOOLS_SPEC are the ontology, plus a small Korean
// synonym map for the words people actually type. No calculation happens here.
import { TOOLS_SPEC, TOOL_ENDPOINTS } from "./tools-spec.mjs";
import { SOURCE_PAGES } from "./source-pages.mjs";
import { FINDER_ENDPOINTS, FINDER_TOOL_NAME } from "./tool-finder-spec.mjs";

// Korean everyday words → tokens that appear in tool names. Only words whose tool-name form is not
// already in the Korean description text need to be here.
const SYNONYMS = [
  [/실수령|월급|연봉|세후|^급여$|^take$/, ["net", "salary", "take"]],
  [/퇴직금/, ["severance"]],
  [/실업급여|구직급여/, ["unemployment"]],
  [/주휴/, ["weekly", "allowance"]],
  [/연장|야간|휴일근무|초과근무|야근/, ["overtime"]],
  [/연차/, ["annual", "leave"]],
  [/최저임금|최저시급/, ["minimum", "wage"]],
  [/통상임금/, ["ordinary", "wage"]],
  [/4대\s?보험|건강보험|건보/, ["health", "insurance"]],
  [/국민연금|연금/, ["pension"]],
  [/연말정산/, ["year", "end", "settlement"]],
  [/종합소득세|종소세|3\.3/, ["freelancer", "income", "tax"]],
  [/취득세/, ["acquisition", "tax"]],
  [/재산세/, ["property", "tax"]],
  [/종부세|종합부동산세/, ["comprehensive", "real", "estate", "tax"]],
  [/양도세|양도소득세/, ["capital", "gains"]],
  [/상속/, ["inheritance"]],
  [/증여/, ["gift"]],
  [/부가세|부가가치세/, ["vat"]],
  [/법인세/, ["corporate", "tax"]],
  [/원천징수/, ["withholding"]],
  [/사주|팔자|오행/, ["saju"]],
  [/공휴일|휴일|빨간날/, ["holidays"]],
  [/영업일|평일|근무일/, ["business", "day"]],
  [/군대|전역|입대|복무/, ["military", "service"]],
  [/가스요금|도시가스/, ["gas", "bill"]],
  [/단위|평수|평|제곱미터/, ["convert", "units"]],
  [/육아휴직/, ["parental", "leave"]],
  [/출산|산전후/, ["maternity"]],
  [/월세/, ["rent"]],
  [/전세|보증금/, ["deposit", "jeonse"]],
  [/대출|주담대/, ["loan"]],
  [/이자/, ["interest"]],
  [/해고/, ["dismissal"]],
  [/산재/, ["injury"]],
  [/체불|밀린\s?월급/, ["wage", "guarantee"]],
  [/법령|조문|법조문/, ["statutes"]],
  [/기한|마감|신고기한/, ["deadline"]],
  [/현금흐름|기업가치|dcf/i, ["dcf", "valuation"]],
  [/스왓|swot/i, ["swot"]],
  [/의사결정/, ["decision", "tree"]],
];

// Country words → the code used in tool names. Without one, Korean tools are preferred.
const COUNTRIES = [
  [/일본|japan|japanese/i, "jp"], [/영국|uk\b|britain|england/i, "uk"], [/미국|usa?\b|america/i, "us"],
  [/프랑스|france|french/i, "fr"], [/스페인|spain|spanish/i, "es"], [/독일|germany|german/i, "de"],
  [/중국|china|chinese/i, "cn"], [/대만|taiwan/i, "tw"], [/싱가포르|singapore/i, "sg"], [/캐나다|canada/i, "ca"],
  [/호주|australia/i, "au"],
];
const FOREIGN = /_(jp|uk|us|fr|es|de|cn|tw|sg|ca|au|world)_/;

// Filler that says nothing about which tool fits.
const STOP = new Set([
  "얼마", "얼마나", "계산", "계산해", "계산해줘", "알려줘", "알려주세요", "궁금", "궁금해요", "어떻게", "있어요", "있나요", "받을", "받나요",
  "수", "있을까요", "받아", "받아요", "올해", "봐줘", "추천", "추천해줘", "보여줘", "뭐예요", "무엇", "언제", "해주세요", "해줘", "내가", "제가", "저는", "우리", "그리고", "이랑", "하고", "정도", "하면", "되나요", "돼요", "인가요",
  "what", "how", "much", "the", "and", "for", "can", "get", "calculate", "please", "with", "my", "are", "you", "does", "will", "is",
]);
const PARTICLE = /(은|는|이|가|을|를|의|에|에서|으로|로|도|만|과|와|이랑|랑|하고|까지|부터|이에요|예요|인가요|나요|요)$/;

function terms(question) {
  const words = question.toLowerCase().match(/[가-힣]{2,}|[a-z][a-z0-9.]{2,}/g) ?? [];
  const out = [];
  for (let word of words) {
    if (STOP.has(word)) continue;
    const stripped = word.replace(PARTICLE, "");
    if (stripped.length >= 2) word = stripped;
    if (STOP.has(word) || out.includes(word)) continue;
    out.push(word);
  }
  return out.slice(0, 24);
}

let CATALOG;
function catalog() {
  // Built on first use: tools-spec.mjs imports this file, so TOOLS_SPEC is not ready at load time.
  CATALOG ??= TOOLS_SPEC.tools
    .map(({ function: tool }) => tool)
    .filter((tool) => tool.name !== FINDER_TOOL_NAME)
    .map((tool) => ({ tool, nameTokens: new Set(tool.name.split("_")), text: tool.description.toLowerCase() }));
  return CATALOG;
}

export function findTools(question, limit = 5) {
  const countryEntry = COUNTRIES.find(([re]) => re.test(question));
  const country = countryEntry?.[1] ?? null;
  // The country word picks the tool family; it is not a term a tool has to cover.
  const words = terms(question).filter((word) => !countryEntry || !countryEntry[0].test(word));
  const expansions = words.map((word) => [word, SYNONYMS.filter(([re]) => re.test(word)).flatMap(([, tokens]) => tokens)]);
  const covered = new Set();
  const scored = catalog().map(({ tool, nameTokens, text }) => {
    let score = 0;
    const matched = [];
    for (const [word, tokens] of expansions) {
      let hit = 0;
      if (tokens.length) {
        const inName = tokens.filter((token) => nameTokens.has(token)).length;
        if (inName) hit = Math.max(hit, 2 + 2 * inName);
      }
      if (nameTokens.has(word)) hit = Math.max(hit, 4);
      if (text.includes(word)) hit = Math.max(hit, /[가-힣]/.test(word) ? 3 : 1);
      if (hit) { score += hit; matched.push(word); }
    }
    if (score) {
      const foreign = FOREIGN.test(tool.name);
      if (country) score += nameTokens.has(country) ? 5 : foreign ? -4 : -3;
      else if (foreign) score -= 3;
    }
    return { tool, score, matched };
  }).filter((entry) => entry.score > 0);
  scored.sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name));
  const top = scored.slice(0, limit);
  for (const entry of top) for (const word of entry.matched) covered.add(word);
  const uncovered = words.filter((word) => !covered.has(word));
  const coverage = words.length ? Math.round((covered.size / words.length) * 100) / 100 : 0;
  const best = top[0]?.score ?? 0;
  const answerable = best >= 4 && coverage >= 0.5 ? "likely" : best >= 3 ? "partial" : "none";
  return {
    question,
    answerable,
    coverage,
    country: country ?? "kr",
    uncoveredTerms: uncovered,
    tools: top.map(({ tool, score, matched }) => ({
      name: tool.name,
      score,
      matchedTerms: matched,
      description: tool.description,
      inputs: Object.keys(tool.parameters.properties),
      required: tool.parameters.required ?? [],
      endpoint: TOOL_ENDPOINTS[tool.name],
      page: SOURCE_PAGES[tool.name] ?? null,
    })),
    note: answerable === "none"
      ? "No OIYO tool covers this question. Say so instead of estimating a number."
      : "Call the tool you pick with its own inputs. This finder does no calculation; matching is by tool name and description only.",
  };
}

export async function handleToolFinder(request, url, headers) {
  if (url.pathname !== FINDER_ENDPOINTS[FINDER_TOOL_NAME].path) return null;
  if (request.method !== "POST") {
    return Response.json({ error: "method_not_allowed" }, { status: 405, headers: { ...headers, Allow: "POST" } });
  }
  let body;
  try {
    const text = await request.text();
    if (text.length > 4096) return Response.json({ error: "invalid_input", problems: ["body: at most 4096 bytes"] }, { status: 413, headers });
    body = JSON.parse(text);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
  } catch {
    return Response.json({ error: "invalid_input", problems: ["body: a JSON object"] }, { status: 400, headers });
  }
  const problems = [];
  for (const key of Object.keys(body)) if (!["question", "limit"].includes(key)) problems.push(`${key}: unknown field`);
  const { question, limit = 5 } = body;
  if (typeof question !== "string" || !question.trim() || question.length > 500) problems.push("question: 1-500 characters");
  if (!Number.isInteger(limit) || limit < 1 || limit > 10) problems.push("limit: integer 1-10");
  if (problems.length) return Response.json({ error: "invalid_input", problems }, { status: 400, headers });
  return Response.json(findTools(question.trim(), limit), { status: 200, headers });
}
