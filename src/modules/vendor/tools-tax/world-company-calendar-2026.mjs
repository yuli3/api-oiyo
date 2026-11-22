// GENERATED from tools-oiyo src/lib/world-company-calendar-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// Company annual calendar from the financial year end (2026-11-22, world pro-gap #6): JP, UK, US (federal), FR.
// General information only: not tax or company-law advice, no filing. Weekend shifts only; public holidays are not applied.
// Facts: /mnt/project-files/notes/company-calendar-facts-2026-11-22.md (国税庁 法人税・消費税 申告期限, gov.uk annual accounts and Company Tax Returns,
// IRS Form 7004 due date chart PY2026, entreprendre.service-public.gouv.fr, justice.fr dépôt des comptes).
// Not computed because not verified: JP 申告期限延長特例 length, US 1065/1120-S extension, FR liasse fiscale, ES/CN/TW.

export const CALENDAR_AS_OF = "2026-11-22";
                                            
                                                               
                                                                              

const ok = (s         ) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
const parts = (s        ) => s.split("-").map(Number)                            ;
const iso = (y        , m        , d        ) => new Date(Date.UTC(y, m - 1, d)).toISOString().slice(0, 10);
const lastDay = (y        , m        ) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const isMonthEnd = (s        ) => { const [y, m, d] = parts(s); return d === lastDay(y, m); };
/** Same day n months later (clamped); a month-end date stays at month end. */
export const addMonths = (s        , n        ) => {
  const [y, m, d] = parts(s);
  const t = new Date(Date.UTC(y, m - 1 + n, 1));
  const ty = t.getUTCFullYear(), tm = t.getUTCMonth() + 1, ld = lastDay(ty, tm);
  return iso(ty, tm, isMonthEnd(s) ? ld : Math.min(d, ld));
};
export const addDays = (s        , n        ) => { const [y, m, d] = parts(s); return iso(y, m, d + n); };
/** 15th day of the n-th month after the month of `s`. */
const fifteenth = (s        , n        ) => { const [y, m] = parts(s); return iso(y, m + n, 15); };
export const nextWeekday = (s        ) => { let x = s; for (;;) { const w = new Date(Date.parse(x)).getUTCDay(); if (w !== 0 && w !== 6) return x; x = addDays(x, 1); } };
const sort = (d         ) => d.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
const nextAfter = (d         , today         ) => (ok(today) ? d.find((x) => x.date >= today ) ?? null : null);

// ── Japan ────────────────────────────────────────────────────────────
export function jpCompanyCalendar(x                                                                                         ) {
  if (!ok(x.yearEnd)) return { asOf: CALENDAR_AS_OF, dates: []           , next: null, items: [{ tone: "warn"        , text: "事業年度の終了日を入れてください。", cite: "—" }] };
  const fy = x.yearEnd;
  const dates          = [
    { id: "interim", label: "法人税 中間申告・納付（12か月の事業年度として計算）", date: nextWeekday(addMonths(addMonths(fy, -6), 2)), cite: "国税庁 法人税の申告" },
    { id: "corp", label: "法人税 確定申告・納付", date: nextWeekday(addMonths(fy, 2)), cite: "国税庁 法人税の申告（事業年度終了の日の翌日から2か月以内）" },
  ];
  if (x.consumptionTax) dates.push({ id: "ct", label: x.extensionFiled ? "消費税 確定申告（延長届出あり・1か月延長）" : "消費税 確定申告・納付", date: nextWeekday(addMonths(fy, x.extensionFiled ? 3 : 2)), cite: "タックスアンサー No.6610" });
  sort(dates);
  const items          = [
    { tone: "info", text: "期限が土日に当たるときは翌月曜日にしています。祝日・年末年始は反映していないので、当日の暦で確認してください。", cite: "国税庁" },
    { tone: "info", text: "中間申告は、前期の税額から計算した予定申告額が10万円以下なら不要です。", cite: "国税庁 あらまし2026" },
    { tone: "warn", text: "法人税の申告期限延長の特例（定款の定め等）は事業年度終了の日までに申請が必要で、延長期間分は利子税がかかります。延長される月数はここでは計算していません。", cite: "法人税法75条の2" },
  ];
  if (x.extensionFiled && !x.consumptionTax) items.push({ tone: "info", text: "消費税の1か月延長には、法人税の延長特例に加えて消費税申告期限延長届出書が必要です。", cite: "タックスアンサー No.6610" });
  return { asOf: CALENDAR_AS_OF, dates, next: nextAfter(dates, x.today), items };
}

// ── UK ──────────────────────────────────────────────────────────────
export const UK_CH_PENALTIES                     = [["up to 1 month", 150], ["1 to 3 months", 375], ["3 to 6 months", 750], ["more than 6 months", 1_500]];
export function ukCompanyCalendar(x                                                                                     ) {
  if (!ok(x.yearEnd)) return { asOf: CALENDAR_AS_OF, dates: []           , next: null, items: [{ tone: "warn"        , text: "Enter the financial year end.", cite: "—" }] };
  const fy = x.yearEnd;
  const accounts = x.firstAccounts && ok(x.incorporated) ? addMonths(x.incorporated , 21) : addMonths(fy, 9);
  const dates          = [
    { id: "accounts", label: x.firstAccounts && ok(x.incorporated) ? "First accounts to Companies House (21 months after registration)" : "Annual accounts to Companies House (9 months after year end)", date: accounts, cite: "gov.uk annual accounts deadlines" },
    { id: "ctpay", label: "Corporation Tax payment (9 months and 1 day)", date: addDays(addMonths(fy, 9), 1), cite: "gov.uk Company Tax Returns" },
    { id: "ct600", label: "Company Tax Return CT600 (12 months)", date: addMonths(fy, 12), cite: "gov.uk Company Tax Returns" },
  ];
  sort(dates);
  const items          = [
    { tone: "info", text: "Assumes the accounting period for Corporation Tax is the same 12 months as the financial year, which is the usual case.", cite: "gov.uk" },
    { tone: "warn", text: "Late accounts (private company): £150 up to 1 month, £375 up to 3 months, £750 up to 6 months, £1,500 after; doubled if late two years running. Late CT600: £200, another £200 at 3 months, then 10% of unpaid tax at 6 and 12 months.", cite: "gov.uk penalties for late filing" },
  ];
  if (x.firstAccounts && !ok(x.incorporated)) items.push({ tone: "warn", text: "For first accounts, enter the date the company was registered: the deadline is 21 months after it.", cite: "gov.uk" });
  return { asOf: CALENDAR_AS_OF, dates, next: nextAfter(dates, x.today), items };
}

// ── US federal ──────────────────────────────────────────────────────
                                                         
export function usCompanyCalendar(x                                                       ) {
  if (!ok(x.yearEnd)) return { asOf: CALENDAR_AS_OF, dates: []           , next: null, items: [{ tone: "warn"        , text: "Enter the tax year end.", cite: "—" }] };
  const fy = x.yearEnd;
  const june = parts(fy)[1] === 6;
  const dates          = [];
  if (x.entity === "ccorp") {
    const due = fifteenth(fy, june ? 3 : 4);
    dates.push({ id: "1120", label: `Form 1120 (${june ? "June year end: 15th day of the 3rd month" : "15th day of the 4th month"})`, date: nextWeekday(due), cite: "IRS Form 7004 due date chart PY2026" });
    dates.push({ id: "ext", label: `Extended Form 1120 with Form 7004 (${june ? 7 : 6} months)`, date: nextWeekday(addMonths(due, june ? 7 : 6)), cite: "IRS Form 7004 due date chart PY2026" });
  } else {
    dates.push({ id: x.entity === "scorp" ? "1120s" : "1065", label: `${x.entity === "scorp" ? "Form 1120-S" : "Form 1065"} (15th day of the 3rd month)`, date: nextWeekday(fifteenth(fy, 3)), cite: "IRS Form 7004 due date chart PY2026" });
  }
  const items          = [
    { tone: "info", text: "A due date on a weekend moves to Monday here. Federal holidays are not applied.", cite: "IRS" },
    { tone: "warn", text: x.entity === "ccorp" ? "An extension gives more time to file, not to pay. State returns and estimated tax payments are not included." : "The extension length for Forms 1065 and 1120-S is not computed here. State returns are not included.", cite: "IRS" },
  ];
  return { asOf: CALENDAR_AS_OF, dates, next: nextAfter(dates, x.today), items };
}

// ── France ──────────────────────────────────────────────────────────
export function frCompanyCalendar(x                                                                            ) {
  if (!ok(x.yearEnd)) return { asOf: CALENDAR_AS_OF, dates: []           , next: null, items: [{ tone: "warn"        , text: "Indiquez la date de clôture de l'exercice.", cite: "—" }] };
  const approval = addMonths(x.yearEnd, 6);
  const base = ok(x.approvedOn) ? x.approvedOn  : approval;
  const dates          = [
    { id: "ag", label: "Approbation des comptes par l'assemblée (6 mois après la clôture)", date: approval, cite: "entreprendre.service-public.gouv.fr" },
    { id: "greffe", label: `Dépôt des comptes au greffe (${x.online ? "2 mois" : "1 mois"} après l'approbation${ok(x.approvedOn) ? "" : " au plus tard"})`, date: addMonths(base, x.online ? 2 : 1), cite: "justice.fr — dépôt des comptes annuels" },
  ];
  const items          = [
    { tone: "info", text: "Le délai de 6 mois est le plus pratiqué ; les associés peuvent en fixer un autre.", cite: "justice.fr" },
    { tone: "warn", text: "Défaut de dépôt : amende de 1 500 € (3 000 € en récidive) et injonction sous astreinte. La date de la liasse fiscale n'est pas calculée ici.", cite: "justice.fr" },
  ];
  return { asOf: CALENDAR_AS_OF, dates, next: nextAfter(dates, x.today), items };
}

export const CALENDAR_HELP = { jp: "所轄の税務署", uk: "Companies House and HMRC Corporation Tax helplines", us: "IRS", fr: "greffe du tribunal de commerce, guichet unique INPI" }         ;
