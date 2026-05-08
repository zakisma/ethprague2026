import React, { useState } from 'react';
import { ArrowLeft, Zap, ShieldCheck, Target, ExternalLink } from 'lucide-react';

export default function Details({ project, milestone, onBack }) {
  const [betAmount, setBetAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('YES');

  const total = milestone.yesPool + milestone.noPool;
  const yesOdds = (total / milestone.yesPool).toFixed(2);
  const noOdds = (total / milestone.noPool).toFixed(2);

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-left-4 duration-500">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-6 group cursor-pointer">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Markets
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ЛЕВАЯ КОЛОНКА */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Инфо о проекте и цели */}
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
          </div>

          {/* KPI для конкретной вехи */}
          <div className="bg-[#111827] border border-gray-800 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Zap className="text-emerald-400" /> On-chain Verification Rules
            </h2>
            <p className="text-gray-400 mb-6 text-sm">
              If the developer completes this milestone, the AI Agent will verify the following criteria via RPC before resolving the market.
            </p>
            <div className="space-y-3">
              {/* Мы показываем те KPI, что ты скидывал */}
              <KpiRow id="1" name="Verified Mainnet Deploy" desc="Sourcify API — bytecode match. Binary: Yes/No." />
              <KpiRow id="2" name="Protocol Fees → Treasury" desc="balanceOf(immutableTreasuryAddress) must increase." />
              <KpiRow id="3" name="Time-weighted ETH locked" desc="Snapshots totalLocked over 14 days to prevent Flash Loans." />
            </div>
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА (Виджет ставки) */}
        <div className="space-y-6">
          <div className="bg-[#111827] border-2 border-emerald-500/20 rounded-3xl p-6 sticky top-24">
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

              <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-800 space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Potential Payout:</span>
                  <span className={`font-bold font-mono ${selectedToken === 'YES' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {betAmount ? (betAmount * (selectedToken === 'YES' ? yesOdds : noOdds)).toFixed(3) : '0.00'} ETH
                  </span>
                </div>
              </div>

              <button className={`w-full text-black font-black py-4 rounded-xl transition transform active:scale-95 shadow-xl cursor-pointer ${selectedToken === 'YES' ? 'bg-emerald-400 hover:bg-emerald-300' : 'bg-rose-400 hover:bg-rose-300'}`}>
                CONFIRM TRANSACTION
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Мини-компонент для красивого вывода KPI и иконки стрелочки
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