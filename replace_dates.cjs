const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(dirPath);
  });
}

const targetFormat = ".toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })";

walkDir(path.join(__dirname, 'src'), function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let original = fs.readFileSync(filePath, 'utf8');
    let content = original;
    
    // Replace variant 1: day: '2-digit', month: 'short'
    content = content.replace(/\.toLocaleDateString\(['"]en-GB['"],\s*\{\s*day:\s*['"]2-digit['"],\s*month:\s*['"]short['"],\s*year:\s*['"]numeric['"]\s*\}\)/g, targetFormat);
    
    // Replace variant 2: day: 'numeric', month: 'short'
    content = content.replace(/\.toLocaleDateString\(['"]en-GB['"],\s*\{\s*day:\s*['"]numeric['"],\s*month:\s*['"]short['"],\s*year:\s*['"]numeric['"]\s*\}\)/g, targetFormat);
    
    // Replace variant 3: empty args
    content = content.replace(/\.toLocaleDateString\(\)/g, targetFormat);
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated dates in ${filePath}`);
    }
  }
});
