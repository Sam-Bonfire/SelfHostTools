import fs from 'fs';
import path from 'path';

function processFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (!file.endsWith('.jsx')) continue;
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf-8');

        // 1. Remove local Footer import
        content = content.replace(/import\s+Footer\s+from\s+['"]\.\/Footer['"];?\n?/g, '');

        // 2. Add Footer to @packages/styling import
        const stylingImportRegex = /import\s+\{([^}]+)\}\s+from\s+['"]@packages\/styling['"];?/;
        const stylingMatch = content.match(stylingImportRegex);
        
        let hasStylingImport = false;
        if (stylingMatch) {
            hasStylingImport = true;
            const imports = stylingMatch[1].split(',').map(s => s.trim()).filter(Boolean);
            if (!imports.includes('Footer')) {
                imports.push('Footer');
                content = content.replace(stylingImportRegex, `import { ${imports.join(', ')} } from '@packages/styling';`);
            }
        } else {
            // Add new import if it doesn't exist
            // Don't add if the file doesn't even export a component (like SEO.jsx might just export SEO, but wait, SEO.jsx doesn't need a footer).
            // Actually, we'll only add it if we inject a footer.
        }

        // 3. Check if <Footer> or <Footer /> is used
        const hasFooter = /<Footer[\s/>]/.test(content);
        if (!hasFooter && file !== 'SEO.jsx' && file !== 'ScrollToTop.jsx' && file !== 'PWAInstallPrompt.jsx') {
            // Find the last </div> before the end of the return statement
            // Usually the return statement is at the end of the file.
            // Let's find the last </div>
            const lastDivIndex = content.lastIndexOf('</div>');
            if (lastDivIndex !== -1) {
                // inject <Footer /> just before the last </div>
                content = content.slice(0, lastDivIndex) + '\n      <Footer />\n    ' + content.slice(lastDivIndex);
                console.log(`Injected Footer in ${file}`);
                
                if (!hasStylingImport) {
                    content = `import { Footer } from '@packages/styling';\n` + content;
                }
            }
        }

        fs.writeFileSync(filePath, content, 'utf-8');
    }
}

processFiles('./apps/calculators/src/components');
processFiles('./apps/visualizers/src/components');
