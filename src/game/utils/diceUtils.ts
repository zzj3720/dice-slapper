import * as THREE from 'three';
import * as CANNON from 'cannon-es';

// Map each face normal to a dice value (1-6)
// Standard dice: opposite faces sum to 7
const FACE_NORMALS = [
  { normal: new THREE.Vector3(0, 1, 0), value: 1 },   // Top
  { normal: new THREE.Vector3(0, -1, 0), value: 6 },  // Bottom
  { normal: new THREE.Vector3(1, 0, 0), value: 2 },   // Right
  { normal: new THREE.Vector3(-1, 0, 0), value: 5 },  // Left
  { normal: new THREE.Vector3(0, 0, 1), value: 3 },   // Front
  { normal: new THREE.Vector3(0, 0, -1), value: 4 },  // Back
];

export const getTopFace = (quaternion: THREE.Quaternion): number => {
  // Find which face normal is closest to pointing up (0, 1, 0)
  const worldUp = new THREE.Vector3(0, 1, 0);
  let maxDot = -Infinity;
  let topValue = 1;
  
  FACE_NORMALS.forEach(({ normal, value }) => {
    const rotatedNormal = normal.clone().applyQuaternion(quaternion);
    const dot = rotatedNormal.dot(worldUp);
    
    if (dot > maxDot) {
      maxDot = dot;
      topValue = value;
    }
  });
  
  return topValue;
};

export const isDiceStopped = (
  body: CANNON.Body,
  velocityThreshold: number = 0.05,
  angularVelocityThreshold: number = 0.05
): boolean => {
  const linearSpeed = body.velocity.length();
  const angularSpeed = body.angularVelocity.length();
  
  return (
    linearSpeed < velocityThreshold &&
    angularSpeed < angularVelocityThreshold
  );
};
