import { useEffect } from 'react';
import { GameScene } from './game/GameScene';
import { HUD } from './ui/HUD';
import { Controls } from './ui/Controls';
import { DebugPanel } from './ui/DebugPanel';
import { initSounds } from './game/audio/soundManager';
import './App.css';

function App() {
  useEffect(() => {
    // Initialize sounds on first user interaction
    const initAudio = () => {
      initSounds();
      document.removeEventListener('click', initAudio);
    };
    document.addEventListener('click', initAudio);
    
    return () => {
      document.removeEventListener('click', initAudio);
    };
  }, []);
  
  return (
    <div className="app">
      <GameScene />
      <HUD />
      <Controls />
      <DebugPanel />
    </div>
  );
}

export default App;
