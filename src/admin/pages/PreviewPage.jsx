import { useState, useRef, useEffect, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { C, Card, S, btn, badge, Skeleton } from '../shared.jsx'
import { generateEvidencePlacements } from '../../services/mockGenerator.js'
import Room from '../../scene/Room.jsx'
import CrimeScene from '../../scene/CrimeScene.jsx'

// Suspense 경계 안에서 모든 GLB가 resolve된 직후 1회 mount → 로딩 종료 신호.
function SceneReady({ onReady }) {
  const fired = useRef(false)
  useEffect(() => { if (!fired.current) { fired.current = true; onReady() } })
  return null
}

// 3D 뷰포트 로딩 스켈레톤 — 모델 로드 중 셔머 와이어프레임 오버레이.
function SceneSkeleton() {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 2,
      background: 'radial-gradient(60% 60% at 50% 40%, #15151f, #0a0a12)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
        <Skeleton w={70} h={90} radius={10} />
        <Skeleton w={110} h={130} radius={12} />
        <Skeleton w={70} h={70} radius={10} />
      </div>
      <Skeleton w={220} h={10} radius={999} />
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 12, color: C.txtMute, letterSpacing: '0.04em',
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: 999, background: C.accent,
          boxShadow: `0 0 10px 1px ${C.accent}`,
        }} />
        3D 씬 불러오는 중
      </div>
    </div>
  )
}

export default function PreviewPage({ data }) {
  const [gradeBand, setGradeBand] = useState(data.scenario.grade_band_id)
  const [placements, setPlacements] = useState(() => generateEvidencePlacements(data.scenario.grade_band_id, data))
  const [sceneReady, setSceneReady] = useState(false)

  const regenerate = (band) => {
    setGradeBand(band)
    setPlacements(generateEvidencePlacements(band, data))
  }

  return (
    <>
      <Card title="증거물 배치 미리보기">
        <p style={{ fontSize: 13, color: C.txtDim, marginBottom: 16 }}>
          학생이 게임에 진입할 때 배치될 증거물과 위치를 시뮬레이션합니다.
          재생성할 때마다 무작위로 달라집니다.
        </p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: C.txtDim, fontWeight: 600 }}>학년 그룹:</span>
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
                  <td style={{ ...S.td, textAlign: 'center', fontWeight: 700, color: C.txtDim }}>{i + 1}</td>
                  <td style={S.td}>{def?.name ?? ev.file}</td>
                  <td style={S.td}>
                    <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#d6d5e0' }}>{ev.file}</span>
                  </td>
                  <td style={S.td}>
                    <code style={{ fontSize: 11, color: C.txtDim, background: 'transparent' }}>
                      [{ev.position.join(', ')}]
                    </code>
                  </td>
                  <td style={S.td}>
                    <span style={badge(ev.miniGame.type === 'timing' ? 'blue' : 'green')}>
                      {ev.miniGame.type === 'timing' ? '타이밍' : '연타'}
                    </span>
                    {' '}
                    <span style={{ fontSize: 12, color: C.txtDim }}>{ev.miniGame.label}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div style={{
          marginTop: 12, padding: '10px 14px',
          background: 'rgba(122,162,255,0.10)', border: '1px solid rgba(122,162,255,0.28)',
          borderRadius: 10, fontSize: 12, color: '#a7c0ff',
        }}>
          배치 수: <strong>{placements.length}개</strong>
          {' · '}
          전체 증거물 풀: <strong>{data.evidenceDefs.length}개</strong>
          {' · '}
          grade_band <strong>{gradeBand}</strong> (evidence_count: {data.config[gradeBand].evidence_count})
        </div>
      </Card>

      <Card title="3D 씬 미리보기">
        <div style={{ position: 'relative', height: 480, borderRadius: 10, overflow: 'hidden', background: '#0a0a12' }}>
          {!sceneReady && <SceneSkeleton />}
          <Canvas camera={{ position: [0, 5, 7], fov: 75 }}>
            <ambientLight intensity={0.4} />
            <pointLight position={[0, 3.5, 0]} intensity={15} color="#ffffff" />
            <pointLight position={[3, 3, 3]}   intensity={8}  color="#ffe8c0" />
            <pointLight position={[-3, 3, -3]} intensity={8}  color="#ffe8c0" />
            <OrbitControls makeDefault />
            <Suspense fallback={null}>
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
              <SceneReady onReady={() => setSceneReady(true)} />
            </Suspense>
          </Canvas>
        </div>
        <p style={{ fontSize: 11, color: C.txtFaint, marginTop: 6 }}>
          좌클릭 드래그 — 회전 &nbsp;·&nbsp; 우클릭 드래그 — 이동 &nbsp;·&nbsp; 휠 — 줌
        </p>
      </Card>
    </>
  )
}
