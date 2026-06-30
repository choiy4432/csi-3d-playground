// 멀티 시나리오 데이터 레이어 — localStorage 추상화.
//
// ⚠️ 이 파일의 인터페이스를 고정한다. 추후 Supabase(scenarios 테이블) 로 교체할 때
// 내부 구현만 바꾸고 호출부(AdminApp/mockGenerator)는 그대로 둔다.
// auth.js 와 동일한 전략.
//
// 데이터 모델:
//   csi_scenario_index      → [{ id, title, ownerId, visibility, updatedAt }, ...]  전역 인덱스
//   csi_scenario_{id}       → { ...fixedLayer 통째 }                                 시나리오별 데이터
//   csi_active_scenario_id  → "scn-xxxx"                                             플레이어 씬이 띄울 1개
//
// 조회 규칙: getScenarios(userId) 는 visibility==='public' 또는 ownerId===userId 만 반환.
// 권한: 공개 시나리오는 owner 만 편집(canEdit). 남은 복제(duplicate)로만 가져감.

import seed from '../data/fixedLayer.json'

const INDEX_KEY = 'csi_scenario_index'
const DATA_PREFIX = 'csi_scenario_'
const ACTIVE_KEY = 'csi_active_scenario_id'
// 증거물 배치 캐시 키 — mockGenerator 와 공유 (순환 의존 방지를 위해 여기서 export).
export const PLACEMENTS_KEY = 'csi_placements'

// 활성 시나리오가 바뀌면 이전 시나리오의 배치 캐시는 무효 — 제거해 재생성 유도.
function invalidatePlacements() {
  try {
    localStorage.removeItem(PLACEMENTS_KEY)
  } catch {
    /* noop */
  }
}

function genId() {
  return `scn-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

// ── 인덱스 ───────────────────────────────────────────────────
function loadIndex() {
  try {
    const raw = localStorage.getItem(INDEX_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveIndex(index) {
  try {
    localStorage.setItem(INDEX_KEY, JSON.stringify(index))
  } catch {
    /* noop */
  }
}

// ── 조회 ─────────────────────────────────────────────────────
// 공개 시나리오 + 본인 소유 시나리오만 반환 (최근 수정순)
export function getScenarios(userId) {
  return loadIndex()
    .filter((s) => s.visibility === 'public' || s.ownerId === userId)
    .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
}

// 인덱스 메타 1건 (없으면 null)
export function getScenarioMeta(id) {
  return loadIndex().find((s) => s.id === id) ?? null
}

// 시나리오 데이터(fixedLayer) 반환 (없으면 null)
export function getScenario(id) {
  try {
    const raw = localStorage.getItem(DATA_PREFIX + id)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// ── 생성/저장/삭제 ───────────────────────────────────────────
// 새 시나리오 생성 (fixedLayer.json seed 복제). 생성된 id 반환.
export function createScenario(userId, { title = '새 시나리오', visibility = 'private' } = {}) {
  const id = genId()
  const data = deepClone(seed)
  data.scenario = { ...data.scenario, id, title }

  // 데이터 저장 실패 시 인덱스에 push 하지 않음 (유령 항목 방지) → null 반환
  try {
    localStorage.setItem(DATA_PREFIX + id, JSON.stringify(data))
  } catch {
    return null
  }

  const index = loadIndex()
  index.push({ id, title, ownerId: userId, visibility, updatedAt: Date.now() })
  saveIndex(index)
  return id
}

// 기존 시나리오 복제 → 항상 호출자(userId) 소유의 비공개로 생성. 새 id 반환.
// 권한 가드: 공개 시나리오이거나 본인 소유인 것만 복제 가능 (남의 비공개 탈취 차단).
export function duplicateScenario(id, userId) {
  const meta = getScenarioMeta(id)
  if (!meta || (meta.visibility !== 'public' && meta.ownerId !== userId)) return null

  const src = getScenario(id)
  if (!src) return null

  const newId = genId()
  const data = deepClone(src)
  const title = `${data.scenario?.title ?? '시나리오'} (복제)`
  data.scenario = { ...data.scenario, id: newId, title }

  // 데이터 저장 실패 시 인덱스에 push 하지 않음
  try {
    localStorage.setItem(DATA_PREFIX + newId, JSON.stringify(data))
  } catch {
    return null
  }

  const index = loadIndex()
  index.push({ id: newId, title, ownerId: userId, visibility: 'private', updatedAt: Date.now() })
  saveIndex(index)
  return newId
}

// 시나리오 데이터 저장 + 인덱스 title/updatedAt 동기화.
// 인덱스에 없는 id(삭제됨 등)는 저장 거부 → 유령 데이터 부활 방지. 성공 시 true.
export function saveScenario(id, data) {
  const index = loadIndex()
  const meta = index.find((s) => s.id === id)
  if (!meta) return false

  try {
    localStorage.setItem(DATA_PREFIX + id, JSON.stringify(data))
  } catch {
    return false
  }

  meta.title = data.scenario?.title ?? meta.title
  meta.updatedAt = Date.now()
  saveIndex(index)
  return true
}

// 시나리오 삭제 (데이터 + 인덱스). 활성 시나리오였다면 활성 해제.
export function deleteScenario(id) {
  try {
    localStorage.removeItem(DATA_PREFIX + id)
  } catch {
    /* noop */
  }
  saveIndex(loadIndex().filter((s) => s.id !== id))
  // 활성이었으면 해제 (setActiveScenarioId 가 배치 캐시도 무효화)
  if (getActiveScenarioId() === id) setActiveScenarioId(null)
}

// 공개/비공개 전환
export function setVisibility(id, visibility) {
  const index = loadIndex()
  const meta = index.find((s) => s.id === id)
  if (meta) {
    meta.visibility = visibility
    saveIndex(index)
  }
}

// ── 활성 시나리오 (플레이어 씬이 보는 1개) ────────────────────
export function getActiveScenarioId() {
  try {
    return localStorage.getItem(ACTIVE_KEY) || null
  } catch {
    return null
  }
}

export function setActiveScenarioId(id) {
  try {
    if (id) localStorage.setItem(ACTIVE_KEY, id)
    else localStorage.removeItem(ACTIVE_KEY)
  } catch {
    /* noop */
  }
  // 활성 시나리오가 바뀌었으니 이전 배치 캐시 무효화 (플레이어가 옛 증거 보는 버그 방지)
  invalidatePlacements()
}

// ── 권한 ─────────────────────────────────────────────────────
// owner 만 편집 가능. meta 는 인덱스 항목({ ownerId, ... }).
export function canEdit(meta, userId) {
  return !!meta && meta.ownerId === userId
}
