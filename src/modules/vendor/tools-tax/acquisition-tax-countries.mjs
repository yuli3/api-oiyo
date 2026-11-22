// GENERATED from tools-oiyo src/lib/acquisition-tax-countries.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// Taxes on buying a home, for the non-Korean pages of the acquisition tax calculator. Each locale
// page uses its own country's law (세운 2026-10-19). Checked 2026-10-19:
// - Japan 不動産取得税 (地方税法 第73条の15, 附則第11条の2・第11条の5): 本則 4%; 土地・住宅は令和9年3月31日
//   までの取得で 3%. 宅地評価土地は同日まで課税標準を 1/2. 新築住宅は 1戸 1,200万円控除 (認定長期優良住宅
//   1,300万円); 中古住宅は新築時期に応じた控除 (1997年4月以降の新築なら 1,200万円). 住宅用土地の減額 =
//   max(45,000円, 1㎡当たり価格(1/2後) × 床面積の2倍(200㎡限度) × 3%). 課税標準は千円未満、税額は百円未満
//   切捨て. Sources: pref.tottori.lg.jp/257746.htm, pref.shiga.lg.jp/ippan/kurashi/zeikin/11241.html.
//   登録免許税 (租税特別措置法 第72条・第72条の2・第73条): 土地の売買 2% → 1.5% (令和11年3月31日まで);
//   住宅用家屋の所有権移転 2% → 0.3%, 新築の所有権保存 0.4% → 0.15% (令和9年3月31日まで、自己居住・
//   床面積50㎡以上・1982年以降の新耐震などの要件). Source: nomu.com/tax/buy/menkyo.html (2026-04-01時点),
//   pref.saitama.lg.jp r8_myhome_to_zeikin_mihiraki.pdf.
// - China 契税法 第3条: 3%–5%, set by each province. 财政部 税务总局 住房城乡建设部公告2024年第16号
//   (from 2024-12-01, no end date): individual buying the family's only home 1% (≤140㎡) / 1.5% (>140㎡);
//   second home 1% (≤140㎡) / 2% (>140㎡). Third home and beyond: the local statutory rate.
//   Source: fgk.chinatax.gov.cn/zcfgk/c102416/c5235817/content.html.
// - France droits de mutation à titre onéreux (CGI art. 1594 D, 1584, 1595, 1647 V): taxe départementale
//   4.5% (3.8% in Indre and Mayotte), raisable to 5% from 2025-04-01 to 2028 (loi de finances 2025);
//   84 of 101 départements raised it. Primo-accédants buying their résidence principale are exempt from the
//   0.5-point rise. Plus taxe communale 1.2% and frais d'assiette 2.37% of the departmental tax.
//   Neuf (VEFA, TVA paid): taxe de publicité foncière 0.715%. Notary's own émoluments are not included.
//   Sources: service-public.gouv.fr/particuliers/actualites/A18183, lcl.fr (frais de notaire 84 départements).
// - Spain ITP (RDLeg 1/1993) for vivienda usada, rate set by each comunidad: Madrid 6%; Andalucía 7%;
//   Cataluña 10% to 600,000 €, 11% to 900,000, 12% to 1,500,000, 13% above (from 2025-06-27);
//   Comunitat Valenciana 9% to 1,000,000 € and 11% above (Ley 5/2025, from 2026-06-01).
//   Obra nueva: IVA 10% + AJD at the community's general rate (Madrid 0.75%, Cataluña 1.5%,
//   Andalucía 1.2%, Valenciana 1.4% from 2026-06-01). Sources: guiafiscal.es/calculadoras/itp/,
//   guiafiscal.es/patrimonio/ajd-por-ccaa-2026/, guiafiscal.es/patrimonio/itp/valencia/, ATC Catalunya guide.
//   Reduced rates (jóvenes, familia numerosa, VPO) are not modelled.

                                                           

export const ACQUISITION_TAX_AS_OF = "2026-10-19";

const floorTo = (n        , unit        ) => Math.floor(n / unit) * unit;

// ── Japan ────────────────────────────────────────────────────────────────

                                            

                                        
                    
                    
                   
                         
                   
                                      
                        
                    
                       
                                                  
                         
                                       
                     
 

export function japanAcquisitionTax(i                       ) {
  const landHalf = i.takuchi ? i.landValue / 2 : i.landValue;
  const landBase = floorTo(landHalf, 1000);
  const landGross = landBase * 0.03;
  const perSqm = i.landArea > 0 ? landHalf / i.landArea : 0;
  const reliefArea = Math.min(i.landArea, i.floorArea * 2, 200);
  const landRelief = i.qualifies && i.landValue > 0 ? Math.max(45_000, perSqm * reliefArea * 0.03) : 0;
  const landTax = floorTo(Math.max(0, landGross - landRelief), 100);

  const buildingBase = floorTo(Math.max(0, i.buildingValue - (i.qualifies ? i.houseDeduction : 0)), 1000);
  const buildingTax = floorTo(buildingBase * 0.03, 100);

  const regLandRate = 0.015;
  const regBuildingRate = i.kind === "new" ? (i.qualifies ? 0.0015 : 0.004) : i.qualifies ? 0.003 : 0.02;
  const reg = (value        , rate        ) => (value > 0 ? Math.max(1000, floorTo(floorTo(value, 1000) * rate, 100)) : 0);
  const registrationLand = reg(i.landValue, regLandRate);
  const registrationBuilding = reg(i.buildingValue, regBuildingRate);

  const acquisitionTax = landTax + buildingTax;
  const registrationTax = registrationLand + registrationBuilding;
  return {
    landBase,
    landRelief: Math.round(landRelief),
    landTax,
    buildingBase,
    buildingTax,
    acquisitionTax,
    regBuildingRate,
    registrationLand,
    registrationBuilding,
    registrationTax,
    total: acquisitionTax + registrationTax,
  };
}

// ── China ────────────────────────────────────────────────────────────────

                                                          

export function chinaDeedTaxRate(order                , area        , localRate        )         {
  if (order === "first") return area <= 140 ? 0.01 : 0.015;
  if (order === "second") return area <= 140 ? 0.01 : 0.02;
  return localRate;
}

/** price: 成交价 (不含增值税). localRate: 省级契税税率 3%–5% as a fraction. */
export function chinaDeedTax(price        , area        , order                , localRate        ) {
  const rate = chinaDeedTaxRate(order, area, localRate);
  return { rate, tax: Math.round(price * rate * 100) / 100 };
}

// ── France ───────────────────────────────────────────────────────────────

                                               

export const FR_COMMUNAL_RATE = 0.012;
export const FR_ASSIETTE_RATE = 0.0237;
export const FR_NEUF_RATE = 0.00715;

export function franceTransferDuties(price        , kind                , departmentRate        , primoAccedant         ) {
  if (kind === "neuf") {
    const total = price * FR_NEUF_RATE;
    return { departmentRate: 0, departmental: 0, communal: 0, assiette: 0, total: Math.round(total * 100) / 100 };
  }
  const rate = primoAccedant && departmentRate > 0.045 ? 0.045 : departmentRate;
  const departmental = price * rate;
  const communal = price * FR_COMMUNAL_RATE;
  const assiette = departmental * FR_ASSIETTE_RATE;
  const r2 = (n        ) => Math.round(n * 100) / 100;
  return { departmentRate: rate, departmental: r2(departmental), communal: r2(communal), assiette: r2(assiette), total: r2(departmental + communal + assiette) };
}

// ── Spain ────────────────────────────────────────────────────────────────

                                                                                      
                                              

/** [upper bound of the band, marginal rate]. */
export const ES_REGIONS                                                                                               = {
  madrid: { name: "Madrid", itp: [[Infinity, 0.06]], ajd: 0.0075 },
  cataluna: { name: "Cataluña", itp: [[600_000, 0.1], [900_000, 0.11], [1_500_000, 0.12], [Infinity, 0.13]], ajd: 0.015 },
  andalucia: { name: "Andalucía", itp: [[Infinity, 0.07]], ajd: 0.012 },
  valenciana: { name: "Comunitat Valenciana", itp: [[1_000_000, 0.09], [Infinity, 0.11]], ajd: 0.014 },
};

export function bandTax(base        , bands                    )         {
  let tax = 0;
  let lower = 0;
  for (const [upper, rate] of bands) {
    if (base <= lower) break;
    tax += (Math.min(base, upper) - lower) * rate;
    lower = upper;
  }
  return tax;
}

/** customItp / customAjd (fractions) are used only for "otra". */
export function spainPurchaseTax(price        , region             , kind               , customItp = 0.08, customAjd = 0.015) {
  const r2 = (n        ) => Math.round(n * 100) / 100;
  const bands                     = region === "otra" ? [[Infinity, customItp]] : ES_REGIONS[region].itp;
  const ajdRate = region === "otra" ? customAjd : ES_REGIONS[region].ajd;
  if (kind === "usada") {
    const itp = r2(bandTax(price, bands));
    return { itp, iva: 0, ajd: 0, total: itp };
  }
  const iva = r2(price * 0.1);
  const ajd = r2(price * ajdRate);
  return { itp: 0, iva, ajd, total: r2(iva + ajd) };
}
