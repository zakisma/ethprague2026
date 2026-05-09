// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {Treasury} from "../src/Treasury.sol";
import {AMMMarket} from "../src/AMMMarket.sol";
import {KPIVerifier} from "../src/KPIVerifier.sol";
import {GrantFactory} from "../src/GrantFactory.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy the Treasury
        Treasury treasury = new Treasury();
        console.log("Treasury deployed at:", address(treasury));

        // 2. Deploy Factory
        GrantFactory factory = new GrantFactory(address(treasury));
        console.log("GrantFactory deployed at:", address(factory));

        // 3. Deploy a Mock KPIVerifier & AMM for the Demo testing
        address mockDeveloper = msg.sender; 
        address mockProjectContract = address(0x123); 
        address mockAiPlatform = msg.sender; // ФИКС: Для тестов ИИ это мы сами
        
        KPIVerifier kpiVerifier = new KPIVerifier(
            address(treasury),
            mockDeveloper,
            mockProjectContract,
            mockAiPlatform, // ФИКС
            100800, 450,        
            0.05 ether, 0.5 ether,  
            20, 0.1 ether, 2,           
            25, 30, 25, 15, 5 // Mock weights
        );
        console.log("Mock KPIVerifier deployed at:", address(kpiVerifier));

        AMMMarket ammMarket = new AMMMarket(address(treasury), address(kpiVerifier));
        console.log("Mock AMMMarket deployed at:", address(ammMarket));

        vm.stopBroadcast();
    }
}