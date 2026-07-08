const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'components', 'AdminSection.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `          ) : adminTab === 'billing' ? (
            <CorporateBilling />
          ) : adminTab === 'profile' ? (
            <div className="p-4 sm:p-6 lg:p-8">
              <AdminProfile currentUserRole={userRole} />
            </div>
          ) : null}`;

const newStr = `          ) : adminTab === 'billing' ? (
            <CorporateBilling />
          ) : adminTab === 'access' ? (
            <AccessControlView currentUserRole={userRole} />
          ) : adminTab === 'profile' ? (
            <div className="p-4 sm:p-6 lg:p-8">
              <AdminProfile currentUserRole={userRole} />
            </div>
          ) : null}`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, newStr);
  fs.writeFileSync(filePath, content);
  console.log('AccessControlView rendered');
} else {
  console.log('Pattern not found');
}
