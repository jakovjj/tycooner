/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { europeCountries } from '../data/europeMap';
import type { GameState, Warehouse, Factory, TruckLine, ProductionType, CountryProduction } from '../types/game';
import { createInitialGameState } from '../data/initialGameState';
// EXPERIENCE_FORMULA removed; progression now based solely on money unlock costs.

interface GameContextType {
  state: GameState;
  buildWarehouse: (countryId: string) => void;
  upgradeWarehouse: (countryId: string) => void;
  buildFactory: (countryId: string, goodId: string) => void;
  upgradeFactory: (factoryId: string) => void;
  createTruckLine: (roadId: string, goodId: string, trucks: number) => void;
  updateTruckLine: (truckLineId: string, trucks: number) => void;
  buildProductionBuilding: (countryId: string, type: ProductionType) => void;
  destroyProductionBuilding: (countryId: string, type: ProductionType) => void;
  sellProductionResource: (countryId: string, type: ProductionType) => void;
  unlockCountry: (countryId: string, free?: boolean) => void;
  sellGood: (countryId: string, goodId: string, amount: number) => void;
  showUnlockModal: boolean;
  setShowUnlockModal: (show: boolean) => void;
  isGameStart: boolean;
  getNextUnlockCost: () => number;
  challengeTargetCountryId: string | null;
  challengeDeadline: number | null;
  buildRoad: (fromCountryId: string, toCountryId: string) => void;
  transferGoods: (fromCountryId: string, toCountryId: string, goodId: string, amount: number) => void;
  restartGame: () => void;
  facilityWarning: boolean;
  dismissFacilityWarning: () => void;
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
  const [showUnlockModal, setShowUnlockModal] = useState(() => state.unlockedCountries.length === 0);
  const isGameStart = state.unlockedCountries.length === 0;
  // Level/experience removed; track only unlocked countries and money.
  const [facilityWarning, setFacilityWarning] = useState(false);
  const dismissFacilityWarning = useCallback(() => setFacilityWarning(false), []);

  // Start the next timed challenge (unlock a neighboring locked country within 5 minutes)
  const startNextChallenge = useCallback((prev: GameState): GameState => {
    const allCountryIds = europeCountries.map(c => c.id);
    const unlocked = prev.unlockedCountries;
    if (unlocked.length >= allCountryIds.length) {
      return { ...prev, challengeTargetCountryId: null, challengeDeadline: null, gameOver: true };
    }
    const locked = allCountryIds.filter(id => !unlocked.includes(id));
    const candidateSet = new Set<string>();
    unlocked.forEach(id => {
      const feature = europeCountries.find(c => c.id === id);
      feature?.neighbors.forEach(n => { if (locked.includes(n)) candidateSet.add(n); });
    });
    let candidates = Array.from(candidateSet);
    if (candidates.length === 0) candidates = locked;
    if (candidates.length === 0) return { ...prev, challengeTargetCountryId: null, challengeDeadline: null, gameOver: true };
    const target = candidates[Math.floor(Math.random() * candidates.length)];
    return { ...prev, challengeTargetCountryId: target, challengeDeadline: Date.now() + 5 * 60 * 1000 };
  }, []);

  // No level-up or separate gameStart state needed.

  // Unlock a country
  const unlockCountry = useCallback((countryId: string, free: boolean = false) => {
    setState(prev => {
      if (prev.unlockedCountries.includes(countryId)) return prev; // already unlocked
      const unlockedCount = prev.unlockedCountries.length;
      // Prevent unlocking new country before first facility is built (except starting country)
      if (unlockedCount > 0) {
        const totalProductionBuildings = Object.values(prev.production).reduce((sum, cp) => {
          return sum + cp.buildings.farm.length + cp.buildings.factory.length + cp.buildings.ranch.length;
        }, 0);
        const legacyFactories = Object.values(prev.factories).length;
        if (totalProductionBuildings + legacyFactories === 0) {
          setFacilityWarning(true);
          return prev;
        }
      }
      const cost = free || unlockedCount === 0 ? 0 : Math.round(5000 * Math.pow(1.5, unlockedCount));
      if (prev.money < cost) {
        alert(`Not enough money to unlock. Need $${cost.toLocaleString()}`);
        return prev;
      }
      let updated: GameState = {
        ...prev,
        money: prev.money - cost,
        unlockedCountries: [...prev.unlockedCountries, countryId]
      };
      // Trigger first challenge immediately after first unlock
      if (updated.unlockedCountries.length === 1 && updated.challengeTargetCountryId === null) {
        updated = startNextChallenge(updated);
      }
      // If this unlock completes current challenge, schedule next
      if (updated.challengeTargetCountryId && updated.unlockedCountries.includes(updated.challengeTargetCountryId)) {
        updated = startNextChallenge(updated);
      }
      return updated;
    });
  }, [startNextChallenge]);

  // Restart game - reset state
  const restartGame = useCallback(() => {
    // Immediate restart without confirmation per new requirements
    setState(createInitialGameState());
    setFacilityWarning(false);
    setShowUnlockModal(true);
  }, []);

  // Build road between neighboring countries for $2000
  const buildRoad = useCallback((fromCountryId: string, toCountryId: string) => {
    setState(prev => {
      if (!prev.unlockedCountries.includes(fromCountryId) || !prev.unlockedCountries.includes(toCountryId)) {
        alert('Both countries must be unlocked first.');
        return prev;
      }
      const country = prev.countries[fromCountryId];
      if (!country.neighbors.includes(toCountryId)) {
        alert('Road can only be built to neighboring countries.');
        return prev;
      }
      // Check if road already exists
      const existing = Object.values(prev.roads).find(r => (r.fromCountryId === fromCountryId && r.toCountryId === toCountryId) || (r.fromCountryId === toCountryId && r.toCountryId === fromCountryId));
      if (existing) return prev;
      const cost = 2000;
      if (prev.money < cost) {
        alert('Not enough money to build road.');
        return prev;
      }
      // Distance: Euclidean based on centroids from europeCountriesGeo
      const geoA = europeCountries.find(c => c.id === fromCountryId);
      const geoB = europeCountries.find(c => c.id === toCountryId);
      if (!geoA || !geoB) return prev;
      const [x1, y1] = geoA.centroid;
      const [x2, y2] = geoB.centroid;
      const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      const roadId = `road-${fromCountryId}-${toCountryId}`;
      const newRoad = { id: roadId, fromCountryId, toCountryId, distance, level: 1 };
      return {
        ...prev,
        money: prev.money - cost,
        roads: { ...prev.roads, [roadId]: newRoad }
      };
    });
  }, []);

  // Transfer goods instantly if road exists and both warehouses present
  const transferGoods = useCallback((fromCountryId: string, toCountryId: string, goodId: string, amount: number) => {
    if (amount <= 0) return;
    setState(prev => {
      const warehouseFrom = prev.warehouses[fromCountryId];
      const warehouseTo = prev.warehouses[toCountryId];
      if (!warehouseFrom || !warehouseTo) {
        alert('Both countries need warehouses.');
        return prev;
      }
      const road = Object.values(prev.roads).find(r => (r.fromCountryId === fromCountryId && r.toCountryId === toCountryId) || (r.fromCountryId === toCountryId && r.toCountryId === fromCountryId));
      if (!road) {
        alert('No road between these countries.');
        return prev;
      }
      const available = warehouseFrom.storage[goodId] || 0;
      if (available < amount) {
        alert('Not enough goods to transfer.');
        return prev;
      }
      const destTotal = Object.values(warehouseTo.storage).reduce((sum, v) => sum + v, 0);
      const space = warehouseTo.capacity - destTotal;
      if (space <= 0) {
        alert('Destination warehouse is full.');
        return prev;
      }
      const actual = Math.min(amount, space);
      const newFrom = { ...warehouseFrom.storage, [goodId]: available - actual };
      const newTo = { ...warehouseTo.storage, [goodId]: (warehouseTo.storage[goodId] || 0) + actual };
      return {
        ...prev,
        warehouses: {
          ...prev.warehouses,
          [fromCountryId]: { ...warehouseFrom, storage: newFrom },
          [toCountryId]: { ...warehouseTo, storage: newTo }
        }
      };
    });
  }, []);

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
        // Reduced capacity to better match 1 unit/day facility output
        capacity: 60,
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
            // Reduced incremental capacity growth
            capacity: warehouse.capacity + 30
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
        outputPerDay: 15 // halved base output
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
            outputPerDay: factory.outputPerDay + 8 // halved upgrade increment
          }
        }
      };
    });
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

  // Pause/speed controls removed (game runs continuously)

  // Sell goods from warehouse (manual sale; no experience system anymore)
  const sellGood = useCallback((countryId: string, goodId: string, amount: number) => {
    setState(prev => {
      const warehouse = prev.warehouses[countryId];
      if (!warehouse) return prev;

      const available = warehouse.storage[goodId] || 0;
      if (available < amount || amount <= 0) return prev;

      const market = prev.markets[`${countryId}-${goodId}`];
      if (!market) return prev;

      // Revenue (no tax currently)
      const revenue = amount * market.currentPrice;

      // Remove goods from storage
      const newStorage = { ...warehouse.storage };
      newStorage[goodId] = available - amount;

      return {
        ...prev,
        money: prev.money + revenue,
        warehouses: {
          ...prev.warehouses,
          [countryId]: {
            ...warehouse,
            storage: newStorage
          }
        }
      };
    });
  }, []);

  // Build production building (farm, factory, ranch)
  const buildProductionBuilding = useCallback((countryId: string, type: ProductionType) => {
    setState(prev => {
      const warehouse = prev.warehouses[countryId];
      if (!warehouse) {
        alert('Build a warehouse first!');
        return prev;
      }

      const country = prev.countries[countryId];
      const pricing = country.productionPricing;
      if (!pricing) return prev;

      let cost = 0;
      if (type === 'farm') cost = pricing.farmBuildCost;
      else if (type === 'factory') cost = pricing.factoryBuildCost;
      else if (type === 'ranch') cost = pricing.ranchBuildCost;

      if (prev.money < cost) {
        alert('Not enough money!');
        return prev;
      }
      const existingProduction = prev.production[countryId];
      const BUILDING_LIMIT_DIVISORS: Record<ProductionType, number> = {
        farm: 12_000_000,
        factory: 20_000_000,
        ranch: 15_000_000
      };
  // Each facility produces exactly 1 unit per day
  const OUTPUTS: Record<ProductionType, number> = { farm: 1, factory: 1, ranch: 1 };
      const limit = Math.max(1, Math.floor(country.population / BUILDING_LIMIT_DIVISORS[type]));
      const newProduction: CountryProduction = existingProduction || {
        countryId,
        buildings: { farm: [], factory: [], ranch: [] }
      };
      const currentCount = newProduction.buildings[type].length;
      if (currentCount >= limit) {
        alert(`Limit reached for ${type} buildings (max ${limit})`);
        return prev;
      }
  newProduction.buildings[type] = [...newProduction.buildings[type], { type, outputPerDay: OUTPUTS[type] }];

      return {
        ...prev,
        money: prev.money - cost,
        production: {
          ...prev.production,
          [countryId]: newProduction
        }
      };
    });
  }, []);

  // Destroy production building (remove one instance of given type)
  const destroyProductionBuilding = useCallback((countryId: string, type: ProductionType) => {
    setState(prev => {
      const existing = prev.production[countryId];
      if (!existing) return prev;
      const list = existing.buildings[type];
      if (!list || list.length === 0) return prev;
      const newList = list.slice(0, list.length - 1); // remove last
      const newProduction: CountryProduction = {
        ...existing,
        buildings: { ...existing.buildings, [type]: newList }
      };
      return {
        ...prev,
        production: { ...prev.production, [countryId]: newProduction }
      };
    });
  }, []);

  // Sell production resources directly
  const sellProductionResource = useCallback((countryId: string, type: ProductionType) => {
    setState(prev => {
      const production = prev.production[countryId];
      if (!production) return prev;
      const buildingList = production.buildings[type];
      if (!buildingList || buildingList.length === 0) return prev;

      const country = prev.countries[countryId];
      const pricing = country.productionPricing;
      if (!pricing) return prev;

      // Get accumulated production (simplified - just use daily output)
  const amount = buildingList.reduce((sum, b) => sum + b.outputPerDay, 0);
      
      let sellPrice = 0;
  if (type === 'farm') sellPrice = pricing.grainSellPrice;
  else if (type === 'factory') sellPrice = pricing.clothingSellPrice;
  else if (type === 'ranch') sellPrice = pricing.meatSellPrice;

      const revenue = amount * sellPrice;

      return {
        ...prev,
        money: prev.money + revenue
      };
    });
  }, []);

  // Simulation tick - run every day
  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      setState(prev => simulateTick(prev));
    }, state.tickSpeed);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.tickSpeed]);

  const getNextUnlockCost = useCallback(() => {
    const unlockedCount = state.unlockedCountries.length;
    if (unlockedCount === 0) return 0; // starting country free
    return Math.round(5000 * Math.pow(1.5, unlockedCount));
  }, [state.unlockedCountries.length]);

  // Start the next timed challenge (unlock a neighboring locked country within 5 minutes)


  useEffect(() => {
    if (state.gameOver) return;
    const timer = window.setInterval(() => {
      setState(prev => {
        if (prev.gameOver) return prev;
        if (prev.challengeDeadline && Date.now() > prev.challengeDeadline) {
          return { ...prev, gameOver: true };
        }
        if (prev.challengeTargetCountryId && prev.unlockedCountries.includes(prev.challengeTargetCountryId)) {
          return startNextChallenge(prev);
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [state.gameOver, state.challengeDeadline, state.challengeTargetCountryId, state.unlockedCountries, startNextChallenge]);

  const value: GameContextType = {
    state,
    buildWarehouse,
    upgradeWarehouse,
    buildFactory,
    upgradeFactory,
    createTruckLine,
    updateTruckLine,
    buildProductionBuilding,
    sellProductionResource,
    unlockCountry,
    sellGood,
    showUnlockModal,
    setShowUnlockModal,
    isGameStart,
    getNextUnlockCost,
    challengeTargetCountryId: state.challengeTargetCountryId,
    challengeDeadline: state.challengeDeadline,
    buildRoad,
    transferGoods,
    restartGame,
    destroyProductionBuilding,
    facilityWarning,
    dismissFacilityWarning
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
  
  // Production from old factories (existing goods system)
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
  
  // Production from new production buildings (grain, clothing, meat)
  Object.values(state.production).forEach(countryProduction => {
    const warehouse = newWarehouses[countryProduction.countryId];
    if (!warehouse) return;
    
    const currentTotal = Object.values(warehouse.storage).reduce((sum, amt) => sum + amt, 0);
    if (currentTotal >= warehouse.capacity) return; // Full
    
    // Process each production building instance
    (['farm','factory','ranch'] as ProductionType[]).forEach(pt => {
      countryProduction.buildings[pt].forEach(instance => {
        const currentStored = Object.values(warehouse.storage).reduce((sum, amt) => sum + amt, 0);
        if (currentStored >= warehouse.capacity) return; // No space
        const availableSpace = warehouse.capacity - currentStored;
        const produced = Math.min(instance.outputPerDay, availableSpace);
        if (produced <= 0) return;
  const goodId = pt === 'farm' ? 'grain' : pt === 'factory' ? 'clothing' : 'meat';
        warehouse.storage[goodId] = (warehouse.storage[goodId] || 0) + produced;
      });
    });
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
  
  // Update supply and prices (but don't auto-sell)
  Object.values(newMarkets).forEach(market => {
    const warehouse = state.warehouses[market.countryId];
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
  });
  
  return {
    ...state,
    markets: newMarkets
  };
}
