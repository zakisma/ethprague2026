# BuilderSignal

BuilderSignal is an AI-native venture underwriting and KPI-verification layer for onchain organizations.

It helps Umia evaluate builders, structure projects into accountable onchain ventures, and release capital against verifiable execution rather than hype alone.

## Overview

BuilderSignal turns verified smart contract activity into venture intelligence. Sourcify’s open dataset includes 27 million verified contracts across 100 EVM chains and exposes source code, bytecode, ABI, compiler metadata, storage layouts, and related artifacts, which makes it an unusually strong foundation for high-signal builder analysis. [file:668]

Our product uses that data as a core primitive rather than as a superficial lookup layer. We analyze deployer history, contract verification quality, compiler settings, source files, signatures, and bytecode relationships to generate explainable assessments of teams, products, and execution maturity. [file:106][file:668]

## Why this matters for Umia

Umia is not only funding projects; it is helping transform them into real onchain ventures with long-term potential. BuilderSignal improves that process by giving Umia a structured, agentic due-diligence and milestone-verification stack.

Instead of relying on pitch quality alone, Umia can use BuilderSignal to:
- evaluate whether a team has a real shipping history,
- inspect what contracts they deployed and on which chains,
- understand whether contracts are verified and how strong that verification is,
- track whether teams are meeting technical KPIs over time,
- connect treasury decisions to measurable onchain execution.

This makes Umia stronger in three ways:
- better project selection,
- better post-investment accountability,
- better infrastructure for scaling from hackathon teams into formal ventures.

## Why this matters for Sourcify

Sourcify’s bounty explicitly rewards projects that make meaningful use of its open verified-contract dataset as a core component, and it scores projects on use of Sourcify data, impact, technical execution, and novelty with equal weight. [file:668]

BuilderSignal is deeply aligned with that requirement because it does not stop at address resolution or simple API calls. It uses the full data graph from deployment records to verified contracts, compiled contract metadata, sources, signatures, and bytecode-level evidence. [file:106][file:668]

The underlying data model is especially useful for AI agents because it links:
- deployer wallet to deployment history,
- deployment to verified contract,
- verified contract to compiled metadata,
- compiled metadata to source files,
- compiled metadata to signatures,
- deployment and compilation to bytecode identity. [file:106]

That means our agents can reason over:
- wallet deployment history,
- contract names and compiler versions,
- verification quality flags,
- ABI and interface complexity,
- storage layout and upgradeability clues,
- suspicious function signatures,
- source-level implementation patterns,
- bytecode reuse and clone detection. [file:106]

## Product

BuilderSignal combines an AI Agent Orchestrator, a Sourcify Data Engine, a KPI Generator, an On-chain KPI Verifier, a Wallet Reputation / Risk Score module, a KPI Registry, a Treasury Contract, a Grant Registry, a Prediction Market, an Event Indexer, and frontend dashboards into one coordinated system. [file:665]

The product has two user surfaces:
1. a human-facing dashboard for founders, reviewers, and treasury operators,
2. an agent-facing API / workflow layer for automated evaluation and execution.

This dual design matters because strong crypto infrastructure should work both for normal users and for agentic workflows.

## How it works

### 1. Intake

A founder, wallet, or project is submitted into the system.

The platform starts from wallet and contract evidence. In the Sourcify-linked data model, `publiccontractdeployments` stores chain, contract address, deployer wallet, transaction hash, block number, and related deployment data, while `publicverifiedcontracts` links those deployments to verified compilations. [file:106]

### 2. Contract intelligence

BuilderSignal fetches and normalizes:
- deployed contract addresses,
- chains used,
- deployment timestamps / transactions,
- verification quality,
- contract names,
- compiler versions,
- ABI availability,
- storage layout availability,
- source file structure,
- signature-level features,
- bytecode identity features. [file:106]

This is possible because the available tables connect deployment records, verified contracts, compiled contracts, source mappings, actual source code, signatures, and raw bytecode into one analyzable pipeline. [file:106]

### 3. AI evaluation

Our agents transform raw contract evidence into understandable outputs:
- builder reputation and execution history,
- contract risk hints,
- explainable summaries of what the system does,
- technical maturity scoring,
- milestone recommendations,
- KPI proposals for treasury release.

This is especially well matched to Sourcify because their own bounty examples include AI-powered contract explainers, smart contract analytics, security-pattern detection, and contract similarity systems. [file:668]

### 4. KPI creation

After analysis, the system proposes measurable onchain KPIs for the venture.

The architecture already includes a KPI Generator, KPI Registry, On-chain KPI Verifier, Treasury Contract, Grant Registry, and Prediction Market, which makes the system suitable not only for evaluation but also for post-funding execution tracking. [file:665]

### 5. Treasury and venture execution

Once KPIs are accepted, Umia can use them to structure milestone-based releases, accountability logic, and potentially market-based signaling around delivery.

This moves the project from “grant application” to “operational onchain venture,” which is a much stronger long-term model.

## What is novel here

Many tools analyze contracts. Few tools turn verified contract data into venture underwriting, milestone design, and treasury execution in one agentic workflow.

BuilderSignal is novel because it connects:
- Sourcify-based smart contract intelligence,
- AI-native reasoning and explanation,
- onchain KPI verification,
- treasury automation,
- venture formation logic.

That combination creates a real bridge between technical diligence and organizational execution.

## Why this can become a real business

BuilderSignal has a credible path to becoming a formal venture.

Revenue can come from:
- underwriting and diligence subscriptions for DAOs, onchain funds, and grant programs,
- API access for wallet / builder intelligence,
- monitoring and reporting subscriptions for funded projects,
- KPI verification and treasury automation fees,
- premium analytics for ecosystems that need project selection infrastructure.

This is not a one-off hackathon toy. It is infrastructure for capital allocation, risk reduction, and execution accountability in onchain organizations.

## Open-source and implementation fit

Sourcify requires projects to use Sourcify data as a core component and to ship an open-source working demo or prototype. [file:668]

BuilderSignal is designed exactly around that requirement. Sourcify data is not optional in our architecture; it is the evidence layer that powers the product’s core intelligence. [file:668][file:106]

## Example user flow

A reviewer inputs a founder wallet.

The system retrieves verified deployment history, associated contracts, compilation metadata, source-linked evidence, signatures, and verification signals, then generates an explainable builder profile with recommended KPIs and treasury conditions. [file:106]

If Umia funds the project, those KPIs can then be tracked and resolved through the broader architecture that includes verification, registry, treasury, and event-indexing components. [file:665]

## Why BuilderSignal is a strong fit for Umia + Sourcify

BuilderSignal is a strong fit for Umia because it helps convert project selection into structured onchain venture formation, improves treasury discipline, and creates a better path from early builder signal to long-term accountability.

BuilderSignal is a strong fit for Sourcify because it uses verified-contract data deeply and creatively across source code, compiler metadata, ABI, storage layout, signatures, verification quality, and bytecode analysis rather than relying on shallow lookups. [file:106][file:668]

In short, BuilderSignal makes verified smart contract data operational for venture creation.

## Status

Current prototype focus:
- wallet intake,
- verified-contract evidence retrieval,
- builder profile generation,
- risk and execution heuristics,
- KPI proposal generation,
- Umia-oriented treasury workflow integration.

Next milestones:
- live dashboard,
- automated KPI writing flow,
- onchain verifier integration,
- reviewer feedback loop,
- production-grade scoring and monitoring.

## Closing

BuilderSignal gives Umia a practical agentic system for selecting better teams, funding them with more confidence, and managing them as accountable onchain ventures.

It gives Sourcify a high-impact showcase for how verified contract data can power not just analytics, but real decision-making, coordination, and capital deployment. [file:668][file:106]
