import { useState } from 'react'
import { Card, SaveBar, S, btn, badge } from '../shared.jsx'

const SLOT_KIND_OPTIONS = [
  { value: 'scene_narrative',    label: '사건 배경 설명' },
  { value: 'suspect_alibi',      label: '용의자 알리바이' },
  { value: 'npc_detail',         label: '등장인물 상세' },
  { value: 'evidence_placement', label: '증거물 배치' },
  { value: 'inference_prompt',   label: '추론 질문' },
]
const SLOT_KIND_LABEL = Object.fromEntries(SLOT_KIND_OPTIONS.map(o => [o.value, o.label]))

const AXIS_OPTIONS = [
  { value: 'grade_band', label: '학년별' },
  { value: 'suspect',    label: '용의자별' },
  { value: 'evidence',   label: '증거물별' },
]
const AXIS_LABEL = Object.fromEntries(AXIS_OPTIONS.map(o => [o.value, o.label]))

const SLOT_KEY_LABEL = {
  S1: '등장인물 설명', S2: '증거물 배치', S3: '사건 배경',
  S4: '알리바이', S5: '추론 질문',
}

function SlotRow({ slot, onChange }) {
  const [open, setOpen] = useState(false)
  const [jsonText, setJsonText] = useState(JSON.stringify(slot.fallback_payload, null, 2))
  const [jsonError, setJsonError] = useState('')

  const update = (key, val) => onChange({ ...slot, [key]: val })

  const handleJson = (val) => {
    setJsonText(val)
    try {
      onChange({ ...slot, fallback_payload: JSON.parse(val) })
      setJsonError('')
    } catch {
      setJsonError('JSON 문법 오류')
    }
  }

  return (
    <>
      <tr>
        <td style={{ ...S.td, textAlign: 'center', fontWeight: 700, color: '#52525b' }}>
          {slot.generation_order}
        </td>
        <td style={S.td}>
          <span style={{ ...badge('blue'), fontFamily: 'monospace', fontSize: 12 }}>
            {slot.slot_key}
          </span>
          {' '}
          <span style={{ fontSize: 12, color: '#71717a' }}>
            {SLOT_KEY_LABEL[slot.slot_key] ?? ''}
          </span>
        </td>
        <td style={S.td}>
          <select
            style={S.select}
            value={slot.slot_kind}
            onChange={e => update('slot_kind', e.target.value)}
          >
            {SLOT_KIND_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </td>
        <td style={S.td}>
          <select
            style={S.select}
            value={slot.variable_axis}
            onChange={e => update('variable_axis', e.target.value)}
          >
            {AXIS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </td>
        <td style={S.td}>
          <button
            style={{ ...btn(), fontSize: 11, padding: '3px 8px' }}
            onClick={() => setOpen(o => !o)}
          >
            {open ? '▲' : '▼'} 기본값
          </button>
        </td>
      </tr>
      {open && (
        <tr style={{ background: '#fafafa' }}>
          <td colSpan={5} style={{ padding: '4px 12px 12px 36px' }}>
            <p style={{ fontSize: 11, color: '#71717a', margin: '4px 0 4px' }}>
              AI 생성 실패 시 사용할 기본값 (JSON 형식)
            </p>
            <textarea
              style={{ ...S.textarea, height: 72 }}
              value={jsonText}
              onChange={e => handleJson(e.target.value)}
            />
            {jsonError && (
              <div style={{ color: '#dc2626', fontSize: 11, marginTop: 2 }}>{jsonError}</div>
            )}
          </td>
        </tr>
      )}
    </>
  )
}

export default function SlotsPage({ data, onSave }) {
  const [slots, setSlots] = useState(JSON.parse(JSON.stringify(data.generationSlots)))
  const [constraints] = useState(JSON.parse(JSON.stringify(data.generationConstraints)))
  const [saved, setSaved] = useState(false)

  const updateSlot = (updated) =>
    setSlots(ss => ss.map(s => s.id === updated.id ? updated : s))

  const sorted = [...slots].sort((a, b) => a.generation_order - b.generation_order)

  const handleSave = () => {
    onSave({ ...data, generationSlots: slots, generationConstraints: constraints })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <>
      <Card title="AI 생성 항목">
        <p style={{ fontSize: 13, color: '#52525b', marginBottom: 16 }}>
          학생이 게임에 진입할 때 AI가 자동으로 생성하는 항목들입니다.
          생성 순서대로 실행되며, 이전 결과가 다음 생성에 활용됩니다.
        </p>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={{ ...S.th, width: 60, textAlign: 'center' }}>순서</th>
              <th style={S.th}>항목</th>
              <th style={S.th}>생성 유형</th>
              <th style={S.th}>변형 기준</th>
              <th style={S.th}>기본값</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(slot => (
              <SlotRow key={slot.id} slot={slot} onChange={updateSlot} />
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="AI 생성 규칙">
        <p style={{ fontSize: 13, color: '#52525b', marginBottom: 16 }}>
          AI가 생성한 결과물이 이 규칙을 통과하지 못하면 기본값으로 대체됩니다.
        </p>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>적용 항목</th>
              <th style={S.th}>규칙 유형</th>
              <th style={S.th}>규칙 내용</th>
            </tr>
          </thead>
          <tbody>
            {constraints.map(c => (
              <tr key={c.id}>
                <td style={S.td}>
                  <span style={badge('blue')}>
                    {slots.find(s => s.id === c.slot_id)?.slot_key ?? c.slot_id}
                  </span>
                  {' '}
                  <span style={{ fontSize: 12, color: '#71717a' }}>
                    {SLOT_KIND_LABEL[slots.find(s => s.id === c.slot_id)?.slot_kind] ?? ''}
                  </span>
                </td>
                <td style={S.td}>
                  <code style={{ fontSize: 12, color: '#52525b', background: 'transparent' }}>{c.rule_type}</code>
                </td>
                <td style={{ ...S.td, fontSize: 12, color: '#52525b' }}>{c.rule_value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <SaveBar onSave={handleSave} saved={saved} />
    </>
  )
}
