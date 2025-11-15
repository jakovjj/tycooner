import React, { useState, useRef, useEffect } from 'react';
import { europeCountriesGeo, coordinatesToPath, calculateMapBounds } from '../data/europeMapGeo';
import { useGame } from '../context/GameContext';
import './EuropeMap.css';

interface EuropeMapProps {
  onCountryClick: (countryId: string) => void;
}

interface Transform {
  x: number;
  y: number;
  scale: number;
}

export const EuropeMap: React.FC<EuropeMapProps> = ({ onCountryClick }) => {
  const { state } = useGame();
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 0.55 });
  const [targetTransform, setTargetTransform] = useState<Transform>({ x: 0, y: -450, scale: 0.55 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const bounds = calculateMapBounds();
  const viewBoxWidth = bounds.width;
  const viewBoxHeight = bounds.height;

  // Smooth lerp animation
  useEffect(() => {
    let animationFrame: number;
    
    const animate = () => {
      setTransform(prev => {
        const lerpFactor = 0.15;
        const newX = prev.x + (targetTransform.x - prev.x) * lerpFactor;
        const newY = prev.y + (targetTransform.y - prev.y) * lerpFactor;
        const newScale = prev.scale + (targetTransform.scale - prev.scale) * lerpFactor;
        
        return {
          x: newX,
          y: newY,
          scale: newScale
        };
      });
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [targetTransform]);

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
  const getCountryColor = (countryId: string): string => {
    const hasWarehouse = !!state.warehouses[countryId];
    const hasFactory = Object.values(state.factories).some(f => f.countryId === countryId);
    
    if (hasWarehouse && hasFactory) return '#4CAF50';
    if (hasWarehouse) return '#8BC34A';
    if (hasFactory) return '#FFC107';
    return '#B0BEC5';
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
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
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

          {/* Countries */}
          <g className="countries-layer">
            {europeCountriesGeo.map(country => {
              const countryData = state.countries[country.id];
              if (!countryData) return null;
              
              return (
                <g key={country.id}>
                  <path
                    d={coordinatesToPath(country.coordinates)}
                    fill="url(#grassTexture)"
                    stroke="#000000"
                    strokeWidth="0.08"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    className="country"
                    data-country-id={country.id}
                    onClick={() => onCountryClick(country.id)}
                    style={{
                      opacity: getCountryColor(country.id) === '#81C784' ? 1 : 0.92
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
