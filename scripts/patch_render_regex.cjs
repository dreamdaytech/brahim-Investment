const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'components', 'AdminSection.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const regex = /adminTab === 'billing' \? \(\s*<CorporateBilling \/>\s*\) : adminTab === 'profile' \? \(/;
const replacement = `adminTab === 'billing' ? (
            <CorporateBilling />
          ) : adminTab === 'access' ? (
            <AccessControlView currentUserRole={userRole} />
          ) : adminTab === 'profile' ? (`;

if (content.match(regex)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(filePath, content);
  console.log('AccessControlView rendered successfully.');
} else {
  console.log('Pattern not found using regex.');
}
