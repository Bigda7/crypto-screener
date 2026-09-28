# Crypto Screener — Spredo Full-Stack Task

A full-stack cryptocurrency screener web application that retrieves, filters, and presents crypto project data from CoinGecko API based on specific criteria.

## Tech Stack
- **Backend:** Python 3.11+, FastAPI, Uvicorn, HTTPX, Pydantic v2
- **Frontend:** React 18 / 19, TypeScript, Vite, Tailwind CSS, Lucide Icons

## Architecture & Project Structure
```text
crypto-screener/
├── backend/
│   ├── app/
│   │   ├── api/          # API Route handlers
│   │   ├── core/         # Configuration & settings
│   │   ├── models/       # Pydantic schemas & data models
│   │   ├── services/     # CoinGecko client, caching, filter engine
│   │   └── main.py       # FastAPI application factory & middleware
│   ├── tests/            # Automated test suite
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── components/   # UI components (tables, filters, search, headers)
│   │   ├── services/     # Backend API client
│   │   ├── types/        # TypeScript interfaces
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── README.md
└── .gitignore
```

## Quick Start (Coming in Iterations 2-3)
Detailed execution instructions will be documented as backend and frontend implementations complete.
