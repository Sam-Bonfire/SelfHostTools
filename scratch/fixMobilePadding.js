const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

const filesToFix = [
  'apps/calculators/src/components/CreatorEconomyCalculator.jsx',
  'apps/calculators/src/components/CarOwnershipCalculator.jsx',
  'apps/calculators/src/components/LifestyleCreepCalculator.jsx',
  'apps/calculators/src/components/SoloFounderCalculator.jsx',
  'apps/calculators/src/components/TaxBracketCalculator.jsx',
  'apps/visualizers/src/components/SWRHistoricalVisualizer.jsx',
  'apps/calculators/src/components/InternationalArbitrageCalculator.jsx',
  'apps/calculators/src/components/EmergencyFundCalculator.jsx'
];

filesToFix.forEach((relPath) => {
  const filePath = path.join(projectRoot, relPath);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping (not found): ${relPath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  console.log(`Processing: ${relPath}`);

  // Replace the Fragment start tag
  content = content.replace(
    /<>\r?\n\s*<CalculatorLayout>/g,
    '<div className="min-h-screen bg-white text-black p-4 md:p-8">\n      <CalculatorLayout>'
  );
  content = content.replace(
    /<>\n\s*<CalculatorLayout>/g,
    '<div className="min-h-screen bg-white text-black p-4 md:p-8">\n      <CalculatorLayout>'
  );

  // Replace the Fragment end tag (at the bottom)
  content = content.replace(/<Footer \/>\r?\n\s*<\/>/g, '<Footer />\n    </div>');
  content = content.replace(/<Footer \/>\n\s*<\/>/g, '<Footer />\n    </div>');

  fs.writeFileSync(filePath, content, 'utf-8');
});

console.log('\nAll mobile paddings and wrappers repaired.');
