import React from 'react';
import './FacilityWarningModal.css';

interface FacilityWarningModalProps {
  onClose: () => void;
}

export const FacilityWarningModal: React.FC<FacilityWarningModalProps> = ({ onClose }) => {
  return (
    <div className="ui-overlay facility-warning-overlay" role="dialog" aria-modal="true">
      <div className="ui-modal-card facility-warning-card" role="document">
        <div className="ui-modal-icon facility-warning-icon" aria-hidden="true">🏗️</div>
        <h3 className="ui-modal-title">Build Your First Facility</h3>
        <p className="ui-modal-body">
          Expand wisely! Put down your first warehouse and production facility before opening another country.
          This keeps your supply chain stable and ensures you can afford the expansion challenge.
        </p>
        <div className="ui-modal-actions">
          <button className="ui-modal-btn facility-warning-btn" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
