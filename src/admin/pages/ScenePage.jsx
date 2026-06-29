import { useState } from 'react'
import { SCENE_SCENARIOS, ROOMS, loadRoomScenarios, saveRoomScenarios } from '../../constants/sceneScenarios'

const PREVIEW_COLORS = {
  night:       { bg: '#0a0a1a', accent: '#2233aa' },
  fresh_crime: { bg: '#1a0000', accent: '#ff2200' },
  forensic:    { bg: '#e8f4ff', accent: '#4488cc' },
  tense:       { bg: '#1a0800', accent: '#ff4400' },
}

const S = {
  roomSection: {
    marginBottom: 32,
    padding: 20,
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: 10,
  },
  roomLabel: {
    fontSize: 13, fontWeight: 700, color: '#1a1a1a',
    marginBottom: 4,
  },
  roomSub: {
    fontSize: 12, color: '#9399b2', marginBottom: 14,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: 10,
  },
  card: (active) => ({
    border: `2px solid ${active ? '#cba6f7' : '#e0e0e0'}`,
    borderRadius: 8,
    cursor: 'pointer',
    overflow: 'hidden',
    background: active ? '#f5f0ff' : '#fafafa',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxShadow: active ? '0 0 0 3px rgba(203,166,247,0.25)' : 'none',
  }),
  defaultCard: (active) => ({
    border: `2px solid ${active ? '#cba6f7' : '#e0e0e0'}`,
    borderRadius: 8,
    cursor: 'pointer',
    overflow: 'hidden',
    background: active ? '#f5f0ff' : '#fafafa',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxShadow: active ? '0 0 0 3px rgba(203,166,247,0.25)' : 'none',
  }),
  preview: (id) => ({
    height: 64,
    background: id ? (PREVIEW_COLORS[id]?.bg ?? '#111') : '#1e1e2e',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }),
  dot: (id) => ({
    width: 20, height: 20, borderRadius: '50%',
    background: id ? (PREVIEW_COLORS[id]?.accent ?? '#888') : '#444',
    boxShadow: id ? `0 0 12px 6px ${PREVIEW_COLORS[id]?.accent ?? '#888'}` : 'none',
  }),
  cardBody: { padding: '8px 12px 10px' },
  cardLabel: (active) => ({
    fontSize: 13, fontWeight: 600,
    color: active ? '#7c3aed' : '#1a1a1a',
    marginBottom: 3,
  }),
  badge: (active) => ({
    display: 'inline-block', fontSize: 11, padding: '1px 7px',
    borderRadius: 10, fontWeight: 500,
    background: active ? '#cba6f7' : '#f0f0f0',
    color: active ? '#3b0764' : '#888',
  }),
  note: {
    marginTop: 8, padding: 14, background: '#fffbeb',
    border: '1px solid #fde68a', borderRadius: 8,
    fontSize: 12, color: '#78350f', lineHeight: 1.6,
  },
}

export default function ScenePage() {
  const [byRoom, setByRoom] = useState(loadRoomScenarios)

  function selectForRoom(roomId, scenarioId) {
    const next = { ...byRoom }
    if (next[roomId] === scenarioId) {
      delete next[roomId]
    } else {
      next[roomId] = scenarioId
    }
    setByRoom(next)
    saveRoomScenarios(next)
  }

  return (
    <div>
      {ROOMS.map((room) => {
        const active = byRoom[room.id] ?? null
        return (
          <div key={room.id} style={S.roomSection}>
            <div style={S.roomLabel}>{room.label}</div>
            <div style={S.roomSub}>
              적용 중: <strong>{active
                ? SCENE_SCENARIOS.find(s => s.id === active)?.label
                : '기본 조명'}</strong>
            </div>
            <div style={S.grid}>
              {/* 기본 조명 카드 */}
              <div
                style={S.defaultCard(!active)}
                onClick={() => active && selectForRoom(room.id, active)}
              >
                <div style={S.preview(null)}>
                  <div style={S.dot(null)} />
                </div>
                <div style={S.cardBody}>
                  <div style={S.cardLabel(!active)}>기본 조명</div>
                  <span style={S.badge(!active)}>{!active ? '● 적용 중' : '○ 미적용'}</span>
                </div>
              </div>

              {SCENE_SCENARIOS.map((s) => {
                const isActive = active === s.id
                return (
                  <div
                    key={s.id}
                    style={S.card(isActive)}
                    onClick={() => selectForRoom(room.id, s.id)}
                  >
                    <div style={S.preview(s.id)}>
                      <div style={S.dot(s.id)} />
                    </div>
                    <div style={S.cardBody}>
                      <div style={S.cardLabel(isActive)}>{s.label}</div>
                      <span style={S.badge(isActive)}>{isActive ? '● 적용 중' : '○ 미적용'}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      <div style={S.note}>
        각 방의 시나리오는 <code>localStorage</code>에 JSON 형태로 저장됩니다.
        플레이어가 방을 이동할 때 해당 방의 시나리오가 자동 적용됩니다.
      </div>
    </div>
  )
}
