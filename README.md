
Throughout the 14-day development window, an AI agent continuously 
monitors onchain metrics and writes live state data directly into the 
ENS Text Records:

| Text Record | Live Value |
|---|---|
| `kpi.progress` | Current milestone completion % |
| `trust.score` | Current AI reputation score |
| `tranche.status` | Active funding tranche |
| `audit.result` | Pass / conditional |
| `delivery.deadline` | Unix timestamp |
| `wallet` | Developer address |

This ENS record is not a badge. It is a live, queryable, composable 
reputation object that any application, wallet, DAO, protocol, or 
AI agent can read in real time to determine whether a specific developer 
has passed a strict AI audit and is actively delivering a funded milestone.

### Layer 4 — KPI Verification and Treasury Release

At milestone deadline, the AI agent verifies delivery against 
predefined onchain KPIs. Treasury tranches release programmatically. 
Failed delivery triggers market resolution and refunds to stakers.

The entire cycle from intake to settlement runs without human committee 
intervention.

## Why This Is a New Category

ProofFund does not compete with existing grant platforms.
It creates a new category: **earned reputation as a fundable primitive.**

Existing tools offer:
- application forms and committee review,
- hackathon leaderboards,
- on-chain activity dashboards.

ProofFund offers:
- AI-enforced execution evidence as a condition of access,
- market-governed capital allocation as a condition of funding,
- live ENS reputation state as a composable cross-ecosystem artifact,
- programmatic treasury release as a condition of payout.

No existing tool chains all four together. The category is open.

## Why This Has a Clear Path to Revenue

ProofFund is designed as venture-grade infrastructure, not a hackathon 
prototype.

**Revenue model:**

- **Protocol fee on funded grants** — a small % on each grant that 
  clears the prediction market. Scales directly with grant volume.
- **Underwriting API** — B2B access to the AI reputation audit for 
  DAOs, accelerators, and onchain funds that want structured developer 
  diligence without running the full ProofFund market.
- **ENS reputation namespace licensing** — other protocols can deploy 
  their own `project.theirprotocol.eth` reputation namespaces using 
  ProofFund's audit + live record infrastructure.
- **Premium monitoring and milestone verification** — ongoing 
  AI-agent monitoring sold as a subscription to protocols that have 
  already funded teams.
- **White-label grant market** — the full ProofFund stack deployed 
  for ecosystem funds, accelerators, and venture studios.

**Target customers:**
- DAO grant programs,
- onchain accelerators and incubators,
- ecosystem developer funds,
- protocol-native hackathons,
- venture studios building on Umia,
- any organization that issues grants and wants market-based 
  accountability rather than committee review.

## Why This Is Ideal for Token Crowdfunding Through Umia

Umia's Community Track uses decision market curation by UMIA token 
holders to select which ventures enter the funding pipeline.[web:714]

ProofFund is exactly the kind of project that passes that filter, 
because its value proposition is directly legible to a token community:

1. **The problem is real and shared.** Every tokenholder who has 
   participated in a grant program or DAO treasury allocation 
   understands the pain of funding teams that don't deliver.

2. **The token narrative is tight.** ProofFund token captures value 
   from every grant that flows through the market. As grant volume 
   grows, so does protocol fee revenue. The connection between 
   product usage and token value is direct and clear.

3. **The community is the product.** Token holders who stake on 
   developer quality are participating in a prediction market where 
   being right is profitable. That creates genuine participation 
   incentives beyond speculation.

4. **The ENS reputation layer creates network effects.** 
   More developers with `project.prooffund.eth` records means 
   more signal quality, more ecosystem integrations, and a stronger 
   reputation moat over time.

This makes ProofFund a strong crowdfunding candidate for Umia's 
Tailored Auction mechanism.[web:706][web:714]

## Why This Is Novel Agentic Execution

ProofFund's AI agent layer is not a wrapper around an LLM.
It is a purpose-built multi-agent pipeline with distinct, verifiable 
onchain effects at each stage:

| Agent | Function | Onchain Effect |
|---|---|---|
| Intake Agent | Structures founder submission | Writes intake record |
| Audit Agent | Runs Sourcify-powered reputation analysis | Produces scored evidence object |
| Market Agent | Monitors prediction market resolution | Triggers grant release or refund |
| Monitoring Agent | Continuously tracks KPI metrics | Updates ENS Text Records live |
| Verification Agent | Evaluates milestone delivery | Triggers tranche release |

The Monitoring Agent updating live ENS Text Records throughout a 
funded development window is a novel use of agentic execution: 
an AI that continuously writes structured state back into public 
Web3 identity infrastructure in real time.

No existing grant platform, reputation system, or ENS integration 
does this.

## Alignment With Umia's Architecture

ProofFund mirrors Umia's own design philosophy at every layer:[web:706]

- **Decision markets govern capital** — same as Umia's futarchic 
  governance model.
- **CLI-first workflow** — ProofFund's developer experience is 
  designed for agentic builders who prefer structured interfaces 
  over forms.
- **Noncustodial treasury** — grant funds are held in smart contracts, 
  not by a committee.
- **Legal wrapper readiness** — ProofFund is designed to be 
  incorporated as an Umia SPC SubCo with no legal setup fees.
- **AI agents execute, humans set strategy** — the founding team 
  sets audit parameters and market rules; agents run the evaluation 
  and verification pipeline.

ProofFund is not adjacent to Umia. 
It is a proof-of-concept for what Umia-native agentic ventures 
look like in practice.

## Technical Stack

- Solidity smart contracts on Sepolia
- ENS Sepolia NameWrapper for programmatic subdomain issuance
- ENS Text Records for live AI-written KPI state
- Sourcify BigQuery dataset (27M verified contracts across 100 chains)
- Multi-agent AI orchestration pipeline
- Prediction market contracts for community-governed funding
- Treasury contracts for milestone-based tranche release
- Backend API for agent coordination and event indexing

## Open Source

All contracts, agent code, and API are open source.
Working prototype deployed on Sepolia.
Live ENS subdomain demo: `demo.prooffund.eth`
