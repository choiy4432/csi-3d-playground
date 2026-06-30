import { useEffect, useMemo, useRef, Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment } from '@react-three/drei'
import * as THREE from 'three'

// ── 공통 씬 오브젝트 ──────────────────────────────────────────
function TestObjects() {
  return (
    <>
      <mesh position={[-0.9, 0.38, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial metalness={0.95} roughness={0.05} color="#dddddd" />
      </mesh>
      <mesh position={[0.9, 0.27, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial metalness={0.0} roughness={0.9} color="#cc7744" />
      </mesh>
      <mesh position={[0, 0.27, 1.2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.5, 24]} />
        <meshStandardMaterial metalness={0.4} roughness={0.5} color="#4488cc" />
      </mesh>
    </>
  )
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[24, 24]} />
      <meshStandardMaterial color="#0d0d0d" roughness={0.9} metalness={0.1} />
    </mesh>
  )
}

function ReflectiveWall() {
  return (
    <group position={[0, 1.5, 4.5]}>
      <mesh position={[-1.6, 0, 0]} receiveShadow>
        <boxGeometry args={[3.0, 3.2, 0.08]} />
        <meshStandardMaterial metalness={0.95} roughness={0.04} color="#cccccc" />
      </mesh>
      <mesh position={[1.6, 0, 0]} receiveShadow>
        <boxGeometry args={[3.0, 3.2, 0.08]} />
        <meshStandardMaterial metalness={0.05} roughness={0.92} color="#888888" />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[0.04, 3.2, 0.06]} />
        <meshBasicMaterial color="#333333" />
      </mesh>
    </group>
  )
}

function GlassPanel() {
  return (
    <mesh position={[0, 1.0, -1.6]} castShadow>
      <boxGeometry args={[2.2, 2.0, 0.06]} />
      <meshPhysicalMaterial transmission={1} roughness={0} ior={1.5} thickness={0.3} color="#aaccff" transparent />
    </mesh>
  )
}

// ── 광원 컴포넌트 ─────────────────────────────────────────────
function LightAmbient() {
  return <ambientLight intensity={1.5} color="#ffffff" />
}

function LightPoint() {
  return (
    <>
      <pointLight position={[0, 3.0, 0]} intensity={22} color="#ffffff" distance={7} decay={2} castShadow />
      <mesh position={[0, 3.0, 0]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshBasicMaterial color="#ffffcc" />
      </mesh>
    </>
  )
}

function LightSpot() {
  const lightRef  = useRef()
  const targetRef = useRef()
  useEffect(() => {
    if (lightRef.current && targetRef.current) {
      lightRef.current.target = targetRef.current
    }
  }, [])
  return (
    <>
      <spotLight
        ref={lightRef}
        position={[0, 3.2, 0]}
        intensity={35}
        angle={0.38}
        penumbra={0.3}
        color="#fff8ee"
        distance={7}
        decay={1.5}
        castShadow
      />
      <object3D ref={targetRef} position={[0, 0, 0]} />
      <Suspense fallback={null}>
        <TrackLightModel position={[0, 3.0, 0]} />
      </Suspense>
    </>
  )
}

function LightDirectional() {
  return <directionalLight position={[3, 5, -2]} intensity={3.5} color="#fff8e0" castShadow />
}

function LightRectArea() {
  useEffect(() => {
    import('three/addons/lights/RectAreaLightUniformsLib.js').then(
      ({ RectAreaLightUniformsLib }) => RectAreaLightUniformsLib.init()
    )
  }, [])
  return (
    <>
      <rectAreaLight
        position={[0, 3.4, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={2.4}
        height={1.6}
        intensity={18}
        color="#cceeff"
      />
      <mesh position={[0, 3.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.4, 1.6]} />
        <meshBasicMaterial color="#cceeff" side={THREE.DoubleSide} />
      </mesh>
    </>
  )
}

function LightHemi() {
  return <hemisphereLight skyColor="#3366ff" groundColor="#663300" intensity={2.5} />
}

function LightEnv() {
  return <Environment preset="studio" background={false} />
}

function TrackLightModel({ position }) {
  const { scene } = useGLTF('/models/light/Track_Light.glb')
  const model = useMemo(() => scene.clone(), [scene])
  return <primitive object={model} position={position} rotation={[0, Math.PI / 2, 0]} scale={0.9} />
}

// ── 광원 정의 ─────────────────────────────────────────────────
const LIGHTS = [
  {
    id: 'ambient',
    label: 'ambientLight',
    accent: '#aaffcc',
    Component: LightAmbient,
    params: 'intensity: 1.5',
    note: '방향·그림자 없이 씬 전체 균일하게 밝힘.',
    global: true,
  },
  {
    id: 'point',
    label: 'pointLight',
    accent: '#ffdd66',
    Component: LightPoint,
    params: 'intensity: 22 · distance: 7 · decay: 2',
    note: '한 점에서 사방 방사. 전구·촛불 계열.',
  },
  {
    id: 'spot',
    label: 'spotLight',
    accent: '#ffaa44',
    Component: LightSpot,
    params: 'intensity: 35 · angle: 0.38 · penumbra: 0.3',
    note: 'Track_Light.glb + 원뿔형. angle/penumbra로 형태 제어.',
  },
  {
    id: 'directional',
    label: 'directionalLight',
    accent: '#ffe066',
    Component: LightDirectional,
    params: 'intensity: 3.5 · from [3,5,-2]',
    note: '무한 평행광. 그림자 방향 일정.',
    global: true,
  },
  {
    id: 'rectarea',
    label: 'rectAreaLight',
    accent: '#66ddff',
    Component: LightRectArea,
    params: 'intensity: 18 · 2.4×1.6m',
    note: '면광원. 형광등·창문 효과. 그림자 미지원.',
  },
  {
    id: 'hemi',
    label: 'hemisphereLight',
    accent: '#8888ff',
    Component: LightHemi,
    params: 'sky: #3366ff · ground: #663300 · intensity: 2.5',
    note: '하늘/땅 그라디언트. 야외 분위기.',
    global: true,
  },
  {
    id: 'env',
    label: 'Environment IBL',
    accent: '#cc88ff',
    Component: LightEnv,
    params: 'preset: studio',
    note: 'HDRI 기반. 금속·유리 반사에 큰 영향.',
    global: true,
  },
]

// ── 스타일 ────────────────────────────────────────────────────
const S = {
  root: {
    width: '100vw', height: '100vh', background: '#050508',
    position: 'relative', display: 'flex', flexDirection: 'column',
  },
  topbar: {
    flexShrink: 0, background: 'rgba(5,5,10,0.96)', borderBottom: '1px solid #1a1a1a',
    display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8,
    fontFamily: 'monospace', flexWrap: 'wrap', minHeight: 48,
  },
  backBtn: {
    padding: '4px 10px', border: '1px solid #2a2a2a', borderRadius: 5,
    background: 'none', color: '#555', cursor: 'pointer', fontSize: 12, flexShrink: 0,
  },
  title: { color: '#00ffcc', fontSize: 13, fontWeight: 'bold', flexShrink: 0 },
  divider: { color: '#222', flexShrink: 0 },
  toggle: (active, accent) => ({
    padding: '4px 11px', borderRadius: 14, cursor: 'pointer', fontSize: 11,
    fontFamily: 'monospace', flexShrink: 0, transition: 'all 0.15s',
    border: `1px solid ${active ? accent : '#252525'}`,
    background: active ? `${accent}18` : 'transparent',
    color: active ? accent : '#444',
  }),
  clearBtn: {
    padding: '3px 9px', border: '1px solid #2a2a2a', borderRadius: 10,
    background: 'none', color: '#444', cursor: 'pointer', fontSize: 10,
    fontFamily: 'monospace', flexShrink: 0,
  },
  panel: {
    position: 'absolute', bottom: 20, left: 20, zIndex: 10,
    background: 'rgba(0,0,0,0.82)', border: '1px solid #1e1e1e',
    borderRadius: 8, padding: '12px 16px', fontFamily: 'monospace',
    maxWidth: 360, maxHeight: '40vh', overflowY: 'auto',
  },
  panelTitle: { color: '#555', fontSize: 10, marginBottom: 8, letterSpacing: 1 },
  lightRow: (accent) => ({
    display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start',
  }),
  lightDot: (accent) => ({
    width: 8, height: 8, borderRadius: '50%', background: accent,
    flexShrink: 0, marginTop: 3,
  }),
  lightLabel: (accent) => ({ color: accent, fontSize: 12, fontWeight: 'bold' }),
  lightParams: { color: '#666', fontSize: 10, marginTop: 2 },
  lightNote: { color: '#444', fontSize: 10 },
  globalBadge: (accent) => ({
    display: 'inline-block', fontSize: 9, padding: '0 5px',
    borderRadius: 6, border: `1px solid ${accent}44`,
    color: accent, marginLeft: 6, verticalAlign: 'middle', opacity: 0.7,
  }),
  emptyNote: { color: '#333', fontSize: 12, fontStyle: 'italic' },
  hint: {
    position: 'absolute', bottom: 20, right: 20, zIndex: 10,
    color: '#222', fontFamily: 'monospace', fontSize: 11,
  },
}

// ══════════════════════════════════════════════════════════════
// 메인
// ══════════════════════════════════════════════════════════════
export default function LightTestRoom() {
  const [active, setActive] = useState(() => new Set(['point']))

  function toggle(id) {
    setActive(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const activeLights = LIGHTS.filter(l => active.has(l.id))

  return (
    <div style={S.root}>
      {/* 탑바 */}
      <div style={S.topbar}>
        <button style={S.backBtn} onClick={() => { window.location.hash = '/' }}>← 씬으로</button>
        <button style={{ ...S.backBtn, color: '#00ffcc', borderColor: '#00ffcc44' }} onClick={() => { window.location.hash = '/testroom' }}>Room_Test 씬 →</button>
        <span style={S.title}>◈ LIGHT TEST</span>
        <span style={S.divider}>|</span>
        {LIGHTS.map(l => (
          <button
            key={l.id}
            style={S.toggle(active.has(l.id), l.accent)}
            onClick={() => toggle(l.id)}
          >
            {active.has(l.id) ? '●' : '○'} {l.label}
          </button>
        ))}
        <span style={S.divider}>|</span>
        <button style={S.clearBtn} onClick={() => setActive(new Set())}>전체 끄기</button>
        <button style={{ ...S.clearBtn, marginLeft: -4 }} onClick={() => setActive(new Set(LIGHTS.map(l => l.id)))}>전체 켜기</button>
      </div>

      {/* 씬 */}
      <Canvas
        shadows="hard"
        gl={{ alpha: false }}
        camera={{ position: [0, 2.5, -5.5], fov: 58 }}
        style={{ flex: 1 }}
      >
        <color attach="background" args={['#050508']} />
        <ambientLight intensity={0.015} />
        <OrbitControls target={[0, 0.8, 0]} />

        {activeLights.map(l => <l.Component key={l.id} />)}

        <TestObjects />
        <GlassPanel />
        <ReflectiveWall />
        <Floor />
      </Canvas>

      {/* 활성 광원 정보 패널 */}
      <div style={S.panel}>
        <div style={S.panelTitle}>ACTIVE LIGHTS ({activeLights.length})</div>
        {activeLights.length === 0 && (
          <div style={S.emptyNote}>광원 없음 — 상단에서 활성화</div>
        )}
        {activeLights.map(l => (
          <div key={l.id} style={S.lightRow(l.accent)}>
            <div style={S.lightDot(l.accent)} />
            <div>
              <div style={S.lightLabel(l.accent)}>
                {l.label}
                {l.global && <span style={S.globalBadge(l.accent)}>전역</span>}
              </div>
              <div style={S.lightParams}>{l.params}</div>
              <div style={S.lightNote}>{l.note}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={S.hint}>좌클릭 회전 · 우클릭 이동 · 휠 줌</div>
    </div>
  )
}
