import type { Good, GoodCategory } from '../types/game';

export interface ResourceMeta {
  id: string;
  name: string;
  emoji: string;
  category: GoodCategory;
  basePrice: number;
  laborIntensity: number;
  resourceIntensity: number;
  color: string;
}

const BASE_RESOURCES: ResourceMeta[] = [
  {
    id: 'grain',
    name: 'Grain',
    emoji: '🌾',
    category: 'food',
    basePrice: 100,
    laborIntensity: 0.3,
    resourceIntensity: 0.7,
    color: '#E4B100'
  },
  {
    id: 'clothing',
    name: 'Clothing',
    emoji: '👕',
    category: 'consumer',
    basePrice: 126,
    laborIntensity: 0.6,
    resourceIntensity: 0.4,
    color: '#9AA5B3'
  },
  {
    id: 'meat',
    name: 'Meat',
    emoji: '🥩',
    category: 'food',
    basePrice: 100,
    laborIntensity: 0.4,
    resourceIntensity: 0.6,
    color: '#E56970'
  },
  {
    id: 'consumerGoods',
    name: 'Consumer Goods',
    emoji: '📦',
    category: 'consumer',
    basePrice: 100,
    laborIntensity: 0.7,
    resourceIntensity: 0.4,
    color: '#F59E0B'
  },
  {
    id: 'electronics',
    name: 'Electronics',
    emoji: '💻',
    category: 'manufactured',
    basePrice: 200,
    laborIntensity: 0.8,
    resourceIntensity: 0.5,
    color: '#6366F1'
  },
  {
    id: 'processedFood',
    name: 'Processed Food',
    emoji: '🍱',
    category: 'food',
    basePrice: 30,
    laborIntensity: 0.5,
    resourceIntensity: 0.6,
    color: '#FB923C'
  }
];

export const RESOURCE_META_MAP: Record<string, ResourceMeta> = BASE_RESOURCES.reduce((acc, resource) => {
  acc[resource.id] = resource;
  return acc;
}, {} as Record<string, ResourceMeta>);

export const RESOURCE_ORDER: string[] = BASE_RESOURCES.map(r => r.id);

export function buildGoodsCatalog(): Record<string, Good> {
  return BASE_RESOURCES.reduce((acc, resource) => {
    acc[resource.id] = {
      id: resource.id,
      name: resource.name,
      category: resource.category,
      basePrice: resource.basePrice,
      laborIntensity: resource.laborIntensity,
      resourceIntensity: resource.resourceIntensity,
      emoji: resource.emoji,
      color: resource.color
    } satisfies Good;
    return acc;
  }, {} as Record<string, Good>);
}

export function getResourceMeta(id: string) {
  return RESOURCE_META_MAP[id];
}
