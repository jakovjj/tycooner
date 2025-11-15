// Simplified Europe map data with country polygons
// This is a minimal GeoJSON-like structure for initial countries

export interface CountryFeature {
  id: string;
  name: string;
  neighbors: string[];
  // Simplified SVG path (approximate shapes for demo purposes)
  path: string;
  // Centroid for labels and connections
  centroid: [number, number]; // [x, y]
}

// ViewBox: 0 0 1000 800 (approximate Europe bounds)
export const europeCountries: CountryFeature[] = [
  {
    id: 'DE',
    name: 'Germany',
    neighbors: ['FR', 'PL', 'IT'],
    path: 'M 500 350 L 550 340 L 560 370 L 580 390 L 570 420 L 540 430 L 520 410 L 490 400 Z',
    centroid: [535, 385]
  },
  {
    id: 'FR',
    name: 'France',
    neighbors: ['DE', 'IT', 'ES'],
    path: 'M 420 400 L 490 390 L 500 420 L 480 460 L 450 480 L 410 470 L 390 440 Z',
    centroid: [445, 430]
  },
  {
    id: 'IT',
    name: 'Italy',
    neighbors: ['FR', 'DE'],
    path: 'M 520 480 L 540 450 L 560 470 L 570 510 L 560 550 L 540 580 L 530 560 L 520 520 Z',
    centroid: [545, 515]
  },
  {
    id: 'PL',
    name: 'Poland',
    neighbors: ['DE'],
    path: 'M 580 300 L 640 290 L 660 310 L 670 340 L 650 370 L 600 380 L 580 360 L 570 330 Z',
    centroid: [620, 330]
  },
  {
    id: 'ES',
    name: 'Spain',
    neighbors: ['FR'],
    path: 'M 320 500 L 390 490 L 410 520 L 400 560 L 360 580 L 320 570 L 300 540 Z',
    centroid: [355, 535]
  },
  {
    id: 'GB',
    name: 'United Kingdom',
    neighbors: ['FR'],
    path: 'M 380 280 L 420 270 L 440 290 L 450 320 L 430 350 L 400 340 L 370 310 Z',
    centroid: [410, 305]
  }
];

export const mapViewBox = {
  minX: 0,
  minY: 0,
  width: 1000,
  height: 800
};
