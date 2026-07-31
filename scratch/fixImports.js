const fs = require('fs');
const path = require('path');

function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath, '.jsx');

  if (
    content.includes('usePersistedState') &&
    !content.includes(`import { usePersistedState, resetPersistedState } from '@packages/components'`)
  ) {
    const importStatement = `import { usePersistedState, resetPersistedState } from '@packages/components';\n`;
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const endOfLastImport = content.indexOf('\n', lastImportIndex);
      content = content.slice(0, endOfLastImport + 1) + importStatement + content.slice(endOfLastImport + 1);
    } else {
      content = importStatement + content;
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Added import to: ${fileName}`);
  }
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    if (file.endsWith('.jsx')) {
      fixImports(path.join(dirPath, file));
    }
  }
}

const calculatorsDir = path.join(process.cwd(), 'apps/calculators/src/components');
if (fs.existsSync(calculatorsDir)) processDirectory(calculatorsDir);

const visualizersDir = path.join(process.cwd(), 'apps/visualizers/src/components');
if (fs.existsSync(visualizersDir)) processDirectory(visualizersDir);

console.log('Imports fixed.');
