// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/DecisionMarket.sol";

contract DecisionMarketSeriousTest is Test {
    DecisionMarket public market;
    address public aiAdmin = address(this);
    address public hacker = address(0xBAD);
    address public trader = address(0x600D);

    function setUp() public {
        market = new DecisionMarket();
        vm.deal(hacker, 100 ether);
        vm.deal(trader, 100 ether);
        
        // Создаем рынок ID 1 с ликвидностью 1 ETH
        market.createMarket{value: 1 ether}(1);
    }

    // ТЕСТ 1: Точная проверка математики комиссий (0.1%)
    function testFeeMathAndBalances() public {
        uint256 investAmount = 1 ether; // 10^18 wei
        uint256 expectedFee = (investAmount * 1) / 1000; // 0.1% = 0.001 ETH
        
        vm.prank(trader);
        market.buyShares{value: investAmount}(1, 1, 0); // Покупает YES
        
        // Проверяем, что контракт забрал ровно 0.001 ETH в копилку платформы
        assertEq(market.collectedFees(1), expectedFee);
        // Проверяем, что в пул YES ушло ровно 0.999 ETH
// Распаковываем кортеж. Нам нужно только первое значение (poolYes), остальные пропускаем запятыми
        (, uint256 poolNo, , ) = market.markets(1);
        assertEq(poolNo, 1 ether + (investAmount - expectedFee));
    }

    // ТЕСТ 2: Защита от проскальзывания (Slippage Revert)
    function testRevertOnSlippage() public {
        // Трейдер ожидает получить 1000 shares
        uint256 fakeExpectedShares = 1000 ether; 
        
        vm.prank(trader);
        vm.expectRevert("Slippage tolerance exceeded");
        // Передаем minSharesOut больше, чем АММ может выдать за 1 wei
        market.buyShares{value: 1 wei}(1, 1, fakeExpectedShares);
    }

    // ТЕСТ 3: Защита от покупки после дедлайна (Заморозка)
    function testRevertBuyAfterFreeze() public {
        // ИИ замораживает рынок (грант выдан)
        market.freezeMarket(1);

        vm.prank(hacker);
        vm.expectRevert("Market not open");
        // Хакер пытается влить деньги, чтобы перевесить результат
        market.buyShares{value: 10 ether}(1, 1, 0);
    }

    // ТЕСТ 4: Защита от преждевременного снятия выигрыша и двойного снятия
    function testRevertClaimBeforeResolveAndDoubleClaim() public {
        vm.prank(trader);
        market.buyShares{value: 5 ether}(1, 1, 0); // Трейдер покупает YES

        // 1. Попытка забрать деньги ДО решения ИИ
        vm.prank(trader);
        vm.expectRevert("Market not resolved");
        market.claimWinnings(1);

        // ИИ выносит вердикт: YES победил
        market.resolveMarket(1, 1);

        // 2. Трейдер успешно забирает деньги
        uint256 balanceBefore = trader.balance;
        vm.prank(trader);
        market.claimWinnings(1);
        assertTrue(trader.balance > balanceBefore); // Деньги пришли

        // 3. Попытка забрать деньги второй раз (Reentrancy/Double spend защита)
        vm.prank(trader);
        vm.expectRevert("No winning shares");
        market.claimWinnings(1);
    }
}