import { useRef, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import * as THREE from 'three'

function BreathSphere({ isolated }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    const base  = isolated ? 0.35 : 0.12
    const amp   = isolated ? 0.12 : 0.06
    const s = base + Math.sin(clock.elapsedTime * 2.5) * amp
    ref.current.scale.setScalar(s)
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial color={isolated ? '#ffffff' : '#00ffcc'} />
    </mesh>
  )
}

function DebugPointLight({ position, debug, isolated }) {
  return (
    <group position={position}>
      <pointLight intensity={12} distance={3.5} decay={2} color="#ffe4a0" />
      {debug && <BreathSphere isolated={isolated} />}
    </group>
  )
}

export default function Room({ debug = false, isolated = false }) {
  const { scene } = useGLTF('/models/room/Room01.glb')

  // GLB 안의 발광 머티리얼 메시를 찾아 강도를 높이고, 포인트라이트 위치를 수집
  const lightPositions = useMemo(() => {
    const positions = []
    const seen = new Set()  // StrictMode 이중 마운트 중복 방지

    scene.traverse((obj) => {
      if (!obj.isMesh) return

      const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
      mats.forEach((mat) => {
        if (!mat?.emissive) return
        const isEmissive =
          mat.emissiveIntensity > 0 ||
          mat.emissive.r > 0 || mat.emissive.g > 0 || mat.emissive.b > 0
        if (!isEmissive) return

        // 조명 기구 메시만 pointLight 생성 (이름에 'light' 포함, 대소문자 무관)
        const isLightFixture = /light/i.test(obj.name)
        if (isLightFixture) {
          mat.emissiveIntensity = Math.max(mat.emissiveIntensity, 4)
          const pos = new THREE.Vector3()
          obj.getWorldPosition(pos)
          const key = pos.toArray().map(v => v.toFixed(3)).join(',')
          if (!seen.has(key)) {
            seen.add(key)
            positions.push([pos.x, pos.y, pos.z])
          }
        }
      })
    })
    return positions
  }, [scene])

  return (
    <>
      <RigidBody type="fixed" colliders="trimesh">
        <primitive object={scene} />
      </RigidBody>

      {lightPositions.map((pos) => (
        <DebugPointLight
          key={pos.join(',')}
          position={[pos[0], pos[1] - 0.15, pos[2]]}
          debug={debug}
          isolated={isolated}
        />
      ))}
    </>
  )
}
