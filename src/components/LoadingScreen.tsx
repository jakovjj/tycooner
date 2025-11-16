import React, { useEffect, useState } from 'react';
import './LoadingScreen.css';

interface LoadingScreenProps {
  onLoadComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadComplete }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate loading time (minimum 1 second)
    const timer = setTimeout(() => {
      setIsLoaded(true);
      // Wait for fade out animation before calling onLoadComplete
      setTimeout(onLoadComplete, 500);
    }, 1000);

    return () => clearTimeout(timer);
  }, [onLoadComplete]);

  return (
    <div className={`loading-screen ${isLoaded ? 'fade-out' : ''}`} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      background: '#000'
    }}>
      <div className="loading-content">
        <h1 className="loading-title">TYCOONER</h1>
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading...</p>
      </div>
    </div>
  );
};
