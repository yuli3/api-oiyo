// GENERATED from tools-oiyo src/lib/world-withholding-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// Domestic withholding tax on payments to non-residents (2026-11-22, world audience gap P1: practitioner side).
// JP, US, FR, ES, TW, DE. Domestic rates only: tax treaties can lower them and are not applied.
// Facts: /mnt/project-files/notes/withholding-facts-2026-11-22.md. A rate not on the page we read is null and not computed.
// Not covered (not verified): UK, Singapore, mainland China.
export const WHT_AS_OF = "2026-11-22";
                                                                 
                                                                                                        
                                                                

const JP = "NTA タックスアンサー No.2884";
const US = "IRS Withholding on specific income / FDAP";
const FR = "BOFiP BOI-IR-DOMIC-10-20-20-50 (art. 182 B CGI)";
const ES = "AEAT Tipos de gravamen IRNR sin establecimiento permanente";
const TW = "財政部 外僑綜合所得稅（非居住者扣繳率）";
const DE = "§ 50a EStG";

export const WHT_RULES                                            = {
  JP: {
    interest: { rate: 15.315, note: "利子等 15.315%（復興特別所得税込み）。", cite: JP },
    dividend: { rate: 20.42, note: "配当 20.42%。上場株式等（発行済株式の3%以上の保有者を除く）は 15.315%。", cite: JP },
    royalty: { rate: 20.42, note: "工業所有権・著作権等の使用料 20.42%。", cite: JP },
    services: { rate: 20.42, note: "人的役務の提供事業の対価 20.42%。", cite: JP },
    salary: { rate: 20.42, note: "給与その他人的役務の提供に対する報酬 20.42%。", cite: JP },
    director: { rate: null, note: "役員報酬は個別の行として載っていないため計算しません。", cite: JP },
    rent: { rate: 20.42, note: "不動産の賃貸料 20.42%（個人が自己・親族の居住用に借りる場合は不要）。", cite: JP },
  },
  US: {
    interest: { rate: 30, note: "30% on US-source FDAP income not effectively connected, on the gross amount. Portfolio interest rules were not read and are not applied.", cite: US },
    dividend: { rate: 30, note: "30% on US-source FDAP income not effectively connected, on the gross amount.", cite: US },
    royalty: { rate: 30, note: "30% on US-source FDAP income not effectively connected, on the gross amount.", cite: US },
    services: { rate: null, note: "Pay for personal services is withheld at graduated rates (Circular E) or not at all if effectively connected; not computed.", cite: US },
    salary: { rate: null, note: "Wages are withheld at graduated rates (Circular E); not computed.", cite: US },
    director: { rate: null, note: "Not stated on the pages read.", cite: US },
    rent: { rate: 30, note: "30% on US-source FDAP income not effectively connected, on the gross amount.", cite: US },
  },
  FR: {
    interest: { rate: null, note: "Non indiqué sur la page lue.", cite: FR },
    dividend: { rate: null, note: "Non indiqué sur la page lue.", cite: FR },
    royalty: { rate: 25, note: "Retenue art. 182 B au taux normal de l'IS (25 % indiqué pour 2024). 75 % si le bénéficiaire est dans un ETNC.", cite: FR },
    services: { rate: 25, note: "Prestations utilisées en France : taux normal de l'IS (25 % indiqué pour 2024). 75 % si le bénéficiaire est dans un ETNC.", cite: FR },
    salary: { rate: null, note: "Non calculé ici.", cite: FR },
    director: { rate: null, note: "Non indiqué sur la page lue.", cite: FR },
    rent: { rate: null, note: "Non indiqué sur la page lue.", cite: FR },
  },
  ES: {
    interest: { rate: 19, note: "Intereses 19 %.", cite: ES },
    dividend: { rate: 19, note: "Dividendos 19 %.", cite: ES },
    royalty: { rate: 24, note: "Tipo general 24 % (19 % para residentes en la UE, Islandia y Noruega). La página solo da el tipo general.", cite: ES },
    services: { rate: 24, note: "Tipo general 24 % (19 % para residentes en la UE, Islandia y Noruega). La página solo da el tipo general.", cite: ES },
    salary: { rate: 24, note: "Tipo general 24 % (19 % para residentes en la UE, Islandia y Noruega); temporeros 2 %.", cite: ES },
    director: { rate: null, note: "No indicado en la página leída.", cite: ES },
    rent: { rate: 24, note: "Tipo general 24 % (19 % para residentes en la UE, Islandia y Noruega).", cite: ES },
  },
  TW: {
    interest: { rate: 20, note: "利息 20%；公債、公司債、短期票券等 15%。", cite: TW },
    dividend: { rate: 21, note: "股利 21%。", cite: TW },
    royalty: { rate: 20, note: "權利金 20%。", cite: TW },
    services: { rate: 20, note: "執行業務報酬 20%。", cite: TW },
    salary: { rate: 18, note: "薪資 18%；全月薪資不超過基本工資 1.5 倍者 6%。", cite: TW },
    director: { rate: null, note: "董事報酬未在所讀頁面單獨列出。", cite: TW },
    rent: { rate: 20, note: "租金 20%。", cite: TW },
  },
  DE: {
    interest: { rate: null, note: "Kapitalertragsteuer nicht gelesen; nicht berechnet.", cite: DE },
    dividend: { rate: null, note: "Kapitalertragsteuer nicht gelesen; nicht berechnet.", cite: DE },
    royalty: { rate: 15, note: "15 % der Einnahmen für die Überlassung von Rechten (§ 50a Abs. 1 Nr. 3). Solidaritätszuschlag steht nicht in § 50a und wird nicht addiert.", cite: DE },
    services: { rate: null, note: "Nur Darbietungen sind in § 50a mit 15 % genannt (Bagatellgrenze 250 € je Darbietung); andere Dienstleistungen nicht berechnet.", cite: DE },
    salary: { rate: null, note: "Löhne mit Lohnsteuerabzug sind von § 50a ausgenommen; nicht berechnet.", cite: DE },
    director: { rate: 30, note: "Aufsichtsratsvergütungen 30 % der Einnahmen (§ 50a Abs. 1 Nr. 4).", cite: DE },
    rent: { rate: null, note: "Nicht in § 50a; nicht berechnet.", cite: DE },
  },
};

export function withholding(x                                                                                                                                                         ) {
  const c = x.country, t = x.type;
  const rule = WHT_RULES[c]?.[t];
  if (!rule) return { asOf: WHT_AS_OF, country: c, type: t, covered: false, rate: null, tax: null, note: "Country or payment type not covered.", items: [] };
  let rate = rule.rate;
  if (rate != null) {
    if (c === "JP" && t === "dividend" && x.listedShares) rate = 15.315;
    if (c === "ES" && x.euEea && rate === 24) rate = 19;
    if (c === "TW" && t === "interest" && x.listedBond) rate = 15;
    if (c === "TW" && t === "salary" && x.lowPay) rate = 6;
    if (c === "FR" && x.etnc) rate = 75;
  }
  const amount = Math.max(0, Number(x.amount) || 0);
  const tax = rate == null ? null : Math.floor(amount * rate) / 100;
  const items = [
    { tone: rate == null ? "warn" : "info", text: rule.note, cite: rule.cite },
    { tone: "warn", text: "Domestic rate only: a tax treaty can lower it (forms and residence certificates are needed). Not tax advice.", cite: "—" },
  ];
  if (c === "JP") items.push({ tone: "warn", text: "令和9年分からは防衛特別所得税が加わりますが、ここでは計算しません。", cite: JP });
  return { asOf: WHT_AS_OF, country: c, type: t, covered: rate != null, rate, amount, tax, net: tax == null ? null : Math.round((amount - tax) * 100) / 100, items };
}
