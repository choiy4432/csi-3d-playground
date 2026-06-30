import { useMemo, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import DebugLight from './DebugLight'

export default function Room({ debug = false, isolated = false, sceneOverride = null, lightColor = '#ffe4a0', lightIntensity = 12 }) {
  const { scene } = useGLTF('/models/room/Room01.glb')

  // GLB 내장 라이트 노드 수집 + 깨진 유리 랜덤 위치 (Rapier 초기화 전에 반영)
  const glbLights = useMemo(() => {
    scene.traverse((obj) => {
      if (obj.name === 'Broken_glass') {
        const x = -2.5 + Math.random() * 5.0
        const z = -3.2 + Math.random() * 6.4
        obj.position.set(x, obj.position.y, z)
      }
    })

    const lights = []
    scene.traverse((obj) => {
      if (obj.isLight) lights.push(obj)
    })
    if (lights.length > 0) {
      console.log('[Room] GLB 내장 라이트:', lights.map(l => `${l.name}(${l.type}) @ ${l.getWorldPosition(new THREE.Vector3()).toArray().map(v => v.toFixed(2))}`))
    }
    return lights
  }, [scene])

  // 생성층 씬 오버라이드
  // Broken_glass는 glass1과 머티리얼을 공유하므로 최초 적용 시 clone해서 분리
  useEffect(() => {
    const TARGETS = {
      Broken_glass: 'brokenGlass',
      Floor:        'floor',
      Roof_Glass:   'roofGlass',
    }
    scene.traverse((obj) => {
      if (!obj.isMesh) return
      const key = TARGETS[obj.name]
      if (!key) return

      // 최초 적용 시 clone으로 머티리얼 분리 (공유 머티리얼 보호)
      if (sceneOverride?.[key] && !obj.userData._matCloned) {
        obj.material = obj.material.clone()
        obj.userData._matCloned = true
      }

      const mat = obj.material
      if (sceneOverride?.[key]) {
        if (!mat.userData._orig) {
          mat.userData._orig = {
            color:             mat.color.clone(),
            emissive:          mat.emissive.clone(),
            emissiveIntensity: mat.emissiveIntensity,
            opacity:           mat.opacity,
          }
        }
        const ov = sceneOverride[key]
        if (ov.color)                           mat.color.set(ov.color)
        if (ov.emissive)                        mat.emissive.set(ov.emissive)
        if (ov.emissiveIntensity !== undefined) mat.emissiveIntensity = ov.emissiveIntensity
        if (ov.opacity !== undefined)           mat.opacity = ov.opacity
      } else if (mat.userData._orig) {
        const o = mat.userData._orig
        mat.color.copy(o.color)
        mat.emissive.copy(o.emissive)
        mat.emissiveIntensity = o.emissiveIntensity
        mat.opacity           = o.opacity
        delete mat.userData._orig
      }
    })
  }, [scene, sceneOverride])

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
          intensity={lightIntensity}
          distance={3.5}
          color={lightColor}
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
