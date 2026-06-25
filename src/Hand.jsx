import { useState, useEffect } from 'react'

const G = '#ddd8cc'   // 장갑 색
const S = '#b0a898'   // 그림자/윤곽

function OpenHand() {
  return (
    <svg width="110" height="170" viewBox="0 0 110 170" fill="none">
      {/* 손바닥 */}
      <rect x="18" y="70" width="70" height="88" rx="14" fill={G} stroke={S} strokeWidth="2"/>
      {/* 검지 */}
      <rect x="20" y="18" width="15" height="62" rx="7" fill={G} stroke={S} strokeWidth="2"/>
      {/* 중지 */}
      <rect x="37" y="10" width="15" height="70" rx="7" fill={G} stroke={S} strokeWidth="2"/>
      {/* 약지 */}
      <rect x="54" y="14" width="15" height="66" rx="7" fill={G} stroke={S} strokeWidth="2"/>
      {/* 새끼 */}
      <rect x="70" y="26" width="12" height="52" rx="6" fill={G} stroke={S} strokeWidth="2"/>
      {/* 엄지 */}
      <rect x="2" y="68" width="22" height="40" rx="9" fill={G} stroke={S} strokeWidth="2"
        transform="rotate(-22 2 68)"/>
      {/* 손목 커프 */}
      <rect x="18" y="148" width="70" height="18" rx="6" fill={S} opacity="0.5"/>
    </svg>
  )
}

function ClosedHand() {
  return (
    <svg width="110" height="140" viewBox="0 0 110 140" fill="none">
      {/* 주먹 본체 */}
      <rect x="18" y="40" width="72" height="82" rx="14" fill={G} stroke={S} strokeWidth="2"/>
      {/* 접힌 손가락 마디 */}
      <rect x="20" y="30" width="15" height="24" rx="7" fill={G} stroke={S} strokeWidth="2"/>
      <rect x="37" y="24" width="15" height="24" rx="7" fill={G} stroke={S} strokeWidth="2"/>
      <rect x="54" y="27" width="15" height="22" rx="7" fill={G} stroke={S} strokeWidth="2"/>
      <rect x="70" y="34" width="12" height="18" rx="6" fill={G} stroke={S} strokeWidth="2"/>
      {/* 마디 주름선 */}
      <line x1="20" y1="52" x2="90" y2="52" stroke={S} strokeWidth="1.5" opacity="0.5"/>
      {/* 엄지 */}
      <rect x="2" y="58" width="22" height="36" rx="9" fill={G} stroke={S} strokeWidth="2"
        transform="rotate(-10 2 58)"/>
      {/* 손목 커프 */}
      <rect x="18" y="112" width="70" height="18" rx="6" fill={S} opacity="0.5"/>
    </svg>
  )
}

// 오른쪽 하단 대각선 배치 기준 base transform
const BASE = 'rotate(-30deg) scaleX(-1)'

const STYLE = `
  @keyframes handBob {
    0%, 100% { transform: ${BASE} translateY(0px); }
    50%       { transform: ${BASE} translateY(-6px); }
  }
`

export default function Hand({ grabTrigger }) {
  const [phase, setPhase] = useState('idle')

  useEffect(() => {
    if (!grabTrigger) return
    setPhase('reach')
    const t1 = setTimeout(() => setPhase('grab'),   180)
    const t2 = setTimeout(() => setPhase('return'), 360)
    const t3 = setTimeout(() => setPhase('idle'),   580)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [grabTrigger])

  const isIdle   = phase === 'idle'
  const isClosed = phase === 'grab' || phase === 'return'

  const phaseStyle = {
    idle:   { transform: `${BASE} translateY(0px)`,   transition: 'none' },
    reach:  { transform: `${BASE} translateY(-40px)`, transition: 'transform 0.18s ease-out' },
    grab:   { transform: `${BASE} translateY(-25px)`, transition: 'transform 0.12s ease-in' },
    return: { transform: `${BASE} translateY(0px)`,   transition: 'transform 0.22s ease-out' },
  }[phase]

  return (
    <>
      <style>{STYLE}</style>
      <div style={{
        position: 'absolute',
        bottom: -30,
        right: -20,
        pointerEvents: 'none',
        zIndex: 5,
        filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.6))',
        animation: isIdle ? 'handBob 2.4s ease-in-out infinite' : 'none',
        ...phaseStyle,
      }}>
        {isClosed ? <ClosedHand /> : <OpenHand />}
      </div>
    </>
  )
}
