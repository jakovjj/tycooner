import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import './ChallengeBanner.css';
import { formatCountryDisplay } from '../data/countryFlags';

export const ChallengeBanner: React.FC = () => {
  const { state, challengeTargetCountryId, challengeDeadline, restartGame } = useGame();
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!challengeTargetCountryId && !state.gameOver) return null;

  let content: React.ReactNode = null;

  const targetCountry = challengeTargetCountryId ? state.countries[challengeTargetCountryId] : null;
  const targetLabel = challengeTargetCountryId ? formatCountryDisplay(challengeTargetCountryId, targetCountry?.name) : '';

  if (state.gameOver) {
    const allUnlocked = state.unlockedCountries.length === Object.keys(state.countries).length;
    content = (
      <div className="challenge-inner failed">
        <div className="challenge-main">
          {allUnlocked ? 'Victory! All countries unlocked.' : 'Challenge Failed'}
        </div>
        <button className="challenge-action" onClick={restartGame}>Restart Game</button>
      </div>
    );
  } else if (challengeTargetCountryId && challengeDeadline) {
    const msLeft = Math.max(0, challengeDeadline - now);
    const minutes = Math.floor(msLeft / 60000);
    const seconds = Math.floor((msLeft % 60000) / 1000).toString().padStart(2,'0');
    content = (
      <div className="challenge-inner active">
        <div className="challenge-main">
          Unlock <span className="challenge-target">{targetLabel}</span> — Time Left {minutes}:{seconds}
        </div>
      </div>
    );
  }

  return (
    <div className="challenge-banner" role="status" aria-live="polite">
      {content}
    </div>
  );
};
