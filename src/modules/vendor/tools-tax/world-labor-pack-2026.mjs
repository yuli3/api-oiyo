// GENERATED from tools-oiyo src/lib/world-labor-pack-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 7-country labour exit pack (2026-11-21, country localisation wave 3: labour). General information and estimates only:
// no legal advice, no representation, no filing. Same code powers the oiyo-world-labor-guide skill and api.oiyo.net *_labor_* tools.
// Facts: company-brain projects/oiyo-ecosystem/labor-pack-facts-2026-11-21.md (f58c262a), checked 2026-11-21 against
// e-Gov/MHLW, gov.uk, DOL/eCFR/EEOC/CA DIR, service-public.gouv.fr, BOE, flk.npc.gov.cn, law.moj.gov.tw.
// Not verified (so not computed): JP 給付制限 practice (1 month from 2025?), JP 特定受給資格者 under 30 with 1-5 years,
// US NY/TX final pay, FR préavis length and ARE after 2025-04, ES SMI annual amount and the 45/33-day transition cap,
// CN annual leave, arbitration limitation and 2026 local minimum wages, TW 2026 minimum wage amount and mediation offices,
// UK ET "less one day" counting and the 2-year qualifying period text.

export const LABOR_AS_OF = "2026-11-21";
                                            
                                                               
                                                                              

const iso = (d      ) => d.toISOString().slice(0, 10);
const utc = (y        , m        , d        ) => new Date(Date.UTC(y, m - 1, d));
const addDays = (s        , n        ) => iso(new Date(Date.parse(s) + n * 86_400_000));
const addMonths = (s        , n        ) => {
  const [y, m, d] = s.split("-").map(Number);
  const last = new Date(Date.UTC(y, m - 1 + n + 1, 0)).getUTCDate();
  return iso(utc(y, m + n, Math.min(d, last)));
};
const dow = (s        ) => new Date(Date.parse(s)).getUTCDay();
/** Business days after s, skipping Saturdays and Sundays only (public holidays are not known here). */
const addWeekdays = (s        , n        ) => { let d = s, k = 0; while (k < n) { d = addDays(d, 1); if (![0, 6].includes(dow(d))) k++; } return d; };
/** Full years and remaining months between two dates. */
export function service(start        , end        ) {
  const [y1, m1, d1] = start.split("-").map(Number), [y2, m2, d2] = end.split("-").map(Number);
  let months = (y2 - y1) * 12 + (m2 - m1) - (d2 < d1 ? 1 : 0);
  months = Math.max(0, months);
  return { years: Math.floor(months / 12), months: months % 12, totalMonths: months, exactYears: months / 12 };
}
const r2 = (n        ) => Math.round(n * 100) / 100;

// ── Japan ────────────────────────────────────────────────────────────
export const JP_MIN_WAGE = { tokyo: 1_280, osaka: 1_231, nationalAverage: 1_177 }         ;
const JP_SPECIFIC                                    = {
  // years insured bands: <1, 1-5, 5-10, 10-20, 20+ (雇用保険法第23条; <1年 and under-30 1-5年 not verified)
  u30: [null, null, 120, 180, 180], u35: [null, 120, 180, 210, 240], u45: [null, 150, 180, 240, 270], u60: [null, 180, 240, 270, 330], u65: [null, 150, 180, 210, 240],
};
export function jpLaborExit(x                                                                                                                                                                                                            ) {
  const items          = [];
  const s = service(x.start, x.end);
  const notice = Math.max(0, Math.round(x.noticeDays ?? 30));
  const shortfall = x.reason === "dismissal" ? Math.max(0, 30 - notice) : 0;
  const noticePay = Math.round(shortfall * Math.max(0, x.dailyAverageWage ?? 0));
  if (x.reason === "dismissal") items.push(shortfall
    ? { tone: "warn", text: `解雇予告が${notice}日前のため、不足する${shortfall}日分の平均賃金（約${noticePay.toLocaleString("ja-JP")}円）が解雇予告手当になります。`, cite: "労働基準法第20条" }
    : { tone: "good", text: "30日以上前の予告があれば、解雇予告手当は発生しません。", cite: "労働基準法第20条" });
  const y = x.insuredYears, band = y < 1 ? 0 : y < 5 ? 1 : y < 10 ? 2 : y < 20 ? 3 : 4;
  let days               ;
  if (x.reason === "dismissal") {
    const key = x.age < 30 ? "u30" : x.age < 35 ? "u35" : x.age < 45 ? "u45" : x.age < 60 ? "u60" : "u65";
    days = JP_SPECIFIC[key][band];
  } else days = y < 1 ? null : y < 10 ? 90 : y < 20 ? 120 : 150;
  items.push(days != null
    ? { tone: "info", text: `基本手当の所定給付日数は${days}日です（${x.reason === "dismissal" ? "倒産・解雇等による離職" : "自己都合等による離職"}、被保険者期間${y}年、${x.age}歳）。受給資格の有無はハローワークが判断します。`, cite: x.reason === "dismissal" ? "雇用保険法第23条" : "雇用保険法第22条" }
    : { tone: "warn", text: "この年齢・被保険者期間の給付日数は、確認した条文の範囲外のため表示しません。ハローワークで確認してください。", cite: "雇用保険法第22条・第23条" });
  items.push({ tone: "info", text: "求職の申込み後、失業の状態が通算7日に満たない間は支給されません（待期）。", cite: "雇用保険法第21条" });
  if (x.reason === "self") items.push({ tone: "warn", text: "自己都合退職などは、待期の後、1か月以上3か月以内の給付制限があります（法律の規定）。現在の運用上の期間はハローワークで確認してください。", cite: "雇用保険法第33条" });
  const grant = s.totalMonths < 6 ? 0 : [10, 11, 12, 14, 16, 18, 20][Math.min(6, Math.floor((s.totalMonths - 6) / 12))];
  items.push({ tone: "info", text: `勤続${s.years}年${s.months}か月：年次有給休暇の付与日数は${grant}日（出勤率8割以上の場合、週5日勤務など通常の労働者）。`, cite: "労働基準法第39条" });
  if (x.hourlyWage != null) {
    const min = x.region === "tokyo" ? JP_MIN_WAGE.tokyo : x.region === "osaka" ? JP_MIN_WAGE.osaka : null;
    items.push(min != null
      ? (x.hourlyWage < min ? { tone: "warn", text: `時給${x.hourlyWage}円は令和8年度の地域別最低賃金${min}円を下回っています。`, cite: "厚労省 令和8年度地域別最低賃金" } : { tone: "good", text: `時給${x.hourlyWage}円は地域別最低賃金${min}円以上です。`, cite: "厚労省 令和8年度地域別最低賃金" })
      : { tone: "info", text: `令和8年度の全国加重平均は${JP_MIN_WAGE.nationalAverage}円です。都道府県ごとの額と発効日は厚労省の一覧で確認してください。`, cite: "厚労省 令和8年度地域別最低賃金" });
  }
  const dates          = [{ id: "wage-claim", label: "未払い賃金の請求権の時効（当分の間3年。退職手当は5年）", date: addMonths(x.end, 36), cite: "労働基準法第115条・第143条" }];
  items.push({ tone: "info", text: "相談は総合労働相談コーナー（無料・予約不要、労使どちらも可）へ。", cite: "厚生労働省" });
  return { country: "JP", service: s, noticePay, benefitDays: days, paidLeaveDays: grant, dates, items };
}

// ── United Kingdom ───────────────────────────────────────────────────
export const UK_LABOR = { nlw21: 12.71, nmw18_20: 10.85, nmwUnder18: 8, apprentice: 8, weekCap: 751, maxYears: 20, ssp: 123.25 }         ;
export function ukLaborExit(x                                                                                                                                                             ) {
  const items          = [];
  const s = service(x.start, x.end);
  const counted = Math.min(UK_LABOR.maxYears, s.years);
  const week = Math.min(UK_LABOR.weekCap, Math.max(0, x.weeklyPay));
  let weeks = 0;
  for (let i = 0; i < counted; i++) { const a = x.age - i - 1; weeks += a >= 41 ? 1.5 : a >= 22 ? 1 : 0.5; }
  const redundancy = r2(weeks * week);
  items.push({ tone: "info", text: `Statutory redundancy pay: ${weeks} weeks × £${week.toLocaleString("en-GB")} (weekly pay capped at £751) = £${redundancy.toLocaleString("en-GB")} for ${counted} full year(s) of service (max 20). Eligibility conditions apply; check gov.uk.`, cite: "gov.uk Redundancy: your rights" });
  const notice = s.totalMonths < 1 ? 0 : s.years < 2 ? 1 : Math.min(12, s.years);
  items.push({ tone: "info", text: `Statutory minimum notice from your employer: ${notice} week(s). Your contract may give more.`, cite: "gov.uk Redundancy: your rights (notice periods)" });
  const dpw = Math.min(7, Math.max(0, x.daysPerWeek ?? 5));
  const holiday = r2(Math.min(28, dpw * 5.6));
  items.push({ tone: "info", text: `Statutory holiday: 5.6 weeks a year, ${holiday} days for ${dpw} days a week (capped at 28).`, cite: "gov.uk Holiday entitlement" });
  if (x.hourlyPay != null) {
    const min = x.age >= 21 ? UK_LABOR.nlw21 : x.age >= 18 ? UK_LABOR.nmw18_20 : UK_LABOR.nmwUnder18;
    items.push(x.hourlyPay < min ? { tone: "warn", text: `£${x.hourlyPay} an hour is below the £${min} minimum for your age (from April 2026).`, cite: "gov.uk National Minimum Wage rates" } : { tone: "good", text: `£${x.hourlyPay} an hour meets the £${min} minimum for your age.`, cite: "gov.uk National Minimum Wage rates" });
  }
  if (x.averageWeeklyEarnings != null) items.push({ tone: "info", text: `Statutory Sick Pay: the lower of £123.25 a week or 80% of average weekly earnings = £${r2(Math.min(UK_LABOR.ssp, x.averageWeeklyEarnings * 0.8))} a week, up to 28 weeks.`, cite: "gov.uk Statutory Sick Pay" });
  const dates          = [];
  const inc = x.incident ?? x.end;
  const m = inc >= "2026-10-01" ? 6 : 3;
  dates.push({ id: "tribunal", label: `Employment tribunal claim: ${m} months from the problem (6 months if it happened on or after 1 October 2026). Notify Acas for free early conciliation first; check the exact last day with Acas.`, date: addMonths(inc, m), cite: "gov.uk Employment tribunals" });
  return { country: "GB", service: s, redundancyPay: redundancy, redundancyWeeks: weeks, noticeWeeks: notice, holidayDays: holiday, dates, items };
}

// ── United States (federal + CA/NY/TX) ───────────────────────────────
export const US_MIN_WAGE                         = { federal: 7.25, CA: 16.9, "NY-NYC": 17, NY: 16, TX: 7.25 };
export function usLaborExit(x                                                                                                                                                                                                                      ) {
  const items          = [];
  const st = x.state ?? "federal";
  const min = US_MIN_WAGE[st];
  let overtimePay = 0;
  if (x.hourlyWage != null) {
    items.push(x.hourlyWage < min ? { tone: "warn", text: `$${x.hourlyWage}/hour is below the ${st === "federal" ? "federal" : st} minimum wage of $${min}.`, cite: "DOL State Minimum Wage Laws (2026-11-05)" } : { tone: "good", text: `$${x.hourlyWage}/hour meets the $${min} minimum (${st}).`, cite: "DOL State Minimum Wage Laws (2026-11-05)" });
    const ot = Math.max(0, (x.weeklyHours ?? 40) - 40);
    overtimePay = r2(ot * x.hourlyWage * 1.5);
    if (ot) items.push({ tone: "info", text: `Non-exempt employees: ${ot} hour(s) over 40 in a week at 1.5× = $${overtimePay} overtime pay.${st === "CA" ? " California also requires daily overtime (over 8 hours, and double time over 12), which is not calculated here." : ""}`, cite: "FLSA (DOL Handy Reference Guide)" });
  }
  if (x.employees != null && x.layoffAtSite != null) {
    const covered = x.employees >= 100;
    items.push(covered && x.layoffAtSite >= 50
      ? { tone: "warn", text: "With 100+ employees and 50+ full-time job losses at one site within 30 days, WARN may require 60 days' written notice (a mass layoff also needs 33% of the workforce or 500+ employees).", cite: "20 CFR 639.3" }
      : { tone: "info", text: "Below the WARN thresholds you entered (100+ employees; 50+ losses at one site in 30 days).", cite: "20 CFR 639.3" });
  }
  if (st === "CA" && x.fired != null) items.push({ tone: "info", text: x.fired ? "California: if you are fired, final wages (including accrued vacation) are due immediately." : "California: if you quit with 72 hours' notice, final pay is due on your last day; without notice, within 72 hours.", cite: "CA Labor Code 201, 202, 227.3 (DIR FAQ)" });
  else if (st !== "CA") items.push({ tone: "info", text: "Federal law does not require an immediate final paycheck; some states do. NY and TX final pay rules are not covered here.", cite: "DOL Last Paycheck" });
  const dates          = [];
  const inc = x.incident ?? x.end;
  if (inc) {
    dates.push({ id: "eeoc", label: `EEOC discrimination charge: ${x.stateAgency ? 300 : 180} days from the discrimination (300 if a state or local agency enforces a similar law; age claims only with a state law)`, date: addDays(inc, x.stateAgency ? 300 : 180), cite: "EEOC Time Limits for Filing a Charge" });
    dates.push({ id: "flsa", label: "FLSA back wages: 2 years (3 years if the violation was willful)", date: addMonths(inc, 24), cite: "FLSA (29 U.S.C. 255, DOL guide)" });
    dates.push({ id: "flsa-willful", label: "FLSA back wages if willful", date: addMonths(inc, 36), cite: "FLSA (29 U.S.C. 255, DOL guide)" });
  }
  items.push({ tone: "info", text: "Free help: US Department of Labor 1-866-4-USA-DOL (1-866-487-2365), the Wage and Hour Division or your state labor department.", cite: "DOL" });
  return { country: "US", minimumWage: min, overtimePay, dates, items };
}

// ── France ───────────────────────────────────────────────────────────
export const FR_SMIC = { hourly: 12.31, monthly: 1_867.02 }         ;
export function frLaborExit(x                                                                                                                                                       ) {
  const items          = [];
  const s = service(x.start, x.end);
  const y = s.exactYears;
  const eligible = s.totalMonths >= 8;
  const ind = eligible ? r2(x.monthlyReference * (Math.min(y, 10) / 4 + Math.max(0, y - 10) / 3)) : 0;
  items.push(eligible
    ? { tone: "info", text: `Indemnité légale minimale : ${ind.toLocaleString("fr-FR")} € (1/4 de mois par année jusqu'à 10 ans, 1/3 au-delà, ancienneté ${s.years} ans ${s.months} mois). La convention collective peut prévoir plus.`, cite: "service-public.gouv.fr F987" }
    : { tone: "info", text: "Moins de 8 mois d'ancienneté ininterrompue : pas d'indemnité légale de licenciement.", cite: "service-public.gouv.fr F987" });
  items.push({ tone: "info", text: "La durée du préavis n'est pas calculée ici (non vérifiée) ; voir le contrat, la convention collective ou service-public.gouv.fr.", cite: "—" });
  items.push({ tone: "info", text: `Congés payés : 2,5 jours ouvrables par mois de travail effectif, soit 30 jours par an.`, cite: "service-public.gouv.fr F2258" });
  if (x.hourlyGross != null) items.push(x.hourlyGross < FR_SMIC.hourly ? { tone: "warn", text: `${x.hourlyGross} € brut de l'heure est inférieur au SMIC (12,31 €).`, cite: "service-public.gouv.fr F2300" } : { tone: "good", text: `${x.hourlyGross} € brut de l'heure respecte le SMIC (12,31 €).`, cite: "service-public.gouv.fr F2300" });
  const dates          = [];
  if (x.mode === "rupture" && x.signed) dates.push({ id: "retractation", label: "Rupture conventionnelle : fin du délai de rétractation de 15 jours calendaires", date: addDays(x.signed, 15), cite: "service-public.gouv.fr F19030" });
  const n = x.notified ?? x.end;
  dates.push({ id: "contestation", label: "Contester la rupture du contrat aux prud'hommes : 12 mois à partir de la notification", date: addMonths(n, 12), cite: "service-public.gouv.fr F2360" });
  dates.push({ id: "salaire", label: "Réclamer des salaires : 3 ans", date: addMonths(x.end, 36), cite: "service-public.gouv.fr F2360" });
  items.push({ tone: "info", text: "Les règles de l'ARE (France Travail) après le 1er avril 2025 ne sont pas calculées ici.", cite: "service-public.gouv.fr F14860" });
  return { country: "FR", service: s, indemnite: ind, dates, items };
}

// ── Spain ────────────────────────────────────────────────────────────
export const ES_SMI = { daily: 40.7, monthly: 1_221 }         ;
const ES_PARO                     = [[2160, 720], [1980, 660], [1800, 600], [1620, 540], [1440, 480], [1260, 420], [1080, 360], [900, 300], [720, 240], [540, 180], [360, 120]];
export function esLaborExit(x                                                                                                                                                              ) {
  const items          = [];
  const s = service(x.start, x.end);
  const daily = Math.max(0, x.annualSalary) / 365;
  const [perYear, capMonths] = x.type === "improcedente" ? [33, 24] : [20, 12];
  const pre = x.type === "improcedente" && x.start < "2012-02-12";
  const raw = daily * perYear * s.exactYears;
  const cap = daily * 30 * capMonths;
  const amount = r2(Math.min(raw, cap));
  items.push({ tone: "info", text: `Indemnización ${x.type === "improcedente" ? "por despido improcedente: 33" : "por despido objetivo: 20"} días de salario por año (${s.years} años y ${s.months} meses, prorrateo mensual), máximo ${capMonths} mensualidades: ${amount.toLocaleString("es-ES")} €.`, cite: x.type === "improcedente" ? "ET art. 56.1" : "ET art. 53.1" });
  if (pre) items.push({ tone: "warn", text: "Contrato anterior al 12-02-2012: el tiempo previo se indemniza a 45 días por año (DT 11ª). Ese tramo y su tope transitorio no se calculan aquí.", cite: "ET DT 11ª" });
  if (x.type === "objetivo") items.push({ tone: "info", text: "Despido objetivo: comunicación escrita y preaviso de 15 días, con 6 horas semanales de permiso para buscar empleo.", cite: "ET art. 53.1 y 53.2" });
  items.push({ tone: "info", text: "Vacaciones: mínimo 30 días naturales al año, no sustituibles por dinero.", cite: "ET art. 38.1" });
  if (x.monthlySalary != null) items.push(x.monthlySalary < ES_SMI.monthly ? { tone: "warn", text: `${x.monthlySalary} €/mes es inferior al SMI 2026 (1.221 €/mes).`, cite: "Real Decreto 126/2026" } : { tone: "good", text: `${x.monthlySalary} €/mes alcanza el SMI 2026 (1.221 €/mes).`, cite: "Real Decreto 126/2026" });
  let paro                = null;
  if (x.contributedDays != null) {
    paro = ES_PARO.find(([d]) => x.contributedDays  >= d)?.[1] ?? 0;
    items.push(paro ? { tone: "info", text: `Prestación por desempleo: ${paro} días con ${x.contributedDays} días cotizados en los últimos 6 años.`, cite: "LGSS art. 269.1" } : { tone: "warn", text: "Menos de 360 días cotizados en los últimos 6 años: sin prestación contributiva.", cite: "LGSS art. 269.1" });
  }
  const n = x.notified ?? x.end;
  const dates          = [{ id: "demanda", label: "Demanda por despido: 20 días hábiles desde el día siguiente (caducidad). Antes, conciliación previa obligatoria (SMAC). Aquí solo se excluyen sábados y domingos, no los festivos.", date: addWeekdays(n, 20), cite: "LRJS art. 103.1 y 63" }];
  return { country: "ES", service: s, indemnizacion: amount, paroDays: paro, dates, items };
}

// ── China ────────────────────────────────────────────────────────────
export function cnLaborExit(x                                                                                                                                                  ) {
  const items          = [];
  const s = service(x.start, x.end);
  const capped = x.localAverageMonthly != null && x.monthlyWage > x.localAverageMonthly * 3;
  const base = capped ? x.localAverageMonthly  * 3 : x.monthlyWage;
  let n = s.years + (s.months >= 6 ? 1 : s.months > 0 ? 0.5 : 0);
  if (capped) n = Math.min(12, n);
  const comp = r2(base * n);
  const total = x.unlawful ? comp * 2 : comp;
  items.push({ tone: "info", text: `经济补偿：工作年限${s.years}年${s.months}个月，计${n}个月 × 月工资${Math.round(base).toLocaleString("zh-CN")}元 = ${comp.toLocaleString("zh-CN")}元${capped ? "（月工资高于当地上年职工月平均工资3倍，按3倍计算，年限最多12年）" : ""}。`, cite: "劳动合同法第47条" });
  if (x.unlawful) items.push({ tone: "warn", text: `违法解除或终止劳动合同：按经济补偿标准的二倍支付赔偿金，约${r2(total).toLocaleString("zh-CN")}元。`, cite: "劳动合同法第87条" });
  if (x.noNotice) items.push({ tone: "info", text: `因病、不能胜任或客观情况变化解除且未提前30日书面通知的，应额外支付1个月工资（约${Math.round(x.monthlyWage).toLocaleString("zh-CN")}元）。`, cite: "劳动合同法第40条" });
  if (x.insuredYears != null) {
    const m = x.insuredYears >= 10 ? 24 : x.insuredYears >= 5 ? 18 : x.insuredYears >= 1 ? 12 : 0;
    items.push(m ? { tone: "info", text: `失业保险金最长领取${m}个月（累计缴费${x.insuredYears}年）。金额由省级政府确定。`, cite: "失业保险条例第17条" } : { tone: "warn", text: "累计缴费不满1年，不符合领取失业保险金的期限规定。", cite: "失业保险条例第17条" });
  }
  items.push({ tone: "info", text: "带薪年休假天数、劳动仲裁时效和2026年各地最低工资标准未核实，本工具不计算，请向当地人社部门确认。", cite: "—" });
  return { country: "CN", service: s, months: n, compensation: comp, total: r2(total), dates: []           , items };
}

// ── Taiwan ───────────────────────────────────────────────────────────
export function twLaborExit(x                                                                                                                                                  ) {
  const items          = [];
  const s = service(x.start, x.end);
  const notice = s.totalMonths < 3 ? 0 : s.totalMonths < 12 ? 10 : s.years < 3 ? 20 : 30;
  items.push({ tone: "info", text: `預告期間：${notice}日（未依規定預告者，應給付預告期間工資）。`, cite: "勞動基準法第16條" });
  let pay        ;
  if (x.system === "new") { pay = r2(Math.min(6, s.exactYears * 0.5) * x.averageMonthlyWage); items.push({ tone: "info", text: `資遣費（勞退新制）：每滿1年0.5個月平均工資，未滿1年按比例，最高6個月 = 約${pay.toLocaleString("zh-TW")}元，終止契約後30日內發給。`, cite: "勞工退休金條例第12條" }); }
  else { const m = s.years + (s.months ? s.months / 12 : 0); pay = r2(m * x.averageMonthlyWage); items.push({ tone: "info", text: `資遣費（舊制年資）：每滿1年1個月平均工資，剩餘月數按比例 = 約${pay.toLocaleString("zh-TW")}元。`, cite: "勞動基準法第17條" }); }
  const leave = s.totalMonths < 6 ? 0 : s.totalMonths < 12 ? 3 : s.years < 2 ? 7 : s.years < 3 ? 10 : s.years < 5 ? 14 : s.years < 10 ? 15 : Math.min(30, 15 + (s.years - 9));
  items.push({ tone: "info", text: `特別休假：年資${s.years}年${s.months}個月為${leave}日，未休日數應發給工資。`, cite: "勞動基準法第38條" });
  let unemployment = 0, months = 0;
  if (x.insuredMonthlyWage != null) { months = (x.age ?? 0) >= 45 || x.disabled ? 9 : 6; unemployment = Math.round(x.insuredMonthlyWage * 0.6); items.push({ tone: "info", text: `失業給付：平均月投保薪資60% = 每月約${unemployment.toLocaleString("zh-TW")}元，最長${months}個月。`, cite: "就業保險法第16條" }); }
  items.push({ tone: "info", text: "工資請求權時效依民法第126條為5年。2026年最低工資金額與勞資爭議調解窗口未核實，請洽勞動部或地方勞工局。", cite: "民法第126條、最低工資法" });
  const dates          = [{ id: "severance", label: "資遣費發給期限：終止契約後30日內", date: addDays(x.end, 30), cite: "勞工退休金條例第12條" }, { id: "wage-claim", label: "工資請求權時效（5年）", date: addMonths(x.end, 60), cite: "民法第126條" }];
  return { country: "TW", service: s, noticeDays: notice, severance: pay, specialLeaveDays: leave, unemploymentMonthly: unemployment, unemploymentMonths: months, dates, items };
}
