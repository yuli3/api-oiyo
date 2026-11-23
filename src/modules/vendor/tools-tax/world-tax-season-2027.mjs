// GENERATED from tools-oiyo src/lib/world-tax-season-2027.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// Overseas tax season pack (2026-11-23, approved batch "4종 모두 진행"): US 2026 refund estimate, Japan 令和8年分 確定申告,
// Canada take-home 2026 (federal + ON/BC/AB), Australia take-home 2026-27. Facts: /mnt/project-files/notes/overseas-tax-season-facts-2026-11-23.md
// General information and estimates only: no tax advice, no return preparation or filing. Values not verified are not computed (listed in items).
import { BRACKETS_2026, STANDARD_DEDUCTION_2026, usTaxCalendar } from "./us-tax-pack-2026.mjs";
import { basicDeduction, employmentDeduction, incomeTax as jpIncomeTax } from "./japan-salary.mjs";

export const SEASON_AS_OF = "2026-11-23";
                                                                                   
const pos = (n         ) => Math.max(0, Number(n) || 0);
const r2 = (n        ) => Math.round(n * 100) / 100;
const days = (a        , b        ) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
const bracketTax = (income        , table                                        ) => {
  let tax = 0, lo = 0;
  for (const [hi, r] of table) { if (income <= lo) break; tax += (Math.min(income, hi) - lo) * r; lo = hi; }
  return tax;
};

// ── 1. US 2026 refund estimate (Rev. Proc. 2025-32; IR-2025-103; IRC §24) ──
                                                
export const US_2026 = {
  standard: { single: STANDARD_DEDUCTION_2026.single, mfj: STANDARD_DEDUCTION_2026.mfj, hoh: 24_150 },
  aged: { married: 1_650, unmarried: 2_050 },
  brackets: { single: BRACKETS_2026.single, mfj: BRACKETS_2026.mfj, hoh: [[17_700, 0.1], [67_450, 0.12], [105_700, 0.22], [201_750, 0.24], [256_200, 0.32], [640_600, 0.35], [Infinity, 0.37]]                       },
  ctc: { perChild: 2_200, refundable: 1_700, earnedFloor: 2_500, earnedRate: 0.15, phase: { single: 200_000, hoh: 200_000, mfj: 400_000 }, per1000: 50 },
}         ;

                                                                                                                                                           
export function usRefund2026(x               ) {
  const filing           = x.filing === "mfj" || x.filing === "hoh" ? x.filing : "single";
  const wages = pos(x.wages), other = pos(x.otherIncome), withheld = pos(x.withheld);
  const kids = Math.min(20, Math.floor(pos(x.children)));
  const aged = Math.min(filing === "mfj" ? 4 : 2, Math.floor(pos(x.aged)));
  const agi = wages + other;
  const standard = US_2026.standard[filing] + aged * (filing === "mfj" ? US_2026.aged.married : US_2026.aged.unmarried);
  const taxable = Math.max(0, agi - standard);
  const tax = Math.round(bracketTax(taxable, US_2026.brackets[filing]));
  const over = Math.max(0, agi - US_2026.ctc.phase[filing]);
  const ctcFull = Math.max(0, kids * US_2026.ctc.perChild - Math.ceil(over / 1000) * US_2026.ctc.per1000);
  const ctcNonref = Math.min(ctcFull, tax);
  const actc = Math.round(Math.min(ctcFull - ctcNonref, kids * US_2026.ctc.refundable, Math.max(0, wages - US_2026.ctc.earnedFloor) * US_2026.ctc.earnedRate));
  const totalTax = tax - ctcNonref;
  const refund = Math.round(withheld + actc - totalTax);
  const today = x.today ?? SEASON_AS_OF;
  const due = usTaxCalendar({ taxYear: 2026, today }).events.find((e) => e.id === "1040") ;
  const items          = [
    { tone: "info", text: `Standard deduction $${standard.toLocaleString("en-US")} (${filing === "mfj" ? "married filing jointly" : filing === "hoh" ? "head of household" : "single"}${aged ? `, incl. ${aged} × 65+/blind` : ""}). Taxable income $${taxable.toLocaleString("en-US")}, tax $${tax.toLocaleString("en-US")}.`, cite: "Rev. Proc. 2025-32 §4.01, §4.14" },
    ...(kids ? [{ tone: "info"         , text: `Child tax credit up to $2,200 a child: $${ctcNonref.toLocaleString("en-US")} used against tax, $${actc.toLocaleString("en-US")} refundable (up to $1,700 a child, 15% of earned income over $2,500).${over ? " Reduced by $50 per $1,000 of income over the threshold." : ""}`, cite: "Rev. Proc. 2025-32 §4.05; IRC §24" }] : []),
    { tone: "warn", text: "Not included: state tax, itemized deductions, EITC, education and other credits, and the new deductions for tips, overtime, car loan interest and seniors. If any apply to you, your refund can be larger.", cite: "IRS Get ready to file your taxes" },
    ...(actc > 0 ? [{ tone: "info"         , text: "Refunds that include the refundable child tax credit or EITC are held until mid-February by law.", cite: "IRS Get ready to file your taxes (PATH Act)" }] : []),
    { tone: "info", text: `Form 1040 for 2026 is due ${due.date}. Filing only to get a refund? You generally have 3 years to claim it.`, cite: "IRS Pub 509; IRC §6511" },
  ];
  return { asOf: SEASON_AS_OF, currency: "USD", filing, agi, standard, taxable, tax, ctc: ctcNonref, actc, totalTax, withheld, refund, owe: refund < 0, due: due.date, daysLeft: days(today, due.date), items };
}

// ── 2. Japan 令和8年分 確定申告 (国税庁 No.2020, 暮らしの税情報 令和8年度版, 2026kiso) ──
export const JP_KAKUTEI_2026 = { open: "2027-02-16", due: "2027-03-15", medicalCap: 2_000_000, medicalFloor: 100_000, donationFloor: 2_000, donationRate: 0.4 }         ;
                                                                                                                                                                                       
export function jpKakutei2026(x                ) {
  const salary = pos(x.salary), withheld = pos(x.withheld), social = pos(x.social), other = pos(x.otherIncome);
  const empIncome = Math.max(0, salary - employmentDeduction(salary));
  const total = empIncome + other;
  const medical = Math.min(JP_KAKUTEI_2026.medicalCap, Math.max(0, pos(x.medical) - Math.min(JP_KAKUTEI_2026.medicalFloor, Math.floor(total * 0.05))));
  const donation = Math.max(0, Math.min(pos(x.donation), Math.floor(total * JP_KAKUTEI_2026.donationRate)) - JP_KAKUTEI_2026.donationFloor);
  const basic = basicDeduction(total);
  const deductions = social + basic + medical + donation + pos(x.otherDeductions);
  const taxable = Math.floor(Math.max(0, total - deductions) / 1000) * 1000;
  const tax = Math.floor(jpIncomeTax(taxable) / 100) * 100;
  const diff = withheld - tax;
  const mustFile = salary > 20_000_000 || other > 200_000;
  const today = x.today ?? SEASON_AS_OF;
  const items          = [
    { tone: "info", text: `給与所得 ${empIncome.toLocaleString("ja-JP")}円（給与所得控除 令和8年分、最低74万円）。基礎控除 ${basic.toLocaleString("ja-JP")}円（令和8年分は合計所得489万円以下で104万円）。`, cite: "国税庁 令和8年度税制改正による基礎控除の引上げ等" },
    ...(medical > 0 ? [{ tone: "good"         , text: `医療費控除 ${medical.toLocaleString("ja-JP")}円（保険などで補填された分を引いた額から、10万円または所得の5%の少ない方を引いた額。上限200万円）。`, cite: "所得税法第73条" }] : []),
    ...(donation > 0 ? [{ tone: "good"         , text: `寄附金控除 ${donation.toLocaleString("ja-JP")}円（寄附額−2,000円、所得の40%まで）。ふるさと納税で確定申告をすると、ワンストップ特例は使えません。住民税側の控除はここに含みません。`, cite: "所得税法第78条" }] : []),
    { tone: mustFile ? "warn" : "info", text: mustFile ? "給与収入2,000万円超、または給与以外の所得が20万円超のため、確定申告が必要な可能性が高いです。" : "給与が1か所で全額源泉徴収、収入2,000万円以下、ほかの所得20万円以下なら、還付を受けたいときだけ申告すれば足ります。", cite: "国税庁 No.2020" },
    { tone: "info", text: "申告期限・納期限は令和9年3月15日（月）。窓口の受付は2月16日（火）から。還付申告は2月15日以前でも出せます。", cite: "国税庁 暮らしの税情報 令和8年度版" },
    { tone: "warn", text: "期限後申告は提出日が納期限になり、延滞税と無申告加算税（自主的な期限後申告は5%）がかかることがあります。", cite: "国税庁 No.2024" },
    { tone: "warn", text: "配偶者・扶養・生命保険料・住宅ローン控除などは「その他の所得控除」に自分で足してください（税額控除は含みません）。住民税は計算していません。", cite: "—" },
  ];
  return { asOf: SEASON_AS_OF, currency: "JPY", empIncome, total, basic, medical, donation, deductions, taxable, tax, withheld, refund: diff, owe: diff < 0, mustFile, open: JP_KAKUTEI_2026.open, due: JP_KAKUTEI_2026.due, daysToOpen: days(today, JP_KAKUTEI_2026.open), daysLeft: days(today, JP_KAKUTEI_2026.due), items };
}

// ── 3. Canada take-home 2026 (CRA payroll pages, T4032-ON/BC/AB, T4127 July 2026) ──
                                            
export const CA_2026 = {
  fed: [[58_523, 0.14], [117_045, 0.205], [181_440, 0.26], [258_482, 0.29], [Infinity, 0.33]]                      ,
  bpa: { max: 16_452, min: 14_829, from: 181_440, to: 258_482 }, cea: 1_501, lowest: 0.14,
  cpp: { ympe: 74_600, exemption: 3_500, rate: 0.0595, base: 0.0495, max: 4_230.45 }, cpp2: { yampe: 85_000, rate: 0.04, max: 416 },
  ei: { mie: 68_900, rate: 0.0163, max: 1_123.07 },
  prov: {
    on: { name: "Ontario", bpa: 12_989, lowest: 0.0505, brackets: [[53_891, 0.0505], [107_785, 0.0915], [150_000, 0.1116], [220_000, 0.1216], [Infinity, 0.1316]]                       },
    bc: { name: "British Columbia", bpa: 13_216, lowest: 0.056, brackets: [[50_363, 0.056], [100_728, 0.077], [115_648, 0.105], [140_430, 0.1229], [190_405, 0.147], [265_545, 0.168], [Infinity, 0.205]]                       },
    ab: { name: "Alberta", bpa: 22_769, lowest: 0.08, brackets: [[61_200, 0.08], [154_259, 0.1], [185_111, 0.12], [246_813, 0.13], [370_220, 0.14], [Infinity, 0.15]]                       },
  },
  onSurtax: [[5_818, 0.2], [7_446, 0.36]]                      ,
}         ;
export function ontarioHealthPremium(ti        ) {
  if (ti <= 20_000) return 0;
  if (ti <= 36_000) return Math.min(300, 0.06 * (ti - 20_000));
  if (ti <= 48_000) return Math.min(450, 300 + 0.06 * (ti - 36_000));
  if (ti <= 72_000) return Math.min(600, 450 + 0.25 * (ti - 48_000));
  if (ti <= 200_000) return Math.min(750, 600 + 0.25 * (ti - 72_000));
  return Math.min(900, 750 + 0.25 * (ti - 200_000));
}
export function caTakeHome2026(x                                           ) {
  const pv             = x.province === "bc" || x.province === "ab" ? x.province : "on";
  const P = CA_2026.prov[pv];
  const gross = pos(x.annual);
  const cpp = r2(Math.min(CA_2026.cpp.max, Math.max(0, Math.min(gross, CA_2026.cpp.ympe) - CA_2026.cpp.exemption) * CA_2026.cpp.rate));
  const cppBase = cpp * (CA_2026.cpp.base / CA_2026.cpp.rate), cppEnh = cpp - cppBase;
  const cpp2 = r2(Math.min(CA_2026.cpp2.max, Math.max(0, Math.min(gross, CA_2026.cpp2.yampe) - CA_2026.cpp.ympe) * CA_2026.cpp2.rate));
  const ei = r2(Math.min(CA_2026.ei.max, Math.min(gross, CA_2026.ei.mie) * CA_2026.ei.rate));
  const taxable = Math.max(0, gross - cppEnh - cpp2);
  const b = CA_2026.bpa;
  const bpa = taxable <= b.from ? b.max : taxable >= b.to ? b.min : b.max - ((b.max - b.min) * (taxable - b.from)) / (b.to - b.from);
  const federal = r2(Math.max(0, bracketTax(taxable, CA_2026.fed) - CA_2026.lowest * (bpa + Math.min(CA_2026.cea, gross) + cppBase + ei)));
  const basicProv = Math.max(0, bracketTax(taxable, P.brackets) - P.lowest * (P.bpa + cppBase + ei));
  const surtax = pv === "on" ? CA_2026.onSurtax.reduce((s, [t, r]) => s + Math.max(0, basicProv - t) * r, 0) : 0;
  const ohp = pv === "on" ? ontarioHealthPremium(taxable) : 0;
  const provincial = r2(basicProv + surtax + ohp);
  const net = r2(gross - cpp - cpp2 - ei - federal - provincial);
  const items          = [
    { tone: "info", text: `Federal tax 2026: 14% to 33% after the basic personal amount ($${Math.round(bpa).toLocaleString("en-US")}), the Canada employment amount and credits for base CPP and EI.`, cite: "CRA payroll: income tax rates and thresholds 2026; T4032 2026" },
    { tone: "info", text: "CPP 5.95% of earnings between $3,500 and $74,600 (max $4,230.45), CPP2 4% up to $85,000 (max $416), EI 1.63% up to $68,900 (max $1,123.07). The enhanced CPP part and CPP2 are deducted from income.", cite: "CRA CPP and EI rates and maximums 2026" },
    { tone: "info", text: pv === "on" ? "Ontario: 5.05% to 13.16%, basic personal amount $12,989, plus the Ontario surtax and Ontario Health Premium." : pv === "bc" ? "British Columbia: 5.60% (raised from 5.06% for 2026 on July 1) to 20.50%, basic personal amount $13,216." : "Alberta: 8% on the first $61,200 up to 15%, basic personal amount $22,769.", cite: pv === "bc" ? "T4032-BC 2026; T4127 July 2026" : `T4032-${pv.toUpperCase()} 2026` },
    { tone: "warn", text: `Not included: ${pv === "on" ? "the Ontario tax reduction for low incomes" : pv === "bc" ? "the BC tax reduction for low incomes" : "Alberta's supplemental credit for large credits"}, RRSP, union dues, other credits, Quebec (QPP, QPIP) and the other provinces. Your paycheque withholding can differ.`, cite: "—" },
  ];
  return { asOf: SEASON_AS_OF, currency: "CAD", province: pv, provinceName: P.name, gross, cpp, cpp2, ei, taxable: r2(taxable), federal, provincial, ohp: r2(ohp), net, monthlyNet: r2(net / 12), items };
}

// ── 4. Australia take-home (ATO resident rates 2025-26 and 2026-27, LITO, Medicare levy, SG 12%) ──
                                           
export const AU_RATES                                     = {
  "2025-26": [[18_200, 0], [45_000, 0.16], [135_000, 0.3], [190_000, 0.37], [Infinity, 0.45]],
  "2026-27": [[18_200, 0], [45_000, 0.15], [135_000, 0.3], [190_000, 0.37], [Infinity, 0.45]],
};
export const AU_LITO = { max: 700, from: 37_500, mid: 45_000, midAmount: 325, end: 66_667 }         ;
export const AU_MEDICARE = { rate: 0.02, lower: 28_011, upper: 35_013, shade: 0.1, year: "2025-26" }         ;
export const AU_SG = 0.12;
export function auLito(ti        ) {
  if (ti <= AU_LITO.from) return AU_LITO.max;
  if (ti <= AU_LITO.mid) return AU_LITO.max - 0.05 * (ti - AU_LITO.from);
  if (ti <= AU_LITO.end) return Math.max(0, AU_LITO.midAmount - 0.015 * (ti - AU_LITO.mid));
  return 0;
}
export function auTakeHome(x                                                                   ) {
  const year         = x.year === "2025-26" ? "2025-26" : "2026-27";
  const input = pos(x.annual);
  const salary = x.packageIncludesSuper ? r2(input / (1 + AU_SG)) : input;
  const superAmt = r2(salary * AU_SG);
  const gross = Math.round(bracketTax(salary, AU_RATES[year]) * 100) / 100;
  const lito = r2(auLito(salary));
  const tax = r2(Math.max(0, gross - lito));
  const medicare = r2(salary <= AU_MEDICARE.lower ? 0 : Math.min(AU_MEDICARE.rate * salary, AU_MEDICARE.shade * (salary - AU_MEDICARE.lower)));
  const net = r2(salary - tax - medicare);
  const items          = [
    { tone: "info", text: `${year} resident rates: tax-free to $18,200, then ${year === "2026-27" ? "15%" : "16%"} to $45,000, 30% to $135,000, 37% to $190,000 and 45% above.${year === "2026-27" ? " The 16% rate falls to 15% from 1 July 2026 and to 14% from 1 July 2027." : ""}`, cite: "ATO Tax rates – Australian residents; ATO new tax cuts" },
    { tone: "info", text: `Low income tax offset $${lito.toLocaleString("en-AU")} (up to $700, gone at $66,667). Medicare levy 2%${salary <= AU_MEDICARE.upper ? `, reduced or nil for low incomes (2025-26 thresholds $28,011 to $35,013; 2026-27 thresholds not published yet)` : ""}.`, cite: "ATO Low income tax offset; ATO Medicare levy reduction" },
    { tone: "good", text: `Your employer also pays super of 12%: $${superAmt.toLocaleString("en-AU")} a year on top of this salary${x.packageIncludesSuper ? " (taken out of the package you entered)" : ""}.`, cite: "ATO: SG rate 12% from 1 July 2025" },
    { tone: "warn", text: "Residents only. Not included: Medicare levy surcharge, HELP/student loan repayments, foreign resident and working holiday rates, deductions and other offsets.", cite: "—" },
  ];
  return { asOf: SEASON_AS_OF, currency: "AUD", year, salary, super: superAmt, incomeTax: tax, lito, medicare, net, monthlyNet: r2(net / 12), fortnightlyNet: r2(net / 26), items };
}
