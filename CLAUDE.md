# 콘진원 AI 직업체험 — Claude Code 컨텍스트

## 🔴 브랜치 규칙 (최우선)

**`main` 직접 커밋·푸시 절대 금지.**
모든 작업은 `dev` 브랜치에서 진행한다. `main`은 검증된 버전만 머지한다.

```
작업 → dev 커밋 → (검증 후) main 머지
```

> 사용자가 "main에 바로 푸시하자"고 명시적으로 요청한 경우에만 예외를 허용한다.

---

## 프로젝트 개요

**작업 폴더: `csi-scene/`** — 모든 작업은 이 디렉토리 기준으로 진행한다.

AI 기반 실시간 동적 생성형 과학수사·프로파일링 직무체험 콘텐츠.
PRE(브리핑) → MAIN ①채증(COL) ②실험(ANL) ③추론(INF) → POST(AI 평가 리포트)
배포: https://csi-3d-playground.vercel.app/

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

> **ERD 규칙**: `src/data/fixedLayer.json` 스키마 변경(테이블 추가·필드 추가·삭제·이름 변경) 시 `docs/erd-impl-status.md`를 반드시 함께 업데이트한다.

> **TODO 규칙**: `docs/TODO.md` 관련 작업은 **무조건 `todo-manager` 에이전트를 Agent 도구로 호출**한다.
>
> - 모델은 `todo-manager` 에이전트가 작업 복잡도에 따라 자율적으로 판단한다.
> - `<details>` 드롭다운 그룹 내부 항목을 작업하기 시작하면, 해당 그룹을 `## 🔄 진행 중` 섹션으로 이동한다.
> - 그룹 내 모든 항목 완료 시 `## ✅ 완료` 섹션으로 이동한다.

### 오케스트레이션 흐름

`/csi-dev` 커맨드가 구현 완료 후 리뷰 → QA 순서로 에이전트를 트리거한다.

```
구현 완료
  → 1단계: 리뷰 에이전트 (수정 파일 기준)
  → 2단계: qa 에이전트 (리뷰 완료 직후)
```

### 호출 규칙

| 에이전트                | 호출 조건                                                                   |
| ----------------------- | --------------------------------------------------------------------------- |
| `code-reviewer`         | 아래 **핵심 파일** 수정 후 반드시 실행                                      |
| `interaction-reviewer`  | `src/components/interaction/` 파일 수정 시 (`code-reviewer` 보다 먼저 실행) |
| `type-checker`          | API 응답 구조 또는 컴포넌트 props 변경 시                                   |
| `db-migration-reviewer` | `backend/migrations/` 파일 생성·수정 시                                     |
| `prompt-reviewer`       | LLM 프롬프트 문자열 작성·수정 시                                            |
| `test-writer`           | 사용자가 "테스트 짜줘" 라고 요청할 때만                                     |
| `qa`                    | 위 리뷰 에이전트 완료 직후 / "QA 해줘" 직접 요청                           |

**code-reviewer 핵심 파일 (이 파일을 수정하면 무조건 실행):**

- `src/SceneWrapper.jsx`
- `src/PlayerController.jsx`
- `src/MiniGame.jsx`
- `src/scene/EvidenceObject.jsx`
- `backend/services/` 하위 파일
- `backend/routers/` 하위 파일

그 외 파일(scene/ 하위, UI 컴포넌트 등)은 code-reviewer 생략 가능.

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
├── SceneWrapper.jsx     # Canvas + Physics 래퍼, evidences 상태 관리, HUD, dev 모드
├── PlayerController.jsx # WASD 이동, Pointer Lock, 클릭 채증 처리, forwardRef reset()
├── MiniGame.jsx         # 타이밍바 / 연타 미니게임 (window 이벤트, Pointer Lock 유지)
├── scene/               # 보조 씬 구성 파일
│   ├── CrimeScene.jsx       # evidences.map() → EvidenceObject 배치
│   ├── EvidenceObject.jsx   # GLB 로드, Rapier 고정 콜라이더, hover/채증 비주얼
│   ├── Room.jsx             # Room01.glb trimesh 콜라이더, 조명 기구 자동 감지
│   ├── Hand.jsx             # SVG 라텍스 장갑, grab 애니메이션
│   ├── DebugLight.jsx       # pointLight + debug 구체 래퍼 (재사용)
│   ├── DoorPortal.jsx
│   ├── EvidenceDisplay.jsx
│   ├── EvidenceExaminer.jsx
│   ├── RoomAssembled.jsx
│   ├── RoomObjects.jsx
│   ├── RoomPlaceholder.jsx
│   └── TestRoomScene.jsx
├── admin/               # 어드민 에디터
├── components/
│   ├── interaction/     # 17개 모듈 (COL-01~10, ANL-01~04, INF-01~03)
│   └── ui/             # 2D UI (HUD, 브리핑, 리포트)
├── __tests__/
│   ├── MiniGame.test.jsx # vitest — 37개 판정 경계값 테스트
│   └── setup.js
├── hooks/
├── types/               # 타입 정의 — type-checker 에이전트 참고
├── constants/           # grade_band, 슬롯 순서 등
├── services/            # mockGenerator, auth (추가 예정)
└── data/                # fixedLayer.json

public/
└── models/
    ├── room/Room01.glb  # 방 GLB (trimesh 콜라이더)
    └── {evidenceType}.glb

backend/
├── routers/
├── services/            # 슬롯 생성·검증
└── schemas/             # Pydantic 모델
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
- 방: `RigidBody type="fixed" colliders="trimesh"` + Room01.glb `<primitive>` — GLB 메시 형태 그대로 충돌
- 증거물: `RigidBody type="fixed"` + `CuboidCollider` — 플레이어가 통과 불가
- 플레이어: `RigidBody type="dynamic"` + `CapsuleCollider`, `gravityScale=0`, `linearDamping=20`

### Pointer Lock + 레이캐스트

- Pointer Lock 중 `pointermove`의 `clientX/clientY`가 고정되어 R3F 기본 hover 이벤트가 동작하지 않음
- `useFrame` 안에서 `raycaster.setFromCamera({x:0, y:0}, camera)`로 매 프레임 수동 레이캐스트
- hover 대상은 `userData.evidenceId`로 식별; GLB 모델 메시는 `raycast = () => {}`로 레이캐스트 제외
- 클릭도 R3F `onClick`이 아닌 PlayerController의 native `click` 핸들러에서 처리 (`currentHover` ref 참조)
- 미니게임 중에는 `pausedRef.current`로 포인터락 요청 및 interact 모두 차단

### 채증 거리 제한

- `INTERACT_DIST = 2.5` (PlayerController 상수) — 이 거리 안에서만 클릭 채증 가능
- hit.distance가 범위 내면 노란 와이어프레임 + "[클릭] 채증" 힌트, 밖이면 회색 + "너무 멀어요"

### 증거물 데이터 (SceneWrapper)

```js
{ id, file, position: [x,y,z], colliderSize: [w,h,d], collected: false,
  miniGame: { type: 'timing'|'rapidclick', label, difficulty?, target?, time? } }
```

`colliderSize`는 물체별로 개별 조정 — GLB 모델 크기에 맞춰 직접 튜닝.

### 미니게임 (MiniGame.jsx)

- `TimingGame` — rAF 슬라이딩 바, difficulty(easy/normal/hard)로 속도·구간 크기 결정
- `RapidClickGame` — setInterval 카운트다운, target 클릭 수 도달 시 성공
- 입력: `window mousedown` / `keydown` (Pointer Lock 중에도 동작)
- ESC → onFail / 결과 후 550ms 딜레이 → 자동 닫힘
- 미니게임 중 Pointer Lock 해제 없이 overlay `pointerEvents: 'none'`으로 유지

### 조명 시스템

- 전역 조명: `ambientLight` + `DebugLight` ×3 (SceneWrapper 고정 좌표)
- 찬장 조명: Room01.glb traverse → `/light/i` 이름 emissive 메시 자동 감지 → `DebugLight` 배치
- GLB 내장 라이트: `obj.isLight` 감지, isolation 모드에서 intensity=0으로 토글 (원본은 `userData._origIntensity` 보존)
- `DebugLight.jsx` — pointLight + breath 구체 래퍼; `debug` prop으로 구체 토글, `isolated` prop으로 라이트 끄기

### 개발자 도구 (DEV MODE)

단축키:

- `1` — DEV 모드 토글: Rapier 콜라이더 시각화 + OrbitControls 자유 시점, OFF 시 스폰 지점 리스폰
- `2` — 라이트 아이솔레이션: 전역 조명 끄고 조명 기구 구체만 표시 (DEV 모드일 때만)

OrbitControls: 좌클릭=회전, 우클릭=pan, 휠=줌 (DEV 모드 중 포인터락 비활성)

디버그 구체 색상 범례:

- 노란 와이어프레임 — Rapier 콜라이더
- RGB 축 — RigidBody 로컬 좌표계
- 민트(`#00ffcc`) — `DebugLight` (emissive 기반 또는 전역 pointLight)
- 주황(`#ff6600`) — GLB 내장 라이트 노드

PlayerController — `forwardRef` + `useImperativeHandle`로 `reset()` 노출:

```js
playerRef.current.reset(); // 위치 [0,BODY_Y,0], linvel 0, yaw/pitch 0으로 리셋
```

---

## 브랜치 전략

Vercel이 `main`을 프로덕션으로 자동 배포한다.
**`main`에 직접 커밋하지 않는다.**

```
main   ← Vercel 프로덕션 (안정 버전만 머지)
  └── dev   ← 개발 통합 브랜치 (Vercel Preview)
        ├── feat/xxx   ← 기능 단위 브랜치
        └── fix/xxx    ← 버그픽스 브랜치
```

### 평상시 (혼자 작업)

`dev`에 직접 커밋해도 된다. feature 브랜치는 생략 가능.

```bash
git checkout dev
# 작업 후
git add src/xxx.jsx
git commit -m "feat(xxx): ..."
```

### 팀 협업 시

feature 브랜치 → PR → `dev` 머지 방식으로 전환한다.

```bash
git checkout -b feat/xxx dev   # dev 기준으로 브랜치 생성
# 작업 후
git push origin feat/xxx       # PR 생성 → dev로 머지
```

### 배포 (dev → main)

```bash
# dev에서 충분히 검증 후
git checkout main
git merge dev
git push origin main           # Vercel 자동 배포 트리거
git tag vX.Y.Z -m "배포 내용 요약"
git push origin vX.Y.Z
```

### 버전 규칙 (Semantic Versioning)

`vMAJOR.MINOR.PATCH` 형식을 따른다.

| 구분 | 올리는 조건 |
|------|-----------|
| MAJOR | 이전 버전과 호환되지 않는 변경 |
| MINOR | 이전 버전과 호환되는 기능 추가 |
| PATCH | 이전 버전의 버그 수정 |

### 규칙

- `main` 직접 push 금지
- 배포할 때마다 semver 태그 남기기 — 특정 버전 복원 기준점
- 작업 시작 전 항상 현재 브랜치 확인: `git branch`
- 현재 작업 브랜치: **`dev`** (기본 개발 브랜치)

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

`Co-Authored-By` 트레일러는 커밋 메시지에 포함하지 않는다.
