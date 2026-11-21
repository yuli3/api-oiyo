// GENERATED from tools-oiyo src/lib/tw-tax-pack-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 臺灣稅務與會計指南（2026-11-21，各國在地化第二批：臺灣）。僅提供一般資訊與試算：不提供個案稅務諮詢、不代理申報。
// 同一套程式也用於 oiyo-tw-tax-guide 技能（scripts/calc.mjs）與 api.oiyo.net 的 MCP 工具（*_tw_*）。
// 2026-11-21 核對的來源（company-brain projects/oiyo-ecosystem/tw-tax-pack-facts-2026-11-21.md）：
// - 所得稅法第5、17、51、67、71、92、110條；財政部公告115年度課稅級距及免稅額、扣除額（2025-11-27）；賦稅署114年度結算申報資料。
// - 加值型及非加值型營業稅法第10、13、23、32、35、51條；小規模營業人營業稅起徵點（台財稅字第11304677940號）。
// - 稅捐稽徵法第20、28、35條；訴願法第14條；行政訴訟法第106條；行政程序法第48條。
// - 固定資產耐用年數表；營利事業所得稅查核準則第77-1、95條；記帳士法第13條；會計師法第39條。
// 未核實（不計算）：115年度基本生活費（尚未公告）、所得稅法第17條2026-09-11修正的適用年度、小規模營業人查定與改用統一發票的銷售額標準、
// 國定假日的期限順延（只處理週末）、2026年營業稅3/16與11/16為依週末推算的日期（未見國稅局公告原文）。

export const TW_TAX_AS_OF = "2026-11-21";
export const TW_TAX_NOTE = "依已公布的法規與財政部資料整理的一般資訊與試算，不是針對個人情況的稅務諮詢，本工具也不代理申報。具體情況請洽國稅局（免付費電話 0800-000-321）或記帳士、會計師。";

                                            
                                                                

const iso = (d      ) => d.toISOString().slice(0, 10);
const utc = (y        , m        , d        ) => new Date(Date.UTC(y, m - 1, d));
const days = (a        , b        ) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
const addDays = (s        , n        ) => iso(new Date(Date.parse(s) + n * 86_400_000));
const addMonths = (s        , n        ) => {
  const [y, m, d] = s.split("-").map(Number);
  const last = new Date(Date.UTC(y, m - 1 + n + 1, 0)).getUTCDate();
  return iso(utc(y, m + n, Math.min(d, last)));
};
const ntd = (n        ) => `${Math.round(n).toLocaleString("zh-TW")}元`;
const roc = (y        ) => y - 1911;

/** 行政程序法第48條：期間末日為星期六延至下星期一，星期日延至次日。國定假日不在此處理。 */
export function twShift(s        )         {
  let d = s;
  while ([0, 6].includes(new Date(Date.parse(d)).getUTCDay())) d = addDays(d, 1);
  return d;
}

// ── 1. 申報期限 ──────────────────────────────────────────────────────
                                                                                                                                      

export function twTaxCalendar(x                                                                                                     ) {
  const y = x.year;
  const ev            = [];
  const add = (e                           ) => ev.push({ ...e, ...(x.today ? { daysLeft: days(x.today, e.date) } : {}) });
  const annualEnd = y === 2026 ? "2026-06-01" : twShift(`${y}-05-31`);
  add({ id: "annual", from: `${y}-05-01`, date: annualEnd, label: `${roc(y) - 1}年度綜合所得稅${x.company ? "與營利事業所得稅" : ""}結算申報${y === 2026 ? "（5/31為假日，延至6/1，網路申報至6/1 24時）" : ""}`, cite: "所得稅法第71條", ...(y === 2026 ? {} : { computed: true }) });
  const bt = x.businessTax ?? "bimonthly";
  if (bt !== "none") {
    const months = bt === "monthly" ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] : [1, 3, 5, 7, 9, 11];
    for (const m of months) {
      const raw = iso(utc(y, m, 15));
      const prev = bt === "monthly" ? `${m === 1 ? 12 : m - 1}月` : `${m === 1 ? "11-12" : `${m - 2}-${m - 1}`}月`;
      add({ id: `bt-${m}`, date: twShift(raw), label: `營業稅申報繳納（${m === 1 ? `${roc(y) - 1}年` : ""}${prev}）${twShift(raw) !== raw ? `：${m}/15為週末，順延` : ""}`, cite: bt === "monthly" ? "營業稅法第35條（適用零稅率者申請按月）" : "營業稅法第35條", computed: true });
    }
  }
  if (x.company) add({ id: "prepay", from: `${y}-09-01`, date: twShift(`${y}-09-30`), label: "營利事業所得稅暫繳申報（上年度結算應納稅額的1/2，或按上半年實際所得試算）", cite: "所得稅法第67條", computed: true });
  ev.sort((a, b) => a.date.localeCompare(b.date));
  const items           = [
    { tone: "info", text: "期限末日為星期六延至下星期一、星期日延至次日；國定假日造成的順延未計算，請以國稅局公告與電子申報繳稅服務網為準。", cite: "行政程序法第48條" },
    { tone: "info", text: "扣繳義務人每月10日前繳納上月扣繳稅款；扣繳憑單於1月底前申報、2月10日前交付（1月有連續3日以上休假時，延至2月5日、2月15日）。", cite: "所得稅法第92條" },
  ];
  if (y !== 2026) items.unshift({ tone: "warn", text: `${y}年的日期是依法定期限與週末推算，國定假日的順延沒有計算。`, cite: "行政程序法第48條" });
  return { year: y, rocYear: roc(y), events: ev, items };
}

// ── 2. 綜合所得稅 ────────────────────────────────────────────────────
                        
/** 所得年度（西元）→ 金額。2025 = 114年度（2026年5月申報），2026 = 115年度（2027年5月申報）。 */
export const TW_PIT                                                                                                                                              = {
  2025: { brackets: [[590_000, 0.05], [1_330_000, 0.12], [2_660_000, 0.2], [4_980_000, 0.3], [Infinity, 0.4]], exemption: 97_000, standard: 131_000, salary: 218_000, disabled: 218_000, basicLiving: 213_000 },
  2026: { brackets: [[610_000, 0.05], [1_380_000, 0.12], [2_770_000, 0.2], [5_190_000, 0.3], [Infinity, 0.4]], exemption: 101_000, standard: 136_000, salary: 227_000, disabled: 227_000 },
};

export function twProgressive(taxable        , brackets                    ) {
  let tax = 0, lo = 0;
  for (const [hi, r] of brackets) { if (taxable > lo) tax += (Math.min(taxable, hi) - lo) * r; lo = hi; }
  return Math.round(tax);
}

export function twIncomeTax(x                                                                                                                                                        ) {
  const t = TW_PIT[x.year] ?? TW_PIT[2025];
  const items           = [];
  const sal = (s = 0) => Math.max(0, s) - Math.min(Math.max(0, s), t.salary);
  const net = sal(x.salary) + sal(x.spouseSalary) + Math.max(0, x.otherIncome ?? 0);
  const persons = Math.max(1, Math.round(x.persons ?? (x.married ? 2 : 1)));
  const elderly = Math.min(persons, Math.max(0, Math.round(x.elderly ?? 0)));
  const exemptions = (persons - elderly) * t.exemption + elderly * t.exemption * 1.5;
  const standard = x.married ? t.standard * 2 : t.standard;
  const disabled = Math.max(0, Math.round(x.disabled ?? 0)) * t.disabled;
  let basicLivingDiff = 0;
  if (t.basicLiving) {
    basicLivingDiff = Math.max(0, t.basicLiving * persons - (exemptions + standard + disabled));
    if (basicLivingDiff) items.push({ tone: "good", text: `基本生活費${ntd(t.basicLiving)} × ${persons}人 高於免稅額與扣除額合計，可再減除差額 ${ntd(basicLivingDiff)}。`, cite: "納稅者權利保護法第4條、114年度基本生活費公告" });
  } else items.push({ tone: "warn", text: "115年度基本生活費尚未公告（截至2026-11-21），基本生活費差額未計入。", cite: "財政部公告" });
  const taxable = Math.max(0, net - exemptions - standard - disabled - basicLivingDiff);
  const tax = twProgressive(taxable, t.brackets);
  const rate = t.brackets.find(([hi]) => taxable <= hi)?.[1] ?? 0.4;
  items.unshift({ tone: "info", text: `綜合所得淨額 ${ntd(taxable)}，適用最高稅率 ${Math.round(rate * 100)}%，應納稅額約 ${ntd(tax)}（扣繳稅款未扣除）。`, cite: "所得稅法第5條" });
  if (x.year === 2026) items.push({ tone: "warn", text: "所得稅法第17條於2026-09-11修正公布（減輕育兒家庭負擔），是否及如何適用於115年度未在本工具計算。", cite: "所得稅法第17條" });
  items.push({ tone: "info", text: "未計入：列舉扣除額、儲蓄投資、教育學費、幼兒學前、長期照顧、房屋租金等特別扣除，以及股利、分離課稅與最低稅負。", cite: "所得稅法第17條" });
  return { year: x.year, rocYear: roc(x.year), netIncome: net, exemptions, standard, disabled, basicLivingDiff, taxable, tax, topRate: rate, items };
}

// ── 3. 營業稅 ────────────────────────────────────────────────────────
export const TW_VAT = { rate: 0.05, small: 0.01, thresholdGoods: 100_000, thresholdService: 50_000 }         ;

export function twBusinessTax(x                                                                                       ) {
  const g = Math.max(0, x.goodsSales ?? 0), s = Math.max(0, x.serviceSales ?? 0);
  const ratio = g / TW_VAT.thresholdGoods + s / TW_VAT.thresholdService;
  const items           = [];
  let status                                               ;
  let tax = 0;
  if (x.invoice) {
    status = "invoice";
    const output = (g + s) * TW_VAT.rate, input = Math.max(0, x.purchases ?? 0) * TW_VAT.rate;
    tax = Math.round(output - input);
    items.push({ tone: "info", text: `使用統一發票：銷項稅額 ${ntd(output)} − 進項稅額 ${ntd(input)} = ${tax >= 0 ? `應納 ${ntd(tax)}` : `留抵 ${ntd(-tax)}`}（本期銷售額，徵收率5%）。`, cite: "營業稅法第10條、財政部作業手冊（徵收率5%）" });
  } else if (ratio < 1) {
    status = "below-threshold";
    items.push({ tone: "good", text: `未達營業稅起徵點（買賣業等每月10萬元、勞務業等每月5萬元，兼營按比例合計 ${Math.round(ratio * 100)}%）：免徵營業稅。`, cite: "小規模營業人營業稅起徵點（2025-01-01起）" });
  } else {
    status = "small-scale";
    tax = Math.round((g + s) * TW_VAT.small);
    items.push({ tone: "info", text: `已達起徵點（比例合計 ${Math.round(ratio * 100)}%）。小規模營業人由國稅局查定課徵，稅率1%：每月銷售額 ${ntd(g + s)} 約 ${ntd(tax)}。實際金額與期別以國稅局查定通知為準。`, cite: "營業稅法第13、23條" });
    items.push({ tone: "warn", text: "銷售額多少須改用統一發票、不再適用查定課徵，本工具未核實該金額，請洽國稅局。", cite: "營業稅法第32條、統一發票使用辦法第4條" });
  }
  items.push({ tone: "info", text: "裝潢、廣告、修理、旅宿、租賃、技術與設計等屬每月5萬元起徵點；買賣、製造、一般飲食等屬10萬元。", cite: "小規模營業人營業稅起徵點" });
  return { status, ratio: Math.round(ratio * 1000) / 1000, tax, items };
}

// ── 4. 滯納金、罰鍰、救濟期限 ────────────────────────────────────────
export function twLateFee(x                                                                          ) {
  const late = Math.max(0, days(x.due, x.paid));
  const steps = Math.min(10, Math.floor(Math.min(late, 30) / 3));
  const fee = Math.round(Math.max(0, x.tax) * steps * 0.01);
  const items           = [{ tone: late ? "warn" : "good", text: late ? `逾期${late}日：每逾3日加徵1%，滯納金約 ${ntd(fee)}（${steps}%）。` : "未逾期。", cite: "稅捐稽徵法第20條" }];
  if (late > 30) items.push({ tone: "warn", text: "逾30日仍未繳納，移送強制執行。之後的其他費用本工具未計算。", cite: "稅捐稽徵法第20條" });
  const penalty = x.kind === "business"
    ? { text: "營業稅漏稅（未依規定申報、短報漏報銷售額等）：按所漏稅額處5倍以下罰鍰，並得停止營業。", cite: "營業稅法第51條", maxMultiple: 5 }
    : { text: "所得稅已申報但漏報、短報：所漏稅額2倍以下罰鍰；未申報經調查發現：3倍以下。", cite: "所得稅法第110條", maxMultiple: 3 };
  items.push({ tone: "info", text: penalty.text, cite: penalty.cite });
  return { lateDays: late, fee, feeRate: steps / 100, penaltyMaxMultiple: penalty.maxMultiple, items };
}

export function twAppealDeadlines(x                                                                                                                                                ) {
  const out                                                              = [];
  const base = x.paymentPeriodEnd ?? x.noticeDelivered;
  if (base) out.push({ id: "review", label: `申請復查：${x.paymentPeriodEnd ? "繳款期間屆滿" : "核定通知書送達"}之次日起30日內`, date: twShift(addDays(base, 30)), cite: "稅捐稽徵法第35條" });
  if (x.reviewDecision) out.push({ id: "petition", label: "提起訴願：復查決定送達之次日起30日內", date: twShift(addDays(x.reviewDecision, 30)), cite: "訴願法第14條" });
  if (x.petitionDecision) out.push({ id: "lawsuit", label: "提起行政訴訟：訴願決定書送達後2個月內（不變期間）", date: twShift(addMonths(x.petitionDecision, 2)), cite: "行政訴訟法第106條" });
  if (x.paid) out.push({ id: "refund", label: `溢繳稅款申請退還：自繳納之日起${x.govFault ? "15年（可歸責於政府機關）" : "10年"}內`, date: addDays(addMonths(x.paid, (x.govFault ? 15 : 10) * 12), -1), cite: "稅捐稽徵法第28條" });
  const items           = [
    { tone: "info", text: "復查申請後，稅捐稽徵機關應於2個月內決定；逾期未決定，可逕行提起訴願。", cite: "稅捐稽徵法第35條" },
    { tone: "info", text: "期限依送達次日起算、末日遇週末順延計算；在途期間與國定假日未計入。", cite: "行政程序法第48條" },
  ];
  return { deadlines: out, items };
}

// ── 5. 折舊 ──────────────────────────────────────────────────────────
                                                                                                                                                                                
export const TW_LIFE                                                       = {
  "rc-building": { label: "鋼筋（骨）混凝土、鋼骨建造的辦公、商店、住宅用房屋", years: 50 },
  "brick-reinforced": { label: "加強磚造房屋", years: 35 },
  brick: { label: "磚構造房屋", years: 25 },
  "metal-clad": { label: "金屬建造房屋（有披覆處理）", years: 20 },
  metal: { label: "金屬建造房屋（無披覆處理）", years: 15 },
  wood: { label: "木造房屋", years: 10 },
  computer: { label: "電子計算機及其周邊設備", years: 3 },
  tools: { label: "工具、器具（含生財器具）、複印設備", years: 5 },
  "vehicle-transport": { label: "運輸業用客車、貨車", years: 4 },
  "vehicle-other": { label: "其他業用汽車", years: 5 },
  mold: { label: "模具", years: 2 },
};

export function twDepreciation(x                                                                                          ) {
  const min = TW_LIFE[x.category]?.years ?? 5;
  const years = Math.max(min, Math.round(x.years ?? min));
  const cost = Math.max(0, x.cost);
  const residual = Math.min(cost, Math.max(0, x.residual ?? 0));
  const items           = [];
  if ((x.years ?? min) < min) items.push({ tone: "warn", text: `耐用年數不得短於固定資產耐用年數表的${min}年，已改用${min}年。`, cite: "所得稅法第51條" });
  const expensable = cost <= 80_000 || min < 2;
  if (expensable) items.push({ tone: "good", text: "耐用年數不及2年，或支出金額不超過8萬元：可列為當年度費用。但大量購置時，即使每件不超過8萬元、耐用年數超過2年，仍應列為資本支出。", cite: "營利事業所得稅查核準則第77-1條" });
  const annual = (cost - residual) / years;
  const month = Number(x.start.slice(5, 7));
  const firstMonths = 13 - month;
  const schedule                                                     = [];
  let left = cost - residual, y = Number(x.start.slice(0, 4)), first = true;
  while (left > 0.5 && schedule.length < 60) {
    const months = first ? firstMonths : 12;
    const amt = Math.min(left, annual * months / 12);
    schedule.push({ year: y, months, amount: Math.round(amt) });
    left -= amt; y++; first = false;
  }
  items.push({ tone: "info", text: `平均法：(${ntd(cost)} − 殘值 ${ntd(residual)}) ÷ ${years}年 = 每年 ${ntd(annual)}。第一年按使用月數（不滿1個月以1個月計）計 ${firstMonths} 個月。`, cite: "營利事業所得稅查核準則第95條" });
  items.push({ tone: "info", text: "定率遞減法、年數合計法、生產數量法、工作時間法也可採用（所得稅法第51條），本工具只計算平均法，且以曆年制為準。", cite: "所得稅法第51條" });
  return { years, annual: Math.round(annual), expensable, schedule, items };
}

// ── 6. 誰可以協助 ────────────────────────────────────────────────────
export const TW_SCOPE = [
  { title: "記帳士", body: "在登錄區域內，可代理營業登記與變更、代理申報各項稅捐與申請、提供稅務諮詢、處理商業會計事務等。但不包括所得稅查核簽證申報，也不包括訴願與行政訴訟。", cite: "記帳士法第13條" },
  { title: "會計師", body: "可辦理財務報告簽證、稅務諮詢、代理稅務案件與營利事業所得稅查核簽證申報，並可代理這些業務的訴願與稅務行政訴訟。", cite: "會計師法第39條" },
  { title: "本網站做什麼", body: "整理已公布的法規並附出處，提供日期與試算。不代理申報、不代寫復查或訴願書、不針對個人情況提供稅務意見，也不推薦事務所。", cite: "—" },
  { title: "免費管道", body: "國稅局免付費電話 0800-000-321（上班時間；手機請撥一般電話號碼）。線上申報與繳稅：財政部電子申報繳稅服務網 tax.nat.gov.tw。", cite: "北區國稅局網站" },
];
