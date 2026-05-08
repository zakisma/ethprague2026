// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title CodeAgent AMM Market
/// @notice Handles trading of vYES/vNO, collects 0.1% fees, and freezes collateral.
contract AMMMarket {
    // ─── STATE VARIABLES ──────────────────────────────────────────────────
    address public immutable treasury;
    address public immutable platform;
    
    bool public tradingActive = true;
    bool public marketResolved = false;
    bool public kpiPassed;

    // AMM Liquidity Pools (in wei)
    uint256 public poolYes;
    uint256 public poolNo;
    
    // User Balances (Virtual Tokens)
    mapping(address => uint256) public yesBalance;
    mapping(address => uint256) public noBalance;

    // 0.1% Fee = 1 / 1000
    uint256 public constant FEE_DENOMINATOR = 1000;

    // ─── EVENTS ───────────────────────────────────────────────────────────
    event TokensPurchased(address indexed buyer, bool isYes, uint256 amount, uint256 cost);
    event TradingFrozen();
    event MarketResolved(bool passed);
    event WinningsClaimed(address indexed trader, uint256 amount);

    // ─── CONSTRUCTOR ──────────────────────────────────────────────────────
    constructor(address _treasury) {
        platform = msg.sender;
        treasury = _treasury;
        
        // Initial virtual liquidity to prevent division by zero (50/50 odds)
        poolYes = 1 ether; 
        poolNo = 1 ether;
    }

    modifier onlyPlatform() {
        require(msg.sender == platform, "Only platform");
        _;
    }

    modifier tradingOpen() {
        require(tradingActive, "Trading is frozen");
        _;
    }

    // ─── 1. DYNAMIC PRICING (LMSR Approximation) ──────────────────────────
    /// @notice Returns the price of 1 virtual token in wei
    function getPrice(bool isYes) public view returns (uint256) {
        uint256 totalPool = poolYes + poolNo;
        if (isYes) {
            return (poolYes * 1 ether) / totalPool;
        } else {
            return (poolNo * 1 ether) / totalPool;
        }
    }

    // ─── 2. TRADING & FEES ────────────────────────────────────────────────
    function buyTokens(bool isYes) external payable tradingOpen {
        require(msg.value > 0, "Must send ETH");

        // Calculate 0.1% fee and subtract from trade
        uint256 fee = msg.value / FEE_DENOMINATOR;
        uint256 tradeValue = msg.value - fee;

        // Send 0.1% fee immediately to the treasury
        (bool feeSuccess, ) = treasury.call{value: fee}("");
        require(feeSuccess, "Fee transfer failed");

        // Calculate how many virtual tokens the user gets at current price
        uint256 currentPrice = getPrice(isYes);
        uint256 tokensToMint = (tradeValue * 1 ether) / currentPrice;

        // Update pools and internal balances
        if (isYes) {
            poolYes += tradeValue;
            yesBalance[msg.sender] += tokensToMint;
        } else {
            poolNo += tradeValue;
            noBalance[msg.sender] += tokensToMint;
        }

        emit TokensPurchased(msg.sender, isYes, tokensToMint, tradeValue);
    }

    // ─── 3. EXECUTION (FREEZE) ────────────────────────────────────────────
    /// @notice Called when funding is approved. Locks everyone's capital.
    function freezeTrading() external onlyPlatform {
        tradingActive = false;
        emit TradingFrozen();
    }

    // ─── 4. RESOLUTION ────────────────────────────────────────────────────
    /// @notice Called 14 days later based on the KPIVerifier's score
    function resolveMarket(bool _kpiPassed) external onlyPlatform {
        require(!tradingActive, "Must freeze before resolving");
        require(!marketResolved, "Already resolved");
        
        kpiPassed = _kpiPassed;
        marketResolved = true;
        
        emit MarketResolved(_kpiPassed);
    }

    // ─── 5. CLAIM WINNINGS ────────────────────────────────────────────────
    /// @notice Winning traders call this to extract their share of the pool
    function claimWinnings() external {
        require(marketResolved, "Market not resolved yet");
        
        uint256 payout = 0;
        uint256 totalPool = address(this).balance; // The actual ETH sitting in contract
        
        if (kpiPassed) {
            uint256 tokens = yesBalance[msg.sender];
            require(tokens > 0, "No YES tokens");
            yesBalance[msg.sender] = 0; // Prevent double-claim attack
            
            // Calculate pro-rata share
            payout = (tokens * totalPool) / poolYes; 
        } else {
            uint256 tokens = noBalance[msg.sender];
            require(tokens > 0, "No NO tokens");
            noBalance[msg.sender] = 0;
            
            payout = (tokens * totalPool) / poolNo;
        }

        require(payout > 0, "Nothing to claim");
        
        (bool success, ) = msg.sender.call{value: payout}("");
        require(success, "Payout failed");
        
        emit WinningsClaimed(msg.sender, payout);
    }
}
