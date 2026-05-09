# ProofFund

ProofFund is the first onchain grant market where capital flows only to
developers with verifiable execution history — enforced by AI and governed
by prediction markets.

It turns *earned* reputation into a fundable primitive, unlocking a new
category of venture‑grade infrastructure for Web3 funding.

## The Problem No One Has Solved

Today, onchain organizations are good at moving money, but not at
underwriting the people who receive it.[^capital-formation]

Every grant program and DAO treasury runs into the same failure mode:
capital goes to strong pitchers, not strong builders.

There is no shared infrastructure for verifiable developer execution in Web3:
- GitHub stars and follower counts can be farmed or gamed.
- Hackathon wins and CVs are self‑reported and hard to verify.
- Wallet addresses carry no portable, composable trust signal.
- Grant committees are forced to make subjective decisions under time pressure.

The result:
- misallocated capital and noisy grant portfolios,
- high default rates on funded milestones,
- no portable track record for founders when they move between ecosystems,
- a weak foundation for token‑enabled capital formation and onchain ventures.[web:706][web:713]

ProofFund is the missing protocol layer that fixes this: it makes
**verifiable execution history** the primary input into grant funding.

## What ProofFund Builds

ProofFund is a full‑stack agentic grant market with four tightly integrated
layers. Together they create a new funding primitive rather than another
dashboard.

### Layer 1 — AI Reputation Audit (Execution Evidence)

Before any developer can even enter the funding queue, they must pass a
strict AI‑driven reputation audit powered by verified onchain contract
history from Sourcify’s 27M‑contract dataset.

The audit evaluates:
- number and consistency of verified deployments across chains,
- verification completeness and metadata quality,
- ABI and documentation coverage,
- compiler discipline and optimizer usage,
- source‑code patterns and security signals,
- proxy / upgrade behavior and interface complexity,
- activity span, recency, and shipping cadence.

The result is a structured, explainable builder profile — a
machine‑readable underwriting object, not a black‑box score.

Only developers who clear this execution bar are allowed to request capital.

### Layer 2 — Prediction Market Funding Governance (Capital Allocation)

Approved developers submit a milestone proposal and enter a public
prediction market. Participants stake on whether the developer will
deliver within a 14‑day window.

Funding only releases if the market resolves in the developer’s favor.  
This means:
- grant allocation is a **market signal**, not a committee opinion,
- the crowd puts capital at stake to validate credibility,
- misaligned incentives are priced out instead of hand‑waved.

This is futarchic grant governance: the same “decision market” logic Umia
uses for strategic choices, applied directly to developer capital
allocation.[^umia-about]

### Layer 3 — Live ENS Reputation Identity (Portable Trust Layer)

When a prediction market approves a grant, ProofFund smart contracts
automatically mint a unique ENS subdomain to the developer’s wallet via
the ENS NameWrapper on Sepolia:

```text
projectname.prooffund.eth
```

Throughout the 14‑day development window, an AI monitoring agent
continuously tracks onchain metrics and writes live state data directly
into the ENS Text Records:

| Text Record        | Live Value                          |
|--------------------|-------------------------------------|
| `kpi.progress`     | Current milestone completion %      |
| `trust.score`      | Current AI reputation score         |
| `tranche.status`   | Active funding tranche              |
| `audit.result`     | Pass / conditional                  |
| `delivery.deadline`| Unix timestamp                      |
| `wallet`           | Developer address                   |

This ENS record is not a static badge. It is a **live, queryable,
composable reputation object** that any application, wallet, DAO,
protocol, or AI agent can read in real time to see whether a specific
developer:
- passed a strict AI execution audit, and
- is actively delivering against a funded milestone.

### Layer 4 — KPI Verification and Treasury Release (Enforced Delivery)

At milestone deadline, a verification agent checks pre‑defined onchain
KPIs. Treasury tranches release programmatically when conditions are met.

If the developer fails to deliver, the prediction market resolves against
them and funds are refunded to stakers.

From intake to settlement, capital only moves when **execution evidence**
and **market consensus** agree.

## Why This Is a New Category

ProofFund does not try to be a “better grants dashboard.”

It creates a new category: **earned reputation as a fundable primitive.**

Existing tools cover fragments of the problem:
- grant platforms manage forms and committee workflows,
- reputation systems issue static scores and badges,
- prediction markets price abstract outcomes,
- ENS provides static naming and basic identity.

ProofFund composes them into a single, venture‑grade infrastructure stack:

1. **AI‑enforced execution evidence** as a hard gate before any capital moves.
2. **Market‑governed capital allocation** that replaces opaque committee
   decisions with priced predictions.
3. **Live ENS reputation state**, updated by AI agents throughout the grant
   lifecycle and readable by any protocol.
4. **Programmatic treasury release** based on verified KPI delivery, not
   goodwill.

No existing project chains all four together. That is why ProofFund sits in
an open space in the current landscape rather than competing head‑on with
any single incumbent.

## Why This Has a Clear, Venture‑Scale Path to Revenue

ProofFund is designed as venture‑grade infrastructure from day one, with a
multi‑sided revenue model:

- **Protocol fee on funded grants**  
  A small percentage on each grant that clears the prediction market,
  scaling with total grant volume across all ecosystems.

- **Underwriting API**  
  SaaS / API access to the AI reputation audit for DAOs, accelerators,
  L2 ecosystems, and venture studios that want structured developer
  diligence without running their own markets.

- **ENS reputation namespace licensing**  
  Other protocols can deploy their own `project.theirprotocol.eth`
  reputation namespaces on top of ProofFund’s audit + live record stack.

- **Premium monitoring and milestone verification**  
  Ongoing AI‑agent monitoring and KPI verification as a subscription
  for organizations that already fund teams.

- **White‑label grant markets**  
  Full ProofFund instances for ecosystem funds, protocol DAOs, and
  Umia‑native ventures that want their own branded grant surface with
  ProofFund under the hood.

This positions ProofFund as a strategic entry into the market with
multiple, clearly aligned revenue streams rather than a single grants UI.

## Why This Is Ideal for Token Crowdfunding Through Umia

Umia’s Community Track uses decision‑market curation by UMIA token holders
to decide which ventures should enter the funding pipeline.[^umia-venture]

ProofFund is a natural candidate for that pipeline because:

1. **The pain is universally understood.**  
   Any tokenholder who has ever approved a grant or treasury allocation
   has seen capital go to teams that never deliver.

2. **The token narrative is directly tied to usage.**  
   A ProofFund token can credibly capture protocol fees from every grant
   that flows through the market. More grants → more fee revenue →
   more value to tokenholders.

3. **The community is structurally important.**  
   Tokenholders are not passive; they are the prediction market that
   prices which developers should be funded. Being right is profitable.

4. **The ENS reputation layer compounds over time.**  
   Each new `project.prooffund.eth` adds to a growing network of
   verifiable builders, increasing signal quality and integration surface
   for wallets, dApps, and agent frameworks.

This makes ProofFund a highly palatable candidate for Umia’s Tailored
Auction and other capital‑formation mechanisms.[web:706][web:714]

## Why This Is Novel Agentic Execution

ProofFund’s AI layer is not a generic “LLM wrapper.”

It is a purpose‑built **multi‑agent pipeline** with specific, verifiable
onchain responsibilities:

| Agent             | Function                               | Onchain Effect                          |
|-------------------|----------------------------------------|-----------------------------------------|
| Intake Agent      | Structures founder submission          | Writes intake record                    |
| Audit Agent       | Runs Sourcify‑powered reputation analysis | Produces scored evidence object     |
| Market Agent      | Monitors prediction market resolution  | Triggers grant release or refund        |
| Monitoring Agent  | Tracks KPIs during the grant window    | Updates ENS Text Records live           |
| Verification Agent| Evaluates milestone delivery           | Triggers tranche release                |

The Monitoring Agent, continuously writing structured KPI and trust data
into ENS Text Records during an active grant, is a genuinely new use of
agentic execution: an AI process that **keeps Web3 identity state in sync
with real delivery performance**.

No existing grant platform, reputation system, or ENS integration does
this today.

## Alignment With Umia’s Architecture

Umia is building infrastructure for agentic ventures, combining futarchic
decision markets, legal wrappers, and token‑enabled capital formation.[web:706][web:714]

ProofFund mirrors that architecture and makes it stronger:

- **Decision markets govern capital** — prediction markets determine
  grant allocation, exactly like Umia’s decision‑market governance model.
- **CLI‑ and agent‑first workflow** — designed to be driven by agents and
  operators rather than web forms.
- **Non‑custodial treasury** — funds are held in contracts, not by a
  committee.
- **Legal wrapper readiness** — ProofFund can be incorporated as an
  Umia SPC SubCo without bespoke legal engineering.
- **AI agents execute, humans set policy** — teams set audit and market
  rules; agents enforce them on‑chain.

In practice, ProofFund functions as a reference implementation of what an
Umia‑native, agentic venture looks like when it runs from zero to funded
with no subjective committees in the loop.

## Technical Stack

- Solidity smart contracts on Sepolia
- ENS Sepolia NameWrapper for programmatic subdomain issuance
- ENS Text Records for live, AI‑written KPI and trust state
- Sourcify BigQuery dataset (27M verified contracts across 100 chains)
- Multi‑agent AI orchestration pipeline
- Prediction market contracts for community‑governed funding
- Treasury contracts for milestone‑based tranche release
- Backend API for agent coordination and event indexing

## Open Source

All contracts, agent code, and APIs are open source.  
A working prototype is deployed on Sepolia, with a live ENS subdomain demo:
`demo.prooffund.eth`.

---

[^capital-formation]: Umia’s own thesis emphasizes that while core
blockchain infrastructure is largely solved, capital formation and
credible venture underwriting remain the bottlenecks for onchain
projects.[web:706][web:713]

[^umia]: Umia positions itself as an infrastructure layer for launching
agentic ventures and enabling market‑driven capital formation.[web:706]

[^umia-venture]: Umia Venture formalizes projects into legal wrappers and
supports token‑based crowdfunding and decision‑market governance, which
directly benefits from high‑quality, verifiable execution signals like
those produced by ProofFund.[web:714][web:706]
