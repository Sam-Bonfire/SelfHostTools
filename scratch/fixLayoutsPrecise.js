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

  // 1. Wrap the return statement in a React Fragment (<> ... </>)
  content = content.replace(/(return\s*\(\r?\n([\t ]*)<CalculatorLayout>)/g, (match, p1, p2) => {
    console.log(`  -> Added React Fragment start tag`);
    return `return (\n${p2}<>\n${p2}  <CalculatorLayout>`;
  });

  // 2. Wrap CalculatorHeader in lg:col-span-12 (only if it hasn't been wrapped already)
  const headerRegex = /(<CalculatorHeader[\s\S]*?\n\s*\/>)/;
  content = content.replace(headerRegex, (match) => {
    if (match.includes('<div className="lg:col-span-12">')) return match;
    console.log(`  -> Wrapped CalculatorHeader`);
    return `<div className="lg:col-span-12">\n        ${match}\n      </div>`;
  });

  // 3. Find the first occurrence of <div className="grid grid-cols-1 ... after <CalculatorLayout>
  // and prefix it with the lg:col-span-12 wrapper
  const bodyDivRegex = /<div className="grid grid-cols-1 (?:lg:grid-cols-12|lg:grid-cols-3) gap-8(?: [^>]+)?">/;
  content = content.replace(bodyDivRegex, (match) => {
    console.log(`  -> Prefixed body grid with wrapper`);
    return `<div className="lg:col-span-12">\n      ${match}`;
  });

  // 4. Move Footer outside of CalculatorLayout, close the new lg:col-span-12 wrapper div, and close the Fragment
  // The original files end with:
  //       <Footer />
  //     </div>
  //     </CalculatorLayout>
  //
  // We transform it to:
  //       </div>
  //     </div>
  //     </CalculatorLayout>
  //     <Footer />
  //   </>
  const footerPatternRegex = /([\t ]*)<Footer \/>\r?\n([\t ]*)<\/div>\r?\n([\t ]*)<\/CalculatorLayout>/;
  content = content.replace(footerPatternRegex, (match, indent1, indent2, indent3) => {
    console.log(`  -> Extracted Footer outside of CalculatorLayout with Fragment closing`);
    // Subtract some spacing to align the Fragment closing tag with the return statement
    const fragIndent = indent3.substring(2) || '';
    return `${indent1}</div>\n${indent2}</div>\n${indent3}</CalculatorLayout>\n${indent3}<Footer />\n${fragIndent}</>`;
  });

  fs.writeFileSync(filePath, content, 'utf-8');
});

console.log('\nAll layout repairs complete.');
