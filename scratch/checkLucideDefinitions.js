const fs = require('fs');
const path = require('path');

const distAssetsDir = path.join(__dirname, '../apps/calculators/dist/assets');
const files = fs.readdirSync(distAssetsDir);
const lucideFile = files.find((f) => f.startsWith('vendor-lucide-') && f.endsWith('.js'));

const code = fs.readFileSync(path.join(distAssetsDir, lucideFile), 'utf-8');

function findDefinition(name) {
  const patterns = [
    new RegExp(`\\bconst\\s+${name}\\s*=`),
    new RegExp(`\\bfunction\\s+${name}\\b`),
    new RegExp(`\\bvar\\s+${name}\\s*=`),
    new RegExp(`\\blet\\s+${name}\\s*=`)
  ];
  for (const pattern of patterns) {
    const match = code.match(pattern);
    if (match) {
      const idx = match.index;
      console.log(`Definition for ${name}:`, code.substring(idx, idx + 150));
      return;
    }
  }
  console.log(`No direct definition found for ${name}`);
}

findDefinition('C2');
findDefinition('v0');
findDefinition('c2');
