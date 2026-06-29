import { useRef, useEffect } from 'react'

export default function DoorPortal({ position, rotation = [0, 0, 0], doorTo }) {
  const innerRef = useRef()

  useEffect(() => {
    if (innerRef.current) innerRef.current.userData.doorTo = doorTo
  }, [doorTo])

  return (
    <group position={position} rotation={rotation}>
      {/* 프레임 */}
      <mesh>
        <boxGeometry args={[1.4, 2.4, 0.06]} />
        <meshStandardMaterial color="#0a0a22" emissive="#1a1a66" emissiveIntensity={0.4} />
      </mesh>
      {/* 클릭 가능한 포털 표면 */}
      <mesh ref={innerRef}>
        <boxGeometry args={[1.0, 2.0, 0.1]} />
        <meshStandardMaterial
          color="#2233ff"
          emissive="#4466ff"
          emissiveIntensity={0.9}
          transparent
          opacity={0.6}
        />
      </mesh>
      <pointLight color="#4466ff" intensity={4} distance={3} decay={2} />
    </group>
  )
}
