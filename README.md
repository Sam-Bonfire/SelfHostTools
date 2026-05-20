# SelfHostTools: Comprehensive Developer Guide

**SelfHostTools** is a personal, self-hosted suite of web utilities built with a modern React stack. The project is structured as a monorepo to allow for modular growth, sharing code between distinct tools like financial calculators, dashboaring utilities, or future applications.

## 📂 Architecture & Monorepo Structure

The project uses `pnpm` workspaces to manage dependencies and link packages locally.

### Root Directory
*   **`package.json`**: Definition of workspaces (`apps/*`, `packages/*`) and root-level scripts.
*   **`deploy.ps1`**: PowerShell deployment script for Windows environments.
*   **`deploy.sh`**: Shell deployment script for Linux/macOS environments.
*   **`.env.example`**: Template for environment variables. Create `.env` locally.

### Workspaces

#### 1. Applications (`apps/`)
*   **`calculators`** (`apps/calculators`): The flagship application.
    *   **Purpose**: To provide high-fidelity financial planning tools.
    *   **Key Tech**: React, Vite, Vitest.
    *   **Structure**:
        *   `src/components/`: UI Components.
        *   `src/lib/`: Pure JS calculation logic (extracted for testing).
        *   `src/tests/`: Unit tests for calculation logic.

#### 2. Packages (`packages/`)
*   **`@packages/styling`** (`packages/styling`): Shared UI library.
    *   **Design System**: "Neo-Brutalism".
    *   **Exports**: `Card`, `Button`, `Input`, `Checkbox`, `Tooltip`.
    
*   **`@packages/components`** (`packages/components`): Shared React components.
    *   **Purpose**: To share logic-heavy components like `SEO` across apps.
#### 2. Applications (`apps/`)
*   **`calculators`** (`apps/calculators`): The flagship application.
    *   **Purpose**: To provide high-fidelity financial planning tools.
    *   **Key Tech**: React, Vite, Vitest.
*   **`visualizers`** (`apps/visualizers`): Interactive visualization tools.
    *   **Purpose**: Memento Mori and Life Planning tools.
    *   **Key Tech**: React, Vite, Framer Motion.


## 🛠️ Setup & Development

### 1. Installation
```bash
# From project root
pnpm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` in the root (ignore this if running locally, defaults are provided).
```bash
cp .env.example .env
```

### 3. Running Locally
To work on the calculators app:
```bash
# From project root
pnpm --filter calculators run dev
```
This spins up a Vite dev server (usually at `http://localhost:5173`).

### 4. Running Tests
To run the unit test suite for calculators:
```bash
pnpm --filter calculators exec -- vitest run
```

### 5. Building
To build all packages for production:
```bash
pnpm -r build
```
This generates `dist/` artifacts in each package folder.

## 🚀 Deployment Strategy

The project supports both automated CDN hosting and traditional local/network server self-hosting.

### 1. Automated CI/CD (Recommended)
The primary deployment pipeline is managed automatically via **GitHub Actions** and hosted on **Cloudflare Pages** for ultra-low costs and global CDN delivery.

*   **Workflow file**: `.github/workflows/deploy.yml`
*   **Process**: Every push to the `main` or `master` branch triggers the GitHub workflow, which:
    1.  Sets up Node.js and caches dependencies (`pnpm`).
    2.  Runs all workspace unit tests (`pnpm test`) to prevent regressions.
    3.  Compiles both `apps/calculators` and `apps/visualizers` independently.
    4.  Deploys the static assets to Cloudflare Pages under the project names `calculators` and `visualizers` respectively.
*   **Prerequisites**: Requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` to be configured as secrets on your GitHub repository.

### 2. Legacy/Local Deployments (WebDAV)
Traditional deployment scripts remain available for custom hosting setups:
*   **Windows (`deploy.ps1`)**: Builds `apps/calculators` and copies the output to a mapped network folder (such as WebDAV/SMB).
*   **Linux/macOS (`deploy.sh`)**: Performs the build and copies to local/mounted directory or details standard `scp` transfer options.

