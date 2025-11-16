import React, { useState, useRef, useEffect, useMemo } from 'react';
import { europeCountriesGeo, coordinatesToPath, calculateMapBounds } from '../data/europeMapGeo';
import { useGame } from '../context/GameContext';
import './EuropeMap.css';

interface EuropeMapProps {
  onCountryClick: (countryId: string) => void;
  isUnlockMode?: boolean;
  isGameStart?: boolean;
}

interface Transform {
  x: number;
  y: number;
  scale: number;
}

export const EuropeMap: React.FC<EuropeMapProps> = ({ onCountryClick, isUnlockMode = false, isGameStart = false }) => {
  const { state, unlockCountry, setShowUnlockModal } = useGame();
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 0.55 });
  const [targetTransform, setTargetTransform] = useState<Transform>({ x: 0, y: -300, scale: 0.55 });
  
  // Memoize the offered countries to prevent re-randomization
  const offeredCountries = useMemo(() => {
    if (!isUnlockMode) return [];
    const allCountryIds = Object.keys(state.countries);
    const lockedCountries = allCountryIds.filter(id => !state.unlockedCountries.includes(id));
    return isGameStart ? allCountryIds : lockedCountries; // all locked countries available for selection
  }, [isUnlockMode, isGameStart, state.countries, state.unlockedCountries]);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const bounds = calculateMapBounds();
  const viewBoxWidth = bounds.width;
  const viewBoxHeight = bounds.height;

  // Precompute SVG path strings once to avoid heavy recomputation each render
  const countryPathMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of europeCountriesGeo) {
      map[c.id] = coordinatesToPath(c.coordinates);
    }
    return map;
  }, []);

  // Smooth lerp animation (paused in unlock mode, ends when close to target)
  const animationRef = useRef<number | null>(null);
  // Apply animation only outside unlock mode
  useEffect(() => {
    if (isUnlockMode) return; // static transform in unlock mode
    const animate = () => {
      let finished = false;
      setTransform(prev => {
        const lerpFactor = 0.2;
        const newX = prev.x + (targetTransform.x - prev.x) * lerpFactor;
        const newY = prev.y + (targetTransform.y - prev.y) * lerpFactor;
        const newScale = prev.scale + (targetTransform.scale - prev.scale) * lerpFactor;
        const dx = Math.abs(targetTransform.x - newX);
        const dy = Math.abs(targetTransform.y - newY);
        const ds = Math.abs(targetTransform.scale - newScale);
        const epsilonPos = 0.1;
        const epsilonScale = 0.001;
        finished = dx < epsilonPos && dy < epsilonPos && ds < epsilonScale;
        return finished ? { ...targetTransform } : { x: newX, y: newY, scale: newScale };
      });
      if (!finished) {
        animationRef.current = requestAnimationFrame(animate);
      } else if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [targetTransform, isUnlockMode]);

  // Display transform: in unlock mode use targetTransform directly (no state update)
  const displayedTransform = isUnlockMode ? targetTransform : transform;

  // Keyboard controls for panning
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const panSpeed = 50;
      const key = event.key.toLowerCase();
      
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        event.preventDefault();
        
        setTargetTransform(prev => {
          let newX = prev.x;
          let newY = prev.y;
          
          if (key === 'w' || key === 'arrowup') newY += panSpeed;
          if (key === 's' || key === 'arrowdown') newY -= panSpeed;
          if (key === 'a' || key === 'arrowleft') newX += panSpeed;
          if (key === 'd' || key === 'arrowright') newX -= panSpeed;
          
          return { ...prev, x: newX, y: newY };
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle zoom
  const handleWheel = (event: React.WheelEvent) => {
    event.preventDefault();
    const delta = -event.deltaY * 0.001;
    const newScale = Math.max(0.5, Math.min(5, targetTransform.scale * (1 + delta)));
    
    setTargetTransform(prev => ({ ...prev, scale: newScale }));
  };

  // Handle pan start
  const handlePanStart = (clientX: number, clientY: number) => {
    setIsPanning(true);
    setPanStart({ x: clientX - transform.x, y: clientY - transform.y });
  };

  // Handle pan move
  const handlePanMove = (clientX: number, clientY: number) => {
    if (isPanning && panStart) {
      const newX = clientX - panStart.x;
      const newY = clientY - panStart.y;
      setTransform({ ...transform, x: newX, y: newY });
      setTargetTransform(prev => ({ ...prev, x: newX, y: newY }));
    }
  };

  // Handle pan end
  const handlePanEnd = () => {
    setIsPanning(false);
    setPanStart(null);
  };

  // Get country color based on state
  const isCountryLocked = (countryId: string): boolean => {
    return !state.unlockedCountries.includes(countryId);
  };

  const handleCountryClickInternal = (countryId: string) => {
    if (isUnlockMode) {
      // If already unlocked, ignore
      if (!isCountryLocked(countryId)) return;
      // Game start: any country selectable
      if (isGameStart) {
        unlockCountry(countryId, true); // starting country free
        setShowUnlockModal(false);
        return;
      }
      // Unlock selection: any locked country can be chosen
      if (offeredCountries.includes(countryId)) {
        unlockCountry(countryId);
        setShowUnlockModal(false);
      }
      return;
    }
    // Normal mode: always allow viewing info (even if locked)
    onCountryClick(countryId);
  };

  const offeredCountriesSet = useMemo(() => new Set(offeredCountries), [offeredCountries]);

  const getCountryFillColor = (countryId: string): string => {
    if (isUnlockMode) {
      // At game start, all countries are available
      if (isGameStart) {
        return '#81C784';
      }
      
      // On level up, check if this country is in the offered list
      if (offeredCountriesSet.has(countryId)) {
        return '#81C784';
      }
      
      return '#424242'; // Darker gray for unavailable
    }
    
    const isLocked = isCountryLocked(countryId);
    return isLocked ? '#757575' : 'url(#grassTexture)';
  };

  return (
    <div 
      ref={containerRef}
      className="map-container"
      onWheel={handleWheel}
      onPointerDown={(e) => {
        const target = e.target as HTMLElement;
        // Allow panning on container, svg, rect (ocean), or any non-interactive element
        if (target === e.currentTarget || 
            target.tagName === 'svg' || 
            target.tagName === 'rect' ||
            target.classList.contains('europe-map')) {
          handlePanStart(e.clientX, e.clientY);
        }
      }}
      onPointerMove={(e) => handlePanMove(e.clientX, e.clientY)}
      onPointerUp={handlePanEnd}
      onPointerLeave={handlePanEnd}
    >
      <div 
        className="map-viewport"
        style={{
          transform: `translate(${displayedTransform.x}px, ${displayedTransform.y}px) scale(${displayedTransform.scale})`,
          transformOrigin: 'center center'
        }}
      >
        <svg
          ref={svgRef}
          viewBox={`${bounds.minLon} ${-bounds.maxLat} ${viewBoxWidth} ${viewBoxHeight}`}
          className="europe-map"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Ocean background */}
          <defs>
            {/* Grass/terrain texture for land */}
            <pattern id="grassTexture" x="0" y="0" width="15" height="15" patternUnits="userSpaceOnUse">
              <rect width="15" height="15" fill="#66BB6A"/>
              <circle cx="2" cy="3" r="0.5" fill="rgba(76,175,80,0.2)"/>
              <circle cx="8" cy="5" r="0.4" fill="rgba(76,175,80,0.15)"/>
              <circle cx="12" cy="2" r="0.6" fill="rgba(76,175,80,0.18)"/>
            </pattern>
          </defs>
          
          <rect
            x={bounds.minLon}
            y={-bounds.maxLat}
            width={viewBoxWidth}
            height={viewBoxHeight}
            fill="#4FC3F7"
            className="ocean-background"
            style={{ pointerEvents: 'all' }}
          />

          {/* Roads Layer */}
          <g className="roads-layer">
            {Object.values(state.roads).map(road => {
              const from = europeCountriesGeo.find(c => c.id === road.fromCountryId);
              const to = europeCountriesGeo.find(c => c.id === road.toCountryId);
              if (!from || !to) return null;
              const [fx, fy] = from.centroid;
              const [tx, ty] = to.centroid;
              return (
                <line
                  key={road.id}
                  className="road"
                  x1={fx}
                  y1={-fy}
                  x2={tx}
                  y2={-ty}
                />
              );
            })}
          </g>
          {/* Countries */}
          <g className="countries-layer">
            {europeCountriesGeo.map(country => {
              const countryData = state.countries[country.id];
              if (!countryData) return null;
              
              const isLocked = isCountryLocked(country.id);
              // In normal mode all countries are clickable (info view). In unlock mode only offered or already unlocked.
              const isClickable = !isUnlockMode || !isLocked || (isUnlockMode && (isGameStart || offeredCountriesSet.has(country.id)));
              
              return (
                <g key={country.id}>
                  <path
                    d={countryPathMap[country.id]}
                    fill={getCountryFillColor(country.id)}
                    stroke="#000000"
                    strokeOpacity="1"
                    strokeWidth="0.08"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    className="country"
                    data-country-id={country.id}
                    onClick={() => handleCountryClickInternal(country.id)}
                    style={{
                      opacity: isUnlockMode ? 1 : (isLocked ? 0.6 : 0.92),
                      cursor: isClickable ? 'pointer' : 'not-allowed',
                      transition: 'fill 0.2s'
                    }}
                  />
                </g>
              );
            })}
          </g>

          {/* Indicators only - no labels */}
          <g className="indicators-layer">
            {europeCountriesGeo.map(country => {
              const countryData = state.countries[country.id];
              if (!countryData) return null;
              
              const [lon, lat] = country.centroid;
              const warehouses = state.warehouses[country.id];
              const factoryCount = Object.values(state.factories).filter(f => f.countryId === country.id).length;
              
              return (
                <g key={`indicators-${country.id}`}>
                  {warehouses && (
                    <circle
                      cx={lon - 0.5}
                      cy={-lat}
                      r="0.35"
                      fill="#FF9800"
                      stroke="#FFF"
                      strokeWidth="0.08"
                      pointerEvents="none"
                    />
                  )}
                  
                  {factoryCount > 0 && (
                    <>
                      <circle
                        cx={lon + 0.5}
                        cy={-lat}
                        r="0.35"
                        fill="#2196F3"
                        stroke="#FFF"
                        strokeWidth="0.08"
                        pointerEvents="none"
                      />
                      <text
                        x={lon + 0.5}
                        y={-lat + 0.15}
                        textAnchor="middle"
                        className="factory-count"
                        pointerEvents="none"
                        fontSize="0.5"
                        fill="#FFF"
                        fontWeight="bold"
                      >
                        {factoryCount}
                      </text>
                    </>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
};
