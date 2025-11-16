import React from 'react';
import './UnlockFundsModal.css';

interface UnlockFundsModalProps {
  countryName: string;
  cost: number;
  currentMoney: number;
  onClose: () => void;
}

export const UnlockFundsModal: React.FC<UnlockFundsModalProps> = ({
  countryName,
  cost,
  currentMoney,
  onClose
}) => {
  const shortfall = Math.max(cost - currentMoney, 0);

  return (
    <div className="ui-overlay" role="dialog" aria-modal="true" aria-labelledby="unlock-funds-title">
      <div className="ui-modal-card unlock-funds-card" role="document">
        <div className="ui-modal-icon unlock-funds-icon" aria-hidden="true">
          💰
        </div>
        <h3 id="unlock-funds-title" className="ui-modal-title">Need More Funds</h3>
        <p className="ui-modal-body">
          {countryName ? (
            <>You need <strong>${cost.toLocaleString()}</strong> to unlock {countryName}.</>
          ) : (
            <>You need <strong>${cost.toLocaleString()}</strong> to unlock the selected country.</>
          )}
        </p>
        <div className="unlock-funds-breakdown" aria-live="polite">
          <div>
            <span>Available</span>
            <strong>${currentMoney.toLocaleString()}</strong>
          </div>
          <div>
            <span>Shortfall</span>
            <strong className="unlock-funds-shortfall">
              {shortfall > 0 ? `$${shortfall.toLocaleString()}` : 'None'}
            </strong>
          </div>
        </div>
        <p className="ui-modal-body subtle">
          Build up more supply or sell existing stock before attempting another expansion.
        </p>
        <div className="ui-modal-actions">
          <button className="ui-modal-btn" onClick={onClose} autoFocus>
            I&apos;ll come back later
          </button>
        </div>
      </div>
    </div>
  );
};
