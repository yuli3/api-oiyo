// GENERATED from tools-oiyo src/lib/kr-inheritance-share-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 법정상속분과 유류분 부족액 (2026-11-20, 전문 직군 전수조사 #4). 상속인·법무사·변호사가 협의분할 전에 숫자를 맞춰 보는 용도예요.
// 같은 코드가 oiyo-kr-law-guide 스킬 scripts/guide.mjs calc inherit 로 들어가요. 어림 계산이고 법률 자문을 대신하지 않아요.
// 근거:
// - 상속 순위: 민법 제1000조(직계비속 → 직계존속 → 형제자매 → 4촌 이내 방계혈족), 제1003조(배우자는 직계비속·직계존속과 같은 순위, 없으면 단독).
// - 법정상속분: 민법 제1009조(같은 순위는 균분, 배우자는 직계비속·직계존속 상속분의 5할 가산).
// - 유류분: 민법 제1112조(직계비속·배우자 법정상속분의 1/2, 직계존속 1/3). 형제자매 유류분(제4호)은 헌법재판소 2024. 4. 25. 위헌 결정으로 효력을 잃었고,
//   2026. 3. 17. 공포·시행된 민법 개정(법률 제21454호)으로 삭제됐어요.
// - 기초재산: 민법 제1113조(상속개시 때 재산 + 증여 − 채무), 제1114조(제3자 증여는 개시 전 1년, 손해를 알고 한 증여는 그 전도). 공동상속인이 받은 특별수익은 기간 없이 더해요(대법원 95다17885).
// - 2026 개정 제1008조 단서: 피상속인을 특별히 부양하거나 재산 형성에 특별히 기여한 대가로 받은 증여·유증은 특별수익으로 보지 않아요 → 입력에서 빼고 넣어요.
// - 반환 방법: 2026 개정 제1115조(가액반환 원칙). 청구 기한: 제1117조(반환할 증여·유증을 안 날부터 1년, 상속이 개시된 때부터 10년).
export const INHERIT_AS_OF = "2026-11-20";

                                                                                              
                                                                 
                                                                                                      

const RESERVE                           = { child: 1 / 2, spouse: 1 / 2, parent: 1 / 3, sibling: 0 };
const KIND_LABEL                           = { spouse: "배우자", child: "자녀", parent: "부모", sibling: "형제자매" };
const n = (v         ) => Math.max(0, Math.floor(Number(v) || 0));
const pos = (v         ) => Math.max(0, Number(v) || 0);
const won = (v        ) => Math.round(v);

/** 상속 순위와 법정상속분. rank는 혈족 상속인 순위(0 = 혈족 없음: 배우자 단독, 또는 4촌 이내 방계혈족·국가 귀속을 따로 확인). */
export function legalHeirs(f        )                                         {
  const children = n(f.children), parents = n(f.parents), siblings = n(f.siblings);
  let rank                = 0;
  let kind                  = null;
  let count = 0;
  if (children > 0) { rank = 1; kind = "child"; count = children; }
  else if (parents > 0) { rank = 2; kind = "parent"; count = Math.min(parents, 2); }
  else if (!f.spouse && siblings > 0) { rank = 3; kind = "sibling"; count = siblings; }
  const units = count + (f.spouse && rank !== 3 ? 1.5 : 0);
  const heirs         = [];
  if (f.spouse && rank !== 3) heirs.push({ id: "spouse", kind: "spouse", label: "배우자", share: units ? 1.5 / units : 1, reserveRatio: RESERVE.spouse });
  if (kind) for (let i = 1; i <= count; i++) heirs.push({ id: `${kind}${i}`, kind, label: `${KIND_LABEL[kind]} ${i}`, share: 1 / units, reserveRatio: RESERVE[kind] });
  return { rank, heirs };
}

                            
                 
                                   
                 
                 
                                               
                                 
                            
                                    
                                                 
                      
                           
                         
                           
                 
  

                                                                                                                                                              

const addYears = (iso        , y        ) => {
  const [Y, M, D] = iso.split("-").map(Number);
  const d = new Date(Date.UTC(Y + y, M - 1, D));
  if (d.getUTCDate() !== D) d.setUTCDate(0);
  return d.toISOString().slice(0, 10);
};

/**
 * 유류분 부족액 = 유류분액 − (특별수익 + 유증 + 순상속분).
 * 남은 재산(적극재산 − 유증)은 법정상속분대로 나눈다고 봐요. 협의분할을 다르게 했으면 inherited를 바꿔 다시 봐야 해요.
 */
export function reserveShortfall(x              ) {
  const { rank, heirs } = legalHeirs(x.family);
  const gifts = x.gifts ?? {}, bequests = x.bequests ?? {};
  const heirGifts = heirs.reduce((s, h) => s + pos(gifts[h.id]), 0);
  const heirBequests = heirs.reduce((s, h) => s + pos(bequests[h.id]), 0);
  const estate = pos(x.estate), debts = pos(x.debts);
  const basis = Math.max(0, estate + heirGifts + pos(x.thirdGifts) - debts);
  const left = Math.max(0, estate - heirBequests - pos(x.thirdBequests));
  const rows               = heirs.map((h) => {
    const reserve = won(basis * h.share * h.reserveRatio);
    const gift = pos(gifts[h.id]), bequest = pos(bequests[h.id]);
    const inherited = won(left * h.share);
    const debtShare = won(debts * h.share);
    const received = gift + bequest + inherited - debtShare;
    return { ...h, reserve, gift, bequest, inherited, debtShare, received, shortfall: Math.max(0, won(reserve - received)) };
  });
  const totalShortfall = rows.reduce((s, r) => s + r.shortfall, 0);
  return {
    rank,
    basis,
    rows,
    totalShortfall,
    deadline: {
      knowRule: "반환할 증여·유증이 있다는 것을 안 날부터 1년",
      tenYear: x.death ? addYears(x.death, 10) : null,
    },
    returnRule: "2026. 3. 17. 이후 개시된 상속은 돈(가액)으로 돌려받는 것이 원칙이에요(민법 제1115조).",
  };
}

export const INHERIT_NOTE = "법정상속분과 유류분을 어림하는 계산이에요. 대습상속, 상속포기·결격·상속권 상실(민법 제1004조의2), 기여분, 재산 평가 시점은 넣지 않았어요. 다툼이 생기면 변호사와 상의해요.";
