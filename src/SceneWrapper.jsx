import { useState, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import CrimeScene from './CrimeScene'
import Hand from './Hand'
import MiniGame from './MiniGame'
import Room from './Room'
import PlayerController from './PlayerController'

const INITIAL_EVIDENCES = [
  { id: 1, file: 'Brush.glb',        position: [ 2,   0,  1  ], colliderSize: [0.5, 1.2, 0.5], collected: false,
    miniGame: { type: 'timing',     label: '붓으로 지문 채취',     difficulty: 'normal' } },
  { id: 2, file: 'Sculpture.glb',    position: [-2,   0,  0  ], colliderSize: [1.0, 1.8, 1.0], collected: false,
    miniGame: { type: 'rapidclick', label: '조각상 증거 확보',     target: 8, time: 3.5 } },
  { id: 3, file: 'moon_jar.glb',     position: [ 1,   0, -3  ], colliderSize: [1.0, 1.2, 1.0], collected: false,
    miniGame: { type: 'timing',     label: '도자기 파편 채취',     difficulty: 'hard' } },
  { id: 4, file: 'old_art_Book.glb', position: [-1.5, 0, -2.5], colliderSize: [0.8, 0.6, 1.0], collected: false,
    miniGame: { type: 'timing',     label: '문서 증거 채취',       difficulty: 'easy' } },
]

export default function SceneWrapper() {
  const [evidences, setEvidences]       = useState(INITIAL_EVIDENCES)
  const [locked, setLocked]             = useState(false)
  const [hasStarted, setHasStarted]     = useState(false)
  const [hoveredId, setHoveredId]       = useState(null)
  const [inRange, setInRange]           = useState(false)
  const [debugMode, setDebugMode]         = useState(false)
  const [lightIsolation, setLightIsolation] = useState(false)
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
        <ambientLight intensity={lightIsolation ? 0.02 : 0.4} />
        <pointLight position={[0, 3.5, 0]} intensity={lightIsolation ? 0 : 15} decay={2} />
        <pointLight position={[3, 3, 3]}   intensity={lightIsolation ? 0 : 8}  decay={2} color="#ffe8c0" />
        <pointLight position={[-3, 3, -3]} intensity={lightIsolation ? 0 : 8}  decay={2} color="#ffe8c0" />
        {debugMode && (
          <OrbitControls
            makeDefault
            mouseButtons={{ LEFT: 0, MIDDLE: 1, RIGHT: 2 }}
          />
        )}
        <Physics gravity={[0, 0, 0]} debug={debugMode}>
          <Room debug={debugMode} isolated={lightIsolation} />
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
