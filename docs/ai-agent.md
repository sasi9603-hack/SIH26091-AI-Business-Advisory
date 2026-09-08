# AI Agent Architecture: SIH26091

## Overview
The AI Agent in SIH26091 operates as a **deterministic, tool-using advisory orchestrator**. Unlike open-ended conversational models that risk generating fabricated statistics or hallucinating non-existent government subsidies, this AI Agent is strictly constrained to executing verified internal calculation tools and summarizing structured data outputs.

---

## 🤖 Agent Execution Architecture

```mermaid
sequenceDiagram
    participant User as Entrepreneur / User
    participant Agent as AI Agent Controller
    participant Tools as Tool Execution Engine
    participant DB as System Data Store

    User->>Agent: Prompt: "I want to start a tailor shop in Pin 522002 with 1 Lakh budget"
    Agent->>Tools: execute(LocationLookup, pin="522002")
    Tools-->>Agent: Coordinates & Village/Town Metadata
    
    Agent->>Tools: execute(NearbyBusinessDiscovery, coords, radius_km=3, category="tailor")
    Tools->>DB: Spatial + UDYAM + Community query
    DB-->>Tools: 4 Competitors found (Confidence Score: 0.85)
    Tools-->>Agent: Competitor summary data
    
    Agent->>Tools: execute(FinancialCalculator, budget=100000, category="tailor")
    Tools-->>Agent: Financial Breakdown (CapEx, OpEx, EMI, Break-even month=7)

    Agent->>Tools: execute(GovtSchemeLookup, demographic_profile, project_cost=100000)
    Tools-->>Agent: Eligible: PMEGP (35% subsidy), Mudra Shishu
    
    Agent-->>User: Structured Viability Report & Synthesis Narrative
```

---

## 🛠️ Planned Agent Tools & Modules

### 1. `LocationLookupTool`
* **Function:** Resolves pin codes, village names, and district identifiers into geographic coordinates and administrative boundaries.
* **Input:** Location text / Pin Code.
* **Output:** Latitude, longitude, District, Block, State, LGD Code.

### 2. `NearbyBusinessDiscoveryTool`
* **Function:** Queries spatial database for existing competitors within a selected radius.
* **Input:** Coordinates, radius in kilometers, business category.
* **Output:** Competitor count, distribution map, confidence breakdown.

### 3. `UDYAMRegistryLookupTool`
* **Function:** Checks registered enterprise density by NIC sector code for the target district.
* **Input:** District name, NIC sector code.
* **Output:** Registered micro/small business counts.

### 4. `PopulationDemographicTool`
* **Function:** Fetches population figures and worker ratios from census databases.
* **Input:** Village / Pin code location ID.
* **Output:** Total population, household count, estimated market demand index.

### 5. `CompetitorAnalysisTool`
* **Function:** Synthesizes competitor entries across source categories (Govt registered, map discovered, community reported) into a market saturation score.
* **Input:** Raw business listings array.
* **Output:** Saturation Index (Low / Medium / High / Critical).

### 6. `FinancialCalculatorTool`
* **Function:** Performs deterministic accounting calculations.
* **Input:** Project cost, beneficiary contribution, loan interest rate, loan tenure.
* **Output:** Loan principal, monthly EMI, fixed costs, variable costs, monthly break-even sales target.

### 7. `GovtSchemeLookupTool`
* **Function:** Evaluates user demographic profile and project cost against scheme rule matrices.
* **Input:** User profile (age, category, gender, location type, cost).
* **Output:** Matched scheme list, subsidy amount, bank loan portion, application link.

### 8. `RecommendationGeneratorTool`
* **Function:** Formulates final advisory summary based strictly on tool-computed data.
* **Input:** Outputs from all preceding tools.
* **Output:** Structured JSON advisory report and plain-language summary.

---

## 🛑 Anti-Hallucination & Safety Guardrails

1. **No External Fact Invention:** The LLM prompt template forbids providing financial figures or scheme subsidy percentages not present in tool outputs.
2. **Explicit Data Fallbacks:** If spatial data for a village is limited, the agent clearly states: *"Data limited for this village; advice based on district averages."*
3. **Traceable Explanations:** Every claim (e.g., "High competition") links directly to the underlying metric (e.g., "5 tailor shops within 1.5 km radius").
