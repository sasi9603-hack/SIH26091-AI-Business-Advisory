# Planned Database Schema Design: SIH26091

## Overview
The platform data layer is designed for PostgreSQL with the **PostGIS extension** for spatial query optimization (e.g., radial distance searches, spatial joins).

> [!NOTE]
> This document specifies the planned database schema design. No actual database tables or SQL migration scripts are created in this setup phase.

---

## 📐 Entity Relationship Summary

```
                      +-------------------+
                      |       users       |
                      +---------+---------+
                                | 1
                                |
                                | *
                   +------------+------------+
                   |  recommendations        |
                   +------------+------------+
                                | *
                                |
                                | 1
+-------------------+     +-----+-----+     +----------------------+
|     locations     |◄────┤ businesses├────►|   business_sources   |
+-------------------+ 1   +-----+-----+ *   +----------------------+
                                | 1
                                |
                                | *
                      +---------+---------+
                      | community_reports |
                      +-------------------+
```

---

## 🗄️ Detailed Table Specifications

### 1. `users`
Stores user profile information, demographic categories, and preferences.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key, Default `gen_random_uuid()` | Unique user identifier |
| `full_name` | `VARCHAR(100)` | NOT NULL | User's full name |
| `phone_number` | `VARCHAR(15)` | UNIQUE, NOT NULL | Primary contact number |
| `social_category` | `VARCHAR(20)` | Enum: `GENERAL`, `SC`, `ST`, `OBC` | Demographic category for subsidy rules |
| `gender` | `VARCHAR(10)` | Enum: `MALE`, `FEMALE`, `OTHER` | Gender profile |
| `is_rural` | `BOOLEAN` | Default `TRUE` | Location type classification |
| `created_at` | `TIMESTAMPTZ` | Default `NOW()` | Registration timestamp |

---

### 2. `locations`
Spatial reference data for pin codes, villages, blocks, and geographic coordinates.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key | Location record ID |
| `pincode` | `VARCHAR(10)` | Index | 6-digit Indian Postal PIN |
| `village_town_name` | `VARCHAR(100)`| NOT NULL | Village or Town name |
| `district_name` | `VARCHAR(100)`| NOT NULL | District administrative unit |
| `state_name` | `VARCHAR(100)`| NOT NULL | State administrative unit |
| `coordinates` | `GEOGRAPHY(POINT, 4326)` | Spatial Index (GIST) | Latitude / Longitude coordinates |
| `lgd_code` | `VARCHAR(20)` | Optional | Local Government Directory code |

---

### 3. `business_sources`
Catalog of external data providers and credibility weights.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | Primary Key | Source ID |
| `source_name` | `VARCHAR(50)` | UNIQUE | E.g., `UDYAM`, `OPENSTREETMAP`, `COMMUNITY` |
| `source_type` | `VARCHAR(30)` | Enum: `OFFICIAL_GOVT`, `OPEN_GIS`, `CROWDSOURCED` | Category |
| `base_confidence_weight` | `NUMERIC(3,2)` | Default `0.80` | Weight ($0.00 - 1.00$) |

---

### 4. `businesses`
Aggregated repository of existing local enterprises mapped spatially.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key | Enterprise identifier |
| `business_name` | `VARCHAR(150)`| NOT NULL | Enterprise trading name |
| `category` | `VARCHAR(50)` | Index | E.g., `GROCERY`, `TAILOR`, `AGRO_REPAIR` |
| `nic_code` | `VARCHAR(10)` | Optional | National Industrial Classification code |
| `location_id` | `UUID` | Foreign Key -> `locations.id` | Spatial location link |
| `coordinates` | `GEOGRAPHY(POINT, 4326)` | Spatial Index | Exact point location |
| `source_id` | `INTEGER` | Foreign Key -> `business_sources.id` | Data origin |
| `verification_status`| `VARCHAR(20)` | Enum: `VERIFIED`, `UNVERIFIED` | Verification badge status |
| `confidence_score` | `NUMERIC(3,2)` | Range $0.00 - 1.00$ | Calculated trust metric |

---

### 5. `community_reports`
User-submitted ground-truth reports for informal or unmapped businesses.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key | Report ID |
| `reporter_user_id` | `UUID` | Foreign Key -> `users.id` | User who submitted report |
| `business_name` | `VARCHAR(150)`| NOT NULL | Reported shop name |
| `category` | `VARCHAR(50)` | NOT NULL | Business category |
| `coordinates` | `GEOGRAPHY(POINT, 4326)` | Spatial Index | Location of reported shop |
| `image_url` | `VARCHAR(255)`| Optional | Photo proof URL |
| `upvote_count` | `INTEGER` | Default `0` | Community verification count |
| `created_at` | `TIMESTAMPTZ` | Default `NOW()` | Submission timestamp |

---

### 6. `market_data`
Demographic and economic demand stats per location.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key | Market record ID |
| `location_id` | `UUID` | Foreign Key -> `locations.id` | Location link |
| `total_population` | `INTEGER` | NOT NULL | Census population |
| `household_count` | `INTEGER` | Optional | Total households |
| `avg_purchasing_power_index` | `NUMERIC(5,2)` | Estimated | Relative economic indicator |

---

### 7. `competitor_analysis`
Historical logs of competition density queries executed by users.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key | Analysis ID |
| `location_id` | `UUID` | Foreign Key -> `locations.id` | Query location |
| `category` | `VARCHAR(50)` | NOT NULL | Queried category |
| `radius_km` | `NUMERIC(4,2)`| NOT NULL | Query radius (e.g. 2.50 km) |
| `discovered_competitor_count` | `INTEGER` | NOT NULL | Count of shops found |
| `saturation_score` | `NUMERIC(4,2)`| NOT NULL | Calculated density index |

---

### 8. `financial_analysis`
Financial feasibility calculation outputs linked to advisory sessions.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key | Financial record ID |
| `total_project_cost` | `NUMERIC(12,2)`| NOT NULL | Total capital budget |
| `beneficiary_contribution`| `NUMERIC(12,2)`| NOT NULL | Personal equity |
| `subsidy_amount` | `NUMERIC(12,2)`| Default `0.00` | Matched subsidy |
| `loan_amount` | `NUMERIC(12,2)`| NOT NULL | Principal loan required |
| `monthly_emi` | `NUMERIC(10,2)`| NOT NULL | EMI obligation |
| `break_even_monthly_revenue`| `NUMERIC(12,2)`| NOT NULL | Monthly break-even target |

---

### 9. `government_schemes`
Lookup table for scheme rules and subsidy matrices.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key | Scheme ID |
| `scheme_name` | `VARCHAR(100)`| UNIQUE, NOT NULL | E.g., `PMEGP`, `MUDRA_KISHORE` |
| `nodal_ministry` | `VARCHAR(150)`| NOT NULL | Operating Ministry |
| `max_project_cost` | `NUMERIC(12,2)`| NOT NULL | Financial ceiling |
| `max_subsidy_percentage` | `NUMERIC(5,2)` | NOT NULL | Max subsidy percentage |
| `rule_definition_json` | `JSONB` | NOT NULL | Rule conditions schema |

---

### 10. `recommendations`
Consolidated advisory sessions storing AI-generated evaluation reports.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key | Advisory session ID |
| `user_id` | `UUID` | Foreign Key -> `users.id` | Beneficiary user |
| `financial_analysis_id` | `UUID` | Foreign Key -> `financial_analysis.id` | Financial output link |
| `competitor_analysis_id`| `UUID` | Foreign Key -> `competitor_analysis.id` | Spatial output link |
| `matched_scheme_id` | `UUID` | Foreign Key -> `government_schemes.id` | Selected scheme |
| `viability_status` | `VARCHAR(20)` | Enum: `HIGHLY_VIABLE`, `MODERATE`, `RISKY` | Overall rating |
| `advisory_narrative` | `TEXT` | NOT NULL | AI-synthesized narrative report |
| `created_at` | `TIMESTAMPTZ` | Default `NOW()` | Recommendation timestamp |
