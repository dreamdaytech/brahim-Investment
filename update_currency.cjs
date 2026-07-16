const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(dirPath);
  });
}

function updateCurrency(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace $${ -> Le ${
  content = content.replace(/\$\$\{/g, 'Le ${');

  // Replace $ followed by digits (e.g. $30) -> Le 30
  content = content.replace(/\$(\d+)/g, 'Le $1');

  // Replace Cost ($) -> Cost (Le)
  content = content.replace(/Cost \(\$\)/gi, 'Cost (Le)');
  
  // Replace Unit Cost ($) -> Unit Cost (Le)
  content = content.replace(/Unit Cost \(\$\)/gi, 'Unit Cost (Le)');
  
  // Replace Total Cost ($) -> Total Cost (Le)
  content = content.replace(/Total Cost \(\$\)/gi, 'Total Cost (Le)');
  
  // Replace "x $" -> "x Le "
  content = content.replace(/x \$/g, 'x Le ');
  
  // Replace "-$" -> "-Le "
  content = content.replace(/-\$/g, '-Le ');
  
  // Replace "+$" -> "+Le "
  content = content.replace(/\+\$/g, '+Le ');
  
  // Check for any leftover literal $ before {
  // Wait, in JSX `{"$"}` or `${...}` we might have missed some
  content = content.replace(/\{"\$"\}/g, '{"Le "}');

  // Replace other occurrences like >$<
  content = content.replace(/>\$\</g, '>Le <');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', filePath);
  }
}

walk(path.join(__dirname, 'src', 'components'), updateCurrency);
console.log('Done.');
