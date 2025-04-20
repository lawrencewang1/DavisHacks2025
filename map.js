document.addEventListener('DOMContentLoaded', function() {
  // Initialize map
  const calBounds = L.latLngBounds(
    [30, -126],  // Southwest (includes San Diego)
    [42, -113.5] // Northeast (gives enough room above Klamath Falls)
  );

  const map = L.map('map', {
    zoomControl: true,
    dragging: true,
    scrollWheelZoom: true,
    doubleClickZoom: true,
    boxZoom: true,
    touchZoom: true,
    attributionControl: true,
    minZoom: 5.6,
    maxZoom: 9,
    maxBounds: calBounds,
    worldCopyJump: true,
    maxBoundsViscosity: 0.5
  }).setView([37.5, -119.5], 5.65);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 9,
    minZoom: 5
  }).addTo(map);

  // Create custom control for map legend
  const legend = L.control({ position: 'bottomright' });
  legend.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'info legend');
    div.style.backgroundColor = 'white';
    div.style.padding = '10px';
    div.style.borderRadius = '4px';
    div.style.boxShadow = '0 1px 5px rgba(0,0,0,0.2)';23.3
    
    div.innerHTML = '<h4 style="margin-top:0;margin-bottom:10px;font-size:14px;font-weight:600;">Data Legend</h4>' +
      '<div style="display:flex;align-items:center;margin-bottom:5px;"><span style="display:inline-block;width:15px;height:15px;margin-right:5px;background-color:#d4eaff;"></span> Lower</div>' +
      '<div style="display:flex;align-items:center;margin-bottom:5px;"><span style="display:inline-block;width:15px;height:15px;margin-right:5px;background-color:#7fb3ec;"></span> Medium</div>' +
      '<div style="display:flex;align-items:center;"><span style="display:inline-block;width:15px;height:15px;margin-right:5px;background-color:#2171b5;"></span> Higher</div>';
    
    return div;
  };
  legend.addTo(map);

  // Create a div for the side panel popup
  const sidePanel = document.createElement('div');
  sidePanel.id = 'county-side-panel';
  sidePanel.style.display = 'none';
  document.body.appendChild(sidePanel);

  // Close button for the side panel
  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.className = 'close-button';
  closeButton.addEventListener('click', () => {
    sidePanel.style.display = 'none';
  });
  sidePanel.appendChild(closeButton);

  fetch('california-counties.geojson') // Load counties + interactivity
  .then(res => res.json())
  .then(data => {
    // Define map and initial geoJSON layer
    const geoJSONLayer = L.geoJSON(data, {
      style: getCountyStyle,
      onEachFeature: function(feature, layer) {
        const countyName = feature.properties.name || feature.properties.NAME || 'Unknown County';
        layer.bindTooltip(countyName, {
          permanent: false,
          direction: 'center',
          className: 'county-tooltip',
          offset: [0, 0]
        });

        layer.on({
          click: onCountyClick,
          mouseover: function(e) {
            if (layer !== highlightedLayer) {
              layer.setStyle({
                weight: 2,
                color: '#4a5568',
                fillOpacity: 0.75
              });

              if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                layer.bringToFront();
              }
            }
          },
          mouseout: function(e) {
            if (layer !== highlightedLayer) {
              geoJSONLayer.resetStyle(layer);
            }
          }
        });
      }
    }).addTo(map);
    
    function getSelectedDataType() {
      return document.getElementById('data-toggle').value;
    }
    // Function to handle county clicks
    function onCountyClick(e) {
      const props = e.target.feature.properties;
      const countyName = props.name || props.NAME || 'Unknown County';

      sidePanel.innerHTML = '';
      sidePanel.appendChild(closeButton);

      const title = document.createElement('h2');
      title.textContent = countyName;
      sidePanel.appendChild(title);

      const detailsContainer = document.createElement('div');
      detailsContainer.className = 'county-details';

      // Display county information
      const createDetailItem = (label, value) => {
        const item = document.createElement('div');
        item.className = 'detail-item';
        item.innerHTML = `<strong>${label}:</strong> <span class="detail-value">${value}</span>`;
        return item;
      };

      Object.entries(props).forEach(([key, value]) => {
        if (key !== 'name' && key !== 'NAME') {
          detailsContainer.appendChild(createDetailItem(key, value));
        }
      });

      sidePanel.appendChild(detailsContainer);

      const dataMessage = document.createElement('div');
      dataMessage.className = 'data-visualization';
      dataMessage.innerHTML = `
        <h3>Selected Data: <span id="current-data-type">${getSelectedDataType()}</span></h3>
        <p>Data value would be displayed here based on the selected option.</p>
      `;
      sidePanel.appendChild(dataMessage);

      sidePanel.style.display = 'block';

      resetHighlight();
      highlightCounty(e.target);
    }

    let highlightedLayer = null;

    function highlightCounty(layer) {
      highlightedLayer = layer;
      layer.setStyle({
        weight: 3,
        color: '#2c5282',
        fillOpacity: 0.7,
        fillColor: '#3182ce'
      });

      if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
      }
    }

    function resetHighlight() {
      if (highlightedLayer) {
        geoJSONLayer.resetStyle(highlightedLayer);
      }
    }

    // Default style for counties (before data is loaded)
    function getCountyStyle(feature) {
      return {
        fillColor: '#a0c8e6',
        weight: 1,
        opacity: 0.8,
        color: '#a0aec0',
        fillOpacity: 0.5
      };
    }

    // Function to update map styles based on data type (funding or scores)
    function updateMapStyles(dataDict, selectedKey, toggleValue) {
      geoJSONLayer.eachLayer(layer => {
          const countyName = layer.feature.properties.name || layer.feature.properties.NAME;
          const countyData = dataDict[countyName];
  
          // Handle both flat and nested dictionary structures
          let value;
          if (countyData !== undefined) {
              // If the countyData is a nested object (like from testing_map)
              if (typeof countyData === 'object' && countyData[selectedKey] !== undefined) {
                  value = countyData[selectedKey];
              } 
              // If the countyData is a direct value (like from funding_map)
              else if (typeof countyData !== 'object' && selectedKey === 'value') {
                  value = countyData;
              }
          }
  
          if (value !== undefined) {
              // Get the appropriate color based on the toggle value
              const fillColor = toggleValue === 'funding'
                  ? getFundingColor(value)
                  : getTestingColor(value);
  
              layer.setStyle({
                  fillColor: fillColor,
                  fillOpacity: 0.7,
                  color: '#4a5568',
                  weight: 1
              });
  
              // Update properties with current data (optional for showing in the sidebar)
              if (typeof countyData === 'object') {
                  Object.assign(layer.feature.properties, countyData);
              } else {
                  layer.feature.properties.value = countyData;
              }
          }
      });
  }

    // Function to handle color gradients for funding
    function getFundingColor(value) {
      return value > 15000 ? '#00441b' :
             value > 12000 ? '#238b45' :
             value > 9000  ? '#66c2a4' :
                            '#ccece6';
    }

    // Function to handle color gradients for testing/scores
    function getTestingColor(value) {
      return value > 130 ? '#08306b' :
             value > 100 ? '#2171b5' :
             value > 70  ? '#6baed6' :
                           '#deebf7';
    }

    // Initial toggle value (you can set this to 'funding' or 'scores' as default)
    const initialToggleValue = 'funding'; // Set the default value here
    document.getElementById('data-toggle').value = initialToggleValue;

    // Fetch and apply the data and styles when the page loads
    fetch('/map/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ toggle_value: initialToggleValue })
    })
    .then(res => res.json())
    .then(data => {
      const metricKey = initialToggleValue === 'scores' ? 'Value' : 'Expense per ADA';
      updateMapStyles(data, metricKey, initialToggleValue);
    })
    .catch(err => {
      console.error('Error fetching map data:', err);
      alert('Failed to load data. Please try again.');
    });

    // Toggle event listener for the user interaction
    document.getElementById('data-toggle').addEventListener('change', e => {
      const selected = e.target.value;  // 'funding' or 'scores'
      const currentDataType = document.getElementById('current-data-type');
      if (currentDataType) currentDataType.textContent = selected;

      fetch('/map/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ toggle_value: selected })
      })
      .then(res => res.json())
      .then(data => {
        const metricKey = selected === 'scores' ? 'Value' : 'Expense per ADA';
        updateMapStyles(data, metricKey, selected);
      })
      .catch(err => {
        console.error('Error fetching map data:', err);
        alert('Failed to load data. Please try again.');
      });
    });
  })
  .catch(error => {
    console.error('Error loading GeoJSON data:', error);
    alert('Failed to load the California counties map. Please check your connection and try again.');
  });
});
