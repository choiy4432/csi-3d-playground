import { useState } from 'react'
import { C } from '../shared.jsx'
import { SCENE_SCENARIOS, ROOMS, loadRoomScenarios, saveRoomScenarios } from '../../constants/sceneScenarios'

// 씬 무드 프리뷰 스와치 색상 — 실제 3D 조명을 표현하는 콘텐츠. 다크 톤 변환 대상 아님.
const PREVIEW_COLORS = {
  night:       { bg: '#0a0a1a', accent: '#2233aa' },
  fresh_crime: { bg: '#1a0000', accent: '#ff2200' },
  forensic:    { bg: '#e8f4ff', accent: '#4488cc' },
  tense:       { bg: '#1a0800', accent: '#ff4400' },
}

const S = {
  roomSection: {
    marginBottom: 28,
    padding: '22px 24px',
    background: C.surface,
    border: `1px solid ${C.line}`,
    borderRadius: 14,
    boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 18px 40px -28px rgba(0,0,0,0.8)',
  },
  roomLabel: {
    fontSize: 13, fontWeight: 700, color: C.txt,
    marginBottom: 4,
  },
  roomSub: {
    fontSize: 12, color: C.txtMute, marginBottom: 14,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: 10,
  },
  card: (active) => ({
    border: `1px solid ${active ? C.accentBd : C.line}`,
    borderRadius: 12,
    cursor: 'pointer',
    overflow: 'hidden',
    background: active ? C.accentBg : 'rgba(255,255,255,0.04)',
    transition: 'border-color 0.4s cubic-bezier(0.32,0.72,0,1), box-shadow 0.4s cubic-bezier(0.32,0.72,0,1)',
    boxShadow: active ? '0 0 0 3px rgba(185,164,240,0.18)' : 'none',
  }),
  defaultCard: (active) => ({
    border: `1px solid ${active ? C.accentBd : C.line}`,
    borderRadius: 12,
    cursor: 'pointer',
    overflow: 'hidden',
    background: active ? C.accentBg : 'rgba(255,255,255,0.04)',
    transition: 'border-color 0.4s cubic-bezier(0.32,0.72,0,1), box-shadow 0.4s cubic-bezier(0.32,0.72,0,1)',
    boxShadow: active ? '0 0 0 3px rgba(185,164,240,0.18)' : 'none',
  }),
  preview: (id) => ({
    height: 64,
    background: id ? (PREVIEW_COLORS[id]?.bg ?? '#111') : '#0a0a12',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }),
  dot: (id) => ({
    width: 20, height: 20, borderRadius: '50%',
    background: id ? (PREVIEW_COLORS[id]?.accent ?? '#888') : '#444',
    boxShadow: id ? `0 0 12px 6px ${PREVIEW_COLORS[id]?.accent ?? '#888'}` : 'none',
  }),
  cardBody: { padding: '9px 12px 11px' },
  cardLabel: (active) => ({
    fontSize: 13, fontWeight: 600,
    color: active ? C.accent : C.txt,
    marginBottom: 4,
  }),
  badge: (active) => ({
    display: 'inline-block', fontSize: 11, padding: '1px 8px',
    borderRadius: 999, fontWeight: 600,
    background: active ? C.accent : 'rgba(255,255,255,0.07)',
    color: active ? '#1b1530' : C.txtMute,
  }),
  note: {
    marginTop: 8, padding: 14, background: 'rgba(241,207,142,0.08)',
    border: '1px solid rgba(241,207,142,0.28)', borderRadius: 10,
    fontSize: 12, color: C.warn, lineHeight: 1.6,
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
