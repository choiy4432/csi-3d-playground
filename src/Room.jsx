import { useMemo, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import DebugLight from './DebugLight'

export default function Room({ debug = false, isolated = false }) {
  const { scene } = useGLTF('/models/room/Room01.glb')

  // GLB 내장 라이트 노드 수집 (KHR_lights_punctual)
  const glbLights = useMemo(() => {
    const lights = []
    scene.traverse((obj) => {
      if (obj.isLight) lights.push(obj)
    })
    if (lights.length > 0) {
      console.log('[Room] GLB 내장 라이트:', lights.map(l => `${l.name}(${l.type}) @ ${l.getWorldPosition(new THREE.Vector3()).toArray().map(v => v.toFixed(2))}`))
    }
    return lights
  }, [scene])

  // isolation 모드: GLB 내장 라이트 끄기 / 켜기
  useEffect(() => {
    glbLights.forEach((l) => { l.intensity = isolated ? 0 : l.userData._origIntensity ?? l.intensity })
    if (!isolated) {
      glbLights.forEach((l) => {
        if (l.userData._origIntensity === undefined) return
        l.intensity = l.userData._origIntensity
      })
    } else {
      glbLights.forEach((l) => {
        if (l.userData._origIntensity === undefined) l.userData._origIntensity = l.intensity
        l.intensity = 0
      })
    }
  }, [isolated, glbLights])

  // 발광 메시 → pointLight 위치 수집
  const lightPositions = useMemo(() => {
    const positions = []
    const seen = new Set()

    scene.traverse((obj) => {
      if (!obj.isMesh) return
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
      mats.forEach((mat) => {
        if (!mat?.emissive) return
        const isEmissive = mat.emissiveIntensity > 0 || mat.emissive.r > 0 || mat.emissive.g > 0 || mat.emissive.b > 0
        if (!isEmissive || !/light/i.test(obj.name)) return
        mat.emissiveIntensity = Math.max(mat.emissiveIntensity, 4)
        const pos = new THREE.Vector3()
        obj.getWorldPosition(pos)
        const key = pos.toArray().map(v => v.toFixed(3)).join(',')
        if (!seen.has(key)) { seen.add(key); positions.push([pos.x, pos.y, pos.z]) }
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
        <DebugLight
          key={pos.join(',')}
          position={[pos[0], pos[1] - 0.15, pos[2]]}
          intensity={12}
          distance={3.5}
          color="#ffe4a0"
          debug={debug}
          isolated={isolated}
          debugColor="#00ffcc"
        />
      ))}

      {/* isolation 모드: GLB 내장 라이트 위치에도 구체 표시 */}
      {debug && glbLights.map((l, i) => {
        const p = l.getWorldPosition(new THREE.Vector3())
        return (
          <mesh key={`glb-light-${i}`} position={[p.x, p.y, p.z]}>
            <sphereGeometry args={[isolated ? 0.35 : 0.12, 12, 12]} />
            <meshBasicMaterial color="#ff6600" />
          </mesh>
        )
      })}
    </>
  )
}
