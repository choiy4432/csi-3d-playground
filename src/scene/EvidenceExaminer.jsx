import { useEffect, useMemo, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

function CenteredModel({ file }) {
  const { scene } = useGLTF(`/models/${file}`)

  const model = useMemo(() => {
    const clone = scene.clone()
    // 바운딩 박스 중심을 origin으로 이동 (pivot 정렬)
    const box    = new THREE.Box3().setFromObject(clone)
    const center = box.getCenter(new THREE.Vector3())
    clone.position.sub(center)
    return clone
  }, [scene])

  return <primitive object={model} />
}

export default function EvidenceExaminer({ evidence, onClose }) {
  const label = evidence.miniGame?.label ?? evidence.file

  useEffect(() => {
    // keyup 사용 — keydown ESC는 브라우저가 포인터락 해제에 먼저 쓰므로 충돌 방지
    const fn = (e) => { if (e.code === 'Escape') onClose() }
    window.addEventListener('keyup', fn)
    return () => window.removeEventListener('keyup', fn)
  }, [onClose])

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 30,
      background: 'rgba(0,0,0,0.88)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* 헤더 */}
      <div style={{
        color: '#ffee00', fontFamily: 'monospace', fontSize: 15, fontWeight: 'bold',
        marginBottom: 12, letterSpacing: 1,
      }}>
        🔍 {label}
      </div>

      {/* 3D 뷰어 */}
      <div style={{
        width: 520, height: 420,
        border: '1px solid #333', borderRadius: 10,
        overflow: 'hidden', background: '#111',
      }}>
        <Canvas camera={{ position: [0, 0.2, 1.6], fov: 42 }}>
          <ambientLight intensity={0.7} />
          <pointLight position={[2, 2, 2]}   intensity={6}  color="#ffffff" />
          <pointLight position={[-2, 1, -1]} intensity={3}  color="#aaddff" />
          <pointLight position={[0, -1, 1]}  intensity={1.5} color="#ffeecc" />
          <CenteredModel file={evidence.file} />
          <OrbitControls
            enablePan={false}
            minDistance={0.4}
            maxDistance={3.5}
            enableDamping
            dampingFactor={0.08}
          />
        </Canvas>
      </div>

      {/* 조작 힌트 */}
      <div style={{
        marginTop: 14, color: '#666', fontFamily: 'monospace', fontSize: 12,
      }}>
        드래그 — 회전 &nbsp;·&nbsp; 휠 — 줌 &nbsp;·&nbsp; ESC — 닫기
      </div>

      {/* 닫기 버튼 */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 20, right: 24,
          background: 'none', border: '1px solid #444',
          color: '#888', fontSize: 18, width: 36, height: 36,
          borderRadius: 6, cursor: 'pointer', lineHeight: 1,
        }}
      >
        ✕
      </button>
    </div>
  )
}
