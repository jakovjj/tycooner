import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import './RoadPanel.css';

interface RoadPanelProps {
  fromCountryId: string;
  toCountryId: string;
  onClose: () => void;
}

export const RoadPanel: React.FC<RoadPanelProps> = ({ fromCountryId, toCountryId, onClose }) => {
  const { state, createTruckLine, updateTruckLine } = useGame();
  const [selectedGood, setSelectedGood] = useState<string>('');
  const [truckCount, setTruckCount] = useState<number>(1);
  
  const fromCountry = state.countries[fromCountryId];
  const toCountry = state.countries[toCountryId];
  
  // Find the road
  const road = Object.values(state.roads).find(
    r => 
      (r.fromCountryId === fromCountryId && r.toCountryId === toCountryId) ||
      (r.fromCountryId === toCountryId && r.toCountryId === fromCountryId)
  );

  if (!road || !fromCountry || !toCountry) return null;

  // Get truck lines for this road
  const truckLines = Object.values(state.truckLines).filter(tl => tl.roadId === road.id);

  const getMarket = (countryId: string, goodId: string) => {
    const key = `${countryId}-${goodId}`;
    return state.markets[key];
  };

  const calculateProfit = (goodId: string): number => {
    const fromMarket = getMarket(fromCountryId, goodId);
    const toMarket = getMarket(toCountryId, goodId);
    
    const productionCost = fromMarket.productionCost;
    const sellPrice = toMarket.currentPrice;
    const logisticsCost = (road.distance / 100) * 0.1;
    
    return sellPrice - productionCost - logisticsCost;
  };

  const handleCreateTruckLine = () => {
    if (!selectedGood) {
      alert('Please select a good to transport!');
      return;
    }
    
    createTruckLine(road.id, selectedGood, truckCount);
    setSelectedGood('');
    setTruckCount(1);
  };

  const renderProfitPreview = () => {
    if (!selectedGood) return null;
    
    const profit = calculateProfit(selectedGood);
    const fromMarket = getMarket(fromCountryId, selectedGood);
    const toMarket = getMarket(toCountryId, selectedGood);
    
    return (
      <div className="profit-preview">
        <h4>Profit Estimate ({state.goods[selectedGood].name})</h4>
        <div className="profit-details">
          <div className="profit-row">
            <span>Production Cost ({fromCountry.name}):</span>
            <span className="cost">-${fromMarket.productionCost.toFixed(0)}</span>
          </div>
          <div className="profit-row">
            <span>Logistics Cost:</span>
            <span className="cost">-${((road.distance / 100) * 0.1).toFixed(2)}</span>
          </div>
          <div className="profit-row">
            <span>Sell Price ({toCountry.name}):</span>
            <span className="revenue">+${toMarket.currentPrice.toFixed(0)}</span>
          </div>
          <div className="profit-row total">
            <span>Profit per Unit:</span>
            <span className={profit > 0 ? 'positive' : 'negative'}>
              ${profit.toFixed(2)}
            </span>
          </div>
          <div className="profit-row">
            <span>Daily Capacity ({truckCount} trucks):</span>
            <span>{truckCount * 100} units/day</span>
          </div>
          <div className="profit-row total">
            <span>Estimated Daily Profit:</span>
            <span className={profit > 0 ? 'positive' : 'negative'}>
              ${(profit * truckCount * 100).toFixed(0)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="panel road-panel" onClick={e => e.stopPropagation()}>
        <div className="panel-header">
          <h2>{fromCountry.name} ↔ {toCountry.name}</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <div className="panel-content">
          <div className="section">
            <h3>Road Info</h3>
            <div className="road-info">
              <div className="info-item">
                <span>Distance:</span>
                <span>{road.distance.toFixed(0)} km</span>
              </div>
              <div className="info-item">
                <span>Level:</span>
                <span>{road.level}</span>
              </div>
            </div>
          </div>

          {truckLines.length > 0 && (
            <div className="section">
              <h3>Active Truck Lines ({truckLines.length})</h3>
              {truckLines.map(line => {
                const good = state.goods[line.goodId];
                const profit = calculateProfit(line.goodId);
                const dailyProfit = profit * line.trucksAssigned * line.capacityPerTruck;
                
                return (
                  <div key={line.id} className="truck-line-item">
                    <div className="truck-line-header">
                      <strong>{good.name}</strong>
                      <span className={`profit-badge ${dailyProfit > 0 ? 'positive' : 'negative'}`}>
                        ${dailyProfit.toFixed(0)}/day
                      </span>
                    </div>
                    <div className="truck-line-details">
                      <div>
                        <label>Trucks: </label>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={line.trucksAssigned}
                          onChange={(e) => updateTruckLine(line.id, Number(e.target.value))}
                          className="truck-input"
                        />
                      </div>
                      <div>Capacity: {line.trucksAssigned * line.capacityPerTruck}/day</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="section">
            <h3>Create New Truck Line</h3>
            
            <div className="form-group">
              <label>Select Good:</label>
              <select 
                value={selectedGood} 
                onChange={(e) => setSelectedGood(e.target.value)}
                className="goods-select"
              >
                <option value="">-- Choose a good --</option>
                {Object.values(state.goods)
                  .sort((a, b) => calculateProfit(b.id) - calculateProfit(a.id))
                  .map(good => {
                    const profit = calculateProfit(good.id);
                    return (
                      <option key={good.id} value={good.id}>
                        {good.name} (${profit.toFixed(2)}/unit profit)
                      </option>
                    );
                  })}
              </select>
            </div>

            <div className="form-group">
              <label>Number of Trucks:</label>
              <input
                type="range"
                min="1"
                max="10"
                value={truckCount}
                onChange={(e) => setTruckCount(Number(e.target.value))}
                className="truck-slider"
              />
              <span className="truck-count">{truckCount} trucks</span>
            </div>

            {renderProfitPreview()}

            <button 
              onClick={handleCreateTruckLine}
              className="build-btn"
              disabled={!selectedGood}
            >
              Create Truck Line
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
