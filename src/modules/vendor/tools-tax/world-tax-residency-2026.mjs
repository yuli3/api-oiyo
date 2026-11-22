// GENERATED from tools-oiyo src/lib/world-tax-residency-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// Individual tax residency tests (2026-11-22, world pro-gap #8): US substantial presence, UK statutory residence test (simplified), Spain, Taiwan (day counts),
// Japan and France (criteria only, no day test). General information only: not tax advice; tax treaties can override the result.
// Facts: /mnt/project-files/notes/tax-residency-facts-2026-11-22.md (IRS substantial presence test, gov.uk residence + RDR3, AEAT persona física residente,
// 財政部 etax Q&A 所得稅法第7條, 国税庁 タックスアンサー 2875/2012, impots.gouv "Suis-je non-résident").
// Not computed because not verified: US closer connection, UK midnight/deeming rules and split year, JP 非永住者, FR treaty tie-breakers.

export const RESIDENCY_AS_OF = "2026-11-22";
                                            
                                                               
                                                             

const days = (n         ) => Math.max(0, Math.min(366, Math.floor(Number(n) || 0)));

// ── US ──────────────────────────────────────────────────────────────
export function usSubstantialPresence(x                                                                            ) {
  const cur = Math.max(0, days(x.current) - days(x.exemptDays));
  const weighted = cur + days(x.prior1) / 3 + days(x.prior2) / 6;
  const w = Math.floor(weighted * 100) / 100;
  const verdict          = cur >= 31 && weighted >= 183 ? "resident" : "nonresident";
  const items          = [
    { tone: "info", text: `Days counted this year: ${cur}. Weighted 3-year total: ${w} (all of this year + 1/3 of last year + 1/6 of the year before). The test needs at least 31 and 183.`, cite: "IRS substantial presence test" },
    { tone: "warn", text: "Days as an exempt individual (for example F, J, M or Q students, J or Q teachers and trainees, A or G visa holders), regular commuting from Canada or Mexico, transit under 24 hours and some medical days are not counted. Form 8843 is used to exclude them.", cite: "IRS substantial presence test" },
    { tone: "info", text: "Even if you meet the test, the closer connection exception or a tax treaty can make you a nonresident. Those are not checked here.", cite: "IRS" },
  ];
  return { asOf: RESIDENCY_AS_OF, verdict, counted: cur, weighted: w, items };
}

// ── UK ──────────────────────────────────────────────────────────────
export function ukStatutoryResidence(x                                                                                                                                                             ) {
  const d = days(x.days);
  const ties = Math.max(0, Math.min(x.residentInPrior3 ? 5 : 4, Math.floor(Number(x.ties) || 0)));
  const items          = [];
  let verdict         ;
  let test        ;
  const overseas = (x.residentInPrior3 && d < 16) || (!x.residentInPrior3 && d < 46) || (!!x.fullTimeAbroad && d < 91 && (Number(x.ukWorkDays) || 0) < 31);
  if (overseas) {
    verdict = "nonresident";
    test = x.fullTimeAbroad && d < 91 && (Number(x.ukWorkDays) || 0) < 31 && !((x.residentInPrior3 && d < 16) || (!x.residentInPrior3 && d < 46)) ? "Automatic overseas test (full-time work abroad)" : `Automatic overseas test (fewer than ${x.residentInPrior3 ? 16 : 46} days)`;
  } else if (d >= 183) {
    verdict = "resident"; test = "Automatic UK test (183 days or more)";
  } else if (x.onlyHomeInUk || x.fullTimeUkWork) {
    verdict = "resident"; test = x.onlyHomeInUk ? "Automatic UK test (only home in the UK)" : "Automatic UK test (full-time work in the UK)";
  } else {
    const need = x.residentInPrior3 ? (d <= 45 ? 4 : d <= 90 ? 3 : d <= 120 ? 2 : 1) : (d <= 90 ? 4 : d <= 120 ? 3 : 2);
    verdict = ties >= need ? "resident" : "nonresident";
    test = `Sufficient ties test: ${d} days needs ${need} ties, you have ${ties}`;
  }
  items.push({ tone: "info", text: `${test}. The UK tax year runs from 6 April to 5 April.`, cite: "gov.uk residence; RDR3" });
  items.push({ tone: "info", text: `Ties counted: family, accommodation, work, 90-day${x.residentInPrior3 ? " and country (because you were UK resident in at least one of the last 3 tax years)" : ""}.`, cite: "RDR3" });
  items.push({ tone: "warn", text: "The only-home, full-time-work and full-time-work-abroad tests have detailed conditions (91 consecutive days, 30 days in the year, 75% of working days, no significant break) that you confirm yourself. Day-counting rules, the deeming rule and split-year treatment are not applied here.", cite: "RDR3" });
  return { asOf: RESIDENCY_AS_OF, verdict, test, items };
}

// ── Spain ───────────────────────────────────────────────────────────
export function esResidency(x                                                                                                             ) {
  const d = days(x.days);
  const byDays = d > 183;
  const verdict          = byDays || x.economicCentre ? "resident" : x.familyInSpain ? "depends" : "nonresident";
  const items          = [
    { tone: "info", text: byDays ? `Más de 183 días en el año natural (${d}): residencia habitual en España.` : `${d} días: no supera los 183 días del año natural.`, cite: "AEAT — persona física residente en España" },
    { tone: "info", text: "También es residente quien tiene en España el núcleo principal o la base de sus actividades o intereses económicos.", cite: "AEAT" },
    { tone: "warn", text: "Las ausencias esporádicas cuentan como días en España salvo que se acredite la residencia fiscal en otro país. Un convenio de doble imposición puede cambiar el resultado.", cite: "AEAT" },
  ];
  if (x.familyInSpain) items.push({ tone: "warn", text: "Se presume residente si el cónyuge no separado y los hijos menores que dependen de usted residen en España (se admite prueba en contrario).", cite: "AEAT" });
  if (x.residentElsewhereCertificate && byDays) items.push({ tone: "info", text: "Con un certificado de residencia fiscal de otro país, las ausencias esporádicas no se suman; revise el cómputo.", cite: "AEAT" });
  return { asOf: RESIDENCY_AS_OF, verdict, days: d, items };
}

// ── Taiwan ──────────────────────────────────────────────────────────
export function twResidency(x                                                                        ) {
  const d = days(x.days);
  let verdict         ;
  let rule        ;
  if (x.householdRegistration) {
    if (d >= 31) { verdict = "resident"; rule = "有住所（設有戶籍）且一課稅年度內居住合計滿31天"; }
    else if (d >= 1 && x.lifeCentre) { verdict = "resident"; rule = "有住所，居住1至30天且生活及經濟重心在境內"; }
    else { verdict = "nonresident"; rule = d >= 1 ? "居住未滿31天，且未選生活及經濟重心在境內" : "本年度未在境內居住"; }
  } else {
    verdict = d >= 183 ? "resident" : "nonresident";
    rule = d >= 183 ? "無住所，一課稅年度內居留合計滿183天" : "無住所，居留未滿183天";
  }
  const items          = [
    { tone: "info", text: `${rule}（${d}天）。`, cite: "所得稅法第7條、財政部稅務入口網" },
    { tone: "info", text: "生活及經濟重心可參考：加入全民健保、配偶或未成年子女在境內、在境內經營事業或工作等。", cite: "財政部稅務入口網" },
    { tone: "warn", text: "非居住者的扣繳方式不在此計算。", cite: "—" },
  ];
  return { asOf: RESIDENCY_AS_OF, verdict, days: d, items };
}

// ── Japan and France: criteria only ─────────────────────────────────
export function jpResidency(x                                                         ) {
  const verdict          = x.domicileInJapan || x.residedOneYear ? "resident" : x.domicileInJapan === false && x.residedOneYear === false ? "nonresident" : "depends";
  const items          = [
    { tone: "info", text: "国内に住所（生活の本拠）があるか、現在まで引き続いて1年以上居所がある人が居住者です。住所は住居・職業・資産・家族などの客観的事実で判断します。", cite: "国税庁 タックスアンサー No.2875" },
    { tone: "warn", text: "日数だけでは決まりません。1年の半分（183日）以上を海外で過ごしても、生活の本拠が日本にあれば居住者になることがあります。", cite: "国税庁 タックスアンサー No.2012" },
    { tone: "info", text: "租税条約の振り分けは、恒久的住居、利害関係の中心、常用の住居、国籍の順に見ます。非永住者の区分はここでは判定していません。", cite: "国税庁 タックスアンサー No.2875" },
  ];
  return { asOf: RESIDENCY_AS_OF, verdict, items };
}

export function frResidency(x                                                                                               ) {
  const any = x.foyerInFrance || x.mainActivityInFrance || x.economicCentreInFrance;
  const verdict          = any ? "resident" : x.foyerInFrance === false && x.mainActivityInFrance === false && x.economicCentreInFrance === false ? "nonresident" : "depends";
  const items          = [
    { tone: "info", text: "Vous êtes domicilié fiscalement en France si un seul de ces critères est rempli : votre foyer (ou, à défaut, votre lieu de séjour principal) est en France ; vous y exercez votre activité professionnelle principale ; le centre de vos intérêts économiques y est situé.", cite: "impots.gouv.fr — art. 4 B CGI" },
    { tone: "warn", text: "Il n'y a pas de seuil de jours dans ces critères. Une convention fiscale prévaut sur le droit interne et ses critères peuvent différer.", cite: "impots.gouv.fr" },
  ];
  return { asOf: RESIDENCY_AS_OF, verdict, items };
}

export const RESIDENCY_HELP = { us: "IRS", uk: "HMRC", es: "Agencia Tributaria (AEAT)", tw: "各地區國稅局", jp: "所轄の税務署", fr: "centre des finances publiques" }         ;
