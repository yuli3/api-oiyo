// GENERATED from tools-oiyo src/lib/world-consumer-pack-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 7-jurisdiction consumer cooling-off / withdrawal pack (2026-11-22, world pro-gap #2).
// Last day to cancel, refund deadline and exclusions. General information only: no legal advice, no representation.
// Same code powers the oiyo-world-consumer-guide skill and api.oiyo.net start_world_cooling_off.
// Facts: /mnt/project-files/notes/consumer-cooling-off-facts-2026-11-22.md (prefecture consumer centres for 特定商取引法,
// legislation.gov.uk SI 2013/3134 regs 29-31, service-public.gouv.fr F10485, consumoresponde.es, gov.cn SAMR order 90,
// laws.gov.taipei 消費者保護法 19條 + 民法 120·122條, consumer.ftc.gov Cooling-Off Rule).
// Not computed because not verified: public-holiday calendars (FR jours fériés, US federal holidays, TW 紀念日),
// UK/ES/JP weekend rules, UK refund deadline, Taiwan 合理例外 list, France hors-établissement specifics.

export const CONSUMER_AS_OF = "2026-11-22";
                                                                     
                                            
                                                               
                                                                              

const iso = (d      ) => d.toISOString().slice(0, 10);
export const addDays = (s        , n        ) => iso(new Date(Date.parse(s) + n * 86_400_000));
export const addMonths = (s        , n        ) => {
  const [y, m, d] = s.split("-").map(Number);
  const last = new Date(Date.UTC(y, m - 1 + n + 1, 0)).getUTCDate();
  return iso(new Date(Date.UTC(y, m - 1 + n, Math.min(d, last))));
};
const dow = (s        ) => new Date(Date.parse(s)).getUTCDay(); // 0 Sun … 6 Sat
const ok = (s         ) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
const pos = (n         ) => Math.max(0, Number(n) || 0);
                                                                                                                                                           
const result = (items         , dates         , help        , extra                                                                    )                => ({ asOf: CONSUMER_AS_OF, ...extra, items, dates, help });

// ── Japan 特定商取引法 ───────────────────────────────────────────────
                                                                                                                      
export const JP_DAYS                                                                                      = {
  visit: { days: 8, label: "訪問販売", cite: "特定商取引法9条" },
  phone: { days: 8, label: "電話勧誘販売", cite: "特定商取引法24条" },
  continuous: { days: 8, label: "特定継続的役務提供（エステ・語学教室など）", cite: "特定商取引法48条" },
  visitPurchase: { days: 8, label: "訪問購入", cite: "特定商取引法58条の14" },
  mlm: { days: 20, label: "連鎖販売取引（マルチ商法）", cite: "特定商取引法40条" },
  businessOpportunity: { days: 20, label: "業務提供誘引販売取引（内職・モニター商法）", cite: "特定商取引法58条" },
};
export function jpCoolingOff(x                                             ) {
  const items          = [];
  const dates          = [];
  if (x.kind === "mailOrder") {
    items.push({ tone: "warn", text: "通信販売（ネット通販など）にはクーリング・オフ制度はありません。返品できるかは事業者が表示した返品特約によります。", cite: "特定商取引法（通信販売）" });
    return result(items, dates, "消費者ホットライン 188", { days: null, lastDay: null });
  }
  const k = JP_DAYS[x.kind];
  let lastDay                = null;
  if (ok(x.documentReceived)) {
    lastDay = addDays(x.documentReceived , k.days - 1);
    dates.push({ id: "last", label: `クーリング・オフの最終日（${k.label}・${k.days}日間、書面を受け取った日を1日目として数える）`, date: lastDay, cite: k.cite });
  } else items.push({ tone: "info", text: `${k.label}は、申込書面か契約書面のどちらか早いほうを受け取った日から数えて${k.days}日間です。`, cite: k.cite });
  items.push({ tone: "good", text: "期間内に発信すれば、事業者に届くのが期間後でも有効です。書面（はがき可）かメールなどの電磁的記録で通知し、特定記録郵便や簡易書留など記録が残る方法を使いましょう。", cite: "特定商取引法（発信主義）" });
  items.push({ tone: "warn", text: "法定の書面を受け取っていない、または記載に不備があるときは、期間が始まっていないことがあります。消費生活センターに相談しましょう。", cite: k.cite });
  items.push({ tone: "info", text: "期間の最終日が土日祝日でも延びるかどうかは、ここでは確認していません。早めに発信してください。", cite: "未確認" });
  return result(items, dates, "消費者ホットライン 188", { days: k.days, lastDay });
}

// ── England & Wales / UK: Consumer Contracts Regulations 2013 ───────
                                                                                
export function ukCoolingOff(x                                                                                                     ) {
  const items          = [];
  const dates          = [];
  const goods = x.kind !== "services";
  const start = goods ? x.delivered : x.contractDate;
  const cite = { goods: "CCR 2013 reg 30(3)", multipleGoods: "CCR 2013 reg 30(4)", regularDelivery: "CCR 2013 reg 30(6)", services: "CCR 2013 reg 30(2)" }[x.kind];
  let lastDay                = null;
  if (ok(start)) {
    const normal = addDays(start , 14);
    lastDay = normal;
    if (x.infoGiven === false) {
      const late = addMonths(normal, 12);
      lastDay = late;
      if (ok(x.infoDate) && Date.parse(x.infoDate ) <= Date.parse(late)) lastDay = addDays(x.infoDate , 14);
      items.push({ tone: "warn", text: "The trader did not give you the cancellation information, so the period is extended: up to 12 months after it would have ended, or 14 days after you finally receive the information.", cite: "CCR 2013 reg 31" });
    }
    const what = { goods: "the day the goods arrived", multipleGoods: "the day the last item arrived", regularDelivery: "the day the first delivery arrived", services: "the day the contract was made" }[x.kind];
    dates.push({ id: "last", label: `Last day to cancel (14 days after ${what})`, date: lastDay, cite: x.infoGiven === false ? "CCR 2013 reg 31" : cite });
  } else items.push({ tone: "info", text: goods ? "For goods bought online, by phone or off-premises, you have 14 days after the goods arrive." : "For services, the 14 days run from the day after the contract is made.", cite });
  items.push({ tone: "good", text: "You do not need to give a reason.", cite: "CCR 2013 reg 29(1)" });
  items.push({ tone: "info", text: "This applies to distance and off-premises contracts. Refund deadlines and what happens when the last day falls on a weekend are not checked here.", cite: "CCR 2013 reg 29" });
  return result(items, dates, "Citizens Advice consumer service", { days: 14, lastDay });
}

// ── France: Code de la consommation L221-18 s. ──────────────────────
                                                             
export function frCoolingOff(x                                                                                                                              ) {
  const items          = [];
  const dates          = [];
  const start = x.kind === "services" ? x.contractDate : x.delivered;
  let lastDay                = null;
  let shifted = false;
  if (ok(start)) {
    let d = addDays(start , 14);
    if (x.infoGiven === false) {
      d = addMonths(d, 12);
      if (ok(x.infoDate) && Date.parse(x.infoDate ) <= Date.parse(d)) d = addDays(x.infoDate , 14);
      items.push({ tone: "warn", text: "Le professionnel ne vous a pas informé du droit de rétractation : le délai est prolongé de 12 mois après la fin du délai initial (ou 14 jours à compter de la réception de l'information).", cite: "C. consom. L221-20" });
    }
    if (dow(d) === 6) { d = addDays(d, 2); shifted = true; } else if (dow(d) === 0) { d = addDays(d, 1); shifted = true; }
    lastDay = d;
    dates.push({ id: "last", label: `Dernier jour pour se rétracter (14 jours à compter du lendemain ${x.kind === "services" ? "de la conclusion du contrat" : x.kind === "plusieursBiens" ? "de la réception du dernier bien" : "de la réception du bien"}${shifted ? ", reporté au lundi" : ""})`, date: lastDay, cite: "C. consom. L221-18" });
    items.push({ tone: "info", text: "Si le délai expire un jour férié, il est prolongé au premier jour ouvrable suivant. Les jours fériés ne sont pas vérifiés ici : seul le samedi et le dimanche sont reportés.", cite: "C. consom. L221-18" });
  } else items.push({ tone: "info", text: "Vous avez 14 jours calendaires : à partir du lendemain de la réception du bien, ou du lendemain de la conclusion du contrat pour un service.", cite: "C. consom. L221-18" });
  if (ok(x.withdrawalSent)) {
    dates.push({ id: "refund", label: "Remboursement au plus tard (14 jours après que le vendeur a été informé)", date: addDays(x.withdrawalSent , 14), cite: "C. consom. L221-24" });
    if (x.kind !== "services") dates.push({ id: "return", label: "Renvoyer le bien au plus tard (14 jours après l'envoi de la rétractation)", date: addDays(x.withdrawalSent , 14), cite: "C. consom. L221-23" });
  }
  items.push({ tone: "good", text: "Vous n'avez pas à motiver votre décision. Gardez une preuve de l'envoi : renvoyer le colis sans déclaration ne suffit pas.", cite: "C. consom. L221-21" });
  items.push({ tone: "warn", text: "Exclus notamment : biens personnalisés, denrées périssables, produits descellés pour l'hygiène, CD/DVD/logiciels descellés, journaux, hébergement ou loisirs à date fixe, services pleinement exécutés avec votre accord.", cite: "C. consom. L221-28" });
  return result(items, dates, "SignalConso (signal.conso.gouv.fr) · conciliateur de justice", { days: 14, lastDay });
}

// ── Spain: TRLGDCU desistimiento ────────────────────────────────────
                                            
export function esCoolingOff(x                                                                                                                              ) {
  const items          = [];
  const dates          = [];
  const start = x.kind === "servicios" ? x.contractDate : x.delivered;
  let lastDay                = null;
  if (ok(start)) {
    let d = addDays(start , 14);
    if (x.infoGiven === false) {
      d = addMonths(d, 12);
      if (ok(x.infoDate) && Date.parse(x.infoDate ) <= Date.parse(d)) d = addDays(x.infoDate , 14);
      items.push({ tone: "warn", text: "No le informaron del derecho de desistimiento: el plazo termina 12 meses después del plazo inicial (o 14 días desde que reciba la información).", cite: "TRLGDCU (consumoresponde.es)" });
    }
    lastDay = d;
    dates.push({ id: "last", label: `Último día para desistir (14 días naturales desde ${x.kind === "servicios" ? "la celebración del contrato" : "la recepción del bien"})`, date: lastDay, cite: "TRLGDCU (consumoresponde.es)" });
  } else items.push({ tone: "info", text: "Tiene al menos 14 días naturales: desde la recepción del bien, o desde la celebración del contrato si es un servicio.", cite: "TRLGDCU (consumoresponde.es)" });
  if (ok(x.withdrawalSent)) dates.push({ id: "refund", label: "Reembolso como tarde (14 días naturales desde que se informó del desistimiento)", date: addDays(x.withdrawalSent , 14), cite: "TRLGDCU (consumoresponde.es)" });
  items.push({ tone: "good", text: "No hace falta justificar la decisión ni seguir una forma concreta; cuenta la fecha de envío. Si el reembolso llega tarde, puede reclamar el doble.", cite: "TRLGDCU (consumoresponde.es)" });
  items.push({ tone: "info", text: "Qué pasa si el último día cae en festivo no está comprobado aquí.", cite: "no verificado" });
  return result(items, dates, "Oficina Municipal de Información al Consumidor (OMIC) · consumoresponde.es", { days: 14, lastDay });
}

// ── China: 七日无理由退货 ───────────────────────────────────────────
                                                                                                                                        
export function cnCoolingOff(x                                                                                         ) {
  const items          = [];
  const dates          = [];
  if (!x.online) {
    items.push({ tone: "warn", text: "七日无理由退货适用于网络、电视、电话、邮购等方式购买的商品。实体店购物能否退货，看商家承诺。", cite: "消费者权益保护法第25条" });
    return result(items, dates, "12315 平台（全国市场监管投诉举报）", { days: null, lastDay: null });
  }
  const ex = x.excluded ?? "none";
  const hard = ["custom", "perishable", "digitalOpened", "newspaper"].includes(ex);
  const soft = ["safetyOpened", "activated", "nearExpiry"].includes(ex);
  if (hard) items.push({ tone: "warn", text: "定作、鲜活易腐、在线下载或已拆封的音像制品和软件等数字化商品、交付的报纸期刊，不适用七日无理由退货。", cite: "网络购买商品七日无理由退货暂行办法第6条" });
  if (soft) items.push({ tone: "warn", text: "拆封后影响安全或健康、激活试用后价值明显贬损、临近保质期或有瑕疵且已明示的商品，经您在购买时确认后可以不适用。购买时没有确认的，仍可退货。", cite: "暂行办法第7条" });
  let lastDay                = null;
  if (!hard && ok(x.signedFor)) {
    lastDay = addDays(x.signedFor , 7);
    dates.push({ id: "last", label: "无理由退货最后一天（自签收次日起算七日）", date: lastDay, cite: "暂行办法第10条" });
  }
  if (ok(x.returnReceived)) dates.push({ id: "refund", label: "商家退款最晚日期（收到退回商品之日起七日内）", date: addDays(x.returnReceived , 7), cite: "暂行办法第13条" });
  items.push({ tone: "info", text: "退回运费依法由消费者承担，另有约定的除外。商品质量有问题的退货不受七日限制。", cite: "暂行办法第18条" });
  return result(items, dates, "12315 平台（全国市场监管投诉举报）", { days: hard ? null : 7, lastDay });
}

// ── Taiwan 消費者保護法 19條 ────────────────────────────────────────
export function twCoolingOff(x                                                                                                                             ) {
  const items          = [];
  const dates          = [];
  if (x.channel === "store") {
    items.push({ tone: "warn", text: "七日解約權（俗稱七日鑑賞期）適用於通訊交易（網購、電視購物）和訪問交易，在店面購買不適用。", cite: "消費者保護法第19條" });
    return result(items, dates, "行政院消費者保護會、各縣市消費者服務中心", { days: null, lastDay: null });
  }
  let lastDay                = null;
  const base = x.infoGiven === false ? x.infoDate : x.received;
  if (ok(base)) {
    let d = addDays(base , 7);
    let shifted = false;
    if (dow(d) === 0) { d = addDays(d, 1); shifted = true; }
    lastDay = d;
    dates.push({ id: "last", label: `解除契約最後一天（${x.infoGiven === false ? "企業補行告知" : "收受商品或接受服務"}之次日起算七日${shifted ? "，末日為星期日順延" : ""}）`, date: lastDay, cite: "消費者保護法第19條、民法第120條・第122條" });
    if (x.infoGiven === false) {
      items.push({ tone: "warn", text: "企業沒有告知解約期間與方式時，七日從補行告知的次日起算；但從原本七日期間起算後超過四個月，解約權消滅。", cite: "消費者保護法第19條第3項" });
      if (ok(x.received)) dates.push({ id: "lapse", label: "解約權最晚消滅日（原七日起算後四個月，概算）", date: addMonths(addDays(x.received , 1), 4), cite: "消費者保護法第19條第3項" });
    }
    items.push({ tone: "info", text: "末日遇紀念日或其他休息日也順延到次日，但國定假日表沒有在這裡核對，只順延星期日。", cite: "民法第122條" });
  } else items.push({ tone: "info", text: "收受商品或接受服務後七日內，可以退回商品或書面通知解除契約。", cite: "消費者保護法第19條" });
  if (ok(x.noticeOrReturn)) dates.push({ id: "refund", label: "企業返還價金最晚日（通知或退回後十五日內）", date: addDays(x.noticeOrReturn , 15), cite: "消費者保護法第19條之2" });
  items.push({ tone: "good", text: "不必說明理由，也不用負擔任何費用或對價。", cite: "消費者保護法第19條第1項" });
  items.push({ tone: "warn", text: "通訊交易有「合理例外情事」（由行政院公告，例如易腐敗、客製化商品等）的不適用；例外清單沒有在這裡核對。", cite: "消費者保護法第19條第2項" });
  return result(items, dates, "行政院消費者保護會、各縣市消費者服務中心", { days: 7, lastDay });
}

// ── United States: FTC Cooling-Off Rule (16 CFR 429) ────────────────
                                                                      
export const US_THRESHOLD = { home: 25, temporary: 130 };
export function usCoolingOff(x                                                                                                   ) {
  const items          = [];
  const dates          = [];
  const price = pos(x.price);
  let covered = x.place === "home" || x.place === "temporary";
  if (!covered) items.push({ tone: "warn", text: "The FTC Cooling-Off Rule does not cover sales made entirely online, by mail or by phone, or sales after negotiations at the seller's permanent place of business. Check the seller's return policy and your state's law.", cite: "16 CFR 429" });
  if (covered && price < US_THRESHOLD[x.place                        ]) {
    covered = false;
    items.push({ tone: "warn", text: `Sales under $${US_THRESHOLD[x.place                        ]} ${x.place === "home" ? "at your home" : "at temporary locations"} are not covered.`, cite: "16 CFR 429" });
  }
  if (covered && x.excludedItem) {
    covered = false;
    items.push({ tone: "warn", text: "Real estate, insurance, securities, and vehicles sold at temporary locations by sellers with a permanent place of business are not covered.", cite: "16 CFR 429" });
  }
  let lastDay                = null;
  if (covered && ok(x.saleDate)) {
    let d = x.saleDate ;
    let n = 0;
    while (n < 3) { d = addDays(d, 1); if (dow(d) !== 0) n++; }
    lastDay = d;
    dates.push({ id: "last", label: "Cancel by midnight of this day (third business day after the sale; Saturdays count, Sundays don't)", date: lastDay, cite: "16 CFR 429" });
    items.push({ tone: "info", text: "Federal holidays don't count as business days either. Holidays are not checked here, so if one falls in these three days you get one more day.", cite: "16 CFR 429" });
  }
  if (covered && ok(x.cancelSent)) dates.push({ id: "refund", label: "Seller must refund by (10 days after your cancellation)", date: addDays(x.cancelSent , 10), cite: "16 CFR 429" });
  if (covered) items.push({ tone: "good", text: "Mail the cancellation form so it is postmarked before midnight of the third business day; certified mail gives you proof.", cite: "16 CFR 429" });
  return result(items, dates, "FTC ReportFraud.ftc.gov · your state attorney general", { days: covered ? 3 : null, lastDay, covered });
}

export const CONSUMER_HELP                          = {
  JP: "消費者ホットライン 188",
  UK: "Citizens Advice consumer service",
  FR: "SignalConso (signal.conso.gouv.fr) · conciliateur de justice",
  ES: "Oficina Municipal de Información al Consumidor (OMIC) · consumoresponde.es",
  CN: "12315 平台（全国市场监管投诉举报）",
  TW: "行政院消費者保護會、各縣市消費者服務中心",
  US: "FTC ReportFraud.ftc.gov · your state attorney general",
};
