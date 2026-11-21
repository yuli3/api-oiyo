// GENERATED from tools-oiyo src/lib/japan-salary.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 日本の給与手取り（令和8年分の概算）。JapanSalaryCalculator（旧画面）と JapanSalaryScenario（かんたん/専門家画面）の共通計算。
// 協会けんぽ東京支部 令和8年度、標準報酬月額は月額総支給で近似。
import { fixedRange,                                  } from "./scenario.mjs";

/** 給与所得控除（令和7年分以後: 最低保障65万円→令和8年分74万円の特例を含む） */
export function employmentDeduction(annual        )         {
  if (annual <= 2_200_000) return Math.min(annual, 740_000);
  if (annual <= 3_600_000) return Math.floor(annual * 0.3 + 80_000);
  if (annual <= 6_600_000) return Math.floor(annual * 0.2 + 440_000);
  if (annual <= 8_500_000) return Math.floor(annual * 0.1 + 1_100_000);
  return 1_950_000;
}

/** 基礎控除（令和8年分: 本則62万円＋令和8・9年の特例加算） */
export function basicDeduction(totalIncome        )         {
  if (totalIncome <= 4_890_000) return 1_040_000;
  if (totalIncome <= 6_550_000) return 670_000;
  if (totalIncome <= 23_500_000) return 620_000;
  if (totalIncome <= 24_000_000) return 480_000;
  if (totalIncome <= 24_500_000) return 320_000;
  if (totalIncome <= 25_000_000) return 160_000;
  return 0;
}

/** 所得税（速算表＋復興特別所得税2.1%） */
export function incomeTax(taxable        )         {
  if (taxable <= 0) return 0;
  const table                             = [
    [1_950_000, 0.05, 0],
    [3_300_000, 0.1, 97_500],
    [6_950_000, 0.2, 427_500],
    [9_000_000, 0.23, 636_000],
    [18_000_000, 0.33, 1_536_000],
    [40_000_000, 0.4, 2_796_000],
    [Infinity, 0.45, 4_796_000],
  ];
  const [, r, d] = table.find(([max]) => taxable <= max) ;
  return Math.floor(Math.floor(taxable * r - d) * 1.021);
}

                               
                 
                 
                                   
                 
 

export function jpSalary(i              ) {
  const gross = Math.floor(i.salary / 12);
  const healthIns = Math.floor(gross * (i.health / 2));
  const child = Math.floor(gross * 0.00115);
  const care = i.age40 ? Math.floor(gross * 0.0081) : 0;
  const pension = Math.floor(Math.min(gross, 650_000) * 0.0915);
  const employment = Math.floor(gross * 0.005);
  const socialMonthly = healthIns + child + care + pension + employment;
  const social = socialMonthly * 12;
  const empIncome = Math.max(0, i.salary - employmentDeduction(i.salary));
  const taxable = Math.max(0, empIncome - social - basicDeduction(empIncome));
  const itax = incomeTax(taxable);
  const residentTaxable = Math.max(0, empIncome - social - 430_000);
  const rtax = residentTaxable > 0 ? Math.floor(residentTaxable * 0.1) + 5_000 : 0;
  const itaxM = Math.floor(itax / 12);
  const rtaxM = Math.floor(rtax / 12);
  const net = Math.max(0, gross - socialMonthly - itaxM - rtaxM);
  return { gross, healthIns, child, care, pension, employment, socialMonthly, itaxM, rtaxM, net, annualNet: net * 12, taxable, rate: gross > 0 ? net / gross : 0 };
}
export const jpAnnualNet = (i              ) => jpSalary(i).annualNet;

const yen = (n        ) => `${Math.round(n).toLocaleString("ja-JP")}円`;
const manYen = (n        ) => `約${(Math.round(n / 1000) / 10).toLocaleString("ja-JP")}万円`;

export const JP_SALARY_ASSUMPTIONS                             = [
  { key: "salary", label: "年収（額面）", plain: "年収", unit: "won", kind: "assumption", get: (i) => i.salary, set: (i, v) => ({ ...i, salary: Math.max(0, Math.round(v / 10000) * 10000) }), range: (a) => [Math.max(1_000_000, a * 0.5), Math.max(a * 2, 3_000_000)] },
  { key: "health", label: "健康保険料率（労使合計）", plain: "健康保険料率", unit: "rate", kind: "assumption", get: (i) => i.health, set: (i, v) => ({ ...i, health: Math.min(0.12, Math.max(0.08, v)) }), range: fixedRange(0.093, 0.105) },
];

export function jpSalaryPlain(i              , top             ) {
  const r = jpSalary(i);
  return {
    headline: `年収${manYen(i.salary)}なら、月の手取りは${yen(r.net)}、年間で${manYen(r.annualNet)}です。額面の${Math.round(r.rate * 100)}%が手元に残ります。`,
    driver:
      top && top.span > 0
        ? `結果を最も大きく動かすのは${top.plain}です。この値が20%増減すると、年間手取りは${manYen(Math.min(top.low, top.high))}〜${manYen(Math.max(top.low, top.high))}になります。`
        : null,
    reasons: [
      `毎月引かれるのは社会保険料${yen(r.socialMonthly)}、所得税${yen(r.itaxM)}、住民税${yen(r.rtaxM)}です。いちばん大きいのは社会保険料（厚生年金${yen(r.pension)}）です。`,
      i.age40 ? "40歳以上なので介護保険料が加わっています。" : "40歳になると介護保険料（月額総支給の約0.81%）が加わります。",
      "住民税は前年の所得で決まるため、昇給・転職の翌年に遅れて変わります。令和8年分の控除引上げは年末調整で精算されます。",
    ],
  };
}
