// GENERATED from tools-oiyo src/lib/plan-gap-4-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// Financial planning room gaps (2026-11-23, CHOSEUN approved "4종 모두 만들기").
// Facts: /mnt/project-files/notes/plan-gap-4-facts-2026-11-23.md. Values not confirmed in official text are not computed.

// ── Korea: 국민연금 조기·연기 수령 (국민연금공단 노령연금 안내, 국민연금법 제61·62조) ──
export const KR_NPS = {
  asOf: "2026-11-23",
  earlyCutPerYear: 0.06, // 1년 94% … 5년 70%
  deferAddPerMonth: 0.006, // 월 0.6%, 연 7.2% (단리)
  maxYears: 5,
  aValue2026: 3_193_511, // 2025.12~2026.11 지급사유 발생분 A값
  partialShares: [50, 60, 70, 80, 90, 100],
}         ;

export function krNpsStartAge(birthYear        )                                    {
  if (!Number.isInteger(birthYear) || birthYear < 1953 || birthYear > 2010) throw new Error("birthYear 1953-2010");
  if (birthYear <= 1956) return { normal: 61, early: 56 };
  if (birthYear <= 1960) return { normal: 62, early: 57 };
  if (birthYear <= 1964) return { normal: 63, early: 58 };
  if (birthYear <= 1968) return { normal: 64, early: 59 };
  return { normal: 65, early: 60 };
}

                             
                    
                                                       
                          
                                   
                               
                                               
                                        
 

export function krNpsEarlyDefer(x            ) {
  const ages = krNpsStartAge(x.birthYear);
  if (!(x.monthly > 0) || x.monthly > 10_000_000) throw new Error("monthly");
  const until = x.untilAge ?? 85;
  if (!Number.isInteger(until) || until < ages.normal || until > 110) throw new Error("untilAge");
  let monthly        ;
  let startMonths        ; // start age in months
  let rate        ;
  if (x.mode === "early") {
    const n = x.earlyYears ?? 0;
    if (!Number.isInteger(n) || n < 1 || n > KR_NPS.maxYears) throw new Error("earlyYears 1-5");
    rate = 1 - KR_NPS.earlyCutPerYear * n;
    monthly = Math.floor(x.monthly * rate + 1e-6);
    startMonths = (ages.normal - n) * 12;
  } else {
    const m = x.deferMonths ?? 0;
    const share = x.deferSharePct ?? 100;
    if (!Number.isInteger(m) || m < 1 || m > KR_NPS.maxYears * 12) throw new Error("deferMonths 1-60");
    if (!(KR_NPS.partialShares                     ).includes(share)) throw new Error("deferSharePct");
    const p = share / 100;
    rate = 1 - p + p * (1 + KR_NPS.deferAddPerMonth * m);
    monthly = Math.floor(x.monthly * rate + 1e-6);
    startMonths = ages.normal * 12 + m;
  }
  const normalMonths = ages.normal * 12;
  const endMonths = (until + 1) * 12; // through the end of age `until`
  // Partial deferral: the non-deferred share is paid from the normal age.
  const share = x.mode === "defer" ? (x.deferSharePct ?? 100) : 100;
  const partialKeep = share < 100 ? Math.floor(x.monthly * (1 - share / 100)) : 0;
  const chosenAt = (t        ) => (t >= startMonths ? monthly : partialKeep && t >= normalMonths ? partialKeep : 0);
  const normalAt = (t        ) => (t >= normalMonths ? x.monthly : 0);
  const from = Math.min(startMonths, normalMonths);
  let chosenTotal = 0;
  let normalTotal = 0;
  let breakEvenAge                = null;
  let ca = 0;
  let na = 0;
  for (let t = from; t < 110 * 12; t++) {
    ca += chosenAt(t);
    na += normalAt(t);
    if (t < endMonths) {
      chosenTotal = ca;
      normalTotal = na;
    }
    if (breakEvenAge === null && t >= Math.max(startMonths, normalMonths) && (x.mode === "early" ? na >= ca : ca >= na)) breakEvenAge = Math.floor(((t + 1) / 12) * 10) / 10;
  }
  return {
    normalAge: ages.normal,
    earlyAge: ages.early,
    startAge: Math.round((startMonths / 12) * 100) / 100,
    ratePct: Math.round(rate * 1000) / 10,
    monthly,
    partialKeep,
    chosenTotal,
    normalTotal,
    difference: chosenTotal - normalTotal,
    breakEvenAge,
    untilAge: until,
    notes: [
      "부양가족연금은 감액·가산 대상이 아니라 입력에서 빼요.",
      "조기 감액은 공단 안내 표(1년 94%~5년 70%) 기준 연 단위만 계산해요. 월 단위 감액률은 원문에서 확인하지 못했어요.",
      "연기 기간은 공단 안내(지급개시연령부터 최대 5년)를 따랐어요. 법 제62조 원문 표기(65세)와 부칙 적용은 확인 중이에요.",
      "물가 연동(매년 인상)은 빼고 명목 금액으로 비교해요.",
    ],
  };
}

// ── Taiwan: 勞工退休金 個人自願提繳 (勞工退休金條例第14條) ──
export const TW_LP = { asOf: "2026-11-23", maxVoluntaryPct: 6, employerMinPct: 6, rates: [5, 12, 20, 30, 40] }         ;

export function twLaborPensionVoluntary(x                                                                        ) {
  if (!(x.monthlyWage > 0) || x.monthlyWage > 1_000_000) throw new Error("monthlyWage");
  if (!(x.voluntaryPct >= 0 && x.voluntaryPct <= TW_LP.maxVoluntaryPct)) throw new Error("voluntaryPct 0-6");
  if (!(TW_LP.rates                     ).includes(x.marginalRatePct)) throw new Error("marginalRatePct");
  const monthlyVoluntary = Math.round((x.monthlyWage * x.voluntaryPct) / 100);
  const annualVoluntary = monthlyVoluntary * 12;
  const employerAnnual = Math.round((x.monthlyWage * TW_LP.employerMinPct) / 100) * 12;
  const taxSaving = Math.round((annualVoluntary * x.marginalRatePct) / 100);
  return {
    monthlyVoluntary,
    annualVoluntary,
    employerAnnualMin: employerAnnual,
    totalAnnual: annualVoluntary + employerAnnual,
    taxSaving,
    netCost: annualVoluntary - taxSaving,
    notes: [
      "自願提繳不計入提繳年度薪資所得課稅；節稅以邊際稅率粗估，跨級距時實際較少。",
      "月提繳工資依勞動部月提繳分級表；本頁未核對115年分級表上下限，請輸入勞保局通知的月提繳工資。",
      "60歲起請領；年資滿15年可選月退休金或一次退休金。收益保證不低於二年定期存款利率。",
    ],
  };
}

// ── Germany: Riester-Zulage und Sonderausgabenabzug (§§ 10a, 84-86 EStG); Basisrente (§ 10 Abs. 3 EStG) ──
export const DE_RIESTER = { grund: 175, kindVor2008: 185, kindAb2008: 300, berufseinsteiger: 200, mindestPct: 4, sockel: 60, hoechst: 2100 }         ;
// Basisrente Höchstbetrag: 2025 confirmed (29.343 € / 58.686 €). 2026 not confirmed in official text → not computed.
export const DE_BASIS = { 2025: { single: 29_343, joint: 58_686 } }         ;

export function deRiester(x                                                                                                                                                          ) {
  for (const k of ["vorjahresEinnahmen", "eigenbeitrag", "kinderVor2008", "kinderAb2008", "grenzsteuersatzPct"]         ) if (!(x[k] >= 0)) throw new Error(k);
  if (x.grenzsteuersatzPct > 45 || x.kinderVor2008 > 10 || x.kinderAb2008 > 10) throw new Error("range");
  const zulageVoll = DE_RIESTER.grund + DE_RIESTER.kindVor2008 * Math.floor(x.kinderVor2008) + DE_RIESTER.kindAb2008 * Math.floor(x.kinderAb2008) + (x.berufseinsteiger ? DE_RIESTER.berufseinsteiger : 0);
  const mindest = Math.max(DE_RIESTER.sockel, Math.min((x.vorjahresEinnahmen * DE_RIESTER.mindestPct) / 100, DE_RIESTER.hoechst) - zulageVoll);
  const mindestR = Math.round(mindest * 100) / 100;
  const zulage = x.eigenbeitrag >= mindestR ? zulageVoll : Math.round(((zulageVoll * x.eigenbeitrag) / mindestR) * 100) / 100;
  const sonderausgaben = Math.min(x.eigenbeitrag + zulage, DE_RIESTER.hoechst);
  const steuerwirkung = Math.round(sonderausgaben * x.grenzsteuersatzPct) / 100;
  const zusaetzlich = Math.max(0, Math.round((steuerwirkung - zulage) * 100) / 100);
  return {
    zulageVoll,
    mindesteigenbeitrag: mindestR,
    zulage,
    gekuerzt: zulage < zulageVoll,
    sonderausgaben,
    steuerwirkung,
    zusaetzlicheErstattung: zusaetzlich,
    foerderungGesamt: Math.round((zulage + zusaetzlich) * 100) / 100,
    nettoAufwand: Math.round((x.eigenbeitrag - zusaetzlich) * 100) / 100,
    notes: [
      "Steuerwirkung grob mit dem Grenzsteuersatz geschätzt; das Finanzamt prüft die Günstigerprüfung von Amts wegen.",
      "Kinderzulage nur für Kinder mit Kindergeld; der Berufseinsteiger-Bonus gilt einmalig unter 25 Jahren.",
    ],
  };
}

export function deBasisrente(x                                                                                                                   ) {
  if (!(x.beitrag >= 0) || !(x.grvBeitraegeGesamt >= 0) || !(x.grenzsteuersatzPct >= 0 && x.grenzsteuersatzPct <= 45)) throw new Error("input");
  if (x.jahr !== 2025) return { verified: false         , note: "Höchstbetrag 2026 in amtlichen Quellen noch nicht bestätigt; nicht berechnet." };
  const cap = x.zusammen ? DE_BASIS[2025].joint : DE_BASIS[2025].single;
  const room = Math.max(0, cap - x.grvBeitraegeGesamt);
  const abziehbar = Math.min(x.beitrag, room);
  return { verified: true         , hoechstbetrag: cap, spielraum: room, abziehbar, steuerwirkung: Math.round(abziehbar * x.grenzsteuersatzPct) / 100, ueberHoechstbetrag: Math.max(0, x.beitrag - room) };
}

// ── Australia: super contribution caps, 15% contributions tax, Division 293 (ato.gov.au) ──
export const AU_SUPER = {
  "2025-26": { concessional: 30_000, nonConcessional: 120_000, mcbAnnual: 250_000 },
  "2026-27": { concessional: 32_500, nonConcessional: 130_000, mcbAnnual: 270_830 },
  sgPct: 12,
  contribTaxPct: 15,
  div293Threshold: 250_000,
  div293Pct: 15,
  carryForwardTsb: 500_000,
}         ;
                                           

export function auSuper(x                                                                                                                                                                                                                  ) {
  const y = AU_SUPER[x.year];
  if (!y) throw new Error("year");
  for (const k of ["salary", "salarySacrifice", "personalDeductible", "unusedCarryForward", "div293Income", "nonConcessional", "marginalRatePct"]         ) if (!(x[k] >= 0)) throw new Error(k);
  if (x.marginalRatePct > 60) throw new Error("marginalRatePct");
  const sg = Math.round((Math.min(x.salary, y.mcbAnnual) * AU_SUPER.sgPct) / 100);
  const concessional = sg + x.salarySacrifice + x.personalDeductible;
  const cap = y.concessional + (x.tsbUnder500k ? x.unusedCarryForward : 0);
  const excess = Math.max(0, concessional - cap);
  const taxable = concessional - excess;
  const contributionsTax = Math.round((taxable * AU_SUPER.contribTaxPct) / 100);
  const over293 = Math.max(0, x.div293Income + taxable - AU_SUPER.div293Threshold);
  const div293 = Math.round((Math.min(over293, taxable) * AU_SUPER.div293Pct) / 100);
  const voluntary = x.salarySacrifice + x.personalDeductible;
  const voluntaryTaxable = Math.max(0, voluntary - excess);
  const incomeTaxSaved = Math.round((voluntaryTaxable * x.marginalRatePct) / 100);
  const superTaxOnVoluntary = Math.round((voluntaryTaxable * AU_SUPER.contribTaxPct) / 100);
  return {
    sg,
    concessional,
    cap,
    roomLeft: Math.max(0, cap - concessional),
    excess,
    contributionsTax,
    div293,
    voluntary,
    incomeTaxSaved,
    superTaxOnVoluntary,
    netSaving: incomeTaxSaved - superTaxOnVoluntary - div293,
    nonConcessionalCap: y.nonConcessional,
    nonConcessionalOver: x.nonConcessional > y.nonConcessional,
    notes: [
      "Excess concessional contributions are added to your assessable income; that tax is not estimated here.",
      "Bring-forward of up to 3 years of non-concessional caps depends on your total super balance; those thresholds are not checked here.",
      "Saving uses your marginal rate as entered and is a rough estimate.",
    ],
  };
}
