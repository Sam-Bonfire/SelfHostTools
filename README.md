# SelfHostTools: Comprehensive Developer Guide

**SelfHostTools** is a personal, self-hosted suite of web utilities built with a modern React stack. The project is structured as a monorepo to allow for modular growth, sharing code between distinct tools like financial calculators, dashboaring utilities, or future applications.

## 📂 Architecture & Monorepo Structure

The project uses `npm` workspaces to manage dependencies and link packages locally.

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


## 🛠️ Setup & Development

### 1. Installation
```bash
# From project root
npm install
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
npm run dev --workspace=calculators
```
This spins up a Vite dev server (usually at `http://localhost:5173`).

### 4. Running Tests
To run the unit test suite for calculators:
```bash
npm exec --workspace=calculators -- vitest run
```

### 5. Building
To build all packages for production:
```bash
npm run build --workspaces
```
This generates `dist/` artifacts in each package folder.

## 🚀 Deployment Strategy
The project aims for a "Build Once, Deploy Anywhere" self-hosted model.

1.  **Build**: The deployment scripts (`deploy.ps1` or `deploy.sh`) trigger a full workspace build.
2.  **Deploy**:
    *   **Windows (`deploy.ps1`)**: Copies `apps/calculators/dist` to a mapped network drive (WebDAV).
    *   **Linux/Mac (`deploy.sh`)**: Copies to a local path or provides instructions for `scp`.
3.  **Config**: Deployment destinations are controlled via `.env` or script parameters.

*Note: Deployment typically relies on network connectivity to the self-hosted server.*
