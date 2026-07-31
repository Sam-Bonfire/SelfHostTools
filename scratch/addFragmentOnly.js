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

  // 1. Wrap the return statement with <> (React Fragment start tag)
  content = content.replace(/(return\s*\(\r?\n([\t ]*)<CalculatorLayout>)/g, (match, p1, p2) => {
    console.log(`  -> Added Fragment start tag`);
    return `return (\n${p2}<>\n${p2}  <CalculatorLayout>`;
  });

  // 2. Add </> (React Fragment end tag) after the Footer element at the end of the return statement
  // We match </CalculatorLayout> followed by any whitespace, <Footer />, and whitespace/parenthesis
  const footerPatternRegex = /(<\/CalculatorLayout>\s*<Footer \/>\s*)(\);)/;
  if (footerPatternRegex.test(content)) {
    content = content.replace(footerPatternRegex, (match, p1, p2) => {
      console.log(`  -> Added Fragment end tag`);
      return `${p1}      </>\n    ${p2}`;
    });
  } else {
    console.log(`  -> Warning: Footer pattern not found!`);
  }

  fs.writeFileSync(filePath, content, 'utf-8');
});

console.log('\nAll fragment fixes complete.');
