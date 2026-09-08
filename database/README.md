# Database Scripts & Migrations Directory (Planned)

## Overview
This directory is reserved for PostgreSQL + PostGIS database initialization scripts, Alembic schema migrations, spatial indexing definitions, and reference seed data.

## Planned Scope
* **Database Engine:** PostgreSQL 15+ with PostGIS 3+ extension
* **Migration Tool:** Alembic (Python)
* **Seed Data:** Initial government scheme rules, district/pincode geospatial boundaries, NIC classification codes.

## Planned Folder Structure
When development commences, this folder will contain:
```
database/
├── migrations/          # Alembic migration scripts
├── init_postgis.sql     # Database initialization & spatial extension setup
├── seed_schemes.json    # Seed data for government schemes
├── seed_locations.json  # Seed data for pincodes & LGD codes
├── alembic.ini
└── README.md
```

> [!NOTE]
> Database script execution has not started yet. Refer to `docs/database-design.md` for the planned schema design.
