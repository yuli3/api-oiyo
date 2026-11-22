// GENERATED from tools-oiyo src/lib/de-life-law-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// German everyday law pack (2026-11-22, world audience gap A4: layperson side).
// Widerruf (§§ 355-357 BGB), Mietkaution (§ 551 BGB), Verjährung (§§ 195, 199 BGB),
// Pfändungsfreigrenzen (§ 850c ZPO + Pfändungsfreigrenzenbekanntmachung 2026), Erbschaftsteuer (§§ 15, 16, 19 ErbStG).
// Facts: /mnt/project-files/notes/de-life-law-facts-2026-11-22.md. General information, not legal or tax advice.
export const DE_LIFE_AS_OF = "2026-11-22";
                                                                  
const r2 = (n        ) => Math.round(n * 100) / 100;

const iso = (d      ) => d.toISOString().slice(0, 10);
const parse = (s        ) => { const d = new Date(`${s}T00:00:00Z`); return Number.isNaN(d.getTime()) ? null : d; };
const addDays = (d      , n        ) => new Date(d.getTime() + n * 86_400_000);
const addMonths = (d      , n        ) => { const x = new Date(d.getTime()); x.setUTCMonth(x.getUTCMonth() + n); return x; };

// ── Widerruf ─────────────────────────────────────────────────────────────
                                                           
export function widerruf(x                                                           ) {
  const s = parse(x.start);
  if (!s) return { ok: false         , error: "start date YYYY-MM-DD" };
  const items         = [
    { tone: "info", text: "Die Widerrufsfrist beträgt 14 Tage. Zur Fristwahrung genügt die rechtzeitige Absendung des Widerrufs.", cite: "§ 355 Abs. 1, 2 BGB" },
    { tone: "info", text: x.kind === "goods" ? "Beim Warenkauf beginnt die Frist, sobald Sie die Ware erhalten haben (bei Teillieferungen: die letzte Ware)." : x.kind === "digital" ? "Bei Strom, Gas, Wasser, Fernwärme und digitalen Inhalten ohne Datenträger beginnt die Frist mit Vertragsschluss." : "Bei Dienstleistungen beginnt die Frist mit Vertragsschluss.", cite: "§ 356 Abs. 2 BGB; § 355 Abs. 2 BGB" },
    { tone: "info", text: "Nach dem Widerruf sind empfangene Leistungen spätestens nach 14 Tagen zurückzugewähren.", cite: "§ 357 Abs. 1 BGB" },
  ];
  const normal = addDays(s, 14);
  const latest = addDays(addMonths(s, 12), 14);
  if (x.informed === false) items.push({ tone: "warn", text: "Ohne ordnungsgemäße Information beginnt die Frist nicht; das Widerrufsrecht erlischt aber spätestens zwölf Monate und 14 Tage nach dem Beginn.", cite: "§ 356 Abs. 3, 4 BGB" });
  items.push({ tone: "warn", text: "Fällt das Ende auf ein Wochenende oder einen Feiertag, wird hier nicht verschoben. Ausnahmen vom Widerrufsrecht (§ 312g BGB) werden nicht geprüft.", cite: "—" });
  return { ok: true         , deadline: iso(x.informed === false ? latest : normal), latest: iso(latest), items };
}

// ── Mietkaution ──────────────────────────────────────────────────────────
export function mietkaution(x                                      ) {
  const rent = Math.max(0, Number(x.coldRent) || 0);
  const max = r2(rent * 3);
  const asked = Number(x.asked) || 0;
  const items         = [
    { tone: "info", text: "Höchstens das Dreifache der Monatsmiete ohne als Pauschale oder Vorauszahlung ausgewiesene Betriebskosten.", cite: "§ 551 Abs. 1 BGB" },
    { tone: "info", text: `Sie dürfen in drei gleichen monatlichen Teilzahlungen zahlen (je ${r2(max / 3).toLocaleString("de-DE")} €): die erste zu Beginn des Mietverhältnisses, die weiteren mit den unmittelbar folgenden Mietzahlungen.`, cite: "§ 551 Abs. 2 BGB" },
  ];
  if (asked > max) items.push({ tone: "warn", text: `Verlangt sind ${asked.toLocaleString("de-DE")} €, das sind ${r2(asked - max).toLocaleString("de-DE")} € mehr als erlaubt.`, cite: "§ 551 Abs. 1 BGB" });
  items.push({ tone: "warn", text: "Gilt für Wohnraummiete. Allgemeine Information, keine Rechtsberatung.", cite: "—" });
  return { max, instalment: r2(max / 3), over: asked > max ? r2(asked - max) : 0, items };
}

// ── Verjährung ───────────────────────────────────────────────────────────
export function verjaehrung(x                                   ) {
  const a = parse(x.arose);
  if (!a) return { ok: false         , error: "arose date YYYY-MM-DD" };
  const k = x.known ? parse(x.known) : a;
  const startYear = Math.max(a.getUTCFullYear(), (k ?? a).getUTCFullYear());
  const regular = `${startYear + 3}-12-31`;
  const cap = iso(addMonths(a, 120));
  const end = regular < cap ? regular : cap;
  const items         = [
    { tone: "info", text: "Die regelmäßige Verjährungsfrist beträgt drei Jahre.", cite: "§ 195 BGB" },
    { tone: "info", text: `Sie beginnt mit dem Schluss des Jahres, in dem der Anspruch entstanden ist und Sie von den Umständen und dem Schuldner Kenntnis erlangt haben (hier Ende ${startYear}).`, cite: "§ 199 Abs. 1 BGB" },
    { tone: "info", text: "Ohne Kenntnis verjähren sonstige Ansprüche spätestens zehn Jahre nach ihrer Entstehung.", cite: "§ 199 Abs. 4 BGB" },
    { tone: "warn", text: "Schadensersatz wegen Verletzung von Leben, Körper, Gesundheit oder Freiheit: 30 Jahre; Sonderfristen (z. B. Gewährleistung, Miete) und Hemmung werden nicht berechnet.", cite: "§ 199 Abs. 2 BGB" },
  ];
  return { ok: true         , end, regular, cap, items };
}

// ── Pfändungsfreigrenzen (monthly, from 1 July 2026) ─────────────────────
export const PFAENDUNG_2026 = { base: 1_587.40, first: 597.42, further: 332.83, cap: 4_866.30, from: "2026-07-01" };
export function pfaendung(x                                      ) {
  const P = PFAENDUNG_2026;
  const d = Math.max(0, Math.min(5, Math.floor(Number(x.dependents) || 0)));
  const net = Math.max(0, Number(x.net) || 0);
  const rounded = Math.floor(net / 10) * 10;
  const free = r2(P.base + (d >= 1 ? P.first : 0) + Math.max(0, d - 1) * P.further);
  const share = 0.3 + (d >= 1 ? 0.2 : 0) + Math.max(0, d - 1) * 0.1;
  const counted = Math.min(rounded, P.cap);
  const excess = Math.max(0, counted - free);
  const seizable = r2(excess * (1 - share) + Math.max(0, rounded - P.cap));
  const items         = [
    { tone: "info", text: `Grundfreibetrag ${P.base.toLocaleString("de-DE")} € monatlich, plus ${P.first.toLocaleString("de-DE")} € für die erste und je ${P.further.toLocaleString("de-DE")} € für die zweite bis fünfte unterhaltsberechtigte Person (ab 1. Juli 2026).`, cite: "§ 850c Abs. 1, 2 ZPO; Pfändungsfreigrenzenbekanntmachung 2026" },
    { tone: "info", text: `Vom Mehrbetrag bleiben ${Math.round(share * 10)}/10 unpfändbar (3/10, plus 2/10 für die erste und je 1/10 für weitere Personen). Einkommen über ${P.cap.toLocaleString("de-DE")} € bleibt bei der Berechnung des unpfändbaren Betrags unberücksichtigt.`, cite: "§ 850c Abs. 3 ZPO" },
    { tone: "warn", text: "Nettoeinkommen auf volle 10 € abgerundet; Tabellenwerte können um Cent abweichen. P-Konto, Sozialleistungen und Unterhaltspfändung (§ 850d ZPO) nicht berechnet.", cite: "§ 850c Abs. 5 ZPO" },
  ];
  return { free, seizable, keeps: r2(net - seizable), items };
}

// ── Erbschaftsteuer ──────────────────────────────────────────────────────
                                                                                                                           
const CLASS                                 = { spouse: 1, child: 1, grandchild: 1, parentInherit: 1, classI: 1, sibling: 2, classII: 2, other: 3 };
const ALLOW                              = { spouse: 500_000, child: 400_000, grandchild: 200_000, parentInherit: 100_000, classI: 100_000, sibling: 20_000, classII: 20_000, other: 20_000 };
const BRACKETS                                       = [[75_000, [7, 15, 30]], [300_000, [11, 20, 30]], [600_000, [15, 25, 30]], [6_000_000, [19, 30, 30]], [13_000_000, [23, 35, 50]], [26_000_000, [27, 40, 50]], [Infinity, [30, 43, 50]]];

export function erbschaftsteuer(x                                          ) {
  const cls = CLASS[x.relation];
  const allowance = ALLOW[x.relation];
  const taxable = Math.max(0, (Number(x.value) || 0) - allowance);
  const idx = BRACKETS.findIndex(([lim]) => taxable <= lim);
  const rate = BRACKETS[idx][1][cls - 1];
  let tax = taxable * rate / 100;
  let hardship = false;
  if (idx > 0 && taxable > 0) {
    const [prevLim, prevRates] = BRACKETS[idx - 1];
    const prevRate = prevRates[cls - 1];
    if (prevRate < rate) {
      const alt = prevLim * prevRate / 100 + (taxable - prevLim) * (rate <= 30 ? 0.5 : 0.75);
      if (alt < tax) { tax = alt; hardship = true; }
    }
  }
  tax = Math.floor(tax);
  const items         = [
    { tone: "info", text: `Steuerklasse ${["I", "II", "III"][cls - 1]}, persönlicher Freibetrag ${allowance.toLocaleString("de-DE")} €.`, cite: "§§ 15, 16 ErbStG" },
    { tone: "info", text: `Steuersatz ${rate} % auf ${taxable.toLocaleString("de-DE")} € steuerpflichtigen Erwerb${hardship ? " (Härteausgleich angewendet)" : ""}.`, cite: hardship ? "§ 19 Abs. 1, 3 ErbStG" : "§ 19 Abs. 1 ErbStG" },
    { tone: "warn", text: "Versorgungsfreibetrag, Hausrat-Freibeträge, Familienheim, Betriebsvermögen und Vorerwerbe der letzten 10 Jahre sind nicht berücksichtigt. Wert = Ihr Erwerb nach Bewertung.", cite: "ErbStG" },
  ];
  return { taxClass: cls, allowance, taxable, rate, tax, hardship, items };
}
