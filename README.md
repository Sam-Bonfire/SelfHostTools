# SelfHostTools: Comprehensive Developer Guide

**SelfHostTools** is a personal, self-hosted suite of web utilities built with a modern React stack. The project is structured as a monorepo to allow for modular growth, sharing code between distinct tools like financial calculators, dashboaring utilities, or future applications.

## 📂 Architecture & Monorepo Structure

The project uses `pnpm` workspaces to manage dependencies and link packages locally.

### Root Directory

- **`package.json`**: Definition of workspaces (`apps/*`, `packages/*`) and root-level scripts.
- **`.env.example`**: Template for environment variables. Copy to `.env.local` locally.

### Workspaces

#### 1. Applications (`apps/`)

- **`calculators`** (`apps/calculators`): The flagship application.
  - **Purpose**: To provide high-fidelity financial planning tools.
  - **Key Tech**: React, Vite, Vitest.
  - **Structure**:
    - `src/components/`: UI Components using `@packages/styling`.
    - `src/lib/`: Pure JS calculation logic (extracted for testing).
    - `src/tests/`: Unit tests for calculation logic.
- **`visualizers`** (`apps/visualizers`): Interactive visualization tools.
  - **Purpose**: Memento Mori and Life Planning tools (Memento Mori, Skill Tree, Sankey, Runway, Habit, Freedom Clock, Debt Race, Compound Sandbox, etc.).
  - **Key Tech**: React, Vite, Framer Motion.

#### 2. Packages (`packages/`)

- **`@packages/styling`** (`packages/styling`): Shared UI library.
  - **Design System**: "Neo-Brutalism".
  - **Exports**: `CalculatorLayout`, `CalculatorHeader`, `ResultsAnalysis`, `Card`, `MetricDisplay`, `Button`, `Input`, `Select`, `Checkbox`, `Tooltip`.

- **`@packages/components`** (`packages/components`): Shared React components.
  - **Purpose**: To share logic-heavy components like `SEO` across apps.

- **`@packages/macro-data`** (`packages/macro-data`): Shared macro-economic indicators (inflation, market returns).
  - **Purpose**: Single source of default financial assumptions; refreshed via `pnpm --filter @packages/macro-data run update` (needs `ALPHA_VANTAGE_API_KEY`).

- **`@packages/persistence`** (`packages/persistence`): Shared persisted-state helpers (`usePersistedState`).

- **`@packages/compare`** (`packages/compare`): Shared A-vs-B verdict engine (`decideWinner` — winner, margin, ranking).

## 🛠️ Setup & Development

### 1. Installation

```bash
# From project root (or: mise run setup)
pnpm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env.local` in the root (ignore this if running locally, defaults are provided).

```bash
cp .env.example .env.local
```

### 3. Running Locally

To work on the calculators app:

```bash
# From project root
pnpm --filter calculators run dev
```

This spins up a Vite dev server (usually at `http://localhost:5173`; visualizers at `http://localhost:5174`).

### 4. Running Tests

To run the unit test suites for all workspaces:

```bash
pnpm test
```

For calculators only:

```bash
pnpm --filter calculators run test
```

### 5. Building

To build all workspaces for production:

```bash
pnpm -r build
```

This generates `dist/` artifacts in each app folder (`apps/*/dist`).

## 🚀 Deployment Strategy

The project's primary deployment pipeline is managed automatically via **GitHub Actions** and hosted on **Cloudflare Pages** for ultra-low costs and global CDN delivery.

### Automated CI/CD

- **Workflow files**: `.github/workflows/deploy.yml` (CI + Cloudflare Pages) and `.github/workflows/update-macro-data.yml` (scheduled macro-data refresh every 3 days).
- **Process**: Every push to the `main` or `master` branch triggers the GitHub workflow, which:
  1.  Sets up Node.js and caches dependencies (`pnpm`).
  2.  Runs all workspace unit tests (`pnpm -r --if-present test`) to prevent regressions.
  3.  Compiles both `apps/calculators` and `apps/visualizers` independently (each with its own `VITE_SITE_URL`).
  4.  Deploys the static assets to Cloudflare Pages under the project names `self-host-calculators` and `self-host-visualizers` respectively.
- **Prerequisites**: Requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` to be configured as secrets on your GitHub repository.
