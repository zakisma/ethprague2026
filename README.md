
This ENS name is not decorative. It is a composable, portable, 
live-updated reputation artifact.

Throughout the 14-day development window, our AI agent continuously 
monitors on-chain metrics and updates the ENS Text Records with live state 
data, including:
- current KPI progress,
- active funding tranche,
- trust score,
- milestone completion status,
- audit result and score,
- developer wallet address.

The result is a developer identity that any Web3 application, wallet, 
DAO, or agent can query to determine whether this developer has passed a 
strict AI audit and is actively delivering against a funded milestone.

### Step 4 — Milestone Verification and Treasury Release

The AI agent verifies KPI fulfillment against onchain metrics at the end 
of the 14-day window. Treasury tranches are released programmatically 
based on verified delivery, not subjective review.

## Why ENS Changes the Reputation Problem

Reputation in Web3 is fragmented. Developers have no portable, 
verifiable, and composable identity layer that proves execution quality 
across ecosystems.

UmiaScore's ENS integration solves this directly:
- the subdomain is tied to a specific grant lifecycle,
- the text records are updated automatically by an AI agent,
- the data is queryable by any Web3 application,
- the subdomain persists as a permanent reputation record,
- future grants can extend the same subdomain namespace.

This turns ENS from a naming system into a dynamic developer reputation 
registry. A developer who completes multiple grants accumulates a 
verifiable, cross-ecosystem execution history encoded directly in ENS.

## Why This Is Highly Aligned With Umia

Umia is designed to turn projects into legally structured, tokenized, 
agentic ventures through a CLI-first workflow that handles everything from 
project submission to legal entity formation, token issuance, and treasury 
setup.[web:714]

UmiaScore is the underwriting and reputation layer that improves the 
quality of ventures entering that pipeline.

Concretely, UmiaScore contributes to three things Umia needs:

**1. Better venture selection**  
Umia's Community Track uses decision market curation by UMIA token 
holders.[web:714] UmiaScore gives those token holders a structured, 
evidence-based reputation signal rather than pitch-quality alone before 
they allocate.

**2. Stronger token crowdfunding readiness**  
A developer who holds a live `projectname.prooffund.eth` with updated KPI 
text records and a passing audit score presents a significantly stronger 
crowdfunding narrative to token buyers than one without verifiable 
execution history.

**3. Native agentic execution**  
The entire UmiaScore workflow is agent-driven: an intake agent structures 
submissions, a scoring agent runs the audit, a prediction market contract 
governs funding, an AI monitoring agent updates ENS text records 
continuously, and a KPI verification agent triggers treasury releases.

This is not a tool bolted onto an agentic stack. It is natively agentic 
end-to-end.

## Long-Term Venture Potential

The UmiaScore infrastructure is designed to scale beyond the hackathon.

Target customer segments:
- onchain accelerators and incubators,
- DAO grant programs,
- ecosystem developer funds,
- protocol hackathons,
- venture studios building in Web3,
- agent-native investment pipelines.

Revenue paths:
- underwriting API for grant programs and DAO treasuries,
- B2B SaaS for structured developer due diligence,
- premium ENS subdomain namespaces for ecosystem reputation programs,
- milestone verification and treasury automation services,
- white-label reputation infrastructure for other onchain organizations.

## Why This Is Token-Crowdfunding Viable

A developer who passes a UmiaScore audit, wins a prediction market vote, 
holds a live ENS reputation subdomain, and delivers a verified milestone 
has produced the most legible, structured, and independently verifiable 
track record available in Web3 today.

That track record is exactly what makes a token crowdfunding round 
credible: the community is not buying a promise, it is buying into a 
developer whose execution quality is provably on-chain and queryable in 
real time.

That makes UmiaScore's output a natural input into any token launch 
supported by Umia's venture formation infrastructure.[web:714]

## Technical Stack

- Solidity smart contracts on Sepolia,
- ENS Sepolia NameWrapper for programmatic subdomain issuance,
- ENS Text Records for live KPI state encoding,
- Sourcify BigQuery dataset for verified contract history,
- AI Agent Orchestrator for audit, scoring, monitoring, and verification,
- Prediction Market contracts for community-governed funding,
- Treasury contracts for milestone-based tranche release,
- Backend API for agent orchestration and event indexing.

## Open Source

All contracts, agent code, and API are open source. 
Working prototype deployed on Sepolia.
