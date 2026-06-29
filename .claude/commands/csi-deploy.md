CSI 프로덕션 배포를 실행합니다. dev → main 머지, semver 태그, Vercel 배포까지 단계별로 안내합니다.

$ARGUMENTS

---

## 실행 순서

아래 단계를 순서대로 수행한다.

### 1단계: 사전 점검

다음 명령을 실행해 현재 상태를 확인한다.

```bash
git branch                    # 현재 브랜치 확인 (dev여야 함)
git status                    # 미커밋 변경사항 확인
git log main..dev --oneline   # 이번 배포에 포함될 커밋 목록
```

점검 항목:
- [ ] 현재 브랜치가 `dev`인가?
- [ ] 미커밋 변경사항 없는가? (있으면 먼저 커밋하거나 stash)
- [ ] vitest 전체 통과 상태인가? (미실행 시 `npx vitest run` 실행)

### 2단계: semver 버전 결정

포함된 커밋 목록(`git log main..dev --oneline`)을 보고 아래 기준으로 버전을 결정한다.

| 커밋에 포함된 내용 | 올릴 자리 |
|---|---|
| 이전 버전과 호환 안 되는 구조 변경 (DB 스키마 파괴적 변경, API breaking change) | MAJOR |
| 새 기능 추가, 새 인터랙션 모듈, 새 admin 페이지 | MINOR |
| 버그 수정, 텍스트 수정, 성능 개선 | PATCH |

현재 최신 태그를 확인한다:
```bash
git tag --sort=-version:refname | head -5
```

결정한 버전을 사용자에게 제안하고 확인을 받는다.

### 3단계: 배포 실행

사용자 확인 후 아래 명령을 순서대로 실행한다.

```bash
git checkout main
git merge dev --no-ff -m "chore: release vX.Y.Z"
git push origin main
git tag vX.Y.Z -m "<배포 요약 한 줄>"
git push origin vX.Y.Z
git checkout dev
```

### 4단계: 배포 확인

- Vercel이 `main` 푸시를 감지해 자동 배포를 시작한다.
- 배포 URL: https://csi-3d-playground.vercel.app/
- 배포 완료 후 접속해 정상 동작 확인을 사용자에게 요청한다.

---

## 규칙

- 2단계(버전 결정)에서 반드시 사용자 확인을 받는다. 임의로 버전을 결정하고 진행하지 않는다.
- 1단계 점검에서 미커밋 변경사항이 있으면 배포를 중단하고 사용자에게 알린다.
- vitest 실패 상태에서 배포를 진행하지 않는다.
- 배포 후 `dev` 브랜치로 반드시 복귀한다.
