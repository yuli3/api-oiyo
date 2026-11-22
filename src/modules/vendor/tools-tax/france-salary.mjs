// GENERATED from tools-oiyo src/lib/france-salary.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// Salaire net en France (2026) : cotisations salariales simplifiées + impôt sur le revenu (barème LF 2026, quotient familial sans plafonnement).
// Partagé par FranceSalaryCalculator (ancien écran) et FranceSalaryScenario (mode simple/expert).
import {                                  } from "./scenario.mjs";

// PASS 2026 (arrêté du 22 décembre 2025)
export const PASS = 48_060;

/** CSG (6,8% déductible + 2,4% non déductible) + CRDS 0,5% = 9,7% */
const CSG_CRDS_RATE = 0.097;
/** Part non déductible du revenu imposable: CSG 2,4% + CRDS 0,5% */
const CSG_CRDS_NON_DEDUCTIBLE_RATE = 0.029;

/** Assiette CSG/CRDS: 98,25% du brut jusqu'à 4×PASS, 100% au-delà */
export function csgBase(annualGross        )         {
    const abattu = Math.min(annualGross, PASS * 4);
    return abattu * 0.9825 + Math.max(0, annualGross - PASS * 4);
}

/** Calcul cotisations salariales annuelles */
export function calcCotisations(annualGross        )   
                    
                                 
                         
                           
                           
                  
  {
    const assietteCsg = csgBase(annualGross);
    const csgCrds = Math.round(assietteCsg * CSG_CRDS_RATE);
    const csgCrdsNonDeductible = Math.round(assietteCsg * CSG_CRDS_NON_DEDUCTIBLE_RATE);

    // Retraite base CNAV: 6,9% plafonné au PASS + 0,4% déplafonné
    const retraiteBase = Math.round(Math.min(annualGross, PASS) * 0.069 + annualGross * 0.004);

    // AGIRC-ARRCO Tranche 1: 3,15% + CEG 0,86% jusqu'à 1×PASS
    const t1Base = Math.min(annualGross, PASS);
    const retraiteCompl1 = Math.round(t1Base * (0.0315 + 0.0086));

    // AGIRC-ARRCO Tranche 2: 8,64% + CEG 1,08% entre 1× et 8×PASS
    // CET 0,14% sur T1+T2 lorsque la rémunération dépasse 1×PASS
    const t2Base = Math.max(0, Math.min(annualGross, PASS * 8) - PASS);
    const cet = annualGross > PASS ? (t1Base + t2Base) * 0.0014 : 0;
    const retraiteCompl2 = Math.round(t2Base * (0.0864 + 0.0108) + cet);

    const total = csgCrds + retraiteBase + retraiteCompl1 + retraiteCompl2;
    return { csgCrds, csgCrdsNonDeductible, retraiteBase, retraiteCompl1, retraiteCompl2, total };
}

/** Calcul IR (barème LF 2026) avec quotient familial */
export function calcIR(annualGross        , cotisationsTotal        , csgCrdsNonDeductible        , parts        )         {
    // Salaire net imposable = brut - cotisations + CSG/CRDS non déductibles
    const netImposable = annualGross - cotisationsTotal + csgCrdsNonDeductible;

    // Déduction forfaitaire 10% (min 509, max 14 556)
    const abattement = Math.min(netImposable, Math.max(509, Math.min(14_556, Math.round(netImposable * 0.1))));
    const revenuImposable = Math.max(0, netImposable - abattement);

    // Quotient familial: revenu par part
    const revenuParPart = revenuImposable / parts;

    // Barème progressif LF 2026 (revenus 2025, par part)
    let irParPart = 0;
    if (revenuParPart <= 11_600) {
        irParPart = 0;
    } else if (revenuParPart <= 29_579) {
        irParPart = (revenuParPart - 11_600) * 0.11;
    } else if (revenuParPart <= 84_577) {
        irParPart = (29_579 - 11_600) * 0.11 + (revenuParPart - 29_579) * 0.30;
    } else if (revenuParPart <= 181_917) {
        irParPart =
            (29_579 - 11_600) * 0.11 +
            (84_577 - 29_579) * 0.30 +
            (revenuParPart - 84_577) * 0.41;
    } else {
        irParPart =
            (29_579 - 11_600) * 0.11 +
            (84_577 - 29_579) * 0.30 +
            (181_917 - 84_577) * 0.41 +
            (revenuParPart - 181_917) * 0.45;
    }

    return Math.max(0, Math.round(irParPart * parts));
}


                               
                
                
 

export function frSalary(i              ) {
  const c = calcCotisations(i.gross);
  const netBeforeIR = Math.max(0, i.gross - c.total);
  const ir = calcIR(i.gross, c.total, c.csgCrdsNonDeductible, i.parts);
  const annualNet = Math.max(0, netBeforeIR - ir);
  return { ...c, netBeforeIR, ir, annualNet, monthlyNet: Math.round(annualNet / 12), monthlyGross: Math.round(i.gross / 12), rate: i.gross > 0 ? annualNet / i.gross : 0 };
}
export const frAnnualNet = (i              ) => frSalary(i).annualNet;

const eur = (n        ) => `${Math.round(n).toLocaleString("fr-FR")} €`;

export const FR_SALARY_ASSUMPTIONS                             = [
  { key: "gross", label: "Salaire brut annuel", plain: "Salaire brut", unit: "won", kind: "assumption", get: (i) => i.gross, set: (i, v) => ({ ...i, gross: Math.max(0, Math.round(v / 100) * 100) }), range: (a) => [Math.max(15_000, a * 0.5), Math.max(a * 2, 40_000)], marks: [{ at: PASS, label: "1 PASS" }] },
  { key: "parts", label: "Parts fiscales", plain: "Parts fiscales", unit: "count", kind: "fact", get: (i) => i.parts, set: (i, v) => ({ ...i, parts: Math.max(1, Math.round(v * 2) / 2) }), range: () => [1, 5] },
];

export function frSalaryPlain(i              , top             ) {
  const r = frSalary(i);
  return {
    headline: `Pour ${eur(i.gross)} brut par an, il vous reste environ ${eur(r.monthlyNet)} net par mois après impôt, soit ${eur(r.annualNet)} par an (${Math.round(r.rate * 100)} % du brut).`,
    driver: top && top.span > 0 ? `Ce qui pèse le plus : ${top.plain.toLowerCase()}. S'il varie de 20 %, le net annuel va de ${eur(Math.min(top.low, top.high))} à ${eur(Math.max(top.low, top.high))}.` : null,
    reasons: [
      `Cotisations salariales : ${eur(r.total)} par an (CSG/CRDS ${eur(r.csgCrds)}, retraite de base ${eur(r.retraiteBase)}, complémentaire ${eur(r.retraiteCompl1 + r.retraiteCompl2)}). Impôt sur le revenu : ${eur(r.ir)}.`,
      i.parts > 1 ? `Avec ${i.parts.toLocaleString("fr-FR")} parts, le revenu est divisé avant d'appliquer le barème, ce qui baisse l'impôt (le plafonnement du quotient familial n'est pas appliqué ici).` : "Avec une seule part, tout le revenu passe dans le barème. Un mariage, un PACS ou des enfants ajoutent des parts.",
      "Le prélèvement à la source lisse l'impôt chaque mois ; la régularisation se fait l'année suivante. Mutuelle et prévoyance d'entreprise ne sont pas incluses.",
    ],
  };
}
