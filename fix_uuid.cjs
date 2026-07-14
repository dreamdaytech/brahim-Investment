const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/PerformanceSection.tsx');
let content = fs.readFileSync(filePath, 'utf8');
let fixes = 0;

function replaceAll(oldStr, newStr) {
  if (content.includes(oldStr)) {
    content = content.split(oldStr).join(newStr);
    console.log(`✅ Replaced "${oldStr}" with "${newStr}"`);
    fixes++;
  } else {
    console.log(`❌ "${oldStr}" not found`);
  }
}

replaceAll('id: `fc-${Date.now()}`', 'id: uuidv4()');
replaceAll('id: `log-fuel-${Date.now()}`', 'id: uuidv4()');
replaceAll('crypto.randomUUID()', 'uuidv4()');

fs.writeFileSync(filePath, content);
console.log(`\nDone — made ${fixes} replacements.`);
