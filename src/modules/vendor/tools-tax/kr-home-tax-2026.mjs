// GENERATED from tools-oiyo src/lib/kr-home-tax-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 집 가진 사람의 세금 2종 (2026-11-16, Gemini 공익 도구 인수 2차): 종합부동산세(주택분)와 주택임대소득세.
// 재산세 공식은 kr-real-estate-tax.ts, 소득세 기본세율은 kr-payroll-2026.ts를 그대로 써요.
// 화면 components/tools/welfare/, Claude 스킬·MCP는 이 파일을 복사해 써요(drift 테스트).
import { fairMarketRatio, housePropertyTax } from "./kr-real-estate-tax.mjs";
import { basicIncomeTax } from "./kr-payroll-2026.mjs";

export const HOME_TAX_AS_OF = "2026-11-16";
const EOK = 100_000_000;
const clamp0 = (n        ) => (Number.isFinite(n) && n > 0 ? n : 0);
const floor10 = (n        ) => Math.floor(Math.round(n) / 10) * 10;

// ───────────────────────── 종합부동산세(주택분) ─────────────────────────
// 종합부동산세법 제8조(기본공제 9억, 1세대 1주택 12억, 법인 0, 공정시장가액비율 60%), 제9조(세율, 2023 개정),
// 제9조③(재산세 중복분 공제), 제9조⑤~⑨(1세대 1주택 고령자·장기보유 세액공제, 합계 80%), 농어촌특별세법 제5조(20%).
// 세부담 상한(전년 대비 150%)은 전년 세액이 필요해서 넣지 않았어요.

export const CRE_GENERAL = [
  { upTo: 3 * EOK, rate: 0.005 },
  { upTo: 6 * EOK, rate: 0.007 },
  { upTo: 12 * EOK, rate: 0.01 },
  { upTo: 25 * EOK, rate: 0.013 },
  { upTo: 50 * EOK, rate: 0.015 },
  { upTo: 94 * EOK, rate: 0.02 },
  { upTo: Infinity, rate: 0.027 },
]         ;
export const CRE_HEAVY = [
  { upTo: 3 * EOK, rate: 0.005 },
  { upTo: 6 * EOK, rate: 0.007 },
  { upTo: 12 * EOK, rate: 0.01 },
  { upTo: 25 * EOK, rate: 0.02 },
  { upTo: 50 * EOK, rate: 0.03 },
  { upTo: 94 * EOK, rate: 0.04 },
  { upTo: Infinity, rate: 0.05 },
]         ;
export const CRE_FAIR_RATIO = 0.6;

const progressive = (base        , table                                           ) => {
  let tax = 0;
  let lower = 0;
  for (const { upTo, rate } of table) {
    if (base <= lower) break;
    tax += (Math.min(base, upTo) - lower) * rate;
    lower = upTo;
  }
  return tax;
};

export const seniorCreditRate = (age        ) => (age >= 70 ? 0.4 : age >= 65 ? 0.3 : age >= 60 ? 0.2 : 0);
export const holdingCreditRate = (years        ) => (years >= 15 ? 0.5 : years >= 10 ? 0.4 : years >= 5 ? 0.2 : 0);

                           
                           
                   
                                   
                    
                                
                      
               
                     
 

export function comprehensiveRealEstateTax(input          ) {
  const prices = input.prices.map(clamp0).filter((p) => p > 0);
  const total = prices.reduce((a, b) => a + b, 0);
  const houses = prices.length;
  const corporate = !!input.corporate;
  const oneHouse = !corporate && input.oneHouse && houses === 1;
  const heavy = houses >= 3;
  const deduction = corporate ? 0 : oneHouse ? 12 * EOK : 9 * EOK;
  const base = Math.floor((Math.max(0, total - deduction) * CRE_FAIR_RATIO) / 1000) * 1000;
  const rawTax = corporate ? base * (heavy ? 0.05 : 0.027) : progressive(base, heavy ? CRE_HEAVY : CRE_GENERAL);
  // 재산세 중복분: 재산세 부과세액 × (종부세 과표 × 재산세 공정시장가액비율 × 0.4%) ÷ (주택별 표준세율 재산세 합)
  const propertyTaxes = prices.map((p) => housePropertyTax(Math.floor((p * fairMarketRatio(p, oneHouse)) / 1000) * 1000, oneHouse && p <= 9 * EOK));
  const standardTaxes = prices.map((p) => housePropertyTax(Math.floor((p * fairMarketRatio(p, oneHouse)) / 1000) * 1000, false));
  const propertyTax = propertyTaxes.reduce((a, b) => a + b, 0);
  const standardSum = standardTaxes.reduce((a, b) => a + b, 0);
  const overlapRatio = oneHouse ? fairMarketRatio(total, true) : 0.6;
  const overlap = standardSum > 0 ? Math.min(propertyTax, (propertyTax * (base * overlapRatio * 0.004)) / standardSum) : 0;
  const afterOverlap = Math.max(0, rawTax - overlap);
  const senior = oneHouse ? seniorCreditRate(input.age ?? 0) : 0;
  const holding = oneHouse ? holdingCreditRate(input.holdYears ?? 0) : 0;
  const creditRate = Math.min(0.8, senior + holding);
  const tax = floor10(afterOverlap * (1 - creditRate));
  const rural = floor10(tax * 0.2);
  return {
    houses, total, deduction, base, heavy, oneHouse,
    rawTax: floor10(rawTax), overlap: floor10(overlap), propertyTax, creditRate, seniorRate: senior, holdingRate: holding,
    credit: floor10(afterOverlap * creditRate), tax, rural, totalTax: tax + rural,
    installment: tax > 2_500_000,
  };
}

/** 종부세 대상이 되는 공시가격 합계(이 값을 넘으면 과세) */
export const creThreshold = (oneHouse         ) => (oneHouse ? 12 * EOK : 9 * EOK);

// ───────────────────────── 주택임대소득세 ─────────────────────────
// 소득세법 제12조(1주택 비과세, 기준시가 12억 초과·국외 주택 제외), 제25조(간주임대료: 3주택 이상 보증금 합계 3억 초과,
// (보증금 − 3억) × 60% × 정기예금이자율), 제64조의2(수입 2천만 원 이하 분리과세 14%, 필요경비 등록 60%·미등록 50%,
// 다른 종합소득 2천만 원 이하면 기본공제 등록 400만·미등록 200만). 정기예금이자율 3.1%는 2025 귀속 값이에요.
// 2026 귀속부터 기준시가 12억 초과 2주택자 간주임대료 과세가 생겼지만 세부 요건은 화면에서 확인하라고만 안내해요.

export const RENTAL = { separateLimit: 20_000_000, rate: 0.14, depositFree: 300_000_000, depositRatio: 0.6, defaultInterest: 0.031 }         ;

                              
                                
                 
                                    
                              
                    
                     
                    
                   
                         
                      
                            
                      
                       
                        
                            
                             
                                                         
                        
 

export function rentalIncomeTax(input             ) {
  const houses = Math.max(0, Math.floor(input.houses));
  const annualRent = clamp0(input.annualRent);
  const deposits = clamp0(input.deposits);
  const rate = input.interestRate ?? RENTAL.defaultInterest;
  const exempt = houses <= 1 && !input.highPriceOneHouse;
  const deemed = houses >= 3 && deposits > RENTAL.depositFree ? Math.floor((deposits - RENTAL.depositFree) * RENTAL.depositRatio * rate) : 0;
  const revenue = exempt ? 0 : annualRent + deemed;
  const expenseRate = input.registered ? 0.6 : 0.5;
  const basic = clamp0(input.otherIncome) <= 20_000_000 ? (input.registered ? 4_000_000 : 2_000_000) : 0;
  const separateAllowed = revenue > 0 && revenue <= RENTAL.separateLimit;
  const separateBase = Math.max(0, revenue * (1 - expenseRate) - basic);
  const separateTax = separateAllowed ? Math.round(separateBase * RENTAL.rate) : null;
  const otherBase = input.otherTaxBase ?? clamp0(input.otherIncome) * 0.7;
  const compExpense = input.actualExpenseRate ?? expenseRate;
  const rentalIncome = Math.max(0, revenue * (1 - compExpense));
  const comprehensiveTax = Math.round(basicIncomeTax(otherBase + rentalIncome) - basicIncomeTax(otherBase));
  const withLocal = (t               ) => (t === null ? null : t + Math.floor(t * 0.1));
  const sep = withLocal(separateTax);
  const comp = withLocal(comprehensiveTax) ?? 0;
  const better = sep === null ? "comprehensive" : sep <= comp ? "separate" : "comprehensive";
  return {
    exempt, deemed, revenue, expenseRate, basic, separateAllowed, separateBase,
    separateTax: sep, comprehensiveTax: comp, better: better                                ,
    tax: revenue === 0 ? 0 : better === "separate" && sep !== null ? sep : comp,
    highTwoHouseNotice: houses === 2 && deposits > 12 * EOK,
  };
}
