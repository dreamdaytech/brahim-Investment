const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/PerformanceSection.tsx');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('Loader2')) {
  content = content.replace(" } from 'lucide-react';", ", Loader2 } from 'lucide-react';");
  fs.writeFileSync(filePath, content);
  console.log('✅ Added Loader2 to lucide-react imports');
} else {
  console.log('Loader2 already imported or not found in expected format');
}
