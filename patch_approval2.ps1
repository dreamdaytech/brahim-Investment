$file = "src\components\PerformanceSection.tsx"
$lines = [System.IO.File]::ReadAllLines((Resolve-Path $file).Path, [System.Text.Encoding]::UTF8)

# Build new content as array
$newLines = [System.Collections.Generic.List[string]]::new()
$i = 0
while ($i -lt $lines.Count) {
    $line = $lines[$i]

    # PATCH 1: After "const [flagNoteInput, setFlagNoteInput] = useState('');" (line 629)
    # Insert new modal state + canvas helpers, and replace handleApproveLog
    if ($line -match "const \[flagNoteInput, setFlagNoteInput\] = useState\(''\);") {
        $newLines.Add($line) # keep this line
        # Insert new state declarations
        $newLines.Add("")
        $newLines.Add("  // ── Approval Modal State ──────────────────────────────")
        $newLines.Add("  const [approvalModalLogId, setApprovalModalLogId] = React.useState<string | null>(null);")
        $newLines.Add("  const [approvalApproverName, setApprovalApproverName] = React.useState('');")
        $newLines.Add("  const [approvalNoteInput, setApprovalNoteInput] = React.useState('');")
        $newLines.Add("  const [approvalSignatureData, setApprovalSignatureData] = React.useState<string | null>(null);")
        $newLines.Add("  const [approvalSignatureMode, setApprovalSignatureMode] = React.useState<'draw' | 'upload'>('draw');")
        $newLines.Add("  const approvalCanvasRef = React.useRef<HTMLCanvasElement>(null);")
        $newLines.Add("  const approvalIsDrawingRef = React.useRef(false);")
        $newLines.Add("")
        $newLines.Add("  const getApprovalCanvasPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {")
        $newLines.Add("    const rect = canvas.getBoundingClientRect();")
        $newLines.Add("    const scaleX = canvas.width / rect.width; const scaleY = canvas.height / rect.height;")
        $newLines.Add("    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;")
        $newLines.Add("    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;")
        $newLines.Add("    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };")
        $newLines.Add("  };")
        $newLines.Add("  const startApprovalDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {")
        $newLines.Add("    e.preventDefault(); const canvas = approvalCanvasRef.current; if (!canvas) return;")
        $newLines.Add("    approvalIsDrawingRef.current = true;")
        $newLines.Add("    const ctx = canvas.getContext('2d'); if (!ctx) return;")
        $newLines.Add("    const { x, y } = getApprovalCanvasPos(e, canvas); ctx.beginPath(); ctx.moveTo(x, y);")
        $newLines.Add("  };")
        $newLines.Add("  const continueApprovalDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {")
        $newLines.Add("    e.preventDefault(); if (!approvalIsDrawingRef.current) return;")
        $newLines.Add("    const canvas = approvalCanvasRef.current; if (!canvas) return;")
        $newLines.Add("    const ctx = canvas.getContext('2d'); if (!ctx) return;")
        $newLines.Add("    const { x, y } = getApprovalCanvasPos(e, canvas);")
        $newLines.Add("    ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.strokeStyle = '#1e3a5f';")
        $newLines.Add("    ctx.lineTo(x, y); ctx.stroke();")
        $newLines.Add("  };")
        $newLines.Add("  const endApprovalDraw = () => {")
        $newLines.Add("    approvalIsDrawingRef.current = false;")
        $newLines.Add("    const canvas = approvalCanvasRef.current;")
        $newLines.Add("    if (canvas) setApprovalSignatureData(canvas.toDataURL());")
        $newLines.Add("  };")
        $newLines.Add("  const clearApprovalCanvas = React.useCallback(() => {")
        $newLines.Add("    const canvas = approvalCanvasRef.current; if (!canvas) return;")
        $newLines.Add("    const ctx = canvas.getContext('2d'); if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);")
        $newLines.Add("    setApprovalSignatureData(null);")
        $newLines.Add("  }, []);")
        $i++
        continue
    }

    # PATCH 2: Replace old handleApproveLog (simple 1-arg version) with new 4-arg version
    if ($line -match "const handleApproveLog = \(logId: string\) => \{") {
        $newLines.Add("  const handleApproveLog = (logId: string, approverName: string, notes: string, sigData: string | null) => {")
        # skip old body lines until closing };
        $i++
        while ($i -lt $lines.Count -and $lines[$i] -notmatch "^\s+\};?\s*$") { $i++ }
        # Write new body
        $newLines.Add("    setLogs(prev => prev.map(l => l.id === logId")
        $newLines.Add("      ? { ...l, approvalStatus: 'Approved', approvedBy: approverName || 'Admin', approvedAt: new Date().toISOString(), approvalNotes: notes || undefined }")
        $newLines.Add("      : l")
        $newLines.Add("    ));")
        $newLines.Add("    setApprovalModalLogId(null); setApprovalApproverName(''); setApprovalNoteInput(''); setApprovalSignatureData(null); setApprovingLogId(null);")
        $newLines.Add("  };")
        $i++
        continue
    }

    # PATCH 3: Replace direct handleApproveLog(log.id) call in the button onClick with modal open
    if ($line -match "handleApproveLog\(log\.id\);") {
        $newLines.Add("                                    setApprovalModalLogId(log.id);")
        $newLines.Add("                                    setApprovalApproverName(''); setApprovalNoteInput(''); setApprovalSignatureData(null);")
        $newLines.Add("                                    setActiveLogMenu(null);")
        $i++
        continue
    }

    # PATCH 4: Fix the onApprove prop (still passes logId only, wrap it)
    if ($line -match "onApprove=\{tripLog \? \(logId\) => handleApproveLog\(logId\) : undefined\}") {
        $newLines.Add("              onApprove={tripLog ? (logId) => { setApprovalModalLogId(logId); setApprovalApproverName(''); setApprovalNoteInput(''); setApprovalSignatureData(null); } : undefined}")
        $i++
        continue
    }

    $newLines.Add($line)
    $i++
}

[System.IO.File]::WriteAllLines((Resolve-Path $file).Path, $newLines, [System.Text.Encoding]::UTF8)
Write-Host "Patch2 applied. Total lines: $($newLines.Count)"
