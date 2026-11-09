// GENERATED from tools-oiyo src/lib/kr-payroll-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// Korean payroll rules for 2026, shared by the weekly holiday pay calculator and the
// daily worker insurance checker. Values were checked on 2026-10-12; see
// company-brain projects/oiyo-ecosystem/tax-practice-toolkit-plan-2026-10-12.md for sources.
// When a year changes, update RATES and the tests, not the formulas.

import { AMOUNT, parseKrAmount } from "./kr-vat-2026.mjs";

export const RATES_AS_OF = "2026-10-12";

export const RATES = {
  minimumWage: 10_320, // 2026 hourly minimum wage (2027: 10,700)
  pensionEmployee: 0.0475, // 국민연금 9.5% total
  healthEmployee: 0.03595, // 건강보험 7.19% total
  longTermCareOfHealth: 0.1314, // 장기요양 = 건강보험료 × 13.14%
  employmentEmployee: 0.009, // 고용보험 실업급여 근로자분
  pensionIncomeThreshold: 2_200_000, // 월 소득 220만 원 이상이면 일수와 관계없이 국민연금 가입
  dailyWageDeduction: 150_000, // 일용근로소득 1일 근로소득공제
  dailyWageTaxRate: 0.06,
  dailyWageTaxCredit: 0.55,
}         ;

/** Average weeks per month used for monthly conversion (365 ÷ 7 ÷ 12). */
export const WEEKS_PER_MONTH = 365 / 7 / 12;
// WHY 2026-10-24: match the deployed API comparison model without changing other payroll consumers.
export const WEEKLY_COMPARISON_WEEKS = 4.345;

                              
                     
                      
                      
                              
                                   
 

                               
                      
                           
                                                                         
                       
                     
                    
                     
                            
 

/** 주휴수당: 주 소정근로 15시간 이상이면 (주 소정시간 ÷ 40) × 8시간분, 40시간을 넘으면 8시간분. */
export function weeklyHolidayPay({ hourlyWage, daysPerWeek, hoursPerDay, employedWholeWeek, completedScheduledDays }             )               {
  if (![hourlyWage, daysPerWeek, hoursPerDay].every(Number.isFinite) || hourlyWage <= 0 || daysPerWeek <= 0 || daysPerWeek > 7 || hoursPerDay <= 0 || hoursPerDay > 24) throw new RangeError("Invalid weekly pay input");
  if ([employedWholeWeek, completedScheduledDays].some((v) => v !== undefined && typeof v !== "boolean")) throw new TypeError("Eligibility must be boolean or omitted");
  const weeklyHours = daysPerWeek * hoursPerDay;
  const ineligible = weeklyHours < 15 || employedWholeWeek === false || completedScheduledDays === false;
  const eligible = ineligible ? false : employedWholeWeek === true && completedScheduledDays === true ? true : null;
  const holidayHours = !ineligible ? (Math.min(weeklyHours, 40) / 40) * 8 : 0;
  const holidayPay = Math.floor(holidayHours * hourlyWage);
  const weeklyPay = Math.floor(weeklyHours * hourlyWage) + holidayPay;
  const monthlyPay = Math.floor(weeklyPay * WEEKLY_COMPARISON_WEEKS);
  // WHY 2026-10-24: finite inputs can still overflow during multiplication; never display infinity as wages.
  if (![weeklyHours, holidayHours, holidayPay, weeklyPay, monthlyPay].every(Number.isFinite)) throw new RangeError("Weekly pay exceeds supported range");
  return {
    weeklyHours,
    eligible,
    eligibilityStatus: eligible === null ? "unknown" : eligible ? "self_confirmed" : "conditions_not_met",
    holidayHours,
    holidayPay,
    weeklyPay,
    monthlyPay,
    belowMinimumWage: hourlyWage < RATES.minimumWage,
  };
}

                                                                           

                             
                     
                      
                     
                                         
                        
 

                                   
                  
                   
                 
                            
 

// Round to 1e-6 first: 700,000 × 0.009 is 6,299.999… in floating point and must stay 6,300.
export const floor10 = (won        ) => Math.floor(Math.round(won * 1e6) / 1e7) * 10;

/**
 * 일용·단시간 근로자의 4대보험 가입 여부 참고 판정.
 * 국민연금: 1개월 이상 + (월 8일 이상 또는 월 60시간 이상), 또는 월 소득 220만 원 이상.
 * 건강보험: 1개월 이상 + (월 8일 이상 또는 월 60시간 이상).
 * 고용·산재: 일용근로자는 하루만 일해도 적용(고용보험 65세 이후 신규 등 예외는 다루지 않음).
 * 보험료는 지급액 × 근로자 요율의 단순 추정이며 기준소득월액 상·하한은 반영하지 않는다.
 */
export function dailyWorkerInsurance({ daysWorked, hoursWorked, monthlyPay, overOneMonth }            )                     {
  const meetsDaysOrHours = daysWorked >= 8 || hoursWorked >= 60;
  const pensionApplies = (overOneMonth && meetsDaysOrHours) || monthlyPay >= RATES.pensionIncomeThreshold;
  const healthApplies = overOneMonth && meetsDaysOrHours;
  const why = overOneMonth
    ? meetsDaysOrHours
      ? `1개월 이상 근로하고 월 ${daysWorked}일·${hoursWorked}시간으로 8일 또는 60시간 기준을 넘습니다.`
      : `월 ${daysWorked}일·${hoursWorked}시간으로 8일·60시간 기준에 모두 못 미칩니다.`
    : "근로 기간이 1개월 미만이라 일수·시간 기준이 적용되지 않습니다.";
  const health = healthApplies ? floor10(monthlyPay * RATES.healthEmployee) : 0;
  return [
    {
      id: "pension",
      applies: pensionApplies,
      reason: pensionApplies && !(overOneMonth && meetsDaysOrHours) ? "월 소득이 220만 원 이상이라 일수와 관계없이 가입 대상입니다." : why,
      employeeDeduction: pensionApplies ? floor10(monthlyPay * RATES.pensionEmployee) : 0,
    },
    {
      id: "health",
      applies: healthApplies,
      reason: why,
      employeeDeduction: health + (healthApplies ? floor10(health * RATES.longTermCareOfHealth) : 0),
    },
    {
      id: "employment",
      applies: true,
      reason: "일용근로자는 하루만 일해도 고용보험이 적용됩니다.",
      employeeDeduction: floor10(monthlyPay * RATES.employmentEmployee),
    },
    {
      id: "accident",
      applies: true,
      reason: "산재보험은 모든 근로자에게 적용되고 보험료는 사업주가 냅니다.",
      employeeDeduction: 0,
    },
  ];
}

/** 일용근로소득 원천징수(1일분): (일당 − 15만 원) × 6% × (1 − 55%), 1천 원 미만은 소액부징수. 지방소득세는 10%. */
export function dailyWageTax(dailyWage        )                                          {
  const raw = Math.max(0, dailyWage - RATES.dailyWageDeduction) * RATES.dailyWageTaxRate * (1 - RATES.dailyWageTaxCredit);
  const incomeTax = floor10(raw);
  if (incomeTax < 1_000) return { incomeTax: 0, localTax: 0 };
  return { incomeTax, localTax: Math.floor(incomeTax / 100) * 10 };
}

                              
                                
                   
                                     
                       
                                      
                        
                            
                        
                         
                                                           
 

                               
                        
                     
                   
                     
                   
                 
               
                
 

/**
 * 퇴사월 건강보험 정산(근로자 부담분). 보수월액 = 보수총액 ÷ 근무 월수,
 * 월 보험료는 10원 미만 버림, 장기요양은 건강보험료 × 비율. 정산액 = (낼 보험료 − 낸 보험료) × 부과 월수.
 * 양수면 마지막 급여에서 더 떼고, 음수면 돌려준다. 사업주도 같은 금액을 정산한다.
 */
export function leaverHealthSettlement({ totalPay, monthsWorked, monthsCharged, noticeMonthly, rates }             )               {
  const health = rates?.health ?? RATES.healthEmployee;
  const careRatio = rates?.longTermCareOfHealth ?? RATES.longTermCareOfHealth;
  const actualMonthly = Math.floor(totalPay / monthsWorked);
  const perMonth = (monthly        ) => {
    const h = floor10(monthly * health);
    return { h, c: floor10(h * careRatio) };
  };
  const owed = perMonth(actualMonthly);
  const paid = perMonth(noticeMonthly);
  const result = {
    actualMonthly,
    owedHealth: owed.h * monthsCharged,
    owedCare: owed.c * monthsCharged,
    paidHealth: paid.h * monthsCharged,
    paidCare: paid.c * monthsCharged,
  };
  const h = result.owedHealth - result.paidHealth;
  const c = result.owedCare - result.paidCare;
  return { ...result, health: h, care: c, total: h + c };
}

                               
                    
                        
                         
                         
 

/** "올해 총급여 3000만원 6개월 근무 기준 보수월액 450만원 부과 5개월" */
export function parseLeaverText(text        )               {
  const t = text.replace(/\s+/g, " ");
  const out               = {};
  const amount = (re        ) => {
    const raw = t.match(re)?.[1];
    const value = raw === undefined ? null : parseKrAmount(raw);
    return value === null ? undefined : value;
  };
  out.totalPay = amount(new RegExp(`(?:총\\s*급여|총\\s*보수|보수\\s*총액|받은\\s*급여|급여\\s*총액)\\s*${AMOUNT}`));
  out.noticeMonthly = amount(new RegExp(`(?:기준\\s*(?:보수월액|보수|금액|액)?|고지\\s*(?:기준)?\\s*(?:보수월액)?)\\s*${AMOUNT}`));
  const worked = t.match(/(\d+)\s*(?:개월|달)\s*(?:근무|일함|일했)/)?.[1] ?? t.match(/근무\s*(\d+)\s*(?:개월|달)/)?.[1];
  if (worked) out.monthsWorked = Number(worked);
  const charged = t.match(/(?:부과|산정|고지)\s*(\d+)\s*(?:개월|달)/)?.[1] ?? t.match(/(\d+)\s*(?:개월|달)\s*(?:부과|고지)/)?.[1];
  if (charged) out.monthsCharged = Number(charged);
  for (const key of Object.keys(out)                          ) if (out[key] === undefined) delete out[key];
  return out;
}

                             
                      
                       
                       
                        
                         
                      
                     
 

/** "1만 320", "10,320", "220만" 같은 금액을 원 단위 숫자로 읽는다. */
export function parseWon(text        )                {
  const s = text.replace(/[,\s원]/g, "");
  const m = s.match(/^(?:(\d+(?:\.\d+)?)만)?(\d+)?$/);
  if (!m || (!m[1] && !m[2])) return null;
  return Math.round((m[1] ? Number(m[1]) * 10_000 : 0) + (m[2] ? Number(m[2]) : 0));
}

const NUM = String.raw`(\d+(?:\.\d+)?)`;
const WON = String.raw`(\d[\d,]*(?:\.\d+)?\s*만?\s*[\d,]*)\s*원?`;

/**
 * 한 줄 설명("주 5일 하루 4시간 시급 10320원", "이번 달 7일 56시간 일당 12만원")에서 값을 뽑는다.
 * 브라우저 안 규칙 파서이며, 못 읽은 값은 비워 두고 폼에서 채우게 한다.
 */
export function parseWorkText(text        )             {
  const t = text.replace(/\s+/g, " ");
  const out             = {};
  const pick = (re        ) => t.match(re)?.[1];
  const won = (re        ) => {
    const raw = pick(re);
    const value = raw === undefined ? null : parseWon(raw);
    return value === null ? undefined : value;
  };
  out.hourlyWage = won(new RegExp(`시급\\s*${WON}`));
  out.dailyWage = won(new RegExp(`일당\\s*${WON}`));
  out.monthlyPay = won(new RegExp(`(?:월급|월\\s*지급액|월\\s*급여|한\\s*달\\s*급여)\\s*${WON}`));
  const dpw = pick(new RegExp(`주\\s*${NUM}\\s*일`));
  if (dpw) out.daysPerWeek = Number(dpw);
  const hpd = pick(new RegExp(`(?:하루에?|1일)\\s*${NUM}\\s*시간`));
  if (hpd) out.hoursPerDay = Number(hpd);
  const dpm = pick(new RegExp(`(?:월|한\\s*달|이번\\s*달)\\s*${NUM}\\s*일`));
  if (dpm) out.daysPerMonth = Number(dpm);
  const hpm = pick(new RegExp(`(?:월|한\\s*달|이번\\s*달)\\s*(?:\\d+\\s*일\\s*)?${NUM}\\s*시간`));
  if (hpm) out.hoursPerMonth = Number(hpm);
  for (const key of Object.keys(out)                        ) if (out[key] === undefined) delete out[key];
  return out;
}

// ---------------------------------------------------------------------------
// 근로소득 연간 세액 추정용 규칙(2026년 귀속). 확인일 2026-10-17.
// 출처: 국세청 근로소득공제·과세표준 안내(nts.go.kr cntntsId=7871, 7873),
// 근로소득세액공제 안내(cntntsId=7875), 소득세법 제47조·제55조·제59조.
// 국민연금 기준소득월액 상·하한: 보건복지부 2026-07-01 적용 고시(보도자료 list_no=1488572).
// 이 값들은 간이세액표가 아니다. 간이세액표 대조 전에는 화면에서 '추정'으로 표시한다.
// ---------------------------------------------------------------------------

export const PAYROLL_TAX_AS_OF = "2026-10-17";

/** 국민연금 기준소득월액 상·하한. 2026-07-01부터 2027-06-30까지 41만~659만 원. */
export const PENSION_BASE_LIMITS = [
  { from: "2025-07-01", min: 400_000, max: 6_370_000 },
  { from: "2026-07-01", min: 410_000, max: 6_590_000 },
]         ;

export function pensionBaseLimits(onDate         = PAYROLL_TAX_AS_OF)                               {
  let current                               = PENSION_BASE_LIMITS[0];
  for (const row of PENSION_BASE_LIMITS) if (onDate >= row.from) current = row;
  return { min: current.min, max: current.max };
}

/** 종합소득세 기본세율(소득세법 제55조, 2023년 귀속부터 2026년 귀속까지 동일). upTo는 과세표준 상한(원). */
export const INCOME_TAX_BRACKETS = [
  { upTo: 14_000_000, rate: 0.06 },
  { upTo: 50_000_000, rate: 0.15 },
  { upTo: 88_000_000, rate: 0.24 },
  { upTo: 150_000_000, rate: 0.35 },
  { upTo: 300_000_000, rate: 0.38 },
  { upTo: 500_000_000, rate: 0.4 },
  { upTo: 1_000_000_000, rate: 0.42 },
  { upTo: Infinity, rate: 0.45 },
]         ;

/** 과세표준(연, 원)에 기본세율을 구간별로 누적 적용한 산출세액. */
export function basicIncomeTax(taxBase        )         {
  let tax = 0;
  let lower = 0;
  for (const { upTo, rate } of INCOME_TAX_BRACKETS) {
    if (taxBase <= lower) break;
    tax += (Math.min(taxBase, upTo) - lower) * rate;
    lower = upTo;
  }
  return Math.round(tax);
}

/** 근로소득공제(소득세법 제47조). totalPay는 비과세를 뺀 연간 총급여액. 한도 2,000만 원. */
export function earnedIncomeDeduction(totalPay        )         {
  const p = Math.max(0, totalPay);
  let d        ;
  if (p <= 5_000_000) d = p * 0.7;
  else if (p <= 15_000_000) d = 3_500_000 + (p - 5_000_000) * 0.4;
  else if (p <= 45_000_000) d = 7_500_000 + (p - 15_000_000) * 0.15;
  else if (p <= 100_000_000) d = 12_000_000 + (p - 45_000_000) * 0.05;
  else d = 14_750_000 + (p - 100_000_000) * 0.02;
  return Math.round(Math.min(d, 20_000_000));
}

/** 근로소득세액공제(소득세법 제59조): 산출세액 130만 원 이하 55%, 초과분 30%. 총급여별 한도 20만~74만 원. */
export function earnedIncomeTaxCredit(calculatedTax        , totalPay        )         {
  const t = Math.max(0, calculatedTax);
  const raw = t <= 1_300_000 ? t * 0.55 : 715_000 + (t - 1_300_000) * 0.3;
  let limit        ;
  if (totalPay <= 33_000_000) limit = 740_000;
  else if (totalPay <= 70_000_000) limit = Math.max(660_000, 740_000 - (totalPay - 33_000_000) * 0.008);
  else if (totalPay <= 120_000_000) limit = Math.max(500_000, 660_000 - (totalPay - 70_000_000) / 2);
  else limit = Math.max(200_000, 500_000 - (totalPay - 120_000_000) / 2);
  return Math.round(Math.min(raw, limit));
}

/** 기본공제 1명당 150만 원(본인 포함). */
export const PERSONAL_DEDUCTION_PER_PERSON = 1_500_000;

/**
 * 사업주 고용보험 고용안정·직업능력개발사업 요율(고용보험법 시행령 제12조).
 * 150인 미만 0.25%, 150인 이상 우선지원대상 0.45%, 150~999인 0.65%, 1,000인 이상·국가 0.85%.
 * 실업급여분(0.9%)은 근로자와 같다(RATES.employmentEmployee).
 */
export const EMPLOYER_EMPLOYMENT_STABILITY = {
  under150: 0.0025,
  priority150Plus: 0.0045,
  from150to999: 0.0065,
  from1000: 0.0085,
}         ;

/** 퍼센트 라벨(예: 0.03595 → "3.595%"). 화면 라벨이 요율 상수를 따라가게 한다. */
export function ratePct(rate        )         {
  return `${Number((rate * 100).toFixed(4))}%`;
}

// ---------------------------------------------------------------------------
// 상속세·증여세 2026 (2026-10-17 grokbot: fbfbd518 계산기의 하드코딩 상수를 이곳으로 이관)
// 세율·증여재산공제·혼인출산공제·일괄/배우자공제·신고세액공제는 api-oiyo src/modules/kr-rates-2026.mjs
// KR_RATES_2026.inheritanceGift와 같은 값이어야 한다(kr-payroll-2026.test.ts가 api 체크아웃이 있으면 대조).
// 출처: 상속세 및 증여세법 제19조·제21조·제22조·제26조·제53조·제53조의2·제69조, 시행령 제9조(장례비용).
// 2024·2025 정부 개정안(최고세율 40%, 자녀공제 5억)은 국회를 통과하지 않아 2026에도 10~50% 5단계다.
// ---------------------------------------------------------------------------

export const INHERITANCE_GIFT_2026 = {
  /** [과세표준 상한, 세율, 누진공제] */
  brackets: [
    [100_000_000, 0.1, 0],
    [500_000_000, 0.2, 10_000_000],
    [1_000_000_000, 0.3, 60_000_000],
    [3_000_000_000, 0.4, 160_000_000],
    [Infinity, 0.5, 460_000_000],
  ]         ,
  /** 제53조 증여재산공제(10년 합산). 키 = 수증자가 증여자에게 어떤 관계인지. */
  giftDeductions: {
    spouse: 600_000_000,
    child_adult: 50_000_000,
    child_minor: 20_000_000,
    parent: 50_000_000,
    other_relative: 10_000_000,
  },
  /** 제53조의2 혼인·출산 증여재산공제(직계존속으로부터, 평생 1억). */
  marriageBirthDeduction: 100_000_000,
  inheritanceLumpSum: 500_000_000,
  spouseInheritanceMin: 500_000_000,
  spouseInheritanceMax: 3_000_000_000,
  filingCredit: 0.03,
  /** 제22조 금융재산상속공제: 2천만 이하 전액, 초과 시 max(2천만, 20%) 한도 2억. (blog 전용) */
  financialAsset: { fullUpTo: 20_000_000, minDeduction: 20_000_000, rate: 0.2, max: 200_000_000 },
  /** 시행령 제9조 장례비용: 최소 500만, 한도 1,000만(봉안시설 500만 별도는 미반영). (blog 전용) */
  funeral: { min: 5_000_000, max: 10_000_000 },
}         ;

/** 상속·증여세 산출세액(과세표준 × 세율 − 누진공제, 원 미만 버림). */
export function inheritanceGiftProgressiveTax(taxBase        )         {
  const base = Math.max(0, taxBase);
  if (base === 0) return 0;
  const [, rate, deduction] = INHERITANCE_GIFT_2026.brackets.find(([upTo]) => base <= upTo) ;
  return Math.max(0, Math.floor(base * rate - deduction));
}

/** 금융재산상속공제(제22조). */
export function financialAssetDeduction(netFinancial        )         {
  const f = Math.max(0, netFinancial);
  const r = INHERITANCE_GIFT_2026.financialAsset;
  if (f <= r.fullUpTo) return f;
  return Math.min(r.max, Math.max(r.minDeduction, Math.floor(f * r.rate)));
}

/** 장례비용 공제(시행령 제9조): 증빙이 없거나 적어도 500만, 많아도 1,000만. */
export function funeralDeduction(spent        )         {
  const r = INHERITANCE_GIFT_2026.funeral;
  return Math.min(r.max, Math.max(r.min, Math.max(0, spent)));
}

/** 배우자상속공제(제19조): 실제 상속액 기준 최소 5억~최대 30억(법정상속분 한도는 미반영). */
export function spouseInheritanceDeduction(spouseInherited        )         {
  const r = INHERITANCE_GIFT_2026;
  return Math.min(r.spouseInheritanceMax, Math.max(r.spouseInheritanceMin, Math.max(0, spouseInherited)));
}

/** 신고세액공제(제69조) 3%, 원 미만 버림. */
export function filingCredit(calculatedTax        )         {
  return Math.floor(Math.max(0, calculatedTax) * INHERITANCE_GIFT_2026.filingCredit);
}
