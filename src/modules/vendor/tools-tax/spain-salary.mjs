// GENERATED from tools-oiyo src/lib/spain-salary.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// Salario neto en España (2026): cotizaciones del trabajador + IRPF (escala estatal + autonómica supletoria).
// Compartido por SpainSalaryCalculator (pantalla anterior) y SpainSalaryScenario (modo sencillo/experto).
import {                                  } from "./scenario.mjs";

// SS 2026 (Orden PJC/297/2026): base máxima 5.101,20 €/mes × 12
export const SS_BASE_CAP_ANNUAL = 61_214.4;

// Cotización de solidaridad 2026 (parte trabajador) sobre la retribución que excede la base máxima
const SOLIDARIDAD_TRAMOS                     = [
    [SS_BASE_CAP_ANNUAL * 0.1, 0.0019], // hasta +10% de la base máxima
    [SS_BASE_CAP_ANNUAL * 0.4, 0.0021], // entre +10% y +50%
    [Infinity, 0.0024],                 // más del +50%
];

                           
               
                      
               
                
                        
                  
 

export function calcSS(annualGross        )           {
    const base = Math.min(annualGross, SS_BASE_CAP_ANNUAL);
    const cc       = Math.round(base * 0.047);
    const desempleo = Math.round(base * 0.0155);
    const fp       = Math.round(base * 0.001);
    const mei      = Math.round(base * 0.0015);

    let exceso = Math.max(0, annualGross - SS_BASE_CAP_ANNUAL);
    let solidaridadRaw = 0;
    for (const [width, rate] of SOLIDARIDAD_TRAMOS) {
        if (exceso <= 0) break;
        const tramo = Math.min(exceso, width);
        solidaridadRaw += tramo * rate;
        exceso -= tramo;
    }
    const solidaridad = Math.round(solidaridadRaw);

    const total    = cc + desempleo + fp + mei + solidaridad;
    return { cc, desempleo, fp, mei, solidaridad, total };
}

// Mínimo personal (5.550 €, sin cambios en 2026)
const MINIMO_PERSONAL_BASE = 5_550;
// Additional mínimo by family situation
const MINIMO_FAMILIAR                         = {
    0: 0,       // sin hijos
    1: 2_400,   // 1 hijo
    2: 2_400 + 2_700, // 2 hijos (2400+2700)
    3: 2_400 + 2_700 + 4_000, // 3+ hijos (add 4000 for 3rd)
};

export function calcIRPF(annualGross        , ssTotal        , children        )         {
    const minimoTotal = MINIMO_PERSONAL_BASE + (MINIMO_FAMILIAR[Math.min(children, 3)] ?? 0);
    // Rendimiento neto del trabajo after SS (art. 19.2 a-e LIRPF)
    const rendimiento = Math.max(0, annualGross - ssTotal);

    // Reducción por obtención de rendimientos del trabajo (art. 20 LIRPF, vigente 2026)
    let reduccionTrabajo = 0;
    if (rendimiento <= 14_852) {
        reduccionTrabajo = 7_302;
    } else if (rendimiento <= 17_673.52) {
        reduccionTrabajo = 7_302 - 1.75 * (rendimiento - 14_852);
    } else if (rendimiento <= 19_747.5) {
        reduccionTrabajo = 2_364.34 - 1.14 * (rendimiento - 17_673.52);
    }

    // Otros gastos deducibles: 2.000 € (art. 19.2.f LIRPF)
    const baseLiquidable = Math.max(0, rendimiento - 2_000 - Math.max(0, reduccionTrabajo));

    // Escala estatal + autonómica supletoria (idéntica) combinada, 2026
    const brackets                     = [
        [12_450, 0.19],
        [20_200 - 12_450, 0.24],
        [35_200 - 20_200, 0.30],
        [60_000 - 35_200, 0.37],
        [300_000 - 60_000, 0.45],
    ];

    const applyScale = (amount        )         => {
        let tax = 0;
        let remaining = amount;
        for (const [limit, rate] of brackets) {
            if (remaining <= 0) break;
            const taxable = Math.min(remaining, limit);
            tax += taxable * rate;
            remaining -= taxable;
        }
        if (remaining > 0) tax += remaining * 0.47;
        return tax;
    };

    // El mínimo personal y familiar tributa al tipo 0: se resta la cuota de la escala aplicada al mínimo
    const tax = applyScale(baseLiquidable) - applyScale(Math.min(minimoTotal, baseLiquidable));

    return Math.round(Math.max(0, tax));
}


                               
                
                   
                                  
                
 

export function esSalary(i              ) {
  const ss = calcSS(i.gross);
  const netBeforeIR = Math.max(0, i.gross - ss.total);
  const irpf = calcIRPF(i.gross, ss.total, i.children);
  const annualNet = Math.max(0, netBeforeIR - irpf);
  const pagas = i.pagas === 14 ? 14 : 12;
  return { ...ss, netBeforeIR, irpf, annualNet, perPaga: Math.round(annualNet / pagas), pagas, rate: i.gross > 0 ? annualNet / i.gross : 0, effective: i.gross > 0 ? irpf / i.gross : 0 };
}
export const esAnnualNet = (i              ) => esSalary(i).annualNet;

const eur = (n        ) => `${Math.round(n).toLocaleString("es-ES")} €`;

export const ES_SALARY_ASSUMPTIONS                             = [
  { key: "gross", label: "Salario bruto anual", plain: "Salario bruto", unit: "won", kind: "assumption", get: (i) => i.gross, set: (i, v) => ({ ...i, gross: Math.max(0, Math.round(v / 100) * 100) }), range: (a) => [Math.max(15_000, a * 0.5), Math.max(a * 2, 40_000)] },
  { key: "children", label: "Hijos", plain: "Hijos", unit: "people", kind: "fact", get: (i) => i.children, set: (i, v) => ({ ...i, children: Math.max(0, Math.min(3, Math.round(v))) }), range: () => [0, 3] },
];

export function esSalaryPlain(i              , top             ) {
  const r = esSalary(i);
  return {
    headline: `Con ${eur(i.gross)} brutos al año te quedan unos ${eur(r.annualNet)} netos: ${eur(r.perPaga)} en cada una de tus ${r.pagas} pagas (${Math.round(r.rate * 100)} % del bruto).`,
    driver: top && top.span > 0 ? `Lo que más mueve el resultado es el ${top.plain.toLowerCase()}. Si varía un 20 %, el neto anual va de ${eur(Math.min(top.low, top.high))} a ${eur(Math.max(top.low, top.high))}.` : null,
    reasons: [
      `Seguridad Social: ${eur(r.total)} al año. IRPF: ${eur(r.irpf)} (tipo efectivo ${(Math.round(r.effective * 1000) / 10).toLocaleString("es-ES")} %).`,
      i.children > 0 ? `Los ${i.children} hijos suben el mínimo personal y familiar, que tributa al 0 %, y bajan el IRPF.` : "Sin hijos, solo cuenta el mínimo personal de 5.550 €. Cada hijo lo aumenta y baja el IRPF.",
      "Se usa la escala autonómica supletoria; cada comunidad tiene la suya, así que el IRPF real puede variar unos cientos de euros. La retención mensual se regulariza en la declaración de la renta.",
    ],
  };
}
