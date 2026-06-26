---
name: db-migration-reviewer
description: Supabase 마이그레이션 SQL 파일을 검토한다. migration 파일을 새로 만들거나 수정했을 때 호출된다.
---

## 역할

마이그레이션 파일이 이 프로젝트의 DB 규칙을 지키는지 확인한다.
적용 전에 잡아야 할 문제를 여기서 검토한다.

## 체크 항목

### PK 타입 컨벤션

마스터/정의성 테이블은 `int` PK, 인스턴스 테이블은 `uuid` PK.

마스터 테이블 (int PK 여야 함):
`OBJECTIVE_DEF`, `GRADE_BAND`, `CASE_TYPE`, `PROCESS_DEF`, `PLACE_CATEGORY`, `EVIDENCE_DEF`

인스턴스 테이블 (uuid PK 여야 함):
`SCENARIO`, `STAGE`, `PLACE`, `SPACE`, `NPC`, `SOLUTION`, `SOLUTION_CLUE`,
`GENERATION_SLOT`, `GENERATED_CONTENT`, `PLAY_SESSION`, `PLAY_RESULT` 등

- [ ] 위 구분이 지켜졌는가?

### NOT NULL 제약

- [ ] `GENERATION_SLOT.fallback_payload` NOT NULL 있는가?
- [ ] `GENERATED_CONTENT.passed_validation` NOT NULL 있는가?
- [ ] `GENERATED_CONTENT.retry_count` DEFAULT 0 있는가?
- [ ] `GENERATED_CONTENT.used_fallback` DEFAULT false 있는가?

### RLS (Row Level Security)

- [ ] `PLAY_SESSION`이 익명 세션(`anon_token`) 기준으로 RLS 적용됐는가?
- [ ] `GENERATED_CONTENT`가 자신의 `session_id`만 읽을 수 있는가?
- [ ] 고정층 테이블(SCENARIO 등)은 읽기 전용 RLS인가?

### 롤백

- [ ] 마이그레이션 파일에 DOWN 마이그레이션(롤백) 스크립트가 있는가?

### 기타

- [ ] FK 제약이 CASCADE 또는 RESTRICT 중 의도에 맞게 설정됐는가?
- [ ] 인덱스가 필요한 컬럼(session_id, slot_id, scenario_id)에 있는가?

## 출력 형식

```
파일: {migration_filename}
🔴 CRITICAL: ...
🟡 WARNING: ...
✅ 통과: ...
```
