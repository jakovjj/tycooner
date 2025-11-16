import React from 'react';
import './FacilityWarningModal.css';

interface FacilityWarningModalProps {
  onClose: () => void;
}

export const FacilityWarningModal: React.FC<FacilityWarningModalProps> = ({ onClose }) => {
  return (
    <div className="facility-warning-overlay" role="dialog" aria-modal="true">
      <div className="facility-warning-card" role="document">
        <div className="facility-warning-icon" aria-hidden="true">🏗️</div>
        <h3>Build Your First Facility</h3>
        <p>
          Expand wisely! Put down your first warehouse and production facility before opening another country.
          This keeps your supply chain stable and ensures you can afford the expansion challenge.
        </p>
        <div className="facility-warning-actions">
          <button className="facility-warning-btn" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
