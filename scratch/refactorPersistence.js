const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath, '.jsx');
  let changed = false;

  // 1. Replace useState with usePersistedState
  const useStateRegex = /const\s+\[\s*(\w+)\s*,\s*(set\w+)\s*\]\s*=\s*useState\s*\(([\s\S]*?)\)\s*;/g;

  if (useStateRegex.test(content)) {
    content = content.replace(useStateRegex, (match, p1, p2, p3) => {
      return `const [${p1}, ${p2}] = usePersistedState('${fileName}', '${p1}', ${p3});`;
    });
    changed = true;
  }

  // 2. Add imports
  if (changed && !content.includes('usePersistedState')) {
    const importStatement = `import { usePersistedState, resetPersistedState } from '@packages/components';\n`;
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const endOfLastImport = content.indexOf('\n', lastImportIndex);
      content = content.slice(0, endOfLastImport + 1) + importStatement + content.slice(endOfLastImport + 1);
    } else {
      content = importStatement + content;
    }
  }

  // 3. Inject onReset into CalculatorHeader
  const headerRegex = /<CalculatorHeader([^>]*?)>/g;
  if (changed && headerRegex.test(content)) {
    content = content.replace(headerRegex, (match, props) => {
      // Avoid injecting multiple times or injecting into unclosed tags if complex
      if (props.includes('onReset')) return match;

      // If props ends with something else, make sure we append cleanly
      // Let's just append it before the closing >
      return (
        `<CalculatorHeader${props}\n            onReset={() => { resetPersistedState('${fileName}'); window.location.reload(); }}` +
        '>'
      );
    });
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Processed: ${fileName}`);
  }
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    if (file.endsWith('.jsx')) {
      processFile(path.join(dirPath, file));
    }
  }
}

// Process calculators
const calculatorsDir = path.join(process.cwd(), 'apps/calculators/src/components');
if (fs.existsSync(calculatorsDir)) {
  processDirectory(calculatorsDir);
}

// Process visualizers
const visualizersDir = path.join(process.cwd(), 'apps/visualizers/src/components');
if (fs.existsSync(visualizersDir)) {
  processDirectory(visualizersDir);
}

console.log('Refactoring complete.');
