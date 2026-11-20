// GENERATED from tools-oiyo src/lib/kr-injury-disability-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 산재 장해급여 연금·일시금 비교 (2026-11-21, 전문 직군 전수조사 남은 빈칸). 산재 노동자·가족·노무 실무자가 장해등급별 받을 돈을 미리 보는 용도예요.
// 같은 코드가 oiyo-kr-law-guide 스킬 scripts/guide.mjs calc disability 로 들어가요. 어림 계산이고 근로복지공단 결정을 대신하지 않아요.
// 근거(2026-11 확인):
// - 산업재해보상보험법 제57조 ①·별표 2(장해등급별 연금·일시금 일수), ③(노동력을 완전히 상실한 1~3급은 연금만, 4~7급은 선택, 8~14급은 일시금),
//   ④(연금 선급: 신청하면 처음 1년분 또는 2년분의 1/2, 1~3급은 처음 1~4년분의 1/2까지).
// - 제36조 ⑦(평균임금이 최고보상기준금액을 넘거나 최저보상기준금액보다 적으면 그 금액으로 계산), 고용노동부고시 제2025-84호:
//   2026년 최고 268,299원, 최저 82,560원(최저임금 10,320원 × 8시간).
// - 제112조 ① 단서(장해급여를 받을 권리는 5년간 행사하지 않으면 시효로 소멸).
export const DISABILITY_AS_OF = "2026-11-21";

export const DISABILITY_DAYS                                                           = {
  1: { pension: 329, lump: 1474 }, 2: { pension: 291, lump: 1309 }, 3: { pension: 257, lump: 1155 },
  4: { pension: 224, lump: 1012 }, 5: { pension: 193, lump: 869 }, 6: { pension: 164, lump: 737 }, 7: { pension: 138, lump: 616 },
  8: { pension: null, lump: 495 }, 9: { pension: null, lump: 385 }, 10: { pension: null, lump: 297 }, 11: { pension: null, lump: 220 },
  12: { pension: null, lump: 154 }, 13: { pension: null, lump: 99 }, 14: { pension: null, lump: 55 },
};
export const WAGE_CAP_2026 = { max: 268_299, min: 82_560 };

const addYears = (iso        , y        ) => {
  const [Y, M, D] = iso.split("-").map(Number);
  const d = new Date(Date.UTC(Y + y, M - 1, D));
  if (d.getUTCDate() !== D) d.setUTCDate(0);
  return d.toISOString().slice(0, 10);
};

export function disabilityBenefit(x                                                     ) {
  const grade = Math.min(14, Math.max(1, Math.round(Number(x.grade) || 14)));
  const raw = Math.max(0, Number(x.avgWage) || 0);
  const wage = Math.min(WAGE_CAP_2026.max, Math.max(WAGE_CAP_2026.min, raw));
  const capped = wage !== raw ? (raw > wage ? "max" : "min") : null;
  const d = DISABILITY_DAYS[grade];
  const form = grade <= 3 ? "pension-only" : grade <= 7 ? "choice" : "lump-only";
  const annual = d.pension ? Math.round(wage * d.pension) : null;
  const lump = grade <= 3 ? null : Math.round(wage * d.lump);
  // 4~7급: 일시금 = 연금 몇 년치인지(그보다 오래 받으면 연금이 많아요).
  const breakEvenYears = annual && lump ? Math.round((lump / annual) * 10) / 10 : null;
  const advance = annual ? (grade <= 3 ? [1, 2, 3, 4] : [1, 2]).map((y) => ({ years: y, amount: Math.round((annual * y) / 2) })) : [];
  return {
    grade, avgWage: raw, wage, capped, form,
    pensionDays: d.pension, lumpDays: d.lump,
    pensionAnnual: annual, pensionMonthly: annual ? Math.round(annual / 12) : null,
    lumpSum: lump, breakEvenYears, advance,
    claimBy: x.healed ? addYears(x.healed, 5) : null,
    cite: "산업재해보상보험법 제57조·별표 2, 제36조 ⑦, 제112조",
  };
}

export const DISABILITY_NOTE = "장해급여 어림 계산이에요. 장해등급은 근로복지공단이 치유(증상 고정) 뒤 장해 상태를 보고 정하고, 평균임금은 사고일 전 3개월 임금으로 계산해요. 결정에 이의가 있으면 처분을 안 날부터 90일 안에 심사청구해요.";
