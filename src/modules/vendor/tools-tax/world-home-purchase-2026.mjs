// GENERATED from tools-oiyo src/lib/world-home-purchase-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// Taxes when you buy a home (2026-11-22, world audience gap A2: layperson side).
// UK (England & Northern Ireland SDLT) is new here; JP, FR, ES, CN reuse lib/acquisition-tax-countries.ts.
// Facts: /mnt/project-files/notes/home-purchase-facts-2026-11-22.md. Germany not covered (no current official rate table read).
import { chinaDeedTax, franceTransferDuties, japanAcquisitionTax, spainPurchaseTax,                                                                                                            } from "./acquisition-tax-countries.mjs";

export const HOME_AS_OF = "2026-11-22";
                                                                  
const r2 = (n        ) => Math.round(n * 100) / 100;

const SDLT = "GOV.UK Stamp Duty Land Tax: residential property rates; Higher rates of SDLT (from 1 April 2025)";
const UK_STD                     = [[125_000, 0], [250_000, 0.02], [925_000, 0.05], [1_500_000, 0.1], [Infinity, 0.12]];
const UK_FTB                     = [[300_000, 0], [500_000, 0.05]];

function bands(price        , b                    , add = 0) {
  let tax = 0, lower = 0;
  const rows                                                            = [];
  for (const [upper, rate] of b) {
    if (price <= lower) break;
    const part = Math.min(price, upper) - lower;
    const t = part * (rate + add);
    rows.push({ from: lower, to: Math.min(price, upper), rate: r2((rate + add) * 100), tax: r2(t) });
    tax += t;
    lower = upper;
  }
  return { tax, rows };
}

/** England & Northern Ireland SDLT on a residential purchase. */
export function ukSdlt(x                                                                                     ) {
  const price = Math.max(0, Number(x.price) || 0);
  const items         = [];
  const add = (x.additional ? 0.05 : 0) + (x.nonResident ? 0.02 : 0);
  let useFtb = !!x.firstTime && !x.additional && price <= 500_000;
  if (x.firstTime && price > 500_000) items.push({ tone: "warn", text: "Over £500,000 you cannot claim first-time buyer relief, so standard rates apply.", cite: SDLT });
  if (x.firstTime && x.additional) { useFtb = false; items.push({ tone: "warn", text: "First-time buyer relief is not used together with the higher rates for additional properties.", cite: SDLT }); }
  const r = bands(price, useFtb ? UK_FTB : UK_STD, add);
  items.push({ tone: "info", text: useFtb ? "First-time buyer relief: 0% up to £300,000, 5% on £300,001 to £500,000." : "Standard bands: 0% to £125,000, 2% to £250,000, 5% to £925,000, 10% to £1.5m, 12% above.", cite: SDLT });
  if (x.additional) items.push({ tone: "info", text: "Higher rates: 5% on top of each band if you own another residential property.", cite: SDLT });
  if (x.nonResident) items.push({ tone: "info", text: "Non-UK resident surcharge: 2% on top of all other residential rates.", cite: SDLT });
  items.push({ tone: "warn", text: "England and Northern Ireland only. Scotland (LBTT) and Wales (LTT) have their own taxes.", cite: SDLT });
  return { tax: r2(r.tax), rows: r.rows, firstTimeRelief: useFtb, items };
}

// Japan 印紙税 on a 不動産売買契約書 (reduced amounts, contracts made 平成26年4月1日〜令和9年3月31日). NTA No.7108.
const JP_STAMP                     = [[100_000, 200], [500_000, 200], [1_000_000, 500], [5_000_000, 1_000], [10_000_000, 5_000], [50_000_000, 10_000], [100_000_000, 30_000], [500_000_000, 60_000], [1_000_000_000, 160_000], [5_000_000_000, 320_000], [Infinity, 480_000]];
export function jpContractStamp(amount        ) {
  if (amount < 10_000) return 0;
  for (const [upper, tax] of JP_STAMP) if (amount <= upper) return tax;
  return 480_000;
}

                                                           
                         
                       
                
       
                                                                   
                        
                                                                                                                                                                            
       
                                                                            
       
                                                                                       
       
                                                            
  

export function homePurchaseTax(x           ) {
  const price = Math.max(0, Number(x.price) || 0);
  const base = { asOf: HOME_AS_OF, country: x.country, price };
  const gen       = { tone: "warn", text: "General information only, not tax or legal advice. Agent, notary and lawyer fees are not included unless listed.", cite: "—" };
  if (x.country === "UK") {
    const r = ukSdlt({ price, firstTime: x.firstTime, additional: x.additional, nonResident: x.nonResident });
    return { ...base, total: r.tax, parts: { sdlt: r.tax }, rows: r.rows, items: [...r.items, gen] };
  }
  if (x.country === "JP") {
    const i                        = { landValue: x.landValue ?? 0, landArea: x.landArea ?? 0, takuchi: x.takuchi ?? true, buildingValue: x.buildingValue ?? 0, floorArea: x.floorArea ?? 0, kind: x.kind ?? "used", houseDeduction: x.houseDeduction ?? 0, qualifies: x.qualifies ?? false };
    const r = japanAcquisitionTax(i);
    const stamp = jpContractStamp(price);
    return { ...base, total: r.total + stamp, parts: { acquisitionTax: r.acquisitionTax, registrationTax: r.registrationTax, stamp }, detail: r, items: [
      { tone: "info", text: "不動産取得税 3%（土地・住宅、令和9年3月31日まで）と登録免許税（土地の売買 1.5%、令和11年3月31日まで。住宅用家屋の移転 0.3%・新築の保存 0.15%、令和9年3月31日まで）は固定資産税評価額で計算します。", cite: "NTA No.7191; 地方税法 第73条の15" },
      { tone: "info", text: `売買契約書の印紙税 ${stamp.toLocaleString("ja-JP")}円（軽減措置、令和9年3月31日までの契約）。`, cite: "NTA No.7108" },
      { tone: "warn", text: "住宅ローンの抵当権設定登記（住宅用 0.1%）、司法書士報酬、仲介手数料は含みません。", cite: "NTA No.7191" }, gen] };
  }
  if (x.country === "FR") {
    const rate = Number(x.departmentRate ?? 0.045);
    const r = franceTransferDuties(price, x.frKind ?? "ancien", rate, !!x.primoAccedant);
    const csi = price > 0 ? Math.max(15, r2(price * 0.001)) : 0;
    return { ...base, total: r2(r.total + csi), parts: { droits: r.total, csi }, detail: r, items: [
      { tone: "info", text: x.frKind === "neuf" ? "Neuf (VEFA) : taxe de publicité foncière au taux réduit (0,715 %)." : "Ancien : taxe départementale (1,20 % à 5 % du 01/04/2025 au 31/03/2028) + taxe communale 1,20 % + frais d'assiette 2,37 % de la part départementale. Taux maximal maintenu à 4,5 % pour une première acquisition de résidence principale.", cite: "impots.gouv.fr (mis à jour le 17/07/2026)" },
      { tone: "info", text: "Contribution de sécurité immobilière 0,1 % (15 € minimum).", cite: "impots.gouv.fr" },
      { tone: "warn", text: "Émoluments du notaire et débours non inclus.", cite: "impots.gouv.fr" }, gen] };
  }
  if (x.country === "ES") {
    const r = spainPurchaseTax(price, x.region ?? "madrid", x.esKind ?? "usada", x.customItp, x.customAjd);
    return { ...base, total: r.total, parts: { itp: r.itp, iva: r.iva, ajd: r.ajd }, detail: r, items: [
      { tone: "info", text: x.esKind === "nueva" ? "Obra nueva: IVA 10 % + AJD según la comunidad." : "Vivienda usada: ITP según la comunidad autónoma.", cite: "RDLeg 1/1993; normativa autonómica" },
      { tone: "warn", text: "Tipos reducidos (jóvenes, familia numerosa, VPO) no incluidos.", cite: "—" }, gen] };
  }
  const r = chinaDeedTax(price, x.area ?? 90, x.order ?? "first", x.localRate ?? 0.03);
  return { ...base, total: r.tax, parts: { deedTax: r.tax }, detail: r, items: [
    { tone: "info", text: "契税：首套 1%（≤140㎡）/1.5%；二套 1%（≤140㎡）/2%；其他按当地税率 3%–5%。", cite: "财政部 税务总局 住房城乡建设部公告2024年第16号" }, gen] };
}
