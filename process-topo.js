import fs from 'fs';
import { feature } from 'topojson-client';

const topoData = JSON.parse(fs.readFileSync('europe-topo.json', 'utf8'));
const countries = feature(topoData, topoData.objects.countries);

// Map country names to codes
const countryMap = {
  'Norway': 'NO',
  'Sweden': 'SE',
  'Finland': 'FI',
  'France': 'FR',
  'Germany': 'DE',
  'United Kingdom': 'GB',
  'Italy': 'IT',
  'Spain': 'ES',
  'Poland': 'PL',
  'Romania': 'RO',
  'Netherlands': 'NL',
  'Belgium': 'BE',
  'Luxembourg': 'LU',
  'Greece': 'GR',
  'Portugal': 'PT',
  'Czechia': 'CZ',
  'Czech Republic': 'CZ',
  'Hungary': 'HU',
  'Austria': 'AT',
  'Bulgaria': 'BG',
  'Denmark': 'DK',
  'Slovakia': 'SK',
  'Ireland': 'IE',
  'Croatia': 'HR',
  'Bosnia and Herzegovina': 'BA',
  'Bosnia and Herz.': 'BA',
  'Lithuania': 'LT',
  'Slovenia': 'SI',
  'Latvia': 'LV',
  'Estonia': 'EE',
  'Switzerland': 'CH',
  'Serbia': 'RS',
  'Kosovo': 'RS', // Merge Kosovo into Serbia
  'Albania': 'AL',
  'North Macedonia': 'MK',
  'Macedonia': 'MK',
  'Montenegro': 'ME',
  'Belarus': 'BY',
  'Ukraine': 'UA',
  'Moldova': 'MD'
};

// Neighbor relationships
const neighbors = {
  'FR': ['DE', 'BE', 'LU', 'IT', 'CH', 'ES'],
  'DE': ['FR', 'BE', 'LU', 'NL', 'DK', 'PL', 'CZ', 'AT', 'CH'],
  'GB': ['IE'],
  'IT': ['FR', 'CH', 'AT', 'SI', 'HR'],
  'ES': ['FR', 'PT'],
  'PL': ['DE', 'CZ', 'SK', 'UA', 'BY', 'LT'],
  'RO': ['HU', 'RS', 'BG', 'UA', 'MD'],
  'NL': ['DE', 'BE'],
  'BE': ['FR', 'DE', 'LU', 'NL'],
  'LU': ['FR', 'DE', 'BE'],
  'GR': ['AL', 'MK', 'BG'],
  'PT': ['ES'],
  'CZ': ['DE', 'PL', 'SK', 'AT'],
  'HU': ['AT', 'SK', 'UA', 'RO', 'RS', 'HR', 'SI'],
  'SE': ['NO', 'FI'],
  'AT': ['DE', 'CZ', 'SK', 'HU', 'SI', 'IT', 'CH'],
  'BG': ['RO', 'RS', 'MK', 'GR'],
  'DK': ['DE'],
  'FI': ['NO', 'SE'],
  'SK': ['CZ', 'PL', 'UA', 'HU', 'AT'],
  'IE': ['GB'],
  'HR': ['SI', 'HU', 'RS', 'BA', 'ME'],
  'BA': ['HR', 'RS', 'ME'],
  'LT': ['LV', 'BY', 'PL'],
  'SI': ['IT', 'AT', 'HU', 'HR'],
  'LV': ['EE', 'LT', 'BY'],
  'EE': ['LV'],
  'NO': ['SE', 'FI'],
  'CH': ['FR', 'DE', 'AT', 'IT'],
  'RS': ['HU', 'RO', 'BG', 'MK', 'BA', 'HR', 'ME', 'AL'],
  'AL': ['GR', 'MK', 'ME', 'RS'],
  'MK': ['GR', 'AL', 'RS', 'BG'],
  'ME': ['HR', 'BA', 'RS', 'AL'],
  'BY': ['PL', 'LT', 'LV', 'UA'],
  'UA': ['PL', 'SK', 'HU', 'RO', 'MD', 'BY'],
  'MD': ['RO', 'UA']
};

function calculateCentroid(coords) {
  let sumLon = 0, sumLat = 0, count = 0;
  
  function addPoints(c) {
    if (typeof c[0] === 'number') {
      sumLon += c[0];
      sumLat += c[1];
      count++;
    } else {
      c.forEach(addPoints);
    }
  }
  
  addPoints(coords);
  return [Number((sumLon / count).toFixed(2)), Number((sumLat / count).toFixed(2))];
}

function simplifyCoords(coords, precision = 2) {
  if (typeof coords[0] === 'number') {
    return [Number(coords[0].toFixed(precision)), Number(coords[1].toFixed(precision))];
  }
  return coords.map(c => simplifyCoords(c, precision));
}

const processedCountries = [];
const countryPolygons = {}; // Store polygons by country code

countries.features.forEach(feature => {
  const name = feature.properties.name;
  const code = countryMap[name];
  
  if (!code) return;
  
  let coordinates;
  if (feature.geometry.type === 'Polygon') {
    coordinates = [simplifyCoords(feature.geometry.coordinates[0])];
  } else if (feature.geometry.type === 'MultiPolygon') {
    // Include all polygons for multi-polygon countries
    coordinates = feature.geometry.coordinates.map(poly => simplifyCoords(poly[0]));
  }
  
  if (coordinates && coordinates[0].length > 2) {
    // Merge polygons for countries with same code (LU->BE, XK->RS)
    if (!countryPolygons[code]) {
      countryPolygons[code] = {
        name: name,
        polygons: []
      };
    }
    // Keep the primary country name (Belgium not Luxembourg, Serbia not Kosovo)
    if (name !== 'Luxembourg' && name !== 'Kosovo') {
      countryPolygons[code].name = name;
    }
    countryPolygons[code].polygons.push(...coordinates);
  }
});

// Convert merged polygons to final format
Object.keys(countryPolygons).forEach(code => {
  const data = countryPolygons[code];
  processedCountries.push({
    id: code,
    name: data.name,
    neighbors: neighbors[code] || [],
    coordinates: data.polygons,
    centroid: calculateCentroid(data.polygons)
  });
});

processedCountries.sort((a, b) => a.id.localeCompare(b.id));

fs.writeFileSync('europe-new.json', JSON.stringify(processedCountries, null, 2));
console.log(`✓ Processed ${processedCountries.length} countries`);
console.log('Countries:', processedCountries.map(c => c.id).join(', '));
