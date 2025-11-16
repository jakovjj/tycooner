// Core game types for Tycooner

export interface Position {
  x: number;
  y: number;
}

export type GoodCategory = 'food' | 'raw' | 'manufactured' | 'consumer' | 'luxury';

export interface Good {
  id: string;
  name: string;
  category: GoodCategory;
  basePrice: number;
  laborIntensity: number; // 0-1
  resourceIntensity: number; // 0-1
}

export interface Market {
  countryId: string;
  goodId: string;
  productionCost: number;
  baseSellPrice: number;
  maxDailyDemand: number;
  currentSupply: number;
  currentPrice: number;
}

export interface Warehouse {
  countryId: string;
  level: number;
  capacity: number;
  storage: Record<string, number>; // goodId -> amount
}

export type ProductionType = 'farm' | 'factory' | 'ranch';

export interface ProductionBuildingInstance {
  type: ProductionType;
  outputPerDay: number; // per building output
}

export interface CountryProduction {
  countryId: string;
  buildings: Record<ProductionType, ProductionBuildingInstance[]>; // multiple per type
}

export interface ProductionPricing {
  // Resource sell prices in this country
  grainSellPrice: number;
  clothingSellPrice: number;
  meatSellPrice: number;
  
  // Building costs for this country
  farmBuildCost: number;
  farmUpgradeCost: number;
  factoryBuildCost: number;
  factoryUpgradeCost: number;
  ranchBuildCost: number;
  ranchUpgradeCost: number;
}

export interface Factory {
  id: string;
  countryId: string;
  goodId: string;
  level: number;
  outputPerDay: number;
}

export interface Road {
  id: string;
  fromCountryId: string;
  toCountryId: string;
  distance: number;
  level: number;
}

export interface TruckLine {
  id: string;
  roadId: string;
  fromCountryId: string;
  toCountryId: string;
  goodId: string;
  trucksAssigned: number;
  capacityPerTruck: number;
}

export interface Country {
  id: string;
  name: string;
  position: Position;
  neighbors: string[];
  population: number;
  wageLevel: number; // multiplier 0.5 - 2.0
  // incomeLevel removed per new pricing model
  resourceBonus: Record<string, number>; // goodId -> bonus multiplier
  productionPricing?: ProductionPricing; // Per-country pricing for production
}

export interface GameState {
  money: number;
  unlockedCountries: string[]; // Array of unlocked country IDs
  challengeTargetCountryId: string | null;
  challengeDeadline: number | null;
  gameOver: boolean;
  countries: Record<string, Country>;
  goods: Record<string, Good>;
  markets: Record<string, Market>; // key: `${countryId}-${goodId}`
  warehouses: Record<string, Warehouse>; // key: countryId
  production: Record<string, CountryProduction>; // key: countryId
  factories: Record<string, Factory>; // key: factoryId
  roads: Record<string, Road>; // key: roadId
  truckLines: Record<string, TruckLine>; // key: truckLineId
  currentDay: number;
  isPaused: boolean;
  tickSpeed: number; // ms per day
}

export interface CountryGeoData {
  id: string;
  name: string;
  path: string; // SVG path data
  centroid: Position;
}
