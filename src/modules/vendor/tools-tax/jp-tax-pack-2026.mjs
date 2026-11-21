// GENERATED from tools-oiyo src/lib/jp-tax-pack-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 日本の税務・会計ガイド（2026-11-21、各国現地化 1次・日本）。一般的な情報と概算計算だけを扱い、個別の税務相談・申告書の作成はしません（税理士法第2条・第52条、基本通達2-1・2-6）。
// 同じコードが oiyo-jp-tax-guide スキル scripts/calc.mjs と api.oiyo.net MCP（*_jp_*）に入ります。
// 根拠（e-Gov 現行条文・国税庁タックスアンサー「令和8年4月1日現在法令等」・東京都主税局で 2026-11-21 確認。
//   company-brain projects/oiyo-ecosystem/jp-tax-pack-facts-2026-11-21.md）:
// - 期限: No.2020（確定申告 2/16〜3/15）、国税通則法第10条第2項（土日祝は翌日）、No.2040（予定納税 7月・11月、基準額15万円）、No.6601（個人の消費税 3/31）、No.2070（青色申告承認申請 3/15・開業2か月）。
// - 青色申告特別控除: 措法第25条の2、No.2072（65万・55万・10万円）。
// - 消費税: No.6501（基準期間1,000万円、特定期間）、No.6498（2割特例 R5.10.1〜R8.9.30 を含む課税期間、3割特例 個人 R9・R10）、No.6505（簡易課税 5,000万円、みなし仕入率 90〜40%）。
// - 加算税・延滞税: No.2024（無申告 5%・10/15/25%・15/20/30%）、No.2026（過少申告 5%/10%、10%/15%）、国税通則法第68条（重加算税 35%/40%）、No.9205（延滞税 令和8年 2.8%/9.1%）、第118条・第119条（端数）。
// - 不服申立て: 国税通則法第77条（3か月、再調査後1か月、1年）。
// - 減価償却: No.2100（10万円未満・20万円未満3年・中小特例 40万円未満[R8.3.31までの取得は30万円]・年300万円・R11.3.31まで）、耐用年数省令別表第一・別表第八（定額法償却率）。
// - 個人事業税・住民税: 東京都主税局（事業主控除290万円、5%、住民税所得割10%）。
import { basicDeduction, incomeTax } from "./japan-salary.mjs";

export const JP_TAX_AS_OF = "2026-11-21";
export const JP_TAX_NOTE = "公表された法令・国税庁の案内にもとづく一般的な概算です。個別の税務相談・申告書の作成は税理士・税理士法人の業務です（税理士法第52条）。具体的な判断は税理士、税務署の電話相談センター、税理士会の無料相談を使ってください。";

                                            
                                                                

const iso = (d      ) => d.toISOString().slice(0, 10);
const utc = (y        , m        , d        ) => new Date(Date.UTC(y, m - 1, d));
/** 期限が土日なら翌月曜へ（国税通則法第10条第2項）。3/15・3/31・7/31・11/30 は国民の祝日に当たりません。 */
export function jpShift(d      )       {
  let t = d;
  while (t.getUTCDay() === 0 || t.getUTCDay() === 6) t = new Date(t.getTime() + 86_400_000);
  return t;
}
const addMonthsSameDay = (isoDate        , months        ) => {
  const [Y, M, D] = isoDate.split("-").map(Number);
  const first = new Date(Date.UTC(Y, M - 1 + months, 1));
  const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  return new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), Math.min(D, last)));
};
const days = (a        , b        ) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

// ── 1. 申告・納付カレンダー ─────────────────────────────────────────
                                                                                                                            
                                                                                                                          

export function jpTaxCalendar(x               ) {
  const y = x.year;
  const ev                  = [];
  const push = (id        , label        , nominal      , cite        ) => {
    const d = iso(jpShift(nominal));
    ev.push({ id, label, date: d, nominal: iso(nominal), cite, ...(x.today ? { daysLeft: days(x.today, d) } : {}) });
  };
  push("income", `${y - 1}年分 所得税の確定申告・納付期限（受付は2月16日から）`, utc(y, 3, 15), "国税庁 No.2020、国税通則法第10条第2項");
  if (x.consumptionTax) push("consumption", `${y - 1}年分 消費税（個人事業者）の確定申告・納付期限`, utc(y, 3, 31), "国税庁 No.6601");
  if (x.prepaid) {
    push("prepay1", `${y}年分 予定納税 第1期（予定納税基準額15万円以上の人）`, utc(y, 7, 31), "国税庁 No.2040");
    push("prepay2", `${y}年分 予定納税 第2期`, utc(y, 11, 30), "国税庁 No.2040");
  }
  if (x.started && x.started.startsWith(String(y)) && x.started.slice(5) >= "01-16") {
    const due = addMonthsSameDay(x.started, 2);
    push("blue", `青色申告承認申請（${x.started} 開業から2か月以内）`, due, "国税庁 No.2070");
  } else push("blue", `${y}年分から青色申告にする場合の承認申請期限`, utc(y, 3, 15), "国税庁 No.2070");
  ev.sort((a, b) => a.date.localeCompare(b.date));
  return { events: ev, note: "振替納税の引落日は国税庁が毎年公表します。公表前は空欄です。" };
}

// ── 2. 青色申告特別控除の比較 ───────────────────────────────────────
                                                                     
const RESIDENT_BASIC = 430_000; // 住民税の基礎控除（合計所得2,400万円以下）

function taxesFor(income        , other        ) {
  const it = incomeTax(Math.floor(Math.max(0, income - basicDeduction(income) - other) / 1000) * 1000);
  const rt = Math.floor(Math.max(0, income - RESIDENT_BASIC - other) * 0.1);
  return { incomeTax: it, residentTax: rt, total: it + rt };
}

export function jpBlueReturn(x           ) {
  const other = Math.max(0, x.otherDeductions ?? 0);
  const levels = [
    { id: "white", label: "白色申告（控除なし）", amount: 0, need: "記帳・帳簿保存は必要です" },
    { id: "blue10", label: "青色 10万円", amount: 100_000, need: "簡易帳簿でも可" },
    { id: "blue55", label: "青色 55万円", amount: 550_000, need: "複式簿記・貸借対照表と損益計算書・期限内申告" },
    { id: "blue65", label: "青色 65万円", amount: 650_000, need: "55万円の要件 + e-Tax で期限内提出 または 優良な電子帳簿" },
  ];
  const rows = levels.map((l) => {
    const inc = Math.max(0, x.income - Math.min(l.amount, x.income));
    return { ...l, ...taxesFor(inc, other) };
  });
  const base = rows[0].total;
  const out = rows.map((r) => ({ ...r, saving: base - r.total }));
  const items           = [
    { tone: "info", text: `65万円控除なら白色より年 ${out[3].saving.toLocaleString("ja-JP")}円ほど所得税・住民税が少なくなります（概算）。`, cite: "租税特別措置法第25条の2、国税庁 No.2072" },
    { tone: "info", text: "個人事業税（事業主控除290万円、多くの業種5%）には青色申告特別控除は使えません。", cite: "地方税法第72条の49の14、東京都主税局" },
    { tone: "info", text: "青色申告にするには、その年の3月15日まで（1月16日以後の開業は開業日から2か月以内）に承認申請書を出します。", cite: "国税庁 No.2070" },
  ];
  return { rows: out, items };
}

// ── 3. 消費税: 納税義務と計算方法の比較 ─────────────────────────────
export const DEEMED_RATES = { 1: 0.9, 2: 0.8, 3: 0.7, 4: 0.6, 5: 0.5, 6: 0.4 }         ;
                                
                                              
                                                  
                                                     
                                              
                                                
                                                  
                                              
                                               
                                   
                                                    
  

export function jpConsumptionTax(x                  ) {
  const specOver = (x.specSales ?? 0) > 10_000_000 && (x.specWages ?? Infinity) > 10_000_000;
  const exempt = x.baseSales <= 10_000_000 && !specOver && !x.invoice;
  const outTax = Math.floor(x.sales * 0.1);
  const inTax = Math.floor((x.purchases ?? 0) * 0.1);
  const rate = DEEMED_RATES[x.type ?? 5];
  const methods                                                                         = [
    { id: "general", label: "本則課税（売上税額 − 仕入税額）", tax: Math.max(0, outTax - inTax), ok: true, why: "インボイスの保存が必要" },
    { id: "simple", label: `簡易課税（みなし仕入率 ${Math.round(rate * 100)}%）`, tax: Math.floor(outTax * (1 - rate)), ok: x.baseSales <= 50_000_000 && !!x.simpleFiled, why: x.baseSales <= 50_000_000 ? (x.simpleFiled ? "届出済み" : "課税期間の開始前に選択届出が必要（2割特例からの移行は特例あり）") : "基準期間の課税売上高が5,000万円超" },
    { id: "twenty", label: "2割特例（売上税額の20%）", tax: Math.floor(outTax * 0.2), ok: !!x.invoice && !!x.wasExempt && x.year <= 2026, why: x.year <= 2026 ? "インボイス登録で課税事業者になった人、令和8年9月30日を含む課税期間まで" : "令和8年9月30日を含む課税期間で終了" },
    { id: "thirty", label: "3割特例（売上税額の30%、個人）", tax: Math.floor(outTax * 0.3), ok: !!x.invoice && !!x.wasExempt && (x.year === 2027 || x.year === 2028), why: "小規模な個人事業者の令和9年・令和10年の課税期間（要件は国税庁で確認）" },
  ];
  const usable = methods.filter((m) => m.ok);
  const best = exempt ? null : usable.reduce((a, b) => (b.tax < a.tax ? b : a), usable[0]);
  const items           = [];
  if (exempt) items.push({ tone: "good", text: "基準期間の課税売上高が1,000万円以下で、特定期間の判定にも当たらず、インボイス登録もしていないので免税事業者です。", cite: "国税庁 No.6501" });
  else {
    if (x.invoice && x.baseSales <= 10_000_000) items.push({ tone: "info", text: "売上は免税の水準ですが、インボイス登録をしているので課税事業者です。", cite: "国税庁 No.6501" });
    if (specOver && x.baseSales <= 10_000_000) items.push({ tone: "warn", text: "前年1〜6月の課税売上高と給与等がどちらも1,000万円超なので、今年は課税事業者です。", cite: "国税庁 No.6501" });
    items.push({ tone: "info", text: `使える方法で一番少ないのは「${best?.label}」で約 ${best?.tax.toLocaleString("ja-JP")}円です（標準税率10%で概算）。`, cite: "国税庁 No.6505・No.6498" });
  }
  items.push({ tone: "info", text: "軽減税率8%（飲食料品など）の売上は別に計算します。令和9年4月1日〜令和11年3月31日は飲食料品の税率引下げと簡易課税の特例が予定されています。", cite: "国税庁 No.6501・No.6505" });
  return { exempt, outTax, methods, best: best?.id ?? null, items };
}

// ── 4. 加算税・延滞税 ──────────────────────────────────────────────
export const DELINQUENCY_2026 = { low: 0.028, high: 0.091 };
                            
                                             
                                                                      
                                           
                                                 
                                               
                                        
                                      
  

const tenK = (n        ) => Math.floor(n / 10_000) * 10_000;
const h100 = (n        ) => Math.floor(n / 100) * 100;

export function jpPenalty(x              ) {
  const base = tenK(x.tax);
  let add = 0;
  let label = "";
  if (x.fraud) { add = base * (x.kind === "none" ? 0.4 : 0.35); label = `重加算税 ${x.kind === "none" ? 40 : 35}%`; }
  else if (x.kind === "none") {
    if (x.stage === "voluntary") { add = base * 0.05; label = "無申告加算税 5%（調査通知前の自主申告）"; }
    else {
      const r = x.stage === "notice" ? [0.1, 0.15, 0.25] : [0.15, 0.2, 0.3];
      add = Math.min(base, 500_000) * r[0] + Math.max(0, Math.min(base, 3_000_000) - 500_000) * r[1] + Math.max(0, base - 3_000_000) * r[2];
      label = `無申告加算税 ${r.map((v) => Math.round(v * 100)).join("/")}%（50万円・300万円超の部分）`;
    }
  } else {
    if (x.stage === "voluntary") { add = 0; label = "調査通知前の自主的な修正申告は過少申告加算税なし"; }
    else {
      const r = x.stage === "notice" ? [0.05, 0.1] : [0.1, 0.15];
      const line = Math.max(x.original ?? 0, 500_000);
      add = Math.min(base, line) * r[0] + Math.max(0, base - line) * r[1];
      label = `過少申告加算税 ${Math.round(r[0] * 100)}%（当初税額か50万円の多い方を超える部分は ${Math.round(r[1] * 100)}%）`;
    }
  }
  let addTax = h100(add);
  if (addTax < 5_000) addTax = 0;
  let late = 0;
  let lateDays = 0;
  if (x.deadline && x.paid && x.paid > x.deadline) {
    lateDays = days(x.deadline, x.paid);
    const twoMonths = iso(addMonthsSameDay(x.deadline, 2));
    const lowDays = Math.min(lateDays, days(x.deadline, twoMonths));
    const highDays = Math.max(0, lateDays - lowDays);
    late = h100(base * DELINQUENCY_2026.low * lowDays / 365 + base * DELINQUENCY_2026.high * highDays / 365);
    if (late < 1_000) late = 0;
  }
  const items           = [
    { tone: addTax ? "warn" : "good", text: `${label}: ${addTax.toLocaleString("ja-JP")}円`, cite: x.fraud ? "国税通則法第68条" : x.kind === "none" ? "国税庁 No.2024" : "国税庁 No.2026" },
  ];
  if (lateDays) items.push({ tone: "warn", text: `延滞税（令和8年: 2か月まで年2.8%、その後年9.1%）${lateDays}日分: ${late.toLocaleString("ja-JP")}円`, cite: "国税庁 No.9205" });
  items.push({ tone: "info", text: "前年・前々年にも無申告加算税などがあると10%加重されることがあります。税額は1万円未満、加算税・延滞税は100円未満を切り捨てています。", cite: "国税庁 No.2024、国税通則法第118条・第119条" });
  return { additionalTax: addTax, delinquency: late, lateDays, total: addTax + late, items };
}

// ── 5. 不服申立ての期限 ────────────────────────────────────────────
export function jpAppealDeadlines(x                                                                         ) {
  const out                                                              = [];
  out.push({ id: "first", label: "再調査の請求 または 審査請求（処分を知った日の翌日から3か月）", date: iso(jpShift(addMonthsSameDay(x.noticed, 3))), cite: "国税通則法第77条第1項" });
  if (x.reinvestigationDecided) out.push({ id: "after", label: "再調査決定後の審査請求（決定書の謄本が届いた日の翌日から1か月）", date: iso(jpShift(addMonthsSameDay(x.reinvestigationDecided, 1))), cite: "国税通則法第77条第2項" });
  const d = x.disposed ?? x.noticed;
  out.push({ id: "absolute", label: "処分があった日の翌日から1年を過ぎると、正当な理由がない限り申し立てできません", date: iso(addMonthsSameDay(d, 12)), cite: "国税通則法第77条第3項" });
  return out;
}

// ── 6. 減価償却（定額法）と少額資産の扱い ───────────────────────────
/** 定額法の償却率（耐用年数省令 別表第八）は 1/耐用年数 を小数第3位で切り上げた値と一致します。 */
export const straightRate = (life        ) => Math.ceil((1 / life) * 1000 - 1e-9) / 1000;
export const USEFUL_LIFE = { pc: 4, car: 6, kei: 4, woodHouse: 22 }         ;

                                                                                                                       

export function jpDepreciation(x          ) {
  const items           = [];
  const smeLimit = x.acquired >= "2026-04-01" ? 400_000 : 300_000;
  let treatment                                             = "depreciate";
  if (x.cost < 100_000) treatment = "expense";
  else if (x.blue && x.sme && x.cost < smeLimit && x.acquired <= "2029-03-31") treatment = "sme";
  else if (x.cost < 200_000) treatment = "lump3";
  if (treatment === "expense") items.push({ tone: "good", text: "10万円未満なので、使い始めた年に全額を必要経費にできます。", cite: "国税庁 No.2100" });
  if (treatment === "sme") items.push({ tone: "good", text: `青色申告の中小事業者は ${smeLimit / 10_000}万円未満の資産を年300万円まで一度に経費にできます（令和11年3月31日取得分まで）。`, cite: "国税庁 No.2100（措法第28条の2）" });
  if (treatment === "lump3") items.push({ tone: "info", text: "20万円未満は一括償却資産として3年で3分の1ずつ経費にする方法も選べます。", cite: "国税庁 No.2100" });
  const rate = straightRate(x.life);
  const startMonth = Number(x.acquired.slice(5, 7));
  const startYear = Number(x.acquired.slice(0, 4));
  const schedule                                                   = [];
  let book = x.cost;
  const yearly = Math.floor(x.cost * rate);
  for (let i = 0; book > 1 && i < (x.years ?? 60); i++) {
    const months = i === 0 ? 13 - startMonth : 12;
    let amt = Math.floor((yearly * months) / 12);
    if (amt >= book - 1) amt = book - 1;
    book -= amt;
    schedule.push({ year: startYear + i, amount: amt, book });
  }
  items.push({ tone: "info", text: `定額法の償却率は ${rate.toFixed(3)}（耐用年数${x.life}年）。個人事業者は届出がなければ定額法です。最後は1円を残します。`, cite: "耐用年数省令 別表第八、所得税法施行令第125条" });
  return { treatment, rate, firstYear: schedule[0]?.amount ?? 0, schedule, items };
}

// ── 7. 専門家の業務範囲（税理士法） ─────────────────────────────────
export const JP_SCOPE = [
  { title: "税理士の業務", body: "他人の求めに応じて、税務代理・税務書類の作成・税務相談を業として行うこと。", cite: "税理士法第2条第1項" },
  { title: "税理士でない者の禁止", body: "税理士・税理士法人でない者は税理士業務を行えません。国税庁の通達では、「業とする」は反復継続することで、有償である必要はないとされています（無償でも該当）。", cite: "税理士法第52条、基本通達2-1" },
  { title: "税務相談とは", body: "具体的な質問に対して答弁し、指示し、意見を表明すること。このサイトは一般的な制度の説明と概算計算だけを扱い、個別の判断はしません。", cite: "基本通達2-6" },
  { title: "名称の制限", body: "税理士でない者は、税理士や税理士事務所に類似する名称を使えません。", cite: "税理士法第53条" },
  { title: "罰則", body: "第52条違反は2年以下の拘禁刑又は100万円以下の罰金、第53条違反は100万円以下の罰金。", cite: "税理士法第59条・第61条" },
  { title: "無料で相談できる窓口", body: "税務署の電話相談センター（国税相談専用ダイヤル）、各地の税理士会の無料税務相談、確定申告期の申告相談会場。", cite: "国税庁・日本税理士会連合会" },
];
