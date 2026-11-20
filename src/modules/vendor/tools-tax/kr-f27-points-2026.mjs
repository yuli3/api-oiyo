// GENERATED from tools-oiyo src/lib/kr-f27-points-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// F-2-7 점수제 거주 비자 점수 어림 (2026-11-21, 전문 직군 전수조사 남은 빈칸). 외국인과 행정 실무자가 신청 전에 점수를 맞춰 보는 용도예요.
// 같은 코드가 oiyo-kr-law-guide 스킬 scripts/guide.mjs calc f27 로 들어가요. 체류 허가는 출입국·외국인관서가 정하고, 신청 대행은 하지 않아요.
// 근거: 법무부고시 제2025-408호(2025-10-24 시행, 출입국관리법 시행령 별표 1의2 24. 거주(F-2)자목의 연령·학력·소득 등 기준).
// 공통 항목 130점 + 가점 40점(상한) − 감점(최대 70점), 80점 이상이면 점수 요건을 채워요. 지원 대상(고시 제2조)·결격(제4조)은 따로 확인해요.
// 2026-08-03 시행 F-2-R(지역특화형, 고시 제2026-248호)은 다른 트랙이라 넣지 않았어요.
export const F27_AS_OF = "2026-11-21";
export const F27_PASS = 80;

                                                                          
                                                       
                        
              
                 
                             
                         
                                                   
                 
                             
                 
                                   
                             
                       
                              
                  
                                               
                                                        
                  
                                                           
                                                                                        
                            
                                                                                               
                         
                                                                      
                      
  

export function agePoints(age        ) {
  const a = Math.floor(Number(age) || 0);
  if (a < 18) return 0;
  if (a <= 24) return 23;
  if (a <= 29) return 25;
  if (a <= 34) return 23;
  if (a <= 39) return 20;
  if (a <= 44) return 12;
  if (a <= 50) return 8;
  return 3;
}
const DEGREE                                   = { none: [0, 0], associate: [15, 10], bachelor: [17, 15], master: [20, 17], phd: [25, 20] };
const KOREAN = [0, 3, 5, 10, 15, 20];
export function incomePoints(income        , aboveMin = true) {
  const m = (Number(income) || 0) / 10_000;
  if (!aboveMin || m <= 0) return 0;
  if (m >= 10_000) return 60;
  if (m >= 9_000) return 58;
  if (m >= 8_000) return 56;
  if (m >= 7_000) return 53;
  if (m >= 6_000) return 50;
  if (m >= 5_000) return 45;
  if (m >= 4_000) return 40;
  if (m >= 3_000) return 30;
  return 10;
}
const TOP = { none: 0, bachelor: 15, master: 20, phd: 30 };
const KR_UNI = { none: 0, bachelor: 5, master: 7, phd: 10 };
const VOL = [0, 1, 5, 7];
const IMM                           = { none: 0, low: 10, mid: 20, high: 30 };
const CRIM                           = { none: 0, low: 20, mid: 30, high: 40 };

export function f27Points(x          ) {
  const age = agePoints(x.age);
  const edu = DEGREE[x.degree][x.stemOrDouble ? 0 : 1];
  const korean = KOREAN[Math.min(5, Math.max(0, Math.floor(Number(x.korean) || 0)))];
  const income = incomePoints(x.income, x.aboveMinimumWage !== false);
  const base = age + edu + korean + income;
  const bonusRaw = (x.warCountry ? 20 : 0) + (x.ministryRecommend ? 20 : 0) + (x.kiip5 ? 10 : 0) + TOP[x.topUniDegree ?? "none"] + KR_UNI[x.koreanUniDegree ?? "none"] + VOL[x.volunteer ?? 0];
  const bonus = Math.min(40, bonusRaw);
  const penalty = Math.min(70, IMM[x.immigration ?? "none"] + CRIM[x.criminal ?? "none"]);
  const total = base + bonus - penalty;
  const gaps           = [];
  if (total < F27_PASS) {
    if (korean < 20) gaps.push(`한국어를 한 단계 올리면 +${KOREAN[Math.min(5, Math.floor(Number(x.korean) || 0) + 1)] - korean}점이에요(TOPIK·사회통합프로그램 중 높은 것).`);
    if (income < 60) gaps.push("연간 소득 구간이 오르면 점수가 크게 바뀌어요(소득금액증명 기준).");
    if (bonus < 40) gaps.push("가점(중앙행정기관 추천, 사회통합 5단계, 국내 학위, 사회봉사)은 40점까지 더해져요.");
  }
  return { age, education: edu, korean, income, base, bonusRaw, bonus, penalty, total, pass: total >= F27_PASS, need: Math.max(0, F27_PASS - total), gaps };
}

export const F27_NOTE = "F-2-7 점수 어림이에요. 지원 대상(상장회사 전문직, 3년 이상 합법 체류한 E-1~E-7·D-5~D-9 등)과 결격(5년 안 금고 이상, 3년 안 300만 원 이상 벌금 등)을 먼저 확인하고, 신청은 하이코리아 방문 예약으로 해요. 고시가 바뀌면 점수가 달라져요.";
