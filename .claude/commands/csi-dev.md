CSI 개발 작업을 오케스트레이션합니다. 기능 구현 완료 후 리뷰 에이전트와 QA를 순서대로 트리거합니다.

## 사용법

- `/csi-dev` — 현재 변경 사항 기준으로 리뷰 + QA 전체 실행
- `/csi-dev qa` — QA 에이전트 직접 호출 (리뷰 생략)
- `/csi-dev review` — 리뷰 에이전트만 실행 (QA 생략)
- `/csi-deploy` — 배포 체크리스트 + semver 태그 (별도 커맨드)

$ARGUMENTS

---

## 오케스트레이션 흐름

구현 완료 후 아래 순서로 에이전트를 호출한다.

### 1단계: 리뷰 에이전트 선택

수정된 파일을 확인하고 해당 에이전트를 호출한다. 여러 조건에 해당하면 모두 호출한다.

| 수정 파일 / 상황 | 에이전트 |
|---|---|
| `SceneWrapper.jsx`, `PlayerController.jsx`, `EvidenceObject.jsx`, `MiniGame.jsx` | `code-reviewer` |
| `backend/services/`, `backend/routers/` 하위 | `code-reviewer` |
| `src/components/interaction/` 하위 (COL/ANL/INF 모듈) | `interaction-reviewer` → `code-reviewer` 순서 |
| API 응답 구조 또는 컴포넌트 props 변경 | `type-checker` |
| `backend/migrations/` 파일 생성·수정 | `db-migration-reviewer` |
| LLM 프롬프트 문자열 수정 | `prompt-reviewer` |

### 2단계: QA 트리거 (리뷰 완료 직후)

각 리뷰 에이전트 완료 직후 `qa` 에이전트를 호출한다.

QA에 전달할 컨텍스트:
- 수정된 파일 목록
- 리뷰 에이전트 결과 (이상 없음 / 지적 사항)
- 검증이 필요한 경계면 (예: `mockGenerator → SceneWrapper 증거 배치 흐름`)

### 3단계: 결과 요약

```
✅ code-reviewer — 이상 없음
✅ QA — 9/9 테스트 통과, 품질 게이트 통과
→ 다음 작업: ...
```

---

## 직접 QA 호출 조건

사용자가 아래 표현 중 하나를 사용하면 리뷰 없이 `qa` 에이전트를 직접 호출한다:

- "QA 해줘", "품질 게이트 확인해줘", "검증해줘", "테스트 돌려줘"

---

## 규칙

- QA FAIL 시 결과를 보고하고, 수정 후 `/csi-dev qa` 로 재검증을 제안한다.
- PostToolUse vitest 훅(자동)과 역할이 다르다: 훅은 유닛 테스트 자동 실행, QA 에이전트는 경계면 교차 검증 + 품질 게이트 체크리스트 담당.
- 리뷰 에이전트를 건너뛰고 QA만 먼저 호출하지 않는다 (단, `/csi-dev qa` 직접 호출 시 예외).
