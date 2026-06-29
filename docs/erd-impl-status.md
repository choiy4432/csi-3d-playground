# ERD ↔ 구현 현황

> 마지막 업데이트: 2026-06-29  
> 기준 ERD: `docs/forensic_full_erd_vis_up.html`  
> 기준 구현: `src/data/fixedLayer.json` + 어드민 에디터

---

## 1. 구현 상태 대조표

범례: ✅ 구현됨 · ⚠️ 부분 구현(필드·FK 차이) · ❌ 미구현

| ERD 테이블 | 층 | 상태 | 비고 |
|---|---|---|---|
| SCENARIO | 고정 | ⚠️ | `objective_id` FK 없음 |
| CONFIG | 고정 | ⚠️ | 구조 다름 (아래 상세 참조) |
| NPC | 고정 | ⚠️ | ERD에 없는 `profile` 필드 추가 |
| SOLUTION | 고정 | ⚠️ | `id`, `scenario_id` FK 없음 |
| SOLUTION_CLUE | 고정 | ⚠️ | `solution_id` FK 없음 |
| EVIDENCE_DEF | 고정 | ⚠️ | ERD에 없는 `file`, `colliderSize`, `miniGame` 추가 (3D 전용) |
| GENERATION_SLOT | 고정 | ⚠️ | `scenario_id` FK 없음 |
| GENERATION_CONSTRAINT | 고정 | ✅ | |
| CASE_TYPE | 고정 | ⚠️ | ERD에 없는 `description` 필드 추가 |
| CASE_JOB_RULE | 고정 | ⚠️ | ERD: `job_id FK → JOB`. 현재: `job_keyword` 자유 문자열 (JOB 테이블 미구현) |
| CASE_EVIDENCE_RULE | 고정 | ⚠️ | ERD: `evidence_def_id FK`. 현재: `evidence_category` 자유 문자열 |
| CASE_TARGET_RULE | 고정 | ✅ | `allowed_target_type` 필드명 ERD 일치 |
| PLAY_SESSION | 런타임 | ❌ | 백엔드(FastAPI) 담당 — fixedLayer 외부 |
| GENERATED_CONTENT | 런타임 | ❌ | 백엔드 담당 |
| PLAY_RESULT | 런타임 | ❌ | 백엔드 담당 |
| GRADE_BAND | 고정 | ❌ | `"A"/"B"/"C"` 하드코딩 문자열로 대체. ERD 필드(`vocab_level`, `max_evidence`, `pass_threshold`) 없음 |
| LEARNING_OBJECTIVE | 고정 | ❌ | TODO 대기 중 |
| OBJECTIVE_DEF | 고정 | ❌ | TODO 대기 중 |
| STAGE | 고정 | ❌ | COL/ANL/INF 3단계 암묵적 처리. TODO 대기 중 |
| PROCESS_DEF | 고정 | ❌ | TODO 대기 중 |
| JOB | 고정 | ❌ | TODO 대기 중 |
| PLACE | 고정 | ❌ | Room01.glb 하드코딩. TODO 보류 |
| PLACE_CATEGORY | 고정 | ❌ | TODO 보류 |
| SPACE | 고정 | ❌ | TODO 보류 |
| TARGET | 고정 | ❌ | TODO 보류 |
| EVIDENCE | 고정 | ❌ | 런타임 채증 기록. 미설계 |
| PLACE_EVIDENCE_RULE | 고정 | ❌ | 미설계 |
| PLACE_OBJECT_RULE | 고정 | ❌ | TODO 대기 중 |
| SLOT_TARGET_REF | 고정 | ❌ | 미설계 |

---

## 2. ERD 전체 테이블 — 필드 목록

### 고정층 (Fixed Layer)

#### SCENARIO
| 필드 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | |
| objective_id | FK | → LEARNING_OBJECTIVE |
| grade_band_id | FK | → GRADE_BAND |
| case_type_id | FK | → CASE_TYPE |
| title | string | |

#### CONFIG
| 필드 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | |
| scenario_id | FK | → SCENARIO |
| evidence_damage_rate | int | |
| suspect_count | int | |
| experience_time | int | |

#### GRADE_BAND
| 필드 | 타입 | 비고 |
|---|---|---|
| id | int PK | |
| name | string | |
| vocab_level | int | |
| max_evidence | int | |
| pass_threshold | int | |

#### NPC
| 필드 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | |
| scenario_id | FK | → SCENARIO |
| npc_kind | string | suspect / witness / briefer / target_character |
| name | string | |

#### SOLUTION
| 필드 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | |
| scenario_id | FK | → SCENARIO |
| culprit_npc_id | FK | → NPC |
| correct_inference | string | |

#### SOLUTION_CLUE
| 필드 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | |
| solution_id | FK | → SOLUTION |
| evidence_def_id | FK | → EVIDENCE_DEF |
| reasoning_link | string | |

#### EVIDENCE_DEF
| 필드 | 타입 | 비고 |
|---|---|---|
| id | int PK | |
| name | string | |

#### GENERATION_SLOT
| 필드 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | |
| scenario_id | FK | → SCENARIO |
| slot_key | string | S1~S5 |
| slot_kind | string | scene_narrative 등 |
| generation_order | int | 실행 순서 |
| target_field | string | 결과 저장 경로 |
| variable_axis | string | grade_band / suspect / evidence |
| fallback_payload | json | AI 실패 시 대체값 |

#### GENERATION_CONSTRAINT
| 필드 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | |
| slot_id | FK | → GENERATION_SLOT |
| rule_type | string | |
| rule_value | string | |

#### SLOT_TARGET_REF
| 필드 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | |
| slot_id | FK | → GENERATION_SLOT |
| ref_table | string | |
| ref_id | uuid | |

#### CASE_TYPE
| 필드 | 타입 | 비고 |
|---|---|---|
| id | int PK | |
| name | string | |

#### CASE_JOB_RULE
| 필드 | 타입 | 비고 |
|---|---|---|
| case_type_id | FK | → CASE_TYPE |
| job_id | FK | → JOB |

#### CASE_EVIDENCE_RULE
| 필드 | 타입 | 비고 |
|---|---|---|
| case_type_id | FK | → CASE_TYPE |
| evidence_def_id | FK | → EVIDENCE_DEF |

#### CASE_TARGET_RULE
| 필드 | 타입 | 비고 |
|---|---|---|
| case_type_id | FK | → CASE_TYPE |
| allowed_target_type | string | |

> ⚠️ ERD 오류: 다이어그램에 `CASE_TYPE ||--|| CASE_TARGET_RULE` (1:1)로 표시되어 있으나 1:N이어야 함. PK도 누락.

#### LEARNING_OBJECTIVE
| 필드 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | |
| objective_def_id | FK | → OBJECTIVE_DEF |
| custom_text | string | |
| input_type | string | 선택형 / 문장형 |

#### OBJECTIVE_DEF
| 필드 | 타입 | 비고 |
|---|---|---|
| id | int PK | |
| name | string | |
| rubric_hint | string | AI 채점 기준 힌트 |

#### STAGE
| 필드 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | |
| scenario_id | FK | → SCENARIO |
| step_no | FK | → PROCESS_DEF |
| place_id | FK | → PLACE |
| job_id | FK | → JOB |

#### PROCESS_DEF
| 필드 | 타입 | 비고 |
|---|---|---|
| step_no | int PK | COL=1, ANL=2, INF=3 |
| name | string | |

#### JOB
| 필드 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | |
| process_step | FK | → PROCESS_DEF |
| name | string | |

#### PLACE
| 필드 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | |
| category_step | FK | → PLACE_CATEGORY |
| name | string | |
| mood | string | |
| space_count | int | |

#### PLACE_CATEGORY
| 필드 | 타입 | 비고 |
|---|---|---|
| step_no | int PK | |
| slot | string | |

#### SPACE
| 필드 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | |
| place_id | FK | → PLACE |
| name | string | |

#### TARGET
| 필드 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | |
| place_id | FK | → PLACE |
| type | string | |
| object_value | string | |
| npc_id | FK | → NPC (nullable) |

#### EVIDENCE
| 필드 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | |
| stage_id | FK | → STAGE |
| evidence_def_id | FK | → EVIDENCE_DEF |

#### PLACE_EVIDENCE_RULE
| 필드 | 타입 | 비고 |
|---|---|---|
| place_id | FK | → PLACE |
| evidence_def_id | FK | → EVIDENCE_DEF |

#### PLACE_OBJECT_RULE
| 필드 | 타입 | 비고 |
|---|---|---|
| place_id | FK | → PLACE |
| case_type_id | FK | → CASE_TYPE |
| object_value | string | |

### 런타임층 (Runtime Layer) — 백엔드(FastAPI) 관리

#### PLAY_SESSION
| 필드 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | |
| scenario_id | FK | → SCENARIO |
| anon_token | string | |
| started_at | timestamp | |
| ended_at | timestamp | |

#### GENERATED_CONTENT
| 필드 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | |
| session_id | FK | → PLAY_SESSION |
| slot_id | FK | → GENERATION_SLOT |
| content | json | |
| passed_validation | boolean | |
| retry_count | int | |
| used_fallback | boolean | |

#### PLAY_RESULT
| 필드 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | |
| session_id | FK | → PLAY_SESSION |
| accused_npc_id | FK | → NPC |
| chosen_inference | string | |
| score | int | |
| is_correct | boolean | |

> ⚠️ ERD 오류: 다이어그램에 `PLAY_RESULT }o--|| SOLUTION` 관계선이 있으나 `solution_id` FK 필드가 PLAY_RESULT에 없음.

---

## 3. fixedLayer.json 현재 구조

```
fixedLayer.json
├── scenario                     ← SCENARIO (부분)
│   ├── id
│   ├── title
│   ├── grade_band_id            ← "A"/"B"/"C" 문자열 (GRADE_BAND 테이블 미구현)
│   └── case_type_id             ← FK → caseTypes[].id
│
├── config                       ← CONFIG (구조 상이)
│   ├── A: { label, evidence_damage_rate, suspect_count, experience_time, evidence_count }
│   ├── B: { ... }               ← ERD: 단일행(scenario_id FK). 현재: grade_band별 딕셔너리
│   └── C: { ... }               ← ERD에 없는 label, evidence_count 포함
│
├── caseTypes[]                  ← CASE_TYPE
│   └── { id, name, description* }   (* ERD에 없는 추가 필드)
│
├── caseJobRules[]               ← CASE_JOB_RULE (부분)
│   └── { id, case_type_id, job_keyword* }  (* ERD: job_id FK. 현재: 자유 문자열)
│
├── caseEvidenceRules[]          ← CASE_EVIDENCE_RULE (부분)
│   └── { id, case_type_id, evidence_category* }  (* ERD: evidence_def_id FK. 현재: 자유 문자열)
│
├── caseTargetRules[]            ← CASE_TARGET_RULE ✅
│   └── { id, case_type_id, allowed_target_type }
│
├── npcList[]                    ← NPC (부분)
│   └── { id, name, npc_kind, profile* }  (* ERD에 없는 추가 필드)
│
├── solution                     ← SOLUTION (부분)
│   ├── culprit_npc_id
│   └── correct_inference
│                                ← ERD의 id, scenario_id FK 없음
│
├── solutionClues[]              ← SOLUTION_CLUE (부분)
│   └── { id, evidence_def_id, reasoning_link }
│                                ← ERD의 solution_id FK 없음
│
├── evidenceDefs[]               ← EVIDENCE_DEF + 3D 게임 확장
│   └── { id, name, file*, colliderSize*, miniGame* }
│                                (* 3D 전용 확장 필드 — ERD에 없음)
│
├── generationSlots[]            ← GENERATION_SLOT (부분)
│   └── { id, slot_key, slot_kind, generation_order, target_field, variable_axis, fallback_payload }
│                                ← ERD의 scenario_id FK 없음
│
└── generationConstraints[]      ← GENERATION_CONSTRAINT ✅
    └── { id, slot_id, rule_type, rule_value }
```

---

## 4. 알려진 불일치 및 의도적 발산

### ERD 자체 오류
| 위치 | 오류 내용 |
|---|---|
| `CASE_TYPE ||--\|\| CASE_TARGET_RULE` | 1:1로 표시, 1:N이어야 함. PK 필드도 누락 |
| `PLAY_RESULT }o--\|\| SOLUTION` | 관계선 있으나 `PLAY_RESULT` 필드에 `solution_id` 없음 |

### 의도적 발산 (설계 결정)

| 항목 | ERD 의도 | 현재 구현 | 이유 |
|---|---|---|---|
| CONFIG 구조 | 시나리오당 단일행 | grade_band A/B/C 딕셔너리 | 하나의 시나리오로 전 학년 지원 |
| CASE_JOB_RULE | `job_id FK` → JOB 테이블 | `job_keyword` 자유 문자열 | JOB 테이블 미구현 상태에서 우선 운영 |
| CASE_EVIDENCE_RULE | `evidence_def_id FK` | `evidence_category` 자유 문자열 | 동일 이유 |
| EVIDENCE_DEF | `id, name` 2필드 | + `file`, `colliderSize`, `miniGame` | 3D 씬 운용에 필요한 프론트엔드 확장 |
| NPC | `id, scenario_id, npc_kind, name` | + `profile` | 직업/역할 텍스트 편의 필드 |
| CASE_TYPE | `id, name` | + `description` | 어드민 UI 편의 필드 |
