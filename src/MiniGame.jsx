import { useState, useEffect, useRef } from 'react'

const overlay = {
  position: 'absolute', inset: 0, zIndex: 20,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(0,0,0,0.78)', pointerEvents: 'none',
}
const card = {
  background: '#0f0f0f', border: '1px solid #2a2a2a',
  borderRadius: 16, padding: '36px 44px', minWidth: 380,
  color: 'white', fontFamily: 'monospace', textAlign: 'center',
}
const hint = { color: '#6b7280', fontSize: 12, marginTop: 6 }

// ── 타이밍 바 ─────────────────────────────────────────────────
function TimingGame({ config, onResult }) {
  const speed = { easy: 28, normal: 50, hard: 76 }[config.difficulty] ?? 50
  const zoneW = { easy: 32, normal: 22, hard: 13 }[config.difficulty] ?? 22
  const zoneX = (100 - zoneW) / 2

  const posRef  = useRef(0)
  const dirRef  = useRef(1)
  const [pos, setPos]     = useState(0)
  const [state, setState] = useState('playing')

  useEffect(() => {
    if (state !== 'playing') return
    let raf, last = performance.now()
    const tick = (now) => {
      const dt = (now - last) / 1000; last = now
      posRef.current += dirRef.current * speed * dt
      if (posRef.current >= 100) { posRef.current = 100; dirRef.current = -1 }
      if (posRef.current <= 0)   { posRef.current = 0;   dirRef.current = 1 }
      setPos(posRef.current)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [state, speed])

  const attempt = () => {
    if (state !== 'playing') return
    const hit = posRef.current >= zoneX && posRef.current <= zoneX + zoneW
    setState(hit ? 'success' : 'fail')
    setTimeout(() => onResult(hit), 550)
  }

  // 포인터 락 중에도 동작: mousedown + keydown 모두 수신
  useEffect(() => {
    const onMouse = () => attempt()
    const onKey   = (e) => { if (e.code === 'KeyF' || e.code === 'Space') { e.preventDefault(); attempt() } }
    window.addEventListener('mousedown', onMouse)
    window.addEventListener('keydown',   onKey)
    return () => {
      window.removeEventListener('mousedown', onMouse)
      window.removeEventListener('keydown',   onKey)
    }
  })

  const barColor = state === 'success' ? '#4ade80' : state === 'fail' ? '#f87171' : 'white'

  return (
    <>
      <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 20 }}>
        표시기가 <span style={{ color: '#4ade80' }}>초록 구간</span>에 올 때 채취!
      </p>
      <div style={{ position: 'relative', height: 30, background: '#1e1e1e', borderRadius: 15, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{
          position: 'absolute', left: `${zoneX}%`, width: `${zoneW}%`, height: '100%',
          background: '#14532d55',
          borderLeft: '2px solid #4ade80', borderRight: '2px solid #4ade80',
        }} />
        <div style={{
          position: 'absolute', top: 2, bottom: 2, width: 4, borderRadius: 2,
          background: barColor, boxShadow: `0 0 8px ${barColor}`,
          left: `${pos}%`, transform: 'translateX(-50%)',
        }} />
      </div>

      {state === 'playing' && <p style={hint}>마우스 클릭 또는 <kbd style={{ background: '#222', padding: '1px 5px', borderRadius: 3 }}>F</kbd></p>}
      {state === 'success' && <p style={{ color: '#4ade80', fontSize: 17, marginTop: 8 }}>✓ 채취 성공!</p>}
      {state === 'fail'    && <p style={{ color: '#f87171', fontSize: 17, marginTop: 8 }}>✗ 실패 — 다시 시도</p>}
    </>
  )
}

// ── 연타 게임 ─────────────────────────────────────────────────
function RapidClickGame({ config, onResult }) {
  const { target = 8, time = 3.5 } = config
  const [clicks, setClicks]     = useState(0)
  const [timeLeft, setTimeLeft] = useState(time)
  const [state, setState]       = useState('playing')
  const clicksRef = useRef(0)
  const stateRef  = useRef('playing')

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(t => {
        const next = parseFloat(Math.max(0, t - 0.05).toFixed(2))
        if (next <= 0 && stateRef.current === 'playing') {
          stateRef.current = 'fail'
          setState('fail')
          setTimeout(() => onResult(false), 550)
        }
        return next
      })
    }, 50)
    return () => clearInterval(id)
  }, [])

  // 포인터 락 중에도 동작: window mousedown
  useEffect(() => {
    const onMouse = () => {
      if (stateRef.current !== 'playing') return
      const next = clicksRef.current + 1
      clicksRef.current = next
      setClicks(next)
      if (next >= target) {
        stateRef.current = 'success'
        setState('success')
        setTimeout(() => onResult(true), 550)
      }
    }
    window.addEventListener('mousedown', onMouse)
    return () => window.removeEventListener('mousedown', onMouse)
  }, [target])

  const timePct  = (timeLeft / time) * 100
  const clickPct = Math.min((clicks / target) * 100, 100)

  return (
    <>
      <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 16 }}>
        <span style={{ color: '#facc15' }}>{target}번</span> 클릭!
      </p>
      <div style={{ height: 4, background: '#1e1e1e', borderRadius: 2, marginBottom: 10 }}>
        <div style={{ height: '100%', borderRadius: 2, transition: 'width 0.05s linear',
          width: `${timePct}%`, background: timePct > 40 ? '#4ade80' : '#f87171' }} />
      </div>
      <div style={{ height: 18, background: '#1e1e1e', borderRadius: 9, marginBottom: 10, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 9, transition: 'width 0.08s ease-out',
          width: `${clickPct}%`, background: '#facc15' }} />
      </div>
      <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 8 }}>{clicks} / {target} &nbsp;·&nbsp; {timeLeft.toFixed(1)}s</p>

      {state === 'playing' && <p style={hint}>마우스 클릭으로 연타!</p>}
      {state === 'success' && <p style={{ color: '#4ade80', fontSize: 17, marginTop: 8 }}>✓ 증거 확보!</p>}
      {state === 'fail'    && <p style={{ color: '#f87171', fontSize: 17, marginTop: 8 }}>✗ 시간 초과 — 다시 시도</p>}
    </>
  )
}

// ── 래퍼 ──────────────────────────────────────────────────────
export default function MiniGame({ evidence, onSuccess, onFail }) {
  const { miniGame } = evidence

  useEffect(() => {
    const fn = (e) => { if (e.code === 'Escape') onFail() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onFail])

  const handleResult = (success) => { success ? onSuccess() : onFail() }

  return (
    <div style={overlay}>
      <div style={card}>
        <p style={{ color: '#3b82f6', fontSize: 11, letterSpacing: 3, marginBottom: 6 }}>◈ 증거 채취</p>
        <h3 style={{ fontSize: 18, marginBottom: 24, color: '#f1f5f9', fontWeight: 'normal' }}>
          {miniGame.label}
        </h3>

        {miniGame.type === 'timing'     && <TimingGame     config={miniGame} onResult={handleResult} />}
        {miniGame.type === 'rapidclick' && <RapidClickGame config={miniGame} onResult={handleResult} />}

        <p style={{ ...hint, marginTop: 24 }}>ESC — 취소</p>
      </div>
    </div>
  )
}
