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
  'apps/calculators/src/components/InternationalArbitrageCalculator.jsx'
];

filesToFix.forEach((relPath) => {
  const filePath = path.join(projectRoot, relPath);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping (not found): ${relPath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  console.log(`Processing: ${relPath}`);

  // 1. Wrap CalculatorHeader in col-span-12 if it hasn't been wrapped
  if (
    content.includes('<CalculatorHeader') &&
    !content.includes('<div className="lg:col-span-12">\n        <CalculatorHeader') &&
    !content.includes('<div className="lg:col-span-12">\r\n        <CalculatorHeader')
  ) {
    // Locate the CalculatorHeader block and wrap it
    // Match <CalculatorHeader ... />
    const headerRegex = /<CalculatorHeader[\s\S]*?\/>/;
    const headerMatch = content.match(headerRegex);
    if (headerMatch) {
      const headerStr = headerMatch[0];
      // Indent header string slightly
      const indentedHeader = headerStr
        .split('\n')
        .map((line) => '        ' + line.trim())
        .join('\n');
      const wrappedHeader = `<div className="lg:col-span-12">\n${indentedHeader}\n      </div>`;
      content = content.replace(headerRegex, wrappedHeader);
      console.log(`  -> Wrapped CalculatorHeader in lg:col-span-12`);
    }
  }

  // 2. Wrap the sibling grid block in col-span-12 if it matches the pattern
  // e.g. <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
  // We want to find the first sibling grid div after <CalculatorLayout>
  const layoutRegex = /<CalculatorLayout>([\s\S]*?)<\/CalculatorLayout>/;
  const layoutMatch = content.match(layoutRegex);
  if (layoutMatch) {
    let innerJSX = layoutMatch[1];

    // We want to wrap the body content inside a <div className="lg:col-span-12"> if it isn't already.
    // In our files, the body content starts after the wrapped header (or after CalculatorHeader if not wrapped yet).
    // Let's identify if the inner content has a sibling like <div className="grid grid-cols-1
    // or <div className="grid grid-cols-1 lg:grid-cols-12
    const gridDivRegex = /(<div className="grid grid-cols-1[\s\S]*<\/div>)\s*$/;

    // If the file has a nested grid after the header, wrap that nested grid in lg:col-span-12
    const lines = innerJSX.split('\n');
    let headerEndIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (
        lines[i].includes('</CalculatorHeader>') ||
        (lines[i].includes('<CalculatorHeader') && lines[i].includes('/>') && !lines[i].includes('icon={'))
      ) {
        headerEndIndex = i;
      }
    }

    // Alternative: find where </div> of the wrapped header is
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('</div>') && i > 0 && lines[i - 1].includes('CalculatorHeader')) {
        headerEndIndex = i;
      }
    }

    // If we have a header wrapper, let's find the sibling grid div
    const siblingGridRegex = /(<div className="grid grid-cols-1[\s\S]*?<\/div>)\s*(?:<Footer \/>)?\s*$/;

    // Let's make it simpler: find the outer grid div and replace it
    // Pattern: <CalculatorHeader ... /> \n\n <div className="grid grid-cols-1 lg:grid-cols-12 gap-8"> ... </div>
    // We want to wrap the body div in <div className="lg:col-span-12">
    const bodyPattern = /(<\/div>\s*|\/>\s*)\n\s*(<div className="grid grid-cols-1[^>]*>)/;
    const bodyMatch = content.match(bodyPattern);
    if (bodyMatch) {
      const matchStr = bodyMatch[2]; // the <div className="grid...
      // We will replace it with: <div className="lg:col-span-12">\n        <div className="grid...
      // And we need to add a closing </div> before </CalculatorLayout>
      content = content.replace(
        bodyMatch[0],
        bodyMatch[1] + '\n      <div className="lg:col-span-12">\n        ' + matchStr
      );

      // Add the matching closing tag right before </CalculatorLayout>
      // If Footer is inside, we will extract it anyway, so putting it before </CalculatorLayout> is perfect.
      content = content.replace('</CalculatorLayout>', '      </div>\n    </CalculatorLayout>');
      console.log(`  -> Wrapped body content in lg:col-span-12`);
    }
  }

  // 3. Move <Footer /> outside of CalculatorLayout
  if (content.includes('<Footer />') && content.includes('</CalculatorLayout>')) {
    const lines = content.split('\n');
    let footerLineIndex = -1;
    let layoutEndIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('<Footer />')) footerLineIndex = i;
      if (lines[i].includes('</CalculatorLayout>')) layoutEndIndex = i;
    }

    if (footerLineIndex !== -1 && layoutEndIndex !== -1 && footerLineIndex < layoutEndIndex) {
      // Remove Footer line
      lines.splice(footerLineIndex, 1);
      // Re-find layoutEndIndex after splice
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('</CalculatorLayout>')) layoutEndIndex = i;
      }
      // Insert Footer right after </CalculatorLayout>
      lines.splice(layoutEndIndex + 1, 0, '    <Footer />');
      content = lines.join('\n');
      console.log(`  -> Moved Footer outside CalculatorLayout`);
    }
  }

  fs.writeFileSync(filePath, content, 'utf-8');
});

console.log('\nAll layout fixes complete.');
