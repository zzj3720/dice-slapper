import { useState } from 'react';
import './Controls.css';

interface ControlsProps {
  onSlap?: () => void;
}

export const Controls = ({ onSlap }: ControlsProps) => {
  const [isPressed, setIsPressed] = useState(false);
  
  const handleClick = () => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 200);
    onSlap?.();
  };
  
  return (
    <div className="controls">
      <div className="controls-bottom">
        <button
          className={`slap-button ${isPressed ? 'pressed' : ''}`}
          onClick={handleClick}
        >
          <span className="slap-icon">👋</span>
          <span className="slap-text">Slap!</span>
        </button>
        <div className="controls-hint">
          Click on the table or press the button to slap
        </div>
      </div>
    </div>
  );
};
