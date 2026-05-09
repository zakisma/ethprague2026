import logging

from src.tools.github_tool import analyze_github_repo
from .milestone_kpi_agent import analyze_milestones
from src.services.gemini_client import generate_json_with_fallback
from src.services.repository_gate import run_repository_substance_gate
from src.services.contract_plan import attach_contract_execution_plan
from src.prompts.deep_audit_prompt import build_deep_audit_prompt

logger = logging.getLogger(__name__)


def run_rejection_analysis_sync(app_data, reputation):
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

    gate_result = run_repository_substance_gate(
        app_data=app_data,
        reputation=reputation,
        github_results=github_results,
        milestone_report=milestone_report
    )

    if gate_result is not None:
        logger.info("Deep Audit stopped by deterministic repository gate.")
        return gate_result

    prompt = build_deep_audit_prompt(
        app_data=app_data,
        reputation=reputation,
        github_results=github_results,
        milestone_report=milestone_report
    )

    try:
        result_json = generate_json_with_fallback(
            prompt,
            preferred_model="gemini-2.5-flash"
        )

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

        result_json = attach_contract_execution_plan(result_json, app_data)

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