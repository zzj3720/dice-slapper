import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type Vector3 = [number, number, number]
export type Quaternion = [number, number, number, number]

export type DiceHandle = {
  id: string
  getPosition: () => Vector3
  getQuaternion: () => Quaternion
  getVelocities: () => { linear: Vector3; angular: Vector3 }
  applyImpulse: (impulse: Vector3, worldPoint: Vector3) => void
  isStopped: () => boolean
  getFaceUp: () => number | null
}

type GameState = {
  diceById: Record<string, DiceHandle>
  score: number
  lastGain: number
  debug: boolean
  registerDice: (handle: DiceHandle) => void
  unregisterDice: (id: string) => void
  addScore: (gain: number) => void
  resetScore: () => void
  computeZoneMultiplier: (x: number, z: number) => number
  requestScoreCheck: () => void
}

export const useGameStore = create<GameState>()(
  immer((set, get) => ({
    diceById: {},
    score: 0,
    lastGain: 0,
    debug: false,
    registerDice: (handle) =>
      set((state) => {
        state.diceById[handle.id] = handle
      }),
    unregisterDice: (id) =>
      set((state) => {
        delete state.diceById[id]
      }),
    addScore: (gain) =>
      set((state) => {
        state.score += gain
        state.lastGain = gain
      }),
    resetScore: () =>
      set((state) => {
        state.score = 0
        state.lastGain = 0
      }),
    computeZoneMultiplier: (x: number, z: number) => {
      const r = Math.hypot(x, z)
      if (r < 0.6) return 3
      if (r < 1.6) return 2
      return 1
    },
    requestScoreCheck: () => {
      // Poll until all dice report stopped, then compute gain
      const pollIntervalMs = 200
      const maxWaitMs = 12000
      let waited = 0
      const timer = setInterval(() => {
        waited += pollIntervalMs
        const dice = Object.values(get().diceById)
        const allStopped = dice.length > 0 && dice.every((d) => d.isStopped())
        if (allStopped || waited >= maxWaitMs) {
          clearInterval(timer)
          if (dice.length === 0) return
          let gain = 0
          for (const d of dice) {
            const [x, , z] = d.getPosition()
            const face = d.getFaceUp() ?? 1
            const mult = get().computeZoneMultiplier(x, z)
            gain += mult * face
          }
          get().addScore(gain)
        }
      }, pollIntervalMs)
    },
  }))
)

