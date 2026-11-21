// GENERATED from tools-oiyo src/lib/fr-tax-pack-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// Guide fiscal et comptable France (2026-11-21, localisation par pays n°3 : France). Informations générales et estimations
// uniquement : pas de conseil personnalisé, pas de tenue ni d'établissement de déclarations.
// Le même code alimente la compétence oiyo-fr-tax-guide (scripts/calc.mjs) et les outils MCP api.oiyo.net (*_fr_*).
// Sources vérifiées le 2026-11-21 (company-brain projects/oiyo-ecosystem/fr-tax-pack-facts-2026-11-21.md) :
// - service-public.fr F32353 (seuils micro 2026 : 203 100 € / 83 600 €), F23267 (abattements 71/50/34 %, versement
//   libératoire 1/1,7/2,2 %, RFR 29 579 € par part), F36232 (cotisations 2026 : 12,3/21,2/25,6 %, CIPAV 23,2 %),
//   F21746 (franchise TVA 85 000/93 500 € et 37 500/41 250 €), F23566 (régimes TVA), F23547 (CFE 15 décembre),
//   F1419 (barème de l'impôt sur les revenus 2025 ; barème 2026 non encore voté).
// - BOFiP : BOI-IS-DECLA-20-10 (acomptes IS 15/3, 15/6, 15/9, 15/12), ACTU-2021-00178 (intérêt de retard 0,20 %/mois),
//   BOI-CF-INF-10-20-10 (CGI 1728 : 10/40/80 %), BOI-ANNX-000277 (CGI 1729 : 40/80 %), BOI-CTX-PREA-10-30
//   (réclamation : 31 décembre de la 2e année suivante ; impôts directs locaux : année suivante),
//   BOI-BIC-AMT-20-20-30 (coefficients dégressifs 1,25/1,75/2,25 ; prorata temporis), BOI-BIC-CHG-20-30-10 (500 € HT).

export const FR_TAX_AS_OF = "2026-11-21";
export const FR_TAX_NOTE = "Informations générales et estimations à partir des textes et des fiches officielles publiées. Ce n'est pas un conseil fiscal personnalisé et cet outil n'établit ni ne dépose aucune déclaration. Pour votre situation, adressez-vous à votre service des impôts (SIP/SIE, messagerie impots.gouv), à un espace France Services, ou à un expert-comptable ou un avocat.";

                                            
                                                                

const iso = (d      ) => d.toISOString().slice(0, 10);
const utc = (y        , m        , d        ) => new Date(Date.UTC(y, m - 1, d));
const days = (a        , b        ) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
const eur = (n        ) => `${Math.round(n).toLocaleString("fr-FR")} €`;

/** Échéance un samedi ou un dimanche : jour ouvré suivant (règle indiquée par service-public pour la CFE). */
export function frShift(d      )       {
  let t = d;
  while (t.getUTCDay() === 0 || t.getUTCDay() === 6) t = new Date(t.getTime() + 86_400_000);
  return t;
}

// ── 1. Calendrier ────────────────────────────────────────────────────
                                                                                                                                        
                                                                                                                    

export function frTaxCalendar(x                 ) {
  const y = x.year;
  const ev            = [];
  const at = (id        , label        , d      , cite        ) => {
    const s = iso(frShift(d));
    ev.push({ id, label, date: s, cite, ...(x.today ? { daysLeft: days(x.today, s) } : {}) });
  };
  ev.push({ id: "ir", label: `Déclaration des revenus de ${y - 1} : ouverture en avril ${y}, dates limites en ligne par département publiées chaque printemps`, month: `${y}-04`, cite: "service-public.fr F358" });
  if (x.is) for (const [i, m] of [3, 6, 9, 12].entries()) at(`is${i + 1}`, `Acompte d'impôt sur les sociétés n°${i + 1} (exercice clos le 31 décembre)`, utc(y, m, 15), "BOFiP BOI-IS-DECLA-20-10");
  if (x.cfe) at("cfe", `Cotisation foncière des entreprises ${y}`, utc(y, 12, 15), "service-public.fr F23547");
  if (x.tva === "simplifie") {
    ev.push({ id: "tva-ca12", label: `Déclaration annuelle de TVA (CA12) pour ${y - 1}`, month: `${y}-05`, cite: "service-public.fr F23566" });
    ev.push({ id: "tva-ac1", label: "Acompte de TVA de juillet (55 % de la TVA due l'année précédente)", month: `${y}-07`, cite: "service-public.fr F23566" });
    ev.push({ id: "tva-ac2", label: "Acompte de TVA de décembre (40 %)", month: `${y}-12`, cite: "service-public.fr F23566" });
  }
  if (x.tva === "normal") ev.push({ id: "tva-m", label: "Déclaration de TVA mensuelle (trimestrielle si la TVA annuelle est inférieure à 4 000 €), date selon votre entreprise", month: "chaque mois", cite: "service-public.fr F23566" });
  ev.sort((a, b) => (a.date ?? a.month ?? "").localeCompare(b.date ?? b.month ?? ""));
  const items           = [];
  if (x.tva === "simplifie") items.push({ tone: "warn", text: "Le régime réel simplifié de TVA est indiqué valable jusqu'au 31 décembre 2026 ; les obligations peuvent changer à partir de 2027.", cite: "service-public.fr F23566" });
  items.push({ tone: "info", text: "Les dates exactes de la déclaration annuelle de TVA et des acomptes figurent dans votre espace professionnel impots.gouv.", cite: "service-public.fr F23566" });
  return { events: ev, items };
}

// ── 2. Micro-entrepreneur : seuils, cotisations, impôt ───────────────
                                                              
export const MICRO_2026 = {
  vente: { ceiling: 203_100, abattement: 0.71, social: 0.123, vl: 0.01, label: "Vente de marchandises, hébergement (BIC)" },
  services: { ceiling: 83_600, abattement: 0.5, social: 0.212, vl: 0.017, label: "Prestations de services (BIC)" },
  bnc: { ceiling: 83_600, abattement: 0.34, social: 0.256, vl: 0.022, label: "Profession libérale non réglementée (BNC)" },
  cipav: { ceiling: 83_600, abattement: 0.34, social: 0.232, vl: 0.022, label: "Profession libérale réglementée, CIPAV (BNC)" },
}         ;
export const VL_RFR_PER_PART = 29_579;
/** Barème de l'impôt sur les revenus 2025 (service-public F1419). Le barème des revenus 2026 n'est pas encore voté. */
export const BAREME_2025                     = [[11_600, 0], [29_579, 0.11], [84_577, 0.3], [181_917, 0.41], [Infinity, 0.45]];

export function frIncomeTax(taxable        , parts = 1)         {
  const q = Math.max(0, taxable) / Math.max(1, parts);
  let t = 0, lo = 0;
  for (const [hi, r] of BAREME_2025) {
    if (q <= lo) break;
    t += (Math.min(q, hi) - lo) * r;
    lo = hi;
  }
  return Math.round(t * Math.max(1, parts));
}

                                                                                                                                                                 

export function frMicro(x            ) {
  const p = MICRO_2026[x.activity];
  const parts = Math.max(1, x.parts ?? 1);
  const items           = [];
  const over = [x.caPrev, x.caPrev2].filter((v)              => v != null && v > p.ceiling).length;
  if (over === 2) items.push({ tone: "warn", text: `Le chiffre d'affaires a dépassé ${eur(p.ceiling)} deux années de suite : sortie du régime micro.`, cite: "service-public.fr F32353" });
  else if (x.ca > p.ceiling) items.push({ tone: "warn", text: `Au-dessus de ${eur(p.ceiling)} cette année. Le régime micro est conservé si l'autre année de référence est sous le seuil.`, cite: "service-public.fr F32353" });
  const social = Math.round(x.ca * p.social);
  const taxableMicro = Math.round(x.ca * (1 - p.abattement));
  const vlOk = x.rfr == null ? null : x.rfr < VL_RFR_PER_PART * parts;
  const vlTax = Math.round(x.ca * p.vl);
  const other = Math.max(0, x.otherIncome ?? 0);
  const withMicro = frIncomeTax(other + taxableMicro, parts);
  const withoutMicro = frIncomeTax(other, parts);
  const baremeTax = withMicro - withoutMicro;
  const chosen = x.vl && vlOk !== false ? vlTax : baremeTax;
  items.push({ tone: "info", text: `Cotisations sociales ${(p.social * 100).toFixed(1).replace(".", ",")} % du chiffre d'affaires : ${eur(social)}.`, cite: "service-public.fr F36232" });
  items.push({ tone: "info", text: `Revenu imposable après abattement de ${Math.round(p.abattement * 100)} % : ${eur(taxableMicro)}.`, cite: "service-public.fr F23267" });
  if (vlOk === false) items.push({ tone: "warn", text: `Versement libératoire impossible : revenu fiscal de référence N-2 d'au moins ${eur(VL_RFR_PER_PART * parts)} pour ${parts} part(s).`, cite: "service-public.fr F23267" });
  items.push({ tone: "info", text: `Versement libératoire ${(p.vl * 100).toFixed(1).replace(".", ",")} % : ${eur(vlTax)} ; au barème (revenus 2025, sans plafonnement du quotient familial) : environ ${eur(baremeTax)}.`, cite: "service-public.fr F23267, F1419" });
  items.push({ tone: "info", text: "Le barème des revenus 2026 sera fixé par la loi de finances pour 2027 ; l'estimation utilise le barème des revenus 2025. CFE, CSG sur autres revenus et crédits d'impôt non inclus.", cite: "service-public.fr F1419" });
  const net = x.ca - social - chosen;
  return { ceiling: p.ceiling, social, taxableMicro, vlTax, baremeTax, vlEligible: vlOk, incomeTax: chosen, net: Math.round(net), rate: x.ca > 0 ? (social + chosen) / x.ca : 0, items };
}

// ── 3. Franchise en base de TVA ──────────────────────────────────────
export const TVA_FRANCHISE_2026 = { vente: { base: 85_000, majore: 93_500 }, services: { base: 37_500, majore: 41_250 } }         ;
export const TVA_RATES = [0.2, 0.1, 0.055, 0.021]         ;

export function frTvaFranchise(x                                                                ) {
  const s = TVA_FRANCHISE_2026[x.activity];
  const items           = [];
  let status                                              ;
  if (x.caPrev > s.base) { status = "redevable-n"; items.push({ tone: "warn", text: `Chiffre d'affaires de l'année précédente au-dessus de ${eur(s.base)} : TVA due dès le 1er janvier de cette année.`, cite: "service-public.fr F21746" }); }
  else if (x.ca > s.majore) { status = "redevable-n"; items.push({ tone: "warn", text: `Seuil majoré de ${eur(s.majore)} dépassé cette année : TVA due immédiatement, dès l'opération qui le fait dépasser.`, cite: "service-public.fr F21746" }); }
  else if (x.ca > s.base) { status = "redevable-n1"; items.push({ tone: "info", text: `Entre ${eur(s.base)} et ${eur(s.majore)} cette année : franchise conservée cette année, TVA due à partir du 1er janvier suivant.`, cite: "service-public.fr F21746" }); }
  else { status = "franchise"; items.push({ tone: "good", text: `Sous ${eur(s.base)} : franchise en base, pas de TVA à facturer. Mention « TVA non applicable, art. 293 B du CGI » sur les factures.`, cite: "service-public.fr F21746" }); }
  items.push({ tone: "info", text: "Le projet de seuil unique de 25 000 € a été abandonné ; les seuils restent distincts pour la vente et les services.", cite: "service-public.fr F21746" });
  items.push({ tone: "info", text: "Taux de TVA : 20 % (normal), 10 %, 5,5 % et 2,1 % selon les biens et services.", cite: "service-public.fr F23567" });
  const headroom = Math.max(0, (status === "franchise" ? s.base : s.majore) - x.ca);
  return { status, base: s.base, majore: s.majore, headroom, items };
}

// ── 4. Intérêt de retard, majorations, délai de réclamation ──────────
                                                                                                                                                                        
export const MAJORATIONS                                                               = {
  retard: { rate: 0.1, cite: "CGI art. 1728 (BOI-CF-INF-10-20-10)", label: "Dépôt tardif sans mise en demeure" },
  "retard-apres-mise-en-demeure": { rate: 0.1, cite: "CGI art. 1728 (BOI-CF-INF-10-20-10)", label: "Dépôt dans les 30 jours d'une mise en demeure" },
  "defaut-apres-mise-en-demeure": { rate: 0.4, cite: "CGI art. 1728 (BOI-CF-INF-10-20-10)", label: "Pas de dépôt dans les 30 jours d'une mise en demeure" },
  "activite-occulte": { rate: 0.8, cite: "CGI art. 1728 (BOI-CF-INF-10-20-10)", label: "Activité occulte" },
  "manquement-delibere": { rate: 0.4, cite: "CGI art. 1729 (BOI-ANNX-000277)", label: "Manquement délibéré" },
  "manoeuvres-frauduleuses": { rate: 0.8, cite: "CGI art. 1729 (BOI-ANNX-000277)", label: "Manœuvres frauduleuses" },
};
export const INTERET_RETARD_MENSUEL = 0.002;

const fullMonths = (from        , to        ) => {
  if (to <= from) return 0;
  const [fy, fm, fd] = from.split("-").map(Number), [ty, tm, td] = to.split("-").map(Number);
  return Math.max(0, (ty - fy) * 12 + (tm - fm) - (td < fd ? 1 : 0));
};

export function frPenalty(x                                                                                                  ) {
  const m = MAJORATIONS[x.fault];
  const months = x.months ?? (x.due && x.paid ? fullMonths(x.due, x.paid) : 0);
  const interest = Math.round(x.tax * INTERET_RETARD_MENSUEL * months);
  const majoration = Math.round(x.tax * m.rate);
  const items           = [
    { tone: "warn", text: `${m.label} : majoration de ${Math.round(m.rate * 100)} %, soit ${eur(majoration)}.`, cite: m.cite },
    { tone: months ? "warn" : "info", text: `Intérêt de retard 0,20 % par mois${months ? ` sur ${months} mois : ${eur(interest)}` : ""}.`, cite: "CGI art. 1727 (BOFiP ACTU-2021-00178)" },
  ];
  if (x.incomeTax && (x.fault === "retard" || x.fault === "retard-apres-mise-en-demeure" || x.fault === "defaut-apres-mise-en-demeure")) items.push({ tone: "info", text: "Pour l'impôt sur le revenu, c'est l'article 1758 A du CGI qui s'applique au dépôt tardif ; ses taux ne sont pas calculés ici.", cite: "BOI-CF-INF-10-20-10" });
  return { months, interest, majoration, total: interest + majoration, items };
}

/** Réclamation : 31 décembre de la 2e année suivant la mise en recouvrement, le paiement ou l'événement (impôts directs locaux : année suivante). */
export function frClaimDeadline(x                                        ) {
  const y = x.eventYear + (x.local ? 1 : 2);
  return [{ id: "reclamation", label: x.local ? "Réclamation contre un impôt direct local (taxe foncière, CFE…)" : "Réclamation contentieuse (impôt sur le revenu, TVA, IS…)", date: `${y}-12-31`, cite: "LPF art. R*196-1 (BOI-CTX-PREA-10-30)" }, { id: "reponse", label: "L'administration répond en principe dans les 6 mois suivant la réclamation", date: "", cite: "BOI-CTX-PREA-10-10" }];
}

// ── 5. Amortissement linéaire et dégressif ───────────────────────────
export const degressiveCoef = (life        ) => (life <= 2 ? 0 : life <= 4 ? 1.25 : life <= 6 ? 1.75 : 2.25);

export function frAmortissement(x                                                                                                          ) {
  const items           = [];
  const cost = Math.max(0, x.cost);
  if (x.toolUnder500 && cost <= 500) {
    items.push({ tone: "good", text: "Petit outillage ou matériel de bureau d'une valeur unitaire HT d'au plus 500 € : déductible immédiatement en charges.", cite: "BOFiP BOI-BIC-CHG-20-30-10" });
    return { method: "charge"         , rate: 1, schedule: [{ year: Number(x.start.slice(0, 4)), amount: cost, vnc: 0 }], items };
  }
  const life = Math.max(1, Math.round(x.life));
  const y0 = Number(x.start.slice(0, 4));
  const linRate = 1 / life;
  const schedule                                                  = [];
  const coef = degressiveCoef(life);
  const method = x.method === "degressif" && coef ? "degressif" : "lineaire";
  if (x.method === "degressif" && !coef) items.push({ tone: "warn", text: "Le dégressif n'est ouvert qu'aux biens d'une durée d'au moins 3 ans : calcul en linéaire.", cite: "BOI-BIC-AMT-20-20-30" });
  let vnc = cost;
  if (method === "lineaire") {
    const yearEnd = `${y0}-12-31`;
    const firstFrac = (days(x.start, yearEnd) + 1) / (days(`${y0}-01-01`, yearEnd) + 1);
    const annual = cost * linRate;
    for (let i = 0; vnc > 0.5 && i <= life; i++) {
      const amt = Math.min(vnc, i === 0 ? annual * firstFrac : annual);
      vnc -= amt;
      schedule.push({ year: y0 + i, amount: Math.round(amt), vnc: Math.round(vnc) });
    }
    items.push({ tone: "info", text: `Linéaire ${(linRate * 100).toFixed(2).replace(".", ",")} % par an, prorata temporis au jour près à partir de la mise en service (ici en jours réels de l'année).`, cite: "BOI-BIC-AMT-20-20-30 §210" });
  } else {
    const rate = Math.round(linRate * coef * 10_000) / 10_000;
    const firstMonths = 13 - Number(x.start.slice(5, 7));
    // Le plan dégressif s'étale sur `life` exercices : la 1re annuité est au prorata des mois, puis on passe au linéaire
    // (VNC / années restantes) quand il dépasse VNC × taux ; la dernière annuité solde la VNC.
    for (let i = 0; i < life && vnc > 0.5; i++) {
      let amt = i === 0 ? cost * rate * (firstMonths / 12) : Math.max(vnc * rate, vnc / (life - i));
      if (i === life - 1) amt = vnc;
      amt = Math.min(vnc, amt);
      vnc -= amt;
      schedule.push({ year: y0 + i, amount: Math.round(amt), vnc: Math.round(vnc) });
    }
    items.push({ tone: "info", text: `Dégressif : taux linéaire × coefficient ${String(coef).replace(".", ",")} = ${(rate * 100).toFixed(2).replace(".", ",")} %, à partir du 1er jour du mois d'acquisition ; passage au linéaire quand il devient plus élevé.`, cite: "CGI art. 39 A (BOI-BIC-AMT-20-20-30)" });
  }
  items.push({ tone: "info", text: "La durée d'utilisation dépend des usages de la profession ; vérifiez-la avant de l'appliquer.", cite: "BOI-BIC-AMT-20-20-30" });
  return { method, rate: method === "degressif" ? Math.round(linRate * coef * 10_000) / 10_000 : linRate, schedule, items };
}
