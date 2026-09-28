# Crypto Screener

A full-stack cryptocurrency screening application that retrieves, filters, and displays digital assets from the CoinGecko API based on specific fundamental criteria.

Built for the Spredo Full-Stack Developer evaluation.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Backend Setup](#1-backend-setup)
  - [Frontend Setup](#2-frontend-setup)
- [Requirements Traceability Matrix](#requirements-traceability-matrix)
  - [Part 1: Backend (Python)](#part-1-backend-python)
  - [Part 2: Frontend (React)](#part-2-frontend-react)
- [Architecture and Project Structure](#architecture-and-project-structure)
- [Technical Assumptions and API Constraints](#technical-assumptions-and-api-constraints)
- [Automated Testing](#automated-testing)
- [AI Workflow Report](#ai-workflow-report)

---

## Overview

The application provides a full-stack interface to monitor and screen cryptocurrency projects. It connects to the CoinGecko API, applies a multi-criteria screening engine on the backend, protects against external API rate limits via in-memory caching, and exposes a responsive dashboard for real-time querying, searching, and sorting.

---

## Tech Stack

| Layer | Technologies | Selection Rationale |
|---|---|---|
| **Backend** | Python 3.11+, FastAPI, Uvicorn, HTTPX, Pydantic v2, Pytest | High async throughput, compile-time schema validation via Pydantic, native OpenAPI documentation. |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons | Sub-second build times, strict static typing, utility-first responsive styling without CSS overhead. |
| **Data Provider** | CoinGecko REST API (v3) | Public crypto market data provider specified in the task prompt. |
| **Tooling** | Git, npm | Standard cross-platform package and version management. |

---

## Getting Started

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Windows (CMD):
.\venv\Scripts\activate.bat
# Linux / macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run automated tests
pytest

# Start the server
python run.py
```

The backend API service runs on `http://localhost:8000` with the `/api` route prefix.
Interactive Swagger documentation is available at `http://localhost:8000/docs`.

### 2. Frontend Setup

In a separate terminal window:

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

The frontend client runs on `http://localhost:5173`.

---

## Requirements Traceability Matrix

This section maps every requirement from the evaluation specification to its exact implementation and engineering rationale.

### Part 1: Backend (Python)

| Requirement | Implementation | Rationale & Technical Decisions |
|---|---|---|
| **Framework Selection** | FastAPI (`backend/app/main.py`) | FastAPI was chosen over Flask/Django for its native async capabilities with `httpx`, automatic Pydantic v2 validation, and zero-configuration Swagger UI at `/docs`. |
| **CoinGecko API Integration** | `CoinGeckoService` (`backend/app/services/coingecko.py`) | Communicates with CoinGecko's REST API. Implements an in-memory TTL cache (180s) to prevent `429 Too Many Requests` on CoinGecko's free tier (10–30 req/min). |
| **Criterion 1: Market Cap > 0** | `project.market_cap > 0` (`filter.py`) | Excludes unpriced, inactive, or unlisted test tokens with missing valuation data. |
| **Criterion 2: `preview_listing == true`** | `project.preview_listing is True` (`filter.py`) | Strictly enforces the preview listing requirement. In CoinGecko, preview listing is a coin detail attribute, handled by merging verified metadata. |
| **Criterion 3: Max Supply == Total Supply** | `max_supply == total_supply` (both non-null) (`filter.py`) | Non-null validation is strictly enforced. Assets with infinite or uncapped supply (where `max_supply` is `null`, e.g., ETH) are prevented from falsely matching `null == null`. |
| **Criterion 4: FDV < $100M** | `fully_diluted_valuation < 100_000_000` (`filter.py`) | Enforces the strict upper bound for early/mid-stage project valuations. |
| **Criterion 5: 24h Volume > $50k** | `total_volume > 50_000` (`filter.py`) | Strict inequality (`>`) guarantees a verified baseline of trading activity and liquidity. |
| **Criterion 6: TVL > $50k** | `tvl > 50_000` (`filter.py`) | Strict inequality (`>`) verifies committed on-chain protocol utility. |
| **REST API Endpoint** | `GET /api/projects` (`routes.py`) | Exposes filtered results with query parameter support (`apply_filters`, `max_fdv`, `search`, `force_refresh`, `use_mock`). |
| **Clean Structure** | Layered modular architecture | Clear separation of concerns: `api/` (routes), `core/` (config), `models/` (schemas), `services/` (business logic), `tests/` (testing). |
| **Setup & Assumptions** | Documented in `README.md` | Full setup guides and technical domain constraints clearly stated. |

### Part 2: Frontend (React)

| Requirement | Implementation | Rationale & Technical Decisions |
|---|---|---|
| **Tech Stack** | React 19 + TypeScript + Vite (`frontend/`) | Component-driven architecture with compile-time type safety and instant HMR via Vite. |
| **Strict Communication Boundary** | `api.ts` connects solely to `http://localhost:8000/api` | The frontend communicates **only** with the FastAPI backend. Direct calls to third-party APIs are prohibited to prevent API key exposure and CORS conflicts. |
| **Display Project List** | `ProjectTable.tsx` | Tabular data presentation with rank, token icon, name, symbol, price, market cap, 24h volume, FDV, TVL, supply equivalence badges, and listing status. |
| **Additional FDV Filter** | Range slider in `FilterBar.tsx` | Allows the user to dynamically adjust the FDV ceiling from $1M to $100M in real time, immediately updating the displayed results. |
| **Search by Project Name** | Search input in `FilterBar.tsx` | Case-insensitive substring matching against both project `name` and `symbol` (e.g., `eth` matches Ethereum). |
| **Sorting Options** | `sortField` & `sortDirection` | Dual sorting for **Market Capitalization** and **24h Trading Volume** (asc/desc), accessible via quick-sort buttons and clickable column headers. |
| **Clean & Functional UI** | Dark theme with Tailwind CSS v4 | Professional, focused interface without visual clutter, informal emojis, or unnecessary debugging telemetry. |

---

## Architecture and Project Structure

```text
crypto-screener/
|-- backend/
|   |-- app/
|   |   |-- api/
|   |   |   `-- routes.py           # REST route definitions
|   |   |-- core/
|   |   |   `-- config.py           # Application settings and criteria thresholds
|   |   |-- models/
|   |   |   `-- schemas.py          # Pydantic models and response schemas
|   |   |-- services/
|   |   |   |-- coingecko.py        # CoinGecko client and in-memory TTL caching
|   |   |   |-- filter.py           # Multi-criteria filtering business logic
|   |   |   `-- mock_data.py        # Verified mock dataset for testing and fallback
|   |   `-- main.py                 # FastAPI application instance and CORS setup
|   |-- tests/
|   |   |-- test_filter.py          # Unit tests for individual criteria and boundaries
|   |   |-- test_health.py          # Health check and root tests
|   |   `-- test_routes.py          # Route integration and parameter tests
|   |-- pytest.ini                  # Pytest configuration
|   |-- requirements.txt            # Python dependencies
|   `-- run.py                      # Uvicorn entrypoint
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |   |-- EmptyState.tsx      # Empty and skeleton loading states
|   |   |   |-- FilterBar.tsx       # Search, FDV range filter, and sort controls
|   |   |   |-- Header.tsx          # Navigation and refresh control
|   |   |   `-- ProjectTable.tsx    # Sortable data table with formatted metrics
|   |   |-- services/
|   |   |   `-- api.ts              # Backend API communication service
|   |   |-- types/
|   |   |   `-- project.ts          # TypeScript domain interfaces
|   |   |-- utils/
|   |   |   `-- formatters.ts       # Currency and number formatting utilities
|   |   |-- App.tsx                 # Core UI state container
|   |   |-- index.css               # Tailwind CSS v4 styling
|   |   `-- main.tsx                # React DOM root
|   |-- package.json                # Node dependencies and scripts
|   |-- tsconfig.json               # TypeScript compiler options
|   `-- vite.config.ts              # Vite configuration
|-- README.md                       # Project documentation
`-- .gitignore                      # Git exclusion rules
```

---

## Technical Assumptions and API Constraints

1. **CoinGecko Public API Rate Limits:**
   - The free public tier of CoinGecko enforces a rate limit of approximately 10 to 30 calls per minute.
   - **Mitigation:** The backend implements an in-memory TTL cache (180 seconds). Requests within this TTL window are served directly from cache without hitting external servers.

2. **Endpoint Schema and Attribute Locations:**
   - The primary `/coins/markets` endpoint provides `market_cap`, `total_volume`, `fully_diluted_valuation`, `total_supply`, and `max_supply`.
   - The fields `preview_listing` and `total_value_locked` (TVL) are located in the individual detail endpoint `/coins/{id}`. Querying this endpoint sequentially for dozens of coins immediately triggers HTTP `429 Too Many Requests`.
   - **Mitigation:** The application combines live market data with pre-cached metadata and includes a verified demonstration dataset (`mock_data.py`) to guarantee continuous availability.

3. **Nature of `preview_listing` Tokens:**
   - In CoinGecko's system, assets marked with `preview_listing: true` represent upcoming or pre-TGE projects that have not yet launched active exchange trading. Consequently, live preview tokens rarely exhibit circulating market cap, active 24h trading volume, or TVL simultaneously. The filtering engine strictly enforces all rules as written in the specification, while providing a toggle to inspect both filtered and unfiltered records.

4. **Supply Equality Validation:**
   - The requirement `max_supply == total_supply` is evaluated strictly with non-null checks. Tokens with undefined or infinite supplies (where `max_supply` is `null`) are rejected.

---

## Automated Testing

The backend includes an automated test suite powered by `pytest`.

To execute tests:
```bash
cd backend
pytest -v
```

### Test Coverage Highlights

- **`test_filter.py`**:
  - Valid project passing all six criteria.
  - Market capitalization boundary checks (`mcap <= 0`, `mcap is None`).
  - Strict validation of `preview_listing == true`.
  - Supply equality verification (`max_supply != total_supply`, missing supply attributes).
  - FDV thresholds ($100M ceiling and values directly beneath it).
  - Trading volume thresholds (strictly greater than $50,000; tests $50,000 vs $50,001).
  - TVL thresholds (strictly greater than $50,000; tests $50,000 vs $50,001).
- **`test_routes.py`**:
  - Criteria metadata verification.
  - Filtered query validation.
  - Full catalog queries (`apply_filters=false`).
  - Search filtering precision.
  - Dynamic user FDV threshold overrides.

All 15 test cases pass cleanly with zero failures.

---

## AI Workflow Report

This section documents the AI collaboration process as requested in the Spredo evaluation criteria.

### 1. AI Tools Used
- Gemini 3.8 Flash (High Reasoning mode)

### 2. How the Tools Were Used
- **Architecture and Scaffolding:** Automated setup of modular directory structures, Pydantic DTOs, and configuration modules following clean separation principles.
- **Specification Analysis:** Inspected the task parameters and analyzed CoinGecko API data schemas to identify field locations (`preview_listing`, `tvl`) and rate limit constraints prior to implementation.
- **Test Generation:** Drafted unit test matrices covering boundary values and edge cases across all six filtering rules.
- **Frontend Development:** Generated responsive React component definitions and verified TypeScript strict-mode compatibility.

### 3. Areas of Highest Leverage
- Eliminating boilerplate creation across both Python and TypeScript layers.
- Rapid synthesis of comprehensive unit tests.
- Accelerated diagnosis of build and environment configurations (Tailwind CSS v4 plugin integration).

### 4. Manual Review and Corrections
- **Workflow Governance:** Enforced an explicit, phased iteration plan requiring manual confirmation before advancing between development stages.
- **Domain Logic Oversight:** Audited mathematical comparisons to ensure strict compliance with task specifications (e.g., verifying `>` vs `>=` on volume and TVL thresholds).
- **Product Design & Cleanliness:** Removed superfluous debugging telemetry and test metadata from user-facing components to maintain a clean, production-grade interface.
