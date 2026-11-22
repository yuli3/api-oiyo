// GENERATED from tools-oiyo src/lib/world-fresh-start-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// Fresh start for people in debt and an inheritance deadline (2026-11-22, world audience gap A5: lay side).
// Taiwan 消費者債務清理條例 (更生・清算), Spain Ley de Segunda Oportunidad (TRLC arts. 487-488) and Impuesto sobre Sucesiones deadline.
// Facts: /mnt/project-files/notes/fresh-start-facts-2026-11-22.md. What was only summarised (plan length, public credit cap) is flagged, not computed.
export const FRESH_START_AS_OF = "2026-11-22";
                                                                           
const pos = (n         ) => Math.max(0, Number(n) || 0);
const TW_CITE = "彰化地院「消費者債務清理條例須知」";

export function twDebtClearance(x                                                                                                     ) {
  const debt = pos(x.totalDebt);
  const consumer = !x.hadBusiness5y || pos(x.avgMonthlyRevenue5y) <= 200_000;
  const items         = [];
  if (!consumer) items.push({ tone: "warn", text: "五年內平均每月營業額超過20萬元，不屬於消債條例的「消費者」，不能用更生或清算。", cite: TW_CITE });
  else items.push({ tone: "good", text: x.hadBusiness5y ? "五年內平均每月營業額在20萬元以下，可以適用消債條例。" : "五年內沒有從事營業活動，可以適用消債條例。", cite: TW_CITE });
  const canRestructure = consumer && debt <= 12_000_000;
  if (consumer) items.push(canRestructure
    ? { tone: "info", text: `債務 ${debt.toLocaleString("zh-TW")} 元未超過1,200萬元，可以選擇「更生」：法院認可最長六年、至少每三個月還款一次的清償計畫，不必變賣財產。`, cite: TW_CITE }
    : { tone: "warn", text: `債務 ${debt.toLocaleString("zh-TW")} 元超過1,200萬元，不能選擇更生，只能聲請「清算」。`, cite: TW_CITE });
  if (consumer) items.push({ tone: "info", text: "清算：變賣財產分配給債權人。法院裁定「免責」後才免除其餘債務；裁定不免責，仍要清償。", cite: TW_CITE });
  if (consumer && x.hasBankDebt) items.push({ tone: "warn", text: "有銀行、信用合作社的債務（信用卡、現金卡、信貸、房貸）時，必須先向最大債權銀行提出「前置協商」，不是向法院聲請。可查聯合徵信中心的債權人清冊找出最大債權銀行。", cite: TW_CITE });
  if (consumer && !x.hasBankDebt) items.push({ tone: "info", text: "沒有銀行債權人時，可以直接向法院聲請更生或清算。", cite: TW_CITE });
  if (consumer) items.push({ tone: "info", text: "聲請時繳納聲請費用1,000元。罰金、罰鍰、怠金、追徵金及法定扶養費用等，不會因更生或清算而免除。", cite: TW_CITE });
  items.push({ tone: "warn", text: "隱匿財產、捏造債務等行為最重可處三年有期徒刑，法院也會不免責。清償計畫與免責的其他條件，這裡沒有計算。", cite: "消費者債務清理條例第146、147條（須知）" });
  return { ok: true         , consumer, route: !consumer ? "none" : canRestructure ? "restructure_or_liquidation" : "liquidation_only", needsBankNegotiation: consumer && !!x.hasBankDebt, items };
}

const addMonths = (iso        , m        ) => { const d = new Date(`${iso}T00:00:00Z`); const day = d.getUTCDate(); const y = d.getUTCFullYear(), mo = d.getUTCMonth() + m; const last = new Date(Date.UTC(y, mo + 1, 0)).getUTCDate(); return new Date(Date.UTC(y, mo, Math.min(day, last))).toISOString().slice(0, 10); };
const yearsBetween = (a        , b        ) => (Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / (365.25 * 86_400_000);

export function esSecondChance(x                                                                                                                                                                      ) {
  const items         = [];
  const blocks           = [];
  const C = "TRLC art. 487 (Ley 16/2022); Hernández Sainz, Segunda oportunidad del consumidor (Ayto. Zaragoza, 2025)";
  if (x.conviction10y) blocks.push("Condena firme en los 10 años anteriores a pena de prisión (aunque se suspenda) por delitos patrimoniales, socioeconómicos, falsedad documental, contra Hacienda o la Seguridad Social o contra los derechos de los trabajadores, con pena máxima de 3 años o más.");
  if (x.severeSanction10y) blocks.push("Sanción firme en los 10 años anteriores por infracción tributaria muy grave, o de Seguridad Social u orden social.");
  if (x.culpable) blocks.push("Concurso declarado culpable.");
  const today = x.today ?? FRESH_START_AS_OF;
  if (x.priorExoneration && x.priorExoneration !== "none" && x.priorDate) {
    const wait = x.priorExoneration === "plan" ? 2 : 5;
    if (yearsBetween(x.priorDate, today) < wait) blocks.push(`Exoneración anterior ${x.priorExoneration === "plan" ? "con plan de pagos" : "con liquidación"} hace menos de ${wait} años (hasta ${addMonths(x.priorDate, wait * 12)}).`);
  }
  for (const b of blocks) items.push({ tone: "warn", text: b, cite: blocks.length ? C : C });
  if (blocks.length === 0) items.push({ tone: "good", text: "Con estas respuestas no aparece ninguna causa que impida la exoneración por falta de buena fe.", cite: C });
  items.push({ tone: "info", text: "Dos vías: exoneración con liquidación de la masa activa, o con un plan de pagos sin liquidar (pensada para conservar la vivienda habitual).", cite: C });
  items.push({ tone: "info", text: "Tras una exoneración anterior hay que esperar 2 años (plan de pagos) o 5 años (liquidación). El crédito público sigue debiéndose entero si ya hubo una exoneración anterior.", cite: "TRLC arts. 488 y 489" });
  items.push({ tone: "warn", text: "No calculado aquí: duración exacta del plan de pagos, límite de deuda con Hacienda y Seguridad Social que se puede exonerar, deudas que nunca se exoneran (p. ej. alimentos), ni otras causas como el endeudamiento irresponsable.", cite: C });
  return { ok: true         , eligible: blocks.length === 0, blocks, items };
}

export function esInheritanceDeadline(x                                   ) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(x.death ?? "")) return { ok: false         , error: "death (YYYY-MM-DD) is required" };
  const deadline = addMonths(x.death, 6);
  const today = x.today ?? FRESH_START_AS_OF;
  const items         = [
    { tone: today > deadline ? "warn" : "info", text: `Impuesto sobre Sucesiones: 6 meses desde el fallecimiento, hasta el ${deadline}.${today > deadline ? " El plazo ya ha pasado." : ""}`, cite: "Agencia Tributaria, Modelo 650: plazos de presentación (27/04/2026)" },
    { tone: "info", text: "Esta página de la Agencia Tributaria es para Ceuta y Melilla. En el resto de España, consulta la oficina de tu comunidad autónoma: la prórroga, los recargos y las reducciones no se calculan aquí.", cite: "Agencia Tributaria" },
  ];
  return { ok: true         , deadline, passed: today > deadline, items };
}

export function freshStart(x                                                                                        ) {
  if (x.topic === "tw_debt") return twDebtClearance(x         );
  if (x.topic === "es_second_chance") return esSecondChance(x         );
  if (x.topic === "es_inheritance") return esInheritanceDeadline(x         );
  return { ok: false         , error: "topic must be tw_debt, es_second_chance or es_inheritance" };
}
