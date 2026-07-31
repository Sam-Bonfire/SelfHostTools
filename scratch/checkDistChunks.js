const fs = require('fs');
const path = require('path');

const distAssetsDir = path.join(__dirname, '../apps/calculators/dist/assets');
if (!fs.existsSync(distAssetsDir)) {
  console.error(`dist/assets directory does not exist: ${distAssetsDir}`);
  process.exit(1);
}

const files = fs.readdirSync(distAssetsDir).filter((f) => f.endsWith('.js'));
console.log(`Found ${files.length} JS chunk files.`);

for (const file of files) {
  const filePath = path.join(distAssetsDir, file);
  const code = fs.readFileSync(filePath, 'utf-8');

  if (code.includes('CreatorEconomyCalculator') || file.includes('CreatorEconomy')) {
    console.log(`\n--- Creator Economy Chunk: ${file} ---`);
    // Find how exports are defined in the minified output
    const exportMatches = code.match(/export\s*\{[^}]+\}/g) || [];
    console.log('Exports found:', exportMatches);
    const defaultExportMatch = code.match(/export\s*\{\s*[^}]*\bdefault\b[^}]*\}/g);
    console.log('Has default export:', !!defaultExportMatch);
  }

  if (code.includes('EmergencyFundCalculator') || file.includes('EmergencyFund')) {
    console.log(`\n--- Emergency Fund Chunk: ${file} ---`);
    const exportMatches = code.match(/export\s*\{[^}]+\}/g) || [];
    console.log('Exports found:', exportMatches);
    const defaultExportMatch = code.match(/export\s*\{\s*[^}]*\bdefault\b[^}]*\}/g);
    console.log('Has default export:', !!defaultExportMatch);
  }
}
