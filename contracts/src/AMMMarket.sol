// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IKPIVerifier {
    function endBlock() external view returns (uint256);
    function currentScore() external view returns (uint256);
}

/// @title CodeAgent AMM Market
/// @notice Handles trading of vYES/vNO, collects 0.1% fees, and freezes collateral.
contract AMMMarket {
    address public immutable treasury;
    address public immutable platform;
    address public immutable kpiOracle;

    bool public tradingActive = true;
    bool public marketResolved = false;
    bool public kpiPassed;

    // Реальный ETH вложенный в каждую сторону (без виртуальных)
    uint256 public poolYes;
    uint256 public poolNo;
    
    // ФИКС 1: Трекаем общее количество выпущенных виртуальных токенов
    uint256 public totalYesTokens;
    uint256 public totalNoTokens;
    
    // ФИКС 2: Замороженный итоговый банк выигрыша
    uint256 public finalRewardPool;

    // Балансы пользователей (Виртуальные токены)
    mapping(address => uint256) public yesBalance;
    mapping(address => uint256) public noBalance;

    uint256 public constant FEE_DENOMINATOR = 1000;
    uint256 private constant VIRTUAL_BASE = 1 ether; // Только для математики цены

    event TokensPurchased(address indexed buyer, bool isYes, uint256 amount, uint256 cost);
    event TradingFrozen();
    event MarketResolved(bool passed);
    event WinningsClaimed(address indexed trader, uint256 amount);

    constructor(address _treasury, address _kpiOracle) {
        platform = msg.sender; // Платформой будет Фабрика
        treasury = _treasury;
        kpiOracle = _kpiOracle;
    }

    modifier onlyPlatform() {
        require(msg.sender == platform, "Only platform");
        _;
    }

    modifier tradingOpen() {
        require(tradingActive, "Trading is frozen");
        _;
    }

    function getPrice(bool isYes) public view returns (uint256) {
        uint256 vYes = poolYes + VIRTUAL_BASE;
        uint256 vNo = poolNo + VIRTUAL_BASE;
        uint256 total = vYes + vNo;
        
        return isYes 
            ? (vYes * 1 ether) / total 
            : (vNo * 1 ether) / total;
    }

    function buyTokens(bool isYes) external payable tradingOpen {
        require(msg.value > 0, "Must send ETH");

        uint256 fee = msg.value / FEE_DENOMINATOR;
        uint256 tradeValue = msg.value - fee;

        (bool feeSuccess, ) = treasury.call{value: fee}("");
        require(feeSuccess, "Fee transfer failed");

        uint256 currentPrice = getPrice(isYes);
        uint256 tokensToMint = (tradeValue * 1 ether) / currentPrice;

        if (isYes) {
            poolYes += tradeValue; // Трекаем реальный ETH
            totalYesTokens += tokensToMint; // Трекаем выпущенные токены
            yesBalance[msg.sender] += tokensToMint;
        } else {
            poolNo += tradeValue;
            totalNoTokens += tokensToMint;
            noBalance[msg.sender] += tokensToMint;
        }

        emit TokensPurchased(msg.sender, isYes, tokensToMint, tradeValue);
    }

    function freezeTrading() external onlyPlatform {
        tradingActive = false;
        emit TradingFrozen();
    }

    function resolveMarket() external {
        require(!tradingActive, "Must freeze before resolving");
        require(!marketResolved, "Already resolved");
        
        IKPIVerifier oracle = IKPIVerifier(kpiOracle);
        require(block.number > oracle.endBlock(), "KPI window not over");
        
        uint256 score = oracle.currentScore();
        kpiPassed = score >= 70;
        
        marketResolved = true;
        // Фиксируем итоговый баланс для честных выплат
        finalRewardPool = address(this).balance; 
        
        emit MarketResolved(kpiPassed);
    }

    function claimWinnings() external {
        require(marketResolved, "Market not resolved yet");
        
        uint256 payout = 0;
        
        if (kpiPassed) {
            uint256 tokens = yesBalance[msg.sender];
            require(tokens > 0, "No YES tokens");
            require(totalYesTokens > 0, "No YES winners");
            
            yesBalance[msg.sender] = 0; 
            // ФИКС 3: Честная пропорция (Твои Токены / Все Токены * Весь Банк)
            payout = (tokens * finalRewardPool) / totalYesTokens; 
        } else {
            uint256 tokens = noBalance[msg.sender];
            require(tokens > 0, "No NO tokens");
            require(totalNoTokens > 0, "No NO winners");
            
            noBalance[msg.sender] = 0;
            payout = (tokens * finalRewardPool) / totalNoTokens;
        }

        require(payout > 0, "Nothing to claim");
        
        (bool success, ) = msg.sender.call{value: payout}("");
        require(success, "Payout failed");
        
        emit WinningsClaimed(msg.sender, payout);
    }
}