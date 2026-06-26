# TODO

> 마지막 업데이트: 2026-06-26

---

## 🔄 진행 중

<!-- 현재 작업 중인 항목 -->

---

## 📋 대기 중

<!-- 실행 가능하며 아직 시작하지 않은 항목 -->
- [ ] space 추가하여 onclick으로 방 전환할 때, 양 방에서 동일 object 배치 시 scale 변화 +@ 관측
<details>
<summary>📌 생성층 씬 시나리오 선택 UI → 어드민으로 이동 (미완료 3 / 3)</summary>

- [ ] `SCENE_SCENARIOS` / `DEFAULT_LIGHTING` 를 `src/constants/sceneScenarios.js`로 분리
- [ ] 어드민에 새 페이지 추가 (씬 시나리오 선택 + `localStorage` 저장, key: `csi_active_scenario`)
- [ ] `SceneWrapper.jsx` DEV 패널에서 시나리오 버튼 제거 → `localStorage`에서 읽도록 수정

</details>

<details>
<summary>📌 Figma 기획 반영 — 스키마 정합성 (미완료 7 / 7)</summary>

> 기획자 Figma(기초 설정 구체화 섹션) 검토 결과 도출된 항목.  
> 네이밍 정비(#1)는 코드 전체 영향 — 다른 항목보다 먼저 또는 한 번에 처리 권장.

#### 🔴 우선순위 높음

- [x] **필드명 정비** — 기획서와 우리 코드 간 네이밍 불일치 일괄 수정
  - `config[band].evidence_damage_rate` → `damage`
  - `config[band].experience_time` → `time`
  - `npc_kind` 값 추가: `briefer`(안내자), `target_character`(사건 대상) — 현재 `suspect`·`witness`만 있음
  - `S1 slot_kind: "npc_detail"` → `"space_placement"` (기획서 S1 = 공간 배치)
  - `S5 slot_kind: "inference_prompt"` → `"npc_dialogue"` (기획서 S5 = NPC 대사)
- [ ] **`CASE_TYPE` 구조화** — 현재 `scenario.case_type`이 자유 문자열; 테이블로 분리하고 규칙 연결
  - `CASE_JOB_RULE` (사건 유형 → 직업 제한)
  - `CASE_EVIDENCE_RULE` (사건 유형 → 증거 종류 제한)
  - `CASE_TARGET_RULE` (사건 유형 → 타겟 타입 제한)
- [ ] **`PLAY_RESULT` 필드 추가** — `accused_npc_id`, `score`, `is_correct` (정답 채점 입력값)

#### 🟡 우선순위 중간

- [ ] **`LEARNING_OBJECTIVE` 테이블 추가** — `input_type`(선택형/문장형), `rubric_hint` (AI 평가·채점 기준 연동)
- [ ] **`PLACE_OBJECT_RULE` 구조화** — 장소+사건 유형 조합별 GLB 오브젝트 가변 배치 (현재 하드코딩)

#### 🔵 우선순위 낮음

- [ ] **`PROCESS_DEF` / STAGE 테이블 명시화** — COL/ANL/INF를 `step_no` 기반 테이블로 관리
- [ ] **`PLACE` · `JOB` 테이블 추가** — 장소별 space_count·mood·category_step, 직업별 분기 (공간 자료 확보 후)

</details>

<details>
<summary>📌 관리자 에디터 + 가상 생성층 (미완료 2 / 13)</summary>

> ERD(`docs/forensic_full_erd_vis_up.html`) · Figma 설계 기준.  
> `PLACE/SPACE` 관련 기능은 추후 추가 예정 (현재 Room01.glb 고정).

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

#### 추후 추가

- [ ] PLACE / SPACE 관리 (추가 공간 자료 확보 후)
- [ ] 실제 LLM API 연결 (mockGenerator → 실 API 교체)

</details>

---

## 🚧 보류

<!-- 선행 조건이 필요하거나 실행 불가한 항목 (이유 명시) -->

---

## ✅ 완료

<!-- 완료된 항목 -->
- [x] 관리자 에디터 1단계 — 데이터 스키마 & 라우팅 (fixedLayer.json · hash 라우팅 · AdminApp 레이아웃)
- [x] 관리자 에디터 2단계 — 에디터 페이지 5종 (시나리오 · NPC · 정답 · 증거물 · 슬롯)
- [x] 관리자 에디터 3단계 — 가상 생성층 & 씬 연결 (mockGenerator · 미리보기 페이지 · SceneWrapper 연결)
