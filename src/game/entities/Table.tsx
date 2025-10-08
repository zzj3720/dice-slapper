import type { ThreeEvent } from '@react-three/fiber'
import { useBox } from '@react-three/cannon'
import type { Vector3 } from '../state/store'
import { slapAt } from '../systems/slapSystem'

type TableProps = {
  size?: { x: number; z: number; thickness?: number; wallHeight?: number }
}

export function Table(props: TableProps) {
  const size = { x: 10, z: 10, thickness: 0.5, wallHeight: 1.0, ...props.size }

  const [tableRef] = useBox(() => ({
    type: 'Static',
    args: [size.x, size.thickness!, size.z],
    position: [0, -size.thickness! / 2, 0],
    material: { friction: 0.6, restitution: 0.2 },
  }))

  // Simple walls to keep dice on table
  useBox(() => ({ type: 'Static', args: [size.x, size.wallHeight!, 0.2], position: [0, size.wallHeight! / 2, size.z / 2] }))
  useBox(() => ({ type: 'Static', args: [size.x, size.wallHeight!, 0.2], position: [0, size.wallHeight! / 2, -size.z / 2] }))
  useBox(() => ({ type: 'Static', args: [0.2, size.wallHeight!, size.z], position: [size.x / 2, size.wallHeight! / 2, 0] }))
  useBox(() => ({ type: 'Static', args: [0.2, size.wallHeight!, size.z], position: [-size.x / 2, size.wallHeight! / 2, 0] }))

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    // Raycast against the top surface: use the event point's x/z
    const p = e.point as unknown as Vector3
    slapAt({ x: p[0], z: p[2] })
  }

  return (
    <group>
      <mesh ref={tableRef} receiveShadow onPointerDown={onPointerDown}>
        <boxGeometry args={[size.x, size.thickness!, size.z]} />
        <meshStandardMaterial color={0x2a2a2a} />
      </mesh>
    </group>
  )
}

