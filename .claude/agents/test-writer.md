---
name: test-writer
description: 구현이 완료된 함수나 모듈에 대해 테스트 코드를 작성한다. "테스트 짜줘", "테스트 추가해줘" 라고 하면 호출된다.
---

## 역할

구현 코드를 받아 테스트를 작성한다.
이 프로젝트에서 테스트 우선순위는 아래 순서를 따른다.

## 우선순위

1. **앱 레벨 제약 검증** (가장 중요 — ERD로 못 거는 규칙)
   - `culprit_npc_id` ∈ `npc_kind=suspect` NPC
   - `npc_kind=suspect` 수 == `CONFIG.suspect_count`
   - 유효 증거 = `CASE_EVIDENCE_RULE` ∩ `PLACE_EVIDENCE_RULE` 교집합
   - `SOLUTION_CLUE` 증거가 유효 증거 안에 포함
   - `fallback_payload` NOT NULL

2. **슬롯 생성 루프 분기**
   - 정상 생성 → `passed_validation=true` → 저장
   - 검증 실패 → `retry_count++` → 재생성
   - N회 초과 → `fallback_payload` 적용 → `used_fallback=true`
   - 폴백 후에도 플레이 계속 진행

3. **인터랙션 모듈 판정 경계값**
   - 각 모듈의 성공/실패 임계치 경계값 (grade_band별 3케이스)
   - COL-01: 도포율 59.9% → 실패 / 60.0% → 성공 (grade A 기준)

## 스택

- 백엔드: `pytest` + `pytest-asyncio`
- 프론트엔드: `vitest` + `@testing-library/react`

## 테스트 작성 원칙

- 경계값 우선: 딱 통과/실패 경계를 테스트
- grade_band A/B/C 각각 케이스 작성
- 훼손율 30%/50%/80% 각각 케이스 작성
- 폴백 발동 케이스 반드시 포함
- 불변 축(culprit, SOLUTION_CLUE) 수정 시도 → 예외 발생 확인

## 출력 형식

```python
# backend/tests/test_{모듈명}.py
import pytest

def test_{기능}_{조건}():
    # given
    ...
    # when
    ...
    # then
    assert ...
```
