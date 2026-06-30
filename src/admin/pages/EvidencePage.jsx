import { useState } from 'react'
import { Card, Field, SaveBar, IconBtn, S, btn, badge, C, TableEmpty } from '../shared.jsx'

const _MODEL_GLOB = import.meta.glob('../../../public/models/*.glb', { query: '?url', import: 'default', eager: true })
const AVAILABLE_MODELS = Object.keys(_MODEL_GLOB).map(p => p.split('/').pop()).sort()

const MINIGAME_OPTIONS = [
  { value: 'timing',     label: '정밀 조작 (슬라이딩 바)' },
  { value: 'rapidclick', label: '반복 클릭 (연타)' },
]
const MINIGAME_LABEL = { timing: '정밀 조작', rapidclick: '반복 클릭' }
const MINIGAME_COLOR = { timing: 'blue', rapidclick: 'yellow' }

const DIFFICULTY_OPTIONS = [
  { value: 'easy',   label: '쉬움' },
  { value: 'normal', label: '보통' },
  { value: 'hard',   label: '어려움' },
]

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
        background: C.surface, borderRadius: 10, padding: 28, width: 460,
        maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      }}>
        <h3 style={{ margin: '0 0 20px', fontSize: 15, color: C.txt }}>증거물 편집</h3>

        <Field label="증거물 이름">
          <input style={S.input} value={form.name}
            onChange={e => set('name', e.target.value)} />
        </Field>
        <Field label="3D 모델 파일" hint="public/models/ 폴더에 있는 .glb 파일을 선택하세요.">
          <select style={S.select} value={form.file} onChange={e => set('file', e.target.value)}>
            <option value="">— 파일 선택 —</option>
            {AVAILABLE_MODELS.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </Field>
        <Field
          label="충돌 영역 크기 (가로 × 높이 × 깊이)"
          hint="3D 공간에서 학생이 클릭할 수 있는 영역의 크기입니다. 물체가 크면 값을 늘려주세요."
        >
          <div style={{ display: 'flex', gap: 8 }}>
            {['가로', '높이', '깊이'].map((axis, i) => (
              <div key={axis} style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: C.txtMute, display: 'block', marginBottom: 3 }}>{axis}</label>
                <input type="number" step="0.1" min="0.1"
                  style={S.input}
                  value={form.colliderSize[i]}
                  onChange={e => setCollider(i, e.target.value)}
                />
              </div>
            ))}
          </div>
        </Field>

        <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.line}` }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.txtMute, textTransform: 'uppercase', marginBottom: 12 }}>
            채증 활동
          </p>
          <Field label="활동 유형" hint="학생이 이 증거물을 채증할 때 진행할 미니게임 방식입니다.">
            <select style={S.select} value={form.miniGame.type} onChange={e => changeType(e.target.value)}>
              {MINIGAME_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
          <Field label="활동 안내 문구" hint="미니게임 화면에 표시될 짧은 설명입니다.">
            <input style={S.input} value={form.miniGame.label}
              placeholder="예: 지문 파우더 도포"
              onChange={e => setMG('label', e.target.value)} />
          </Field>
          {form.miniGame.type === 'timing' ? (
            <Field label="난이도">
              <select style={S.select} value={form.miniGame.difficulty} onChange={e => setMG('difficulty', e.target.value)}>
                {DIFFICULTY_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
          ) : (
            <>
              <Field label="목표 클릭 횟수" hint="학생이 이 횟수만큼 클릭하면 채증 성공입니다.">
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
        title={`증거물 목록 (${evidences.length}개)`}
        action={<button style={btn('primary')} onClick={openAdd}>+ 증거물 추가</button>}
      >
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>이름</th>
              <th style={S.th}>3D 모델</th>
              <th style={S.th}>크기 (가로×높이×깊이)</th>
              <th style={S.th}>채증 활동</th>
              <th style={S.th}></th>
            </tr>
          </thead>
          <tbody>
            {evidences.length === 0 && (
              <TableEmpty
                colSpan={5}
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                }
                title="등록된 증거물이 없어요"
                hint="증거물을 추가하면 학생이 3D 씬에서 채증할 수 있어요."
                action={<button style={btn('primary')} onClick={openAdd}>+ 증거물 추가</button>}
              />
            )}
            {evidences.map(ev => (
              <tr key={ev.id}>
                <td style={S.td}>{ev.name}</td>
                <td style={S.td}>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#d6d5e0' }}>{ev.file}</span>
                </td>
                <td style={S.td}>
                  {ev.colliderSize.join(' × ')}
                </td>
                <td style={S.td}>
                  <span style={badge(MINIGAME_COLOR[ev.miniGame.type] ?? 'gray')}>
                    {MINIGAME_LABEL[ev.miniGame.type] ?? ev.miniGame.type}
                  </span>
                  {' '}
                  <span style={{ color: C.txtDim }}>{ev.miniGame.label}</span>
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
