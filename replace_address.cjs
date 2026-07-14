const fs = require('fs');
const path = require('path');

const newAddress = "3 Massalay Drive Juba Formerly Johnny Paul Drive";
const replacements = [
  { search: "11 Freetown Road, Wilberforce, Freetown", replace: newAddress },
  { search: "11 Freetown Road, Wilberforce, Sierra Leone", replace: newAddress },
  { search: "11 Freetown Road, Wilberforce", replace: newAddress }
];

const filesToUpdate = [
  'src/components/AboutSection.tsx',
  'src/components/Header.tsx',
  'src/components/Footer.tsx',
  'src/components/CorporateBilling.tsx',
  'src/components/ContactSection.tsx',
  'src/components/AdminSection.tsx'
];

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    replacements.forEach(r => {
      // Use regex to replace all globally
      const regex = new RegExp(r.search, 'g');
      content = content.replace(regex, r.replace);
    });
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated ${file}`);
    } else {
      console.log(`No changes made to ${file}`);
    }
  } else {
    console.log(`File not found: ${file}`);
  }
});
