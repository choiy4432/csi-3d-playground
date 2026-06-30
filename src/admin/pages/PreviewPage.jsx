import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { Card, S, btn, badge } from '../shared.jsx'
import { generateEvidencePlacements } from '../../services/mockGenerator.js'
import Room from '../../scene/Room.jsx'
import CrimeScene from '../../scene/CrimeScene.jsx'

export default function PreviewPage({ data }) {
  const [gradeBand, setGradeBand] = useState(data.scenario.grade_band_id)
  const [placements, setPlacements] = useState(() => generateEvidencePlacements(data.scenario.grade_band_id, data))

  const regenerate = (band) => {
    setGradeBand(band)
    setPlacements(generateEvidencePlacements(band, data))
  }

  return (
    <>
      <Card title="증거물 배치 미리보기">
        <p style={{ fontSize: 13, color: '#52525b', marginBottom: 16 }}>
          학생이 게임에 진입할 때 배치될 증거물과 위치를 시뮬레이션합니다.
          재생성할 때마다 무작위로 달라집니다.
        </p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#52525b', fontWeight: 600 }}>학년 그룹:</span>
          {Object.entries(data.config).map(([band, cfg]) => (
            <button
              key={band}
              style={{ ...btn(gradeBand === band ? 'primary' : 'default'), fontSize: 12, padding: '4px 12px' }}
              onClick={() => regenerate(band)}
            >
              {band} — {cfg.label}
            </button>
          ))}
          <button
            style={{ ...btn('ghost'), fontSize: 12, padding: '4px 12px', marginLeft: 'auto' }}
            onClick={() => setPlacements(generateEvidencePlacements(gradeBand, data))}
          >
            🔄 재생성
          </button>
        </div>

        <table style={S.table}>
          <thead>
            <tr>
              <th style={{ ...S.th, width: 36, textAlign: 'center' }}>#</th>
              <th style={S.th}>증거물</th>
              <th style={S.th}>3D 파일</th>
              <th style={S.th}>배치 위치 (x, y, z)</th>
              <th style={S.th}>채증 방식</th>
            </tr>
          </thead>
          <tbody>
            {placements.map((ev, i) => {
              const def = data.evidenceDefs.find(d => d.file === ev.file)
              return (
                <tr key={ev.id}>
                  <td style={{ ...S.td, textAlign: 'center', fontWeight: 700, color: '#52525b' }}>{i + 1}</td>
                  <td style={S.td}>{def?.name ?? ev.file}</td>
                  <td style={S.td}>
                    <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#374151' }}>{ev.file}</span>
                  </td>
                  <td style={S.td}>
                    <code style={{ fontSize: 11, color: '#52525b', background: 'transparent' }}>
                      [{ev.position.join(', ')}]
                    </code>
                  </td>
                  <td style={S.td}>
                    <span style={badge(ev.miniGame.type === 'timing' ? 'blue' : 'green')}>
                      {ev.miniGame.type === 'timing' ? '타이밍' : '연타'}
                    </span>
                    {' '}
                    <span style={{ fontSize: 12, color: '#52525b' }}>{ev.miniGame.label}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div style={{
          marginTop: 12, padding: '10px 14px',
          background: '#f0f9ff', border: '1px solid #bae6fd',
          borderRadius: 6, fontSize: 12, color: '#0369a1',
        }}>
          배치 수: <strong>{placements.length}개</strong>
          {' · '}
          전체 증거물 풀: <strong>{data.evidenceDefs.length}개</strong>
          {' · '}
          grade_band <strong>{gradeBand}</strong> (evidence_count: {data.config[gradeBand].evidence_count})
        </div>
      </Card>

      <Card title="3D 씬 미리보기">
        <div style={{ height: 480, borderRadius: 6, overflow: 'hidden', background: '#111' }}>
          <Canvas camera={{ position: [0, 5, 7], fov: 75 }}>
            <ambientLight intensity={0.4} />
            <pointLight position={[0, 3.5, 0]} intensity={15} color="#ffffff" />
            <pointLight position={[3, 3, 3]}   intensity={8}  color="#ffe8c0" />
            <pointLight position={[-3, 3, -3]} intensity={8}  color="#ffe8c0" />
            <OrbitControls makeDefault />
            <Physics gravity={[0, 0, 0]}>
              <Room
                debug={false}
                isolated={false}
                sceneOverride={null}
                lightColor="#ffe4a0"
                lightIntensity={12}
              />
              <CrimeScene evidences={placements} hoveredId={null} inRange={false} />
            </Physics>
          </Canvas>
        </div>
        <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
          좌클릭 드래그 — 회전 &nbsp;·&nbsp; 우클릭 드래그 — 이동 &nbsp;·&nbsp; 휠 — 줌
        </p>
      </Card>
    </>
  )
}
