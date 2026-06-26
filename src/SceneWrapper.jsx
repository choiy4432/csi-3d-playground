import { useState, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import CrimeScene from './CrimeScene'
import Hand from './Hand'
import MiniGame from './MiniGame'
import Room from './Room'
import PlayerController from './PlayerController'
import DebugLight from './DebugLight'
import { loadPlacements, loadFixedLayer } from './services/mockGenerator'

const DEFAULT_LIGHTING = {
  ambient: 0.4,
  points: [
    { intensity: 15, color: '#ffffff' },
    { intensity: 8,  color: '#ffe8c0' },
    { intensity: 8,  color: '#ffe8c0' },
  ],
}

const SCENE_SCENARIOS = [
  {
    id: 'night',
    label: '야간 수사',
    lighting: {
      ambient: 0.03,
      points: [
        { intensity: 3,  color: '#2233aa' },
        { intensity: 1.5, color: '#112266' },
        { intensity: 1.5, color: '#112266' },
      ],
      roomLight: { color: '#1122aa', intensity: 3 },
    },
    override: {
      brokenGlass: { emissive: '#0011aa', emissiveIntensity: 0.6 },
      floor:       { emissive: '#000011', emissiveIntensity: 0.0, color: '#050308' },
      roofGlass:   { opacity: 0.05 },
    },
  },
  {
    id: 'fresh_crime',
    label: '범행 직후',
    lighting: {
      ambient: 0.06,
      points: [
        { intensity: 6,  color: '#ff2200' },
        { intensity: 3,  color: '#aa1100' },
        { intensity: 3,  color: '#aa1100' },
      ],
      roomLight: { color: '#aa1100', intensity: 4 },
    },
    override: {
      brokenGlass: { emissive: '#ff2200', emissiveIntensity: 2.5 },
      floor:       { emissive: '#1a0000', emissiveIntensity: 0.4 },
      roofGlass:   { opacity: 0.15, emissive: '#330000', emissiveIntensity: 0.8 },
    },
  },
  {
    id: 'forensic',
    label: '법의학 조명',
    lighting: {
      ambient: 0.8,
      points: [
        { intensity: 25, color: '#ddeeff' },
        { intensity: 14, color: '#cceeff' },
        { intensity: 14, color: '#cceeff' },
      ],
      roomLight: { color: '#cceeff', intensity: 18 },
    },
    override: {
      brokenGlass: { emissive: '#aaddff', emissiveIntensity: 1.5 },
      floor:       { emissive: '#112233', emissiveIntensity: 0.3 },
      roofGlass:   { opacity: 0.8, emissive: '#aaddff', emissiveIntensity: 0.5 },
    },
  },
  {
    id: 'tense',
    label: '긴장감',
    lighting: {
      ambient: 0.05,
      points: [
        { intensity: 5,  color: '#ff4400' },
        { intensity: 2,  color: '#aa2200' },
        { intensity: 2,  color: '#aa2200' },
      ],
      roomLight: { color: '#aa3300', intensity: 3 },
    },
    override: {
      brokenGlass: { emissive: '#ff6600', emissiveIntensity: 2 },
      floor:       { emissive: '#220500', emissiveIntensity: 0.5 },
      roofGlass:   { opacity: 0.08, emissive: '#331100', emissiveIntensity: 0.5 },
    },
  },
]

function Kbd({ children }) {
  return (
    <span style={{
      display: 'inline-block', background: '#2a2a2a', border: '1px solid #444',
      borderRadius: 3, padding: '0 5px', marginRight: 6, fontSize: 11, color: '#eee',
    }}>{children}</span>
  )
}

function Dot({ color }) {
  return (
    <span style={{
      display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
      background: color, marginRight: 6, verticalAlign: 'middle',
    }} />
  )
}

export default function SceneWrapper() {
  const [evidences, setEvidences]       = useState(() => {
    const data = loadFixedLayer()
    return loadPlacements(data.scenario.grade_band_id, data)
  })
  const [locked, setLocked]             = useState(false)
  const [hasStarted, setHasStarted]     = useState(false)
  const [hoveredId, setHoveredId]       = useState(null)
  const [inRange, setInRange]           = useState(false)
  const [debugMode, setDebugMode]           = useState(false)
  const [lightIsolation, setLightIsolation] = useState(false)
  const [hintCollapsed, setHintCollapsed]   = useState(false)
  const [activeScenario, setActiveScenario] = useState(null)
  const [grabTrigger, setGrabTrigger]     = useState(0)
  const [activeMiniGame, setActiveMiniGame] = useState(null) // evidence object | null
  const playerRef = useRef()

  // 디버그 토글 (1), 라이트 아이솔레이션 토글 (2 — dev 모드일 때만)
  useEffect(() => {
    const fn = (e) => {
      if (e.code === 'Digit1') setDebugMode((v) => !v)
      if (e.code === 'Digit2') setLightIsolation((v) => debugMode ? !v : false)
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [debugMode])

  // 디버그 OFF 시 라이트 아이솔레이션도 해제
  useEffect(() => {
    if (!debugMode) setLightIsolation(false)
  }, [debugMode])

  // 디버그 ON → 포인터락 해제 / 디버그 OFF → 스폰 지점 리스폰
  useEffect(() => {
    if (debugMode) {
      document.exitPointerLock()
      setLocked(false)
    } else {
      playerRef.current?.reset()
    }
  }, [debugMode])

  // Pointer Lock 변경 추적
  function handleLockChange(isLocked) {
    setLocked(isLocked)
    if (isLocked) setHasStarted(true)
  }

  function handleHover(info) {
    setHoveredId(info?.id ?? null)
    setInRange(info?.inRange ?? false)
  }

  // 클릭 → 미니게임 열기 (채증 직접 X)
  function handleInteract(id) {
    const evidence = evidences.find((ev) => ev.id === id)
    if (!evidence || evidence.collected) return
    setActiveMiniGame(evidence)
  }

  // 미니게임 성공 → 채증
  function handleMiniGameSuccess() {
    setEvidences((prev) =>
      prev.map((ev) => (ev.id === activeMiniGame.id ? { ...ev, collected: true } : ev))
    )
    setGrabTrigger((t) => t + 1)
    setActiveMiniGame(null)
  }

  // 미니게임 실패/취소 → 그냥 닫기 (재시도 가능)
  function handleMiniGameFail() {
    setActiveMiniGame(null)
  }

  useEffect(() => {
    if (evidences.every((ev) => ev.collected)) {
      console.log('채증 완료')
    }
  }, [evidences])

  const collectedCount = evidences.filter((ev) => ev.collected).length

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#000' }}>

      {/* HUD */}
      <div style={{
        position: 'absolute', top: 12, left: 12, zIndex: 10,
        color: 'white', fontFamily: 'monospace', fontSize: 14,
        background: 'rgba(0,0,0,0.5)', padding: '6px 12px', borderRadius: 6,
        pointerEvents: 'none',
      }}>
        채증: {collectedCount} / {evidences.length}
        {debugMode && <span style={{ marginLeft: 12, color: '#00ffcc' }}>DEV</span>}
        {lightIsolation && <span style={{ marginLeft: 8, color: '#ffffff' }}>LIGHT</span>}
      </div>

      {/* 십자선 */}
      {locked && !activeMiniGame && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          zIndex: 10, pointerEvents: 'none',
        }}>
          <span style={{ color: hoveredId && inRange ? '#ffee00' : 'white', fontSize: 20, lineHeight: 1 }}>+</span>
          {hoveredId && (
            <span style={{
              fontSize: 12, fontFamily: 'sans-serif',
              color: inRange ? '#ffee00' : '#aaaaaa',
              background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: 4,
            }}>
              {inRange ? '[클릭] 채증' : '너무 멀어요'}
            </span>
          )}
        </div>
      )}

      {/* DEV 힌트 패널 */}
      {debugMode && (
        <div style={{
          position: 'absolute', bottom: 16, left: 16, zIndex: 10,
          fontFamily: 'monospace', fontSize: 12, lineHeight: '1.7',
          color: '#ccc', background: 'rgba(0,0,0,0.82)',
          border: '1px solid #333', borderRadius: 8,
          minWidth: 240, overflow: 'hidden',
        }}>
          {/* 헤더 (항상 표시) */}
          <div
            onClick={() => setHintCollapsed(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px', cursor: 'pointer', userSelect: 'none',
              borderBottom: hintCollapsed ? 'none' : '1px solid #2a2a2a',
            }}
          >
            <span style={{ color: '#00ffcc', fontWeight: 'bold', letterSpacing: 1 }}>◈ DEV MODE</span>
            <span style={{ color: '#666', fontSize: 14, marginLeft: 16 }}>
              {hintCollapsed ? '▲' : '▼'}
            </span>
          </div>

          {/* 본문 (접히면 숨김) */}
          {!hintCollapsed && (
            <div style={{ padding: '8px 12px 10px' }}>
              <div style={{ color: '#555', fontSize: 10, marginBottom: 6 }}>─── 단축키 ───</div>
              <div><Kbd>1</Kbd> DEV 모드 끄기 · 스폰 지점 리스폰</div>
              <div>
                <Kbd>2</Kbd> 라이트 아이솔레이션&nbsp;
                <span style={{ color: lightIsolation ? '#fff' : '#555' }}>
                  {lightIsolation ? '● ON' : '○ OFF'}
                </span>
              </div>

              <div style={{ color: '#555', fontSize: 10, margin: '8px 0 4px' }}>─── 시점 조작 ───</div>
              <div><Kbd>좌클릭</Kbd> 드래그 — 회전</div>
              <div><Kbd>우클릭</Kbd> 드래그 — 이동 (pan)</div>
              <div><Kbd>휠</Kbd> 줌</div>

              <div style={{ color: '#555', fontSize: 10, margin: '8px 0 6px' }}>─── 생성층 씬 시나리오 ───</div>
              {SCENE_SCENARIOS.map((s) => {
                const active = activeScenario === s.id
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveScenario(active ? null : s.id)}
                    style={{
                      display: 'block', width: '100%', padding: '4px 8px', marginBottom: 4,
                      background: active ? '#1a3a1a' : '#111',
                      border: `1px solid ${active ? '#3a7a3a' : '#333'}`,
                      borderRadius: 4, color: active ? '#66ff66' : '#888',
                      fontFamily: 'monospace', fontSize: 11, cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {active ? '● ' : '○ '}{s.label}
                  </button>
                )
              })}

              <div style={{ color: '#555', fontSize: 10, margin: '8px 0 4px' }}>─── 오브젝트 범례 ───</div>
              <div><Dot color="#ffee44" /> 노란 와이어프레임 — Rapier 콜라이더</div>
              <div style={{ paddingLeft: 14, color: '#888' }}>RGB 축 — RigidBody 로컬 좌표계</div>
              <div><Dot color="#aa44ff" /> 보라 구체 — 전역 pointLight (씬 전체조명)</div>
              <div><Dot color="#00ffcc" /> 민트 구체 — GLB emissive 기반 pointLight</div>
              <div><Dot color="#ff6600" /> 주황 구체 — GLB 내장 라이트 노드</div>
            </div>
          )}
        </div>
      )}

      {/* 손 */}
      {locked && <Hand grabTrigger={grabTrigger} />}

      {/* 미니게임 오버레이 */}
      {activeMiniGame && (
        <MiniGame
          evidence={activeMiniGame}
          onSuccess={handleMiniGameSuccess}
          onFail={handleMiniGameFail}
        />
      )}

      {/* 첫 시작 오버레이 */}
      {!locked && !hasStarted && !activeMiniGame && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.55)', zIndex: 10, pointerEvents: 'none',
          color: 'white', fontFamily: 'sans-serif', gap: 8,
        }}>
          <div style={{ fontSize: 22, fontWeight: 'bold' }}>🔍 범죄 현장 조사</div>
          <div style={{ fontSize: 15, opacity: 0.85 }}>클릭하여 시작 · WASD 이동 · 마우스 시점</div>
          <div style={{ fontSize: 13, opacity: 0.65 }}>증거를 클릭하면 채증됩니다</div>
        </div>
      )}


      <Canvas camera={{ fov: 75 }}>
        {(() => {
          const lighting = SCENE_SCENARIOS.find(s => s.id === activeScenario)?.lighting ?? DEFAULT_LIGHTING
          const pts = lighting.points
          return (<>
            <ambientLight intensity={lightIsolation ? 0.02 : lighting.ambient} />
            <DebugLight position={[0, 3.5, 0]}  intensity={pts[0].intensity} color={pts[0].color} debug={debugMode} isolated={lightIsolation} debugColor="#aa44ff" />
            <DebugLight position={[3, 3, 3]}    intensity={pts[1].intensity} color={pts[1].color} debug={debugMode} isolated={lightIsolation} debugColor="#aa44ff" />
            <DebugLight position={[-3, 3, -3]}  intensity={pts[2].intensity} color={pts[2].color} debug={debugMode} isolated={lightIsolation} debugColor="#aa44ff" />
          </>)
        })()}
        {debugMode && (
          <OrbitControls
            makeDefault
            mouseButtons={{ LEFT: 0, MIDDLE: 1, RIGHT: 2 }}
          />
        )}
        <Physics gravity={[0, 0, 0]} debug={debugMode}>
          {(() => {
            const scenario = SCENE_SCENARIOS.find(s => s.id === activeScenario)
            return <Room
              debug={debugMode}
              isolated={lightIsolation}
              sceneOverride={scenario?.override ?? null}
              lightColor={scenario?.lighting.roomLight?.color ?? '#ffe4a0'}
              lightIntensity={scenario?.lighting.roomLight?.intensity ?? 12}
            />
          })()}
          <CrimeScene evidences={evidences} hoveredId={hoveredId} inRange={inRange} />
          <PlayerController
            ref={playerRef}
            paused={!!activeMiniGame || debugMode}
            onLockChange={handleLockChange}
            onHover={handleHover}
            onInteract={handleInteract}
          />
        </Physics>
      </Canvas>
    </div>
  )
}
