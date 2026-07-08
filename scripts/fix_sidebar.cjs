const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'components', 'AdminSection.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// I need to find the block from `{sidebarOpen && item.badge && (`
// down to the `{sidebarOpen ? (`
// and replace it with the proper mapping loop end and the new Admin Controls array.

const searchRegex = /\{\s*sidebarOpen && item\.badge && \([\s\S]*?\{\/\* Collapse \/ Expand Toggle \*\//;

const replacement = `{sidebarOpen && item.badge && (
                      <span className="text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full leading-none">{item.badge}</span>
                    )}
                    {!sidebarOpen && item.badge && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full"></span>
                    )}
                    {sidebarOpen && isActive && <ChevronRight size={14} className="text-indigo-300" />}
                  </button>
                );
              })}

              {sidebarOpen
                ? <p className="text-[9px] font-mono font-bold text-slate-600 uppercase tracking-widest px-3 mt-5 mb-3">Admin Controls</p>
                : <div className="h-px bg-white/10 my-3 mx-1" />
              }
              {[
                { id: 'profile', label: 'Profile & Security', icon: Settings, badge: null, roles: ['super_admin', 'admin', 'fleet_manager', 'finance'] },
                { id: 'access', label: 'Access Control', icon: ShieldCheck, badge: null, roles: ['super_admin'] }
              ].filter((item: any) => !item.roles || item.roles.includes(userRole)).map(item => {
                const Icon = item.icon;
                const isActive = adminTab === item.id;
                return (
                  <button
                    key={item.id}
                    title={!sidebarOpen ? item.label : undefined}
                    onClick={() => setAdminTab(item.id as any)}
                    className={\`w-full flex items-center gap-3 rounded-xl text-sm font-semibold transition-all group relative \${
                      sidebarOpen ? 'px-3 py-2.5' : 'p-2.5 justify-center'
                    } \${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                        : 'text-slate-500 hover:text-white hover:bg-white/8'
                    }\`}
                  >
                    <Icon size={16} className={\`shrink-0 \${isActive ? 'text-white' : 'text-slate-600 group-hover:text-slate-400'}\`} />
                    {sidebarOpen && <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>}
                    {sidebarOpen && isActive && <ChevronRight size={14} className="text-indigo-300" />}
                  </button>
                );
              })}
            </nav>

            {/* Bottom Actions Area */}
            <div className={\`border-t border-white/10 transition-all duration-300 \${sidebarOpen ? 'px-4 py-4' : 'px-2 py-3'}\`}>
              
              {/* Collapse / Expand Toggle */`;

if (content.match(searchRegex)) {
  content = content.replace(searchRegex, replacement);
  fs.writeFileSync(filePath, content);
  console.log('Fixed sidebar successfully!');
} else {
  console.log('Could not find search pattern!');
}
