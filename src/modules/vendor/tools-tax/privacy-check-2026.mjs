// GENERATED from tools-oiyo src/lib/privacy-check-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 개인정보 유출 대응 시계·처리방침 점검 (2026-11-20, 다음 10종 #2). 웹 도구 /ko/privacy-breach-policy-check 와
// 스킬 oiyo-kr-law-guide(scripts/guide.mjs calc breach|policy)가 같은 코드를 써요.
// 근거(기준일 2026-11-20, 2023-09-15 시행 개정법 기준):
// - 개인정보 보호법 제34조①(유출등을 알게 되면 정보주체에게 통지: 항목·시점과 경위·피해 최소화 방법·대응조치와 구제절차·신고 접수 부서와 연락처),
//   제34조③(일정 규모 이상은 보호위원회 또는 한국인터넷진흥원에 신고). 시행령 제39조(72시간 안 통지, 연락처를 모르면 홈페이지 30일 이상 게시),
//   제40조(1천 명 이상, 민감정보·고유식별정보, 외부의 불법 접근이면 72시간 안 신고).
// - 제30조①(처리방침 필수 사항), 시행령 제31조①(처리 항목·안전성 확보조치·권익침해 구제방법·변경 등), 제28조의8(국외 이전 공개), 제31조(보호책임자).
// - 제39조의2(법정손해배상 300만 원 이하), 제64조의2(과징금: 전체 매출액의 3% 이하).
// 판단 보조예요. 신고 대행·처리방침 작성은 하지 않아요.

export const PRIVACY_AS_OF = "2026-11-20";

/* ---------- 유출 대응 시계 ---------- */

                              
                                                                
                  
                        
                    
                                                 
                      
                            
                    
                                
                           
 

                               
                  
                                    
                   
               
                  
                          
                   
                        
                              
                   
                                                        
                 
 

const pad = (n        ) => String(n).padStart(2, "0");
const fmtAt = (d      ) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

export function parseAt(s        )              {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?$/.exec((s ?? "").trim());
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3], m[4] ? +m[4] : 0, m[5] ? +m[5] : 0);
  return Number.isNaN(d.getTime()) || d.getMonth() !== +m[2] - 1 ? null : d;
}

export const NOTICE_ITEMS = [
  "유출된 개인정보 항목",
  "유출된 시점과 그 경위",
  "정보주체가 피해를 줄이려고 할 수 있는 방법(비밀번호 변경, 명의도용 방지 등)",
  "회사의 대응 조치와 피해 구제 절차",
  "피해 신고를 받는 부서와 연락처",
];

export function breachClock(input             )               {
  const known = parseAt(input.knownAt) ?? new Date(2026, 10, 20, 9, 0);
  const due = new Date(known.getTime() + 72 * 3_600_000);
  const affected = Math.max(0, Math.floor(Number(input.affected) || 0));
  const reasons           = [];
  if (affected >= 1000) reasons.push(`1천 명 이상(${affected.toLocaleString("ko-KR")}명)`);
  if (input.sensitive) reasons.push("민감정보·고유식별정보 포함");
  if (input.hacking) reasons.push("외부의 불법 접근(해킹 등)");
  const report = reasons.length > 0;
  const deadline = fmtAt(due);
  const steps = [
    { when: "바로", what: "더 새지 않게 막기: 접속 차단, 비밀번호·키 교체, 취약점 임시 조치, 로그 보존", cite: "개인정보 보호법 제34조②" },
    { when: `${deadline}까지`, what: input.contactUnknown ? "연락처를 아는 사람에게 개별 통지, 모르면 홈페이지에 30일 이상 게시" : "정보주체에게 개별 통지(이메일·문자·서면 등)", cite: "개인정보 보호법 제34조①, 시행령 제39조" },
  ];
  if (report) steps.push({ when: `${deadline}까지`, what: "개인정보보호위원회 또는 한국인터넷진흥원(KISA)에 유출 신고(privacy.go.kr)", cite: "개인정보 보호법 제34조③, 시행령 제40조" });
  steps.push({ when: "확인되는 대로", what: "72시간 안에 다 확인되지 않은 내용은 확인된 것부터 알리고, 나머지는 확인되는 즉시 추가로 알리기", cite: "시행령 제39조·제40조" });
  steps.push({ when: "그 뒤", what: "원인 분석, 재발 방지 대책, 피해 문의 창구 운영 기록 남기기", cite: "개인정보 보호법 제29조" });
  return {
    knownAt: fmtAt(known),
    deadline,
    notify: true,
    report,
    reportReasons: reasons,
    reportTo: report ? "개인정보보호위원회 또는 한국인터넷진흥원(개인정보 포털 privacy.go.kr, ☎ 118)" : "신고 의무 기준 아래예요(그래도 신고·상담은 할 수 있어요)",
    noticeItems: NOTICE_ITEMS,
    postDays: input.contactUnknown ? 30 : 0,
    steps,
    cite: ["개인정보 보호법 제34조", "같은 법 시행령 제39조·제40조"],
  };
}

/* ---------- 처리방침 점검 ---------- */

                                
                                   
                    
                        
                       
                                    
                      
                        
                     
 

                             
             
                
              
               
                   
                        
                             
 

export const POLICY_ITEMS               = [
  { id: "purpose", label: "처리 목적", why: "무엇에 쓰려고 모으는지", cite: "개인정보 보호법 제30조①", keywords: /목적/ },
  { id: "items", label: "처리하는 개인정보 항목", why: "이름·연락처처럼 무엇을 모으는지", cite: "같은 법 시행령 제31조①", keywords: /(수집|처리)\s*(하는)?\s*(개인정보)?\s*항목|필수\s*항목|선택\s*항목/ },
  { id: "retention", label: "처리 및 보유 기간", why: "언제까지 갖고 있는지", cite: "개인정보 보호법 제30조①", keywords: /보유\s*기간|보존\s*기간|보관\s*기간|이용\s*기간/ },
  { id: "destroy", label: "파기 절차와 방법", why: "기간이 끝나면 어떻게 지우는지(법령으로 보존하면 그 근거)", cite: "개인정보 보호법 제30조①", keywords: /파기/ },
  { id: "thirdParty", label: "제3자 제공", why: "누구에게 무엇을 왜 주는지", cite: "개인정보 보호법 제30조①", keywords: /제\s*3\s*자/, when: "thirdParty" },
  { id: "outsource", label: "처리 위탁(수탁자와 맡긴 일)", why: "택배·결제·호스팅 회사 이름과 업무", cite: "개인정보 보호법 제26조②·제30조①", keywords: /위탁|수탁/, when: "outsource" },
  { id: "overseas", label: "국외 이전", why: "어느 나라 누구에게 무엇을 옮기는지", cite: "개인정보 보호법 제28조의8", keywords: /국외|해외|이전받는/, when: "overseas" },
  { id: "rights", label: "정보주체의 권리와 행사 방법", why: "열람·정정·삭제·처리정지를 어떻게 요구하는지", cite: "개인정보 보호법 제30조①", keywords: /열람|정정|처리\s*정지/ },
  { id: "cpo", label: "개인정보 보호책임자(이름 또는 부서, 연락처)", why: "문의할 사람과 연락처", cite: "개인정보 보호법 제30조①·제31조", keywords: /보호\s*책임자/ },
  { id: "cookies", label: "자동 수집 장치(쿠키 등) 설치·운영과 거부 방법", why: "쿠키를 쓰는지와 끄는 법", cite: "개인정보 보호법 제30조①", keywords: /쿠키|cookie|자동\s*수집/i, when: "website" },
  { id: "safety", label: "안전성 확보 조치", why: "암호화·접근 통제 같은 보호 조치", cite: "같은 법 시행령 제31조①", keywords: /안전성\s*확보|암호화|접근\s*통제|접근\s*권한/ },
  { id: "remedy", label: "권익침해 구제 방법", why: "분쟁조정위원회·침해신고센터(118) 안내", cite: "같은 법 시행령 제31조①", keywords: /분쟁\s*조정|침해\s*신고|118/ },
  { id: "change", label: "처리방침 변경(시행일)", why: "언제부터 적용되는지와 바뀐 내용", cite: "같은 법 시행령 제31조①", keywords: /시행\s*일|변경/ },
];

                                  
             
                
              
               
                 
                 
                   
 

                                    
                   
                
                             
                           
                        
                  
                        
                  
 

const sentences = (text        ) => text.split(/(?<=[.。!?])\s+|\n+/).map((x) => x.trim()).filter(Boolean);

export function checkPolicy(text        , ctx                = {})                    {
  const body = (text ?? "").slice(0, 200_000);
  const lines = sentences(body);
  const items                    = POLICY_ITEMS.filter((it) => !it.when || ctx[it.when]).map((it) => {
    const hit = lines.find((l) => it.keywords.test(l));
    return { id: it.id, label: it.label, why: it.why, cite: it.cite, found: !!hit, evidence: hit ? (hit.length > 80 ? `${hit.slice(0, 80)}…` : hit) : "" };
  });
  const contactFound = /(\d{2,4}-\d{3,4}-\d{4})|([\w.+-]+@[\w-]+\.[\w.-]+)/.test(body);
  const date = /(20\d{2})\s*[.\-년]\s*(\d{1,2})\s*[.\-월]\s*(\d{1,2})/.exec(body);
  const effectiveDate = date ? `${date[1]}-${pad(+date[2])}-${pad(+date[3])}` : "";
  const notes           = [];
  const cpo = items.find((i) => i.id === "cpo");
  if (cpo?.found && !contactFound) notes.push("보호책임자가 있지만 전화번호나 이메일을 찾지 못했어요. 연락처를 꼭 적어요.");
  if (!body.trim()) notes.push("처리방침 글을 붙여 넣어 주세요.");
  if (/주민\s*등록\s*번호/.test(body)) notes.push("주민등록번호는 법령에 근거가 있을 때만 처리할 수 있어요(제24조의2). 근거 법령이 적혀 있는지 확인해요.");
  if (!ctx.outsource && /택배|배송|결제|PG|호스팅|클라우드/i.test(body)) notes.push("택배·결제·호스팅 회사가 보이는데 처리 위탁을 '아니요'로 골랐어요. 맡긴 업무가 있으면 위탁 항목이 필요해요.");
  if (!ctx.website && /쿠키|cookie/i.test(body)) notes.push("쿠키 내용이 있어요. 홈페이지·앱을 운영하면 '예'로 바꿔 거부 방법까지 점검해요.");
  notes.push("낱말이 있는지만 확인해요. 내용이 실제 처리와 맞는지는 직접 확인해야 해요.");
  const found = items.filter((i) => i.found).length;
  return { required: items.length, found, missing: items.filter((i) => !i.found), items, contactFound, effectiveDate, notes };
}

export const SAMPLE_POLICY = `개인정보 처리방침
○○상점은 개인정보 보호법에 따라 이용자의 개인정보를 보호합니다.
1. 처리 목적: 주문 접수, 배송, 고객 상담에 이용합니다.
2. 처리하는 개인정보 항목: 필수 항목은 이름, 휴대전화번호, 주소입니다.
3. 보유 기간: 거래 종료 후 5년(전자상거래법에 따른 보존)까지 보관합니다.
4. 처리 위탁: 배송은 ○○택배, 결제는 ○○PG사에 맡깁니다.
5. 이용자는 언제든지 개인정보 열람, 정정, 삭제, 처리정지를 요구할 수 있습니다.
6. 개인정보 보호책임자: 대표 홍길동
시행일: 2026. 1. 1.`;
