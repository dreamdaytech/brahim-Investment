$file = "src\components\PerformanceSection.tsx"
$content = Get-Content $file -Raw -Encoding UTF8

# ── PATCH A: Replace simple FileReader with background-removal canvas processing ──
$oldUpload = @'
                            <input type="file" accept="image/*" className="hidden" onChange={e => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              const reader = new FileReader();
                              reader.onload = ev => setApprovalSignatureData(ev.target?.result as string);
                              reader.readAsDataURL(f);
                            }} />
'@

$newUpload = @'
                            <input type="file" accept="image/*" className="hidden" onChange={e => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              const reader = new FileReader();
                              reader.onload = ev => {
                                const dataUrl = ev.target?.result as string;
                                // Remove white/light background from signature
                                const img = new Image();
                                img.onload = () => {
                                  const canvas = document.createElement('canvas');
                                  canvas.width = img.width; canvas.height = img.height;
                                  const ctx = canvas.getContext('2d')!;
                                  ctx.drawImage(img, 0, 0);
                                  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                                  const data = imageData.data;
                                  for (let px = 0; px < data.length; px += 4) {
                                    const r = data[px], g = data[px+1], b = data[px+2];
                                    // Make near-white pixels transparent
                                    if (r > 200 && g > 200 && b > 200) {
                                      data[px+3] = 0;
                                    }
                                  }
                                  ctx.putImageData(imageData, 0, 0);
                                  setApprovalSignatureData(canvas.toDataURL('image/png'));
                                };
                                img.src = dataUrl;
                              };
                              reader.readAsDataURL(f);
                            }} />
'@

$content = $content.Replace($oldUpload, $newUpload)

# ── PATCH B: Replace uploaded signature img preview to show on transparent/checkered bg ──
$oldImgPreview = '                          <div className="flex items-center gap-3">
                            <img src={approvalSignatureData} alt="Uploaded signature" className="h-16 object-contain border border-slate-200 rounded-lg bg-white px-2" />
                            <button type="button" onClick={() => setApprovalSignatureData(null)} className="text-xs text-red-500 hover:text-red-700 font-bold">Remove</button>
                          </div>'

$newImgPreview = '                          <div className="flex items-center gap-4">
                            <div className="relative border border-slate-200 rounded-lg overflow-hidden" style={{background: "repeating-conic-gradient(#e2e8f0 0% 25%, white 0% 50%) 0 0 / 12px 12px"}}>
                              <img src={approvalSignatureData} alt="Uploaded signature" className="h-16 object-contain px-2 relative z-10" />
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 size={10} /> Background removed</span>
                              <button type="button" onClick={() => setApprovalSignatureData(null)} className="text-xs text-red-500 hover:text-red-700 font-bold text-left">Remove</button>
                            </div>
                          </div>'

$content = $content.Replace($oldImgPreview, $newImgPreview)

# ── PATCH C: Add "Edit Approval Notes" to the approved log menu ──
$oldEditButton = '                              {log.approvalStatus !== ''Approved'' && (
                                <button
                                  onClick={() => {
                                    setApprovalModalLogId(log.id);
                                    setApprovalApproverName(''''); setApprovalNoteInput(''''); setApprovalSignatureData(null);
                                    setActiveLogMenu(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                                >
                                  <CheckCircle2 size={14} className="text-emerald-500" /> Approve Log
                                </button>
                              )}'

$newEditButton = '                              {log.approvalStatus !== ''Approved'' ? (
                                <button
                                  onClick={() => {
                                    setApprovalModalLogId(log.id);
                                    setApprovalApproverName(log.approvedBy || ''''); setApprovalNoteInput(log.approvalNotes || ''''); setApprovalSignatureData(null);
                                    setActiveLogMenu(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                                >
                                  <CheckCircle2 size={14} className="text-emerald-500" /> Approve Log
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setApprovalModalLogId(log.id);
                                    setApprovalApproverName(log.approvedBy || ''''); setApprovalNoteInput(log.approvalNotes || ''''); setApprovalSignatureData(null);
                                    setActiveLogMenu(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                                >
                                  <PenTool size={14} className="text-emerald-500" /> Edit Approval Notes
                                </button>
                              )}'

$content = $content.Replace($oldEditButton, $newEditButton)

# ── PATCH D: In the approval modal header, show "Update Approval" title when already approved ──
$oldModalTitle = '                  <h2 className="text-lg font-black text-white flex items-center gap-2"><CheckCircle2 size={20} /> Trip Approval</h2>
                  <p className="text-emerald-100 text-xs mt-0.5">Confirm your identity and sign to approve this trip log.</p>'

$newModalTitle = '                  <h2 className="text-lg font-black text-white flex items-center gap-2"><CheckCircle2 size={20} /> {logForApproval?.approvalStatus === ''Approved'' ? ''Update Approval Notes'' : ''Trip Approval''}</h2>
                  <p className="text-emerald-100 text-xs mt-0.5">{logForApproval?.approvalStatus === ''Approved'' ? ''Update the approval notes for this already-approved trip.'' : ''Confirm your identity and sign to approve this trip log.''}</p>'

$content = $content.Replace($oldModalTitle, $newModalTitle)

# ── PATCH E: Make Signature optional when log is already approved (update notes only flow) ──
$oldConfirmBtn = '                  disabled={!approvalApproverName.trim() || !approvalSignatureData}
                  onClick={() => handleApproveLog(approvalModalLogId!, approvalApproverName.trim(), approvalNoteInput.trim(), approvalSignatureData)}'

$newConfirmBtn = '                  disabled={!approvalApproverName.trim() || (logForApproval?.approvalStatus !== ''Approved'' && !approvalSignatureData)}
                  onClick={() => handleApproveLog(approvalModalLogId!, approvalApproverName.trim(), approvalNoteInput.trim(), approvalSignatureData)}'

$content = $content.Replace($oldConfirmBtn, $newConfirmBtn)

Set-Content $file $content -Encoding UTF8
Write-Host "All patches applied. Lines: $(($content -split "`n").Count)"
