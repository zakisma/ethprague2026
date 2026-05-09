// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/DecisionMarket.sol";

contract DecisionMarketTest is Test {
    DecisionMarket public market;
    
    address public aiAgent = address(this); // Тестовый контракт выступает как AI
    address public alice = address(0xA11CE);
    address public bob = address(0xB0B);

    function setUp() public {
        market = new DecisionMarket();
        
        // Даем Алисе и Бобу тестовые ETH
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
    }

    function testFullMarketLifecycle() public {
        uint256 marketId = 1;

        // 1. ИИ открывает рынок с начальной ликвидностью 0.1 ETH
        market.createMarket{value: 0.1 ether}(marketId);
        
        // 2. Фронтенд симулирует покупку для Алисы (ставит 1 ETH на YES)
        (uint256 expectedSharesAlice, uint256 feeAlice) = market.simulateBuy(marketId, 1, 1 ether);
        assertEq(feeAlice, 0.001 ether); // Проверяем 0.1% комиссии

        // Алиса покупает токены YES (minSharesOut ставим на 99% от ожидаемого для проскальзывания)
        vm.prank(alice);
        market.buyShares{value: 1 ether}(marketId, 1, (expectedSharesAlice * 99) / 100);

        // 3. Боб ставит 2 ETH на NO
        (uint256 expectedSharesBob, ) = market.simulateBuy(marketId, 2, 2 ether);
        vm.prank(bob);
        market.buyShares{value: 2 ether}(marketId, 2, (expectedSharesBob * 99) / 100);

        // 4. Таймер истек. ИИ замораживает рынок (Грант выдан)
        market.freezeMarket(marketId);

        // Попытка Боба купить токены во время заморозки должна провалиться
        vm.prank(bob);
        vm.expectRevert("Market not open");
        market.buyShares{value: 1 ether}(marketId, 2, 0);

        // 5. Проходит 14 дней. Разработчик ВЫПОЛНИЛ KPI. ИИ разрешает рынок в пользу YES (1)
        market.resolveMarket(marketId, 1);

        // 6. Алиса забирает выигрыш.
        uint256 aliceBalanceBefore = alice.balance;
        
        vm.prank(alice);
        market.claimWinnings(marketId);
        
        uint256 aliceBalanceAfter = alice.balance;
        
        // Алиса заработала больше, чем вложила, забрав деньги пула!
        assertTrue(aliceBalanceAfter > aliceBalanceBefore);
        console.log("Alice Profit (Wei):", aliceBalanceAfter - aliceBalanceBefore);

        // 7. Попытка Боба забрать выигрыш должна провалиться (он ставил на NO)
        vm.prank(bob);
        vm.expectRevert("No winning shares");
        market.claimWinnings(marketId);
    }
}