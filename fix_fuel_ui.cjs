const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/PerformanceSection.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix the project (supplier) pill color logic in the list grid view
content = content.replace(
  /\$\{supplierColors\[fc\.supplier \|\| ''\] \|\| 'bg-slate-100 text-slate-700'\} text-white/g,
  "${supplierColors[fc.supplier || ''] ? supplierColors[fc.supplier || ''] + ' text-white' : 'bg-slate-100 text-slate-700'}"
);

// 2. Inject SearchableSelect component at the top of the file
const searchableSelectCode = `
const SearchableSelect = ({ value, onChange, options, placeholder }: any) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClick = (e: any) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filteredOptions = options.filter((o: any) => o.label.toLowerCase().includes(search.toLowerCase()));
  const selectedLabel = options.find((o: any) => o.value === value)?.label || placeholder;

  return (
    <div className="relative min-w-[140px]" ref={wrapperRef}>
      <button type="button" onClick={() => { setIsOpen(!isOpen); setSearch(''); }} className="w-full text-left bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 flex justify-between items-center">
        <span className="truncate pr-2">{selectedLabel}</span>
        <span className="text-slate-400 text-[10px]">▼</span>
      </button>
      {isOpen && (
        <div className="absolute z-[100] mt-1 w-max min-w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
          <input 
            type="text" 
            autoFocus 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search..." 
            className="w-full px-3 py-2 text-xs border-b border-slate-100 focus:outline-none bg-slate-50" 
          />
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? <div className="px-3 py-2 text-xs text-slate-400">No results</div> : null}
            {filteredOptions.map((o: any) => (
              <button 
                key={o.value} 
                type="button" 
                onClick={() => { onChange(o.value); setIsOpen(false); }} 
                className={\`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 \${value === o.value ? 'font-bold bg-blue-50 text-blue-700' : 'text-slate-700'}\`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
`;

if (!content.includes('SearchableSelect')) {
  // Insert right after the imports
  const importEnd = content.lastIndexOf("import");
  const nextLine = content.indexOf('\\n', importEnd);
  content = content.slice(0, nextLine + 1) + searchableSelectCode + content.slice(nextLine + 1);
}

// 3. Replace the specific selects. 
// Note: We need to use exact matching or careful regex to avoid breaking other dropdowns (like the one for Trip/Driver selection inside the Fuel form).
// The user specifically wants search on the *filters* in Fuel Management.

const replacements = [
  {
    find: /<select value=\{fuelSortBy\} onChange=\{e => \{ setFuelSortBy\(e\.target\.value as any\); setFuelPage\(0\); \}\} className="[^"]+">([\s\S]*?)<\/select>/,
    replace: `<SearchableSelect 
                value={fuelSortBy} 
                onChange={(v: any) => { setFuelSortBy(v as any); setFuelPage(0); }} 
                options={[
                  {value: 'date_desc', label: 'Newest First'},
                  {value: 'date_asc', label: 'Oldest First'},
                  {value: 'liters_desc', label: 'Highest Litres'},
                  {value: 'liters_asc', label: 'Lowest Litres'},
                  {value: 'cost_desc', label: 'Highest Cost'},
                  {value: 'cost_asc', label: 'Lowest Cost'}
                ]} 
                placeholder="Sort By" 
              />`
  },
  {
    find: /<select value=\{fuelDriverFilter\} onChange=\{e => \{ setFuelDriverFilter\(e\.target\.value\); setFuelPage\(0\); \}\} className="[^"]+">([\s\S]*?)<\/select>/,
    replace: `<SearchableSelect 
                value={fuelDriverFilter} 
                onChange={(v: any) => { setFuelDriverFilter(v); setFuelPage(0); }} 
                options={[
                  {value: 'all', label: 'All Drivers'},
                  ...drivers.map(d => ({value: d.id, label: d.name}))
                ]} 
                placeholder="All Drivers" 
              />`
  },
  {
    find: /<select value=\{fuelSupplierFilter\} onChange=\{e => \{ setFuelSupplierFilter\(e\.target\.value\); setFuelPage\(0\); \}\} className="[^"]+">([\s\S]*?)<\/select>/,
    replace: `<SearchableSelect 
                value={fuelSupplierFilter} 
                onChange={(v: any) => { setFuelSupplierFilter(v); setFuelPage(0); }} 
                options={[
                  {value: 'all', label: 'All Projects'},
                  ...[...new Set(allFuelCollections.map(f => f.supplier || 'Unknown'))].map(s => ({value: s, label: s}))
                ]} 
                placeholder="All Projects" 
              />`
  },
  {
    find: /<select value=\{fuelPaymentFilter\} onChange=\{e => \{ setFuelPaymentFilter\(e\.target\.value\); setFuelPage\(0\); \}\} className="[^"]+">([\s\S]*?)<\/select>/,
    replace: `<SearchableSelect 
                value={fuelPaymentFilter} 
                onChange={(v: any) => { setFuelPaymentFilter(v); setFuelPage(0); }} 
                options={[
                  {value: 'all', label: 'All Payments'},
                  {value: 'Fuel Card', label: 'Fuel Card'},
                  {value: 'Voucher', label: 'Voucher'},
                  {value: 'Mobile Money', label: 'Mobile Money'},
                  {value: 'Cash', label: 'Cash'}
                ]} 
                placeholder="All Payments" 
              />`
  },
  {
    find: /<select value=\{fuelFuelTypeFilter\} onChange=\{e => \{ setFuelFuelTypeFilter\(e\.target\.value\); setFuelPage\(0\); \}\} className="[^"]+">([\s\S]*?)<\/select>/,
    replace: `<SearchableSelect 
                value={fuelFuelTypeFilter} 
                onChange={(v: any) => { setFuelFuelTypeFilter(v); setFuelPage(0); }} 
                options={[
                  {value: 'all', label: 'All Fuel Types'},
                  {value: 'Petrol', label: '⛽ Petrol'},
                  {value: 'Diesel', label: '🟡 Diesel'},
                  {value: 'Premium', label: '💜 Premium'}
                ]} 
                placeholder="All Fuel Types" 
              />`
  },
  {
    find: /<select value=\{fuelPartnerFilter\} onChange=\{e => \{ setFuelPartnerFilter\(e\.target\.value\); setFuelPage\(0\); \}\} className="[^"]+">([\s\S]*?)<\/select>/,
    replace: `<SearchableSelect 
                value={fuelPartnerFilter} 
                onChange={(v: any) => { setFuelPartnerFilter(v); setFuelPage(0); }} 
                options={[
                  {value: 'all', label: 'All Stations'},
                  ...[...new Set(allFuelCollections.map(f => f.stationName).filter(Boolean))].sort().map(s => ({value: s, label: s}))
                ]} 
                placeholder="All Stations" 
              />`
  },
  {
    find: /<select value=\{fuelCityFilter\} onChange=\{e => \{ setFuelCityFilter\(e\.target\.value\); setFuelPage\(0\); \}\} className="[^"]+">([\s\S]*?)<\/select>/,
    replace: `<SearchableSelect 
                value={fuelCityFilter} 
                onChange={(v: any) => { setFuelCityFilter(v); setFuelPage(0); }} 
                options={[
                  {value: 'all', label: 'All Cities'},
                  ...[...new Set(allFuelCollections.map(f => f.location).filter(Boolean))].sort().map(c => ({value: c, label: c}))
                ]} 
                placeholder="All Cities" 
              />`
  }
];

let replacedCount = 0;
for (const r of replacements) {
  if (content.match(r.find)) {
    content = content.replace(r.find, r.replace);
    replacedCount++;
  } else {
    console.log("Could not find match for:", r.find);
  }
}

fs.writeFileSync(filePath, content);
console.log('✅ Replaced ' + replacedCount + ' selects with SearchableSelect!');
