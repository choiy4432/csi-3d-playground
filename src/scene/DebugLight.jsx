import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

function BreathSphere({ color, isolated }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    const base = isolated ? 0.35 : 0.12
    const amp  = isolated ? 0.12 : 0.06
    ref.current.scale.setScalar(base + Math.sin(clock.elapsedTime * 2.5) * amp)
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
}

/**
 * pointLight + debug 구체를 한 쌍으로 묶은 래퍼.
 * debug={true}일 때만 구체가 렌더된다.
 *
 * props:
 *   position, intensity, distance, decay, color  — pointLight 그대로
 *   debug      — 구체 표시 여부
 *   isolated   — lightIsolation 모드 (구체 크게 + 흰색)
 *   debugColor — 구체 색상 (기본 #00ffcc)
 */
export default function DebugLight({
  position,
  intensity,
  distance,
  decay = 2,
  color,
  debug = false,
  isolated = false,
  debugColor = '#00ffcc',
}) {
  return (
    <group position={position}>
      <pointLight
        intensity={isolated ? 0 : intensity}
        distance={distance}
        decay={decay}
        color={color}
      />
      {debug && <BreathSphere color={isolated ? '#ffffff' : debugColor} isolated={isolated} />}
    </group>
  )
}
