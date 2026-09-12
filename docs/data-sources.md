# Data Sources Catalog: SIH26091

## Overview
To deliver accurate hyper-local business advisory without relying on ungrounded AI predictions, the platform will integrate multiple open government data sources, geospatial mapping services, and community ground-truth inputs.

> [!IMPORTANT]
> No API keys, credentials, or private access tokens are stored in this codebase. All external integrations will utilize open endpoints and environment variables.

---

## 📊 Catalog of Planned Data Sources

### 1. UDYAM / MSME Registration Open Dataset
* **Type:** Official Government Data
* **Expected Data:** Registered enterprise names, NIC business classification codes, pin code locations, micro/small classification, district-level enterprise counts.
* **Why Needed:** To identify formal, registered businesses operating in the user's target sector and district.
* **Possible Limitations:** Lacks exact lat/long coordinates for smaller micro-enterprises; limited to registered entities (omits informal shops).
* **Usage:** District and pin code level baseline competition density calculation.

---

### 2. OpenStreetMap (OSM) & Overpass API
* **Type:** Open Spatial Data / GIS Engine
* **Expected Data:** Points of Interest (POIs), commercial shop tags (`shop=grocery`, `shop=tailor`, `amenity=bank`, `highway=primary`), road network geometry, local market boundaries.
* **Why Needed:** To calculate precise physical distances, spatial distribution, and commercial POI counts within a 1km to 5km radius.
* **Possible Limitations:** Coverage in deep rural villages may be sparse or outdated compared to urban areas.
* **Usage:** Primary spatial competitor discovery and mapping layer.

---

### 3. Data.gov.in (Open Government Data Platform India)
* **Type:** Official Open Data
* **Expected Data:** District socio-economic indicators, crop production stats, credit distribution metrics, demographic distributions, rural household numbers.
* **Why Needed:** To evaluate local purchasing power, regional economic activity, and market potential for specific business types (e.g., agri-processing vs. retail).
* **Possible Limitations:** Update frequencies vary across datasets; some data tables are published at district level rather than block level.
* **Usage:** Contextual market demand modeling and purchasing power estimation.

---

### 4. Census of India & Local Government Directory (LGD)
* **Type:** Official Government Reference Data
* **Expected Data:** Village/Town codes, population counts, male/female ratios, literacy rates, household numbers, worker population ratios.
* **Why Needed:** Provides population density numbers required to compute per-capita business service ratios (e.g., population per bakery/tailor shop).
* **Possible Limitations:** Historical census data requires normalization to account for recent population growth trends.
* **Usage:** Population-to-competitor ratio calculation.

---

### 5. Central & State Government Scheme Portals (SIH26091 Schemes Directory)
* **Type:** Official Policy Data
* **Expected Data:** Scheme guidelines, loan ceilings, margin capital requirements, interest rates, and moratorium terms.
* **Why Needed:** Powers the automated SIH26091 scheme matchmaker engine.
* **Possible Limitations:** Scheme rules and subsidy allocations change periodically based on annual government budget updates.
* **Usage:** Scheme eligibility matching and financial structuring calculation.

---

### 6. Community-Generated Local Business Data
* **Type:** Community-Sourced / Ground-Truth Data
* **Expected Data:** User-reported local shop listings, informal weekly market (*Haat*) schedules, unverified shop names, user status updates.
* **Why Needed:** Rural micro-markets rely heavily on informal, unregistered businesses that do not appear in official databases or maps.
* **Possible Limitations:** Variable reporting reliability; risk of duplicate entries or stale business listings.
* **Usage:** Fills coverage gaps in rural spatial maps; subject to community verification scoring.

---

## 🛡️ Data Source Transparency Summary

| Data Source | Source Category | Primary Purpose | Reliability Weight |
| :--- | :--- | :--- | :--- |
| **UDYAM MSME** | Official Govt | Formal Enterprise Density | High (0.95) |
| **Data.gov.in** | Official Govt | Macro Economic Context | High (0.90) |
| **Census / LGD** | Official Govt | Population Ratios | High (0.90) |
| **OpenStreetMap** | Open GIS | Spatial Radius Mapping | Medium-High (0.80) |
| **Community Data** | Crowdsourced | Informal Competitor Capture | Medium-Low (0.60) |
