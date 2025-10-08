import { useEffect, useMemo, useRef } from 'react'
import { useBox } from '@react-three/cannon'
import { useFrame } from '@react-three/fiber'
import type { Quaternion, Vector3 } from '../state/store'
import { useGameStore } from '../state/store'

type DiceProps = {
  id: string
  position?: Vector3
  size?: number
}

function quaternionToUpFace(q: Quaternion): number {
  // Map local faces to world up using quaternion rotation
  // Local normals: +Y(1), -Y(6), +X(3), -X(4), +Z(2), -Z(5)
  const [x, y, z, w] = q
  const // rotate vector (0,1,0)
    uy = 1 - 2 * (x * x + z * z)
  const vy = 2 * (x * y + w * z)
  const wy = 2 * (y * z - w * x)
  // We'll compute world Y components for each local axis
  const upY = uy // local +Y -> world Y
  const downY = -upY
  // local +X rotated's Y component
  const xY = 2 * (x * y - w * z)
  const nxY = -xY
  // local +Z rotated's Y component
  const zY = 2 * (y * z + w * x)
  const nzY = -zY
  // Pick the face whose normal has the largest Y upward component
  const candidates: Array<{ face: number; y: number }> = [
    { face: 1, y: upY },
    { face: 6, y: downY },
    { face: 3, y: xY },
    { face: 4, y: nxY },
    { face: 2, y: zY },
    { face: 5, y: nzY },
  ]
  candidates.sort((a, b) => b.y - a.y)
  return candidates[0].face
}

export function Dice({ id, position = [0, 2, 0], size = 1 }: DiceProps) {
  const stoppedRef = useRef(false)
  const stableTimerRef = useRef(0)
  const lastFaceRef = useRef<number | null>(null)
  const [boxRef, api] = useBox(() => ({
    args: [size, size, size],
    mass: 1,
    position,
    material: { friction: 0.5, restitution: 0.25 },
    angularDamping: 0.05,
    linearDamping: 0.01,
  }))

  const velRef = useRef<{ v: Vector3; w: Vector3 }>({ v: [0, 0, 0], w: [0, 0, 0] })
  const quatRef = useRef<Quaternion>([0, 0, 0, 1])
  const posRef = useRef<Vector3>([...position])

  useEffect(() => api.velocity.subscribe((v) => (velRef.current.v = v as Vector3)), [api])
  useEffect(() => api.angularVelocity.subscribe((w) => (velRef.current.w = w as Vector3)), [api])
  useEffect(() => api.quaternion.subscribe((q) => (quatRef.current = q as Quaternion)), [api])
  useEffect(() => api.position.subscribe((p) => (posRef.current = p as Vector3)), [api])

  useFrame((_, delta) => {
    const speed = Math.hypot(...velRef.current.v)
    const omega = Math.hypot(...velRef.current.w)
    const below = speed < 0.05 && omega < 0.05
    if (below) {
      stableTimerRef.current += delta
      if (stableTimerRef.current > 0.6 && !stoppedRef.current) {
        stoppedRef.current = true
        lastFaceRef.current = quaternionToUpFace(quatRef.current)
      }
    } else {
      stableTimerRef.current = 0
      stoppedRef.current = false
      lastFaceRef.current = null
    }
  })

  const register = useMemo(() => ({
    id,
    getPosition: () => posRef.current,
    getQuaternion: () => quatRef.current,
    getVelocities: () => ({ linear: velRef.current.v, angular: velRef.current.w }),
    applyImpulse: (impulse: Vector3, worldPoint: Vector3) => api.applyImpulse(impulse, worldPoint),
    isStopped: () => stoppedRef.current,
    getFaceUp: () => lastFaceRef.current,
  }), [api, id])

  useEffect(() => {
    useGameStore.getState().registerDice(register)
    return () => useGameStore.getState().unregisterDice(id)
  }, [id, register])

  return (
    <mesh ref={boxRef} castShadow>
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial color={0xffffff} />
    </mesh>
  )
}

