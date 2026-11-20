// GENERATED from tools-oiyo src/lib/kr-license-points-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 운전면허 벌점 누산과 영업정지 ↔ 과징금 환산 (2026-11-20, 전문 직군 전수조사 #7). 운전자·행정 실무자가 처분 전에 숫자를 맞춰 보는 용도예요.
// 같은 코드가 oiyo-kr-law-guide 스킬 scripts/guide.mjs calc points / calc surcharge 로 들어가요. 어림 계산이고 경찰·행정청 처분을 대신하지 않아요.
// 근거(2026-11 확인, 별표는 2025. 12. 2. 개정 기준):
// - 도로교통법 시행규칙 제91조, 별표 28. 1년 121점·2년 201점·3년 271점 이상이면 면허 취소, 처분벌점 40점 이상이면 정지(1점 = 1일).
//   40점 미만은 마지막 위반·사고일부터 1년 동안 위반·사고가 없으면 소멸. 특별교통안전교육(벌점 감경교육)을 마치면 40점 미만은 20점, 정지 중이면 20일 감경.
//   무위반·무사고 서약을 1년 지키면 10점 특혜점수(정지 처분 때 빼 줘요). 어린이보호구역 08~20시 위반은 벌점 2배(최고 120점).
//   사고 결과 벌점: 사망 90, 중상(3주 이상) 15, 경상(5일~3주) 5, 부상신고(5일 미만) 2. 사람과 차 사이 사고가 쌍방과실이면 1/2.
//   보행자 보호 10점·휴대전화 15점은 별표 28 원문과 다시 대조할 항목이에요.
//   2026-08-24 공포된 개정(행정안전부령 제636호, 긴급자동차 길 터주기 방해 등 신설)은 2027년 시행이라 넣지 않았어요.
// - 과징금: 개별 법 시행령의 산정기준(예: 식품위생법 시행령 제53조 별표 1 — 전년도 매출액 등급별 1일당 금액 × 영업정지 일수, 1개월 = 30일, 10억 원 한도).
export const POINTS_AS_OF = "2026-11-20";

                                                                                                                                              
export const VIOLATIONS                                                                        = [
  { id: "speed100", label: "속도위반 100km/h 초과", points: 100, school: true },
  { id: "speed80", label: "속도위반 80~100km/h 초과", points: 80, school: true },
  { id: "speed60", label: "속도위반 60~80km/h 초과", points: 60, school: true },
  { id: "speed40", label: "속도위반 40~60km/h 초과", points: 30, school: true },
  { id: "speed20", label: "속도위반 20~40km/h 초과", points: 15, school: true },
  { id: "drunk", label: "음주운전 0.03% 이상 0.08% 미만", points: 100, school: false },
  { id: "signal", label: "신호·지시 위반", points: 15, school: true },
  { id: "center", label: "중앙선 침범", points: 30, school: false },
  { id: "pedestrian", label: "횡단보도 보행자 보호 위반", points: 10, school: true },
  { id: "phone", label: "운전 중 휴대전화 사용", points: 15, school: false },
];

export const ACCIDENT_POINTS = { death: 90, serious: 15, minor: 5, report: 2 }         ;

/** 위반 한 건의 벌점. 어린이보호구역 시간대면 2배(최고 120점). */
export function violationPoints(id             , schoolZone = false) {
  const v = VIOLATIONS.find((x) => x.id === id);
  if (!v) return 0;
  return schoolZone && v.school ? Math.min(120, v.points * 2) : v.points;
}

export function accidentPoints(x                                                                                            ) {
  const p = (x.death ?? 0) * 90 + (x.serious ?? 0) * 15 + (x.minor ?? 0) * 5 + (x.report ?? 0) * 2;
  return x.bothFault ? Math.floor(p / 2) : p;
}

const addYears = (iso        , y        ) => {
  const [Y, M, D] = iso.split("-").map(Number);
  const d = new Date(Date.UTC(Y + y, M - 1, D));
  if (d.getUTCDate() !== D) d.setUTCDate(0);
  return d.toISOString().slice(0, 10);
};

                                                                          

/**
 * 벌점 이력으로 지금 상태를 봐요. 처분벌점(아직 정지로 집행되지 않은 벌점)은 40점 이상이 되면 정지로 집행되고 0이 돼요.
 * 취소 판단(누산점수)은 정지로 집행된 벌점까지 1·2·3년 합계로 봐요.
 */
export function licenseStatus(events              , asOf        , opts                                            = {}) {
  const list = [...events].filter((e) => e.date <= asOf).sort((a, b) => a.date.localeCompare(b.date));
  let pending = 0;
  let last                = null;
  const suspensions                                   = [];
  for (const e of list) {
    if (last && pending < 40 && addYears(last, 1) <= e.date) pending = 0;
    pending += Math.max(0, e.points);
    last = e.date;
    if (pending >= 40) { suspensions.push({ date: e.date, days: pending }); pending = 0; }
  }
  const expired = !!last && pending > 0 && pending < 40 && addYears(last, 1) <= asOf;
  if (expired) pending = 0;
  const sum = (y        ) => list.filter((e) => e.date > addYears(asOf, -y)).reduce((s, e) => s + Math.max(0, e.points), 0);
  const cumulative = { y1: sum(1), y2: sum(2), y3: sum(3) };
  const revoked = cumulative.y1 >= 121 || cumulative.y2 >= 201 || cumulative.y3 >= 271;
  const lastSusp = suspensions.length && suspensions[suspensions.length - 1].date === list[list.length - 1]?.date ? suspensions[suspensions.length - 1] : null;
  const credit = Math.max(0, opts.mileage ?? 0) * 10;
  const suspendDays = lastSusp ? Math.max(0, lastSusp.days - credit - (opts.education ? 20 : 0)) : 0;
  const pendingAfterEdu = !lastSusp && opts.education ? Math.max(0, pending - 20) : pending;
  return {
    cumulative,
    revoked,
    revokeRule: revoked ? (cumulative.y1 >= 121 ? "1년 121점 이상" : cumulative.y2 >= 201 ? "2년 201점 이상" : "3년 271점 이상") : null,
    suspension: lastSusp ? { from: lastSusp.date, points: lastSusp.days, days: suspendDays } : null,
    pending: pendingAfterEdu,
    expiresOn: !lastSusp && pending > 0 && last ? addYears(last, 1) : null,
    toSuspension: lastSusp || revoked ? 0 : Math.max(0, 40 - pendingAfterEdu),
  };
}

/** 영업정지 일수를 과징금으로 환산(1일당 금액은 해당 법 시행령 별표에서 찾아 넣어요). */
export function suspensionToSurcharge(x                                                                  ) {
  const days = Math.max(0, Math.round((x.days ?? 0) + (x.months ?? 0) * 30));
  const raw = days * Math.max(0, x.perDay);
  const cap = x.cap ?? 1_000_000_000;
  return { days, raw, amount: Math.min(raw, cap), capped: raw > cap };
}

export const POINTS_NOTE = "벌점·과징금 어림 계산이에요. 실제 처분은 경찰청·행정청이 사실관계로 정하고, 이의신청·행정심판(처분을 안 날부터 90일)으로 다툴 수 있어요. 과징금 1일당 금액은 업종별 법령 별표를 확인하세요.";
