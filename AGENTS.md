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

## 2026 요율 단일 정본 (2026-10-17)
- 급여·4대보험·구직급여·육아휴직·지역건보 요율과 공식은 `src/modules/kr-rates-2026.mjs` 하나에만 둔다. labor·insurance 모듈에 숫자 요율을 새로 쓰지 않는다.
- tools는 같은 파일을 `src/lib/kr-rates-2026.mjs`로 바이트 동일하게 복사해 쓴다(tools `npm run sync:kr-rates`). 이 파일을 고치면 tools에도 같은 PR을 연다.
- blog `src/lib/kr-payroll-2026.ts`와의 값 일치는 `test/kr-rates-2026.test.mjs`가 확인한다(blog 체크아웃이 없으면 live 비교만 skip, 고정 스냅샷은 항상 실행).
- 근로소득세는 국세청 간이세액표가 아닌 연간 환산 **추정**이다. 응답 `taxes.isEstimate=true`를 유지한다.

## 색인 정책 (2026-10-17)
- 색인 대상은 `/docs` 하나다. sitemap에는 `/docs`만 둔다. `/`(HTML·JSON)는 noindex.
- `/openapi.json`·`/tools.json`·`/llms.txt`·`/llms-full.txt`는 robots Allow + `X-Robots-Tag: noindex`. `/v1/`는 Disallow 유지.

## 검증 명령
- 테스트: `npm test`
- 문법 검사: `npm run check`
