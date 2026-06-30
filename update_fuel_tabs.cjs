const fs = require('fs');

const file = 'src/components/PerformanceSection.tsx';
let content = fs.readFileSync(file, 'utf8');

let success = true;

// 1. Update State
const stateSearch = "const [fuelSubTab, setFuelSubTab] = useState<'overview' | 'settings'>('overview');";
const stateReplace = "const [fuelSubTab, setFuelSubTab] = useState<'overview' | 'fuel' | 'settings'>('overview');";
if (content.includes(stateSearch)) {
    content = content.replace(stateSearch, stateReplace);
} else {
    console.error("Failed to find stateSearch");
    success = false;
}

// 2. Update Tabs
const tabsSearch = `              {(['overview', 'settings'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFuelSubTab(tab)}
                  className={\`px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize \${fuelSubTab === tab ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}
                >
                  {tab === 'overview' ? '📊 Overview' : '⚙️ Settings'}
                </button>
              ))}`.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');

const tabsReplace = `              {(['overview', 'fuel', 'settings'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFuelSubTab(tab)}
                  className={\`px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize \${fuelSubTab === tab ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}
                >
                  {tab === 'overview' ? '📊 Overview' : tab === 'fuel' ? '⛽ Fuel Logs' : '⚙️ Settings'}
                </button>
              ))}`.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');

if (content.includes(tabsSearch)) {
    content = content.replace(tabsSearch, tabsReplace);
} else {
    console.error("Failed to find tabsSearch");
    success = false;
}

// 3. Split the panel
const splitSearch = `              {fuelByCity.length === 0 && <p className="text-xs text-slate-400 italic">No data yet.</p>}
            </div>
          </div>
        </div>

        {/* 🎛️ Filters Panel 🎛️ */}`.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');

const splitReplace = `              {fuelByCity.length === 0 && <p className="text-xs text-slate-400 italic">No data yet.</p>}
            </div>
          </div>
        </div>
        </div>
        )}

        {fuelSubTab === 'fuel' && (
          <div className="space-y-6">
        {/* 🎛️ Filters Panel 🎛️ */}`.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');

if (content.includes(splitSearch)) {
    content = content.replace(splitSearch, splitReplace);
} else {
    console.error("Failed to find splitSearch");
    success = false;
}

if (success) {
    fs.writeFileSync(file, content, 'utf8');
    console.log("Successfully split Fuel section");
} else {
    process.exit(1);
}
