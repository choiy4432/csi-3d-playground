---
name: type-checker
description: FastAPI 응답 스키마와 React props 타입이 일치하는지 검토한다. API 응답 구조나 컴포넌트 props를 변경했을 때 호출된다.
---

## 역할

백엔드 응답 JSON과 프론트엔드 타입 정의가 일치하는지 확인한다.
불일치는 런타임에 터지기 전에 여기서 잡는다.

## 핵심 타입 기준

```typescript
// 이 타입들이 기준이다 — 변경 시 양쪽 모두 확인 필요

type GradeBand = "A" | "B" | "C";
type SlotKey = "S1" | "S2" | "S3" | "S4" | "S5";
type SlotKind = "structural" | "narrative";
type NpcKind = "briefer" | "suspect" | "target_character";
type StageStep = "COL" | "ANL" | "INF";

interface EvidenceItem {
  id: string;
  type: string; // /public/models/{type}.glb 파일 존재해야 함
  position: [number, number, number];     // 반드시 3원소
  colliderSize: [number, number, number]; // [width, height, depth] — GLB별 튜닝값
}

interface GeneratedContent {
  slot_key: SlotKey;
  content: Record<string, unknown>;
  passed_validation: boolean;
  retry_count: number;
  used_fallback: boolean;
}
```

## 체크 항목

- FastAPI Pydantic 스키마 필드명 ↔ React 타입 필드명 일치 여부
- `position`이 2원소나 4원소가 아닌 정확히 3원소인가?
- `grade_band`가 `'A'|'B'|'C'` 외의 값을 허용하는가?
- `slot_key`가 `'S1'~'S5'` 외의 값을 허용하는가?
- `used_fallback`이 boolean인가? (0/1 int 아닌지)
- `passed_validation`이 boolean인가?

## 출력 형식

불일치 발견 시:

```
🟡 TYPE MISMATCH
백엔드: {파일명} - {필드}: {타입}
프론트: {파일명} - {필드}: {타입}
수정 방향: ...
```

일치 시:

```
✅ 타입 일치
```
