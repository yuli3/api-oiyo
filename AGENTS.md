# api.oiyo.net B2A Gateway

## 역할 및 설계 계약
- LLM 토큰 0개, 외부 유료 API 의존 0개의 결정적 연산 전용 Cloudflare Worker Gateway.
- B2A (Business-to-Agent) 아키텍처: AI 에이전트 및 웹 클라이언트가 직접 호출 가능한 구조화된 OpenAPI 3.0 엔드포인트 제공.

## 엔드포인트
- `GET /health`: 상태 체크
- `GET /docs`: 대화형 OpenAPI 명세 문서 (Scalar UI)
- `GET /openapi.json`: OpenAPI 3.0 스키마 명세
- `GET /robots.txt`: 검색엔진 크롤러 정책
- `GET /sitemap.xml`: XML 사이트맵
- `GET /llms.txt`: AI 에이전트 인터페이스 명세
- `GET /ads.txt`: Google AdSense 게시자 인증
- `GET /favicon.svg`: SVG 파비콘
- `GET /naverfeb1d8514db116d06b5d11e882ee9d1c.html`: 네이버 서치어드바이저 소유권 확인
- `GET /0f2131ccadd8edf19887c99ca7aa9f4795a4cae4.txt`: Bing IndexNow 소유권 확인
- `GET /v1/kr/calendar/holidays`: 법정공휴일 및 대체공휴일
- `GET /v1/kr/calendar/is-business-day`: 영업일/휴일 판정
- `POST /v1/astrology/saju/calculate`: 음양오행 및 사주 원국 계산
- `GET /v1/labor/kr/unemployment-benefits`: 고용보험 구직급여(실업급여) 모의계산
- `GET /v1/labor/kr/weekly-allowance`: 주휴수당 계산
- `GET /v1/labor/kr/overtime-pay`: 연장·야간·휴일 가산수당 계산
- `GET /v1/labor/kr/net-salary`: 2026 실수령액 및 4대보험·근로소득세 계산
- `GET /v1/labor/kr/severance-pay`: 법정 퇴직금 및 계속근로일수 계산
- `GET /v1/labor/kr/annual-leave`: 근속연수별 법정 연차일수 및 미사용 연차수당 계산
- `GET /v1/military/kr/service-calculator`: 군 복무기간 및 계급 진급일 계산
- `GET /v1/energy/kr/gas-bill`: 도시가스 요금 계산
- `GET /v1/math/units/convert`: 단위 변환 (길이, 넓이, 무게, 온도)
- `POST /v1/tax/kr/year-end-settlement`, `GET /v1/tax/kr/freelancer-income-tax`, `GET /v1/tax/kr/acquisition-tax`, `GET /v1/tax/kr/property-tax`: 개인 세금(연말정산·3.3% 종소세·취득세·재산세). MCP 도구로도 노출

## 개인 세금 계산 정본 (2026-11-09)
- 연말정산·3.3%·취득세·재산세 공식은 tools-oiyo `src/lib/kr-*.ts`가 정본이다. 이 저장소는 `node scripts/sync-tools-tax.mjs`(Node 22.13+)로 만든 `src/modules/vendor/tools-tax/*.mjs` 복사본만 쓴다. 손으로 고치지 않는다.
- tools 세금 라이브러리를 고치면 이 저장소에서 sync를 다시 돌리고 같은 내용의 PR을 연다. `test/kr-personal-tax.test.mjs`가 로컬 tools 체크아웃과 다르면 실패한다(CI에는 체크아웃이 없어 skip).
- `src/modules/kr-personal-tax.mjs`는 입력 확인과 응답 모양만 맡는다. 모르는 입력·지원하지 않는 연도는 추정하지 않고 400으로 거부하고, 결과에 `basis`(근거 조문)·`notCovered`·`disclaimer`를 붙인다.
- 예전 `/v1/real-estate/acquisition-tax`·`/v1/real-estate/property-tax`(재산세 부분)·`/v1/tax/freelancer`는 2026-11-09부터 같은 tools 라이브러리를 쓰는 호환용 경로다(응답 필드 유지, `deprecated: true`, `replacement`). 새 기능은 `/v1/tax/kr/*`에만 넣는다. 종합부동산세 계산은 아직 예전 property-tax 경로에만 있다.

## 세무·회계 실무 도구 (2026-11-14)
- `POST|GET /v1/tax/kr/unlisted-share-valuation`, `/v1/tax/kr/family-business-inheritance`, `/v1/tax/kr/incorporation-conversion`, `/v1/finance/dcf-valuation`. MCP 도구 `value_kr_unlisted_shares`·`calculate_kr_family_business_deduction`·`calculate_kr_incorporation_conversion`·`calculate_dcf_valuation`.
- 공식 정본은 tools-oiyo `src/lib/kr-advisory-2026.ts`(sync 대상에 추가). `src/modules/kr-advisory.mjs`는 입력 확인·응답 모양만 맡고 개인 세금과 같은 규칙(모르는 입력 400, basis·notCovered·disclaimer)을 따른다.
- 국회를 통과하지 않은 세법개정안(최대주주 할증 폐지, 2026-08 가업상속 개편)은 넣지 않는다. 통과되면 tools lib부터 고친다.
- 2026-11-16 법령 길잡이 3종(MCP `start_kr_law_intake`, `search_kr_statutes`, `get_kr_professional_scope`, REST `/v1/law/kr/*`)은 tools-oiyo `src/lib/kr-expert-guide-2026.ts`가 정본(sync 대상, kr-legal-2026·kr-business-day 함께). 스키마 `src/modules/law-guide-spec.mjs`. 자격 명칭(세무사·노무사 등)을 도구 설명·응답에서 자칭하지 않아요(유사명칭 금지, 세무사법 제20조③). 스킬은 tools-oiyo `skills/oiyo-kr-law-guide`.
- 같은 공식을 쓰는 Claude 스킬은 tools-oiyo `skills/kr-tax-advisor`(다운로드 tools.oiyo.net/downloads/oiyo-kr-tax-advisor-skill.zip).

## 경영 도구 (2026-11-15)
- `POST /v1/biz/decision-tree`·`critical-path`·`swot`·`bcg`·`positioning-map`·`unit-economics-runway`·`priorities`, `GET /v1/tax/kr/business-calendar`. MCP 도구 8개(`src/modules/biz-tools-spec.mjs`의 `BIZ_TOOLS`).
- 공식 정본은 tools-oiyo `src/lib/biz-strategy.ts`·`biz-checklist.ts`·`kr-business-day.ts`(sync 대상). `src/modules/biz-strategy.mjs`는 입력 확인·응답 모양만 맡는다. 입력 확인은 도구 스키마(`BIZ_TOOLS`) 하나로 REST·MCP가 같이 쓰고, 모르는 입력은 400으로 거부한다.
- 배열·객체 입력이 있어 `mcp.mjs`의 스키마 변환이 재귀다. 속성 없는 object(의사결정 트리)는 MCP에서 통과시키고 REST 검사(`readTree`, 12단계·200노드 한도)가 막는다.
- 2026-11-16 운영 문제 8유형(`/v1/biz/campaign-supply` 등 8개, MCP `plan_campaign_supply`…`evaluate_acquisition`)은 tools-oiyo `src/lib/biz-ops.ts`가 정본(sync 대상). 응답에 `note`(영향 부서·사람 승인 지점)와 disclaimer를 붙인다.
- 2026-11-16 생활 지원금·노동권 6종(`/v1/benefits/kr/*`, `/v1/labor/kr/wage-guarantee` 등, MCP `calculate_kr_work_child_incentive`…`compare_kr_retirement_pension`)은 tools-oiyo `src/lib/kr-welfare-2026.ts`가 정본(sync 대상). 스키마는 `src/modules/welfare-tools-spec.mjs`, 처리는 `biz-strategy.mjs`. 응답에 `basis`(조문)·`apply`(신청 방법)·`page`(웹 도구)가 있어요.
- 2026-11-16 2차 4종(MCP `calculate_kr_ordinary_wage`, `check_kr_fixed_overtime_pay`, `calculate_kr_comprehensive_real_estate_tax`, `calculate_kr_housing_rental_income_tax`)과 3차 `calculate_kr_long_term_care_copay`는 같은 스키마 파일에 있고, 종부세·임대소득은 tools-oiyo `src/lib/kr-home-tax-2026.ts`가 정본이에요.
- 2026-11-16 4차 `check_kr_dependent_deduction`(`/v1/tax/kr/dependent-deduction`)과 `calculate_kr_stock_major_shareholder_tax`(`/v1/tax/kr/stock-major-shareholder`)는 tools-oiyo `src/lib/kr-household-tax-2026.ts`가 정본(sync 대상, 연말정산은 kr-year-end-2026 그대로 호출). 스키마는 같은 welfare-tools-spec.mjs.
- 2026-11-16 노동권 묶음 A: `calculate_kr_dismissal_notice_pay`, `calculate_kr_shutdown_allowance`, `calculate_kr_reduced_hours_childcare_pay`, `check_kr_probation_minimum_wage`, `plan_kr_annual_leave_promotion`도 tools-oiyo `src/lib/kr-welfare-2026.ts`가 정본이에요(sync 대상). 육아기 단축 상한(250만·160만)은 2027 시행령 개정 때 tools 쪽부터 고쳐요. 자진퇴사 점검(`check_kr_voluntary_quit_unemployment`)과 하도급 직접 지급(`check_kr_subcontract_direct_payment`)도 같은 파일이 정본이에요.
- 2026-11-16 B묶음 1차: `check_kr_family_loan_interest`, `check_kr_parent_house_free_use`, `check_kr_family_low_price_sale`, `check_kr_commercial_rent_increase`는 tools-oiyo `src/lib/kr-household-tax-2026.ts`가 정본이에요(sync 대상). 4.6%·2%·기준금리 기본값(3.0%)이 바뀌면 tools 쪽부터 고쳐요. B묶음 2차 `calculate_kr_sme_youth_tax_reduction`, `calculate_kr_yellow_umbrella_deduction`, `compare_kr_general_vs_simplified_vat`, 3차 `calculate_kr_business_car_expense`, `compare_kr_overseas_stock_vs_etf_tax`, 4차 `check_kr_officetel_house_count`, `compare_kr_ticket_vs_presale_tax`, `compare_kr_inherited_house_valuation`, `plan_kr_inheritance_gift_filing_deadline`도 같은 파일이 정본이에요(4차는 kr-real-estate-tax 재사용). C묶음 `check_kr_youth_rent_support`, `find_kr_policy_housing_loans`, `check_kr_special_supply`는 tools-oiyo `src/lib/kr-welfare-2026.ts`가 정본(기준중위소득·기금 한도는 매년 tools 쪽부터 고쳐요).
- 같은 공식을 쓰는 Claude 스킬은 tools-oiyo `skills/oiyo-business-strategist`(다운로드 tools.oiyo.net/downloads/oiyo-business-strategist-skill.zip).

## MCP Registry (2026-11-09)
- `server.json`이 공식 MCP Registry 등록 정보다(`io.github.yuli3/oiyo-calculations`, remote `https://api-oiyo.861106.workers.dev/mcp` 우선, `https://api.oiyo.net/mcp` 보조). `version`은 `tools-spec.mjs`의 `version`과 같이 올린다(테스트가 확인).
- main에서 server.json이 바뀌면 `.github/workflows/publish-mcp-registry.yml`이 GitHub OIDC로 게시한다. 수동 실행도 가능.

## MCP 출처 링크·등재 (2026-11-12, 파일럿 #1)
- 성공한 MCP 도구 결과에는 `sourcePage`(tools.oiyo.net/ko 또는 oiyo.net/ko 계산기 페이지 + `utm_source=mcp&utm_medium=<등재처|클라이언트>&utm_campaign=mcp-pilot&utm_content=<도구>`)를 붙인다. 정본은 `src/modules/source-pages.mjs`. 새 도구를 추가하면 매핑도 추가한다(테스트가 누락을 막는다). REST 응답 필드는 그대로 둔다.
- 등재처 URL은 `/mcp?ref=<등재처>`로 단다(허용 목록만 신뢰). 사용량 점의 blob 7이 이 값이다. 입력값은 남기지 않는다.
- `README.md`(영문 연결 안내), `.mcp.json`(cursor.directory), `glama.json`(Glama 소유권)은 등재 메타데이터다.

## 2026 요율 단일 정본 (2026-10-17)
- 급여·4대보험·구직급여·육아휴직·지역건보 요율과 공식은 `src/modules/kr-rates-2026.mjs` 하나에만 둔다. labor·insurance 모듈에 숫자 요율을 새로 쓰지 않는다.
- tools는 같은 파일을 `src/lib/kr-rates-2026.mjs`로 바이트 동일하게 복사해 쓴다(tools `npm run sync:kr-rates`). 이 파일을 고치면 tools에도 같은 PR을 연다.
- blog `src/lib/kr-payroll-2026.ts`와의 값 일치는 `test/kr-rates-2026.test.mjs`가 확인한다(blog 체크아웃이 없으면 live 비교만 skip, 고정 스냅샷은 항상 실행).
- 근로소득세는 국세청 간이세액표가 아닌 연간 환산 **추정**이다. 응답 `taxes.isEstimate=true`를 유지한다.
- 상속·증여세(세율·공제·할증·신고세액공제)와 신용카드 등 소득공제(공제율·자녀 수별 한도) 값과 계산식도 같은 파일(`inheritanceGift`, `cardDeduction`, `inheritanceGiftTax2026`, `cardDeduction2026`)에만 둔다. finance.mjs는 응답 모양만 맞춘다(2026-10-17).

## 색인 정책 (2026-10-17)
- 색인 대상은 `/docs` 하나다. sitemap에는 `/docs`만 둔다. `/`(HTML·JSON)는 noindex.
- `/openapi.json`·`/tools.json`·`/llms.txt`·`/llms-full.txt`는 robots Allow + `X-Robots-Tag: noindex`. `/v1/`는 Disallow 유지.

## 검증 명령
- 테스트: `npm test`
- 문법 검사: `npm run check`

## 전문 직군 전수조사 계산 20종 + 국세청 주제 5종 (2026-11-21)
- MCP `calculate_kr_corporate_tax`, `calculate_kr_tax_penalty`, `find_kr_appeal_deadlines`, `calculate_kr_inheritance_reserve`, `simulate_kr_auction_distribution`, `calculate_kr_customs_practice`, `check_kr_workforce`, `build_accounting_schedule`, `calculate_kr_license_points`, `estimate_kr_appraisal_compensation`, `plan_kr_ip_deadlines`, `calculate_kr_vat_credits`, `check_kr_franchise_contract`, `check_kr_apartment_management`. 스키마 `src/modules/pro-gap-spec.mjs`, 처리 `src/modules/pro-gap.mjs`(여러 계산을 묶은 도구는 `mode`로 고르고, 모드에 필요한 입력이 없으면 400).
- 공식 정본은 tools-oiyo `src/lib/kr-corp-tax-2026.ts` … `kr-franchise-housing-2026.ts`(sync 대상 14개, tools #120~#128). 세율·표가 바뀌면 tools 쪽부터 고치고 sync해요. 2027 부가세 정부안(카드 공제 1.2%·500만 원)은 국회 통과 전이라 넣지 않았어요.
- 1.33.0 추가 6종: `calculate_kr_deferred_tax`, `plan_kr_audit_materiality_sample`(결산 계산기 페이지), `calculate_kr_injury_disability_benefit`, `check_kr_court_deposit`, `estimate_kr_self_registration_cost`, `calculate_kr_f27_points`. 정본 tools `kr-audit-deferred-2026`·`kr-injury-disability-2026`·`kr-court-deposit-2026`·`kr-self-registration-2026`·`kr-f27-points-2026`(tools #130). 공탁 이자 일수 계산은 어림이라고 응답 note에 밝혀요.
- 1.34.0 국세청 주제 5종: `check_kr_withholding_statement`, `calculate_kr_student_loan_repayment`, `compare_kr_bookkeeping_vs_estimate`, `check_kr_exempt_business_report`, `compare_kr_private_pension_tax`. 정본 tools `kr-nts-pack-2026`(tools #132, 법령 원문 2026-11-21 확인). 학자금 상환기준소득은 학기별 교육부 고시라 바뀌면 tools부터 고쳐요.
- 1.38.0 각국 현지판 3차 프랑스 6종: `get_fr_tax_calendar`, `calculate_fr_micro_entrepreneur`, `check_fr_vat_franchise`, `calculate_fr_tax_penalty`, `calculate_fr_claim_deadline`, `calculate_fr_depreciation`. 정본 tools `fr-tax-pack-2026`(service-public·BOFiP 2026-11-21 대조). 결과 페이지는 /fr/. 2026 소득분 barème(2027 예산법)·RSD 개편 나오면 tools부터 고쳐요.
- 1.39.0 각국 현지판 4차 스페인 7종: `get_es_tax_calendar`, `calculate_es_autonomo_quota`, `calculate_es_vat`, `calculate_es_late_filing_surcharge`, `calculate_es_tax_sanction`, `calculate_es_appeal_deadlines`, `calculate_es_depreciation`. 정본 tools `es-tax-pack-2026`(BOE·AEAT·Seguridad Social 2026-11-21 대조). 결과 페이지는 /es/. 2026 tarifa plana·interés de demora·2027 달력 확인되면 tools부터 고쳐요.
- 1.40.0 각국 현지판 5차 중국 8종: `get_cn_tax_calendar`, `calculate_cn_business_income_tax`, `calculate_cn_comprehensive_income_tax`, `calculate_cn_small_profit_cit`, `check_cn_small_scale_vat`, `calculate_cn_late_payment_surcharge`, `calculate_cn_tax_appeal_deadlines`, `calculate_cn_depreciation`. 정본 tools `cn-tax-pack-2026`(국가세무총국 법규고 2026-11-21 대조). 결과 페이지는 /zh/. 2027年度申报纳税期限 공표되면 tools부터 고쳐요.
- 1.41.0 각국 현지판 2차 영국 7종: `get_uk_tax_calendar`, `calculate_uk_self_employed_tax`, `check_uk_vat_registration`, `calculate_uk_sa_penalty`, `calculate_uk_late_payment_interest`, `calculate_uk_tax_appeal_deadlines`, `calculate_uk_capital_allowances`. 정본 tools `uk-tax-pack-2026`(gov.uk·legislation.gov.uk 2026-11-21 대조). 결과 페이지는 /en/(en-GB). 스코틀랜드 세율·MTD 3·4분기 날짜·2026-01-09 이전 이자율은 계산하지 않아요.
- 1.42.0 각국 현지판 2차 대만 6종: `get_tw_tax_calendar`, `calculate_tw_income_tax`, `check_tw_business_tax`, `calculate_tw_late_fee`, `calculate_tw_tax_appeal_deadlines`, `calculate_tw_depreciation`. 정본 tools `tw-tax-pack-2026`(全國法規資料庫·財政部 2026-11-21 대조). 결과 페이지는 /zh/(zh-Hant-TW). 115年度 基本生活費가 공고되면 tools부터 고쳐요.
- 1.53.1 (같은 PR) 노동 팩 동기화: JP 給付制限 2025-04~, FR ARE 2025-04~, TW 調解 창구.
- 1.53.1 `calculate_de_income_tax`에 Solidaritätszuschlag(SolZG §§3·4·6) 추가.
- 1.53.0 독일·싱가포르 첫 묶음 6종 `calculate_de_income_tax`·`calculate_de_notice_period`·`check_de_minimum_wage`·`check_de_einvoicing`·`calculate_sg_cpf`·`calculate_sg_notice_period` (`/v1/de/*`, `/v1/sg/*`). 정본 tools `world-de-sg-pack-2026`(tools #162). 소스 페이지 테스트에 /de/ 허용.
- 1.52.0 개인 세법상 거주자 판정 6종 `check_us_residency`·`check_uk_residency`·`check_es_residency`·`check_tw_residency`·`check_jp_residency`·`check_fr_residency` (`/v1/residency/<cc>`). 정본 tools `world-tax-residency-2026`(tools #161). JP·FR은 요건 확인만.
- 1.51.0 전자세금계산서·인보이스 일정 3종 `check_fr_einvoicing`·`calculate_jp_invoice_transition`·`check_es_verifactu` (`/v1/einvoice/<cc>`). 정본 tools `world-einvoice-pack-2026`(tools #160).
- 1.50.0 회사 연간 일정 4종 `check_jp_company_calendar`·`check_uk_company_calendar`·`check_us_company_calendar`·`check_fr_company_calendar` (`/v1/company-calendar/<cc>`). 정본 tools `world-company-calendar-2026`(tools #159). 길잡이 tax 영역에 연결.
- 1.49.0 고용주 급여 비용 4종 `calculate_jp_employer_cost`·`calculate_uk_employer_cost`·`calculate_us_employer_cost`·`calculate_es_employer_cost` (`/v1/employer/<cc>`). 정본 tools `world-employer-cost-pack-2026`(tools #158). 길잡이 labor 영역에 연결.
- 1.48.0 소멸시효·소액소송 6종 `check_jp_limitation_small_claims`·`check_uk_limitation_small_claims`·`check_ca_limitation_small_claims`·`check_fr_prescription`·`check_tw_limitation_small_claims`·`check_cn_small_claims` (`/v1/claims/<cc>`). 정본 tools `world-limitation-pack-2026`(tools #157). 길잡이에 claims 영역.
- 1.47.0 상속·증여 5종 `calculate_jp_inheritance_gift_tax`·`calculate_uk_inheritance_tax`·`check_us_estate_gift_exclusion`·`calculate_fr_droits_succession`·`check_tw_estate_tax_deadline` (`/v1/inheritance/<cc>`): 기본 공제·추정 세액·신고/납부 기한. 정본 tools `world-inheritance-pack-2026`(tools #156).
- 1.46.0 청약철회 7종 `check_jp_cooling_off`·`check_uk_cancellation_period`·`check_fr_retractation`·`check_es_desistimiento`·`check_cn_7day_return`·`check_tw_7day_cancellation`·`check_us_cooling_off` (`/v1/consumer/<cc>`): 마지막 철회일·환불 기한·제외 품목. 정본 tools `world-consumer-pack-2026`(tools #155). 길잡이에 consumer 영역 추가.
- 1.45.0 각국 길잡이 `start_world_law_intake` (`/v1/law/world/intake`): 질문(현지어)을 7곳의 현지 도구·무료 창구·세무 자격사 범위로 안내, 계산 아님. 정본 tools `world-law-intake-2026`(tools #154). 노동 7종 동기화: 프랑스 해고 예고, 중국 연차·중재 기한(tools #153).
- 1.44.0 각국 임대차 7곳: `check_jp_rental_deposit_notice`, `check_uk_tenancy_deposit_notice`, `check_us_security_deposit_notice`(CA·NY), `check_fr_deposit_notice_irl`, `check_es_fianza_preaviso`, `check_cn_rental_contract_deposit`, `check_tw_rental_deposit_termination` (`/v1/tenancy/<cc>`). 정본 tools `world-tenancy-pack-2026`(tools #150, 2026-11-21 공식 원문 대조). 미확인 값(프랑스 11-24 이후 임대료 상한, 스페인 RDL 29/2026 범위 등)은 계산하지 않아요. 같은 판에서 노동 7종의 대만·중국 최저임금을 동기화했어요(tools #151). 법률 자문·대리 없음.
- 1.43.0 각국 현지판 3차 노동 7종: `calculate_jp_labor_exit`, `calculate_uk_labor_exit`, `check_us_labor_rights`, `calculate_fr_labor_exit`, `calculate_es_labor_exit`, `calculate_cn_labor_exit`, `calculate_tw_labor_exit` (`/v1/labor/<cc>`). 정본 tools `world-labor-pack-2026`(e-Gov·gov.uk·DOL·service-public·BOE·flk·全國法規資料庫 2026-11-21 대조). 결과 페이지는 각국 언어. 미확인 값은 계산하지 않고 items에 표시해요. 법률 자문·대리 없음.
- 1.37.0 각국 현지판 2차 미국 6종: `get_us_tax_calendar`, `calculate_us_self_employment_tax`, `calculate_us_estimated_tax`, `calculate_us_irs_penalty`, `calculate_us_tax_appeal_deadlines`, `calculate_us_depreciation`. 정본 tools `us-tax-pack-2026`(tools #137, IRS·eCFR 2026-11-21 대조). 결과 페이지는 /en/. 2027 분기 이자율·2026 승용차 한도 공표되면 tools부터 고쳐요.
- 1.36.0 각국 세무·회계 현지판 1차 일본 6종: `get_jp_tax_calendar`, `calculate_jp_blue_return_deduction`, `check_jp_consumption_tax`, `calculate_jp_penalty_tax`, `calculate_jp_appeal_deadlines`, `calculate_jp_depreciation` (`country-tax-spec.mjs`/`country-tax.mjs`). 정본 tools `jp-tax-pack-2026`(tools #136, e-Gov·국세청 2026-11-21 대조). 결과 페이지는 /ja/. 미국·프랑스·스페인·중국도 같은 두 파일에 `*_us_*`처럼 더해요. 개별 세무상담·신고서 작성은 하지 않아요(税理士法 第52条).
- 1.35.0 산업안전 4종: `check_kr_serious_accident`, `calculate_kr_accident_report_deadline`, `calculate_kr_safety_education_hours`, `check_kr_safety_staffing`. 정본 tools `kr-industrial-safety-2026`(tools #135, 현행 원문 2026-11-21 대조). 별표 4·35, 위험성평가 고시가 바뀌면 tools부터 고쳐요.
