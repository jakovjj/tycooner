import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import './PriceLedgerModal.css';

interface PriceLedgerModalProps {
  onClose: () => void;
}

type ResourceKey = 'grain' | 'clothing' | 'meat';

// Simple inline SVG icons (avoids external emoji rendering artifacts)
const GrainIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20" />
      <path d="M8 6c2 0 4 2 4 4" />
      <path d="M8 10c2 0 4 2 4 4" />
      <path d="M16 6c-2 0 -4 2 -4 4" />
      <path d="M16 10c-2 0 -4 2 -4 4" />
    </g>
  </svg>
);

const ClothingIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
    <path d="M9 3l-3 2v4h2v10h8V9h2V5l-3-2-2 2h-2l-2-2z" fill="currentColor" />
  </svg>
);

const MeatIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
    <path d="M14 3c-2.5 0-4.5 1.5-6 3.5C5.5 10 5 13 7 15s5 1.5 8-1c2-1.5 3.5-3.5 3.5-6 0-2.5-2-5-4.5-5z" fill="currentColor" />
    <circle cx="6" cy="18" r="2" fill="currentColor" />
    <line x1="8" y1="16" x2="10" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const PriceLedgerModal: React.FC<PriceLedgerModalProps> = ({ onClose }) => {
  const { state } = useGame();
  const [sortKey, setSortKey] = useState<ResourceKey>('grain');
  const [direction, setDirection] = useState<'asc' | 'desc'>('asc');

  const countries = Object.values(state.countries).filter(c => c.productionPricing);

  const sorted = useMemo(() => {
    const arr = [...countries];
    arr.sort((a, b) => {
      const aPrice = a.productionPricing![`${sortKey}SellPrice` as keyof typeof a.productionPricing] as number;
      const bPrice = b.productionPricing![`${sortKey}SellPrice` as keyof typeof b.productionPricing] as number;
      if (aPrice === bPrice) return a.name.localeCompare(b.name);
      return direction === 'asc' ? aPrice - bPrice : bPrice - aPrice;
    });
    return arr;
  }, [countries, sortKey, direction]);

  const toggleSort = (key: ResourceKey) => {
    if (sortKey === key) {
      setDirection(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setDirection('asc');
    }
  };

  const headerIndicator = (key: ResourceKey) => {
    if (sortKey !== key) return '⇅';
    return direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="modal-overlay ledger-overlay" onClick={onClose}>
      <div className="modal price-ledger-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header price-ledger-header">
          <h2 className="ledger-title">
            <span className="ledger-title-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
                <path d="M3 3h4v18H3V3zm7 6h4v12h-4V9zm7-4h4v16h-4V5z" fill="currentColor" />
              </svg>
            </span>
            Price Ledger
          </h2>
          <button onClick={onClose} className="close-btn" aria-label="Close price ledger">×</button>
        </div>
        <div className="modal-body price-ledger-body">
          <table className="ledger-table" role="table">
            <thead>
              <tr>
                <th scope="col" className="country-col">Country</th>
                <th scope="col" onClick={() => toggleSort('grain')} aria-sort={sortKey==='grain'? (direction==='asc'?'ascending':'descending') : 'none'}>
                  <span className="resource-header"><GrainIcon className="resource-icon" /> Grain <span className="sort-indicator">{headerIndicator('grain')}</span></span>
                </th>
                <th scope="col" onClick={() => toggleSort('clothing')} aria-sort={sortKey==='clothing'? (direction==='asc'?'ascending':'descending') : 'none'}>
                  <span className="resource-header"><ClothingIcon className="resource-icon" /> Clothing <span className="sort-indicator">{headerIndicator('clothing')}</span></span>
                </th>
                <th scope="col" onClick={() => toggleSort('meat')} aria-sort={sortKey==='meat'? (direction==='asc'?'ascending':'descending') : 'none'}>
                  <span className="resource-header"><MeatIcon className="resource-icon" /> Meat <span className="sort-indicator">{headerIndicator('meat')}</span></span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(c => {
                const p = c.productionPricing!;
                return (
                  <tr key={c.id}>
                    <th scope="row" className="country-name">{c.name}</th>
                    <td>$ {p.grainSellPrice}</td>
                    <td>$ {p.clothingSellPrice}</td>
                    <td>$ {p.meatSellPrice}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="ledger-hint below-table">Click a column header to sort by that resource's sell price.</p>
        </div>
      </div>
    </div>
  );
};
