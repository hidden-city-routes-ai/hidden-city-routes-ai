// Esperamos a que todo el DOM esté cargado antes de ejecutar
window.addEventListener('load', () => {
  // 1. Inicializar mapa centrado en Madrid por defecto
  const map = L.map('map').setView([40.4168, -3.7038], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  // 2. Función para geocodificar ciudad usando Nominatim
  async function geocode(city) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`;
    const data = await fetch(url).then(res => res.json());
    return data[0]; // { lat, lon, display_name }
  }

  // 3. Función para pedir POIs a Overpass
  async function fetchPOIs(lat, lon, interest, radius) {
    const tag = {
      history: 'tourism=attraction',
      street_art: 'tourism=artwork',
      nature: 'leisure=park'
    }[interest];

    const query = `
      [out:json][timeout:25];
      node(around:${radius},${lat},${lon})[${tag}][name];
      out body 30;
    `;

    const url = 'https://overpass-api.de/api/interpreter';
    const response = await fetch(url, {
      method: 'POST',
      body: query
    });
    const result = await response.json();
    return result.elements; // array de nodos con {lat, lon, tags.name}
  }

  // 4. Algoritmo de ordenación según duración
  function buildRoute(pois, base, duration) {
    const baseLat = parseFloat(base.lat);
    const baseLon = parseFloat(base.lon);

    // Ordena por distancia euclídea al punto de inicio
    pois.sort((a, b) => {
      const da = (a.lat - baseLat) ** 2 + (a.lon - baseLon) ** 2;
      const db = (b.lat - baseLat) ** 2 + (b.lon - baseLon) ** 2;
      return da - db;
    });

    // Definir número de paradas según horas: 1h→3, 2h→6, 3h→9
    const stopsCount = duration * 3;

    const slice = pois.slice(0, stopsCount).map(p => ({
      lat: p.lat,
      lon: p.lon,
      name: p.tags.name
    }));

    return [{ lat: baseLat, lon: baseLon, name: 'Punto de inicio' }, ...slice];
  }

  // 5. Dibuja la ruta y los marcadores en el mapa
  function drawRoute(points) {
    // Elimina marcadores y polilíneas anteriores
    map.eachLayer(layer => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    const latlngs = points.map(p => [parseFloat(p.lat), parseFloat(p.lon)]);
    L.polyline(latlngs, { color: '#ff0066' }).addTo(map);

    points.forEach((p, i) => {
      const marker = L.marker([p.lat, p.lon]).addTo(map);
      marker.bindPopup(i === 0 ? p.name : p.name);
    });

    map.fitBounds(latlngs);
  }

  // 6. Conecta el formulario al flujo completo
  document.getElementById('form').addEventListener('submit', async e => {
    e.preventDefault();
    const city = document.getElementById('city').value.trim();
    const interest = document.getElementById('interest').value;
    const duration = parseInt(document.getElementById('duration').value, 10);

    // Geocodifica
    const base = await geocode(city);
    const radius = duration * 1500; // 1h→1500m, 2h→3000m, 3h→4500m

    // Trae POIs
    const pois = await fetchPOIs(base.lat, base.lon, interest, radius);

    // Genera la ruta
    const route = buildRoute(pois, base, duration);

    // Dibuja en el mapa
    drawRoute(route);

    // Muestra el listado de paradas
    const summaryEl = document.getElementById('summary');
    let html = '<ul>';
    route.forEach((p, i) => {
      html += `<li><strong>${i === 0 ? 'Inicio' : 'Parada ' + i}:</strong> ${p.name}</li>`;
    });
    html += '</ul>';
    summaryEl.innerHTML = html;
  });
});
