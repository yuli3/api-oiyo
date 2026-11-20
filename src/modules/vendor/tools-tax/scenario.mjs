// GENERATED from tools-oiyo src/lib/scenario.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 가정 변화 시각화용 시나리오 계층 (2026-11-14, 세무·회계 도구 2단계).
// 계산 엔진은 건드리지 않고, "가정 하나를 바꾸면 결과가 어떻게 되나"만 순수 함수로 계산해요.
// 도구는 가정 목록(Assumption)과 결과 함수(evaluate)만 넘기면 돼요. 화면 부품은 components/tools/viz/.

                                                                                                                                                                                                                                                        

                                
              
                       
                
                          
                
                       
                                                                 
                              
                            
                                      
                                                      
                                              
                                     
                                          
 

                             
            
            
 

/** 가정 하나를 min~max로 바꾼 결과 곡선. 경계값(marks)은 정확히 포함해요. */
export function sweep   (base   , a               , evaluate                      , [min, max]                  , steps = 60)               {
  if (!(max > min)) return [{ x: min, y: evaluate(a.set(base, min)) }];
  const xs = new Set        ();
  for (let i = 0; i <= steps; i++) xs.add(min + ((max - min) * i) / steps);
  for (const m of a.marks ?? []) if (m.at >= min && m.at <= max) xs.add(m.at);
  const current = a.get(base);
  if (current >= min && current <= max) xs.add(current);
  return [...xs]
    .sort((p, q) => p - q)
    .map((x) => ({ x, y: evaluate(a.set(base, x)) }))
    .filter((p) => Number.isFinite(p.y));
}

                             
              
                
                
                   
                    
                           
              
               
               
                            
               
 

/**
 * 각 가정을 ±delta(기본 20%) 바꿀 때 결과가 움직이는 폭, 큰 순서.
 * 사실(kind: fact)과 지금 값이 0인 가정은 빼요(0의 ±20%는 0이라 의미가 없어요).
 */
export function tornado   (base   , assumptions                 , evaluate                      , delta = 0.2)               {
  const baseValue = evaluate(base);
  const bars               = [];
  for (const a of assumptions) {
    if (a.kind !== "assumption") continue;
    const v = a.get(base);
    if (!Number.isFinite(v) || v === 0) continue;
    const lowInput = v * (1 - delta);
    const highInput = v * (1 + delta);
    const low = evaluate(a.set(base, lowInput));
    const high = evaluate(a.set(base, highInput));
    if (!Number.isFinite(low) || !Number.isFinite(high) || !Number.isFinite(baseValue)) continue;
    bars.push({ key: a.key, label: a.label, plain: a.plain, lowInput, highInput, low, high, base: baseValue, span: Math.abs(high - low) });
  }
  return bars.filter((b) => b.span > 0).sort((p, q) => q.span - p.span);
}

                             
                
                
                                                 
                        
                
 

                                               
                
              
 

/** 다리(워터폴) 그래프 배치: 각 막대의 시작·끝. total 막대는 value를 그대로 써요(반올림 차이 흡수). */
export function bridgeLayout(steps              )              {
  let run = 0;
  return steps.map((s) => {
    if (s.kind === "total") {
      run = s.value;
      return { ...s, start: 0, end: s.value };
    }
    const start = run;
    run += s.value;
    return { ...s, start, end: run };
  });
}

/** 금액 크기를 꼼꼼히 따지지 않고 흔히 쓰는 비율 범위: [min, max] 고정 */
export const fixedRange = (min        , max        ) => ()                   => [min, max];

/** 그래프 눈금용 반올림 단위 */
export function niceStep(span        , target = 100)         {
  if (!(span > 0)) return 1;
  const raw = span / target;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const n = raw / mag;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag;
}

/** 금액 범위: 0 ~ 2배(최소 폭 보장). 음수가 될 수 있는 값은 signed. */
export function moneyRange(anchor        , { signed = false, minSpan = 100_000_000 } = {})                   {
  const a = Math.abs(anchor);
  const hi = Math.max(a * 2, minSpan);
  if (signed) return [anchor < 0 ? anchor * 2 : -Math.max(a, minSpan / 2), anchor < 0 ? Math.max(a, minSpan) : hi];
  return [0, hi];
}

/**
 * "6억 3,000만", "1.5억", "3천만", "250000000", "-2억" 같은 한국어 금액을 원 단위 숫자로.
 * 읽을 수 없으면 null.
 */
export function parseKoreanAmount(text        )                {
  const s = text.replace(/[\s,원]/g, "");
  if (s === "" || s === "-") return null;
  const neg = s.startsWith("-");
  const body = neg ? s.slice(1) : s;
  if (/^\d+(\.\d+)?$/.test(body)) return (neg ? -1 : 1) * Number(body);
  const UNIT                         = { 조: 1e12, 억: 1e8, 만: 1e4 };
  const SMALL                         = { 천: 1000, 백: 100, 십: 10 };
  let total = 0;
  let rest = body;
  const big = /^(\d+(?:\.\d+)?)?((?:\d|\.|천|백|십)*)(조|억|만)/;
  let m                        ;
  while ((m = big.exec(rest))) {
    const chunk = (m[1] ?? "") + m[2];
    const n = chunk === "" ? 1 : smallNumber(chunk, SMALL);
    if (n === null) return null;
    total += n * UNIT[m[3]];
    rest = rest.slice(m[0].length);
  }
  if (rest !== "") {
    const n = smallNumber(rest, SMALL);
    if (n === null) return null;
    total += n;
  }
  return (neg ? -1 : 1) * Math.round(total);
}

function smallNumber(chunk        , SMALL                        )                {
  if (/^\d+(\.\d+)?$/.test(chunk)) return Number(chunk);
  let total = 0;
  let rest = chunk;
  const re = /^(\d+(?:\.\d+)?)?(천|백|십)/;
  let m                        ;
  while ((m = re.exec(rest))) {
    total += (m[1] ? Number(m[1]) : 1) * SMALL[m[2]];
    rest = rest.slice(m[0].length);
  }
  if (rest === "") return total;
  if (/^\d+$/.test(rest)) return total + Number(rest);
  return null;
}

/** 쉬운 금액 표기: 26.4억 원, 1,600만 원, 44,000원(100원 단위), 830원 */
export function roughWon(n        )         {
  if (!Number.isFinite(n)) return "—";
  const sign = n < 0 ? "−" : "";
  const a = Math.abs(n);
  if (a >= 1e12) return `${sign}${trim(a / 1e12)}조 원`;
  if (a >= 1e8) return `${sign}${trim(a / 1e8)}억 원`;
  if (a >= 1e6) return `${sign}${trim(a / 1e4)}만 원`;
  if (a >= 1e4) return `${sign}${(Math.round(a / 100) * 100).toLocaleString("ko-KR")}원`;
  return `${sign}${Math.round(a).toLocaleString("ko-KR")}원`;
}

function trim(v        )         {
  const digits = v >= 100 ? 0 : 1;
  return Number(v.toFixed(digits)).toLocaleString("ko-KR", { maximumFractionDigits: digits });
}

/** 좁은 칸용 짧은 표기: 1.2억, 1.02만, 830 */
export function compactWon(n        )         {
  if (!Number.isFinite(n)) return "—";
  const a = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  if (a >= 1e8) return `${sign}${(a / 1e8).toFixed(a >= 1e10 ? 0 : 1)}억`;
  if (a >= 1e4) return `${sign}${(a / 1e4).toFixed(a >= 1e6 ? 0 : 2)}만`;
  return `${sign}${Math.round(a)}`;
}

/** 받침에 맞는 조사: josa("상속세", "이", "가") → "상속세가". 괄호·공백·숫자 뒤는 마지막 한글 글자로 판단해요. */
export function josa(word        , withFinal        , withoutFinal        )         {
  const m = word.replace(/\([^)]*\)/g, "").match(/[가-힣](?=[^가-힣]*$)/);
  if (!m) return word + withFinal;
  const hasFinal = (m[0].charCodeAt(0) - 0xac00) % 28 !== 0;
  return word + (hasFinal ? withFinal : withoutFinal);
}
