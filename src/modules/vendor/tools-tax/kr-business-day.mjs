// GENERATED from tools-oiyo src/lib/kr-business-day.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// Korean tax deadlines move to the next day when they fall on a Saturday, Sunday, public holiday,
// substitute holiday or Labor Day (국세기본법 제5조①, 지방세기본법 제24조). Holidays below follow
// 관공서의 공휴일에 관한 규정 and 공휴일에 관한 법률, checked 2026-10-19:
// - 제헌절 (7/17) is a public holiday again from 2026.
// - 2026-06-03 is the local election day.
// - 설·추석 get a substitute only when they overlap a Sunday or another holiday (not Saturday), so
//   2026 추석 (9/24–26, Thu–Sat) has none. 현충일 never gets one.
// - 2027-05-03 (a possible Labor Day substitute) is left out: sources disagree, and no deadline
//   falls between 5/1 and 5/3.
// Add the next year here each autumn once the government publishes it.

export const KR_HOLIDAYS                           = {
  2026: [
    "01-01", "02-16", "02-17", "02-18", "03-01", "03-02", "05-01", "05-05", "05-24", "05-25",
    "06-03", "06-06", "07-17", "08-15", "08-17", "09-24", "09-25", "09-26", "10-03", "10-05",
    "10-09", "12-25",
  ],
  2027: [
    "01-01", "02-06", "02-07", "02-08", "02-09", "03-01", "05-01", "05-05", "05-13", "06-06",
    "07-17", "07-19", "08-15", "08-16", "09-14", "09-15", "09-16", "10-03", "10-04", "10-09",
    "10-11", "12-25", "12-27",
  ],
};

const pad = (n        ) => String(n).padStart(2, "0");

/** Whether the holiday list covers this year; outside it only weekends are known. */
export function holidaysKnown(year        )          {
  return year in KR_HOLIDAYS;
}

export function isKrNonBusinessDay(d      )          {
  const day = d.getDay();
  if (day === 0 || day === 6) return true;
  const list = KR_HOLIDAYS[d.getFullYear()];
  return !!list && list.includes(`${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
}

/** The statutory deadline itself if it is a business day, otherwise the next business day. */
export function krTaxDeadline(d      )       {
  const out = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  while (isKrNonBusinessDay(out)) out.setDate(out.getDate() + 1);
  return out;
}
