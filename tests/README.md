# Automated Test Suite Directory (Planned)

## Overview
This directory is reserved for end-to-end unit tests, integration tests, spatial query validation, and AI response determinism test suites.

## Planned Test Categories
* `tests/unit/`: Testing individual functions in the financial and scheme calculation engines.
* `tests/integration/`: Testing API endpoints and database queries against test databases.
* `tests/ai_eval/`: Evaluating AI Agent tool execution consistency and anti-hallucination compliance.
* `tests/fixtures/`: Shared test data and mock HTTP responses.

## Planned Test Runner Command
When testing is implemented, tests will be executed via:
```bash
pytest tests/ -v
```

> [!NOTE]
> Test execution scripts will be added alongside application development. Refer to `docs/testing-strategy.md` for full QA specifications.
