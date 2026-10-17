// Finance & Investment calculation module for South Korea & Global B2A
// Pure mathematical financial formulas for CAGR and compound interest
import { inheritanceGiftTax2026, cardDeduction2026 } from "./kr-rates-2026.mjs";

/**
 * Calculates Compound Annual Growth Rate (CAGR, 연평균 복합 성장률)
 * Formula: CAGR = (finalValue / initialValue) ^ (1 / years) - 1
 * @param {Object} params
 * @param {number} params.initialValue - Initial investment or baseline value (> 0)
 * @param {number} params.finalValue - Final value (>= 0)
 * @param {number} params.years - Investment period in years (> 0)
 */
export function calculateCAGR({ initialValue, finalValue, years }) {
  const init = Number(initialValue);
  const fin = Number(finalValue);
  const y = Number(years);

  if (isNaN(init) || init <= 0) {
    throw new Error("Initial value must be a positive number greater than 0");
  }
  if (isNaN(fin) || fin < 0) {
    throw new Error("Final value must be a non-negative number");
  }
  if (isNaN(y) || y <= 0) {
    throw new Error("Years must be a positive number greater than 0");
  }

  const multiplier = fin / init;
  const cagr = Math.pow(multiplier, 1 / y) - 1;
  const cagrPercent = Number((cagr * 100).toFixed(2));
  const totalReturn = multiplier - 1;
  const totalReturnPercent = Number((totalReturn * 100).toFixed(2));
  const ruleOf72Years = cagr > 0 ? Number((72 / (cagr * 100)).toFixed(2)) : null;

  // Generate annual progression trajectory (up to 100 years max)
  const annualBreakdown = [];
  const maxYears = Math.min(Math.round(y), 100);
  for (let i = 0; i <= maxYears; i++) {
    const val = i === y ? fin : Math.round(init * Math.pow(1 + cagr, i));
    annualBreakdown.push({
      year: i,
      value: val,
      growthPercent: Number(((val - init) / init * 100).toFixed(2)),
    });
  }

  return {
    initialValue: init,
    finalValue: fin,
    years: y,
    cagr: Number(cagr.toFixed(4)),
    cagrPercent,
    totalReturn: Number(totalReturn.toFixed(4)),
    totalReturnPercent,
    multiplier: Number(multiplier.toFixed(4)),
    ruleOf72Years,
    annualBreakdown,
  };
}

/**
 * Calculates Compound Interest (복리 이자 및 자산 증식)
 * Supports monthly or annual compounding with optional recurring monthly contribution
 * @param {Object} params
 * @param {number} params.principal - Initial lump sum deposit
 * @param {number} params.rate - Annual interest rate in percent (e.g. 7 for 7%)
 * @param {number} params.years - Investment duration in years
 * @param {number} [params.monthlyContribution=0] - Additional monthly contribution
 * @param {'monthly'|'annually'} [params.compoundingFrequency='monthly']
 */
export function calculateCompoundInterest({
  principal = 10000000,
  rate = 7,
  years = 10,
  monthlyContribution = 0,
  compoundingFrequency = "monthly",
}) {
  const p = Math.max(0, Number(principal) || 0);
  const r = Number(rate);
  const y = Math.max(1, Number(years) || 1);
  const pmt = Math.max(0, Number(monthlyContribution) || 0);

  if (isNaN(r)) {
    throw new Error("Rate must be a valid number");
  }

  const annualRate = r / 100;
  let balance = p;
  let totalPrincipal = p;

  const annualBreakdown = [
    {
      year: 0,
      principalInvested: p,
      interestEarned: 0,
      totalBalance: p,
    },
  ];

  if (compoundingFrequency === "annually") {
    for (let yr = 1; yr <= y; yr++) {
      totalPrincipal += pmt * 12;
      balance = (balance + pmt * 12) * (1 + annualRate);
      const curBalance = Math.round(balance);
      const curPrincipal = Math.round(totalPrincipal);
      annualBreakdown.push({
        year: yr,
        principalInvested: curPrincipal,
        interestEarned: Math.max(0, curBalance - curPrincipal),
        totalBalance: curBalance,
      });
    }
  } else {
    // monthly compounding
    const monthlyRate = annualRate / 12;
    const totalMonths = y * 12;

    for (let m = 1; m <= totalMonths; m++) {
      balance = balance * (1 + monthlyRate) + pmt;
      totalPrincipal += pmt;

      if (m % 12 === 0) {
        const curYear = m / 12;
        const curBalance = Math.round(balance);
        const curPrincipal = Math.round(totalPrincipal);
        annualBreakdown.push({
          year: curYear,
          principalInvested: curPrincipal,
          interestEarned: Math.max(0, curBalance - curPrincipal),
          totalBalance: curBalance,
        });
      }
    }
  }

  const finalBalance = Math.round(balance);
  const totalInvested = Math.round(totalPrincipal);
  const totalInterest = Math.max(0, finalBalance - totalInvested);
  const returnOnInvestmentPercent = totalInvested > 0 ? Number(((totalInterest / totalInvested) * 100).toFixed(2)) : 0;
  const ruleOf72Years = r > 0 ? Number((72 / r).toFixed(2)) : null;

  return {
    principal: p,
    annualRatePercent: r,
    years: y,
    monthlyContribution: pmt,
    compoundingFrequency,
    finalBalance,
    totalPrincipal: totalInvested,
    totalInterest,
    returnOnInvestmentPercent,
    ruleOf72Years,
    annualBreakdown,
  };
}

// South Korea Consumer Price Index (CPI) baseline table (2020 = 100.0) from Statistics Korea (KOSIS)
const KOREA_CPI_SERIES = {
  1980: 14.8,
  1985: 22.3,
  1990: 31.9,
  1995: 45.3,
  2000: 56.6,
  2005: 67.3,
  2010: 78.8,
  2015: 90.2,
  2020: 100.0,
  2021: 102.5,
  2022: 107.7,
  2023: 111.6,
  2024: 114.2,
  2025: 116.8,
  2026: 119.5, // Estimated baseline
};

/**
 * Calculates inflation-adjusted purchasing power value between years
 * @param {Object} params
 * @param {number} params.baseYear - Baseline year
 * @param {number} params.targetYear - Target year
 * @param {number} params.amount - Amount in base year currency
 */
export function calculateInflation({ baseYear, targetYear, amount }) {
  const bYear = parseInt(baseYear, 10);
  const tYear = parseInt(targetYear, 10);
  const amt = Number(amount);

  if (isNaN(bYear) || !KOREA_CPI_SERIES[bYear]) {
    throw new Error(`Unsupported or invalid baseYear. Available: ${Object.keys(KOREA_CPI_SERIES).join(", ")}`);
  }
  if (isNaN(tYear) || !KOREA_CPI_SERIES[tYear]) {
    throw new Error(`Unsupported or invalid targetYear. Available: ${Object.keys(KOREA_CPI_SERIES).join(", ")}`);
  }
  if (isNaN(amt) || amt < 0) {
    throw new Error("Amount must be a non-negative number");
  }

  const baseCpi = KOREA_CPI_SERIES[bYear];
  const targetCpi = KOREA_CPI_SERIES[tYear];

  const adjustedAmount = Math.round((amt * targetCpi) / baseCpi);
  const cpiGrowthPercent = Number((((targetCpi - baseCpi) / baseCpi) * 100).toFixed(2));
  const purchasingPowerRatio = Number((targetCpi / baseCpi).toFixed(4));

  return {
    baseYear: bYear,
    baseCpi,
    targetYear: tYear,
    targetCpi,
    originalAmount: amt,
    adjustedAmount,
    cpiGrowthPercent,
    purchasingPowerRatio,
  };
}

/**
 * Calculates loan repayment schedule and total interest
 * @param {Object} params
 * @param {number} params.principal - Loan principal amount (> 0)
 * @param {number} params.annualRate - Annual interest rate in % (e.g. 4.5)
 * @param {number} params.months - Total loan duration in months (> 0)
 * @param {string} [params.method="equalPI"] - equalPI (원리금균등), equalP (원금균등), bullet (만기일시)
 * @param {number} [params.graceMonths=0] - Grace period in months (interest only)
 */
export function calculateLoanRepayment({ principal, annualRate, months, method = "equalPI", graceMonths = 0 }) {
  const P = Number(principal);
  const rAnnual = Number(annualRate);
  const totalMonths = parseInt(months, 10);
  const grace = parseInt(graceMonths, 10) || 0;

  if (isNaN(P) || P <= 0) {
    throw new Error("Principal must be a positive number");
  }
  if (isNaN(rAnnual) || rAnnual < 0) {
    throw new Error("Annual interest rate must be non-negative");
  }
  if (isNaN(totalMonths) || totalMonths <= 0) {
    throw new Error("Months must be a positive integer");
  }
  if (grace < 0 || grace >= totalMonths) {
    throw new Error("Grace months must be between 0 and total months - 1");
  }

  const r = (rAnnual / 100) / 12; // monthly rate
  const repaymentMonths = totalMonths - grace;

  let firstMonthlyPayment = 0;
  let totalInterest = 0;

  if (method === "equalPI") {
    if (r > 0) {
      const factor = Math.pow(1 + r, repaymentMonths);
      const monthlyPayment = (P * r * factor) / (factor - 1);
      firstMonthlyPayment = grace > 0 ? P * r : monthlyPayment;
      totalInterest = (grace * P * r) + (monthlyPayment * repaymentMonths - P);
    } else {
      firstMonthlyPayment = P / repaymentMonths;
      totalInterest = 0;
    }
  } else if (method === "equalP") {
    const monthlyPrincipal = P / repaymentMonths;
    const firstInterest = P * r;
    firstMonthlyPayment = grace > 0 ? P * r : (monthlyPrincipal + firstInterest);
    const amortizingInterest = ((repaymentMonths + 1) * P * r) / 2;
    totalInterest = (grace * P * r) + amortizingInterest;
  } else if (method === "bullet") {
    firstMonthlyPayment = P * r;
    totalInterest = P * r * totalMonths;
  } else {
    throw new Error("Invalid method. Choose 'equalPI', 'equalP', or 'bullet'");
  }

  const roundedFirstPayment = Math.round(firstMonthlyPayment);
  const roundedTotalInterest = Math.round(totalInterest);
  const roundedTotalPayment = Math.round(P + totalInterest);

  return {
    principal: P,
    annualRatePercent: rAnnual,
    months: totalMonths,
    graceMonths: grace,
    method,
    firstMonthlyPayment: roundedFirstPayment,
    totalInterest: roundedTotalInterest,
    totalPayment: roundedTotalPayment,
  };
}

/**
 * Calculates stock DCA / average price dilution (물타기 평단가 계산)
 * @param {Object} params
 * @param {number} params.currentShares - Current number of shares held (> 0)
 * @param {number} params.currentPrice - Current average purchase price (> 0)
 * @param {number} params.additionalShares - Additional shares to buy (> 0)
 * @param {number} params.additionalPrice - Additional share purchase price (> 0)
 */
export function calculateStockAverage({
  currentShares,
  currentPrice,
  additionalShares,
  additionalPrice,
}) {
  const cShares = Number(currentShares);
  const cPrice = Number(currentPrice);
  const aShares = Number(additionalShares);
  const aPrice = Number(additionalPrice);

  if (isNaN(cShares) || cShares <= 0 || isNaN(aShares) || aShares <= 0) {
    throw new Error("Share quantities must be positive numbers");
  }
  if (isNaN(cPrice) || cPrice <= 0 || isNaN(aPrice) || aPrice <= 0) {
    throw new Error("Share prices must be positive numbers");
  }

  const currentTotal = cShares * cPrice;
  const additionalTotal = aShares * aPrice;
  const totalShares = cShares + aShares;
  const totalCost = currentTotal + additionalTotal;
  const newAveragePrice = totalCost / totalShares;
  const priceDiff = newAveragePrice - cPrice;
  const priceDiffPercent = (priceDiff / cPrice) * 100;

  return {
    currentShares: cShares,
    currentPrice: cPrice,
    currentTotalCost: Math.round(currentTotal),
    additionalShares: aShares,
    additionalPrice: aPrice,
    additionalTotalCost: Math.round(additionalTotal),
    totalShares,
    totalCost: Math.round(totalCost),
    newAveragePrice: Number(newAveragePrice.toFixed(2)),
    priceDiff: Number(priceDiff.toFixed(2)),
    priceDiffPercent: Number(priceDiffPercent.toFixed(2)),
  };
}

/**
 * Calculates dividend yield, tax, and monthly payout (배당수익률 및 월배당 계산)
 * @param {Object} params
 * @param {number} params.sharePrice - Price per share (> 0)
 * @param {number} params.annualDividendPerShare - Annual dividend per share (>= 0)
 * @param {number} [params.sharesHeld=1] - Total shares held
 * @param {number} [params.dividendTaxRate=15.4] - Dividend tax rate in % (default 15.4% Korea)
 */
export function calculateDividendYield({
  sharePrice,
  annualDividendPerShare,
  sharesHeld = 1,
  dividendTaxRate = 15.4,
}) {
  const price = Number(sharePrice);
  const divPerShare = Number(annualDividendPerShare);
  const shares = Number(sharesHeld) || 1;
  const taxRate = Number(dividendTaxRate) ?? 15.4;

  if (isNaN(price) || price <= 0) {
    throw new Error("Share price must be a positive number");
  }
  if (isNaN(divPerShare) || divPerShare < 0) {
    throw new Error("Annual dividend per share must be non-negative");
  }

  const grossYieldPercent = (divPerShare / price) * 100;
  const totalInvestment = price * shares;
  const grossAnnualDividend = divPerShare * shares;
  const taxAmount = Math.round(grossAnnualDividend * (taxRate / 100));
  const netAnnualDividend = grossAnnualDividend - taxAmount;
  const netMonthlyDividend = Math.round(netAnnualDividend / 12);
  const netYieldPercent = totalInvestment > 0 ? (netAnnualDividend / totalInvestment) * 100 : 0;

  return {
    sharePrice: price,
    annualDividendPerShare: divPerShare,
    sharesHeld: shares,
    totalInvestment: Math.round(totalInvestment),
    dividendTaxRatePercent: taxRate,
    grossYieldPercent: Number(grossYieldPercent.toFixed(2)),
    netYieldPercent: Number(netYieldPercent.toFixed(2)),
    grossAnnualDividend: Math.round(grossAnnualDividend),
    taxAmount,
    netAnnualDividend: Math.round(netAnnualDividend),
    netMonthlyDividend,
  };
}

/**
 * Calculates Youth Leap Account (청년도약계좌) simulation
 * @param {Object} params
 * @param {number} params.monthlyDeposit - Monthly deposit in KRW (100,000 ~ 700,000)
 * @param {number} [params.annualIncome=36000000] - Annual gross salary in KRW
 * @param {number} [params.bankRate=5.5] - Annual bank interest rate in % (default 5.5)
 * @param {number} [params.months=60] - Duration in months (default 60 = 5 years)
 */
export function calculateYouthSavings({
  monthlyDeposit,
  annualIncome = 36000000,
  bankRate = 5.5,
  months = 60,
}) {
  const deposit = Number(monthlyDeposit);
  const income = Number(annualIncome);
  const rate = Number(bankRate) / 100;
  const totalMonths = parseInt(months, 10) || 60;

  if (isNaN(deposit) || deposit <= 0) {
    throw new Error("Monthly deposit must be a positive number");
  }
  if (isNaN(income) || income < 0) {
    throw new Error("Annual income must be a non-negative number");
  }

  const principal = deposit * totalMonths;
  // Simple installment interest formula: P * r * (n * (n + 1) / 24)
  const bankInterest = deposit * rate * (totalMonths * (totalMonths + 1) / 24);

  // Government matching contribution rate & monthly cap
  let matchingRate = 0;
  let monthlyCap = 0;

  if (income <= 24000000) {
    matchingRate = 0.06;
    monthlyCap = 24000;
  } else if (income <= 36000000) {
    matchingRate = 0.046;
    monthlyCap = 23000;
  } else if (income <= 48000000) {
    matchingRate = 0.037;
    monthlyCap = 22000;
  } else if (income <= 60000000) {
    matchingRate = 0.030;
    monthlyCap = 21000;
  } else {
    // Over 60M to 75M: 0 matching, tax-free only
    matchingRate = 0;
    monthlyCap = 0;
  }

  const monthlyGovContribution = Math.min(deposit * matchingRate, monthlyCap);
  const totalGovContribution = monthlyGovContribution * totalMonths;
  const taxSavings = bankInterest * 0.154; // 15.4% tax exempted
  const totalPayout = principal + bankInterest + totalGovContribution;
  const effectiveYieldPercent = principal > 0 ? ((totalPayout - principal) / principal) * 100 : 0;

  return {
    monthlyDeposit: deposit,
    annualIncome: income,
    bankRatePercent: Number(bankRate),
    months: totalMonths,
    principal: Math.round(principal),
    bankInterest: Math.round(bankInterest),
    monthlyGovContribution: Math.round(monthlyGovContribution),
    totalGovContribution: Math.round(totalGovContribution),
    taxSavings: Math.round(taxSavings),
    totalPayout: Math.round(totalPayout),
    effectiveYieldPercent: Number(effectiveYieldPercent.toFixed(2)),
  };
}

/**
 * Calculates generic Fixed Deposit or Installment Savings maturity payout
 * @param {Object} params
 * @param {"installment"|"lumpSum"} [params.type="installment"] - installment (적금) or lumpSum (예금)
 * @param {number} params.amount - Monthly payment for installment, or principal for lumpSum
 * @param {number} params.annualRate - Annual interest rate in %
 * @param {number} [params.months=12] - Term in months
 * @param {"normal"|"preferential"|"taxFree"} [params.taxType="normal"] - normal (15.4%), preferential (9.5%), taxFree (0%)
 */
export function calculateDepositMaturity({
  type = "installment",
  amount,
  annualRate,
  months = 12,
  taxType = "normal",
}) {
  const amt = Number(amount);
  const rate = Number(annualRate) / 100;
  const totalMonths = parseInt(months, 10) || 12;

  if (isNaN(amt) || amt <= 0) {
    throw new Error("Amount must be a positive number");
  }
  if (isNaN(rate) || rate < 0) {
    throw new Error("Annual rate must be non-negative");
  }
  if (totalMonths <= 0) {
    throw new Error("Months must be positive");
  }

  let principal = 0;
  let grossInterest = 0;

  if (type === "lumpSum") {
    principal = amt;
    grossInterest = amt * rate * (totalMonths / 12);
  } else {
    // installment
    principal = amt * totalMonths;
    grossInterest = amt * rate * (totalMonths * (totalMonths + 1) / 24);
  }

  let taxRatePercent = 15.4;
  if (taxType === "preferential") taxRatePercent = 9.5;
  else if (taxType === "taxFree") taxRatePercent = 0;

  const taxAmount = Math.round(grossInterest * (taxRatePercent / 100));
  const netInterest = Math.round(grossInterest - taxAmount);
  const netPayout = Math.round(principal + netInterest);

  return {
    type,
    amount: amt,
    annualRatePercent: Number(annualRate),
    months: totalMonths,
    taxType,
    taxRatePercent,
    principal: Math.round(principal),
    grossInterest: Math.round(grossInterest),
    taxAmount,
    netInterest,
    netPayout,
  };
}

/**
 * Calculates South Korean Freelancer 3.3% withholding and May Income Tax Return estimation
 * @param {Object} params
 * @param {number} params.revenue - Annual gross freelance revenue in KRW (> 0)
 * @param {"creator"|"developer"|"designer"|"writer"|"general"} [params.jobCode="general"]
 * @param {number} [params.dependents=1] - Personal deduction dependents count (default 1 self)
 * @param {number} [params.additionalDeduction=0] - Additional pension/insurance deduction in KRW
 */
export function calculateFreelancerTax({
  revenue,
  jobCode = "general",
  dependents = 1,
  additionalDeduction = 0,
}) {
  const rev = Number(revenue);
  if (isNaN(rev) || rev <= 0) {
    throw new Error("Annual revenue must be a positive number in KRW");
  }

  const depCount = Math.max(1, parseInt(dependents, 10) || 1);
  const extraDeduction = Math.max(0, Number(additionalDeduction) || 0);

  // 1. 3.3% Withholding tax (Prepaid)
  const incomeTaxPrepaid = Math.floor(rev * 0.03);
  const localTaxPrepaid = Math.floor(incomeTaxPrepaid * 0.1);
  const totalPrepaidTax = incomeTaxPrepaid + localTaxPrepaid;

  // 2. Simple expense rate by job code
  const EXPENSE_RATES = {
    creator: 0.642,
    developer: 0.641,
    designer: 0.737,
    writer: 0.587,
    general: 0.640,
  };
  const expenseRate = EXPENSE_RATES[jobCode] ?? 0.640;
  const recognizedExpense = Math.round(rev * expenseRate);
  const incomeAmount = Math.max(0, rev - recognizedExpense);

  // 3. Income deductions (1.5M KRW basic deduction per person)
  const personalDeduction = depCount * 1500000;
  const totalDeductions = personalDeduction + extraDeduction;
  const taxBase = Math.max(0, incomeAmount - totalDeductions);

  // 4. Progressive Tax Brackets (2026 South Korea Income Tax)
  let calculatedIncomeTax = 0;
  if (taxBase <= 14000000) {
    calculatedIncomeTax = Math.round(taxBase * 0.06);
  } else if (taxBase <= 50000000) {
    calculatedIncomeTax = Math.round(taxBase * 0.14 - 1120000);
  } else if (taxBase <= 88000000) {
    calculatedIncomeTax = Math.round(taxBase * 0.24 - 6120000);
  } else if (taxBase <= 150000000) {
    calculatedIncomeTax = Math.round(taxBase * 0.35 - 15800000);
  } else {
    calculatedIncomeTax = Math.round(taxBase * 0.38 - 20300000);
  }

  // 5. Tax credits (Standard 70,000 KRW + Electronic Filing 20,000 KRW)
  const taxCredits = Math.min(calculatedIncomeTax, 90000);
  const finalIncomeTax = Math.max(0, calculatedIncomeTax - taxCredits);
  const finalLocalTax = Math.floor(finalIncomeTax * 0.1);
  const finalTotalTax = finalIncomeTax + finalLocalTax;

  // 6. Refund or additional payment
  const refundAmount = totalPrepaidTax - finalTotalTax;
  const isRefund = refundAmount >= 0;

  return {
    revenue: rev,
    jobCode,
    expenseRatePercent: Number((expenseRate * 100).toFixed(1)),
    recognizedExpense,
    incomeAmount,
    dependents: depCount,
    personalDeduction,
    totalDeductions,
    taxBase,
    calculatedIncomeTax,
    taxCredits,
    finalIncomeTax,
    finalLocalTax,
    finalTotalTax,
    prepaidTax: {
      incomeTax: incomeTaxPrepaid,
      localTax: localTaxPrepaid,
      total: totalPrepaidTax,
    },
    isRefund,
    refundAmount: Math.abs(refundAmount),
  };
}

/**
 * Compares South Korea Value Added Tax (VAT) between General and Simplified Taxpayer status
 * Based on Value-Added Tax Act Art. 61~69 (Simplified taxation rules and statutory rates)
 * @param {Object} params
 * @param {number} params.revenue - Annual gross revenue (공급대가, VAT-inclusive) in KRW (>= 0)
 * @param {number} params.purchase - Annual gross purchases with tax invoices (매입액) in KRW (>= 0)
 * @param {string} [params.industryType="food_retail"] - "food_retail" (15%), "manufacturing" (20%), "construction_logistics" (30%), "service" (30%), "real_estate_professional" (40%)
 */
export function calculateVatComparison({
  revenue,
  purchase,
  industryType = "food_retail",
}) {
  const rev = Number(revenue);
  const pur = Number(purchase);

  if (isNaN(rev) || rev < 0) {
    throw new Error("Revenue must be a non-negative number");
  }
  if (isNaN(pur) || pur < 0) {
    throw new Error("Purchase must be a non-negative number");
  }

  // Statutory value-added rates for simplified taxation (2026)
  const RATE_MAP = {
    food_retail: 0.15,
    retail: 0.15,
    food: 0.15,
    manufacturing: 0.20,
    agriculture_fishery: 0.20,
    construction_logistics: 0.30,
    transportation: 0.30,
    telecommunication: 0.30,
    service: 0.30,
    real_estate_professional: 0.40,
    real_estate_rent: 0.40,
  };

  const vatRate = RATE_MAP[industryType] ?? 0.15;

  // 1. General Taxpayer (일반과세자: 세율 10%, 세금계산서 매입세액 10% 전액 공제)
  // 공급가액 = 공급대가 / 1.1, 세액 = 공급가액 * 0.1
  const genSupplyPrice = Math.round(rev / 1.1);
  const genPurchaseSupplyPrice = Math.round(pur / 1.1);
  const genSalesVat = Math.round(genSupplyPrice * 0.1);
  const genPurchaseVat = Math.round(genPurchaseSupplyPrice * 0.1);
  const genBalance = genSalesVat - genPurchaseVat;
  const isGenRefund = genBalance < 0;
  const genPayableVat = isGenRefund ? 0 : genBalance;
  const genRefundVat = isGenRefund ? Math.abs(genBalance) : 0;

  // 2. Simplified Taxpayer (간이과세자: 매출 공급대가 * 부가율 * 10%, 매입 공급대가 * 0.5% 공제)
  const simpSalesVat = Math.round(rev * vatRate * 0.1);
  const simpPurchaseDeduction = Math.round(pur * 0.005);
  const simpCalculatedVat = Math.max(0, simpSalesVat - simpPurchaseDeduction);
  
  // Exemption threshold: < 48,000,000 KRW
  const isExempt = rev < 48000000;
  const simpFinalPayable = isExempt ? 0 : simpCalculatedVat;
  
  // Tax invoice issuance obligation: 48,000,000 ~ 104,000,000 KRW
  const canIssueTaxInvoice = rev >= 48000000 && rev < 104000000;
  // Threshold for simplified status: 104,000,000 KRW (real estate rent 48,000,000 KRW)
  const threshold = industryType.includes("real_estate_rent") ? 48000000 : 104000000;
  const exceedsThreshold = rev >= threshold;

  // Verdict & Recommendation
  let recommendation = "simplified_better";
  let advantageAmount = 0;
  let explanation = "";

  if (exceedsThreshold) {
    recommendation = "mandatory_general";
    advantageAmount = 0;
    explanation = "연간 매출액이 기준금액(1억 400만 원) 이상이므로 일반과세자로 의무 분류됩니다.";
  } else if (isGenRefund && genRefundVat > 0) {
    recommendation = "general_better_refund";
    advantageAmount = genRefundVat + (simpFinalPayable > 0 ? simpFinalPayable : 0);
    explanation = "설비·인테리어 등 매입세액이 커 일반과세자가 부가가치세를 직접 환급받으므로 현금흐름상 유리합니다.";
  } else if (genPayableVat > simpFinalPayable) {
    recommendation = "simplified_better";
    advantageAmount = genPayableVat - simpFinalPayable;
    explanation = isExempt
      ? "연 매출 4,800만 원 미만으로 납부의무가 전액 면제되어 간이과세자가 압도적으로 유리합니다."
      : `낮은 부가가치율(${Math.round(vatRate * 100)}%) 적용으로 간이과세자 세부담이 연간 약 ${advantageAmount.toLocaleString()}원 더 적습니다.`;
  } else {
    recommendation = "general_similar";
    advantageAmount = Math.abs(genPayableVat - simpFinalPayable);
    explanation = "양 과세유형 간 세액 차이가 미미하며, B2B 거래 상대방의 세금계산서 수취 선호도를 고려해야 합니다.";
  }

  return {
    revenue: rev,
    purchase: pur,
    industryType,
    vatRatePercent: Number((vatRate * 100).toFixed(1)),
    general: {
      supplyPrice: genSupplyPrice,
      purchaseSupplyPrice: genPurchaseSupplyPrice,
      salesTax: genSalesVat,
      purchaseTaxDeduction: genPurchaseVat,
      netTaxBalance: genBalance,
      isRefund: isGenRefund,
      payableTax: genPayableVat,
      refundTax: genRefundVat,
      canIssueTaxInvoice: true,
    },
    simplified: {
      salesTax: simpSalesVat,
      purchaseTaxDeduction: simpPurchaseDeduction,
      calculatedTax: simpCalculatedVat,
      isExempt,
      payableTax: simpFinalPayable,
      canIssueTaxInvoice,
      exceedsThreshold,
      threshold,
      canRefund: false,
    },
    verdict: {
      recommendation,
      advantageAmount,
      explanation,
    },
  };
}

/**
 * Calculates South Korea 2026 Inheritance and Gift Tax (상속세 및 증여세 모의계산)
 * Statutory reference: 상속세 및 증여세법 제19·21·26·27·53·53조의2·57·69조.
 * WHY delegate (2026-10-17): rates/deductions live only in kr-rates-2026.mjs (SSOT); this wrapper keeps the
 * response shape Gemini shipped (7bf3378) so existing callers do not break.
 * @param {Object} params
 * @param {'gift'|'inheritance'} [params.mode='gift']
 * @param {number} params.assetValue - Gross market value of gifted/inherited assets
 * @param {number} [params.debtValue=0] - Assumed debt deducted
 * @param {'spouse'|'child_adult'|'child_minor'|'parent'|'other_relative'|'other'} [params.relationship='spouse'] - Recipient's relation to donor
 * @param {number} [params.marriageBirthDeduction=0] - (Gift from lineal ascendant only) 혼인·출산 공제 to apply, max 100,000,000
 * @param {boolean} [params.hasSpouse=true] - (Inheritance) surviving spouse
 * @param {number} [params.spouseDeduction] - (Inheritance) spouse deduction, clamped to 5억~30억 (default 5억)
 * @param {boolean} [params.isGenerationSkipping=false] - 세대생략 할증 30% (minor recipient over 20억: 40%)
 * @param {boolean} [params.isMinorRecipient] - defaults to relationship === 'child_minor'
 * @param {boolean} [params.hasVoluntaryReporting=true] - 신고세액공제 3%
 */
export function calculateInheritanceGiftTax(params = {}) {
  const asset = Number(params.assetValue);
  const r = inheritanceGiftTax2026({ ...params, assetValue: asset });
  return {
    year: 2026,
    mode: r.mode,
    assetValue: asset,
    debtValue: Math.max(0, Number(params.debtValue) || 0),
    netAssetValue: r.netAssetValue,
    relationship: params.relationship ?? "spouse",
    deductionAmount: r.deductionAmount,
    statutoryMaxDeduction: r.statutoryMaxDeduction,
    marriageBirthDeductionApplied: r.marriageBirthDeductionApplied,
    taxableBase: r.taxableBase,
    bracketRatePercent: Math.round(r.bracketRate * 100),
    progressiveDeduction: r.progressiveDeduction,
    calculatedTax: r.calculatedTax,
    generationSkipSurchargeRatePercent: Math.round(r.generationSkipSurchargeRate * 100),
    generationSkipSurcharge: r.generationSkipSurcharge,
    voluntaryReportCredit: r.voluntaryReportCredit,
    finalTax: r.finalTax,
    effectiveRatePercent: asset > 0 ? Number(((r.finalTax / asset) * 100).toFixed(2)) : 0,
    notIncluded: ["10년 내 기존 증여 합산", "재산 평가(시가·보충적 평가)", "기초·인적·금융재산·동거주택 공제", "가업·영농상속공제"],
  };
}

/**
 * Calculates South Korea Loan Refinancing Gains, Prepayment Penalty & Break-Even Point (대출 중도상환수수료 및 갈아타기 실익)
 * Based on Financial Consumer Protection Act standards and sliding 3-year fee reduction formula
 * @param {Object} params
 * @param {number} params.loanBalance - Remaining loan balance to refinance in KRW
 * @param {number} params.currentRate - Existing annual interest rate in %
 * @param {number} params.newRate - New annual interest rate in %
 * @param {number} [params.penaltyRate=1.2] - Prepayment penalty rate in % from the loan contract. 1.2 is only an example default:
 *   since 2025-01-13 banks set fees from actual costs (금융소비자보호법 감독규정), so rates differ by product (2026-10-17).
 * @param {number} [params.elapsedMonths=12] - Elapsed months since loan origination (0~36)
 * @param {number} [params.incidentalCosts=75000] - Refinancing incidental fees (stamp duty, mortgage filing, etc.)
 */
export function calculateLoanRefinance({
  loanBalance,
  currentRate,
  newRate,
  penaltyRate = 1.2,
  elapsedMonths = 12,
  incidentalCosts = 75000,
}) {
  const balance = Number(loanBalance);
  const curR = Number(currentRate);
  const newR = Number(newRate);
  const penR = Number(penaltyRate);
  const months = Math.max(0, Math.min(36, parseInt(elapsedMonths, 10) || 0));
  const incidental = Math.max(0, Number(incidentalCosts) || 0);

  if (isNaN(balance) || balance <= 0) {
    throw new Error("loanBalance must be a positive number");
  }
  if (isNaN(curR) || curR <= 0 || isNaN(newR) || newR <= 0) {
    throw new Error("currentRate and newRate must be positive numbers");
  }

  // Prepayment penalty sliding 3-year taper (전액 면제 after 36 months)
  let prepaymentPenalty = 0;
  if (months < 36) {
    prepaymentPenalty = Math.floor(balance * (penR / 100) * ((36 - months) / 36));
  }

  const totalSwitchingCost = prepaymentPenalty + incidental;

  // Monthly and Annual Interest Savings
  const monthlyCurrentInterest = (balance * (curR / 100)) / 12;
  const monthlyNewInterest = (balance * (newR / 100)) / 12;
  const monthlyInterestSavings = Math.floor(monthlyCurrentInterest - monthlyNewInterest);
  const annualInterestSavings = monthlyInterestSavings * 12;
  const rateDifferencePercent = Number((curR - newR).toFixed(2));

  let breakEvenMonths = 0;
  let recommendation = "not_recommended";
  let verdict = "";

  if (monthlyInterestSavings <= 0) {
    breakEvenMonths = Infinity;
    recommendation = "not_recommended";
    verdict = "신규 대출 금리가 기존보다 높거나 같아 대환 실익이 없습니다.";
  } else {
    breakEvenMonths = totalSwitchingCost > 0 ? Number((totalSwitchingCost / monthlyInterestSavings).toFixed(1)) : 0;
    if (breakEvenMonths <= 12) {
      recommendation = "strong_recommend";
      verdict = `1년 이내(${breakEvenMonths}개월)에 모든 수수료와 비용을 회수하여 갈아타기 실익이 큽니다.`;
    } else if (breakEvenMonths <= 24) {
      recommendation = "recommend";
      verdict = `약 ${breakEvenMonths}개월 만에 비용을 회수하므로 대환을 권장합니다.`;
    } else if (breakEvenMonths <= 36) {
      recommendation = "caution";
      verdict = `비용 회수에 ${breakEvenMonths}개월이 걸리므로 향후 대출을 장기 유지할 계획일 때만 유리합니다.`;
    } else {
      recommendation = "not_recommended";
      verdict = "수수료 회수에 3년 이상 소요되어 3년 경과 후 중도상환수수료 면제 시점에 대환하는 것이 유리합니다.";
    }
  }

  const netSavings1Year = monthlyInterestSavings * 12 - totalSwitchingCost;
  const netSavings2Year = monthlyInterestSavings * 24 - totalSwitchingCost;
  const netSavings3Year = monthlyInterestSavings * 36 - totalSwitchingCost;

  return {
    year: 2026,
    loanBalance: balance,
    currentRatePercent: curR,
    newRatePercent: newR,
    rateDifferencePercent,
    monthlyInterestSavings,
    annualInterestSavings,
    prepaymentPenalty,
    incidentalCosts: incidental,
    totalSwitchingCost,
    elapsedMonths: months,
    breakEvenMonths: isFinite(breakEvenMonths) ? breakEvenMonths : null,
    netSavings1Year,
    netSavings2Year,
    netSavings3Year,
    recommendation,
    verdict,
  };
}

/**
 * Calculates South Korea 2026 Year-End Card Tax Deduction & Golden Ratio (연말정산 신용/체크카드 소득공제 및 황금비율 산출)
 * Statutory reference: 조세특례제한법 제126조의2 (2025-12-23 개정: 자녀 수별 기본한도 상향, 2026 지출분부터).
 * WHY delegate (2026-10-17): rates/limits and the marginal-rate estimate come from kr-rates-2026.mjs (SSOT).
 * @param {Object} params
 * @param {number} params.annualSalary - 총급여(비과세 제외)
 * @param {number} [params.creditCardSpend=0]
 * @param {number} [params.checkCardSpend=0] - 체크카드·현금영수증·선불
 * @param {number} [params.cultureSpend=0] - 도서·공연·박물관·영화·수영장·체력단련장 (총급여 7천만원 이하만 30%)
 * @param {number} [params.traditionalMarketSpend=0] - 전통시장 (40%)
 * @param {number} [params.publicTransitSpend=0] - 대중교통 (40%)
 * @param {number} [params.children=0] - 기본공제 대상 자녀·손자녀 수 (0, 1, 2+)
 */
export function calculateCardTaxDeduction(params = {}) {
  const salary = Number(params.annualSalary);
  const r = cardDeduction2026({ ...params, annualSalary: salary });
  const goldenRuleRecommendation = `총급여의 25%인 ${r.threshold25Percent.toLocaleString("ko-KR")}원까지는 공제와 무관하니 혜택이 큰 신용카드로 쓰고, 넘는 금액은 공제율이 2배인 체크카드·현금영수증(30%)으로 쓰면 기본 한도(${r.baseLimit.toLocaleString("ko-KR")}원)를 더 빨리 채워요.`;
  return {
    year: 2026,
    annualSalary: salary,
    ...r,
    excessSpend: Math.max(0, r.totalSpend - r.threshold25Percent),
    marginalTaxRatePercent: Math.round(r.marginalRate * 100),
    goldenRuleRecommendation,
    notIncluded: ["전년 대비 소비증가분 추가공제", "도서·공연 등 문화비의 결제수단 구분(7천만원 초과자는 신용카드로 계산)"],
  };
}


