// GENERATED from tools-oiyo src/lib/world-corporate-tax-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// National corporate income tax, 2026 (world audience gap P2: practitioner side).
// JP, UK, US, FR, ES, DE. Facts: /mnt/project-files/notes/corporate-tax-facts-2026-11-22.md.
// National tax only. Local and surcharge taxes not read are not computed (JP 地方法人税・住民税・事業税, FR contribution sociale, DE Soli, US state tax).
export const CIT_AS_OF = "2026-11-22";
                                                                 
                                                                  

const JP = "NTA タックスアンサー No.5759（令和8年4月1日現在）";
const UK = "GOV.UK Corporation Tax rates and allowances; HMRC CTM03925";
const US = "IRS Publication 542 (Rev. January 2024)";
const FR = "service-public.gouv.fr F23575 (vérifié le 17 février 2026)";
const ES = "AEAT Tipos de gravamen IS 2025 (art. 29 y DT 44 LIS)";
const DE = "§ 23 KStG; § 11 GewStG";

const r2 = (n        ) => Math.round(n * 100) / 100;

                        
                      
                 
       
                                                     
                                   
       
                                                                            
                                                        
                                                     
       
                                                               
       
                                                                   
       
                                                           
  

export function corporateTax(x          ) {
  const p = Math.max(0, Number(x.profit) || 0);
  const items         = [];
  let tax = 0;
  let local                = null;
  const c = x.country;
  if (c === "JP") {
    if (x.smallCapital) {
      const low = Math.min(p, 8_000_000);
      const lowRate = p > 1_000_000_000 ? 17 : x.excludedSme ? 19 : 15;
      tax = Math.floor(low * lowRate / 100) + Math.floor((p - low) * 23.2 / 100);
      items.push({ tone: "info", text: `年800万円以下 ${lowRate}%、超える部分 23.2%。`, cite: JP });
      items.push({ tone: "warn", text: "15% は令和9年3月31日までに開始する事業年度の特例です。所得10億円超の年は 17%、適用除外事業者は 19%。", cite: "財務省 法人課税に関する基本的な資料" });
    } else {
      tax = Math.floor(p * 23.2 / 100);
      items.push({ tone: "info", text: "普通法人 23.2%。", cite: JP });
    }
    items.push({ tone: "warn", text: "地方法人税・法人住民税・法人事業税は計算しません（国・地方の実効税率は財務省資料で 29.74%）。", cite: "財務省 法人課税に関する基本的な資料" });
  } else if (c === "UK") {
    const n = Math.max(1, 1 + Math.max(0, Math.floor(x.associated ?? 0)));
    const m = Math.min(12, Math.max(1, Number(x.months) || 12));
    const lower = 50_000 / n * m / 12, upper = 250_000 / n * m / 12;
    const a = p + Math.max(0, Number(x.distributions) || 0);
    if (a <= lower) {
      tax = p * 0.19;
      items.push({ tone: "info", text: "Small profits rate 19%.", cite: UK });
    } else if (a > upper) {
      tax = p * 0.25;
      items.push({ tone: "info", text: "Main rate 25%.", cite: UK });
    } else {
      const mr = (3 / 200) * (upper - a) * (a > 0 ? p / a : 0);
      tax = p * 0.25 - mr;
      items.push({ tone: "info", text: `Main rate 25% less marginal relief ${r2(mr).toLocaleString("en-GB")}: 3/200 × (upper limit − augmented profits) × (taxable profits ÷ augmented profits).`, cite: UK });
    }
    if (n > 1 || m < 12) items.push({ tone: "info", text: `Limits used: £${Math.round(lower).toLocaleString("en-GB")} and £${Math.round(upper).toLocaleString("en-GB")} (divided by ${n} for associated companies${m < 12 ? `, ${m} of 12 months` : ""}).`, cite: UK });
    items.push({ tone: "warn", text: "Not for non-UK resident companies, close investment holding companies or ring fence profits.", cite: UK });
  } else if (c === "US") {
    tax = p * 0.21;
    items.push({ tone: "info", text: "Federal corporate tax 21% of taxable income, including qualified personal service corporations.", cite: US });
    items.push({ tone: "warn", text: "State corporate income tax is not included.", cite: US });
  } else if (c === "FR") {
    if (x.frSme) {
      const low = Math.min(p, 42_500);
      tax = low * 0.15 + (p - low) * 0.25;
      items.push({ tone: "info", text: "Taux réduit 15 % jusqu'à 42 500 €, 25 % au-delà (CA ≤ 10 M€, capital libéré détenu à 75 % au moins par des personnes physiques).", cite: FR });
    } else {
      tax = p * 0.25;
      items.push({ tone: "info", text: "Taux normal 25 %.", cite: FR });
    }
    items.push({ tone: "warn", text: "La contribution sociale sur l'IS n'est pas calculée.", cite: FR });
  } else if (c === "ES") {
    const k = x.esKind ?? "general";
    if (k === "micro") {
      const low = Math.min(p, 50_000);
      tax = low * 0.19 + (p - low) * 0.21;
      items.push({ tone: "info", text: "Microempresa (cifra de negocios < 1 M€ en el periodo anterior), periodos que empiezan en 2026: 19 % hasta 50 000 €, 21 % el resto.", cite: ES });
    } else if (k === "reduced") {
      tax = p * 0.23;
      items.push({ tone: "info", text: "Entidad de reducida dimensión (art. 101 LIS), periodos que empiezan en 2026: 23 %.", cite: ES });
    } else if (k === "new") {
      tax = p * 0.15;
      items.push({ tone: "info", text: "Entidad de nueva creación: 15 %.", cite: ES });
    } else {
      tax = p * 0.25;
      items.push({ tone: "info", text: k === "patrimonial" ? "Entidad patrimonial: 25 % (no aplica tipos reducidos)." : "Tipo general 25 %.", cite: ES });
    }
  } else if (c === "DE") {
    tax = p * 0.15;
    items.push({ tone: "info", text: "Körperschaftsteuer 15 % (VZ bis 2027; ab 2028 sinkt der Satz jährlich um 1 Punkt bis 10 % ab 2032).", cite: DE });
    const h = Number(x.hebesatz);
    if (h > 0) {
      local = p * 0.035 * h / 100;
      items.push({ tone: "info", text: `Gewerbesteuer: 3,5 % Steuermesszahl × Hebesatz ${h} %. Gewinn als Gewerbeertrag angenommen (Hinzurechnungen und Kürzungen nicht berücksichtigt).`, cite: DE });
    } else {
      items.push({ tone: "warn", text: "Gewerbesteuer nur mit Hebesatz der Gemeinde berechnet.", cite: DE });
    }
    items.push({ tone: "warn", text: "Solidaritätszuschlag nicht addiert; Freibeträge nach § 11 Abs. 1 GewStG nicht abgezogen.", cite: DE });
  }
  tax = r2(tax);
  const total = r2(tax + (local ?? 0));
  items.push({ tone: "warn", text: "General information on statutory rates, not tax advice. Taxable profit is your input; adjustments, credits and losses are not applied.", cite: "—" });
  return { asOf: CIT_AS_OF, country: c, profit: p, tax, local: local == null ? null : r2(local), total, effective: p > 0 ? r2(total / p * 100) : 0, items };
}
