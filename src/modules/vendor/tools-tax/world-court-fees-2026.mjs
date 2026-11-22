// GENERATED from tools-oiyo src/lib/world-court-fees-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// Court fees for civil claims (2026-11-22, world audience gap P4: practitioner side).
// Japan 民事訴訟費用等に関する法律 別表第一 and Germany GKG § 34 + Kostenverzeichnis 1100/1210/1211.
// UK money claim fees already live in world-limitation-pack-2026 (ukClaimFee).
// Facts: /mnt/project-files/notes/court-fees-facts-2026-11-22.md. New-law (2026-05-21) Japanese amounts were not read reliably: flagged, not computed.
export const COURT_FEES_AS_OF = "2026-11-22";
                                                                  
const pos = (n         ) => Math.max(0, Number(n) || 0);
const yen = (n        ) => `${n.toLocaleString("ja-JP")}円`;
const eur = (n        ) => `${n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

// [upper bound of band, unit, fee per started unit]
                                     
const JP_SUIT         = [[1_000_000, 100_000, 1_000], [5_000_000, 200_000, 1_000], [10_000_000, 500_000, 2_000], [1_000_000_000, 1_000_000, 3_000], [5_000_000_000, 5_000_000, 10_000], [Infinity, 10_000_000, 10_000]];
const JP_CHOTEI         = [[1_000_000, 100_000, 500], [5_000_000, 200_000, 500], [10_000_000, 500_000, 1_000], [1_000_000_000, 1_000_000, 1_200], [5_000_000_000, 5_000_000, 4_000], [Infinity, 10_000_000, 4_000]];
function banded(value        , bands        ) {
  let fee = 0, lower = 0;
  for (const [upper, unit, per] of bands) {
    if (value <= lower) break;
    const part = Math.min(value, upper) - lower;
    fee += Math.ceil(part / unit) * per;
    lower = upper;
  }
  return fee;
}
export const jpSuitFee = (value        ) => banded(Math.max(1, pos(value)), JP_SUIT);
                                                                          
const JP_LABEL                         = { suit: "訴えの提起", appeal: "控訴の提起 (1.5倍)", jokoku: "上告の提起 (2倍)", shiharai: "支払督促 (2分の1)", chotei: "民事調停・労働審判" };

export function jpCourtFee(x                                                                               ) {
  const kind = x.kind ?? "suit";
  const value = x.nonProperty ? 1_600_000 : pos(x.value);
  if (value <= 0) return { ok: false         , error: "value (訴訟の目的の価額, 円) or nonProperty is required" };
  const base = jpSuitFee(value);
  const fee = kind === "suit" ? base : kind === "appeal" ? Math.floor(base * 1.5) : kind === "jokoku" ? base * 2 : kind === "shiharai" ? Math.floor(base / 2) : banded(value, JP_CHOTEI);
  const items         = [
    { tone: "info", text: `訴額 ${yen(value)}${x.nonProperty ? " (非財産権上の請求などは160万円とみなす)" : ""} の${JP_LABEL[kind]}: 手数料 ${yen(fee)}。`, cite: "民事訴訟費用等に関する法律 別表第一" },
    { tone: "info", text: "訴えの手数料は、100万円まで10万円ごとに1,000円、500万円まで20万円ごとに1,000円、1,000万円まで50万円ごとに2,000円、10億円まで100万円ごとに3,000円 (以下略) を積み上げます。", cite: "民事訴訟費用等に関する法律 別表第一 1項" },
  ];
  const newLaw = !x.firstFiled || x.firstFiled >= "2026-05-21";
  if (newLaw && kind !== "chotei") items.push({ tone: "warn", text: "当初の訴えが令和8年5月21日以後の事件 (新法適用事件) は、書面か電子申立てかで手数料が変わります。この額は旧法の表による額で、新法の額は計算していません。裁判所の手数料額早見表 (R8.9.15改訂) で確認してください。", cite: "裁判所「手数料」; 手数料額早見表 ※4" });
  if (value > 100_000_000) items.push({ tone: "warn", text: "訴額が1億円を超える場合は、裁判所の窓口で額を確認するよう早見表に書かれています。", cite: "手数料額早見表" });
  items.push({ tone: "info", text: "このほか送達用の郵便料などがかかることがあります (ここでは計算していません)。", cite: "裁判所「手数料」" });
  return { ok: true         , value, kind, fee, oldLawTable: true, items };
}

// Germany GKG § 34: [upper bound, step, increase per started step]
const GKG         = [[2_000, 500, 21], [10_000, 1_000, 22.5], [25_000, 3_000, 30.5], [50_000, 5_000, 40.5], [200_000, 15_000, 140], [500_000, 30_000, 210], [Infinity, 50_000, 210]];
export function gkgFee(value        ) {
  const v = pos(value);
  let fee = 40, lower = 500;
  for (const [upper, step, inc] of GKG) {
    if (v <= lower) break;
    fee += Math.ceil((Math.min(v, upper) - lower) / step) * inc;
    lower = upper;
  }
  return Math.round(fee * 100) / 100;
}
                                                           
export function deCourtFee(x                                  ) {
  const v = pos(x.value);
  if (v <= 0) return { ok: false         , error: "value (Streitwert, €) is required" };
  const kind = x.kind ?? "klage";
  const one = gkgFee(v);
  const rate = kind === "klage" ? 3 : kind === "klage_ermaessigt" ? 1 : 0.5;
  const fee = Math.round(Math.max(kind === "mahn" ? 38 : 15, one * rate) * 100) / 100;
  const items         = [
    { tone: "info", text: `Streitwert ${eur(v)}: eine Gebühr nach § 34 GKG = ${eur(one)}.`, cite: "§ 34 GKG, Anlage 2" },
    { tone: "info", text: kind === "mahn" ? `Mahnbescheid: 0,5 Gebühren = ${eur(fee)} (mindestens 38 €). Wird später geklagt, wird sie auf die 3,0-Gebühr angerechnet.` : kind === "klage" ? `Klage erster Instanz: 3,0 Gebühren = ${eur(fee)}, mit der Klage vorauszuzahlen.` : `Ermäßigt auf 1,0 Gebühr = ${eur(fee)}: z. B. Klagerücknahme rechtzeitig, Anerkenntnis- oder Verzichtsurteil, gerichtlicher Vergleich.`, cite: kind === "mahn" ? "KV GKG Nr. 1100" : kind === "klage" ? "KV GKG Nr. 1210" : "KV GKG Nr. 1211" },
    { tone: "warn", text: "Nur Gerichtsgebühren: Anwaltskosten (RVG), Auslagen und Zustellkosten sind nicht enthalten. Wer am Ende zahlt, entscheidet das Gericht.", cite: "GKG" },
  ];
  return { ok: true         , value: v, kind, oneFee: one, rate, fee, items };
}

export function courtFee(x                                                    ) {
  if (x.country === "JP") return jpCourtFee(x         );
  if (x.country === "DE") return deCourtFee(x         );
  return { ok: false         , error: "country must be JP or DE (UK: check_uk_limitation_small_claims)" };
}
