const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/PerformanceSection.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const oldOnClick = `onClick={async () => {
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
                    }}`;

const newOnClick = `onClick={async () => {
                      setIsExportingModal(true);
                      try {
                        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                        const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
                        
                        doc.setFontSize(18); doc.setTextColor(30, 30, 90);
                        doc.text('BIG — Fuel Log Details', 14, 20);
                        
                        doc.setFontSize(10); doc.setTextColor(100, 100, 120);
                        doc.text(\`Exported on: \${today}   |   Ref: \${parseReceipt(fc.receiptNumber).text || 'N/A'}\`, 14, 28);
                        
                        const tableData = [
                          ['Date & Time', \`\${fc.date || ''} \${fc.time || ''}\`.trim()],
                          ['Driver', _driver?.name || 'Unknown'],
                          ['Vehicle', _vehicle ? \`\${_vehicle.makeModel} (\${_vehicle.plateNumber})\` : 'Unknown'],
                          ['Station', \`\${fc.stationName || ''} - \${fc.location || ''} \${fc.district ? \`(\${fc.district})\` : ''}\`],
                          ['Project / Supplier', fc.supplier || 'N/A'],
                          ['Fuel Type', fc.fuelType || 'N/A'],
                          ['Volume & Rate', \`\${(fc.liters || 0).toFixed(1)} L @ Le \${(fc.costPerLiter || 0).toFixed(2)} / L\`],
                          ['Total Cost', \`Le \${((fc.liters || 0) * (fc.costPerLiter || 0)).toLocaleString(undefined, { maximumFractionDigits: 0 })}\`],
                          ['Payment Method', fc.paymentMethod || 'N/A'],
                          ['Partner Station', _isNonPartner ? 'No' : 'Yes']
                        ];
                        
                        if (_isNonPartner && fc.nonPartnerReason) {
                          tableData.push(['Non-Partner Reason', fc.nonPartnerReason]);
                        }
                        if (fc.remarks) {
                          tableData.push(['Remarks', fc.remarks]);
                        }
                        
                        autoTable(doc, {
                          startY: 35,
                          head: [['Field', 'Details']],
                          body: tableData,
                          theme: 'grid',
                          headStyles: { fillColor: [40, 40, 100], textColor: 255, fontStyle: 'bold' },
                          columnStyles: {
                            0: { fontStyle: 'bold', cellWidth: 60, fillColor: [245, 247, 250] },
                            1: { cellWidth: 'auto' }
                          },
                          styles: { fontSize: 10, cellPadding: 6 }
                        });
                        
                        const receiptUrl = parseReceipt(fc.receiptNumber).url;
                        if (receiptUrl) {
                          const finalY = doc.lastAutoTable.finalY + 15;
                          doc.setFontSize(10);
                          doc.setTextColor(50, 50, 200);
                          doc.textWithLink('View Attached Receipt Image Online', 14, finalY, { url: receiptUrl });
                        }
                    
                        doc.save(\`Fuel-Log-\${fc.stationName?.replace(/\\s+/g, '-') || 'Details'}-\${fc.date || today}.pdf\`);
                      } catch (err) {
                        console.error('Export failed', err);
                        alert('Failed to export PDF');
                      } finally {
                        setIsExportingModal(false);
                      }
                    }}`;

const normalize = (str) => str.replace(/\s+/g, ' ');

// Manual precise search and replace since whitespace could mismatch
const startIdx = content.indexOf('onClick={async () => {');
if (startIdx !== -1) {
  // Find the end of the onClick block `}}`
  let endIdx = content.indexOf('}}', startIdx);
  if (endIdx !== -1) {
    const block = content.substring(startIdx, endIdx + 2);
    if (block.includes('html2canvas(el')) {
      content = content.replace(block, newOnClick);
      console.log('✅ Replaced onClick with table export');
      fs.writeFileSync(filePath, content);
    } else {
      console.log('❌ Found onClick but no html2canvas');
    }
  } else {
    console.log('❌ Could not find end of onClick');
  }
} else {
  console.log('❌ Could not find onClick');
}
