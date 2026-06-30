import { useMemo, useRef, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'

// 방 2 검사대 위에 채증 완료된 증거물을 정적으로 표시하는 컴포넌트
// EvidenceObject와 달리 물리/인터랙션 없음
// examineId를 전달하면 레이캐스트 가능한 invisible hit box가 추가됨 (오른쪽 테이블용)
export default function EvidenceDisplay({ file, position, examineId = null, inspectId = null, isDimmed = false }) {
  const { scene } = useGLTF(`/models/${file}`)
  const hitRef     = useRef()
  const inspectRef = useRef()

  useEffect(() => {
    if (hitRef.current)     hitRef.current.userData.examineId = examineId
  }, [examineId])

  useEffect(() => {
    if (inspectRef.current) inspectRef.current.userData.inspectId = inspectId
  }, [inspectId])

  const model = useMemo(() => {
    const clone = scene.clone()
    clone.traverse((obj) => {
      if (obj.isMesh) obj.raycast = () => {}
    })
    return clone
  }, [scene])

  // 선택 시 회색 반투명으로, 해제 시 원래 머티리얼로 복원
  useEffect(() => {
    model.traverse((obj) => {
      if (!obj.isMesh) return
      if (isDimmed) {
        if (!obj.userData._origMat) {
          obj.userData._origMat = obj.material
          obj.material = obj.material.clone()
        }
        obj.material.color.set('#888888')
        obj.material.transparent = true
        obj.material.opacity = 0.35
      } else if (obj.userData._origMat) {
        obj.material = obj.userData._origMat
        delete obj.userData._origMat
      }
    })
  }, [isDimmed, model])

  return (
    <group position={position}>
      <primitive object={model} scale={1} />
      {examineId != null && (
        <mesh ref={hitRef} position={[0, 0.2, 0]}>
          <boxGeometry args={[0.5, 0.4, 0.5]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      )}
      {inspectId != null && (
        <mesh ref={inspectRef} position={[0, 0.2, 0]}>
          <boxGeometry args={[0.5, 0.4, 0.5]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      )}
    </group>
  )
}
