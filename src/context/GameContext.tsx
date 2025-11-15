import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { GameState, Warehouse, Factory, TruckLine } from '../types/game';
import { createInitialGameState } from '../data/initialGameState';

interface GameContextType {
  state: GameState;
  buildWarehouse: (countryId: string) => void;
  upgradeWarehouse: (countryId: string) => void;
  buildFactory: (countryId: string, goodId: string) => void;
  upgradeFactory: (factoryId: string) => void;
  createTruckLine: (roadId: string, goodId: string, trucks: number) => void;
  updateTruckLine: (truckLineId: string, trucks: number) => void;
  togglePause: () => void;
  setTickSpeed: (speed: number) => void;
}

const GameContext = createContext<GameContextType | null>(null);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GameState>(createInitialGameState());
  const intervalRef = useRef<number | null>(null);

  // Build warehouse in a country
  const buildWarehouse = useCallback((countryId: string) => {
    setState(prev => {
      if (prev.warehouses[countryId]) {
        return prev; // Already exists
      }
      
      const cost = 5000;
      if (prev.money < cost) {
        alert('Not enough money!');
        return prev;
      }

      const newWarehouse: Warehouse = {
        countryId,
        level: 1,
        capacity: 1000,
        storage: {}
      };

      return {
        ...prev,
        money: prev.money - cost,
        warehouses: {
          ...prev.warehouses,
          [countryId]: newWarehouse
        }
      };
    });
  }, []);

  // Upgrade warehouse
  const upgradeWarehouse = useCallback((countryId: string) => {
    setState(prev => {
      const warehouse = prev.warehouses[countryId];
      if (!warehouse) return prev;

      const cost = 3000 * warehouse.level;
      if (prev.money < cost) {
        alert('Not enough money!');
        return prev;
      }

      return {
        ...prev,
        money: prev.money - cost,
        warehouses: {
          ...prev.warehouses,
          [countryId]: {
            ...warehouse,
            level: warehouse.level + 1,
            capacity: warehouse.capacity + 500
          }
        }
      };
    });
  }, []);

  // Build factory
  const buildFactory = useCallback((countryId: string, goodId: string) => {
    setState(prev => {
      if (!prev.warehouses[countryId]) {
        alert('Build a warehouse first!');
        return prev;
      }

      const cost = 10000;
      if (prev.money < cost) {
        alert('Not enough money!');
        return prev;
      }

      const factoryId = `factory-${Date.now()}`;
      const newFactory: Factory = {
        id: factoryId,
        countryId,
        goodId,
        level: 1,
        outputPerDay: 50
      };

      return {
        ...prev,
        money: prev.money - cost,
        factories: {
          ...prev.factories,
          [factoryId]: newFactory
        }
      };
    });
  }, []);

  // Upgrade factory
  const upgradeFactory = useCallback((factoryId: string) => {
    setState(prev => {
      const factory = prev.factories[factoryId];
      if (!factory) return prev;

      const cost = 5000 * factory.level;
      if (prev.money < cost) {
        alert('Not enough money!');
        return prev;
      }

      return {
        ...prev,
        money: prev.money - cost,
        factories: {
          ...prev.factories,
          [factoryId]: {
            ...factory,
            level: factory.level + 1,
            outputPerDay: factory.outputPerDay + 30
          }
        }
      };
    });
  }, []);

  // Build road between two countries
  const buildRoad = useCallback((fromCountryId: string, toCountryId: string): string | null => {
    let roadId: string | null = null;
    
    setState(prev => {
      // Check if road already exists
      const existingRoad = Object.values(prev.roads).find(
        road => 
          (road.fromCountryId === fromCountryId && road.toCountryId === toCountryId) ||
          (road.fromCountryId === toCountryId && road.toCountryId === fromCountryId)
      );
      
      if (existingRoad) {
        roadId = existingRoad.id;
        return prev;
      }

      // Check if countries are neighbors
      const fromCountry = prev.countries[fromCountryId];
      if (!fromCountry.neighbors.includes(toCountryId)) {
        alert('Countries must be neighbors!');
        return prev;
      }

      const cost = 2000;
      if (prev.money < cost) {
        alert('Not enough money!');
        return prev;
      }

      // Calculate distance
      const toCountry = prev.countries[toCountryId];
      const dx = fromCountry.position.x - toCountry.position.x;
      const dy = fromCountry.position.y - toCountry.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      roadId = `road-${Date.now()}`;
      const newRoad: Road = {
        id: roadId,
        fromCountryId,
        toCountryId,
        distance,
        level: 1
      };

      return {
        ...prev,
        money: prev.money - cost,
        roads: {
          ...prev.roads,
          [roadId]: newRoad
        }
      };
    });
    
    return roadId;
  }, []);

  // Create truck line
  const createTruckLine = useCallback((roadId: string, goodId: string, trucks: number) => {
    setState(prev => {
      const road = prev.roads[roadId];
      if (!road) return prev;

      const truckLineId = `truckline-${Date.now()}`;
      const newTruckLine: TruckLine = {
        id: truckLineId,
        roadId,
        fromCountryId: road.fromCountryId,
        toCountryId: road.toCountryId,
        goodId,
        trucksAssigned: trucks,
        capacityPerTruck: 100
      };

      return {
        ...prev,
        truckLines: {
          ...prev.truckLines,
          [truckLineId]: newTruckLine
        }
      };
    });
  }, []);

  // Update truck line
  const updateTruckLine = useCallback((truckLineId: string, trucks: number) => {
    setState(prev => {
      const truckLine = prev.truckLines[truckLineId];
      if (!truckLine) return prev;

      return {
        ...prev,
        truckLines: {
          ...prev.truckLines,
          [truckLineId]: {
            ...truckLine,
            trucksAssigned: trucks
          }
        }
      };
    });
  }, []);

  // Toggle pause
  const togglePause = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  }, []);

  // Set tick speed
  const setTickSpeed = useCallback((speed: number) => {
    setState(prev => ({
      ...prev,
      tickSpeed: speed
    }));
  }, []);

  // Simulation tick - run every day
  useEffect(() => {
    if (state.isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setState(prev => simulateTick(prev));
    }, state.tickSpeed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isPaused, state.tickSpeed]);

  const value: GameContextType = {
    state,
    buildWarehouse,
    upgradeWarehouse,
    buildFactory,
    upgradeFactory,
    buildRoad,
    createTruckLine,
    updateTruckLine,
    togglePause,
    setTickSpeed
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// Main simulation tick function
function simulateTick(prevState: GameState): GameState {
  let newState = { ...prevState, currentDay: prevState.currentDay + 1 };
  
  // Step 1: Production
  newState = simulateProduction(newState);
  
  // Step 2: Logistics
  newState = simulateLogistics(newState);
  
  // Step 3: Markets and sales
  newState = simulateMarkets(newState);
  
  return newState;
}

// Simulate production from factories
function simulateProduction(state: GameState): GameState {
  const newWarehouses = { ...state.warehouses };
  
  Object.values(state.factories).forEach(factory => {
    const warehouse = newWarehouses[factory.countryId];
    if (!warehouse) return;
    
    // Calculate current storage
    const currentTotal = Object.values(warehouse.storage).reduce((sum, amt) => sum + amt, 0);
    if (currentTotal >= warehouse.capacity) return; // Full
    
    // Produce goods
    const produced = Math.min(factory.outputPerDay, warehouse.capacity - currentTotal);
    warehouse.storage[factory.goodId] = (warehouse.storage[factory.goodId] || 0) + produced;
  });
  
  return {
    ...state,
    warehouses: newWarehouses
  };
}

// Simulate logistics (truck movements)
function simulateLogistics(state: GameState): GameState {
  const newWarehouses = { ...state.warehouses };
  let totalCost = 0;
  
  Object.values(state.truckLines).forEach(line => {
    const fromWarehouse = newWarehouses[line.fromCountryId];
    const toWarehouse = newWarehouses[line.toCountryId];
    
    if (!fromWarehouse || !toWarehouse) return;
    
    const road = state.roads[line.roadId];
    if (!road) return;
    
    // Calculate capacity
    const dailyCapacity = line.trucksAssigned * line.capacityPerTruck;
    const available = fromWarehouse.storage[line.goodId] || 0;
    const toMove = Math.min(dailyCapacity, available);
    
    if (toMove === 0) return;
    
    // Check destination capacity
    const destTotal = Object.values(toWarehouse.storage).reduce((sum, amt) => sum + amt, 0);
    const destSpace = toWarehouse.capacity - destTotal;
    const actualMove = Math.min(toMove, destSpace);
    
    if (actualMove === 0) return;
    
    // Move goods
    fromWarehouse.storage[line.goodId] -= actualMove;
    toWarehouse.storage[line.goodId] = (toWarehouse.storage[line.goodId] || 0) + actualMove;
    
    // Calculate cost (0.1 per unit per 100 distance)
    const cost = actualMove * (road.distance / 100) * 0.1;
    totalCost += cost;
  });
  
  return {
    ...state,
    warehouses: newWarehouses,
    money: state.money - totalCost
  };
}

// Simulate markets and sales
function simulateMarkets(state: GameState): GameState {
  const newMarkets = { ...state.markets };
  const newWarehouses = { ...state.warehouses };
  let totalRevenue = 0;
  let totalProductionCost = 0;
  
  // Update supply and prices, then sell
  Object.values(newMarkets).forEach(market => {
    const warehouse = newWarehouses[market.countryId];
    const supply = warehouse?.storage[market.goodId] || 0;
    
    market.currentSupply = supply;
    
    // Calculate price based on supply/demand
    const ratio = market.maxDailyDemand > 0 ? supply / market.maxDailyDemand : 1;
    let priceMultiplier = 1.0;
    
    if (ratio < 1) {
      // Shortage - price increases
      priceMultiplier = 1 + (1 - ratio) * 0.5; // up to +50%
    } else if (ratio > 1) {
      // Oversupply - price decreases
      priceMultiplier = Math.max(0.5, 1 - (ratio - 1) * 0.3); // down to -50%
    }
    
    market.currentPrice = market.baseSellPrice * priceMultiplier;
    
    // Sell goods
    if (warehouse && supply > 0) {
      const unitsSold = Math.min(supply, market.maxDailyDemand);
      warehouse.storage[market.goodId] = supply - unitsSold;
      
      const revenue = unitsSold * market.currentPrice;
      totalRevenue += revenue;
      
      // Production cost
      const cost = unitsSold * market.productionCost * 0.5; // Half of production cost as ongoing cost
      totalProductionCost += cost;
    }
  });
  
  return {
    ...state,
    markets: newMarkets,
    warehouses: newWarehouses,
    money: state.money + totalRevenue - totalProductionCost
  };
}
