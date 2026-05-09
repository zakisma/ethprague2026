import json
import logging
from src.services.gemini_client import generate_json_with_fallback

logger = logging.getLogger(__name__)


def analyze_milestones(app_data, github_results, reputation) -> dict:
    """
    Converts applicant roadmap milestones into measurable market/KPI objects.
    This agent does not approve the project. It only evaluates milestone quality.
    """

    milestones = getattr(app_data, "milestones", []) or []

    if not milestones:
        return {
            "has_milestones": False,
            "milestone_assessments": [],
            "overall_milestone_quality": "missing",
            "blocking_issue": "No roadmap milestones were provided."
        }

    milestone_payload = [
        {
            "title": m.title,
            "verification_deadline": str(m.verification_deadline),
            "funding_needed": m.funding_needed,
            "onchain_kpi_description": m.onchain_kpi_description
        }
        for m in milestones
    ]

    prompt = f"""
You are a Web3 grant milestone auditor.

Your task is to evaluate whether each applicant milestone can be converted into a strict, measurable, externally verifiable KPI for a prediction market.

You must be strict. A milestone is weak if it is vague, subjective, not time-bound, not verifiable, or cannot be checked through public/on-chain evidence.

APPLICATION
Project title: {getattr(app_data, "project_title", "Unknown")}
Project description:
{getattr(app_data, "project_description", "No description")}

REPUTATION
Sourcify score: {getattr(reputation, "score", 0)}/1.0
Sourcify summary:
{getattr(reputation, "summary", [])}

GITHUB EVIDENCE
Detected stack: {github_results.get("detected_stack", [])}
Has smart contracts: {github_results.get("has_smart_contracts", False)}
Code map:
{github_results.get("code_map", "No code map")}

APPLICANT MILESTONES
{json.dumps(milestone_payload, indent=2)}

EVALUATION RULES

For every milestone, decide:
1. Is the milestone measurable?
2. Is it on-chain verifiable?
3. Can it be resolved by public evidence?
4. Is the deadline realistic?
5. Is the requested funding proportional?
6. Can it become a binary YES/NO prediction market?

Good KPI examples:
- "Deploy a verified contract on Base mainnet by 2026-07-01."
- "Reach at least 100 unique wallet interactions with the deployed contract by deadline."
- "Generate at least 0.5 ETH in protocol fees by deadline."
- "Maintain TVL above 10 ETH for 7 consecutive days."

Bad KPI examples:
- "Build community."
- "Improve UX."
- "Launch MVP."
- "Grow ecosystem."
- "Make partnerships."

Return only valid JSON.

Schema:
{{
  "has_milestones": true,
  "overall_milestone_quality": "strong" or "medium" or "weak",
  "blocking_issue": null or "string",
  "milestone_assessments": [
    {{
      "title": "string",
      "deadline": "YYYY-MM-DD",
      "funding_needed": 0,
      "original_kpi": "string",
      "normalized_kpi": null or "strict rewritten KPI",
      "is_measurable": true,
      "is_onchain_verifiable": true,
      "is_binary_resolvable": true,
      "risk_level": "low" or "medium" or "high",
      "verification_method": "How this can be verified",
      "rejection_reason": null or "Why this milestone is not acceptable"
    }}
  ]
}}
"""

    try:
        return generate_json_with_fallback(prompt, preferred_model="gemini-2.5-flash")

    except Exception as e:
        logger.error(f"Milestone analysis failed: {e}")
        return {
            "has_milestones": bool(milestones),
            "milestone_assessments": [],
            "overall_milestone_quality": "error",
            "blocking_issue": f"Milestone analysis failed: {str(e)}"
        }