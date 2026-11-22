// GENERATED from tools-oiyo src/lib/world-einvoice-pack-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// E-invoicing and invoice-system timelines (2026-11-22, world pro-gap #7): France (facturation électronique), Japan (インボイス 経過措置), Spain (VERI*FACTU).
// General information only: not tax advice, no filing, no software certification.
// Facts: /mnt/project-files/notes/einvoice-facts-2026-11-22.md (entreprendre.service-public A18953, impots.gouv FAQ 01/09/2026, 国税庁 Q&A 113-3, AEAT folleto VERI*FACTU).
// Not computed because not verified: FR size thresholds and penalties, JP 少額特例 and 3割特例 conditions, ES penalties and B2B factura electrónica, Germany.

export const EINVOICE_AS_OF = "2026-11-22";
                                            
                                                               
                                                                              

const ok = (s         ) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
const pos = (n         ) => Math.max(0, Number(n) || 0);
const inForce = (date        , today         ) => (ok(today) ? today  >= date : null);

// ── France ──────────────────────────────────────────────────────────
                                                    
export const FR_RECEIVE = "2026-09-01";
export const FR_ISSUE = { ge: "2026-09-01", eti: "2026-09-01", pme: "2027-09-01", micro: "2027-09-01" }         ;
export function frEInvoice(x                                  ) {
  const size         = x.size in FR_ISSUE ? x.size : "pme";
  const issue = FR_ISSUE[size];
  const dates          = [
    { id: "receive", label: "Obligation de recevoir les factures électroniques (toutes les entreprises)", date: FR_RECEIVE, cite: "entreprendre.service-public.gouv.fr A18953" },
    { id: "issue", label: `Obligation d'émettre des factures électroniques et d'e-reporting (${size === "ge" ? "grande entreprise" : size === "eti" ? "ETI" : size === "pme" ? "PME" : "micro-entreprise"})`, date: issue, cite: "impots.gouv.fr FAQ facturation électronique (01/09/2026)" },
  ];
  const now = { receive: inForce(FR_RECEIVE, x.today), issue: inForce(issue, x.today) };
  const items          = [
    { tone: "info", text: "Concerne les opérations entre assujettis à la TVA établis en France. Les ventes aux particuliers et aux clients étrangers passent par l'e-reporting.", cite: "impots.gouv.fr FAQ 1.1" },
    { tone: "info", text: "La réception passe par une plateforme agréée. Même une entreprise qui n'a que des opérations hors champ doit pouvoir recevoir.", cite: "impots.gouv.fr FAQ 1.2, 5.1" },
    { tone: "warn", text: "La catégorie (GE, ETI, PME, micro) se détermine d'après les effectifs, le chiffre d'affaires et le bilan ; un dépassement de seuil ne compte qu'après 2 exercices consécutifs. Les seuils et les sanctions ne sont pas calculés ici.", cite: "entreprendre.service-public.gouv.fr" },
  ];
  if (size === "pme" || size === "micro") items.push({ tone: "info", text: "Une PME ou micro-entreprise peut commencer à émettre avant le 1er septembre 2027.", cite: "impots.gouv.fr FAQ 1.3" });
  return { asOf: EINVOICE_AS_OF, dates, now, items };
}

// ── Japan: purchases from 免税事業者 etc. ────────────────────────────
export const JP_TRANSITION                                             = [
  ["2023-10-01", "2026-09-30", 80],
  ["2026-10-01", "2028-09-30", 70],
  ["2028-10-01", "2030-09-30", 50],
  ["2030-10-01", "2031-09-30", 30],
];
export const jpTransitionRate = (date        ) => { if (!ok(date)) return 0; const row = JP_TRANSITION.find(([a, b]) => date >= a && date <= b); return row ? row[2] : 0; };
export function jpInvoiceTransition(x                                              ) {
  const rate = jpTransitionRate(x.purchaseDate);
  const tax = pos(x.taxAmount);
  const deductible = Math.floor((tax * rate) / 100);
  const before = ok(x.purchaseDate) && x.purchaseDate < JP_TRANSITION[0][0];
  const dates          = JP_TRANSITION.map(([a, b, r], i) => ({ id: `t${i}`, label: `${r}% 控除できる期間（${a} 〜 ${b}）`, date: a, cite: "国税庁 Q&A 問113-3" }));
  const items          = [
    { tone: "info", text: "インボイス（適格請求書）のない免税事業者などからの仕入れでも、経過措置の期間中は仕入税額相当額の一定割合を控除できます。割合は仕入れの時期（役務は完了日、物品は引渡日）で決まります。", cite: "国税庁 Q&A 問113-3" },
    { tone: "info", text: "令和8年10月1日から令和10年9月30日までは70%です（令和8年4月追加のQ&A）。", cite: "国税庁 Q&A 問113-3" },
    { tone: "warn", text: "経過措置を使うための帳簿や請求書の保存の要件、少額特例（1万円未満）、3割特例の条件はここでは判定していません。", cite: "国税庁" },
  ];
  if (!before && ok(x.purchaseDate) && rate === 0) items.unshift({ tone: "warn", text: "この時期の仕入れには経過措置がなく、インボイスがなければ控除できません。", cite: "国税庁 Q&A 問113-3" });
  if (before) items.unshift({ tone: "info", text: "令和5年9月30日以前の仕入れはインボイス制度の前なので、この経過措置の対象ではありません。", cite: "国税庁" });
  return { asOf: EINVOICE_AS_OF, rate, taxAmount: tax, deductible, notDeductible: tax - deductible, dates, items };
}

// ── Spain: VERI*FACTU ───────────────────────────────────────────────
export function esVerifactu(x                                                                                ) {
  const due = x.sociedades ? "2027-01-01" : "2027-07-01";
  const applies = x.usesSoftware !== false && !x.sii;
  const dates          = applies ? [{ id: "verifactu", label: `Sistema de facturación adaptado (antes del ${x.sociedades ? "1 de enero" : "1 de julio"} de 2027)`, date: due, cite: "AEAT folleto VERI*FACTU" }] : [];
  const items          = [];
  if (x.sii) items.push({ tone: "good", text: "Quien ya usa el SII no está obligado a cambiar su sistema.", cite: "AEAT folleto VERI*FACTU" });
  if (x.usesSoftware === false) items.push({ tone: "good", text: "La obligación afecta a quien usa un sistema informático de facturación. Si factura sin software, no se aplica.", cite: "AEAT folleto VERI*FACTU" });
  items.push(
    { tone: "info", text: x.sociedades ? "Contribuyentes del Impuesto sobre Sociedades: el software debe cumplir antes del 1 de enero de 2027." : "Autónomos y demás obligados: el software debe cumplir antes del 1 de julio de 2027.", cite: "AEAT folleto VERI*FACTU" },
    { tone: "info", text: "Enviar los registros a la AEAT (VERI*FACTU) es una de las dos modalidades y su elección es voluntaria.", cite: "AEAT folleto VERI*FACTU" },
    { tone: "warn", text: "País Vasco y Navarra siguen su normativa foral. Las sanciones (Ley 58/2003, art. 201 bis) y la factura electrónica B2B no se calculan aquí.", cite: "AEAT folleto VERI*FACTU" },
  );
  return { asOf: EINVOICE_AS_OF, applies, due: applies ? due : null, inForce: applies ? inForce(due, x.today) : null, dates, items };
}

export const EINVOICE_HELP = { fr: "service des impôts des entreprises (SIE)", jp: "所轄の税務署", es: "Agencia Tributaria (AEAT)" }         ;
