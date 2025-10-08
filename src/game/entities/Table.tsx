import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { getPhysicsWorld } from '../physics/physicsWorld';
import type { Zone } from '../systems/scoring';
import { createZoneGrid } from '../systems/scoring';
import { useGameStore } from '../state/store';

export const TABLE_SIZE = 10;
const WALL_HEIGHT = 0.5;
const WALL_THICKNESS = 0.2;

interface TableProps {
  onZonesCreated?: (zones: Zone[]) => void;
}

export const Table = ({ onZonesCreated }: TableProps) => {
  const showZones = useGameStore((state) => state.showZones);
  const zones = useMemo(() => createZoneGrid(TABLE_SIZE), []);
  
  useEffect(() => {
    const physics = getPhysicsWorld();
    const bodies: CANNON.Body[] = [];
    
    // Table surface
    const tableShape = new CANNON.Box(
      new CANNON.Vec3(TABLE_SIZE / 2, 0.1, TABLE_SIZE / 2)
    );
    const tableBody = new CANNON.Body({
      mass: 0,
      shape: tableShape,
      position: new CANNON.Vec3(0, -0.1, 0),
      material: new CANNON.Material('table'),
    });
    physics.addBody(tableBody);
    bodies.push(tableBody);
    
    // Walls (4 sides)
    const wallConfigs = [
      // North wall
      {
        size: new CANNON.Vec3(TABLE_SIZE / 2, WALL_HEIGHT / 2, WALL_THICKNESS / 2),
        position: new CANNON.Vec3(0, WALL_HEIGHT / 2, -TABLE_SIZE / 2),
      },
      // South wall
      {
        size: new CANNON.Vec3(TABLE_SIZE / 2, WALL_HEIGHT / 2, WALL_THICKNESS / 2),
        position: new CANNON.Vec3(0, WALL_HEIGHT / 2, TABLE_SIZE / 2),
      },
      // West wall
      {
        size: new CANNON.Vec3(WALL_THICKNESS / 2, WALL_HEIGHT / 2, TABLE_SIZE / 2),
        position: new CANNON.Vec3(-TABLE_SIZE / 2, WALL_HEIGHT / 2, 0),
      },
      // East wall
      {
        size: new CANNON.Vec3(WALL_THICKNESS / 2, WALL_HEIGHT / 2, TABLE_SIZE / 2),
        position: new CANNON.Vec3(TABLE_SIZE / 2, WALL_HEIGHT / 2, 0),
      },
    ];
    
    wallConfigs.forEach((config) => {
      const wallShape = new CANNON.Box(config.size);
      const wallBody = new CANNON.Body({
        mass: 0,
        shape: wallShape,
        position: config.position,
        material: new CANNON.Material('table'),
      });
      physics.addBody(wallBody);
      bodies.push(wallBody);
    });
    
    onZonesCreated?.(zones);
    
    return () => {
      bodies.forEach((body) => physics.removeBody(body));
    };
  }, [zones, onZonesCreated]);
  
  return (
    <group>
      {/* Table surface */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[TABLE_SIZE, 0.2, TABLE_SIZE]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>
      
      {/* Zone grid visualization */}
      {showZones &&
        zones.map((zone) => {
          const centerX = (zone.bounds.minX + zone.bounds.maxX) / 2;
          const centerZ = (zone.bounds.minZ + zone.bounds.maxZ) / 2;
          const sizeX = zone.bounds.maxX - zone.bounds.minX;
          const sizeZ = zone.bounds.maxZ - zone.bounds.minZ;
          
          return (
            <group key={zone.id}>
              {/* Zone base color */}
              <mesh position={[centerX, 0.01, centerZ]}>
                <planeGeometry args={[sizeX - 0.05, sizeZ - 0.05]} />
                <meshBasicMaterial
                  color={zone.color}
                  transparent
                  opacity={0.3}
                  side={THREE.DoubleSide}
                />
              </mesh>
              {/* Zone border */}
              <lineSegments position={[centerX, 0.02, centerZ]}>
                <edgesGeometry
                  args={[new THREE.PlaneGeometry(sizeX - 0.05, sizeZ - 0.05)]}
                />
                <lineBasicMaterial color="#ffffff" opacity={0.5} transparent />
              </lineSegments>
            </group>
          );
        })}
      
      {/* Walls */}
      <mesh position={[0, WALL_HEIGHT / 2, -TABLE_SIZE / 2]} castShadow>
        <boxGeometry args={[TABLE_SIZE, WALL_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial color="#1a202c" />
      </mesh>
      <mesh position={[0, WALL_HEIGHT / 2, TABLE_SIZE / 2]} castShadow>
        <boxGeometry args={[TABLE_SIZE, WALL_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial color="#1a202c" />
      </mesh>
      <mesh position={[-TABLE_SIZE / 2, WALL_HEIGHT / 2, 0]} castShadow>
        <boxGeometry args={[WALL_THICKNESS, WALL_HEIGHT, TABLE_SIZE]} />
        <meshStandardMaterial color="#1a202c" />
      </mesh>
      <mesh position={[TABLE_SIZE / 2, WALL_HEIGHT / 2, 0]} castShadow>
        <boxGeometry args={[WALL_THICKNESS, WALL_HEIGHT, TABLE_SIZE]} />
        <meshStandardMaterial color="#1a202c" />
      </mesh>
    </group>
  );
};
