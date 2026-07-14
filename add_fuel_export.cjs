const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/PerformanceSection.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add html2canvas import
if (!content.includes("import html2canvas")) {
  content = content.replace("import jsPDF from 'jspdf';", "import jsPDF from 'jspdf';\nimport html2canvas from 'html2canvas';");
  console.log('✅ Added html2canvas import');
}

// 2. Add isExportingModal state
if (!content.includes('const [isExportingModal,')) {
  content = content.replace('const [viewingFuelCollection, setViewingFuelCollection] = useState<FuelCollection | null>(null);', 
    'const [viewingFuelCollection, setViewingFuelCollection] = useState<FuelCollection | null>(null);\n  const [isExportingModal, setIsExportingModal] = useState(false);');
  console.log('✅ Added isExportingModal state');
}

// 3. Update the modal view
const oldModalView = `            <div className="animate-fade-in">
              <button onClick={() => setViewingFuelCollection(null)} className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 mb-5 transition-colors"><ArrowLeft size={16} /> Back to Fuel Logs</button>

              {/* Hero */}
              <div className={\`rounded-2xl p-6 mb-6 \${_isNonPartner ? 'bg-gradient-to-br from-red-600 to-red-700' : 'bg-gradient-to-br from-blue-600 to-indigo-700'} text-white shadow-xl\`}>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2"><Fuel size={20} className="opacity-80" /><span className="text-sm font-bold opacity-80 uppercase tracking-wider">Fuel Fill-Up Record</span></div>
                    <h1 className="text-2xl font-black mb-1">{fc.stationName || 'Unknown Station'}</h1>
                    <p className="opacity-75 text-sm">{fc.location}{fc.district ? \` · \${fc.district}\` : ''}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-3xl font-black">Le {totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    <div className="text-sm opacity-75 mt-1">{(fc.liters || 0).toFixed(1)} L @ Le {(fc.costPerLiter || 0).toFixed(2)}/L</div>
                    {_isNonPartner ? <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-lg text-xs font-bold bg-white/20 border border-white/30"><AlertTriangle size={11} /> Non-Partner</span> : <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-lg text-xs font-bold bg-white/20 border border-white/30"><CheckCircle2 size={11} /> Partner Station</span>}
                  </div>
                </div>
                <div className="flex gap-3 mt-6 pt-4 border-t border-white/20">
                  <button onClick={() => { setStandaloneFuelEntry({ ...fc }); setStandaloneFuelDriverId(fc.driverId || ''); setStandaloneFuelVehicleId(fc.vehicleId || ''); setStandaloneFuelTripLogId(fc.tripLogId || ''); setStandaloneFuelReceiptFile(null); setIsStandaloneFuelModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl text-sm font-bold transition-colors"><Pencil size={14} /> Edit Entry</button>
                  <button onClick={() => setDeletingFuelCollection(fc)} className="flex items-center gap-2 px-4 py-2 bg-red-800/40 hover:bg-red-800/60 border border-red-400/30 rounded-xl text-sm font-bold transition-colors"><Trash2 size={14} /> Delete Entry</button>
                </div>
              </div>`;

const newModalView = `            <div className="animate-fade-in">
              {!isExportingModal && (
                <div className="flex items-center justify-between mb-5">
                  <button onClick={() => setViewingFuelCollection(null)} className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"><ArrowLeft size={16} /> Back to Fuel Logs</button>
                  <button 
                    onClick={async () => {
                      const el = document.getElementById('fuel-log-details-export-area');
                      if (!el) return;
                      setIsExportingModal(true);
                      await new Promise(r => setTimeout(r, 100)); // wait for re-render to hide buttons
                      try {
                        const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#f8fafc' });
                        const imgData = canvas.toDataURL('image/png');
                        const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] });
                        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                        pdf.save(\`Fuel-Log-\${fc.stationName?.replace(/\\s+/g, '-') || 'Details'}-\${fc.date}.pdf\`);
                      } catch (err) {
                        console.error('Export failed', err);
                        alert('Failed to export PDF');
                      } finally {
                        setIsExportingModal(false);
                      }
                    }} 
                    disabled={isExportingModal}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isExportingModal ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} 
                    {isExportingModal ? 'Exporting...' : 'Export to PDF'}
                  </button>
                </div>
              )}

              <div id="fuel-log-details-export-area" className={isExportingModal ? 'p-6 bg-slate-50' : ''}>
                {/* Hero */}
                <div className={\`rounded-2xl p-6 mb-6 \${_isNonPartner ? 'bg-gradient-to-br from-red-600 to-red-700' : 'bg-gradient-to-br from-blue-600 to-indigo-700'} text-white shadow-xl\`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2"><Fuel size={20} className="opacity-80" /><span className="text-sm font-bold opacity-80 uppercase tracking-wider">Fuel Fill-Up Record</span></div>
                      <h1 className="text-2xl font-black mb-1">{fc.stationName || 'Unknown Station'}</h1>
                      <p className="opacity-75 text-sm">{fc.location}{fc.district ? \` · \${fc.district}\` : ''}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-3xl font-black">Le {totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                      <div className="text-sm opacity-75 mt-1">{(fc.liters || 0).toFixed(1)} L @ Le {(fc.costPerLiter || 0).toFixed(2)}/L</div>
                      {_isNonPartner ? <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-lg text-xs font-bold bg-white/20 border border-white/30"><AlertTriangle size={11} /> Non-Partner</span> : <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-lg text-xs font-bold bg-white/20 border border-white/30"><CheckCircle2 size={11} /> Partner Station</span>}
                    </div>
                  </div>
                  {!isExportingModal && (
                    <div className="flex gap-3 mt-6 pt-4 border-t border-white/20">
                      <button onClick={() => { setStandaloneFuelEntry({ ...fc }); setStandaloneFuelDriverId(fc.driverId || ''); setStandaloneFuelVehicleId(fc.vehicleId || ''); setStandaloneFuelTripLogId(fc.tripLogId || ''); setStandaloneFuelReceiptFile(null); setIsStandaloneFuelModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl text-sm font-bold transition-colors"><Pencil size={14} /> Edit Entry</button>
                      <button onClick={() => setDeletingFuelCollection(fc)} className="flex items-center gap-2 px-4 py-2 bg-red-800/40 hover:bg-red-800/60 border border-red-400/30 rounded-xl text-sm font-bold transition-colors"><Trash2 size={14} /> Delete Entry</button>
                    </div>
                  )}
                </div>`;

const normalize = (str) => str.replace(/\r\n/g, '\n');

if (normalize(content).includes(normalize(oldModalView))) {
  content = normalize(content).split(normalize(oldModalView)).join(normalize(newModalView));
  console.log('✅ Updated modal view with export button');
} else {
  console.log('❌ Could not find modal view string');
}

// 4. We also need to close the `fuel-log-details-export-area` div at the end of the modal!
const oldEndOfModal = `              {_parentLog && (<div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-6"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><ExternalLink size={12} /> Linked Trip Log</p><div className="flex items-center justify-between"><div><p className="font-bold text-slate-800">{_parentLog.date}</p><p className="text-xs text-slate-500">Distance: {_parentLog.distanceTraveledKm} km</p></div><span className={\`px-2.5 py-1 rounded-lg text-xs font-bold \${_parentLog.approvalStatus === 'Approved' ? 'bg-emerald-100 text-emerald-700' : _parentLog.approvalStatus === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}\`}>{_parentLog.approvalStatus || 'Pending'}</span></div></div>)}
            </div>
          );
        })()}

        {/* ── Tabs Content ── */}`;

const newEndOfModal = `              {_parentLog && (<div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-6"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><ExternalLink size={12} /> Linked Trip Log</p><div className="flex items-center justify-between"><div><p className="font-bold text-slate-800">{_parentLog.date}</p><p className="text-xs text-slate-500">Distance: {_parentLog.distanceTraveledKm} km</p></div><span className={\`px-2.5 py-1 rounded-lg text-xs font-bold \${_parentLog.approvalStatus === 'Approved' ? 'bg-emerald-100 text-emerald-700' : _parentLog.approvalStatus === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}\`}>{_parentLog.approvalStatus || 'Pending'}</span></div></div>)}
              </div>
            </div>
          );
        })()}

        {/* ── Tabs Content ── */}`;

if (normalize(content).includes(normalize(oldEndOfModal))) {
  content = normalize(content).split(normalize(oldEndOfModal)).join(normalize(newEndOfModal));
  console.log('✅ Closed export area div');
} else {
  console.log('❌ Could not find end of modal string');
}

fs.writeFileSync(filePath, content);
console.log('Done');
