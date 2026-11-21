// GENERATED from tools-oiyo src/lib/es-tax-pack-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// Guía fiscal y contable España (2026-11-21, localización por país n.º 4: España). Solo información general y estimaciones:
// no es asesoramiento personalizado ni presenta declaraciones.
// El mismo código alimenta la skill oiyo-es-tax-guide (scripts/calc.mjs) y las herramientas MCP de api.oiyo.net (*_es_*).
// Fuentes verificadas el 2026-11-21 (company-brain projects/oiyo-ecosystem/es-tax-pack-facts-2026-11-21.md):
// - AEAT Calendario del contribuyente 2026 (303/390/130/131/111/115/100/200/202), Renta 2025 (8 abril – 30 junio, domiciliación 25 junio).
// - Orden PJC/297/2026 art. 18 (tramos RETA 2026, tipo 31,50 %), LETA art. 38 ter (cuota reducida), RDL 13/2022 DT 5 (80 € 2023-2025).
// - RIRPF art. 30.2.ª (5 %, máx. 2.000 €), art. 95.1 (retención 15 % / 7 %); LIRPF art. 57 (5.550 €), art. 63.1 (escala estatal).
// - AEAT Manual Renta 2025 (escala autonómica Madrid 2025); LIVA art. 90, 91, 120, 161; LGT art. 26, 27, 46, 66, 92, 188, 191, 223, 235;
//   LJCA art. 46.1; Ley 39/2015 art. 30; LIS art. 12, 40, 102, 124.
// Sin verificar (no se calcula como dato 2026): cuota reducida 2026, 7 % de gastos de difícil justificación, interés de demora 2026,
// escala autonómica 2026, calendario 2027.

export const ES_TAX_AS_OF = "2026-11-21";
export const ES_TAX_NOTE = "Información general y estimaciones a partir de normas y páginas oficiales publicadas (BOE, AEAT, Seguridad Social). No es asesoramiento fiscal personalizado y esta herramienta no prepara ni presenta declaraciones. Para tu caso, consulta a la AEAT (91 333 5 333, cita previa) o a un profesional colegiado.";

                                            
                                                                

const iso = (d      ) => d.toISOString().slice(0, 10);
const utc = (y        , m        , d        ) => new Date(Date.UTC(y, m - 1, d));
const days = (a        , b        ) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
const eur = (n        ) => `${Math.round(n).toLocaleString("es-ES")} €`;
const pct = (r        , d = 2) => `${(r * 100).toFixed(d).replace(/\.?0+$/, "").replace(".", ",")} %`;

/** Último día inhábil → primer día hábil siguiente (Ley 39/2015 art. 30.5). Solo se conocen sábados y domingos; los festivos no. */
export function esShift(d      )       {
  let t = d;
  while (t.getUTCDay() === 0 || t.getUTCDay() === 6) t = new Date(t.getTime() + 86_400_000);
  return t;
}

// ── 1. Calendario 2026 ───────────────────────────────────────────────
                                                                                                                                                                         
                                                                                                                                    
const CAL = "AEAT Calendario del contribuyente 2026";

export function esTaxCalendar(x                 ) {
  const y = x.year;
  const ev            = [];
  const items           = [];
  const add = (id        , label        , date        , cite        , until         ) =>
    ev.push({ id, label, date, ...(until ? { until } : {}), cite, ...(x.today ? { daysLeft: days(x.today, until ?? date) } : {}) });
  const quarters                             = [["1T", "04-20", "1.er trimestre"], ["2T", "07-20", "2.º trimestre"], ["3T", "10-20", "3.er trimestre"]];
  if (y === 2026) {
    if (x.iva) { add("303-4T", "Modelo 303 IVA, 4.º trimestre 2025", "2026-01-30", CAL); add("390", "Modelo 390 resumen anual de IVA 2025", "2026-01-30", CAL); }
    if (x.pago && x.pago !== "none") add(`${x.pago}-4T`, `Modelo ${x.pago} pago fraccionado IRPF, 4.º trimestre 2025`, "2026-01-30", CAL);
    if (x.retenciones) add("111-4T", "Modelos 111 y 115 retenciones, 4.º trimestre 2025", "2026-01-20", CAL);
    for (const [q, md, name] of quarters) {
      if (x.iva) add(`303-${q}`, `Modelo 303 IVA, ${name}`, `2026-${md}`, CAL);
      if (x.pago && x.pago !== "none") add(`${x.pago}-${q}`, `Modelo ${x.pago} pago fraccionado IRPF, ${name}`, `2026-${md}`, CAL);
      if (x.retenciones) add(`111-${q}`, `Modelos 111 y 115 retenciones, ${name}`, `2026-${md}`, CAL);
    }
    if (x.renta !== false) {
      add("100", "Renta 2025 (modelo 100): presentación por internet", "2026-04-08", "AEAT Renta 2025", "2026-06-30");
      add("100-dom", "Renta 2025 a ingresar con domiciliación bancaria: último día", "2026-06-25", CAL);
    }
    if (x.sociedad) {
      add("202-1P", "Modelo 202 pago fraccionado del Impuesto sobre Sociedades, 1.er periodo", "2026-04-20", "LIS art. 40.1; " + CAL);
      add("200", "Modelo 200 Impuesto sobre Sociedades 2025 (ejercicio = año natural)", "2026-07-27", "LIS art. 124.1; " + CAL);
      add("202-2P", "Modelo 202, 2.º periodo", "2026-10-20", "LIS art. 40.1; " + CAL);
      add("202-3P", "Modelo 202, 3.er periodo (el 20 es domingo)", "2026-12-21", "LIS art. 40.1; " + CAL);
    }
    if (x.iva || (x.pago && x.pago !== "none") || x.retenciones) ev.push({ id: "q4-2026", label: "Declaraciones del 4.º trimestre de 2026: en enero de 2027 (fecha exacta en el calendario AEAT 2027, aún no comprobado)", month: "2027-01", cite: "AEAT Calendario del contribuyente 2027" });
  } else {
    items.push({ tone: "warn", text: `Solo está comprobado el calendario AEAT 2026. Para ${y} se muestran los meses; consulta las fechas exactas en el calendario del contribuyente de ese año.`, cite: "AEAT Calendario del contribuyente" });
    if (x.iva || (x.pago && x.pago !== "none") || x.retenciones) for (const m of ["01", "04", "07", "10"]) ev.push({ id: `trim-${m}`, label: "Declaraciones trimestrales (303, 130/131, 111/115) del trimestre anterior", month: `${y}-${m}`, cite: "AEAT Calendario del contribuyente" });
    if (x.renta !== false) ev.push({ id: "100", label: `Renta ${y - 1} (modelo 100): campaña de primavera`, month: `${y}-04 → ${y}-06`, cite: "AEAT Renta" });
    if (x.sociedad) {
      for (const [i, m] of [4, 10, 12].entries()) ev.push({ id: `202-${i + 1}P`, label: `Modelo 202, ${i + 1}.º periodo: primeros 20 días naturales del mes`, month: `${y}-${String(m).padStart(2, "0")}`, cite: "LIS art. 40.1" });
      ev.push({ id: "200", label: `Modelo 200 del ejercicio ${y - 1}: 25 días naturales siguientes a los 6 meses del cierre`, month: `${y}-07`, cite: "LIS art. 124.1" });
    }
  }
  ev.sort((a, b) => (a.date ?? a.month ?? "").localeCompare(b.date ?? b.month ?? ""));
  if (x.retenciones) items.push({ tone: "info", text: "Las grandes empresas presentan las retenciones cada mes (alrededor del día 20).", cite: CAL });
  items.push({ tone: "info", text: "Si el último día es inhábil, el plazo pasa al primer día hábil siguiente. Los festivos no se calculan aquí: las fechas de 2026 son las del calendario oficial.", cite: "Ley 39/2015 art. 30.5; LGT art. 7.2" });
  return { events: ev, items };
}

// ── 2. Autónomo: cuota por tramos e IRPF ─────────────────────────────
/** Orden PJC/297/2026 art. 18: [rendimiento neto mensual hasta, base mínima, base máxima]. Tabla reducida y tabla general. */
export const RETA_TRAMOS_2026                             = [
  [670, 653.59, 718.94], [900, 718.95, 900], [1_166.7, 849.67, 1_166.7],
  [1_300, 950.98, 1_300], [1_500, 960.78, 1_500], [1_700, 960.78, 1_700], [1_850, 1_143.79, 1_850], [2_030, 1_209.15, 2_030],
  [2_330, 1_274.51, 2_330], [2_760, 1_356.21, 2_760], [3_190, 1_437.91, 3_190], [3_620, 1_519.61, 3_620], [4_050, 1_601.31, 4_050],
  [6_000, 1_732.03, 5_101.2], [Infinity, 1_928.1, 5_101.2],
];
export const RETA_TIPO_2026 = 0.315;
export const ESCALA_ESTATAL                     = [[12_450, 0.095], [20_200, 0.12], [35_200, 0.15], [60_000, 0.185], [300_000, 0.225], [Infinity, 0.245]];
/** Comunidad de Madrid, escala autonómica 2025 (AEAT Manual Renta 2025). Ejemplo: cada comunidad tiene la suya. */
export const ESCALA_MADRID_2025                     = [[13_362.22, 0.085], [19_004.63, 0.107], [35_425.68, 0.128], [57_320.4, 0.174], [Infinity, 0.205]];
export const MINIMO_PERSONAL = 5_550;
export const DIFICIL_JUSTIFICACION = { rate: 0.05, max: 2_000 };

const scale = (base        , s                    ) => {
  let t = 0, lo = 0;
  for (const [hi, r] of s) { if (base <= lo) break; t += (Math.min(base, hi) - lo) * r; lo = hi; }
  return t;
};
/** Cuota íntegra estatal + autonómica (Madrid 2025) con el mínimo personal gravado a tipo cero (LIRPF art. 56, 57, 63). */
export function esIrpf(base        , minimo = MINIMO_PERSONAL) {
  const b = Math.max(0, base);
  const estatal = Math.max(0, scale(b, ESCALA_ESTATAL) - scale(Math.min(b, minimo), ESCALA_ESTATAL));
  const madrid = Math.max(0, scale(b, ESCALA_MADRID_2025) - scale(Math.min(b, minimo), ESCALA_MADRID_2025));
  return { estatal: Math.round(estatal), autonomica: Math.round(madrid), total: Math.round(estatal) + Math.round(madrid) };
}

export function esAutonomo(x                                                                                                ) {
  const items           = [];
  const i = RETA_TRAMOS_2026.findIndex(([hi], k) => (k === 2 ? x.netMonthly < hi : x.netMonthly <= hi));
  const [hi, baseMin, baseMax] = RETA_TRAMOS_2026[i];
  const tramo = { n: i + 1, tabla: i < 3 ? "reducida" : "general", hasta: Number.isFinite(hi) ? hi : null, baseMin, baseMax };
  const cuotaMin = Math.round(baseMin * RETA_TIPO_2026 * 100) / 100;
  const cuotaMax = Math.round(baseMax * RETA_TIPO_2026 * 100) / 100;
  items.push({ tone: "info", text: `Tramo ${tramo.n} (tabla ${tramo.tabla}): base de cotización entre ${baseMin.toLocaleString("es-ES")} € y ${baseMax.toLocaleString("es-ES")} € al mes. Al 31,50 % la cuota queda entre unos ${cuotaMin.toLocaleString("es-ES")} € y ${cuotaMax.toLocaleString("es-ES")} € (cálculo propio, no es una tabla oficial de cuotas).`, cite: "Orden PJC/297/2026 art. 18" });
  if (x.nuevo) items.push({ tone: "warn", text: "Alta inicial (o sin alta en el RETA en los 2 años anteriores): cuota reducida durante 12 meses, prorrogable otros 12 si el rendimiento neto es inferior al SMI anual. Fue de 80 €/mes en 2023-2025; la cuantía de 2026 la fija la Ley de Presupuestos y no la hemos comprobado.", cite: "LETA art. 38 ter; RDL 13/2022 DT 5" });
  let irpf                                                                                                                                                                                   = null;
  if (x.ingresos != null) {
    const previo = Math.max(0, x.ingresos - (x.gastos ?? 0));
    const dificil = Math.min(DIFICIL_JUSTIFICACION.max, Math.round(previo * DIFICIL_JUSTIFICACION.rate));
    const base = previo - dificil;
    const q = esIrpf(base);
    const retencion = Math.round(x.ingresos * (x.nuevo ? 0.07 : 0.15));
    const retenido = x.retenido ?? retencion;
    irpf = { rendimientoPrevio: previo, dificil, base, estatal: q.estatal, autonomica: q.autonomica, cuota: q.total, retencion, retenido, diferencia: q.total - retenido };
    items.push({ tone: "info", text: `Estimación directa simplificada: provisiones y gastos de difícil justificación del 5 % del rendimiento (máx. 2.000 €): ${eur(dificil)}. El 7 % solo consta en el BOE para 2023.`, cite: "RIRPF art. 30.2.ª; LIRPF DA 56" });
    items.push({ tone: "info", text: `Cuota íntegra aproximada ${eur(q.total)} (estatal ${eur(q.estatal)} + autonómica ${eur(q.autonomica)} con la escala de Madrid 2025 como ejemplo), con el mínimo personal de 5.550 €.`, cite: "LIRPF art. 57, 63.1; AEAT Manual Renta 2025" });
    items.push({ tone: "info", text: `Retención en facturas profesionales: ${x.nuevo ? "7 % (año de inicio y los 2 siguientes)" : "15 %"} → ${eur(retencion)}.`, cite: "RIRPF art. 95.1" });
    items.push({ tone: "info", text: "No incluye otras reducciones, deducciones, mínimos por descendientes ni los pagos fraccionados del modelo 130. Las cuotas de autónomo se restan como gasto si las incluyes en «gastos».", cite: "Alcance de esta estimación" });
  }
  return { tramo, cuotaMin, cuotaMax, irpf, items };
}

// ── 3. IVA y recargo de equivalencia ─────────────────────────────────
export const IVA_TIPOS = { 21: 0.21, 10: 0.1, 4: 0.04 }         ;
export const RECARGO_EQUIVALENCIA = { 21: 0.052, 10: 0.014, 4: 0.005, tabaco: 0.0175 }         ;
                                  

export function esIva(x                                                    ) {
  const iva = Math.round(x.base * IVA_TIPOS[x.tipo] * 100) / 100;
  const rRate = x.recargo ? RECARGO_EQUIVALENCIA[x.tipo] : 0;
  const recargo = Math.round(x.base * rRate * 100) / 100;
  const items           = [
    { tone: "info", text: `IVA al ${x.tipo} %: ${iva.toLocaleString("es-ES")} €. Tipos: 21 % general, 10 % reducido, 4 % superreducido.`, cite: "LIVA art. 90, 91" },
  ];
  if (x.recargo) items.push({ tone: "info", text: `Recargo de equivalencia ${pct(rRate)} (5,2 % / 1,4 % / 0,5 %; tabaco 1,75 %): ${recargo.toLocaleString("es-ES")} €. Lo repercute el proveedor al comerciante minorista en este régimen.`, cite: "LIVA art. 161" });
  items.push({ tone: "warn", text: "En España no existe hoy una franquicia de IVA para pequeñas empresas nacionales: el autónomo repercute IVA desde la primera factura salvo operaciones exentas. No hemos comprobado si hay un proyecto para introducirla.", cite: "LIVA art. 120 (texto consolidado BOE)" });
  return { iva, recargoRate: rRate, recargo, total: Math.round((x.base + iva + recargo) * 100) / 100, items };
}

// ── 4. Recargos, sanciones y plazos de recurso ───────────────────────
const fullMonths = (from        , to        ) => {
  if (to <= from) return 0;
  const [fy, fm, fd] = from.split("-").map(Number), [ty, tm, td] = to.split("-").map(Number);
  return Math.max(0, (ty - fy) * 12 + (tm - fm) - (td < fd ? 1 : 0));
};
const addMonths = (s        , n        ) => {
  const [y, m, d] = s.split("-").map(Number);
  const last = new Date(Date.UTC(y, m - 1 + n + 1, 0)).getUTCDate();
  return utc(y, m + n, Math.min(d, last));
};

/** Recargo por presentación fuera de plazo sin requerimiento previo (LGT art. 27). */
export function esRecargo(x                                                                                             ) {
  const months = fullMonths(x.due, x.filed);
  const items           = [];
  const late12 = months >= 12;
  const rate = late12 ? 0.15 : 0.01 + 0.01 * months;
  let recargo = x.cuota * rate;
  if (x.pagoEnPlazo) recargo *= 0.75;
  let interes                = null;
  if (late12) {
    const start = iso(addMonths(x.due, 12));
    if (x.interesAnual != null && x.interesAnual > 0) interes = Math.round(x.cuota * (x.interesAnual / 100) * Math.max(0, days(start, x.filed)) / 365);
    items.push({ tone: "warn", text: `Más de 12 meses de retraso: recargo del 15 % e intereses de demora desde ${start}.${interes == null ? " Introduce el tipo de interés de demora vigente (no hemos comprobado el de 2026; el último publicado que vimos es el 4,0625 % de 2023)." : ""}`, cite: "LGT art. 27.2, 26.6" });
  } else items.push({ tone: "warn", text: `${months} mes(es) completo(s) de retraso: recargo del 1 % más 1 % por mes completo = ${pct(rate)}, sin intereses ni sanción.`, cite: "LGT art. 27.2" });
  if (x.pagoEnPlazo) items.push({ tone: "good", text: "Pagando el recargo en el plazo del art. 62.2 se reduce un 25 %.", cite: "LGT art. 27.5" });
  items.push({ tone: "info", text: "Solo si presentas de forma voluntaria, sin requerimiento previo de la Administración. Con requerimiento se aplican sanciones (art. 191).", cite: "LGT art. 27.1" });
  return { months, rate, recargo: Math.round(recargo), interes, total: Math.round(recargo) + (interes ?? 0), items };
}

                                                      
export const SANCION_191                                                                = {
  leve: { min: 0.5, max: 0.5, label: "Leve (base ≤ 3.000 € o sin ocultación)" },
  grave: { min: 0.5, max: 1, label: "Grave (50 %–100 %)" },
  "muy-grave": { min: 1, max: 1.5, label: "Muy grave (100 %–150 %)" },
};

export function esSancion(x                                                                                                         ) {
  const s = SANCION_191[x.gravedad];
  const red1 = x.acuerdo === "acuerdo" ? 0.65 : x.acuerdo === "conformidad" ? 0.3 : 0;
  const red2 = x.pronto ? 0.4 : 0;
  const f = (r        ) => Math.round(x.base * r * (1 - red1) * (1 - red2));
  const items           = [{ tone: "warn", text: `${s.label}: sanción mínima ${eur(x.base * s.min)}${s.max > s.min ? `, máxima ${eur(x.base * s.max)}` : ""} antes de reducciones (los criterios de graduación suben el porcentaje).`, cite: "LGT art. 191" }];
  if (red1) items.push({ tone: "good", text: `Reducción del ${Math.round(red1 * 100)} % por ${x.acuerdo === "acuerdo" ? "acta con acuerdo" : "conformidad"}.`, cite: "LGT art. 188.1" });
  if (red2) items.push({ tone: "good", text: "Reducción adicional del 40 % si pagas en periodo voluntario y no recurres.", cite: "LGT art. 188.3" });
  return { min: f(s.min), max: f(s.max), items };
}

/** Plazos de recurso desde la notificación (meses de fecha a fecha, Ley 39/2015 art. 30.4) y prescripción de 4 años (LGT art. 66, 67). */
export function esPlazos(x                                                        ) {
  const out                                                              = [];
  const at = (d      ) => iso(esShift(d));
  if (x.notificacion) {
    out.push({ id: "reposicion", label: "Recurso de reposición (opcional, ante el mismo órgano): 1 mes", date: at(addMonths(x.notificacion, 1)), cite: "LGT art. 223.1" });
    out.push({ id: "tear", label: "Reclamación económico-administrativa (TEAR/TEAC): 1 mes", date: at(addMonths(x.notificacion, 1)), cite: "LGT art. 235.1" });
    out.push({ id: "contencioso", label: "Si esta notificación es la resolución que agota la vía administrativa: recurso contencioso-administrativo, 2 meses", date: at(addMonths(x.notificacion, 2)), cite: "LJCA art. 46.1" });
  }
  if (x.finPlazoVoluntario) out.push({ id: "prescripcion", label: "Prescripción (4 años): derecho a liquidar, a pedir devoluciones o a rectificar la autoliquidación", date: iso(addMonths(x.finPlazoVoluntario, 48)), cite: "LGT art. 66, 67.1" });
  return { plazos: out, note: "Fechas orientativas: meses de fecha a fecha y fin de semana movido al lunes; no incluye festivos nacionales, autonómicos ni locales." };
}

// ── 5. Amortización por tablas oficiales ─────────────────────────────
/** LIS art. 12.1.a: coeficiente lineal máximo y periodo máximo de años. */
export const TABLA_LIS = {
  "equipos-informaticos": { label: "Equipos para procesos de información", coef: 0.25, years: 8 },
  "software": { label: "Sistemas y programas informáticos", coef: 0.33, years: 6 },
  "equipos-electronicos": { label: "Equipos electrónicos", coef: 0.2, years: 10 },
  "transporte": { label: "Elementos de transporte externo", coef: 0.16, years: 14 },
  "autocamiones": { label: "Autocamiones", coef: 0.2, years: 10 },
  "mobiliario": { label: "Mobiliario", coef: 0.1, years: 20 },
  "utiles": { label: "Útiles y herramientas", coef: 0.25, years: 8 },
  "maquinaria": { label: "Maquinaria", coef: 0.12, years: 18 },
  "instalaciones": { label: "Resto de instalaciones", coef: 0.1, years: 20 },
  "edificios-industriales": { label: "Edificios industriales", coef: 0.03, years: 68 },
  "edificios-comerciales": { label: "Edificios comerciales, administrativos y viviendas", coef: 0.02, years: 100 },
}         ;
                                              

export function esAmortizacion(x                                                                                                               ) {
  const t = TABLA_LIS[x.elemento];
  const items           = [];
  const coste = Math.max(0, x.coste);
  const y0 = Number(x.inicio.slice(0, 4));
  if (x.nuevo && coste <= 300 && (x.usadoLibertad ?? 0) + coste <= 25_000) {
    items.push({ tone: "good", text: "Elemento nuevo de valor unitario ≤ 300 €: libertad de amortización (límite 25.000 € por periodo impositivo). Puedes deducirlo entero este año.", cite: "LIS art. 12.3.e" });
    return { coef: 1, minCoef: 1, maxCoef: t.coef, schedule: [{ year: y0, amount: coste, pendiente: 0 }], items };
  }
  const minCoef = Math.round((1 / t.years) * 10_000) / 10_000;
  const coef = Math.min(t.coef, Math.max(minCoef, x.coef ?? t.coef));
  if (x.coef != null && x.coef !== coef) items.push({ tone: "warn", text: `El coeficiente debe estar entre ${pct(minCoef)} (1/${t.years} años) y ${pct(t.coef)}: se usa ${pct(coef)}.`, cite: "LIS art. 12.1.a" });
  const yearEnd = `${y0}-12-31`;
  const frac = (days(x.inicio, yearEnd) + 1) / (days(`${y0}-01-01`, yearEnd) + 1);
  const annual = coste * coef;
  const schedule                                                        = [];
  let left = coste;
  for (let i = 0; left > 0.5 && i <= t.years; i++) {
    const a = Math.min(left, i === 0 ? annual * frac : annual);
    left -= a;
    schedule.push({ year: y0 + i, amount: Math.round(a), pendiente: Math.round(left) });
  }
  items.push({ tone: "info", text: `${t.label}: coeficiente lineal máximo ${pct(t.coef)}, periodo máximo ${t.years} años. Primer año en proporción a los días desde la puesta en funcionamiento.`, cite: "LIS art. 12.1.a" });
  items.push({ tone: "info", text: "Empresas de reducida dimensión: libertad de amortización de elementos nuevos si aumenta la plantilla media en 24 meses y se mantiene otros 24 (límite 120.000 € × incremento de plantilla). No se calcula aquí.", cite: "LIS art. 102.1" });
  return { coef, minCoef, maxCoef: t.coef, schedule, items };
}

// ── 6. Quién puede ayudarte y ayuda gratuita ─────────────────────────
export const ES_SCOPE = [
  { title: "Actuar con representante", body: "Puedes actuar ante la Administración tributaria por medio de un representante, que puede ser un asesor fiscal. Para recurrir, desistir o renunciar a derechos hay que acreditar la representación.", cite: "LGT art. 46" },
  { title: "Colaboración social", body: "Colegios y asociaciones profesionales, también de asesores fiscales, pueden firmar acuerdos con la AEAT para ayudar a confeccionar declaraciones y presentarlas por vía electrónica en nombre de sus clientes, con su autorización.", cite: "LGT art. 92" },
  { title: "Qué hace este sitio", body: "Explica normas publicadas, fechas y estimaciones con su fuente oficial. No representa a nadie ante la AEAT, no prepara ni presenta declaraciones o recursos, no analiza tu caso y no recomienda despachos. No usa títulos profesionales.", cite: "—" },
  { title: "Comprueba al profesional", body: "Si contratas a alguien, pide su número de colegiación o la asociación profesional a la que pertenece y compruébalo allí. Esta página no dice qué actividades están reservadas a cada profesión.", cite: "—" },
  { title: "Ayuda gratuita de la AEAT", body: "Información y cita previa: 91 333 5 333 (lunes a viernes de 9 a 19 h; en agosto hasta las 15 h). Información tributaria básica: 91 554 87 70. La atención en oficinas requiere cita previa (salvo registro), que también se pide en la app AEAT. Este servicio de asistencia no confecciona la declaración de la Renta.", cite: "AEAT GC29, Teléfonos de interés" },
  { title: "Renta WEB y Renta DIRECTA", body: "Para la Renta 2025: servicio de tramitación del borrador y la declaración, alta en Cl@ve, número de referencia y asistente virtual de Renta.", cite: "AEAT Renta" },
  { title: "Quejas y sugerencias", body: "El Consejo para la Defensa del Contribuyente recibe quejas y sugerencias mediante el formulario en línea de la AEAT. Es una vía distinta de los recursos.", cite: "AEAT Consejo para la Defensa del Contribuyente" },
];
