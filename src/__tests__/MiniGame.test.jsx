/**
 * MiniGame.test.jsx
 *
 * 테스트 전략:
 * - TimingGame / RapidClickGame 판정 로직은 컴포넌트 내부에서 직접 계산되는 순수 로직이므로
 *   동일한 공식을 함수로 추출해 단위 테스트한다.
 * - 컴포넌트 통합 테스트(ESC 취소, type 라우팅)는 @testing-library/react 로 마운트해
 *   window 이벤트 트리거로 검증한다. rAF 는 vitest 의 fake timer 로 동결한다.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MiniGame from '../MiniGame.jsx'

// ─────────────────────────────────────────────────────────────────────────────
// 1. TimingGame 판정 로직 — 순수 함수로 추출하여 단위 테스트
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TimingGame 내부에서 사용하는 판정 로직을 그대로 복사한 순수 함수.
 * 컴포넌트를 마운트하지 않고도 경계값을 빠르게 검증할 수 있다.
 */
function getTimingParams(difficulty) {
  const speed = { easy: 28, normal: 50, hard: 76 }[difficulty] ?? 50
  const zoneW = { easy: 32, normal: 22, hard: 13 }[difficulty] ?? 22
  const zoneX = (100 - zoneW) / 2
  return { speed, zoneW, zoneX }
}

function isHit(pos, zoneX, zoneW) {
  return pos >= zoneX && pos <= zoneX + zoneW
}

describe('TimingGame — 파라미터 계산', () => {
  it('easy: speed=28, zoneW=32, zoneX=34', () => {
    const { speed, zoneW, zoneX } = getTimingParams('easy')
    expect(speed).toBe(28)
    expect(zoneW).toBe(32)
    expect(zoneX).toBe(34)
  })

  it('normal: speed=50, zoneW=22, zoneX=39', () => {
    const { speed, zoneW, zoneX } = getTimingParams('normal')
    expect(speed).toBe(50)
    expect(zoneW).toBe(22)
    expect(zoneX).toBe(39)
  })

  it('hard: speed=76, zoneW=13, zoneX=43.5', () => {
    const { speed, zoneW, zoneX } = getTimingParams('hard')
    expect(speed).toBe(76)
    expect(zoneW).toBe(13)
    expect(zoneX).toBeCloseTo(43.5)
  })

  it('알 수 없는 difficulty는 기본값(speed=50, zoneW=22, zoneX=39) 반환', () => {
    const { speed, zoneW, zoneX } = getTimingParams('extreme')
    expect(speed).toBe(50)
    expect(zoneW).toBe(22)
    expect(zoneX).toBe(39)
  })
})

describe('TimingGame — 경계값 판정 (easy)', () => {
  const { zoneX, zoneW } = getTimingParams('easy') // zoneX=34, zoneW=32, 구간 [34, 66]

  it('pos === zoneX (좌측 경계) → 성공', () => {
    expect(isHit(zoneX, zoneX, zoneW)).toBe(true)
  })

  it('pos === zoneX - 0.01 (좌측 경계 직전) → 실패', () => {
    expect(isHit(zoneX - 0.01, zoneX, zoneW)).toBe(false)
  })

  it('pos === zoneX + zoneW (우측 경계) → 성공', () => {
    expect(isHit(zoneX + zoneW, zoneX, zoneW)).toBe(true)
  })

  it('pos === zoneX + zoneW + 0.01 (우측 경계 직후) → 실패', () => {
    expect(isHit(zoneX + zoneW + 0.01, zoneX, zoneW)).toBe(false)
  })
})

describe('TimingGame — 경계값 판정 (normal)', () => {
  const { zoneX, zoneW } = getTimingParams('normal') // zoneX=39, zoneW=22, 구간 [39, 61]

  it('pos === zoneX (좌측 경계) → 성공', () => {
    expect(isHit(zoneX, zoneX, zoneW)).toBe(true)
  })

  it('pos === zoneX - 0.01 → 실패', () => {
    expect(isHit(zoneX - 0.01, zoneX, zoneW)).toBe(false)
  })

  it('pos === zoneX + zoneW (우측 경계) → 성공', () => {
    expect(isHit(zoneX + zoneW, zoneX, zoneW)).toBe(true)
  })

  it('pos === zoneX + zoneW + 0.01 → 실패', () => {
    expect(isHit(zoneX + zoneW + 0.01, zoneX, zoneW)).toBe(false)
  })
})

describe('TimingGame — 경계값 판정 (hard)', () => {
  const { zoneX, zoneW } = getTimingParams('hard') // zoneX=43.5, zoneW=13, 구간 [43.5, 56.5]

  it('pos === zoneX (좌측 경계) → 성공', () => {
    expect(isHit(zoneX, zoneX, zoneW)).toBe(true)
  })

  it('pos === zoneX - 0.01 → 실패', () => {
    expect(isHit(zoneX - 0.01, zoneX, zoneW)).toBe(false)
  })

  it('pos === zoneX + zoneW (우측 경계) → 성공', () => {
    expect(isHit(zoneX + zoneW, zoneX, zoneW)).toBe(true)
  })

  it('pos === zoneX + zoneW + 0.01 → 실패', () => {
    expect(isHit(zoneX + zoneW + 0.01, zoneX, zoneW)).toBe(false)
  })
})

describe('TimingGame — 중앙(pos=50) difficulty별 히트 여부', () => {
  it('easy  (구간 [34, 66]): pos=50 → 성공', () => {
    const { zoneX, zoneW } = getTimingParams('easy')
    expect(isHit(50, zoneX, zoneW)).toBe(true)
  })

  it('normal (구간 [39, 61]): pos=50 → 성공', () => {
    const { zoneX, zoneW } = getTimingParams('normal')
    expect(isHit(50, zoneX, zoneW)).toBe(true)
  })

  it('hard  (구간 [43.5, 56.5]): pos=50 → 성공', () => {
    const { zoneX, zoneW } = getTimingParams('hard')
    expect(isHit(50, zoneX, zoneW)).toBe(true)
  })

  it('easy  구간 밖(pos=10) → 실패', () => {
    const { zoneX, zoneW } = getTimingParams('easy')
    expect(isHit(10, zoneX, zoneW)).toBe(false)
  })

  it('hard  구간 밖(pos=57) → 실패', () => {
    const { zoneX, zoneW } = getTimingParams('hard')
    expect(isHit(57, zoneX, zoneW)).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 2. RapidClickGame 판정 로직 — 순수 함수
// ─────────────────────────────────────────────────────────────────────────────

/**
 * RapidClickGame 의 성공/실패 판정을 순수 함수로 추출.
 */
function rapidClickResult({ clicks, target, timeLeft }) {
  if (clicks >= target) return 'success'
  if (timeLeft <= 0)    return 'fail'
  return 'playing'
}

describe('RapidClickGame — 판정 로직', () => {
  const target = 8

  it('target-1 클릭(7번): 아직 성공 아님 → playing', () => {
    expect(rapidClickResult({ clicks: target - 1, target, timeLeft: 2.0 })).toBe('playing')
  })

  it('target번째 클릭(8번): 성공 → success', () => {
    expect(rapidClickResult({ clicks: target, target, timeLeft: 1.5 })).toBe('success')
  })

  it('target 초과 클릭(9번): 성공 → success', () => {
    expect(rapidClickResult({ clicks: target + 1, target, timeLeft: 1.0 })).toBe('success')
  })

  it('timeLeft === 0 이고 클릭 미달: 실패 → fail', () => {
    expect(rapidClickResult({ clicks: 5, target, timeLeft: 0 })).toBe('fail')
  })

  it('timeLeft < 0 (오차 허용): 실패 → fail', () => {
    expect(rapidClickResult({ clicks: 3, target, timeLeft: -0.01 })).toBe('fail')
  })

  it('clicks === 0, timeLeft > 0: playing', () => {
    expect(rapidClickResult({ clicks: 0, target, timeLeft: 3.5 })).toBe('playing')
  })

  it('clicks === target - 1, timeLeft === 0: fail (클릭 미달, 시간 초과)', () => {
    // 시간 초과가 클릭 미달보다 먼저 판정되지 않고, clicks 가 우선이 아닌 경우
    // 실제 컴포넌트에서는 setInterval 이 먼저 0 도달을 감지하여 fail 처리.
    expect(rapidClickResult({ clicks: target - 1, target, timeLeft: 0 })).toBe('fail')
  })

  it('커스텀 target=5: 5번 클릭 → success', () => {
    expect(rapidClickResult({ clicks: 5, target: 5, timeLeft: 1.0 })).toBe('success')
  })

  it('커스텀 target=5: 4번 클릭, 시간 초과 → fail', () => {
    expect(rapidClickResult({ clicks: 4, target: 5, timeLeft: 0 })).toBe('fail')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 3. MiniGame 래퍼 — ESC 취소
// ─────────────────────────────────────────────────────────────────────────────

/** rAF를 자체 ID 공간으로 stub — setTimeout/clearTimeout 과 충돌 없음 */
function stubRaf() {
  let rafId = 0
  const pending = new Map()
  vi.stubGlobal('requestAnimationFrame', (cb) => {
    const id = ++rafId
    pending.set(id, cb)
    return id
  })
  vi.stubGlobal('cancelAnimationFrame', (id) => {
    pending.delete(id)
  })
  return pending
}

describe('MiniGame 래퍼 — ESC 취소', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    stubRaf()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('ESC 키 입력 시 onFail 이 호출된다', () => {
    const onSuccess = vi.fn()
    const onFail    = vi.fn()
    const evidence  = { miniGame: { type: 'timing', difficulty: 'normal', label: '지문 채취' } }

    render(<MiniGame evidence={evidence} onSuccess={onSuccess} onFail={onFail} />)

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', bubbles: true }))

    expect(onFail).toHaveBeenCalledTimes(1)
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('ESC 가 아닌 다른 키(Enter)는 onFail 을 호출하지 않는다', () => {
    const onSuccess = vi.fn()
    const onFail    = vi.fn()
    const evidence  = { miniGame: { type: 'timing', difficulty: 'normal', label: '지문 채취' } }

    render(<MiniGame evidence={evidence} onSuccess={onSuccess} onFail={onFail} />)

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', bubbles: true }))

    expect(onFail).not.toHaveBeenCalled()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 4. MiniGame 래퍼 — type 라우팅
// ─────────────────────────────────────────────────────────────────────────────

describe('MiniGame 래퍼 — type 라우팅', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    stubRaf()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('type="timing" → "채취 성공" 또는 타이밍바 안내 문구가 렌더된다', () => {
    const evidence = {
      miniGame: { type: 'timing', difficulty: 'easy', label: '혈흔 채취' },
    }
    render(
      <MiniGame evidence={evidence} onSuccess={vi.fn()} onFail={vi.fn()} />
    )
    // TimingGame 고유 안내 문구
    expect(screen.getByText(/초록 구간/)).toBeInTheDocument()
  })

  it('type="rapidclick" → 연타 안내 문구가 렌더된다', () => {
    const evidence = {
      miniGame: { type: 'rapidclick', target: 8, time: 3.5, label: '시료 연타 채취' },
    }
    render(
      <MiniGame evidence={evidence} onSuccess={vi.fn()} onFail={vi.fn()} />
    )
    // RapidClickGame 고유 안내 문구
    expect(screen.getByText(/클릭!/)).toBeInTheDocument()
  })

  it('type="timing" 일 때 RapidClickGame 의 연타 문구는 없다', () => {
    const evidence = {
      miniGame: { type: 'timing', difficulty: 'normal', label: '혈흔 채취' },
    }
    render(
      <MiniGame evidence={evidence} onSuccess={vi.fn()} onFail={vi.fn()} />
    )
    expect(screen.queryByText(/마우스 클릭으로 연타/)).not.toBeInTheDocument()
  })

  it('type="rapidclick" 일 때 TimingGame 의 타이밍바 문구는 없다', () => {
    const evidence = {
      miniGame: { type: 'rapidclick', target: 5, time: 3.5, label: '시료 연타 채취' },
    }
    render(
      <MiniGame evidence={evidence} onSuccess={vi.fn()} onFail={vi.fn()} />
    )
    expect(screen.queryByText(/초록 구간/)).not.toBeInTheDocument()
  })

  it('label 이 항상 렌더된다', () => {
    const label = '특수 증거 채취'
    const evidence = {
      miniGame: { type: 'timing', difficulty: 'hard', label },
    }
    render(
      <MiniGame evidence={evidence} onSuccess={vi.fn()} onFail={vi.fn()} />
    )
    expect(screen.getByText(label)).toBeInTheDocument()
  })
})
