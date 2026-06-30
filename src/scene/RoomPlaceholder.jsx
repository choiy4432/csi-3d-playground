import { RigidBody, CuboidCollider } from '@react-three/rapier'

const W = 4.5   // half-width  → 9m
const H = 3.0   // full height → 3m
const D = 4.5   // half-depth  → 9m
const T = 0.15  // wall half-thickness

export default function RoomPlaceholder({ wallColor = '#777', floorColor = '#555', ceilingColor = '#888' }) {
  return (
    <>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[W,      0.1,      D]}      position={[0,        -0.1,      0]}      />
        <CuboidCollider args={[W,      0.1,      D]}      position={[0,        H + 0.1,   0]}      />
        <CuboidCollider args={[T,      H / 2,    D + T]}  position={[W + T,    H / 2,     0]}      />
        <CuboidCollider args={[T,      H / 2,    D + T]}  position={[-(W + T), H / 2,     0]}      />
        <CuboidCollider args={[W + T,  H / 2,    T]}      position={[0,        H / 2,  -(D + T)]}  />
        <CuboidCollider args={[W + T,  H / 2,    T]}      position={[0,        H / 2,   D + T]}    />
      </RigidBody>

      {/* 바닥 */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[W * 2, 0.1, D * 2]} />
        <meshStandardMaterial color={floorColor} />
      </mesh>
      {/* 천장 */}
      <mesh position={[0, H, 0]}>
        <boxGeometry args={[W * 2, 0.1, D * 2]} />
        <meshStandardMaterial color={ceilingColor} />
      </mesh>
      {/* 남쪽 벽 */}
      <mesh position={[0, H / 2, -D]}>
        <boxGeometry args={[W * 2, H, 0.1]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      {/* 북쪽 벽 */}
      <mesh position={[0, H / 2, D]}>
        <boxGeometry args={[W * 2, H, 0.1]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      {/* 동쪽 벽 */}
      <mesh position={[W, H / 2, 0]}>
        <boxGeometry args={[0.1, H, D * 2]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      {/* 서쪽 벽 */}
      <mesh position={[-W, H / 2, 0]}>
        <boxGeometry args={[0.1, H, D * 2]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
    </>
  )
}
