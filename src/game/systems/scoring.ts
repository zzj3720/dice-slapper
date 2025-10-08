import * as THREE from 'three';

export interface Zone {
  id: string;
  name: string;
  multiplier: number;
  color: string;
  bounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
}

// Create a 3x3 grid of zones on the table
export const createZoneGrid = (tableSize: number): Zone[] => {
  const zones: Zone[] = [];
  const gridSize = 3;
  const cellSize = tableSize / gridSize;
  
  const multipliers = [
    [1, 2, 1],
    [2, 3, 2],
    [1, 2, 1],
  ];
  
  const colors = [
    ['#4a5568', '#718096', '#4a5568'],
    ['#718096', '#ecc94b', '#718096'],
    ['#4a5568', '#718096', '#4a5568'],
  ];
  
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const minX = -tableSize / 2 + col * cellSize;
      const maxX = minX + cellSize;
      const minZ = -tableSize / 2 + row * cellSize;
      const maxZ = minZ + cellSize;
      
      zones.push({
        id: `zone-${row}-${col}`,
        name: `Zone ${row * gridSize + col + 1}`,
        multiplier: multipliers[row][col],
        color: colors[row][col],
        bounds: { minX, maxX, minZ, maxZ },
      });
    }
  }
  
  return zones;
};

export const getZoneAtPosition = (
  position: THREE.Vector3,
  zones: Zone[]
): Zone | null => {
  for (const zone of zones) {
    if (
      position.x >= zone.bounds.minX &&
      position.x <= zone.bounds.maxX &&
      position.z >= zone.bounds.minZ &&
      position.z <= zone.bounds.maxZ
    ) {
      return zone;
    }
  }
  return null;
};

export const calculateScore = (
  diceValue: number,
  zoneMultiplier: number
): number => {
  return diceValue * zoneMultiplier;
};
