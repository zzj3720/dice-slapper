import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { getPhysicsWorld } from '../physics/physicsWorld';
import { getTopFace, isDiceStopped } from '../utils/diceUtils';
import { DICE_SIZE } from '../constants';

// Dice face dots configuration (standard die)
const createDiceTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  
  // Face configurations (dots for each number)
  const faces = [
    // 1 dot (center)
    [[256, 256]],
    // 2 dots (diagonal)
    [[170, 170], [342, 342]],
    // 3 dots (diagonal)
    [[170, 170], [256, 256], [342, 342]],
    // 4 dots (corners)
    [[170, 170], [342, 170], [170, 342], [342, 342]],
    // 5 dots (corners + center)
    [[170, 170], [342, 170], [256, 256], [170, 342], [342, 342]],
    // 6 dots (two columns)
    [[170, 150], [170, 256], [170, 362], [342, 150], [342, 256], [342, 362]],
  ];
  
  const drawFace = (faceNum: number, offsetX: number, offsetY: number) => {
    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(offsetX, offsetY, 512, 512);
    
    // Border
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 4;
    ctx.strokeRect(offsetX + 10, offsetY + 10, 492, 492);
    
    // Dots
    ctx.fillStyle = '#000000';
    faces[faceNum - 1].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(offsetX + x, offsetY + y, 30, 0, Math.PI * 2);
      ctx.fill();
    });
  };
  
  // Create texture atlas (3x2 layout)
  canvas.width = 1536;
  canvas.height = 1024;
  
  drawFace(1, 0, 0);
  drawFace(6, 512, 0);
  drawFace(2, 1024, 0);
  drawFace(5, 0, 512);
  drawFace(3, 512, 512);
  drawFace(4, 1024, 512);
  
  return new THREE.CanvasTexture(canvas);
};

interface DiceProps {
  id: string;
  initialPosition?: [number, number, number];
  onStateChange?: (state: {
    position: THREE.Vector3;
    rotation: THREE.Quaternion;
    isStopped: boolean;
    topFace: number | null;
  }) => void;
}

export const Dice = ({ initialPosition = [0, 2, 0], onStateChange }: DiceProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<CANNON.Body | null>(null);
  const [texture] = useState(() => createDiceTexture());
  const stoppedTimerRef = useRef<number>(0);
  const [isStopped, setIsStopped] = useState(false);
  
  useEffect(() => {
    const physics = getPhysicsWorld();
    
    // Create physics body
    const shape = new CANNON.Box(new CANNON.Vec3(DICE_SIZE / 2, DICE_SIZE / 2, DICE_SIZE / 2));
    const body = new CANNON.Body({
      mass: 1,
      shape,
      position: new CANNON.Vec3(...initialPosition),
      material: new CANNON.Material('dice'),
      linearDamping: 0.3,
      angularDamping: 0.3,
    });
    
    // Random initial rotation
    const randomAxis = new CANNON.Vec3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    ).unit();
    const randomAngle = Math.random() * Math.PI * 2;
    body.quaternion.setFromAxisAngle(randomAxis, randomAngle);
    
    physics.addBody(body);
    bodyRef.current = body;
    
    return () => {
      if (bodyRef.current) {
        physics.removeBody(bodyRef.current);
      }
    };
  }, [initialPosition]);
  
  useFrame((_, delta) => {
    if (!bodyRef.current || !meshRef.current) return;
    
    // Sync mesh with physics body
    const pos = bodyRef.current.position;
    const quat = bodyRef.current.quaternion;
    meshRef.current.position.set(pos.x, pos.y, pos.z);
    meshRef.current.quaternion.set(quat.x, quat.y, quat.z, quat.w);
    
    // Check if dice is stopped
    const stopped = isDiceStopped(bodyRef.current);
    
    if (stopped) {
      stoppedTimerRef.current += delta;
      
      // Consider truly stopped after 0.6 seconds of stillness
      if (stoppedTimerRef.current >= 0.6 && !isStopped) {
        setIsStopped(true);
        const topFace = getTopFace(meshRef.current.quaternion);
        
        onStateChange?.({
          position: meshRef.current.position.clone(),
          rotation: meshRef.current.quaternion.clone(),
          isStopped: true,
          topFace,
        });
      }
    } else {
      stoppedTimerRef.current = 0;
      if (isStopped) {
        setIsStopped(false);
        onStateChange?.({
          position: meshRef.current.position.clone(),
          rotation: meshRef.current.quaternion.clone(),
          isStopped: false,
          topFace: null,
        });
      }
    }
  });
  
  // Create materials array for cube faces
  // Layout: [+X, -X, +Y, -Y, +Z, -Z]
  // Corresponding to: [Right(2), Left(5), Top(1), Bottom(6), Front(3), Back(4)]
  const materials = [
    // Right face - 2
    new THREE.MeshStandardMaterial({
      map: (() => {
        const t = texture.clone();
        t.offset.set(2 / 3, 0.5);
        t.repeat.set(1 / 3, 0.5);
        t.needsUpdate = true;
        return t;
      })(),
    }),
    // Left face - 5
    new THREE.MeshStandardMaterial({
      map: (() => {
        const t = texture.clone();
        t.offset.set(0, 0);
        t.repeat.set(1 / 3, 0.5);
        t.needsUpdate = true;
        return t;
      })(),
    }),
    // Top face - 1
    new THREE.MeshStandardMaterial({
      map: (() => {
        const t = texture.clone();
        t.offset.set(0, 0.5);
        t.repeat.set(1 / 3, 0.5);
        t.needsUpdate = true;
        return t;
      })(),
    }),
    // Bottom face - 6
    new THREE.MeshStandardMaterial({
      map: (() => {
        const t = texture.clone();
        t.offset.set(1 / 3, 0.5);
        t.repeat.set(1 / 3, 0.5);
        t.needsUpdate = true;
        return t;
      })(),
    }),
    // Front face - 3
    new THREE.MeshStandardMaterial({
      map: (() => {
        const t = texture.clone();
        t.offset.set(1 / 3, 0);
        t.repeat.set(1 / 3, 0.5);
        t.needsUpdate = true;
        return t;
      })(),
    }),
    // Back face - 4
    new THREE.MeshStandardMaterial({
      map: (() => {
        const t = texture.clone();
        t.offset.set(2 / 3, 0);
        t.repeat.set(1 / 3, 0.5);
        t.needsUpdate = true;
        return t;
      })(),
    }),
  ];
  
  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <boxGeometry args={[DICE_SIZE, DICE_SIZE, DICE_SIZE]} />
      {materials.map((material, index) => (
        <primitive key={index} object={material} attach={`material-${index}`} />
      ))}
    </mesh>
  );
};
