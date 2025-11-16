import React from 'react';
import type { ProductionType } from '../types/game';
import './FacilityFundsModal.css';

interface FacilityFundsModalProps {
  countryName: string;
  facilityType: ProductionType;
  cost: number;
  currentMoney: number;
  onClose: () => void;
}

const FACILITY_COPY: Record<ProductionType, { label: string; icon: string; good: string }> = {
  farm: { label: 'Farm', icon: '🌾', good: 'grain' },
  factory: { label: 'Factory', icon: '👕', good: 'clothing' },
  ranch: { label: 'Ranch', icon: '🥩', good: 'meat' }
};

export const FacilityFundsModal: React.FC<FacilityFundsModalProps> = ({
  countryName,
  facilityType,
  cost,
  currentMoney,
  onClose
}) => {
  const config = FACILITY_COPY[facilityType];
  const shortfall = Math.max(cost - currentMoney, 0);

  return (
    <div className="ui-overlay" role="dialog" aria-modal="true" aria-labelledby="facility-funds-title">
      <div className="ui-modal-card facility-funds-card" role="document">
        <div className="ui-modal-icon facility-funds-icon" aria-hidden="true">
          {config.icon}
        </div>
        <h3 id="facility-funds-title" className="ui-modal-title">Need More Funds</h3>
        <p className="ui-modal-body">
          Building a {config.label} in {countryName || 'this country'} costs <strong>${cost.toLocaleString()}</strong>.
        </p>
        <div className="facility-funds-breakdown" aria-live="polite">
          <div>
            <span>Available Cash</span>
            <strong>${currentMoney.toLocaleString()}</strong>
          </div>
          <div>
            <span>Shortfall</span>
            <strong className="facility-funds-shortfall">
              {shortfall > 0 ? `$${shortfall.toLocaleString()}` : 'None'}
            </strong>
          </div>
        </div>
        <p className="ui-modal-body subtle">
          Sell stored goods or expand your supply chain before adding another {config.label.toLowerCase()}.
        </p>
        <div className="ui-modal-actions">
          <button className="ui-modal-btn" onClick={onClose} autoFocus>
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
