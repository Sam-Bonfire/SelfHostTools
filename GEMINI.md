# GEMINI Context File

## 🤖 Project Evolution & Steering Log
This document records the user-driven evolution of the **SelfHostTools** project. It serves as context for the AI agent to understand not just *what* the code is, but *why* it is that way.

---

### Phase 1: Foundation & "Neo-Brutalism" (Dashboard Era)
*   **Initial Goal**: Create a self-hosted dashboard for personal services.
*   **Key Decision**: Adopted a **Neo-Brutalism design style**.
    *   *Directive*: "Make it look different. Use bold borders, yellow/black contrast, hard shadows."
    *   *Result*: The `@packages/styling` library was born to enforce `border-4 border-black`, `shadow-[4px_4px_0px_0px]`, and bold typography across all future apps.

### Phase 2: The Pivot to Calculators (FIRE & SIP)
*   **Pivot**: The user shifted focus from a generic dashboard to specific High-Value Financial Tools.
*   **FIRE Calculator**:
    *   *Requirement*: "Don't just give me a number. Tell me if I'm free."
    *   *Features*: Added "Years to Freedom" countdowns, inflation-adjusted "Real Value", and pre-retirement vs post-retirement split.
*   **SIP Calculator**:
    *   *Requirement*: "Real returns, not nominal."
    *   *Features*: Added "Step-Up" (annual increase) logic and massive focus on "Reality Deductions" (Inflation, Expense Ratio, Tax). The goal became *demystifying* wealth.

### Phase 3: "Freelance Reality" & Granularity
*   **Freelance Calculator**: The most complex tool built.
*   **Problem**: Freelancers overestimate their income by ignoring overheads.
*   **Evolution**:
    1.  **Basic Inputs**: Hourly Rate, Hours.
    2.  **Reality Check**: Added "Unpaid Time Off" (Vacations) -> Users realized they don't work 52 weeks.
    3.  **Tax Sophistication**: Added **44ADA Presumptive Tax** support.
        *   *Steering*: "Make it educational." -> We moved the checkbox to a dedicated "Tax Strategy" card that explains *why* it's a benefit (50% taxable income).
    4.  **Granular Expenses**: User requested breaking down vague "Expenses" into specific buckets: Rent, Software, Hardware Fund, Insurance.
    5.  **Project Fee Estimator**: Added a tool to help freelancers quote projects. It reverses the logic: *Desired Income + Expenses -> Required Quote*.
    6.  **Admin Time Estimator**: Added a sub-widget to calculate unbillable % based on daily tasks (Email, Sales, Learning).

### Phase 4: Standardization & Exports
*   **Export Feature**: "I want to take this data offline."
    *   *Action*: Built `downloadUtils.js` to handle PDF/Excel generation for *all* calculators.
    *   *Refinement*: Ensure exports include the detailed inputs (like the new admin breakdown) and summary schedules.
*   **Consistency**:
    *   Refactored inputs across all calculators to share the same layout (Icons, Labels, Tooltips).
    *   Standardized the "Results" card to always show a "Monthly View" vs "Annual View" toggle or clarity.

### Phase 5: Maturity & Robustness (Testing & Expansion)
*   **Monorepo Hardening**:
    *   **Logic Extraction**: Separated pure calculation logic into `apps/calculators/src/lib/` (e.g., `freelanceLogic.js`) to strictly decouple UI from Math.
    *   **Unit Testing**: Implemented 100% logic coverage using coverage using `vitest` in `apps/calculators/src/tests/`. Every calculator now has a corresponding test suite.
    *   **Config Managment**: Moved all hardcoded URLs and secrets to `.env` files, using `import.meta.env`.
    *   **Deployment**: Added a cross-platform `deploy.sh` for Linux/Mac alongside the separate `deploy.ps1`.
*   **New Tools**:
    *   **Education Loan**: Added support for advanced multi-tranche disbursements and moratorium periods.
    *   **Buy vs Rent**: Added sophisticated "Opportunity Cost" analysis (investing the difference).
    *   **PRDs**: Drafted "Golden Handcuffs" (Stock Options/RSUs) calculator specs.

### Phase 6: UI Standardization & Shared Components
*   **Component Extraction**: Standardized page layouts across all calculators to reduce boilerplate and ensure visual parity.
    *   *Action*: Created `CalculatorLayout`, `CalculatorHeader`, and `ResultsAnalysis` in `@packages/styling`.
    *   *Goal*: Ensure every tool feels like part of a single suite, with consistent header geometry and result containers.
*   **Typography**: Adopted **"Outfit"** as the primary typeface for a modern, high-premium look while maintaining Neo-Brutalist sharpness.
    *   *Global Application*: Configured via Tailwind and implemented in `index.html`.

---

## 🧭 Current Trajectory
The project is currently focused on **refinement and depth**:
1.  **Educational UI**: We are moving away from simple inputs to "Guided Inputs" (e.g., the Admin Time Estimator).
2.  **Professional Output**: The PDF/Excel reports are crucial for the user's "offline" planning.
3.  **Core Consistency**: Finishing the refactor of all legacy calculators to use the Phase 6 shared components.

## 📝 Critical Directives for AI
*   **Design**: NEVER deviate from the Neo-Brutalist styling (Bold borders, hard shadows). Use the **Outfit** font for all UI elements.
*   **Layout**: Always use `CalculatorLayout`, `CalculatorHeader`, and `ResultsAnalysis` from `@packages/styling` when building or refactoring calculators.
*   **Logic**: Always prioritize "Real/Net" numbers over "Gross" numbers. Adjust for inflation/tax by default or offer the option.
*   **Structure**: Respect the Monorepo boundary. Shared logic goes in `packages`, shared UI in `styling`, specific logic in components.
*   **Testing**: Typically, every new calculator MUST have its logic extracted to `lib/` and tests written in `tests/` before the UI is finalized.
*   **Documentation**: Whenever a new significant feature is added, a calculator is refactored, or a new component is added to `@packages/styling`, YOU MUST update the relevant `README.md` files (App-specific, Package-specific, or Root) to reflect these changes.

