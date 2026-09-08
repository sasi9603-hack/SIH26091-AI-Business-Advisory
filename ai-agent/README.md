# AI Agent Directory (Planned)

## Overview
This directory is reserved for the AI Agent controller, deterministic tool definitions, prompt templates, and recommendation synthesis logic.

## Planned Scope & Architecture
* **Orchestrator:** LangChain / LlamaIndex agent framework
* **LLM Engine:** Open-weights or enterprise LLMs configured for deterministic function calling
* **Tool Pipeline:**
  * Location & Geocoding tool
  * Nearby competitor discovery tool
  * UDYAM registry lookup tool
  * Deterministic financial calculator tool
  * Government scheme matcher tool

## Planned Folder Structure
When development commences, this folder will contain:
```
ai-agent/
├── agent/
│   ├── controller.py    # Main agent orchestration loop
│   ├── prompts.py       # Constrained prompt templates & system instructions
│   └── tools/           # Custom tool wrappers for backend engines
├── eval/                # Determinism & anti-hallucination evaluation scripts
├── requirements.txt
└── README.md
```

> [!NOTE]
> AI agent development has not started yet. This folder is currently set up as a repository placeholder.
