const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/PerformanceSection.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const oldStr = `                      setLogs(prev => [syntheticLog, ...prev]);
                      // Persist: trip log first, then fuel collection
                      supabase.from('trip_logs').insert({`;

const newStr = `                      _setLogs(prev => [syntheticLog, ...prev]); // Bypasses handleSupabaseSync to prevent race condition
                      // Persist: trip log first, then fuel collection
                      supabase.from('trip_logs').insert({`;

if (content.includes(oldStr)) {
  content = content.replace(oldStr, newStr);
  fs.writeFileSync(filePath, content);
  console.log('✅ Fix applied: Changed setLogs to _setLogs for synthetic log insertion.');
} else {
  console.log('❌ Could not find the exact string to replace.');
}
