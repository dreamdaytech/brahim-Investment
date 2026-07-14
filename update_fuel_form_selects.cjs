const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/PerformanceSection.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace standard selects in the Fuel Log Form with SearchableSelect
const formReplacements = [
  {
    // Driver Select
    find: /<select value=\{standaloneFuelDriverId\} onChange=\{e => setStandaloneFuelDriverId\(e\.target\.value\)\} className="[^"]+">([\s\S]*?)<\/select>/,
    replace: `<SearchableSelect 
                    value={standaloneFuelDriverId} 
                    onChange={(v: any) => setStandaloneFuelDriverId(v)} 
                    options={[
                      {value: '', label: 'Select Driver...'},
                      ...drivers.map(d => ({value: d.id, label: d.name}))
                    ]} 
                    placeholder="Select Driver..." 
                  />`
  },
  {
    // Trip Log Select
    find: /<select value=\{standaloneFuelTripLogId\} onChange=\{e => setStandaloneFuelTripLogId\(e\.target\.value\)\} className="[^"]+">([\s\S]*?)<\/select>/,
    replace: `<SearchableSelect 
                    value={standaloneFuelTripLogId} 
                    onChange={(v: any) => setStandaloneFuelTripLogId(v)} 
                    options={[
                      {value: '', label: 'No linked trip (Standalone)'},
                      ...logs.filter(l => !standaloneFuelDriverId || l.driverId === standaloneFuelDriverId).slice(0, 30).map(l => ({
                        value: l.id, 
                        label: \`\${l.date} \${l.isMultipleDays ? \`(to \${l.endDate})\` : ''} - \${l.distanceTraveledKm}km\`
                      }))
                    ]} 
                    placeholder="No linked trip (Standalone)" 
                  />`
  },
  {
    // Station Select
    find: /<select value=\{standaloneFuelEntry\.stationName \|\| ''\} onChange=\{e => \{([\s\S]*?)\}\} className="[^"]+">([\s\S]*?)<\/select>/,
    replace: `<SearchableSelect 
                    value={standaloneFuelEntry.stationName || ''} 
                    onChange={(v: any) => {
                      setStandaloneFuelEntry((prev: any) => ({
                        ...prev,
                        stationName: v,
                        isPartnerStation: partnerStations.find(p => p.name === v) ? true : prev.isPartnerStation
                      }));
                    }} 
                    options={[
                      {value: '', label: 'Select Station...'},
                      ...partnerStations.map(s => ({value: s.name, label: s.name}))
                    ]} 
                    placeholder="Select Station..." 
                  />`
  },
  {
    // Supplier / Project Select
    find: /<select value=\{standaloneFuelEntry\.supplier \|\| ''\} onChange=\{e => \{([\s\S]*?)\}\} className="[^"]+">([\s\S]*?)<\/select>/,
    replace: `<SearchableSelect 
                    value={standaloneFuelEntry.supplier || ''} 
                    onChange={(v: any) => {
                      const chosen = partnerStations.find(p => p.name === standaloneFuelEntry.stationName && p.supplier === v);
                      setStandaloneFuelEntry((prev: any) => ({ ...prev, supplier: v, isPartnerStation: chosen ? chosen.isPartner : prev.isPartnerStation }));
                    }} 
                    options={[
                      {value: '', label: 'Select Project...'},
                      ...Object.keys(supplierColors).map(s => ({value: s, label: s}))
                    ]} 
                    placeholder="Select Project..." 
                  />`
  },
  {
    // City Select
    find: /<select value=\{standaloneFuelEntry\.location \|\| ''\} onChange=\{e => setStandaloneFuelEntry\(prev => \(\{ \.\.\.prev, location: e\.target\.value \}\)\)\} className="[^"]+">([\s\S]*?)<\/select>/,
    replace: `<SearchableSelect 
                    value={standaloneFuelEntry.location || ''} 
                    onChange={(v: any) => setStandaloneFuelEntry((prev: any) => ({ ...prev, location: v }))} 
                    options={[
                      {value: '', label: 'Select City...'},
                      ...slCities.map(c => ({value: c, label: c}))
                    ]} 
                    placeholder="Select City..." 
                  />`
  },
  {
    // District Select
    find: /<select value=\{standaloneFuelEntry\.district \|\| ''\} onChange=\{e => setStandaloneFuelEntry\(prev => \(\{ \.\.\.prev, district: e\.target\.value \}\)\)\} className="[^"]+">([\s\S]*?)<\/select>/,
    replace: `<SearchableSelect 
                    value={standaloneFuelEntry.district || ''} 
                    onChange={(v: any) => setStandaloneFuelEntry((prev: any) => ({ ...prev, district: v }))} 
                    options={[
                      {value: '', label: 'Select District...'},
                      ...slDistricts.map(d => ({value: d, label: d}))
                    ]} 
                    placeholder="Select District..." 
                  />`
  },
  {
    // Payment Method Select
    find: /<select value=\{standaloneFuelEntry\.paymentMethod \|\| 'Fuel Card'\} onChange=\{e => setStandaloneFuelEntry\(prev => \(\{ \.\.\.prev, paymentMethod: e\.target\.value as any \}\)\)\} className="[^"]+">([\s\S]*?)<\/select>/,
    replace: `<SearchableSelect 
                    value={standaloneFuelEntry.paymentMethod || 'Fuel Card'} 
                    onChange={(v: any) => setStandaloneFuelEntry((prev: any) => ({ ...prev, paymentMethod: v as any }))} 
                    options={[
                      {value: 'Fuel Card', label: 'Fuel Card'},
                      {value: 'Voucher', label: 'Voucher'},
                      {value: 'Mobile Money', label: 'Mobile Money'},
                      {value: 'Cash', label: 'Cash'}
                    ]} 
                    placeholder="Payment Method" 
                  />`
  }
];

let replacedCount = 0;
for (const r of formReplacements) {
  if (content.match(r.find)) {
    content = content.replace(r.find, r.replace);
    replacedCount++;
  } else {
    console.log("Could not find match for regex index:", formReplacements.indexOf(r));
  }
}

// Ensure the SearchableSelect popup looks decent in wider inputs
// We'll update the component max-w from max-w-[280px] to max-w-full so it can expand nicely
content = content.replace(
  'max-w-[280px] left-0',
  'max-w-[400px] left-0'
);

fs.writeFileSync(filePath, content);
console.log('✅ Replaced ' + replacedCount + ' selects with SearchableSelect in the Fuel Form!');
