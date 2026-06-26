import { useState } from 'react'
import { Card, SaveBar, S, btn, badge } from '../shared.jsx'

const SLOT_KINDS = [
  'scene_narrative', 'suspect_alibi', 'npc_detail', 'evidence_placement', 'inference_prompt',
]
const VARIABLE_AXES = ['grade_band', 'suspect', 'evidence']

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
        <td style={{ ...S.td, textAlign: 'center', fontWeight: 700 }}>
          {slot.generation_order}
        </td>
        <td style={S.td}>
          <span style={{ ...badge('blue'), fontFamily: 'monospace', fontSize: 12 }}>
            {slot.slot_key}
          </span>
        </td>
        <td style={S.td}>
          <select
            style={S.select}
            value={slot.slot_kind}
            onChange={e => update('slot_kind', e.target.value)}
          >
            {SLOT_KINDS.map(k => <option key={k}>{k}</option>)}
          </select>
        </td>
        <td style={S.td}>
          <input
            style={S.input}
            value={slot.target_field}
            onChange={e => update('target_field', e.target.value)}
          />
        </td>
        <td style={S.td}>
          <select
            style={S.select}
            value={slot.variable_axis}
            onChange={e => update('variable_axis', e.target.value)}
          >
            {VARIABLE_AXES.map(a => <option key={a}>{a}</option>)}
          </select>
        </td>
        <td style={S.td}>
          <button
            style={{ ...btn(), fontSize: 11, padding: '3px 8px' }}
            onClick={() => setOpen(o => !o)}
          >
            {open ? '▲' : '▼'} fallback
          </button>
        </td>
      </tr>
      {open && (
        <tr style={{ background: '#fafafa' }}>
          <td colSpan={6} style={{ padding: '4px 12px 12px 36px' }}>
            <textarea
              style={{ ...S.textarea, height: 72, marginTop: 4 }}
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
      <Card title="생성 슬롯 (GENERATION_SLOT)">
        <table style={S.table}>
          <thead>
            <tr>
              <th style={{ ...S.th, width: 50, textAlign: 'center' }}>순서</th>
              <th style={S.th}>슬롯 키</th>
              <th style={S.th}>slot_kind</th>
              <th style={S.th}>target_field</th>
              <th style={S.th}>variable_axis</th>
              <th style={S.th}>fallback_payload</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(slot => (
              <SlotRow key={slot.id} slot={slot} onChange={updateSlot} />
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="생성 제약 (GENERATION_CONSTRAINT)">
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>ID</th>
              <th style={S.th}>연결 슬롯</th>
              <th style={S.th}>rule_type</th>
              <th style={S.th}>rule_value</th>
            </tr>
          </thead>
          <tbody>
            {constraints.map(c => (
              <tr key={c.id}>
                <td style={S.td}>
                  <code style={{ fontSize: 11, color: '#9399b2' }}>{c.id}</code>
                </td>
                <td style={S.td}>
                  <span style={badge('blue')}>
                    {slots.find(s => s.id === c.slot_id)?.slot_key ?? c.slot_id}
                  </span>
                </td>
                <td style={S.td}>
                  <code style={{ fontSize: 12 }}>{c.rule_type}</code>
                </td>
                <td style={{ ...S.td, color: '#52525b', fontSize: 12 }}>{c.rule_value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <SaveBar onSave={handleSave} saved={saved} />
    </>
  )
}
