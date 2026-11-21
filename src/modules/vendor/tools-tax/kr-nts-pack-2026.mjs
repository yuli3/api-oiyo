// GENERATED from tools-oiyo src/lib/kr-nts-pack-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 국세청 유튜브 주제 5종 (2026-11-21). 국세청 채널 동영상·쇼츠 제목 744개를 우리 도구와 대조해 빈칸이던 주제예요.
// 지급명세서 기한·가산세, 취업 후 학자금 의무상환, 장부 vs 추계(무기장 가산세), 면세 사업장현황신고, 사적연금 1,500만 원 분리 vs 종합.
// 같은 코드가 kr-tax-advisor 스킬 calc.mjs(withholding-statement, student-loan, book-vs-estimate, exempt-report, pension-income)로 들어가요.
// 근거(국가법령정보센터 현행 원문, 2026-11-21 확인. company-brain projects/oiyo-ecosystem/nts-5-facts-2026-11-21.md):
// - 소득세법 제164조①(지급명세서 2월 말·3월 10일, 일용 다음 달 말), 제164조의3①(간이지급명세서 매월, 근로분 매월 제출은 2027-01-01 시행),
//   제81조의11①(미제출 1%, 3개월 안 0.5% / 일용·간이 0.25%, 1개월 안 0.125%), ③(2027년, 반기납부자 2028년까지 근로 간이 반기 제출 시 가산세 없음), ⑤(중복 배제).
// - 취업 후 학자금 상환 특별법 제18조②④·제23조·제24조, 시행령 제10조①(학부 20%, 대학원 25%), 교육부고시 제2026-12호 제4조①(상환기준소득 2,056만 원).
// - 소득세법 제14조③9호다목(사적연금 1,500만 원 이하 분리과세), 제64조의4(초과 시 15% 분리과세 선택), 제47조의2(연금소득공제, 한도 900만 원),
//   제129조①5의2(70세 미만 5%, 80세 미만 4%, 80세 이상 3%, 종신계약 3%; 둘 다 맞으면 낮은 세율).
// - 소득세법 시행령 제208조⑤(간편장부 3억/1.5억/7,500만), 제143조③④(기준·단순경비율, 비교소득 배율 3.4·간편장부대상 2.8, 2027년 귀속까지),
//   소득세법 제81조의5(무기장가산세 산출세액 × 무기장 소득 비율 × 20%), 시행령 제147조①·제132조④(신규·직전 수입 4,800만 원 미만 제외),
//   제56조의2(기장세액공제 20%, 한도 100만 원).
// - 소득세법 제78조(사업장현황신고 다음 해 2월 10일, 부가세 신고자·사망·출국은 한 것으로 봄), 제81조의3·시행령 제147조의2(0.5% 가산세는 의료·수의·약국만).
// 신고서 작성·제출 대리를 하지 않아요. 화면 메뉴나 서식 칸 이름은 적지 않아요.
import { basicIncomeTax, earnedIncomeDeduction, PERSONAL_DEDUCTION_PER_PERSON } from "./kr-payroll-2026.mjs";
import { krTaxDeadlineUTC } from "./kr-business-day.mjs";

export const NTS_PACK_AS_OF = "2026-11-21";
const DAY = 86_400_000;
const floor10 = (n        ) => Math.floor(Math.round(n) / 10) * 10;
const pos = (n         ) => Math.max(0, Number(n) || 0);
const iso = (d      ) => d.toISOString().slice(0, 10);
const parse = (s         ) => (s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(`${s}T00:00:00Z`) : null);
const endOfMonth = (y        , m0        ) => new Date(Date.UTC(y, m0 + 1, 0));
const addMonths = (d      , m        ) => {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + m, 1));
  const last = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)).getUTCDate();
  return new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), Math.min(d.getUTCDate(), last)));
};
const dday = (due      , today         ) => {
  const t = parse(today);
  return t ? Math.round((due.getTime() - t.getTime()) / DAY) : null;
};

// ───────────────────────── 1. 지급명세서 기한·가산세 ─────────────────────────

                                                                                                         
export const STATEMENT_KINDS                                                         = {
  "annual-other": { label: "이자·배당·연금·기타소득 지급명세서", hint: "다음 해 2월 말일" },
  "annual-wage": { label: "근로·퇴직·사업소득 지급명세서", hint: "다음 해 3월 10일" },
  daily: { label: "일용근로소득 지급명세서", hint: "지급한 달의 다음 달 말일" },
  "simple-business": { label: "간이지급명세서(사업소득·인적용역 기타소득)", hint: "지급한 달의 다음 달 말일" },
  "simple-wage": { label: "간이지급명세서(근로소득)", hint: "2026년 지급분은 반기, 2027년부터 매월" },
};

                              
                      
              
               
                                       
                 
                           
                 
                        
                     
                              
                            
                 
  

function statementDue(kind               , year        , month        ) {
  const m0 = Math.min(12, Math.max(1, Math.floor(month))) - 1;
  if (kind === "annual-other") return { due: endOfMonth(year + 1, 1), rule: "다음 해 2월 말일", cite: "소득세법 제164조①" };
  if (kind === "annual-wage") return { due: new Date(Date.UTC(year + 1, 2, 10)), rule: "다음 해 3월 10일", cite: "소득세법 제164조①" };
  if (kind === "daily") return { due: endOfMonth(year, m0 + 1), rule: "지급한 달의 다음 달 말일", cite: "소득세법 제164조① 단서" };
  if (kind === "simple-business") return { due: endOfMonth(year, m0 + 1), rule: "지급한 달의 다음 달 말일", cite: "소득세법 제164조의3①" };
  if (year <= 2026) {
    const h2 = m0 >= 6;
    return { due: h2 ? endOfMonth(year + 1, 0) : endOfMonth(year, 6), rule: h2 ? "하반기 지급분은 다음 해 1월 말일" : "상반기 지급분은 7월 말일", cite: "소득세법 제164조의3①(2027-01-01 전 조문)" };
  }
  return { due: endOfMonth(year, m0 + 1), rule: "지급한 달의 다음 달 말일(2027-01-01부터 매월)", cite: "소득세법 제164조의3①" };
}

export function withholdingStatement(x                ) {
  const kind = x.kind in STATEMENT_KINDS ? x.kind : "annual-wage";
  const year = Math.floor(Number(x.year) || 2026);
  const month = Math.floor(Number(x.month) || 1);
  const amount = pos(x.amount);
  const { due: statutory, rule, cite } = statementDue(kind, year, month);
  const due = krTaxDeadlineUTC(statutory);
  const annual = kind === "annual-other" || kind === "annual-wage";
  const baseRate = annual ? 0.01 : 0.0025;
  const graceMonths = annual ? 3 : 1;
  const graceEnd = addMonths(due, graceMonths);
  const sub = parse(x.submitted);
  const items                                                                   = [];
  // 2027년(반기납부자는 2028년까지) 근로 간이지급명세서를 반기 마지막 달의 다음 달 말일까지 내면 미제출 가산세가 없어요(제81조의11③1호).
  let exemptUntil                = null;
  if (kind === "simple-wage" && year >= 2027 && (year === 2027 || (x.semiAnnualPayer && year === 2028))) {
    const m0 = Math.min(12, Math.max(1, month)) - 1;
    exemptUntil = iso(krTaxDeadlineUTC(m0 >= 6 ? endOfMonth(year + 1, 0) : endOfMonth(year, 6)));
  }
  let rate = 0;
  let status                                                              = "not-yet";
  if (sub) {
    if (sub <= due) status = "on-time";
    else if (exemptUntil && sub <= new Date(`${exemptUntil}T00:00:00Z`)) status = "on-time";
    else if (sub <= graceEnd) { status = "late-reduced"; rate = baseRate / 2; }
    else { status = "late"; rate = baseRate; }
  } else {
    const t = parse(x.today);
    const limit = exemptUntil ? new Date(`${exemptUntil}T00:00:00Z`) : due;
    if (t && t > limit) { status = "overdue"; rate = t <= graceEnd ? baseRate / 2 : baseRate; }
  }
  const penalty = floor10(amount * rate);
  const ifNow = floor10(amount * (baseRate / 2));
  if (status === "late-reduced") items.push({ tone: "warn", text: `기한(${iso(due)})은 지났지만 ${graceMonths}개월 안에 내서 가산세가 ${baseRate * 50}%로 줄었어요.`, cite: "소득세법 제81조의11①" });
  if (status === "late") items.push({ tone: "warn", text: `기한 뒤 ${graceMonths}개월(${iso(graceEnd)})이 지나서 내 가산세 ${baseRate * 100}%가 붙어요.`, cite: "소득세법 제81조의11①" });
  if (status === "on-time") items.push({ tone: "good", text: "기한 안에 냈어요. 미제출 가산세는 없어요.", cite });
  if (status === "overdue") items.push({ tone: "warn", text: `기한이 지났어요. ${iso(graceEnd)}까지 내면 가산세가 ${baseRate * 50}%로 줄어요(지급금액 기준 ${ifNow.toLocaleString("ko-KR")}원).`, cite: "소득세법 제81조의11①" });
  if (status === "not-yet") items.push({ tone: "info", text: `기한: ${iso(due)} (${rule}${statutory.getTime() !== due.getTime() ? ", 휴일이라 다음 영업일" : ""})`, cite: `${cite}, 국세기본법 제5조` });
  if (exemptUntil) items.push({ tone: "info", text: `근로소득 간이지급명세서 매월 제출 첫해라 ${exemptUntil}까지(반기 마지막 달의 다음 달 말일) 내면 미제출 가산세를 매기지 않아요.`, cite: "소득세법 제81조의11③" });
  if (kind === "simple-wage" && year <= 2026) items.push({ tone: "info", text: "근로소득 간이지급명세서는 2027년 1월 지급분부터 매월(다음 달 말일) 내요.", cite: "소득세법 제164조의3 부칙 시행일" });
  if (kind === "simple-business") items.push({ tone: "info", text: "사업소득·인적용역 기타소득은 같은 금액에 연간 지급명세서 가산세가 붙으면 간이지급명세서 가산세를 또 매기지 않아요.", cite: "소득세법 제81조의11⑤" });
  items.push({ tone: "info", text: `적힌 내용이 불분명하거나 사실과 다르면 그 금액의 ${annual ? "1%" : "0.25%"} 가산세가 따로 있어요.`, cite: "소득세법 제81조의11①2호" });
  return {
    kind, label: STATEMENT_KINDS[kind].label, year, month: annual ? null : month, amount,
    statutoryDue: iso(statutory), due: iso(due), rule, dday: dday(due, x.today),
    graceUntil: iso(graceEnd), graceMonths, baseRate, reducedRate: baseRate / 2,
    status, rate, penalty, exemptUntil, items, cite: "소득세법 제164조·제164조의3·제81조의11",
  };
}

// ───────────────────────── 2. 취업 후 학자금 의무상환 ─────────────────────────

/** 상환기준소득은 학기마다 교육부 고시로 정해요. 바뀌면 여기와 annual-values의 student-loan-threshold를 고쳐요. */
export const STUDENT_LOAN_BASIS = { threshold: 20_560_000, salaryEquivalent: 30_370_000, notice: "교육부고시 제2026-12호(2026학년도 2학기)", undergrad: 0.2, graduate: 0.25 }         ;

                                
                                                 
                                  
                 
                                                 
                                 
                                       
                   
                                        
                     
  

export function studentLoanRepayment(x                  ) {
  const amount = pos(x.amount);
  const income = x.incomeType === "salary" ? Math.max(0, amount - earnedIncomeDeduction(amount)) : amount;
  const rate = x.loan === "graduate" ? STUDENT_LOAN_BASIS.graduate : STUDENT_LOAN_BASIS.undergrad;
  const over = Math.max(0, income - STUDENT_LOAN_BASIS.threshold);
  let yearly = Math.floor(over * rate);
  const balance = pos(x.balance);
  if (balance > 0) yearly = Math.min(yearly, balance);
  const monthly = Math.floor(yearly / 12);
  const employee = x.employee ?? x.incomeType === "salary";
  const items                                                                   = [];
  if (yearly === 0) items.push({ tone: "good", text: `소득금액 ${income.toLocaleString("ko-KR")}원이 상환기준소득 ${STUDENT_LOAN_BASIS.threshold.toLocaleString("ko-KR")}원 이하라 의무상환액이 없어요. 원하면 자발적으로 갚을 수 있어요.`, cite: STUDENT_LOAN_BASIS.notice });
  else if (employee) items.push({ tone: "info", text: `근로소득자는 의무상환액을 12로 나눠(월 약 ${monthly.toLocaleString("ko-KR")}원) 회사가 급여에서 떼어 다음 달 10일까지 내요. 연말정산 신고분은 그해 6월 30일까지 회사에 통지되고, 통지받은 달의 다음 달 급여부터 시작해요.`, cite: "취업 후 학자금 상환 특별법 제24조, 시행령" });
  else items.push({ tone: "info", text: "종합소득 신고자는 종합소득세 확정신고기한이 끝난 뒤 3개월 안에 의무상환액이 고지되고, 고지일부터 30일 안에 내요.", cite: "취업 후 학자금 상환 특별법 제23조" });
  if (x.loan === "graduate") items.push({ tone: "info", text: "학부·대학원 대출이 둘 다 남아 있으면 25%를 쓰고 대학원분부터 갚아요. 대학원분 잔액이 25% 의무상환액보다 작아지면 20%로 계산해요.", cite: "시행령 제10조①" });
  items.push({ tone: "info", text: "원천공제가 시작되기 전에 의무상환액 전액이나 절반씩 두 번 미리 낼 수 있어요. 퇴직소득·상속·증여재산이 있으면 따로 계산해요.", cite: "법 제24조⑦, 교육부고시 제4조①" });
  return { income, threshold: STUDENT_LOAN_BASIS.threshold, over, rate, yearly, monthly, employee, notice: STUDENT_LOAN_BASIS.notice, items, cite: "취업 후 학자금 상환 특별법 제18조②, 시행령 제10조①" };
}

/** 소득금액이 커질 때 의무상환액이 어떻게 늘어나는지(그래프용). */
export function studentLoanCurve(loan                          , from = 15_000_000, to = 60_000_000, step = 2_500_000) {
  const out                                       = [];
  for (let v = from; v <= to; v += step) out.push({ income: v, yearly: studentLoanRepayment({ incomeType: "income", amount: v, loan }).yearly });
  return out;
}

// ───────────────────────── 3. 장부 vs 추계 ─────────────────────────

                                                         
export const INDUSTRY_GROUPS                                                                         = {
  a: { label: "농·임·어업, 광업, 도소매, 부동산매매 등", book: 300_000_000, simple: 60_000_000 },
  b: { label: "제조, 숙박·음식, 건설, 운수, 정보통신, 금융·보험 등", book: 150_000_000, simple: 36_000_000 },
  c: { label: "부동산임대, 전문·과학·기술서비스, 교육, 보건, 예술·스포츠, 개인서비스 등", book: 75_000_000, simple: 24_000_000 },
  personal: { label: "인적용역(프리랜서·강사·배달·대리운전 등 부가세 면제 인적용역)", book: 75_000_000, simple: 36_000_000 },
};
export const BOOK_RULES = { smallBusiness: 48_000_000, penaltyRate: 0.2, creditRate: 0.2, creditCap: 1_000_000, multiple: 3.4, multipleSimpleBook: 2.8, multipleUntilYear: 2027 }         ;

                         
                       
                   
                      
                       
                  
                    
                        
                        
                        
                           
                     
                                                            
                          
                           
                       
                                          
                        
                            
                       
                       
                  
  

function taxFor(business        , other        , people        ) {
  const total = Math.max(0, business) + Math.max(0, other);
  const base = Math.max(0, total - Math.max(1, Math.floor(people)) * PERSONAL_DEDUCTION_PER_PERSON);
  const calculated = basicIncomeTax(base);
  return { total, base, calculated, share: total > 0 ? Math.max(0, business) / total : 0 };
}

export function bookVsEstimate(x           ) {
  const g = INDUSTRY_GROUPS[x.group] ?? INDUSTRY_GROUPS.c;
  const revenue = pos(x.revenue), prev = pos(x.prevRevenue), other = pos(x.otherIncome);
  const people = Math.max(1, Math.floor(Number(x.people) || 1));
  const isNew = !!x.newBusiness;
  const doubleEntry = !isNew && prev >= g.book; // 복식부기의무자
  const simpleOk = isNew ? revenue < g.book : prev < g.simple; // 단순경비율 대상
  const smallBiz = isNew || prev < BOOK_RULES.smallBusiness; // 무기장가산세 제외
  const multiple = doubleEntry ? BOOK_RULES.multiple : BOOK_RULES.multipleSimpleBook;

  const bookIncome = revenue - pos(x.actualExpense);
  // 단순경비율 대상이라도 수입금액 4,000만 원 넘는 부분은 자가율을 써요(국세청 경비율 고시).
  const over40 = Math.max(0, revenue - 40_000_000);
  const sr = pos(x.simpleRate) / 100, srOver = x.simpleRateOver == null ? sr : pos(x.simpleRateOver) / 100;
  const simpleIncome = Math.round(revenue - (revenue - over40) * sr - over40 * srOver);
  const stdRate = (pos(x.standardRate) / 100) * (doubleEntry ? 0.5 : 1);
  const standardRaw = Math.round(revenue - pos(x.majorExpense) - revenue * stdRate);
  const standardIncome = Math.min(standardRaw, Math.round(simpleIncome * multiple));
  const estimateIncome = simpleOk ? simpleIncome : standardIncome;
  const estimateMethod = simpleOk ? "단순경비율" : "기준경비율";

  const book = taxFor(bookIncome, other, people);
  const est = taxFor(estimateIncome, other, people);
  // 간편장부대상자가 복식부기로 신고하면 기장세액공제(제56조의2). 간편장부로 신고하면 공제는 없어요.
  const bookCredit = doubleEntry ? 0 : Math.min(BOOK_RULES.creditCap, Math.round(book.calculated * book.share * BOOK_RULES.creditRate));
  const noBookPenalty = smallBiz ? 0 : floor10(est.calculated * est.share * BOOK_RULES.penaltyRate);
  const bookTax = floor10(Math.max(0, book.calculated - bookCredit));
  const bookTaxSimpleLedger = floor10(book.calculated);
  const estimateTax = floor10(est.calculated + noBookPenalty);
  const items                                                                   = [];
  items.push({ tone: "info", text: doubleEntry ? `직전 수입금액이 ${g.book.toLocaleString("ko-KR")}원 이상이라 복식부기의무자예요.` : `${isNew ? "신규사업자라" : `직전 수입금액이 ${g.book.toLocaleString("ko-KR")}원 미만이라`} 간편장부대상자예요.`, cite: "소득세법 시행령 제208조⑤" });
  items.push({ tone: "info", text: simpleOk ? `추계로 신고하면 단순경비율을 써요(${isNew ? "신규, 올해 수입이 간편장부 기준 미만" : `직전 수입 ${g.simple.toLocaleString("ko-KR")}원 미만`}).` : `추계로 신고하면 기준경비율을 써요. 증빙 있는 매입·임차료·인건비를 먼저 빼고, 단순경비율 소득 × ${multiple}배를 넘지 않게 잘라요(${BOOK_RULES.multipleUntilYear}년 귀속까지).`, cite: "소득세법 시행령 제143조③④" });
  if (noBookPenalty > 0) items.push({ tone: "warn", text: `장부 없이 추계로 신고하면 무기장가산세 약 ${noBookPenalty.toLocaleString("ko-KR")}원(산출세액 × 사업소득 비율 × 20%)이 붙어요.`, cite: "소득세법 제81조의5" });
  else items.push({ tone: "good", text: `신규사업자이거나 직전 수입금액이 ${BOOK_RULES.smallBusiness.toLocaleString("ko-KR")}원 미만이라 무기장가산세 대상이 아니에요.`, cite: "소득세법 시행령 제147조①·제132조④" });
  if (doubleEntry) items.push({ tone: "warn", text: "복식부기의무자가 장부 없이 추계로 신고하면 신고하지 않은 것으로 보아 무신고가산세 문제가 생길 수 있어요. 결론 전에 꼭 확인해요.", cite: "국세기본법 제47조의2" });
  if (!doubleEntry && bookCredit > 0) items.push({ tone: "good", text: `간편장부대상자가 복식부기 장부로 신고하면 기장세액공제 약 ${bookCredit.toLocaleString("ko-KR")}원(20%, 한도 100만 원)을 받아요. 소득을 20% 이상 빠뜨리거나 장부·증빙을 5년 보관하지 않으면 못 받아요.`, cite: "소득세법 제56조의2" });
  items.push({ tone: "info", text: "경비율은 업종코드마다 다르고 해마다 고시돼요. 국세청 경비율 조회로 내 업종코드 값을 넣어요.", cite: "국세청 기준·단순경비율 고시" });
  return {
    group: x.group, doubleEntry, simpleOk, smallBiz, multiple,
    bookIncome, estimateIncome, estimateMethod, simpleIncome, standardIncome,
    book: { ...book, credit: bookCredit, tax: bookTax, taxSimpleLedger: bookTaxSimpleLedger, local: floor10(bookTax * 0.1) },
    estimate: { ...est, penalty: noBookPenalty, tax: estimateTax, local: floor10(estimateTax * 0.1) },
    better: bookTax < estimateTax ? "book" : bookTax > estimateTax ? "estimate" : "same",
    gap: Math.abs(bookTax - estimateTax),
    items, cite: "소득세법 제56조의2·제80조·제81조의5, 시행령 제143조·제208조",
  };
}

/** 실제 경비를 바꿔 가며 장부·추계 세금을 비교(그래프용). */
export function bookVsEstimateCurve(x           , steps = 10) {
  const out                                                        = [];
  const rev = pos(x.revenue);
  for (let i = 0; i <= steps; i++) {
    const expense = Math.round((rev * i) / steps / 10_000) * 10_000;
    const r = bookVsEstimate({ ...x, actualExpense: expense });
    out.push({ expense, book: r.book.tax, estimate: r.estimate.tax });
  }
  return out;
}

// ───────────────────────── 4. 면세 사업장현황신고 ─────────────────────────

                                                                                           
export const EXEMPT_KINDS                             = {
  medical: "의료업(병·의원)",
  vet: "수의업(동물병원)",
  pharmacy: "약국",
  personal: "인적용역(프리랜서·강사·유튜버·배달·대리운전 등)",
  academy: "학원·교습소",
  other: "그 밖의 면세 사업(농산물 판매 등)",
};

export function exemptBusinessReport(x                                                                                                                                   ) {
  const year = Math.floor(Number(x.year) || 2026);
  const statutory = new Date(Date.UTC(year + 1, 1, 10));
  const due = krTaxDeadlineUTC(statutory);
  const kind = x.kind in EXEMPT_KINDS ? x.kind : "other";
  const penaltyApplies = kind === "medical" || kind === "vet" || kind === "pharmacy";
  const unreported = pos(x.unreported);
  const penalty = penaltyApplies ? floor10(unreported * 0.005) : 0;
  const must = !x.vatFiledAll;
  const items                                                                   = [];
  if (!must) items.push({ tone: "good", text: "부가가치세 신고를 한 과세사업자는 사업장현황신고를 한 것으로 봐요.", cite: "소득세법 제78조①" });
  else items.push({ tone: "info", text: `${year}년 면세 수입금액을 ${year + 1}년 2월 10일까지${statutory.getTime() !== due.getTime() ? `(휴일이라 ${iso(due)})` : ""} 사업장 관할 세무서에 신고해요. 그해 폐업·휴업했어도 해요.`, cite: "소득세법 제78조①" });
  if (x.mixed) items.push({ tone: "info", text: "과세·면세를 같이 하면 부가세로 신고하지 않은 면세 수입분만 사업장현황신고를 해요.", cite: "소득세법 제78조①" });
  if (kind === "personal") items.push({ tone: "info", text: "3.3%를 떼고 받은 인적용역 소득도 사업소득이라 면세 사업자로서 수입금액을 신고하는 대상이에요. 5월 종합소득세 신고와는 따로 있는 신고예요.", cite: "소득세법 제78조" });
  if (penaltyApplies) items.push({ tone: "warn", text: `${EXEMPT_KINDS[kind]}은 신고하지 않거나 덜 신고한 수입금액의 0.5% 가산세가 붙어요. 산출세액이 없어도 붙어요.${unreported ? ` 지금 입력 기준 약 ${penalty.toLocaleString("ko-KR")}원이에요.` : ""}`, cite: "소득세법 제81조의3, 시행령 제147조의2" });
  else items.push({ tone: "info", text: "의료·수의·약국이 아니면 신고를 안 해도 사업장현황신고 가산세는 없어요. 다만 수입금액 자료가 5월 종합소득세 신고와 경비율 판단의 바탕이 되니 맞춰 두는 게 좋아요.", cite: "소득세법 제81조의3" });
  items.push({ tone: "info", text: "납세조합에 가입한 사업자 등 시행령으로 정한 일부는 신고하지 않아도 돼요.", cite: "소득세법 제78조③" });
  return { year, kind, label: EXEMPT_KINDS[kind], statutoryDue: iso(statutory), due: iso(due), dday: dday(due, x.today), must, penaltyApplies, unreported, penalty, items, cite: "소득세법 제78조·제81조의3" };
}

// ───────────────────────── 5. 사적연금 1,500만 원 분리 vs 종합 ─────────────────────────

export const PENSION_RULES = { separateLimit: 15_000_000, separateRate: 0.15, deductionCap: 9_000_000, lifelongRate: 0.03 }         ;

/** 연금소득공제(소득세법 제47조의2, 한도 900만 원). */
export function pensionIncomeDeduction(total        )         {
  const p = pos(total);
  let d        ;
  if (p <= 3_500_000) d = p;
  else if (p <= 7_000_000) d = 3_500_000 + (p - 3_500_000) * 0.4;
  else if (p <= 14_000_000) d = 4_900_000 + (p - 7_000_000) * 0.2;
  else d = 6_300_000 + (p - 14_000_000) * 0.1;
  return Math.round(Math.min(d, PENSION_RULES.deductionCap));
}

/** 연금계좌 연금수령 원천징수세율(제129조①5의2). 종신계약이면 3%, 둘 다 맞으면 낮은 세율. */
export function pensionWithholdingRate(age        , lifelong = false)         {
  const a = Number(age) || 0;
  const byAge = a >= 80 ? 0.03 : a >= 70 ? 0.04 : 0.05;
  return lifelong ? Math.min(byAge, PENSION_RULES.lifelongRate) : byAge;
}

                            
                                                                           
                         
              
                     
                            
                         
                              
                       
                  
  

export function pensionIncomeChoice(x              ) {
  const priv = pos(x.privatePension), pub = pos(x.publicPension), other = pos(x.otherIncome);
  const people = Math.max(1, Math.floor(Number(x.people) || 1));
  const wRate = pensionWithholdingRate(x.age, x.lifelong);
  const withheld = floor10(priv * wRate);
  const over = priv > PENSION_RULES.separateLimit;
  const ded = people * PERSONAL_DEDUCTION_PER_PERSON;
  const comprehensiveTax = (pensionTotal        ) => basicIncomeTax(Math.max(0, pensionTotal - pensionIncomeDeduction(pensionTotal) + other - ded));
  // 종합과세: 공적 + 사적연금을 합쳐 연금소득공제 후 기본세율
  const combined = floor10(comprehensiveTax(pub + priv));
  // 분리과세: 공적연금·다른 소득만 종합과세 + 사적연금은 1,500만 원 이하면 원천징수로 끝, 초과면 15%
  const rest = floor10(comprehensiveTax(pub));
  const separatePart = over ? floor10(priv * PENSION_RULES.separateRate) : withheld;
  const separate = rest + separatePart;
  const better = combined < separate ? "combined" : combined > separate ? "separate" : "same";
  const items                                                                   = [];
  items.push({ tone: "info", text: `받을 때 ${Math.round(wRate * 1000) / 10}%(지방소득세 별도)를 떼요${x.lifelong ? " — 종신계약은 3%" : ""}.`, cite: "소득세법 제129조①5의2" });
  if (!over) items.push({ tone: "good", text: `사적연금이 연 ${PENSION_RULES.separateLimit.toLocaleString("ko-KR")}원 이하라 떼인 세금으로 끝낼 수 있어요(분리과세). 종합과세가 더 적으면 5월에 합쳐서 신고해도 돼요.`, cite: "소득세법 제14조③9호다목" });
  else items.push({ tone: "warn", text: `사적연금이 연 ${PENSION_RULES.separateLimit.toLocaleString("ko-KR")}원을 넘어 5월에 종합과세와 15% 분리과세 중 하나를 골라 신고해요.`, cite: "소득세법 제64조의4" });
  items.push({ tone: "info", text: "퇴직금을 연금으로 받는 부분과 부득이한 사유로 인출한 금액은 1,500만 원 계산에서 빼요.", cite: "소득세법 제14조③9호다목" });
  items.push({ tone: "info", text: "세액공제(표준·기부 등)와 다른 공제는 빼고 단순 비교했어요. 두 방식의 차이를 보는 용도예요.", cite: "어림" });
  return {
    privatePension: priv, publicPension: pub, otherIncome: other, withholdingRate: wRate, withheld, over,
    combined: { tax: combined, local: floor10(combined * 0.1), deduction: pensionIncomeDeduction(pub + priv) },
    separate: { tax: separate, local: floor10(separate * 0.1), restTax: rest, pensionTax: separatePart },
    better, gap: Math.abs(combined - separate), items,
    cite: "소득세법 제14조③·제47조의2·제64조의4·제129조",
  };
}

/** 사적연금 수령액을 바꿔 가며 두 방식 세금(그래프용). */
export function pensionCurve(x              , from = 5_000_000, to = 40_000_000, step = 2_500_000) {
  const out                                                            = [];
  for (let v = from; v <= to; v += step) {
    const r = pensionIncomeChoice({ ...x, privatePension: v });
    out.push({ pension: v, combined: r.combined.tax, separate: r.separate.tax });
  }
  return out;
}

export const NTS_PACK_NOTE = "국세청이 자주 안내하는 주제를 법령 원문 기준으로 어림한 계산이에요. 실제 세액·가산세·상환액은 신고 내용과 고시, 개별 사정에 따라 달라요. 신고서 작성과 제출은 직접 하거나 세무 전문가에게 맡겨요.";
