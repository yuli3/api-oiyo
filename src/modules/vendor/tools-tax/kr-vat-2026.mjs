// GENERATED from tools-oiyo src/lib/kr-vat-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// Korean VAT practice rules for 2026, shared by the VAT penalty calculator and the
// deemed rent (간주임대료) calculator. Values were checked on 2026-10-12; see
// company-brain projects/oiyo-ecosystem/tax-practice-toolkit-plan-2026-10-12.md for sources.
// When a rule changes, update the tables and the tests, not the formulas.

export const VAT_RATES_AS_OF = "2026-10-12";

export const VAT_RATES = {
  vat: 0.1,
  noFiling: 0.2, // 무신고가산세 (국세기본법 제47조의2)
  underFiling: 0.1, // 과소신고가산세 (제47조의3)
  fraud: 0.4, // 부정행위로 인한 무신고·과소신고
  latePaymentPerDay: 0.00022, // 납부지연가산세 1일 22/100,000 (제47조의4)
  deemedRentInterest: 0.031, // 간주임대료 정기예금이자율 연 3.1% (부가가치세법 시행규칙 제47조)
}         ;

/** 세금계산서 관련 가산세율 (부가가치세법 제60조), 공급가액 기준 */
export const INVOICE_PENALTIES = {
  missing: { label: "세금계산서 미발급", rate: 0.02 },
  late: { label: "세금계산서 지연발급", rate: 0.01 },
  paper: { label: "전자 의무자의 종이 세금계산서 발급", rate: 0.01 },
  lateSend: { label: "전자세금계산서 지연전송", rate: 0.003 },
  noSend: { label: "전자세금계산서 미전송", rate: 0.005 },
}         ;

                                                          

/** [법정신고기한 후 몇 개월 이내, 감면율] — 국세기본법 제48조 제2항 */
export const LATE_FILING_RELIEF                                         = [[1, 0.5], [3, 0.3], [6, 0.2]];
export const AMENDED_FILING_RELIEF                                         = [[1, 0.9], [3, 0.75], [6, 0.5], [12, 0.3], [18, 0.2], [24, 0.1]];

// ---- dates as "YYYY-MM-DD" strings, computed in UTC so the browser time zone never shifts a day

const DAY_MS = 86_400_000;

function parts(iso        )                           {
  const [y, m, d] = iso.split("-").map(Number);
  return [y, m, d];
}

function toIso(ms        )         {
  return new Date(ms).toISOString().slice(0, 10);
}

export function isIsoDate(value        )          {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = parts(value);
  return toIso(Date.UTC(y, m - 1, d)) === value;
}

/** b − a in days ("2026-07-27" → "2026-07-28" is 1). */
export function daysBetween(a        , b        )         {
  const [ay, am, ad] = parts(a);
  const [by, bm, bd] = parts(b);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / DAY_MS);
}

/** Same day n months later; a missing day (1/31 + 1 month) becomes the month's last day. */
export function addMonths(iso        , months        )         {
  const [y, m, d] = parts(iso);
  const lastDay = new Date(Date.UTC(y, m - 1 + months + 1, 0)).getUTCDate();
  return toIso(Date.UTC(y, m - 1 + months, Math.min(d, lastDay)));
}

/** 기한이 토·일요일이면 다음 월요일 (국세기본법 제5조). 공휴일은 다루지 않는다. */
export function nextWeekday(iso        )         {
  const [y, m, d] = parts(iso);
  const ms = Date.UTC(y, m - 1, d);
  const day = new Date(ms).getUTCDay();
  return day === 6 ? toIso(ms + 2 * DAY_MS) : day === 0 ? toIso(ms + DAY_MS) : iso;
}

export const isLeapYear = (year        ) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

// Round to 1e-6 first so 3,000,000 × 14 × 0.00022 stays 9,240 instead of 9,239.999….
const floorWon = (won        ) => Math.floor(Math.round(won * 1e6) / 1e6);

// ---- VAT penalties

                                                    

                               
                      
                            
              
                 
                  
                   
                                
                
                                 
                         
                 
 

                              
                                       
                
               
               
                
                 
                 
 

                                
                       
                
                   
                     
                                  
                            
 

function reliefFor(table                                        , deadline        , filed        )                                        {
  for (const [months, rate] of table) {
    if (filed <= addMonths(deadline, months)) return { rate, band: `${months}개월 이내 ${Math.round(rate * 100)}%` };
  }
  return { rate: 0, band: null };
}

export function vatPenalty(input              )                {
  const { filing, tax, fraud, deadline, filed, invoice, supply } = input;
  const daysLate = Math.max(0, daysBetween(deadline, filed));
  const lines                = [];
  let reliefRate = 0;
  let reliefBand                = null;

  if (filing !== "none" && tax > 0) {
    const rate = fraud ? VAT_RATES.fraud : filing === "late" ? VAT_RATES.noFiling : VAT_RATES.underFiling;
    const relief = reliefFor(filing === "late" ? LATE_FILING_RELIEF : AMENDED_FILING_RELIEF, deadline, filed);
    reliefRate = relief.rate;
    reliefBand = relief.band;
    const gross = floorWon(tax * rate);
    const reliefAmount = floorWon(gross * relief.rate);
    lines.push({
      id: "filing",
      label: `${filing === "late" ? "무신고" : "과소신고"}가산세${fraud ? "(부정행위)" : ""}`,
      base: tax,
      rate,
      gross,
      relief: reliefAmount,
      amount: gross - reliefAmount,
    });
    const payment = floorWon(tax * daysLate * VAT_RATES.latePaymentPerDay);
    lines.push({ id: "payment", label: "납부지연가산세", base: tax, rate: VAT_RATES.latePaymentPerDay * daysLate, gross: payment, relief: 0, amount: payment });
  }

  if (invoice !== "none" && supply > 0) {
    const { label, rate } = INVOICE_PENALTIES[invoice];
    const amount = floorWon(supply * rate);
    lines.push({ id: "invoice", label, base: supply, rate, gross: amount, relief: 0, amount });
  }

  return { lines, total: lines.reduce((sum, line) => sum + line.amount, 0), daysLate, reliefRate, reliefBand };
}

// ---- deemed rent (간주임대료)

                                  
                  
                
              
                                               
                
 

                                   
               
                   
               
                     
              
 

/** 간주임대료 = 보증금 × 과세대상 일수 × 이자율 ÷ 365(윤년 366), 부가세는 그 10%. 원 미만 버림. */
export function deemedRent({ deposit, start, end, rate = VAT_RATES.deemedRentInterest }                 )                   {
  const days = Math.max(0, daysBetween(start, end) + 1);
  const yearDays = isLeapYear(parts(start)[0]) ? 366 : 365;
  const rent = floorWon((deposit * days * rate) / yearDays);
  return { days, yearDays, rate, deemedRent: rent, vat: floorWon(rent * VAT_RATES.vat) };
}

/** 부가세 과세기간: 1기 1/1~6/30(예정 3/31), 2기 7/1~12/31(예정 9/30). 확정 기한은 다음 달 25일. */
export function vatPeriod(year        , half       )                                                   {
  return half === 1
    ? { start: `${year}-01-01`, end: `${year}-06-30`, deadline: `${year}-07-25` }
    : { start: `${year}-07-01`, end: `${year}-12-31`, deadline: `${year + 1}-01-25` };
}

// ---- one-line parsing

const N = String.raw`\d[\d,]*(?:\.\d+)?`;
const UNIT = String.raw`(?:억|천만|백만|만|천)`;
/** "3억", "1억 5천만", "300만원", "1만 320원", "10,000,000" — a bare trailing number needs 원 after it. */
export const AMOUNT = String.raw`(${N}\s*${UNIT}?(?:\s*${N}\s*${UNIT})*(?:\s*${N}(?=\s*원))?)`;
const UNIT_VALUE                         = { 억: 1e8, 천만: 1e7, 백만: 1e6, 만: 1e4, 천: 1e3 };

/** 억·천만·만·천 단위가 섞인 금액을 원 단위로 읽는다. */
export function parseKrAmount(text        )                {
  const s = text.replace(/[,\s원]/g, "");
  if (!s) return null;
  const re = new RegExp(`(\\d+(?:\\.\\d+)?)(${UNIT})?`, "gy");
  let total = 0;
  let index = 0;
  for (let m = re.exec(s); m && m[0]; m = re.exec(s)) {
    total += Number(m[1]) * (m[2] ? UNIT_VALUE[m[2]] : 1);
    index = re.lastIndex;
  }
  return index === s.length ? Math.round(total) : null;
}

// "2026-07-25", "2026.7.25", "2026년 7월 25일", "7월 25일". A bare "3.1" is a rate, not a date.
const DATE = String.raw`(\d{4})\s*[-./년]\s*(\d{1,2})\s*[-./월]\s*(\d{1,2})\s*일?|(\d{1,2})\s*월\s*(\d{1,2})\s*일`;

function datesIn(text        , year        )           {
  const out           = [];
  for (const m of text.matchAll(new RegExp(DATE, "g"))) {
    const [y, mo, d] = m[1] ? [m[1], m[2], m[3]] : [String(year), m[4], m[5]];
    const iso = `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
    if (isIsoDate(iso)) out.push(iso);
  }
  return out;
}

                                
                       
               
                  
                    
                 
                         
                  
 

/**
 * "1기 확정 기한후신고 세액 300만원 8월 10일 신고", "종이 세금계산서 공급가액 1000만원" 같은 한 줄에서 값을 뽑는다.
 * 날짜가 둘이면 앞이 법정기한, 뒤가 신고일이다. "N일 늦게"는 기한 + N일로 읽는다.
 */
export function parsePenaltyText(text        , defaultYear = 2026)                {
  const t = text.replace(/\s+/g, " ");
  const out                = {};
  const year = Number(t.match(/(\d{4})\s*년/)?.[1] ?? defaultYear);

  if (/무신고|기한\s*후|기한후|안\s*했|못\s*했|놓쳤/.test(t)) out.filing = "late";
  else if (/과소|수정\s*신고|적게|빠뜨|누락/.test(t)) out.filing = "under";
  if (/부정|허위|이중장부/.test(t)) out.fraud = true;

  if (/미전송/.test(t)) out.invoice = "noSend";
  else if (/지연\s*전송|늦게\s*전송/.test(t)) out.invoice = "lateSend";
  else if (/종이/.test(t)) out.invoice = "paper";
  else if (/지연\s*발급|늦게\s*발급/.test(t)) out.invoice = "late";
  else if (/미발급|발급\s*(?:안|못)/.test(t)) out.invoice = "missing";

  const amount = (re        ) => {
    const raw = t.match(re)?.[1];
    return raw === undefined ? undefined : parseKrAmount(raw) ?? undefined;
  };
  out.tax = amount(new RegExp(`(?:세액|납부세액|낼\\s*세금|부가세)\\s*${AMOUNT}`));
  out.supply = amount(new RegExp(`(?:공급가액|공급가|매출)\\s*${AMOUNT}`));

  const half = t.match(/([12])\s*기/)?.[1];
  const dates = datesIn(t, year);
  if (half) out.deadline = nextWeekday(vatPeriod(year, half === "1" ? 1 : 2).deadline);
  if (dates.length >= 2) {
    out.deadline = dates[0];
    out.filed = dates[1];
  } else if (dates.length === 1) {
    if (out.deadline) out.filed = dates[0];
    else out.deadline = dates[0];
  }
  const daysLate = t.match(/(\d+)\s*일\s*(?:늦게|지나|지연|뒤)/)?.[1];
  if (daysLate && out.deadline && !out.filed) {
    const [y, m, d] = parts(out.deadline);
    out.filed = toIso(Date.UTC(y, m - 1, d) + Number(daysLate) * DAY_MS);
  }
  const monthsLate = t.match(/(\d+)\s*(?:개월|달)\s*(?:늦게|지나|지연|뒤)/)?.[1];
  if (monthsLate && out.deadline && !out.filed) out.filed = addMonths(out.deadline, Number(monthsLate));

  for (const key of Object.keys(out)                           ) if (out[key] === undefined) delete out[key];
  return out;
}

                             
                   
                 
               
                
 

/** "보증금 1억 2기", "보증금 3억 7월 1일부터 9월 30일까지 이자율 3.1%" */
export function parseRentText(text        , defaultYear = 2026)             {
  const t = text.replace(/\s+/g, " ");
  const out             = {};
  const year = Number(t.match(/(\d{4})\s*년/)?.[1] ?? defaultYear);
  const raw = t.match(new RegExp(`(?:보증금|전세금)\\s*${AMOUNT}`))?.[1];
  const deposit = raw === undefined ? null : parseKrAmount(raw);
  if (deposit !== null) out.deposit = deposit;
  const half = t.match(/([12])\s*기/)?.[1];
  if (half) {
    const period = vatPeriod(year, half === "1" ? 1 : 2);
    out.start = period.start;
    out.end = period.end;
  }
  const dates = datesIn(t, year);
  if (dates[0]) out.start = dates[0];
  if (dates[1]) out.end = dates[1];
  const rate = t.match(/(\d+(?:\.\d+)?)\s*%/)?.[1];
  if (rate) out.rate = Number(rate) / 100;
  return out;
}
