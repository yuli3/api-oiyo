// GENERATED from tools-oiyo src/lib/kr-accounting-schedules-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 회계 상각표와 외부감사 대상 판정 (2026-11-20, 전문 직군 전수조사 #8). 회계·세무 실무자가 결산 분개 전에 표를 맞춰 보는 용도예요.
// 같은 코드가 kr-tax-advisor 스킬 scripts/calc.mjs schedule / audit 로 들어가요. 어림 계산이고 감사의견이나 회계 판단을 대신하지 않아요.
// 근거:
// - 감가상각: K-IFRS 1016호·일반기업회계기준 10장(정액법·정률법·연수합계법), 법인세법 시행령 제26조(정률법 상각률은 잔존가액 5% 기준 산식).
// - 리스: K-IFRS 1116호(리스부채 = 리스료 현재가치, 이자비용 = 기초 부채 × 증분차입이자율, 사용권자산은 리스기간 정액 상각).
// - 사채: 유효이자율법(이자비용 = 기초 장부금액 × 유효이자율, 액면이자와의 차이를 할인·할증차금 상각).
// - 외부감사 대상: 주식회사 등의 외부감사에 관한 법률 제4조, 시행령 제5조(직전 사업연도 말 기준; 상장·상장예정 법인은 항상 대상,
//   자산 또는 매출 500억 원 이상이면 대상, 그 밖에는 자산 120억·부채 70억·매출 100억·종업원 100명 중 2개 이상(유한회사는 사원 50명을 더해 5개 중 3개 이상)).
export const ACCT_AS_OF = "2026-11-20";

const r0 = (n        ) => Math.round(n);
const pos = (v         ) => Math.max(0, Number(v) || 0);

                                                         
                                                                                         

/** 연 단위 감가상각표. 정률법 상각률은 1 − (잔존가치/취득원가)^(1/n), 잔존가치 0이면 5%로 계산해요. 첫해 사용 개월 수 반영. */
export function depreciation(cost        , residual        , years        , method           , firstMonths = 12) {
  const c = pos(cost), s = Math.min(pos(residual), c), n = Math.max(1, Math.round(years));
  const m = Math.min(12, Math.max(1, Math.round(firstMonths)));
  const rate = method === "declining" ? 1 - Math.pow((s || c * 0.05) / c, 1 / n) : 0;
  const rows           = [];
  let book = c;
  const totalYears = m < 12 ? n + 1 : n;
  for (let y = 1; y <= totalYears && book > s + 0.5; y++) {
    const frac = y === 1 ? m / 12 : y === totalYears && m < 12 ? (12 - m) / 12 : 1;
    let exp        ;
    if (method === "straight") exp = ((c - s) / n) * frac;
    else if (method === "declining") exp = y === totalYears ? book - s : book * rate * frac;
    else {
      // 연수합계법: 사용연도 기준 가중치를 월할로 나눠요.
      const sum = (n * (n + 1)) / 2;
      const w = (k        ) => (k >= 1 && k <= n ? (n - k + 1) / sum : 0);
      exp = m < 12 ? (c - s) * (y === 1 ? w(1) * frac : w(y - 1) * ((12 - m) / 12) + w(y) * (m / 12)) : (c - s) * w(y);
    }
    exp = Math.min(exp, book - s);
    rows.push({ year: y, opening: r0(book), expense: r0(exp), closing: r0(book - exp) });
    book -= exp;
  }
  return { rate: Math.round(rate * 10000) / 10000, rows };
}

                                                                                                                                                  

/** IFRS 16 리스부채·사용권자산 표(연 단위, 기말 지급 또는 기초 지급). */
export function leaseSchedule(payment        , periods        , rate        , advance = false, directCost = 0) {
  const p = pos(payment), n = Math.max(1, Math.round(periods)), i = pos(rate);
  const pvFactor = i === 0 ? n : ((1 - Math.pow(1 + i, -n)) / i) * (advance ? 1 + i : 1);
  const liability0 = p * pvFactor;
  const rou = liability0 + pos(directCost);
  const rows             = [];
  let bal = liability0;
  for (let k = 1; k <= n; k++) {
    const opening = bal;
    // 기말 지급: 이자 = 기초 잔액 × 이율. 기초 지급: 먼저 갚고 남은 잔액에 이자가 붙어요.
    const interest = Math.max(0, (advance ? opening - p : opening) * i);
    const closing = opening + interest - p;
    rows.push({ period: k, opening: r0(opening), payment: r0(p), interest: r0(interest), principal: r0(opening - closing), closing: r0(Math.abs(closing) < 1 ? 0 : closing), rouDep: r0(rou / n) });
    bal = closing;
  }
  return { liability: r0(liability0), rou: r0(rou), totalInterest: r0(p * n - liability0), rows };
}

                                                                                                                                 

/** 사채 유효이자율법 상각표. couponRate·marketRate는 기간(보통 연) 이율. */
export function bondSchedule(face        , couponRate        , marketRate        , periods        ) {
  const f = pos(face), n = Math.max(1, Math.round(periods)), c = pos(couponRate), m = pos(marketRate);
  const cash = f * c;
  const price = m === 0 ? cash * n + f : cash * ((1 - Math.pow(1 + m, -n)) / m) + f * Math.pow(1 + m, -n);
  const rows            = [];
  let book = price;
  for (let k = 1; k <= n; k++) {
    const interest = k === n ? cash + (f - book) : book * m;
    const amort = interest - cash;
    rows.push({ period: k, opening: r0(book), cash: r0(cash), interest: r0(interest), amortization: r0(amort), closing: r0(book + amort) });
    book += amort;
  }
  return { price: r0(price), type: price < f - 0.5 ? "할인발행" : price > f + 0.5 ? "할증발행" : "액면발행", rows };
}

                                                                                                                                                        
const EOK = 100_000_000;

/** 다음 사업연도 외부감사 대상인지(직전 사업연도 말 숫자로). */
export function externalAuditCheck(x            ) {
  if (x.listed) return { required: true, reason: "주권상장법인·상장예정법인은 규모와 관계없이 외부감사 대상이에요.", met: []            , need: 0 };
  if (pos(x.assets) >= 500 * EOK || pos(x.revenue) >= 500 * EOK) return { required: true, reason: "자산 또는 매출액이 500억 원 이상이라 대상이에요.", met: []            , need: 0 };
  const tests                      = [
    [pos(x.assets) >= 120 * EOK, "자산 120억 원 이상"],
    [pos(x.liabilities) >= 70 * EOK, "부채 70억 원 이상"],
    [pos(x.revenue) >= 100 * EOK, "매출액 100억 원 이상"],
    [pos(x.employees) >= 100, "종업원 100명 이상"],
  ];
  if (x.llc) tests.push([pos(x.members) >= 50, "사원 50명 이상"]);
  const met = tests.filter(([ok]) => ok).map(([, l]) => l);
  const need = x.llc ? 3 : 2;
  const required = met.length >= need;
  return { required, reason: `${x.llc ? "유한회사는 5개" : "4개"} 기준 중 ${met.length}개 해당(${need}개 이상이면 대상)이에요.`, met, need };
}

export const ACCT_NOTE = "결산 표를 맞춰 보는 어림 계산이에요. 회계정책·내용연수·할인율 선택과 세무상 한도는 회사 상황에 따라 달라요. 감사 대상 판정은 감사인 선임 기한(사업연도 개시 후 45일 등)과 함께 확인해요.";
