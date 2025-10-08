import { useState, useEffect } from 'react';
import { useGameStore } from '../game/state/store';
import './DebugPanel.css';

export const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [fps, setFps] = useState(0);
  const showDebug = useGameStore((state) => state.showDebug);
  const showZones = useGameStore((state) => state.showZones);
  const toggleDebug = useGameStore((state) => state.toggleDebug);
  const toggleZones = useGameStore((state) => state.toggleZones);
  const dice = useGameStore((state) => state.dice);
  const resetScore = useGameStore((state) => state.resetScore);
  
  // FPS counter
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const updateFps = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(updateFps);
    };
    
    const rafId = requestAnimationFrame(updateFps);
    return () => cancelAnimationFrame(rafId);
  }, []);
  
  return (
    <div className={`debug-panel ${isOpen ? 'open' : ''}`}>
      <button
        className="debug-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Toggle Debug Panel"
      >
        🔧
      </button>
      
      {isOpen && (
        <div className="debug-content">
          <h3>Debug Panel</h3>
          
          <div className="debug-section">
            <div className="debug-item">
              <span className="debug-label">FPS:</span>
              <span className={`debug-value ${fps < 30 ? 'warning' : ''}`}>
                {fps}
              </span>
            </div>
          </div>
          
          <div className="debug-section">
            <h4>Display Options</h4>
            <label className="debug-checkbox">
              <input
                type="checkbox"
                checked={showDebug}
                onChange={toggleDebug}
              />
              <span>Show Physics Debug</span>
            </label>
            <label className="debug-checkbox">
              <input
                type="checkbox"
                checked={showZones}
                onChange={toggleZones}
              />
              <span>Show Zone Grid</span>
            </label>
          </div>
          
          <div className="debug-section">
            <h4>Dice States</h4>
            {dice.map((d) => (
              <div key={d.id} className="debug-dice">
                <strong>{d.id}:</strong>
                <div className="debug-dice-info">
                  <span>
                    Stopped: {d.isStopped ? '✓' : '✗'}
                  </span>
                  {d.topFace && (
                    <span>
                      Face: {d.topFace}
                    </span>
                  )}
                  {d.zoneId && (
                    <span>
                      Zone: {d.zoneId}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="debug-section">
            <button className="debug-button" onClick={resetScore}>
              Reset Score
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
