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

## MCP Registry (2026-11-09)
- `server.json`이 공식 MCP Registry 등록 정보다(`io.github.yuli3/oiyo-calculations`, remote `https://api.oiyo.net/mcp`). `version`은 `tools-spec.mjs`의 `version`과 같이 올린다(테스트가 확인).
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
