import { useState } from 'react'
import { C, Card, IconBtn, S, btn, badge, TableEmpty } from '../shared.jsx'

const KIND_OPTIONS = [
  { value: 'suspect',          label: '용의자' },
  { value: 'witness',          label: '목격자' },
  { value: 'briefer',          label: '안내자' },
  { value: 'target_character', label: '사건 대상' },
]
const KIND_LABEL = { suspect: '용의자', witness: '목격자', briefer: '안내자', target_character: '사건 대상' }
const KIND_COLOR = { suspect: 'blue', witness: 'green', briefer: 'purple', target_character: 'orange' }

const EMPTY = { id: '', name: '', npc_kind: 'suspect', profile: '' }

export default function NpcPage({ data, onSave }) {
  const [npcs, setNpcs] = useState([...data.npcList])
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [adding, setAdding] = useState(false)
  const [newForm, setNewForm] = useState({ ...EMPTY })
  const startEdit = (npc) => { setEditId(npc.id); setEditForm({ ...npc }) }
  const cancelEdit = () => { setEditId(null); setEditForm(null) }

  const commitEdit = () => {
    const updated = npcs.map(n => n.id === editId ? editForm : n)
    setNpcs(updated)
    onSave({ ...data, npcList: updated })
    cancelEdit()
  }

  const handleDelete = (id) => {
    if (!confirm('이 등장인물을 삭제하시겠습니까?')) return
    const updated = npcs.filter(n => n.id !== id)
    setNpcs(updated)
    onSave({ ...data, npcList: updated })
  }

  const handleAdd = () => {
    if (!newForm.name.trim()) return
    const id = `npc-${String(npcs.length + 1).padStart(2, '0')}`
    const updated = [...npcs, { ...newForm, id }]
    setNpcs(updated)
    onSave({ ...data, npcList: updated })
    setNewForm({ ...EMPTY })
    setAdding(false)
  }

  const suspects = npcs.filter(n => n.npc_kind === 'suspect').length
  const witnesses = npcs.filter(n => n.npc_kind === 'witness').length
  const briefers  = npcs.filter(n => n.npc_kind === 'briefer').length
  const targets   = npcs.filter(n => n.npc_kind === 'target_character').length

  return (
    <>
      <Card
        title={`등장인물 목록 (용의자 ${suspects}명 · 목격자 ${witnesses}명 · 안내자 ${briefers}명 · 사건대상 ${targets}명)`}
        action={
          <button style={btn('primary')} onClick={() => setAdding(a => !a)}>
            + 등장인물 추가
          </button>
        }
      >
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>이름</th>
              <th style={S.th}>구분</th>
              <th style={S.th}>직업 / 역할</th>
              <th style={S.th}></th>
            </tr>
          </thead>
          <tbody>
            {npcs.length === 0 && !adding && (
              <TableEmpty
                colSpan={4}
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="8" r="3.2" />
                    <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
                    <path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M17.5 19a5.5 5.5 0 0 0-2.2-4.4" />
                  </svg>
                }
                title="등장인물이 없어요"
                hint="용의자·목격자·안내자·사건 대상을 추가해 사건을 구성하세요."
                action={<button style={btn('primary')} onClick={() => setAdding(true)}>+ 등장인물 추가</button>}
              />
            )}
            {npcs.map(npc => (
              <tr key={npc.id}>
                {editId === npc.id ? (
                  <>
                    <td style={S.td}>
                      <input
                        style={S.input}
                        value={editForm.name}
                        onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                      />
                    </td>
                    <td style={S.td}>
                      <select
                        style={S.select}
                        value={editForm.npc_kind}
                        onChange={e => setEditForm(f => ({ ...f, npc_kind: e.target.value }))}
                      >
                        {KIND_OPTIONS.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </td>
                    <td style={S.td}>
                      <input
                        style={S.input}
                        value={editForm.profile}
                        onChange={e => setEditForm(f => ({ ...f, profile: e.target.value }))}
                      />
                    </td>
                    <td style={S.td}>
                      <IconBtn icon="✓" title="저장" onClick={commitEdit} />
                      <IconBtn icon="✕" title="취소" onClick={cancelEdit} />
                    </td>
                  </>
                ) : (
                  <>
                    <td style={S.td}>{npc.name}</td>
                    <td style={S.td}>
                      <span style={badge(KIND_COLOR[npc.npc_kind] ?? 'gray')}>
                        {KIND_LABEL[npc.npc_kind] ?? npc.npc_kind}
                      </span>
                    </td>
                    <td style={S.td}>{npc.profile}</td>
                    <td style={S.td}>
                      <IconBtn icon="✏️" title="편집" onClick={() => startEdit(npc)} />
                      <IconBtn icon="🗑️" title="삭제" onClick={() => handleDelete(npc.id)} danger />
                    </td>
                  </>
                )}
              </tr>
            ))}
            {adding && (
              <tr style={{ background: C.accentBg }}>
                <td style={S.td}>
                  <input
                    style={S.input}
                    placeholder="이름"
                    value={newForm.name}
                    onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))}
                  />
                </td>
                <td style={S.td}>
                  <select
                    style={S.select}
                    value={newForm.npc_kind}
                    onChange={e => setNewForm(f => ({ ...f, npc_kind: e.target.value }))}
                  >
                    {KIND_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </td>
                <td style={S.td}>
                  <input
                    style={S.input}
                    placeholder="직업 / 역할"
                    value={newForm.profile}
                    onChange={e => setNewForm(f => ({ ...f, profile: e.target.value }))}
                  />
                </td>
                <td style={S.td}>
                  <IconBtn icon="✓" title="추가" onClick={handleAdd} />
                  <IconBtn icon="✕" title="취소" onClick={() => setAdding(false)} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </>
  )
}
