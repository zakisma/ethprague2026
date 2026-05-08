// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title CodeAgent Treasury
/// @notice Holds sponsor funds and AMM fees. Releases tranches to developers.
contract Treasury {
    address public immutable platform; // The AI Orchestrator backend

    event FundsReceived(address indexed sender, uint256 amount);
    event TrancheReleased(address indexed developer, uint256 amount, uint8 trancheNumber);
    event GrantSlashed(address indexed developer, string reason);

    constructor() {
        platform = msg.sender;
    }

    modifier onlyPlatform() {
        require(msg.sender == platform, "Only AI Platform Orchestrator can call this");
        _;
    }

    // ─── 1. RECEIVE FUNDS ─────────────────────────────────────────────────
    // Allows sponsors to donate ETH, and the AMM to send the 0.1% trading fees here.
    receive() external payable {
        emit FundsReceived(msg.sender, msg.value);
    }

    // ─── 2. TRANCHE 1 (EXECUTION) ─────────────────────────────────────────
    /// @notice Called when the AMM Market votes YES.
    function releaseTranche1(address developer, uint256 amount) external onlyPlatform {
        require(address(this).balance >= amount, "Not enough ETH in Treasury");
        
        (bool success, ) = developer.call{value: amount}("");
        require(success, "ETH transfer failed");
        
        emit TrancheReleased(developer, amount, 1);
    }

    // ─── 3. TRANCHE 2 (RESOLUTION) ────────────────────────────────────────
    /// @notice Called 14 days later if the KPIVerifier score is >= 70.
    function releaseTranche2(address developer, uint256 amount) external onlyPlatform {
        require(address(this).balance >= amount, "Not enough ETH in Treasury");
        
        (bool success, ) = developer.call{value: amount}("");
        require(success, "ETH transfer failed");
        
        emit TrancheReleased(developer, amount, 2);
    }

    // ─── 4. SLASHING (PUNISHMENT) ─────────────────────────────────────────
    /// @notice Called if the KPIVerifier score is < 70. 
    /// The funds remain in the treasury for future real builders.
    function slashGrant(address developer) external onlyPlatform {
        // In a complex DAO, we might refund sponsors. 
        // Here, we just keep the ETH in the treasury and emit the slash event.
        emit GrantSlashed(developer, "Failed to meet on-chain KPIs");
    }
    
    // ─── UTILITY ──────────────────────────────────────────────────────────
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
