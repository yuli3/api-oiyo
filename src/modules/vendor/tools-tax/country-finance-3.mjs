// GENERATED from tools-oiyo src/lib/country-finance-3.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 2026-11-02: country finance tools batch 3 (UK Lifetime ISA, China 个人养老金, Hong Kong MPF TVC,
// Singapore CPF housing refund). Each constant is copied from the official page cited next to it;
// the pages show the same sources to the reader.
export const COUNTRY_FINANCE_3_VERIFIED_ON = '2026-11-02';

const num = (text        )                => {
  const value = text.trim().replace(/,/g, '');
  if (!/^\d+(?:\.\d+)?$/.test(value)) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

// ---------- UK Lifetime ISA (gov.uk/lifetime-isa) ----------
export const LISA = {
  yearlyLimit: 4000, bonusRate: 0.25, bonusMax: 1000, openBefore: 40, payUntil: 50, minAge: 18,
  chargeOther: 0.25, // unauthorised withdrawals
  chargeOverCap: 0.2, // first home above the cap, from 29 October 2026 (gov.uk policy paper)
  priceCap: 450000,
}         ;

/** What a withdrawal charge leaves of a withdrawal, and of the saver's own money in it. */
export function lisaWithdrawal(amount        , charge        ) {
  const net = amount * (1 - charge);
  const ownMoney = amount / (1 + LISA.bonusRate); // contributions inside a withdrawal made of paid-in money + bonus
  return { charge: amount * charge, net, ownMoney, vsOwn: net - ownMoney };
}

export function lisaPlan(age        , balance        , yearly        , growth        , targetAge        ) {
  const a = num(age), b = num(balance), y = num(yearly), g = num(growth), t = num(targetAge);
  if (a === null || b === null || y === null || g === null || t === null) return null;
  if (!Number.isInteger(a) || !Number.isInteger(t) || a < LISA.minAge || a >= 60 || t <= a || t > 60 || g > 20) return null;
  if (y > LISA.yearlyLimit) return { error: 'limit'          };
  if (b === 0 && a >= LISA.openBefore) return { error: 'age'          };
  let value = b, paid = 0, bonus = 0;
  const rows                                                                = [];
  for (let year = a; year < t; year++) {
    const pay = year < LISA.payUntil ? y : 0;
    const add = Math.min(pay * LISA.bonusRate, LISA.bonusMax);
    value = (value + pay + add) * (1 + g / 100);
    paid += pay; bonus += add;
    rows.push({ age: year + 1, paid: pay, bonus: add, value });
  }
  return { error: null, rows, paid, bonus, value, other: lisaWithdrawal(value, LISA.chargeOther), overCap: lisaWithdrawal(value, LISA.chargeOverCap) };
}

// ---------- China 个人养老金 (财政部 税务总局公告2024年第21号; 个人所得税税率表 综合所得适用) ----------
export const CN_PENSION = { yearlyDeduction: 12000, withdrawalRate: 0.03 }         ;
export const CN_BANDS                             = [ // [upper bound, rate, quick deduction]
  [36000, 0.03, 0], [144000, 0.1, 2520], [300000, 0.2, 16920], [420000, 0.25, 31920],
  [660000, 0.3, 52920], [960000, 0.35, 85920], [Infinity, 0.45, 181920],
];
export function cnTax(taxable        )         {
  if (taxable <= 0) return 0;
  const [, rate, quick] = CN_BANDS.find(([upper]) => taxable <= upper) ;
  return taxable * rate - quick;
}
export function cnPension(taxable        , contribution        ) {
  const x = num(taxable), c = num(contribution);
  if (x === null || c === null || x > 100_000_000) return null;
  if (c > CN_PENSION.yearlyDeduction) return { error: 'limit'          };
  const before = cnTax(x), after = cnTax(Math.max(0, x - c));
  const saving = before - after, withdrawalTax = c * CN_PENSION.withdrawalRate;
  const rate = x <= 0 ? 0 : CN_BANDS.find(([upper]) => x <= upper) [1];
  return { error: null, before, after, saving, withdrawalTax, net: saving - withdrawalTax, rate };
}

// ---------- Hong Kong TVC (mpfa.org.hk; IRD pam61e and 2026-27 Budget) ----------
export const HK_TVC_MAX = 60000; // aggregate with QDAP premiums
export const HK_YEARS = {
  '2025/26': { basic: 132000, married: 264000 },
  '2026/27': { basic: 145000, married: 290000 },
}         ;
                                           
export function hkProgressive(chargeable        )         {
  let rest = Math.max(0, chargeable), tax = 0;
  for (const rate of [0.02, 0.06, 0.1, 0.14]) { const part = Math.min(rest, 50000); tax += part * rate; rest -= part; }
  return tax + rest * 0.17;
}
export function hkStandard(net        )         {
  const n = Math.max(0, net);
  return Math.min(n, 5_000_000) * 0.15 + Math.max(0, n - 5_000_000) * 0.16;
}
export function hkSalariesTax(net        , allowances        ) {
  const progressive = hkProgressive(net - allowances), standard = hkStandard(net);
  return { tax: Math.min(progressive, standard), standardApplies: standard < progressive };
}
export function hkTvc(netIncome        , allowances        , tvc        ) {
  const n = num(netIncome), a = num(allowances), v = num(tvc);
  if (n === null || a === null || v === null || n > 1_000_000_000) return null;
  const used = Math.min(v, HK_TVC_MAX, n);
  const before = hkSalariesTax(n, a), after = hkSalariesTax(n - used, a);
  return { used, capped: v > HK_TVC_MAX, before, after, saving: before.tax - after.tax };
}

// ---------- Singapore CPF housing refund (cpf.gov.sg) ----------
export const CPF_OA_RATE = 2.5; // OA rate floor shown on CPF interest-rate table
/** Principal used plus accrued interest: computed monthly, compounded annually (CPF FAQ). */
export function cpfRefund(upfront        , monthly        , months        , rate        , price        , loan        ) {
  const u = num(upfront), m = num(monthly), n = num(months), r = num(rate);
  const p = price.trim() === '' ? null : num(price), l = loan.trim() === '' ? 0 : num(loan);
  if (u === null || m === null || n === null || r === null || l === null || (price.trim() !== '' && p === null)) return null;
  if (!Number.isInteger(n) || n < 1 || n > 600 || r > 10) return null;
  let principal = 0, credited = 0, pending = 0;
  for (let k = 0; k < n; k++) {
    principal += k === 0 ? u + m : m;
    pending += (principal + credited) * r / 100 / 12;
    if ((k + 1) % 12 === 0) { credited += pending; pending = 0; }
  }
  const interest = credited + pending, total = principal + interest;
  const proceeds = p === null ? null : Math.max(0, p - l);
  return { principal, interest, total, proceeds, refund: proceeds === null ? total : Math.min(total, proceeds) };
}
