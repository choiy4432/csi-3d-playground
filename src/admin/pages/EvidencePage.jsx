import { useState } from 'react'
import { Card, Field, SaveBar, IconBtn, S, btn, badge } from '../shared.jsx'

const EMPTY_EV = {
  id: '', name: '', file: '',
  colliderSize: [0.5, 1.0, 0.5],
  miniGame: { type: 'timing', label: '', difficulty: 'normal' },
}

function EvidenceModal({ ev, onClose, onConfirm }) {
  const [form, setForm] = useState(JSON.parse(JSON.stringify(ev)))

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const setCollider = (i, val) => {
    const s = [...form.colliderSize]
    s[i] = Number(val)
    setForm(f => ({ ...f, colliderSize: s }))
  }
  const setMG = (key, val) =>
    setForm(f => ({ ...f, miniGame: { ...f.miniGame, [key]: val } }))

  const changeType = (type) => {
    const base = { type, label: form.miniGame.label }
    setForm(f => ({
      ...f,
      miniGame: type === 'timing'
        ? { ...base, difficulty: 'normal' }
        : { ...base, target: 5, time: 8 },
    }))
  }

  const valid = form.id.trim() && form.name.trim() && form.file.trim() && form.miniGame.label.trim()

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
    }}>
      <div style={{
        background: '#fff', borderRadius: 10, padding: 28, width: 460,
        maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      }}>
        <h3 style={{ margin: '0 0 20px', fontSize: 15 }}>증거물 편집</h3>

        <Field label="ID">
          <input style={S.input} value={form.id} placeholder="ev-05"
            onChange={e => set('id', e.target.value)} />
        </Field>
        <Field label="이름">
          <input style={S.input} value={form.name}
            onChange={e => set('name', e.target.value)} />
        </Field>
        <Field label="GLB 파일" hint="public/models/ 기준 파일명">
          <input style={S.input} value={form.file} placeholder="EvidenceName.glb"
            onChange={e => set('file', e.target.value)} />
        </Field>
        <Field label="콜라이더 크기 (W × H × D)">
          <div style={{ display: 'flex', gap: 8 }}>
            {['W', 'H', 'D'].map((axis, i) => (
              <div key={axis} style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 3 }}>{axis}</label>
                <input type="number" step="0.1" min="0.1"
                  style={S.input}
                  value={form.colliderSize[i]}
                  onChange={e => setCollider(i, e.target.value)}
                />
              </div>
            ))}
          </div>
        </Field>

        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', marginBottom: 12 }}>
            미니게임
          </p>
          <Field label="타입">
            <select style={S.select} value={form.miniGame.type} onChange={e => changeType(e.target.value)}>
              <option value="timing">timing — 슬라이딩 바</option>
              <option value="rapidclick">rapidclick — 연타</option>
            </select>
          </Field>
          <Field label="라벨 (채증 동작 설명)">
            <input style={S.input} value={form.miniGame.label}
              onChange={e => setMG('label', e.target.value)} />
          </Field>
          {form.miniGame.type === 'timing' ? (
            <Field label="난이도">
              <select style={S.select} value={form.miniGame.difficulty} onChange={e => setMG('difficulty', e.target.value)}>
                <option value="easy">easy</option>
                <option value="normal">normal</option>
                <option value="hard">hard</option>
              </select>
            </Field>
          ) : (
            <>
              <Field label="목표 클릭 수 (target)">
                <input type="number" min={1} style={S.input}
                  value={form.miniGame.target ?? 5}
                  onChange={e => setMG('target', Number(e.target.value))} />
              </Field>
              <Field label="제한 시간 (초)">
                <input type="number" min={1} style={S.input}
                  value={form.miniGame.time ?? 8}
                  onChange={e => setMG('time', Number(e.target.value))} />
              </Field>
            </>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
          <button style={btn()} onClick={onClose}>취소</button>
          <button style={btn('primary')} disabled={!valid} onClick={() => onConfirm(form)}>
            확인
          </button>
        </div>
      </div>
    </div>
  )
}

export default function EvidencePage({ data, onSave }) {
  const [evidences, setEvidences] = useState(JSON.parse(JSON.stringify(data.evidenceDefs)))
  const [modal, setModal] = useState(null)
  const [saved, setSaved] = useState(false)

  const openEdit = (ev) => setModal({ ev: JSON.parse(JSON.stringify(ev)), isNew: false })
  const openAdd = () => setModal({ ev: JSON.parse(JSON.stringify(EMPTY_EV)), isNew: true })

  const handleConfirm = (updated) => {
    if (modal.isNew) {
      setEvidences(es => [...es, updated])
    } else {
      setEvidences(es => es.map(e => e.id === updated.id ? updated : e))
    }
    setModal(null)
  }

  const handleDelete = (id) => {
    if (!confirm('이 증거물을 삭제하시겠습니까?')) return
    setEvidences(es => es.filter(e => e.id !== id))
  }

  const handleSave = () => {
    onSave({ ...data, evidenceDefs: evidences })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <>
      {modal && (
        <EvidenceModal ev={modal.ev} onClose={() => setModal(null)} onConfirm={handleConfirm} />
      )}

      <Card
        title={`증거물 카탈로그 (${evidences.length})`}
        action={<button style={btn('primary')} onClick={openAdd}>+ 증거물 추가</button>}
      >
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>ID</th>
              <th style={S.th}>이름</th>
              <th style={S.th}>GLB 파일</th>
              <th style={S.th}>콜라이더 (W×H×D)</th>
              <th style={S.th}>미니게임</th>
              <th style={S.th}></th>
            </tr>
          </thead>
          <tbody>
            {evidences.map(ev => (
              <tr key={ev.id}>
                <td style={S.td}>
                  <code style={{ fontSize: 11, color: '#9399b2' }}>{ev.id}</code>
                </td>
                <td style={S.td}>{ev.name}</td>
                <td style={S.td}>
                  <code style={{ fontSize: 11 }}>{ev.file}</code>
                </td>
                <td style={S.td}>
                  {ev.colliderSize.join(' × ')}
                </td>
                <td style={S.td}>
                  <span style={badge(ev.miniGame.type === 'timing' ? 'blue' : 'yellow')}>
                    {ev.miniGame.type}
                  </span>
                  {' '}
                  <span style={{ color: '#52525b' }}>{ev.miniGame.label}</span>
                </td>
                <td style={S.td}>
                  <IconBtn icon="✏️" title="편집" onClick={() => openEdit(ev)} />
                  <IconBtn icon="🗑️" title="삭제" onClick={() => handleDelete(ev.id)} danger />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <SaveBar onSave={handleSave} saved={saved} />
    </>
  )
}
