import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RigidBody, CapsuleCollider } from '@react-three/rapier'
import * as THREE from 'three'

const SPEED         = 5
const CAPSULE_HALF  = 0.5
const CAPSULE_R     = 0.3
const BODY_Y        = CAPSULE_HALF + CAPSULE_R
const EYE_Y         = BODY_Y + 0.8
const INTERACT_DIST = 2.5
const EXAMINE_DIST  = 3.5

const PlayerController = forwardRef(function PlayerController(
  { paused, onLockChange, onHover, onInteract, onDoorClick, onExamine, onInspect },
  ref
) {
  const { camera, gl } = useThree()
  const bodyRef       = useRef()
  const keys          = useRef({})
  const yaw           = useRef(0)
  const pitch         = useRef(0)
  const locked        = useRef(false)
  const prevHovered   = useRef(null)
  const currentHover  = useRef(null)
  const pausedRef     = useRef(paused)

  useEffect(() => { pausedRef.current = paused }, [paused])

  // 외부에서 호출 가능한 reset (디버그 모드 종료 시 리스폰)
  useImperativeHandle(ref, () => ({
    reset() {
      if (!bodyRef.current) return
      bodyRef.current.setTranslation({ x: 0, y: BODY_Y, z: 0 }, true)
      bodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
      yaw.current   = 0
      pitch.current = 0
    },
    teleport(x, y, z, facingYaw = 0) {
      if (!bodyRef.current) return
      bodyRef.current.setTranslation({ x, y, z }, true)
      bodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
      yaw.current   = facingYaw
      pitch.current = 0
    },
    lockPointer() {
      gl.domElement.requestPointerLock()
    },
  }))

  useEffect(() => {
    camera.rotation.order = 'YXZ'

    const onKeyDown = (e) => { keys.current[e.code] = true }
    const onKeyUp   = (e) => { keys.current[e.code] = false }

    const onMouseMove = (e) => {
      if (!locked.current) return
      yaw.current  -= e.movementX * 0.0018
      pitch.current = Math.max(-Math.PI / 2.5,
        Math.min(Math.PI / 2.5, pitch.current - e.movementY * 0.0018))
    }

    const handleLockChange = () => {
      locked.current = document.pointerLockElement === gl.domElement
      onLockChange?.(locked.current)
    }

    const onClick = () => {
      if (!locked.current) {
        if (!pausedRef.current) gl.domElement.requestPointerLock()  // 디버그/미니게임 중 포인터락 차단
      } else if (!pausedRef.current) {
        const h = currentHover.current
        if (h?.type === 'evidence' && h?.inRange) onInteract?.(h.id)
        else if (h?.type === 'door'    && h?.inRange) onDoorClick?.(h.doorTo)
        else if (h?.type === 'examine' && h?.inRange) onExamine?.(h.examineId)
        else if (h?.type === 'inspect' && h?.inRange) onInspect?.(h.inspectId)
      }
    }

    gl.domElement.addEventListener('click', onClick)
    document.addEventListener('pointerlockchange', handleLockChange)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup',   onKeyUp)
    document.addEventListener('mousemove', onMouseMove)

    return () => {
      gl.domElement.removeEventListener('click', onClick)
      document.removeEventListener('pointerlockchange', handleLockChange)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup',   onKeyUp)
      document.removeEventListener('mousemove', onMouseMove)
    }
  }, [camera, gl, onLockChange, onInteract, onDoorClick, onExamine, onInspect])

  useFrame(({ raycaster, scene }) => {
    if (!bodyRef.current) return

    if (paused) {
      bodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
      return
    }

    camera.rotation.y = yaw.current
    camera.rotation.x = pitch.current

    raycaster.setFromCamera({ x: 0, y: 0 }, camera)
    const hits = raycaster.intersectObjects(scene.children, true)
    const hit = hits.find((h) =>
      h.object.userData.evidenceId !== undefined ||
      h.object.userData.doorTo     !== undefined ||
      h.object.userData.examineId  !== undefined ||
      h.object.userData.inspectId  !== undefined
    )

    let newInfo = null
    if (hit) {
      const ud = hit.object.userData
      if (ud.evidenceId !== undefined) {
        newInfo = { type: 'evidence', id: ud.evidenceId,       inRange: hit.distance <= INTERACT_DIST }
      } else if (ud.doorTo !== undefined) {
        newInfo = { type: 'door',     doorTo: ud.doorTo,       inRange: hit.distance <= INTERACT_DIST }
      } else if (ud.examineId !== undefined) {
        newInfo = { type: 'examine',  examineId: ud.examineId, inRange: hit.distance <= EXAMINE_DIST }
      } else {
        newInfo = { type: 'inspect',  inspectId: ud.inspectId, inRange: hit.distance <= EXAMINE_DIST }
      }
    }

    currentHover.current = newInfo

    let newKey = null
    if (newInfo) {
      if      (newInfo.type === 'evidence') newKey = `ev-${newInfo.id}-${newInfo.inRange}`
      else if (newInfo.type === 'door')     newKey = `door-${newInfo.doorTo}-${newInfo.inRange}`
      else if (newInfo.type === 'examine')  newKey = `exam-${newInfo.examineId}-${newInfo.inRange}`
      else                                  newKey = `inspect-${newInfo.inspectId}-${newInfo.inRange}`
    }
    if (newKey !== prevHovered.current) {
      prevHovered.current = newKey
      onHover?.(newInfo)
    }

    const forward = new THREE.Vector3()
    camera.getWorldDirection(forward)
    forward.y = 0
    forward.normalize()
    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0))

    let vx = 0, vz = 0
    if (keys.current['KeyW']) { vx += forward.x * SPEED; vz += forward.z * SPEED }
    if (keys.current['KeyS']) { vx -= forward.x * SPEED; vz -= forward.z * SPEED }
    if (keys.current['KeyA']) { vx -= right.x   * SPEED; vz -= right.z   * SPEED }
    if (keys.current['KeyD']) { vx += right.x   * SPEED; vz += right.z   * SPEED }

    bodyRef.current.setLinvel({ x: vx, y: 0, z: vz }, true)

    const pos = bodyRef.current.translation()
    camera.position.set(pos.x, EYE_Y, pos.z)
  })

  return (
    <RigidBody
      ref={bodyRef}
      type="dynamic"
      position={[0, BODY_Y, 0]}
      enabledRotations={[false, false, false]}
      gravityScale={0}
      linearDamping={20}
      colliders={false}
    >
      <CapsuleCollider args={[CAPSULE_HALF, CAPSULE_R]} />
    </RigidBody>
  )
})

export default PlayerController
