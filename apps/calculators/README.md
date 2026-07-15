# Financial Calculators Package Documentation

The `@packages/calculators` workspace is the primary user-facing application in the SelfHostTools suite. It is built as a highly interactive, responsive web application focused on financial planning.

## 🧠 Core Philosophy: "Computed Reality"

Standard calculators often mislead users by using gross numbers. This suite adheres to a "Computed Reality" philosophy:

1.  **Inflation is mandatory**: Future values are always contextualized with inflation-adjusted "Real Value".
2.  **Taxes are unavoidable**: Investment returns and freelance income always include tax estimation logic.
3.  **Time has cost**: Unpaid time off and admin hours are quantified financially.

---

## 🧮 Calculator Modules

### 0. Calculator Hub (Home)

- **Logic**: `src/components/Root.jsx`
- **Features**:
  - **Dynamic Search**: Real-time filtering by name and description.
  - **Category Filters**: Scrollable Neo-Brutalist buttons with auto-centering logic.
  - **Accessibility**: Hidden scrollbars with Chevron navigation for keyboard/mouse users.

### 1. Freelance Real Income Calculator

- **Logic**: `src/lib/freelanceLogic.js`
- **Tests**: `src/tests/freelanceLogic.test.js`
- **Features**: Deconstructs hourly rate into "Real Hourly Wage" by deducting:
  - Unpaid Time Off (Vacations/Sick days).
  - Unbillable Admin Time (Emails, Sales).
  - Business Overheads (SaaS, Hardware amortization).
  - Taxes (Standard vs 44ADA Presumptive).

### 2. FIRE (Financial Independence, Retire Early) Calculator

- **Logic**: `src/lib/fireLogic.js`
- **Tests**: `src/tests/fireLogic.test.js`
- **Features**:
  - **"Years to Freedom"**: Countdowns based on savings rate.
  - **Inflation Adjustment**: All future corpora shown in today's value.
  - **Lifestyle Inflation**: Guided presets (Minimal to High) to model spending growth over time.
  - **Safety Checks**: Alerts if withdrawal rate exceeds safe limits.

### 3. SIP (Systematic Investment Plan) Calculator

- **Logic**: `src/lib/sipLogic.js`
- **Tests**: `src/tests/sipLogic.test.js`
- **Features**:
  - **Step-Up**: Annual contribution increase modeling.
  - **Quick Allocation**: Presets for Aggressive (80% Equity), Balanced (50%), and Safe (20%) profiles.
  - **Reality Deductions**: Calculates "Real Maturity Value" after Inflation, Expense Ratio, and LTCG Tax.

### 4. Life Insurance (HLV) Calculator

- **Logic**: `src/lib/lifeInsuranceLogic.js`
- **Tests**: `src/tests/lifeInsuranceLogic.test.js`
- **Features**:
  - **Goal Wizard**: Quick-add presets for Education, Marriage, and Assets.
  - **Expense Replacement**: Calculates corpus needed to replace earner's contribution forever.
  - **Gap Analysis**: `Required Cover - Existing Assets`.

### 5. Education Loan Calculator

- **Logic**: `src/lib/educationLoanLogic.js`
- **Tests**: `src/tests/educationLoanLogic.test.js`
- **Features**:
  - **Advanced Mode**: Supports multi-tranche disbursements with varying dates.
  - **Moratorium**: Calculates interest accrual during study + grace period.

### 6. Buy vs Rent Calculator

- **Logic**: `src/lib/homeLoanRentLogic.js`
- **Tests**: `src/tests/homeLoanRentLogic.test.js`
- **Features**:
  - **Opportunity Cost**: Models investing the difference (EMI - Rent) into equity.
  - **Detailed Schedules**: Exportable side-by-side comparison of wealth growth.

### 7. Golden Handcuffs Calculator

- **Logic**: `src/lib/goldenHandcuffsLogic.js`
- **Tests**: `src/tests/goldenHandcuffsLogic.test.js`
- **Features**: Calculates true cost of leaving (RSUs, Benefits, Clawbacks).

### 8. Home Owner Realist Calculator

- **Logic**: `src/lib/homeOwnerLogic.js`
- **Tests**: `src/tests/homeOwnerLogic.test.js`
- **Features**:
  - **Maintenance Audit**: Comprehensive list of repairs with inflation-adjusted sinking funds.
  - **Timeline of Doom**: Visual vertical timeline of future big-ticket repairs.
  - **Equity Projection**: Projects net worth vs. opportunity cost of down payment.

### 9. True Hourly Wage Calculator

- **Logic**: `src/lib/trueHourlyWageLogic.js`
- **Tests**: `src/tests/trueHourlyWageLogic.test.js`
- **Features**: Real income per hour after commute, taxes, and prep.

### 11. Job Relocation Calculator

- **Logic**: `src/lib/relocationLogic.js`
- **Tests**: `src/tests/relocationLogic.test.js`
- **Features**:
  - **Total Compensation Analysis**: Compares Salary + Benefits (Health, PF, Stock).
  - **Friction Costs**: Friction cost estimator for moving logistics.
  - **Commute Impact**: Side-by-side analysis of commute time and cost.
  - **Expense Granularity**: Detailed breakdown of current vs new city expenses.

### 12. TDEE Calculator

- **Logic**: `src/lib/tdeeLogic.js`
- **Tests**: `src/tests/tdeeLogic.test.js`
- **Features**:
  - **Mifflin-St Jeor Equation**: Gold standard for accuracy.
  - **Goal Targets**: Maintenance, Cutting (-500), Extreme Cut (-1000), Bulking (+500).
  - **Unit Agnostic**: Seamless toggle between Metric (kg/cm) and Imperial (lbs/ft+in).

---

### 13. Invest vs Payoff Calculator

- **Logic**: `src/lib/investVsPayoffLogic.js`
- **Tests**: `src/tests/investVsPayoffLogic.test.js`
- **Features**: Compare net worth outcomes of investing surplus vs aggressively paying debt.

---

## 🛠 Shared Utilities & Architecture

### Logic Separation

To ensure robustness, **all calculation logic is extracted** from UI components into pure JavaScript modules in `src/lib/`. This allows for:

1.  **Unit Testing**: logic is tested in isolation using `vitest` (100% logic coverage).
2.  **Reusability**: Logic can be reused in different contexts (e.g. bulk analysis tools).

### `downloadUtils.js`

A centralized export engine located in `src/lib/`.

- **PDF Generation**: Uses `jspdf` and `jspdf-autotable`. Generates branded reports.
- **Excel Export**: Uses `xlsx`. Creates multi-sheet workbooks with raw data.

### SEO Component

Now a shared component imported from `@packages/components`. Injects `react-helmet-async` tags for Title, Description, Canonical URLs (via `VITE_SITE_URL`), and JSON-LD Structured Data Schema.

### UI Standardization

Starting from Phase 6, all calculators use a unified layout system from `@packages/styling`:

- `CalculatorLayout`: Standardized grid and spacing.
- `CalculatorHeader`: Consistent title/icon/description block.
- `CalculatorHeader`: Consistent title/icon/description block.
- `ResultsAnalysis`: A unified container for displaying the primary "verdict" and detailed breakdowns.

### Accessibility Standards (A11y)

- **Labeling**: Every `Input`, `Select`, and `Checkbox` MUST have a unique `id` and a corresponding `label` with `htmlFor`.
- **Dynamic Content**: The `ResultsAnalysis` component uses `aria-live="polite"` to announce result updates to screen readers.
- **Keyboard Navigation**: All interactive elements are reachable via keyboard, with logical tab orders maintained even for dynamic lists.

### Navigation & UX

- **ScrollToTop**: Automatically resets scroll position when navigating between calculators.
- **Local Persistence**: All inputs are auto-saved to `localStorage` to preserve progress.

---

## 🚀 Build & Deployment

### Dynamic Sitemap Generation

The application features an automated sitemap generator script (`scripts/generate-sitemap.js`) that:

1.  **Scans Routes**: Parses `src/main.jsx` to find all active calculator routes.
2.  **Generates XML**: Creates a standard `sitemap.xml` in the `public/` directory.
3.  **Prioritization**: Assigns default priorities (0.8 for tools, 1.0 for home).

### Environment Variables

The build process **requires** the `VITE_SITE_URL` environment variable to prevent leaking testing URLs into production sitemaps.

- **Source**: Reads from `.env.local` or system environment variables.
- **Mandatory**: The build will fail if this variable is missing.

### Build Command

The standard build pipeline is:

```bash
pnpm run build
# Chains:
# 1. pnpm run test (Validate Logic)
# 2. pnpm run generate-sitemap (Update SEO)
# 3. vite build (Compile App)
```
