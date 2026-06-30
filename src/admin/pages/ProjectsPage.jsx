import { useState } from 'react'
import { C, Card, S, btn, badge, IconBtn, EmptyState } from '../shared.jsx'
import {
  getScenarios, createScenario, duplicateScenario, deleteScenario,
  setVisibility, getActiveScenarioId, setActiveScenarioId, canEdit,
} from '../../services/db.js'

const TABS = [
  { key: 'all',     label: '전체' },
  { key: 'mine',    label: '내 프로젝트' },
  { key: 'public',  label: '공개 프로젝트' },
]

function fmtDate(ts) {
  if (!ts) return '—'
  const d = new Date(ts)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export default function ProjectsPage({ userId, onOpen }) {
  const [tab, setTab] = useState('all')
  const [, force] = useState(0)
  const refresh = () => force((n) => n + 1)

  const activeId = getActiveScenarioId()
  const all = getScenarios(userId)
  const list = all.filter((s) => {
    if (tab === 'mine')   return s.ownerId === userId
    if (tab === 'public') return s.visibility === 'public'
    return true
  })

  const handleCreate = () => {
    const id = createScenario(userId, { title: '새 시나리오', visibility: 'private' })
    onOpen(id)
  }

  const handleDuplicate = (id) => {
    duplicateScenario(id, userId)
    refresh()
  }

  const handleDelete = (id, title) => {
    if (!window.confirm(`"${title}" 시나리오를 삭제할까요? 되돌릴 수 없습니다.`)) return
    deleteScenario(id)
    refresh()
  }

  const handleToggleVis = (s) => {
    setVisibility(s.id, s.visibility === 'public' ? 'private' : 'public')
    refresh()
  }

  const handleSetActive = (id) => {
    setActiveScenarioId(activeId === id ? null : id)
    refresh()
  }

  return (
    <Card
      title={`프로젝트 목록 — ${list.length}개`}
      action={<button style={btn('primary')} onClick={handleCreate}>+ 새 프로젝트</button>}
    >
      {/* 탭 */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            style={{ ...btn(tab === t.key ? 'primary' : 'ghost'), fontSize: 12, padding: '4px 14px' }}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
            </svg>
          }
          title={tab === 'mine' ? '아직 만든 프로젝트가 없어요' : tab === 'public' ? '공개된 프로젝트가 없어요' : '프로젝트가 비어 있어요'}
          hint="새 시나리오를 만들어 증거물·등장인물·정답을 구성해 보세요."
          action={
            tab !== 'public'
              ? <button style={btn('primary')} onClick={handleCreate}>+ 새 프로젝트 만들기</button>
              : null
          }
        />
      ) : (
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>제목</th>
              <th style={S.th}>소유</th>
              <th style={S.th}>공개</th>
              <th style={S.th}>플레이 활성</th>
              <th style={S.th}>수정일</th>
              <th style={{ ...S.th, textAlign: 'right' }}>액션</th>
            </tr>
          </thead>
          <tbody>
            {list.map((s) => {
              const mine = canEdit(s, userId)
              const isActive = activeId === s.id
              return (
                <tr key={s.id}>
                  <td style={S.td}>
                    {mine ? (
                      <button
                        className="csi-titlelink"
                        onClick={() => onOpen(s.id)}
                        style={{
                          background: 'none', border: 'none', padding: 0, textAlign: 'left',
                          fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
                          color: C.txt, cursor: 'pointer',
                        }}
                      >
                        {s.title}
                      </button>
                    ) : (
                      <strong>{s.title}</strong>
                    )}
                  </td>
                  <td style={S.td}>
                    {mine
                      ? <span style={badge('blue')}>나</span>
                      : <span style={{ fontSize: 12, color: C.txtMute }}>{s.ownerId}</span>}
                  </td>
                  <td style={S.td}>
                    <span style={badge(s.visibility === 'public' ? 'green' : 'gray')}>
                      {s.visibility === 'public' ? '공개' : '비공개'}
                    </span>
                  </td>
                  <td style={S.td}>
                    <button
                      style={{ ...btn(isActive ? 'primary' : 'ghost'), fontSize: 11, padding: '3px 10px' }}
                      onClick={() => handleSetActive(s.id)}
                      data-tip="학생 플레이 씬에 띄울 시나리오로 지정"
                    >
                      {isActive ? '● 활성' : '활성 지정'}
                    </button>
                  </td>
                  <td style={{ ...S.td, color: C.txtMute, fontSize: 12, whiteSpace: 'nowrap' }}>
                    {fmtDate(s.updatedAt)}
                  </td>
                  <td style={{ ...S.td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {!mine && (
                      <span style={{ fontSize: 11, color: C.txtFaint, marginRight: 6 }}>열람: 복제 후 편집</span>
                    )}
                    <IconBtn name="duplicate" title="복제" onClick={() => handleDuplicate(s.id)} />
                    {mine && (
                      <IconBtn
                        name={s.visibility === 'public' ? 'lock' : 'globe'}
                        title={s.visibility === 'public' ? '비공개로 전환' : '공개로 전환'}
                        onClick={() => handleToggleVis(s)}
                      />
                    )}
                    {mine && <IconBtn name="delete" title="삭제" onClick={() => handleDelete(s.id, s.title)} danger />}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </Card>
  )
}
