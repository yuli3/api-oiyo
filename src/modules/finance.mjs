// Finance & Investment calculation module for South Korea & Global B2A
// Pure mathematical financial formulas for CAGR and compound interest

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

