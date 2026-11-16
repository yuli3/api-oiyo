// GENERATED from tools-oiyo src/lib/kr-household-tax-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 집안 세금 판단 2종 (2026-11-16, Gemini 공익 도구 인수 4차): 부양가족 기본공제 판정과 상장주식 대주주 양도소득세.
// 연말정산 공식은 kr-year-end-2026.ts의 settleYearEnd를 그대로 불러 "넣을 때와 뺄 때"를 비교해요.
// 화면 components/tools/welfare/, Claude 스킬·MCP는 이 파일을 복사해 써요(drift 테스트).
import { basicIncomeTax, earnedIncomeDeduction, filingCredit, inheritanceGiftProgressiveTax, INHERITANCE_GIFT_2026, spouseInheritanceDeduction, RATES, pensionBaseLimits } from "./kr-payroll-2026.mjs";
import { ADDITIONAL, CHILD_CREDIT, YOUTH_SME, settleYearEnd } from "./kr-year-end-2026.mjs";
import { BASIC_DEDUCTION, HIGH_PRICE_LINE, acquisitionTax, capitalGainsTax, longTermRateGeneral, longTermRateOneHouse,                 } from "./kr-real-estate-tax.mjs";

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

// ───────────────────────── 중소기업 취업 청년 소득세 감면 (Gemini 이전 B 2차) ─────────────────────────
// 조세특례제한법 제30조: 근로계약 체결일 현재 15~34세(병역 기간 최대 6년 빼고 계산) 청년이 중소기업에 취업하면
// 취업일부터 5년이 되는 날이 속하는 달까지 근로소득세의 90%를 감면(과세기간별 200만 원 한도).
// 60세 이상·장애인·경력단절자는 3년 70%. 2026년 세법개정안은 2027-01-01 이후 취업분부터 비수도권 감면 기간을 6~10년으로
// 늘리는 안이에요(국회 통과 전, 계산에는 넣지 않아요).

export const YOUTH_REDUCTION = { minAge: 15, maxAge: YOUTH_SME.maxAge, militaryMaxMonths: 72, years: 5, otherYears: 3, otherRate: 0.7 }         ;

                                
                       
                 
                       
                   
                         
                        
                                    
                          
                       
                
 

/** 4대보험 근로자 부담분 추정(국민연금 4.75%, 건강 3.595% × 장기요양 포함, 고용 0.9%) */
const insuranceEstimate = (salary        ) => ({
  nationalPension: Math.floor(salary * RATES.pensionEmployee),
  healthEmployment: Math.floor(salary * (RATES.healthEmployee * (1 + RATES.longTermCareOfHealth) + RATES.employmentEmployee)),
});

export function smeYouthReduction(input               ) {
  const Y = YOUTH_REDUCTION;
  const salary = clamp0(input.salary);
  const persons = Math.max(1, Math.floor(input.persons ?? 1));
  const military = Math.min(Y.militaryMaxMonths, clamp0(input.militaryMonths));
  const countedAge = Math.floor(clamp0(input.ageAtContract) - military / 12);
  const ageOk = countedAge >= Y.minAge && countedAge <= Y.maxAge;
  const base = { salary, persons, ...insuranceEstimate(salary) };
  const without = settleYearEnd(base);
  const withR = settleYearEnd({ ...base, youthSme: true });
  const national = ageOk ? Math.max(0, without.finalTax - withR.finalTax) : 0;
  const local = ageOk ? Math.max(0, without.localTax - withR.localTax) : 0;
  const m = /^(\d{4})-(\d{2})$/.exec(input.start ?? "");
  let endMonth = "";
  if (m) {
    const idx = Number(m[1]) * 12 + (Number(m[2]) - 1) + Y.years * 12;
    endMonth = `${Math.floor(idx / 12)}-${String((idx % 12) + 1).padStart(2, "0")}`;
  }
  return {
    countedAge,
    ageOk,
    taxWithout: without.finalTax + without.localTax,
    taxWith: ageOk ? withR.finalTax + withR.localTax : without.finalTax + without.localTax,
    national,
    local,
    yearly: national + local,
    capped: ageOk && withR.youthReduction >= YOUTH_SME.cap,
    /** 감면이 끝나는 달(취업일부터 5년이 되는 날이 속하는 달) */
    endMonth,
    /** 같은 급여가 이어진다고 볼 때 5년 합계(추정) */
    fiveYear: (national + local) * Y.years,
  };
}

// ───────────────────────── 노란우산공제 소득공제 ─────────────────────────
// 조세특례제한법 제86조의3: 소기업·소상공인 공제부금 납입액을 사업소득금액(법인 대표자는 총급여 8천만 원 이하일 때
// 근로소득금액)에서 공제. 한도 4천만 원 이하 600만, 6천만 이하 500만, 1억 이하 400만, 초과 200만(정부24 소득공제 안내 기준). 부동산임대업 소득금액은 빼고 봐요.
// 2026-07-01 납입분부터 연 납입 한도 1,800만 원(종전 분기 300만). 임의 해지하면 공제받은 원금·이자가 기타소득(16.5%)이에요.

export const YELLOW_UMBRELLA = {
  tiers: [
    { upTo: 40_000_000, limit: 6_000_000 },
    { upTo: 60_000_000, limit: 5_000_000 },
    { upTo: 100_000_000, limit: 4_000_000 },
    { upTo: Infinity, limit: 2_000_000 },
  ],
  ceoSalaryMax: 80_000_000,
  annualPayCap: 18_000_000,
  localRate: 0.1,
  surrenderRate: 0.165,
}         ;

                                      
                           
                                                 
                 
               
               
                                          
                           
 

export function yellowUmbrella(input                     ) {
  const Y = YELLOW_UMBRELLA;
  const income = clamp0(input.income);
  const ceo = input.kind === "ceo";
  const eligible = !ceo || income <= Y.ceoSalaryMax;
  const basisIncome = ceo ? Math.max(0, income - earnedIncomeDeduction(income)) : income;
  const limit = Y.tiers.find((t) => basisIncome <= t.upTo) .limit;
  const deduction = eligible ? Math.min(clamp0(input.paid), limit) : 0;
  const base = Math.max(0, basisIncome - clamp0(input.otherDeductions ?? 1_500_000));
  const before = basicIncomeTax(base);
  const after = basicIncomeTax(Math.max(0, base - deduction));
  const saved = Math.floor((before - after) * (1 + Y.localRate));
  return {
    eligible,
    basisIncome,
    limit,
    deduction,
    saved,
    /** 한도를 넘게 낸 돈(공제는 안 되지만 적립은 돼요) */
    overLimit: Math.max(0, clamp0(input.paid) - limit),
    marginalRate: deduction > 0 ? saved / deduction : 0,
    /** 한도까지 냈을 때 줄어드는 세금 */
    savedAtLimit: eligible ? Math.floor((before - basicIncomeTax(Math.max(0, base - limit))) * (1 + Y.localRate)) : 0,
  };
}

// ───────────────────────── 일반과세 vs 간이과세 ─────────────────────────
// 부가가치세법 제61조·시행령 제109조(간이과세: 직전 연도 공급대가 1억 400만 원 미만, 부동산임대·과세유흥은 4,800만 원 미만),
// 제63조(간이 납부세액 = 공급대가 × 업종별 부가가치율 × 10%, 매입 세금계산서 공급대가 × 0.5% 공제, 환급 없음),
// 제69조(공급대가 4,800만 원 미만 납부 면제), 제36조①(4,800만 원 이상 간이과세자는 세금계산서 발급 의무),
// 제46조(신용카드 등 매출 1.3%, 연 1천만 원 한도, 일반과세자는 개인·매출 10억 이하).
// 업종별 부가가치율: 소매·음식 15%, 제조·농림어업 20%, 숙박 25%, 건설·운수창고·정보통신·그 밖 서비스 30%,
// 금융보험·전문과학기술·사업시설관리·부동산 40%.

export const SIMPLIFIED_VAT = {
  threshold: 104_000_000,
  rentThreshold: 48_000_000,
  exemptBelow: 48_000_000,
  invoiceFrom: 48_000_000,
  purchaseCredit: 0.005,
  cardRate: 0.013,
  cardCap: 10_000_000,
  rates: { retail: 0.15, manufacturing: 0.2, lodging: 0.25, construction: 0.3, service: 0.3, professional: 0.4 },
}         ;
                                                          
export const VAT_SECTOR_LABEL                            = {
  retail: "소매·음식점",
  manufacturing: "제조·농림어업",
  lodging: "숙박",
  construction: "건설·운수·정보통신",
  service: "그 밖 서비스(미용·교육 등)",
  professional: "전문서비스·금융·부동산임대",
};

                               
                    
                           
                
                                   
                    
                              
                     
 

export function vatTypeCompare(input              ) {
  const S = SIMPLIFIED_VAT;
  const sales = clamp0(input.sales);
  const purchases = clamp0(input.purchases);
  const card = Math.min(S.cardCap, Math.floor(sales * Math.min(1, clamp0(input.cardShare)) * S.cardRate));
  const outVat = Math.floor((sales / 1.1) * 0.1);
  const inVat = Math.floor((purchases / 1.1) * 0.1);
  // 일반과세: 환급 가능(카드 공제는 납부세액까지만)
  const generalBefore = outVat - inVat;
  const general = generalBefore > 0 ? generalBefore - Math.min(card, generalBefore) : generalBefore;
  const rate = S.rates[input.sector];
  const exempt = sales < S.exemptBelow;
  const simpleRaw = Math.floor(sales * rate * 0.1) - Math.floor(purchases * S.purchaseCredit);
  const simple = exempt ? 0 : Math.max(0, simpleRaw - Math.min(card, Math.max(0, simpleRaw)));
  const limit = input.sector === "professional" ? S.rentThreshold : S.threshold;
  return {
    general,
    simple,
    saving: general - simple,
    better: simple < general ? ("simple"         ) : simple > general ? ("general"         ) : ("same"         ),
    simpleAllowed: sales < limit,
    limit,
    exempt,
    invoiceRequired: !exempt,
    rate,
    outVat,
    inVat,
    card,
    /** 일반과세는 매입이 많으면 환급받아요 */
    generalRefund: general < 0 ? -general : 0,
  };
}

// ───────────────────────── 업무용 승용차 비용 한도 (Gemini 이전 B 3차) ─────────────────────────
// 법인세법 제27조의2·소득세법 제33조의2, 시행령: 업무전용자동차보험 가입 전제. 업무사용비율은 운행기록부가 있으면
// 업무 거리 ÷ 총 거리, 없으면 1,500만 원 ÷ 총비용(1,500만 원 이하면 100%). 업무사용 감가상각비(5년 정액, 리스는 리스료에서
// 보험료·자동차세·수선비를 뺀 금액, 렌트는 렌트료의 70%)가 연 800만 원을 넘으면 넘는 몫은 이번 해 비용에서 빼고 다음 해로 넘겨요.
// 법인 중 부동산임대업 주업 등 특정법인은 500만·400만 원 기준이라 여기 넣지 않았어요.

export const BUSINESS_CAR = { noLogCap: 15_000_000, depreciationCap: 8_000_000, years: 5, rentDepShare: 0.7 }         ;

                                   
                                      
                                                     
                 
                                                              
                     
                   
                   
                             
                         
                                              
                        
 

export function businessCarExpense(input                  ) {
  const B = BUSINESS_CAR;
  const amount = clamp0(input.amount);
  const dep = input.ownership === "own" ? Math.floor(amount / B.years) : input.ownership === "rent" ? Math.floor(amount * B.rentDepShare) : amount;
  const leaseOther = input.ownership === "rent" ? amount - dep : 0;
  const total = dep + leaseOther + clamp0(input.otherCosts);
  const ratio = input.logbook ? Math.min(1, clamp0(input.businessShare)) : total > 0 ? Math.min(1, B.noLogCap / total) : 1;
  const businessCost = Math.floor(total * ratio);
  const businessDep = Math.floor(dep * ratio);
  const carriedOver = Math.max(0, businessDep - B.depreciationCap);
  const deductible = businessCost - carriedOver;
  const rate = Math.min(1, clamp0(input.marginalRate ?? 0.264));
  return {
    depreciation: dep,
    total,
    ratio,
    businessCost,
    businessDep,
    carriedOver,
    deductible,
    disallowed: total - deductible,
    /** 비용으로 인정된 만큼 줄어든 세금 */
    taxSaved: Math.floor(deductible * rate),
    /** 운행기록부를 쓰고 업무 비율이 100%라면 인정될 비용 */
    deductibleWithFullLog: total - Math.max(0, dep - B.depreciationCap),
  };
}

// ───────────────────────── 해외주식 직접 vs 국내상장 해외ETF ─────────────────────────
// 해외주식 직접 투자: 양도소득(소득세법 제94조①3호다), 연 250만 원 기본공제 뒤 22%(지방세 포함), 분리과세라 금융소득 종합과세와 무관.
// 국내 상장 해외 ETF: 매매차익이 배당소득(소득세법 제17조, 시행령 제26조의2)이라 15.4% 원천징수, 이자·배당과 합쳐 연 2천만 원을
// 넘으면 넘는 몫은 종합과세(제14조, 제62조 비교과세). ISA(조특법 제91조의18)는 이익 200만(서민형 400만) 비과세, 넘는 몫 9.9% 분리과세.

export const OVERSEAS_COMPARE = { deduction: 2_500_000, directRate: 0.22, etfRate: 0.154, comprehensiveLine: 20_000_000, isaFree: 2_000_000, isaFreeLow: 4_000_000, isaRate: 0.099 }         ;

                                       
                    
               
                        
                          
                                     
                        
                   
                         
 

export function overseasCompare(input                      ) {
  const O = OVERSEAS_COMPARE;
  const gain = clamp0(input.gain);
  const other = clamp0(input.otherFinancial);
  const direct = Math.floor(Math.max(0, gain - O.deduction) * O.directRate);
  const withheld = Math.floor(gain * O.etfRate);
  // 2천만 원을 넘는 몫(이번 ETF 이익 중)만 한계세율과 15.4% 차이만큼 더 내요(근사)
  const over = Math.max(0, Math.min(gain, other + gain - O.comprehensiveLine));
  const extra = Math.floor(over * Math.max(0, clamp0(input.marginalRate ?? 0.264) - O.etfRate));
  const etf = withheld + extra;
  const free = input.isaLowIncome ? O.isaFreeLow : O.isaFree;
  const isa = Math.floor(Math.max(0, gain - free) * O.isaRate);
  const options = [
    { id: "direct"         , tax: direct },
    { id: "etf"         , tax: etf },
    { id: "isa"         , tax: isa },
  ];
  const best = options.reduce((a, b) => (b.tax < a.tax ? b : a));
  return {
    direct,
    etf,
    etfExtra: extra,
    isa,
    best: best.id,
    comprehensive: over > 0,
    /** 직접 투자와 ETF 세금이 같아지는 이익(종합과세 전) */
    breakEven: Math.ceil((O.deduction * O.directRate) / (O.directRate - O.etfRate)),
  };
}

// ───────────────────────── 오피스텔 주택 수 (Gemini 이전 B 4차) ─────────────────────────
// 취득세: 지방세법 제13조의3·시행령 제28조의4. 2020-08-12 이후 취득하고 재산세를 주택으로 내는 오피스텔은 다음 집 취득세 중과의
// 주택 수에 들어가요. 오피스텔 자체 취득세는 주택이 아니라 4%(+농특세 0.2%, 지방교육세 0.4%) = 4.6%예요.
// 양도세·종부세: 공부상 용도가 아니라 실제 주거로 쓰는지로 봐요(소득세법 제88조 7호).
// 소형 신축 특례(2024-01-10 대책, 시행령 개정): 전용 60㎡ 이하, 취득가 수도권 6억·지방 3억 이하, 2024-01-10~2027-12-31
// 준공된 신축을 분양으로 처음 산 경우 취득세·양도세 중과·종부세 주택 수에서 빼요(1세대1주택 비과세 판단에는 들어가요).
// 청약: 오피스텔은 주택공급에 관한 규칙상 주택이 아니라 무주택 판단에 들어가지 않아요.

export const OFFICETEL = {
  acquisitionRate: 0.046,
  taxCountFrom: "2020-08-12",
  smallNewFrom: "2024-01-10",
  smallNewTo: "2027-12-31",
  smallArea: 60,
  smallCapMetro: 600_000_000,
  smallCapOther: 300_000_000,
}         ;

                                 
                
                       
                   
                                      
                          
                                                    
                               
                 
                 
                                                         
                        
                            
                      
                            
                         
                          
 

export function officetelHouseCount(input                ) {
  const O = OFFICETEL;
  const price = clamp0(input.price);
  const others = Math.max(0, Math.floor(clamp0(input.otherHouses)));
  const acquired = /^\d{4}-\d{2}-\d{2}$/.test(input.acquired) ? input.acquired : "2026-01-01";
  const taxAsHouse = input.propertyTaxAsHouse ?? input.residentialUse;
  const smallNew =
    input.firstSaleNew && clamp0(input.areaM2) <= O.smallArea && price <= (input.metro ? O.smallCapMetro : O.smallCapOther) &&
    acquired >= O.smallNewFrom && acquired <= O.smallNewTo;
  const acquisitionCount = acquired >= O.taxCountFrom && taxAsHouse && !smallNew;
  const heavyCount = input.residentialUse && !smallNew;
  const exemptCount = input.residentialUse;
  const officetelTax = Math.floor((price * O.acquisitionRate) / 10) * 10;
  const next = clamp0(input.nextHomePrice);
  const nextTax = (houses        ) =>
    acquisitionTax({ price: next, houses: Math.min(4, Math.max(1, houses))              , regulated: !!input.nextRegulated, temporaryTwo: false, over85: false });
  const withCount = nextTax(others + 1 + (acquisitionCount ? 1 : 0));
  const withoutCount = nextTax(others + 1);
  return {
    officetelTax,
    smallNew,
    /** 다음 집 취득세 중과 판단 주택 수에 들어가요 */
    acquisitionCount,
    /** 양도세 중과·종부세 주택 수에 들어가요 */
    heavyCount,
    /** 1세대1주택 비과세 판단에 들어가요 */
    exemptCount,
    /** 청약 무주택 판단(오피스텔은 항상 주택 아님) */
    subscriptionCount: false,
    nextHouses: Math.min(4, others + 1 + (acquisitionCount ? 1 : 0)),
    nextTax: withCount.total,
    nextTaxWithout: withoutCount.total,
    nextExtra: Math.max(0, withCount.total - withoutCount.total),
    nextRate: withCount.rate,
  };
}

// ───────────────────────── 재건축·재개발 입주권 vs 분양권 양도세 ─────────────────────────
// 소득세법 제104조①: 주택·조합원입주권은 1년 미만 70%, 2년 미만 60%, 2년 이상 기본세율. 분양권은 1년 미만 70%, 그 뒤 60%(2021-06-01 이후).
// 제95조②·시행령 제166조: 원조합원 입주권은 기존 집 취득일~관리처분계획인가일 차익에만 장기보유특별공제, 승계조합원·분양권은 없음.
// 제89조①4호: 관리처분계획인가일에 기존 집이 1세대1주택 비과세 요건(2년 보유 등)을 채웠고 다른 집이 없으면 입주권도 비과세(12억 초과분 과세).
// 기본공제 250만 원(제103조), 지방소득세 10%.

                                     
                             
                                
               
                                                     
                    
                                     
                     
                                            
                           
                                  
                           
                              
                           
                     
                     
 

function rightTax(kind                      , i                    ) {
  const gain = clamp0(i.gain);
  const hold = clamp0(i.holdYears);
  const original = kind === "ticket" && !!i.original;
  const exempt = kind === "ticket" && original && !!i.oneHouseExempt;
  const sale = clamp0(i.salePrice);
  if (exempt && sale <= HIGH_PRICE_LINE) return { exempt: true, taxable: 0, longTerm: 0, base: 0, rateLabel: "비과세", tax: 0, local: 0, total: 0 };
  const taxable = exempt && sale > 0 ? Math.floor((gain * (sale - HIGH_PRICE_LINE)) / sale) : gain;
  const pre = original ? Math.min(taxable, Math.floor(clamp0(i.preApprovalGain) * (gain > 0 ? taxable / gain : 0))) : 0;
  const years = clamp0(i.yearsToApproval);
  const ltRate = !original ? 0 : exempt && Math.floor(clamp0(i.liveYears)) >= 2 ? longTermRateOneHouse(years, clamp0(i.liveYears)) : longTermRateGeneral(years);
  const longTerm = Math.floor(pre * ltRate);
  const base = Math.max(0, taxable - longTerm - BASIC_DEDUCTION);
  const shortRate = kind === "presale" ? (hold < 1 ? 0.7 : 0.6) : hold < 1 ? 0.7 : hold < 2 ? 0.6 : 0;
  const raw = shortRate ? base * shortRate : basicIncomeTax(base);
  const tax = Math.floor(raw / 10) * 10;
  const local = Math.floor(tax * 0.1 / 10) * 10;
  return { exempt: false, taxable, longTerm, base, rateLabel: shortRate ? `${shortRate * 100}%` : "기본세율 6~45%", tax, local, total: tax + local };
}

export function ticketPresaleTax(input                    ) {
  const ticket = rightTax("ticket", input);
  const presale = rightTax("presale", input);
  const chosen = input.kind === "ticket" ? ticket : presale;
  return { ...chosen, ticket: ticket.total, presale: presale.total, gap: presale.total - ticket.total };
}

// ───────────────────────── 상속주택 감정평가 vs 공시가격 ─────────────────────────
// 상증법 제60조(시가 원칙, 평가기간 상속개시일 전후 6개월 안 매매·감정·수용가), 제61조(시가가 없으면 기준시가·공시가격),
// 시행령 제49조(감정가는 2곳 평균, 기준시가 10억 이하면 1곳), 제20조의3(감정평가수수료 500만 원까지 공제).
// 상속받은 집을 팔 때 취득가액은 상속 때 신고한 평가액이에요(소득세법 시행령 제163조⑨). 그래서 공시가로 낮게 신고하면
// 상속세는 줄지만 나중 양도세가 늘어요. 상속세가 0인 구간(일괄 5억·배우자 5억 공제 안)이면 감정평가가 거의 늘 유리해요.
// 양도세는 다른 집이 있어 비과세가 안 되고 조정지역 중과도 없는 경우로 봐요. 상속받은 자산의 단기세율 보유기간은 피상속인 취득일부터라
// 단기세율은 쓰지 않고, 장기보유특별공제는 상속개시일부터 센 연수로 계산해요.

export const INHERITED_VALUATION = { feeCap: 5_000_000 }         ;

                                          
                   
                   
              
                    
                                  
                      
                  
                                        
                        
                
                    
                      
                     
                
                        
 

export function inheritedValuation(input                         ) {
  const other = clamp0(input.otherEstate);
  const fee = clamp0(input.appraisalFee ?? 2_000_000);
  const deductions = INHERITANCE_GIFT_2026.inheritanceLumpSum + (input.spouse ? spouseInheritanceDeduction(clamp0(input.spouseAmount)) : 0);
  const sale = clamp0(input.salePrice);
  const years = clamp0(input.yearsAfter);
  const scenario = (value        , feeDeduction        , cost        ) => {
    const base = Math.max(0, value + other - deductions - feeDeduction);
    const raw = inheritanceGiftProgressiveTax(base);
    const inheritance = raw - filingCredit(raw);
    const gains = capitalGainsTax({ kind: "house", sale, purchase: value, expenses: 0, holdYears: Math.max(2, years), liveYears: 0, houses: 2, exemptEligible: false, regulated: false });
    return { value, base, inheritance, transfer: gains.total, fee: cost, total: inheritance + gains.total + cost };
  };
  const official = scenario(clamp0(input.official), 0, 0);
  const appraisal = scenario(clamp0(input.appraisal), Math.min(fee, INHERITED_VALUATION.feeCap), fee);
  return { deductions, official, appraisal, better: appraisal.total < official.total ? ("appraisal"         ) : ("official"         ), saving: Math.abs(official.total - appraisal.total) };
}

// ───────────────────────── 상속·증여 신고기한 ─────────────────────────
// 상증법 제67조(상속세: 상속개시일이 속한 달의 말일부터 6개월, 피상속인·상속인 전원 국외 주소면 9개월), 제68조(증여세: 증여일이 속한 달의
// 말일부터 3개월), 제69조(기한 안 신고 3% 공제), 제4조④(금전 외 증여재산을 신고기한 안에 돌려주면 처음부터 증여 아님, 그 뒤 3개월 안이면
// 돌려준 것만 비과세). 지방세법 제20조①(상속 취득세 6개월·국외 9개월, 증여 취득세 3개월). 소득세법 제74조(피상속인 종합소득세 6개월).
// 민법 제1019조(상속포기·한정승인: 상속을 안 날부터 3개월), 가족관계의 등록 등에 관한 법률 제84조·제85조(사망신고 1개월).
// 국세기본법 제47조의2(무신고 가산세 20%), 제48조②2호(기한 뒤 1개월 안 신고 50%, 3개월 30%, 6개월 20% 감면), 제47조의4(납부지연 하루 0.022%).

export const FILING_PENALTY = { noFiling: 0.2, daily: 0.00022, credit: 0.03 }         ;

const monthEndPlus = (iso        , months        ) => {
  const [y, m] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m + months, 0)).toISOString().slice(0, 10);
};
const addMonths = (iso        , months        ) => {
  const [y, m, d] = iso.split("-").map(Number);
  const last = new Date(Date.UTC(y, m - 1 + months + 1, 0)).getUTCDate();
  return new Date(Date.UTC(y, m - 1 + months, Math.min(d, last))).toISOString().slice(0, 10);
};

                                      
                               
                                     
               
                                 
                   
                
               
                              
                    
 

                             
             
                
              
               
 

export function filingDeadlines(input                     ) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(input.date) ? input.date : "2026-01-01";
  const steps               = [];
  let filingDue        ;
  if (input.kind === "inheritance") {
    const m = input.abroad ? 9 : 6;
    filingDue = monthEndPlus(date, m);
    steps.push(
      { id: "death", label: "사망신고(사망을 안 날부터 1개월)", due: addMonths(date, 1), cite: "가족관계등록법 제84조" },
      { id: "renounce", label: "상속포기·한정승인(상속을 안 날부터 3개월)", due: addMonths(date, 3), cite: "민법 제1019조" },
      { id: "income", label: "돌아가신 분 종합소득세 신고", due: monthEndPlus(date, 6), cite: "소득세법 제74조" },
      { id: "acq", label: "상속 부동산 취득세 신고·납부", due: monthEndPlus(date, m), cite: "지방세법 제20조①" },
      { id: "file", label: "상속세 신고·납부(3% 공제)", due: filingDue, cite: "상증법 제67조·제69조" },
    );
  } else {
    filingDue = monthEndPlus(date, 3);
    steps.push(
      { id: "acq", label: "증여 부동산 취득세 신고·납부", due: monthEndPlus(date, 3), cite: "지방세법 제20조①" },
      { id: "file", label: "증여세 신고·납부(3% 공제), 이 안에 돌려주면 증여 아님", due: filingDue, cite: "상증법 제68조·제4조④" },
      { id: "return", label: "돌려주면 돌려준 몫만 비과세(금전 제외)", due: monthEndPlus(filingDue, 3), cite: "상증법 제4조④" },
    );
  }
  steps.sort((a, b) => a.due.localeCompare(b.due));
  const tax = clamp0(input.tax);
  const late = Math.max(0, Math.floor(clamp0(input.lateDays)));
  const P = FILING_PENALTY;
  const credit = Math.floor(tax * P.credit);
  const relief = late === 0 ? 1 : late <= 30 ? 0.5 : late <= 90 ? 0.3 : late <= 180 ? 0.2 : 0;
  const noFiling = late === 0 ? 0 : Math.floor(tax * P.noFiling * (1 - relief));
  const latePayment = Math.floor(tax * P.daily * late);
  const onTime = tax - credit;
  const pay = late === 0 ? onTime : tax + noFiling + latePayment;
  return { steps, filingDue, credit, relief: late === 0 ? 0 : relief, noFiling, latePayment, onTime, pay, extra: pay - onTime };
}
