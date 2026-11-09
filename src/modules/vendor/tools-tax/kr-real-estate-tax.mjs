// GENERATED from tools-oiyo src/lib/kr-real-estate-tax.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// Korean housing taxes for 2026: 취득세, 재산세, 양도소득세. Checked 2026-10-27.
// - 취득세: 지방세법 제11조 제1항 제8호(1~3%), 제13조의2(다주택 중과 8·12%), 제151조(지방교육세),
//   농어촌특별세법 제5조. 중과 때 지방교육세 0.4%, 85㎡ 초과 농특세 0.6%(8%)·1.0%(12%).
// - 재산세: 지방세법 제111조(주택 표준세율), 제111조의2(1세대1주택 공시 9억 이하 특례, 2026년까지),
//   시행령 제109조(공정시장가액비율 60%, 1주택 43·44·45% 2026년 유지), 제112조(도시지역분 0.14%).
// - 양도세: 소득세법 제55조(기본세율), 제89조·시행령 제154조·제156조(1주택 비과세·12억 고가주택),
//   제95조(장기보유특별공제 표1·표2), 제103조(기본공제 250만), 제104조(단기·중과 세율).
//   다주택 조정대상지역 중과는 2026-05-09까지 유예됐다가 2026-05-10 양도분부터 다시 적용돼요.
//   2026-08 세제개편안(2027년 이후 중과 완화, 장특공 개편)은 국회 통과 전이라 반영하지 않았어요.
import { basicIncomeTax } from "./kr-payroll-2026.mjs";

export const REAL_ESTATE_TAX_AS_OF = "2026-10-27";
const EOK = 100_000_000;
const floor10 = (n        ) => Math.floor(Math.round(n) / 10) * 10;

/* ---------- 취득세 ---------- */

/** 6~9억 구간 세율: (취득가액 × 2/3억원 − 3) × 1/100, 소수점 이하 다섯째 자리에서 반올림(예: 7억 → 0.0167) */
export function standardHomeRate(price        )         {
  if (price <= 6 * EOK) return 0.01;
  if (price > 9 * EOK) return 0.03;
  return Math.round((((price * 2) / (3 * EOK) - 3) / 100) * 10_000) / 10_000;
}

                                       

                                   
                
                                           
                     
                             
                     
                                    
                        
                    
                  
 

export function acquisitionHeavyRate({ houses, regulated, temporaryTwo }                  )                {
  if (houses === 1) return null;
  if (houses === 2) return regulated && !temporaryTwo ? 0.08 : null;
  if (houses === 3) return regulated ? 0.12 : 0.08;
  return 0.12;
}

export function acquisitionTax(input                  ) {
  const { price, over85 } = input;
  const heavy = acquisitionHeavyRate(input);
  const rate = heavy ?? standardHomeRate(price);
  const tax = floor10(price * rate);
  // 표준세율이면 지방교육세 = 세율의 50% × 20% = 취득세의 10%; 중과는 0.4%로 고정돼요.
  const education = floor10(heavy ? price * 0.004 : tax * 0.1);
  const ruralRate = !over85 ? 0 : heavy === 0.12 ? 0.01 : heavy === 0.08 ? 0.006 : 0.002;
  const rural = floor10(price * ruralRate);
  return { rate, heavy: heavy !== null, tax, education, rural, total: tax + education + rural };
}

/* ---------- 재산세 (주택) ---------- */

export function fairMarketRatio(official        , oneHouse         )         {
  if (!oneHouse) return 0.6;
  if (official <= 3 * EOK) return 0.43;
  if (official <= 6 * EOK) return 0.44;
  return 0.45;
}

const PROPERTY_BRACKETS = [
  { upTo: 60_000_000, rate: 0.001, minus: 0 },
  { upTo: 150_000_000, rate: 0.0015, minus: 30_000 },
  { upTo: 300_000_000, rate: 0.0025, minus: 180_000 },
  { upTo: Infinity, rate: 0.004, minus: 630_000 },
]         ;

/** 주택 재산세 본세. special이면 각 구간 세율에서 0.05%p를 빼요(누진공제액은 같아요). */
export function housePropertyTax(base        , special         )         {
  const b = PROPERTY_BRACKETS.find((x) => base <= x.upTo) ;
  return floor10(Math.max(0, base * (b.rate - (special ? 0.0005 : 0)) - b.minus));
}

export function propertyTax(official        , oneHouse         , urbanArea = true) {
  const ratio = fairMarketRatio(official, oneHouse);
  const base = Math.floor((official * ratio) / 1000) * 1000;
  const special = oneHouse && official <= 9 * EOK;
  const tax = housePropertyTax(base, special);
  const urban = urbanArea ? floor10(base * 0.0014) : 0;
  const education = floor10(tax * 0.2);
  return { ratio, base, special, tax, urban, education, total: tax + urban + education };
}

/* ---------- 양도소득세 ---------- */

                                          

                             
                  
               
                   
                                
                   
                    
                    
                                         
                    
                                                  
                          
                           
                     
 

export const HIGH_PRICE_LINE = 12 * EOK;
export const BASIC_DEDUCTION = 2_500_000;

/** 장기보유특별공제 표1: 3년 이상 6%, 1년마다 2%p, 15년 이상 30% */
export function longTermRateGeneral(holdYears        )         {
  const y = Math.floor(holdYears);
  return y < 3 ? 0 : Math.min(0.3, 0.06 + (y - 3) * 0.02);
}

/** 장기보유특별공제 표2(1세대1주택, 2년 이상 거주): 보유 연 4%·거주 연 4%, 각 40%, 합계 80% */
export function longTermRateOneHouse(holdYears        , liveYears        )         {
  const h = Math.floor(holdYears);
  const l = Math.floor(liveYears);
  if (h < 3) return 0;
  const hold = Math.min(10, h) * 0.04;
  const live = l < 2 ? 0 : Math.min(10, l) * 0.04;
  return hold + live;
}

export function capitalGainsTax(input            ) {
  const { kind, sale, purchase, expenses, holdYears, liveYears, houses, exemptEligible, regulated } = input;
  const gain = Math.max(0, sale - purchase - expenses);
  const oneHouse = kind === "house" && houses === 1 && exemptEligible;
  if (oneHouse && sale <= HIGH_PRICE_LINE) {
    return { gain, exempt: true, taxableGain: 0, longTermRate: 0, longTerm: 0, base: 0, heavyAdd: 0, rateLabel: "비과세", tax: 0, local: 0, total: 0 };
  }
  // 12억 초과 1주택은 초과분 비율만큼만 과세해요(시행령 제160조).
  const taxableGain = oneHouse ? Math.floor((gain * (sale - HIGH_PRICE_LINE)) / sale) : gain;
  const heavyAdd = kind === "house" && regulated && houses >= 2 ? (houses === 2 ? 0.2 : 0.3) : 0;
  let longTermRate = 0;
  if (heavyAdd === 0) {
    longTermRate = oneHouse && Math.floor(liveYears) >= 2 ? longTermRateOneHouse(holdYears, liveYears) : longTermRateGeneral(holdYears);
  }
  const longTerm = Math.floor(taxableGain * longTermRate);
  const base = Math.max(0, taxableGain - longTerm - BASIC_DEDUCTION);

  const progressive = basicIncomeTax(base) + base * heavyAdd;
  const shortRate = holdYears < 1 ? (kind === "house" ? 0.7 : 0.5) : holdYears < 2 ? (kind === "house" ? 0.6 : 0.4) : 0;
  const short = base * shortRate;
  // 단기 세율과 (중과) 누진세율 중 큰 세액을 적용해요(제104조 제7항).
  const useShort = short > progressive;
  const tax = floor10(useShort ? short : progressive);
  const rateLabel = useShort ? `단기 ${shortRate * 100}%` : heavyAdd ? `기본세율 + ${heavyAdd * 100}%p 중과` : "기본세율 6~45%";
  const local = floor10(tax * 0.1);
  return { gain, exempt: false, taxableGain, longTermRate, longTerm, base, heavyAdd, rateLabel, tax, local, total: tax + local };
}
