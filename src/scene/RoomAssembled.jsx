import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import * as THREE from 'three'

// Window_Wall01 X 범위 ±2.755 (Z≈±4.221), Window_Wall02 Z 범위 ±3.736 (X≈±3.253)
// 코너마다 약 0.5×0.5 unit 틈이 생겨 빛이 새므로 코너 기둥으로 막음
const CORNER_X = 3.252
const CORNER_Z = 4.221
const CORNER_MID_Z = (4.221 + 3.736) / 2   // 3.979  — 창문-창문 코너 기둥 중심 Z
const CORNER_MID_X = (3.253 + 2.755) / 2   // 3.004  — 창문-창문 코너 기둥 중심 X
const WALL_H   = 3.004                       // 벽 전체 높이
const WALL_Y   = 1.502                       // 벽 Y 중심
const cornerMat = new THREE.MeshStandardMaterial({ color: '#2d2420', roughness: 0.8 })

const glassMat = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color('#ffffff'),
  roughness: 0.0,
  metalness: 0.0,
  transmission: 0.88,
  transparent: true,
  opacity: 1.0,
  ior: 1.5,
  thickness: 0.05,
  envMapIntensity: 2.5,
})

// rotation.y = π → [x, y, z] → [-x, y, -z]
// 01 쌍 (Z축):
//   Wall01.glb        Z=+4.22  flip=false→뒤,  flip=true→앞(Z=-4.22)
//   Window_Wall01.glb Z=-4.22  flip=false→앞,  flip=true→뒤(Z=+4.22)
// 02 쌍 (X축):
//   Wall02.glb        X=-3.25  flip=false→좌,  flip=true→우(X=+3.25)
//   Window_Wall02.glb X=+3.25  flip=false→우,  flip=true→좌(X=-3.25)
function WallPanel({ url, flip = false, applyGlass = false }) {
  const { scene: src } = useGLTF(url)

  const clone = useMemo(() => {
    const c = src.clone(true)
    c.traverse((obj) => {
      if (!obj.isMesh) return

      const matName = Array.isArray(obj.material)
        ? (obj.material[0]?.name ?? '')
        : (obj.material?.name ?? '')
      const isGlass = /glass|glazing|pane|crystal/i.test(matName)

      // 유리는 shadow map에서 불투명 차단체로 처리되므로 캐스팅 비활성화
      // → directional light가 창문을 통과할 수 있음
      obj.castShadow    = !isGlass
      obj.receiveShadow = true

      if (applyGlass && isGlass) obj.material = glassMat
    })
    if (flip) c.rotation.y = Math.PI
    return c
  }, [src, applyGlass, flip])

  return (
    <RigidBody type="fixed" colliders="trimesh">
      <primitive object={clone} />
    </RigidBody>
  )
}

// 프리로드
;[
  '/models/Room_Test/Floor.glb',
  '/models/Room_Test/Roof.glb',
  '/models/Room_Test/Wall01.glb',
  '/models/Room_Test/Wall02.glb',
  '/models/Room_Test/Window_Wall01.glb',
  '/models/Room_Test/Window_Wall02.glb',
].forEach((url) => useGLTF.preload(url))

// walls prop: { front, back, right, left }  각각 'window' | 'wall'
// 기본값: 현재 Room_Test.glb 구성과 동일 (앞·우 창문, 뒤·좌 솔리드)
export default function RoomAssembled({ walls = {} }) {
  const {
    front = 'window',
    back  = 'wall',
    right = 'window',
    left  = 'wall',
  } = walls

  return (
    <>
      <WallPanel url="/models/Room_Test/Floor.glb" />
      <WallPanel url="/models/Room_Test/Roof.glb" />

      {/* 앞(Z-) */}
      {front === 'wall'
        ? <WallPanel url="/models/Room_Test/Wall01.glb"        flip />
        : <WallPanel url="/models/Room_Test/Window_Wall01.glb" applyGlass />
      }

      {/* 뒤(Z+) */}
      {back === 'wall'
        ? <WallPanel url="/models/Room_Test/Wall01.glb" />
        : <WallPanel url="/models/Room_Test/Window_Wall01.glb" flip applyGlass />
      }

      {/* 우(X+) */}
      {right === 'wall'
        ? <WallPanel url="/models/Room_Test/Wall02.glb"        flip />
        : <WallPanel url="/models/Room_Test/Window_Wall02.glb" applyGlass />
      }

      {/* 좌(X-) */}
      {left === 'wall'
        ? <WallPanel url="/models/Room_Test/Wall02.glb" />
        : <WallPanel url="/models/Room_Test/Window_Wall02.glb" flip applyGlass />
      }

      {/* 코너 기둥 — 벽 패널 이음새 빛 누수 방지 (4 코너 고정) */}
      {[
        [ CORNER_MID_X,  WALL_Y, -CORNER_MID_Z],  // 앞-우
        [-CORNER_MID_X,  WALL_Y, -CORNER_MID_Z],  // 앞-좌
        [ CORNER_MID_X,  WALL_Y,  CORNER_MID_Z],  // 뒤-우
        [-CORNER_MID_X,  WALL_Y,  CORNER_MID_Z],  // 뒤-좌
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} castShadow receiveShadow material={cornerMat}>
          <boxGeometry args={[0.6, WALL_H, 0.6]} />
        </mesh>
      ))}
    </>
  )
}
