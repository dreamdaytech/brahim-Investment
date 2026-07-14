const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/PerformanceSection.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const helperCode = `\nexport const parseReceipt = (receipt?: string) => {
  if (!receipt) return { text: '', url: '' };
  const parts = receipt.split('|URL:');
  if (parts.length === 1 && receipt.startsWith('URL:')) return { text: '', url: receipt.replace('URL:', '') };
  return { text: parts[0] || '', url: parts.length > 1 ? parts.slice(1).join('|URL:') : '' };
};\n\n`;

if (!content.includes('const parseReceipt')) {
  // Inject right before "export const PerformanceSection"
  content = content.replace('export const PerformanceSection', helperCode + 'export const PerformanceSection');
  fs.writeFileSync(filePath, content);
  console.log('✅ Injected parseReceipt');
} else {
  console.log('parseReceipt already injected');
}
