import { useMemo, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import DebugLight from './DebugLight'

export default function RoomTest({ debug = false, isolated = false, lightColor = '#ffe4a0', lightIntensity = 12, hideMeshes = [] }) {
  const { scene } = useGLTF('/models/Room_Test/Room_Test.glb')

  const glassMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#ffffff'),
    roughness: 0.0,
    metalness: 0.0,
    transmission: 0.88,
    transparent: true,
    opacity: 1.0,
    ior: 1.5,
    thickness: 0.05,
    envMapIntensity: 2.5,
  }), [])

  const glbLights = useMemo(() => {
    const lights = []
    scene.traverse((obj) => {
      if (obj.isLight) lights.push(obj)
      if (!obj.isMesh) return

      // 메시 이름 + 위치 로그 (벽 이름 파악용)
      const wp = new THREE.Vector3()
      obj.getWorldPosition(wp)
      console.log(`[RoomTest] "${obj.name}" | mat:"${Array.isArray(obj.material) ? obj.material[0]?.name : obj.material?.name}" | pos:[${wp.toArray().map(v => v.toFixed(1)).join(', ')}]`)

      obj.castShadow    = true
      obj.receiveShadow = true

      // 재질 이름에 glass/glazing/pane 이 있는 메시만 유리로 교체
      // (mesh 이름 "Window"는 프레임도 포함하므로 사용하지 않음)
      const matName = Array.isArray(obj.material)
        ? obj.material[0]?.name ?? ''
        : obj.material?.name ?? ''
      const isGlass = /glass|glazing|pane|crystal/i.test(matName)

      if (isGlass && !obj.userData._glassPatched) {
        obj.material = glassMaterial
        obj.userData._glassPatched = true
      }
    })
    return lights
  }, [scene, glassMaterial])

  // hideMeshes 배열에 있는 메시 이름 숨기기
  useEffect(() => {
    scene.traverse((obj) => {
      if (!obj.isMesh) return
      obj.visible = !hideMeshes.includes(obj.name)
    })
  }, [scene, hideMeshes])

  useEffect(() => {
    glbLights.forEach((l) => {
      if (isolated) {
        if (l.userData._origIntensity === undefined) l.userData._origIntensity = l.intensity
        l.intensity = 0
      } else {
        if (l.userData._origIntensity !== undefined) l.intensity = l.userData._origIntensity
      }
    })
  }, [isolated, glbLights])

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
