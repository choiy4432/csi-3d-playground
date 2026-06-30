import { useState } from 'react'
import { Card, Field, SaveBar, IconBtn, S, btn, TableEmpty } from '../shared.jsx'

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

  const culpritName = data.npcList.find(n => n.id === solution.culprit_npc_id)?.name ?? '선택 안 됨'

  return (
    <>
      <div style={S.warning}>
        ⚠️ 이 페이지의 내용은 게임 플레이 중에 절대 변경되지 않는 정답 정보입니다.
        시나리오 제작 단계에서만 수정하세요.
      </div>

      <Card title="범인 및 정답">
        <Field label="범인" hint={`현재: ${culpritName}`}>
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
        <Field
          label="정답 추론문"
          hint="학생이 최종 제출하는 추론 내용과 비교할 정답 문장입니다."
        >
          <textarea
            style={{ ...S.textarea, height: 80 }}
            value={solution.correct_inference}
            onChange={e => setSolution(s => ({ ...s, correct_inference: e.target.value }))}
          />
        </Field>
      </Card>

      <Card
        title={`단서 목록 — ${clues.length}개`}
        action={<button style={btn('primary')} onClick={addClue}>+ 단서 추가</button>}
      >
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>관련 증거물</th>
              <th style={S.th}>이 증거물이 범인을 가리키는 이유</th>
              <th style={S.th}></th>
            </tr>
          </thead>
          <tbody>
            {clues.map(clue => (
              <tr key={clue.id}>
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
                    placeholder="예: 이서연의 지문이 해당 물체에서 발견됐다."
                    onChange={e => updateClue(clue.id, 'reasoning_link', e.target.value)}
                  />
                </td>
                <td style={S.td}>
                  <IconBtn icon="🗑️" title="삭제" onClick={() => removeClue(clue.id)} danger />
                </td>
              </tr>
            ))}
            {clues.length === 0 && (
              <TableEmpty
                colSpan={3}
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.5 14.5 14.5 9.5" />
                    <path d="M7 12 5.4 13.6a3.4 3.4 0 0 0 4.8 4.8L12 16.8" />
                    <path d="M17 12l1.6-1.6a3.4 3.4 0 0 0-4.8-4.8L12 7.2" />
                  </svg>
                }
                title="단서가 없어요"
                hint="증거물과 범인을 잇는 단서를 추가하면 AI 추론 평가의 근거가 됩니다."
                action={<button style={btn('primary')} onClick={addClue}>+ 단서 추가</button>}
              />
            )}
          </tbody>
        </table>
      </Card>

      <SaveBar onSave={handleSave} saved={saved} />
    </>
  )
}
