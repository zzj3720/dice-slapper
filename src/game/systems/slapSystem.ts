import { Howl } from 'howler'
import { useGameStore } from '../state/store'

const slapSound = new Howl({
  src: [''], // placeholder; in dev, Howler allows empty src for silent fallback
  volume: 0.4,
})

export function slapAt(point: { x: number; z: number }) {
  const baseImpulse = 4.5
  const radius = 2.2
  const dice = Object.values(useGameStore.getState().diceById)
  for (const d of dice) {
    const [dx, , dz] = d.getPosition()
    const dist = Math.hypot(dx - point.x, dz - point.z)
    if (dist <= radius) {
      const nx = dist > 0.0001 ? (dx - point.x) / dist : 0
      const nz = dist > 0.0001 ? (dz - point.z) / dist : 0
      const falloff = 1 - dist / radius
      const jitter = 1 + (Math.random() * 0.1 - 0.05)
      const upward = baseImpulse * 0.8 * falloff * jitter
      const lateral = baseImpulse * 0.6 * falloff * jitter
      d.applyImpulse([lateral * nx, upward, lateral * nz], d.getPosition())
    }
  }
  try {
    slapSound.play()
  } catch {}
  useGameStore.getState().requestScoreCheck()
}

