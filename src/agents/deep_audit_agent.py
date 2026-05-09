import logging
import json

from src.tools.github_tool import analyze_github_repo
from agents.milestone_kpi_agent import analyze_milestones
from src.services.gemini_client import generate_json_with_fallback

logger = logging.getLogger(__name__)


def run_rejection_analysis_sync(app_data, reputation):
    """
    Lightweight AI-style rejection report.
    Does not analyze GitHub or milestones.
    Used only when Sourcify verdict is REJECTED.
    """

    return {
        "final_status": "rejected_by_reputation",
        "market_readiness": False,
        "decision": "REJECTED",
        "reason": "The applicant wallet did not pass the Sourcify reputation check.",
        "sourcify_verdict": reputation.verdict,
        "sourcify_score": reputation.score,
        "summary": getattr(reputation, "summary", []),
        "feedback": [
            "Verify and publish more smart contracts through Sourcify.",
            "Improve contract documentation and metadata quality.",
            "Build a longer on-chain activity history connected to the applicant wallet.",
            "Submit again once the wallet has stronger verified deployment evidence."
        ],
        "contract_execution_plan": {
            "should_create_market": False,
            "contract_action": "none",
            "market_creation_params": None,
            "kpi_verifier_config": None,
            "tranche_plan": None,
            "notes": "Rejected before repository analysis because the wallet reputation verdict was REJECTED."
        }
    }


def run_trust_profile_sync(app_data, reputation):
    """
    Lightweight positive trust report.
    Does not analyze GitHub or milestones.
    Used only when Sourcify verdict is APPROVED.
    """

    return {
        "final_status": "approved_by_reputation",
        "market_readiness": True,
        "decision": "APPROVED",
        "reason": "The applicant wallet has strong Sourcify-backed on-chain reputation.",
        "sourcify_verdict": reputation.verdict,
        "sourcify_score": reputation.score,
        "summary": getattr(reputation, "summary", []),
        "trust_profile": {
            "developer_credibility": "Strong on-chain reputation based on verified contract history.",
            "why_we_trust_this_applicant": getattr(reputation, "summary", []),
            "recommended_next_step": "Proceed to grant/market setup or optional project-level audit."
        },
        "contract_execution_plan": {
            "should_create_market": False,
            "contract_action": "none",
            "market_creation_params": None,
            "kpi_verifier_config": None,
            "tranche_plan": None,
            "notes": "Wallet reputation is approved. Market creation can be handled by a later project/KPI setup step."
        }
    }


def run_deep_audit(app_data, reputation):
    """
    Evidence Collector -> Milestone Agent -> Deep Audit Agent -> Market Decision
    """

    repo_url = getattr(app_data, "repo_url", None) or getattr(app_data, "github_url", None)

    logger.info(f"Starting Deep Audit for {repo_url}")

    github_results = analyze_github_repo(repo_url)
    milestone_report = analyze_milestones(app_data, github_results, reputation)

    prompt = f"""
You are a Senior Web3 Venture Auditor evaluating whether a grant application should proceed to an on-chain prediction market.

You are not a general chatbot. You are an evidence-based audit engine.

Your decision must be based on:
1. applicant claims,
2. GitHub evidence,
3. Sourcify/on-chain reputation,
4. milestone quality,
5. whether the project can be converted into strict prediction-market KPIs.

APPLICATION
Project title: {getattr(app_data, 'project_title', 'Unknown')}
Requested total grant amount: ${getattr(app_data, 'requested_amount', 0)}
Project description:
{getattr(app_data, 'project_description', 'No description')}

Repository:
{repo_url}

SOURCIFY / ON-CHAIN REPUTATION
Sourcify score: {reputation.score}/1.0
Sourcify summary:
{getattr(reputation, 'summary', 'No summary provided')}

GITHUB EVIDENCE
GitHub stars: {github_results.get('stars', 0)}
Days since last push: {github_results.get('last_commit_days_ago', 999)}
Detected stack: {github_results.get('detected_stack', [])}
Has smart contracts: {github_results.get('has_smart_contracts', False)}

CODE MAP
{github_results.get('code_map', 'Failed to parse')}

README
{github_results.get('readme_snippet', 'No README')}

MILESTONE ANALYSIS
{json.dumps(milestone_report, indent=2)}

AUDIT CRITERIA

Evaluate:

1. Repository substance
- Is there real implementation work?
- Is it only a scaffold?
- Are there tests, deployment files, APIs, smart contracts, or meaningful modules?

2. Claim-to-code alignment
- Does the repository support the applicant's claims?
- Are there major gaps between promised roadmap and existing code?

3. Web3 relevance
- Does the project include smart contracts, wallet integration, protocol logic, token mechanics, on-chain data, or blockchain infrastructure?
- If Web2-only, is there a credible Web3 transition path?

4. Developer credibility
- Does Sourcify history support the applicant's ability to deliver?
- Does GitHub compensate for weak on-chain history?

5. Milestone quality
- Are milestones measurable?
- Are they time-bound?
- Are they externally or on-chain verifiable?
- Are they suitable for prediction-market resolution?

6. Grant amount justification
- Is the amount proportional to current evidence and milestone difficulty?

DECISION RULES

Reject if:
- the project is unrelated to the repository,
- there is no meaningful implementation,
- the project is Web2-only without credible Web3 integration,
- milestones are vague or not verifiable,
- no strict market KPI can be formulated,
- requested amount is not justified by evidence.

Approve for market only if:
- repository evidence is meaningful,
- milestones can be converted into strict KPIs,
- Web3 relevance is clear or credible,
- risk is acceptable,
- the market question can be resolved using public/on-chain evidence.

OUTPUT REQUIREMENTS

Return only valid JSON.
No markdown.
No commentary outside JSON.
If rejected, recommended_kpi must be null.
If approved, recommended_kpi must be strict, binary, measurable, and deadline-bound.

Schema:
{{
  "final_status": "approved_for_market" or "rejected",
  "risk_level": "low" or "medium" or "high",
  "market_readiness": true or false,
  "reasoning": "Detailed evidence-based explanation.",
  "evidence_summary": {{
    "repository_substance": "short assessment",
    "claim_to_code_alignment": "short assessment",
    "web3_relevance": "short assessment",
    "developer_credibility": "short assessment",
    "milestone_quality": "short assessment",
    "grant_amount_justification": "short assessment"
  }},
  "risk_scores": {{
    "repository_substance": 0.0,
    "claim_to_code_alignment": 0.0,
    "web3_relevance": 0.0,
    "developer_credibility": 0.0,
    "milestone_quality": 0.0,
    "grant_amount_justification": 0.0,
    "kpi_measurability": 0.0
  }},
  "main_risks": [
    "risk 1",
    "risk 2"
  ],
  "recommended_market_question": null or "Binary prediction market question",
  "recommended_kpi": null or "Strict KPI",
  "milestone_assessments": [],
  "confidence": 0.0,
  "contract_execution_plan": {{
    "should_create_market": true,
    "contract_action": "create_market",
    "market_creation_params": {{
      "projectName": "string",
      "marketDescription": "string",
      "developer": "0x...",
      "feeTarget": "uint256 as string in wei",
      "twlTarget": "uint256 as string in wei",
      "wDeploy": 0,
      "wFees": 0,
      "wTwl": 0,
      "wCallers": 0,
      "wLiveness": 0
    }},
    "kpi_verifier_config": {{
      "durationBlocks": 100800,
      "snapshotInterval": 450,
      "callerTarget": 0,
      "minCallerBalance": "0",
      "maxMissedPings": 2,
      "grantContract": "0x0000000000000000000000000000000000000000"
    }},
    "tranche_plan": {{
      "tranche1Amount": "string",
      "tranche2Amount": "string",
      "currency": "PROJECT_UNIT"
    }},
    "notes": "string"
  }}
}}

CONTRACT PARAMETER GENERATION

If and only if final_status is "approved_for_market", generate contract_execution_plan for GrantFactory.createMarket().

The GrantFactory.createMarket() function requires:
- projectName: string
- marketDescription: string
- developer: address
- feeTarget: uint256, in wei
- twlTarget: uint256, in wei
- wDeploy: uint256
- wFees: uint256
- wTwl: uint256
- wCallers: uint256
- wLiveness: uint256

The five weights must sum to exactly 100.
Use weights to reflect the selected KPI type:
- deployment-heavy markets should prioritize wDeploy
- revenue markets should prioritize wFees
- liquidity markets should prioritize wTwl
- adoption markets should prioritize wCallers
- uptime/service markets should prioritize wLiveness

If a metric is not relevant or cannot be verified, set its target and weight to 0.

If rejected:
- should_create_market must be false
- market_creation_params must be null
- tranche_plan must be null

If approved:
- should_create_market must be true
- contract_action must be "create_market"
- market_creation_params must be fully populated
- tranche_plan must be populated
"""
    try:
        # 1. Generate base AI audit report
        result_json = generate_json_with_fallback(
            prompt,
            preferred_model="gemini-2.5-flash"
        )

        # 2. Enrich with deterministic metadata
        result_json["milestone_assessments"] = milestone_report.get(
            "milestone_assessments", []
        )

        result_json["github_meta"] = {
            "stars": github_results.get("stars", 0),
            "last_push_days": github_results.get("last_commit_days_ago", 999),
            "detected_stack": github_results.get("detected_stack", []),
            "has_smart_contracts": github_results.get("has_smart_contracts", False)
        }

        result_json["sourcify_meta"] = {
            "score": getattr(reputation, "score", 0),
            "verdict": getattr(reputation, "verdict", None),
            "summary": getattr(reputation, "summary", [])
        }

        # 3. Build backend/blockchain execution plan
        developer_wallet = getattr(app_data, "applicant_wallet_address", None)
        requested_amount = float(getattr(app_data, "requested_amount", 0))

        if result_json.get("final_status") == "approved_for_market":
            result_json["contract_execution_plan"] = {
                "should_create_market": True,
                "contract_action": "create_market",
                "market_creation_params": {
                    "projectName": getattr(app_data, "project_title", "Unknown Project"),
                    "marketDescription": (
                        result_json.get("recommended_market_question")
                        or result_json.get("recommended_kpi")
                        or "Grant KPI prediction market"
                    ),
                    "developer": developer_wallet,

                    # Current GrantFactory.createMarket() params.
                    # uint256 values are represented as strings for backend safety.
                    "feeTarget": "0",
                    "twlTarget": "0",

                    # Weights must sum to 100.
                    "wDeploy": 55,
                    "wFees": 0,
                    "wTwl": 0,
                    "wCallers": 35,
                    "wLiveness": 10
                },

                # Optional metadata for DB / future contract version.
                "kpi_verifier_config": {
                    "durationBlocks": 100800,
                    "snapshotInterval": 450,
                    "callerTarget": 0,
                    "minCallerBalance": "0",
                    "maxMissedPings": 2,
                    "grantContract": "0x0000000000000000000000000000000000000000"
                },

                "tranche_plan": {
                    "tranche1Amount": str(int(requested_amount * 0.5)),
                    "tranche2Amount": str(int(requested_amount * 0.5)),
                    "currency": "PROJECT_UNIT_NOT_WEI"
                },

                "notes": "Backend can call GrantFactory.createMarket with market_creation_params."
            }

        else:
            result_json["contract_execution_plan"] = {
                "should_create_market": False,
                "contract_action": "none",
                "market_creation_params": None,
                "kpi_verifier_config": None,
                "tranche_plan": None,
                "notes": "Application rejected or not ready for market creation."
            }

        logger.info(f"Deep Audit Complete. Verdict: {result_json.get('final_status')}")
        return result_json

    except Exception as e:
        logger.error(f"Deep audit failed: {e}")

        return {
            "final_status": "project_ai_review_failed",
            "risk_level": "high",
            "market_readiness": False,
            "reasoning": f"AI Engine Error: {str(e)}",
            "recommended_market_question": None,
            "recommended_kpi": None,
            "milestone_assessments": milestone_report.get("milestone_assessments", []),
            "contract_execution_plan": {
                "should_create_market": False,
                "contract_action": "none",
                "market_creation_params": None,
                "kpi_verifier_config": None,
                "tranche_plan": None,
                "notes": "AI audit failed. Backend must not create a market."
            },
            "github_meta": {
                "stars": github_results.get("stars", 0),
                "last_push_days": github_results.get("last_commit_days_ago", 999),
                "detected_stack": github_results.get("detected_stack", []),
                "has_smart_contracts": github_results.get("has_smart_contracts", False)
            },
            "sourcify_meta": {
                "score": getattr(reputation, "score", 0),
                "verdict": getattr(reputation, "verdict", None),
                "summary": getattr(reputation, "summary", [])
            }
        }