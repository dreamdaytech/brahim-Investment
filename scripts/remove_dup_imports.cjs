const fs = require('fs');
const f = 'src/components/AdminSection.tsx';
let c = fs.readFileSync(f, 'utf8');

// The duplicate block starts right after the first "import { AdminProfile } from './AdminProfile';"
// and contains these lines injected with \n line endings
const marker = "import { AdminProfile } from './AdminProfile';";
const firstIdx = c.indexOf(marker);
const secondIdx = c.indexOf(marker, firstIdx + 1);

if (secondIdx !== -1) {
  // Find the end of the duplicate block — it ends before "import { DashboardOverview }"
  const dashboardImport = c.indexOf("import { DashboardOverview }");
  if (dashboardImport > secondIdx) {
    // Remove everything between firstIdx+marker.length and dashboardImport
    const before = c.slice(0, firstIdx + marker.length);
    const after = c.slice(dashboardImport);
    c = before + '\n' + after;
    console.log('Removed duplicate import block. Removed', dashboardImport - (firstIdx + marker.length), 'chars');
  } else {
    console.log('DashboardOverview import not found after second marker');
  }
} else {
  console.log('Second AdminProfile import not found — no duplicates');
}

fs.writeFileSync(f, c);
console.log('Done. Lines now:', c.split('\n').length);
