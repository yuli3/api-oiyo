// GENERATED from tools-oiyo src/lib/world-parental-pay-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// Parental pay and child benefit (2026-11-22, world audience gap A3: lay side).
// UK SMP + Child Benefit/HICBC, Japan 育児休業給付金 (+ 出生後休業支援給付金), Germany Elterngeld (§ 2 BEEG) + Kindergeld.
// Facts: /mnt/project-files/notes/parental-pay-facts-2026-11-22.md. Eligibility rules that were not read are flagged, not checked.
export const PARENTAL_AS_OF = "2026-11-22";
                                                 
                                                                  
const r2 = (n        ) => Math.round(n * 100) / 100;
const pos = (n         ) => Math.max(0, Number(n) || 0);

// UK Statutory Maternity Pay: 39 weeks, 6 at 90% of average weekly earnings, 33 at £194.32 or 90% if lower.
export const UK_SMP_FLAT = 194.32;
export function ukMaternityPay(x                            ) {
  const awe = pos(x.weeklyEarnings);
  const first = r2(awe * 0.9);
  const rest = r2(Math.min(UK_SMP_FLAT, awe * 0.9));
  const items         = [
    { tone: "info", text: `Weeks 1 to 6: 90% of average weekly earnings = £${first} a week.`, cite: "GOV.UK Maternity pay and leave: Pay" },
    { tone: "info", text: `Weeks 7 to 39: £194.32 or 90% of earnings, whichever is lower = £${rest} a week.`, cite: "GOV.UK Rates and thresholds for employers 2026 to 2027" },
    { tone: "warn", text: "Whether you qualify (length of employment, earnings at least the Lower Earnings Limit) is not checked here. The Lower Earnings Limit for 2026 to 2027 is £129 a week.", cite: "GOV.UK Rates and thresholds for employers 2026 to 2027" },
    { tone: "info", text: "Your employer may pay more under your contract. Tax and National Insurance are deducted from SMP.", cite: "GOV.UK Maternity pay and leave" },
  ];
  return { ok: true         , weeklyFirst6: first, weeklyNext33: rest, total: r2(first * 6 + rest * 33), weeks: 39, items };
}

// UK Child Benefit + High Income Child Benefit Charge (1% per £200 of adjusted net income over £60,000).
export function ukChildBenefit(x                                                  ) {
  const n = Math.max(0, Math.floor(Number(x.children) || 0));
  const weekly = n === 0 ? 0 : r2(27.05 + 17.9 * (n - 1));
  const yearly = r2(weekly * 52);
  const ani = pos(x.adjustedNetIncome);
  const pct = ani > 60_000 ? Math.min(100, Math.floor((ani - 60_000) / 200)) : 0;
  const charge = r2(yearly * pct / 100);
  const items         = [
    { tone: "info", text: `£27.05 a week for the eldest or only child, £17.90 for each other child = £${weekly} a week (about £${yearly} over 52 weeks).`, cite: "GOV.UK Child Benefit: What you'll get" },
    { tone: pct > 0 ? "warn" : "info", text: pct > 0 ? `Adjusted net income over £60,000: the tax charge takes back ${pct}% (1% per £200 over), about £${charge} a year. Over £80,000 it takes back all of it.` : "No High Income Child Benefit Charge at adjusted net income of £60,000 or less.", cite: "GOV.UK High Income Child Benefit Charge" },
    { tone: "info", text: "The charge is based on the higher income of you or your partner. You can claim and opt out of payments to keep National Insurance credits.", cite: "GOV.UK High Income Child Benefit Charge" },
  ];
  return { ok: true         , weekly, yearly, chargePercent: pct, charge, net: r2(yearly - charge), items };
}

// Japan 育児休業給付金: 67% for the first 180 days, 50% after; from 支給対象期間 on/after 2026-08-01.
export const JP_IKUKYU_2026 = { wageMax: 496_200, wageMin: 96_090, cap67: 332_454, cap50: 248_100, supportCap: 60_205 };
export function jpChildcareLeave(x                                                             ) {
  const w = pos(x.monthlyWage);
  if (w === 0) return { ok: false         , error: "monthlyWage (休業開始時賃金月額, 円) is required" };
  const L = JP_IKUKYU_2026;
  const base = Math.min(L.wageMax, Math.max(L.wageMin, w));
  const m67 = Math.floor(Math.min(L.cap67, base * 0.67));
  const m50 = Math.floor(Math.min(L.cap50, base * 0.5));
  const months = Math.max(0, Math.min(24, Number(x.months ?? 12)));
  const first = Math.min(6, months), later = Math.max(0, months - 6);
  const support = x.support ? Math.floor(Math.min(L.supportCap, base / 30 * 28 * 0.13)) : 0;
  const items         = [
    { tone: "info", text: `賃金月額 ${base.toLocaleString("ja-JP")}円 (上限 496,200円・下限 96,090円) で計算。`, cite: "厚生労働省「支給限度額が変更になります」(令和8年8月1日以後の支給対象期間)" },
    { tone: "info", text: `最初の180日 (約6か月) は67%: 月 ${m67.toLocaleString("ja-JP")}円 (上限 332,454円)。その後は50%: 月 ${m50.toLocaleString("ja-JP")}円 (上限 248,100円)。`, cite: "雇用保険法 育児休業給付金" },
    { tone: "info", text: x.support ? `出生後休業支援給付金 13% (最大28日分): ${support.toLocaleString("ja-JP")}円 (上限 60,205円)。両親とも14日以上の育休などの条件あり。` : "出生後休業支援給付金 (13%、最大28日、67%と合わせて80%) は、出生後8週間以内に14日以上の育休を取ると対象になり得ます。", cite: "厚生労働省「出生後休業支援給付」" },
    { tone: "warn", text: "受給資格 (休業前2年に被保険者期間12か月など) と休業中の賃金による減額は確認していません。支給は2か月ごと、非課税です。月数は30日=1か月の概算です。", cite: "ハローワーク" },
  ];
  return { ok: true         , wage: base, monthly67: m67, monthly50: m50, months, support, total: m67 * first + m50 * later + support, items };
}

// Germany Elterngeld (§ 2 BEEG) and Kindergeld.
export function elterngeldRate(net        ) {
  const n = pos(net);
  if (n < 1_000) return Math.min(100, 67 + Math.floor((1_000 - n) / 2) * 0.1);
  if (n > 1_200) return Math.max(65, 67 - Math.floor((n - 1_200) / 2) * 0.1);
  return 67;
}
export function deElterngeld(x                                                                                                       ) {
  const before = pos(x.netBefore), after = pos(x.netAfter);
  const rate = Math.round(elterngeldRate(before) * 10) / 10;
  const basis = Math.max(0, Math.min(before, 2_770) - after);
  const basic = r2(Math.max(300, Math.min(1_800, basis * rate / 100)));
  const plus = r2(Math.max(150, Math.min(900, basic / 2)));
  const zve = pos(x.taxableIncome);
  const over = zve > 175_000;
  const kids = Math.max(0, Math.floor(Number(x.children ?? 1) || 0));
  const items         = [
    { tone: "info", text: `Ersatzrate ${rate.toLocaleString("de-DE")} % (67 %, unter 1.000 € bis 100 %, über 1.200 € bis 65 %) auf ${basis.toLocaleString("de-DE")} € = Basiselterngeld ${basic.toLocaleString("de-DE")} € im Monat (mind. 300 €, höchstens 1.800 €).`, cite: "§ 2 Abs. 1, 2, 4 BEEG" },
    ...(after > 0 ? [{ tone: "info"         , text: "Mit Einkommen nach der Geburt zählt der Unterschied; das Einkommen vor der Geburt höchstens mit 2.770 €.", cite: "§ 2 Abs. 3 BEEG" }] : []),
    { tone: "info", text: `ElterngeldPlus: halber Betrag, doppelt so lange = ${plus.toLocaleString("de-DE")} € (mind. 150 €, höchstens 900 €). Zusammen 14 Monate, jeder Elternteil mind. 2; Alleinerziehende bis 12.`, cite: "Familienportal Elterngeld (10.10.2025)" },
    { tone: over ? "warn" : "info", text: over ? "Zu versteuerndes Einkommen über 175.000 €: kein Anspruch auf Elterngeld (seit 1.4.2025)." : "Einkommensgrenze: 175.000 € zu versteuerndes Einkommen (seit 1.4.2025).", cite: "Bundestag WD 8 - 3000 - 012/26" },
    { tone: "info", text: `Kindergeld: 259 € pro Kind im Monat (seit 1.1.2026) = ${(259 * kids).toLocaleString("de-DE")} € für ${kids} Kind(er).`, cite: "BMBFSFJ Kindergeld" },
    { tone: "warn", text: "Nicht berechnet: Geschwisterbonus (10 %, mind. 75 €), Mehrlingszuschlag (300 €), Partnerschaftsbonus und wie das Netto vor der Geburt genau ermittelt wird.", cite: "Bundestag WD 8 - 3000 - 012/26" },
  ];
  return { ok: true         , rate, basic: over ? 0 : basic, plus: over ? 0 : plus, eligible: !over, maxMonthsBasic: x.single ? 12 : 14, kindergeld: 259 * kids, items };
}

export function parentalPay(x                                                        ) {
  if (x.country === "UK") return { smp: ukMaternityPay(x         ), childBenefit: ukChildBenefit(x         ) };
  if (x.country === "JP") return { leave: jpChildcareLeave(x         ) };
  if (x.country === "DE") return { elterngeld: deElterngeld(x         ) };
  return { error: "country must be UK, JP or DE" };
}
