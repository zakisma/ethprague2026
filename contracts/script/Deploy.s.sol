// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {Treasury} from "../src/Treasury.sol";
import {AMMMarket} from "../src/AMMMarket.sol";
import {KPIVerifier} from "../src/KPIVerifier.sol";

contract DeployScript is Script {
    function run() external {
        // Load your private key from the .env file
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Start broadcasting transactions to the blockchain
        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy the Treasury
        Treasury treasury = new Treasury();
        console.log("Treasury deployed at:", address(treasury));

        // 2. Deploy the AMM Market (and link it to the Treasury)
        AMMMarket ammMarket = new AMMMarket(address(treasury));
        console.log("AMMMarket deployed at:", address(ammMarket));

        // 3. Deploy a Mock KPIVerifier for the Demo
        // In the real product, the AI deploys this dynamically per project.
        // For the hackathon, we deploy one static version to show it works.
        address mockDeveloper = msg.sender; 
        address mockProjectContract = address(0x123); // Fake project address
        
        KPIVerifier kpiVerifier = new KPIVerifier(
            address(treasury),
            mockDeveloper,
            mockProjectContract,
            100800,     // 14 days in Arbitrum blocks
            450,        // 1 hour snapshots
            0.05 ether, // KPI 2: Fee target
            0.5 ether,  // KPI 3: TWL target
            20,         // KPI 4: Unique callers
            0.1 ether,  // KPI 4: Min caller balance
            2           // KPI 5: Max missed pings
        );
        console.log("KPIVerifier deployed at:", address(kpiVerifier));

        vm.stopBroadcast();
    }
}
