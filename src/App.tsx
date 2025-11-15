import { useState } from 'react';
import { GameProvider } from './context/GameContext';
import { EuropeMap } from './components/EuropeMap';
import { TopBar } from './components/TopBar';
import { CountryPanel } from './components/CountryPanel';
import './App.css';

function App() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const handleCountryClick = (countryId: string) => {
    setSelectedCountry(countryId);
  };

  const handleClosePanel = () => {
    setSelectedCountry(null);
  };

  return (
    <GameProvider>
      <div className="app">
        <TopBar />
        
        <div className="game-container">
          <EuropeMap 
            onCountryClick={handleCountryClick}
          />
        </div>

        {selectedCountry && (
          <CountryPanel 
            countryId={selectedCountry}
            onClose={handleClosePanel}
          />
        )}

        <div className="info-hint">
          💡 Scroll to zoom • Drag to pan • Tap countries to build
        </div>
      </div>
    </GameProvider>
  );
}

export default App;
