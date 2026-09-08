# Research Log & Domain Findings: SIH26091

## Overview
This document serves as the project's central research repository. All domain studies, data source evaluations, government policy circulars, and spatial datasets analyzed during the development lifecycle must be logged here.

---

## 📝 Research Entry Template

```markdown
### Research Topic: [Name of Topic / Dataset / Scheme]
* **Date:** YYYY-MM-DD
* **Researcher / Author:** [Name / Role]
* **Primary Source:** [URL / Circular Number / Report Name]
* **Source Reliability:** [High / Medium / Low] (Official Govt / Academic / Open GIS / News)

#### 1. Key Findings
* Bullet points of findings...

#### 2. Project Impact & Implications
* How this finding influences backend logic, AI tools, UI design, or financial models...

#### 3. Action Items & Follow-up
- [ ] Task to implement...
```

---

## 📚 Initial Research Log

### Research Topic: PMEGP Scheme Subsidy Structure (2025-2026 Guidelines)
* **Date:** 2026-09-08
* **Researcher:** SIH26091 Advisory Team
* **Primary Source:** KVIC Official PMEGP Portal / Ministry of MSME
* **Source Reliability:** High (Official Government Source)

#### 1. Key Findings
* PMEGP provides credit-linked margin money subsidy up to 35% for rural special category applicants (SC/ST/OBC/Women/Ex-Servicemen).
* Maximum project cost limit is ₹50 Lakhs for manufacturing units and ₹20 Lakhs for service/business enterprises.
* Beneficiary contribution is mandatory at 5% (Special Category) or 10% (General Category).

#### 2. Project Impact & Implications
* The financial calculator engine must enforce the 5%/10% beneficiary contribution rule before calculating bank loan principal.
* The scheme matcher must query the user's demographic profile (gender, social category, rural status) to select the correct subsidy rate (15%, 25%, or 35%).

#### 3. Action Items & Follow-up
- [x] Document PMEGP formulas in `docs/financial-analysis.md` and `docs/government-schemes.md`.
- [ ] Create mock test cases for 35% rural special category subsidy calculation.

---

### Research Topic: OpenStreetMap Overpass API Coverage in Rural Andhra Pradesh & Telangana
* **Date:** 2026-09-08
* **Researcher:** SIH26091 GIS Team
* **Primary Source:** OpenStreetMap Wiki & Overpass Turbo Queries
* **Source Reliability:** Medium (Open Source GIS)

#### 1. Key Findings
* Primary roads, major village intersections, and banks are well-tagged in OSM across semi-urban tier-3 towns.
* Informal Kirana stores and interior village shops frequently lack specific `shop=*` tags in rural interiors.

#### 2. Project Impact & Implications
* OSM data alone is insufficient to calculate true competitor density in rural villages.
* A crowdsourced / community-reported business reporting workflow is mandatory to supplement OSM data.
* Confidence scoring formula must give higher weight when OSM and UDYAM data overlap.

#### 3. Action Items & Follow-up
- [x] Design community reporting table schema in `docs/database-design.md`.
- [x] Specify confidence score degradation logic in `docs/competitor-analysis.md`.
