# TODO

> 마지막 업데이트: 2026-06-26 (2단계 완료)

---

## 🔄 진행 중

<!-- 현재 작업 중인 항목 -->
---

## 📋 대기 중

<!-- 실행 가능하며 아직 시작하지 않은 항목 -->
- [ ] space 추가하여 onclick으로 방 전환할 때, 양 방에서 동일 object 배치 시 scale 변화 +@ 관측

<details>
<summary>📌 관리자 에디터 + 가상 생성층 (미완료 3 / 11)</summary>

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

- [ ] `src/services/mockGenerator.js` 구현 (고정층 로드 → position 프리셋 배정 → GENERATED_CONTENT 반환)
- [ ] 미리보기 페이지 (mock 생성 결과 확인 — 어떤 증거물이 어디 배치되는지)
- [ ] `SceneWrapper.jsx` 연결 (하드코딩 `INITIAL_EVIDENCES` → mockGenerator 결과로 교체)

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
- [x] 관리자 에디터 2단계 — 에디터 페이지 5종 (시나리오 · NPC · 정답 · 증거물 · 슬롯)
