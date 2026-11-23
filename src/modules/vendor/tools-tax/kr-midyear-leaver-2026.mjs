// GENERATED from tools-oiyo src/lib/kr-midyear-leaver-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 중도퇴사자 연말정산 미리보기 (2026-11-23, 실무 오피스 새 계산 3종 #3, 세운 승인 "3종 모두 만들기").
// 새 세율·공제 값은 없어요. 연말정산 엔진(kr-year-end-2026 settleYearEnd)을 두 번 돌려요.
//  1) 퇴사할 때 회사가 하는 정산: 소득세법 제137조(근로소득세액의 연말정산)는 퇴직하는 달의 급여를 지급할 때 정산하라고 해요.
//     이때는 보통 근로자가 낸 서류가 거의 없어 본인 기본공제, 연금보험료, 건강·고용보험료, 표준세액공제만 들어가요.
//  2) 다음 해 5월 종합소득세 확정신고(소득세법 제70조): 카드·의료비·교육비·기부금·월세·부양가족을 더해 다시 계산해요.
// 같은 해 다른 회사에 다시 들어가면 새 회사가 전 직장 근로소득원천징수영수증을 합쳐 연말정산해요(제148조).
import { settleYearEnd,                                       } from "./kr-year-end-2026.mjs";
import { krTaxDeadline } from "./kr-business-day.mjs";

export const LEAVER_AS_OF = "2026-11-23";

                              
              
               
                                  
                       
                                   
                   
                        
                           
                                
                            
                     
           
                        
                     
                        
                     
                             
                       
                      
                  
                           
                            
                 
                              
                            
    
 

                               
                         
                     
                                       
                        
                                          
                    
                               
                        
                                           
                      
                  
                                               
 

const ymd = (d      ) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function midYearLeaver(input             )               {
  const base = {
    salary: Math.max(0, input.salaryToDate),
    nationalPension: input.nationalPension ?? 0,
    healthEmployment: input.healthEmployment ?? 0,
    withheld: Math.max(0, input.withheld),
  };
  const company = settleYearEnd({ ...base, persons: 1 });
  const x = input.extra ?? {};
  const may = settleYearEnd({
    ...base,
    persons: Math.max(1, x.persons ?? 1),
    card: x.card,
    medical: x.medical,
    medicalSpecific: x.medicalSpecific,
    education: x.education,
    donation: x.donation,
    rent: x.rent,
    rentEligible: x.rentEligible,
    pensionSavings: x.pensionSavings,
    irp: x.irp,
    insurancePremium: x.insurancePremium,
    creditChildren: x.creditChildren,
  });
  const companyRefund = company.refund?.total ?? 0;
  const mayRefund = may.refund?.total ?? 0;
  const drivers = [
    { label: "부양가족 기본공제", amount: may.personalDeduction - company.personalDeduction },
    { label: "신용카드 등 소득공제", amount: may.cardDeduction - company.cardDeduction },
    { label: "자녀세액공제", amount: may.childCredit - company.childCredit },
    { label: "연금계좌 세액공제", amount: may.pensionCredit - company.pensionCredit },
    { label: "보장성보험 세액공제", amount: may.insuranceCredit - company.insuranceCredit },
    { label: "의료비 세액공제", amount: may.medicalCredit - company.medicalCredit },
    { label: "교육비 세액공제", amount: may.educationCredit - company.educationCredit },
    { label: "기부금 세액공제", amount: may.donationCredit - company.donationCredit },
    { label: "월세 세액공제", amount: may.rentCredit - company.rentCredit },
  ].filter((d) => d.amount > 0);
  return {
    company,
    may,
    companyRefund,
    mayRefund,
    extraByFiling: Math.max(0, mayRefund - companyRefund),
    mayDeadline: ymd(krTaxDeadline(new Date(input.year + 1, 4, 31))),
    drivers,
  };
}
