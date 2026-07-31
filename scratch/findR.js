const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../apps/calculators/dist/assets/index-DYHHoOZb.js');
if (!fs.existsSync(filePath)) {
  console.error(`File does not exist: ${filePath}`);
  process.exit(1);
}

const code = fs.readFileSync(filePath, 'utf-8');

// Search for the export mapping
const exportIndex = code.lastIndexOf('export');
if (exportIndex !== -1) {
  console.log('Export statement:', code.substring(exportIndex));
}

// Find where R is defined
// Minified code might define R as const R=..., function R(..., or let R=
const matches = [];
const regex = /\b(const|let|var|function)\s+R\b/g;
let match;
while ((match = regex.exec(code)) !== null) {
  matches.push({ index: match.index, text: code.substring(match.index, match.index + 100) });
}

console.log(`\nFound ${matches.length} matches for R definition:`);
matches.forEach((m, idx) => {
  console.log(`[Match ${idx + 1}] at index ${m.index}:`);
  console.log(m.text);
});

// Let's also look for B's usage
console.log('\nScanning for button definition patterns...');
const buttonPattern = /Button|button/i;
const buttonMatches = [];
let lastIdx = 0;
while (true) {
  const idx = code.indexOf('Button', lastIdx);
  if (idx === -1) break;
  buttonMatches.push(code.substring(idx - 50, idx + 100));
  lastIdx = idx + 6;
  if (buttonMatches.length > 5) break;
}
console.log('Button string matches:', buttonMatches);
