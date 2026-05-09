// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DecisionMarket {
    address public aiAgentAdmin;
    uint256 public constant FEE_PERCENT = 1; // 0.1% fee (1/1000)

    struct Market {
        uint256 poolYes;
        uint256 poolNo;
        uint8 status; // 0: Open, 1: Frozen, 2: Resolved
        uint8 winningOutcome; // 0: None, 1: YES, 2: NO
    }

    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => uint256)) public yesShares;
    mapping(uint256 => mapping(address => uint256)) public noShares;
    mapping(uint256 => uint256) public collectedFees;

    event MarketCreated(uint256 indexed marketId, uint256 initialLiquidity);
    event SharesBought(uint256 indexed marketId, address indexed buyer, uint8 outcome, uint256 amountIn, uint256 sharesOut);
    event MarketFrozen(uint256 indexed marketId);
    event MarketResolved(uint256 indexed marketId, uint8 winningOutcome);
    event WinningsClaimed(uint256 indexed marketId, address indexed user, uint256 amount);

    modifier onlyAdmin() {
        require(msg.sender == aiAgentAdmin, "Only AI Agent can call");
        _;
    }

    constructor() {
        aiAgentAdmin = msg.sender;
    }

    // 1. ИИ создает рынок, заливая начальную ликвидность (например, 0.01 ETH), 
    // чтобы задать стартовую цену 50/50.
    function createMarket(uint256 marketId) external payable onlyAdmin {
        require(markets[marketId].poolYes == 0, "Market already exists");
        require(msg.value > 0, "Requires initial liquidity");

        markets[marketId] = Market({
            poolYes: msg.value,
            poolNo: msg.value,
            status: 0,
            winningOutcome: 0
        });

        emit MarketCreated(marketId, msg.value);
    }

    // 2. Функция для Фронтенда (View). Возвращает сколько Shares получит юзер.
    // Математика CPAMM: x * y = k. 
    function simulateBuy(uint256 marketId, uint8 outcome, uint256 amountIn) public view returns (uint256 sharesOut, uint256 fee) {
        Market memory m = markets[marketId];
        require(m.status == 0, "Market not open");

        fee = (amountIn * FEE_PERCENT) / 1000;
        uint256 investment = amountIn - fee;

        if (outcome == 1) { // Покупка YES
            uint256 newPoolNo = m.poolNo + investment;
            uint256 newPoolYes = (m.poolYes * m.poolNo) / newPoolNo;
            uint256 sharesFromSwap = m.poolYes - newPoolYes;
            sharesOut = investment + sharesFromSwap;
        } else if (outcome == 2) { // Покупка NO
            uint256 newPoolYes = m.poolYes + investment;
            uint256 newPoolNo = (m.poolYes * m.poolNo) / newPoolYes;
            uint256 sharesFromSwap = m.poolNo - newPoolNo;
            sharesOut = investment + sharesFromSwap;
        } else {
            revert("Invalid outcome (1=YES, 2=NO)");
        }
    }

    // 3. Функция покупки (требует подписи и ETH от юзера).
    function buyShares(uint256 marketId, uint8 outcome, uint256 minSharesOut) external payable {
        require(markets[marketId].status == 0, "Market not open");
        
        (uint256 sharesOut, uint256 fee) = simulateBuy(marketId, outcome, msg.value);
        require(sharesOut >= minSharesOut, "Slippage tolerance exceeded");

        Market storage m = markets[marketId];
        collectedFees[marketId] += fee;
        uint256 investment = msg.value - fee;

        if (outcome == 1) {
            uint256 newPoolNo = m.poolNo + investment;
            uint256 newPoolYes = (m.poolYes * m.poolNo) / newPoolNo;
            m.poolNo = newPoolNo;
            m.poolYes = newPoolYes;
            yesShares[marketId][msg.sender] += sharesOut;
        } else {
            uint256 newPoolYes = m.poolYes + investment;
            uint256 newPoolNo = (m.poolYes * m.poolNo) / newPoolYes;
            m.poolYes = newPoolYes;
            m.poolNo = newPoolNo;
            noShares[marketId][msg.sender] += sharesOut;
        }

        emit SharesBought(marketId, msg.sender, outcome, msg.value, sharesOut);
    }

    // 4. ИИ замораживает торговлю, когда выдается грант.
    function freezeMarket(uint256 marketId) external onlyAdmin {
        markets[marketId].status = 1;
        emit MarketFrozen(marketId);
    }

    // 5. ИИ разрешает рынок после проверки KPI (14 дней спустя).
    function resolveMarket(uint256 marketId, uint8 winningOutcome) external onlyAdmin {
        require(markets[marketId].status != 2, "Already resolved");
        require(winningOutcome == 1 || winningOutcome == 2, "Invalid outcome");
        
        markets[marketId].status = 2;
        markets[marketId].winningOutcome = winningOutcome;
        
        emit MarketResolved(marketId, winningOutcome);
    }

    // 6. Победители забирают свои деньги (1 Share = 1 wei).
    function claimWinnings(uint256 marketId) external {
        require(markets[marketId].status == 2, "Market not resolved");
        uint8 winner = markets[marketId].winningOutcome;
        
        uint256 payout = 0;
        if (winner == 1) {
            payout = yesShares[marketId][msg.sender];
            yesShares[marketId][msg.sender] = 0; // Защита от Reentrancy
        } else if (winner == 2) {
            payout = noShares[marketId][msg.sender];
            noShares[marketId][msg.sender] = 0;
        }

        require(payout > 0, "No winning shares");
        
        (bool success, ) = payable(msg.sender).call{value: payout}("");
        require(success, "Transfer failed");

        emit WinningsClaimed(marketId, msg.sender, payout);
    }

    // Позволяет платформе забрать собранные комиссии.
    function withdrawFees(uint256 marketId) external onlyAdmin {
        uint256 amount = collectedFees[marketId];
        collectedFees[marketId] = 0;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
    }
}