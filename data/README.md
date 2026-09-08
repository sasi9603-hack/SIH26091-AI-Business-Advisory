# Data Directory (Planned Data Pipeline)

## Overview
This directory holds raw, processed, and sample datasets required by the spatial analytics and business discovery engines.

> [!IMPORTANT]
> Raw datasets or proprietary data files should NEVER contain secrets, API keys, or personally identifiable information (PII). Large raw datasets are ignored by `.gitignore`.

## Folder Structure & Purpose

* `data/raw/`: Storage for uncompressed raw open datasets (e.g., UDYAM CSV dumps, Census raw tables, OSM shapefiles).
* `data/processed/`: Processed, cleaned, and spatially indexed Parquet/GeoJSON files ready for DB ingestion.
* `data/sample/`: Small, mock sample datasets used for automated offline unit testing.

```
data/
├── README.md
├── raw/                 # Ignored by Git (contains raw open data files)
│   └── .gitkeep
├── processed/           # Ignored by Git (contains processed spatial files)
│   └── .gitkeep
└── sample/              # Tracked by Git (contains small sample files)
    └── .gitkeep
```
