// Game constants and configuration

export const GAME_CONFIG = {
  // Starting values
  STARTING_MONEY: 50000,
  STARTING_DAY: 0,
  
  // Costs
  WAREHOUSE_BUILD_COST: 5000,
  WAREHOUSE_UPGRADE_MULTIPLIER: 3000,
  FACTORY_BUILD_COST: 10000,
  FACTORY_UPGRADE_MULTIPLIER: 5000,
  ROAD_BUILD_COST: 2000,
  
  // Warehouse
  WAREHOUSE_BASE_CAPACITY: 1000,
  WAREHOUSE_CAPACITY_INCREASE: 500,
  
  // Factory
  FACTORY_BASE_OUTPUT: 50,
  FACTORY_OUTPUT_INCREASE: 30,
  
  // Logistics
  TRUCK_CAPACITY: 100,
  LOGISTICS_COST_PER_UNIT_PER_100KM: 0.1,
  
  // Market dynamics
  PRICE_INCREASE_MAX: 0.5, // +50% when shortage
  PRICE_DECREASE_MAX: 0.5, // -50% when oversupply
  PRODUCTION_COST_MULTIPLIER: 0.5, // Ongoing cost as % of production cost
  
  // Simulation
  DEFAULT_TICK_SPEED: 2000, // ms per day
  TICK_SPEEDS: {
    SLOW: 4000,
    NORMAL: 2000,
    FAST: 1000,
    VERY_FAST: 500
  }
} as const;

export const GOOD_COLORS: Record<string, string> = {
  grain: '#FFC107',
  clothing: '#9E9E9E',
  consumerGoods: '#2196F3',
  electronics: '#9C27B0',
  processedFood: '#FF9800'
};

export const CATEGORY_ICONS: Record<string, string> = {
  food: '🌾',
  raw: '⚙️',
  manufactured: '🏭',
  consumer: '🛍️',
  luxury: '💎'
};
