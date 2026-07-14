const fs = require('fs');
const content = fs.readFileSync('src/components/PerformanceSection.tsx', 'utf8');

// Find the delete section
const idx = content.indexOf('filter(fc => fc.id !== idToDelete)');
if (idx >= 0) {
  console.log('FOUND at idx', idx);
  console.log(JSON.stringify(content.substring(idx - 500, idx + 300)));
} else {
  console.log('Not found, searching for filter variants...');
  const i2 = content.indexOf('startsWith(\'log-fuel-\')');
  if (i2 >= 0) {
    console.log('FOUND log-fuel- at idx', i2);
    console.log(JSON.stringify(content.substring(i2 - 600, i2 + 200)));
  } else {
    console.log('Still not found, searching for log-fuel...');
    const i3 = content.indexOf('log-fuel');
    if (i3 >= 0) {
      console.log('FOUND log-fuel at idx', i3);
      console.log(JSON.stringify(content.substring(i3 - 100, i3 + 200)));
    }
  }
}
