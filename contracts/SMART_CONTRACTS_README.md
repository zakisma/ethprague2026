# Agentic Commons: Smart Contract Integration Guide

This document explains how the Frontend and Backend should interact with the deployed smart contracts on Arbitrum Sepolia.

## Deployed Addresses
Check the `deployments.json` file in the root directory for the live addresses.
* **Treasury:** Holds funds and pays out developers.
* **AMMMarket:** Handles vYES/vNO trading and collects fees.
* **KPIVerifier:** Calculates the 100-point trust score.

**ABI Files:** You can find the Application Binary Interfaces (ABI) required to interact with these contracts in `contracts/out/[ContractName].sol/[ContractName].json`.

---

## For the Frontend 
You only need to interact with the `AMMMarket` contract.

1. **Trading:** * Call `buyTokens(true)` sending ETH as `msg.value` to buy vYES.
   * Call `buyTokens(false)` sending ETH as `msg.value` to buy vNO.
2. **Displaying Prices:**
   * Call the view function `getPrice(true)` and `getPrice(false)` to show the current token prices.
3. **Claiming Winnings:**
   * After the market resolves, winners call `claimWinnings()` to withdraw their ETH.

---

## For the Backend (Python AI Agent)
You must use the Private Key of the Deployer wallet to sign these transactions. The Deployer is hardcoded as the `platform` (Admin) in these contracts.

### Phase 1: Market Execution
When the 3-day voting window ends and vYES wins:
1. Call `AMMMarket.freezeTrading()` -> This locks all traders' money.
2. Call `Treasury.releaseTranche1(developerAddress, amount)` -> Sends the first grant chunk.

### Phase 2: The 14-Day KPI Monitoring
During the 2-week development window, the AI Agent must run background jobs:
1. **Verify Deploy:** Check Sourcify. If verified, call `KPIVerifier.confirmDeploy()`.
2. **Snapshot TVL:** Call `KPIVerifier.snapshot()` every ~1 hour.
3. **Liveness Ping:** Call `KPIVerifier.ping()` once every 24 hours.

### Phase 3: Final Resolution
When the 14 days are over:
1. Call `KPIVerifier.resolve()`. This calculates the final score out of 100.
2. Call `AMMMarket.resolveMarket(passed)` passing `true` if score >= 70, or `false` if < 70.
3. If passed: Call `Treasury.releaseTranche2(...)` to pay the dev.
4. If failed: Call `Treasury.slashGrant(...)`.
