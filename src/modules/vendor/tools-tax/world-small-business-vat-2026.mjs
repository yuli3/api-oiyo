// GENERATED from tools-oiyo src/lib/world-small-business-vat-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// Small business VAT/GST registration check (2026-11-22, world audience gap P6: practitioner side).
// DE § 19 UStG Kleinunternehmer (from 2025) and Singapore GST registration (S$1 million).
// Facts: /mnt/project-files/notes/de-sg-facts-2026-11-22.md (P6). Rules that were not read are flagged, not computed.
export const SMALL_VAT_AS_OF = "2026-11-22";
                                                                  
const pos = (n         ) => Math.max(0, Number(n) || 0);
const addDays = (iso        , n        ) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);
function addMonths(iso        , m        ) {
  const d = new Date(`${iso}T00:00:00Z`);
  const day = d.getUTCDate();
  const y = d.getUTCFullYear(), mo = d.getUTCMonth() + m;
  const last = new Date(Date.UTC(y, mo + 1, 0)).getUTCDate();
  return new Date(Date.UTC(y, mo, Math.min(day, last))).toISOString().slice(0, 10);
}

export function deKleinunternehmer(x                                                                                    ) {
  const prior = pos(x.priorYear), cur = pos(x.currentYear);
  const items         = [];
  let status                                                                               ;
  if (x.optedOut) {
    status = "verzicht";
    items.push({ tone: "info", text: "Verzicht auf die Kleinunternehmerregelung: Regelbesteuerung, der Verzicht bindet für fünf Jahre.", cite: "§ 19 UStG; MdF Sachsen-Anhalt PM 42/2024" });
  } else if (!x.founded && prior > 25_000) {
    status = "regelbesteuerung";
    items.push({ tone: "warn", text: `Vorjahresumsatz ${prior.toLocaleString("de-DE")} € netto über 25.000 €: keine Kleinunternehmerregelung in diesem Jahr.`, cite: "§ 19 Abs. 1 UStG (ab 2025)" });
  } else if (cur > 100_000) {
    status = "wechsel_unterjaehrig";
    items.push({ tone: "warn", text: "Laufendes Jahr über 100.000 € netto: Wechsel zur Regelbesteuerung noch im Jahr. Umsätze bis dahin bleiben steuerfrei. Ab welchem Umsatz genau umgestellt wird, ist hier nicht geprüft.", cite: "MdF Sachsen-Anhalt PM 42/2024" });
  } else {
    status = "kleinunternehmer";
    items.push({ tone: "info", text: "Kleinunternehmer: keine Umsatzsteuer auf Rechnungen. Auf der Rechnung auf die Steuerfreiheit hinweisen.", cite: "§ 19 UStG; § 34 UStDV" });
  }
  if (x.founded) items.push({ tone: "warn", text: "Gründungsjahr: Neugründer starten automatisch als Kleinunternehmer ohne Prognose. Die Umsatzgrenze im Gründungsjahr ist hier nicht geprüft.", cite: "MdF Sachsen-Anhalt PM 42/2024" });
  items.push({ tone: "info", text: "Grenzen seit 1.1.2025: Vorjahr bis 25.000 €, laufendes Jahr bis 100.000 €, jeweils netto (vorher 22.000 € und 50.000 € brutto).", cite: "IHK Schwerin" });
  items.push({ tone: "info", text: "Kleinunternehmer müssen E-Rechnungen empfangen können, aber nicht ausstellen.", cite: "§ 34a UStDV; IHK" });
  return { ok: true         , status, chargesVat: status !== "kleinunternehmer", items };
}

export function sgGstRegistration(x                                                                                   ) {
  const past = pos(x.calendarYearTurnover), fc = pos(x.forecastNext12);
  const items         = [];
  const retro = past > 1_000_000;
  const pro = fc > 1_000_000;
  let applyBy                = null, registeredFrom                = null;
  if (retro) items.push({ tone: "warn", text: `Calendar-year turnover S$${past.toLocaleString("en-SG")} is over S$1 million: liable to register (retrospective view). The deadline and effective date for this case are not computed here.`, cite: "IRAS TaxBytes: Are you liable to register for GST" });
  if (pro) {
    const d = x.forecastDate && /^\d{4}-\d{2}-\d{2}$/.test(x.forecastDate) ? x.forecastDate : null;
    if (d && d >= "2025-07-01") {
      applyBy = addDays(d, 30);
      registeredFrom = addMonths(d, 2);
      items.push({ tone: "warn", text: `Expected turnover over S$1 million in the next 12 months (prospective view): apply within 30 days of ${d} (by ${applyBy}); you are registered 2 months from the forecast date (${registeredFrom}).`, cite: "IRAS TaxBytes: Are you liable to register for GST" });
    } else items.push({ tone: "warn", text: "Expected turnover over S$1 million in the next 12 months (prospective view): liable to register. Enter the forecast date (on or after 1 July 2025) to get the dates.", cite: "IRAS TaxBytes: Are you liable to register for GST" });
  }
  if (!retro && !pro) items.push({ tone: "info", text: "Neither view is over S$1 million: no compulsory GST registration on these figures. Voluntary registration has its own conditions, not checked here.", cite: "IRAS" });
  items.push({ tone: "info", text: "Once registered you charge GST at 9%. Registering late: registration is backdated, GST is due on past sales, with a fine of up to S$10,000 and a 10% penalty.", cite: "IRAS current GST rates; IRAS TaxBytes" });
  return { ok: true         , liable: retro || pro, retrospective: retro, prospective: pro, applyBy, registeredFrom, items };
}

export function smallBusinessVat(x                                                    ) {
  if (x.country === "DE") return deKleinunternehmer(x         );
  if (x.country === "SG") return sgGstRegistration(x         );
  return { ok: false         , error: "country must be DE or SG" };
}
