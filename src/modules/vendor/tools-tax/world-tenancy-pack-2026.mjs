// GENERATED from tools-oiyo src/lib/world-tenancy-pack-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 8-jurisdiction residential tenancy pack (2026-11-22, plan-20 #17 "law packs, locally specialised").
// Deposit cap, deposit return deadline, notice dates and rent-increase limits. General information and estimates only:
// no legal advice, no representation, no filing. Same code powers the oiyo-world-tenancy-guide skill and api.oiyo.net *_tenancy_* tools.
// Facts: /mnt/project-files/notes/tenancy-facts-2026-11-21.md, every value read on an official or statute page on 2026-11-21
// (e-Gov 法令検索, legislation.gov.uk / gov.uk, CA OAG / courts self-help / DRE guide, nysenate.gov / NY AG / NYC RGB,
// service-public.gouv.fr / Légifrance / INSEE, BOE / INE, gov.cn reprints of 住房租赁条例 and 民法典, law.moj.gov.tw).
// Not computed because not verified: CA AB 1482 sunset, Spain regional deposit lodging and RDL 29/2026 scope details,
// Spain interés legal rate, France encadrement des loyers after 2026-11-24, NY Good Cause CPI after 2026-05, China city rules,
// Taiwan current 住宅租賃 standard terms, England deposit-scheme names.

export const TENANCY_AS_OF = "2026-11-21";
                                            
                                                               
                                                                              

const iso = (d      ) => d.toISOString().slice(0, 10);
export const addDays = (s        , n        ) => iso(new Date(Date.parse(s) + n * 86_400_000));
export const addMonths = (s        , n        ) => {
  const [y, m, d] = s.split("-").map(Number);
  const last = new Date(Date.UTC(y, m - 1 + n + 1, 0)).getUTCDate();
  return iso(new Date(Date.UTC(y, m - 1 + n, Math.min(d, last))));
};
export const daysBetween = (a        , b        ) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
const r2 = (n        ) => Math.round(n * 100) / 100;
const pos = (n         ) => Math.max(0, Number(n) || 0);
const ok = (s         ) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);

// ── Japan ────────────────────────────────────────────────────────────
                                           
export function jpTenancy(x                                                                                                                                                 ) {
  const items          = [];
  const dates          = [];
  const rent = pos(x.rent), deposit = pos(x.deposit);
  const months = rent ? r2(deposit / rent) : 0;
  items.push({ tone: "info", text: `敷金に法律上の上限はありません（今回の敷金は家賃の${months}か月分）。`, cite: "民法622条の2" });
  items.push({ tone: "info", text: "敷金は、賃貸借が終わって部屋を明け渡したときに、未払いの家賃などを差し引いた残りを返してもらえます。返還までの日数は法律に書かれていません。", cite: "民法622条の2第1項" });
  items.push({ tone: "warn", text: "通常の使用による損耗や経年変化は、借主の原状回復の対象外です。", cite: "民法621条" });
  if (ok(x.handover)) dates.push({ id: "handover", label: "明け渡し日（敷金の返還を求められる日）", date: x.handover , cite: "民法622条の2第1項" });
  if (ok(x.noticeDate)) {
    if (x.lease === "ordinary") {
      dates.push({ id: "tenant", label: "借主が解約を申し入れた場合の終了日（3か月後）", date: addMonths(x.noticeDate , 3), cite: "民法617条1項2号" });
      dates.push({ id: "landlord", label: "貸主が解約を申し入れた場合の終了日（6か月後、正当事由が必要）", date: addMonths(x.noticeDate , 6), cite: "借地借家法27条1項・28条" });
    } else {
      dates.push({ id: "tenant-fixed", label: "床面積200㎡未満の住宅で、転勤・療養・介護などやむを得ない事情で借主が解約を申し入れた場合の終了日（1か月後）", date: addMonths(x.noticeDate , 1), cite: "借地借家法38条7項" });
    }
  }
  if (x.lease === "fixed") items.push({ tone: "info", text: "期間1年以上の定期借家では、貸主は期間満了の1年前から6か月前までに終了を通知します。", cite: "借地借家法38条6項" });
  else items.push({ tone: "info", text: "期間の定めがある普通借家で貸主が更新しないときは、期間満了の1年前から6か月前までに通知が必要です。通知がなければ同じ条件で更新されたものとみなされます。", cite: "借地借家法26条" });
  const s = pos(x.shortfallPerMonth), n = Math.floor(pos(x.shortfallMonths));
  // 増額の裁判が確定したとき、借主が払った額との不足分に年1割の利息（各月の支払期から確定まで）。
  let interest = 0;
  for (let k = 1; k <= n; k++) interest += s * 0.1 * ((n - k + 1) / 12);
  if (s && n) items.push({ tone: "warn", text: `家賃の増額で争いになり裁判で増額が確定すると、不足分（月${s.toLocaleString("ja-JP")}円 × ${n}か月）に年1割の利息が付きます。概算 ${Math.round(interest).toLocaleString("ja-JP")}円。`, cite: "借地借家法32条2項" });
  items.push({ tone: "info", text: "家賃の値上げに上限率はありません。合意できなければ、裁判で決まるまで借主は相当と考える額を払えば足ります。", cite: "借地借家法32条" });
  return { depositMonths: months, interest: Math.round(interest), items, dates, help: "消費者ホットライン 188" };
}

// ── England ──────────────────────────────────────────────────────────
export function ukTenancy(x                                                                                                                   ) {
  const items          = [];
  const dates          = [];
  const annual = pos(x.monthlyRent) * 12;
  const weekly = annual / 52;
  const capWeeks = annual >= 50_000 ? 6 : 5;
  const cap = r2(weekly * capWeeks);
  const deposit = pos(x.deposit);
  const over = r2(Math.max(0, deposit - cap));
  items.push(over > 0
    ? { tone: "warn", text: `The deposit is £${over.toLocaleString("en-GB")} over the ${capWeeks}-week cap of £${cap.toLocaleString("en-GB")}. The excess is a prohibited payment.`, cite: "Tenant Fees Act 2019 Sch. 1 para 2" }
    : { tone: "good", text: `The deposit is within the ${capWeeks}-week cap of £${cap.toLocaleString("en-GB")}.`, cite: "Tenant Fees Act 2019 Sch. 1 para 2" });
  items.push({ tone: "info", text: "Rent in advance is limited to 1 month, and only after the tenancy agreement is signed.", cite: "Renters' Rights Act 2025" });
  items.push({ tone: "warn", text: `If the deposit is not protected within 30 days, the court must order the landlord to pay 1 to 3 times the deposit (£${deposit.toLocaleString("en-GB")} to £${(deposit * 3).toLocaleString("en-GB")}).`, cite: "Housing Act 2004 s.213–214" });
  items.push({ tone: "info", text: "Since 1 May 2026 private tenancies are periodic and section 21 'no-fault' notices are gone. The landlord needs a possession ground; notice is usually 4 months.", cite: "Renters' Rights Act 2025" });
  items.push({ tone: "info", text: "Rent can rise once a year, not in the first 12 months, with Form 4A and at least 2 months' notice. There is no percentage cap; you can challenge an above-market rise at the First-tier Tribunal.", cite: "Housing Act 1988 s.13 as amended" });
  if (ok(x.received)) dates.push({ id: "protect", label: "Deposit must be protected and prescribed information given", date: addDays(x.received , 30), cite: "Housing Act 2004 s.213" });
  if (ok(x.agreed)) dates.push({ id: "return", label: "Deposit returned (10 days after you both agree the amount)", date: addDays(x.agreed , 10), cite: "gov.uk tenancy deposit protection" });
  if (ok(x.noticeDate)) {
    dates.push({ id: "tenant", label: "Your tenancy ends if you give 2 months' notice today", date: addMonths(x.noticeDate , 2), cite: "Renters' Rights Act 2025" });
    dates.push({ id: "landlord", label: "Earliest end on a usual 4-month landlord notice", date: addMonths(x.noticeDate , 4), cite: "Housing Act 1988 Sch. 2 as amended" });
  }
  if (ok(x.start)) {
    dates.push({ id: "protected", label: "First 12 months end: selling or moving-in grounds usable after this", date: addMonths(x.start , 12), cite: "Renters' Rights Act 2025" });
    dates.push({ id: "rent-rise", label: "Earliest date a rent increase can take effect", date: addMonths(x.start , 12), cite: "Housing Act 1988 s.13" });
  }
  return { cap, capWeeks, over, items, dates };
}

// ── United States: California and New York ──────────────────────────
                                  
                                                                         
export const CA_RENT_CAP_2026                                                   = {
  la: { label: "Los Angeles / Orange", pct: 8.7 },
  riverside: { label: "Riverside / San Bernardino", pct: 8.1 },
  sandiego: { label: "San Diego", pct: 8.2 },
  bay: { label: "SF Bay Area (Alameda, Contra Costa, Marin, SF, San Mateo)", pct: 8.8 },
  other: { label: "All other counties", pct: 8.6 },
};
export function usTenancy(x                                                                                                                                                                                                                                                                        ) {
  const items          = [];
  const dates          = [];
  const rent = pos(x.rent), deposit = pos(x.deposit), lived = pos(x.monthsLived);
  let cap        , landlordDays        , returnDays        , maxIncreasePct                = null;
  if (x.state === "CA") {
    cap = rent * (x.smallLandlord ? 2 : 1);
    returnDays = 21;
    landlordDays = x.assistance ? 90 : lived >= 12 ? 60 : 30;
    const reg = CA_RENT_CAP_2026[x.region ?? "other"];
    maxIncreasePct = reg.pct;
    items.push(deposit > cap
      ? { tone: "warn", text: `The deposit is $${(deposit - cap).toLocaleString("en-US")} over the ${x.smallLandlord ? "2-month small-landlord" : "1-month"} cap.`, cite: "Civ. Code §1950.5 (AB 12)" }
      : { tone: "good", text: `The deposit is within the ${x.smallLandlord ? "2-month small-landlord" : "1-month"} cap.`, cite: "Civ. Code §1950.5 (AB 12)" });
    items.push({ tone: "info", text: "The landlord returns the deposit with an itemized statement within 21 days of move-out; receipts are needed for deductions over $125. Bad-faith retention can cost up to 2 times the deposit.", cite: "Civ. Code §1950.5" });
    items.push({ tone: "info", text: `Covered units (AB 1482): rent may rise at most 5% + regional CPI, capped at 10%, in any 12 months. For 8/1/2026–7/31/2027 the AG maximum in ${reg.label} is ${reg.pct}% (up to $${Math.round(rent * reg.pct / 100).toLocaleString("en-US")} a month). Most single-family homes and condos not owned by corporations, and housing under 15 years old, are not covered.`, cite: "Civ. Code §1947.12; oag.ca.gov/rentcaps" });
    if (lived >= 12) items.push({ tone: "info", text: "After 12 months, covered units need a just cause stated in the termination notice.", cite: "Civ. Code §1946.2" });
  } else {
    cap = rent;
    returnDays = 14;
    const lease = pos(x.leaseMonths);
    landlordDays = lived >= 24 || lease >= 24 ? 90 : lived >= 12 || lease >= 12 ? 60 : 30;
    items.push(deposit > cap
      ? { tone: "warn", text: `The deposit is $${(deposit - cap).toLocaleString("en-US")} over the 1-month cap, and last month's rent cannot be demanded on top.`, cite: "GOL §7-108(1-a)" }
      : { tone: "good", text: "The deposit is within the 1-month cap.", cite: "GOL §7-108(1-a)" });
    items.push({ tone: "warn", text: "Within 14 days of move-out the landlord must return the deposit with an itemized statement. Missing the deadline forfeits the right to keep any of it; a wilful violation adds up to 2 times the deposit.", cite: "GOL §7-108(1)(e),(g)" });
    items.push({ tone: "info", text: `For non-renewal or a rent increase of 5% or more, the landlord must give ${landlordDays} days' notice based on how long you have lived there and the lease length.`, cite: "RPL §226-c" });
    if (x.nycStabilized) {
      const s = x.leaseStart ?? "";
      const pct = s >= "2026-10-01" && s <= "2027-09-30" ? 0 : s >= "2025-10-01" && s <= "2026-09-30" ? (x.twoYear ? 4.5 : 3) : null;
      maxIncreasePct = pct;
      items.push(pct === null
        ? { tone: "info", text: "Rent Guidelines Board rates are shown for renewal leases starting 10/1/2025–9/30/2027 only.", cite: "NYC RGB Orders #57, #58" }
        : { tone: pct === 0 ? "good" : "info", text: `NYC rent-stabilized renewal starting ${s}: ${x.twoYear ? "2-year" : "1-year"} guideline ${pct}%.`, cite: pct === 0 ? "RGB Order #58" : "RGB Order #57" });
    } else {
      items.push({ tone: "info", text: "In NYC and opted-in cities, Good Cause Eviction presumes an increase above the lower of 5% + CPI or 10% unreasonable (check coverage on hcr.ny.gov).", cite: "RPL Art. 6-A" });
    }
  }
  if (ok(x.moveOut)) dates.push({ id: "return", label: `Deposit and itemized statement due (${returnDays} days after move-out)`, date: addDays(x.moveOut , returnDays), cite: x.state === "CA" ? "Civ. Code §1950.5" : "GOL §7-108(1)(e)" });
  if (ok(x.noticeDate)) {
    dates.push({ id: "tenant", label: x.state === "CA" ? "Your month-to-month tenancy ends on 30 days' notice given today" : "Your monthly tenancy (outside NYC) ends on 1 month's notice given today", date: x.state === "CA" ? addDays(x.noticeDate , 30) : addMonths(x.noticeDate , 1), cite: x.state === "CA" ? "Civ. Code §1946" : "RPL §232-b" });
    dates.push({ id: "landlord", label: `Earliest end on a landlord notice given today (${landlordDays} days)`, date: addDays(x.noticeDate , landlordDays), cite: x.state === "CA" ? "Civ. Code §1946.1" : "RPL §226-c" });
  }
  return { cap, returnDays, landlordDays, maxIncreasePct, items, dates };
}
/** Landlord notice days by months lived (and lease months for NY). */
export const usLandlordDays = (state         , monthsLived        , assistance = false, leaseMonths = 0) =>
  state === "CA" ? (assistance ? 90 : monthsLived >= 12 ? 60 : 30) : monthsLived >= 24 || leaseMonths >= 24 ? 90 : monthsLived >= 12 || leaseMonths >= 12 ? 60 : 30;

// ── France ───────────────────────────────────────────────────────────
                                        
export const IRL                                                    = {
  "T3 2026": { value: 148.06, change: 1.57 }, "T2 2026": { value: 148.37, change: 1.15 }, "T1 2026": { value: 146.6, change: 0.78 },
  "T4 2025": { value: 145.78, change: 0.79 }, "T3 2025": { value: 145.77, change: 0.87 }, "T2 2025": { value: 146.68, change: 1.04 }, "T1 2025": { value: 145.47, change: 1.4 },
};
/** Pénalité de retard : 10 % du loyer mensuel hors charges par mois de retard commencé. */
export const frLatePenalty = (rentHC        , daysLate        ) => (daysLate <= 0 ? 0 : Math.ceil(daysLate / 30.4375) * 0.1 * pos(rentHC));
export function frTenancy(x                                                                                                                                                                                                                                                       ) {
  const items          = [];
  const dates          = [];
  const rent = pos(x.rentHC), deposit = pos(x.deposit);
  const capMonths = x.lease === "vide" ? 1 : 2;
  const cap = rent * capMonths;
  items.push(deposit > cap
    ? { tone: "warn", text: `Le dépôt de garantie dépasse de ${(deposit - cap).toLocaleString("fr-FR")} € le maximum de ${capMonths} mois de loyer hors charges.`, cite: x.lease === "vide" ? "Loi 89-462 art. 22" : "Loi 89-462 art. 25-6" }
    : { tone: "good", text: `Le dépôt de garantie respecte le maximum de ${capMonths} mois de loyer hors charges (${cap.toLocaleString("fr-FR")} €).`, cite: x.lease === "vide" ? "Loi 89-462 art. 22" : "Loi 89-462 art. 25-6" });
  let due                = null, penalty = 0, late = 0;
  if (ok(x.keysReturned)) {
    due = addMonths(x.keysReturned , x.sameInventory ? 1 : 2);
    dates.push({ id: "return", label: `Restitution du dépôt de garantie (${x.sameInventory ? "1 mois, état des lieux conforme" : "2 mois, état des lieux différent"})`, date: due, cite: "Loi 89-462 art. 22" });
    if (ok(x.refundedOn)) { late = Math.max(0, daysBetween(due, x.refundedOn )); penalty = frLatePenalty(rent, late); }
  }
  if (penalty > 0) items.push({ tone: "warn", text: `Restitution en retard de ${late} jours : majoration de 10 % du loyer mensuel par mois commencé, soit ${penalty.toLocaleString("fr-FR")} € (sauf si vous n'avez pas donné votre nouvelle adresse).`, cite: "Loi 89-462 art. 22" });
  if (ok(x.noticeDate)) {
    const m = x.lease === "meuble" || x.reducedNotice ? 1 : 3;
    dates.push({ id: "tenant", label: `Fin du bail si vous donnez congé aujourd'hui (préavis ${m} mois)`, date: addMonths(x.noticeDate , m), cite: x.lease === "meuble" ? "Loi 89-462 art. 25-8" : "Loi 89-462 art. 15" });
  }
  if (ok(x.leaseEnd)) dates.push({ id: "landlord", label: `Dernier jour pour que le congé du bailleur vous parvienne (${x.lease === "vide" ? 6 : 3} mois avant l'échéance)`, date: addMonths(x.leaseEnd , x.lease === "vide" ? -6 : -3), cite: x.lease === "vide" ? "Loi 89-462 art. 15" : "Loi 89-462 art. 25-8" });
  const q = IRL[x.quarter ?? "T3 2026"];
  let newRent = rent;
  if (x.dpeFG) items.push({ tone: "warn", text: "Logement classé F ou G au DPE : aucune hausse de loyer n'est permise (relocation et renouvellement).", cite: "Loi Climat et résilience" });
  else if (!x.revisionClause) items.push({ tone: "info", text: "Sans clause de révision dans le bail, le loyer ne peut pas être révisé en cours de bail.", cite: "Loi 89-462 art. 17-1" });
  else {
    newRent = r2(rent * (1 + q.change / 100));
    items.push({ tone: "info", text: `Révision annuelle plafonnée par l'IRL (${x.quarter ?? "T3 2026"} : ${q.value}, +${q.change} % sur un an) : au plus ${newRent.toLocaleString("fr-FR")} € hors charges.`, cite: "Loi 89-462 art. 17-1 ; INSEE" });
  }
  items.push({ tone: "info", text: "Encadrement des loyers (Paris, Lyon, Lille, Bordeaux, Montpellier…) : vérifiez le loyer de référence de votre ville ; les dates d'application sont à confirmer pour Paris, Est Ensemble et Plaine Commune après le 24 novembre 2026.", cite: "Loi ELAN art. 140" });
  return { cap, capMonths, due, late, penalty, newRent, items, dates };
}

// ── Spain ────────────────────────────────────────────────────────────
export const IRAV_SEP_2026 = 2.54;
export function esTenancy(x                                                                                                                                        ) {
  const items          = [];
  const dates          = [];
  const rent = pos(x.rent), fianza = pos(x.fianza), extra = pos(x.extraGuarantee);
  items.push(fianza !== rent
    ? { tone: "warn", text: `La fianza en metálico de una vivienda es de 1 mensualidad (${rent.toLocaleString("es-ES")} €).`, cite: "LAU art. 36.1" }
    : { tone: "good", text: "La fianza es de 1 mensualidad, como exige la ley.", cite: "LAU art. 36.1" });
  if (extra > rent * 2) items.push({ tone: "warn", text: `La garantía adicional supera en ${(extra - rent * 2).toLocaleString("es-ES")} € el máximo de 2 mensualidades.`, cite: "LAU art. 36.5" });
  items.push({ tone: "info", text: "El arrendador no puede exigir más de 1 mes de renta por adelantado.", cite: "LAU art. 17.2" });
  const years = x.company ? 7 : 5;
  if (ok(x.start)) {
    const end = addMonths(x.start , years * 12);
    dates.push({ id: "min-term", label: `Fin de la prórroga obligatoria (${years} años)`, date: end, cite: "LAU art. 9" });
    dates.push({ id: "landlord", label: "Último día para que el arrendador avise que no renueva (4 meses antes)", date: addMonths(end, -4), cite: "LAU art. 10.1" });
    dates.push({ id: "tenant-end", label: "Último día para que usted avise que no renueva (2 meses antes)", date: addMonths(end, -2), cite: "LAU art. 10.1" });
    dates.push({ id: "six", label: "Desde esta fecha puede desistir con 30 días de preaviso (6 meses de contrato)", date: addMonths(x.start , 6), cite: "LAU art. 11" });
  }
  if (ok(x.noticeDate)) {
    const byNotice = addDays(x.noticeDate , 30);
    const sixMonths = ok(x.start) ? addMonths(x.start , 6) : byNotice;
    const end = byNotice > sixMonths ? byNotice : sixMonths;
    dates.push({ id: "tenant", label: "Fin del contrato si avisa hoy (30 días, nunca antes de 6 meses)", date: end, cite: "LAU art. 11" });
  }
  if (ok(x.keysReturned)) dates.push({ id: "return", label: "Devolución de la fianza (1 mes tras entregar las llaves; después devenga interés legal)", date: addMonths(x.keysReturned , 1), cite: "LAU art. 36.4" });
  items.push({ tone: "info", text: `Actualización anual solo si el contrato la prevé y como máximo el IRAV del INE (septiembre de 2026: ${IRAV_SEP_2026} %, hasta ${r2(rent * (1 + IRAV_SEP_2026 / 100)).toLocaleString("es-ES")} €).`, cite: "LAU art. 18; INE" });
  items.push({ tone: "warn", text: `Del 8-10-2026 al 31-12-2027, el Real Decreto-ley 29/2026 limita la actualización sin nuevo acuerdo al 2 % (hasta ${r2(rent * 1.02).toLocaleString("es-ES")} €) y a 0 % si la renta ya supera el índice de referencia. Confirme si su contrato está incluido.`, cite: "RDL 29/2026 DF 6ª" });
  return { maxIrav: r2(rent * (1 + IRAV_SEP_2026 / 100)), max2: r2(rent * 1.02), years, items, dates };
}

// ── Mainland China ───────────────────────────────────────────────────
export function cnTenancy(x                                                                                              ) {
  const items          = [];
  const term = pos(x.termMonths);
  if (term > 240) items.push({ tone: "warn", text: `租期${Math.round(term / 12)}年超过20年，超过部分无效。`, cite: "民法典第705条" });
  if (term >= 6 && !x.written) items.push({ tone: "warn", text: "租期6个月以上应当采用书面形式；没有书面合同又无法确定租期的，视为不定期租赁，双方可以随时解除，但应在合理期限前通知。", cite: "民法典第707条、第730条" });
  items.push({ tone: "info", text: "国家层面没有押金上限；合同应写明押金数额、返还时间和扣减条件。出租人无正当理由不得扣减押金。", cite: "住房租赁条例第10条" });
  if (!x.returnDays) items.push({ tone: "warn", text: "合同里还没有写押金返还时间。签约前把返还天数写进去。", cite: "住房租赁条例第10条" });
  items.push({ tone: "info", text: "房屋租赁中介和网络平台不得代收、代管租金和押金。", cite: "住房租赁条例" });
  items.push({ tone: "info", text: "出租人依法解除合同，应通知承租人并给予合理的搬离时间，不得以暴力、威胁等方式迫使承租人搬离。", cite: "住房租赁条例第12条" });
  items.push({ tone: "info", text: "租金涨幅没有全国上限；地级以上城市政府负责监测并公布租金水平。各城市可能有押金监管等地方规定。", cite: "住房租赁条例第29条" });
  const months = pos(x.rent) ? r2(pos(x.deposit) / pos(x.rent)) : 0;
  return { validMonths: Math.min(term, 240), depositMonths: months, items, help: "12345 政务服务便民热线" };
}

// ── Taiwan ───────────────────────────────────────────────────────────
export function twTenancy(x                                                                           ) {
  const items          = [];
  const dates          = [];
  const cap = pos(x.rent) * 2, deposit = pos(x.deposit);
  items.push(deposit > cap
    ? { tone: "warn", text: `押金超過2個月租金的上限 ${(deposit - cap).toLocaleString("zh-TW")} 元。`, cite: "租賃住宅市場發展及管理條例第7條第1項" }
    : { tone: "good", text: `押金在2個月租金（${cap.toLocaleString("zh-TW")} 元）以內。`, cite: "租賃住宅市場發展及管理條例第7條第1項" });
  items.push({ tone: "info", text: "租期屆滿、返還房屋並清償債務後，出租人應返還押金或抵充後的餘額。法律沒有規定返還天數。", cite: "租賃住宅市場發展及管理條例第7條第2項" });
  items.push({ tone: "info", text: "法律沒有租金調漲上限，由雙方約定。", cite: "租賃住宅市場發展及管理條例第6條" });
  if (ok(x.noticeDate)) {
    dates.push({ id: "tenant", label: "承租人依法定事由（長期照顧、出租人不修繕等）提前終止：書面通知30日後", date: addDays(x.noticeDate , 30), cite: "租賃住宅市場發展及管理條例第11條" });
    dates.push({ id: "landlord", label: x.rebuild ? "出租人因重建提前終止：書面通知3個月後" : "出租人依法定事由（欠租達2個月等）提前終止：書面通知30日後", date: x.rebuild ? addMonths(x.noticeDate , 3) : addDays(x.noticeDate , 30), cite: "租賃住宅市場發展及管理條例第10條" });
  }
  items.push({ tone: "info", text: "租賃糾紛可向直轄市、縣（市）政府不動產糾紛調處委員會申請免費調處；消費者服務專線 1950。", cite: "租賃住宅市場發展及管理條例" });
  return { cap, items, dates };
}
