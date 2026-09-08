# Government Schemes Advisory Specification: SIH26091

## Overview
Central and State governments in India run various credit-linked subsidy schemes to encourage micro-entrepreneurship. The SIH26091 platform maps applicant demographics and project parameters to eligible programs, reducing search friction and maximizing subsidy adoption.

> [!WARNING]
> Official scheme guidelines, subsidy percentages, and eligibility rules are subject to policy revisions by ministries. All rules documented below represent structural templates and must be verified against official ministry portals before production deployment.

---

## 🏛️ Targeted Government Schemes (Specification Matrix)

### 1. Prime Minister’s Employment Generation Programme (PMEGP)
* **Nodal Ministry:** Ministry of Micro, Small & Medium Enterprises (MoMSME) / KVIC
* **Target Beneficiaries:** Individuals (above 18 yrs), SHGs, Cooperative Societies.
* **Max Project Cost:** ₹50 Lakhs (Manufacturing) / ₹20 Lakhs (Service/Business)
* **Subsidy Structure (Margin Money):**
  * *General Category:* 15% (Urban) / 25% (Rural)
  * *Special Category (SC/ST/OBC/Minorities/Women/Ex-Servicemen/PH/NER):* 25% (Urban) / 35% (Rural)
* **Beneficiary Contribution:** 10% (General) / 5% (Special Category)
* **Verification Status:** 🟡 Pending official API / Guideline sync.

---

### 2. Pradhan Mantri MUDRA Yojana (PMMY)
* **Nodal Ministry:** Department of Financial Services (DFS) / Micro Units Development & Refinance Agency
* **Target Beneficiaries:** Non-Corporate, Non-Farm Micro/Small Enterprises.
* **Loan Categories:**
  * *Shishu:* Loans up to ₹50,000
  * *Kishore:* Loans above ₹50,000 and up to ₹5 Lakhs
  * *Tarun:* Loans above ₹5 Lakhs and up to ₹10 Lakhs
* **Collateral:** Collateral-free loans backed by Credit Guarantee Fund for Micro Units (CGFMU).
* **Verification Status:** 🟡 Pending official bank tie-up specs.

---

### 3. PM Formalisation of Micro Food Processing Enterprises (PM-FME)
* **Nodal Ministry:** Ministry of Food Processing Industries (MoFPI)
* **Target Beneficiaries:** Individual micro food processing units, SHGs, FPOs, Cooperatives.
* **Subsidy Structure:** Credit-linked capital subsidy @ 35% of eligible project cost (Max ₹10 Lakhs per unit).
* **Focus:** One District One Product (ODOP) food processing initiatives in rural areas.
* **Verification Status:** 🟡 Pending state-wise ODOP list verification.

---

### 4. Stand-Up India Scheme
* **Nodal Ministry:** Department of Financial Services (DFS)
* **Target Beneficiaries:** Scheduled Caste (SC), Scheduled Tribe (ST), and Women entrepreneurs setting up greenfield enterprises.
* **Loan Amount:** Between ₹10 Lakhs and ₹1 Crore.
* **Margin Money:** Up to 15% (can be converged with state subsidy programs).
* **Verification Status:** 🟡 Pending guidelines confirmation.

---

### 5. PM Vishwakarma Scheme
* **Nodal Ministry:** Ministry of MSME
* **Target Beneficiaries:** Traditional artisans and craftspeople across 18 trades (e.g., Blacksmith, Carpenter, Tailor, Cobbler, Potter).
* **Benefits:** Collateral-free enterprise development loan (₹1 Lakh 1st tranche @ 5% interest, ₹2 Lakhs 2nd tranche), skill training, tool kit incentive.
* **Verification Status:** 🟡 Pending trade mapping validation.

---

## ⚙️ Scheme Matching Evaluation Matrix

```
+-----------------------------------------------------------------------------------+
|                            SCHEME MATCHING PIPELINE                              |
+-----------------------------------------------------------------------------------+
| INPUT: [Age, Gender, Social Category, Urban/Rural, State/District, Cost, Sector] |
|                                         │                                         |
|                                         ▼                                         |
| STEP 1: Sector & Project Cost Eligibility Filter                                  |
|         (Is project cost <= Scheme Max limit?)                                    |
|                                         │                                         |
|                                         ▼                                         |
| STEP 2: Demographic & Location Rule Filter                                        |
|         (Check SC/ST/Women/Rural boost rules for subsidy %)                      |
|                                         │                                         |
|                                         ▼                                         |
| STEP 3: Financial Output Generation                                               |
|         - Expected Subsidy Amount (₹)                                             |
|         - Required Entrepreneur Equity (₹)                                        |
|         - Bank Loan Principal (₹)                                                 |
|         - Mandatory Application Documents List                                    |
+-----------------------------------------------------------------------------------+
```

---

## 🔍 Official Verification Checklist (TODO Markers)

- [ ] [TODO] Verify PMEGP rural subsidy percentages with latest KVIC circulars.
- [ ] [TODO] Confirm state-specific subsidy additions (e.g., State MSME Policies).
- [ ] [TODO] Obtain official REST endpoints or XML feeds from `data.gov.in` for active schemes.
- [ ] [TODO] Cross-check collateral-free loan limits with CGTMSE circulars.
