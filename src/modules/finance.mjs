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
