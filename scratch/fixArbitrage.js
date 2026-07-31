const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../apps/calculators/src/components/InternationalArbitrageCalculator.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace the unbalanced closing tag
content = content.replace('</div>\r\n    </div>\r\n    </CalculatorLayout>', '</div>\r\n    </CalculatorLayout>');
content = content.replace('</div>\n    </div>\n    </CalculatorLayout>', '</div>\n    </CalculatorLayout>');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Balanced JSX tags in InternationalArbitrageCalculator.jsx');
