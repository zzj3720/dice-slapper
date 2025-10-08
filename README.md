# Dice Slapper 🎲

A 3D physics-based idle/clicker game where players slap a table to make dice bounce and roll, scoring points based on where they land and what number faces up.

## Overview

Dice Slapper is an interactive web game built with modern 3D web technologies. Players click on the table to create "slap" impacts that send dice flying through the air. The dice roll realistically with physics simulation, and when they stop, points are calculated based on:
- The number showing on the top face (1-6)
- The zone on the table where the dice landed (different zones have different multipliers)

## Features (Phase 1 - M1)

✅ **Realistic Physics Simulation**
- Powered by `cannon-es` for authentic dice rolling
- Collision detection between dice and table
- Natural friction and restitution for realistic bounces

✅ **3D Rendering**
- Built with Three.js and React Three Fiber
- Custom dice textures with proper face numbering (1-6)
- Dynamic lighting and shadows
- Smooth 60 FPS target performance

✅ **Interactive Gameplay**
- Click anywhere on the table to slap
- Impulse strength based on distance from click point
- Multiple dice (3) with independent physics
- Visual feedback for all interactions

✅ **Scoring System**
- 3x3 grid zones with different multipliers:
  - Center zone: 3x multiplier
  - Inner ring: 2x multiplier  
  - Outer ring: 1x multiplier
- Automatic scoring when all dice stop
- Real-time score display with floating notifications

✅ **Polished UI**
- Score display in top-right corner
- Slap button with visual feedback
- Debug panel with FPS counter and dice state info
- Toggle-able zone visualization

✅ **Sound Effects**
- Procedurally generated slap sound
- Audio feedback for player actions

## Tech Stack

- **Frontend Framework**: React 19 + TypeScript
- **3D Rendering**: Three.js + @react-three/fiber + @react-three/drei
- **Physics Engine**: cannon-es
- **State Management**: Zustand with Immer
- **Audio**: Howler.js
- **Build Tool**: Vite
- **Styling**: CSS Modules

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Development

The dev server will start at `http://localhost:5173` (or another port if 5173 is taken).

## Project Structure

```
src/
├── game/                      # Game logic and 3D components
│   ├── audio/                # Sound management
│   │   └── soundManager.ts   # Procedural audio generation
│   ├── entities/             # 3D objects
│   │   ├── Dice.tsx         # Dice component with physics
│   │   └── Table.tsx        # Table and walls
│   ├── physics/              # Physics simulation
│   │   └── physicsWorld.ts  # Cannon-es world setup
│   ├── state/                # State management
│   │   └── store.ts         # Zustand store
│   ├── systems/              # Game systems
│   │   ├── scoring.ts       # Zone system and scoring logic
│   │   └── slapSystem.ts    # Impulse application
│   ├── utils/                # Utilities
│   │   └── diceUtils.ts     # Dice face detection
│   ├── constants.ts          # Game constants
│   └── GameScene.tsx         # Main game scene
├── ui/                        # UI components
│   ├── HUD.tsx               # Score display
│   ├── Controls.tsx          # Slap button
│   └── DebugPanel.tsx        # Debug tools
├── App.tsx                    # Main app component
└── main.tsx                   # Entry point
```

## Game Mechanics

### Physics

- Gravity: 9.82 m/s² downward
- Dice-to-table friction: 0.4
- Dice-to-table restitution: 0.3
- Fixed timestep: 1/60s with up to 3 substeps

### Slap System

- Base impulse: 8 units
- Random variation: ±10%
- Effect radius: 3 units
- Falloff: Linear with distance
- Direction: Primarily upward with horizontal component based on offset

### Dice Stop Detection

A dice is considered stopped when:
- Linear velocity < 0.05 units/s
- Angular velocity < 0.05 rad/s
- Conditions maintained for 0.6 seconds

### Face Detection

The top face is determined by finding which face normal is closest to pointing upward (world +Y axis). Standard dice convention where opposite faces sum to 7.

## Controls

- **Click on table**: Apply slap at click position
- **Slap button**: Alternative slap trigger (center of table)
- **Mouse drag**: Rotate camera
- **Mouse wheel**: Zoom in/out
- **Debug panel**: Toggle with wrench icon in top-left

## Performance

- Target: 60 FPS
- Minimum: 30 FPS on low-end devices
- 3 dice with full physics simulation
- Real-time shadow mapping
- Optimized render loop with requestAnimationFrame

## Verification (Phase 1 Acceptance Criteria)

✅ Clicking the table makes dice bounce and roll visibly and controllably  
✅ Dice naturally stop within 2-5 seconds  
✅ UI displays accurate dice values (1-6) and zone-based scores  
✅ Scores accumulate correctly  
✅ Stable 60 FPS performance

## Future Enhancements (Phase 2+)

Planned features for future iterations:
- Hold-to-charge slap strength
- Drag direction for aimed slaps
- Additional zone layouts and special zones
- Dice appearance customization (beveled edges, better textures)
- Passive income/idle mechanics
- Local save system
- More dice types and upgrade system
- Particle effects and better audio

## License

MIT

## Credits

Built following the game design document in `docs/PLAN.md`.
