import fixedLayer from '../data/fixedLayer.json'

const STORAGE_KEY = 'csi_fixedLayer'
const PLACEMENTS_KEY = 'csi_placements'

// Room01.glb 플로어 기준 — 벽과 충분한 여백 확보
const ROOM_BOUNDS = { x: [-2.5, 2.5], z: [-3.5, 1.5] }

const POSITION_PRESETS = [
  [ 2.0, 0,  1.0],
  [-2.0, 0,  0.0],
  [ 1.0, 0, -3.0],
  [-1.5, 0, -2.5],
  [ 0.0, 0,  1.2],
  [ 2.2, 0, -1.5],
  [-2.2, 0, -1.0],
  [ 0.0, 0, -2.0],
].filter(([x, , z]) =>
  x >= ROOM_BOUNDS.x[0] && x <= ROOM_BOUNDS.x[1] &&
  z >= ROOM_BOUNDS.z[0] && z <= ROOM_BOUNDS.z[1]
)

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function loadFixedLayer() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : fixedLayer
  } catch {
    return fixedLayer
  }
}

export function generateEvidencePlacements(gradeBand, data) {
  const source = data ?? fixedLayer
  const band = gradeBand ?? source.scenario.grade_band_id
  const count = source.config[band].evidence_count

  if (count > POSITION_PRESETS.length) {
    console.warn(`evidence_count(${count}) > available presets(${POSITION_PRESETS.length})`)
  }

  const defs = shuffle([...source.evidenceDefs]).slice(0, count)
  const positions = shuffle([...POSITION_PRESETS]).slice(0, count)

  const result = defs.map((def, i) => ({
    id: i + 1,
    file: def.file,
    position: positions[i],
    colliderSize: def.colliderSize,
    collected: false,
    miniGame: def.miniGame,
  }))

  try { localStorage.setItem(PLACEMENTS_KEY, JSON.stringify(result)) } catch {}
  return result
}

export function loadPlacements(gradeBand, data) {
  try {
    const stored = localStorage.getItem(PLACEMENTS_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return generateEvidencePlacements(gradeBand, data)
}
