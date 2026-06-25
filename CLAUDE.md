# 콘진원 AI 직업체험 — Claude Code 컨텍스트

## 프로젝트 개요

AI 기반 실시간 동적 생성형 과학수사·프로파일링 직무체험 콘텐츠.
PRE(브리핑) → MAIN ①채증(COL) ②실험(ANL) ③추론(INF) → POST(AI 평가 리포트)
배포: https://ai-job-experience.vercel.app

## 기술 스택

- 프론트엔드: React, React Three Fiber(R3F), Three.js
  - `@react-three/drei` — useGLTF 등 R3F 유틸리티
  - `@react-three/rapier` — 물리 충돌 (플레이어·벽·증거물)
- 백엔드: FastAPI (Python)
- DB: Supabase (PostgreSQL)
- AI: LLM API (슬롯 생성·평가 리포트)
- 배포: Vercel

## 서브에이전트

코드 검토·테스트·타입·프롬프트·DB 마이그레이션 검토는 각 에이전트가 담당한다.
`.claude/agents/` 참고.

### 호출 규칙

| 에이전트 | 호출 조건 |
|---|---|
| `code-reviewer` | 아래 **핵심 파일** 수정 후 반드시 실행 |
| `type-checker` | API 응답 구조 또는 컴포넌트 props 변경 시 |
| `db-migration-reviewer` | `backend/migrations/` 파일 생성·수정 시 |
| `prompt-reviewer` | LLM 프롬프트 문자열 작성·수정 시 |
| `test-writer` | 사용자가 "테스트 짜줘" 라고 요청할 때만 |

**code-reviewer 핵심 파일 (이 파일을 수정하면 무조건 실행):**
- `src/SceneWrapper.jsx`
- `src/PlayerController.jsx`
- `src/EvidenceObject.jsx`
- `src/MiniGame.jsx`
- `backend/services/` 하위 파일
- `backend/routers/` 하위 파일

그 외 파일(Hand.jsx, Room.jsx, UI 컴포넌트 등)은 code-reviewer 생략 가능.

---

## 🔴 불변 원칙

아래 필드는 어떤 코드도 수정·삭제할 수 없다. 읽기만 허용.

- `SOLUTION.culprit_npc_id` — 범인 정체
- `SOLUTION.correct_inference` — 정답 추론
- `SOLUTION_CLUE` — 단서 체인 전체

---

## 3층 구조

| 층  | 이름               | 시점                               | 테이블 |
| --- | ------------------ | ---------------------------------- | ------ |
| ①   | 고정층 (FIXED)     | 에디터 1회 저장 · 전 플레이 공유   | 26개   |
| ②   | 가변층             | 진입 시 AI 생성 — 별도 테이블 없음 | -      |
| ③   | 런타임층 (RUNTIME) | 플레이마다 생성                    | 3개    |

런타임층 3개: `PLAY_SESSION` · `GENERATED_CONTENT` · `PLAY_RESULT`

---

## 슬롯 생성 루프 (백엔드 핵심 흐름)

```
player 진입
  ↓
PLAY_SESSION 생성 (anon_token)
  ↓
고정층 전체 로드
  ↓
슬롯 순차 생성: S3 → S4 → S1 → S2 → S5
  각 슬롯:
    프롬프트 조립 (고정층 + 이전 슬롯 결과 + GENERATION_CONSTRAINT)
    LLM 호출
    제약 검증
      통과 → GENERATED_CONTENT 저장 (passed_validation=true)
      실패 → retry_count++ → N회 초과 시 fallback_payload 적용 (used_fallback=true)
  ↓
전 슬롯 완료 → 3D 월드 진입
플레이는 어떤 상황에서도 중단되지 않는다
```

---

## 파일 구조

```
src/
├── SceneWrapper.jsx    # Canvas + Physics 래퍼, evidences 상태 관리, HUD
├── CrimeScene.jsx      # evidences.map() → EvidenceObject 배치
├── EvidenceObject.jsx  # GLB 로드, Rapier 고정 콜라이더, hover/채증 비주얼
├── Room.jsx            # 방 기하(바닥·천장·4벽) + Rapier 벽 콜라이더
├── PlayerController.jsx# WASD 이동, Pointer Lock, 클릭 채증 처리
├── components/
│   ├── interaction/    # 17개 모듈 (COL-01~10, ANL-01~04, INF-01~03)
│   └── ui/             # 2D UI (HUD, 브리핑, 리포트)
├── hooks/
├── types/              # 타입 정의 — type-checker 에이전트 참고
└── constants/          # grade_band, 슬롯 순서 등

public/
└── models/             # GLB 파일 ({evidenceType}.glb)

backend/
├── routers/
├── services/           # 슬롯 생성·검증
└── schemas/            # Pydantic 모델
```

---

## grade_band 파라미터

| grade_band | 대상        | 훼손율 | 용의자 수 | 체험시간 |
| ---------- | ----------- | ------ | --------- | -------- |
| A          | 초등 저학년 | 30%    | 3인       | 5분      |
| B          | 초등 고학년 | 50%    | 4인       | 7~8분    |
| C          | 중학생      | 80%    | 5인       | 10분     |

난이도 파라미터는 `grade_band`에서 읽는다. 하드코딩 금지.

---

## 3D 씬 설계 결정 사항

### 충돌 시스템
- `<Physics gravity={[0,0,0]}>` — 중력 없는 실내 씬
- 방 바닥·천장·4벽: `RigidBody type="fixed"` + `CuboidCollider` (시각 메시와 분리)
- 증거물: `RigidBody type="fixed"` + `CuboidCollider` — 플레이어가 통과 불가
- 플레이어: `RigidBody type="dynamic"` + `CapsuleCollider`, `gravityScale=0`, `linearDamping=20`

### Pointer Lock + 레이캐스트
- Pointer Lock 중 `pointermove`의 `clientX/clientY`가 고정되어 R3F 기본 hover 이벤트가 동작하지 않음
- `useFrame` 안에서 `raycaster.setFromCamera({x:0, y:0}, camera)`로 매 프레임 수동 레이캐스트
- hover 대상은 `userData.evidenceId`로 식별; GLB 모델 메시는 `raycast = () => {}`로 레이캐스트 제외
- 클릭도 R3F `onClick`이 아닌 PlayerController의 native `click` 핸들러에서 처리 (`currentHover` ref 참조)

### 채증 거리 제한
- `INTERACT_DIST = 2.5` (PlayerController 상수) — 이 거리 안에서만 클릭 채증 가능
- hit.distance가 범위 내면 노란 와이어프레임 + "[클릭] 채증" 힌트, 밖이면 회색 + "너무 멀어요"

### 증거물 데이터 (SceneWrapper)
```js
{ id, file, position: [x,y,z], colliderSize: [w,h,d], collected: false }
```
`colliderSize`는 물체별로 개별 조정 — GLB 모델 크기에 맞춰 직접 튜닝.

---

## 커밋 메시지 규칙

```
feat(COL-01): 지문 파우더 도포 인터랙션 구현
fix(S2): 증거 배치 폴백 처리 누락 수정
test(validator): culprit∈suspect 제약 검증 테스트 추가
refactor(scene): EvidenceObject clone 처리 분리
```

prefix: `feat` / `fix` / `test` / `refactor` / `chore`
scope: 슬롯키(S1~S5) · 인터랙션ID(COL-01 등) · 레이어(scene/validator/pipeline)
