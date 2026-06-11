# Barobar Monitoring Dashboard

Barobar 서비스의 프론트엔드 에러를 모니터링하는 관리자 대시보드입니다.
에러 그룹을 조건별로 조회하고, 각 에러의 발생 이벤트와 **rrweb 세션 리플레이**를 함께 확인해
"무엇이, 누구에게, 어떻게" 발생했는지 재생 기반으로 진단합니다.

백엔드 Admin API(NestJS)와 통신하며, 기본 엔드포인트는 `/api/admin/errors`, `/api/admin/replays` 입니다.

## Quick Start

### 요구사항

- **Node.js** 20.19+ 또는 22.12+ (Vite 7 기준)
- **pnpm** 11 (`packageManager: pnpm@11.3.0`)
- 실행 중인 Barobar Monitoring 백엔드 (기본 `http://localhost:4000`)

### 환경 변수

프로젝트 루트에 `.env` 파일을 만들고 백엔드 주소를 지정합니다.

```bash
VITE_API_URL=http://localhost:4000
```

> 미설정 시 `http://localhost:4000`으로 폴백합니다.

### 명령어

```bash
pnpm install        # 의존성 설치
pnpm dev            # 개발 서버 실행 (http://localhost:5173)
pnpm build          # 타입체크(tsc -b) 후 프로덕션 빌드
pnpm preview        # 빌드 결과 미리보기

pnpm test           # 테스트 1회 실행 (Vitest)
pnpm test:watch     # 테스트 watch 모드
pnpm typecheck      # 타입 검사만
pnpm lint           # ESLint (경고 0 기준)
pnpm format         # Prettier 포맷팅
pnpm architecture   # FSD 아키텍처 규칙 검사 (steiger)
```

## Tech Stack

| 영역          | 기술                                                 |
| ------------- | ---------------------------------------------------- |
| 언어          | TypeScript 5                                         |
| UI            | React 19                                             |
| 빌드          | Vite 7                                               |
| 라우팅        | React Router 7                                       |
| 서버 상태     | TanStack Query 5                                     |
| 스타일        | Tailwind CSS 4, `@toss/tds-colors`                   |
| 아이콘        | lucide-react                                         |
| 세션 리플레이 | rrweb-player                                         |
| 테스트        | Vitest 4, Testing Library, jsdom                     |
| 품질          | ESLint 9, typescript-eslint, Prettier, steiger(FSD)  |
| Git 훅        | Husky, lint-staged, commitlint(Conventional Commits) |

## Architecture

[Feature-Sliced Design (FSD)](https://feature-sliced.design) 방법론을 따릅니다.
상위 레이어는 하위 레이어만 import할 수 있으며, 이 규칙은 `pnpm architecture`(steiger)로 검증합니다.
경로 별칭은 `@/` (= `src/`)를 사용합니다.

```
src/
├── app/        # 앱 진입점: providers(QueryClient), router, layout(Header/Sidebar), styles
├── pages/      # 라우트 단위 페이지: dashboard-errors, dashboard-error-detail
├── widgets/    # 독립 UI 블록: error-list-table, error-detail-panel,
│               #              replay-player-panel, replay-context-panel
├── features/   # 사용자 시나리오: filter-errors, navigate-to-replay
├── entities/   # 도메인 모델 + API: error, replay
└── shared/     # 공용 자원: api(HTTP 클라이언트), config(env),
                #            ui(CompanyBadge, BrowserLabel), testing(fixtures)
```

- **entities** — 도메인 타입과 TanStack Query 기반 데이터 패칭/정규화 (`error`, `replay`)
- **shared/api** — API 응답 봉투(envelope) 처리와 쿼리 파라미터 직렬화를 담당하는 `requestJson` 클라이언트
- **shared/ui** — 여러 위젯에서 재사용하는 표현 컴포넌트(회사 색상 뱃지, 브라우저 로고 라벨)

## Features

- **에러 목록** — 메시지 검색(부분 일치), 환경, 버전, 기간, 페이지네이션을 URL 쿼리스트링과 동기화
- **에러 상세** — 상태 코드·메시지·스택 트레이스 등 메타데이터와 발생 이벤트(Occurrence events) 테이블
  - **세션 리플레이** — 선택한 이벤트의 rrweb 리플레이 재생 + 컨텍스트 패널(에러 요약 / 사용자·회사·브라우저·OS·디바이스 / 최근 HTTP 요청)
