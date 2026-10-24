// 2026-10-25: official minimum-wage decision table verified; uncollected
// insurance data must never silently inherit 2026 values or claim nonpublication.
export const KR_RATES_2027 = Object.freeze({
  year: 2027,
  jurisdiction: "KR",
  effectiveFrom: "2027-01-01",
  effectiveTo: "2027-12-31",
  checkedAt: "2026-10-25",
  minimumWage: Object.freeze({
    value: 10700, unit: "KRW/hour", legalStatus: "enacted",
    sourceUrl: "https://minimumwage.go.kr/minWage/policy/decisionMain.do",
    absenceState: null,
  }),
  insurance: Object.freeze({ value: null, absenceState: "not_collected", legalStatus: "unverified" }),
  freelancerProposal: Object.freeze({
    value: 0.022, unit: "ratio", legalStatus: "proposal", absenceState: null,
    sourceUrl: "https://www.nts.go.kr/nts/na/ntt/selectNttInfo.do?mi=2201&nttSn=1355351",
  }),
});
