$file = "src\components\PerformanceSection.tsx"
$content = Get-Content $file -Raw -Encoding UTF8

# PATCH A: Insert new modal state + helpers after flagNoteInput declaration
$after = "  const [flagNoteInput, setFlagNoteInput] = useState('');"
$insert = @"

  // Approval Modal State
  const [approvalModalLogId, setApprovalModalLogId] = React.useState<string | null>(null);
  const [approvalApproverName, setApprovalApproverName] = React.useState('');
  const [approvalNoteInput, setApprovalNoteInput] = React.useState('');
  const [approvalSignatureData, setApprovalSignatureData] = React.useState<string | null>(null);
  const [approvalSignatureMode, setApprovalSignatureMode] = React.useState<'draw' | 'upload'>('draw');
  const approvalCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const approvalIsDrawingRef = React.useRef(false);
  const getApprovalCanvasPos = (e: any, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width; const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };
  const startApprovalDraw = (e: any) => {
    e.preventDefault(); const canvas = approvalCanvasRef.current; if (!canvas) return;
    approvalIsDrawingRef.current = true;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const pos = getApprovalCanvasPos(e, canvas); ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
  };
  const continueApprovalDraw = (e: any) => {
    e.preventDefault(); if (!approvalIsDrawingRef.current) return;
    const canvas = approvalCanvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const pos = getApprovalCanvasPos(e, canvas);
    ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.strokeStyle = '#1e3a5f';
    ctx.lineTo(pos.x, pos.y); ctx.stroke();
  };
  const endApprovalDraw = () => {
    approvalIsDrawingRef.current = false;
    const canvas = approvalCanvasRef.current;
    if (canvas) setApprovalSignatureData(canvas.toDataURL());
  };
  const clearApprovalCanvas = () => {
    const canvas = approvalCanvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setApprovalSignatureData(null);
  };
"@
$content = $content.Replace($after, $after + $insert)

# PATCH B: Replace old handleApproveLog signature and body
$oldFn = "  const handleApproveLog = (logId: string) => {`r`n    setLogs(prev => prev.map(l => l.id === logId`r`n      ? { ...l, approvalStatus: 'Approved', approvedBy: 'Admin', approvedAt: new Date().toISOString(), approvalNotes: undefined }`r`n      : l`r`n    ));`r`n    setApprovingLogId(null);`r`n  };"
$newFn = "  const handleApproveLog = (logId: string, approverName: string, notes: string, sigData: string | null) => {`r`n    setLogs(prev => prev.map(l => l.id === logId`r`n      ? { ...l, approvalStatus: 'Approved', approvedBy: approverName || 'Admin', approvedAt: new Date().toISOString(), approvalNotes: notes || undefined }`r`n      : l`r`n    ));`r`n    setApprovalModalLogId(null); setApprovalApproverName(''); setApprovalNoteInput(''); setApprovalSignatureData(null); setApprovingLogId(null);`r`n  };"
$content = $content.Replace($oldFn, $newFn)

# PATCH C: Replace the onClick in the Approve Log button
$oldClick = "                                    handleApproveLog(log.id);`r`n                                    setActiveLogMenu(null);"
$newClick = "                                    setApprovalModalLogId(log.id);`r`n                                    setApprovalApproverName(''); setApprovalNoteInput(''); setApprovalSignatureData(null);`r`n                                    setActiveLogMenu(null);"
$content = $content.Replace($oldClick, $newClick)

# PATCH D: Fix onApprove prop in dispatch details
$oldOnApprove = "              onApprove={tripLog ? (logId) => handleApproveLog(logId) : undefined}"
$newOnApprove = "              onApprove={tripLog ? (logId) => { setApprovalModalLogId(logId); setApprovalApproverName(''); setApprovalNoteInput(''); setApprovalSignatureData(null); } : undefined}"
$content = $content.Replace($oldOnApprove, $newOnApprove)

Set-Content $file $content -Encoding UTF8
Write-Host "Done. Lines: $(($content -split "`n").Count)"
