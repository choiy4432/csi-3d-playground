import { useState } from 'react'
import { Card, IconBtn, S, btn } from '../shared.jsx'

function nextId(prefix, list) {
  const max = list.reduce((m, r) => {
    const n = parseInt(r.id.replace(`${prefix}-`, ''), 10)
    return isNaN(n) ? m : Math.max(m, n)
  }, 0)
  return `${prefix}-${String(max + 1).padStart(2, '0')}`
}

function RuleChips({ title, rules, fieldKey, placeholder, onAdd, onDelete }) {
  const [val, setVal] = useState('')
  const commit = () => {
    if (!val.trim()) return
    onAdd(val.trim())
    setVal('')
  }
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#52525b', marginBottom: 6 }}>{title}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        {rules.length === 0 && (
          <span style={{ fontSize: 12, color: '#a1a1aa' }}>규칙 없음</span>
        )}
        {rules.map(r => (
          <span
            key={r.id}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: '#f4f4f5', border: '1px solid #e4e4e7',
              borderRadius: 6, padding: '4px 10px', fontSize: 12,
            }}
          >
            {r[fieldKey]}
            <button
              onClick={() => onDelete(r.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 13, padding: 0, lineHeight: 1 }}
            >
              ✕
            </button>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          style={{ ...S.input, width: 180 }}
          placeholder={placeholder}
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && commit()}
        />
        <button style={btn('primary')} onClick={commit}>+ 추가</button>
      </div>
    </div>
  )
}

export default function CaseTypePage({ data, onSave }) {
  const caseTypes      = data.caseTypes      ?? []
  const caseJobRules   = data.caseJobRules   ?? []
  const caseEvidRules  = data.caseEvidenceRules ?? []
  const caseTgtRules   = data.caseTargetRules ?? []

  const [selectedId, setSelectedId] = useState(caseTypes[0]?.id ?? null)
  const [editId, setEditId]         = useState(null)
  const [editForm, setEditForm]     = useState(null)
  const [adding, setAdding]         = useState(false)
  const [newForm, setNewForm]       = useState({ name: '', description: '' })

  const selected = caseTypes.find(ct => ct.id === selectedId)

  const patch = (fields) => onSave({ ...data, ...fields })

  // ── CASE_TYPE CRUD ──────────────────────────────────────────────────────────
  const commitEdit = () => {
    patch({ caseTypes: caseTypes.map(ct => ct.id === editId ? editForm : ct) })
    setEditId(null); setEditForm(null)
  }

  const handleDelete = (id) => {
    if (!confirm('이 사건 유형과 연결된 규칙을 모두 삭제하시겠습니까?')) return
    patch({
      caseTypes:          caseTypes.filter(ct => ct.id !== id),
      caseJobRules:       caseJobRules.filter(r => r.case_type_id !== id),
      caseEvidenceRules:  caseEvidRules.filter(r => r.case_type_id !== id),
      caseTargetRules:    caseTgtRules.filter(r => r.case_type_id !== id),
    })
    setSelectedId(caseTypes.find(ct => ct.id !== id)?.id ?? null)
  }

  const handleAdd = () => {
    if (!newForm.name.trim()) return
    const id = nextId('ct', caseTypes)
    const updated = [...caseTypes, { id, ...newForm }]
    patch({ caseTypes: updated })
    setNewForm({ name: '', description: '' })
    setAdding(false)
    setSelectedId(id)
  }

  // ── RULE CRUD (per selected case type) ─────────────────────────────────────
  const addJobRule = (val) =>
    patch({ caseJobRules: [...caseJobRules, { id: nextId('cjr', caseJobRules), case_type_id: selectedId, job_keyword: val }] })

  const addEvidRule = (val) =>
    patch({ caseEvidenceRules: [...caseEvidRules, { id: nextId('cer', caseEvidRules), case_type_id: selectedId, evidence_category: val }] })

  const addTgtRule = (val) =>
    patch({ caseTargetRules: [...caseTgtRules, { id: nextId('ctr', caseTgtRules), case_type_id: selectedId, allowed_target_type: val }] })

  const jobRules  = caseJobRules.filter(r => r.case_type_id === selectedId)
  const evidRules = caseEvidRules.filter(r => r.case_type_id === selectedId)
  const tgtRules  = caseTgtRules.filter(r => r.case_type_id === selectedId)

  return (
    <>
      <Card
        title={`사건 유형 목록 (${caseTypes.length}개)`}
        action={<button style={btn('primary')} onClick={() => setAdding(a => !a)}>+ 유형 추가</button>}
      >
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>ID</th>
              <th style={S.th}>유형명</th>
              <th style={S.th}>설명</th>
              <th style={S.th}></th>
            </tr>
          </thead>
          <tbody>
            {caseTypes.map(ct => (
              <tr
                key={ct.id}
                onClick={() => { if (editId !== ct.id) setSelectedId(ct.id) }}
                style={{ background: ct.id === selectedId ? '#f5f3ff' : undefined, cursor: 'pointer' }}
              >
                {editId === ct.id ? (
                  <>
                    <td style={S.td}><span style={{ color: '#a1a1aa', fontSize: 11 }}>{ct.id}</span></td>
                    <td style={S.td}>
                      <input
                        style={S.input}
                        value={editForm.name}
                        onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                      />
                    </td>
                    <td style={S.td}>
                      <input
                        style={S.input}
                        value={editForm.description}
                        onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                      />
                    </td>
                    <td style={S.td} onClick={e => e.stopPropagation()}>
                      <IconBtn icon="✓" title="저장" onClick={commitEdit} />
                      <IconBtn icon="✕" title="취소" onClick={() => setEditId(null)} />
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ ...S.td, color: '#a1a1aa', fontSize: 11 }}>{ct.id}</td>
                    <td style={S.td}><strong>{ct.name}</strong></td>
                    <td style={{ ...S.td, color: '#52525b' }}>{ct.description}</td>
                    <td style={S.td} onClick={e => e.stopPropagation()}>
                      <IconBtn icon="✏️" title="편집" onClick={() => { setEditId(ct.id); setEditForm({ ...ct }) }} />
                      <IconBtn icon="🗑️" title="삭제" onClick={() => handleDelete(ct.id)} danger />
                    </td>
                  </>
                )}
              </tr>
            ))}
            {adding && (
              <tr style={{ background: '#f9f9ff' }}>
                <td style={{ ...S.td, color: '#a1a1aa', fontSize: 11 }}>자동 부여</td>
                <td style={S.td}>
                  <input
                    style={S.input}
                    placeholder="유형명 (예: 방화)"
                    value={newForm.name}
                    onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                  />
                </td>
                <td style={S.td}>
                  <input
                    style={S.input}
                    placeholder="간단한 설명"
                    value={newForm.description}
                    onChange={e => setNewForm(f => ({ ...f, description: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
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

      {selected ? (
        <Card title={`규칙 설정 — "${selected.name}" (${selected.id})`}>
          <div style={{ marginBottom: 8, fontSize: 12, color: '#71717a' }}>
            아래 규칙은 AI 슬롯 생성 시 프롬프트 제약 조건으로 활용됩니다.
          </div>
          <RuleChips
            title="CASE_JOB_RULE — 허용 직업 키워드 (NPC 직업 제한)"
            rules={jobRules}
            fieldKey="job_keyword"
            placeholder="예: 경비원"
            onAdd={addJobRule}
            onDelete={id => patch({ caseJobRules: caseJobRules.filter(r => r.id !== id) })}
          />
          <RuleChips
            title="CASE_EVIDENCE_RULE — 허용 증거 카테고리"
            rules={evidRules}
            fieldKey="evidence_category"
            placeholder="예: 지문"
            onAdd={addEvidRule}
            onDelete={id => patch({ caseEvidenceRules: caseEvidRules.filter(r => r.id !== id) })}
          />
          <RuleChips
            title="CASE_TARGET_RULE — 허용 타겟 유형 (사건 대상 물품)"
            rules={tgtRules}
            fieldKey="allowed_target_type"
            placeholder="예: 미술품"
            onAdd={addTgtRule}
            onDelete={id => patch({ caseTargetRules: caseTgtRules.filter(r => r.id !== id) })}
          />
        </Card>
      ) : (
        <div style={{ color: '#a1a1aa', fontSize: 13, padding: 16 }}>
          위 목록에서 사건 유형을 선택하면 규칙을 편집할 수 있습니다.
        </div>
      )}
    </>
  )
}
