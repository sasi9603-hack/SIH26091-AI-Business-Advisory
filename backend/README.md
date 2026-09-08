# Backend API & Engine Directory (Planned)

## Overview
This directory is reserved for the core RESTful API services, financial engines, spatial analytical pipelines, and scheme matchmakers.

## Planned Scope & Technology Stack
* **Language/Framework:** Python 3.11+ (FastAPI)
* **Spatial Processing:** GeoPandas, Shapely, PyProj
* **ORM & Database:** SQLAlchemy + GeoAlchemy2 (PostgreSQL / PostGIS connection)
* **Authentication:** PyJWT / OAuth2

## Planned Folder Structure
When development commences, this folder will contain:
```
backend/
├── app/
│   ├── api/             # API route handlers (location, business, finance, schemes)
│   ├── core/            # Config, security, database session setup
│   ├── engines/         # Financial calculator, spatial density & scheme matcher engines
│   ├── models/          # SQLAlchemy database models
│   └── schemas/         # Pydantic request/response validation schemas
├── requirements.txt
└── README.md
```

> [!NOTE]
> Application development has not started yet. This folder is currently set up as a repository placeholder.
