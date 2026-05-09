def attach_contract_execution_plan(result_json: dict, app_data) -> dict:
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
                "feeTarget": "0",
                "twlTarget": "0",
                "wDeploy": 55,
                "wFees": 0,
                "wTwl": 0,
                "wCallers": 35,
                "wLiveness": 10
            },
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

    return result_json