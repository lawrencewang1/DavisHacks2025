// Example funding data
const fundingData = {
  "Los Angeles": 32000000,
  "Alameda": 15000000,
  "San Francisco": 40000000,
  "Modoc": 1000000,
  // add more as needed
};

const lowThreshold = 5000000;
const midThreshold = 20000000;

function getColor(funding) {
  if (funding < lowThreshold) return "#ff4d4d"; // red
  if (funding < midThreshold) return "#ffd11a"; // yellow
  return "#4dff4d"; // green
}

const map = L.map('map').setView([37.5, -119.5], 6); // centered on California

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data © OpenStreetMap contributors'
}).addTo(map);

// Load GeoJSON (from local file or remote URL)
fetch('california-counties.geojson') // Make sure this file is in your project folder!
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      style: feature => {
        const countyName = feature.properties.name;
        const funding = fundingData[countyName] || 0;
        return {
          fillColor: getColor(funding),
          weight: 1,
          color: "#333",
          fillOpacity: 0.7
        };
      },
      onEachFeature: (feature, layer) => {
        const name = feature.properties.name;
        const funding = fundingData[name] || 0;
        layer.bindPopup(`<strong>${name} County</strong><br>Funding: $${funding.toLocaleString()}`);
      }
    }).addTo(map);
  });
