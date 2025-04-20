document.addEventListener('DOMContentLoaded', function () {
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

  const legend = L.control({ position: 'bottomright' });
  legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'info legend');
    div.style = 'background:white;padding:10px;border-radius:4px;box-shadow:0 1px 5px rgba(0,0,0,0.2)';
    updateLegend(div, 'funding'); // initial legend
    return div;
  };

  function updateLegend(div, toggleValue) {
    let colors, label;
    if (toggleValue === 'scores') {
      colors = ['#deebf7', '#4292c6', '#08519c'];  // light → mid → dark blue
      label = 'Scores';
    } else {
      colors = ['#e0f3db', '#74c476', '#00441b'];  // light → mid → dark red
      label = 'Funding';
    }

    div.innerHTML = `
      <h4 style="margin:0 0 10px;font-size:14px;font-weight:600;">${label} Legend</h4>
      <div style="display:flex;align-items:center;margin-bottom:5px;"><span style="width:15px;height:15px;margin-right:5px;background-color:${colors[0]};display:inline-block;"></span> Low</div>
      <div style="display:flex;align-items:center;margin-bottom:5px;"><span style="width:15px;height:15px;margin-right:5px;background-color:${colors[1]};display:inline-block;"></span> Medium</div>
      <div style="display:flex;align-items:center;"><span style="width:15px;height:15px;margin-right:5px;background-color:${colors[2]};display:inline-block;"></span> High</div>
    `;
  }
  legend.addTo(map);

  const sidePanel = document.createElement('div');
  sidePanel.id = 'county-side-panel';
  sidePanel.style.display = 'none';
  document.body.appendChild(sidePanel);

  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.className = 'close-button';
  closeButton.onclick = () => sidePanel.style.display = 'none';
  sidePanel.appendChild(closeButton);

  function getSelectedDataType() {
    return document.getElementById('data-toggle')?.value || 'funding';
  }

  function getColor(value, scale) {
    if (value === undefined || isNaN(value)) return '#ccc';
    return scale(value).hex();
  }

  let highlightedLayer = null;

  function highlightCounty(layer) {
    highlightedLayer = layer;
    const original = layer.options._originalStyle;
    layer.setStyle({
      ...original,
      weight: 2.5,
      color: '#2c5282'
    });
    layer.bringToFront();
  }

  function clearHighlightedLayer() {
    if (highlightedLayer) {
      highlightedLayer.setStyle(highlightedLayer.options._originalStyle);
      highlightedLayer = null;
    }
  }

  function getCountyStyle(feature) {
    return {
      fillColor: '#a0c8e6',
      weight: 1,
      opacity: 0.8,
      color: '#a0aec0',
      fillOpacity: 0.5
    };
  }

  function formatValue(key, value) {
    if (key.includes('Expense') || key === 'Value' && getSelectedDataType() === 'funding') {
      return `$${parseFloat(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    if (key.includes('Percentage')) {
      return `${parseFloat(value).toFixed(1)}%`;
    }
    if (key.includes('Score') || key === 'Value') {
      return parseFloat(value).toFixed(2);
    }
    return value;
  }

  function onCountyClick(e) {
    clearHighlightedLayer();
    highlightCounty(e.target);

    const props = e.target.feature.properties;
    const countyName = props.name || props.NAME || 'Unknown County';

    sidePanel.innerHTML = '';
    sidePanel.appendChild(closeButton);

    const title = document.createElement('h2');
    title.textContent = countyName;
    sidePanel.appendChild(title);

    const detailsContainer = document.createElement('div');
    detailsContainer.className = 'county-details';

    const excludedKeys = new Set(['name', 'NAME', 'cartodb_id', 'created_at', 'updated_at', 'Value']);

    Object.entries(props).forEach(([key, value]) => {
      if (!excludedKeys.has(key)) {
        const item = document.createElement('div');
        item.className = 'detail-item';
        item.innerHTML = `<strong>${key}:</strong> <span class="detail-value">${formatValue(key, value)}</span>`;
        detailsContainer.appendChild(item);
      }
    });

    sidePanel.appendChild(detailsContainer);

    const dataMessage = document.createElement('div');
    dataMessage.className = 'data-visualization';
    dataMessage.innerHTML = `
      <h3><span id="current-data-type">${getSelectedDataType().charAt(0).toUpperCase() + getSelectedDataType().slice(1)}</span></h3>
    `;
    sidePanel.appendChild(dataMessage);

    sidePanel.style.display = 'block';
  }

  let geoJSONLayer;

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
              const target = e.target;
              if (target !== highlightedLayer && target.options._originalStyle) {
                target.setStyle({
                  ...target.options._originalStyle,
                  weight: 2,
                  color: '#00000'
                });
              }
            },
            mouseout: e => {
              const target = e.target;
              if (target !== highlightedLayer && target.options._originalStyle) {
                target.setStyle(target.options._originalStyle);
              }
            }
          });
        }
      }).addTo(map);

      const initialToggle = 'funding';
      document.getElementById('data-toggle').value = initialToggle;
      loadDataAndUpdate(initialToggle);
    });

  function loadDataAndUpdate(toggleValue) {
    updateLegend(document.querySelector('.info.legend'), toggleValue);
    fetch(`/api/education-data?toggle_value=${toggleValue}`)
      .then(res => res.json())
      .then(dataDict => {
        const key = toggleValue === 'scores' ? 'Value' : 'Expense per Child';
        const values = Object.values(dataDict).map(d => typeof d === 'object' ? d[key] : d).filter(Number.isFinite);
        const min = Math.min(...values);
        const max = Math.max(...values);

        const scale = toggleValue === 'scores'
          ? chroma.scale(['#deebf7', '#4292c6', '#08519c']).mode('lab').domain([min, (min + max) / 2, max])
          : chroma.scale(['#e0f3db', '#74c476', '#00441b']).mode('lab').domain([min, (min + max) / 2, max]);
        geoJSONLayer.eachLayer(layer => {
          const name = layer.feature.properties.name || layer.feature.properties.NAME;
          const data = dataDict[name];
          if (!data) return;

          const value = (toggleValue === 'scores') ? data['Value'] : data['Expense per Child'];
          const style = {
            fillColor: getColor(value, scale),
            fillOpacity: 0.7,
            color: '#4a5568',
            weight: 1
          };

          // Clear old data keys
          ['Mean Score', 'Percentage Passed', 'Expense per Child', 'Value'].forEach(k => {
            delete layer.feature.properties[k];
          });

          layer.setStyle(style);
          layer.options._originalStyle = style;
          Object.assign(layer.feature.properties, data);
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