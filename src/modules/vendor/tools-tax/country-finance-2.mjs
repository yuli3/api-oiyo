// GENERATED from tools-oiyo src/lib/country-finance-2.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 2026-11-02: country finance tools batch 2 (US Social Security claiming age, US PMI removal,
// UK student loan Plan 2/5, Japan 新NISA limits). Every constant below is copied from the
// official page cited next to it; the pages show the same sources to the reader.
export const COUNTRY_FINANCE_2_VERIFIED_ON = '2026-11-02';

const num = (text        )                => {
  const value = text.trim().replace(/,/g, '');
  if (!/^\d+(?:\.\d+)?$/.test(value)) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};
export const parseAmount = num;

// ---------- US Social Security (ssa.gov/benefits/retirement/planner/agereduction.html,
// ssa.gov/oact/quickcalc/early_late.html) ----------
/** Full retirement age in months. People born on January 1 use the previous year. */
export function fullRetirementAgeMonths(birthDate        )                {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return null;
  const d = new Date(`${birthDate}T00:00:00Z`);
  if (!Number.isFinite(d.valueOf()) || d.toISOString().slice(0, 10) !== birthDate) return null;
  let year = d.getUTCFullYear();
  if (d.getUTCMonth() === 0 && d.getUTCDate() === 1) year -= 1;
  if (year < 1943) return null;
  if (year <= 1954) return 66 * 12;
  if (year >= 1960) return 67 * 12;
  return 66 * 12 + (year - 1954) * 2;
}

/** Benefit as a share of the full-retirement-age amount (PIA) when claiming at `claimMonths` of age. */
export function claimingFactor(claimMonths        , fraMonths        )         {
  if (claimMonths < 62 * 12) return NaN;
  const age = Math.min(claimMonths, 70 * 12); // no delayed credit after 70
  if (age <= fraMonths) {
    const early = fraMonths - age;
    return 1 - (Math.min(early, 36) * 5 / 9 + Math.max(early - 36, 0) * 5 / 12) / 100;
  }
  return 1 + (age - fraMonths) * (2 / 3) / 100; // 8% a year for people born 1943 or later
}

export function socialSecurityTable(birthDate        , pia        , lifeAge        ) {
  const fra = fullRetirementAgeMonths(birthDate), piaValue = num(pia), life = num(lifeAge);
  if (fra === null || piaValue === null || piaValue <= 0 || life === null || life < 62 || life > 110) return null;
  const ages = Array.from(new Set([62, 63, 64, 65, 66, 67, 68, 69, 70].map(a => a * 12).concat(fra))).sort((a, b) => a - b);
  const rows = ages.map(months => {
    const factor = claimingFactor(months, fra);
    const monthly = Math.floor(piaValue * factor); // SSA pays whole dollars (rounded down)
    const paidMonths = Math.max(0, Math.round(life * 12) - months);
    return { months, factor, monthly, lifetime: monthly * paidMonths };
  });
  const best = rows.reduce((a, b) => (b.lifetime > a.lifetime ? b : a));
  return { fra, rows, best };
}

/** Age (in months) from which claiming at `late` has paid more in total than claiming at `early`. */
export function breakEvenMonths(early                                     , late                                     )                {
  if (late.monthly <= early.monthly) return null;
  // early*(t-e) = late*(t-l) -> t = (late*l - early*e)/(late-early)
  return Math.ceil((late.monthly * late.months - early.monthly * early.months) / (late.monthly - early.monthly));
}

// ---------- US PMI (Homeowners Protection Act, 12 U.S.C. 4902; consumerfinance.gov) ----------
export function monthlyPayment(principal        , annualRate        , months        )         {
  const r = annualRate / 100 / 12;
  return r === 0 ? principal / months : principal * r / (1 - Math.pow(1 + r, -months));
}

export function pmiDates(value        , loan        , rate        , years        , extra        ) {
  const v = num(value), l = num(loan), r = num(rate), y = num(years), x = extra.trim() === '' ? 0 : num(extra);
  if (v === null || l === null || r === null || y === null || x === null || v <= 0 || l <= 0 || r > 30 || !Number.isInteger(y) || y < 1 || y > 40) return null;
  const n = y * 12, pay = monthlyPayment(l, r, n), rate1 = r / 100 / 12;
  const find = (limit        , extraPay        )                => {
    if (l <= limit) return 0;
    let balance = l;
    for (let m = 1; m <= n; m++) {
      balance = balance * (1 + rate1) - pay - extraPay;
      if (balance <= limit + 1e-9) return m;
    }
    return null;
  };
  return {
    startLtv: l / v * 100,
    payment: pay,
    request80: find(v * 0.8, 0),
    auto78: find(v * 0.78, 0),
    midpoint: n / 2,
    request80WithExtra: x > 0 ? find(v * 0.8, x) : null,
    extra: x,
  };
}

/** Month offset -> 'YYYY-MM' counted from the first payment month. Offset 1 is the first payment. */
export function addMonths(first        , offset        )                {
  if (!/^\d{4}-\d{2}$/.test(first)) return null;
  const [y, m] = first.split('-').map(Number);
  if (m < 1 || m > 12) return null;
  const d = new Date(Date.UTC(y, m - 1 + offset - 1, 1));
  return d.toISOString().slice(0, 7);
}

// ---------- UK student loan Plan 2 / Plan 5 (gov.uk/repaying-your-student-loan) ----------
export const UK_PLANS = {
  plan2: { threshold: 29385, writeOffYears: 30, lower: 29385, upper: 52885 },
  plan5: { threshold: 25000, writeOffYears: 40 },
}         ;
export const UK_RATE_BASE = 4.1; // gov.uk interest rate shown for incomes at or below the lower amount, and for Plan 5
export const UK_RATE_CAP = 6; // gov.uk: capped at 6%
export const UK_REPAY_SHARE = 0.09;

export function ukPlan2Rate(income        , base = UK_RATE_BASE)         {
  const { lower, upper } = UK_PLANS.plan2;
  const share = Math.min(1, Math.max(0, (income - lower) / (upper - lower)));
  return Math.min(UK_RATE_CAP, base + share * 3);
}

export function ukStudentLoan(plan                   , balance        , salary        , growth        , base        , thresholdGrowth        ) {
  const b = num(balance), s = num(salary), g = num(growth), rb = num(base), tg = num(thresholdGrowth);
  if (b === null || s === null || g === null || rb === null || tg === null || b <= 0 || g > 20 || rb > 20 || tg > 20) return null;
  const cfg = UK_PLANS[plan];
  let debt = b, income = s, threshold         = cfg.threshold, paid = 0;
  const rows                                                                                    = [];
  for (let year = 1; year <= cfg.writeOffYears; year++) {
    const rate = plan === 'plan2' ? ukPlan2Rate(income * (cfg.threshold / threshold), rb) : Math.min(UK_RATE_CAP, rb);
    debt *= 1 + rate / 100;
    const repay = Math.min(debt, Math.max(0, income - threshold) * UK_REPAY_SHARE);
    debt -= repay; paid += repay;
    rows.push({ year, income, rate, repaid: repay, balance: debt });
    if (debt <= 0.005) return { rows, paid, clearedYear: year, writtenOff: 0, writeOffYears: cfg.writeOffYears };
    income *= 1 + g / 100; threshold *= 1 + tg / 100;
  }
  return { rows, paid, clearedYear: null, writtenOff: debt, writeOffYears: cfg.writeOffYears };
}

// ---------- Japan 新NISA (金融庁 fsa.go.jp/policy/nisa2) ----------
export const NISA = { tsumitateYear: 1_200_000, growthYear: 2_400_000, lifetime: 18_000_000, growthLifetime: 12_000_000 }         ;

export function nisaPlan(used        , usedGrowth        , monthly        , growthYear        , startYear        ) {
  const u = num(used), ug = num(usedGrowth), m = num(monthly), gy = num(growthYear), y0 = num(startYear);
  if (u === null || ug === null || m === null || gy === null || y0 === null || !Number.isInteger(y0) || y0 < 2024 || y0 > 2100) return null;
  if (ug > u || u > NISA.lifetime || ug > NISA.growthLifetime) return null;
  const errors           = [];
  if (m * 12 > NISA.tsumitateYear) errors.push('tsumitate');
  if (gy > NISA.growthYear) errors.push('growth');
  if (errors.length) return { errors, rows: [], fullYear: null };
  if (m === 0 && gy === 0) return { errors, rows: [], fullYear: null };
  let total = u, growth = ug;
  const rows                                                                       = [];
  for (let year = y0; year < y0 + 60 && total < NISA.lifetime; year++) {
    const room = NISA.lifetime - total;
    const g = Math.min(gy, NISA.growthLifetime - growth, room);
    const t = Math.min(m * 12, room - g);
    if (t + g === 0) break;
    total += t + g; growth += g;
    rows.push({ year, tsumitate: t, growth: g, total });
  }
  return { errors, rows, fullYear: total >= NISA.lifetime ? rows[rows.length - 1].year : null };
}
