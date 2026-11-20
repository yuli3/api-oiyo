// GENERATED from tools-oiyo src/lib/kr-corp-tax-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 법인세 계산과 세무조정 한도 (2026-11-20, 전문 직군 전수조사 #1). 세무사·회계사·법인 대표가 결산 전에 숫자를 맞춰 보는 용도예요.
// 같은 코드가 kr-tax-advisor 스킬 scripts/calc.mjs corp-tax로 들어가요. 어림 계산이고 세무조정계산서를 대신하지 않아요.
// 근거(2026-01-01 이후 개시 사업연도):
// - 세율: 법인세법 제55조 ①(2025-12-02 국회 통과, 전 구간 1%p 인상: 2억 10%, 200억 20%, 3,000억 22%, 초과 25%). 계산은 kr-incorporation-2026.ts와 같아요.
// - 이월결손금: 법인세법 제13조 ①(2021년 이후 발생분 15년, 중소기업 등은 소득의 100%, 그 밖은 80%).
// - 기부금: 법인세법 제24조(특례기부금 50%, 일반기부금 10%; 기준소득은 기부금 손금 전 소득에서 이월결손금 공제 후).
// - 기업업무추진비: 법인세법 제25조 ④(기본 1,200만 원, 중소기업 3,600만 원 × 월수/12; 수입금액 100억 이하 0.3%, 500억 이하 0.2%, 초과 0.03%;
//   특수관계인 수입금액분은 10%), 조세특례제한법 제136조 ③(문화비 추가 한도 = 일반 한도의 20%). 전통시장 추가 한도는 적용 기한이 바뀔 수 있어 넣지 않았어요.
// - 최저한세: 조세특례제한법 제132조 ①(중소기업 7%, 그 밖은 과세표준 100억 이하 10%, 1,000억 이하 12%, 초과 17%).
// - 중간예납: 법인세법 제63조(사업연도 첫 6개월, 끝난 날부터 2개월 안에 납부; 직전 사업연도 기준 금액이 50만 원 미만인 중소기업은 안 내요), 제63조의2(직전 세액 1/2 또는 가결산).
// - 지방소득세 법인분은 같은 구간에 법인세율의 1/10이라 산출세액의 10%로 어림해요.
import { corporateTax2026 } from "./kr-incorporation-2026.mjs";

export const CORP_TAX_AS_OF = "2026-11-20";
const EOK = 100_000_000;
const MAN = 10_000;
const floor10 = (n        ) => Math.floor(Math.round(n) / 10) * 10;
const pos = (n                    ) => Math.max(0, Number(n) || 0);

                                         

/** 수입금액 구간 한도(0.3% / 0.2% / 0.03%). */
function revenueTier(revenue        )         {
  const r = pos(revenue);
  const a = Math.min(r, 100 * EOK) * 0.003;
  const b = Math.min(Math.max(r - 100 * EOK, 0), 400 * EOK) * 0.002;
  const c = Math.max(r - 500 * EOK, 0) * 0.0003;
  return a + b + c;
}

                                                                                                                                                                       

/** 기업업무추진비 손금 한도와 한도 초과액. noProof = 3만 원 초과인데 적격증빙이 없는 금액(먼저 손금불산입). */
export function entertainmentLimit(x                    ) {
  const months = Math.min(12, Math.max(1, Math.round(x.months ?? 12)));
  const base = ((x.size === "sme" ? 3600 : 1200) * MAN * months) / 12;
  const total = pos(x.revenue);
  const related = Math.min(pos(x.relatedRevenue), total);
  const generalPart = revenueTier(total - related);
  const relatedPart = (revenueTier(total) - generalPart) * 0.1;
  const general = floor10(base + generalPart + relatedPart);
  const culture = floor10(Math.min(pos(x.cultureSpent), general * 0.2));
  const limit = general + culture;
  const noProof = pos(x.noProof);
  const counted = Math.max(0, pos(x.spent) - noProof);
  const excess = Math.max(0, counted - limit);
  return { months, base: floor10(base), revenuePart: floor10(generalPart + relatedPart), general, culture, limit, noProof, excess, disallowed: excess + noProof };
}

/** 이월결손금 공제(한도 100% / 80%). */
export function lossDeduction(income        , losses        , size          ) {
  const cap = pos(income) * (size === "sme" ? 1 : 0.8);
  const used = Math.min(pos(losses), cap);
  return { cap: floor10(cap), used: floor10(used), left: floor10(pos(losses) - used) };
}

                                                                                                                                  

/** 기부금 손금 한도. 기준소득금액 = 기부금 손금산입 전 소득 + 지출 기부금(특례·일반). */
export function donationLimit(x               ) {
  const special = pos(x.special), general = pos(x.general);
  const baseIncome = pos(x.incomeBeforeDonation) + special + general;
  const loss = lossDeduction(baseIncome, pos(x.losses), x.size).used;
  const specialCap = floor10(Math.max(0, baseIncome - loss) * 0.5);
  const specialOk = Math.min(special, specialCap);
  const generalCap = floor10(Math.max(0, baseIncome - loss - specialOk) * 0.1);
  const generalOk = Math.min(general, generalCap);
  return { baseIncome, specialCap, specialExcess: special - specialOk, generalCap, generalExcess: general - generalOk, carryYears: 10 };
}

/** 최저한세율. */
export function minimumTaxRate(base        , size          )         {
  if (size === "sme") return 0.07;
  const b = pos(base);
  return b <= 100 * EOK ? 0.1 : b <= 1000 * EOK ? 0.12 : 0.17;
}

                            
                 
                                     
                 
                                         
                   
                       
                  
                  
                   
                          
                         
                                
                                
                           
                           
                  
                                                   
                   
                             
                          
                   
                            
  

/** 결산 숫자로 법인세를 어림해요: 세무조정 → 각사업연도소득 → 과세표준 → 산출세액 → 최저한세 → 낼 세액. */
export function corpTax(x              ) {
  const ent = entertainmentLimit({ size: x.size, months: x.months, revenue: pos(x.revenue), relatedRevenue: x.relatedRevenue, spent: pos(x.entertainment), cultureSpent: x.cultureEntertainment, noProof: x.entertainmentNoProof });
  // 기부금은 장부에서 비용으로 처리했다고 보고, 소득에 다시 더한 뒤 한도만큼 빼요.
  const beforeDonation = Number(x.profit || 0) + pos(x.addBack) - pos(x.deduct) + ent.disallowed;
  const don = donationLimit({ incomeBeforeDonation: beforeDonation, losses: x.losses, size: x.size, special: x.specialDonation, general: x.generalDonation });
  const income = beforeDonation + don.specialExcess + don.generalExcess;
  const loss = lossDeduction(income, pos(x.losses), x.size);
  const base = Math.max(0, income - loss.used);
  const months = Math.min(12, Math.max(1, Math.round(x.months ?? 12)));
  // 사업연도가 1년 미만이면 1년으로 환산해 세율을 적용해요(법인세법 제55조 ①).
  const annual = months < 12 ? (base * 12) / months : base;
  const computed = floor10((corporateTax2026(annual, x.smallRealEstate) * months) / 12);
  const minRate = minimumTaxRate(base, x.size);
  const minTax = floor10(base * minRate);
  const credits = pos(x.credits);
  const afterCredits = Math.max(0, computed - credits);
  const creditsAllowed = afterCredits < minTax ? Math.max(0, computed - minTax) : credits;
  const determined = Math.max(0, computed - creditsAllowed - pos(x.creditsOutside));
  const due = floor10(determined - pos(x.prepaid));
  return {
    entertainment: ent,
    donation: don,
    income: floor10(income),
    loss,
    base: floor10(base),
    computed,
    minRate,
    minTax,
    creditsAllowed,
    creditsCut: credits - creditsAllowed,
    determined,
    local: floor10(determined * 0.1),
    due,
    interim: interimPrepay(determined, x.size),
  };
}

/** 다음 사업연도 중간예납(직전 세액 1/2 방식) 어림. */
export function interimPrepay(prevDetermined        , size          ) {
  const amount = floor10(pos(prevDetermined) / 2);
  const exempt = size === "sme" && amount < 50 * MAN;
  return { amount: exempt ? 0 : amount, exempt, rule: "사업연도 첫 6개월이 끝난 날부터 2개월 안(12월 결산이면 8월 31일)" };
}

export const CORP_TAX_NOTE = "결산 숫자로 법인세를 어림하는 계산이에요. 세무조정 항목은 회사마다 더 있고, 감면 요건은 따로 확인해야 해요. 신고는 홈택스에서 직접 하거나 세무 대리인에게 맡겨요.";
