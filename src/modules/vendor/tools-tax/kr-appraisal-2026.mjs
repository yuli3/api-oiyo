// GENERATED from tools-oiyo src/lib/kr-appraisal-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 감정평가 3방식 원리와 토지보상 어림 (2026-11-20, 전문 직군 전수조사 #9). 토지 소유자·세입자·실무자가 보상 협의 전에 숫자 구조를 이해하는 용도예요.
// 같은 코드가 oiyo-kr-law-guide 스킬 scripts/guide.mjs calc appraisal / calc compensation 으로 들어가요.
// 감정평가가 아니에요: 가격을 정하는 감정평가서는 감정평가사 업무예요(감정평가법 제10조). 여기는 산식 구조를 보여 주는 학습·검토용이에요.
// 근거:
// - 3방식: 감정평가에 관한 규칙 제11조(원가방식·비교방식·수익방식), 제12조(시산가액 조정), 제14조(토지는 공시지가기준법), 제15조(건물은 원가법),
//   감정평가 실무기준(재조달원가 × 감가수정, 사례 × 사정보정 × 시점수정 × 지역·개별요인, 순수익 ÷ 환원율).
// - 토지보상: 토지보상법 제70조(공시지가 × 지가변동률 등, 개발이익 배제), 시행규칙 제46조(폐업: 2년간 영업이익 + 매각손실),
//   제47조(휴업: 휴업기간(원칙 4개월 이내) 영업이익 + 고정비 + 이전비), 제54조(주거이전비: 소유자 2개월분, 세입자 4개월분
//   — 통계청 도시근로자가구 가구원수별 월평균 가계지출비 기준, 금액은 해마다 바뀌어 사용자가 넣어요).
export const APPRAISAL_AS_OF = "2026-11-20";

const pos = (v         ) => Math.max(0, Number(v) || 0);
const r0 = (n        ) => Math.round(n);

/** 원가법: 재조달원가 − 감가(정액, 잔가율). */
export function costApproach(x                                                                                                    ) {
  const rc = pos(x.replacementCost), n = Math.max(1, pos(x.usefulLife)), a = Math.min(pos(x.age), n), rr = Math.min(1, pos(x.residualRate ?? 0));
  const depreciation = rc * (1 - rr) * (a / n);
  const building = rc - depreciation;
  return { depreciation: r0(depreciation), building: r0(building), value: r0(building + pos(x.land)), remainingLife: n - a };
}

                                                                                                                                                     

/** 비교방식: 사례 단가 × 사정보정 × 시점수정 × 지역요인 × 개별요인, 가중평균 단가 × 대상 면적. */
export function salesComparison(subjectArea        , comps              ) {
  const rows = comps.filter((c) => pos(c.price) && pos(c.area)).map((c) => {
    const unit = pos(c.price) / pos(c.area);
    const factor = (c.situation ?? 1) * (c.time ?? 1) * (c.regional ?? 1) * (c.individual ?? 1);
    return { unit: r0(unit), factor: Math.round(factor * 10000) / 10000, adjusted: r0(unit * factor), weight: pos(c.weight ?? 1) };
  });
  const wsum = rows.reduce((s, r) => s + r.weight, 0);
  const unit = wsum ? rows.reduce((s, r) => s + r.adjusted * r.weight, 0) / wsum : 0;
  return { rows, unit: r0(unit), value: r0(unit * pos(subjectArea)) };
}

/** 수익방식(직접환원법): 순영업소득 ÷ 환원율. */
export function incomeApproach(x                                                                               ) {
  const egi = pos(x.grossIncome) * (1 - Math.min(1, pos(x.vacancy)));
  const noi = egi - pos(x.expenses);
  const cap = pos(x.capRate);
  return { effectiveIncome: r0(egi), noi: r0(noi), value: cap ? r0(noi / cap) : 0 };
}

/** 시산가액 조정(가중평균)과 방식 간 차이. */
export function reconcile(values                                                    ) {
  const v = values.filter((x) => pos(x.value) && pos(x.weight));
  const w = v.reduce((s, x) => s + pos(x.weight), 0);
  const value = w ? v.reduce((s, x) => s + pos(x.value) * pos(x.weight), 0) / w : 0;
  const max = Math.max(0, ...v.map((x) => x.value)), min = v.length ? Math.min(...v.map((x) => x.value)) : 0;
  return { value: r0(value), spread: min ? Math.round(((max - min) / min) * 1000) / 10 : 0 };
}

/** 공시지가기준법 토지 보상 어림: 표준지 공시지가 × 시점수정 × 지역 × 개별 × 그 밖의 요인 × 면적. */
export function landCompensation(x                                                                                                                      ) {
  const time = 1 + (Number(x.landChange) || 0);
  const factor = time * (x.regional ?? 1) * (x.individual ?? 1) * (x.other ?? 1);
  const unit = pos(x.officialPrice) * factor;
  return { time: Math.round(time * 10000) / 10000, factor: Math.round(factor * 10000) / 10000, unit: r0(unit), value: r0(unit * pos(x.area)) };
}

/** 영업손실 보상: 휴업(영업이익 × 휴업월수/12 + 고정비 + 이전비) 또는 폐업(2년분 영업이익 + 매각손실). */
export function businessLoss(x                                                                                                                             ) {
  const p = pos(x.annualProfit);
  if (x.kind === "close") return { kind: "close"         , profitPart: r0(p * 2), total: r0(p * 2 + pos(x.saleLoss)) };
  const months = Math.min(24, pos(x.months ?? 4));
  const profitPart = (p * months) / 12;
  return { kind: "pause"         , months, profitPart: r0(profitPart), total: r0(profitPart + pos(x.fixedCosts) + pos(x.moving)) };
}

/** 주거이전비: 월평균 가계지출비 × 소유자 2개월 / 세입자 4개월. */
export function relocationAllowance(monthlySpending        , tenant         ) {
  const months = tenant ? 4 : 2;
  return { months, amount: r0(pos(monthlySpending) * months) };
}

export const APPRAISAL_NOTE = "감정평가 3방식과 보상 산식의 구조를 보여 주는 어림 계산이에요. 실제 보상액은 감정평가사 2~3인의 평가 평균으로 정하고, 요인 보정치와 영업이익 인정은 자료로 다퉈요. 재결 이의신청은 재결서 받은 날부터 30일이에요.";
