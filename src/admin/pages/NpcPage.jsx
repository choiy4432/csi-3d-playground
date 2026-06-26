import { useState } from 'react'
import { Card, SaveBar, IconBtn, S, btn, badge } from '../shared.jsx'

const KINDS = ['suspect', 'witness']
const EMPTY = { id: '', name: '', npc_kind: 'suspect', profile: '' }

export default function NpcPage({ data, onSave }) {
  const [npcs, setNpcs] = useState([...data.npcList])
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [adding, setAdding] = useState(false)
  const [newForm, setNewForm] = useState({ ...EMPTY })
  const [saved, setSaved] = useState(false)

  const startEdit = (npc) => { setEditId(npc.id); setEditForm({ ...npc }) }
  const cancelEdit = () => { setEditId(null); setEditForm(null) }

  const commitEdit = () => {
    setNpcs(ns => ns.map(n => n.id === editId ? editForm : n))
    cancelEdit()
  }

  const handleDelete = (id) => {
    if (!confirm('이 NPC를 삭제하시겠습니까?')) return
    setNpcs(ns => ns.filter(n => n.id !== id))
  }

  const handleAdd = () => {
    if (!newForm.id.trim() || !newForm.name.trim()) return
    setNpcs(ns => [...ns, { ...newForm }])
    setNewForm({ ...EMPTY })
    setAdding(false)
  }

  const handleSave = () => {
    onSave({ ...data, npcList: npcs })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const suspects = npcs.filter(n => n.npc_kind === 'suspect').length
  const witnesses = npcs.filter(n => n.npc_kind === 'witness').length

  return (
    <>
      <Card
        title={`NPC 목록 (용의자 ${suspects} · 목격자 ${witnesses})`}
        action={
          <button style={btn('primary')} onClick={() => setAdding(a => !a)}>
            + NPC 추가
          </button>
        }
      >
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>ID</th>
              <th style={S.th}>이름</th>
              <th style={S.th}>구분</th>
              <th style={S.th}>프로필</th>
              <th style={S.th}></th>
            </tr>
          </thead>
          <tbody>
            {npcs.map(npc => (
              <tr key={npc.id}>
                {editId === npc.id ? (
                  <>
                    <td style={S.td}>
                      <code style={{ fontSize: 11, color: '#9399b2' }}>{npc.id}</code>
                    </td>
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
                        {KINDS.map(k => <option key={k}>{k}</option>)}
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
                    <td style={S.td}>
                      <code style={{ fontSize: 11, color: '#9399b2' }}>{npc.id}</code>
                    </td>
                    <td style={S.td}>{npc.name}</td>
                    <td style={S.td}>
                      <span style={badge(npc.npc_kind === 'suspect' ? 'blue' : 'green')}>
                        {npc.npc_kind}
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
              <tr style={{ background: '#f9f9ff' }}>
                <td style={S.td}>
                  <input
                    style={S.input}
                    placeholder="npc-06"
                    value={newForm.id}
                    onChange={e => setNewForm(f => ({ ...f, id: e.target.value }))}
                  />
                </td>
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
                    {KINDS.map(k => <option key={k}>{k}</option>)}
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

      <SaveBar onSave={handleSave} saved={saved} />
    </>
  )
}
