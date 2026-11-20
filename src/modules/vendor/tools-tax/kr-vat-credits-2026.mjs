// GENERATED from tools-oiyo src/lib/kr-vat-credits-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 부가세 공제 팩: 의제매입세액·신용카드매출전표 발행세액공제·대손세액공제 (2026-11-20, 전문 직군 전수조사 #11).
// 같은 코드가 kr-tax-advisor 스킬 scripts/calc.mjs deemed-input / card-credit / bad-debt 로 들어가요. 어림 계산이고 신고서를 대신하지 않아요.
// 근거(2026 과세기간, 2026-11 확인):
// - 의제매입세액: 부가가치세법 제42조, 시행령 제84조. 공제율: 개인 음식점 과세표준(반기) 2억 이하 9/109(2026-12-31까지), 그 밖 개인 음식점 8/108,
//   법인 음식점 6/106, 과자점·떡방앗간 등 개인 제조 6/106, 중소기업·개인 제조 4/104, 그 밖 2/102.
//   한도율(2027-12-31까지): 법인 50%, 개인 음식점 1억 이하 75%·2억 이하 70%·초과 60%, 그 밖 개인 2억 이하 65%·초과 55%. 한도 = 과세표준 × 한도율 × 공제율.
// - 신용카드매출전표 등 발행세액공제: 제46조. 직전 연도 공급가액 10억 원 이하 개인사업자, 발행금액 × 1.3%, 연 1,000만 원 한도(2026-12-31까지).
//   2026-08 정부 세법개정안은 2027년부터 1.2%·500만 원(국회 통과 전) → 2027 이후는 다시 확인해요.
// - 대손세액공제: 제45조, 시행령 제87조. 대손금액(부가세 포함) × 10/110. 공급일부터 10년이 지난 날이 속하는 과세기간의 확정신고기한까지 대손이 확정돼야 해요.
export const VAT_CREDIT_AS_OF = "2026-11-20";
const EOK = 100_000_000;
const pos = (v         ) => Math.max(0, Number(v) || 0);
const floor = (n        ) => Math.floor(n);

                                                                                                                          
export const DEEMED_LABEL                             = {
  "restaurant-individual": "개인 음식점",
  "restaurant-corp": "법인 음식점",
  "bakery-individual": "과자점·떡방앗간 등 개인 제조",
  "manufacturer-sme": "중소기업·개인 제조업",
  other: "그 밖의 업종",
};

export function deemedRate(type            , taxBase        )                   {
  if (type === "restaurant-individual") return pos(taxBase) <= 2 * EOK ? [9, 109] : [8, 108];
  if (type === "restaurant-corp" || type === "bakery-individual") return [6, 106];
  if (type === "manufacturer-sme") return [4, 104];
  return [2, 102];
}

export function deemedLimitRatio(type            , taxBase        , corp         ) {
  const b = pos(taxBase);
  if (corp || type === "restaurant-corp") return 0.5;
  if (type === "restaurant-individual") return b <= EOK ? 0.75 : b <= 2 * EOK ? 0.7 : 0.6;
  return b <= 2 * EOK ? 0.65 : 0.55;
}

/** 반기 과세표준과 면세 농·축·수산물 매입가액으로 의제매입세액 공제액. */
export function deemedInputCredit(x                                                                          ) {
  const [n, d] = deemedRate(x.type, x.taxBase);
  const raw = (pos(x.purchases) * n) / d;
  const ratio = deemedLimitRatio(x.type, x.taxBase, !!x.corp);
  const limitPurchases = pos(x.taxBase) * ratio;
  const limit = (limitPurchases * n) / d;
  const credit = floor(Math.min(raw, limit));
  return { rate: `${n}/${d}`, raw: floor(raw), ratio, limitPurchases: floor(limitPurchases), limit: floor(limit), credit, capped: raw > limit };
}

/** 신용카드·현금영수증 매출 발행세액공제. */
export function cardSalesCredit(x                                                                                                         ) {
  const eligible = !x.corp && pos(x.priorYearSupply) <= 10 * EOK;
  if (!eligible) return { eligible, credit: 0, rate: 0, remainingCap: 0, reason: x.corp ? "법인은 대상이 아니에요." : "직전 연도 공급가액이 10억 원을 넘어 대상이 아니에요." };
  const rate = 0.013;
  const remainingCap = Math.max(0, 10_000_000 - pos(x.usedThisYear));
  let credit = Math.min(floor(pos(x.cardSales) * rate), remainingCap);
  if (x.payable !== undefined) credit = Math.min(credit, pos(x.payable));
  return { eligible, credit, rate, remainingCap, reason: "발행금액의 1.3%, 연 1,000만 원 한도예요(2026년까지). 납부할 세액을 넘으면 그만큼만 빼요." };
}

/** 대손세액공제: 금액과 확정 마감. */
export function badDebtCredit(x                                                          ) {
  const credit = floor((pos(x.amount) * 10) / 110);
  const [Y, M] = x.supplied.split("-").map(Number);
  const y10 = Y + 10;
  // 10년 지난 날이 속하는 과세기간: 1~6월이면 그해 7월 25일, 7~12월이면 다음 해 1월 25일이 확정신고기한.
  const deadline = M <= 6 ? `${y10}-07-25` : `${y10 + 1}-01-25`;
  const ok = x.confirmed ? x.confirmed <= deadline : null;
  return { credit, deadline, ok };
}

export const VAT_CREDIT_NOTE = "부가세 공제 어림이에요. 의제매입세액 한도는 1년(1기·2기) 단위로 확정신고 때 정산하고, 증빙(계산서·신용카드 영수증)이 있어야 공제돼요. 신고는 홈택스에서 하거나 세무 대리인에게 맡겨요.";
