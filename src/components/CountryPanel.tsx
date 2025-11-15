import React from 'react';
import { useGame } from '../context/GameContext';
import type { Factory } from '../types/game';
import './CountryPanel.css';

interface CountryPanelProps {
  countryId: string;
  onClose: () => void;
}

export const CountryPanel: React.FC<CountryPanelProps> = ({ countryId, onClose }) => {
  const { state, buildWarehouse, upgradeWarehouse, buildFactory, upgradeFactory } = useGame();
  
  const country = state.countries[countryId];
  const warehouse = state.warehouses[countryId];
  const factories = Object.values(state.factories).filter(f => f.countryId === countryId);

  if (!country) return null;
  
  // Get country flag emoji
  const getFlagEmoji = (code: string): string => {
    const flags: Record<string, string> = {
      GB: '🇬🇧', FR: '🇫🇷', DE: '🇩🇪', IT: '🇮🇹', ES: '🇪🇸', PL: '🇵🇱', PT: '🇵🇹',
      NL: '🇳🇱', BE: '🇧🇪', CH: '🇨🇭', AT: '🇦🇹', CZ: '🇨🇿', SE: '🇸🇪', NO: '🇳🇴',
      FI: '🇫🇮', DK: '🇩🇰', GR: '🇬🇷', RO: '🇷🇴', HU: '🇭🇺', SK: '🇸🇰', BG: '🇧🇬',
      HR: '🇭🇷', SI: '🇸🇮', LT: '🇱🇹', LV: '🇱🇻', EE: '🇪🇪', IE: '🇮🇪', RS: '🇷🇸',
      BA: '🇧🇦', AL: '🇦🇱', MK: '🇲🇰', ME: '🇲🇪', LU: '🇱🇺', XK: '🇽🇰', BY: '🇧🇾', 
      UA: '🇺🇦', MD: '🇲🇩'
    };
    return flags[code] || '🏳️';
  };

  const getTotalStorage = (): number => {
    if (!warehouse) return 0;
    return Object.values(warehouse.storage).reduce((sum, amt) => sum + amt, 0);
  };

  const getMarketInfo = (goodId: string) => {
    const key = `${countryId}-${goodId}`;
    return state.markets[key];
  };

  const getBestGoods = () => {
    return Object.values(state.goods)
      .map(good => {
        const market = getMarketInfo(good.id);
        const profit = market.baseSellPrice - market.productionCost;
        const profitMargin = (profit / market.productionCost) * 100;
        return { good, market, profit, profitMargin };
      })
      .sort((a, b) => b.profitMargin - a.profitMargin)
      .slice(0, 3);
  };

  const renderWarehouseSection = () => {
    if (!warehouse) {
      return (
        <div className="section">
          <h3>Warehouse</h3>
          <p>No warehouse built yet.</p>
          <button onClick={() => buildWarehouse(countryId)} className="build-btn">
            Build Warehouse ($5,000)
          </button>
        </div>
      );
    }

    return (
      <div className="section">
        <h3>Warehouse (Level {warehouse.level})</h3>
        <div className="warehouse-info">
          <div className="capacity-bar">
            <div 
              className="capacity-fill" 
              style={{ width: `${(getTotalStorage() / warehouse.capacity) * 100}%` }}
            />
          </div>
          <p className="capacity-text">
            {getTotalStorage()} / {warehouse.capacity} units
          </p>
        </div>
        
        <button 
          onClick={() => upgradeWarehouse(countryId)} 
          className="upgrade-btn"
        >
          Upgrade Warehouse (${3000 * warehouse.level})
        </button>

        <div className="storage-list">
          <h4>Storage:</h4>
          {Object.entries(warehouse.storage).map(([goodId, amount]) => {
            const good = state.goods[goodId];
            return amount > 0 ? (
              <div key={goodId} className="storage-item">
                <span>{good.name}:</span>
                <span>{Math.round(amount)} units</span>
              </div>
            ) : null;
          })}
        </div>
      </div>
    );
  };

  const renderFactoriesSection = () => {
    return (
      <div className="section">
        <h3>Factories ({factories.length})</h3>
        
        {factories.map((factory: Factory) => {
          const good = state.goods[factory.goodId];
          return (
            <div key={factory.id} className="factory-item">
              <div className="factory-header">
                <strong>{good.name} Factory</strong>
                <span className="factory-level">Level {factory.level}</span>
              </div>
              <p className="factory-output">Output: {factory.outputPerDay} units/day</p>
              <button 
                onClick={() => upgradeFactory(factory.id)}
                className="upgrade-btn small"
              >
                Upgrade (${5000 * factory.level})
              </button>
            </div>
          );
        })}

        {warehouse && (
          <div className="build-factory-section">
            <h4>Build New Factory:</h4>
            <div className="goods-grid">
              {Object.values(state.goods).map(good => (
                <button
                  key={good.id}
                  onClick={() => buildFactory(countryId, good.id)}
                  className="good-btn"
                  title={`Production Cost: $${getMarketInfo(good.id).productionCost.toFixed(0)}`}
                >
                  {good.name}
                  <br />
                  <small>$10,000</small>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMarketSection = () => {
    const bestGoods = getBestGoods();
    
    return (
      <div className="section">
        <h3>Top Markets</h3>
        {bestGoods.map(({ good, market, profit, profitMargin }) => (
          <div key={good.id} className="market-item">
            <div className="market-header">
              <strong>{good.name}</strong>
              <span className={`profit ${profit > 0 ? 'positive' : 'negative'}`}>
                {profitMargin > 0 ? '+' : ''}{profitMargin.toFixed(1)}%
              </span>
            </div>
            <div className="market-details">
              <div>Cost: ${market.productionCost.toFixed(0)}</div>
              <div>Sell: ${market.currentPrice.toFixed(0)}</div>
              <div>Demand: {market.maxDailyDemand}/day</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="panel country-panel" onClick={e => e.stopPropagation()}>
        <div className="panel-header">
          <h2>
            <span style={{ fontSize: '32px', marginRight: '12px' }}>{getFlagEmoji(countryId)}</span>
            {country.name}
          </h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <div className="panel-content">
          {renderWarehouseSection()}
          {renderFactoriesSection()}
          {renderMarketSection()}
        </div>
      </div>
    </div>
  );
};
