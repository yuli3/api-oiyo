// GENERATED from tools-oiyo src/lib/kr-office-checks-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 사무소 점검 도구 2종 (2026-11-24, CHOSEUN "이대로 자율 진행": 3차 후보 2·6).
// 연관검색어: "근로계약서 미작성 벌금", "근로계약서 교부 기한", "근로계약서 양식" / "건강보험 피부양자 자격", "피부양자 등록 기간", "피부양자 누가".
// 원문(국가법령정보센터, 2026-11-24 확인):
// - 근로기준법 제17조·제18조③·제114조(법률 제21533호, 2026. 10. 8. 시행), 시행령 제8조·제8조의2, [별표 1] 상시 4명 이하 적용 규정
// - 기간제 및 단시간근로자 보호 등에 관한 법률 제17조·제24조②2 (법률 제18177호)
// - 국민건강보험법 시행규칙 제2조(보건복지부령 제1202호, 2026. 9. 28. 시행), [별표 1] 부양요건(개정 2018. 3. 6.), [별표 1의2] 소득·재산요건(개정 2025. 4. 23.)
// 소득·재산 금액 판정은 기존 건강보험료 계산기(/ko/health-insurance-calculator/)와 같은 기준이라, 여기서는 부양요건과 신고 기한을 더해요.

export const CHECKS_AS_OF = "2026-11-24";
                                            
                                                               

// ── 근로계약서 점검 ──
const LSA = "근로기준법 제17조, 시행령 제8조";
const FT = "기간제법 제17조";
                                                              
                                                                                                                                      
export const CLAUSES                                    = [
  { id: "wage", label: "임금(금액)" },
  { id: "wageCalc", label: "임금의 구성항목·계산방법·지급방법" },
  { id: "hours", label: "소정근로시간" },
  { id: "breaks", label: "휴게시간" },
  { id: "holiday", label: "휴일(주휴일)" },
  { id: "annualLeave", label: "연차 유급휴가" },
  { id: "place", label: "일하는 장소와 하는 일" },
  { id: "term", label: "근로계약기간" },
  { id: "workdays", label: "근로일과 근로일별 근로시간" },
  { id: "rules", label: "취업규칙에서 정한 사항(제93조 1~12호)" },
];

export function requiredClauses(kind            )             {
  const base             = ["wage", "wageCalc", "hours", "holiday", "annualLeave", "place", "rules"];
  if (kind === "regular") return base;
  const ft             = [...base, "term", "breaks"];
  return kind === "partTime" ? [...ft, "workdays"] : ft;
}

export function contractCheck(x                                                                                                       ) {
  const items          = [];
  const need = requiredClauses(x.kind);
  const missing = need.filter((c) => !x.written.includes(c));
  const label = (c          ) => CLAUSES.find((k) => k.id === c) .label;
  const under15 = x.kind === "partTime" && (x.weeklyHours ?? 40) < 15;
  if (missing.length === 0) items.push({ tone: "good", text: "법이 명시하라고 정한 항목이 모두 들어 있어요.", cite: x.kind === "regular" ? LSA : `${LSA}, ${FT}` });
  else items.push({ tone: "warn", text: `빠진 항목: ${missing.map(label).join(", ")}.`, cite: x.kind === "regular" ? LSA : `${LSA}, ${FT}` });
  if (!x.handedOver) items.push({ tone: "warn", text: "임금의 구성항목·계산방법·지급방법, 소정근로시간, 휴일, 연차가 적힌 서면(전자문서 포함)을 근로자에게 내줘야 해요. 계약 뒤 이 사항을 바꿀 때도 같아요.", cite: "근로기준법 제17조②" });
  else items.push({ tone: "good", text: "서면(전자문서 포함)을 근로자에게 내줬어요. 취업규칙·단체협약·서면 합의·법령으로 바뀐 경우에는 근로자가 요구하면 다시 내줘요.", cite: "근로기준법 제17조②, 시행령 제8조의2" });
  if (missing.length > 0 || !x.handedOver) {
    items.push({ tone: "warn", text: "근로조건을 명시하지 않거나 서면을 내주지 않으면 500만원 이하 벌금 대상이에요. 상시 4명 이하 사업장에도 적용돼요.", cite: "근로기준법 제114조제1호, 시행령 [별표 1]" });
    if (x.kind !== "regular") items.push({ tone: "warn", text: "기간제·단시간근로자에게 근로조건을 서면으로 명시하지 않으면 500만원 이하 과태료 대상이에요.", cite: "기간제법 제24조②2" });
  }
  if (x.small) items.push({ tone: "info", text: "상시 4명 이하 사업장에는 연차 유급휴가(제60조) 규정이 적용되지 않아요. 연차를 따로 주기로 했다면 계약서에 적어요.", cite: "근로기준법 시행령 [별표 1]" });
  if (under15) items.push({ tone: "info", text: "4주 평균 주 소정근로시간이 15시간 미만이면 주휴일(제55조)과 연차(제60조)가 적용되지 않아요.", cite: "근로기준법 제18조③" });
  items.push({ tone: "info", text: "명시된 근로조건이 사실과 다르면 근로자는 손해배상을 청구하거나 즉시 계약을 해제할 수 있어요.", cite: "근로기준법 제19조①" });
  return { asOf: CHECKS_AS_OF, need, missing, items };
}

// ── 피부양자 부양요건 ──
const NH = "국민건강보험법 시행규칙 [별표 1]";
                                                                                                                                                                       
export const RELATIONS                                    = [
  { id: "spouse", label: "배우자" }, { id: "parent", label: "부모" }, { id: "child", label: "자녀" },
  { id: "grandparent", label: "조부모·외조부모" }, { id: "grandchild", label: "손자녀·외손자녀" }, { id: "childSpouse", label: "며느리·사위(직계비속의 배우자)" },
  { id: "spouseParent", label: "배우자의 부모" }, { id: "spouseGrandparent", label: "배우자의 조부모" }, { id: "spouseChild", label: "배우자의 자녀(직계비속)" },
  { id: "sibling", label: "형제자매" },
];

/** 부양요건(별표 1). result: "yes" 인정, "no" 불인정, "cond" 조건을 확인해야 인정. */
export function supportTest(rel          , livingTogether         )                                                       {
  const unmarried = "미혼(이혼·사별 포함)이어야 하고, 이혼·사별했다면 자녀가 없거나 있어도 보수·소득이 없어야 해요";
  switch (rel) {
    case "spouse": return { result: "yes", condition: "배우자는 동거 여부와 상관없이 부양을 인정해요." };
    case "parent": return livingTogether ? { result: "yes", condition: "같이 살면 부양을 인정해요." } : { result: "cond", condition: "따로 살면, 부모와 함께 사는 형제자매가 없거나 있어도 보수·소득이 없어야 해요." };
    case "child": return livingTogether ? { result: "yes", condition: "같이 살면 부양을 인정해요." } : { result: "cond", condition: `따로 살면 ${unmarried}.` };
    case "grandparent": return livingTogether ? { result: "yes", condition: "같이 살면 부양을 인정해요." } : { result: "cond", condition: "따로 살면, 조부모와 함께 사는 직계비속이 없거나 있어도 보수·소득이 없어야 해요." };
    case "grandchild": return livingTogether ? { result: "cond", condition: "같이 살아도 부모가 없거나, 있어도 보수·소득이 없어야 해요." } : { result: "cond", condition: `따로 살면 ${unmarried.replace("이어야 하고", "이고 부모가 없어야 하고")}.` };
    case "childSpouse": return livingTogether ? { result: "yes", condition: "같이 살면 부양을 인정해요." } : { result: "no", condition: "따로 사는 며느리·사위는 부양을 인정하지 않아요." };
    case "spouseParent": return livingTogether ? { result: "yes", condition: "같이 살면 부양을 인정해요." } : { result: "cond", condition: "따로 살면, 배우자의 부모와 함께 사는 배우자의 형제자매가 없거나 있어도 보수·소득이 없어야 해요." };
    case "spouseGrandparent": return livingTogether ? { result: "yes", condition: "같이 살면 부양을 인정해요." } : { result: "cond", condition: "따로 살면, 함께 사는 직계비속이 없거나 있어도 보수·소득이 없어야 해요." };
    case "spouseChild": return livingTogether ? { result: "cond", condition: `같이 살아도 ${unmarried}.` } : { result: "no", condition: "따로 사는 배우자의 자녀는 부양을 인정하지 않아요." };
    case "sibling": return { result: "cond", condition: livingTogether ? `30세 미만, 65세 이상, 등록 장애인, 상이등급 국가유공자·보훈보상대상자 중 하나여야 하고, ${unmarried}. 부모가 없거나 있어도 보수·소득이 없어야 해요.` : `30세 미만, 65세 이상, 등록 장애인, 상이등급 국가유공자·보훈보상대상자 중 하나여야 하고, ${unmarried}. 부모와 다른 형제자매가 없거나, 있어도 부모와 함께 사는 형제자매가 보수·소득이 없어야 해요.` };
  }
}

export function dependentCheck(x                                                                                                                                                                                       ) {
  const s = supportTest(x.relation, x.livingTogether);
  const items          = [{ tone: s.result === "yes" ? "good" : s.result === "no" ? "warn" : "info", text: `부양요건: ${s.condition}`, cite: NH }];
  const incomeOk = (x.annualIncome || 0) <= 20_000_000;
  const bizOk = (x.businessIncome || 0) === 0 || (!x.bizRegistered && (x.businessIncome || 0) <= 5_000_000);
  items.push({ tone: incomeOk ? "good" : "warn", text: `연간 소득 합계 ${Math.round(x.annualIncome || 0).toLocaleString("ko-KR")}원: 2천만원 이하${incomeOk ? "예요" : "가 아니에요"}.`, cite: "시행규칙 [별표 1의2] 1호 가목" });
  items.push({ tone: bizOk ? "good" : "warn", text: bizOk ? "사업소득 요건을 충족해요(없거나, 사업자등록 없이 연 500만원 이하)." : "사업소득이 있으면 피부양자가 될 수 없어요. 다만 사업자등록이 없거나(주택임대소득이 있으면 제외), 등록 장애인·상이등급 국가유공자·보훈보상대상자이면서 사업소득 합계가 연 500만원 이하면 없는 것으로 봐요.", cite: "시행규칙 [별표 1의2] 1호 나목" });
  const isSibling = x.relation === "sibling";
  const p = x.propertyTaxBase || 0;
  const propOk = isSibling ? p <= 180_000_000 : p <= 540_000_000 || (p <= 900_000_000 && (x.annualIncome || 0) <= 10_000_000);
  items.push({ tone: propOk ? "good" : "warn", text: isSibling ? `재산세 과세표준 합 ${p.toLocaleString("ko-KR")}원: 형제자매는 1억8천만원 이하여야 해요.` : `재산세 과세표준 합 ${p.toLocaleString("ko-KR")}원: 5억4천만원 이하이거나, 9억원 이하이면서 연 소득 1천만원 이하여야 해요.`, cite: "시행규칙 [별표 1의2] 2호" });
  if (x.married) items.push({ tone: x.spouseOk === false ? "warn" : "info", text: "기혼자는 부부 모두 소득요건을 충족해야 해요.", cite: "시행규칙 [별표 1의2] 1호 라목" });
  items.push({ tone: "info", text: "직장가입자 자격 취득일(또는 자격 변동일)부터 90일 안에 신고하면 그날로 피부양자가 돼요. 90일을 넘기면 신고서를 낸 날부터예요. 공단이 자료로 확인할 수 있으면 신고서를 내지 않아도 돼요.", cite: "시행규칙 제2조②④" });
  const ok = s.result !== "no" && incomeOk && bizOk && propOk && !(x.married && x.spouseOk === false);
  return { asOf: CHECKS_AS_OF, support: s.result, ok, items };
}
