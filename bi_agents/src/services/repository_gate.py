def run_repository_substance_gate(app_data, reputation, github_results: dict, milestone_report: dict):
    """
    Deterministic repository gate.

    Returns:
        None if repository can proceed to LLM audit.
        dict rejection report if repository is too weak.
    """

    code_map = github_results.get("code_map", "")
    detected_stack = github_results.get("detected_stack", [])
    has_smart_contracts = github_results.get("has_smart_contracts", False)

    implementation_markers = [
        "Functions:",
        "Classes:",
        ".sol",
        ".py",
        ".js",
        ".ts",
        ".tsx",
        ".jsx",
        "package.json",
        "Dockerfile",
        "contract ",
        "interface ",
        "library ",
    ]

    has_implementation_evidence = any(
        marker.lower() in code_map.lower()
        for marker in implementation_markers
    )

    only_readme_or_empty = (
        "Files scanned: 1" in code_map
        and "README.md" in code_map
    )

    if has_implementation_evidence and not only_readme_or_empty:
        return None

    return {
        "final_status": "rejected",
        "risk_level": "high",
        "market_readiness": False,
        "reasoning": (
            "Repository does not contain enough implementation evidence for a Web3 grant audit. "
            "The cloned repository appears to contain only README-level documentation or no meaningful code. "
            "A prediction market should not be created from claims and milestones alone."
        ),
        "evidence_summary": {
            "repository_substance": "Insufficient. No meaningful implementation files detected.",
            "claim_to_code_alignment": "Cannot be verified because repository lacks implementation.",
            "web3_relevance": "Not demonstrated in code.",
            "developer_credibility": f"Sourcify score: {getattr(reputation, 'score', 0)}.",
            "milestone_quality": milestone_report.get("overall_milestone_quality", "unknown"),
            "grant_amount_justification": "Not justified without implementation evidence."
        },
        "risk_scores": {
            "repository_substance": 0.0,
            "claim_to_code_alignment": 0.0,
            "web3_relevance": 0.0,
            "developer_credibility": float(getattr(reputation, "score", 0)),
            "milestone_quality": 0.3,
            "grant_amount_justification": 0.1,
            "kpi_measurability": 0.4
        },
        "main_risks": [
            "Repository contains no meaningful implementation evidence.",
            "Web3 functionality is not demonstrated in code.",
            "Milestones cannot compensate for an empty or README-only repository."
        ],
        "recommended_market_question": None,
        "recommended_kpi": None,
        "milestone_assessments": milestone_report.get("milestone_assessments", []),
        "confidence": 0.95,
        "contract_execution_plan": {
            "should_create_market": False,
            "contract_action": "none",
            "market_creation_params": None,
            "kpi_verifier_config": None,
            "tranche_plan": None,
            "notes": "Rejected by deterministic repository substance gate before market creation."
        },
        "github_meta": {
            "stars": github_results.get("stars", 0),
            "last_push_days": github_results.get("last_commit_days_ago", 999),
            "detected_stack": detected_stack,
            "has_smart_contracts": has_smart_contracts
        },
        "sourcify_meta": {
            "score": getattr(reputation, "score", 0),
            "verdict": getattr(reputation, "verdict", None),
            "summary": getattr(reputation, "summary", [])
        }
    }