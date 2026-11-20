// GENERATED from tools-oiyo src/lib/freelance-contract-check-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 프리랜서·외주 계약서 읽기 점검 (2026-11-20, 다음 10종 #5). 웹 도구 /ko/freelance-contract-check 와
// 스킬 oiyo-kr-law-guide(scripts/guide.mjs calc contract)가 같은 코드를 써요.
// 계약서를 대신 쓰거나 고치지 않아요. 붙여 넣은 글에서 꼭 있어야 할 항목과 조심할 문장을 찾고, 받을 돈(3.3% 또는 부가세)을 셈해요.
// 근거(기준일 2026-11-20):
// - 민법 제664조(도급), 제665조(보수는 결과물을 넘길 때, 넘길 게 없으면 일을 마친 뒤 지체 없이), 제673조(완성 전 해제는 손해를 배상하고),
//   제398조(손해배상 예정액이 지나치면 법원이 줄일 수 있고, 위약금은 손해배상 예정으로 추정).
// - 저작권법 제45조②(저작재산권을 전부 넘겨도 특약이 없으면 2차적저작물 작성권은 넘기지 않은 것으로 추정).
// - 소득세법 제127조·제129조(인적용역 사업소득 원천징수 3%), 지방세법(지방소득세 10%) → 합계 3.3%. 부가가치세법 제26조(인적용역 면세)·사업자는 10% 별도.
// - 하도급법 제3조(서면 발급)·제13조(받은 날부터 60일 안 지급), 근로기준법 제2조(근로자: 계약 이름보다 실제로 지휘·감독을 받는지).

export const CONTRACT_AS_OF = "2026-11-20";

                                  
                                            
                     
                                               
                       
 

                               
             
                
              
               
                   
                               
 

export const CONTRACT_ITEMS                 = [
  { id: "scope", label: "업무 범위와 결과물", why: "무엇을 어디까지 만들어 넘기는지(파일 형식·분량 포함)", cite: "민법 제664조", keywords: /업무\s*(의\s*)?(범위|내용)|과업|용역\s*(의\s*)?내용|결과물|산출물|납품물/ },
  { id: "deadline", label: "납기와 일정", why: "언제까지 넘기는지, 자료를 늦게 주면 일정이 어떻게 되는지", cite: "민법 제664조", keywords: /납기|납품\s*(일|기한)|완료\s*일|마감|일정|기한/ },
  { id: "fee", label: "대금(금액)", why: "총액과 부가세·3.3% 포함 여부", cite: "민법 제664조", keywords: /대금|보수|용역비|계약\s*금액|[\d,]+\s*원|원정/ },
  { id: "payDate", label: "지급 시기와 방법", why: "선금·잔금 비율, 며칠 안에 어느 계좌로", cite: "민법 제665조", keywords: /지급\s*(일|기일|시기|방법)|이내\s*(에\s*)?(지급|입금)|지급한다|지급하기로|입금/ },
  { id: "tax", label: "세금 처리(3.3% 또는 부가세)", why: "원천징수 3.3%를 떼는지, 부가세 별도인지", cite: "소득세법 제127조·제129조", keywords: /3\.3\s*%|원천\s*징수|부가\s*(가치)?\s*세|VAT|세금\s*계산서/i },
  { id: "acceptance", label: "검수(확인) 방법과 기간", why: "며칠 안에 확인하고, 말이 없으면 통과로 보는지", cite: "민법 제665조", keywords: /검수|검사|인수\s*확인|승인\s*(기간|절차)/ },
  { id: "revision", label: "수정 횟수와 추가 작업 대가", why: "몇 번까지 대금 안에서 고치고, 그 뒤는 얼마인지", cite: "민법 제664조", keywords: /수정|변경\s*요청|추가\s*(작업|업무|비용|대금)/ },
  { id: "ip", label: "결과물 권리(저작권) 귀속", why: "누구 것이 되는지, 언제(대금을 다 받은 뒤) 넘어가는지", cite: "저작권법 제45조", keywords: /저작권|지식\s*재산|지적\s*재산|권리[^\n.]{0,15}귀속|소유권/, when: "creative" },
  { id: "portfolio", label: "포트폴리오 사용", why: "내 작업 실적으로 보여 줄 수 있는지", cite: "저작권법 제45조", keywords: /포트폴리오|실적\s*(으로|에)?\s*(사용|게시|공개)/, when: "creative" },
  { id: "termination", label: "계약 해지와 그때까지 한 일 정산", why: "중간에 그만두면 한 만큼 받는지", cite: "민법 제673조", keywords: /해지|해제/ },
  { id: "liability", label: "손해배상·지체상금 한도", why: "늦거나 문제가 생기면 얼마까지 물어 주는지", cite: "민법 제398조", keywords: /손해\s*배상|지체\s*상금|위약금|배상\s*책임/ },
  { id: "confidentiality", label: "비밀 유지", why: "무엇을 얼마 동안 비밀로 하는지", cite: "민법 제105조(당사자 합의)", keywords: /비밀|기밀/ },
  { id: "dispute", label: "분쟁 해결(조정·관할 법원)", why: "다툼이 생기면 어디서 푸는지", cite: "민사소송법 제29조", keywords: /분쟁|관할|조정|중재/ },
];

                              
             
                
                 
               
                  
 

export const RED_FLAGS                = [
  { id: "allRights", label: "결과물 권리를 모두 넘겨요", advice: "전부 넘기는 대가가 대금에 들어 있는지, 대금을 다 받은 뒤 넘어가는지, 포트폴리오로 써도 되는지 확인해요. 2차적저작물 작성권은 따로 적어야 넘어가요.", cite: "저작권법 제45조②", pattern: /(일체|모든)\s*(의\s*)?(권리|저작권|지식\s*재산권)|2차적\s*저작물|저작인격권[^\n.]{0,15}(행사하지|불행사)/ },
  { id: "unlimitedRevision", label: "수정 횟수에 한도가 없어요", advice: "대금 안에서 고칠 횟수(예: 2회)와 그 뒤 추가 비용을 적자고 해요.", cite: "민법 제664조", pattern: /무제한|횟수\s*(에\s*)?(제한|관계)\s*없이|(만족|요청|요구)\s*(할|하는)\s*때까지/ },
  { id: "payAfterClient", label: "맡긴 쪽이 돈을 받은 뒤에 준대요", advice: "지급일이 남의 사정에 달려 있어요. '결과물을 넘긴 날부터 ○일 안'처럼 날짜로 정하자고 해요.", cite: "민법 제665조", pattern: /(고객|발주처|클라이언트|원청|최종\s*사용자)[^\n.]{0,25}(지급|입금|결제)\s*(을|를)?\s*(받은|된|받는)\s*(후|뒤|때)|수금\s*(후|뒤)/ },
  { id: "oneSidedTermination", label: "한쪽만 언제든 해지할 수 있어요", advice: "일을 마치기 전에 그만두게 하면 맡긴 쪽이 손해를 배상해야 해요. 그때까지 한 일을 어떻게 정산하는지 적혀 있는지 봐요.", cite: "민법 제673조", pattern: /(갑|발주자|회사|위탁자)[^\n.]{0,30}(언제든지|언제든|임의로|일방적으로)[^\n.]{0,20}(해지|해제)/ },
  { id: "bigPenalty", label: "위약금·지체상금이 커요", advice: "지나친 손해배상 예정액은 법원이 줄일 수 있어요. 대금 총액을 넘지 않게 한도를 두자고 해요.", cite: "민법 제398조", pattern: /\d+\s*배|위약벌|계약\s*금액의\s*(\d{2,3})\s*%|(일체|모든)\s*손해/ },
  { id: "workerLike", label: "출퇴근·근무시간을 정해요", advice: "근무 시간·장소를 정하고 지휘·감독을 받으면 계약 이름과 상관없이 근로자일 수 있어요. 그러면 퇴직금·4대보험·최저임금이 적용돼요.", cite: "근로기준법 제2조", pattern: /출퇴근|출근|근무\s*시간|근태|복무\s*규정|지휘\s*(·|및|와)?\s*감독/ },
  { id: "nonCompete", label: "다른 일을 못 하게 막아요", advice: "기간·지역·업종이 넓고 대가가 없으면 다툼이 될 수 있어요. 범위를 좁히자고 해요.", cite: "헌법 제15조(직업의 자유)", pattern: /경업\s*금지|동종\s*(업계|업종)[^\n.]{0,25}(금지|하지\s*않|할\s*수\s*없)|경쟁\s*(업체|사)[^\n.]{0,20}(금지|하지\s*않)/ },
];

                                    
             
                
              
               
                 
                   
 

                               
             
                
                 
               
                   
 

                            
                 
                                                           
                              
                    
                   
              
                  
               
 

                                      
                   
                
                               
                             
                        
                             
                               
                        
                  
 

const sentences = (text        ) => text.split(/(?<=[.。!?])\s+|\n+/).map((x) => x.trim()).filter(Boolean);
const clip = (s        ) => (s.length > 80 ? `${s.slice(0, 80)}…` : s);
const floor10 = (n        ) => Math.floor(n / 10) * 10;

/** 계약 금액으로 받을 돈을 셈해요. 사업자가 아니면 3%+지방소득세 0.3%를 떼고, 일반과세자면 부가세 10%를 더해요. */
export function contractPay(amount        , registered = false)                   {
  const a = Math.floor(Number(amount));
  if (!Number.isFinite(a) || a <= 0) return null;
  if (registered) {
    const vat = floor10(a * 0.1);
    return { amount: a, mode: "vat", incomeTax: 0, localTax: 0, vat, receive: a + vat, note: "일반과세자는 세금계산서를 발행하고 부가세 10%를 더해 받아요. 간이과세자는 다를 수 있어요." };
  }
  const incomeTax = floor10(a * 0.03);
  const localTax = floor10(incomeTax * 0.1);
  return { amount: a, mode: "withholding", incomeTax, localTax, vat: 0, receive: a - incomeTax - localTax, note: "떼인 3.3%는 다음 해 5월 종합소득세 신고 때 정산돼요. 경비가 많으면 일부를 돌려받을 수 있어요." };
}

export function checkContract(text        , ctx                  = {}, amount         )                      {
  const body = (text ?? "").slice(0, 200_000);
  const lines = sentences(body);
  const items                      = CONTRACT_ITEMS.filter((it) => !it.when || ctx[it.when]).map((it) => {
    const hit = lines.find((l) => it.keywords.test(l));
    return { id: it.id, label: it.label, why: it.why, cite: it.cite, found: !!hit, evidence: hit ? clip(hit) : "" };
  });
  const flags                 = [];
  for (const r of RED_FLAGS) {
    const hit = lines.find((l) => r.pattern.test(l));
    if (hit) flags.push({ id: r.id, label: r.label, advice: r.advice, cite: r.cite, evidence: clip(hit) });
  }
  const within = /(\d{1,3})\s*일\s*(이내|안에|내)\s*(에\s*)?(지급|입금|결제)/.exec(body);
  const payWithinDays = within ? Number(within[1]) : null;

  const notes           = [];
  if (!body.trim()) notes.push("계약서 글을 붙여 넣어 주세요.");
  if (payWithinDays !== null && payWithinDays > 60) notes.push(`지급 기한이 ${payWithinDays}일이에요. 사업자끼리 맡기는 하도급 거래라면 결과물을 받은 날부터 60일 안에 줘야 해요(하도급법 제13조).`);
  if (!ctx.registered && /부가\s*(가치)?\s*세\s*(별도|포함)|세금\s*계산서/.test(body)) notes.push("부가세·세금계산서 문구가 있어요. 사업자등록이 없으면 보통 3.3%를 떼고 받는 방식이니, 어느 쪽인지 맞춰요.");
  if (ctx.registered && /3\.3\s*%|원천\s*징수/.test(body)) notes.push("사업자(일반과세자)인데 3.3% 원천징수 문구가 있어요. 세금계산서로 할지 3.3%로 할지 맞춰요.");
  if (!ctx.creative && /저작권|디자인|영상|원고|소스\s*코드|사진/.test(body)) notes.push("결과물에 저작권이 생기는 일로 보여요. '저작권이 생기는 결과물'을 눌러 권리·포트폴리오 항목도 점검해요.");
  notes.push("낱말이 있는지만 확인해요. 실제 조건이 나에게 맞는지는 직접 읽고, 고칠 부분은 상대와 합의해요.");
  const found = items.filter((i) => i.found).length;
  return { required: items.length, found, missing: items.filter((i) => !i.found), items, flags, payWithinDays, pay: amount === undefined ? null : contractPay(amount, ctx.registered), notes };
}

export const SAMPLE_CONTRACT = `디자인 용역 계약서
갑(○○회사)과 을(프리랜서)은 다음과 같이 용역 계약을 맺는다.
1. 업무 내용: 홈페이지 메인 화면과 상세 페이지 디자인(결과물은 PSD·PNG 파일)
2. 납기: 2026년 12월 15일까지 결과물을 넘긴다.
3. 계약 금액: 3,000,000원(3.3% 원천징수 후 지급)
4. 대금은 최종 고객사로부터 결제를 받은 후 지급한다.
5. 을은 갑이 만족할 때까지 수정한다.
6. 결과물에 대한 일체의 권리는 갑에게 귀속된다.
7. 을은 매일 오전 10시까지 갑의 사무실로 출근한다.
8. 갑은 언제든지 이 계약을 해지할 수 있다.
9. 을은 업무상 알게 된 비밀을 누설하지 않는다.`;
