// GENERATED from tools-oiyo src/lib/kr-auction-distribution-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 주택 경매 배당 순서와 소액임차인 최우선변제 (2026-11-20, 전문 직군 전수조사 #4). 임차인·채권자·법무사·중개사가 배당표를 미리 그려 보는 용도예요.
// 같은 코드가 oiyo-kr-law-guide 스킬 scripts/guide.mjs calc auction 으로 들어가요. 어림 계산이고 법원 배당표를 대신하지 않아요.
// 근거:
// - 최우선변제: 주택임대차보호법 제8조(경매개시결정 등기 전에 대항요건을 갖춘 소액임차인), 시행령 제10조(지역별 금액, 주택가액의 1/2 한도, 넘으면 나눠요),
//   제11조(지역별 소액임차인 보증금 범위). 표는 최선순위 담보물권 설정일 기준이에요(부칙). 2023. 2. 21. 시행 개정까지 넣었어요.
//   법원경매정보 '소액임차인 범위' 표와 대조해 쓰고, 개정되면 TABLES 맨 앞에 추가해요.
// - 같은 순위의 최우선 임금채권: 근로기준법 제38조 ②(최종 3개월분 임금·재해보상), 근로자퇴직급여 보장법 제12조 ②(최종 3년분 퇴직금).
// - 당해세: 국세기본법 제35조 ③, 지방세기본법 제71조 ⑤(그 재산에 부과된 상속세·증여세·종부세·재산세 등). 2023. 4. 1. 이후 매각결정분부터
//   확정일자가 법정기일보다 빠른 주택 임차보증금에는 당해세 배분액만큼 먼저 배당해요(국세기본법 제35조 ⑦) → 이 계산은 단순화해 당해세를 먼저 둬요.
// - 그다음은 저당권·확정일자 임차인·조세 법정기일을 날짜 순서로(같은 날이면 나눠요), 그 뒤 일반 임금·일반 채권이에요.
export const AUCTION_AS_OF = "2026-11-20";
const MAN = 10_000;

                                                                 
                                                                              
export const SMALL_TENANT_TABLES                                  = [
  {
    from: "2023-02-21",
    rows: [
      { region: "seoul", label: "서울특별시", limit: 16500 * MAN, priority: 5500 * MAN },
      { region: "overcrowded", label: "과밀억제권역(서울 제외)·세종·용인·화성·김포", limit: 14500 * MAN, priority: 4800 * MAN },
      { region: "metro", label: "광역시(과밀억제권역·군 제외)·안산·광주·파주·이천·평택", limit: 8500 * MAN, priority: 2800 * MAN },
      { region: "other", label: "그 밖의 지역", limit: 7500 * MAN, priority: 2500 * MAN },
    ],
  },
  {
    from: "2021-05-11",
    rows: [
      { region: "seoul", label: "서울특별시", limit: 15000 * MAN, priority: 5000 * MAN },
      { region: "overcrowded", label: "과밀억제권역(서울 제외)·세종·용인·화성·김포", limit: 13000 * MAN, priority: 4300 * MAN },
      { region: "metro", label: "광역시(과밀억제권역·군 제외)·안산·광주·파주·이천·평택", limit: 7000 * MAN, priority: 2300 * MAN },
      { region: "other", label: "그 밖의 지역", limit: 6000 * MAN, priority: 2000 * MAN },
    ],
  },
  {
    from: "2018-09-18",
    rows: [
      { region: "seoul", label: "서울특별시", limit: 11000 * MAN, priority: 3700 * MAN },
      { region: "overcrowded", label: "과밀억제권역(서울 제외)·세종·용인·화성", limit: 10000 * MAN, priority: 3400 * MAN },
      { region: "metro", label: "광역시(과밀억제권역·군 제외)·안산·김포·광주·파주", limit: 6000 * MAN, priority: 2000 * MAN },
      { region: "other", label: "그 밖의 지역", limit: 5000 * MAN, priority: 1700 * MAN },
    ],
  },
];

/** 기준일(최선순위 담보물권 설정일, 없으면 배당 기준일)에 맞는 표. 2018-09-18 전이면 null. */
export function smallTenantRow(region        , baseDate        ) {
  const t = SMALL_TENANT_TABLES.find((x) => baseDate >= x.from);
  if (!t) return null;
  return { from: t.from, ...t.rows.find((r) => r.region === region)  };
}

                                                                                                                                                                                        
                                                                                              

                            
               
                
                 
                                            
                    
                     
                               
                        
                      
                      
                   
                     
                   
  

                                                                                  
const pos = (v         ) => Math.max(0, Number(v) || 0);

/** 같은 순위 안에서 남은 돈을 청구액 비율로 나눠요. */
function share(avail        , items                                    , step        )                                   {
  const total = items.reduce((s, i) => s + i.claim, 0);
  if (total <= 0) return { paid: [], used: 0 };
  const ratio = Math.min(1, avail / total);
  const paid = items.map((i) => ({ step, label: i.label, claim: i.claim, paid: Math.floor(i.claim * ratio) }));
  return { paid, used: paid.reduce((s, p) => s + p.paid, 0) };
}

export function auctionDistribution(x              , today = new Date().toISOString().slice(0, 10)) {
  const base = x.baseDate || today;
  const row = smallTenantRow(x.region, base);
  let avail = Math.max(0, pos(x.sale) - pos(x.cost));
  const distributable = avail;
  const out           = [];
  const tenants = (x.tenants ?? []).map((t) => ({ ...t, deposit: pos(t.deposit), qualified: t.qualified !== false }));
  const paidTo = new Map                ();
  const add = (label        , v        ) => paidTo.set(label, (paidTo.get(label) ?? 0) + v);

  // 1순위: 소액임차인 최우선변제(1/2 한도) + 최우선 임금채권
  const small = row ? tenants.filter((t) => t.qualified && t.deposit > 0 && t.deposit <= row.limit).map((t) => ({ label: t.label, claim: Math.min(t.deposit, row.priority) })) : [];
  const halfCap = Math.floor(distributable / 2);
  const smallTotal = small.reduce((s, i) => s + i.claim, 0);
  const capped = smallTotal > halfCap ? share(halfCap, small, "").paid.map((p) => ({ label: p.label, claim: p.paid })) : small;
  const first = share(avail, [...capped, ...(pos(x.wagePriority) ? [{ label: "최우선 임금·퇴직금", claim: pos(x.wagePriority) }] : [])], "최우선변제");
  first.paid.forEach((p) => { out.push(p); add(p.label, p.paid); });
  avail -= first.used;

  // 2순위: 당해세
  if (pos(x.currentTax)) {
    const r = share(avail, [{ label: "당해세", claim: pos(x.currentTax) }], "당해세");
    out.push(...r.paid); avail -= r.used;
  }

  // 3순위: 날짜 순서(저당권·확정일자 임차인·조세 법정기일)
  const dated = [
    ...(x.claims ?? []).filter((c) => c.date && pos(c.amount)).map((c) => ({ label: c.label, claim: pos(c.amount), date: c.date })),
    ...tenants.filter((t) => t.date).map((t) => ({ label: t.label, claim: Math.max(0, t.deposit - (paidTo.get(t.label) ?? 0)), date: t.date  })).filter((t) => t.claim > 0),
  ].sort((a, b) => a.date.localeCompare(b.date));
  for (let i = 0; i < dated.length; ) {
    const same = dated.filter((d) => d.date === dated[i].date);
    const r = share(avail, same, `${dated[i].date} 순위`);
    r.paid.forEach((p) => { out.push(p); add(p.label, p.paid); });
    avail -= r.used;
    i += same.length;
  }

  // 4순위: 일반 임금, 5순위: 일반 채권(확정일자 없는 임차인 남은 보증금 포함)
  if (pos(x.wageOther)) {
    const r = share(avail, [{ label: "일반 임금채권", claim: pos(x.wageOther) }], "일반 임금");
    out.push(...r.paid); avail -= r.used;
  }
  const rest = [
    ...tenants.filter((t) => !t.date).map((t) => ({ label: t.label, claim: Math.max(0, t.deposit - (paidTo.get(t.label) ?? 0)) })).filter((t) => t.claim > 0),
    ...(pos(x.general) ? [{ label: "일반 채권", claim: pos(x.general) }] : []),
  ];
  const g = share(avail, rest, "일반 채권");
  g.paid.forEach((p) => { out.push(p); add(p.label, p.paid); });
  avail -= g.used;

  return {
    baseDate: base,
    table: row,
    tableMissing: !row,
    distributable,
    halfCap,
    smallCapped: smallTotal > halfCap,
    payouts: out,
    tenants: tenants.map((t) => {
      const paid = paidTo.get(t.label) ?? 0;
      return { label: t.label, deposit: t.deposit, small: !!row && t.qualified && t.deposit <= row.limit, paid, unpaid: Math.max(0, t.deposit - paid) };
    }),
    leftover: avail,
  };
}

export const REGION_LABEL                         = { seoul: "서울", overcrowded: "과밀억제권역·세종·용인·화성·김포", metro: "광역시·안산·광주·파주·이천·평택", other: "그 밖의 지역" };
export const AUCTION_NOTE = "배당 순서를 단순화한 어림 계산이에요. 당해세와 임차보증금 특례, 조세와 저당권·임금의 순환 관계, 대항력 있는 임차인의 인수, 배당요구 여부는 법원 배당표에서 달라질 수 있어요. 소액임차인도 배당요구 종기까지 배당요구를 해야 받아요.";
