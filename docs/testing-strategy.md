# Testing & Quality Assurance Strategy: SIH26091

## Overview
To ensure the SIH26091 platform delivers reliable, bug-free, and accurate business advisory to micro-entrepreneurs, a multi-layered testing framework will be implemented during application development.

---

## 🧪 Testing Categories & Specifications

```
+-----------------------------------------------------------------------------------+
|                           SIH26091 QA MATRIX                                      |
+-------------------+-------------------+--------------------+----------------------+
| 1. Unit & Func    | 2. Data & Spatial | 3. AI Determinism  | 4. Security & UI     |
|  - Financial Calc |  - OSM Overpass   |  - Hallucination   |  - OWASP Top 10      |
|  - Scheme Engine  |  - PostGIS GIS    |  - Tool Call Audit |  - Mobile Responsive |
+-------------------+-------------------+--------------------+----------------------+
```

### 1. Functional & Unit Testing
* **Financial Engine Testing:** Unit test suite asserting EMI, break-even revenue, and CapEx/OpEx calculations against standard accounting tables.
* **Scheme Rule Evaluation Testing:** Test boundary conditions for scheme matchmaker rules (e.g., verifying age caps, project cost upper limits, category subsidy variations).
* **Target Coverage:** $\ge 85\%$ unit test code coverage across core calculation engines.

### 2. API & Integration Testing
* **REST Endpoint Tests:** Automated API testing using PyTest / Postman suites asserting status codes, JSON schema response structures, and payload validation errors.
* **External GIS Integration:** Mocking OpenStreetMap / Overpass HTTP calls during automated CI test runs to prevent test flakiness due to network downtime.

### 3. Data Validation & Spatial Accuracy
* **Spatial Query Verification:** Benchmark PostGIS radial distance queries against known GPS coordinates.
* **Confidence Scoring Validation:** Test confidence degradation logic when inputs are missing or unverified.
* **Duplicate Detection:** Validate deduplication algorithms that identify overlapping shops across UDYAM registry entries and OpenStreetMap POIs.

### 4. AI Response & Anti-Hallucination Validation
* **Tool Execution Auditing:** Assert that the AI agent calls backend tools for all financial figures and scheme details before outputting narratives.
* **Fact Consistency Tests:** Compare LLM summary numbers against raw backend JSON outputs; flag any variance $> 0.00\%$.
* **Prompt Injection Resilience:** Test AI Agent inputs against malicious prompt injections designed to bypass guardrails.

### 5. Security & Vulnerability Testing
* **Secret Scanning:** Automated pre-commit hooks and GitHub Secret Scanning to ensure no API keys or environment variables leak into commits.
* **Input Sanitization:** Protect against SQL Injection (especially PostGIS raw queries) and Cross-Site Scripting (XSS).
* **Authentication Security:** Validate JWT token expiry and unauthorized route access.

### 6. Responsive UI & Mobile Accessibility Testing
* **Viewport Testing:** Verify web layout rendering across low-end Android mobile screens ($360\text{px} \times 640\text{px}$), tablets, and desktops.
* **Low-Bandwidth Performance:** Profile initial page load size under simulated 2G/3G network conditions (target bundle size $< 500\text{KB}$ initial payload).

---

## 📋 Planned Test Execution Commands (Placeholder)

```bash
# Backend Unit & Financial Tests
pytest tests/unit/ -v --cov=backend

# Spatial & GIS Integration Tests
pytest tests/integration/test_spatial_queries.py

# AI Agent Tool Call Consistency Verification
python -m tests.ai_eval.verify_agent_determinism

# Secret & Credential Audit Scan
git log -p | grep -E "API_KEY|SECRET|PASSWORD"
```
