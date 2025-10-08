import * as CANNON from 'cannon-es';

export class PhysicsWorld {
  public world: CANNON.World;
  private fixedTimeStep = 1 / 60;
  private maxSubSteps = 3;
  
  constructor() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82, 0);
    
    // Enable better collision detection
    this.world.broadphase = new CANNON.NaiveBroadphase();
    this.world.allowSleep = true;
    
    // Material setup
    const tableMaterial = new CANNON.Material('table');
    const diceMaterial = new CANNON.Material('dice');
    
    // Contact material - dice to table
    const diceTableContact = new CANNON.ContactMaterial(
      diceMaterial,
      tableMaterial,
      {
        friction: 0.4,
        restitution: 0.3,
      }
    );
    
    // Contact material - dice to dice
    const diceDiceContact = new CANNON.ContactMaterial(
      diceMaterial,
      diceMaterial,
      {
        friction: 0.3,
        restitution: 0.5,
      }
    );
    
    this.world.addContactMaterial(diceTableContact);
    this.world.addContactMaterial(diceDiceContact);
    this.world.defaultContactMaterial.friction = 0.4;
    this.world.defaultContactMaterial.restitution = 0.3;
  }
  
  step(deltaTime: number) {
    this.world.step(this.fixedTimeStep, deltaTime, this.maxSubSteps);
  }
  
  addBody(body: CANNON.Body) {
    this.world.addBody(body);
  }
  
  removeBody(body: CANNON.Body) {
    this.world.removeBody(body);
  }
}

let physicsWorldInstance: PhysicsWorld | null = null;

export const getPhysicsWorld = (): PhysicsWorld => {
  if (!physicsWorldInstance) {
    physicsWorldInstance = new PhysicsWorld();
  }
  return physicsWorldInstance;
};
