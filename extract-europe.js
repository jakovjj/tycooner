import fs from 'fs';

// Read the GeoJSON file
const data = JSON.parse(fs.readFileSync('ne-detailed.json', 'utf8'));

// Countries we want (by ISO code)
const europeanCountries = {
  'GB': 'United Kingdom',
  'FR': 'France',
  'DE': 'Germany',
  'IT': 'Italy',
  'ES': 'Spain',
  'PL': 'Poland',
  'PT': 'Portugal',
  'NL': 'Netherlands',
  'BE': 'Belgium',
  'CH': 'Switzerland',
  'AT': 'Austria',
  'CZ': 'Czech Republic',
  'SE': 'Sweden',
  'NO': 'Norway',
  'FI': 'Finland',
  'DK': 'Denmark',
  'GR': 'Greece',
  'RO': 'Romania',
  'HU': 'Hungary',
  'SK': 'Slovakia',
  'BG': 'Bulgaria',
  'HR': 'Croatia',
  'SI': 'Slovenia',
  'LT': 'Lithuania',
  'LV': 'Latvia',
  'EE': 'Estonia',
  'IE': 'Ireland',
  'RS': 'Serbia',
  'BA': 'Bosnia and Herzegovina',
  'AL': 'Albania',
  'MK': 'North Macedonia',
  'ME': 'Montenegro',
  'LU': 'Luxembourg',
  'XK': 'Kosovo',
  'BY': 'Belarus',
  'UA': 'Ukraine',
  'MD': 'Moldova'
};

// Check if coordinates are within Europe bounds
function isInEurope(lon, lat) {
  return lon >= -25 && lon <= 45 && lat >= 34 && lat <= 72;
}

// Extract European countries
const europeFeatures = data.features.filter(f => {
  const code = f.properties['ISO_A2'] || f.properties['iso_a2'] || f.properties['WB_A2'];
  const name = f.properties.name || f.properties.NAME || f.properties.ADMIN;
  const adm0_a3 = f.properties.ADM0_A3;
  
  // Check by name for countries with -99 codes
  if (name === 'France' && adm0_a3 === 'FRA') return true;
  if (name === 'Norway' && adm0_a3 === 'NOR') return true;
  if (name === 'Kosovo' || code === 'XK') return true;
  
  // Exclude Cyprus
  if (name && name.toLowerCase().includes('cyprus')) return false;
  if (code === 'CY' || adm0_a3 === 'CYP') return false;
  
  // Check by ISO code
  if (europeanCountries[code]) return true;
  
  return false;
});

// Simplify coordinates (Douglas-Peucker algorithm - simple version)
function simplifyCoordinates(coords, tolerance = 0.05) {
  if (coords.length <= 50) return coords;
  
  // Take every nth point to reduce complexity
  const step = Math.max(1, Math.floor(coords.length / 100));
  const simplified = [];
  
  for (let i = 0; i < coords.length; i += step) {
    simplified.push(coords[i]);
  }
  
  // Always include first and last point
  if (simplified[simplified.length - 1] !== coords[coords.length - 1]) {
    simplified.push(coords[coords.length - 1]);
  }
  
  return simplified;
}

// Process features
const output = europeFeatures.map(feature => {
  const code = feature.properties['ISO_A2'] || feature.properties['iso_a2'] || feature.properties['WB_A2'];
  const name = feature.properties.name || feature.properties.NAME || feature.properties.ADMIN;
  const adm0_a3 = feature.properties.ADM0_A3;
  
  let id = code;
  
  // Handle special cases with -99 codes
  if (adm0_a3 === 'FRA') id = 'FR';
  if (adm0_a3 === 'NOR') id = 'NO';
  if (name === 'Kosovo') id = 'XK';
  if (name === 'Moldova') id = 'MD';
  
  const displayName = europeanCountries[id] || name;
  
  // Get coordinates - handle MultiPolygon for territories
  let allPolygons = [];
  
  if (feature.geometry.type === 'Polygon') {
    const poly = feature.geometry.coordinates[0];
    // Only include if in Europe
    if (poly.some(coord => isInEurope(coord[0], coord[1]))) {
      allPolygons = [poly];  // Keep all coordinates for proper borders
    }
  } else if (feature.geometry.type === 'MultiPolygon') {
    // Keep only polygons within Europe boundaries
    feature.geometry.coordinates.forEach(poly => {
      const coords = poly[0];
      if (coords.some(coord => isInEurope(coord[0], coord[1]))) {
        if (coords.length > 10) { // Minimum size to avoid tiny islands
          allPolygons.push(coords);  // Keep all coordinates
        }
      }
    });
  }
  
  if (allPolygons.length === 0) return null;
  
  // Simplify each polygon
  const coordinates = allPolygons.map(poly => simplifyCoordinates(poly));
  
  // Calculate centroid from all coordinates
  let sumLon = 0, sumLat = 0, totalPoints = 0;
  coordinates.forEach(polygon => {
    polygon.forEach(coord => {
      sumLon += coord[0];
      sumLat += coord[1];
      totalPoints++;
    });
  });
  
  const centroid = [
    Math.round(sumLon / totalPoints * 10) / 10,
    Math.round(sumLat / totalPoints * 10) / 10
  ];
  
  return {
    id,
    name: displayName,
    coordinates: coordinates.map(polygon => 
      polygon.map(c => [
        Math.round(c[0] * 100) / 100,
        Math.round(c[1] * 100) / 100
      ])
    ),
    centroid
  };
});

// Write output - merge countries with same ID
const merged = {};
output.filter(c => c !== null).forEach(country => {
  if (merged[country.id]) {
    // Merge coordinates
    merged[country.id].coordinates.push(...country.coordinates);
  } else {
    merged[country.id] = country;
  }
});

const finalOutput = Object.values(merged);
fs.writeFileSync('europe-processed.json', JSON.stringify(finalOutput, null, 2));
console.log('Processed countries:', finalOutput.map(c => c.name).sort().join(', '));
console.log('Total countries:', finalOutput.length);
