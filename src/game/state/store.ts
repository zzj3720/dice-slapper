import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface DiceState {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number, number];
  isStopped: boolean;
  topFace: number | null;
  zoneId: string | null;
}

interface GameState {
  // Score
  totalScore: number;
  lastScore: number;
  
  // Dice
  dice: DiceState[];
  
  // Debug
  showDebug: boolean;
  showZones: boolean;
  
  // Actions
  addScore: (points: number) => void;
  updateDice: (id: string, updates: Partial<DiceState>) => void;
  setDice: (dice: DiceState[]) => void;
  toggleDebug: () => void;
  toggleZones: () => void;
  resetScore: () => void;
}

export const useGameStore = create<GameState>()(
  immer((set) => ({
    totalScore: 0,
    lastScore: 0,
    dice: [],
    showDebug: false,
    showZones: true,
    
    addScore: (points: number) =>
      set((state) => {
        state.lastScore = points;
        state.totalScore += points;
      }),
    
    updateDice: (id: string, updates: Partial<DiceState>) =>
      set((state) => {
        const dice = state.dice.find((d) => d.id === id);
        if (dice) {
          Object.assign(dice, updates);
        }
      }),
    
    setDice: (dice: DiceState[]) =>
      set((state) => {
        state.dice = dice;
      }),
    
    toggleDebug: () =>
      set((state) => {
        state.showDebug = !state.showDebug;
      }),
    
    toggleZones: () =>
      set((state) => {
        state.showZones = !state.showZones;
      }),
    
    resetScore: () =>
      set((state) => {
        state.totalScore = 0;
        state.lastScore = 0;
      }),
  }))
);
