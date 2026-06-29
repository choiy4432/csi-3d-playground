export const DEFAULT_LIGHTING = {
  ambient: 0.4,
  points: [
    { intensity: 15, color: '#ffffff' },
    { intensity: 8,  color: '#ffe8c0' },
    { intensity: 8,  color: '#ffe8c0' },
  ],
}

export const SCENE_SCENARIOS = [
  {
    id: 'night',
    label: '야간 수사',
    lighting: {
      ambient: 0.03,
      points: [
        { intensity: 3,  color: '#2233aa' },
        { intensity: 1.5, color: '#112266' },
        { intensity: 1.5, color: '#112266' },
      ],
      roomLight: { color: '#1122aa', intensity: 3 },
    },
    override: {
      brokenGlass: { emissive: '#0011aa', emissiveIntensity: 0.6 },
      floor:       { emissive: '#000011', emissiveIntensity: 0.0, color: '#050308' },
      roofGlass:   { opacity: 0.05 },
    },
  },
  {
    id: 'fresh_crime',
    label: '범행 직후',
    lighting: {
      ambient: 0.06,
      points: [
        { intensity: 6,  color: '#ff2200' },
        { intensity: 3,  color: '#aa1100' },
        { intensity: 3,  color: '#aa1100' },
      ],
      roomLight: { color: '#aa1100', intensity: 4 },
    },
    override: {
      brokenGlass: { emissive: '#ff2200', emissiveIntensity: 2.5 },
      floor:       { emissive: '#1a0000', emissiveIntensity: 0.4 },
      roofGlass:   { opacity: 0.15, emissive: '#330000', emissiveIntensity: 0.8 },
    },
  },
  {
    id: 'forensic',
    label: '법의학 조명',
    lighting: {
      ambient: 0.8,
      points: [
        { intensity: 25, color: '#ddeeff' },
        { intensity: 14, color: '#cceeff' },
        { intensity: 14, color: '#cceeff' },
      ],
      roomLight: { color: '#cceeff', intensity: 18 },
    },
    override: {
      brokenGlass: { emissive: '#aaddff', emissiveIntensity: 1.5 },
      floor:       { emissive: '#112233', emissiveIntensity: 0.3 },
      roofGlass:   { opacity: 0.8, emissive: '#aaddff', emissiveIntensity: 0.5 },
    },
  },
  {
    id: 'tense',
    label: '긴장감',
    lighting: {
      ambient: 0.05,
      points: [
        { intensity: 5,  color: '#ff4400' },
        { intensity: 2,  color: '#aa2200' },
        { intensity: 2,  color: '#aa2200' },
      ],
      roomLight: { color: '#aa3300', intensity: 3 },
    },
    override: {
      brokenGlass: { emissive: '#ff6600', emissiveIntensity: 2 },
      floor:       { emissive: '#220500', emissiveIntensity: 0.5 },
      roofGlass:   { opacity: 0.08, emissive: '#331100', emissiveIntensity: 0.5 },
    },
  },
]

export const SCENARIO_STORAGE_KEY = 'csi_active_scenario'

// localStorage 값 형식: { "1": "night", "2": "forensic", "3": null }
export const ROOMS = [
  { id: 1, label: '방 1 — 범죄 현장' },
  { id: 2, label: '방 2 — 분석실' },
  { id: 3, label: '방 3 — 용의자 대기실' },
]

export function loadRoomScenarios() {
  try {
    const stored = localStorage.getItem(SCENARIO_STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

export function saveRoomScenarios(map) {
  localStorage.setItem(SCENARIO_STORAGE_KEY, JSON.stringify(map))
}
