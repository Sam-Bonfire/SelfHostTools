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

  // 2. Wrap CalculatorHeader in lg:col-span-12 (defensively)
  const headerRegex = /(?:<div className="lg:col-span-12">\s*)?(<CalculatorHeader[\s\S]*?\n\s*\/>)/;
  content = content.replace(headerRegex, (match) => {
    if (match.startsWith('<div')) {
      console.log(`  -> CalculatorHeader already wrapped`);
      return match;
    }
    console.log(`  -> Wrapped CalculatorHeader`);
    return `<div className="lg:col-span-12">\n        ${match}\n      </div>`;
  });

  // 3. Find the first occurrence of <div className="grid grid-cols-1 ... after <CalculatorLayout>
  // and prefix it with the lg:col-span-12 wrapper (defensively)
  const bodyDivRegex =
    /(?:<div className="lg:col-span-12">\s*)?(<div className="grid grid-cols-1 (?:lg:grid-cols-12|lg:grid-cols-3) gap-8(?: [^>]+)?">)/;
  content = content.replace(bodyDivRegex, (match) => {
    if (match.startsWith('<div className="lg:col-span-12"')) {
      console.log(`  -> Body grid already wrapped`);
      return match;
    }
    console.log(`  -> Prefixed body grid with wrapper`);
    return `<div className="lg:col-span-12">\n      ${match}`;
  });

  // 4. Move Footer outside of CalculatorLayout, close the new lg:col-span-12 wrapper div, and close the Fragment
  // Use a highly relaxed whitespace regex to ignore indentation and line ending variations
  const footerPatternRegex = /\s*<Footer \/>\s*<\/div>\s*<\/CalculatorLayout>/;
  if (footerPatternRegex.test(content)) {
    content = content.replace(
      footerPatternRegex,
      '\n      </div>\n    </div>\n  </CalculatorLayout>\n  <Footer />\n</>'
    );
    console.log(`  -> Extracted Footer outside of CalculatorLayout with Fragment closing`);
  } else {
    // Edge case for InternationalArbitrageCalculator which has different wrapping
    const arbitrageFooterPattern = /\s*<Footer \/>\s*<\/CalculatorLayout>/;
    if (arbitrageFooterPattern.test(content)) {
      content = content.replace(arbitrageFooterPattern, '\n  </CalculatorLayout>\n  <Footer />\n</>');
      console.log(`  -> Extracted Footer outside of CalculatorLayout (Arbitrage)`);
    } else {
      console.log(`  -> Warning: Footer pattern not found!`);
    }
  }

  fs.writeFileSync(filePath, content, 'utf-8');
});

console.log('\nAll layout repairs complete.');
