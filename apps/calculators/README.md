# Financial Calculators Package Documentation

The `@packages/calculators` workspace is the primary user-facing application in the SelfHostTools suite. It is built as a highly interactive, responsive web application focused on financial planning.

## 🧠 Core Philosophy: "Computed Reality"
Standard calculators often mislead users by using gross numbers. This suite adheres to a "Computed Reality" philosophy:
1.  **Inflation is mandatory**: Future values are always contextualized with inflation-adjusted "Real Value".
2.  **Taxes are unavoidable**: Investment returns and freelance income always include tax estimation logic.
3.  **Time has cost**: Unpaid time off and admin hours are quantified financially.

---

## 🧮 Calculator Modules

### 1. Freelance Real Income Calculator
*   **Logic**: `src/lib/freelanceLogic.js`
*   **Tests**: `src/tests/freelanceLogic.test.js`
*   **Features**: Deconstructs hourly rate into "Real Hourly Wage" by deducting:
    *   Unpaid Time Off (Vacations/Sick days).
    *   Unbillable Admin Time (Emails, Sales).
    *   Business Overheads (SaaS, Hardware amortization).
    *   Taxes (Standard vs 44ADA Presumptive).

### 2. FIRE (Financial Independence, Retire Early) Calculator
*   **Logic**: `src/lib/fireLogic.js`
*   **Tests**: `src/tests/fireLogic.test.js`
*   **Features**:
    *   **"Years to Freedom"**: Countdowns based on savings rate.
    *   **Inflation Adjustment**: All future corpora shown in today's value.
    *   **Safety Checks**: Alerts if withdrawal rate exceeds safe limits.

### 3. SIP (Systematic Investment Plan) Calculator
*   **Logic**: `src/lib/sipLogic.js`
*   **Tests**: `src/tests/sipLogic.test.js`
*   **Features**:
    *   **Step-Up**: Annual contribution increase modeling.
    *   **Reality Deductions**: Calculates "Real Maturity Value" after Inflation, Expense Ratio, and LTCG Tax.

### 4. Life Insurance (HLV) Calculator
*   **Logic**: `src/lib/lifeInsuranceLogic.js`
*   **Tests**: `src/tests/lifeInsuranceLogic.test.js`
*   **Features**:
    *   **Expense Replacement**: Calculates corpus needed to replace earner's contribution forever.
    *   **Goal Protection**: Adds PV of future goals (Education, Marriage).
    *   **Gap Analysis**: `Required Cover - Existing Assets`.

### 5. Education Loan Calculator
*   **Logic**: `src/lib/educationLoanLogic.js`
*   **Tests**: `src/tests/educationLoanLogic.test.js`
*   **Features**:
    *   **Advanced Mode**: Supports multi-tranche disbursements with varying dates.
    *   **Moratorium**: Calculates interest accrual during study + grace period.
    *   **Capitalization**: Option to capitalize interest or pay it off.

### 6. Buy vs Rent Calculator
*   **Logic**: `src/lib/homeLoanRentLogic.js`
*   **Tests**: `src/tests/homeLoanRentLogic.test.js`
*   **Features**:
    *   **Opportunity Cost**: Models investing the difference (EMI - Rent) into equity.
    *   **Maintenance & Tax**: Includes maintenance/inflation for owners, rent inflation for tenants.
    *   **"Verdict"**: Declares a clear winner based on Net Worth at the end of tenure.

### 7. Golden Handcuffs Calculator
*   **Logic**: `src/lib/goldenHandcuffsLogic.js`
*   **Tests**: `src/tests/goldenHandcuffsLogic.test.js`
*   **Features**: Calculates the true cost of leaving a job by factoring in unvested RSUs, Options, and joining/retention clawbacks.

### 8. Home Owner Realist Calculator
*   **Logic**: `src/lib/homeOwnerRealistLogic.js`
*   **Tests**: `src/tests/homeOwnerRealistLogic.test.js`
*   **Features**: Focuses on the "Hidden Costs" of home ownership, including sinking funds for maintenance, insurance, and long-term repairs.

### 9. True Hourly Wage Calculator
*   **Logic**: `src/lib/trueHourlyWageLogic.js`
*   **Tests**: `src/tests/trueHourlyWageLogic.test.js`
*   **Features**: Reveals your real income per hour after accounting for commute time, taxes, work-related expenses, and unpaid prep time.

### 10. Degree ROI Calculator
*   **Logic**: `src/lib/degreeROILogic.js`
*   **Tests**: `src/tests/degreeROILogic.test.js`
*   **Features**: Compares the 20-30 year ROI of pursuing a degree vs. entering the workforce immediately, accounting for loan interest and opportunity costs.

---

## 🛠 Shared Utilities & Architecture

### Logic Separation
To ensure robustness, **all calculation logic is extracted** from UI components into pure JavaScript modules in `src/lib/`. This allows for:
1.  **Unit Testing**: logic is tested in isolation using `vitest` (100% logic coverage).
2.  **Reusability**: Logic can be reused in different contexts (e.g. bulk analysis tools).

### `downloadUtils.js`
A centralized export engine located in `src/lib/`.
*   **PDF Generation**: Uses `jspdf` and `jspdf-autotable`. Generates branded reports.
*   **Excel Export**: Uses `xlsx`. Creates multi-sheet workbooks with raw data.

### SEO Component (`src/components/SEO.jsx`)
Injects `react-helmet-async` tags for Title, Description, Canonical URLs (via `VITE_SITE_URL`), and JSON-LD Structured Data Schema.

### UI Standardization
Starting from Phase 6, all calculators use a unified layout system from `@packages/styling`:
*   `CalculatorLayout`: Standardized grid and spacing.
*   `CalculatorHeader`: Consistent title/icon/description block.
*   `ResultsAnalysis`: A unified container for displaying the primary "verdict" and detailed breakdowns.

### Navigation & UX
*   **ScrollToTop**: Automatically resets scroll position when navigating between calculators.
*   **Local Persistence**: All inputs are auto-saved to `localStorage` to preserve progress.
