// Check name joins between TopoJSON (without external deps) and CSV
const fs = require('fs');

const topoPath = 'ne_10m_admin_1_states_provinces.json';
const csvPath = 'mental_health_by_state.csv';

const topo = JSON.parse(fs.readFileSync(topoPath, 'utf8'));
const geoms = topo.objects.ne_10m_admin_1_states_provinces.geometries
  .filter(g => g.properties && g.properties.adm0_a3 === 'AUS');

const csvRaw = fs.readFileSync(csvPath, 'utf8');
const csvLines = csvRaw.trim().split(/\r?\n/);
csvLines.shift();
const rows = csvLines.map(line => {
  const idx = line.indexOf(','); // first comma splits state from value
  const state = line.slice(0, idx).replace(/^\"|\"$/g, '').trim();
  const value = line.slice(idx + 1).replace(/^\"|\"$/g, '').trim();
  return { state, value };
});
const csvMap = new Map(rows.map(r => [r.state, r.value]));

console.log('CSV states:', rows.map(r => r.state));

function debugStr(s){
  return s.split('').map(ch => ch+`(U+${ch.charCodeAt(0).toString(16).toUpperCase().padStart(4,'0')})`).join(' ');
}

let matched = 0;
for (const g of geoms) {
  const name = g.properties.name;
  if (csvMap.has(name)) {
    matched++;
  } else {
    console.log('No CSV match for topo name:', name, '\n as codes:', debugStr(name));
  }
}
console.log('Matched', matched, 'of', geoms.length);
