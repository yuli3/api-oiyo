// GENERATED from tools-oiyo src/lib/world-limitation-pack-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// Civil limitation periods and small-claims routes (2026-11-22, world pro-gap #4): JP, England & Wales, California, France, Taiwan, China (small claims only).
// General information only: no legal advice, no representation, no filing. A deadline here is an estimate from the start date given;
// interruption, suspension, acknowledgement and discovery rules can move it.
// Facts: /mnt/project-files/notes/limitation-small-claims-facts-2026-11-22.md (法務省 改正民法資料, courts.go.jp, legislation.gov.uk Limitation Act 1980,
// gov.uk money claim fees, Citizens Advice, selfhelp.courts.ca.gov, Contra Costa Superior Court, CIDJ, Que Choisir, justice.fr, 司法院 FAQ, 民法 125-128條, gov.cn 民事诉讼法 2021).
// Not computed because not verified: JP 少額訴訟 fee and 2020 transition, FR délai butoir, CN 民法典 第188条, Spain.

export const LIMITATION_AS_OF = "2026-11-22";
                                            
                                                               
                                                                              

const iso = (d      ) => d.toISOString().slice(0, 10);
export const addYears = (s        , n        ) => {
  const [y, m, d] = s.split("-").map(Number);
  const last = new Date(Date.UTC(y + n, m, 0)).getUTCDate();
  return iso(new Date(Date.UTC(y + n, m - 1, Math.min(d, last))));
};
const ok = (s         ) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
const pos = (n         ) => Math.max(0, Number(n) || 0);
const earlier = (a        , b        ) => (a < b ? a : b);
const later = (a        , b        ) => (a > b ? a : b);
const status = (deadline        , today         ) => (ok(today) ? (today  > deadline ? "expired" : "open") : null);

// ── Japan ────────────────────────────────────────────────────────────
                                                    
export function jpLimitation(x                                                                                            ) {
  const items          = [];
  const dates          = [];
  const [short, long] = x.claim === "general" ? [5, 10] : x.claim === "injury" ? [5, 20] : [3, 20];
  const cite = x.claim === "general" ? "民法166条" : x.claim === "injury" ? "民法167条・724条の2" : "民法724条";
  let deadline                = null;
  const a = ok(x.knew) ? addYears(x.knew , short) : null;
  const b = ok(x.couldExercise) ? addYears(x.couldExercise , long) : null;
  if (a) dates.push({ id: "short", label: `知った時から${short}年`, date: a, cite });
  if (b) dates.push({ id: "long", label: `${x.claim === "tort" ? "不法行為の時" : "権利を行使できる時"}から${long}年`, date: b, cite });
  if (a && b) deadline = earlier(a, b); else deadline = a ?? b;
  items.push({ tone: "info", text: `${x.claim === "general" ? "一般の債権" : x.claim === "injury" ? "人の生命・身体の侵害による損害賠償" : "不法行為による損害賠償"}は、知った時から${short}年、${x.claim === "tort" ? "不法行為の時" : "行使できる時"}から${long}年のどちらか早いほうで時効になります（2020年4月施行の改正民法のルール）。`, cite });
  items.push({ tone: "warn", text: "裁判上の請求などで時効の進み方が変わることがあり、ここでは考慮していません。2020年4月より前に生じた債権には改正前のルールが使われることがあり、確認していません。", cite: "法務省 改正民法資料" });
  const amount = pos(x.amount);
  if (x.amount !== undefined) items.push({ tone: amount <= 600_000 ? "good" : "info", text: amount <= 600_000 ? "60万円以下の金銭の請求なので少額訴訟が使えます。原則1回の審理で判決が出ます（同じ簡易裁判所で年10回まで、判決には2週間以内に異議、控訴はできません）。" : "60万円を超えるので少額訴訟は使えません。通常の訴訟や支払督促を検討します。", cite: "裁判所 少額訴訟" });
  return { asOf: LIMITATION_AS_OF, deadline, status: deadline ? status(deadline, x.today) : null, items, dates, help: "簡易裁判所の窓口" };
}

// ── England & Wales ─────────────────────────────────────────────────
                                                     
export const UK_MONEY_CLAIM_FEES                                = [[300, 35], [500, 50], [1_000, 70], [1_500, 80], [3_000, 115], [5_000, 205], [10_000, 455]];
export const ukClaimFee = (amount        ) => { const a = pos(amount); const row = UK_MONEY_CLAIM_FEES.find(([u]) => a <= u); return row ? row[1] : a <= 200_000 ? Math.round(a * 0.05 * 100) / 100 : 10_000; };
export function ukLimitation(x                                                                                           ) {
  const items          = [];
  const dates          = [];
  let deadline                = null;
  if (x.claim === "injury") {
    const a = ok(x.accrued) ? addYears(x.accrued , 3) : null;
    const k = ok(x.knowledge) ? addYears(x.knowledge , 3) : null;
    deadline = a && k ? later(a, k) : a ?? k;
    if (deadline) dates.push({ id: "limit", label: "Last day to issue the claim (3 years from the injury or, if later, from the date of knowledge)", date: deadline, cite: "Limitation Act 1980 s.11" });
  } else if (ok(x.accrued)) {
    deadline = addYears(x.accrued , 6);
    dates.push({ id: "limit", label: `Last day to issue the claim (6 years from when the cause of action accrued)`, date: deadline, cite: x.claim === "contract" ? "Limitation Act 1980 s.5" : "Limitation Act 1980 s.2" });
  }
  items.push({ tone: "warn", text: "Court claims must be issued before the limitation date. Other rules can extend or change it in some cases; they are not applied here.", cite: "Limitation Act 1980" });
  if (x.amount !== undefined) {
    const a = pos(x.amount);
    items.push({ tone: a <= 10_000 ? "good" : "info", text: a <= 10_000 ? `Claims of £10,000 or less usually go to the small claims track. Court fee to start a money claim: £${ukClaimFee(a).toLocaleString("en-GB")}.` : `Above £10,000 the claim is not usually a small claim. Court fee to start it: £${ukClaimFee(a).toLocaleString("en-GB")}.`, cite: "gov.uk money claim fees; Citizens Advice" });
  }
  return { asOf: LIMITATION_AS_OF, deadline, status: deadline ? status(deadline, x.today) : null, fee: x.amount !== undefined ? ukClaimFee(pos(x.amount)) : null, items, dates, help: "Citizens Advice, Money Claim Online (gov.uk)" };
}

// ── California ──────────────────────────────────────────────────────
                                                                                                
export const CA_YEARS                                                                 = {
  writtenContract: { years: 4, from: "the date the contract was broken", cite: "CCP 337" },
  oralContract: { years: 2, from: "the date the contract was broken", cite: "CCP 339" },
  injury: { years: 2, from: "the injury", cite: "CCP 335.1" },
  property: { years: 3, from: "the date the damage occurred", cite: "CCP 338" },
  defamation: { years: 1, from: "publication", cite: "CCP 340(c)" },
};
export function caLimitation(x                                                                                         ) {
  const items          = [];
  const dates          = [];
  const c = CA_YEARS[x.claim];
  const deadline = ok(x.start) ? addYears(x.start , c.years) : null;
  if (deadline) dates.push({ id: "limit", label: `Last day to file (${c.years} year${c.years > 1 ? "s" : ""} from ${c.from})`, date: deadline, cite: c.cite });
  items.push({ tone: "warn", text: "Some deadlines start when you discovered the harm, and some can be paused (tolling); neither is applied here. Claims against a government agency have different rules, not covered.", cite: "selfhelp.courts.ca.gov" });
  if (x.amount !== undefined) {
    const cap = x.business ? 6_250 : 12_500;
    const a = pos(x.amount);
    items.push({ tone: a <= cap ? "good" : "info", text: a <= cap ? `Up to $${cap.toLocaleString("en-US")} can go to small claims court (no lawyers at the hearing). An individual can file only two claims over $2,500 per calendar year.` : `Above $${cap.toLocaleString("en-US")} the claim is too big for small claims unless you give up the rest.`, cite: "California small claims (Contra Costa Superior Court FAQ)" });
  }
  return { asOf: LIMITATION_AS_OF, deadline, status: deadline ? status(deadline, x.today) : null, items, dates, help: "California Courts Self-Help, county small claims advisor" };
}

// ── France ───────────────────────────────────────────────────────────
                                                                                          
export const FR_YEARS                                                                  = {
  general: { years: 5, cite: "CIDJ (délai de principe)", label: "délai de principe" },
  proConsommateur: { years: 2, cite: "C. consom. L.218-2", label: "action d'un professionnel contre un consommateur" },
  assurance: { years: 2, cite: "CIDJ", label: "assurance" },
  telecom: { years: 1, cite: "CIDJ", label: "opérateur télécom / internet" },
  salaire: { years: 3, cite: "CIDJ", label: "salaires" },
};
export function frLimitation(x                                                                     ) {
  const items          = [];
  const dates          = [];
  const c = FR_YEARS[x.claim];
  const deadline = ok(x.start) ? addYears(x.start , c.years) : null;
  if (deadline) dates.push({ id: "limit", label: `Fin du délai de prescription (${c.years} an${c.years > 1 ? "s" : ""}, ${c.label})`, date: deadline, cite: c.cite });
  items.push({ tone: "warn", text: "Une action en justice, même en référé, interrompt la prescription ; une médiation ou une conciliation la suspend. Ces événements ne sont pas pris en compte ici.", cite: "Que Choisir" });
  if (x.claim === "proConsommateur") items.push({ tone: "info", text: "Pour une facture de marchandises, de services ou d'énergie, le délai court en principe à partir de l'établissement de la facture.", cite: "C. consom. L.218-2" });
  if (x.amount !== undefined) {
    const a = pos(x.amount);
    items.push({ tone: "info", text: `L'injonction de payer n'a pas de plafond de montant ; la requête est gratuite hors dette commerciale.${a <= 5_000 ? " Pour une dette de 5 000 € au plus, la procédure simplifiée de recouvrement des petites créances par un commissaire de justice est aussi possible." : ""}`, cite: "justice.fr injonction de payer" });
  }
  return { asOf: LIMITATION_AS_OF, deadline, status: deadline ? status(deadline, x.today) : null, items, dates, help: "tribunal judiciaire (greffe), justice.fr" };
}

// ── Taiwan ───────────────────────────────────────────────────────────
                                                              
export const TW_YEARS                                                                  = {
  general: { years: 15, cite: "民法第125條", label: "一般請求權" },
  periodic: { years: 5, cite: "民法第126條", label: "利息、紅利、租金、贍養費、退職金等定期給付" },
  shortTwoYear: { years: 2, cite: "民法第127條", label: "旅店飲食住宿費、運送費、商品代價、醫師律師報酬等" },
};
export function twLimitation(x                                                                     ) {
  const items          = [];
  const dates          = [];
  const c = TW_YEARS[x.claim];
  const deadline = ok(x.start) ? addYears(x.start , c.years) : null;
  if (deadline) dates.push({ id: "limit", label: `消滅時效完成日（${c.label}，${c.years}年，自請求權可行使時起算）`, date: deadline, cite: `${c.cite}、第128條` });
  items.push({ tone: "warn", text: "起訴等情形可能影響時效的計算，這裡沒有考慮。", cite: "民法" });
  if (x.amount !== undefined) {
    const a = pos(x.amount);
    items.push({ tone: a <= 100_000 ? "good" : "info", text: a <= 100_000 ? "10萬元以下的金錢請求適用小額訴訟程序，預繳裁判費1,500元。" : a <= 500_000 ? "超過10萬元但在50萬元以下，雙方書面合意時也可以適用小額訴訟程序。" : "超過50萬元，不適用小額訴訟程序。", cite: "司法院 小額訴訟問答" });
  }
  return { asOf: LIMITATION_AS_OF, deadline, status: deadline ? status(deadline, x.today) : null, items, dates, help: "各地方法院（簡易庭）" };
}

// ── China (small claims only) ───────────────────────────────────────
export function cnSmallClaims(x                                                    ) {
  const items          = [];
  const w = pos(x.provincialAverageWage);
  const a = pos(x.amount);
  let route                                              = null;
  if (w) {
    route = a <= w * 0.5 ? "small" : a <= w * 2 ? "byAgreement" : "ordinary";
    items.push({ tone: route === "small" ? "good" : "info", text: route === "small" ? `标的额不超过本省上年度就业人员年平均工资的50%（${Math.round(w * 0.5).toLocaleString("zh-CN")}元），简单金钱给付案件适用小额诉讼程序，一审终审。` : route === "byAgreement" ? "标的额超过50%但在2倍以下，双方可以约定适用小额诉讼程序。" : "标的额超过年平均工资2倍，不适用小额诉讼程序。", cite: "民事诉讼法第165条" });
  } else items.push({ tone: "info", text: "小额诉讼的上限是本省（自治区、直辖市）上年度就业人员年平均工资的50%。请输入当地公布的年平均工资。", cite: "民事诉讼法第165条" });
  items.push({ tone: "warn", text: "诉讼时效（民法典）这里没有核对，不计算期限。", cite: "未确认" });
  return { asOf: LIMITATION_AS_OF, route, items, dates: []           , help: "当地人民法院诉讼服务中心" };
}
