// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {ENSRegistry} from "../src/ENSRegistry.sol";

contract DeployENSScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        ENSRegistry ens = new ENSRegistry();
        console.log("ENSRegistry deployed at:", address(ens));

        vm.stopBroadcast();
    }
}
