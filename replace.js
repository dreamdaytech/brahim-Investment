import fs from 'fs';
import path from 'path';

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  content = content.replace(/BIG Group/g, 'BIG');
  content = content.replace(/B\.I\.G Group/g, 'BIG');
  content = content.replace(/B\.I\.G/g, 'BIG');
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + filePath);
  }
}

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  });
}

walk('C:\\\\Users\\\\DreamDay Technology\\\\Downloads\\\\BRAHIM INVESTMENT GROUP\\\\brahiminvestment\\\\brahim-Investment\\\\src');
