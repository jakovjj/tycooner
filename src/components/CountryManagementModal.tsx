import React, { useState } from 'react';
import { FaRoad, FaTrain } from 'react-icons/fa';
import { useGame } from '../context/GameContext';
import type { ProductionPricing, ProductionType } from '../types/game';
import './CountryManagementModal.css';
// Row component for transferring goods (needed to use hooks correctly)
const TransferRow: React.FC<{ countryId: string; neighborId: string; goodId: string; amount: number; maxAmount: number; transferGoods: (fromId: string, toId: string, goodId: string, amt: number) => void; goodName: string; goodEmoji?: string; }> = ({ countryId, neighborId, goodId, amount, maxAmount, transferGoods, goodName, goodEmoji }) => {
  const [inputValue, setInputValue] = React.useState<string>('');
  return (
    <div className="transfer-row">
      <span>{goodEmoji ? `${goodEmoji} ` : ''}{goodName}: {Math.round(amount)}u</span>
      <input
        type="number"
        min={0}
        max={maxAmount}
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        className="transfer-input"
      />
      <button
        className="sell-btn"
        disabled={!inputValue || Number(inputValue) <= 0}
        onClick={() => {
          const amtNum = Number(inputValue);
          if (amtNum > 0) {
            transferGoods(countryId, neighborId, goodId, amtNum);
            setInputValue('');
          }
        }}
      >Send</button>
    </div>
  );
};

interface CountryManagementModalProps {
  countryId: string;
  onClose: () => void;
}

type MenuTab = 'info' | 'storage' | 'production' | 'distribution';

export const CountryManagementModal: React.FC<CountryManagementModalProps> = ({ countryId, onClose }) => {
  const { state, buildWarehouse, upgradeWarehouse, sellGood, buildProductionBuilding, destroyProductionBuilding, unlockCountry, getNextUnlockCost, buildRoad, transferGoods } = useGame();
  const isUnlocked = state.unlockedCountries.includes(countryId);
  const [activeTab, setActiveTab] = useState<MenuTab>(isUnlocked ? 'storage' : 'info');
  // Ledger moved to separate modal; no longer showing all prices here
  
  const country = state.countries[countryId];
  const warehouse = state.warehouses[countryId];

  if (!country) return null;
  
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

  const renderInfoTab = () => {
    const pricing = country.productionPricing;
    if (!pricing) {
      return (
        <div className="tab-content">
          <h3>Country Info</h3>
          <p className="pricing-missing">Pricing data not available.</p>
        </div>
      );
    }
    const goods: { id: string; label: string; icon: string; pricingKey: keyof ProductionPricing }[] = [
      { id: 'grain', label: state.goods.grain?.name || 'Grain', icon: state.goods.grain?.emoji || '🌾', pricingKey: 'grainSellPrice' },
      { id: 'clothing', label: state.goods.clothing?.name || 'Clothing', icon: state.goods.clothing?.emoji || '👕', pricingKey: 'clothingSellPrice' },
      { id: 'meat', label: state.goods.meat?.name || 'Meat', icon: state.goods.meat?.emoji || '🥩', pricingKey: 'meatSellPrice' }
    ];

    return (
      <div className="tab-content">
        <h3>Country Info</h3>
        {!isUnlocked && (
          <>
            <p className="locked-note">This country is locked. Unlock it to build and produce here.</p>
            <button
              onClick={() => unlockCountry(countryId)}
              className="build-btn"
              disabled={state.unlockedCountries.includes(countryId) || state.money < getNextUnlockCost()}
            >
              Unlock Country ($ {getNextUnlockCost().toLocaleString()})
            </button>
          </>
        )}
        <div className="population-pill-row stat-pill-row">
          <span className="stat-pill">
            <span className="stat-pill-label">Population</span>
            <span className="stat-pill-value">{country.population.toLocaleString()}</span>
          </span>
        </div>
  <h4 className="prices-heading">Sell Prices</h4>
        <div className="price-list">
          {goods.map(g => {
            const sellPrice = pricing[g.pricingKey];
            return (
              <div key={g.id} className="price-item">
                <span className="price-good">{g.icon} {g.label}</span>
                <div className="price-values single">
                  <span className="price-value">$ {sellPrice}/unit</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handleSellGood = (goodId: string) => {
    if (!warehouse) return;
    
    const amount = warehouse.storage[goodId] || 0;
    if (amount <= 0) {
      alert('No units to sell!');
      return;
    }

    sellGood(countryId, goodId, amount);
  };

  const renderStorageTab = () => {
    if (!warehouse) {
      return (
        <div className="tab-content">
          <div className="no-warehouse">
            <h3>No Warehouse</h3>
            <p>Build a warehouse to start storing goods in {country.name}.</p>
            <button onClick={() => buildWarehouse(countryId)} className="build-btn">
              Build Warehouse ($5,000)
            </button>
          </div>
        </div>
      );
    }

    const totalStorage = getTotalStorage();

    return (
      <div className="tab-content">
        <div className="warehouse-header">
          <h3>Warehouse (Level {warehouse.level})</h3>
          <div className="capacity-info">
            <div className="capacity-bar">
              <div 
                className="capacity-fill" 
                style={{ width: `${(totalStorage / warehouse.capacity) * 100}%` }}
              />
            </div>
            <p className="capacity-text">
              {Math.round(totalStorage)} / {warehouse.capacity} units
            </p>
          </div>
          <button 
            onClick={() => upgradeWarehouse(countryId)} 
            className="upgrade-btn"
            disabled={state.money < 3000 * warehouse.level}
          >
            Upgrade Warehouse (${(3000 * warehouse.level).toLocaleString()})
          </button>
        </div>

        <div className="storage-section">
          <div className="section-header">
            <h4>Stored Items</h4>
          </div>
          
          {Object.keys(warehouse.storage).filter(goodId => warehouse.storage[goodId] > 0).length === 0 ? (
            <p className="empty-storage">No items in storage</p>
          ) : (
            <div className="storage-list">
              {Object.entries(warehouse.storage)
                .filter(([, amount]) => amount > 0)
                .map(([goodId, amount]) => {
                  const good = state.goods[goodId];
                  const pricing = country.productionPricing;
                  const priceMap: Record<string, number> = pricing ? {
                    grain: pricing.grainSellPrice,
                    clothing: pricing.clothingSellPrice,
                    meat: pricing.meatSellPrice
                  } : {};
                  const unitPrice = priceMap[goodId] || 0;
                  // totalValue derived inline in render; keep variable if extended later
                  // (removed separate const to avoid unused lint warning)

                  return (
                    <div key={goodId} className="storage-item">
                      <div className="item-info">
                        <span className="item-name">
                          <span className="item-emoji" aria-hidden="true">{good?.emoji ?? '📦'}</span>
                          {good.name}
                        </span>
                        <span className="item-amount">{Math.round(amount)} units</span>
                      </div>
                      <div className="item-pricing">
                        <div className="price-details">
                          {/* Display prices with consistent precision to avoid rounding mismatch */}
                          <span className="market-price">Unit Price: ${unitPrice.toFixed(2)}</span>
                          <span className="total-value">Total: ${(unitPrice * amount).toFixed(2)}</span>
                        </div>
                        <button 
                          onClick={() => handleSellGood(goodId)}
                          className="sell-btn"
                        >
                          Sell All
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProductionTab = () => {
    const warehouse = state.warehouses[countryId];
    const production = state.production[countryId];
    const pricing = country.productionPricing;

    if (!warehouse) {
      return (
        <div className="tab-content">
          <div className="no-warehouse">
            <h3>No Warehouse</h3>
            <p>Build a warehouse before starting production in {country.name}.</p>
            <button onClick={() => buildWarehouse(countryId)} className="build-btn">
              Build Warehouse ($5,000)
            </button>
          </div>
        </div>
      );
    }

    if (!pricing) {
      return <div className="tab-content"><p>Pricing data not available</p></div>;
    }

    const BUILDING_LIMIT_DIVISORS: Record<ProductionType, number> = {
      farm: 12_000_000,
      factory: 20_000_000,
      ranch: 15_000_000
    };
    const limits: Record<ProductionType, number> = {
      farm: Math.max(1, Math.floor(country.population / BUILDING_LIMIT_DIVISORS.farm)),
      factory: Math.max(1, Math.floor(country.population / BUILDING_LIMIT_DIVISORS.factory)),
      ranch: Math.max(1, Math.floor(country.population / BUILDING_LIMIT_DIVISORS.ranch))
    };

    const typeMeta: { type: ProductionType; icon: string; name: string; good: string; sellPrice: number; buildCost: number; }[] = [
      { type: 'farm', icon: '🌾', name: 'Farm', good: 'Grain', sellPrice: pricing.grainSellPrice, buildCost: pricing.farmBuildCost },
      { type: 'factory', icon: '👕', name: 'Factory', good: 'Clothing', sellPrice: pricing.clothingSellPrice, buildCost: pricing.factoryBuildCost },
      { type: 'ranch', icon: '🥩', name: 'Ranch', good: 'Meat', sellPrice: pricing.meatSellPrice, buildCost: pricing.ranchBuildCost }
    ];

    const buildings = production?.buildings;

    return (
      <div className="tab-content">
        <h3>Production</h3>
        <div className="production-list">
          {typeMeta.map(meta => {
            const list = buildings ? buildings[meta.type] : [];
            const count = list.length;
            const limit = limits[meta.type];
            const perDay = count; // 1 unit per facility per day
            return (
              <div key={meta.type} className="production-item">
                <div className="production-header">
                  <div className="production-header-left">
                    <span className="production-icon">{meta.icon}</span>
                    <div className="production-name">
                      <h4>{meta.name}</h4>
                      <p>Produces {meta.good}</p>
                    </div>
                  </div>
                    <span className="sell-price-label">
                      Sell Price <strong>${meta.sellPrice.toFixed(2)}</strong>/unit
                    </span>
                </div>
                <div className="production-status multi">
                  <div className="production-stats">
                    <span className="stat">Count: {count} / {limit} (produces {perDay} units/day)</span>
                  </div>
                  <div className="production-actions">
                    <button
                      onClick={() => buildProductionBuilding(countryId, meta.type)}
                      className="build-btn"
                      disabled={state.money < meta.buildCost || count >= limit}
                    >
                      {count >= limit ? 'Limit Reached' : `Build (+$${meta.buildCost.toLocaleString()})`}
                    </button>
                    <button
                      onClick={() => destroyProductionBuilding(countryId, meta.type)}
                      className="sell-btn"
                      disabled={count === 0}
                    >
                      Destroy
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDistributionTab = () => {
    const country = state.countries[countryId];
    if (!country) return null;
    const warehouse = state.warehouses[countryId];
    const neighbors = country.neighbors;
    return (
      <div className="tab-content">
        <h3>Distribution & Roads</h3>
        <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>Build roads to neighbors ($2,000). Transfer goods instantly if both sides have warehouses.</p>
        <div className="distribution-list">
          {neighbors.map(nId => {
            const neighbor = state.countries[nId];
            if (!neighbor) return null;
            const road = Object.values(state.roads).find(r => (r.fromCountryId === countryId && r.toCountryId === nId) || (r.fromCountryId === nId && r.toCountryId === countryId));
            const neighborWarehouse = state.warehouses[nId];
            const canBuild = !road && state.unlockedCountries.includes(countryId) && state.unlockedCountries.includes(nId) && state.money >= 2000 && country.neighbors.includes(nId);
            const goodsInWarehouse = warehouse ? Object.entries(warehouse.storage).filter(([, amt]) => amt > 0) : [];
            const hasRoad = Boolean(road);
            return (
              <div key={nId} className="distribution-item">
                <div className="dist-header">
                  <div className="dist-country">
                    <span className={`dist-icon ${hasRoad ? 'active' : ''}`}>
                      {hasRoad ? <FaTrain aria-hidden="true" /> : <FaRoad aria-hidden="true" />}
                    </span>
                    <div>
                      <span className="dist-label">Neighbor</span>
                      <strong>{neighbor.name}</strong>
                    </div>
                  </div>
                  <span className={`road-badge ${hasRoad ? 'active' : 'pending'}`}>
                    {hasRoad ? 'Rail Link Active' : 'No Road'}
                  </span>
                </div>

                {!hasRoad && (
                  <div className="dist-actions">
                    <p className="dist-helper">Spend $2,000 to unlock instant transfers between warehouses.</p>
                    <button
                      className="build-road-btn"
                      disabled={!canBuild}
                      onClick={() => buildRoad(countryId, nId)}
                    >
                      <FaTrain aria-hidden="true" />
                      Build Rail Link ($2,000)
                    </button>
                  </div>
                )}

                {hasRoad && warehouse && neighborWarehouse && (
                  <div className="transfer-section">
                    <h4 style={{ margin: '6px 0' }}>Transfer Goods</h4>
                    {goodsInWarehouse.length === 0 && (
                      <p className="empty-storage">No goods available to transfer.</p>
                    )}
                    {goodsInWarehouse.length > 0 && goodsInWarehouse.map(([gid, amt]) => (
                      <TransferRow
                        key={gid}
                        countryId={countryId}
                        neighborId={nId}
                        goodId={gid}
                        amount={amt}
                        maxAmount={Math.floor(amt)}
                        transferGoods={transferGoods}
                        goodName={state.goods[gid]?.name || gid}
                        goodEmoji={state.goods[gid]?.emoji}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'info':
        return renderInfoTab();
      case 'storage':
        return renderStorageTab();
      case 'production':
        return renderProductionTab();
      case 'distribution':
        return renderDistributionTab();
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{
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
      <div className="modal country-management-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <span className="flag-emoji">{getFlagEmoji(countryId)}</span>
            {country.name}
          </h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <div className="modal-menu">
          {/* Info tab always available */}
          <button
            className={`menu-btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            ℹ️ Info
          </button>
          {isUnlocked && (
            <>
              <button 
                className={`menu-btn ${activeTab === 'storage' ? 'active' : ''}`}
                onClick={() => setActiveTab('storage')}
              >
                📦 Storage
              </button>
              <button 
                className={`menu-btn ${activeTab === 'production' ? 'active' : ''}`}
                onClick={() => setActiveTab('production')}
              >
                🏭 Production
              </button>
              <button 
                className={`menu-btn ${activeTab === 'distribution' ? 'active' : ''}`}
                onClick={() => setActiveTab('distribution')}
              >
                🚚 Distribution
              </button>
            </>
          )}
        </div>

        <div className="modal-body">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
