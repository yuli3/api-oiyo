// GENERATED from tools-oiyo src/lib/after-death-timeline-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 사망 후 할 일 타임라인 (2026-11-20, 다음 10종 #3). 돌아가신 날 하나로 유족이 챙길 기한을 날짜순으로 모아요.
// 웹 도구 /ko/after-death-checklist 와 스킬 oiyo-kr-benefits-navigator(scripts/calc.mjs after-death)가 같은 코드를 써요.
// 근거(기준일 2026-11-20):
// - 가족관계의 등록 등에 관한 법률 제84조①(사망신고: 사망 사실을 안 날부터 1개월), 제122조(기간 안 신고 안 하면 5만 원 이하 과태료).
// - 안심상속 원스톱 서비스(행정안전부·정부24): 사망일이 속한 달의 말일부터 1년 안에 신청.
// - 민법 제1019조①(상속포기·한정승인: 상속개시를 안 날부터 3개월), ③(특별한정승인: 빚이 더 많은 걸 중대한 과실 없이 몰랐으면 안 날부터 3개월).
// - 근로기준법 제36조(사망·퇴직 뒤 14일 안 금품 청산), 제49조(임금채권 3년).
// - 주택임대차보호법 제9조③(함께 살던 사실혼 배우자·2촌 이내 친족이 임차권을 잇지 않으려면 사망 뒤 1개월 안 반대 의사).
// - 부가가치세법 제49조①·제5조③(폐업: 폐업일이 속한 달의 말일부터 25일 안 확정신고).
// - 소득세법 제74조(돌아가신 분 종합소득세: 상속개시일이 속한 달의 말일부터 6개월).
// - 지방세법 제20조①(상속 취득세: 상속개시일이 속한 달의 말일부터 6개월, 국외 주소 9개월).
// - 자동차등록령 제26조(상속 이전등록: 상속개시일이 속한 달의 말일부터 6개월).
// - 상속세 및 증여세법 제67조(상속세: 상속개시일이 속한 달의 말일부터 6개월, 국외 9개월).
// - 상법 제662조(보험금 청구권 3년), 산업재해보상보험법 제112조①(유족급여·장례비 3년), 국민연금법 제115조①(급여 받을 권리 5년).
// - 기간 계산: 민법 제157조(첫날 빼기)·제160조·제161조(마지막 날이 토·일·공휴일이면 다음 날), 국세기본법 제5조①.
import { krTaxDeadline } from "./kr-business-day.mjs";

export const AFTER_DEATH_AS_OF = "2026-11-20";

                                  
                                 
                    
                                           
                     
                             
                   
                            
                     
                                  
                         
                   
                     
                                          
                        
                            
                    
                                 
                      
                
                       
                
                
                              
                    
                        
                  
 

                                                                    
export const PHASE_LABEL                        = {
  week: "첫 2주",
  month: "1개월 안",
  quarter: "3개월 안",
  half: "6개월 안",
  later: "그 뒤(청구 시효)",
};

                                 
             
                
                                       
              
                 
               
               
                
                  
               
            
               
                                              
                
 

                                   
               
                    
                    
                          
                     
                                                 
                               
                         
                            
 

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const toDate = (iso        ) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const fmt = (d      ) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** 첫날을 빼고 n개월: 같은 날짜(없으면 그 달 말일)에 끝나요. 민법 제157조·제160조. */
export function plusMonths(iso        , months        )         {
  const [y, m, d] = iso.split("-").map(Number);
  const last = new Date(y, m - 1 + months + 1, 0).getDate();
  return fmt(new Date(y, m - 1 + months, Math.min(d, last)));
}
/** 그 날이 속한 달의 말일부터 n개월(말일 기준). */
export function monthEndPlusMonths(iso        , months        )         {
  const [y, m] = iso.split("-").map(Number);
  return fmt(new Date(y, m + months, 0));
}
export function monthEndPlusDays(iso        , days        )         {
  const [y, m] = iso.split("-").map(Number);
  return fmt(new Date(y, m, days));
}
export function plusDays(iso        , days        )         {
  const d = toDate(iso);
  d.setDate(d.getDate() + days);
  return fmt(d);
}
/** 마지막 날이 토·일·공휴일이면 다음 영업일. */
export const rollBusiness = (iso        ) => fmt(krTaxDeadline(toDate(iso)));

export function daysFrom(a        , b        )         {
  return Math.round((toDate(b).getTime() - toDate(a).getTime()) / 86_400_000);
}

function phaseOf(death        , due        )        {
  const n = daysFrom(death, due);
  if (n <= 14) return "week";
  if (n <= 45) return "month";
  if (n <= 100) return "quarter";
  if (n <= 200) return "half";
  return "later";
}

export function afterDeathTimeline(input                 , today         )                   {
  const death = ISO.test(input.deathDate) ? input.deathDate : AFTER_DEATH_AS_OF;
  const known = input.knownDate && ISO.test(input.knownDate) && input.knownDate >= death ? input.knownDate : death;
  const abroad = !!input.abroad;
  const raw                                          = [];
  const dues           = [];
  const add = (due        , t                                       ) => {
    raw.push(t);
    dues.push(due);
  };

  add(plusMonths(known, 1), {
    id: "death-report",
    label: "사망신고",
    from: "사망 사실을 안 날부터 1개월",
    where: "가까운 주민센터·시·구청(전국 어디서나) 또는 대법원 전자가족관계등록시스템",
    bring: ["사망진단서 또는 시체검안서", "신고하는 사람 신분증"],
    cite: "가족관계등록법 제84조①·제122조",
    miss: "5만 원 이하 과태료. 사망신고가 돼야 아래 조회·청구를 할 수 있어요.",
    duty: true,
  });
  add(monthEndPlusMonths(death, 12), {
    id: "one-stop",
    label: "안심상속 원스톱 서비스(재산·빚 한 번에 조회)",
    from: "사망일이 속한 달의 말일부터 1년",
    where: "사망신고 할 때 주민센터에서 함께 신청하거나 정부24",
    bring: ["신청인 신분증", "대리인이면 위임장과 상속인 신분증 사본"],
    cite: "행정안전부 안심상속 원스톱 서비스",
    miss: "기관마다 따로 조회해야 해요. 상속포기 판단(3개월)에 필요하니 사망신고 때 같이 하세요.",
    duty: false,
  });
  add(plusMonths(known, 3), {
    id: "renounce",
    label: input.debts ? "상속포기·한정승인 결정(빚이 더 많을 수 있어요)" : "상속포기·한정승인 여부 결정",
    from: "상속이 시작된 걸 안 날부터 3개월",
    where: "돌아가신 분 마지막 주소지 가정법원(전자소송 가능)",
    bring: ["돌아가신 분 기본증명서·가족관계증명서·말소 주민등록초본", "상속인 가족관계증명서·인감증명서"],
    cite: "민법 제1019조①·③",
    miss: "지나면 빚까지 그대로 물려받아요(단순승인). 빚이 더 많은 걸 큰 잘못 없이 늦게 알았다면 그때부터 3개월 안 특별한정승인.",
    duty: false,
  });
  if (input.employed) {
    add(plusDays(death, 14), {
      id: "wages",
      label: "회사에서 남은 월급·퇴직금 받기",
      from: "돌아가신 날부터 14일(회사가 지급할 기한)",
      where: "회사 인사팀, 안 주면 고용노동부 1350 진정",
      bring: ["가족관계증명서", "기본증명서(사망 기재)", "상속인 통장 사본"],
      cite: "근로기준법 제36조·제49조",
      miss: "회사가 늦으면 지연이자가 붙어요. 받을 권리는 3년이 지나면 사라져요.",
      duty: false,
    });
  }
  if (input.renting) {
    add(plusMonths(death, 1), {
      id: "lease",
      label: "세 든 집 계약을 이어받지 않으려면 집주인에게 알리기",
      from: "돌아가신 날부터 1개월",
      where: "집주인(내용증명 등 남는 방법)",
      bring: ["임대차계약서"],
      cite: "주택임대차보호법 제9조③",
      miss: "함께 살던 사실혼 배우자·가까운 가족이 계약을 이어받아요. 이어받을 생각이면 할 일 없어요.",
      duty: false,
    });
  }
  if (input.business) {
    add(monthEndPlusDays(death, 25), {
      id: "business",
      label: "사업 정리: 폐업신고와 부가세 확정신고(이어서 하면 명의 정정)",
      from: "폐업일(사망일로 가정)이 속한 달의 말일부터 25일",
      where: "홈택스 또는 관할 세무서",
      bring: ["사업자등록증", "가족관계증명서", "폐업 신고서"],
      cite: "부가가치세법 제5조③·제49조①",
      miss: "무신고·납부지연 가산세가 붙어요. 상속인이 사업을 이어가면 폐업 대신 사업자 명의를 바꿔요.",
      duty: true,
    });
  }
  if (input.otherIncome || input.business) {
    add(monthEndPlusMonths(death, 6), {
      id: "income-tax",
      label: "돌아가신 분 종합소득세 신고(준확정신고)",
      from: "상속개시일이 속한 달의 말일부터 6개월",
      where: "홈택스 또는 돌아가신 분 주소지 세무서",
      bring: ["상속인 대표자 신고서", "소득 자료"],
      cite: "소득세법 제74조",
      miss: "무신고 가산세 20%와 하루 0.022% 납부지연 가산세.",
      duty: true,
    });
  }
  if (input.realEstate) {
    add(monthEndPlusMonths(death, abroad ? 9 : 6), {
      id: "realty",
      label: "상속 부동산 취득세 신고·납부, 그다음 상속등기",
      from: `상속개시일이 속한 달의 말일부터 ${abroad ? 9 : 6}개월`,
      where: "부동산 있는 시·군·구청 또는 위택스, 등기는 등기소·인터넷등기소",
      bring: ["상속재산분할협의서(협의했다면)", "가족관계증명서·기본증명서", "인감증명서"],
      cite: "지방세법 제20조①",
      miss: "무신고 가산세 20%와 납부지연 가산세.",
      duty: true,
    });
  }
  if (input.car) {
    add(monthEndPlusMonths(death, 6), {
      id: "car",
      label: "자동차 상속 이전등록(또는 폐차·말소)",
      from: "상속개시일이 속한 달의 말일부터 6개월",
      where: "시·군·구 차량등록사업소",
      bring: ["가족관계증명서·기본증명서", "상속인 신분증", "자동차 보험 가입 증명"],
      cite: "자동차등록령 제26조",
      miss: "늦은 날수에 따라 과태료. 이전 전에는 팔거나 폐차하기 어려워요.",
      duty: true,
    });
  }
  add(monthEndPlusMonths(death, abroad ? 9 : 6), {
    id: "inheritance-tax",
    label: "상속세 신고·납부(낼 세금이 없을 수도)",
    from: `상속개시일이 속한 달의 말일부터 ${abroad ? 9 : 6}개월`,
    where: "홈택스 또는 돌아가신 분 주소지 세무서",
    bring: ["상속재산 목록(안심상속 결과)", "빚·장례비 증빙", "평가 자료"],
    cite: "상속세 및 증여세법 제67조",
    miss: "기한 안 신고하면 3% 공제. 늦으면 무신고 가산세 20%. 일괄공제 5억 원(배우자 있으면 배우자공제 최소 5억 원 더) 안이면 세금이 없을 수 있어요.",
    duty: true,
  });
  if (input.insurance) {
    add(plusMonths(death, 36), {
      id: "insurance",
      label: "사망보험금 청구",
      from: "보험금을 청구할 수 있는 날(보통 돌아가신 날)부터 3년",
      where: "각 보험사(어떤 보험이 있는지는 안심상속 조회로)",
      bring: ["사망진단서", "가족관계증명서·기본증명서", "수익자 신분증·통장 사본"],
      cite: "상법 제662조",
      miss: "3년이 지나면 받을 권리가 사라져요.",
      duty: false,
    });
  }
  if (input.workAccident) {
    add(plusMonths(death, 36), {
      id: "work-accident",
      label: "산재 유족급여·장례비 청구",
      from: "돌아가신 날 다음 날부터 3년",
      where: "근로복지공단 1588-0075",
      bring: ["유족급여·장례비 청구서", "사망진단서", "가족관계증명서"],
      cite: "산업재해보상보험법 제112조①",
      miss: "3년이 지나면 받을 권리가 사라져요. 회사 동의 없이 청구할 수 있어요.",
      duty: false,
    });
  }
  if (input.pension) {
    add(plusMonths(death, 60), {
      id: "pension",
      label: "국민연금 유족연금·사망일시금(또는 미지급 연금) 청구",
      from: "돌아가신 날부터 5년",
      where: "국민연금공단 1355, 지사 방문",
      bring: ["가족관계증명서", "청구인 신분증·통장 사본"],
      cite: "국민연금법 제115조①",
      miss: "5년이 지나면 그 급여를 받을 권리가 사라져요. 연금은 청구한 달부터가 아니라 사유가 생긴 다음 달분부터 계산돼요.",
      duty: false,
    });
  }

  const tasks                   = raw
    .map((t, i) => {
      const due = rollBusiness(dues[i]);
      return { ...t, due, phase: phaseOf(death, due) };
    })
    .sort((a, b) => a.due.localeCompare(b.due) || a.id.localeCompare(b.id));

  const noDeadline = [
    { label: "건강보험은 돌아가신 다음 날 자격이 끝나요. 피부양자였던 가족은 지역가입자 전환·보험료를 확인해요.", where: "국민건강보험공단 1577-1000" },
    { label: "휴대폰·인터넷·구독 서비스 해지, 공과금 명의 변경", where: "각 통신사·서비스, 한전·가스·수도" },
    { label: "은행 예금 인출·해지는 상속인 전원 동의나 분할협의가 필요할 수 있어요", where: "각 금융회사(안심상속 결과로 확인)" },
  ];
  if (input.employed) noDeadline.push({ label: "회사 단체보험·경조금·퇴직연금(DC·IRP) 적립금 확인", where: "회사·퇴직연금 금융회사" });

  const ref = today && ISO.test(today) ? today : undefined;
  const next = ref ? tasks.filter((t) => t.due >= ref) : tasks;
  const overdue = ref ? tasks.filter((t) => t.due < ref) : [];
  return { asOf: AFTER_DEATH_AS_OF, deathDate: death, knownDate: known, tasks, noDeadline, next, overdue };
}
