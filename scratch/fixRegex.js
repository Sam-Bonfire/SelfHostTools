const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath, '.jsx');

  // Find cases where it looks like `/\n            onReset`
  // We want to move the `/` to the end.
  const badRegex = /\/\s*onReset=\{\(\) => \{ resetPersistedState\('[^']+'\); window\.location\.reload\(\); \}\}>/g;

  if (badRegex.test(content)) {
    content = content.replace(badRegex, (match) => {
      // return the onReset without the preceding slash, but WITH a trailing slash
      return `\n            onReset={() => { resetPersistedState('${fileName}'); window.location.reload(); }} />`;
    });
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${fileName}`);
  }
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    if (file.endsWith('.jsx')) {
      fixFile(path.join(dirPath, file));
    }
  }
}

const calculatorsDir = path.join(process.cwd(), 'apps/calculators/src/components');
if (fs.existsSync(calculatorsDir)) processDirectory(calculatorsDir);

const visualizersDir = path.join(process.cwd(), 'apps/visualizers/src/components');
if (fs.existsSync(visualizersDir)) processDirectory(visualizersDir);

console.log('Fix complete.');
