const fs = require('fs');
const path = require('path');

const distAssetsDir = path.join(__dirname, '../apps/calculators/dist/assets');
const files = fs.readdirSync(distAssetsDir);
const lucideFile = files.find((f) => f.startsWith('vendor-lucide-') && f.endsWith('.js'));

const code = fs.readFileSync(path.join(distAssetsDir, lucideFile), 'utf-8');

function findOccurrences(name) {
  console.log(`\n--- Occurrences of "${name}" ---`);
  let idx = 0;
  let count = 0;
  while (true) {
    idx = code.indexOf(name, idx);
    if (idx === -1) break;

    // Print context
    const start = Math.max(0, idx - 40);
    const end = Math.min(code.length, idx + 100);
    console.log(`[Occurrence ${++count}] index ${idx}:`);
    console.log(code.substring(start, end));

    idx += name.length;
    if (count >= 5) break;
  }
}

findOccurrences('C2');
findOccurrences('v0');
findOccurrences('c2');
