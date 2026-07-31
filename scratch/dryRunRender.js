const fs = require('fs');
const path = require('path');

// --- Mock React & Environment ---
const React = {
  useState: (initial) => [typeof initial === 'function' ? initial() : initial, () => {}],
  useMemo: (factory) => factory(),
  useEffect: () => {},
  useCallback: (callback) => callback,
  useContext: () => ({}),
  useRef: () => ({ current: null }),
  createElement: (type, props, ...children) => ({ type, props, children }),
  Fragment: 'Symbol(react.fragment)',
  Suspense: ({ children }) => children,
  StrictMode: ({ children }) => children
};

// Mock JSX Runtime
const jsxMock = {
  jsx: (type, props) => ({ type, props }),
  jsxs: (type, props) => ({ type, props }),
  Fragment: 'Symbol(react.fragment)'
};

// Mock Lucide icons as simple string renderers
const lucideMock = new Proxy(
  {},
  {
    get: (target, prop) => {
      return (props) => `[LucideIcon: ${prop}]`;
    }
  }
);

// Mock Recharts
const rechartsMock = {
  ResponsiveContainer: ({ children }) => children,
  LineChart: ({ children }) => children,
  BarChart: ({ children }) => children,
  AreaChart: ({ children }) => children,
  PieChart: ({ children }) => children,
  Line: () => null,
  Bar: () => null,
  Area: () => null,
  Pie: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  Legend: () => null,
  CartesianGrid: () => null,
  Cell: () => null
};

// Mock Framer Motion
const motionMock = {
  motion: new Proxy(
    {},
    {
      get: (target, prop) => {
        // Return a dummy component that renders children
        const Component = ({ children, ...props }) => children || null;
        Component.displayName = `motion.${prop}`;
        return Component;
      }
    }
  ),
  AnimatePresence: ({ children }) => children
};

// Mock shared styling components
const stylingMock = {
  CalculatorLayout: ({ children }) => children,
  CalculatorHeader: () => '[CalculatorHeader]',
  ResultsAnalysis: ({ children }) => children,
  Input: () => '[Input]',
  Card: ({ children }) => children,
  DownloadButtons: () => '[DownloadButtons]',
  Footer: () => '[Footer]',
  Button: ({ children }) => children,
  Checkbox: () => '[Checkbox]',
  Tooltip: ({ children }) => children,
  Select: () => '[Select]',
  ToggleCard: () => '[ToggleCard]'
};

// Mock react-router-dom
const routerMock = {
  Link: ({ children }) => children,
  Outlet: () => '[Outlet]',
  useNavigate: () => () => {},
  useLocation: () => ({ pathname: '/' })
};

// Mock helmet
const helmetMock = {
  HelmetProvider: ({ children }) => children,
  Helmet: ({ children }) => children
};

// Intercept require calls to inject mocks
const originalRequire = module.constructor.prototype.require;
module.constructor.prototype.require = function (request) {
  if (request === 'react') return React;
  if (request === 'react/jsx-runtime') return jsxMock;
  if (request === 'lucide-react') return lucideMock;
  if (request === 'recharts') return rechartsMock;
  if (request === 'framer-motion') return motionMock;
  if (request === '@packages/styling') return stylingMock;
  if (request === 'react-router-dom') return routerMock;
  if (request === 'react-helmet-async') return helmetMock;
  if (request.endsWith('SEO') || request.endsWith('SEO.jsx')) {
    return () => '[SEO]';
  }
  return originalRequire.apply(this, arguments);
};

// Compile JSX files into runnable JS on the fly
const babel = require('@babel/core');

function runComponentRender(filePath) {
  try {
    let code = fs.readFileSync(filePath, 'utf-8');

    // Safety rewrite for Vite specific ESM import.meta.env
    code = code.replace(/import\.meta\.env/g, '({ VITE_SITE_URL: "https://calculators.yomite.in" })');

    // Transform JSX using babel
    const result = babel.transformSync(code, {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-react', { runtime: 'automatic' }]
      ],
      filename: filePath
    });

    // Evaluate transformed code
    const tempModule = { exports: {} };
    const contextRequire = (req) => {
      // Local relative resolution
      if (req.startsWith('.')) {
        const resolvedPath = path.resolve(path.dirname(filePath), req);
        // Try importing logic file
        try {
          if (fs.existsSync(resolvedPath + '.js')) return require(resolvedPath + '.js');
          if (fs.existsSync(resolvedPath + '.jsx')) return runComponentRender(resolvedPath + '.jsx');
          if (fs.existsSync(resolvedPath)) return require(resolvedPath);
        } catch (e) {
          // If logic file has ESM import, compile it on the fly
          const logicCode = fs.readFileSync(resolvedPath + '.js', 'utf-8');
          const logicTransformed = babel.transformSync(logicCode, {
            presets: [['@babel/preset-env', { targets: { node: 'current' } }]]
          });
          const evalModule = { exports: {} };
          new Function('exports', 'module', 'require', logicTransformed.code)(
            evalModule.exports,
            evalModule,
            contextRequire
          );
          return evalModule.exports;
        }
      }
      return require(req);
    };

    new Function('exports', 'module', 'require', result.code)(tempModule.exports, tempModule, contextRequire);

    const Component = tempModule.exports.default || tempModule.exports[Object.keys(tempModule.exports)[0]];
    if (typeof Component !== 'function') {
      throw new Error('Exported component is not a function');
    }

    // Trigger render with mock properties
    Component({});
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.stack || err.message };
  }
}

async function startAudit() {
  console.log('🔍 Starting dynamic UI dry-run rendering audit...\n');
  const componentsDir = path.join(__dirname, '../apps/calculators/src/components');
  const files = fs.readdirSync(componentsDir).filter((f) => f.endsWith('.jsx'));

  const results = [];
  for (const file of files) {
    // Ignore non-calculator pages or setup files
    if (
      [
        'SEO.jsx',
        'ScrollToTop.jsx',
        'PWAInstallPrompt.jsx',
        'Forbidden.jsx',
        'NotFound.jsx',
        'ErrorBoundary.jsx',
        'Root.jsx'
      ].includes(file)
    ) {
      continue;
    }

    const filePath = path.join(componentsDir, file);
    const renderRes = runComponentRender(filePath);
    if (renderRes.ok) {
      console.log(`✅ [RENDER OK] ${file}`);
      results.push({ file, ok: true });
    } else {
      console.log(`❌ [RENDER FAIL] ${file}`);
      console.log(`   Error details:\n   ${renderRes.error.split('\n').slice(0, 4).join('\n   ')}\n`);
      results.push({ file, ok: false, error: renderRes.error });
    }
  }

  const failed = results.filter((r) => !r.ok);
  console.log('\n--- AUDIT SUMMARY ---');
  console.log(`Total Calculators Audited: ${results.length}`);
  console.log(`Passed: ${results.length - failed.length}`);
  console.log(`Failed: ${failed.length}`);
  if (failed.length > 0) {
    process.exit(1);
  }
}

startAudit();
