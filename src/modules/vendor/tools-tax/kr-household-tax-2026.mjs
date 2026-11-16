// GENERATED from tools-oiyo src/lib/kr-household-tax-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 집안 세금 판단 2종 (2026-11-16, Gemini 공익 도구 인수 4차): 부양가족 기본공제 판정과 상장주식 대주주 양도소득세.
// 연말정산 공식은 kr-year-end-2026.ts의 settleYearEnd를 그대로 불러 "넣을 때와 뺄 때"를 비교해요.
// 화면 components/tools/welfare/, Claude 스킬·MCP는 이 파일을 복사해 써요(drift 테스트).
import { earnedIncomeDeduction, RATES, pensionBaseLimits } from "./kr-payroll-2026.mjs";
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
