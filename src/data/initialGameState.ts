import type { Good, Country, GameState, Market, ProductionPricing } from '../types/game';
import { europeCountriesGeo } from './europeMapGeo';

// Helper to generate varied pricing based on country characteristics
// Real-world inspired base prices (unit = ~1kg) scaled for gameplay
const REAL_WORLD_BASE = {
  grain: 100,      // world average index baseline bread & cereals
  clothing: 126,   // world average clothing & footwear index
  meat: 100        // world average meat index
};

// Price index mappings (world average = 100, 2021) sourced from World Bank ICP (theglobaleconomy.com)
// We use index values directly as per-unit sell prices for relative differences.
const MEAT_PRICE_INDEX: Record<string, number> = {
  CH: 286.09,
  NO: 173.62,
  FR: 155.63,
  BE: 144.53,
  AT: 143.48,
  SE: 140.0,
  IT: 139.57,
  DE: 138.32,
  IE: 131.68,
  FI: 128.48,
  NL: 126.51,
  SI: 119.83,
  DK: 113.28,
  ES: 109.77,
  GR: 109.29,
  GB: 109.07,
  PT: 105.39,
  EE: 105.27,
  HR: 98.6,
  CZ: 98.5,
  SK: 96.57,
  LV: 92.49,
  AL: 87.6,
  RS: 86.74,
  LT: 85.83,
  HU: 84.14,
  BA: 80.46,
  ME: 78.86,
  BG: 76.44,
  MK: 74.87,
  RO: 74.66,
  PL: 73.76,
  MD: 66.27,
  UA: 63.58,
  BY: 52.51
  // LU present in source list but Luxembourg removed from map; omitted intentionally.
};

const GRAIN_PRICE_INDEX: Record<string, number> = {
  CH: 204.98, DK: 177.52, NO: 166.97, FI: 154.22, SE: 150.64, IE: 148.37, IT: 140.88,
  AT: 139.45, GR: 138.58, SI: 133.4, FR: 130.33, DE: 128.99, ES: 128.72, BE: 127.84,
  HR: 125.94, EE: 121.3, PT: 121.29, LV: 113.84, SK: 112.53, LT: 110.73, NL: 109.04,
  GB: 106.54, CZ: 104.14, HU: 98.58, RS: 96.07, BA: 95.82, AL: 95.4, ME: 94.52,
  PL: 86.7, BG: 82.22, MK: 73.92, RO: 73.25, MD: 65.57, UA: 63.47, BY: 59.25, RU: 59.75
};

const CLOTHING_PRICE_INDEX: Record<string, number> = {
  DK: 174.98, CH: 169.98, NO: 166.37, SE: 159.34, FI: 152.94, EE: 141.03, FR: 139.99,
  LV: 135.46, IT: 135.36, AT: 135.14, PT: 134.99, LT: 134.42, BE: 132.67, NL: 130.28,
  IE: 130.26, DE: 129.8, SK: 127.39, SI: 125.92, BA: 125.5, GR: 123.23, CZ: 121.93,
  ME: 121.26, RS: 120.71, HR: 120.56, PL: 118.07, ES: 117.36, AL: 115.43, GB: 115.38,
  HU: 114.69, RO: 110.95, MK: 103.28, UA: 103.12, BG: 100.53, MD: 96.33, BY: 80.07, RU: 85.42
};

function generateProductionPricing(countryId: string, wageLevel: number): ProductionPricing {
  const grainSellPrice = GRAIN_PRICE_INDEX[countryId] ?? REAL_WORLD_BASE.grain;
  const clothingSellPrice = CLOTHING_PRICE_INDEX[countryId] ?? REAL_WORLD_BASE.clothing;
  const meatSellPrice = MEAT_PRICE_INDEX[countryId] ?? REAL_WORLD_BASE.meat;

  // Build costs vary by wage level (higher wages = higher costs)
  const farmBuildCost = Math.round(3000 + wageLevel * 2000);
  const farmUpgradeCost = Math.round(1500 + wageLevel * 1000); // retained for backward compatibility (may be unused)
  const factoryBuildCost = Math.round(8000 + wageLevel * 5000);
  const factoryUpgradeCost = Math.round(4000 + wageLevel * 2500);
  const ranchBuildCost = Math.round(5000 + wageLevel * 3000);
  const ranchUpgradeCost = Math.round(2500 + wageLevel * 1500);

  return {
    grainSellPrice,
    clothingSellPrice,
    meatSellPrice,
    farmBuildCost,
    farmUpgradeCost,
    factoryBuildCost,
    factoryUpgradeCost,
    ranchBuildCost,
    ranchUpgradeCost
  };
}

// Initial goods catalog
export const initialGoods: Record<string, Good> = {
  grain: {
    id: 'grain',
    name: 'Grain',
    category: 'food',
    basePrice: REAL_WORLD_BASE.grain,
    laborIntensity: 0.3,
    resourceIntensity: 0.7
  },
  clothing: {
    id: 'clothing',
    name: 'Clothing',
    category: 'consumer',
    basePrice: REAL_WORLD_BASE.clothing,
    laborIntensity: 0.6,
    resourceIntensity: 0.4
  },
  meat: {
    id: 'meat',
    name: 'Meat',
    category: 'food',
    basePrice: REAL_WORLD_BASE.meat,
    laborIntensity: 0.4,
    resourceIntensity: 0.6
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
  // incomeLevel removed
  resourceBonus: Record<string, number>;
}> = {
  GB: {
    population: 67_000_000,
    wageLevel: 1.6,
  // incomeLevel removed
    resourceBonus: { electronics: 0.9, consumerGoods: 1.0 }
  },
  DE: {
    population: 83_000_000,
    wageLevel: 1.5,
  // incomeLevel removed
  resourceBonus: { clothing: 0.8, electronics: 0.7 }
  },
  FR: {
    population: 67_000_000,
    wageLevel: 1.4,
  // incomeLevel removed
    resourceBonus: { processedFood: 0.8, consumerGoods: 0.9 }
  },
  IT: {
    population: 60_000_000,
    wageLevel: 1.2,
  // incomeLevel removed
    resourceBonus: { processedFood: 0.7, consumerGoods: 0.8 }
  },
  PL: {
    population: 38_000_000,
    wageLevel: 0.7,
  // incomeLevel removed
  resourceBonus: { grain: 0.6, clothing: 0.9 }
  },
  ES: {
    population: 47_000_000,
    wageLevel: 1.1,
  // incomeLevel removed
    resourceBonus: { grain: 0.7, processedFood: 0.8 }
  },
  PT: {
    population: 10_000_000,
    wageLevel: 1.0,
  // incomeLevel removed
    resourceBonus: { grain: 0.8, processedFood: 0.9 }
  },
  NL: {
    population: 17_000_000,
    wageLevel: 1.6,
  // incomeLevel removed
    resourceBonus: { processedFood: 0.7, electronics: 0.9 }
  },
  BE: {
    population: 11_000_000,
    wageLevel: 1.5,
  // incomeLevel removed
  resourceBonus: { consumerGoods: 0.9, clothing: 1.0 }
  },
  CH: {
    population: 8_500_000,
    wageLevel: 2.0,
  // incomeLevel removed
    resourceBonus: { electronics: 0.8, consumerGoods: 0.9 }
  },
  AT: {
    population: 9_000_000,
    wageLevel: 1.5,
  // incomeLevel removed
  resourceBonus: { clothing: 0.85, electronics: 0.95 }
  },
  CZ: {
    population: 10_500_000,
    wageLevel: 0.9,
  // incomeLevel removed
  resourceBonus: { clothing: 0.8, consumerGoods: 0.9 }
  },
  SE: {
    population: 10_500_000,
    wageLevel: 1.7,
  // incomeLevel removed
  resourceBonus: { clothing: 0.7, electronics: 0.8 }
  },
  NO: {
    population: 5_500_000,
    wageLevel: 2.1,
  // incomeLevel removed
  resourceBonus: { clothing: 0.6, electronics: 0.85 }
  },
  FI: {
    population: 5_500_000,
    wageLevel: 1.6,
  // incomeLevel removed
  resourceBonus: { electronics: 0.75, clothing: 0.85 }
  },
  DK: {
    population: 6_000_000,
    wageLevel: 1.8,
  // incomeLevel removed
    resourceBonus: { processedFood: 0.7, consumerGoods: 0.9 }
  },
  GR: {
    population: 10_500_000,
    wageLevel: 0.9,
    resourceBonus: { grain: 0.8, processedFood: 0.9 }
  },
  RO: {
    population: 19_000_000,
    wageLevel: 0.5,
  resourceBonus: { grain: 0.5, clothing: 0.7 }
  },
  HU: {
    population: 9_700_000,
    wageLevel: 0.8,
    resourceBonus: { grain: 0.6, consumerGoods: 0.85 }
  },
  SK: {
    population: 5_500_000,
    wageLevel: 0.85,
  resourceBonus: { clothing: 0.75, consumerGoods: 0.9 }
  },
  BG: {
    population: 6_900_000,
    wageLevel: 0.5,
  resourceBonus: { grain: 0.55, clothing: 0.8 }
  },
  HR: {
    population: 4_000_000,
    wageLevel: 0.9,
    resourceBonus: { grain: 0.7, processedFood: 0.85 }
  },
  SI: {
    population: 2_100_000,
    wageLevel: 1.2,
  resourceBonus: { clothing: 0.8, consumerGoods: 0.9 }
  },
  LT: {
    population: 2_800_000,
    wageLevel: 0.75,
    resourceBonus: { grain: 0.65, processedFood: 0.8 }
  },
  LV: {
    population: 1_900_000,
    wageLevel: 0.7,
  resourceBonus: { grain: 0.6, clothing: 0.85 }
  },
  EE: {
    population: 1_300_000,
    wageLevel: 1.0,
    resourceBonus: { electronics: 0.85, consumerGoods: 0.9 }
  },
  IE: {
    population: 5_000_000,
    wageLevel: 1.7,
    resourceBonus: { electronics: 0.75, consumerGoods: 0.9 }
  },
  RS: {
    population: 6_900_000,
    wageLevel: 0.5,
  resourceBonus: { grain: 0.6, clothing: 0.75 }
  },
  BA: {
    population: 3_300_000,
    wageLevel: 0.55,
  resourceBonus: { grain: 0.65, clothing: 0.8 }
  },
  AL: {
    population: 2_900_000,
    wageLevel: 0.45,
    resourceBonus: { grain: 0.7, processedFood: 0.85 }
  },
  MK: {
    population: 2_100_000,
    wageLevel: 0.5,
    resourceBonus: { grain: 0.65, consumerGoods: 0.8 }
  },
  ME: {
    population: 620_000,
    wageLevel: 0.6,
    resourceBonus: { grain: 0.75, processedFood: 0.85 }
  },
  LU: {
    population: 630_000,
    wageLevel: 2.2,
    resourceBonus: { electronics: 0.8, consumerGoods: 0.85 }
  },
  XK: {
    population: 1_800_000,
    wageLevel: 0.45,
  resourceBonus: { grain: 0.7, clothing: 0.8 }
  },
  BY: {
    population: 9_400_000,
    wageLevel: 0.5,
  resourceBonus: { grain: 0.6, clothing: 0.75 }
  },
  UA: {
    population: 41_000_000,
    wageLevel: 0.4,
  resourceBonus: { grain: 0.5, clothing: 0.7 }
  },
  MD: {
    population: 2_600_000,
    wageLevel: 0.4,
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
  resourceBonus: props.resourceBonus,
      productionPricing: generateProductionPricing(mapCountry.id, props.wageLevel)
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
function calculateBaseSellPrice(_country: Country, good: Good): number {
  // Now static: base price directly used (already scaled); optional global balancing factor
  return good.basePrice;
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
    money: 15000, // Starting capital
    unlockedCountries: [], // No countries unlocked at start - player chooses at game start
    challengeTargetCountryId: null,
    challengeDeadline: null,
    gameOver: false,
    countries,
    goods,
    markets,
    warehouses: {},
    production: {}, // Initialize empty production
    factories: {},
    roads: {},
    truckLines: {},
    currentDay: 0,
  isPaused: false,
    tickSpeed: 2000 // 2 seconds per day
  };
}
