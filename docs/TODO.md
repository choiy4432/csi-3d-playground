# TODO

> 마지막 업데이트: 2026-06-30

---

## 🔄 진행 중

<!-- 현재 작업 중인 항목 -->

<details>
<summary>📌 Figma 기획 반영 — 스키마 정합성 (미완료 4 / 7)</summary>

> 기획자 Figma(기초 설정 구체화 섹션) 검토 결과 도출된 항목.  
> **기준: ERD(`docs/forensic_full_erd_vis_up.html`) 우선. Figma와 충돌 시 ERD 따름.**

#### 🔴 우선순위 높음

- [x] **필드명 정비** — 코드 네이밍 정합성 수정
  - `npc_kind` 값 추가: `briefer`(안내자), `target_character`(사건 대상)
  - `S1 slot_kind: "npc_detail"` → `"space_placement"` (공간 배치)
  - `S5 slot_kind: "inference_prompt"` → `"npc_dialogue"` (NPC 대사)
  - ~~`evidence_damage_rate` → `damage`~~ — ERD 기준 유지 (revert)
  - ~~`experience_time` → `time`~~ — ERD 기준 유지 (revert)
- [x] **`CASE_TYPE` 구조화** — 현재 `scenario.case_type`이 자유 문자열; 테이블로 분리하고 규칙 연결
  - `CASE_JOB_RULE` (사건 유형 → 직업 제한)
  - `CASE_EVIDENCE_RULE` (사건 유형 → 증거 종류 제한)
  - `CASE_TARGET_RULE` (사건 유형 → 타겟 타입 제한)
- [x] **`PLAY_RESULT` 필드 추가** — `accused_npc_id`, `score`, `is_correct` (정답 채점 입력값)

#### 🟡 우선순위 중간

- [ ] **`LEARNING_OBJECTIVE` 테이블 추가** — `input_type`(선택형/문장형), `rubric_hint` (AI 평가·채점 기준 연동)
- [ ] **`PLACE_OBJECT_RULE` 구조화** — 장소+사건 유형 조합별 GLB 오브젝트 가변 배치 (현재 하드코딩)

#### 🔵 우선순위 낮음

- [ ] **`PROCESS_DEF` / STAGE 테이블 명시화** — COL/ANL/INF를 `step_no` 기반 테이블로 관리
- [ ] **`PLACE` · `JOB` 테이블 추가** — 장소별 space_count·mood·category_step, 직업별 분기 (공간 자료 확보 후)

</details>

---

## 📋 대기 중

<!-- 실행 가능하며 아직 시작하지 않은 항목 -->
- [ ] admin page figma integration — Figma 기획 고도화에 맞춰 어드민 UI 지속 업데이트 (기획자가 Figma를 계속 갱신 중; 확정된 섹션부터 순차 반영)
- [ ] skybox 구현
- [ ] 증거물 2번 방에서 자체 pivot 설정하여 회전 가능하게 구현
- [ ] 어드민 페이지 UX 개선 (클릭만으로 제어 — 드래그·복잡한 조작 최소화) _(추후 고도화 예정)_
- [ ] 콘텐츠 게시 관리 — 선생님/운영자 계정별 시나리오 격리 및 게시 (활성화 + 세션코드 발급)
  - `src/constants/users.js` — id/pw/role 하드코딩 유저 목록
  - `src/services/db.js` — localStorage 추상화 레이어 (`getScenarios`, `publishScenario`, `getSessions` 등); 추후 Supabase로 교체 시 이 파일만 수정
  - localStorage 키 네임스페이싱 (`csi_scenarios_u-01` 등) — 동일 브라우저 다중 계정 충돌 방지
  - 게시 내역 데이터 형식을 Supabase 테이블 구조로 설계 (`id, user_id, scenario_id, session_code, published_at, status`)

<details>
<summary>📌 fixedLayer.json → Supabase 마이그레이션 (미완료 4 / 4)</summary>

> 고정층 데이터를 DB로 이전해 기기 간 공유 및 재배포 없이 수정 가능하게

#### DB 설계 및 데이터 이전

- [ ] SQL DDL 작성 (현재 fixedLayer.json에 구현된 테이블만: SCENARIO, CONFIG, NPC, SOLUTION, SOLUTION_CLUE, EVIDENCE_DEF, GENERATION_SLOT, GENERATION_CONSTRAINT, CASE_TYPE, CASE_JOB_RULE, CASE_EVIDENCE_RULE, CASE_TARGET_RULE)
- [ ] 시드 데이터 INSERT (현재 fixedLayer.json 내용 기반)

#### 서비스 레이어 교체

- [ ] `src/services/db.js` — Supabase 클라이언트 래퍼 (`getFixedLayer`, `saveFixedLayer` 등); 현재 localStorage 추상화로 시작, Supabase 연결 후 이 파일만 교체
- [ ] AdminApp.jsx의 localStorage → db.js 호출로 교체

</details>
- [ ] 고정층 설정 완료 시 페르소나 카드 생성하여 표시 — 대상 학년·난이도·용의자 수·훼손율·사건 개요·등장인물·정답 경로를 한 장 요약으로 렌더링


---

## 🚧 보류

<!-- 선행 조건이 필요하거나 실행 불가한 항목 (이유 명시) -->
- [ ] 어드민 인증 → Supabase 테이블 + Edge Function 교체 _(보류: fixedLayer → Supabase 마이그레이션 완료 후)_
  - `users` 테이블 (`username`, `pw_hash`, `role`) — 이메일 없이 개인정보 수집 없음
  - Edge Function으로 서버사이드 검증 — pw_hash가 클라이언트에 절대 노출 안 됨
  - `src/services/auth.js` 인터페이스 유지, 내부 구현만 Supabase 호출로 교체
- [ ] PLACE / SPACE 관리 페이지 (어드민) _(보류: 추가 공간 자료 확보 후 진행)_
- [ ] 실제 LLM API 연결 (mockGenerator → 실 API 교체) _(보류: 백엔드 슬롯 생성 파이프라인 완성 후 진행)_
- [ ] 멀티 시나리오 구조 (프로젝트 목록) — 현재 시나리오 1개 고정 → 복수 시나리오 생성·관리 _(보류: fixedLayer → Supabase 마이그레이션 완료 후)_
  - 어드민에 "프로젝트 목록" 페이지 추가 — 시나리오 생성·복제·삭제
  - 각 시나리오는 독립적인 fixedLayer 데이터 보유
  - mockGenerator.js가 활성 시나리오 기준으로 데이터 로드하도록 수정
- [ ] 배포 관리 UI (어드민) — 시나리오별 플레이 URL 발급 + QR 코드 생성 _(보류: 콘텐츠 게시 관리 + 멀티 시나리오 구조 완료 후)_
  - 어드민에 "배포 및 관리" 페이지 추가
  - 시나리오별 플레이 URL 발급 (`/play/{session_code}`)
  - QR 코드 생성 (학생 배포용)
  - 배포 상태 관리 (활성·비활성·만료)
- [ ] 어드민 대시보드 홈 — 어드민 진입 시 현황 요약 표시 (현재: 바로 시나리오 편집 화면으로 진입) _(보류: 멀티 시나리오 구조 완료 후)_
  - 시나리오 수·배포 수·AI 슬롯 상태 통계
  - 최근 활동 피드

---

## ✅ 완료

<!-- 완료된 항목 -->
- [x] space 추가하여 onclick으로 방 전환할 때, 양 방에서 동일 object 배치 시 scale 변화 +@ 관측
- [x] light test 페이지 — pinpoint 조명·reflection 등, `/#/testroom` 해시 라우트로 TestRoomScene 구현 완료

<details>
<summary>📌 어드민 로그인 게이트 (미완료 0 / 4)</summary>

> `/#/admin` 진입 시 로그인 화면 표시 (현재 무인증 오픈)  
> 지금은 하드코딩으로 구현. 추후 Supabase 테이블 + Edge Function으로 교체 시 `auth.js` 내부만 수정.

- [x] `src/constants/users.js` — 하드코딩 유저 목록 `[{ id, pw, role }]` (role: `admin` | `teacher`, 추후 확정)
- [x] `src/services/auth.js` — 세션 관리
  - `login(id, pw)` — 유저 검증 + 세션 저장
  - `logout()` — 세션 삭제
  - `getSession()` — 현재 세션 반환 (만료 시 null)
  - `refreshActivity()` — lastActivity 갱신
  - localStorage `csi_auth_session: { userId, role, lastActivity }` — 1시간 무활동 시 만료
- [x] `src/admin/LoginPage.jsx` — id/pw 입력 폼, 실패 시 단순 에러 메시지 1개, 현재 어드민 다크테마 스타일 통일
- [x] `src/admin/AdminApp.jsx` 수정 — 세션 없으면 LoginPage 렌더, `mousemove`·`keydown`·`click` 시 `refreshActivity()`, 1분 interval로 만료 체크 후 자동 로그아웃

</details>

<details>
<summary>📌 생성층 씬 시나리오 선택 UI → 어드민으로 이동 (미완료 0 / 3)</summary>

- [x] `SCENE_SCENARIOS` / `DEFAULT_LIGHTING` 를 `src/constants/sceneScenarios.js`로 분리
- [x] 어드민에 새 페이지 추가 (씬 시나리오 선택 + `localStorage` 저장, key: `csi_active_scenario`)
- [x] `SceneWrapper.jsx` DEV 패널에서 시나리오 버튼 제거 → `localStorage`에서 읽도록 수정

</details>

<details>
<summary>📌 관리자 에디터 + 가상 생성층 (미완료 0 / 11)</summary>

> ERD(`docs/forensic_full_erd_vis_up.html`) · Figma 설계 기준.

#### 1단계 — 데이터 스키마 & 라우팅

- [x] `src/data/fixedLayer.json` 초기 데이터 작성 (SCENARIO · NPC · SOLUTION · SOLUTION_CLUE · EVIDENCE_DEF · GENERATION_SLOT · CONFIG)
- [x] hash 라우팅 추가 (`/#/` → 플레이어 씬, `/#/admin` → 에디터)
- [x] `src/admin/AdminApp.jsx` 레이아웃 (사이드바 + 콘텐츠 영역)

#### 2단계 — 에디터 페이지

- [x] 시나리오 기본 정보 페이지 (SCENARIO + CONFIG — grade_band · damage_rate · suspect_count · time)
- [x] NPC 관리 페이지 (목록 CRUD · npc_kind · name)
- [x] 정답 설정 페이지 (SOLUTION — 범인 지정 · correct_inference · SOLUTION_CLUE 단서 체인)
- [x] 증거물 카탈로그 페이지 (EVIDENCE_DEF — GLB 파일 · colliderSize · miniGame 설정)
- [x] 생성 슬롯 정의 페이지 (GENERATION_SLOT · GENERATION_CONSTRAINT · fallback_payload)

#### 3단계 — 가상 생성층 & 씬 연결

- [x] `src/services/mockGenerator.js` 구현 (고정층 로드 → position 프리셋 배정 → GENERATED_CONTENT 반환)
- [x] 미리보기 페이지 (mock 생성 결과 확인 — 어떤 증거물이 어디 배치되는지)
- [x] `SceneWrapper.jsx` 연결 (하드코딩 `INITIAL_EVIDENCES` → mockGenerator 결과로 교체)

</details>
