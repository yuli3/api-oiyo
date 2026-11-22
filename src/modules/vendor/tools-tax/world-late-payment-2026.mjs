// GENERATED from tools-oiyo src/lib/world-late-payment-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// Statutory late-payment interest between businesses (2026-11-22, world audience gap P3: practitioner side).
// DE (§ 288 BGB), FR (art. L441-10 C. com.), ES (Ley 3/2004), UK (Late Payment of Commercial Debts (Interest) Act 1998).
// Facts: /mnt/project-files/notes/late-payment-facts-2026-11-22.md. A rate for a half-year we have not read is not invented:
// the earliest known rate is used and the result says so.
export const LATE_AS_OF = "2026-11-22";
                                                    
                                                                  
                                                            
const r2 = (n        ) => Math.round(n * 100) / 100;

// Annual statutory rates (%), by start of half-year.
const RATES                                               = {
  DE: [{ from: "2026-07-01", rate: 10.52, label: "Basiszinssatz 1,52 % + 9 Prozentpunkte" }],
  FR: [{ from: "2026-01-01", rate: 12.15, label: "taux BCE 2,15 % + 10 points" }, { from: "2026-07-01", rate: 12.4, label: "taux BCE 2,40 % + 10 points" }],
  ES: [{ from: "2026-07-01", rate: 10.4, label: "tipo BCE 2,40 % + 8 puntos" }],
};
const CITE = {
  DE: "§ 288 Abs. 2, 5 BGB; Basiszinssatz 1. Juli 2026 (Bundesbank, IHK Stuttgart)",
  FR: "art. L441-10 Code de commerce; service-public F23211 (vérifié le 7 août 2026)",
  ES: "Ley 3/2004, art. 7; Resolución de 30 de junio de 2026 (BOE 1-7-2026)",
  UK: "Late Payment of Commercial Debts (Interest) Act 1998, s.5A; GOV.UK claim debt recovery costs",
};
const day = (s        ) => Date.parse(`${s}T00:00:00Z`) / 86_400_000;
const iso = (d        ) => new Date(d * 86_400_000).toISOString().slice(0, 10);

export function ukCompensation(amount        ) {
  return amount < 1_000 ? 40 : amount < 10_000 ? 70 : 100;
}

export function lateInterest(x                                                                                                                  ) {
  const amount = Math.max(0, Number(x.amount) || 0);
  const a = day(x.due), b = day(x.paid);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return { ok: false         , error: "dates YYYY-MM-DD" };
  const days = Math.max(0, b - a);
  const items         = [];
  const segs                                                                               = [];
  let compensation = 0;
  if (x.country === "UK") {
    const base = Number(x.baseRate);
    if (!(base >= 0)) return { ok: false         , error: "baseRate (Bank of England reference rate, %) is required for the UK" };
    const rate = 8 + base;
    const interest = amount * rate / 100 * days / 365;
    segs.push({ from: x.due, to: x.paid, days, rate, interest: r2(interest) });
    compensation = days > 0 ? ukCompensation(amount) : 0;
    items.push({ tone: "info", text: `Statutory interest: 8% plus the Bank of England base rate you entered (${base}%) = ${rate}% a year.`, cite: "Small Business Commissioner, interest calculator guidance" });
    items.push({ tone: "info", text: "Fixed compensation: £40 under £1,000, £70 from £1,000 to £9,999.99, £100 from £10,000. Charge it once for each payment.", cite: CITE.UK });
    items.push({ tone: "warn", text: "Which base rate applies to which six-month period was not read here: enter the reference rate yourself. Bank Rate was 3.75% after the June 2026 decision and 4% after 5 November 2026. Interest can run for up to 6 years.", cite: "Bank of England" });
  } else {
    const P = RATES[x.country];
    if (x.country === "DE" && x.consumerDebtor) items.push({ tone: "info", text: "Schuldner ist Verbraucher: Basiszinssatz + 5 Prozentpunkte (6,52 %), keine 40-€-Pauschale.", cite: "§ 288 Abs. 1 BGB" });
    let cur = a;
    while (cur < b) {
      let idx = -1;
      for (let i = 0; i < P.length; i++) if (day(P[i].from) <= cur) idx = i;
      const p = P[Math.max(0, idx)];
      const next = idx + 1 < P.length ? day(P[idx + 1].from) : Infinity;
      const end = Math.min(b, idx < 0 ? day(P[0].from) : next);
      const rate = x.country === "DE" && x.consumerDebtor ? p.rate - 4 : p.rate;
      const d = end - cur;
      segs.push({ from: iso(cur), to: iso(end), days: d, rate, interest: r2(amount * rate / 100 * d / 365) });
      if (idx < 0) items.push({ tone: "warn", text: `Für die Zeit vor ${P[0].from} wurde kein Satz gelesen; der Satz ab ${P[0].from} wurde verwendet. / No rate read before ${P[0].from}; the later rate was used.`, cite: CITE[x.country] });
      cur = end;
    }
    compensation = days > 0 && x.country !== "ES" && !(x.country === "DE" && x.consumerDebtor) ? 40 : 0;
    const label = P.map((q) => `${q.from}: ${q.rate} % (${q.label})`).join("; ");
    items.push({ tone: "info", text: x.country === "DE" ? `Verzugszins zwischen Unternehmen: ${label}. Pauschale 40 € (§ 288 Abs. 5 BGB).` : x.country === "FR" ? `Pénalités de retard : ${label}, au moins 3 fois le taux d'intérêt légal (8,25 % au 2e semestre 2026). Indemnité forfaitaire 40 € par facture.` : `Interés de demora en operaciones comerciales: ${label}. La indemnización por costes de cobro no se calcula (no leída).`, cite: CITE[x.country] });
    if (x.country === "ES") items.push({ tone: "warn", text: "El tipo del primer semestre de 2026 no se ha leído.", cite: CITE.ES });
  }
  const interest = r2(segs.reduce((s, q) => s + q.interest, 0));
  items.push({ tone: "warn", text: "Simple interest on the gross amount, actual days / 365. Contract terms may set a higher rate. General information, not legal advice; no collection letters or claims are filed.", cite: "—" });
  return { ok: true         , asOf: LATE_AS_OF, country: x.country, amount, days, interest, compensation, total: r2(interest + compensation), segments: segs, items };
}
