const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/PerformanceSection.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Inject parseReceipt helper before the component
const helperCode = `\nconst parseReceipt = (receipt?: string) => {
  if (!receipt) return { text: '', url: '' };
  const parts = receipt.split('|URL:');
  if (parts.length === 1 && receipt.startsWith('URL:')) return { text: '', url: receipt.replace('URL:', '') };
  return { text: parts[0] || '', url: parts.length > 1 ? parts.slice(1).join('|URL:') : '' };
};\n\n`;

if (!content.includes('const parseReceipt')) {
  content = content.replace('export default function PerformanceSection', helperCode + 'export default function PerformanceSection');
  console.log('✅ Injected parseReceipt');
}

// 2. Replace Receipt in modal
const modalSearch = `<p className="text-sm text-slate-500 mt-1">Receipt: <span className="font-mono font-bold">{fc.receiptNumber || '—'}</span></p>`;
const modalInject = `<p className="text-sm text-slate-500 mt-1">Receipt: <span className="font-mono font-bold">{parseReceipt(fc.receiptNumber).text || '—'}</span></p>
                  {parseReceipt(fc.receiptNumber).url && (
                    <div className="mt-3 relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                      <img src={parseReceipt(fc.receiptNumber).url} alt="Receipt" className="w-full h-full object-contain" />
                      <a href={parseReceipt(fc.receiptNumber).url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100"><ExternalLink className="text-white drop-shadow-md" /></a>
                    </div>
                  )}`;
if (content.includes(modalSearch)) {
  content = content.replace(modalSearch, modalInject);
  console.log('✅ Updated modal receipt display');
}

// 3. Update the form display
const formSearch = `<span className="text-xs font-medium text-slate-600 truncate">{standaloneFuelReceiptFile ? standaloneFuelReceiptFile.name : 'Attach Receipt Image (Optional)'}</span>`;
const formInject = `{standaloneFuelReceiptFile ? (
                          <div className="flex items-center gap-2">
                            <img src={URL.createObjectURL(standaloneFuelReceiptFile)} alt="Preview" className="w-8 h-8 object-cover rounded shadow-sm" />
                            <span className="text-xs font-medium text-slate-600 truncate">{standaloneFuelReceiptFile.name}</span>
                          </div>
                        ) : parseReceipt(standaloneFuelEntry.receiptNumber).url ? (
                          <div className="flex items-center gap-2">
                            <img src={parseReceipt(standaloneFuelEntry.receiptNumber).url} alt="Existing" className="w-8 h-8 object-cover rounded shadow-sm" />
                            <span className="text-xs font-medium text-slate-600 truncate">Replace Image (Optional)</span>
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-slate-600 truncate">Attach Receipt Image (Optional)</span>
                        )}`;
if (content.includes(formSearch)) {
  content = content.replace(formSearch, formInject);
  console.log('✅ Updated form upload preview');
}

// 4. Update the actual text input for receipt to not show the URL part
const inputSearch = `<input type="text" value={standaloneFuelEntry.receiptNumber || ''} onChange={e => setStandaloneFuelEntry(prev => ({ ...prev, receiptNumber: e.target.value }))} placeholder="e.g. REC-1234" className="w-full p-2 border border-slate-200 rounded-xl text-sm" />`;
const inputInject = `<input type="text" value={parseReceipt(standaloneFuelEntry.receiptNumber).text} onChange={e => {
                      const newText = e.target.value;
                      const existingUrl = parseReceipt(standaloneFuelEntry.receiptNumber).url;
                      setStandaloneFuelEntry(prev => ({ ...prev, receiptNumber: existingUrl ? \`\${newText}|URL:\${existingUrl}\` : newText }));
                    }} placeholder="e.g. REC-1234" className="w-full p-2 border border-slate-200 rounded-xl text-sm" />`;
if (content.includes(inputSearch)) {
  content = content.replace(inputSearch, inputInject);
  console.log('✅ Updated form text input');
}

// 5. Update table/list displays
content = content.replace(/fc\.receiptNumber \|\| '—'/g, "parseReceipt(fc.receiptNumber).text || '—'");
// For the export logic (we can just leave it or replace)
content = content.replace(/esc\(f\.receiptNumber\)/g, "esc(parseReceipt(f.receiptNumber).text)");
console.log('✅ Replaced table/list references');

fs.writeFileSync(filePath, content);
console.log('Done');
