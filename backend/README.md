# SIH26091 — FastAPI Advisory Backend

This directory contains the Python FastAPI backend for the **SIH26091 AI-Driven Hyper-Local Business Advisory and Financial Structuring Platform**.

## Architecture Overview

backend/
|-- app/
|   |-- main.py              # FastAPI application entrypoint & middleware
|   |-- core/
|   |   `-- config.py        # Pydantic Settings, environment variables & logging
|   |-- api/
|   |   |-- location.py      # /api/v1/location/geocode
|   |   |-- competitors.py   # /api/v1/business/competitors & community-report
|   |   |-- market.py        # /api/v1/market/feasibility
|   |   |-- census.py        # /api/v1/census/demographics
|   |   |-- udyam.py         # /api/v1/udyam/stats
|   |   |-- finance.py       # /api/v1/finance/calculate
|   |   |-- schemes.py       # /api/v1/schemes/all & match
|   |   `-- advisory.py      # /api/v1/ai-agent/evaluate-viability & chat
|   |-- services/
|   |   |-- location_service.py # Nominatim OSM geocoding & Haversine distance
|   |   |-- osm_service.py      # Overpass API live competitor queries
|   |   |-- census_service.py   # Demographics & household data
|   |   |-- udyam_service.py    # Official MSME / UDYAM registry lookups
|   |   |-- scheme_service.py   # SIH26091 Micro Finance & Term Loan rules
|   |   `-- gemini_service.py   # Grounded anti-hallucination AI advisory (Gemini)
|   |-- engines/
|   |   |-- financial_engine.py # CapEx, quarterly amortization, break-even
|   |   `-- market_engine.py    # Saturation index & feasibility scoring
|   `-- schemas/             # Typed Pydantic v2 schemas
|-- requirements.txt
|-- .env.example
`-- README.md

## Quickstart

### 1. Install Dependencies
pip install -r requirements.txt

### 2. Configure Environment Variables
Copy `.env.example` to `.env`. Optional: Add `GEMINI_API_KEY`.

### 3. Start the Server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

## Testing Endpoints
- Health Check: GET /api/health
- Swagger Documentation: GET /docs
- Viability Advisory: POST /api/v1/ai-agent/evaluate-viability
