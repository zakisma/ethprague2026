// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title KPIVerifier
/// @notice Tracks and scores 5 on-chain KPIs for a grant recipient.
///         All checks are pure on-chain — no oracles, no AI, no external APIs.
///         Score >= 70/100 → KPI Met → Tranche 2 released.

contract KPIVerifier {

    // ─── CONFIG ─────────────────────────────────────────────────────────────

    address public immutable treasury;      // locked fee collector (not dev-controlled)
    address public immutable grantee;       // developer wallet
    address public immutable grantContract; // the deployed protocol contract being tracked

    uint256 public immutable startBlock;
    uint256 public immutable endBlock;      // startBlock + ~14 days in blocks
    uint256 public immutable snapshotInterval; // e.g. every 50 blocks (~10 min on Arbitrum)

    uint256 public constant SCORE_THRESHOLD = 70;

    // Weights (out of 100)
    // uint256 public constant wDeploy    = 25; // KPI 1
    // uint256 public constant wFees      = 30; // KPI 2
    // uint256 public constant wTwl       = 25; // KPI 3
    // uint256 public constant wCallers   = 15; // KPI 4
    // uint256 public constant wLiveness  =  5; // KPI 5
    uint256 public immutable wDeploy;
    uint256 public immutable wFees;
    uint256 public immutable wTwl;
    uint256 public immutable wCallers;
    uint256 public immutable wLiveness;

    // ─── KPI 1: VERIFIED MAINNET DEPLOY ─────────────────────────────────────
    // Set once by the platform after Sourcify confirmation off-chain.
    // Only the platform (owner) can set this — it's a binary trust anchor.
    bool public deployVerified;

    // ─── KPI 2: PROTOCOL FEES → LOCKED TREASURY ─────────────────────────────
    // Target fee amount in wei that must accumulate in treasury.
    uint256 public immutable feeTarget;

    // ─── KPI 3: TIME-WEIGHTED LOCKED VALUE ──────────────────────────────────
    // Anyone calls `snapshot()` every snapshotInterval blocks.
    // We average totalLocked across all snapshots.
    uint256 public immutable twlTarget;  // target average locked in wei
    uint256 public snapshotSum;
    uint256 public snapshotCount;
    uint256 public lastSnapshotBlock;

    // ─── KPI 4: NON-OWNER CALLERS WITH REAL ETH ─────────────────────────────
    // Grant contract must call `recordCaller(address)` for each user interaction.
    // We verify caller is not owner and has >= minCallerBalance at call time.
    uint256 public immutable callerTarget;      // e.g. 20 unique callers
    uint256 public immutable minCallerBalance;  // e.g. 0.1 ETH
    mapping(address => bool) public validCallers;
    uint256 public uniqueCallerCount;

    // ─── KPI 5: CONTRACT LIVENESS ────────────────────────────────────────────
    // Platform pings `ping()` every 24h. Miss 2 pings → liveness = false.
    uint256 public lastPingBlock;
    uint256 public missedPings;
    bool public livenessOk = true;
    uint256 public immutable maxMissedPings; // e.g. 2

    // ─── ACCESS ──────────────────────────────────────────────────────────────
    address public immutable platform; // the grant platform (this contract's deployer)
    bool public resolved;

    // ─── EVENTS ──────────────────────────────────────────────────────────────
    event Snapshot(uint256 block_, uint256 locked, uint256 snapshotCount);
    event CallerRecorded(address caller, uint256 totalUnique);
    event Pinged(uint256 block_);
    event KPIResolved(uint256 score, bool passed);

    // ─── CONSTRUCTOR ─────────────────────────────────────────────────────────
    // constructor(
    //     address _treasury,
    //     address _grantee,
    //     address _grantContract,
    //     uint256 _durationBlocks,       // e.g. 100800 ≈ 14 days on Arbitrum (1 block/8s)
    //     uint256 _snapshotInterval,     // e.g. 450   ≈ 1 hour
    //     uint256 _feeTarget,            // e.g. 0.05 ether
    //     uint256 _twlTarget,            // e.g. 0.5 ether average locked
    //     uint256 _callerTarget,         // e.g. 20
    //     uint256 _minCallerBalance,     // e.g. 0.1 ether
    //     uint256 _maxMissedPings        // e.g. 2
    // ) {
    //     platform          = msg.sender;
    //     treasury          = _treasury;
    //     grantee           = _grantee;
    //     grantContract     = _grantContract;
    //     startBlock        = block.number;
    //     endBlock          = block.number + _durationBlocks;
    //     snapshotInterval  = _snapshotInterval;
    //     feeTarget         = _feeTarget;
    //     twlTarget         = _twlTarget;
    //     callerTarget      = _callerTarget;
    //     minCallerBalance  = _minCallerBalance;
    //     maxMissedPings    = _maxMissedPings;
    //     lastSnapshotBlock = block.number;
    //     lastPingBlock     = block.number;
    // }

    constructor(
        address _treasury,
        address _grantee,
        address _grantContract,
        uint256 _durationBlocks,       // e.g. 100800 ≈ 14 days on Arbitrum (1 block/8s)
        uint256 _snapshotInterval,     // e.g. 450   ≈ 1 hour
        uint256 _feeTarget,            // e.g. 0.05 ether
        uint256 _twlTarget,            // e.g. 0.5 ether average locked
        uint256 _callerTarget,         // e.g. 20
        uint256 _minCallerBalance,     // e.g. 0.1 ether
        uint256 _maxMissedPings,        // e.g. 2
        uint256 _wDeploy,
        uint256 _wFees,
        uint256 _wTwl,
        uint256 _wCallers,
        uint256 _wLiveness
    ) {
        platform = msg.sender;
        treasury = _treasury;
        grantee = _grantee;
        grantContract = _grantContract;
        startBlock = block.number;
        endBlock = block.number + _durationBlocks;
        snapshotInterval = _snapshotInterval;
        feeTarget = _feeTarget;
        twlTarget = _twlTarget;
        callerTarget = _callerTarget;
        minCallerBalance = _minCallerBalance;
        maxMissedPings = _maxMissedPings;
        lastSnapshotBlock = block.number;
        lastPingBlock = block.number;
        
        // --- ЗАПИСЫВАЕМ ВЕСА ---
        wDeploy = _wDeploy;
        wFees = _wFees;
        wTwl = _wTwl;
        wCallers = _wCallers;
        wLiveness = _wLiveness;
    }

    modifier onlyPlatform() {
        require(msg.sender == platform, "Only platform");
        _;
    }

    modifier onlyGrantContract() {
        require(msg.sender == grantContract, "Only grant contract");
        _;
    }

    modifier beforeEnd() {
        require(block.number <= endBlock, "KPI window closed");
        _;
    }

    // ─── KPI 1: Platform confirms Sourcify verification ──────────────────────
    function confirmDeploy() external onlyPlatform beforeEnd {
        deployVerified = true;
    }

    // ─── KPI 2: Checked at resolution via treasury.balance ───────────────────
    // No function needed — read directly from treasury address balance.

    // ─── KPI 3: Anyone can call snapshot (incentivised by platform) ──────────
    /// @notice Snapshots current TVL of grantContract. Call every ~snapshotInterval blocks.
    function snapshot() external beforeEnd {
        require(
            block.number >= lastSnapshotBlock + snapshotInterval,
            "Too soon to snapshot"
        );
        uint256 locked = grantContract.balance; // or call a `totalLocked()` view fn
        snapshotSum   += locked;
        snapshotCount += 1;
        lastSnapshotBlock = block.number;
        emit Snapshot(block.number, locked, snapshotCount);
    }

    // ─── KPI 4: Grant contract reports each unique real user interaction ──────
    /// @notice Called by grantContract when a user (non-owner) interacts.
    function recordCaller(address caller) external onlyGrantContract beforeEnd {
        if (validCallers[caller]) return;                          // already counted
        if (caller == grantee) return;                             // not the dev
        if (caller.balance < minCallerBalance) return;             // not a real wallet
        validCallers[caller] = true;
        uniqueCallerCount += 1;
        emit CallerRecorded(caller, uniqueCallerCount);
    }

    // ─── KPI 5: Platform pings every ~24h to confirm liveness ───────────────
    uint256 public immutable pingInterval; // set in constructor ideally; hardcoded here
    function ping() external onlyPlatform beforeEnd {
        // If platform missed a ping window, count it
        uint256 expectedPingInterval = 7200; // ~24h on Arbitrum (1 block/12s)
        if (block.number > lastPingBlock + expectedPingInterval * 2) {
            missedPings += 1;
        }
        if (missedPings >= maxMissedPings) {
            livenessOk = false;
        }
        lastPingBlock = block.number;
        emit Pinged(block.number);
    }

    // ─── SCORE CALCULATION ───────────────────────────────────────────────────
    /// @notice Returns current score out of 100. Pure on-chain.
    function currentScore() public view returns (uint256 score) {
        // KPI 1: Deploy verified (binary)
        if (deployVerified) score += wDeploy;

        // KPI 2: Protocol fees in treasury (proportional, capped at weight)
        uint256 fees = treasury.balance;
        if (fees >= feeTarget) {
            score += wFees;
        } else if (feeTarget > 0) {
            score += (fees * wFees) / feeTarget; // partial credit
        }

        // KPI 3: Time-weighted locked value (proportional)
        if (snapshotCount > 0) {
            uint256 avgLocked = snapshotSum / snapshotCount;
            if (avgLocked >= twlTarget) {
                score += wTwl;
            } else if (twlTarget > 0) {
                score += (avgLocked * wTwl) / twlTarget; // partial credit
            }
        }

        // KPI 4: Unique real callers (proportional)
        if (uniqueCallerCount >= callerTarget) {
            score += wCallers;
        } else if (callerTarget > 0) {
            score += (uniqueCallerCount * wCallers) / callerTarget; // partial credit
        }

        // KPI 5: Liveness (binary)
        if (livenessOk) score += wLiveness;
    }

    // ─── RESOLUTION ──────────────────────────────────────────────────────────
    /// @notice Called by platform after endBlock. Returns pass/fail.
    ///         The grant Treasury contract listens to this result.
    function resolve() external onlyPlatform returns (bool passed) {
        require(block.number > endBlock, "KPI window not over");
        require(!resolved, "Already resolved");
        resolved = true;
        uint256 score = currentScore();
        passed = score >= SCORE_THRESHOLD;
        emit KPIResolved(score, passed);
    }
}
