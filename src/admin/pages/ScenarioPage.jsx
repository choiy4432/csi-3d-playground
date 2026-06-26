import { useState } from 'react'
import { Card, Field, SaveBar, S } from '../shared.jsx'

const GRADE_BANDS = ['A', 'B', 'C']

const GRADE_LABELS = { A: '초등 저학년', B: '초등 고학년', C: '중학생' }

export default function ScenarioPage({ data, onSave }) {
  const [scenario, setScenario] = useState({ ...data.scenario })
  const [config, setConfig] = useState(JSON.parse(JSON.stringify(data.config)))
  const [saved, setSaved] = useState(false)

  const updateScenario = (key, val) => setScenario(s => ({ ...s, [key]: val }))
  const updateConfig = (band, key, val) =>
    setConfig(c => ({ ...c, [band]: { ...c[band], [key]: val } }))

  const handleSave = () => {
    onSave({ ...data, scenario, config })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <>
      <Card title="시나리오 기본 정보">
        <Field label="시나리오 제목">
          <input
            style={S.input}
            value={scenario.title}
            onChange={e => updateScenario('title', e.target.value)}
          />
        </Field>
        <Field label="사건 유형">
          <input
            style={S.input}
            value={scenario.case_type}
            onChange={e => updateScenario('case_type', e.target.value)}
            placeholder="예: 절도, 살인, 방화"
          />
        </Field>
        <Field
          label="기본 학년 그룹"
          hint="플레이어가 선택하지 않을 때 적용되는 기본 대상 학년입니다."
        >
          <select
            style={S.select}
            value={scenario.grade_band_id}
            onChange={e => updateScenario('grade_band_id', e.target.value)}
          >
            {GRADE_BANDS.map(b => (
              <option key={b} value={b}>{b} — {GRADE_LABELS[b]}</option>
            ))}
          </select>
        </Field>
      </Card>

      <Card title="학년별 게임 설정">
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>학년 그룹</th>
              <th style={S.th}>대상 학생</th>
              <th style={S.th}>증거 훼손율 (%)</th>
              <th style={S.th}>용의자 수</th>
              <th style={S.th}>체험 시간 (분)</th>
              <th style={S.th}>증거물 수</th>
            </tr>
          </thead>
          <tbody>
            {GRADE_BANDS.map(band => (
              <tr key={band}>
                <td style={S.td}><strong>{band}</strong></td>
                <td style={S.td}>
                  <input
                    style={{ ...S.input, width: 100 }}
                    value={config[band].label}
                    onChange={e => updateConfig(band, 'label', e.target.value)}
                  />
                </td>
                <td style={S.td}>
                  <input
                    type="number" min={0} max={100}
                    style={{ ...S.input, width: 60 }}
                    value={config[band].evidence_damage_rate}
                    onChange={e => updateConfig(band, 'evidence_damage_rate', Number(e.target.value))}
                  />
                </td>
                <td style={S.td}>
                  <input
                    type="number" min={1}
                    style={{ ...S.input, width: 50 }}
                    value={config[band].suspect_count}
                    onChange={e => updateConfig(band, 'suspect_count', Number(e.target.value))}
                  />
                </td>
                <td style={S.td}>
                  <input
                    type="number" min={1}
                    style={{ ...S.input, width: 50 }}
                    value={config[band].experience_time}
                    onChange={e => updateConfig(band, 'experience_time', Number(e.target.value))}
                  />
                </td>
                <td style={S.td}>
                  <input
                    type="number" min={1}
                    style={{ ...S.input, width: 50 }}
                    value={config[band].evidence_count}
                    onChange={e => updateConfig(band, 'evidence_count', Number(e.target.value))}
                  />
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
