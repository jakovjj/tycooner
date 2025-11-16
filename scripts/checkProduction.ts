import { createInitialGameState } from '../src/data/initialGameState.ts';
import type { GameState, ProductionBuildingInstance } from '../src/types/game.ts';
import { simulateTick } from '../src/context/GameContext.tsx';

function makeStateWithFacilities(count: number): GameState {
  const base = createInitialGameState();
  const countryId = 'FR';
  const farmBuildings: ProductionBuildingInstance[] = Array.from({ length: count }, () => ({ type: 'farm', outputPerDay: 1 }));
  return {
    ...base,
    unlockedCountries: [countryId],
    warehouses: {
      ...base.warehouses,
      [countryId]: {
        countryId,
        level: 1,
        capacity: 60,
        storage: {}
      }
    },
    production: {
      ...base.production,
      [countryId]: {
        countryId,
        buildings: {
          farm: farmBuildings,
          factory: [],
          ranch: []
        }
      }
    }
  } as GameState;
}

const testState = makeStateWithFacilities(1);
const after = simulateTick(testState);
console.log('Grain after one day:', after.warehouses['FR'].storage['grain']);
