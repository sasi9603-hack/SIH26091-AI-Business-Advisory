# Competitor Discovery & Analysis Framework: SIH26091

## Overview
In rural Indian micro-markets, relying on a single data source results in inaccurate competitor counts. A formal government database (UDYAM) captures registered enterprises but misses informal shops. OpenStreetMap maps physical structures but may lack recent rural updates. Community reports capture active local shops but require validation.

To solve this, SIH26091 introduces a **Multi-Tiered Business Classification Engine** paired with an explicit **Confidence Scoring Algorithm**.

---

## 🏷️ Business Classification Tiers

```
+----------------------------------------------------------------------------------+
|                          BUSINESS CLASSIFICATION TIERS                           |
+---------------------+-------------------+-------------------+--------------------+
| 1. Govt-Registered  | 2. Map-Discovered | 3. Community-     | 4. Verification    |
|    (UDYAM/MSME)     |    (OpenStreet)   |    Reported       |    Status          |
|  - Official Record  |  - Geolocated POI |  - User Submission|  - Verified (V)    |
|  - High Trust       |  - Physical Exists|  - Unverified     |  - Unverified (U)  |
+---------------------+-------------------+-------------------+--------------------+
```

### Tier Definitions:

1. **Government-Registered Businesses:**
   - **Source:** UDYAM / MSME official datasets.
   - **Characteristics:** Possess formal registration numbers, NIC sector tags, and official address entries.
   - **Default Confidence Base:** `0.95`

2. **Map-Discovered Businesses:**
   - **Source:** OpenStreetMap / Overpass API POI tags.
   - **Characteristics:** Physically mapped spatial features with latitude/longitude coordinates.
   - **Default Confidence Base:** `0.85`

3. **Community-Reported Businesses:**
   - **Source:** Grassroots submissions by local entrepreneurs, CSC operators, or community members.
   - **Characteristics:** Unofficial local knowledge; captures informal vendors, temporary stalls, and unmapped Kirana stores.
   - **Default Confidence Base:** `0.60`

4. **Verified Businesses:**
   - **Status:** Business whose existence has been cross-validated by at least two independent sources or confirmed by a local field verification action.
   - **Confidence Multiplier:** `1.20` (Capped at 1.00)

5. **Unverified Businesses:**
   - **Status:** Single-source community submission without secondary cross-validation.
   - **Confidence Multiplier:** `0.80`

---

## 📐 Confidence Score Formula

The confidence score ($C_b$) for any discovered business $b$ is computed as:

$$C_b = \min\left(1.00, \; S_{base} \times \prod M_{cross} \times M_{recency}\right)$$

Where:
* $S_{base}$ = Base weight of the primary data source.
* $M_{cross}$ = Multiplier for cross-source validation (e.g., $+0.20$ if reported by community AND found on OpenStreetMap).
* $M_{recency}$ = Time decay factor based on when the listing was last confirmed.

---

## ⚖️ Competition Saturation Scoring

The overall market saturation index for a business category within target radius $R$ is calculated as:

$$\text{Saturation Index} = \frac{\sum_{i=1}^{N} C_b}{\text{Target Population within } R / \text{Standard Population Per Unit Benchmark}}$$

### Saturation Levels & Recommendations:

| Saturation Score | Saturation Level | Advisory Guidance |
| :--- | :--- | :--- |
| **0.00 - 0.40** | 🟢 Low (Underserved) | Excellent opportunity; high demand gap. |
| **0.41 - 0.75** | 🟡 Moderate | Viable market; focus on product differentiation. |
| **0.76 - 1.10** | 🟠 High (Saturated) | Caution; market is well-served. High risk for new entrants. |
| **> 1.10** | 🔴 Critical (Overcrowded)| Discouraged; severe price competition and low profit margins expected. |

---

## 🔍 Transparency & User Presentation

The user interface will explicitly display source provenance badges for every discovered competitor:
* `[Govt Registered]` (Blue Badge)
* `[Map Mapped]` (Green Badge)
* `[Community Reported]` (Amber Badge)
* `[Verified]` (Checkmark Icon)

This ensures full transparency so entrepreneurs understand *why* a location is flagged as competitive.
