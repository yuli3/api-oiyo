// GENERATED from tools-oiyo src/lib/country-pension-4.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// Country pension accounts batch 4 (2026-11-02, CHOSEUN "진행"): each country's own scheme, not a Korean translation.
//
// US 401(k) / IRA, tax year 2026 — IRS Notice 2025-67 (posted 2025-12): elective deferral $24,500, catch-up 50+ $8,000,
//   ages 60–63 $11,250 instead of $8,000 (SECURE 2.0), IRA $7,500, IRA catch-up 50+ $1,100. Roth IRA phase-out:
//   single/HoH $153,000–$168,000, MFJ $242,000–$252,000. Traditional IRA deduction phase-out when covered by a workplace
//   plan: single $81,000–$91,000, MFJ $129,000–$149,000. Cross-checked: thecollegeinvestor.com, planadviser.com.
//   The page asks for the marginal federal rate now and in retirement instead of re-deriving brackets; state tax is left out.
//
// UK personal pension tax relief, 2026/27 (England, Wales, Northern Ireland; Scotland has its own bands) — gov.uk
//   "Pension schemes rates": annual allowance £60,000, money purchase annual allowance £10,000, taper from adjusted
//   income £260,000 down to £10,000. Relief at source: the provider claims 20% basic rate, so £80 paid becomes £100.
//   Higher and additional rate taxpayers claim the rest through Self Assessment, which extends the basic and higher
//   rate bands by the gross contribution. Bands frozen: personal allowance £12,570 (tapered £1 per £2 above £100,000
//   adjusted net income), basic rate band £37,700, additional rate from £125,140. Without earnings, relief is limited to
//   £3,600 gross a year.

export const COUNTRY_PENSION_4_AS_OF = "2026-11-02";

/* ---------- US ---------- */

export const US_2026 = {
  deferral: 24_500,
  catchUp50: 8_000,
  catchUp60to63: 11_250,
  ira: 7_500,
  iraCatchUp50: 1_100,
  rothPhaseOut: { single: [153_000, 168_000], joint: [242_000, 252_000] },
  tradIraDeductionPhaseOut: { single: [81_000, 91_000], joint: [129_000, 149_000] },
}         ;

                                          

export function us401kLimit(age        ) {
  if (!Number.isFinite(age) || age < 0) throw new RangeError("age");
  const catchUp = age >= 60 && age <= 63 ? US_2026.catchUp60to63 : age >= 50 ? US_2026.catchUp50 : 0;
  return { base: US_2026.deferral, catchUp, total: US_2026.deferral + catchUp };
}

export function usIraLimit(age        ) {
  if (!Number.isFinite(age) || age < 0) throw new RangeError("age");
  const catchUp = age >= 50 ? US_2026.iraCatchUp50 : 0;
  return { base: US_2026.ira, catchUp, total: US_2026.ira + catchUp };
}

/** Share (0–1) of the full Roth IRA contribution allowed at this MAGI, before the IRS $10 rounding. */
export function rothAllowedShare(magi        , filing          ) {
  if (!Number.isFinite(magi) || magi < 0) throw new RangeError("magi");
  const [lo, hi] = US_2026.rothPhaseOut[filing];
  if (magi <= lo) return 1;
  if (magi >= hi) return 0;
  return (hi - magi) / (hi - lo);
}

/** IRS rounds a reduced Roth limit up to the next $10 and allows at least $200 if not zero. */
export function rothIraLimit(age        , magi        , filing          ) {
  const full = usIraLimit(age).total;
  const share = rothAllowedShare(magi, filing);
  if (share === 1) return full;
  if (share === 0) return 0;
  return Math.max(200, Math.ceil((full * share) / 10) * 10);
}

                                  
                                                             
                       
                
                                 
                 
                                              
                  
                                              
                    
 

/**
 * Same pre-tax budget in both: traditional puts `contribution` in and pays tax on withdrawal; Roth pays tax now, so
 * only contribution × (1 − rateNow) goes in and comes out tax-free. The winner is whichever rate is lower.
 */
export function tradVsRoth(i                 ) {
  for (const [k, v] of Object.entries(i)) if (!Number.isFinite(v) || v < 0) throw new RangeError(k);
  const g = i.growth;
  const fv = (annual        ) => (g === 0 ? annual * i.years : annual * ((Math.pow(1 + g, i.years) - 1) / g) * (1 + g));
  const tradGross = fv(i.contribution);
  const traditional = tradGross * (1 - i.rateLater);
  const roth = fv(i.contribution * (1 - i.rateNow));
  return {
    tradGross: Math.round(tradGross),
    traditional: Math.round(traditional),
    roth: Math.round(roth),
    taxSavedNow: Math.round(i.contribution * i.rateNow),
    better: Math.abs(traditional - roth) < 1 ? ("same"         ) : traditional > roth ? ("traditional"         ) : ("roth"         ),
  };
}

/* ---------- UK ---------- */

export const UK_2026_27 = {
  personalAllowance: 12_570,
  taperStart: 100_000,
  basicBand: 37_700,
  additionalFrom: 125_140,
  basic: 0.2,
  higher: 0.4,
  additional: 0.45,
  annualAllowance: 60_000,
  mpaa: 10_000,
  noEarningsCap: 3_600,
}         ;

/** Income tax on non-savings income (rUK bands), with the basic and higher bands extended by `extension`. */
export function ukIncomeTax(income        , extension = 0) {
  if (!Number.isFinite(income) || income < 0) throw new RangeError("income");
  const u = UK_2026_27;
  const adjustedNet = Math.max(0, income - extension);
  const pa = Math.max(0, u.personalAllowance - Math.max(0, adjustedNet - u.taperStart) / 2);
  const taxable = Math.max(0, income - pa);
  const basicTop = u.basicBand + extension;
  // Higher rate limit £125,140 of taxable income, extended by the gross contribution like the basic band.
  const additionalTop = Math.max(basicTop, u.additionalFrom + extension);
  const basicPart = Math.min(taxable, basicTop);
  const higherPart = Math.max(0, Math.min(taxable, additionalTop) - basicTop);
  const additionalPart = Math.max(0, taxable - additionalTop);
  return basicPart * u.basic + higherPart * u.higher + additionalPart * u.additional;
}

                                
                                                                   
                   
                                                                          
                          
 

export function ukPensionRelief(i               ) {
  if (!Number.isFinite(i.earnings) || i.earnings < 0) throw new RangeError("earnings");
  if (!Number.isFinite(i.netContribution) || i.netContribution < 0) throw new RangeError("netContribution");
  const u = UK_2026_27;
  const gross = i.netContribution / (1 - u.basic);
  const relievable = Math.min(gross, Math.max(i.earnings, u.noEarningsCap));
  const basicRelief = relievable * u.basic;
  const extra = Math.max(0, ukIncomeTax(i.earnings) - ukIncomeTax(i.earnings, relievable));
  const round2 = (n        ) => Math.round(n * 100) / 100;
  return {
    gross: round2(gross),
    relievable: round2(relievable),
    overRelief: round2(Math.max(0, gross - relievable)),
    basicRelief: round2(basicRelief),
    selfAssessmentRelief: round2(extra),
    totalRelief: round2(basicRelief + extra),
    /** what the pot gained per £1 you actually gave up */
    effectiveCost: round2(i.netContribution - extra),
    overAnnualAllowance: gross > u.annualAllowance,
  };
}
