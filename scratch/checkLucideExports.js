const fs = require('fs');
const path = require('path');

const distAssetsDir = path.join(__dirname, '../apps/calculators/dist/assets');
const files = fs.readdirSync(distAssetsDir);
const lucideFile = files.find((f) => f.startsWith('vendor-lucide-') && f.endsWith('.js'));

if (!lucideFile) {
  console.error('Could not find vendor-lucide JS file');
  process.exit(1);
}

console.log(`Analyzing Lucide chunk: ${lucideFile}`);
const code = fs.readFileSync(path.join(distAssetsDir, lucideFile), 'utf-8');

// The import in DownloadButtons chunk is:
// import { ak as u, c as h, y as g } from "./vendor-lucide-DFHsxipn.js";
// Let's see what c and y are mapped to in the export of vendor-lucide-*.js.
const exportMatch = code.match(/export\s*\{([^}]+)\}/);
if (exportMatch) {
  const exportsStr = exportMatch[1];
  console.log('\nAll exports in vendor-lucide chunk:');
  const exportsList = exportsStr.split(',').map((e) => e.trim());

  // Find exports for c and y
  const cExport = exportsList.find((e) => e.includes(' as c') || e === 'c');
  const yExport = exportsList.find((e) => e.includes(' as y') || e === 'y');
  const akExport = exportsList.find((e) => e.includes(' as ak') || e === 'ak');

  console.log('c export mapping:', cExport);
  console.log('y export mapping:', yExport);
  console.log('ak export mapping:', akExport);
} else {
  console.log('No export statement found in Lucide chunk.');
}
