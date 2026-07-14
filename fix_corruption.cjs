const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/PerformanceSection.tsx');
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log(`Total lines before: ${lines.length}`);

// Remove lines 5107-5120 (1-indexed), which is 5106-5119 (0-indexed)
// These are the orphan junk lines from the old fuel section
const removeStart = 5106; // 0-indexed
const removeEnd = 5119;   // 0-indexed, inclusive

const newLines = [
  ...lines.slice(0, removeStart),
  ...lines.slice(removeEnd + 1),
];

console.log(`Total lines after: ${newLines.length}`);

fs.writeFileSync(filePath, newLines.join('\n'));
console.log('Done — orphan lines removed');

// Verify the fix
const verify = fs.readFileSync(filePath, 'utf8').split('\n');
for (let i = 5100; i <= 5115; i++) {
  console.log(`${i+1}: ${verify[i]?.substring(0, 80)}`);
}
