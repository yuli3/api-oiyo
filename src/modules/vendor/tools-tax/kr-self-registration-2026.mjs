// GENERATED from tools-oiyo src/lib/kr-self-registration-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 매매 셀프 등기 총비용 (2026-11-21, 전문 직군 전수조사 남은 빈칸). 집을 산 사람이 인터넷등기소로 직접 소유권이전등기를 할 때 드는 돈을 한 장으로 보는 용도예요.
// 같은 코드가 oiyo-kr-law-guide 스킬 scripts/guide.mjs calc registration 으로 들어가요. 등기 신청서 작성·대리를 하지 않아요.
// 근거(2026-11 확인):
// - 취득세·지방교육세·농특세: kr-real-estate-tax.ts acquisitionTax(지방세법 제11조·제13조의2, 제151조, 농어촌특별세법 제5조).
// - 국민주택채권: 주택도시기금법 시행령 제8조 ②·별표 부표 제15호 가(주택 소유권 보존·이전, 시가표준액 구간별 매입률), 같은 별표 제4호(1만 원 미만 끝수: 5천 원 이상 올림, 미만 버림).
//   즉시 매도할 때의 할인율은 날마다 바뀌어 사용자가 넣어요(은행 창구·인터넷등기소에 고시).
// - 등기신청수수료: 등기사항증명서 등 수수료규칙 제5조의2 ①(대법원규칙 제3222호, 2025-08-01 시행): 서면 18,000원, 전자표준양식 15,000원, 전자신청 10,000원(부동산 1개당).
// - 인지세: 인지세법 제3조 ① 제1호(1천만 원 초과~3천만 2만 원, ~5천만 4만, ~1억 7만, ~10억 15만, 10억 초과 35만), 제6조 제5호(주택 1억 원 이하 비과세).
import { acquisitionTax,                 } from "./kr-real-estate-tax.mjs";

export const REG_AS_OF = "2026-11-21";
const MAN = 10_000, EOK = 100_000_000;

export const BOND_RATES                                                   = [
  { upTo: 5_000 * MAN, metro: 0.013, other: 0.013 },
  { upTo: 1 * EOK, metro: 0.019, other: 0.014 },
  { upTo: 1.6 * EOK, metro: 0.021, other: 0.016 },
  { upTo: 2.6 * EOK, metro: 0.023, other: 0.018 },
  { upTo: 6 * EOK, metro: 0.026, other: 0.021 },
  { upTo: Infinity, metro: 0.031, other: 0.026 },
];

export function housingBond(standardPrice        , metro         ) {
  const p = Math.max(0, Number(standardPrice) || 0);
  if (p < 2_000 * MAN) return { rate: 0, amount: 0 };
  const row = BOND_RATES.find((r) => p < r.upTo) ;
  const rate = metro ? row.metro : row.other;
  const raw = p * rate;
  const rest = raw % MAN;
  const amount = Math.max(MAN, raw - rest + (rest >= 5_000 ? MAN : 0));
  return { rate, amount: Math.round(amount) };
}

export function stampTax(contract        , house = true) {
  const c = Math.max(0, Number(contract) || 0);
  if (house && c <= 1 * EOK) return 0;
  if (c <= 1_000 * MAN) return 0;
  if (c <= 3_000 * MAN) return 20_000;
  if (c <= 5_000 * MAN) return 40_000;
  if (c <= 1 * EOK) return 70_000;
  if (c <= 10 * EOK) return 150_000;
  return 350_000;
}

                                                       
export const FILING_FEE                               = { efile: 10_000, eform: 15_000, paper: 18_000 };

                        
                
                                                   
                         
                 
                      
                      
                         
                   
                        
                               
                        
                                             
                      
                                      
                 
                            
                    
  

export function selfRegistrationCost(x          ) {
  const price = Math.max(0, Number(x.price) || 0);
  const acq = acquisitionTax({ price, houses: x.houses ?? 1, regulated: !!x.regulated, temporaryTwo: !!x.temporaryTwo, over85: !!x.over85 });
  const bond = housingBond(x.standardPrice || price, x.metro);
  const discount = Math.min(1, Math.max(0, x.bondDiscount ?? 0));
  const bondCost = Math.round(bond.amount * discount);
  const method = x.method ?? "efile";
  const fee = FILING_FEE[method];
  const stampFull = stampTax(price, true);
  const stamp = Math.round(stampFull * Math.min(1, Math.max(0, x.stampShare ?? 0.5)));
  const other = Math.max(0, Number(x.other) || 0);
  const self = acq.total + bondCost + fee + stamp + other;
  const agentFee = Math.max(0, Number(x.agentFee) || 0);
  return {
    acquisition: acq, bond: { ...bond, discount, cost: bondCost }, method, fee, stampFull, stamp, other,
    total: self,
    withAgent: agentFee ? self + agentFee : null,
    saving: agentFee || null,
    steps: [
      "잔금일에 매도인 서류(등기권리증·인감증명서·매도용·주민등록초본)를 받아요.",
      "위택스에서 취득세를 신고·납부해요(잔금일부터 60일 안).",
      "은행이나 인터넷등기소에서 국민주택채권을 사고(바로 팔 수 있어요), 수입인지를 사요.",
      "인터넷등기소에서 소유권이전등기를 신청해요(잔금일부터 60일 안, 부동산등기 특별조치법 제2조).",
    ],
  };
}

export const REG_NOTE = "셀프 등기 비용 어림이에요. 근저당 설정·말소가 함께 있거나 상속·증여, 공동명의, 토지거래허가 대상이면 서류와 비용이 달라져요. 채권 할인율과 수입인지 몫은 그날그날, 계약마다 달라요.";
