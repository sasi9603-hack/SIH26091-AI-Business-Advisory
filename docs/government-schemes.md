# Government Schemes Advisory Specification: SIH26091

## Overview
Central and State governments in India run various credit-linked subsidy schemes to encourage micro-entrepreneurship. The SIH26091 platform maps applicant demographics and project parameters to eligible programs, reducing search friction and maximizing subsidy adoption.

> [!WARNING]
> Official scheme guidelines, subsidy percentages, and eligibility rules are subject to policy revisions by ministries. All rules documented below represent structural templates and must be verified against official ministry portals before production deployment.

---

## 🏛️ Targeted Government Schemes (SIH26091 Specification Matrix)

### 1. Micro Finance Scheme
* **Eligibility Ceiling:** Total estimated project cost up to **₹1,40,000**
* **Beneficiary Margin Capital:** **10%** of Project Cost
* **Eligible Loan Amount:** **90%** of Project Cost, capped at maximum **₹1,25,000**
* **Interest Rate:** **6.5% per annum**
* **Repayment Tenure:** **3 Years (36 Months)**
* **Moratorium Period:** **3 Months** (debt servicing commences from Quarter 2)
* **Debt Servicing Frequency:** **Quarterly**
* **Target Beneficiaries:** Small and micro business units in rural and semi-urban localities.
* **Document Checklist:** Aadhaar card, proof of business location / Gram Panchayat NOC, equipment quotations, bank passbook.

---

### 2. Term Loan Scheme
* **Eligibility Bracket:** Total estimated project cost **> ₹1,40,000** and **<= ₹50,00,000**
* **Beneficiary Margin Capital:** **10%** of Project Cost
* **Eligible Loan Amount:** **90%** of Project Cost, capped at maximum **₹45,00,000**
* **Interest Rate:** **8.0% per annum**
* **Repayment Tenure:** **7 Years (84 Months)**
* **Moratorium Period:** **6 Months** (debt servicing commences from Quarter 3)
* **Debt Servicing Frequency:** **Quarterly**
* **Target Beneficiaries:** Scalable micro-enterprises and light rural manufacturing/service clusters.
* **Document Checklist:** Detailed Project Report (DPR), Aadhaar & PAN card, premises lease/ownership proof, 6-month bank statement.

---

## ⚙️ Scheme Matching Evaluation Matrix

```
+-----------------------------------------------------------------------------------+
|                            SCHEME MATCHING PIPELINE                              |
+-----------------------------------------------------------------------------------+
| INPUT: [Project Cost (C_total), Available Capital (C_avail), Location, Sector]   |
|                                         │                                         |
|                                         ▼                                         |
| STEP 1: Project Cost Bracket Evaluation                                           |
|         - If C_total <= ₹1.40 Lakh: Micro Finance Scheme                         |
|         - If ₹1.40 Lakh < C_total <= ₹50.00 Lakh: Term Loan Scheme                |
|         - If C_total > ₹50.00 Lakh: Project Out of Range Warning                  |
|                                         │                                         |
|                                         ▼                                         |
| STEP 2: Financial Structuring Calculation                                          |
|         - Margin Capital = 10% of Project Cost                                    |
|         - Eligible Loan = min(90% * C_total, Scheme Loan Cap)                    |
|         - Interest Rate & Moratorium Configuration Applied                       |
|         - Quarterly Debt Servicing Schedule Generated                            |
|                                         │                                         |
|                                         ▼                                         |
| STEP 3: Advisory Summary & Compliance Checklist                                    |
+-----------------------------------------------------------------------------------+
```
