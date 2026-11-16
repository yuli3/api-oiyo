// GENERATED from tools-oiyo src/lib/kr-legal-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 법정이자와 소멸시효 계산. Checked 2026-10-27.
// - 법정이율: 민법 제379조 연 5%, 상법 제54조 연 6%(상행위 채무).
// - 소송촉진 등에 관한 특례법 제3조 제1항 + 법정이율에 관한 규정: 소장·지급명령이 송달된 다음 날부터 연 12%.
// - 이자는 단리, 1년 365일 일할로 계산한다. 기산일과 끝나는 날을 모두 넣는다("~부터 ~까지" 판결 문언과 같다).
// - 소멸시효: 민법 제162조(일반 10년), 제163조(3년 단기), 제164조(1년 단기), 제766조(불법행위 3년·10년),
//   상법 제64조(상사 5년), 근로기준법 제49조(임금 3년).
// - 기간 계산: 민법 제157조(초일 불산입), 제160조(역에 의한 계산, 해당일이 없으면 그 달 말일),
//   제161조(말일이 토요일이나 공휴일이면 다음 날). 근로자의 날(5/1)은 민법상 공휴일이 아니라서 빼요.
import { KR_HOLIDAYS } from "./kr-business-day.mjs";

export const LEGAL_AS_OF = "2026-10-27";
export const LEGAL_RATES = { civil: 0.05, commercial: 0.06, litigation: 0.12 }         ;

const DAY = 86_400_000;
const utc = (iso        ) => {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};
const iso = (t        ) => new Date(t).toISOString().slice(0, 10);

/** 기산일부터 끝나는 날까지(양 끝 포함) 날수. */
export function inclusiveDays(start        , end        )         {
  return Math.max(0, Math.round((utc(end) - utc(start)) / DAY) + 1);
}

                                
                    
                      
                
                         
              
                              
               
                                         
                    
 

                                 
               
             
               
               
                   
 

export function legalInterest({ principal, start, end, rate, servedOn }               ) {
  const p = Math.max(0, principal);
  const periods                   = [];
  const push = (from        , to        , r        ) => {
    const days = inclusiveDays(from, to);
    if (days > 0) periods.push({ from, to, days, rate: r, interest: Math.floor((p * r * days) / 365) });
  };
  if (utc(end) >= utc(start)) {
    if (servedOn && utc(servedOn) < utc(end)) {
      const switchDay = iso(Math.max(utc(servedOn) + DAY, utc(start)));
      if (utc(switchDay) > utc(start)) push(start, iso(utc(switchDay) - DAY), rate);
      push(switchDay, end, LEGAL_RATES.litigation);
    } else {
      push(start, end, rate);
    }
  }
  const interest = periods.reduce((s, x) => s + x.interest, 0);
  return { principal: p, periods, days: periods.reduce((s, x) => s + x.days, 0), interest, total: p + interest };
}

/* ---------- 소멸시효 ---------- */

                                                                                                             

export const CLAIMS                                                                                 = {
  civil: { years: 10, label: "일반 민사채권 (10년)", law: "민법 제162조 제1항", note: "빌려준 돈처럼 상행위가 아닌 일반 채권이에요." },
  commercial: { years: 5, label: "상사채권 (5년)", law: "상법 제64조", note: "한쪽에게라도 상행위가 되는 거래(물품대금 외 상인 간 대여금 등)에서 생긴 채권이에요." },
  wage: { years: 3, label: "임금·퇴직금 (3년)", law: "근로기준법 제49조", note: "각 임금의 정기 지급일(퇴직금은 퇴직일로부터 14일이 지난 날)부터 셉니다." },
  short3: { years: 3, label: "3년 단기 (이자·사용료·의료비·공사대금·물품대금 등)", law: "민법 제163조", note: "1년 이내 기간으로 정한 이자·사용료, 의사·변호사 보수, 공사대금, 상인이 판 물건 대금 등이에요." },
  short1: { years: 1, label: "1년 단기 (숙박·음식·대여료·노임 등)", law: "민법 제164조", note: "여관·음식점 대금, 동산 사용료, 노역인·연예인의 임금 등이에요." },
  tortKnown: { years: 3, label: "불법행위: 손해와 가해자를 안 날부터 (3년)", law: "민법 제766조 제1항", note: "안 날부터 3년과 행위한 날부터 10년 중 먼저 오는 날에 끝나요." },
  tortOccurred: { years: 10, label: "불법행위: 행위한 날부터 (10년)", law: "민법 제766조 제2항", note: "미성년자 성폭력 피해는 성년이 될 때까지 진행하지 않아요(제766조 제3항)." },
};

/** 민법상 공휴일: 토·일, 관공서 공휴일. 근로자의 날(05-01)은 제외해요. */
export function isCivilHoliday(t        )                                       {
  const d = new Date(t);
  const day = d.getUTCDay();
  const year = d.getUTCFullYear();
  const list = KR_HOLIDAYS[year];
  const md = iso(t).slice(5);
  if (day === 0 || day === 6) return { holiday: true, known: true };
  return { holiday: !!list && md !== "05-01" && list.includes(md), known: !!list };
}

/** 기산일(사건일·인지일)과 시효 연수로 시효가 끝나는 날을 구해요. */
export function limitationExpiry(baseDate        , years        ) {
  const [y, m, d] = baseDate.split("-").map(Number);
  // 초일 불산입: 다음 날부터 세고, 끝나는 날은 기산일과 같은 월·일(없으면 그 달 말일).
  const lastOfMonth = new Date(Date.UTC(y + years, m, 0)).getUTCDate();
  let t = Date.UTC(y + years, m - 1, Math.min(d, lastOfMonth));
  const nominal = iso(t);
  let holidaysKnown = true;
  for (;;) {
    const h = isCivilHoliday(t);
    if (!h.known) holidaysKnown = false;
    if (!h.holiday) break;
    t += DAY;
  }
  return { nominal, expiry: iso(t), extended: iso(t) !== nominal, holidaysKnown };
}

/** today 기준 남은 날(시효 마지막 날 당일은 0일, 지났으면 음수). */
export function daysUntil(today        , expiry        )         {
  return Math.round((utc(expiry) - utc(today)) / DAY);
}
