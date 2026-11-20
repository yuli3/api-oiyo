// GENERATED from tools-oiyo src/lib/kr-audit-deferred-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 이연법인세와 감사 중요성·표본 크기 (2026-11-21, 전문 직군 전수조사 남은 빈칸). 회계·감사 실무자가 결산·감사 계획 숫자를 맞춰 보는 용도예요.
// 같은 코드가 kr-tax-advisor 스킬 scripts/calc.mjs deferred-tax / materiality / sample 로 들어가요. 감사의견이나 회계 판단을 대신하지 않아요.
// 근거:
// - 이연법인세: K-IFRS 1012호(일시적차이 × 소멸될 때 적용할 세율, 이연법인세자산은 미래 과세소득이 있을 가능성이 높을 때만 인식),
//   일반기업회계기준 22장. 세율은 법인세법 제55조 2026년 과세표준 구간(10·20·22·25%)에 지방소득세 10%를 더한 평균세율을 기본으로 써요.
// - 중요성: 감사기준서 320(전체 중요성·수행 중요성), 450(명백히 사소한 금액). 기준치 비율은 실무 관행 범위예요(법정 비율이 아니에요).
// - 표본: 감사기준서 530. 금액단위표본(MUS)은 n = 모집단 × 신뢰계수 ÷ (허용왜곡 − 예상왜곡 × 확장계수),
//   신뢰계수는 오류 0개 포아송 계수(80% 1.61, 90% 2.31, 95% 3.00, 99% 4.61), 확장계수는 AICPA 감사표본 지침 표(80% 1.3, 90% 1.5, 95% 1.6, 99% 1.9).
//   속성표본(통제 테스트, 예상 이탈 0)은 n = ln(1 − 신뢰수준) ÷ ln(1 − 허용이탈률).
import { corporateTax2026 } from "./kr-incorporation-2026.mjs";

export const AUDIT_DEFERRED_AS_OF = "2026-11-21";

const pos = (v         ) => Math.max(0, Number(v) || 0);
const num = (v         ) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const r0 = (n        ) => Math.round(n);

/** 과세표준에 맞는 법인세 + 지방소득세 평균세율(2026 구간). */
export function averageCorpRate(base        , local = true)         {
  const b = pos(base);
  if (!b) return 0;
  return Math.round((corporateTax2026(b) / b) * (local ? 1.1 : 1) * 10000) / 10000;
}

                                                                                                                   
                             
                    
                                                       
                
                                       
                        
                                                      
                        
                            
                      
                                           
                      
                               
                        
  

export function deferredTax(x               ) {
  const rate = x.rate !== undefined ? Math.min(1, pos(x.rate)) : averageCorpRate(pos(x.expectedBase) || 300_000_000);
  const items = (x.items ?? []).map((i) => ({ label: i.label, amount: num(i.amount), deferred: r0(num(i.amount) * rate) }));
  const deductible = items.filter((i) => i.amount > 0).reduce((s, i) => s + i.amount, 0);
  const taxable = -items.filter((i) => i.amount < 0).reduce((s, i) => s + i.amount, 0);
  // 가산할 차이가 소멸되며 생기는 과세소득도 차감할 차이를 쓸 재원이에요(K-IFRS 1012호 문단 28).
  const usable = x.futureIncome === undefined ? deductible : Math.min(deductible, pos(x.futureIncome) + taxable);
  const ratio = deductible ? usable / deductible : 1;
  const dtaGross = r0(deductible * rate);
  const dta = r0(usable * rate);
  const dtl = r0(taxable * rate);
  const closingNet = dta - dtl;
  const openingNet = num(x.openingNet);
  // 순자산이 줄면 이연법인세비용(+), 늘면 이연법인세수익(−). 자본에 바로 반영하는 항목은 빼고 넣어요.
  const deferredExpense = openingNet - closingNet;
  const currentTax = pos(x.currentTax);
  const totalExpense = currentTax + deferredExpense;
  const pretax = num(x.pretaxIncome);
  return {
    rate,
    items,
    deductible,
    taxable,
    recognizedRatio: Math.round(ratio * 10000) / 10000,
    dtaGross,
    dta,
    unrecognized: dtaGross - dta,
    dtl,
    closingNet,
    openingNet,
    deferredExpense,
    currentTax,
    totalExpense,
    effectiveRate: pretax > 0 ? Math.round((totalExpense / pretax) * 10000) / 10000 : null,
    entry: deferredExpense >= 0
      ? `(차) 법인세비용 ${r0(totalExpense).toLocaleString("ko-KR")} / (대) 미지급법인세 ${r0(currentTax).toLocaleString("ko-KR")}, 이연법인세자산(순) 감소 ${r0(deferredExpense).toLocaleString("ko-KR")}`
      : `(차) 법인세비용 ${r0(totalExpense).toLocaleString("ko-KR")}, 이연법인세자산(순) 증가 ${r0(-deferredExpense).toLocaleString("ko-KR")} / (대) 미지급법인세 ${r0(currentTax).toLocaleString("ko-KR")}`,
  };
}

                                                                                
export const BENCHMARKS                                                                                   = {
  pretax: { label: "법인세비용차감전 계속사업이익", low: 0.03, high: 0.1, typical: 0.05 },
  revenue: { label: "매출액", low: 0.005, high: 0.01, typical: 0.005 },
  assets: { label: "자산총액", low: 0.005, high: 0.02, typical: 0.01 },
  equity: { label: "자본총계", low: 0.01, high: 0.05, typical: 0.02 },
  expenses: { label: "비용총액(비영리·적자 기업)", low: 0.005, high: 0.02, typical: 0.01 },
};
                                             
const PM                       = { low: 0.75, medium: 0.65, high: 0.5 };

/** 전체 중요성 → 수행 중요성 → 명백히 사소한 금액. */
export function materiality(x                                                                                        ) {
  const b = BENCHMARKS[x.benchmark];
  const pct = x.pct !== undefined ? pos(x.pct) : b.typical;
  const overall = r0(Math.abs(num(x.base)) * pct);
  const pmRate = PM[x.risk ?? "medium"];
  const trivialPct = x.trivialPct !== undefined ? pos(x.trivialPct) : 0.05;
  return {
    benchmark: b.label,
    pct,
    range: [b.low, b.high]                    ,
    outOfRange: pct < b.low || pct > b.high,
    overall,
    performanceRate: pmRate,
    performance: r0(overall * pmRate),
    trivialPct,
    trivial: r0(overall * trivialPct),
  };
}

                                           
const RF                             = { 80: 1.61, 90: 2.31, 95: 3.0, 99: 4.61 };
const EF                             = { 80: 1.3, 90: 1.5, 95: 1.6, 99: 1.9 };

/** 금액단위표본(MUS) 표본 크기와 표본 간격. */
export function musSample(x                                                                                       ) {
  const conf = x.confidence ?? 95;
  const pop = pos(x.population), tm = pos(x.tolerable), em = pos(x.expected);
  const denom = tm - em * EF[conf];
  if (!pop || denom <= 0) return { confidence: conf, factor: RF[conf], expansion: EF[conf], size: null                 , interval: null                 , reason: denom <= 0 ? "예상왜곡이 너무 커서 표본으로 결론을 내기 어려워요. 허용왜곡을 다시 보거나 정밀 검사를 해요." : "모집단 금액을 넣어요." };
  const size = Math.ceil((pop * RF[conf]) / denom);
  return { confidence: conf, factor: RF[conf], expansion: EF[conf], size, interval: r0(pop / size), reason: size * 2 > pop ? "표본이 모집단에 비해 커요. 전수 검사가 나을 수 있어요." : "" };
}

/** 속성표본(통제 테스트, 예상 이탈 0개) 표본 크기. */
export function attributeSample(x                                                                         ) {
  const conf = x.confidence ?? 95;
  const t = Math.min(0.99, pos(x.tolerableRate));
  if (!t) return { confidence: conf, size: null                  };
  let n = Math.ceil(Math.log(1 - conf / 100) / Math.log(1 - t));
  // 모집단이 작으면 유한모집단 보정(n′ = n ÷ (1 + n/N)).
  const N = pos(x.population);
  if (N > 0) n = Math.min(N, Math.ceil(n / (1 + n / N)));
  return { confidence: conf, size: n };
}

export const AUDIT_DEFERRED_NOTE = "결산·감사 계획 숫자를 맞춰 보는 어림 계산이에요. 이연법인세 실현 가능성, 중요성 기준치와 비율, 표본 방법은 회사와 감사인의 판단이에요. 감사의견을 대신하지 않아요.";
