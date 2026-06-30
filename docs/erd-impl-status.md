# ERD ↔ 구현 현황

> 마지막 업데이트: 2026-06-30
> 기준 스키마: **MVP v0.5** (기획자, 34개 테이블 = 고정층 31 + 런타임 3)
> 기준 구현: `src/data/fixedLayer.json` + 어드민 에디터 (localStorage)

---

## 0. 확정 설계 결정 (마이그레이션 전제)

| 항목 | 결정 | 메모 |
|---|---|---|
| **id 전략** | ERD대로 — 마스터/정의 = `int` PK, 인스턴스 = `uuid` PK | 기존 문자열 id(`ct-01`·`npc-01`·`ev-01` 등)는 uuid/int로 리매핑, FK 참조 전부 치환 |
| **인증** | Supabase **Edge Function 발급 JWT** (이메일·PII 없음) | 계정 명부 `{account_id(uuid), username, pw_hash, role}`는 서버측(Edge Function secret)에만. 프론트 `constants/users.js`는 제거 |
| **RLS 신원** | `auth.uid()`(JWT `sub`) + `auth.jwt() ->> 'role'` | Edge Function이 검증 후 Supabase JWT 서명 발급 |

### 인프라 레이어 추가 (기획 도메인 스키마에는 없음 — 우리가 얹음)

| 테이블/필드 | 내용 |
|---|---|
| `ACCOUNT` (신규) | `id`(uuid PK, =JWT sub) · `username` · `role` · `created_at`. **`pw_hash`는 DB에 두지 않음**(Edge Function secret) |
| `SCENARIO.owner_id` | uuid FK → ACCOUNT. RLS `owner_id = auth.uid()` 기준 |
| `SCENARIO.visibility` | enum `public`/`private` (default `private`) |
| `SCENARIO.created_at/updated_at` | timestamptz (db.js가 `updatedAt` 유지 중) |
| 활성 시나리오 지정 | `SCENARIO.is_active`(단일 true) 또는 `APP_STATE` 단일행 — **결정 보류** |

> ⚠️ 위 인증/소유권 레이어는 기획자 v0.5 도메인 스키마에 **없다.** 멀티테넌트(teacher 격리)·RLS를 위해 인프라 측에서 추가한다.

---

## 1. v0.5 ↔ 현 구현 대조표 (34개 테이블)

범례: ✅ 구현됨 · ⚠️ 부분/충돌 · ❌ 미구현(신규) · 🆕 v0.5 신규 개념

### ① 고정층 (FIXED, 31)

| 테이블 | 상태 | 비고 / 충돌 |
|---|---|---|
| LEARNING_OBJECTIVE | ❌ | TODO 대기 |
| OBJECTIVE_DEF | ❌ | TODO 대기. `rubric_hint`로 평가 가중치 결정 |
| GRADE_BAND | ⚠️ | 현재 `"A"/"B"/"C"` 문자열. v0.5는 `vocab_level`·**`prompt_guideline`**·`pass_threshold` 테이블. **난이도와 분리**(아래 4번) |
| SCENARIO | ⚠️ | 구현(id/title/grade_band_id/case_type_id). `objective_id` FK 없음. **+ owner_id/visibility/timestamps (인프라 추가)** |
| CASE_TYPE | ⚠️ | 구현 + `description`(추가 필드, v0.5에도 반영 권장) |
| CASE_JOB_RULE | ⚠️✅ | **해소**: 현재 `job_keyword` 자유문자열 → v0.5 `process_step` + `job_id` FK |
| CASE_EVIDENCE_RULE | ⚠️✅ | **해소**: 현재 `evidence_category` 자유문자열 → v0.5 `evidence_def_id` FK |
| CASE_TARGET_RULE | ✅ | `allowed_target_type` 일치 |
| PLACE_EVIDENCE_RULE | ❌🆕 | 장소 축 증거 제약 |
| PLACE_OBJECT_RULE | ❌🆕 | (장소+유형)→object 후보 풀. TODO 대기 |
| PROCESS_DEF | ❌ | COL/ANL/INF 단계 정의. 현재 암묵 처리 |
| STAGE | ❌ | 단계 인스턴스 |
| PLACE | ❌ | Room01.glb 하드코딩 |
| PLACE_CATEGORY | ❌ | first/second/third 슬롯 |
| SPACE | ❌ | 무대 후보 공간 |
| SPACE_ANCHOR | ❌🆕 | **3D 앵커 시스템**(bbox World Space). 신규 구현 영역 |
| TARGET | ❌ | 사건 대상(object/character) |
| JOB | ❌🆕 | 직업 테이블(이전 미구현 → v0.5 정식 도입) |
| EVIDENCE | ❌ | 채증 인스턴스(stage 관통) |
| EVIDENCE_DEF | ⚠️🔴 | 현재 **시나리오별** + `file`/`colliderSize`/`miniGame`. v0.5는 **마스터 int PK** `id/name`만 → **3D 필드 갈 곳 없음**(아래 2번) |
| EVIDENCE_ANCHOR_RULE | ❌🆕 | 증거별 허용 앵커 풀(족적→바닥 등) |
| DIFFICULTY_DEF | ❌🆕 | 난이도 마스터(훼손율 범위·suspect_count·max_evidence). 현재 grade_band가 겸함 |
| CONFIG | ⚠️🔴 | 현재 `A/B/C` 딕셔너리 + `evidence_count`. v0.5는 `difficulty_id` + `experience_time` **단일행**(아래 4번) |
| NPC | ⚠️🔴 | 구현 + `profile`. **v0.5 `npc_kind`에서 `witness` 빠짐**(현재 4종)(아래 3번) |
| SOLUTION | ⚠️ | 현재 `id`/`scenario_id` 없음 → v0.5에서 채움 |
| SOLUTION_CLUE | ⚠️🆕 | **확장**: 현재 `evidence_def_id`/`reasoning_link`만. v0.5 + `solution_id`/`attribute_id`/`operator`/`match_value`/`is_required` (종합추론) |
| ATTRIBUTE_DEF | ❌🆕 | 속성 정의 마스터(발크기·알리바이 등) |
| NPC_ATTRIBUTE | ❌🆕 | 용의자별 속성값. **정답 교집합 근거 → anon 노출 금지** |
| GENERATION_SLOT | ⚠️ | 구현. `scenario_id` 없음. `slot_kind` 값 → `structural`/`narrative`로 변경 |
| SLOT_TARGET_REF | ❌🆕 | 슬롯 적용 대상 폴리모픽 참조 |
| GENERATION_CONSTRAINT | ✅ | 구현 |

### ③ 런타임층 (RUNTIME, 3) — 백엔드(FastAPI) 관리

| 테이블 | 상태 | 비고 |
|---|---|---|
| PLAY_SESSION | ❌ | 익명 세션(anon_token) |
| GENERATED_CONTENT | ❌ | 가변층 결과. `content`(jsonb)·`passed_validation`·`retry_count`·`used_fallback` |
| PLAY_RESULT | ❌ | **v0.5 확장**: `selected_clues`·`culprit_correct`·`clue_accuracy`·`score`·`passed`·`chosen_inference` |

---

## 2. v0.5가 해소한 항목 (이전 미결 → 확정)

| 항목 | 이전 상태 | v0.5 확정 |
|---|---|---|
| CASE_JOB_RULE 직업 참조 | `job_keyword` 자유문자열 | `process_step` + `job_id` FK + JOB 테이블 도입 |
| CASE_EVIDENCE_RULE 증거 참조 | `evidence_category` 자유문자열 | `evidence_def_id` FK |
| 난이도 단일 출처 | grade_band가 모든 난이도 파라미터 겸함 | `DIFFICULTY_DEF`(훼손율·suspect_count·max_evidence)로 분리 |
| EVIDENCE_DEF 스코프 | 마스터 vs 시나리오별 미정 | **글로벌 마스터(int PK)** 로 확정 |
| 정답 도달 방식 | 단서→범인 직접 | **종합추론**(속성 교집합): ATTRIBUTE_DEF + NPC_ATTRIBUTE + SOLUTION_CLUE 조건 |
| 평가 루브릭 | 미정의 | ①지목 + ②근거단서 정확도 가중합(rubric_hint 가중치, pass_threshold 통과선) |
| 3D 배치 | colliderSize/position 직접 튜닝 | SPACE_ANCHOR(bbox) + EVIDENCE_ANCHOR_RULE 앵커 시스템 |

---

## 3. 🔴 미해결 — 기획자 확인 필요

| # | 질문 | 영향 |
|---|---|---|
| Q1 | `NPC.npc_kind`에서 **`witness`(목격자) 삭제가 의도**인가? | 현재 구현은 witness 포함 4종, 실제 데이터(`npc-05 정도현=witness`) 존재. 삭제 시 기존 데이터 처리 필요 |
| Q2 | EVIDENCE_DEF의 **`file`/`collider_size`/`mini_game`(3D 필수 필드)** 위치는? | 현재 돌아가는 3D 게임의 필수 입력. 마스터에 추가 제안(지문=같은 GLB·미니게임이라 글로벌이 자연스러움) |
| Q3 | grade_band ↔ difficulty **분리** + `evidence_count` **정확값→가변(max_evidence)** 전환이 의도인가? | CONFIG 구조·S2 검증 제약(`evidence_count` 정확일치)·프롬프트 로직 변경 |

---

## 4. 주요 발산 상세 (마이그레이션 영향)

### CONFIG 구조 변경
- **현재**: `config.A/B/C` grade_band별 딕셔너리, 각 `{label, evidence_damage_rate, suspect_count, experience_time, evidence_count}`
- **v0.5**: `CONFIG = {id, scenario_id, difficulty_id, experience_time}` 단일행. 훼손율·용의자수·증거상한은 `DIFFICULTY_DEF`로 이전
- **마이그레이션**: A/B/C dict → `difficulty_id` 단일 매핑. `evidence_count`(정확값) → `max_evidence`(상한) + 가변 → `GENERATION_CONSTRAINT` evidence_count 규칙을 "정확 일치"→"상한 이내"로 수정

### SOLUTION_CLUE 종합추론 모델
- **현재**: `{id, evidence_def_id, reasoning_link}`
- **v0.5**: + `solution_id`/`attribute_id`/`operator`/`match_value`/`is_required` — 단서가 범인 대신 **속성 조건** 지목, 필수 단서 교집합 = 진범 1명
- **마이그레이션**: 기존 시드는 신규 필수 필드 백필 필요(사실상 신규 설계). ATTRIBUTE_DEF·NPC_ATTRIBUTE 동반 신설

### 3D 앵커 시스템 (신규 구현)
- SPACE_ANCHOR(bbox) + EVIDENCE_ANCHOR_RULE — 현재 position 배열/colliderSize 직접 튜닝에는 없는 큰 신규 영역
- **단계 분리 권장**: 스키마/시드 먼저, 3D 런타임 적용은 후속

---

## 5. 앱 레벨 검증 제약 (ERD로 표현 불가 — 마이그레이션 후 코드/검증으로 관리)

- `npc_kind=suspect` 수 = `DIFFICULTY_DEF.suspect_count` (단일 출처)
- 유효 증거 = `CASE_EVIDENCE_RULE` ∩ `PLACE_EVIDENCE_RULE` 교집합
- S2 증거 좌표 = 선택 앵커 `SPACE_ANCHOR.bbox_min~max` 범위 내
- 증거 앵커 = `EVIDENCE_ANCHOR_RULE` 허용 앵커 중에서만
- `SOLUTION.culprit_npc_id`는 반드시 `npc_kind=suspect`
- 모든 필수 단서(`is_required=true`) 충족 용의자 = **정확히 1명** = 진범
- 모든 `GENERATION_SLOT`은 `fallback_payload` 보유 (NOT NULL)
- `NPC_ATTRIBUTE.value` ↔ `SOLUTION_CLUE.match_value`는 `ATTRIBUTE_DEF.type` 형식 일치
