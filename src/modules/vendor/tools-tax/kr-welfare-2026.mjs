// GENERATED from tools-oiyo src/lib/kr-welfare-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 생활 지원금·노동권 계산 엔진 (2026-11-16). Gemini가 oiyo 저장소에서 만들던 공익 도구를
// Claude가 이어받아 법령 수치를 다시 확인하고 한 파일로 모았어요. 화면은 components/tools/welfare/,
// 가정·쉬운 문장은 kr-welfare-scenarios.ts, Claude 스킬·MCP는 이 파일을 그대로 복사해 써요(drift 테스트).
// 순수 함수만 둬요(브라우저·Worker·Node 공용, 타입만 지우면 .mjs로 실행).

export const WELFARE_AS_OF = "2026-11-16";

/** 2026 시간급 최저임금. 정본은 kr-rates-2026.mjs(테스트가 같은지 확인해요). */
export const MIN_WAGE_2026 = 10_320;
const MIN_WAGE_MONTH = MIN_WAGE_2026 * 209; // 주 40시간 월 환산 2,156,880원
const MIN_WAGE_DAY8 = MIN_WAGE_2026 * 8; // 82,560원

const clamp0 = (n        ) => (Number.isFinite(n) && n > 0 ? n : 0);
const won = (n        ) => Math.floor(n);

// ───────────────────────── 근로장려금·자녀장려금 ─────────────────────────
// 조세특례제한법 제100조의3·제100조의5(근로), 제100조의28·제100조의29(자녀). 2025년 소득 → 2026년 신청분.
// 재산 2.4억 미만, 1.7억 이상이면 50%. 기한 후 신청은 95%.

                                                             

export const EITC_TABLE = {
  // [점증 끝, 평탄 끝, 소득 상한, 최대액]
  single: { rampEnd: 4_000_000, flatEnd: 9_000_000, cap: 22_000_000, max: 1_650_000 },
  oneEarner: { rampEnd: 7_000_000, flatEnd: 14_000_000, cap: 32_000_000, max: 2_850_000 },
  twoEarner: { rampEnd: 8_000_000, flatEnd: 17_000_000, cap: 44_000_000, max: 3_300_000 },
}         ;

export const CTC_TABLE = {
  // 자녀 1명당: 평탄 끝까지 100만 원, 소득 상한(7천만 원)에서 50만 원까지 줄어요.
  oneEarner: { flatEnd: 21_000_000 },
  twoEarner: { flatEnd: 25_000_000 },
  cap: 70_000_000,
  max: 1_000_000,
  min: 500_000,
}         ;

export const ASSET_CAP = 240_000_000;
export const ASSET_HALF = 170_000_000;

                            
                       
                                               
                 
                                       
                 
                      
                   
                             
                 
 

export function eitcAmount(household           , income        )         {
  const t = EITC_TABLE[household];
  const x = clamp0(income);
  if (x >= t.cap) return 0;
  if (x < t.rampEnd) return won((t.max * x) / t.rampEnd);
  if (x < t.flatEnd) return t.max;
  return won(t.max - ((x - t.flatEnd) * t.max) / (t.cap - t.flatEnd));
}

export function ctcPerChild(household                              , income        )         {
  const x = clamp0(income);
  if (x >= CTC_TABLE.cap) return 0;
  const flatEnd = CTC_TABLE[household].flatEnd;
  if (x < flatEnd) return CTC_TABLE.max;
  return won(CTC_TABLE.max - ((x - flatEnd) * (CTC_TABLE.max - CTC_TABLE.min)) / (CTC_TABLE.cap - flatEnd));
}

export function workChildCredit(input           ) {
  const children = Math.max(0, Math.floor(input.children));
  // 자녀가 있으면 단독가구가 아니라 홑벌이 가구예요(조특법 제100조의3 ①, 18세 미만 부양자녀).
  const household            = input.household === "single" && children > 0 ? "oneEarner" : input.household;
  const assets = clamp0(input.assets);
  const assetOk = assets < ASSET_CAP;
  const assetFactor = !assetOk ? 0 : assets >= ASSET_HALF ? 0.5 : 1;
  const lateFactor = input.late ? 0.95 : 1;
  const eitcRaw = eitcAmount(household, input.income);
  const perChild = household === "single" ? 0 : ctcPerChild(household, input.income);
  const ctcRaw = perChild * children;
  const eitc = won(eitcRaw * assetFactor * lateFactor);
  const ctc = won(ctcRaw * assetFactor * lateFactor);
  const t = EITC_TABLE[household];
  const x = clamp0(input.income);
  const phase                                    = x >= t.cap ? "over" : x < t.rampEnd ? "ramp" : x < t.flatEnd ? "flat" : "fade";
  return { household, eitcRaw, ctcRaw, perChild, eitc, ctc, total: eitc + ctc, assetOk, assetFactor, phase, upgraded: household !== input.household };
}

// ───────────────────────── 출산전후휴가·배우자 출산휴가 급여 ─────────────────────────
// 근로기준법 제74조, 남녀고용평등법 제18조·제18조의2, 고용보험법 제75조·제76조,
// 고용노동부고시 제2026-67호(출산전후휴가 90일 660만 원, 미숙아 100일 7,333,330원, 다태아 120일 880만 원,
// 배우자 출산휴가 20일 1,684,210원). 하한은 최저임금(시행령 제101조).

                                                            
export const MATERNITY = {
  single: { days: 90, employerDays: 60, cap: 6_600_000 },
  multiple: { days: 120, employerDays: 75, cap: 8_800_000 },
  premature: { days: 100, employerDays: 60, cap: 7_333_330 },
}         ;
export const SPOUSE_LEAVE = { days: 20, cap: 1_684_210 }         ;

                                 
               
                      
                                         
                        
                  
 

export function maternityLeavePay(input                ) {
  const spec = MATERNITY[input.kind];
  const wage = Math.max(clamp0(input.monthlyWage), MIN_WAGE_MONTH);
  const daily = wage / 30;
  const capDaily = spec.cap / spec.days;
  const insuredDaily = Math.min(daily, capDaily);
  const insuranceDays = input.priorityFirm ? spec.days : spec.days - spec.employerDays;
  const insurance = won(insuredDaily * insuranceDays);
  // 처음 60일(다태아 75일)은 회사가 통상임금을 줘야 하는 유급 기간이에요. 중소기업은 보험이 대신 내고 모자란 만큼만 회사가 채워요.
  const paidDays = spec.employerDays;
  const employerTopUp = input.priorityFirm ? won(Math.max(0, daily - insuredDaily) * paidDays) : 0;
  const employerPay = input.priorityFirm ? employerTopUp : won(daily * paidDays);
  const employeeTotal = won(daily * paidDays) + won(insuredDaily * (spec.days - paidDays));
  const fullWage = won(daily * spec.days);
  return {
    days: spec.days,
    insuranceDays,
    employerDays: paidDays,
    dailyWage: won(daily),
    insuredDaily: won(insuredDaily),
    insurance,
    employerPay,
    employeeTotal,
    shortfall: fullWage - employeeTotal,
    capped: daily > capDaily,
    floored: clamp0(input.monthlyWage) < MIN_WAGE_MONTH,
  };
}

export function spouseLeavePay(monthlyWage        , priorityFirm         ) {
  const daily = Math.max(clamp0(monthlyWage), MIN_WAGE_MONTH) / 30;
  const capDaily = SPOUSE_LEAVE.cap / SPOUSE_LEAVE.days;
  const employeeTotal = won(daily * SPOUSE_LEAVE.days);
  const insurance = priorityFirm ? won(Math.min(daily, capDaily) * SPOUSE_LEAVE.days) : 0;
  return { days: SPOUSE_LEAVE.days, employeeTotal, insurance, employerPay: employeeTotal - insurance };
}

// ───────────────────────── 체불임금 대지급금 ─────────────────────────
// 임금채권보장법 제7조·제7조의2, 시행령 제7조, 고용노동부고시(대지급금 상한액).
// 도산대지급금: 2026-08-20 이후 회생개시·파산선고·도산등사실인정이면 최종 6개월분 임금(이전은 3개월),
// 최종 3년분 퇴직급여. 월(퇴직급여는 1년) 상한은 퇴직 당시 나이로 정해요.
// 간이대지급금: 퇴직자 임금 700만·퇴직급여 700만·합계 1,000만 원, 재직자(저소득) 임금 700만 원.

export const GUARANTEE_AGE_CAP = [
  { under: 30, cap: 2_200_000 },
  { under: 40, cap: 3_100_000 },
  { under: 50, cap: 3_500_000 },
  { under: 60, cap: 3_300_000 },
  { under: Infinity, cap: 2_300_000 },
]         ;
export const SIMPLE_GUARANTEE = { wage: 7_000_000, severance: 7_000_000, total: 10_000_000, employedWage: 7_000_000 }         ;

                                                                              

                                 
                      
                          
              
                            
                      
                      
                       
                     
                          
                     
                       
                                            
                        
 

export const guaranteeMonthlyCap = (age        ) => GUARANTEE_AGE_CAP.find((b) => age < b.under)?.cap ?? 2_300_000;

export function wageGuarantee(input                ) {
  const wage = clamp0(input.monthlyWage);
  const months = Math.max(0, Math.floor(input.unpaidMonths));
  const unpaidWages = wage * months;
  const severance = input.kind === "simpleEmployed" ? 0 : clamp0(input.unpaidSeverance);
  const years = Math.max(0, input.serviceYears);
  const unpaid = unpaidWages + severance;
  if (input.kind === "insolvency") {
    const cap = guaranteeMonthlyCap(input.age);
    const wageMonths = Math.min(months, input.afterReform === false ? 3 : 6);
    const wagePay = Math.min(wage, cap) * wageMonths;
    const sevYears = Math.min(years, 3);
    const sevShare = years > 0 ? (severance * sevYears) / years : 0;
    const sevPay = won(Math.min(sevShare, cap * sevYears));
    return { cap, wagePay, severancePay: sevPay, total: wagePay + sevPay, unpaid, coveredMonths: wageMonths, coveredYears: sevYears, rest: unpaid - wagePay - sevPay };
  }
  if (input.kind === "simpleEmployed") {
    const wagePay = Math.min(wage * Math.min(months, 3), SIMPLE_GUARANTEE.employedWage);
    return { cap: SIMPLE_GUARANTEE.employedWage, wagePay, severancePay: 0, total: wagePay, unpaid, coveredMonths: Math.min(months, 3), coveredYears: 0, rest: unpaid - wagePay };
  }
  const wagePay = Math.min(wage * Math.min(months, 3), SIMPLE_GUARANTEE.wage);
  const sevYears = Math.min(years, 3);
  const sevShare = years > 0 ? (severance * sevYears) / years : 0;
  const sevPay = won(Math.min(sevShare, SIMPLE_GUARANTEE.severance, SIMPLE_GUARANTEE.total - wagePay));
  return { cap: SIMPLE_GUARANTEE.total, wagePay, severancePay: sevPay, total: wagePay + sevPay, unpaid, coveredMonths: Math.min(months, 3), coveredYears: sevYears, rest: unpaid - wagePay - sevPay };
}

// ───────────────────────── 산재 휴업급여 ─────────────────────────
// 산업재해보상보험법 제52조(평균임금 70%, 요양 3일 이내 미지급), 제54조(저소득 90%·최저임금 보장),
// 제36조(최고 보상기준 금액). 고용노동부고시 제2025-84호: 2026 최고 268,299원, 최저 82,560원.

export const INJURY_2026 = { maxBase: 268_299, minBase: 82_560 }         ;

                              
                
                       
                      
               
 

/** 3개월 임금 총액(+상여·연차수당의 3/12)과 그 기간 날짜 수로 1일 평균임금 */
export function averageDailyWage(threeMonthWages        , calendarDays = 92, annualBonus = 0, annualLeavePay = 0) {
  const d = Math.max(1, calendarDays);
  return (clamp0(threeMonthWages) + (clamp0(annualBonus) * 3) / 12 + (clamp0(annualLeavePay) * 3) / 12) / d;
}

export function injuryLeaveDaily(avgDailyWage        ) {
  const aw = clamp0(avgDailyWage);
  const base = Math.min(aw, INJURY_2026.maxBase);
  const regular = base * 0.7;
  const line = INJURY_2026.minBase * 0.8;
  if (regular > line) return { daily: won(regular), rule: base < aw ? ("max"         ) : ("regular"         ) };
  const low = Math.min(aw * 0.9, line);
  if (low < MIN_WAGE_DAY8) return { daily: MIN_WAGE_DAY8, rule: "minWage"          };
  return { daily: won(low), rule: "low90"          };
}

export function injuryLeavePay(input             ) {
  const days = Math.max(0, Math.floor(input.days));
  const d = injuryLeaveDaily(input.avgDailyWage);
  const eligible = days > 3;
  return { ...d, days, eligible, total: eligible ? d.daily * days : 0, ratio: input.avgDailyWage > 0 ? d.daily / input.avgDailyWage : 0 };
}

// ───────────────────────── 월세 세액공제 ─────────────────────────
// 조세특례제한법 제95조의2(2024-01-01 이후 지급분): 무주택 세대주(요건 갖춘 세대원), 국민주택규모(85㎡) 이하
// 또는 기준시가 4억 원 이하. 총급여 5,500만 원(종합소득 4,500만 원) 이하 17%, 8,000만 원(7,000만 원) 이하 15%.
// 월세 연 1,000만 원 한도. 지방소득세는 결정세액의 10%라 같이 줄어요.

export const RENT_CREDIT = { limit: 10_000_000, high: { wage: 55_000_000, comp: 45_000_000, rate: 0.17 }, low: { wage: 80_000_000, comp: 70_000_000, rate: 0.15 } }         ;

                            
                             
                 
                                       
                      
                 
                                   
                           
 

export function rentCreditRate(income        , incomeType                         ) {
  const k = incomeType === "wage" ? "wage" : "comp";
  if (income <= RENT_CREDIT.high[k]) return RENT_CREDIT.high.rate;
  if (income <= RENT_CREDIT.low[k]) return RENT_CREDIT.low.rate;
  return 0;
}

export function monthlyRentCredit(input           ) {
  const paid = clamp0(input.monthlyRent) * Math.max(0, Math.min(12, Math.floor(input.months)));
  const base = Math.min(paid, RENT_CREDIT.limit);
  const rate = rentCreditRate(clamp0(input.income), input.incomeType);
  const raw = won(base * rate);
  const limitedByTax = input.taxBeforeCredit !== undefined && input.taxBeforeCredit >= 0 && raw > input.taxBeforeCredit;
  const credit = limitedByTax ? won(input.taxBeforeCredit ?? 0) : raw;
  const local = won(credit * 0.1);
  return { paid, base, rate, credit, local, total: credit + local, limitedByTax, overLimit: paid > RENT_CREDIT.limit };
}

// ───────────────────────── 퇴직연금 DB형 vs DC형 ─────────────────────────
// 근로자퇴직급여 보장법 제13조(DB: 퇴직 전 30일분 평균임금 × 근속연수), 제20조(DC: 연간 임금총액의 1/12 이상 납입).
// 세전·명목 금액 추정이에요. 임금 상승률과 운용 수익률을 가정으로 둬요.

                               
                  
                      
                  
                      
                   
                    
                 
                     
                             
                   
 

export function dbVsDc(input              ) {
  const w0 = clamp0(input.monthlyWage);
  const served = Math.max(0, input.yearsServed);
  const left = Math.max(0, Math.floor(input.yearsLeft));
  const g = input.wageGrowth;
  const r = input.dcReturn;
  const finalWage = w0 * (1 + g) ** left;
  const db = won(finalWage * (served + left));
  // 지금 DC로 바꾸면: 지금까지 쌓인 DB 몫을 옮기고, 해마다 그해 연봉의 1/12(= 월급 1개월분)를 넣어 굴려요.
  let dc = w0 * served;
  const series                                             = [{ year: 0, db: won(w0 * served), dc: won(dc) }];
  for (let y = 1; y <= left; y++) {
    const wage = w0 * (1 + g) ** y;
    dc = dc * (1 + r) + wage; // 연말 납입 가정
    series.push({ year: y, db: won(wage * (served + y)), dc: won(dc) });
  }
  return { db, dc: won(dc), diff: won(dc) - db, better: won(dc) > db ? ("dc"         ) : ("db"         ), finalWage: won(finalWage), series };
}

/** DB와 DC가 같아지는 운용 수익률(이진 탐색, -5%~20%) */
export function breakEvenReturn(input              ) {
  let lo = -0.05;
  let hi = 0.2;
  const f = (r        ) => dbVsDc({ ...input, dcReturn: r }).diff;
  if (f(lo) > 0) return lo;
  if (f(hi) < 0) return hi;
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    if (f(mid) > 0) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}

// ───────────────────────── 통상임금·가산수당 ─────────────────────────
// 근로기준법 제56조(연장 50%, 야간 50%, 휴일 8시간 이내 50%·초과 100% 가산), 제11조(5인 미만은 가산 없음),
// 근로기준법 시행령 제6조(통상임금). 대법원 2024. 12. 19. 선고 2020다247190·2023다302838 전원합의체 판결:
// 재직 조건·일정 근무일수 조건이 붙은 정기상여금도 통상임금이에요(판결일 이후 임금분부터).
// 월 소정근로시간은 주 40시간이면 209시간(유급 주휴 포함)이에요.

                            
                           
                   
                                
                
                   
                  
                                         
                        
 

/** 시간급 통상임금과 근로시간으로 한 달 법정 수당(연장·야간·휴일, 근로시간 대가 100% 포함) */
export function premiumPay(hourly        , h           , smallFirm = false) {
  const over8 = Math.min(clamp0(h.holidayOver8 ?? 0), clamp0(h.holiday));
  const holidayIn8 = clamp0(h.holiday) - over8;
  if (smallFirm) {
    // 5인 미만: 가산 없이 일한 시간만큼(야간은 소정근로 안이면 추가 없음)
    const pay = hourly * (clamp0(h.overtime) + clamp0(h.holiday));
    return { overtime: won(hourly * clamp0(h.overtime)), night: 0, holiday: won(hourly * clamp0(h.holiday)), total: won(pay) };
  }
  const overtime = hourly * 1.5 * clamp0(h.overtime);
  const night = hourly * 0.5 * clamp0(h.night);
  const holiday = hourly * (1.5 * holidayIn8 + 2 * over8);
  return { overtime: won(overtime), night: won(night), holiday: won(holiday), total: won(overtime + night + holiday) };
}

                                                      
              
                  
                                                
                          
                    
                      
                                         
                            
                               
                        
                      
 

export function ordinaryWage(input                   ) {
  const hours = input.monthlyHours && input.monthlyHours > 0 ? input.monthlyHours : 209;
  const fixed = clamp0(input.basePay) + clamp0(input.fixedAllowances);
  const bonusMonthly = clamp0(input.bonusAnnual) / 12;
  const monthly = fixed + bonusMonthly;
  const monthlyBefore = input.bonusConditional ? fixed : monthly;
  const hourly = monthly / hours;
  const hourlyBefore = monthlyBefore / hours;
  const pay = premiumPay(hourly, input, input.smallFirm);
  const payBefore = premiumPay(hourlyBefore, input, input.smallFirm);
  const diffMonthly = pay.total - payBefore.total;
  return {
    hours,
    monthly: won(monthly),
    hourly: won(hourly),
    daily: won(hourly * 8),
    monthlyBefore: won(monthlyBefore),
    hourlyBefore: won(hourlyBefore),
    premium: pay,
    premiumBefore: payBefore,
    diffMonthly,
    diffAnnual: diffMonthly * 12,
    /** 연차수당 1일분(8시간) 차이 */
    leaveDayDiff: won(hourly * 8) - won(hourlyBefore * 8),
    ruling: input.bonusConditional && bonusMonthly > 0,
    belowMinWage: fixed / hours < MIN_WAGE_2026,
  };
}

// ───────────────────────── 포괄임금 고정 연장수당 점검 ─────────────────────────
// 고정으로 받는 연장수당이 실제로 일한 연장·야간·휴일근로의 법정 수당보다 적으면 그 차액은 받을 수 있어요
// (대법원 2010다5441 등). 임금채권 소멸시효 3년(근로기준법 제49조).

                                                 
                                           
                  
                               
                     
                        
                      
                                      
                  
 

export function fixedOvertimeCheck(input              ) {
  const hours = input.monthlyHours && input.monthlyHours > 0 ? input.monthlyHours : 209;
  const hourly = clamp0(input.basePay) / hours;
  const legal = premiumPay(hourly, input, input.smallFirm);
  const fixed = clamp0(input.fixedOtPay);
  const shortMonthly = Math.max(0, legal.total - fixed);
  const months = Math.min(36, Math.max(0, Math.floor(input.months ?? 36)));
  const premiumFactor = input.smallFirm ? 1 : 1.5;
  return {
    hourly: won(hourly),
    legal,
    fixed,
    shortMonthly,
    months,
    shortTotal: shortMonthly * months,
    /** 고정 수당이 몇 시간 연장근로 값인지(연장 1.5배 기준) */
    coveredHours: hourly > 0 ? Math.floor((fixed / (hourly * premiumFactor)) * 10) / 10 : 0,
    belowMinWage: hourly < MIN_WAGE_2026,
    minWageGap: Math.max(0, won((MIN_WAGE_2026 - hourly) * hours)),
  };
}

// ───────────────────────── 노인장기요양 본인부담금 ─────────────────────────
// 노인장기요양보험법 제40조(재가 15%, 시설 20%, 감경 40%·60%, 기초생활수급자 면제), 시행령 제15조의8,
// 「2026년 장기요양급여비용 등에 관한 고시」(보건복지부고시 제2025-247호, 2026-01-01 시행):
// 재가급여 월 한도액, 노인요양시설 1일 수가. 한도를 넘는 재가 이용분과 식사·간식 등 비급여는 전액 본인이 내요.

                                                                 
export const LTC_2026 = {
  homeLimit: { "1": 2_512_900, "2": 2_331_200, "3": 1_528_200, "4": 1_409_700, "5": 1_208_900, cognitive: 676_320 }                            ,
  facilityDaily: { "1": 93_070, "2": 86_340, "3": 81_540, "4": 81_540, "5": 81_540, cognitive: 0 }                            ,
  homeRate: 0.15,
  facilityRate: 0.2,
}         ;
                                                          
const LTC_FACTOR                               = { none: 1, "40": 0.6, "60": 0.4, basic: 0 };

                           
                  
                            
                                                        
                   
                      
                
                           
                      
                          
 

export function longTermCareCopay(input          ) {
  const factor = LTC_FACTOR[input.reduction] ?? 1;
  if (input.kind === "home") {
    const limit = LTC_2026.homeLimit[input.grade];
    const use = input.homeUse === undefined ? limit : clamp0(input.homeUse);
    const covered = Math.min(use, limit);
    const over = Math.max(0, use - limit);
    const rate = LTC_2026.homeRate * factor;
    const copay = won(covered * rate);
    return { kind: "home"         , limit, use, covered, over, rate, copay, publicShare: covered - copay, extra: 0, total: copay + over, facilityAllowed: true };
  }
  const daily = LTC_2026.facilityDaily[input.grade];
  const days = Math.min(31, Math.max(0, Math.round(input.days ?? 30)));
  const covered = daily * days;
  const rate = LTC_2026.facilityRate * factor;
  const copay = won(covered * rate);
  const extra = clamp0(input.dailyExtra ?? 15_000) * days;
  return { kind: "facility"         , limit: covered, use: covered, covered, over: 0, rate, copay, publicShare: covered - copay, extra, total: copay + extra, facilityAllowed: input.grade !== "cognitive" };
}

// ───────────────────────── 노동권 묶음 A (2026-11-16, Gemini 이전) ─────────────────────────
// 상시 4명 이하 사업장에 적용되는 조항은 근로기준법 시행령 별표 1: 제26조(해고예고)는 적용,
// 제27조(서면통지)·제46조(휴업수당)·제60조·제61조(연차·사용촉진)는 적용하지 않아요.

/** 주 소정근로시간 → 월 소정근로시간(유급 주휴 포함, 주 40시간 = 209시간) */
export function monthlyPaidHours(weeklyHours        ) {
  const w = Math.min(40, clamp0(weeklyHours));
  const weeklyPaid = w + (w >= 15 ? w / 5 : 0);
  return Math.round((weeklyPaid * 365) / 7 / 12);
}

// ── 해고예고수당 ──
// 근로기준법 제26조: 30일 전에 예고하지 않으면 30일분 이상의 통상임금. 예외: 계속 근로 3개월 미만,
// 천재·사변 등으로 사업을 계속할 수 없는 경우, 고의로 막대한 손해를 끼친 경우(시행규칙 별표). 예고가 30일보다
// 짧으면 고용노동부는 30일분 전액을 줘야 한다고 봐요(일할 계산 아님). 해고예고수당은 해고가 정당한지와 별개예요.
                                                                 
                                       
                               
                              
                 
                      
                               
                     
                   
                       
                             
                                    
                    
 

export function dismissalNoticePay(input                      ) {
  const hours = monthlyPaidHours(input.weeklyHours || 40);
  const hourly = hours > 0 ? clamp0(input.monthlyOrdinaryWage) / hours : 0;
  const dailyHours = Math.min(8, clamp0(input.weeklyHours || 40) / 5);
  const daily = hourly * dailyHours;
  const full = won(daily * 30);
  const notice = Math.max(0, Math.floor(clamp0(input.noticeDays)));
  let reason                                                                    ;
  if (notice >= 30) reason = "enoughNotice";
  else if (clamp0(input.tenureMonths) < 3) reason = "shortTenure";
  else if (input.exception !== "none") reason = input.exception;
  else reason = "due";
  return {
    hourly: won(hourly),
    daily: won(daily),
    full,
    amount: reason === "due" ? full : 0,
    reason,
    missingDays: Math.max(0, 30 - notice),
    writtenNoticeRequired: input.fivePlus,
    remedyWindowMonths: input.fivePlus ? 3 : 0,
  };
}

// ── 휴업수당 ──
// 근로기준법 제46조: 회사 사정(귀책사유)으로 쉬면 평균임금의 70% 이상. 70%가 통상임금보다 많으면 통상임금을 줄 수 있어요.
// 부득이한 사유로 노동위원회 승인을 받으면 기준보다 적게 줄 수 있어요(제46조②). 쉬는 동안 일부 일하고 받은 임금이 있으면
// 평균임금에서 그 임금을 뺀 금액의 70%(통상임금으로 줄 때는 통상임금에서 뺀 금액, 시행령 제26조).
                                   
                                 
                          
                               
                       
               
                              
                            
                       
                            
                             
                        
                             
                    
 

export function shutdownAllowance(input                  ) {
  const avgDaily = averageDailyWage(clamp0(input.threeMonthWages), input.calendarDays > 0 ? input.calendarDays : 92);
  const days = Math.max(0, Math.round(clamp0(input.shutdownDays)));
  const ordinaryDaily = (clamp0(input.monthlyOrdinaryWage) * 12) / 365;
  const paid = clamp0(input.paidDuringShutdown);
  const avgTotal = avgDaily * days;
  const ordinaryTotal = ordinaryDaily * days;
  const seventy = Math.max(0, (avgTotal - paid) * 0.7);
  const ordinaryAlt = Math.max(0, ordinaryTotal - paid);
  const useOrdinary = avgTotal * 0.7 > ordinaryTotal;
  const minimum = won(useOrdinary ? ordinaryAlt : seventy);
  return {
    avgDaily: won(avgDaily),
    ordinaryDaily: won(ordinaryDaily),
    days,
    seventy: won(seventy),
    ordinaryAlt: won(ordinaryAlt),
    useOrdinary,
    /** 법이 정한 최소 휴업수당(승인 감액·5명 미만이면 0) */
    minimum: input.fivePlus && !input.approvedReduction ? minimum : 0,
    statutory: minimum,
    applies: input.fivePlus,
    lostVsNormal: won(Math.max(0, avgTotal - paid - (input.fivePlus && !input.approvedReduction ? minimum : 0))),
  };
}

// ── 육아기 근로시간 단축 급여 ──
// 고용보험법 제73조의2, 시행령 제104조의2(2025-12 개정, 2026 상한 250만·160만 원), 남녀고용평등법 제19조의2
// (만 12세 이하·초6 이하 자녀, 단축 후 주 15~35시간, 1년 + 쓰지 않은 육아휴직의 2배, 1개월 단위로 나눠 쓰기).
// 매주 처음 10시간 단축분: 통상임금 100%(기준액 상한 250만·하한 50만) × 10 ÷ 단축 전 시간.
// 나머지 단축분: 통상임금 80%(상한 160만·하한 50만) × (단축 전 − 단축 후 − 10) ÷ 단축 전 시간.
export const REDUCED_HOURS_2026 = { firstHours: 10, capFirst: 2_500_000, capRest: 1_600_000, floor: 500_000, restRate: 0.8, minAfter: 15, maxAfter: 35 }         ;
                                    
                              
                      
                     
 

export function reducedHoursPay(input                   ) {
  const R = REDUCED_HOURS_2026;
  const before = Math.max(1, Math.min(40, clamp0(input.beforeHours) || 40));
  const after = Math.max(0, Math.min(before, clamp0(input.afterHours)));
  const cut = before - after;
  const firstCut = Math.min(R.firstHours, cut);
  const restCut = Math.max(0, cut - R.firstHours);
  const wage = clamp0(input.monthlyOrdinaryWage);
  const baseFirst = Math.min(R.capFirst, Math.max(R.floor, wage));
  const baseRest = Math.min(R.capRest, Math.max(R.floor, wage * R.restRate));
  const first = won((baseFirst * firstCut) / before);
  const rest = won((baseRest * restCut) / before);
  const benefit = first + rest;
  const companyPay = won((wage * after) / before);
  return {
    before,
    after,
    cut,
    firstCut,
    restCut,
    first,
    rest,
    benefit,
    companyPay,
    total: companyPay + benefit,
    loss: Math.max(0, wage - companyPay - benefit),
    valid: after >= R.minAfter && after <= R.maxAfter && cut > 0,
    cappedFirst: wage > R.capFirst,
    cappedRest: wage * R.restRate > R.capRest,
  };
}

// ── 수습 최저임금 ──
// 최저임금법 제5조②, 시행령 제3조: 1년 이상 근로계약(기간을 정하지 않은 계약 포함)으로 수습 중이면
// 수습 시작 뒤 3개월까지 최저임금의 90%를 줄 수 있어요. 단순노무직종(고용노동부 고시)은 감액할 수 없어요.
                                 
                     
                                     
                         
                               
                              
                       
                             
                        
 

export function probationMinWage(input                ) {
  const longContract = input.contractMonths === 0 || clamp0(input.contractMonths) >= 12;
  const inWindow = clamp0(input.monthsIntoProbation) < 3;
  const reducible = longContract && inWindow && !input.simpleLabor;
  const minimum = reducible ? Math.round(MIN_WAGE_2026 * 0.9) : MIN_WAGE_2026;
  const hours = input.monthlyHours && input.monthlyHours > 0 ? input.monthlyHours : 209;
  const shortHourly = Math.max(0, minimum - clamp0(input.hourlyWage));
  return {
    minimum,
    reducible,
    why: !longContract ? "shortContract"          : input.simpleLabor ? "simpleLabor"          : !inWindow ? "afterThreeMonths"          : "reduced"         ,
    ok: shortHourly === 0,
    shortHourly,
    shortMonthly: won(shortHourly * hours),
    monthlyMinimum: won(minimum * hours),
  };
}

// ── 연차 사용촉진 날짜 ──
// 근로기준법 제61조①(1년 이상 근무자의 연차): 사용기간이 끝나기 6개월 전을 기준으로 10일 안에 남은 일수를 알리고
// 서면으로 촉구 → 근로자가 10일 안에 사용 시기를 안 정하면 끝나기 2개월 전까지 회사가 시기를 정해 서면 통보.
// 제61조②(1년 미만 근로자의 월 단위 연차): 최초 1년이 끝나기 3개월 전 기준 10일 안 촉구(촉구 뒤 생긴 휴가는
// 1개월 전 기준 5일 안), 회사 지정 통보는 1개월 전까지(촉구 뒤 생긴 휴가는 10일 전까지).
// 이 절차를 지키면 남은 연차의 수당을 주지 않아도 돼요(제61조 본문).
                                                        
                                
             
                
                
              
                            
 

const isoAdd = (iso        , { months = 0, days = 0 }                                    ) => {
  const [y, m, d] = iso.split("-").map(Number);
  const base = new Date(Date.UTC(y, m - 1 + months, 1));
  const last = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + 1, 0)).getUTCDate();
  base.setUTCDate(Math.min(d, last) + days);
  return base.toISOString().slice(0, 10);
};

/** periodEnd: 연차를 쓸 수 있는 마지막 날(예: 회계연도 12-31, 입사 1년 되는 날의 전날) */
export function leavePromotionSchedule(kind                    , periodEnd        )                  {
  const endEx = isoAdd(periodEnd, { days: 1 }); // 기간이 끝나는 순간(다음 날 0시)
  if (kind === "annual") {
    const first = isoAdd(endEx, { months: -6 });
    const firstDue = isoAdd(first, { days: 9 });
    return [
      { id: "notify", label: "회사: 남은 연차 일수 알리고 쓸 날 정하라고 서면 촉구", from: first, due: firstDue, who: "company" },
      { id: "reply", label: "근로자: 촉구 받은 날부터 10일 안에 쓸 날 정해 통보", due: isoAdd(firstDue, { days: 10 }), who: "worker" },
      { id: "assign", label: "회사: 근로자가 안 정한 날을 정해 서면 통보", due: isoAdd(endEx, { months: -2, days: -1 }), who: "company" },
      { id: "end", label: "연차 사용기간 끝", due: periodEnd, who: "worker" },
    ];
  }
  const first = isoAdd(endEx, { months: -3 });
  const firstDue = isoAdd(first, { days: 9 });
  const late = isoAdd(endEx, { months: -1 });
  return [
    { id: "notify", label: "회사: 남은 연차 알리고 서면 촉구(3개월 전 기준 10일 안)", from: first, due: firstDue, who: "company" },
    { id: "reply", label: "근로자: 10일 안에 쓸 날 정해 통보", due: isoAdd(firstDue, { days: 10 }), who: "worker" },
    { id: "notifyLate", label: "회사: 촉구 뒤 생긴 연차 서면 촉구(1개월 전 기준 5일 안)", from: late, due: isoAdd(late, { days: 4 }), who: "company" },
    { id: "assign", label: "회사: 안 정한 날 지정 서면 통보(1개월 전까지)", due: isoAdd(endEx, { months: -1, days: -1 }), who: "company" },
    { id: "assignLate", label: "회사: 촉구 뒤 생긴 연차 지정 통보(10일 전까지)", due: isoAdd(endEx, { days: -11 }), who: "company" },
    { id: "end", label: "최초 1년 연차 사용기간 끝", due: periodEnd, who: "worker"          },
  ].sort((a, b) => a.due.localeCompare(b.due))                   ;
}
