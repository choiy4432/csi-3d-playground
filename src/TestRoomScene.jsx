import { useState, useEffect, useRef, useMemo, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF, Line, Sky } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import * as THREE from 'three'
import RoomAssembled from './RoomAssembled'
import PlayerController from './PlayerController'

// ── 기본값 ───────────────────────────────────────────────────
const DEFAULTS = {
  ambient:     { intensity: 0.4,  color: '#ffffff' },
  point:       { intensity: 15,   distance: 8,   decay: 2.0, color: '#ffffff' },
  spot:        { intensity: 35,   angle: 0.38,   penumbra: 0.3, distance: 8.0, decay: 1.5, color: '#fff8ee', posX: 0, posY: 3.2, posZ: 0, targetX: 0, targetY: 0, targetZ: 0 },
  directional: { intensity: 3.5,  posX: 3, posY: 5, posZ: -2, color: '#fff8e0', targetX: 0, targetY: 0, targetZ: 0 },
  rectarea:    { intensity: 18,   width: 3.0, height: 2.0, color: '#cceeff' },
  hemi:        { intensity: 2.5,  skyColor: '#3366ff', groundColor: '#663300' },
  env:         { intensity: 2.0,  preset: 'apartment' },
  sky:         { sunX: 100, sunY: 20, sunZ: 100, turbidity: 10, rayleigh: 2, sunIntensity: 1.5 },
}

// ── 파라미터 정의 ─────────────────────────────────────────────
const PARAM_DEFS = {
  ambient: [
    { key: 'intensity', label: 'intensity', type: 'range', min: 0, max: 5,   step: 0.05 },
    { key: 'color',     label: 'color',     type: 'color' },
  ],
  point: [
    { key: 'intensity', label: 'intensity', type: 'range', min: 0, max: 80,  step: 1 },
    { key: 'distance',  label: 'distance',  type: 'range', min: 0, max: 20,  step: 0.5 },
    { key: 'decay',     label: 'decay',     type: 'range', min: 0, max: 5,   step: 0.1 },
    { key: 'color',     label: 'color',     type: 'color' },
  ],
  spot: [
    { key: 'intensity', label: 'intensity', type: 'range', min: 0, max: 200, step: 1 },
    { key: 'angle',     label: 'angle',     type: 'range', min: 0.05, max: 1.3, step: 0.01 },
    { key: 'penumbra',  label: 'penumbra',  type: 'range', min: 0, max: 1,   step: 0.05 },
    { key: 'distance',  label: 'distance',  type: 'range', min: 0, max: 20,  step: 0.5 },
    { key: 'decay',     label: 'decay',     type: 'range', min: 0, max: 5,   step: 0.1 },
    { key: 'color',     label: 'color',     type: 'color' },
    { key: 'posX',      label: 'pos.X',     type: 'range', min: -4, max: 4,  step: 0.1 },
    { key: 'posY',      label: 'pos.Y',     type: 'range', min: 0,  max: 5,  step: 0.1 },
    { key: 'posZ',      label: 'pos.Z',     type: 'range', min: -4, max: 4,  step: 0.1 },
    { key: 'targetX',   label: 'tgt.X',     type: 'range', min: -4, max: 4,  step: 0.1 },
    { key: 'targetY',   label: 'tgt.Y',     type: 'range', min: -1, max: 4,  step: 0.1 },
    { key: 'targetZ',   label: 'tgt.Z',     type: 'range', min: -4, max: 4,  step: 0.1 },
  ],
  directional: [
    { key: 'intensity', label: 'intensity', type: 'range', min: 0, max: 20,  step: 0.25 },
    { key: 'posX',      label: 'pos.X',     type: 'range', min: -10, max: 10, step: 0.5 },
    { key: 'posY',      label: 'pos.Y',     type: 'range', min: 0,   max: 15, step: 0.5 },
    { key: 'posZ',      label: 'pos.Z',     type: 'range', min: -10, max: 10, step: 0.5 },
    { key: 'targetX',   label: 'tgt.X',     type: 'range', min: -10, max: 10, step: 0.5 },
    { key: 'targetY',   label: 'tgt.Y',     type: 'range', min: -5,  max: 10, step: 0.5 },
    { key: 'targetZ',   label: 'tgt.Z',     type: 'range', min: -10, max: 10, step: 0.5 },
    { key: 'color',     label: 'color',     type: 'color' },
  ],
  rectarea: [
    { key: 'intensity', label: 'intensity', type: 'range', min: 0, max: 100, step: 1 },
    { key: 'width',     label: 'width',     type: 'range', min: 0.5, max: 8, step: 0.5 },
    { key: 'height',    label: 'height',    type: 'range', min: 0.5, max: 8, step: 0.5 },
    { key: 'color',     label: 'color',     type: 'color' },
  ],
  hemi: [
    { key: 'intensity',   label: 'intensity', type: 'range', min: 0, max: 10, step: 0.1 },
    { key: 'skyColor',    label: 'sky',       type: 'color' },
    { key: 'groundColor', label: 'ground',    type: 'color' },
  ],
  env: [
    { key: 'intensity', label: 'intensity', type: 'range', min: 0, max: 5, step: 0.05 },
    { key: 'preset',    label: 'preset',    type: 'select',
      options: ['apartment','city','dawn','forest','lobby','night','park','studio','sunset','warehouse'] },
  ],
  sky: [
    { key: 'sunX',         label: 'sun.X',     type: 'range', min: -200, max: 200, step: 5 },
    { key: 'sunY',         label: 'sun.Y',     type: 'range', min: -20,  max: 100, step: 1 },
    { key: 'sunZ',         label: 'sun.Z',     type: 'range', min: -200, max: 200, step: 5 },
    { key: 'turbidity',    label: 'turbidity', type: 'range', min: 0, max: 20,  step: 0.5 },
    { key: 'rayleigh',     label: 'rayleigh',  type: 'range', min: 0, max: 4,   step: 0.1 },
    { key: 'sunIntensity', label: 'sun light', type: 'range', min: 0, max: 10,  step: 0.1 },
  ],
}

// ── 광원 컴포넌트 ─────────────────────────────────────────────
function LightAmbient({ intensity = 0.4, color = '#ffffff' }) {
  return <ambientLight intensity={intensity} color={color} />
}

function LightPoint({ intensity = 15, distance = 8, decay = 2.0, color = '#ffffff' }) {
  const positions = [[0, 3.0, 0], [3, 3, 3], [-3, 3, -3]]
  return (
    <>
      <pointLight position={positions[0]} intensity={intensity}        color={color}    distance={distance} decay={decay} />
      <pointLight position={positions[1]} intensity={intensity * 0.53} color="#ffe8c0" distance={distance} decay={decay} />
      <pointLight position={positions[2]} intensity={intensity * 0.53} color="#ffe8c0" distance={distance} decay={decay} />
      {positions.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[i === 0 ? 0.07 : 0.04, 8, 8]} />
          <meshBasicMaterial color="#ffdd66" />
        </mesh>
      ))}
    </>
  )
}

function TrackLightModel({ position }) {
  const { scene } = useGLTF('/models/light/Track_Light.glb')
  const meshes = useMemo(() => {
    const targets = new Set(['Cube033', 'Cube033_1'])
    const found = []
    scene.traverse((obj) => {
      if (obj.isMesh && targets.has(obj.name)) {
        const clone = obj.clone()
        clone.position.set(0, 0, 0)
        clone.rotation.set(0, 0, 0)
        clone.scale.set(1, 1, 1)
        found.push(clone)
      }
    })
    return found
  }, [scene])
  if (!meshes.length) return null
  return (
    <group position={position} rotation={[0, Math.PI / 2, 0]} scale={0.9}>
      {meshes.map((m) => <primitive key={m.name} object={m} />)}
    </group>
  )
}

function LightSpot({ intensity = 35, angle = 0.38, penumbra = 0.3, distance = 8, decay = 1.5, color = '#fff8ee', posX = 0, posY = 3.2, posZ = 0, targetX = 0, targetY = 0, targetZ = 0 }) {
  const lightRef  = useRef()
  const targetRef = useRef()
  useEffect(() => {
    if (lightRef.current && targetRef.current) lightRef.current.target = targetRef.current
  }, [])
  return (
    <>
      <spotLight ref={lightRef} position={[posX, posY, posZ]} intensity={intensity} angle={angle} penumbra={penumbra} color={color} distance={distance} decay={decay} castShadow shadow-mapSize={[1024, 1024]} />
      <object3D ref={targetRef} position={[targetX, targetY, targetZ]} />
      <mesh position={[posX, posY, posZ]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshBasicMaterial color="#ffaa44" />
      </mesh>
      <Line points={[[posX, posY, posZ], [targetX, targetY, targetZ]]} color="#ffaa44" lineWidth={1.5} />
      <mesh position={[targetX, targetY, targetZ]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ffaa44" opacity={0.5} transparent />
      </mesh>
      <Suspense fallback={null}>
        <TrackLightModel position={[posX, posY - 0.2, posZ]} />
      </Suspense>
    </>
  )
}

function LightDirectional({ intensity = 3.5, posX = 3, posY = 5, posZ = -2, color = '#fff8e0', targetX = 0, targetY = 0, targetZ = 0 }) {
  const ref = useRef()
  const targetRef = useRef()
  useEffect(() => {
    if (!ref.current) return
    const s = ref.current.shadow
    s.camera.left = -12; s.camera.right = 12
    s.camera.top  =  12; s.camera.bottom = -12
    s.camera.near = 0.1; s.camera.far = 50
    s.camera.updateProjectionMatrix()
    s.mapSize.set(2048, 2048)
    s.bias       = -0.001
    s.normalBias =  0.04
    if (targetRef.current) ref.current.target = targetRef.current
  }, [])
  return (
    <>
      <directionalLight ref={ref} position={[posX, posY, posZ]} intensity={intensity} color={color} castShadow />
      <object3D ref={targetRef} position={[targetX, targetY, targetZ]} />
      <mesh position={[posX, posY, posZ]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshBasicMaterial color="#ffe066" />
      </mesh>
      <Line points={[[posX, posY, posZ], [targetX, targetY, targetZ]]} color="#ffe066" lineWidth={1.5} />
      <mesh position={[targetX, targetY, targetZ]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ffe066" opacity={0.5} transparent />
      </mesh>
    </>
  )
}

function LightRectArea({ intensity = 18, width = 3, height = 2, color = '#cceeff' }) {
  useEffect(() => {
    import('three/addons/lights/RectAreaLightUniformsLib.js').then(
      ({ RectAreaLightUniformsLib }) => RectAreaLightUniformsLib.init()
    )
  }, [])
  return (
    <>
      <rectAreaLight position={[0, 3.4, 0]} rotation={[-Math.PI / 2, 0, 0]} width={width} height={height} intensity={intensity} color={color} />
      {/* 면광원 영역 시각화 */}
      <mesh position={[0, 3.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color={color} opacity={0.35} transparent side={THREE.DoubleSide} />
      </mesh>
    </>
  )
}

function LightHemi({ intensity = 2.5, skyColor = '#3366ff', groundColor = '#663300' }) {
  return <hemisphereLight skyColor={skyColor} groundColor={groundColor} intensity={intensity} />
}

function LightSky({ sunX = 100, sunY = 20, sunZ = 100, turbidity = 10, rayleigh = 2, sunIntensity = 1.5 }) {
  const ref = useRef()
  useEffect(() => {
    if (!ref.current) return
    const s = ref.current.shadow
    s.mapSize.set(2048, 2048)
    s.camera.left = -15; s.camera.right = 15
    s.camera.top  =  15; s.camera.bottom = -15
    s.camera.near = 0.1; s.camera.far = 100
    s.camera.updateProjectionMatrix()
    s.bias = -0.001
    s.normalBias = 0.04
  }, [])
  return (
    <>
      <Sky sunPosition={[sunX, sunY, sunZ]} turbidity={turbidity} rayleigh={rayleigh} />
      <directionalLight ref={ref} position={[sunX, sunY, sunZ]} intensity={sunIntensity} color="#fff8e0" castShadow />
    </>
  )
}

// ── 씬 오브젝트 ──────────────────────────────────────────────
function SceneObjects() {
  return (
    <group>
      <mesh position={[-1.5, 0.35, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial metalness={0.95} roughness={0.05} color="#cccccc" />
      </mesh>
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial metalness={0.0} roughness={0.9} color="#cc7744" />
      </mesh>
      <mesh position={[1.5, 0.25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.5, 32]} />
        <meshStandardMaterial metalness={0.4} roughness={0.5} color="#4488cc" />
      </mesh>
      <mesh position={[0, 0.3, 1.4]} castShadow>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshPhysicalMaterial roughness={0.0} metalness={0.0} transmission={0.9} ior={1.5} thickness={0.4} color="#ffffff" envMapIntensity={2.0} />
      </mesh>
      <mesh position={[-1.5, 0.3, 1.4]} castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.25, 0.09, 16, 48]} />
        <meshStandardMaterial metalness={0.8} roughness={0.55} color="#aa8844" />
      </mesh>
    </group>
  )
}

// ── 광원 정의 ─────────────────────────────────────────────────
const LIGHTS = [
  { id: 'ambient',     label: 'ambient',     accent: '#aaffcc', Component: LightAmbient },
  { id: 'point',       label: 'point',       accent: '#ffdd66', Component: LightPoint },
  { id: 'spot',        label: 'spot',        accent: '#ffaa44', Component: LightSpot },
  { id: 'directional', label: 'directional', accent: '#ffe066', Component: LightDirectional },
  { id: 'rectarea',    label: 'rectArea',    accent: '#66ddff', Component: LightRectArea },
  { id: 'hemi',        label: 'hemi',        accent: '#8888ff', Component: LightHemi },
  { id: 'env',         label: 'IBL',         accent: '#cc88ff', Component: null },
  { id: 'sky',         label: 'sky',         accent: '#88ccff', Component: LightSky },
]

// ── 값 포매팅 ─────────────────────────────────────────────────
function fmt(v, step) {
  if (step >= 1)   return Math.round(v)
  if (step >= 0.1) return Number(v).toFixed(1)
  return Number(v).toFixed(2)
}

// ── 스타일 ────────────────────────────────────────────────────
const S = {
  root:   { width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#000' },
  topbar: {
    flexShrink: 0, background: 'rgba(5,5,10,0.94)', borderBottom: '1px solid #1a1a1a',
    display: 'flex', alignItems: 'center', padding: '0 12px', gap: 6,
    fontFamily: 'monospace', flexWrap: 'wrap', minHeight: 44,
  },
  backBtn: {
    padding: '3px 9px', border: '1px solid #2a2a2a', borderRadius: 5,
    background: 'none', color: '#555', cursor: 'pointer', fontSize: 12, flexShrink: 0,
  },
  title:   { color: '#00ffcc', fontSize: 12, fontWeight: 'bold', flexShrink: 0 },
  divider: { color: '#222', flexShrink: 0 },
  toggle: (on, accent) => ({
    padding: '3px 10px', borderRadius: 12, cursor: 'pointer', fontSize: 11,
    fontFamily: 'monospace', flexShrink: 0, transition: 'all 0.15s',
    border: `1px solid ${on ? accent : '#252525'}`,
    background: on ? `${accent}18` : 'transparent',
    color: on ? accent : '#444',
  }),
  clearBtn: {
    padding: '3px 8px', border: '1px solid #2a2a2a', borderRadius: 10,
    background: 'none', color: '#444', cursor: 'pointer', fontSize: 10,
    fontFamily: 'monospace', flexShrink: 0,
  },
  hint: {
    position: 'absolute', bottom: 16, left: 16, zIndex: 10,
    color: '#333', fontFamily: 'monospace', fontSize: 11, pointerEvents: 'none',
  },
  // 파라미터 패널
  panel: {
    position: 'absolute', right: 0, top: 44, bottom: 0,
    width: 220, zIndex: 10,
    background: 'rgba(4,4,8,0.9)', borderLeft: '1px solid #181818',
    padding: '10px 12px',
    fontFamily: 'monospace', overflowY: 'auto',
    display: 'flex', flexDirection: 'column', gap: 12,
    pointerEvents: 'auto',
  },
  panelTitle: { color: '#333', fontSize: 9, letterSpacing: 2, marginBottom: 2 },
  section:    (accent) => ({ borderLeft: `2px solid ${accent}44`, paddingLeft: 8 }),
  sectionHdr: (accent) => ({ color: accent, fontSize: 11, fontWeight: 'bold', marginBottom: 6 }),
  row:        { display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 },
  rowKey:     { color: '#aaaaaa', fontSize: 9, width: 62, flexShrink: 0, textAlign: 'right' },
  rowVal:     { color: '#cccccc', fontSize: 9, width: 30, textAlign: 'right', flexShrink: 0 },
  resetBtn:   (accent) => ({
    fontSize: 9, color: `${accent}88`, background: 'none', border: 'none',
    cursor: 'pointer', padding: '0 0 0 4px', flexShrink: 0,
  }),
}

// ══════════════════════════════════════════════════════════════
export default function TestRoomScene() {
  const [active, setActive]       = useState(() => new Set(['ambient', 'point', 'sky']))
  const [lightParams, setLightParams] = useState(() =>
    Object.fromEntries(Object.entries(DEFAULTS).map(([k, v]) => [k, { ...v }]))
  )
  const [walls, setWalls]         = useState({ front: 'window', back: 'wall', right: 'window', left: 'wall' })
  const [locked, setLocked]       = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [debugMode, setDebugMode] = useState(false)
  const playerRef = useRef()

  function toggle(id) {
    setActive(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function updateParam(id, key, value) {
    setLightParams(prev => ({ ...prev, [id]: { ...prev[id], [key]: value } }))
  }

  function resetParams(id) {
    setLightParams(prev => ({ ...prev, [id]: { ...DEFAULTS[id] } }))
  }

  function toggleWall(key) {
    setWalls(c => ({ ...c, [key]: c[key] === 'window' ? 'wall' : 'window' }))
  }

  useEffect(() => {
    const fn = (e) => { if (e.code === 'Digit1') setDebugMode(v => !v) }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [])

  useEffect(() => {
    if (debugMode) { document.exitPointerLock(); setLocked(false) }
    else playerRef.current?.reset()
  }, [debugMode])

  function handleLockChange(isLocked) {
    setLocked(isLocked)
    if (isLocked) setHasStarted(true)
  }

  const activeLights = LIGHTS.filter(l => active.has(l.id))
  const ep = lightParams.env

  return (
    <div style={S.root}>

      {/* 탑바 */}
      <div style={S.topbar}>
        <button style={S.backBtn} onClick={() => { window.location.hash = '/test' }}>← 라이트 테스트</button>
        <span style={S.title}>Room_Test</span>
        {debugMode && <span style={{ color: '#00ffcc', fontSize: 10 }}>DEV</span>}
        <span style={S.divider}>|</span>
        {LIGHTS.map(l => (
          <button key={l.id} style={S.toggle(active.has(l.id), l.accent)} onClick={() => toggle(l.id)}>
            {active.has(l.id) ? '●' : '○'} {l.label}
          </button>
        ))}
        <span style={S.divider}>|</span>
        <span style={{ color: '#666', fontSize: 11, flexShrink: 0 }}>벽:</span>
        {[
          { key: 'front', label: '앞' },
          { key: 'back',  label: '뒤' },
          { key: 'right', label: '우' },
          { key: 'left',  label: '좌' },
        ].map(({ key, label }) => {
          const isWindow = walls[key] === 'window'
          return (
            <button key={key} style={S.toggle(isWindow, '#88ddff')} onClick={() => toggleWall(key)}>
              {label} {isWindow ? '창문' : '벽'}
            </button>
          )
        })}
        <span style={S.divider}>|</span>
        <button style={S.clearBtn} onClick={() => setActive(new Set())}>전체 끄기</button>
        <button style={{ ...S.clearBtn, marginLeft: -2 }} onClick={() => setActive(new Set(LIGHTS.map(l => l.id)))}>전체 켜기</button>
      </div>

      {/* 파라미터 패널 */}
      {activeLights.length > 0 && (
        <div style={S.panel} onMouseDown={e => e.stopPropagation()}>
          <div style={S.panelTitle}>PARAMS</div>
          {activeLights.map(light => {
            const defs = PARAM_DEFS[light.id]
            if (!defs) return null
            const p = lightParams[light.id]
            return (
              <div key={light.id} style={S.section(light.accent)}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={S.sectionHdr(light.accent)}>{light.label}</span>
                  <button style={S.resetBtn(light.accent)} onClick={() => resetParams(light.id)}>↺</button>
                </div>
                {defs.map(def => (
                  <div key={def.key} style={S.row}>
                    <span style={S.rowKey}>{def.label}</span>

                    {def.type === 'range' && (
                      <>
                        <input
                          type="range"
                          min={def.min} max={def.max} step={def.step}
                          value={p[def.key]}
                          style={{ flex: 1, accentColor: light.accent, cursor: 'pointer' }}
                          onChange={e => updateParam(light.id, def.key, parseFloat(e.target.value))}
                        />
                        <span style={S.rowVal}>{fmt(p[def.key], def.step)}</span>
                      </>
                    )}

                    {def.type === 'color' && (
                      <input
                        type="color"
                        value={p[def.key]}
                        style={{ flex: 1, height: 18, border: '1px solid #222', borderRadius: 3, background: 'none', cursor: 'pointer', padding: 0 }}
                        onChange={e => updateParam(light.id, def.key, e.target.value)}
                      />
                    )}

                    {def.type === 'select' && (
                      <select
                        value={p[def.key]}
                        style={{ flex: 1, background: '#080808', color: '#888', border: '1px solid #222', borderRadius: 3, fontSize: 9, fontFamily: 'monospace', cursor: 'pointer' }}
                        onChange={e => updateParam(light.id, def.key, e.target.value)}
                      >
                        {def.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}

      {/* 십자선 */}
      {locked && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 5, pointerEvents: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 20, lineHeight: 1,
        }}>+</div>
      )}

      {/* 첫 시작 오버레이 */}
      {!locked && !hasStarted && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.55)', zIndex: 5, pointerEvents: 'none',
          color: 'white', fontFamily: 'sans-serif', gap: 8,
        }}>
          <div style={{ fontSize: 20, fontWeight: 'bold' }}>Room_Test 씬</div>
          <div style={{ fontSize: 14, opacity: 0.8 }}>클릭하여 시작 · WASD 이동 · ESC → 파라미터 조절</div>
        </div>
      )}

      <div style={S.hint}>1 — DEV모드 · ESC — 포인터락 해제 후 파라미터 조절</div>

      <Canvas shadows={{ type: THREE.PCFShadowMap }} camera={{ fov: 75 }} style={{ flex: 1 }}>
        {!active.has('sky') && <color attach="background" args={['#c8dff0']} />}

        <Environment
          preset={ep.preset}
          background={false}
          environmentIntensity={active.has('env') ? ep.intensity : 0.15}
        />

        {LIGHTS
          .filter(l => l.Component && active.has(l.id))
          .map(l => <l.Component key={l.id} {...lightParams[l.id]} />)
        }

        <SceneObjects />

        {debugMode && (
          <OrbitControls makeDefault mouseButtons={{ LEFT: 0, MIDDLE: 1, RIGHT: 2 }} />
        )}

        <Physics gravity={[0, 0, 0]} debug={debugMode}>
          <RoomAssembled walls={walls} />
          <PlayerController
            ref={playerRef}
            paused={debugMode}
            onLockChange={handleLockChange}
            onHover={() => {}}
            onInteract={() => {}}
            onDoorClick={() => {}}
            onExamine={() => {}}
            onInspect={() => {}}
          />
        </Physics>
      </Canvas>
    </div>
  )
}
