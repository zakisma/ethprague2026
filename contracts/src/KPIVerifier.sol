// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title KPIVerifier
/// @notice Tracks and scores 5 on-chain KPIs for a grant recipient.
contract KPIVerifier {

    // ─── CONFIG ─────────────────────────────────────────────────────────────
    address public immutable platform;      // ФИКС: The AI Agent
    address public immutable treasury;      // locked fee collector
    address public immutable grantee;       // developer wallet
    
    address public grantContract;           // ФИКС: Убрали immutable, чтобы ИИ мог задать его позже

    uint256 public immutable startBlock;
    uint256 public immutable endBlock;
    uint256 public immutable snapshotInterval;

    uint256 public constant SCORE_THRESHOLD = 70;

    uint256 public immutable wDeploy;
    uint256 public immutable wFees;
    uint256 public immutable wTwl;
    uint256 public immutable wCallers;
    uint256 public immutable wLiveness;

    bool public deployVerified;
    uint256 public immutable feeTarget;

    uint256 public immutable twlTarget;
    uint256 public snapshotSum;
    uint256 public snapshotCount;
    uint256 public lastSnapshotBlock;

    uint256 public immutable callerTarget;
    uint256 public immutable minCallerBalance;
    mapping(address => bool) public validCallers;
    uint256 public uniqueCallerCount;

    uint256 public lastPingBlock;
    uint256 public missedPings;
    bool public livenessOk = true;
    uint256 public immutable maxMissedPings;

    bool public resolved;

    event Snapshot(uint256 block_, uint256 locked, uint256 snapshotCount);
    event CallerRecorded(address caller, uint256 totalUnique);
    event Pinged(uint256 block_);
    event KPIResolved(uint256 score, bool passed);
    event GrantContractSet(address contractAddress);

    constructor(
        address _treasury,
        address _grantee,
        address _grantContract,
        address _aiPlatform,           // ФИКС: Передаем адрес ИИ напрямую
        uint256 _durationBlocks,
        uint256 _snapshotInterval,
        uint256 _feeTarget,
        uint256 _twlTarget,
        uint256 _callerTarget,
        uint256 _minCallerBalance,
        uint256 _maxMissedPings,
        uint256 _wDeploy,
        uint256 _wFees,
        uint256 _wTwl,
        uint256 _wCallers,
        uint256 _wLiveness
    ) {
        platform = _aiPlatform;        // ФИКС: Записываем ИИ как владельца
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

    // ФИКС: Позволяет ИИ задать адрес протокола, когда разработчик его задеплоит
    function setGrantContract(address _contract) external onlyPlatform beforeEnd {
        require(grantContract == address(0), "Contract already set");
        grantContract = _contract;
        emit GrantContractSet(_contract);
    }

    function confirmDeploy() external onlyPlatform beforeEnd {
        deployVerified = true;
    }

    function snapshot() external beforeEnd {
        require(block.number >= lastSnapshotBlock + snapshotInterval, "Too soon");
        uint256 locked = grantContract == address(0) ? 0 : grantContract.balance;
        snapshotSum += locked;
        snapshotCount += 1;
        lastSnapshotBlock = block.number;
        emit Snapshot(block.number, locked, snapshotCount);
    }

    function recordCaller(address caller) external onlyGrantContract beforeEnd {
        if (validCallers[caller]) return;
        if (caller == grantee) return;
        if (caller.balance < minCallerBalance) return;
        validCallers[caller] = true;
        uniqueCallerCount += 1;
        emit CallerRecorded(caller, uniqueCallerCount);
    }

    function ping() external onlyPlatform beforeEnd {
        uint256 expectedPingInterval = 7200; // ~24h
        if (block.number > lastPingBlock + expectedPingInterval * 2) {
            missedPings += 1;
        }
        if (missedPings >= maxMissedPings) {
            livenessOk = false;
        }
        lastPingBlock = block.number;
        emit Pinged(block.number);
    }

    function currentScore() public view returns (uint256 score) {
        if (deployVerified) score += wDeploy;
        
        uint256 fees = treasury.balance;
        if (fees >= feeTarget) {
            score += wFees;
        } else if (feeTarget > 0) {
            score += (fees * wFees) / feeTarget;
        }

        if (snapshotCount > 0) {
            uint256 avgLocked = snapshotSum / snapshotCount;
            if (avgLocked >= twlTarget) {
                score += wTwl;
            } else if (twlTarget > 0) {
                score += (avgLocked * wTwl) / twlTarget;
            }
        }

        if (uniqueCallerCount >= callerTarget) {
            score += wCallers;
        } else if (callerTarget > 0) {
            score += (uniqueCallerCount * wCallers) / callerTarget;
        }

        // ФИКС: Жесткая проверка Liveness на момент запроса счета
        bool isLivenessOk = livenessOk && (block.number <= lastPingBlock + (7200 * maxMissedPings));
        if (isLivenessOk) score += wLiveness;
    }

    function resolve() external onlyPlatform returns (bool passed) {
        require(block.number > endBlock, "KPI window not over");
        require(!resolved, "Already resolved");
        resolved = true;
        uint256 score = currentScore();
        passed = score >= SCORE_THRESHOLD;
        emit KPIResolved(score, passed);
    }
}