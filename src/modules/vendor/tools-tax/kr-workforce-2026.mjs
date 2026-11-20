// GENERATED from tools-oiyo src/lib/kr-workforce-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 상시근로자 수 판정과 근무표 점검 (2026-11-20, 전문 직군 전수조사 #6). 사장님·노무 실무자가 5인 이상 여부와 주 52시간·휴게를 미리 보는 용도예요.
// 같은 코드가 oiyo-kr-law-guide 스킬 scripts/guide.mjs calc workforce 로 들어가요. 어림 점검이고 노동청 판단을 대신하지 않아요.
// 근거:
// - 상시근로자 수: 근로기준법 제11조, 시행령 제7조의2(사유 발생일 전 1개월 연인원 ÷ 가동일수; 5명 기준 미달 일수가 가동일수의 1/2 이상이면 미적용,
//   5명 미만이어도 5명 이상인 날이 1/2 이상이면 적용). 연인원에는 기간제·단시간·일용직을 넣고 파견근로자는 빼요(같은 조 ④).
// - 근로시간: 제50조(1일 8시간·1주 40시간), 제53조 ①(연장 주 12시간), 제54조(4시간 30분·8시간 1시간 휴게), 제55조(주 1회 유급휴일),
//   제56조(연장·야간(22~6시)·휴일 가산 50%), 제18조 ③(주 15시간 미만이면 주휴·연차 없음), 제69조(18세 미만 1일 7시간·1주 35시간, 연장 1일 1시간·1주 5시간).
// - 5명 미만 사업장은 제50조~제56조 중 연장 한도·가산수당 등이 적용되지 않아요(시행령 별표 1). 휴게(제54조)·주휴(제55조)는 적용돼요.
export const WORKFORCE_AS_OF = "2026-11-20";

const pos = (v         ) => Math.max(0, Number(v) || 0);

/** 하루하루 근로자 수(가동일만)로 상시근로자 수와 5명 기준 판정. */
export function regularHeadcount(daily          , threshold = 5) {
  const days = daily.map(pos);
  const opDays = days.length;
  if (!opDays) return { opDays: 0, total: 0, average: 0, daysBelow: 0, daysAtOrAbove: 0, applies: false, reason: "가동일이 없어요." };
  const total = days.reduce((s, d) => s + d, 0);
  const average = Math.round((total / opDays) * 100) / 100;
  const daysBelow = days.filter((d) => d < threshold).length;
  const daysAtOrAbove = opDays - daysBelow;
  let applies = average >= threshold;
  let reason = applies ? `평균 ${average}명으로 ${threshold}명 이상이에요.` : `평균 ${average}명으로 ${threshold}명 미만이에요.`;
  if (applies && daysBelow * 2 >= opDays) { applies = false; reason += ` 다만 ${threshold}명 미만인 날이 ${daysBelow}일로 가동일의 절반 이상이라 미적용이에요.`; }
  else if (!applies && daysAtOrAbove * 2 >= opDays) { applies = true; reason += ` 다만 ${threshold}명 이상인 날이 ${daysAtOrAbove}일로 가동일의 절반 이상이라 적용돼요.`; }
  return { opDays, total, average, daysBelow, daysAtOrAbove, applies, reason };
}

/** 같은 계산으로 자주 쓰는 인원 기준을 한 번에 봐요. */
export function headcountThresholds(daily          ) {
  return [
    { n: 5, what: "근로기준법 대부분(연장 한도·가산수당·연차·부당해고 구제)" },
    { n: 10, what: "취업규칙 작성·신고" },
    { n: 30, what: "노사협의회 설치·고충처리위원" },
  ].map((t) => ({ ...t, ...regularHeadcount(daily, t.n) }));
}

                                                                                                      
const toMin = (hhmm        ) => { const [h, m] = hhmm.split(":").map(Number); return (h || 0) * 60 + (m || 0); };

/** 22:00~06:00과 겹치는 분(쉬는 시간은 빼지 않아요). */
function nightMinutes(s        , e        ) {
  let n = 0;
  for (let t = s; t < e; t += 1) { const m = t % 1440; if (m >= 1320 || m < 360) n += 1; }
  return n;
}

                                                                                  
                                                                                   

export function checkSchedule(x               ) {
  const dailyCap = x.minor ? 7 : 8, weeklyCap = x.minor ? 35 : 40, otCap = x.minor ? 5 : 12;
  const rows = x.shifts.map((s) => {
    const st = toMin(s.start); let en = toMin(s.end); if (en <= st) en += 1440;
    const span = en - st;
    const brk = pos(s.breakMin);
    const work = Math.max(0, span - brk) / 60;
    const needBreak = work >= 8 ? 60 : work >= 4 ? 30 : 0;
    return { day: s.day, work: Math.round(work * 100) / 100, breakMin: brk, needBreak, night: Math.round((nightMinutes(st, en) / 60) * 100) / 100, holiday: !!s.holiday, dailyOver: s.holiday ? 0 : Math.max(0, work - dailyCap) };
  });
  const total = rows.reduce((s, r) => s + r.work, 0);
  const holidayHours = rows.filter((r) => r.holiday).reduce((s, r) => s + r.work, 0);
  const dailyOver = rows.reduce((s, r) => s + r.dailyOver, 0);
  const weekOver = Math.max(0, total - holidayHours - dailyOver - weeklyCap);
  const overtime = Math.round((dailyOver + weekOver + holidayHours) * 100) / 100;
  const night = rows.reduce((s, r) => s + r.night, 0);
  const workDays = rows.filter((r) => r.work > 0).length;
  const issues          = [];
  for (const r of rows) if (r.breakMin < r.needBreak) issues.push({ tone: "warn", text: `${r.day}: ${r.work}시간 일하면 쉬는 시간이 ${r.needBreak}분 이상 필요해요(지금 ${r.breakMin}분).`, cite: "근로기준법 제54조" });
  if (x.small) issues.push({ tone: "info", text: "5명 미만이라 연장 한도(주 52시간)와 연장·야간·휴일 가산수당은 법상 의무가 아니에요. 휴게와 주휴는 지켜야 해요.", cite: "근로기준법 제11조, 시행령 별표 1" });
  else {
    if (overtime > otCap) issues.push({ tone: "warn", text: `연장·휴일근로가 주 ${overtime}시간으로 한도 ${otCap}시간을 넘어요.`, cite: x.minor ? "근로기준법 제69조" : "근로기준법 제53조" });
    else if (overtime > 0) issues.push({ tone: "info", text: `연장·휴일근로 주 ${overtime}시간은 한도(${otCap}시간) 안이에요. 근로자 동의가 필요하고 50% 가산해요.`, cite: "근로기준법 제53조·제56조" });
    if (night > 0) issues.push({ tone: "info", text: `밤 10시~새벽 6시 근무가 주 ${Math.round(night * 100) / 100}시간이라 야간 가산 50%가 붙어요.`, cite: "근로기준법 제56조 ③" });
  }
  if (x.minor && rows.some((r) => r.night > 0)) issues.push({ tone: "warn", text: "18세 미만은 본인 동의와 노동부 장관 인가 없이 밤 10시~새벽 6시에 일할 수 없어요.", cite: "근로기준법 제70조 ②" });
  if (workDays >= 7) issues.push({ tone: "warn", text: "일주일에 쉬는 날이 하루도 없어요. 주 1회 이상 유급휴일을 줘야 해요.", cite: "근로기준법 제55조" });
  const weekly = total - holidayHours;
  if (weekly >= 15) issues.push({ tone: "good", text: `주 근로시간이 ${Math.round(weekly * 100) / 100}시간(15시간 이상)이라 개근하면 주휴수당이 생겨요.`, cite: "근로기준법 제55조, 제18조 ③" });
  else issues.push({ tone: "info", text: "주 15시간 미만이라 주휴수당·연차가 없어요.", cite: "근로기준법 제18조 ③" });
  return { rows, total: Math.round(total * 100) / 100, overtime, night: Math.round(night * 100) / 100, workDays, limitOk: x.small ? true : overtime <= otCap && total <= weeklyCap + otCap, issues };
}

export const WORKFORCE_NOTE = "상시근로자 수와 근무표를 어림 점검해요. 탄력적·선택적 근로시간제, 특례업종, 감시·단속 근로자, 포괄임금 약정은 따로 봐야 해요. 다툼은 노동청이나 노무 전문가와 상의해요.";
