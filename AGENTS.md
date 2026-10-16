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
- `GET /v1/military/kr/service-calculator`: 군 복무기간 및 계급 진급일 계산
- `GET /v1/energy/kr/gas-bill`: 도시가스 요금 계산
- `GET /v1/math/units/convert`: 단위 변환 (길이, 넓이, 무게, 온도)

## 검증 명령
- 테스트: `npm test`
- 문법 검사: `npm run check`
