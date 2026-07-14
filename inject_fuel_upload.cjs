const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/PerformanceSection.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Inject state
const stateSearch = `  const [isStandaloneFuelModalOpen, setIsStandaloneFuelModalOpen] = useState(false);`;
const stateInject = `  const [standaloneFuelReceiptFile, setStandaloneFuelReceiptFile] = useState<File | null>(null);
  const [isUploadingFuel, setIsUploadingFuel] = useState(false);
  const [isStandaloneFuelModalOpen, setIsStandaloneFuelModalOpen] = useState(false);`;
if (content.includes(stateSearch)) {
  content = content.replace(stateSearch, stateInject);
  console.log('✅ State injected');
} else {
  console.log('❌ State injection point not found');
}

// 2. Clear state when opening modal
content = content.replace(/setIsStandaloneFuelModalOpen\(true\);/g, 'setStandaloneFuelReceiptFile(null); setIsStandaloneFuelModalOpen(true);');

// 3. UI replacement for Receipt input
const uiSearch = `                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Receipt / Ref #</label>
                  <input type="text" value={standaloneFuelEntry.receiptNumber || ''} onChange={e => setStandaloneFuelEntry(prev => ({ ...prev, receiptNumber: e.target.value }))} placeholder="e.g. REC-1234" className="w-full p-2 border border-slate-200 rounded-xl text-sm" />`;

const uiInject = `                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Receipt / Ref #</label>
                  <div className="flex flex-col gap-2">
                    <input type="text" value={standaloneFuelEntry.receiptNumber || ''} onChange={e => setStandaloneFuelEntry(prev => ({ ...prev, receiptNumber: e.target.value }))} placeholder="e.g. REC-1234" className="w-full p-2 border border-slate-200 rounded-xl text-sm" />
                    <div className="relative w-full">
                      <input type="file" accept="image/*" onChange={e => setStandaloneFuelReceiptFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      <div className="w-full px-3 py-2 flex items-center justify-between border border-slate-200 border-dashed rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                        <span className="text-xs font-medium text-slate-600 truncate">{standaloneFuelReceiptFile ? standaloneFuelReceiptFile.name : 'Attach Receipt Image (Optional)'}</span>
                        <Upload size={14} className="text-slate-400" />
                      </div>
                    </div>
                  </div>`;
if (content.includes(uiSearch)) {
  content = content.replace(uiSearch, uiInject);
  console.log('✅ UI updated');
} else {
  console.log('❌ UI injection point not found');
}

// 4. Update Save handler
const saveSearch = `                <button
                  type="button"
                  onClick={() => {
                    if (!standaloneFuelDriverId || !standaloneFuelVehicleId) {`;

const saveInject = `                <button
                  type="button"
                  disabled={isUploadingFuel}
                  onClick={async () => {
                    if (!standaloneFuelDriverId || !standaloneFuelVehicleId) {`;
if (content.includes(saveSearch)) {
  content = content.replace(saveSearch, saveInject);
  console.log('✅ Save button updated to async');
} else {
  console.log('❌ Save button injection point not found');
}

const uploadSearch = `                    const entryId = standaloneFuelEntry.id || uuidv4();`;

const uploadInject = `                    if (standaloneFuelReceiptFile) {
                      setIsUploadingFuel(true);
                      const fileExt = standaloneFuelReceiptFile.name.split('.').pop();
                      const fileName = \`fuel-receipt-\${Date.now()}.\${fileExt}\`;
                      const { error: upErr } = await supabase.storage
                        .from('vehicle-documents')
                        .upload(\`receipts/\${fileName}\`, standaloneFuelReceiptFile, { upsert: true });
                      
                      if (upErr) {
                        alert(\`Receipt upload failed: \${upErr.message}\`);
                        setIsUploadingFuel(false);
                        return;
                      }
                      
                      const { data: urlData } = supabase.storage.from('vehicle-documents').getPublicUrl(\`receipts/\${fileName}\`);
                      const currentReceipt = standaloneFuelEntry.receiptNumber || '';
                      standaloneFuelEntry.receiptNumber = currentReceipt ? \`\${currentReceipt}|URL:\${urlData.publicUrl}\` : \`URL:\${urlData.publicUrl}\`;
                      setIsUploadingFuel(false);
                    }

                    const entryId = standaloneFuelEntry.id || uuidv4();`;

if (content.includes(uploadSearch)) {
  content = content.replace(uploadSearch, uploadInject);
  console.log('✅ Upload logic injected');
} else {
  console.log('❌ Upload logic injection point not found');
}

// 5. Update Save button content
const btnTextSearch = `className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm flex items-center gap-2"
                >
                  <Fuel size={14} /> Save Fuel Entry`;

const btnTextInject = `className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {isUploadingFuel ? <Loader2 size={14} className="animate-spin" /> : <Fuel size={14} />} 
                  {isUploadingFuel ? 'Uploading...' : 'Save Fuel Entry'}`;

if (content.includes(btnTextSearch)) {
  content = content.replace(btnTextSearch, btnTextInject);
  console.log('✅ Save button text updated');
} else {
  console.log('❌ Save button text injection point not found');
}

fs.writeFileSync(filePath, content);
console.log('Done modifying PerformanceSection.tsx');
