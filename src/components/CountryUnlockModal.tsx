import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { europeCountriesGeo, coordinatesToPath, calculateMapBounds } from '../data/europeMapGeo';
import { getCountryFlag } from '../data/countryFlags';
import './CountryUnlockModal.css';

interface CountryUnlockModalProps {
  isGameStart: boolean;
  onClose: () => void;
}

export const CountryUnlockModal: React.FC<CountryUnlockModalProps> = ({ isGameStart, onClose }) => {
  const { state, unlockCountry, getNextUnlockCost } = useGame();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  
  // Offer all locked countries (random restriction removed)
  const offeredCountries = Object.keys(state.countries).filter(id => !state.unlockedCountries.includes(id));

  const handleSelectCountry = (countryId: string) => {
    if (!offeredCountries.includes(countryId)) return;
    if (isGameStart) {
      unlockCountry(countryId, true); // starting country free
      onClose();
      return;
    }
    setSelectedCountry(prev => prev === countryId ? null : countryId);
  };

  const handleConfirm = () => {
    if (selectedCountry) {
      unlockCountry(selectedCountry);
    }
    onClose();
  };

  const bounds = calculateMapBounds();
  const viewBoxWidth = bounds.width;
  const viewBoxHeight = bounds.height;

  // If it's game start, show the map interface
  if (isGameStart) {
    const displayCountry = hoveredCountry || selectedCountry;
    const country = displayCountry ? state.countries[displayCountry] : null;

    return (
      <div className="unlock-modal-overlay" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div className="unlock-modal map-selection">
          <div className="unlock-header with-close">
            <div className="unlock-header-left">
              <h2>Choose Your Starting Country</h2>
              <p>Click on any country on the map to begin your empire</p>
            </div>
            <button onClick={onClose} className="unlock-close-btn" aria-label="Close start country selection">×</button>
          </div>
          
          <div className="map-selection-container">
            <svg
              viewBox={`${bounds.minLon} ${-bounds.maxLat} ${viewBoxWidth} ${viewBoxHeight}`}
              className="selection-map"
              preserveAspectRatio="xMidYMid meet"
            >
              <rect
                x={bounds.minLon}
                y={-bounds.maxLat}
                width={viewBoxWidth}
                height={viewBoxHeight}
                fill="#4FC3F7"
              />

              <g className="countries-layer">
                {europeCountriesGeo.map(countryGeo => {
                  const isSelectable = offeredCountries.includes(countryGeo.id);
                  const isHovered = hoveredCountry === countryGeo.id;
                  
                  return (
                    <path
                      key={countryGeo.id}
                      d={coordinatesToPath(countryGeo.coordinates)}
                      fill={isHovered ? '#4CAF50' : (isSelectable ? '#81C784' : '#757575')}
                      stroke="#000000"
                      strokeWidth="0.08"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      style={{
                        opacity: isSelectable ? 1 : 0.3,
                        cursor: isSelectable ? 'pointer' : 'not-allowed',
                        transition: 'fill 0.2s'
                      }}
                      onClick={() => handleSelectCountry(countryGeo.id)}
                      onMouseEnter={() => isSelectable && setHoveredCountry(countryGeo.id)}
                      onMouseLeave={() => setHoveredCountry(null)}
                    />
                  );
                })}
              </g>
            </svg>

            {country && (
              <div className="country-info-panel">
                <div className="country-info-header">
                  <span className="country-flag-large">{getCountryFlag(displayCountry!)}</span>
                  <h3>{country.name}</h3>
                </div>
                <div className="country-info-stats stat-pill-row">
                  <span className="stat-pill">
                    <span className="stat-pill-label">Population</span>
                    <span className="stat-pill-value">{(country.population / 1_000_000).toFixed(1)}M</span>
                  </span>
                  <span className="stat-pill">
                    <span className="stat-pill-label">Wage Level</span>
                    <span className="stat-pill-value">{(country.wageLevel * 100).toFixed(0)}%</span>
                  </span>
                  {Object.keys(country.resourceBonus).length > 0 && (
                    <div className="info-bonuses">
                      <div className="bonus-header">🌟 Resource Bonuses:</div>
                      {Object.entries(country.resourceBonus).map(([goodId, bonus]) => {
                        const good = state.goods[goodId];
                        if (!good) return null;
                        const discount = ((1 - bonus) * 100).toFixed(0);
                        return (
                          <div key={goodId} className="bonus-detail">
                            {good.name}: -{discount}% cost
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Level up - show the card interface

  return (
      <div className="unlock-modal-overlay" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingBottom: '24px',
        zIndex: 1000
      }}>
      <div className="unlock-modal">
        <div className="unlock-header with-close">
          <div className="unlock-header-left">
            <h2>{isGameStart ? 'Choose Your Starting Country' : '🔓 Unlock a New Country'}</h2>
            <p>{isGameStart ? 'Select one country to begin your empire' : `Select a country to expand (Cost: $${getNextUnlockCost().toLocaleString()})`}</p>
          </div>
          <button onClick={onClose} className="unlock-close-btn" aria-label="Close unlock country modal">×</button>
        </div>
        
        <div className="country-cards">
          {offeredCountries.map(countryId => {
            const country = state.countries[countryId];
            if (!country) return null;
            
            const isSelected = selectedCountry === countryId;
            
            return (
              <div
                key={countryId}
                className={`country-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectCountry(countryId)}
              >
                <div className="country-card-flag">{getCountryFlag(countryId)}</div>
                <h3>{country.name}</h3>
                
                <div className="country-stats stat-pill-row">
                  <span className="stat-pill">
                    <span className="stat-pill-label">Population</span>
                    <span className="stat-pill-value">{(country.population / 1_000_000).toFixed(1)}M</span>
                  </span>
                  <span className="stat-pill">
                    <span className="stat-pill-label">Wage Level</span>
                    <span className="stat-pill-value">{(country.wageLevel * 100).toFixed(0)}%</span>
                  </span>
                </div>
                
                {Object.keys(country.resourceBonus).length > 0 && (
                  <div className="resource-bonuses">
                    <div className="bonus-label">🌟 Resource Bonuses:</div>
                    {Object.entries(country.resourceBonus).map(([goodId, bonus]) => {
                      const good = state.goods[goodId];
                      if (!good) return null;
                      const discount = ((1 - bonus) * 100).toFixed(0);
                      return (
                        <div key={goodId} className="bonus-item">
                          {good.name}: -{discount}% cost
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {isSelected && <div className="selected-badge">✓ Selected</div>}
              </div>
            );
          })}
        </div>
        
        <div className="unlock-footer">
          <div className="selection-info">
            {selectedCountry ? `Selected: ${state.countries[selectedCountry].name}` : 'No country selected'}
          </div>
          <button 
            className="confirm-btn" 
            onClick={handleConfirm}
            disabled={!selectedCountry}
            aria-disabled={!selectedCountry}
          >
            {isGameStart ? 'Start Game' : `Unlock ($${getNextUnlockCost().toLocaleString()})`}
          </button>
        </div>
      </div>
    </div>
  );
};
