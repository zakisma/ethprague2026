# Agentic Grant Market AI Service

This project evaluates Web3 grant applications and decides whether they are viable candidates for an Umia-style prediction market.

It combines three evidence sources:

- applicant-submitted project data
- GitHub repository analysis
- Sourcify-based developer reputation

The service then produces one of three outcomes:

- reject early based on wallet reputation
- trust the applicant based on wallet reputation
- run a deeper project audit and decide whether the project is ready for market creation

## What The Service Does

The current implementation is a deterministic orchestration layer around a few focused analysis steps:

1. Receive a grant application.
2. Receive a Sourcify reputation audit for the same wallet.
3. Merge both payloads by wallet address.
4. Route the application by reputation verdict.
5. If needed, analyze the GitHub repo, inspect milestones, and produce a market-readiness decision.

The service is verdict-driven:

- `REJECTED` skips GitHub analysis and returns a rejection explanation.
- `APPROVED` skips deep project audit and returns a trust profile.
- `NEEDS_REVIEW` runs the full audit pipeline.

## Audit Pipeline

For `NEEDS_REVIEW` applications, the system runs:

1. GitHub evidence collection
2. milestone-to-KPI analysis
3. deterministic repository substance gate
4. deep audit prompt for final market-readiness decision
5. contract execution plan attachment for approved projects

The deep audit is designed to answer:

- Is there meaningful repository substance?
- Do project claims match the code?
- Is the project actually relevant to Web3?
- Are the milestones measurable and externally verifiable?
- Can the project be converted into a binary, deadline-bound market question?

## Current State

What is implemented today:

- FastAPI service with two inbound endpoints
- in-memory application and Sourcify audit store
- GitHub metadata fetch, README fetch, and lightweight repo code-map generation
- LLM-based milestone review
- LLM-based deep audit for market readiness
- backend-oriented market creation parameter generation

What is still mocked or incomplete:

- Sourcify reputation tool currently returns mock data
- Umia deployment is not wired to a live contract flow
- persistence is in memory only
- some outputs are optimized for backend integration more than frontend readability

## Architecture

```text
src/
  api/          FastAPI endpoints
  agents/       orchestration and prompt-driven audit steps
  services/     business logic, routing, gating, and result assembly
  tools/        GitHub, Sourcify, and mock Umia integrations
  schemas/      request and response models
  prompts/      LLM prompts for milestone and deep audit stages
  core/         settings and configuration
```

Main flow:

```text
Grant application arrives
        +
Sourcify audit arrives
        ↓
match by wallet
        ↓
normalize verdict
        ↓
REJECTED     -> reputation rejection response
APPROVED     -> trust profile response
NEEDS_REVIEW -> GitHub analysis -> milestone analysis -> deep audit
```

## API Endpoints

### `POST /applications`

Receives a grant application payload.

If the matching Sourcify audit has not arrived yet, the service stores the application and returns `waiting_for_sourcify`.

If the matching Sourcify audit already exists, the service processes the application immediately and returns `processed`.

Example request:

```json
{
  "applicant_wallet_address": "0x1234567890abcdef1234567890abcdef12345678",
  "project_title": "Buk Reservation System",
  "project_description": "Web3-native reservation and settlement tooling for hospitality flows.",
  "website_url": "https://example.com",
  "repo_url": "https://github.com/example/project",
  "requested_amount": 5000,
  "milestones": [
    {
      "title": "MVP Contract Deployment",
      "verification_deadline": "2026-07-01",
      "funding_needed": 2500,
      "onchain_kpi_description": "Deploy one verified smart contract connected to the reservation system on Sepolia by 2026-07-01."
    },
    {
      "title": "User Activity KPI",
      "verification_deadline": "2026-08-01",
      "funding_needed": 2500,
      "onchain_kpi_description": "Reach at least 50 unique wallet interactions with the deployed contract by 2026-08-01."
    }
  ]
}
```

### `POST /sourcify/audit`

Receives a Sourcify reputation audit for a wallet.

If the matching grant application has not arrived yet, the service stores the audit and returns `waiting_for_application`.

If the matching application already exists, the service processes the pair immediately and returns `processed`.

Example request:

```json
{
  "wallet": "0x1234567890abcdef1234567890abcdef12345678",
  "score": 0.42,
  "verdict": "NEEDS_REVIEW",
  "breakdown": {
    "has_any_verified": { "score": 0.1, "max": 0.2, "note": "Verified contracts exist." },
    "verification_quality": { "score": 0.08, "max": 0.2, "note": "Partial verification quality." },
    "documentation": { "score": 0.04, "max": 0.15, "note": "Limited documentation." },
    "activity_history": { "score": 0.08, "max": 0.15, "note": "Some historical activity." },
    "complexity": { "score": 0.06, "max": 0.15, "note": "Beginner/intermediate contracts." },
    "security": { "score": 0.06, "max": 0.15, "note": "Limited security evidence." }
  },
  "summary": [
    "Mock Sourcify profile: 3 verified contracts.",
    "Mock verdict: developer needs manual review."
  ]
}
```

### `GET /health`

Simple health check:

```json
{ "status": "ok" }
```

## Response Paths

The service does not always return the same kind of audit payload. The response depends on the reputation verdict.

### 1. Reputation rejection

Returned when the wallet verdict is `REJECTED`.

This path includes:

- a rejection status
- a short explanation
- wallet reputation metadata
- improvement suggestions
- a `contract_execution_plan` with `should_create_market: false`

### 2. Reputation approval

Returned when the wallet verdict is `APPROVED`.

This path includes:

- an approval status
- a trust explanation
- wallet reputation metadata
- a lightweight trust profile
- no deep GitHub audit by default

### 3. Deep audit

Returned when the wallet verdict is `NEEDS_REVIEW`.

This path includes:

- final market decision
- overall risk level
- market readiness boolean
- evidence summary
- per-category risk scores
- top risks
- recommended market question
- recommended KPI
- milestone assessments
- GitHub metadata
- Sourcify metadata
- backend-oriented contract execution plan

## How GitHub Analysis Works

The GitHub tool currently does three things:

1. Fetches repository metadata from the GitHub API
2. Fetches the repository README from `main` or `master`
3. Clones the repository shallowly and builds a lightweight code map

The code map is used to detect:

- implementation substance
- language and stack hints
- presence of smart contracts
- broad architectural signals such as APIs, Docker, React, or Solidity

The deterministic repository gate rejects projects early if the repo appears to be empty, README-only, or lacking meaningful implementation evidence.

## Configuration

The service reads environment variables from `.env`.

Important settings:

- `GOOGLE_API_KEY`: required for Gemini-based milestone and deep audit generation
- `GITHUB_TOKEN`: optional but recommended to reduce GitHub API rate-limit issues
- `CORE_MODEL`: default high-capability model
- `FAST_MODEL`: default lower-latency model
- `AUTO_REJECT_THRESHOLD`: reputation threshold for automatic rejection logic
- `AUTO_APPROVE_THRESHOLD`: reputation threshold for automatic approval logic

## Local Setup

Create a virtual environment, install dependencies, and run the FastAPI app:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn src.api.main:app --reload
```

Example `.env`:

```env
GOOGLE_API_KEY=your_google_api_key
GITHUB_TOKEN=your_github_token
CORE_MODEL=gemini-2.5-pro
FAST_MODEL=gemini-2.5-flash
AUTO_REJECT_THRESHOLD=0.35
AUTO_APPROVE_THRESHOLD=0.65
```

Once the server is running, open:

- `http://127.0.0.1:8000/docs`
- `http://127.0.0.1:8000/health`

## Design Notes

This project intentionally separates:

- deterministic routing
- external evidence collection
- LLM judgment
- backend execution planning

That separation keeps the MVP easier to reason about and cheaper to run:

- cheap path for obviously rejected wallets
- cheap path for clearly trusted wallets
- expensive path only for borderline applications that need repo and milestone analysis

## Known Limitations

- `src/tools/sourcify_tool.py` is still mocked
- `src/services/application_store.py` is in-memory only
- output schemas differ between reputation-only and deep-audit paths
- the deep audit response is still somewhat overloaded for direct frontend display
- GitHub analysis depends on external network access and repository clone success

## Future Improvements

- replace mock Sourcify data with live reputation integration
- persist applications and audits in a database
- separate analyst-facing output from backend contract payloads
- standardize response shapes across all verdict paths
- connect approved audits to real Umia market creation
