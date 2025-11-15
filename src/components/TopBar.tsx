import React from 'react';
import { useGame } from '../context/GameContext';
import './TopBar.css';

export const TopBar: React.FC = () => {
  const { state, togglePause, setTickSpeed } = useGame();

  const currentSpeed = state.isPaused ? 'paused' : (state.tickSpeed === 2000 ? 'normal' : 'double');

  return (
    <div className="top-bar">
      <div className="stats-panel">
        <div className="stat-card">
          <div className="stat-icon">💵</div>
          <div className="stat-content">
            <div className="stat-label">Money</div>
            <div className="stat-value">${Math.round(state.money).toLocaleString()}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⚙️</div>
          <div className="stat-content">
            <div className="stat-label">Admin Points</div>
            <div className="stat-value">{state.adminPoints}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-label">Day</div>
            <div className="stat-value">{state.currentDay}</div>
          </div>
        </div>
      </div>
      
      <div className="controls-panel">
        <div className="speed-controls">
          <button 
            onClick={() => {
              if (!state.isPaused) togglePause();
            }}
            className={`speed-btn ${currentSpeed === 'paused' ? 'active' : ''}`}
          >
            ⏸️ Pause
          </button>
          <button 
            onClick={() => {
              if (state.isPaused) togglePause();
              setTickSpeed(2000);
            }}
            className={`speed-btn ${currentSpeed === 'normal' ? 'active' : ''}`}
          >
            ▶️ Normal
          </button>
          <button 
            onClick={() => {
              if (state.isPaused) togglePause();
              setTickSpeed(1000);
            }}
            className={`speed-btn ${currentSpeed === 'double' ? 'active' : ''}`}
          >
            ⏩ 2x Speed
          </button>
        </div>
      </div>
    </div>
  );
};
