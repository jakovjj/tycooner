import fs from 'fs';

// Source of truth for map data
// Switched to europe-final.json so manual removals (e.g., Luxembourg) take effect
const data = JSON.parse(fs.readFileSync('europe-final.json', 'utf8'));

let tsContent = `// Real geographic data from Natural Earth dataset
// High-quality country boundaries for European countries

export interface CountryGeoFeature {
  id: string;
  name: string;
  neighbors: string[];
  coordinates: number[][][];
  centroid: number[];
}

export const europeCountriesGeo: CountryGeoFeature[] = [\n`;

data.forEach((country, idx) => {
  tsContent += `  {\n`;
  tsContent += `    id: '${country.id}',\n`;
  tsContent += `    name: '${country.name}',\n`;
  tsContent += `    neighbors: [${country.neighbors.map(n => `'${n}'`).join(', ')}],\n`;
  tsContent += `    coordinates: [\n`;
  
  country.coordinates.forEach((polygon, polygonIdx) => {
    tsContent += `      [\n`;
    polygon.forEach((coord, i) => {
      tsContent += `        [${coord[0]}, ${coord[1]}]`;
      if (i < polygon.length - 1) tsContent += ',';
      tsContent += '\n';
    });
    tsContent += `      ]`;
    if (polygonIdx < country.coordinates.length - 1) tsContent += ',';
    tsContent += '\n';
  });
  
  tsContent += `    ],\n`;
  tsContent += `    centroid: [${country.centroid[0]}, ${country.centroid[1]}]\n`;
  tsContent += `  }`;
  if (idx < data.length - 1) tsContent += ',';
  tsContent += '\n';
});

tsContent += `];\n\n`;

tsContent += `export function calculateMapBounds() {
  let minLon = Infinity, maxLon = -Infinity;
  let minLat = Infinity, maxLat = -Infinity;

  europeCountriesGeo.forEach(country => {
    country.coordinates[0].forEach(([lon, lat]) => {
      minLon = Math.min(minLon, lon);
      maxLon = Math.max(maxLon, lon);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    });
  });

  const padding = 1;
  return {
    minLon: minLon - padding,
    maxLon: maxLon + padding,
    minLat: minLat - padding,
    maxLat: maxLat + padding,
    width: (maxLon - minLon) + (padding * 2),
    height: (maxLat - minLat) + (padding * 2),
  };
}

export function coordinatesToPath(coordinates: number[][][]): string {
  return coordinates.map(polygon => {
    const pathData = polygon.map((point, index) => {
      const [lon, lat] = point;
      const command = index === 0 ? 'M' : 'L';
      return \`\${command}\${lon},\${-lat}\`;
    }).join(' ');
    return pathData + ' Z';
  }).join(' ');
}
`;

fs.writeFileSync('src/data/europeMapGeo.ts', tsContent);
console.log('Generated TypeScript file with real geographic data!');
