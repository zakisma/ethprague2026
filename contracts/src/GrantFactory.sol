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

    function createMarket(
        string calldata projectName,
        string calldata marketDescription,
        address developer,
        uint256 feeTarget,
        uint256 twlTarget,
        uint256 wDeploy,
        uint256 wFees,
        uint256 wTwl,
        uint256 wCallers,
        uint256 wLiveness
    ) external returns (address amm, address kpi) {
        require(msg.sender == aiPlatform, "Only AI Agent");

        // ФИКС: Передаем aiPlatform четвертым аргументом
        KPIVerifier newKPI = new KPIVerifier(
            treasury, developer, address(0), aiPlatform,
            100800, 450, 
            feeTarget, twlTarget, 
            0, 0, 2, 
            wDeploy, wFees, wTwl, wCallers, wLiveness
        );

        AMMMarket newAMM = new AMMMarket(treasury, address(newKPI));

        emit MarketDeployed(projectName, address(newAMM), address(newKPI), marketDescription);
        
        return (address(newAMM), address(newKPI));
    }
}