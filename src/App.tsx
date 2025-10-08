import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/cannon'
import './App.css'
import { Table } from './game/entities/Table'
import { Dice } from './game/entities/Dice'

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas shadows camera={{ position: [6, 6, 6], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight castShadow intensity={0.8} position={[5, 8, 5]} />
        <Physics gravity={[0, -20, 0]} allowSleep={false}>
          <Table />
          <Dice id="d1" position={[0, 2, 0]} />
          <Dice id="d2" position={[1, 3, -0.5]} />
        </Physics>
      </Canvas>
    </div>
  )
}

export default App
