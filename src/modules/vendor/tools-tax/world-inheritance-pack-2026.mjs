// GENERATED from tools-oiyo src/lib/world-inheritance-pack-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 5-jurisdiction inheritance and gift pack (2026-11-22, world pro-gap #3): filing deadlines and basic allowances.
// General information and estimates only: no tax or legal advice, no representation, no filing.
// Facts: /mnt/project-files/notes/inheritance-facts-2026-11-22.md (NTA タックスアンサー No.4102/4152/4155/4402/4408,
// gov.uk inheritance-tax + thresholds publication, irs.gov estate and gift tax pages, service-public F35794 + impots.gouv,
// law.moj.gov.tw 遺產及贈與稅法 115-09-11 amendment).
// Not computed because not verified: JP 配偶者の税額軽減 and credits, UK RNRB taper above £2m and transferable NRB,
// US estate tax rate table and state taxes, FR intérêts de retard and donation rules, TW 115年 免稅額/扣除額/級距 and 贈與稅 deadline.
// China and Spain are not covered.

export const INHERITANCE_AS_OF = "2026-11-22";
                                            
                                                               
                                                                              

const iso = (d      ) => d.toISOString().slice(0, 10);
export const addMonths = (s        , n        ) => {
  const [y, m, d] = s.split("-").map(Number);
  const last = new Date(Date.UTC(y, m - 1 + n + 1, 0)).getUTCDate();
  return iso(new Date(Date.UTC(y, m - 1 + n, Math.min(d, last))));
};
const endOfMonthAfter = (s        , n        ) => { const [y, m] = s.split("-").map(Number); return iso(new Date(Date.UTC(y, m - 1 + n + 1, 0))); };
const ok = (s         ) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
const pos = (n         ) => Math.max(0, Number(n) || 0);
                                                           
const quick = (x        , table           ) => { const b = table.find(([u]) => x <= u) ; return Math.max(0, x * b[1] - b[2]); };
const progressive = (x        , bands                                ) => {
  let tax = 0, low = 0;
  for (const [up, r] of bands) { if (x <= low) break; tax += (Math.min(x, up) - low) * r; low = up; }
  return tax;
};

// ── Japan ────────────────────────────────────────────────────────────
const MAN = 10_000;
export const JP_INHERITANCE_TABLE            = [
  [1_000 * MAN, 0.10, 0], [3_000 * MAN, 0.15, 50 * MAN], [5_000 * MAN, 0.20, 200 * MAN], [10_000 * MAN, 0.30, 700 * MAN],
  [20_000 * MAN, 0.40, 1_700 * MAN], [30_000 * MAN, 0.45, 2_700 * MAN], [60_000 * MAN, 0.50, 4_200 * MAN], [Infinity, 0.55, 7_200 * MAN],
];
export const JP_GIFT_GENERAL            = [
  [200 * MAN, 0.10, 0], [300 * MAN, 0.15, 10 * MAN], [400 * MAN, 0.20, 25 * MAN], [600 * MAN, 0.30, 65 * MAN],
  [1_000 * MAN, 0.40, 125 * MAN], [1_500 * MAN, 0.45, 175 * MAN], [3_000 * MAN, 0.50, 250 * MAN], [Infinity, 0.55, 400 * MAN],
];
export const JP_GIFT_SPECIAL            = [
  [200 * MAN, 0.10, 0], [400 * MAN, 0.15, 10 * MAN], [600 * MAN, 0.20, 30 * MAN], [1_000 * MAN, 0.30, 90 * MAN],
  [1_500 * MAN, 0.40, 190 * MAN], [3_000 * MAN, 0.45, 265 * MAN], [4_500 * MAN, 0.50, 415 * MAN], [Infinity, 0.55, 640 * MAN],
];
/** 相続税の総額 (before 配偶者の税額軽減 and credits). shares = 法定相続分 per heir (sum 1); equal shares if omitted. */
export function jpInheritance(x                                                                      ) {
  const items          = [];
  const dates          = [];
  const heirs = Math.max(0, Math.floor(pos(x.heirs)));
  const basic = 3_000 * MAN + 600 * MAN * heirs;
  const taxable = Math.max(0, pos(x.estate) - basic);
  const shares = x.shares?.length ? x.shares.map(pos) : Array.from({ length: Math.max(1, heirs) }, () => 1 / Math.max(1, heirs));
  const total = Math.floor(shares.reduce((s, sh) => s + quick(taxable * sh, JP_INHERITANCE_TABLE), 0)); // 端数処理は未確認のため円未満切捨てのみ
  items.push({ tone: taxable ? "warn" : "good", text: taxable ? `課税価格の合計が基礎控除（${(basic / MAN).toLocaleString("ja-JP")}万円）を超えるため、申告が必要です。` : `課税価格の合計が基礎控除（${(basic / MAN).toLocaleString("ja-JP")}万円）以下なので、相続税はかかりません。`, cite: "国税庁 No.4102・4152" });
  if (taxable) items.push({ tone: "info", text: "相続税の総額は、各相続人の法定相続分に応ずる取得金額に速算表を当てはめて合計した額です。実際の納付額は、配偶者の税額軽減や各種の税額控除を差し引くため少なくなることがありますが、ここでは計算していません。", cite: "国税庁 No.4155" });
  items.push({ tone: "info", text: "法定相続人の数に数える養子は、実子がいれば1人、いなければ2人までです。", cite: "国税庁 No.4152" });
  if (ok(x.death)) dates.push({ id: "file", label: "相続税の申告・納税期限（死亡を知った日の翌日から10か月以内）", date: addMonths(x.death , 10), cite: "国税庁 No.4102" });
  return { asOf: INHERITANCE_AS_OF, basicDeduction: basic, taxable, totalTax: total, items, dates, help: "税務署の電話相談センター、税理士会の無料税務相談" };
}
export function jpGift(x                                                     ) {
  const items          = [];
  const dates          = [];
  const after = Math.max(0, pos(x.amount) - 110 * MAN);
  const tax = Math.floor(quick(after, x.special ? JP_GIFT_SPECIAL : JP_GIFT_GENERAL));
  items.push({ tone: after ? "warn" : "good", text: after ? `1年間にもらった財産が基礎控除110万円を超えるため、贈与税の申告が必要です（${x.special ? "特例税率" : "一般税率"}）。` : "1年間にもらった財産が110万円以下なので、贈与税はかかりません。", cite: "国税庁 No.4402・4408" });
  items.push({ tone: "info", text: "特例税率は、18歳以上の人が父母や祖父母など直系尊属からもらった財産に使います。相続時精算課税は計算していません。", cite: "国税庁 No.4408" });
  if (x.year) dates.push({ id: "file", label: "贈与税の申告・納税期間の最終日（翌年2月1日〜3月15日）", date: `${x.year + 1}-03-15`, cite: "国税庁 No.4402" });
  return { asOf: INHERITANCE_AS_OF, taxable: after, tax, items, dates, help: "税務署の電話相談センター" };
}

// ── UK ───────────────────────────────────────────────────────────────
export const UK_NRB = 325_000, UK_RNRB = 175_000;
export const UK_TAPER                                     = [[3, 0.40], [4, 0.32], [5, 0.24], [6, 0.16], [7, 0.08]];
export const ukGiftRate = (yearsBeforeDeath        ) => (UK_TAPER.find(([y]) => yearsBeforeDeath < y)?.[1] ?? 0);
export function ukInheritance(x                                                                                                          ) {
  const items          = [];
  const dates          = [];
  const estate = pos(x.estate);
  const rnrb = x.homeToDescendants ? Math.min(UK_RNRB, pos(x.homeValue ?? UK_RNRB)) : 0;
  const threshold = UK_NRB + rnrb;
  const taxable = Math.max(0, estate - threshold);
  const rate = x.charity10 ? 0.36 : 0.40;
  const tax = Math.round(taxable * rate);
  items.push({ tone: taxable ? "warn" : "good", text: taxable ? `The estate is above the £${threshold.toLocaleString("en-GB")} threshold, so Inheritance Tax at ${rate * 100}% is due on the part above it.` : `The estate is within the £${threshold.toLocaleString("en-GB")} threshold, so no Inheritance Tax is due.`, cite: "gov.uk/inheritance-tax" });
  items.push({ tone: "info", text: "Everything left to a spouse or civil partner, or to a charity, is exempt; enter the estate after those gifts. An unused threshold may pass to a surviving spouse — not calculated here.", cite: "gov.uk/inheritance-tax" });
  if (x.homeToDescendants && estate > 2_000_000) items.push({ tone: "warn", text: "Large estates can lose some or all of the residence nil rate band. That reduction is not checked here, so the tax may be higher.", cite: "not verified" });
  if (ok(x.death)) dates.push({ id: "pay", label: "Pay Inheritance Tax by (end of the sixth month after death; interest after that)", date: endOfMonthAfter(x.death , 6), cite: "gov.uk/paying-inheritance-tax" });
  return { asOf: INHERITANCE_AS_OF, threshold, taxable, rate, tax, items, dates, help: "HMRC Inheritance Tax helpline, Citizens Advice" };
}

// ── United States (federal) ─────────────────────────────────────────
export const US_EXCLUSION_2026 = 15_000_000, US_ANNUAL_GIFT_2026 = 19_000;
export function usEstateGift(x                                                                                  ) {
  const items          = [];
  const dates          = [];
  const estate = pos(x.estate);
  const over = Math.max(0, estate - US_EXCLUSION_2026);
  if (x.estate !== undefined) items.push({ tone: over ? "warn" : "good", text: over ? `The estate is $${over.toLocaleString("en-US")} above the 2026 basic exclusion of $15,000,000; federal estate tax applies to that part (rates not calculated here).` : "The estate is within the 2026 basic exclusion of $15,000,000, so no federal estate tax is due. A return may still be filed to pass the unused exclusion to a spouse.", cite: "irs.gov What's new — estate and gift tax" });
  if (ok(x.death)) {
    dates.push({ id: "706", label: "Form 706 due (9 months after death)", date: addMonths(x.death , 9), cite: "irs.gov Filing estate and gift tax returns" });
    dates.push({ id: "706-ext", label: "Extended filing date with Form 4768 (6 more months; tax is still due at 9 months)", date: addMonths(x.death , 15), cite: "irs.gov estate tax FAQ" });
  }
  const gift = pos(x.giftToOnePerson);
  if (x.giftToOnePerson !== undefined) {
    const g = Math.max(0, gift - US_ANNUAL_GIFT_2026);
    items.push({ tone: g ? "warn" : "good", text: g ? `Gifts to one person above $19,000 in 2026 need Form 709. The $${g.toLocaleString("en-US")} above it uses up lifetime exclusion; tax is usually not owed until the $15,000,000 is used.` : "Gifts to one person of $19,000 or less in 2026 are within the annual exclusion; no gift tax return is needed for them.", cite: "irs.gov What's new — estate and gift tax" });
    if (g && x.giftYear) dates.push({ id: "709", label: "Form 709 due (April 15 after the gift year)", date: `${x.giftYear + 1}-04-15`, cite: "irs.gov Filing estate and gift tax returns" });
  }
  items.push({ tone: "info", text: "Some states have their own estate or inheritance tax; not covered here.", cite: "not verified" });
  return { asOf: INHERITANCE_AS_OF, exclusion: US_EXCLUSION_2026, annualExclusion: US_ANNUAL_GIFT_2026, overExclusion: over, items, dates, help: "IRS, Low Income Taxpayer Clinics" };
}

// ── France ───────────────────────────────────────────────────────────
                                                                                                  
export const FR_ABATTEMENT                             = { conjoint: Infinity, enfant: 100_000, frereSoeur: 15_932, neveu: 7_967, parent4: 1_594, nonParent: 1_594 };
export const FR_LIGNE_DIRECTE                     = [[8_072, 0.05], [12_109, 0.10], [15_932, 0.15], [552_324, 0.20], [902_838, 0.30], [1_805_677, 0.40], [Infinity, 0.45]];
export function frSuccession(x                                                                                                                                               ) {
  const items          = [];
  const dates          = [];
  const part = pos(x.part);
  let abattement = FR_ABATTEMENT[x.relation] + (x.handicap ? 159_325 : 0);
  if (x.relation === "frereSoeur" && x.frereSoeurExonere) abattement = Infinity;
  const taxable = Number.isFinite(abattement) ? Math.max(0, part - abattement) : 0;
  let droits = 0;
  if (x.relation === "enfant") droits = progressive(taxable, FR_LIGNE_DIRECTE);
  else if (x.relation === "frereSoeur") droits = progressive(taxable, [[24_430, 0.35], [Infinity, 0.45]]);
  else if (x.relation === "neveu" || x.relation === "parent4") droits = taxable * 0.55;
  else if (x.relation === "nonParent") droits = taxable * 0.60;
  droits = Math.round(droits);
  if (x.relation === "conjoint") items.push({ tone: "good", text: "Le conjoint survivant et le partenaire de PACS sont exonérés de droits de succession.", cite: "service-public F35794" });
  else items.push({ tone: droits ? "warn" : "good", text: droits ? `Après l'abattement de ${abattement.toLocaleString("fr-FR")} €, ${taxable.toLocaleString("fr-FR")} € sont taxés : droits estimés ${droits.toLocaleString("fr-FR")} €.` : "Votre part ne dépasse pas l'abattement : pas de droits à payer.", cite: "service-public F35794" });
  if (x.relation === "frereSoeur" && !x.frereSoeurExonere) items.push({ tone: "info", text: "Un frère ou une sœur est exonéré s'il vivait avec le défunt depuis 5 ans, était célibataire, veuf ou divorcé, et avait plus de 50 ans ou une infirmité.", cite: "service-public F35794" });
  items.push({ tone: "info", text: "Les donations reçues du défunt dans les 15 ans précédents réduisent l'abattement ; ce rappel n'est pas calculé ici.", cite: "non vérifié" });
  const brut = x.actifBrut;
  const direct = x.relation === "conjoint" || x.relation === "enfant";
  if (brut !== undefined && brut < (direct ? 50_000 : 3_000)) items.push({ tone: "good", text: `Actif brut inférieur à ${direct ? "50 000" : "3 000"} € : pas de déclaration de succession à déposer (${direct ? "héritiers en ligne directe et conjoint, sans donation antérieure non déclarée" : "autres héritiers"}).`, cite: "impots.gouv.fr" });
  if (ok(x.death)) dates.push({ id: "file", label: `Dépôt de la déclaration de succession (2705-SD) et paiement (${x.abroad ? "12 mois, décès hors de France" : "6 mois, décès en France"})`, date: addMonths(x.death , x.abroad ? 12 : 6), cite: "impots.gouv.fr" });
  return { asOf: INHERITANCE_AS_OF, abattement: Number.isFinite(abattement) ? abattement : null, taxable, droits, items, dates, help: "notaire, centre des finances publiques (service de l'enregistrement)" };
}

// ── Taiwan ───────────────────────────────────────────────────────────
export function twEstate(x                                        ) {
  const items          = [];
  const dates          = [];
  if (ok(x.death)) {
    const due = addMonths(x.death , 6);
    dates.push({ id: "file", label: "遺產稅申報期限（被繼承人死亡之次日起算六個月內）", date: due, cite: "遺產及贈與稅法第23條（115年9月11日修正）" });
    if (x.extended) dates.push({ id: "ext", label: "申請延長後的期限（以三個月為限，須在期限屆滿前書面申請）", date: addMonths(due, 3), cite: "遺產及贈與稅法第26條" });
  }
  items.push({ tone: "info", text: "115年9月11日修正：申報期限改為死亡之次日起算；納稅義務人改為繼承人及受遺贈人；滯納金刪除，改為按日加計利息；可分十八期以內繳納。", cite: "遺產及贈與稅法第6、23、30、51條" });
  items.push({ tone: "warn", text: "115年適用的遺產稅免稅額、扣除額與稅率級距，以及贈與稅申報期限，這裡沒有核對，不計算稅額。請看財政部公告。", cite: "未確認" });
  return { asOf: INHERITANCE_AS_OF, items, dates, help: "各地區國稅局（免付費電話 0800-000-321）" };
}
