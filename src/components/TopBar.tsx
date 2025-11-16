import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import './TopBar.css';

export const TopBar: React.FC = () => {
  const { state, getNextUnlockCost, restartGame } = useGame();

  const nextCost = getNextUnlockCost();

  // Convert currentDay -> Month Day, Year (Year 1 starts at day 0)
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthLengths = [31,28,31,30,31,30,31,31,30,31,30,31];
  let remaining = state.currentDay; // day 0 = Jan 1 Year 1
  let year = 1;
  while (remaining >= 365) { remaining -= 365; year++; }
  let monthIndex = 0;
  while (remaining >= monthLengths[monthIndex]) {
    remaining -= monthLengths[monthIndex];
    monthIndex++;
  }
  const dayOfMonth = remaining + 1;
  const dateLabel = `${monthNames[monthIndex]} ${dayOfMonth}, Year ${year}`;

  // Challenge countdown
  // Challenge timing removed here (handled by ChallengeBanner)

  // Challenge info moved to ChallengeBanner component

  const [showMenu, setShowMenu] = useState(false);

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
          <div className="stat-icon">🗺️</div>
          <div className="stat-content">
            <div className="stat-label">Unlocked</div>
            <div className="stat-value">{state.unlockedCountries.length} / {Object.keys(state.countries).length}</div>
            <div className="unlock-info" style={{ fontSize: '0.75rem', opacity: 0.8 }}>
              Next unlock cost: ${nextCost.toLocaleString()}
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-label">Date</div>
            <div className="stat-value" style={{ fontSize: '0.9rem' }}>{dateLabel}</div>
            {/* Challenge info removed from date card */}
          </div>
        </div>
      </div>
      
      <div className="controls-panel" style={{ justifyContent: 'flex-end', position: 'relative' }}>
        <button
          onClick={() => setShowMenu(true)}
          className="hamburger-btn"
          aria-label="Open menu"
        >
          <span className="hamburger-icon" aria-hidden="true">
            <span></span><span></span><span></span>
          </span>
        </button>
      </div>
      {showMenu && (
        <div className="ui-overlay settings-overlay" onClick={() => setShowMenu(false)} role="dialog" aria-modal="true">
          <div className="ui-modal-card full-width settings-panel" onClick={e => e.stopPropagation()}>
            <div className="settings-panel-header">
              <div>
                <div className="settings-chip">Game Controls</div>
                <h2 className="settings-title">Pause Menu</h2>
              </div>
              <button className="overlay-close-btn" onClick={() => setShowMenu(false)} aria-label="Close menu">×</button>
            </div>
            <p className="settings-helper">Restart instantly resets your progress but keeps the current challenge rotation.</p>
            <div className="settings-panel-body">
              <button onClick={restartGame} className="ui-modal-btn primary-menu-btn">Restart Game</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
