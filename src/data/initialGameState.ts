import type { Good, Country, GameState, Market } from '../types/game';
import { europeCountriesGeo } from './europeMapGeo';

// Initial goods catalog
export const initialGoods: Record<string, Good> = {
  grain: {
    id: 'grain',
    name: 'Grain',
    category: 'food',
    basePrice: 10,
    laborIntensity: 0.3,
    resourceIntensity: 0.7
  },
  steel: {
    id: 'steel',
    name: 'Steel',
    category: 'raw',
    basePrice: 50,
    laborIntensity: 0.5,
    resourceIntensity: 0.8
  },
  consumerGoods: {
    id: 'consumerGoods',
    name: 'Consumer Goods',
    category: 'consumer',
    basePrice: 100,
    laborIntensity: 0.7,
    resourceIntensity: 0.4
  },
  electronics: {
    id: 'electronics',
    name: 'Electronics',
    category: 'manufactured',
    basePrice: 200,
    laborIntensity: 0.8,
    resourceIntensity: 0.5
  },
  processedFood: {
    id: 'processedFood',
    name: 'Processed Food',
    category: 'food',
    basePrice: 30,
    laborIntensity: 0.5,
    resourceIntensity: 0.6
  }
};

// Country properties (economic characteristics)
const countryProperties: Record<string, { 
  population: number; 
  wageLevel: number; 
  incomeLevel: number;
  resourceBonus: Record<string, number>;
}> = {
  GB: {
    population: 67_000_000,
    wageLevel: 1.6,
    incomeLevel: 1.9,
    resourceBonus: { electronics: 0.9, consumerGoods: 1.0 }
  },
  DE: {
    population: 83_000_000,
    wageLevel: 1.5,
    incomeLevel: 1.8,
    resourceBonus: { steel: 0.8, electronics: 0.7 }
  },
  FR: {
    population: 67_000_000,
    wageLevel: 1.4,
    incomeLevel: 1.6,
    resourceBonus: { processedFood: 0.8, consumerGoods: 0.9 }
  },
  IT: {
    population: 60_000_000,
    wageLevel: 1.2,
    incomeLevel: 1.4,
    resourceBonus: { processedFood: 0.7, consumerGoods: 0.8 }
  },
  PL: {
    population: 38_000_000,
    wageLevel: 0.7,
    incomeLevel: 1.0,
    resourceBonus: { grain: 0.6, steel: 0.9 }
  },
  ES: {
    population: 47_000_000,
    wageLevel: 1.1,
    incomeLevel: 1.3,
    resourceBonus: { grain: 0.7, processedFood: 0.8 }
  },
  PT: {
    population: 10_000_000,
    wageLevel: 1.0,
    incomeLevel: 1.2,
    resourceBonus: { grain: 0.8, processedFood: 0.9 }
  },
  NL: {
    population: 17_000_000,
    wageLevel: 1.6,
    incomeLevel: 1.8,
    resourceBonus: { processedFood: 0.7, electronics: 0.9 }
  },
  BE: {
    population: 11_000_000,
    wageLevel: 1.5,
    incomeLevel: 1.7,
    resourceBonus: { consumerGoods: 0.9, steel: 1.0 }
  },
  CH: {
    population: 8_500_000,
    wageLevel: 2.0,
    incomeLevel: 2.2,
    resourceBonus: { electronics: 0.8, consumerGoods: 0.9 }
  },
  AT: {
    population: 9_000_000,
    wageLevel: 1.5,
    incomeLevel: 1.7,
    resourceBonus: { steel: 0.85, electronics: 0.95 }
  },
  CZ: {
    population: 10_500_000,
    wageLevel: 0.9,
    incomeLevel: 1.2,
    resourceBonus: { steel: 0.8, consumerGoods: 0.9 }
  },
  SE: {
    population: 10_500_000,
    wageLevel: 1.7,
    incomeLevel: 1.9,
    resourceBonus: { steel: 0.7, electronics: 0.8 }
  },
  NO: {
    population: 5_500_000,
    wageLevel: 2.1,
    incomeLevel: 2.3,
    resourceBonus: { steel: 0.6, electronics: 0.85 }
  },
  FI: {
    population: 5_500_000,
    wageLevel: 1.6,
    incomeLevel: 1.8,
    resourceBonus: { electronics: 0.75, steel: 0.85 }
  },
  DK: {
    population: 6_000_000,
    wageLevel: 1.8,
    incomeLevel: 2.0,
    resourceBonus: { processedFood: 0.7, consumerGoods: 0.9 }
  },
  GR: {
    population: 10_500_000,
    wageLevel: 0.9,
    incomeLevel: 1.1,
    resourceBonus: { grain: 0.8, processedFood: 0.9 }
  },
  RO: {
    population: 19_000_000,
    wageLevel: 0.5,
    incomeLevel: 0.8,
    resourceBonus: { grain: 0.5, steel: 0.7 }
  },
  HU: {
    population: 9_700_000,
    wageLevel: 0.8,
    incomeLevel: 1.0,
    resourceBonus: { grain: 0.6, consumerGoods: 0.85 }
  },
  SK: {
    population: 5_500_000,
    wageLevel: 0.85,
    incomeLevel: 1.1,
    resourceBonus: { steel: 0.75, consumerGoods: 0.9 }
  },
  BG: {
    population: 6_900_000,
    wageLevel: 0.5,
    incomeLevel: 0.7,
    resourceBonus: { grain: 0.55, steel: 0.8 }
  },
  HR: {
    population: 4_000_000,
    wageLevel: 0.9,
    incomeLevel: 1.1,
    resourceBonus: { grain: 0.7, processedFood: 0.85 }
  },
  SI: {
    population: 2_100_000,
    wageLevel: 1.2,
    incomeLevel: 1.4,
    resourceBonus: { steel: 0.8, consumerGoods: 0.9 }
  },
  LT: {
    population: 2_800_000,
    wageLevel: 0.75,
    incomeLevel: 0.95,
    resourceBonus: { grain: 0.65, processedFood: 0.8 }
  },
  LV: {
    population: 1_900_000,
    wageLevel: 0.7,
    incomeLevel: 0.9,
    resourceBonus: { grain: 0.6, steel: 0.85 }
  },
  EE: {
    population: 1_300_000,
    wageLevel: 1.0,
    incomeLevel: 1.3,
    resourceBonus: { electronics: 0.85, consumerGoods: 0.9 }
  },
  IE: {
    population: 5_000_000,
    wageLevel: 1.7,
    incomeLevel: 1.9,
    resourceBonus: { electronics: 0.75, consumerGoods: 0.9 }
  },
  RS: {
    population: 6_900_000,
    wageLevel: 0.5,
    incomeLevel: 0.7,
    resourceBonus: { grain: 0.6, steel: 0.75 }
  },
  BA: {
    population: 3_300_000,
    wageLevel: 0.55,
    incomeLevel: 0.75,
    resourceBonus: { grain: 0.65, steel: 0.8 }
  },
  AL: {
    population: 2_900_000,
    wageLevel: 0.45,
    incomeLevel: 0.65,
    resourceBonus: { grain: 0.7, processedFood: 0.85 }
  },
  MK: {
    population: 2_100_000,
    wageLevel: 0.5,
    incomeLevel: 0.7,
    resourceBonus: { grain: 0.65, consumerGoods: 0.8 }
  },
  ME: {
    population: 620_000,
    wageLevel: 0.6,
    incomeLevel: 0.8,
    resourceBonus: { grain: 0.75, processedFood: 0.85 }
  },
  LU: {
    population: 630_000,
    wageLevel: 2.2,
    incomeLevel: 2.5,
    resourceBonus: { electronics: 0.8, consumerGoods: 0.85 }
  },
  XK: {
    population: 1_800_000,
    wageLevel: 0.45,
    incomeLevel: 0.6,
    resourceBonus: { grain: 0.7, steel: 0.8 }
  },
  BY: {
    population: 9_400_000,
    wageLevel: 0.5,
    incomeLevel: 0.7,
    resourceBonus: { grain: 0.6, steel: 0.75 }
  },
  UA: {
    population: 41_000_000,
    wageLevel: 0.4,
    incomeLevel: 0.65,
    resourceBonus: { grain: 0.5, steel: 0.7 }
  },
  MD: {
    population: 2_600_000,
    wageLevel: 0.4,
    incomeLevel: 0.6,
    resourceBonus: { grain: 0.6, processedFood: 0.8 }
  }
};

// Generate countries with positions from map data
function generateCountries(): Record<string, Country> {
  const countries: Record<string, Country> = {};
  
  europeCountriesGeo.forEach(mapCountry => {
    const props = countryProperties[mapCountry.id];
    if (!props) return; // Skip if no economic data defined
    
    countries[mapCountry.id] = {
      id: mapCountry.id,
      name: mapCountry.name,
      position: { x: mapCountry.centroid[0], y: -mapCountry.centroid[1] },
      neighbors: mapCountry.neighbors,
      population: props.population,
      wageLevel: props.wageLevel,
      incomeLevel: props.incomeLevel,
      resourceBonus: props.resourceBonus
    };
  });
  
  return countries;
}

// Calculate production cost based on country and good properties
function calculateProductionCost(country: Country, good: Good): number {
  const laborCost = good.laborIntensity * country.wageLevel * good.basePrice * 0.3;
  const resourceCost = good.resourceIntensity * (country.resourceBonus[good.id] || 1.0) * good.basePrice * 0.4;
  return laborCost + resourceCost;
}

// Calculate sell price based on country income and good
function calculateBaseSellPrice(country: Country, good: Good): number {
  const demandMultiplier = country.incomeLevel;
  return good.basePrice * demandMultiplier;
}

// Calculate max daily demand based on population and good type
function calculateMaxDailyDemand(country: Country, good: Good): number {
  const baseDemand = country.population / 100_000;
  
  // Adjust by good category
  const categoryMultiplier: Record<string, number> = {
    food: 2.0,
    raw: 0.5,
    manufactured: 1.0,
    consumer: 1.5,
    luxury: 0.3
  };
  
  return Math.floor(baseDemand * (categoryMultiplier[good.category] || 1.0));
}

// Generate all markets (country x good combinations)
function generateMarkets(countries: Record<string, Country>, goods: Record<string, Good>): Record<string, Market> {
  const markets: Record<string, Market> = {};
  
  Object.values(countries).forEach(country => {
    Object.values(goods).forEach(good => {
      const key = `${country.id}-${good.id}`;
      markets[key] = {
        countryId: country.id,
        goodId: good.id,
        productionCost: calculateProductionCost(country, good),
        baseSellPrice: calculateBaseSellPrice(country, good),
        maxDailyDemand: calculateMaxDailyDemand(country, good),
        currentSupply: 0,
        currentPrice: calculateBaseSellPrice(country, good)
      };
    });
  });
  
  return markets;
}

// Create initial game state
export function createInitialGameState(): GameState {
  const countries = generateCountries();
  const goods = initialGoods;
  const markets = generateMarkets(countries, goods);
  
  return {
    money: 10000, // Starting capital
    adminPoints: 50, // Starting administration points
    countries,
    goods,
    markets,
    warehouses: {},
    factories: {},
    roads: {},
    truckLines: {},
    currentDay: 0,
    isPaused: true,
    tickSpeed: 2000 // 2 seconds per day
  };
}
