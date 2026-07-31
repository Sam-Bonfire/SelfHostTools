const fs = require('fs');
const path = require('path');

function scanDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  const results = [];
  const list = fs.readdirSync(dirPath);
  for (const file of list) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      results.push(...scanDirectory(filePath));
    } else if (file.endsWith('.jsx')) {
      results.push(filePath);
    }
  }
  return results;
}

const componentFiles = [
  ...scanDirectory(path.join(__dirname, '../apps/calculators/src/components')),
  ...scanDirectory(path.join(__dirname, '../apps/visualizers/src/components'))
];

console.log(`Auditing ${componentFiles.length} component files...`);

componentFiles.forEach((file) => {
  const content = fs.readFileSync(file, 'utf-8');
  const relativePath = path.relative(path.join(__dirname, '..'), file).replace(/\\/g, '/');

  // Find instances of <CalculatorHeader or other headers
  // Regex to match header components and capture their attributes
  const headerRegex = /<([A-Za-z]+Header)\b([^>]*)\/?>/g;
  let match;
  while ((match = headerRegex.exec(content)) !== null) {
    const tagName = match[1];
    const attributes = match[2];

    // Find the icon prop
    const iconMatch = attributes.match(/icon\s*=\s*\{([^}]+)\}/);
    if (iconMatch) {
      const iconValue = iconMatch[1].trim();
      const isElement = iconValue.startsWith('<');
      console.log(`- File: [${relativePath}]`);
      console.log(`  Tag: <${tagName}>`);
      console.log(`  Icon Value: {${iconValue}}`);
      console.log(
        `  Type: ${isElement ? 'React Element (potentially bugged before our fix)' : 'React Component (safe)'}`
      );
      console.log('---');
    } else {
      // Check if it has an icon prop at all
      if (attributes.includes('icon=')) {
        console.log(`- File: [${relativePath}]`);
        console.log(`  Tag: <${tagName}>`);
        console.log(`  Has icon attribute but failed to parse value: ${attributes.trim()}`);
        console.log('---');
      }
    }
  }
});
