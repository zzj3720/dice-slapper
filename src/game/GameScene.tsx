import { useRef, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { getPhysicsWorld } from './physics/physicsWorld';
import { Table } from './entities/Table';
import { Dice } from './entities/Dice';
import type { Zone } from './systems/scoring';
import { getZoneAtPosition, calculateScore } from './systems/scoring';
import { applySlapImpulse } from './systems/slapSystem';
import { useGameStore } from './state/store';
import { playSound } from './audio/soundManager';

const DICE_COUNT = 3;

interface DiceData {
  id: string;
  position: THREE.Vector3;
  rotation: THREE.Quaternion;
  isStopped: boolean;
  topFace: number | null;
  bodyRef: CANNON.Body | null;
}

const PhysicsUpdater = () => {
  useFrame((_, delta) => {
    const physics = getPhysicsWorld();
    physics.step(Math.min(delta, 0.1));
  });
  return null;
};

const ClickHandler = ({
  onSlap,
}: {
  onSlap: (position: THREE.Vector3) => void;
}) => {
  const { camera, raycaster, scene } = useThree();
  
  const handleClick = useCallback(
    (event: MouseEvent) => {
      // Convert mouse position to normalized device coordinates
      const canvas = event.target as HTMLCanvasElement;
      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Raycast to find table intersection
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      
      // Find table mesh
      const tableMesh = scene.children.find(
        (child) =>
          child.type === 'Group' &&
          child.children.some((c: THREE.Object3D) => (c as THREE.Mesh).geometry?.type === 'BoxGeometry')
      );
      
      if (tableMesh) {
        const intersects = raycaster.intersectObject(tableMesh, true);
        if (intersects.length > 0) {
          const point = intersects[0].point;
          // Only slap on table surface (y near 0)
          if (Math.abs(point.y) < 0.5) {
            onSlap(point);
          }
        }
      }
    },
    [camera, raycaster, scene, onSlap]
  );
  
  useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('click', handleClick);
      return () => canvas.removeEventListener('click', handleClick);
    }
  }, [handleClick]);
  
  return null;
};

export const GameScene = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const diceDataRef = useRef<Map<string, DiceData>>(new Map());
  const addScore = useGameStore((state) => state.addScore);
  const updateDice = useGameStore((state) => state.updateDice);
  const setDice = useGameStore((state) => state.setDice);
  const lastScoreTimeRef = useRef<number>(0);
  
  // Initialize dice data
  useEffect(() => {
    const initialDice = [];
    for (let i = 0; i < DICE_COUNT; i++) {
      const angle = (i / DICE_COUNT) * Math.PI * 2;
      const radius = 1.5;
      initialDice.push({
        id: `dice-${i}`,
        position: [
          Math.cos(angle) * radius,
          2 + i * 0.5,
          Math.sin(angle) * radius,
        ] as [number, number, number],
        rotation: [0, 0, 0, 1] as [number, number, number, number],
        isStopped: false,
        topFace: null,
        zoneId: null,
      });
    }
    setDice(initialDice);
  }, [setDice]);
  
  const checkAndScoreAllDice = useCallback(() => {
    const allStopped = Array.from(diceDataRef.current.values()).every(
      (d) => d.isStopped
    );
    
    if (allStopped && zones.length > 0) {
      const now = Date.now();
      // Only score once every 2 seconds to avoid multiple triggers
      if (now - lastScoreTimeRef.current < 2000) return;
      lastScoreTimeRef.current = now;
      
      let totalRoundScore = 0;
      
      diceDataRef.current.forEach((dice) => {
        if (dice.topFace && dice.isStopped) {
          const zone = getZoneAtPosition(dice.position, zones);
          if (zone) {
            const score = calculateScore(dice.topFace, zone.multiplier);
            totalRoundScore += score;
            
            updateDice(dice.id, { zoneId: zone.id });
          }
        }
      });
      
      if (totalRoundScore > 0) {
        addScore(totalRoundScore);
      }
    }
  }, [zones, addScore, updateDice]);
  
  const handleDiceStateChange = useCallback(
    (
      id: string,
      state: {
        position: THREE.Vector3;
        rotation: THREE.Quaternion;
        isStopped: boolean;
        topFace: number | null;
      }
    ) => {
      const diceData = diceDataRef.current.get(id) || {
        id,
        position: state.position,
        rotation: state.rotation,
        isStopped: state.isStopped,
        topFace: state.topFace,
        bodyRef: null,
      };
      
      diceData.position = state.position;
      diceData.rotation = state.rotation;
      diceData.isStopped = state.isStopped;
      diceData.topFace = state.topFace;
      
      diceDataRef.current.set(id, diceData);
      
      // Update store
      updateDice(id, {
        position: [state.position.x, state.position.y, state.position.z],
        rotation: [
          state.rotation.x,
          state.rotation.y,
          state.rotation.z,
          state.rotation.w,
        ],
        isStopped: state.isStopped,
        topFace: state.topFace,
      });
      
      // Check if all dice are stopped
      if (state.isStopped) {
        checkAndScoreAllDice();
      }
    },
    [updateDice, checkAndScoreAllDice]
  );
  
  const handleSlap = useCallback(
    (position: THREE.Vector3) => {
      // Get physics bodies from dice
      const diceBodies: Array<{
        body: CANNON.Body;
        position: THREE.Vector3;
      }> = [];
      
      diceDataRef.current.forEach((dice) => {
        if (dice.bodyRef) {
          diceBodies.push({
            body: dice.bodyRef,
            position: dice.position,
          });
        }
      });
      
      // Apply slap impulse
      applySlapImpulse(position, diceBodies);
      
      // Play slap sound
      playSound('slap');
      
      // Reset scoring timer
      lastScoreTimeRef.current = 0;
      
      // Mark all dice as not stopped
      diceDataRef.current.forEach((dice) => {
        dice.isStopped = false;
        dice.topFace = null;
      });
    },
    []
  );
  
  // Store body refs
  useEffect(() => {
    const interval = setInterval(() => {
      const physics = getPhysicsWorld();
      physics.world.bodies.forEach((body) => {
        if (body.mass > 0) {
          // Find dice by position
          diceDataRef.current.forEach((dice) => {
            if (!dice.bodyRef) {
              const dist = Math.sqrt(
                Math.pow(body.position.x - dice.position.x, 2) +
                  Math.pow(body.position.y - dice.position.y, 2) +
                  Math.pow(body.position.z - dice.position.z, 2)
              );
              if (dist < 0.5) {
                dice.bodyRef = body;
              }
            }
          });
        }
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <Canvas
      shadows
      camera={{ position: [0, 10, 12], fov: 50 }}
      style={{ background: '#1a1a2e' }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      <Table onZonesCreated={setZones} />
      
      {Array.from({ length: DICE_COUNT }, (_, i) => {
        const angle = (i / DICE_COUNT) * Math.PI * 2;
        const radius = 1.5;
        return (
          <Dice
            key={`dice-${i}`}
            id={`dice-${i}`}
            initialPosition={[
              Math.cos(angle) * radius,
              2 + i * 0.5,
              Math.sin(angle) * radius,
            ]}
            onStateChange={(state) =>
              handleDiceStateChange(`dice-${i}`, state)
            }
          />
        );
      })}
      
      <OrbitControls
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={8}
        maxDistance={20}
      />
      
      <PhysicsUpdater />
      <ClickHandler onSlap={handleSlap} />
    </Canvas>
  );
};
