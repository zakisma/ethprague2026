// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AMMMarket} from "./AMMMarket.sol";
import {KPIVerifier} from "./KPIVerifier.sol";

contract GrantFactory {
    address public immutable treasury;
    address public immutable aiPlatform;

    event MarketDeployed(
        string projectName, 
        address indexed amm, 
        address indexed kpiVerifier, 
        string marketDescription
    );

    constructor(address _treasury) {
        aiPlatform = msg.sender;
        treasury = _treasury;
    }

    /// @notice AI Agent calls this to launch a new prediction market
    function createMarket(
        string calldata projectName,
        string calldata marketDescription, // e.g., "General Fund", "TVL Target"
        address developer,
        uint256 feeTarget,
        uint256 twlTarget,
        // Передаем веса для этого конкретного рынка
        uint256 wDeploy,
        uint256 wFees,
        uint256 wTwl,
        uint256 wCallers,
        uint256 wLiveness
    ) external returns (address amm, address kpi) {
        require(msg.sender == aiPlatform, "Only AI Agent");

        // create a new KPI Verifier for this market
        KPIVerifier newKPI = new KPIVerifier(
            treasury, developer, address(0), 
            100800, // duration
            450,    // snapshot interval
            feeTarget, twlTarget, 
            0, 0, 2, // caller target, min balance, max missed pings,ignore calllers for anti-sybil
            wDeploy, wFees, wTwl, wCallers, wLiveness // custom weights
        );

        // 2. Создаем AMM и связываем с этим KPI
        AMMMarket newAMM = new AMMMarket(treasury, address(newKPI));

        emit MarketDeployed(projectName, address(newAMM), address(newKPI), marketDescription);
        
        return (address(newAMM), address(newKPI));
    }
}