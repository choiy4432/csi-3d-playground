import { RigidBody } from '@react-three/rapier'
import EvidenceDisplay from './EvidenceDisplay'

const TABLE_TOP_Y       = 0.755  // 테이블 상단 y
const SLOT_SPACING      = 1.0    // 오른쪽 테이블 증거물 간격 (z축)
const RIGHT_TABLE_LEN   = 5.0    // 오른쪽 테이블 고정 길이

function Box({ position, args, color, emissive = '#000000', emissiveIntensity = 0 }) {
  return (
    <mesh position={position}>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={emissiveIntensity} />
    </mesh>
  )
}

// 방 2 — 포렌식 랩
export function Room2Objects({ collectedEvidences = [], selectedEvidenceId = null }) {
  const count           = collectedEvidences.length
  const rSlotZ          = (i) => count === 1 ? 0 : -(count - 1) * SLOT_SPACING / 2 + i * SLOT_SPACING
  const selectedEvidence = collectedEvidences.find(ev => ev.id === selectedEvidenceId) ?? null

  return (
    <>
      {/* ── 가운데 검사대 (선택된 증거물 1개 표시) ── */}
      <RigidBody type="fixed" colliders="cuboid">
        <Box position={[0, 0.375, 0.5]} args={[2.4, 0.75, 1.0]} color="#4a6060" />
      </RigidBody>
      {/* 검사대 우측 — 현미경 */}
      <Box position={[0.9, 0.82, 0.5]}  args={[0.18, 0.14, 0.14]} color="#2a3a3a" />
      <Box position={[0.9, 0.96, 0.5]}  args={[0.08, 0.28, 0.08]} color="#1a2a2a" />
      <Box position={[0.9, 1.12, 0.45]} args={[0.12, 0.08, 0.18]} color="#1a2a2a" />
      {/* 검사대 좌측 — 샘플 용기 */}
      <Box position={[-0.85, 0.8, 0.5]} args={[0.08, 0.1,  0.08]} color="#667766" />
      <Box position={[-1.0,  0.8, 0.5]} args={[0.08, 0.14, 0.08]} color="#556655" />
      {/* 선택된 증거물 */}
      {selectedEvidence && (
        <EvidenceDisplay
          key={`center-${selectedEvidence.id}`}
          file={selectedEvidence.file}
          position={[0, TABLE_TOP_Y, 0.5]}
        />
      )}

      {/* ── 오른쪽 채증 증거물 모음 테이블 (z축 방향으로 길게) ── */}
      <RigidBody type="fixed" colliders="cuboid">
        <Box position={[2.8, 0.375, 0]} args={[0.9, 0.75, RIGHT_TABLE_LEN]} color="#3a5050" />
      </RigidBody>
      {/* 채증된 증거물 목록 */}
      {collectedEvidences.map((ev, i) => (
        <group key={ev.id} position={[2.8, TABLE_TOP_Y, rSlotZ(i)]}>
          <EvidenceDisplay file={ev.file} position={[0, 0, 0]} examineId={ev.id} isDimmed={selectedEvidenceId === ev.id} />
          {/* 선택 중인 항목 하이라이트 */}
          {selectedEvidenceId === ev.id && (
            <mesh position={[0, -0.01, 0]}>
              <boxGeometry args={[0.5, 0.02, 0.5]} />
              <meshBasicMaterial color="#ffee00" transparent opacity={0.6} />
            </mesh>
          )}
        </group>
      ))}

      {/* 실험 의자 */}
      <RigidBody type="fixed" colliders="cuboid">
        <Box position={[-1.3, 0.5, -0.4]} args={[0.4, 1.0, 0.4]} color="#3a5555" />
      </RigidBody>

      {/* 서쪽 선반 (프레임 + 3단) */}
      <RigidBody type="fixed" colliders="cuboid">
        <Box position={[-4.1, 1.2, 0]} args={[0.5, 2.4, 2.2]} color="#2a3838" />
      </RigidBody>
      <Box position={[-3.87, 0.6, 0]} args={[0.08, 0.06, 2.0]} color="#3a5050" />
      <Box position={[-3.87, 1.2, 0]} args={[0.08, 0.06, 2.0]} color="#3a5050" />
      <Box position={[-3.87, 1.8, 0]} args={[0.08, 0.06, 2.0]} color="#3a5050" />
      <Box position={[-3.87, 0.7, -0.5]} args={[0.12, 0.18, 0.14]} color="#5a7a6a" />
      <Box position={[-3.87, 0.7,  0.2]} args={[0.1,  0.22, 0.1]}  color="#4a6a5a" />
      <Box position={[-3.87, 1.3, -0.7]} args={[0.14, 0.14, 0.14]} color="#3a5a4a" />
      <Box position={[-3.87, 1.3,  0.5]} args={[0.1,  0.2,  0.1]}  color="#4a6060" />

      {/* 북쪽 벽 냉동 보관함 2개 */}
      <RigidBody type="fixed" colliders="cuboid">
        <Box position={[ 1.8, 1.0, 4.1]} args={[1.2, 2.0, 0.6]} color="#3a5055" />
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid">
        <Box position={[-1.8, 1.0, 4.1]} args={[1.2, 2.0, 0.6]} color="#3a5055" />
      </RigidBody>

      {/* 포렌식 랩 특유의 밝고 차가운 조명 */}
      <pointLight position={[0, 2.8, 0]} intensity={10} color="#cceeff" distance={7} decay={2} />
    </>
  )
}

// 방 3 — 심문실
export function Room3Objects() {
  return (
    <>
      {/* 심문 테이블 */}
      <RigidBody type="fixed" colliders="cuboid">
        <Box position={[0, 0.375, 0]} args={[1.8, 0.75, 1.0]} color="#4a2e18" />
      </RigidBody>
      {/* 테이블 위 서류 폴더 (시각) */}
      <Box position={[0.3, 0.78, -0.1]} args={[0.38, 0.03, 0.28]} color="#d4b896" />
      <Box position={[0.3, 0.81, -0.1]} args={[0.36, 0.01, 0.26]} color="#ccaa88" />

      {/* 형사 의자 (테이블 남쪽) */}
      <RigidBody type="fixed" colliders="cuboid">
        <Box position={[0, 0.225, -1.2]} args={[0.55, 0.45, 0.52]} color="#5a3828" />
      </RigidBody>
      {/* 형사 의자 등받이 (시각용) */}
      <Box position={[0, 0.72, -1.44]} args={[0.52, 0.56, 0.07]} color="#4a2e1e" />

      {/* 용의자 의자 (테이블 북쪽) */}
      <RigidBody type="fixed" colliders="cuboid">
        <Box position={[0, 0.225, 1.2]} args={[0.55, 0.45, 0.52]} color="#3a2010" />
      </RigidBody>
      {/* 용의자 의자 등받이 (시각용) */}
      <Box position={[0, 0.72, 1.44]} args={[0.52, 0.56, 0.07]} color="#2e1a0c" />

      {/* 단방향 거울 — 서쪽 벽 전체 */}
      <Box
        position={[-4.44, 1.5, 0]}
        args={[0.05, 2.0, 3.2]}
        color="#1a2233"
        emissive="#223355"
        emissiveIntensity={0.15}
      />

      {/* 파일 캐비닛 */}
      <RigidBody type="fixed" colliders="cuboid">
        <Box position={[3.8, 0.7, -3.6]} args={[0.5, 1.4, 0.45]} color="#4a4a4a" />
      </RigidBody>

      {/* 보안 카메라 — 북동쪽 구석 천장 근처 (시각용) */}
      <Box position={[3.6, 2.65, -3.6]} args={[0.18, 0.1, 0.26]} color="#222222" />
      <Box position={[3.6, 2.6,  -3.48]} args={[0.12, 0.08, 0.05]} color="#111111" />

      {/* 심문실 특유의 강하고 좁은 단일 조명 */}
      <pointLight position={[0, 2.9, 0.2]} intensity={14} color="#fff5e0" distance={5} decay={2} />
    </>
  )
}
