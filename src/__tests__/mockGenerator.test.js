import { describe, it, expect, beforeEach } from 'vitest'
import { generateEvidencePlacements, ROOM_BOUNDS } from '../services/mockGenerator'
import fixedLayer from '../data/fixedLayer.json'

const GRADE_BANDS = Object.keys(fixedLayer.config) // ['A', 'B', 'C']
const RUNS = 50

beforeEach(() => {
  localStorage.clear()
})

describe('generateEvidencePlacements — 배치 위치 room 경계 검증', () => {
  it.each(GRADE_BANDS)('grade_band %s: %i회 생성 시 모든 오브젝트가 room 안에 있다', (band) => {
    for (let run = 0; run < RUNS; run++) {
      const placements = generateEvidencePlacements(band, fixedLayer)

      placements.forEach(({ id, position }) => {
        const [x, , z] = position
        expect(x, `run ${run + 1} / id ${id}: x(${x}) out of bounds`).toBeGreaterThanOrEqual(ROOM_BOUNDS.x[0])
        expect(x, `run ${run + 1} / id ${id}: x(${x}) out of bounds`).toBeLessThanOrEqual(ROOM_BOUNDS.x[1])
        expect(z, `run ${run + 1} / id ${id}: z(${z}) out of bounds`).toBeGreaterThanOrEqual(ROOM_BOUNDS.z[0])
        expect(z, `run ${run + 1} / id ${id}: z(${z}) out of bounds`).toBeLessThanOrEqual(ROOM_BOUNDS.z[1])
      })
    }
  })

  it.each(GRADE_BANDS)('grade_band %s: 생성 수가 evidence_count와 일치한다', (band) => {
    const expected = fixedLayer.config[band].evidence_count
    for (let run = 0; run < RUNS; run++) {
      const placements = generateEvidencePlacements(band, fixedLayer)
      expect(placements.length, `run ${run + 1}: count mismatch`).toBe(expected)
    }
  })

  it.each(GRADE_BANDS)('grade_band %s: 같은 위치에 두 오브젝트가 겹치지 않는다', (band) => {
    for (let run = 0; run < RUNS; run++) {
      const placements = generateEvidencePlacements(band, fixedLayer)
      const posKeys = placements.map(({ position: [x, , z] }) => `${x},${z}`)
      const unique = new Set(posKeys)
      expect(unique.size, `run ${run + 1}: duplicate positions detected`).toBe(placements.length)
    }
  })
})
