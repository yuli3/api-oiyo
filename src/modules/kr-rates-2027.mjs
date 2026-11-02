// 2026-10-25: official minimum-wage decision table verified; uncollected
// insurance data must never silently inherit 2026 values or claim nonpublication.
export const KR_RATES_2027 = Object.freeze({
  year: 2027,
  jurisdiction: "KR",
  effectiveFrom: "2027-01-01",
  effectiveTo: "2027-12-31",
  checkedAt: "2026-11-01",
  minimumWage: Object.freeze({
    value: 10700, unit: "KRW/hour", legalStatus: "enacted",
    sourceUrl: "https://minimumwage.go.kr/minWage/policy/decisionMain.do",
    absenceState: null,
  }),
  insurance: Object.freeze({ value: null, absenceState: "not_collected", legalStatus: "unverified" }),
  // 2026-10-29: partial source evidence is not a complete payroll model. Keep
  // the legacy insurance aggregate unknown until every required field is checked.
  insuranceEvidence: Object.freeze({
    checkedAt: "2026-11-02", complete: false,
    nationalPension: Object.freeze({
      total: 0.10, employee: 0.05, employer: 0.05, unit: "ratio",
      effectiveFrom: "2027-01-01", status: "official_guidance",
      sourceUrl: "https://ma.nps.or.kr/pnsinfo/ntpsklg/getOHAF0016M0.do?menuId=MN24001108",
    }),
    healthInsurance: Object.freeze({
      total: 0.0719, unit: "ratio", status: "decision_announced",
      sourceDate: "2026-09-08",
      sourceUrl: "https://www.mohw.go.kr/gallery.es?act=view&bid=0003&list_no=380402&mid=a10606030000",
    }),
    // WHY 2026-11-01: committee announcement is evidence, not implementing-law verification.
    longTermCare: Object.freeze({
      incomeRatio: 0.009994, healthPremiumRatio: 0.1390, unit: "ratio",
      status: "decision_announced", sourceDate: "2026-10-30",
      sourceUrl: "https://www.korea.kr/briefing/pressReleaseView.do?newsId=156787374",
      implementingRuleVerified: false,
    }),
    // WHY 2026-11-02: MOEL reported the 1.8%->2.0% unemployment-account rise to the
    // Employment Insurance Committee for 2027; the decree amendment is still pending.
    employmentInsurance: Object.freeze({
      unemploymentAccountTotal: 0.020, employee: 0.010, employer: 0.010, unit: "ratio",
      effectiveFrom: "2027-01-01", status: "committee_deliberated", sourceDate: "2026-09-01",
      sourceUrl: "https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=19866",
      implementingRuleVerified: false,
      excludes: "employer-only job-stability/vocational-training rates (size-based) are not covered",
    }),
    unresolved: Object.freeze(["healthImplementingRule", "longTermCareImplementingRule", "employmentInsuranceImplementingRule", "healthBounds", "pensionBoundsFromJuly2027"]),
  }),
  freelancerProposal: Object.freeze({
    value: 0.022, unit: "ratio", legalStatus: "proposal", absenceState: null,
    sourceUrl: "https://www.moleg.go.kr/lawinfo/makingInfo.mo?lawSeq=87942&lawType=TYPE5",
    checkedAt: "2026-11-01", effectiveFromIfEnacted: "2027-01-01",
    scope: "qualifying personal-service business income; excludes year-end-settled business income and contracted foreign professional athletes",
  }),
});
