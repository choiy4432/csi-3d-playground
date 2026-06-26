# CSI Scene — AI 기반 과학수사 직무체험

콘진원 AI 직업체험 프로젝트의 3D 인터랙티브 과학수사·프로파일링 체험 콘텐츠.  
React Three Fiber 기반 실시간 3D 씬에서 증거를 채취하고 AI가 생성한 시나리오를 수사합니다.

**배포:** https://csi-3d-playground.vercel.app/

---

## 기술 스택

| 분류 | 라이브러리 |
|------|-----------|
| 렌더링 | React 19, React Three Fiber 9, Three.js 0.184 |
| 물리 | `@react-three/rapier` 2 |
| 유틸 | `@react-three/drei` 10 |
| 빌드 | Vite 8 |
| 테스트 | Vitest 4, Testing Library |

---

## 시작하기

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview
npm test
```

---

## 라우팅

| URL | 화면 |
|-----|------|
| `/#/` (기본) | 3D 플레이어 씬 |
| `/#/admin` | 고정층 에디터 (어드민) |

hash 기반 SPA 라우팅 — `App.jsx`에서 `window.location.hash`로 분기.

---

## 아키텍처 — 3층 구조

```
고정층 (FIXED)       — 에디터에서 1회 저장, 전 플레이 공유  → fixedLayer.json / localStorage
가변층 (VARIABLE)    — 진입 시 AI(LLM)로 생성              → 현재는 mockGenerator로 시뮬레이션
런타임층 (RUNTIME)   — 플레이마다 생성                      → PLAY_SESSION / GENERATED_CONTENT / PLAY_RESULT
```

### 슬롯 생성 순서

```
player 진입 → PLAY_SESSION 생성 → 고정층 로드
  → S3 → S4 → S1 → S2 → S5 순차 LLM 생성
  → 전 슬롯 완료 → 3D 월드 진입
```

플레이는 어떤 상황에서도 중단되지 않습니다 (실패 시 fallback_payload 적용).

---

## 파일 구조

```
src/
├── App.jsx                  # hash 라우터
├── SceneWrapper.jsx         # Canvas + Physics 래퍼, HUD, DEV 모드
├── CrimeScene.jsx           # evidences 배열 → EvidenceObject 배치
├── EvidenceObject.jsx       # GLB 로드, Rapier 콜라이더, hover/채증 비주얼
├── PlayerController.jsx     # WASD 이동, Pointer Lock, 레이캐스트 상호작용
├── MiniGame.jsx             # 타이밍바 / 연타 미니게임
├── Room.jsx                 # Room01.glb trimesh 콜라이더, 조명 기구 자동 감지
├── Hand.jsx                 # SVG 라텍스 장갑, grab 애니메이션
├── DebugLight.jsx           # pointLight + 디버그 구체 래퍼
├── admin/
│   ├── AdminApp.jsx         # 어드민 레이아웃 (사이드바 + 콘텐츠)
│   ├── shared.jsx           # 공용 UI 컴포넌트 (Card, Field, btn, badge …)
│   └── pages/
│       ├── ScenarioPage.jsx # SCENARIO + CONFIG 편집
│       ├── NpcPage.jsx      # NPC CRUD
│       ├── SolutionPage.jsx # 범인·단서 설정
│       ├── EvidencePage.jsx # EVIDENCE_DEF 카탈로그
│       ├── SlotsPage.jsx    # GENERATION_SLOT / CONSTRAINT / fallback
│       ├── PreviewPage.jsx  # mock 생성 결과 + 3D 미리보기
│       └── InfoPage.jsx     # 개발자 정보
├── services/
│   └── mockGenerator.js    # 고정층 로드 → 증거물 배치 시뮬레이션
├── data/
│   └── fixedLayer.json     # 고정층 초기 데이터 (26개 테이블 해당)
└── __tests__/
    └── MiniGame.test.jsx   # 타이밍/연타 판정 경계값 37개 케이스

public/models/
├── moon_jar.glb            # 달항아리 (3.5 MB, PBR 3텍스처)
├── Brush.glb               # 붓 (422 KB, 2 프리미티브)
├── Sculpture.glb           # 조각품 (6.2 MB, TripoAI 생성)
├── old_art_Book.glb        # 낡은 서적 (7.0 MB, TripoAI 생성)
└── room/
    └── Room01.glb          # 전시 공간 방 (11.9 MB, 17 노드, 유리 4종)
```

---

## 어드민 에디터 (`/#/admin`)

고정층 데이터를 브라우저에서 편집하고 `localStorage`에 저장합니다.  
`JSON 내보내기` 버튼으로 `fixedLayer.json`을 다운로드해 소스에 반영합니다.

| 페이지 | 설명 |
|--------|------|
| 📋 시나리오 정보 | 제목, grade_band, damage_rate, suspect_count, 체험 시간 |
| 👥 등장인물 관리 | NPC 목록 CRUD (npc_kind, name) |
| 🎯 정답 설정 | 범인 지정, correct_inference, SOLUTION_CLUE 단서 체인 |
| 🔍 증거물 목록 | EVIDENCE_DEF (GLB 파일, colliderSize, miniGame 설정) |
| 🤖 AI 생성 설정 | GENERATION_SLOT / CONSTRAINT / fallback_payload |
| 👁️ 미리보기 | mock 증거물 배치 결과 + 3D 씬 확인 |

---

## 미니게임

증거물을 클릭하면 두 가지 채취 미니게임 중 하나가 실행됩니다.

| 타입 | 방식 | 입력 |
|------|------|------|
| `timing` | 슬라이딩 바가 초록 구간에 올 때 클릭 | 마우스 클릭 또는 `F` |
| `rapidclick` | 제한 시간 내 N번 연타 | 마우스 클릭 |

- Pointer Lock 중에도 `window` 레벨 이벤트로 입력 수신
- `ESC` → 취소 (재시도 가능)
- 난이도(`easy` / `normal` / `hard`)는 EVIDENCE_DEF에서 설정

---

## DEV 모드 (플레이 화면)

| 단축키 | 동작 |
|--------|------|
| `1` | DEV 모드 토글 — Rapier 콜라이더 시각화 + OrbitControls 자유 시점 |
| `2` | 라이트 아이솔레이션 (DEV 모드 중만) |

DEV 모드 진입 시 Pointer Lock 해제, 종료 시 스폰 지점 리스폰.

---

## grade_band

| band | 대상 | 훼손율 | 용의자 수 | 체험 시간 |
|------|------|--------|----------|---------|
| A | 초등 저학년 | 30% | 3인 | 5분 |
| B | 초등 고학년 | 50% | 4인 | 7~8분 |
| C | 중학생 | 80% | 5인 | 10분 |

난이도 파라미터는 반드시 `grade_band`에서 읽습니다. 하드코딩 금지.

---

## 브랜치 전략

```
main   ← Vercel 프로덕션 (자동 배포)
  └── dev   ← 개발 통합 브랜치
```

`main` 직접 커밋·푸시 금지. 모든 작업은 `dev`에서 진행합니다.
