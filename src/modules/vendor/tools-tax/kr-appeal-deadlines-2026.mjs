// GENERATED from tools-oiyo src/lib/kr-appeal-deadlines-2026.ts by scripts/sync-tools-tax.mjs. Do not edit here.
// 불복·이의·청구 기한 한곳에 (2026-11-20, 전문 직군 전수조사 1번). 법령 길잡이 분야마다 문장으로 흩어져 있던
// 조세불복·관세 불복·수용 재결 이의·공시가격 이의·특허 거절 불복·행정심판·복지 이의·의료분쟁·재산분할 같은 기한을
// 같은 엔진(kr-expert-guide-2026.ts dueDate: 초일 불산입, 말일이 휴일이면 다음 날, 국세는 근로자의 날도)으로 계산해요.
// 새 법령 숫자를 만들지 않고, 각 분야 주제의 DeadlineRule을 그대로 모아요. 분야가 늘면 자동으로 따라와요.
import { DOMAIN_LABEL, TOPICS, daysBetween, dueDate,                                  } from "./kr-expert-guide-2026.mjs";

export const APPEAL_AS_OF = "2026-11-20";
const KIND = /구제|이의|심판|심사|불복|재심사|경정청구|소송|조정|청구/;

                                                                                                                                                         

export function periodText(r                                                                  )         {
  const parts = [r.years ? `${r.years}년` : "", r.months ? `${r.months}개월` : "", r.days ? `${r.days}일` : ""].filter(Boolean).join(" ");
  return (r.fromMonthEnd ? "그달 말일부터 " : "") + parts;
}

/** 시간 단위·"그 전까지" 기한을 뺀, 불복·이의·청구 성격의 기한 전부. 같은 분야·같은 이름·같은 기간은 한 번만. */
export const APPEAL_RULES               = (() => {
  const seen = new Set        ();
  const out               = [];
  for (const t of TOPICS) {
    for (const r of t.deadlines) {
      if (r.hours || (r.months ?? 0) < 0 || r.days === 0 || !KIND.test(r.label)) continue;
      const period = periodText(r);
      const dedupe = `${t.domain}|${r.label}|${period}`;
      if (seen.has(dedupe)) continue;
      seen.add(dedupe);
      out.push({ key: `${t.id}:${r.id}`, domain: t.domain, area: DOMAIN_LABEL[t.domain].area, topic: t.label, label: r.label, period, cite: r.cite, rule: r });
    }
  }
  return out;
})();

export function appealDue(key        , from        , today         ) {
  const a = APPEAL_RULES.find((x) => x.key === key);
  if (!a) return null;
  const d = dueDate(a.rule, from);
  if (!d) return null;
  return { ...a, rule: undefined, ...d, daysLeft: today ? daysBetween(today, d.due) : undefined };
}

/** 같은 날 받은 통지로 계산할 수 있는 기한 전부(분야를 고르면 그 분야만), 빠른 순. */
export function appealsFrom(from        , today         , domain           ) {
  return APPEAL_RULES.filter((a) => !domain || a.domain === domain)
    .map((a) => appealDue(a.key, from, today) )
    .filter(Boolean)
    .sort((x, y) => (x.due < y.due ? -1 : x.due > y.due ? 1 : 0));
}

export const APPEAL_NOTE = "기한은 처분·결정을 안 날(통지를 받은 날) 다음 날부터 세고, 마지막 날이 토·일·공휴일이면 다음 날까지예요. 처분서에 적힌 안내(기간·제출처)가 이 표와 다르면 처분서를 먼저 따르고, 기한이 가까우면 일단 접수부터 해요.";
