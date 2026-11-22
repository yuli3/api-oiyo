// GENERATED from tools-oiyo src/lib/world-labor-practice-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// Labour practice checks for HR and 社労士 (2026-11-22, world audience gap P5: practitioner side).
// Japan 36協定 overtime caps (労働基準法 36条) and UK irregular-hours / part-year holiday accrual (12.07%).
// Facts: /mnt/project-files/notes/labor-practice-facts-2026-11-22.md. Rules that were not read are flagged, not checked.
export const LABOR_PRACTICE_AS_OF = "2026-11-22";
                                                                  
                                                                                                 
                                                           
const pos = (n         ) => Math.max(0, Number(n) || 0);
const r1 = (n        ) => Math.round(n * 10) / 10;
const CITE = "厚生労働省「時間外労働の上限規制 わかりやすい解説」";
const CITE_SECTOR = "厚生労働省「建設業・ドライバー・医師等の時間外労働の上限規制」";

export function jpOvertimeCheck(x                                                                             ) {
  const months = (x.months ?? []).slice(0, 12).map((m) => ({ ot: pos(m.overtime), hol: pos(m.holiday) }));
  if (months.length === 0) return { ok: false         , error: "months: at least one month of overtime hours" };
  const sector = x.sector ?? "general";
  const items         = [];
  const violations           = [];
  const mLimit = x.henkei ? 42 : 45, yLimit = x.henkei ? 320 : 360;
  const yearOt = months.reduce((s, m) => s + m.ot, 0);
  const yearAll = months.reduce((s, m) => s + m.ot + m.hol, 0);
  const over45 = months.filter((m) => m.ot > mLimit).length;
  let maxAvg = 0, maxAvgSpan = 0;

  if (sector === "doctor_a" || sector === "doctor_bc") {
    const cap = sector === "doctor_a" ? 960 : 1_860;
    if (yearAll > cap) violations.push(`時間外・休日労働の年合計 ${r1(yearAll)}時間が上限 ${cap}時間を超えています。`);
    items.push({ tone: "info", text: `医師 (${sector === "doctor_a" ? "A水準・連携B水準" : "B水準・C水準"}): 時間外・休日労働は年${cap}時間まで (休日労働を含む)。`, cite: CITE_SECTOR });
    items.push({ tone: "warn", text: "医師の月ごとの上限や面接指導などの他のルールは、ここでは確認していません。", cite: CITE_SECTOR });
  } else if (!x.special) {
    months.forEach((m, i) => { if (m.ot > mLimit) violations.push(`${i + 1}か月目の時間外労働 ${r1(m.ot)}時間が月${mLimit}時間を超えています (特別条項なし)。`); });
    if (yearOt > yLimit) violations.push(`時間外労働の合計 ${r1(yearOt)}時間が年${yLimit}時間を超えています (特別条項なし)。`);
    items.push({ tone: "info", text: `原則の上限: 時間外労働 (休日労働を含まない) 月${mLimit}時間・年${yLimit}時間${x.henkei ? " (1年単位の変形労働時間制)" : ""}。`, cite: CITE });
  } else {
    const driver = sector === "driver";
    const annual = driver ? 960 : 720;
    if (yearOt > annual) violations.push(`時間外労働の合計 ${r1(yearOt)}時間が年${annual}時間を超えています。`);
    items.push({ tone: "info", text: `特別条項: 時間外労働は年${annual}時間まで (休日労働を含まない)${driver ? "。自動車運転の業務は2024年4月から" : ""}。`, cite: driver ? CITE_SECTOR : CITE });
    if (!driver) {
      if (over45 > 6) violations.push(`月${mLimit}時間を超えた月が${over45}か月あります (年6か月まで)。`);
      if (sector !== "construction_disaster") {
        months.forEach((m, i) => { if (m.ot + m.hol >= 100) violations.push(`${i + 1}か月目の時間外+休日労働 ${r1(m.ot + m.hol)}時間が月100時間未満になっていません。`); });
        for (let span = 2; span <= 6; span++) for (let i = 0; i + span <= months.length; i++) {
          const avg = months.slice(i, i + span).reduce((s, m) => s + m.ot + m.hol, 0) / span;
          if (avg > maxAvg) { maxAvg = avg; maxAvgSpan = span; }
          if (avg > 80) violations.push(`${i + 1}〜${i + span}か月目の時間外+休日労働の平均 ${r1(avg)}時間が80時間を超えています。`);
        }
        items.push({ tone: "info", text: "特別条項でも: 時間外+休日労働は月100時間未満、2〜6か月平均80時間以内、月45時間超は年6か月まで。", cite: CITE });
      } else items.push({ tone: "info", text: "建設業の災害復旧・復興の事業: 月100時間未満・2〜6か月平均80時間以内は適用されません。", cite: CITE_SECTOR });
    } else items.push({ tone: "info", text: "自動車運転の業務: 月100時間未満・2〜6か月平均80時間・年6か月のルールは適用されません。", cite: CITE_SECTOR });
  }
  items.push({ tone: "warn", text: "違反には6か月以下の懲役又は30万円以下の罰金。36協定の届出や記載内容そのものは確認していません。", cite: CITE });
  const unique = [...new Set(violations)];
  return { ok: true         , compliant: unique.length === 0, violations: unique, yearOvertime: r1(yearOt), yearWithHoliday: r1(yearAll), monthsOver45: over45, maxAverage: r1(maxAvg), maxAverageSpan: maxAvgSpan, items };
}

export const UK_IRREGULAR_RATE = 12.07;
export function ukIrregularHoliday(x                     ) {
  const periods = (x.hours ?? []).map(pos);
  if (periods.length === 0) return { ok: false         , error: "hours: hours worked in each pay period" };
  const accrued = periods.map((h) => Math.round(h * UK_IRREGULAR_RATE) / 100);
  const total = Math.round(accrued.reduce((s, a) => s + a, 0) * 100) / 100;
  const items         = [
    { tone: "info", text: `Irregular-hours and part-year workers accrue 12.07% of the hours worked in each pay period: ${total} hours over ${periods.length} pay period(s).`, cite: "GOV.UK Holiday entitlement: calculate leave entitlement" },
    { tone: "info", text: "This method applies to leave years beginning on or after 1 April 2024. Irregular hours: paid hours wholly or mostly variable. Part-year: at least one week a year not worked and not paid.", cite: "GOV.UK Holiday pay and entitlement reforms from 1 January 2024" },
    { tone: "warn", text: "Rounding of each period's figure and rolled-up holiday pay are not applied here. Check the GOV.UK guidance before paying holiday.", cite: "GOV.UK" },
    { tone: "info", text: "Workers with regular hours get 5.6 weeks a year, capped at 28 days: 4 weeks at normal pay and 1.6 weeks at basic pay.", cite: "GOV.UK Holiday pay and entitlement reforms" },
  ];
  return { ok: true         , perPeriod: accrued, totalHours: total, items };
}

export function laborPractice(x                                                    ) {
  if (x.country === "JP") return jpOvertimeCheck(x         );
  if (x.country === "UK") return ukIrregularHoliday(x         );
  return { ok: false         , error: "country must be JP or UK" };
}
