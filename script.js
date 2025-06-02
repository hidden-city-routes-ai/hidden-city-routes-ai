```js
// 1. Inicializar mapa centrado en Madrid por defecto
const map = L.map('map').setView([40.4168, -3.7038], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

// 2. Función para geocodificar ciudad usando Nominatim
async function geocode(city) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`;
  const data = await fetch(url).then(res => res.json());
  return data[0]; // { lat, lon, display_name } del primer resultado
}

// 3. Función para pedir POIs a Overpass
async function fetchPOIs(lat, lon, interest, radius) {
  // Mapea el parámetro interest a un tag de OSM
  const tag = {
    history: 'tourism=attraction',
    street_art: 'tourism=artwork',
    nature: 'leisure=park'
  }[interest];

  // Construye la consulta Overpass
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
  return result.elements; // array de nodos con {lat, lon, tags.name, ...}
}

// 4. Algoritmo de ordenación simple por proximidad euclídea
function buildRoute(pois, base) {
  // Convierte base.lat/lon a número
  const baseLat = parseFloat(base.lat);
  const baseLon = parseFloat(base.lon);

  pois.sort((a, b) => {
    const da = (a.lat - baseLat) ** 2 + (a.lon - baseLon) ** 2;
    const db = (b.lat - baseLat) ** 2 + (b.lon - baseLon) ** 2;
    return da - db;
  });

  // Toma los primeros 6 puntos + el punto base al inicio
  const slice = pois.slice(0, 6).map(p => ({ lat: p.lat, lon: p.lon, name: p.tags.name }));
  return [{ lat: baseLat, lon: baseLon, name: 'Punto de inicio' }, ...slice];
}

// 5. Dibuja la ruta y los marcadores en el mapa
function drawRoute(points) {
  // Limpia marcadores y polilíneas previos
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

  // 6.1 Geocode
  const base = await geocode(city);
  const radius = duration * 1500; // aprox 1 km → 1500 m para 1h a pie

  // 6.2 Traer POIs
  const pois = await fetchPOIs(base.lat, base.lon, interest, radius);

  // 6.3 Generar ruta
  const route = buildRoute(pois, base);

  // 6.4 Dibujar en el mapa
  drawRoute(route);

  // 6.5 Mostrar un texto con los nombres en el elemento #summary
  const summaryEl = document.getElementById('summary');
  summaryEl.textContent = `Ruta generada: ${route.map(p => p.name).join(' → ')}`;
});
```
