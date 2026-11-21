// GENERATED from tools-oiyo src/lib/cn-tax-pack-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 中国税务与会计指南（2026-11-21，按国家本地化第5号：中国大陆）。仅提供一般信息和估算：不提供个案涉税咨询，不代办申报。
// 同一套代码也用于 oiyo-cn-tax-guide 技能（scripts/calc.mjs）和 api.oiyo.net 的 MCP 工具（*_cn_*）。
// 2026-11-21 核对的来源（company-brain projects/oiyo-ecosystem/cn-tax-pack-facts-2026-11-21.md）：
// - 税总办征科函〔2025〕64号（2026年度申报纳税期限）；税收征收管理法实施细则第109条。
// - 个人所得税法第3条（税率表一、二）、第6条（60,000元）、第11、12条；2025年度汇算预约通告（2026-02-03）。
// - 增值税法（2026-01-01施行）第9、10、11、23条；财政部 税务总局公告2026年第10号（起征点10万/30万元、1%征收率至2027-12-31）。
// - 财政部 税务总局公告2023年第12号（个体工商户200万元以下减半、小型微利企业、六税两费，至2027-12-31）。
// - 税收征收管理法第32、51、52、62、63、64、88、89条；行政复议法第20条；行政诉讼法第45、46条；首违不罚清单（2021年第6号、第33号）。
// - 企业所得税法实施条例第59、60、98条；2023年第37号（500万元一次性扣除至2027-12-31）；2019年第66号。
// - 税务师职业资格制度暂行规定；国家税务总局令第58号（涉税专业服务管理办法（试行））。
// 未核实：2027年度申报纳税期限（尚未发布）、现行速算扣除数官方表（本模块按超额累进逐档计算，不使用速算扣除数）。

export const CN_TAX_AS_OF = "2026-11-21";
export const CN_TAX_NOTE = "根据已公布的法律法规和国家税务总局公告整理的一般信息和估算，不是针对个人情况的涉税咨询，本工具不代办申报。具体情况请咨询主管税务机关（12366纳税服务平台、电子税务局）或涉税专业服务机构。";

                                            
                                                                

const iso = (d      ) => d.toISOString().slice(0, 10);
const utc = (y        , m        , d        ) => new Date(Date.UTC(y, m - 1, d));
const days = (a        , b        ) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
const addDays = (s        , n        ) => iso(new Date(Date.parse(s) + n * 86_400_000));
const yuan = (n        ) => `${Math.round(n).toLocaleString("zh-CN")}元`;
const pct = (r        ) => `${Math.round(r * 10_000) / 100}%`;

/** 期限最后一日为周六、周日时顺延（细则第109条按法定休假日顺延；此处只识别周末，法定节假日以税务机关公布为准）。 */
export function cnShift(d      )       {
  let t = d;
  while (t.getUTCDay() === 0 || t.getUTCDay() === 6) t = new Date(t.getTime() + 86_400_000);
  return t;
}

// ── 1. 2026年申报纳税期限 ─────────────────────────────────────────────
/** 税总办征科函〔2025〕64号：2026年各月申报纳税期限截止日。 */
export const ZHENGQI_2026                         = { 1: 20, 2: 24, 3: 16, 4: 20, 5: 22, 6: 15, 7: 15, 8: 17, 9: 15, 10: 26, 11: 16, 12: 15 };
const ZQ = "税总办征科函〔2025〕64号";

                                                                                                                                                                     
                                                                                                                                   

export function cnTaxCalendar(x                 ) {
  const y = x.year;
  const ev            = [];
  const items           = [];
  const quarterMonths = [1, 4, 7, 10];
  const add = (id        , label        , date        , cite        , from         ) =>
    ev.push({ id, label, date, ...(from ? { from } : {}), cite, ...(x.today ? { daysLeft: days(x.today, date) } : {}) });
  const prevPeriod = (m        , q         ) => (q ? `${m === 1 ? `${y - 1}年第4季度` : `${y}年第${(m - 1) / 3}季度`}` : `${m === 1 ? `${y - 1}年12月` : `${y}年${m - 1}月`}`);
  const periodic = (kind               , mode                     ) => {
    const months = mode === "quarter" ? quarterMonths : Array.from({ length: 12 }, (_, i) => i + 1);
    for (const m of months) {
      const what = kind === "vat" ? "增值税申报" : "个人所得税经营所得预缴申报";
      if (y === 2026) add(`${kind}-${m}`, `${what}（所属期：${prevPeriod(m, mode === "quarter")}）`, iso(utc(2026, m, ZHENGQI_2026[m])), ZQ);
      else ev.push({ id: `${kind}-${m}`, label: `${what}（所属期：${prevPeriod(m, mode === "quarter")}），征期一般为当月1日至15日，遇节假日顺延`, month: `${y}-${String(m).padStart(2, "0")}`, cite: "个人所得税法第12条；征管法实施细则第109条" });
    }
  };
  if (x.vat && x.vat !== "none") periodic("vat", x.vat);
  if (x.business && x.business !== "none") {
    periodic("biz", x.business);
    ev.push({ id: "biz-annual", label: `经营所得${y - 1}年度汇算清缴：次年3月31日前`, date: `${y}-03-31`, cite: "个人所得税法第12条", ...(x.today ? { daysLeft: days(x.today, `${y}-03-31`) } : {}) });
  }
  if (x.comprehensive !== false) ev.push({ id: "iit-annual", label: `综合所得${y - 1}年度汇算清缴：${y}年3月1日至6月30日`, from: `${y}-03-01`, date: `${y}-06-30`, cite: "个人所得税法第11条", ...(x.today ? { daysLeft: days(x.today, `${y}-06-30`) } : {}) });
  ev.sort((a, b) => (a.date ?? a.month ?? "").localeCompare(b.date ?? b.month ?? ""));
  if (y !== 2026) items.push({ tone: "warn", text: `${y}年度申报纳税期限通知尚未核实（截至2026-11-21未发布2027年度通知），只显示月份。请以国家税务总局公布的办税日历为准。`, cite: "国家税务总局办税日历" });
  else items.push({ tone: "info", text: "2026年各月征期按国家税务总局通知：6、7、9、12月为15日，其余月份因节假日顺延（1月20日、2月24日、3月16日、4月20日、5月22日、8月17日、10月26日、11月16日）。", cite: ZQ });
  items.push({ tone: "info", text: "期限最后一日是法定休假日的，以休假日期满次日为期限最后一日；期限内有连续3日以上法定休假日的，按休假日天数顺延。", cite: "征管法实施细则第109条" });
  return { events: ev, items };
}

// ── 2. 个人所得税（经营所得、综合所得）与小型微利企业 ──────────────────
export const IIT_COMPREHENSIVE                     = [[36_000, 0.03], [144_000, 0.1], [300_000, 0.2], [420_000, 0.25], [660_000, 0.3], [960_000, 0.35], [Infinity, 0.45]];
export const IIT_BUSINESS                     = [[30_000, 0.05], [90_000, 0.1], [300_000, 0.2], [500_000, 0.3], [Infinity, 0.35]];
export const BASIC_DEDUCTION = 60_000;

/** 超额累进逐档计算（不使用速算扣除数）。 */
export function progressive(base        , table                    ) {
  let t = 0, lo = 0;
  for (const [hi, r] of table) { if (base <= lo) break; t += (Math.min(base, hi) - lo) * r; lo = hi; }
  return Math.round(t * 100) / 100;
}

export function cnBusinessIncome(x                                           ) {
  const taxable = Math.max(0, x.taxable);
  const tax = progressive(taxable, IIT_BUSINESS);
  const items           = [{ tone: "info", text: `经营所得适用5%至35%的超额累进税率，应纳税额约${yuan(tax)}。`, cite: "个人所得税法第3条（税率表二）" }];
  let relief = 0;
  if (x.individual !== false && taxable > 0) {
    relief = Math.round(tax * (Math.min(taxable, 2_000_000) / taxable) * 0.5 * 100) / 100;
    items.push({ tone: "good", text: `个体工商户年应纳税所得额不超过200万元的部分减半征收（至2027年12月31日）。按比例估算减免约${yuan(relief)}；可与其他优惠叠加，实际以申报表计算为准。`, cite: "财政部 税务总局公告2023年第12号第一条" });
  }
  return { taxable, tax, relief, payable: Math.round((tax - relief) * 100) / 100, items };
}

export function cnComprehensive(x                                                                           ) {
  const taxable = Math.max(0, x.income - BASIC_DEDUCTION - (x.special ?? 0) - (x.additional ?? 0) - (x.other ?? 0));
  const tax = progressive(taxable, IIT_COMPREHENSIVE);
  return { taxable, tax, items: [{ tone: "info"        , text: `综合所得减除费用每年60,000元及专项扣除、专项附加扣除等后，应纳税所得额${yuan(taxable)}，按3%至45%计算约${yuan(tax)}。`, cite: "个人所得税法第3条（税率表一）、第6条" }] };
}

export function cnSmallProfitCit(x                                                                              ) {
  const items           = [];
  const ok = !x.restricted && x.taxable <= 3_000_000 && x.employees <= 300 && x.assets <= 50_000_000;
  const general = Math.round(Math.max(0, x.taxable) * 0.25 * 100) / 100;
  const tax = ok ? Math.round(Math.max(0, x.taxable) * 0.25 * 0.2 * 100) / 100 : general;
  if (ok) items.push({ tone: "good", text: `符合小型微利企业条件：应纳税所得额减按25%计入、按20%税率缴纳（实际税负5%为计算值），约${yuan(tax)}，一般税率25%下为${yuan(general)}。政策至2027年12月31日。`, cite: "财政部 税务总局公告2023年第12号第三、五条" });
  else items.push({ tone: "warn", text: "不符合小型微利企业条件（非限制或禁止行业，且年应纳税所得额≤300万元、从业人数≤300人、资产总额≤5,000万元）：按25%计算。", cite: "公告2023年第12号第五条；企业所得税法第4条" });
  return { eligible: ok, tax, general, items };
}

// ── 3. 小规模纳税人增值税起征点 ───────────────────────────────────────
export const VAT_RATES = { 13: 0.13, 9: 0.09, 6: 0.06 }         ;
export const SMALL_SCALE = { monthly: 100_000, quarterly: 300_000, annualLimit: 5_000_000, rate: 0.03, reduced: 0.01 }         ;

export function cnSmallScaleVat(x                                                                                            ) {
  const threshold = x.period === "month" ? SMALL_SCALE.monthly : SMALL_SCALE.quarterly;
  const items           = [];
  const below = x.sales < threshold;
  const rate = x.realEstate ? null : SMALL_SCALE.reduced;
  const tax = below || rate == null ? 0 : Math.round(x.sales * rate * 100) / 100;
  if (below) items.push({ tone: "good", text: `${x.period === "month" ? "月" : "季度"}销售额未达到起征点${yuan(threshold)}：免征增值税。`, cite: "增值税法第23条；公告2026年第10号第一条" });
  else items.push({ tone: "warn", text: `达到起征点${yuan(threshold)}：全额计算缴纳，不是只对超过部分征税。${rate != null ? `适用1%征收率（原3%），约${yuan(tax)}。` : "销售、出租不动产和转让土地使用权不适用1%减按政策，本工具不计算。"}`, cite: "增值税法第23条；公告2026年第10号第一条、第二条（三）6" });
  items.push({ tone: "info", text: "起征点（月10万元、季度30万元、按次1,000元）和3%减按1%政策执行至2027年12月31日。", cite: "财政部 税务总局公告2026年第10号" });
  if (x.annualSales != null && x.annualSales > SMALL_SCALE.annualLimit) items.push({ tone: "warn", text: "年应征增值税销售额超过500万元：不再属于小规模纳税人，适用一般计税方法（税率13%、9%、6%）。", cite: "增值税法第9条、第10条" });
  return { threshold, below, rate, tax, items };
}

// ── 4. 滞纳金、罚款、复议与诉讼期限 ──────────────────────────────────
export const LATE_FEE_DAILY = 0.0005;

export function cnLateFee(x                                            ) {
  const n = Math.max(0, days(x.due, x.paid));
  const fee = Math.round(x.tax * LATE_FEE_DAILY * n * 100) / 100;
  const items           = [
    { tone: n ? "warn" : "good", text: `滞纳金按日加收万分之五：${n}天，约${yuan(fee)}（从期限届满次日起算至缴纳之日）。`, cite: "征管法第32条" },
    { tone: "info", text: "未按期申报：责令限期改正，可处2,000元以下罚款，情节严重的2,000元以上10,000元以下。首次发生、危害后果轻微并及时改正的，可适用首违不罚。", cite: "征管法第62条；国家税务总局公告2021年第6号" },
    { tone: "warn", text: "偷税或不申报不缴、少缴税款的，除补税和滞纳金外，处不缴或少缴税款50%以上5倍以下罚款。", cite: "征管法第63条、第64条" },
  ];
  return { days: n, fee, fineRange: [Math.round(x.tax * 0.5), Math.round(x.tax * 5)]                    , items };
}

export function cnAppealDeadlines(x                                                                                    ) {
  const out                                                              = [];
  const at = (s        ) => iso(cnShift(new Date(Date.parse(s))));
  if (x.known) {
    out.push({ id: "fuyi", label: x.kind === "penalty" ? "申请行政复议（处罚、强制执行可选择复议或诉讼）：知道之日起60日" : "纳税争议：先缴纳税款及滞纳金或提供担保，再申请行政复议：知道之日起60日", date: at(addDays(x.known, 60)), cite: "行政复议法第20条；征管法第88条" });
    if (x.kind === "penalty") {
      const [yy, mm, dd] = x.known.split("-").map(Number);
      out.push({ id: "susong", label: "直接提起行政诉讼：知道之日起6个月", date: at(iso(utc(yy, mm + 6, dd))), cite: "行政诉讼法第46条" });
    }
  }
  if (x.decision) out.push({ id: "after-fuyi", label: "对复议决定不服提起行政诉讼：收到复议决定书之日起15日", date: at(addDays(x.decision, 15)), cite: "行政诉讼法第45条" });
  if (x.paid) {
    const [yy, mm, dd] = x.paid.split("-").map(Number);
    out.push({ id: "refund", label: "多缴税款：自结算缴纳之日起3年内发现的，可要求退还并加算银行同期存款利息", date: iso(utc(yy + 3, mm, dd)), cite: "征管法第51条" });
  }
  return { deadlines: out, notes: ["追征期：税务机关责任3年（不加收滞纳金）；纳税人计算错误等失误3年，特殊情况5年；偷税、抗税、骗税不受期限限制（征管法第52条）。", "日期为估算：只把周末顺延到周一，未计入法定节假日。"] };
}

// ── 5. 企业所得税折旧 ─────────────────────────────────────────────────
export const MIN_YEARS = {
  buildings: { label: "房屋、建筑物", years: 20 },
  machinery: { label: "飞机、火车、轮船、机器、机械和其他生产设备", years: 10 },
  tools: { label: "与生产经营活动有关的器具、工具、家具等", years: 5 },
  vehicles: { label: "飞机、火车、轮船以外的运输工具", years: 4 },
  electronics: { label: "电子设备", years: 3 },
}         ;
                                              
                                                   

export function cnDepreciation(x                                                                                                                                                      ) {
  const c = MIN_YEARS[x.category];
  const items           = [];
  const cost = Math.max(0, x.cost);
  const firstMonth = (() => { const [y, m] = x.start.split("-").map(Number); return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`; })();
  if (x.oneOff && x.category !== "buildings" && cost <= 5_000_000) {
    items.push({ tone: "good", text: "2024年1月1日至2027年12月31日新购进的设备、器具，单位价值不超过500万元的，可一次性计入当期成本费用在税前扣除。", cite: "财政部 税务总局公告2023年第37号" });
    return { minYears: c.years, years: 0, firstMonth, method: "one-off"         , schedule: [{ year: 1, amount: cost, nbv: 0 }], items };
  }
  const floor = x.accelerated ? Math.ceil(c.years * 0.6) : c.years;
  const years = Math.max(floor, Math.round(x.years ?? c.years));
  if (x.years != null && x.years < floor) items.push({ tone: "warn", text: `${c.label}最低折旧年限${c.years}年${x.accelerated ? `（缩短年限不得低于60%，即${floor}年）` : ""}：按${years}年计算。`, cite: x.accelerated ? "企业所得税法实施条例第98条" : "企业所得税法实施条例第60条" });
  const residual = cost * Math.min(0.5, Math.max(0, x.residualRate ?? 0));
  const method         = x.accelerated ? (x.method ?? "straight") : "straight";
  if (!x.accelerated && x.method && x.method !== "straight") items.push({ tone: "warn", text: "双倍余额递减法、年数总和法仅限可以采取加速折旧的固定资产：按直线法计算。", cite: "企业所得税法实施条例第98条" });
  const schedule                                                  = [];
  let nbv = cost;
  for (let i = 0; i < years; i++) {
    let amt        ;
    if (method === "straight") amt = (cost - residual) / years;
    else if (method === "sum") amt = (cost - residual) * (years - i) / (years * (years + 1) / 2);
    else amt = years - i <= 2 ? (nbv - residual) / (years - i) : nbv * (2 / years); // 最后两年改为直线法
    amt = Math.max(0, Math.min(amt, nbv - residual));
    nbv -= amt;
    schedule.push({ year: i + 1, amount: Math.round(amt * 100) / 100, nbv: Math.round(nbv * 100) / 100 });
  }
  items.push({ tone: "info", text: `${c.label}：最低折旧年限${c.years}年。自投入使用月份的次月（${firstMonth}）起计提，表中为每12个月的折旧年度。`, cite: "企业所得税法实施条例第59条、第60条" });
  items.push({ tone: "info", text: "预计净残值由企业根据资产性质和使用情况合理确定，一经确定不得变更。", cite: "企业所得税法实施条例第59条" });
  if (x.accelerated) items.push({ tone: "info", text: "技术进步快、强震动高腐蚀等固定资产可缩短年限或采用加速折旧；全部制造业企业适用加速折旧政策范围。", cite: "实施条例第98条；公告2019年第66号" });
  return { minYears: c.years, years, firstMonth, method, schedule, items };
}

// ── 6. 涉税专业服务与免费渠道 ─────────────────────────────────────────
export const CN_SCOPE = [
  { title: "可以委托税务代理人", body: "纳税人、扣缴义务人可以委托税务代理人代为办理税务事宜。", cite: "税收征收管理法第89条" },
  { title: "涉税专业服务机构", body: "涉税专业服务包括纳税申报代办、一般税务咨询、专业税务顾问、税务合规计划、涉税鉴证、纳税情况审查、其他税务事项代办等。提供服务的机构包括税务师事务所、会计师事务所、律师事务所、代理记账机构、税务代理公司、财税类咨询公司等。", cite: "国家税务总局令第58号（涉税专业服务管理办法（试行），2025-05-01施行）" },
  { title: "税务师是水平评价类职业资格", body: "税务师职业资格通过全国统一考试取得，属于水平评价类，由全国税务师行业协会提供登记服务。选择机构时，可在税务机关和行业协会公开信息中查询其登记情况。", cite: "税务师职业资格制度暂行规定（人社部发〔2015〕90号）" },
  { title: "本网站做什么", body: "只说明已公布的规则，给出期限和估算并注明官方来源。不代办申报，不提供涉税鉴证或个案咨询，不推荐任何机构，也不使用税务师等职业称谓。", cite: "—" },
  { title: "免费渠道", body: "国家税务总局12366纳税服务平台（12366.chinatax.gov.cn）提供智能咨询；电子税务局、自然人电子税务局和个人所得税APP可办理申报，综合所得汇算可在个人所得税APP预约。", cite: "chinatax.gov.cn；2025年度汇算预约通告" },
];
