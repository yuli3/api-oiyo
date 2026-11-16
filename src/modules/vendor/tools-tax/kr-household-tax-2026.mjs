// GENERATED from tools-oiyo src/lib/kr-household-tax-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 집안 세금 판단 2종 (2026-11-16, Gemini 공익 도구 인수 4차): 부양가족 기본공제 판정과 상장주식 대주주 양도소득세.
// 연말정산 공식은 kr-year-end-2026.ts의 settleYearEnd를 그대로 불러 "넣을 때와 뺄 때"를 비교해요.
// 화면 components/tools/welfare/, Claude 스킬·MCP는 이 파일을 복사해 써요(drift 테스트).
import { earnedIncomeDeduction, filingCredit, inheritanceGiftProgressiveTax, RATES, pensionBaseLimits } from "./kr-payroll-2026.mjs";
import { ADDITIONAL, CHILD_CREDIT, settleYearEnd } from "./kr-year-end-2026.mjs";

export const HOUSEHOLD_TAX_AS_OF = "2026-11-16";
const clamp0 = (n                    ) => (typeof n === "number" && Number.isFinite(n) && n > 0 ? n : 0);

// ───────────────────────── 부양가족 기본공제 판정 ─────────────────────────
// 소득세법 제50조(기본공제 대상: 연간 소득금액 100만 원 이하, 근로소득만 있으면 총급여 500만 원 이하),
// 제50조①3호(직계존속 60세 이상, 직계비속·입양자 20세 이하, 형제자매 20세 이하·60세 이상, 위탁아동 18세 미만,
// 기초생활수급자 나이 무관), 제50조③(장애인은 나이 무관), 제53조(생계를 같이 하는 부양가족),
// 제51조(경로우대 70세 이상 100만, 장애인 200만, 부녀자 50만, 한부모 100만), 제59조의2(자녀세액공제).
// 나이는 과세연도에서 출생연도를 뺀 값으로 봐요(그해 하루라도 요건에 맞으면 인정하는 규정과 같아요).

export const DEPENDENT_2026 = {
  taxYear: 2026,
  incomeMax: 1_000_000,
  wageOnlyMax: 5_000_000,
  parentAge: 60,
  childAge: 20,
  fosterUnder: 18,
  seniorAge: 70,
}         ;

                                                                                           
export const RELATION_LABEL                           = {
  spouse: "배우자",
  parent: "부모·조부모(배우자 쪽 포함)",
  child: "자녀(입양 포함)",
  grandchild: "손자녀",
  sibling: "형제자매",
  foster: "위탁아동",
};

                            
                 
                     
                    
                             
                
                                                                      
                       
                     
                                                              
                           
                            
                                             
                           
 

                                                                               
                                   
              
                          
                    
                                           
                    
                  
                    
                       
                                   
                                                                  
                 
 

export function dependentIncomeTest(d                                         ) {
  const wage = clamp0(d.wage);
  const other = clamp0(d.otherIncome);
  if (other === 0) return { wageOnly: true, value: wage, limit: DEPENDENT_2026.wageOnlyMax, pass: wage <= DEPENDENT_2026.wageOnlyMax };
  const earned = Math.max(0, wage - earnedIncomeDeduction(wage));
  const value = earned + other;
  return { wageOnly: false, value, limit: DEPENDENT_2026.incomeMax, pass: value <= DEPENDENT_2026.incomeMax };
}

function ageOk(d           , age        ) {
  if (d.relation === "spouse") return true;
  if (d.disabled || d.basicLivelihood) return true;
  if (d.relation === "parent") return age >= DEPENDENT_2026.parentAge;
  if (d.relation === "child" || d.relation === "grandchild") return age <= DEPENDENT_2026.childAge;
  if (d.relation === "sibling") return age <= DEPENDENT_2026.childAge || age >= DEPENDENT_2026.parentAge;
  return age < DEPENDENT_2026.fosterUnder;
}
const AGE_RULE                           = {
  spouse: "나이 제한 없음",
  parent: "60세 이상",
  child: "20세 이하",
  grandchild: "20세 이하",
  sibling: "20세 이하 또는 60세 이상",
  foster: "18세 미만",
};

export function judgeDependent(d           , taxYear         = DEPENDENT_2026.taxYear)                   {
  const age = taxYear - Math.round(d.birthYear);
  const inc = dependentIncomeTest(d);
  const incomeTest = { wageOnly: inc.wageOnly, value: inc.value, limit: inc.limit };
  const base = { age, senior: false, disabled: false, creditChild: false, deduction: 0, eligible: false, incomeTest };
  if (d.claimedByOther) return { ...base, status: "duplicate", reason: "한 사람은 한 명만 공제받을 수 있어요. 이미 다른 가족이 공제받고 있어요." };
  if (!ageOk(d, age)) return { ...base, status: "age", reason: `${RELATION_LABEL[d.relation]}는 ${AGE_RULE[d.relation]}이어야 해요(지금 ${age}세). 장애인이면 나이와 상관없어요.` };
  // 직계비속·입양자·배우자·직계존속은 따로 살아도 돼요. 형제자매·손자녀·위탁아동은 함께 살아야 해요(취학·요양 등 일시 퇴거는 인정).
  const needsTogether = d.relation === "sibling" || d.relation === "grandchild" || d.relation === "foster";
  if (needsTogether && d.livingTogether === false) return { ...base, status: "living", reason: `${RELATION_LABEL[d.relation]}는 주민등록상 함께 살아야 해요(학업·요양으로 잠시 떨어진 건 괜찮아요).` };
  if (!inc.pass) {
    const reason = inc.wageOnly
      ? `근로소득만 있으면 총급여가 500만 원 이하여야 해요(지금 ${Math.round(inc.value / 10_000).toLocaleString()}만 원).`
      : `소득금액 합계가 100만 원 이하여야 해요(지금 ${Math.round(inc.value / 10_000).toLocaleString()}만 원).`;
    return { ...base, status: "income", reason };
  }
  const senior = age >= DEPENDENT_2026.seniorAge;
  const disabled = !!d.disabled;
  const creditChild = isLineal(d.relation) && age >= CHILD_CREDIT.minAge2026 && age <= CHILD_CREDIT.maxAge && !(taxYear === 2026 && Math.round(d.birthYear) === 2017);
  const deduction = 1_500_000 + (senior ? ADDITIONAL.senior : 0) + (disabled ? ADDITIONAL.disabled : 0);
  const extras = [senior ? "경로우대 100만" : null, disabled ? "장애인 200만" : null].filter(Boolean);
  return {
    ...base,
    status: "ok",
    eligible: true,
    senior,
    disabled,
    creditChild,
    deduction,
    reason: `공제받을 수 있어요: 기본 150만${extras.length ? ` + ${extras.join(" + ")}` : ""}${creditChild ? ", 자녀세액공제 대상" : ""}.`,
  };
}

                                  
                            
                 
                         
                       
                         
                                                
                    
                      
                   
 

/** 4대보험 근로자 부담 추정(국민연금 상한 반영). 연말정산 차이 계산에만 써요. */
function socialInsurance(salary        ) {
  if (salary <= 0) return { pension: 0, healthEmployment: 0 };
  const { min, max } = pensionBaseLimits();
  const pension = Math.min(Math.max(salary / 12, min), max) * RATES.pensionEmployee * 12;
  const health = salary * RATES.healthEmployee;
  return { pension: Math.round(pension), healthEmployment: Math.round(health * (1 + RATES.longTermCareOfHealth) + salary * RATES.employmentEmployee) };
}

const isLineal = (r          ) => r === "child" || r === "grandchild" || r === "foster";

/** 부양가족 판정을 넣은 연말정산 결정세액(지방소득세 포함). 다른 공제는 없다고 보고 차이만 비교해요. */
export function dependentsYearEndTax(input                 )         {
  const taxYear = input.taxYear ?? DEPENDENT_2026.taxYear;
  const salary = clamp0(input.salary);
  const verdicts = input.people.map((p) => judgeDependent(p, taxYear));
  const ok = verdicts.filter((v) => v.eligible);
  const selfAge = input.selfBirthYear ? taxYear - input.selfBirthYear : 0;
  const singleParent = !input.married && input.people.some((p, i) => verdicts[i].eligible && isLineal(p.relation));
  const earned = Math.max(0, salary - earnedIncomeDeduction(salary));
  const womanHead = !singleParent && !!input.selfFemale && earned <= ADDITIONAL.womanIncomeMax && (!!input.married || ok.length > 0);
  const ins = socialInsurance(salary);
  return settleYearEnd({
    salary,
    persons: 1 + ok.length,
    additional: {
      seniors: (selfAge >= DEPENDENT_2026.seniorAge ? 1 : 0) + ok.filter((v) => v.senior).length,
      disabled: (input.selfDisabled ? 1 : 0) + ok.filter((v) => v.disabled).length,
      singleParent,
      womanHead,
    },
    creditChildren: ok.filter((v) => v.creditChild).length,
    nationalPension: ins.pension,
    healthEmployment: ins.healthEmployment,
  }).totalTax;
}

export function dependentsTax(input                 ) {
  const taxYear = input.taxYear ?? DEPENDENT_2026.taxYear;
  const verdicts = input.people.map((p) => judgeDependent(p, taxYear));
  const ok = verdicts.filter((v) => v.eligible);
  const taxWith = dependentsYearEndTax(input);
  const taxWithout = dependentsYearEndTax({ ...input, people: [] });
  // 한 사람씩 빼 보며 그 사람이 줄여 주는 세금을 봐요(그 사람이 마지막으로 들어갈 때의 효과).
  const perPerson = verdicts.map((v, i) => (v.eligible ? Math.max(0, dependentsYearEndTax({ ...input, people: input.people.filter((_, j) => j !== i) }) - taxWith) : 0));
  return {
    taxYear,
    verdicts,
    eligibleCount: ok.length,
    deductionTotal: ok.reduce((a, v) => a + v.deduction, 0),
    creditChildren: ok.filter((v) => v.creditChild).length,
    taxWithout,
    taxWith,
    saving: Math.max(0, taxWithout - taxWith),
    perPerson,
  };
}

/** 맞벌이: 같은 부양가족을 누가 공제받는 게 나은지. 각자 총급여만 받아 세금이 더 줄어드는 쪽을 알려 줘요. */
export function whoShouldClaim(a                                 , b                                 , people             ) {
  const gainA = dependentsTax({ ...a, people }).saving;
  const gainB = dependentsTax({ ...b, people }).saving;
  return { gainA, gainB, better: gainA >= gainB ? ("a"         ) : ("b"         ), diff: Math.abs(gainA - gainB) };
}

// ───────────────────────── 상장주식 대주주 양도소득세 ─────────────────────────
// 소득세법 시행령 제157조(대주주: 직전 사업연도 종료일 현재 지분율 코스피 1%·코스닥 2%·코넥스 4% 이상
// 또는 종목별 시가총액 50억 원 이상, 최대주주면 특수관계인 합산), 소득세법 제104조①11호(대주주 상장주식:
// 과세표준 3억 이하 20%, 초과 25%, 중소기업 외 법인 1년 미만 보유 30%), 제103조(양도소득 기본공제 연 250만, 주식 그룹 따로),
// 지방소득세 10%. 2025년 9월 정부가 대주주 기준을 10억으로 낮추려던 안은 철회돼 2026년도 50억이에요.
// 증권거래세는 매도 금액에 따로 붙어서 이 계산에는 넣지 않았어요.

export const MAJOR_2026 = {
  valueLine: 5_000_000_000,
  share: { kospi: 0.01, kosdaq: 0.02, konex: 0.04 },
  basicDeduction: 2_500_000,
  pivot: 300_000_000,
  low: 0.2,
  high: 0.25,
  shortNonSme: 0.3,
  localRate: 0.1,
}         ;
                                                        
export const MARKET_LABEL                              = { kospi: "코스피", kosdaq: "코스닥", konex: "코넥스" };

                                        
                      
                                                                     
                    
                             
                     
                                               
               
                  
                
                    
                        
                                          
                          
 

export function majorShareholderTax(input                       ) {
  const M = MAJOR_2026;
  const value = clamp0(input.heldValue);
  const share = clamp0(input.heldShare);
  const byValue = value >= M.valueLine;
  const byShare = share >= M.share[input.market];
  const isMajor = byValue || byShare;
  const gain = Math.max(0, Number.isFinite(input.gain) ? input.gain : 0);
  const deduction = input.deductionUsed ? 0 : Math.min(gain, M.basicDeduction);
  const taxBase = isMajor ? Math.max(0, gain - deduction) : 0;
  const flat = !input.sme && !input.overOneYear;
  const national = !isMajor
    ? 0
    : flat
      ? Math.floor(taxBase * M.shortNonSme)
      : Math.floor(Math.min(taxBase, M.pivot) * M.low + Math.max(0, taxBase - M.pivot) * M.high);
  const local = Math.floor(national * M.localRate);
  const total = national + local;
  // 대주주라면 낼 세금(지금 대주주가 아니어도 비교용)
  const ifMajorBase = Math.max(0, gain - deduction);
  const ifMajor = Math.floor((flat ? ifMajorBase * M.shortNonSme : Math.min(ifMajorBase, M.pivot) * M.low + Math.max(0, ifMajorBase - M.pivot) * M.high) * (1 + M.localRate));
  return {
    isMajor,
    byValue,
    byShare,
    shareLine: M.share[input.market],
    deduction: isMajor ? deduction : 0,
    taxBase,
    rateNote: flat ? "30%(중소기업 외, 1년 미만)" : taxBase > M.pivot ? "20%·25%(3억 초과분)" : "20%",
    national,
    local,
    total,
    effectiveRate: gain > 0 ? total / gain : 0,
    ifMajor,
    /** 연말 보유가 50억 미만이 되려면 줄여야 하는 금액(시가 기준, 지분율 요건은 별도) */
    cutToAvoid: Math.max(0, value - M.valueLine + 1),
  };
}

// ───────────────────────── 가족 사이 돈·집 거래 (Gemini 이전 B, 2026-11-16) ─────────────────────────
// 상속세 및 증여세법 제41조의4(금전 무상·저리 대출: 적정이자율 연 4.6%[시행규칙 제10조의5]로 계산한 이자와
// 실제 이자의 차이가 연 1천만 원 이상이면 그 차이를 증여, 기간이 없으면 1년, 1년 넘으면 해마다 새로 계산),
// 제37조①(부동산 무상사용: 부동산가액 × 연 2%[시행규칙 제10조②]를 5년치 연 10%로 할인해 합친 금액이
// 1억 원 이상이면 증여, 소유자와 함께 사는 주택은 제외), 제37조②(부동산 무상 담보: 차입금 × 4.6% − 낸 이자가
// 1천만 원 이상이면 증여), 제35조①(특수관계인 저가 양수: 시가 − 대가가 min(시가 30%, 3억) 이상이면 그 차액에서
// 기준금액을 뺀 만큼 증여), 소득세법 제101조①·시행령 제167조③(부당행위계산: 시가 − 거래가가 3억 이상이거나
// 시가 5% 이상이면 양도가액을 시가로 봐요). 증여세는 제53조 공제(성년 자녀 10년 5천만 원)와 신고세액공제 3%를 반영해요.

export const FAMILY_2026 = {
  fairRate: 0.046,
  loanThreshold: 10_000_000,
  useRate: 0.02,
  useYears: 5,
  discount: 0.1,
  useThreshold: 100_000_000,
  collateralThreshold: 10_000_000,
  lowPriceRate: 0.3,
  lowPriceCap: 300_000_000,
  transferRate: 0.05,
  transferCap: 300_000_000,
  /** 비영업대금 이익 원천징수 25% + 지방소득세 2.5% */
  lenderWithholding: 0.275,
  childDeduction: 50_000_000,
}         ;

/** 5년, 연 10% 할인 연금현가계수(상증법 시행령 제27조③) ≈ 3.7908 */
export const FREE_USE_FACTOR = Array.from({ length: FAMILY_2026.useYears }, (_, n) => 1 / (1 + FAMILY_2026.discount) ** (n + 1)).reduce((a, b) => a + b, 0);

/** 증여재산공제 남은 금액을 빼고 누진세율·신고세액공제 3%를 적용한 증여세 */
export function simpleGiftTax(gift        , deductionLeft         = FAMILY_2026.childDeduction) {
  const base = Math.max(0, clamp0(gift) - clamp0(deductionLeft));
  const raw = inheritanceGiftProgressiveTax(base);
  return Math.max(0, raw - filingCredit(raw));
}

                                  
                 
                    
                               
               
                                                             
                         
 

export function familyLoanGift(input                 ) {
  const F = FAMILY_2026;
  const principal = clamp0(input.principal);
  const rate = Math.min(F.fairRate, clamp0(input.rate));
  const fairInterest = Math.floor(principal * F.fairRate);
  const actualInterest = Math.floor(principal * clamp0(input.rate));
  const benefit = Math.max(0, fairInterest - actualInterest);
  const taxable = benefit >= F.loanThreshold;
  const gift = taxable ? benefit : 0;
  const giftTax = simpleGiftTax(gift, input.deductionLeft ?? F.childDeduction);
  // 이자가 0%여도 증여가 아닌 최대 원금(이익 1천만 원 미만)
  const zeroRateMaxPrincipal = Math.ceil(F.loanThreshold / F.fairRate) - 1;
  // 이 원금에서 증여가 되지 않는 가장 낮은 이자율(이 이율보다 조금이라도 높으면 안전)
  const safeRate = principal > 0 ? Math.max(0, F.fairRate - F.loanThreshold / principal) : 0;
  return {
    principal,
    fairInterest,
    actualInterest,
    benefit,
    taxable,
    gift,
    giftTax,
    /** 빌려준 사람이 받은 이자에 대해 내는 원천세(27.5%) */
    lenderTax: Math.floor(actualInterest * F.lenderWithholding),
    zeroRateMaxPrincipal,
    safeRate,
    capped: rate >= F.fairRate,
  };
}

                               
                                
                        
                                              
                       
                                    
                          
                         
                              
                         
 

export function freeUseGift(input              ) {
  const F = FAMILY_2026;
  const value = clamp0(input.propertyValue);
  const annual = Math.floor(value * F.useRate);
  const fiveYear = Math.floor(value * F.useRate * FREE_USE_FACTOR);
  const useTaxable = !input.coResiding && fiveYear >= F.useThreshold;
  const useGift = useTaxable ? fiveYear : 0;
  const loan = clamp0(input.collateralLoan);
  const collateralBenefit = Math.max(0, Math.floor(loan * F.fairRate) - clamp0(input.collateralInterest));
  const collateralTaxable = collateralBenefit >= F.collateralThreshold;
  const collateralGift = collateralTaxable ? collateralBenefit : 0;
  // 제43조: 같은 거래에 여러 규정이 걸리면 이익이 가장 큰 하나만 적용해요. 무상사용과 담보는 서로 다른 이익이라 각각 봐요.
  const left = input.deductionLeft ?? F.childDeduction;
  const useTax = simpleGiftTax(useGift, left);
  const collateralTax = simpleGiftTax(collateralGift, Math.max(0, left - useGift));
  return {
    value,
    annual,
    fiveYear,
    factor: FREE_USE_FACTOR,
    useTaxable,
    useGift,
    useTax,
    collateralBenefit,
    collateralTaxable,
    collateralGift,
    collateralTax,
    total: useTax + collateralTax,
    /** 무상사용 이익이 1억 원이 되는 집값(이보다 싸면 무상사용 증여 없음) */
    valueLine: Math.ceil(F.useThreshold / (F.useRate * FREE_USE_FACTOR)),
  };
}

                                    
                         
                      
                       
                
                         
 

export function lowPriceSale(input                   ) {
  const F = FAMILY_2026;
  const mv = clamp0(input.marketValue);
  const price = clamp0(input.price);
  const diff = Math.max(0, mv - price);
  const giftLine = Math.min(Math.floor(mv * F.lowPriceRate), F.lowPriceCap);
  const giftTaxable = mv > 0 && diff > 0 && diff >= giftLine;
  const gift = giftTaxable ? diff - giftLine : 0;
  const giftTax = simpleGiftTax(gift, input.deductionLeft ?? F.childDeduction);
  const transferLine = Math.min(Math.floor(mv * F.transferRate), F.transferCap);
  const sellerRecalc = mv > 0 && diff > 0 && diff >= transferLine;
  return {
    marketValue: mv,
    price,
    diff,
    giftLine,
    giftTaxable,
    gift,
    giftTax,
    transferLine,
    sellerRecalc,
    /** 판 사람 양도세를 다시 계산할 때 양도가액(시가) */
    sellerPrice: sellerRecalc ? mv : price,
    /** 이 값보다 비싸게 사면 사는 사람 증여세가 없어요 */
    noGiftAbove: mv - giftLine,
    /** 이 값보다 비싸게 팔면 파는 사람 양도세를 시가로 다시 계산하지 않아요 */
    noRecalcAbove: mv - transferLine,
  };
}

// ───────────────────────── 상가 임대료 인상 5% 상한 ─────────────────────────
// 상가건물 임대차보호법 제2조·시행령 제2조(환산보증금 = 보증금 + 월세 × 100, 서울 9억·과밀억제권역과 부산 6억9천만·
// 광역시 등 5억4천만·그 밖 3억7천만 원 이하만 증액 상한 적용), 제11조·시행령 제4조(증액은 청구 당시 차임·보증금의 5% 이하,
// 증액 뒤 1년 안에는 다시 못 올림), 제12조·시행령 제5조(보증금을 월세로 바꿀 때 연 12%와 기준금리 × 4.5 중 낮은 비율),
// 제10조의2(기준을 넘어도 계약갱신요구권 10년·대항력·권리금 보호는 적용, 5% 상한은 미적용).

export const COMMERCIAL_LEASE = {
  multiplier: 100,
  limit: { seoul: 900_000_000, overcrowded: 690_000_000, metro: 540_000_000, other: 370_000_000 },
  increaseCap: 0.05,
  minMonths: 12,
  conversionCap: 0.12,
  baseRateMultiple: 4.5,
  /** 2026-10 금통위 동결 기준금리(사용자가 바꿀 수 있어요) */
  baseRate: 0.03,
}         ;
                                                              
export const LEASE_REGION_LABEL                              = {
  seoul: "서울",
  overcrowded: "과밀억제권역(서울 밖)·부산",
  metro: "광역시·세종·파주·화성·안산·용인·김포·광주(경기)",
  other: "그 밖의 지역",
};

                                      
                      
                  
                      
                     
                         
                                   
                          
                       
                    
 

export function commercialRentCheck(input                     ) {
  const C = COMMERCIAL_LEASE;
  const deposit = clamp0(input.deposit);
  const rent = clamp0(input.monthlyRent);
  const newDeposit = clamp0(input.newDeposit);
  const newRent = clamp0(input.newMonthlyRent);
  const converted = deposit + rent * C.multiplier;
  const limit = C.limit[input.region];
  const covered = converted <= limit;
  const conversionRate = Math.min(C.conversionCap, clamp0(input.baseRate ?? C.baseRate) * C.baseRateMultiple);
  const maxDeposit = Math.floor(deposit * (1 + C.increaseCap));
  // 보증금을 줄이고 월세로 돌린 몫은 증액이 아니라 전환이라, 그만큼(전환율 상한) 월세 상한에 더해요.
  const convertedRent = Math.floor((Math.max(0, deposit - newDeposit) * conversionRate) / 12);
  const maxRent = Math.floor(rent * (1 + C.increaseCap)) + convertedRent;
  const depositOk = newDeposit <= maxDeposit;
  const rentOk = newRent <= maxRent;
  const tooSoon = clamp0(input.monthsSinceLast) < C.minMonths;
  const increased = newDeposit > deposit || newRent > rent;
  // 전환율로 보증금과 월세를 하나로 합쳐 본 실질 인상률(참고용)
  const asDeposit = (d        , r        ) => d + (conversionRate > 0 ? (r * 12) / conversionRate : 0);
  const before = asDeposit(deposit, rent);
  const combinedRate = before > 0 ? asDeposit(newDeposit, newRent) / before - 1 : 0;
  const verdict                                           = !covered ? "notCovered" : increased && tooSoon ? "tooSoon" : depositOk && rentOk ? "ok" : "over";
  return {
    converted,
    limit,
    covered,
    conversionRate,
    maxDeposit,
    maxRent,
    convertedRent,
    depositOk,
    rentOk,
    tooSoon,
    increased,
    combinedRate,
    verdict,
    /** 상한을 넘는 월세(달마다) */
    rentExcess: Math.max(0, newRent - maxRent),
    depositExcess: Math.max(0, newDeposit - maxDeposit),
  };
}
