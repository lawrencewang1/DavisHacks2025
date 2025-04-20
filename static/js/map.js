document.addEventListener('DOMContentLoaded', function () {
  const financeScaleMin = 15000;
  const financeScaleMax = 60000;

  const mapBounds = L.latLngBounds([33, -126], [42, -113.5]);

  const map = L.map('map', {
    zoomControl: true,
    minZoom: 5.6,
    maxZoom: 9,
    maxBounds: mapBounds,
    maxBoundsViscosity: 0.5,
    worldCopyJump: true,
  }).setView([37.5, -119.5], 5.65);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 9,
    minZoom: 5
  }).addTo(map);

  // Legend
  const legend = L.control({ position: 'bottomright' });
  legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'info legend');
    div.style = 'background:white;padding:10px;border-radius:4px;box-shadow:0 1px 5px rgba(0,0,0,0.2)';
    div.innerHTML = `
      <h4 style="margin:0 0 10px;font-size:14px;font-weight:600;">Data Legend</h4>
      <div style="display:flex;align-items:center;margin-bottom:5px;"><span style="width:15px;height:15px;margin-right:5px;background-color:#deebf7;display:inline-block;"></span> Low</div>
      <div style="display:flex;align-items:center;margin-bottom:5px;"><span style="width:15px;height:15px;margin-right:5px;background-color:#6baed6;display:inline-block;"></span> Medium</div>
      <div style="display:flex;align-items:center;"><span style="width:15px;height:15px;margin-right:5px;background-color:#08306b;display:inline-block;"></span> High</div>
    `;
    return div;
  };
  legend.addTo(map);

  // Side panel
  const sidePanel = document.createElement('div');
  sidePanel.id = 'county-side-panel';
  sidePanel.style.display = 'none';
  document.body.appendChild(sidePanel);

  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.className = 'close-button';
  closeButton.onclick = () => sidePanel.style.display = 'none';
  sidePanel.appendChild(closeButton);

  // Helper: get selected data type from toggle
  function getSelectedDataType() {
    return document.getElementById('data-toggle')?.value || 'funding';
  }

  // Color scale (chroma)
  function getColor(value, min, max, colorRange=['#fee5d9', '#fcae91', '#cb181d']) {
    if (value === undefined || isNaN(value)) return '#ccc';
    const scale = chroma.scale(colorRange).domain([min, max]);
    return scale(value).hex();
  }

  // Highlight
  let highlightedLayer = null;

  function highlightCounty(layer) {
    highlightedLayer = layer;
    layer.setStyle({
      weight: 2,
      color: '#2c5282',
      fillOpacity: 0.7,
      fillColor: '#3182ce'
    });
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) layer.bringToFront();
  }

  function resetHighlight() {
    if (highlightedLayer) geoJSONLayer.resetStyle(highlightedLayer);
  }

  // County style (default)
  function getCountyStyle(feature) {
    return {
      fillColor: '#a0c8e6',
      weight: 1,
      opacity: 0.8,
      color: '#a0aec0',
      fillOpacity: 0.5
    };
  }

  // Sidebar on click
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

    Object.entries(props).forEach(([key, value]) => {
      if (key !== 'name' && key !== 'NAME') {
        const item = document.createElement('div');
        item.className = 'detail-item';
        item.innerHTML = `<strong>${key}:</strong> <span class="detail-value">${value}</span>`;
        detailsContainer.appendChild(item);
      }
    });

    sidePanel.appendChild(detailsContainer);

    const dataMessage = document.createElement('div');
    dataMessage.className = 'data-visualization';
    dataMessage.innerHTML = `
      <h3>Selected Data: <span id="current-data-type">${getSelectedDataType()}</span></h3>
    `;
    sidePanel.appendChild(dataMessage);

    sidePanel.style.display = 'block';
    resetHighlight();
    highlightCounty(e.target);
  }

  let geoJSONLayer;

  // Load counties
  fetch('/static/data/california-counties.geojson')
    .then(res => res.json())
    .then(data => {
      geoJSONLayer = L.geoJSON(data, {
        style: getCountyStyle,
        onEachFeature: function (feature, layer) {
          const name = feature.properties.name || feature.properties.NAME || 'Unknown';
          layer.bindTooltip(name, { permanent: false, direction: 'center', className: 'county-tooltip' });
          layer.on({
            click: onCountyClick,
            mouseover: e => {
              if (layer !== highlightedLayer) {
                layer.setStyle({ weight: 1.5, color: '#444', fillOpacity: 0.75 });
                layer.bringToFront();
              }
            },
            mouseout: e => {
              if (layer !== highlightedLayer) geoJSONLayer.resetStyle(layer);
            }
          });
        }
      }).addTo(map);

      // Data load and update styles
      const initialToggle = 'funding';
      document.getElementById('data-toggle').value = initialToggle;

      loadDataAndUpdate(initialToggle);
    });

  function loadDataAndUpdate(toggleValue) {
    fetch('/map-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toggle_value: toggleValue })
    })
      .then(res => res.json())
      .then(dataDict => {
        const key = toggleValue === 'scores' ? 'Value' : 'Expense per ADA';
        const values = Object.values(dataDict).map(d => d[key]).filter(Number.isFinite);
        const min = Math.min(...values);
        const max = Math.max(...values);

        const colorRange = toggleValue === 'scores'
          ? ['#deebf7', '#08306b']
          : ['#ccece6', '#00441b'];

        geoJSONLayer.eachLayer(layer => {
          const name = layer.feature.properties.name || layer.feature.properties.NAME;
          const data = dataDict[name];
          if (!data) return;

          const value = data[key];
          const fillColor = getColor(value, min, max, colorRange);

          layer.setStyle({
            fillColor,
            fillOpacity: 0.7,
            color: '#4a5568',
            weight: 1
          });

          Object.assign(layer.feature.properties, data); // merge into feature for sidebar
        });
      });
  }

  document.getElementById('data-toggle').addEventListener('change', e => {
    const selected = e.target.value;
    const label = document.getElementById('current-data-type');
    if (label) label.textContent = selected;
    loadDataAndUpdate(selected);
  });
});

// toggle chatbot on click
document.addEventListener("DOMContentLoaded", function () {
  const toggleBtn = document.getElementById("chat-toggle");
  const chatWindow = document.querySelector(".chat-window");
  const closeBtn = chatWindow.querySelector(".close");

  toggleBtn.addEventListener("click", () => {
    chatWindow.classList.add("show");
    toggleBtn.style.display = "none";
  });

  closeBtn.addEventListener("click", () => {
    chatWindow.classList.remove("show");
    toggleBtn.style.display = "flex";
  });
});

// sending message
function sendMessage() {
  const userMessage = document.querySelector(".chat-window input").value;

  if (userMessage.length) {
    document.querySelector(".chat-window input").value = "";
    document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend", `
      <div class="user">
        <p>${userMessage}</p>
      </div>
    `)
    fetch('/chat', {
      method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: userMessage
      })
      .then(response => response.text())
      .then(data => {
          console.log('Response from server:', data);
          document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend", `
            <div class="model">
              <p>${data}</p>
            </div>
          `)
      })
      .catch(error => {
          console.error('Error:', error);
      });
  }
}

document.querySelector(".chat-window .input-area button").addEventListener("click", ()=>sendMessage());