import { useState } from 'react'
import { Card, Field, SaveBar, IconBtn, S, btn, badge } from '../shared.jsx'

export default function SolutionPage({ data, onSave }) {
  const [solution, setSolution] = useState({ ...data.solution })
  const [clues, setClues] = useState(JSON.parse(JSON.stringify(data.solutionClues)))
  const [saved, setSaved] = useState(false)

  const suspects = data.npcList.filter(n => n.npc_kind === 'suspect')

  const updateClue = (id, key, val) =>
    setClues(cs => cs.map(c => c.id === id ? { ...c, [key]: val } : c))

  const addClue = () => {
    const num = String(clues.length + 1).padStart(2, '0')
    setClues(cs => [...cs, { id: `clue-${num}`, evidence_def_id: '', reasoning_link: '' }])
  }

  const removeClue = (id) => {
    if (!confirm('이 단서를 삭제하시겠습니까?')) return
    setClues(cs => cs.filter(c => c.id !== id))
  }

  const handleSave = () => {
    onSave({ ...data, solution, solutionClues: clues })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const culpritName = data.npcList.find(n => n.id === solution.culprit_npc_id)?.name ?? '—'

  return (
    <>
      <div style={S.warning}>
        ⚠️ <strong>불변 원칙</strong> — 아래 필드는 런타임(플레이어 씬)에서 읽기 전용입니다.
        에디터에서만 설정 가능합니다.
      </div>

      <Card title="범인 및 정답 추론">
        <Field label="범인 (culprit_npc_id)" hint={`현재 선택: ${culpritName}`}>
          <select
            style={S.select}
            value={solution.culprit_npc_id}
            onChange={e => setSolution(s => ({ ...s, culprit_npc_id: e.target.value }))}
          >
            <option value="">— 선택하세요 —</option>
            {suspects.map(n => (
              <option key={n.id} value={n.id}>{n.name} ({n.profile})</option>
            ))}
          </select>
        </Field>
        <Field label="정답 추론 (correct_inference)">
          <textarea
            style={{ ...S.textarea, height: 80 }}
            value={solution.correct_inference}
            onChange={e => setSolution(s => ({ ...s, correct_inference: e.target.value }))}
          />
        </Field>
      </Card>

      <Card
        title={`단서 체인 (SOLUTION_CLUE) — ${clues.length}개`}
        action={<button style={btn('primary')} onClick={addClue}>+ 단서 추가</button>}
      >
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>ID</th>
              <th style={S.th}>연결 증거물</th>
              <th style={S.th}>추론 연결 고리 (reasoning_link)</th>
              <th style={S.th}></th>
            </tr>
          </thead>
          <tbody>
            {clues.map(clue => (
              <tr key={clue.id}>
                <td style={S.td}>
                  <code style={{ fontSize: 11, color: '#9399b2' }}>{clue.id}</code>
                </td>
                <td style={{ ...S.td, width: 200 }}>
                  <select
                    style={S.select}
                    value={clue.evidence_def_id}
                    onChange={e => updateClue(clue.id, 'evidence_def_id', e.target.value)}
                  >
                    <option value="">— 선택 —</option>
                    {data.evidenceDefs.map(ev => (
                      <option key={ev.id} value={ev.id}>{ev.name}</option>
                    ))}
                  </select>
                </td>
                <td style={S.td}>
                  <input
                    style={S.input}
                    value={clue.reasoning_link}
                    onChange={e => updateClue(clue.id, 'reasoning_link', e.target.value)}
                  />
                </td>
                <td style={S.td}>
                  <IconBtn icon="🗑️" title="삭제" onClick={() => removeClue(clue.id)} danger />
                </td>
              </tr>
            ))}
            {clues.length === 0 && (
              <tr>
                <td colSpan={4} style={{ ...S.td, color: '#a1a1aa', textAlign: 'center', padding: 20 }}>
                  단서가 없습니다
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
