# Workspace Customizations

## 🏗️ Macro-Economic Data
When building or modifying calculators and visualizers, **NEVER** hardcode default values for financial indicators like inflation, market returns, interest rates, or tax brackets.
Instead, you MUST import the `@packages/macro-data` package and use its properties as the default fallback in `usePersistedState`.

Example:
```javascript
import { macroData } from '@packages/macro-data';
// ...
const [inflationRate, setInflationRate] = usePersistedState('MyCalculator', 'inflationRate', macroData.inflation.general);
```

If the required data point does not exist in `macroData`, you must update `packages/macro-data/data/latest.json` and its corresponding fetch script (`packages/macro-data/scripts/update.js`) to include it before using it in the calculator.
