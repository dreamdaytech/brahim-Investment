$file = "src\components\PerformanceSection.tsx"
$content = Get-Content $file -Raw -Encoding UTF8

# ── PATCH 1: Replace the old approval state + handlers with the new modal-driven ones ──
$oldHandlers = @'
  // ── Approval Action Handlers ──────────────────────────
  const [approvingLogId, setApprovingLogId] = useState<string | null>(null);
  const [flaggingLogId, setFlaggingLogId] = useState<string | null>(null);
  const [flagNoteInput, setFlagNoteInput] = useState('');

  const handleApproveLog = (logId: string) => {
    setLogs(prev => prev.map(l => l.id === logId
      ? { ...l, approvalStatus: 'Approved', approvedBy: 'Admin', approvedAt: new Date().toISOString(), approvalNotes: undefined }
      : l
    ));
    setApprovingLogId(null);
  };

  const handleFlagLog = (logId: string, note: string) => {
    setLogs(prev => prev.map(l => l.id === logId
      ? { ...l, approvalStatus: 'Flagged', approvedBy: 'Admin', approvedAt: new Date().toISOString(), approvalNotes: note }
      : l
    ));
    setFlaggingLogId(null);
    setFlagNoteInput('');
  };
'@

$newHandlers = @'
  // ── Approval Action Handlers ──────────────────────────
  const [approvingLogId, setApprovingLogId] = useState<string | null>(null);
  const [flaggingLogId, setFlaggingLogId] = useState<string | null>(null);
  const [flagNoteInput, setFlagNoteInput] = useState('');

  // ── Approval Modal State ──
  const [approvalModalLogId, setApprovalModalLogId] = useState<string | null>(null);
  const [approvalApproverName, setApprovalApproverName] = useState('');
  const [approvalNoteInput, setApprovalNoteInput] = useState('');
  const [approvalSignatureData, setApprovalSignatureData] = useState<string | null>(null);
  const [approvalSignatureMode, setApprovalSignatureMode] = useState<'draw' | 'upload'>('draw');
  const approvalCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const approvalIsDrawingRef = React.useRef(false);

  const getApprovalCanvasPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };
  const startApprovalDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = approvalCanvasRef.current; if (!canvas) return;
    approvalIsDrawingRef.current = true;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const { x, y } = getApprovalCanvasPos(e, canvas);
    ctx.beginPath(); ctx.moveTo(x, y);
  };
  const continueApprovalDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!approvalIsDrawingRef.current) return;
    const canvas = approvalCanvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const { x, y } = getApprovalCanvasPos(e, canvas);
    ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.strokeStyle = '#1e3a5f';
    ctx.lineTo(x, y); ctx.stroke();
  };
  const endApprovalDraw = () => {
    approvalIsDrawingRef.current = false;
    const canvas = approvalCanvasRef.current;
    if (canvas) setApprovalSignatureData(canvas.toDataURL());
  };
  const clearApprovalCanvas = () => {
    const canvas = approvalCanvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setApprovalSignatureData(null);
  };

  const handleApproveLog = (logId: string, approverName: string, notes: string, sigData: string | null) => {
    setLogs(prev => prev.map(l => l.id === logId
      ? { ...l, approvalStatus: 'Approved', approvedBy: approverName || 'Admin', approvedAt: new Date().toISOString(), approvalNotes: notes || undefined }
      : l
    ));
    setApprovalModalLogId(null);
    setApprovalApproverName('');
    setApprovalNoteInput('');
    setApprovalSignatureData(null);
    setApprovingLogId(null);
  };

  const handleFlagLog = (logId: string, note: string) => {
    setLogs(prev => prev.map(l => l.id === logId
      ? { ...l, approvalStatus: 'Flagged', approvedBy: 'Admin', approvedAt: new Date().toISOString(), approvalNotes: note }
      : l
    ));
    setFlaggingLogId(null);
    setFlagNoteInput('');
  };
'@

$content = $content.Replace($oldHandlers, $newHandlers)

# ── PATCH 2: Change "Approve Log" button to open modal instead of calling handleApproveLog directly ──
$oldApproveBtn = @'
                              {log.approvalStatus !== 'Approved' && (
                                <button
                                  onClick={() => {
                                    handleApproveLog(log.id);
                                    setActiveLogMenu(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                                >
                                  <CheckCircle2 size={14} className="text-emerald-500" /> Approve Log
                                </button>
                              )}
'@

$newApproveBtn = @'
                              {log.approvalStatus !== 'Approved' && (
                                <button
                                  onClick={() => {
                                    setApprovalModalLogId(log.id);
                                    setApprovalApproverName('');
                                    setApprovalNoteInput('');
                                    setApprovalSignatureData(null);
                                    clearApprovalCanvas();
                                    setActiveLogMenu(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                                >
                                  <CheckCircle2 size={14} className="text-emerald-500" /> Approve Log
                                </button>
                              )}
'@

$content = $content.Replace($oldApproveBtn, $newApproveBtn)

# ── PATCH 3: Insert Approval Modal before the closing "City Modal" comment ──
$insertBefore = '      {/* City Modal */}'
$approvalModal = @'
      {/* ── Approval Modal ── */}
      {approvalModalLogId && (() => {
        const logForApproval = logs.find(l => l.id === approvalModalLogId);
        const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        return (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              {/* Header */}
              <div className="px-6 py-5 bg-emerald-600 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2"><CheckCircle2 size={20} /> Trip Approval</h2>
                  <p className="text-emerald-100 text-xs mt-0.5">Confirm your identity and sign to approve this trip log.</p>
                </div>
                <button onClick={() => setApprovalModalLogId(null)} className="text-emerald-200 hover:text-white bg-emerald-500 hover:bg-emerald-400 rounded-lg p-1.5 transition-colors"><X size={18} /></button>
              </div>

              {/* Trip summary */}
              {logForApproval && (() => {
                const driver = drivers.find(d => d.id === logForApproval.driverId);
                const vehicle = vehicles.find(v => v.id === logForApproval.vehicleId);
                return (
                  <div className="px-6 py-3 bg-emerald-50 border-b border-emerald-100 flex flex-wrap gap-4 text-xs text-emerald-800">
                    <span><span className="font-bold">Date:</span> {logForApproval.date}</span>
                    <span><span className="font-bold">Driver:</span> {driver?.name || '—'}</span>
                    <span><span className="font-bold">Vehicle:</span> {vehicle?.makeModel || '—'}</span>
                    <span><span className="font-bold">Distance:</span> {logForApproval.distanceTraveledKm} km</span>
                  </div>
                );
              })()}

              <div className="p-6 space-y-5">
                {/* Approver Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Approver Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={approvalApproverName}
                    onChange={e => setApprovalApproverName(e.target.value)}
                    placeholder="Enter your full name..."
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-400 text-sm"
                    autoFocus
                  />
                </div>

                {/* Date (auto) */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Approval Date</label>
                  <div className="w-full p-2.5 border border-slate-100 rounded-xl bg-slate-50 text-sm text-slate-600 font-medium flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" /> {today} <span className="text-xs text-slate-400 ml-1">(auto-set by system)</span>
                  </div>
                </div>

                {/* Approval Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Approval Notes <span className="text-slate-400 font-normal">(optional)</span></label>
                  <textarea
                    value={approvalNoteInput}
                    onChange={e => setApprovalNoteInput(e.target.value)}
                    rows={2}
                    placeholder="Any remarks or conditions for approval..."
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-400 text-sm resize-none"
                  />
                </div>

                {/* Signature Section */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Signature <span className="text-red-500">*</span></label>
                    <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
                      <button type="button" onClick={() => { setApprovalSignatureMode('draw'); setApprovalSignatureData(null); }} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${approvalSignatureMode === 'draw' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>✏️ Draw</button>
                      <button type="button" onClick={() => { setApprovalSignatureMode('upload'); clearApprovalCanvas(); }} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${approvalSignatureMode === 'upload' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>📎 Upload</button>
                    </div>
                  </div>

                  {approvalSignatureMode === 'draw' ? (
                    <div className="border-2 border-dashed border-slate-200 rounded-xl overflow-hidden bg-slate-50 relative">
                      <canvas
                        ref={approvalCanvasRef}
                        width={600}
                        height={150}
                        className="w-full touch-none cursor-crosshair"
                        style={{ display: 'block' }}
                        onMouseDown={startApprovalDraw}
                        onMouseMove={continueApprovalDraw}
                        onMouseUp={endApprovalDraw}
                        onMouseLeave={endApprovalDraw}
                        onTouchStart={startApprovalDraw}
                        onTouchMove={continueApprovalDraw}
                        onTouchEnd={endApprovalDraw}
                      />
                      <div className="absolute bottom-2 right-2 flex gap-2">
                        <button type="button" onClick={clearApprovalCanvas} className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors">Clear</button>
                      </div>
                      {!approvalSignatureData && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <p className="text-xs text-slate-400">Sign here using your finger or mouse</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50">
                      {approvalSignatureData ? (
                        <div className="flex items-center gap-3">
                          <img src={approvalSignatureData} alt="Uploaded signature" className="h-16 object-contain border border-slate-200 rounded-lg bg-white px-2" />
                          <button type="button" onClick={() => setApprovalSignatureData(null)} className="text-xs text-red-500 hover:text-red-700 font-bold">Remove</button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center gap-2 cursor-pointer">
                          <Upload size={20} className="text-slate-400" />
                          <span className="text-xs text-slate-500 font-medium">Click to upload signature image</span>
                          <span className="text-[10px] text-slate-400">PNG, JPG, SVG supported</span>
                          <input type="file" accept="image/*" className="hidden" onChange={e => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            const reader = new FileReader();
                            reader.onload = ev => setApprovalSignatureData(ev.target?.result as string);
                            reader.readAsDataURL(f);
                          }} />
                        </label>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button onClick={() => setApprovalModalLogId(null)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition-colors text-sm">Cancel</button>
                <button
                  disabled={!approvalApproverName.trim() || !approvalSignatureData}
                  onClick={() => handleApproveLog(approvalModalLogId!, approvalApproverName.trim(), approvalNoteInput.trim(), approvalSignatureData)}
                  className="px-6 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm flex items-center gap-2"
                >
                  <CheckCircle2 size={16} /> Confirm Approval
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* City Modal */}
'@

$content = $content.Replace($insertBefore, $approvalModal)

Set-Content $file $content -Encoding UTF8
Write-Host "Patch applied successfully."
