// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {Treasury} from "../src/Treasury.sol";
import {GrantFactory} from "../src/GrantFactory.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        Treasury treasury = new Treasury();
        console.log("Treasury deployed at:", address(treasury));

        GrantFactory factory = new GrantFactory(address(treasury));
        console.log("GrantFactory deployed at:", address(factory));

        vm.stopBroadcast();
    }
}