// Schema for the catalog finder (2026-11-24). Kept apart from tool-finder.mjs so tools-spec.mjs can
// spread it without an import cycle; the logic and its WHY live in tool-finder.mjs.

export const FINDER_TOOL_NAME = "find_oiyo_tools";

export const FINDER_TOOLS = [
  {
    type: "function",
    function: {
      name: FINDER_TOOL_NAME,
      description: "Finds which OIYO tool fits a question when the right one is unclear. Takes the user's question in their own words (Korean or English). Returns the best-matching OIYO tools with their input fields, the terms that matched, and an answerability verdict: 'likely', 'partial' (some parts of the question have no tool) or 'none' (OIYO has no tool for it). Searches tool names and descriptions only; no calculation.",
      parameters: {
        type: "object",
        properties: {
          question: { type: "string", maxLength: 500, description: "The user's question, e.g. '퇴직금이랑 실업급여 얼마나 받을 수 있어요?'" },
          limit: { type: "integer", minimum: 1, maximum: 10, description: "How many tools to return (default 5)" },
        },
        required: ["question"],
      },
    },
  },
];

export const FINDER_ENDPOINTS = { [FINDER_TOOL_NAME]: { path: "/v1/catalog/find-tools", method: "POST" } };
