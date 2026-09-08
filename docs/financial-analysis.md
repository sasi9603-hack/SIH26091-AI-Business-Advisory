# Financial Structuring & Feasibility Model: SIH26091

## Overview
Financial failure is a primary cause of micro-enterprise collapse in rural regions. The SIH26091 financial engine provides structured capital planning, cash flow forecasting, debt repayment modeling, and break-even analysis tailored to small budgets.

> [!NOTE]
> All numerical values in this document are illustrative examples used to specify calculation logic and formulas.

---

## 📊 Core Financial Components

### 1. Capital Cost Breakdown
Total Initial Project Cost ($P_{total}$) consists of Capital Expenditure (CapEx) and initial Working Capital (OpEx reserve):

$$P_{total} = \text{CapEx (Equipment, Renovation, Licenses)} + \text{Working Capital (3 Months Buffer)}$$

### 2. Funding Structure
* **Beneficiary Contribution ($C_{user}$):** Personal equity brought by the entrepreneur (typically 5% - 10% under subsidy schemes).
* **Government Subsidy ($S_{govt}$):** Grant or margin money provided under schemes like PMEGP (15% - 35%).
* **Bank Loan ($L_{bank}$):** Remaining debt component financed via formal credit.

$$L_{bank} = P_{total} - C_{user} - S_{govt}$$

---

## 🧮 Mathematical Formulas & Models

### Equated Monthly Installment (EMI)
Calculated using standard reducing balance amortization:

$$EMI = \frac{L_{bank} \times r \times (1 + r)^n}{(1 + r)^n - 1}$$

Where:
* $L_{bank}$ = Bank Loan Principal
* $r$ = Monthly interest rate ($\text{Annual Rate} / 12 / 100$)
* $n$ = Loan tenure in months

### Monthly Operating Expense ($OpEx_{monthly}$)

$$OpEx_{monthly} = \text{Rent} + \text{Utilities} + \text{Raw Material Cost} + \text{Labor/Wages} + EMI + \text{Misc}$$

### Break-Even Sales Revenue ($BEP_{sales}$)

$$BEP_{sales} = \frac{\text{Fixed Monthly Costs (Rent, EMI, Base Wages)}}{\text{Gross Contribution Margin Ratio}}$$

Where:

$$\text{Gross Margin Ratio} = \frac{\text{Monthly Revenue} - \text{Variable Material Cost}}{\text{Monthly Revenue}}$$

---

## 📝 Illustrative Sample Calculation

### Business Type: Small Agro-Repair Workshop
*(Note: Values below are sample figures for engine verification)*

* **Estimated Project Cost ($P_{total}$):** ₹2,00,000
  * Machinery & Tools (CapEx): ₹1,40,000
  * Shop Fit-out & License (CapEx): ₹20,000
  * Working Capital (3 Months OpEx): ₹40,000
* **Funding Structure:**
  * Beneficiary Contribution (10%): ₹20,000
  * PMEGP Subsidy (35% Special Category): ₹70,000
  * Bank Loan Principal ($L_{bank}$): ₹1,10,000
* **Loan Terms:** 9.5% Annual Interest, 5-Year Tenure (60 Months)
  * **Monthly EMI:** ~₹2,310
* **Fixed Costs:** Rent (₹3,000) + EMI (₹2,310) + Utilities (₹1,500) = ₹6,810/month
* **Gross Margin:** 40%
* **Required Break-Even Monthly Revenue:**

$$BEP_{sales} = \frac{₹6,810}{0.40} = ₹17,025 \text{ / month}$$

---

## ⚠️ Risk & Sensitivity Analysis Rules

The engine tests three operational scenarios:
1. **Optimistic Scenario:** 100% projected sales volume achieved.
2. **Realistic Scenario:** 75% projected sales volume achieved.
3. **Pessimistic Scenario:** 50% projected sales volume achieved (checks if business can cover fixed costs & EMI for 6 months).

If cash flow in the pessimistic scenario falls below EMI repayment obligations, the system triggers a **High Financial Risk Alert**.
