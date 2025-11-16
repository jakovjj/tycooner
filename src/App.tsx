import { useEffect, useRef, useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { EuropeMap } from './components/EuropeMap';
import { TopBar } from './components/TopBar';
import { PriceLedgerModal } from './components/PriceLedgerModal';
import { ChallengeBanner } from './components/ChallengeBanner';
import { CountryManagementModal } from './components/CountryManagementModal';
import { LoadingScreen } from './components/LoadingScreen';
import { FacilityWarningModal } from './components/FacilityWarningModal';
import './App.css';

const LedgerIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
    <path
      d="M4 4h6v16H4zm10 4h6v12h-6z"
      fill="currentColor"
    />
    <path
      d="M4 4h16v2H4zm0 6h16v2H4zm0 6h16v2H4z"
      fill="currentColor"
      opacity="0.55"
    />
  </svg>
);

function GameContent() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [showLedger, setShowLedger] = useState(false);
  const {
    state,
    showUnlockModal,
    isGameStart,
    facilityWarning,
    dismissFacilityWarning,
    restartGame
  } = useGame();
  const [isAutoRestarting, setIsAutoRestarting] = useState(false);
  const restartTimeoutRef = useRef<number | null>(null);

  const allUnlocked = state.unlockedCountries.length === Object.keys(state.countries).length;
  const challengeFailed = state.gameOver && !allUnlocked;

  useEffect(() => {
    if (!challengeFailed) {
      setIsAutoRestarting(false);
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
    } else if (!restartTimeoutRef.current) {
      setIsAutoRestarting(true);
      restartTimeoutRef.current = window.setTimeout(() => {
        restartTimeoutRef.current = null;
        setIsAutoRestarting(false);
        restartGame();
      }, 1800);
    }

    return () => {
      if (restartTimeoutRef.current && !challengeFailed) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
    };
  }, [challengeFailed, restartGame]);

  const handleCountryClick = (countryId: string) => {
    // If we're in unlock mode, don't open the management modal
    if (showUnlockModal) return;
    setSelectedCountry(countryId);
  };

  const handleClosePanel = () => {
    setSelectedCountry(null);
  };

  const appClasses = ['app'];
  if (showUnlockModal) appClasses.push('unlock-mode-active');

  return (
    <div className={appClasses.join(' ')}>
  <TopBar />
  <ChallengeBanner />
      
      <div className="game-container">
        <EuropeMap 
          onCountryClick={handleCountryClick}
          isUnlockMode={showUnlockModal}
          isGameStart={isGameStart}
        />
      </div>

      {selectedCountry && !showUnlockModal && (
        <CountryManagementModal 
          countryId={selectedCountry}
          onClose={handleClosePanel}
        />
      )}

      {showLedger && (
        <PriceLedgerModal onClose={() => setShowLedger(false)} />
      )}

      {/* Top-right Ledger Button */}
      <button
        onClick={() => setShowLedger(true)}
        className="ledger-toggle-btn"
        aria-label="Open price ledger"
      >
        <LedgerIcon />
        <span>Price Ledger</span>
      </button>

      {showUnlockModal && (
        <div className="unlock-instruction" aria-live="polite">
          <div className="unlock-instruction-card">
            <h2>
              {isGameStart ? 'Choose Your Starting Country' : 'Unlock a New Country'}
            </h2>
            <p>
              {isGameStart 
                ? 'Click on any green country on the map to begin' 
                : 'Click on a highlighted country to unlock it'}
            </p>
          </div>
        </div>
      )}

      <div className="info-hint">
        💡 Scroll to zoom • Drag to pan • Tap countries to build
      </div>

      {facilityWarning && (
        <FacilityWarningModal onClose={dismissFacilityWarning} />
      )}

      {isAutoRestarting && (
        <div className="global-overlay" aria-live="assertive">
          <div className="global-overlay-card">
            <span className="global-overlay-icon" aria-hidden="true">⚠️</span>
            <h3>Challenge Failed</h3>
            <p>Resetting the campaign so you can try again.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <LoadingScreen onLoadComplete={() => setIsLoading(false)} />;
  }

  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}

export default App;
