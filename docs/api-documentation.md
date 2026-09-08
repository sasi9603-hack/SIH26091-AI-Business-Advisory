# API Documentation Specification (Placeholder): SIH26091

## Overview
This document specifies the planned RESTful API endpoints for the SIH26091 backend platform. All endpoints will return standardized JSON responses and adhere to standard HTTP status codes.

> [!IMPORTANT]
> This is an API specification document for future development. No API endpoints, live handlers, or credentials exist in this current repository setup.

---

## 🌐 Planned API Endpoint Categories

### 1. Location Services APIs (`/api/v1/location`)

#### `POST /api/v1/location/geocode`
Resolves a pin code or location query string into geographic coordinates and district administrative codes.
* **Request Body:**
  ```json
  {
    "query": "522002",
    "country": "IN"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "status": "success",
    "data": {
      "pincode": "522002",
      "district": "Guntur",
      "state": "Andhra Pradesh",
      "latitude": 16.3067,
      "longitude": 80.4365,
      "lgd_code": "28501"
    }
  }
  ```

---

### 2. Business Discovery APIs (`/api/v1/business`)

#### `POST /api/v1/business/competitors`
Searches for mapped competitors within a radius around target coordinates.
* **Request Body:**
  ```json
  {
    "latitude": 16.3067,
    "longitude": 80.4365,
    "radius_km": 3.0,
    "category": "tailor"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "status": "success",
    "summary": {
      "total_count": 4,
      "saturation_index": 0.52,
      "density_level": "MODERATE"
    },
    "competitors": [
      {
        "id": "b123-uuid",
        "name": "Standard Tailors",
        "source": "UDYAM",
        "confidence_score": 0.95,
        "verification_status": "VERIFIED",
        "distance_km": 0.8
      }
    ]
  }
  ```

#### `POST /api/v1/business/community-report`
Submits a ground-truth report for a local unmapped business.
* **Request Body:**
  ```json
  {
    "business_name": "Ramu Kirana Store",
    "category": "grocery",
    "latitude": 16.3080,
    "longitude": 80.4370
  }
  ```

---

### 3. Financial Calculation APIs (`/api/v1/finance`)

#### `POST /api/v1/finance/structure-plan`
Computes project feasibility, loan principal, EMI obligations, and break-even points.
* **Request Body:**
  ```json
  {
    "total_project_cost": 200000,
    "beneficiary_contribution": 20000,
    "scheme_subsidy_percentage": 35.0,
    "loan_interest_rate_annual": 9.5,
    "loan_tenure_months": 60,
    "estimated_monthly_fixed_costs": 6810,
    "gross_margin_percentage": 40.0
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "status": "success",
    "data": {
      "subsidy_amount": 70000,
      "loan_principal": 110000,
      "monthly_emi": 2310,
      "break_even_monthly_revenue": 17025,
      "risk_rating": "LOW"
    }
  }
  ```

---

### 4. Government Scheme APIs (`/api/v1/schemes`)

#### `POST /api/v1/schemes/match`
Evaluates applicant profile parameters against active subsidy schemes.
* **Request Body:**
  ```json
  {
    "age": 28,
    "gender": "FEMALE",
    "social_category": "OBC",
    "is_rural": true,
    "project_cost": 200000,
    "sector": "SERVICE"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "status": "success",
    "eligible_schemes": [
      {
        "scheme_id": "pmegp-2026",
        "scheme_name": "PMEGP",
        "subsidy_percentage": 35.0,
        "max_grant_amount": 70000,
        "nodal_agency": "KVIC / DIC"
      }
    ]
  }
  ```

---

### 5. AI Advisory Agent APIs (`/api/v1/ai-agent`)

#### `POST /api/v1/ai-agent/evaluate-viability`
Runs end-to-end tool pipeline and generates structured viability report and narrative.
* **Request Body:**
  ```json
  {
    "user_id": "u987-uuid",
    "business_category": "tailor",
    "pincode": "522002",
    "proposed_budget": 100000
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "status": "success",
    "session_id": "rec-456-uuid",
    "overall_viability": "HIGHLY_VIABLE",
    "advisory_summary": "Starting a tailor shop in PIN 522002 is financially viable. Low competition (4 shops within 3km). Eligible for PMEGP 35% subsidy."
  }
  ```

---

## 🔒 Authentication & Rate Limits (Planned)

* **Auth Method:** Bearer JWT tokens in standard `Authorization` header (`Bearer <token>`).
* **Rate Limits:** 100 requests / minute per IP for public spatial queries; 30 requests / minute for AI agent queries.
