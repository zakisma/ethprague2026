import React, { useState, useEffect } from 'react';
import { ArrowLeft, Zap, ShieldCheck, Target, ExternalLink, Loader2 } from 'lucide-react';

export default function Details({ project, milestone, onBack }) {
  const [betAmount, setBetAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('YES');

  // 1. ХРАНИМ СОСТОЯНИЕ ПУЛОВ В REACT (изначально берем из моков)
  const [poolYes, setPoolYes] = useState(milestone.yesPool);
  const [poolNo, setPoolNo] = useState(milestone.noPool);
  
  // 🥷 ХАКАФОННЫЙ ТРЮК #2: Берем баланс юзера тоже из объекта milestone!
  // Если там пусто (еще не покупали), ставим 0.
  const [userSharesYes, setUserSharesYes] = useState(milestone.userSharesYes || 0);
  const [userSharesNo, setUserSharesNo] = useState(milestone.userSharesNo || 0);

  // Фейковые состояния для симуляции транзакции
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // --- FIXED PREDICTION MARKET MATH ---
  // Price represents market probability (0.00 to 1.00)
  const currentPriceYes = poolYes / (poolYes + poolNo);
  const currentPriceNo = poolNo / (poolYes + poolNo);
  
  // Potential Return Multiplier (Odds) = 1 / Price
  const yesOdds = (1 / currentPriceYes).toFixed(2);
  const noOdds = (1 / currentPriceNo).toFixed(2);

  let potentialPayout = "0.00";
  let protocolFee = "0.00";
  let expectedShares = 0;

  const amountIn = Number(betAmount) || 0;

  if (amountIn > 0) {
    // Комиссия 0.1% (как в Solidity: FEE_PERCENT / 1000)
    const fee = amountIn * 0.001;
    protocolFee = fee.toFixed(4);
    const investment = amountIn - fee;

    // Simulate Slippage: Average execution price as the pool shifts
    if (selectedToken === 'YES') {
      const endPrice = (poolYes + investment) / (poolYes + investment + poolNo);
      const avgPrice = (currentPriceYes + endPrice) / 2;
      expectedShares = investment / avgPrice;
    } else {
      const endPrice = (poolNo + investment) / (poolNo + investment + poolYes);
      const avgPrice = (currentPriceNo + endPrice) / 2;
      expectedShares = investment / avgPrice;
    }

    potentialPayout = expectedShares.toFixed(4);
  }

  // 3. СИМУЛЯЦИЯ ПОКУПКИ (С ИЗМЕНЕНИЕМ КОЭФФИЦИЕНТОВ)
  const handleBuy = () => {
    if (amountIn <= 0) return;

    setIsConfirmed(false);
    setIsPending(true); // "Ждем подписи в кошельке"

    // Имитируем, что юзер подписывает транзакцию 1.5 секунды
    setTimeout(() => {
      setIsPending(false);
      setIsConfirming(true); // "Транзакция летит в блокчейн"

      // Имитируем майнинг блока 2.5 секунды
      setTimeout(() => {
        
        // --- ОБНОВЛЯЕМ ПУЛЫ ---
        const fee = amountIn * 0.001;
        const investment = amountIn - fee;

        if (selectedToken === 'YES') {
          const newYes = poolYes + investment;
          setPoolYes(newYes);
          
          setUserSharesYes(prev => {
            const newShares = prev + expectedShares;
            // 🥷 СОХРАНЯЕМ ПОЗИЦИЮ В ОБЪЕКТ НАВСЕГДА
            milestone.userSharesYes = newShares; 
            return newShares;
          });
          
          // 🥷 СИНХРОНИЗАЦИЯ С ГЛАВНОЙ СТРАНИЦЕЙ
          milestone.yesPool = newYes;
        } else {
          const newNo = poolNo + investment;
          setPoolNo(newNo);
          
          setUserSharesNo(prev => {
            const newShares = prev + expectedShares;
            // 🥷 СОХРАНЯЕМ ПОЗИЦИЮ В ОБЪЕКТ НАВСЕГДА
            milestone.userSharesNo = newShares; 
            return newShares;
          });

          // 🥷 СИНХРОНИЗАЦИЯ С ГЛАВНОЙ СТРАНИЦЕЙ
          milestone.noPool = newNo;
        }
        // ------------------------------------------

        setIsConfirming(false);
        setIsConfirmed(true); // Успех!
        setBetAmount(''); // Очищаем поле ввода
        
        // Убираем плашку успеха через 5 секунд
        setTimeout(() => setIsConfirmed(false), 5000);
      }, 2500);
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-left-4 duration-500">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-6 group cursor-pointer">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Markets
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ЛЕВАЯ КОЛОНКА */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111827] border border-gray-800 rounded-3xl p-8">
            <div className="flex items-center gap-2 text-gray-400 mb-4 text-sm font-bold uppercase tracking-wider">
              <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${project.name}`} alt="logo" className="w-6 h-6 rounded-md opacity-80" />
              {project.name} <ChevronRightIcon /> Roadmap Milestone
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
              {milestone.title}
            </h1>
            
            <div className="flex flex-wrap gap-4 items-center text-gray-400 text-sm mb-6">
              <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full">
                <ShieldCheck size={16} /> AI Verified
              </span>
              <a href={project.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white transition">
                <ExternalLink size={14} /> Official Site
              </a>
              <span>•</span>
              <span className="text-amber-400 font-mono">Deadline: {milestone.deadline}</span>
            </div>

            {/* Блок с динамикой пула (чтобы жюри видело изменения) */}
            <div className="mt-8 p-4 bg-black/40 border border-gray-800 rounded-xl grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Current YES Pool</p>
                <p className="text-lg font-mono text-emerald-400">{poolYes.toFixed(2)} ETH</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Current NO Pool</p>
                <p className="text-lg font-mono text-rose-400">{poolNo.toFixed(2)} ETH</p>
              </div>
            </div>
          </div>

          <div className="bg-[#111827] border border-gray-800 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Zap className="text-emerald-400" /> On-chain Verification Rules
            </h2>
            <p className="text-gray-400 mb-6 text-sm">
              If the developer completes this milestone, the AI Agent will verify the following criteria via RPC before resolving the market.
            </p>
            <div className="space-y-3">
              <KpiRow id="1" name="Verified Mainnet Deploy" desc="Sourcify API — bytecode match. Binary: Yes/No." />
              <KpiRow id="2" name="Protocol Fees → Treasury" desc="balanceOf(immutableTreasuryAddress) must increase." />
              <KpiRow id="3" name="Time-weighted ETH locked" desc="Snapshots totalLocked over 14 days to prevent Flash Loans." />
            </div>
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА (Виджет ставки) */}
        <div className="space-y-6">
          <div className="bg-[#111827] border-2 border-emerald-500/20 rounded-3xl p-6 sticky top-24">
            
            {/* Показываем купленные акции юзера, если есть */}
            {(userSharesYes > 0 || userSharesNo > 0) && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <p className="text-xs text-emerald-400 font-bold uppercase mb-2">Your Position</p>
                {userSharesYes > 0 && <p className="text-sm text-white font-mono">{userSharesYes.toFixed(2)} tYES</p>}
                {userSharesNo > 0 && <p className="text-sm text-white font-mono">{userSharesNo.toFixed(2)} tNO</p>}
              </div>
            )}

            <h3 className="text-xl font-bold text-white mb-6">Stake on Outcome</h3>
            
            <div className="flex p-1 bg-black/40 rounded-xl mb-6">
              <button 
                onClick={() => setSelectedToken('YES')}
                className={`flex-1 py-3 rounded-lg font-bold transition cursor-pointer ${selectedToken === 'YES' ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-gray-500 hover:text-white'}`}
              >
                Buy tYES <span className="text-xs block opacity-70">Odds: x{yesOdds}</span>
              </button>
              <button 
                onClick={() => setSelectedToken('NO')}
                className={`flex-1 py-3 rounded-lg font-bold transition cursor-pointer ${selectedToken === 'NO' ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'text-gray-500 hover:text-white'}`}
              >
                Buy tNO <span className="text-xs block opacity-70">Odds: x{noOdds}</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold ml-1">Investment Amount</label>
                <div className="relative mt-2">
                  <input 
                    type="number" 
                    placeholder="0.0"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl py-4 px-4 text-white font-mono focus:border-emerald-500 outline-none transition"
                  />
                  <span className="absolute right-4 top-4 text-gray-500 font-bold">ETH</span>
                </div>
              </div>

              <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-800 space-y-3 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Protocol Fee (0.1%):</span>
                  <span className="font-mono">{protocolFee} ETH</span>
                </div>

                <div className="flex justify-between items-center border-t border-gray-800 pt-3 text-gray-400">
                  <span>Est. Payout:</span>
                  <div className="flex items-center gap-2">
                    {/* Крутилка крутится, пока идет транзакция */}
                    {(isPending || isConfirming) && <Loader2 size={14} className="animate-spin text-emerald-500" />}
                    <span className={`font-bold font-mono text-lg ${selectedToken === 'YES' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {potentialPayout} <span className="text-xs">shares</span>
                    </span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleBuy}
                disabled={isPending || isConfirming || amountIn <= 0}
                className={`w-full text-black font-black py-4 rounded-xl transition transform active:scale-95 shadow-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${selectedToken === 'YES' ? 'bg-emerald-400 hover:bg-emerald-300' : 'bg-rose-400 hover:bg-rose-300'}`}
              >
                {isPending ? 'CONFIRM IN WALLET...' : isConfirming ? 'MINING...' : 'CONFIRM TRANSACTION'}
              </button>

              {/* Сообщение об успехе */}
              {isConfirmed && (
                <div className="text-center text-sm font-bold text-emerald-400 mt-2 animate-in fade-in zoom-in duration-300">
                  🎉 Transaction Successful! Odds Updated.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function ChevronRightIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><path d="m9 18 6-6-6-6"/></svg>;
}

function KpiRow({ id, name, desc }) {
  return (
    <div className="p-4 border border-gray-800 rounded-xl flex gap-4 items-start">
      <div className="bg-gray-800 text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 font-mono">
        {id}
      </div>
      <div>
        <h4 className="font-bold text-white text-sm">{name}</h4>
        <p className="text-sm text-gray-400 mt-1">{desc}</p>
      </div>
    </div>
  );
}