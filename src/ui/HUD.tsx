import { useGameStore } from '../game/state/store';
import { useEffect, useState } from 'react';
import './HUD.css';

export const HUD = () => {
  const totalScore = useGameStore((state) => state.totalScore);
  const lastScore = useGameStore((state) => state.lastScore);
  const [showLastScore, setShowLastScore] = useState(false);
  
  useEffect(() => {
    if (lastScore > 0) {
      setShowLastScore(true);
      const timer = setTimeout(() => setShowLastScore(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastScore]);
  
  return (
    <div className="hud">
      <div className="hud-top-right">
        <div className="score-display">
          <div className="score-label">Total Score</div>
          <div className="score-value">{totalScore}</div>
        </div>
        {showLastScore && lastScore > 0 && (
          <div className="last-score-popup">+{lastScore}</div>
        )}
      </div>
    </div>
  );
};
