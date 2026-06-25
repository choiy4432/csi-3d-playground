import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { RigidBody, CuboidCollider } from '@react-three/rapier'

export default function EvidenceObject({ id, file, position, collected, hovered, inRange, colliderSize = [1, 1.2, 1] }) {
  const { scene } = useGLTF(`/models/${file}`)
  const [w, h, d] = colliderSize
  const cy = h / 2

  const model = useMemo(() => {
    const clone = scene.clone()
    clone.traverse((obj) => {
      if (obj.isMesh) obj.raycast = () => {}
    })
    return clone
  }, [scene])

  return (
    <group position={position}>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[w / 2, h / 2, d / 2]} position={[0, cy, 0]} />
      </RigidBody>

      <primitive object={model} scale={collected ? 1.5 : 1} />

      {/* 레이캐스트 타겟 — 클릭은 PlayerController가 직접 처리 */}
      <mesh position={[0, cy, 0]} userData={{ evidenceId: id }}>
        <boxGeometry args={colliderSize} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* 범위 내 → 노란색, 범위 밖 → 회색 */}
      {hovered && !collected && (
        <mesh position={[0, cy, 0]}>
          <boxGeometry args={colliderSize} />
          <meshBasicMaterial color={inRange ? 'yellow' : '#888888'} wireframe />
        </mesh>
      )}

      {collected && (
        <mesh position={[0, cy, 0]}>
          <boxGeometry args={colliderSize} />
          <meshBasicMaterial color="lime" wireframe opacity={0.5} transparent />
        </mesh>
      )}
    </group>
  )
}
