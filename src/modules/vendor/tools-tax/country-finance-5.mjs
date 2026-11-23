// GENERATED from tools-oiyo src/lib/country-finance-5.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// Country finance tools batch 4 (2026-11-03, CHOSEUN "나라별 금융도구 4차 진행"). Each country's own rule, not a translation.
//
// Canada mortgage stress test — OSFI Guideline B-20 minimum qualifying rate: the greater of 5.25% or the contract
//   rate + 2%. CMHC debt service limits: GDS 39%, TDS 44% (insured mortgages; most lenders use the same for uninsured).
//   GDS = (principal + interest + property tax + heating + 50% of condo fees) / gross monthly income; TDS adds other debt.
//   Canadian fixed-rate mortgages compound semi-annually (Interest Act s.6), so the monthly rate is (1 + r/2)^(1/6) − 1.
//
// Mexico CAT (Costo Anual Total) — Banxico: the annual rate i that equates the net amount received with the present
//   value of all payments the borrower makes, Σ A_j / (1 + i)^(t_j) with t_j in years. Banxico's CAT is quoted without
//   IVA, for information only. The page uses a fixed-rate monthly amortizing loan plus a fixed monthly insurance/fee
//   and an opening commission deducted at disbursement.
//
// China 公积金 + 商业贷款 组合贷 — two independent loans with the same term; 等额本息 (annuity) or 等额本金 (equal
//   principal). Rates are user inputs: defaults are the PBoC 2025-05 values (公积金 5年以上首套 2.6%, 5年期LPR 3.5%)
//   shown as examples only, because LPR and lender spreads change.
//
// Japan 住宅ローン控除 (住宅借入金等特別控除, 入居 令和4年以降) — 国税庁 No.1211-1: 年末残高 × 0.7%, capped by the
//   借入限度額 for the house type and move-in year (user picks it from the NTA table), 13 years (some new "その他の住宅"
//   10 years), 100円未満切捨て. Credit is taken from 所得税 first; the rest from 住民税 up to min(課税総所得金額等×5%,
//   97,500円) — the page asks for that cap directly.

export const COUNTRY_FINANCE_5_AS_OF = "2026-11-03";

const finite = (n        , name        , min = 0, max = Number.MAX_SAFE_INTEGER) => {
  if (!Number.isFinite(n) || n < min || n > max) throw new RangeError(name);
  return n;
};

/** Standard annuity payment for principal at periodic rate j over n periods. */
export function annuity(principal        , j        , n        ) {
  if (n <= 0) return 0;
  if (j === 0) return principal / n;
  return (principal * j) / (1 - Math.pow(1 + j, -n));
}

/** Present value of a level payment at periodic rate j over n periods. */
export function presentValue(payment        , j        , n        ) {
  if (j === 0) return payment * n;
  return (payment * (1 - Math.pow(1 + j, -n))) / j;
}

/* ---------- Canada ---------- */

export const CA_B20 = { floorRate: 5.25, buffer: 2, gds: 0.39, tds: 0.44 }         ;

export function caQualifyingRate(contractRatePct        ) {
  finite(contractRatePct, "rate", 0, 30);
  return Math.max(CA_B20.floorRate, contractRatePct + CA_B20.buffer);
}

/** Monthly rate for a Canadian fixed mortgage with semi-annual compounding. */
export function caMonthlyRate(annualPct        ) {
  return Math.pow(1 + annualPct / 100 / 2, 1 / 6) - 1;
}

export function caStressTest(input   
                            
                          
                            
                             
                         
                           
                           
 ) {
  const income = finite(input.grossAnnualIncome, "income", 0, 100_000_000);
  const years = finite(input.amortizationYears, "years", 1, 40);
  const tax = finite(input.propertyTaxMonthly, "tax", 0, 1_000_000);
  const heat = finite(input.heatingMonthly, "heat", 0, 1_000_000);
  const condo = finite(input.condoFeesMonthly, "condo", 0, 1_000_000);
  const debt = finite(input.otherDebtMonthly, "debt", 0, 10_000_000);
  const qualifyingRate = caQualifyingRate(input.contractRatePct);
  const monthlyIncome = income / 12;
  const housing = tax + heat + condo * 0.5;
  const gdsRoom = CA_B20.gds * monthlyIncome - housing;
  const tdsRoom = CA_B20.tds * monthlyIncome - housing - debt;
  const maxPayment = Math.max(0, Math.min(gdsRoom, tdsRoom));
  const n = Math.round(years * 12);
  const maxMortgage = presentValue(maxPayment, caMonthlyRate(qualifyingRate), n);
  const actualPayment = annuity(maxMortgage, caMonthlyRate(input.contractRatePct), n);
  return {
    qualifyingRate,
    maxPayment,
    maxMortgage,
    actualPayment,
    bindingRatio: gdsRoom <= tdsRoom ? ("GDS"         ) : ("TDS"         ),
  };
}

/* ---------- Mexico ---------- */

export function mxCat(input   
                 
                        
                 
                               
                     
 ) {
  const amount = finite(input.amount, "amount", 1, 1_000_000_000);
  const months = Math.round(finite(input.months, "months", 1, 480));
  const rate = finite(input.annualRatePct, "rate", 0, 300) / 100 / 12;
  const commission = (finite(input.openingCommissionPct, "commission", 0, 50) / 100) * amount;
  const fee = finite(input.monthlyFee, "fee", 0, 10_000_000);
  const payment = annuity(amount, rate, months);
  const netReceived = amount - commission;
  const pv = (i        ) => {
    let s = 0;
    for (let j = 1; j <= months; j++) s += (payment + fee) / Math.pow(1 + i, j / 12);
    return s;
  };
  // pv decreases as i grows; bisection on [0, 100] (0%–10,000% a year).
  let lo = 0;
  let hi = 100;
  if (pv(lo) <= netReceived) return { payment, totalPaid: (payment + fee) * months, netReceived, catPct: 0 };
  for (let k = 0; k < 200; k++) {
    const mid = (lo + hi) / 2;
    if (pv(mid) > netReceived) lo = mid;
    else hi = mid;
  }
  return { payment, totalPaid: (payment + fee) * months, netReceived, catPct: ((lo + hi) / 2) * 100 };
}

/* ---------- China ---------- */

export const CN_EXAMPLE_RATES = { providentFundPct: 2.6, lpr5yPct: 3.5, asOf: "2025-05" }         ;

                                                    

export function cnLoan(principal        , annualPct        , years        , method          ) {
  const p = finite(principal, "principal", 0, 1e11);
  const n = Math.round(finite(years, "years", 1, 30) * 12);
  const r = finite(annualPct, "rate", 0, 30) / 100 / 12;
  if (method === "annuity") {
    const m = annuity(p, r, n);
    return { firstMonth: m, lastMonth: m, totalInterest: m * n - p };
  }
  const base = p / n;
  const firstMonth = base + p * r;
  const lastMonth = base + base * r;
  const totalInterest = (r * p * (n + 1)) / 2;
  return { firstMonth, lastMonth, totalInterest };
}

export function cnComboLoan(input   
                     
                      
                           
                            
                
                   
 ) {
  const fund = cnLoan(input.fundAmount, input.fundRatePct, input.years, input.method);
  const commercial = cnLoan(input.commercialAmount, input.commercialRatePct, input.years, input.method);
  const allCommercial = cnLoan(input.fundAmount + input.commercialAmount, input.commercialRatePct, input.years, input.method);
  const totalInterest = fund.totalInterest + commercial.totalInterest;
  return {
    fund,
    commercial,
    firstMonth: fund.firstMonth + commercial.firstMonth,
    lastMonth: fund.lastMonth + commercial.lastMonth,
    totalInterest,
    savedVsAllCommercial: allCommercial.totalInterest - totalInterest,
  };
}

/* ---------- Japan ---------- */

export const JP_HOUSING_CREDIT = { rate: 0.007, residentTaxCapMax: 97_500 }         ;

export function jpHousingLoanCredit(input   
               
                        
                    
                         
                       
                    
                         
 ) {
  const loan = finite(input.loan, "loan", 0, 1e10);
  const n = Math.round(finite(input.termYears, "term", 1, 50) * 12);
  const r = finite(input.annualRatePct, "rate", 0, 20) / 100 / 12;
  const limit = finite(input.borrowingLimit, "limit", 0, 1e10);
  const incomeTax = finite(input.incomeTax, "incomeTax", 0, 1e10);
  const residentCap = Math.min(finite(input.residentTaxCap, "residentCap", 0, 1e9), JP_HOUSING_CREDIT.residentTaxCapMax);
  const payment = annuity(loan, r, n);
  let balance = loan;
  const rows                                                                                                                             = [];
  for (let y = 1; y <= input.creditYears; y++) {
    for (let m = 0; m < 12 && balance > 0; m++) {
      const interest = balance * r;
      balance = Math.max(0, balance - (payment - interest));
    }
    const credit = Math.floor((Math.min(balance, limit) * JP_HOUSING_CREDIT.rate) / 100) * 100;
    const fromIncomeTax = Math.min(credit, incomeTax);
    const fromResidentTax = Math.min(credit - fromIncomeTax, residentCap);
    rows.push({ year: y, yearEndBalance: balance, credit, fromIncomeTax, fromResidentTax, unused: credit - fromIncomeTax - fromResidentTax });
  }
  const sum = (k                                                           ) => rows.reduce((s, x) => s + x[k], 0);
  return { payment, rows, totalCredit: sum("credit"), totalUsed: sum("fromIncomeTax") + sum("fromResidentTax"), totalUnused: sum("unused") };
}
