const map = L.map('map', {
  zoomControl: false,
  dragging: false,
  scrollWheelZoom: false,
  doubleClickZoom: false,
  boxZoom: false,
  touchZoom: false,
  attributionControl: false
}).setView([37.5, -119.5], 6);

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  maxZoom: 6,
  minZoom: 6
}).addTo(map);

// Load county outlines (you must provide a local or hosted GeoJSON file)
fetch('california-counties.geojson')
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      style: {
        color: '#555',
        weight: 1,
        fillOpacity: 0.2,
        fillColor: '#cccccc'
      }
    }).addTo(map);
  });

// Placeholder for dropdown functionality
document.getElementById('data-toggle').addEventListener('change', e => {
  const selected = e.target.value;
  console.log(`Switched to: ${selected}`);
  // You'd call your backend or color logic here
});
