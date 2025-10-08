import * as CANNON from 'cannon-es';
import * as THREE from 'three';

export interface SlapConfig {
  baseImpulse: number;
  randomVariation: number;
  radius: number;
}

export const defaultSlapConfig: SlapConfig = {
  baseImpulse: 8,
  randomVariation: 0.1,
  radius: 3,
};

export const applySlapImpulse = (
  clickPosition: THREE.Vector3,
  diceBodies: Array<{ body: CANNON.Body; position: THREE.Vector3 }>,
  config: SlapConfig = defaultSlapConfig
) => {
  const { baseImpulse, randomVariation, radius } = config;
  
  diceBodies.forEach(({ body, position }) => {
    const distance = position.distanceTo(clickPosition);
    
    if (distance <= radius) {
      // Calculate falloff (closer = stronger)
      const falloff = 1 - distance / radius;
      
      // Random variation
      const randomFactor = 1 + (Math.random() - 0.5) * 2 * randomVariation;
      
      // Calculate impulse strength
      const strength = baseImpulse * falloff * randomFactor;
      
      // Direction: primarily upward, with some horizontal component based on offset
      const dx = position.x - clickPosition.x;
      const dz = position.z - clickPosition.z;
      const horizontalDist = Math.sqrt(dx * dx + dz * dz);
      
      let impulse: CANNON.Vec3;
      if (horizontalDist > 0.01) {
        // Add horizontal component (away from click point)
        const horizontalStrength = strength * 0.3;
        impulse = new CANNON.Vec3(
          (dx / horizontalDist) * horizontalStrength,
          strength,
          (dz / horizontalDist) * horizontalStrength
        );
      } else {
        // Pure vertical impulse
        impulse = new CANNON.Vec3(0, strength, 0);
      }
      
      // Wake up the body
      body.wakeUp();
      
      // Apply impulse at center
      body.applyImpulse(impulse, body.position);
      
      // Add random angular impulse for spin
      const angularImpulse = new CANNON.Vec3(
        (Math.random() - 0.5) * strength * 0.1,
        (Math.random() - 0.5) * strength * 0.1,
        (Math.random() - 0.5) * strength * 0.1
      );
      body.angularVelocity.vadd(angularImpulse, body.angularVelocity);
    }
  });
};
