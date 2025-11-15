import fs from 'fs';

const data = JSON.parse(fs.readFileSync('ne-countries.json', 'utf8'));

// European countries we want to include
const europeanCountries = {
  'France': 'FR',
  'Germany': 'DE',
  'United Kingdom': 'GB',
  'Italy': 'IT',
  'Spain': 'ES',
  'Poland': 'PL',
  'Romania': 'RO',
  'Netherlands': 'NL',
  'Belgium': 'BE',
  'Greece': 'GR',
  'Portugal': 'PT',
  'Czech Republic': 'CZ',
  'Hungary': 'HU',
  'Sweden': 'SE',
  'Austria': 'AT',
  'Bulgaria': 'BG',
  'Denmark': 'DK',
  'Finland': 'FI',
  'Slovakia': 'SK',
  'Ireland': 'IE',
  'Croatia': 'HR',
  'Bosnia and Herzegovina': 'BA',
  'Lithuania': 'LT',
  'Slovenia': 'SI',
  'Latvia': 'LV',
  'Estonia': 'EE',
  'Norway': 'NO',
  'Switzerland': 'CH',
  'Serbia': 'RS',
  'Albania': 'AL',
  'North Macedonia': 'MK',
  'Montenegro': 'ME',
  'Luxembourg': 'LU',
  'Kosovo': 'XK',
  'Belarus': 'BY',
  'Ukraine': 'UA',
  'Moldova': 'MD'
};

// Define neighbors for each country
const neighbors = {
  'FR': ['DE', 'LU', 'BE', 'IT', 'CH', 'ES'],
  'DE': ['FR', 'LU', 'BE', 'NL', 'DK', 'PL', 'CZ', 'AT', 'CH'],
  'GB': ['IE'],
  'IT': ['FR', 'CH', 'AT', 'SI', 'HR'],
  'ES': ['FR', 'PT'],
  'PL': ['DE', 'CZ', 'SK', 'UA', 'BY', 'LT'],
  'RO': ['HU', 'RS', 'BG', 'UA', 'MD'],
  'NL': ['DE', 'BE'],
  'BE': ['FR', 'LU', 'DE', 'NL'],
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
  'RS': ['HU', 'RO', 'BG', 'MK', 'BA', 'HR', 'ME', 'AL', 'XK'],
  'AL': ['GR', 'MK', 'XK', 'ME', 'RS'],
  'MK': ['GR', 'AL', 'XK', 'RS', 'BG'],
  'ME': ['HR', 'BA', 'RS', 'XK', 'AL'],
  'LU': ['FR', 'DE', 'BE'],
  'XK': ['RS', 'MK', 'AL', 'ME'],
  'BY': ['PL', 'LT', 'LV', 'UA'],
  'UA': ['PL', 'SK', 'HU', 'RO', 'MD', 'BY'],
  'MD': ['RO', 'UA']
};

function simplifyCoordinates(coords, precision = 2) {
  if (!Array.isArray(coords)) return coords;
  if (typeof coords[0] === 'number') {
    return [Number(coords[0].toFixed(precision)), Number(coords[1].toFixed(precision))];
  }
  return coords.map(c => simplifyCoordinates(c, precision));
}

function calculateCentroid(coordinates) {
  let sumLon = 0, sumLat = 0, count = 0;
  
  function processCoords(coords) {
    if (typeof coords[0] === 'number') {
      sumLon += coords[0];
      sumLat += coords[1];
      count++;
    } else {
      coords.forEach(c => processCoords(c));
    }
  }
  
  processCoords(coordinates);
  return [Number((sumLon / count).toFixed(2)), Number((sumLat / count).toFixed(2))];
}

const processedCountries = [];

data.features.forEach(feature => {
  const name = feature.properties.NAME || feature.properties.name || feature.properties.ADMIN;
  const code = europeanCountries[name];
  
  if (!code) return;
  
  let coordinates;
  if (feature.geometry.type === 'Polygon') {
    coordinates = [simplifyCoordinates(feature.geometry.coordinates[0])];
  } else if (feature.geometry.type === 'MultiPolygon') {
    // Take the largest polygon
    let largestPolygon = feature.geometry.coordinates[0][0];
    let largestArea = 0;
    
    feature.geometry.coordinates.forEach(polygon => {
      const area = polygon[0].length;
      if (area > largestArea) {
        largestArea = area;
        largestPolygon = polygon[0];
      }
    });
    coordinates = [simplifyCoordinates(largestPolygon)];
  }
  
  if (coordinates && coordinates[0].length > 2) {
    const centroid = calculateCentroid(coordinates);
    
    processedCountries.push({
      id: code,
      name: name,
      neighbors: neighbors[code] || [],
      coordinates: coordinates,
      centroid: centroid
    });
  }
});

// Sort by country code
processedCountries.sort((a, b) => a.id.localeCompare(b.id));

fs.writeFileSync('europe-clean.json', JSON.stringify(processedCountries, null, 2));
console.log(`Processed ${processedCountries.length} European countries`);
console.log('Countries:', processedCountries.map(c => c.id).join(', '));
