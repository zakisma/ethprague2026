import React, { useState } from 'react';
import { ArrowLeft, Gavel, AlertCircle, ExternalLink, Loader2, Users, ShieldAlert, CheckCircle2, Activity } from 'lucide-react';

// Моковые данные результатов аудита для отображения на странице голосования
const AUDIT_RESULT = {
  risk_level: "medium",
  risk_scores: [
    { name: "Repository Substance", score: 0.62 },
    { name: "Code Alignment", score: 0.58 },
    { name: "Web3 Relevance", score: 0.64 },
    { name: "Dev Credibility", score: 0.42 },
    { name: "Milestone Quality", score: 0.72 },
    { name: "Grant Justification", score: 0.70 },
    { name: "KPI Measurability", score: 0.78 }
  ],
  main_risks: [
    "Wallet reputation is moderate, not strong.",
    "GitHub-to-Web3 alignment should be manually checked before production."
  ]
};

export default function VoteDetails({ project, onBack }) {
  const [betAmount, setBetAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('APPROVE'); 

  // ХРАНИМ СОСТОЯНИЕ ПУЛОВ ГОЛОСОВАНИЯ
  const [poolApprove, setPoolApprove] = useState(project.approvePool || 780);
  const [poolReject, setPoolReject] = useState(project.rejectPool || 220);
  
  // Баланс юзера
  const [userSharesApprove, setUserSharesApprove] = useState(project.userSharesApprove || 0);
  const [userSharesReject, setUserSharesReject] = useState(project.userSharesReject || 0);

  // Состояния транзакции
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // --- AMM MATH FOR CURATION MARKET ---
  const totalPool = poolApprove + poolReject;
  const currentPriceApprove = poolApprove / totalPool;
  const currentPriceReject = poolReject / totalPool;
  
  const approveOdds = (1 / currentPriceApprove).toFixed(2);
  const rejectOdds = (1 / currentPriceReject).toFixed(2);

  let potentialPayout = "0.00";
  let protocolFee = "0.00";
  let expectedShares = 0;

  const amountIn = Number(betAmount) || 0;

  if (amountIn > 0) {
    const fee = amountIn * 0.001; // 0.1% Curation Fee
    protocolFee = fee.toFixed(4);
    const investment = amountIn - fee;

    // Simulate Slippage
    if (selectedToken === 'APPROVE') {
      const endPrice = (poolApprove + investment) / (poolApprove + investment + poolReject);
      const avgPrice = (currentPriceApprove + endPrice) / 2;
      expectedShares = investment / avgPrice;
    } else {
      const endPrice = (poolReject + investment) / (poolReject + investment + poolApprove);
      const avgPrice = (currentPriceReject + endPrice) / 2;
      expectedShares = investment / avgPrice;
    }

    potentialPayout = expectedShares.toFixed(4);
  }

  const handleVote = () => {
    if (amountIn <= 0) return;

    setIsConfirmed(false);
    setIsPending(true);

    setTimeout(() => {
      setIsPending(false);
      setIsConfirming(true);

      setTimeout(() => {
        const fee = amountIn * 0.001;
        const investment = amountIn - fee;

        if (selectedToken === 'APPROVE') {
          const newApprove = poolApprove + investment;
          setPoolApprove(newApprove);
          
          setUserSharesApprove(prev => {
            const newShares = prev + expectedShares;
            project.userSharesApprove = newShares; 
            return newShares;
          });
          project.approvePool = newApprove;
        } else {
          const newReject = poolReject + investment;
          setPoolReject(newReject);
          
          setUserSharesReject(prev => {
            const newShares = prev + expectedShares;
            project.userSharesReject = newShares; 
            return newShares;
          });
          project.rejectPool = newReject;
        }

        setIsConfirming(false);
        setIsConfirmed(true);
        setBetAmount('');
        
        setTimeout(() => setIsConfirmed(false), 5000);
      }, 2500);
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-left-4 duration-500 font-sans pb-20">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-6 group cursor-pointer w-fit">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ЛЕВАЯ КОЛОНКА */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* ШАПКА ПРОЕКТА */}
          <div className="bg-gradient-to-b from-[#111827] to-[#0b101a] border border-gray-800 rounded-3xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center gap-2 text-amber-500 mb-4 text-sm font-bold uppercase tracking-wider relative z-10">
              <Gavel size={18} /> Initial Curation Phase
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight relative z-10">
              Approve {project.name} Market
            </h1>
            
            <div className="flex flex-wrap gap-4 items-center text-gray-400 text-sm mb-6 relative z-10">
              <span className="flex items-center gap-1 text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                <AlertCircle size={14} /> Pending Community Vote
              </span>
              <a href={project.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white transition">
                <ExternalLink size={14} /> Protocol Info
              </a>
              <span className="flex items-center gap-1 opacity-80">
                <Users size={14} /> 1,420 Curators
              </span>
            </div>

            <p className="text-gray-300 leading-relaxed mb-8 relative z-10">
              The AI Agent has completed the initial audit of the repository. Review the AI Audit Report below and decide whether to allow this protocol to open prediction markets for their roadmap milestones.
            </p>

            <div className="p-5 bg-black/40 border border-gray-800 rounded-2xl grid grid-cols-2 gap-6 relative z-10">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase mb-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> LET BUILD Pool
                </p>
                <p className="text-xl font-mono text-amber-400">{poolApprove.toFixed(2)} ETH</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase mb-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-gray-500"></span> REJECT Pool
                </p>
                <p className="text-xl font-mono text-gray-400">{poolReject.toFixed(2)} ETH</p>
              </div>
            </div>
          </div>

          {/* НОВЫЙ БЛОК: РЕЗУЛЬТАТЫ ИИ-АУДИТА */}
          <div className="bg-[#111827] border border-gray-800 rounded-3xl p-8 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8 border-b border-gray-800/80 pb-5 relative z-10">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                  <CheckCircle2 className="text-emerald-400" size={24} />
                </div>
                <h3 className="text-2xl font-extrabold text-white tracking-wide">AI Audit Report</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] bg-amber-500/10 text-amber-400 px-3 py-1.5 rounded-md font-mono border border-amber-500/30 uppercase tracking-widest font-bold">
                  {AUDIT_RESULT.risk_level} RISK
                </span>
              </div>
            </div>

            {/* Вывод главных рисков */}
            <div className="mb-8 bg-gradient-to-r from-amber-500/5 to-transparent border-l-2 border-amber-500 p-5 rounded-r-2xl relative z-10">
              <div className="flex items-center gap-2 text-amber-500 text-sm font-bold mb-3 uppercase tracking-wider">
                <ShieldAlert size={16} /> Key Considerations
              </div>
              <div className="space-y-3">
                {AUDIT_RESULT.main_risks.map((risk, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="text-amber-500/60 mt-1 text-[10px]">▶</span> 
                    <p className="text-sm text-gray-300 leading-relaxed">{risk}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Матрица Risk Scores */}
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Activity size={16} className="text-gray-500" />
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Risk Evaluation Matrix</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AUDIT_RESULT.risk_scores.map((risk, idx) => {
                  const isHigh = risk.score >= 0.7;
                  const isMed = risk.score >= 0.5 && risk.score < 0.7;
                  const colorClass = isHigh ? 'text-emerald-400' : isMed ? 'text-amber-400' : 'text-rose-400';
                  const bgClass = isHigh ? 'bg-emerald-500' : isMed ? 'bg-amber-500' : 'bg-rose-500';
                  const glowClass = isHigh ? 'hover:shadow-[0_0_15px_rgba(16,185,129,0.1)]' : isMed ? 'hover:shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'hover:shadow-[0_0_15px_rgba(244,63,94,0.1)]';

                  return (
                    <div key={idx} className={`bg-[#151c28] border border-gray-800 hover:border-gray-700 p-4 rounded-xl transition-all duration-300 ${glowClass}`}>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-gray-300 text-xs font-medium tracking-wide">{risk.name}</span>
                        <span className={`font-mono text-sm font-bold ${colorClass}`}>
                          {risk.score.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${bgClass}`} 
                          style={{width: `${risk.score * 100}%`}}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Правила Curation Market */}
          <div className="bg-[#111827] border border-gray-800 rounded-3xl p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <ShieldAlert className="text-gray-400" size={20} /> Curation Market Rules
            </h2>
            <div className="space-y-3">
              <KpiRow id="1" name="Quorum Required" desc="At least 500 ETH total liquidity must be staked to finalize the vote." />
              <KpiRow id="2" name="Approval Threshold" desc="The 'LET BUILD' pool must hold >60% of liquidity at the deadline." />
              <KpiRow id="3" name="Curation Yield" desc="Winning voters receive 5% of all fees generated by this project's future markets." />
            </div>
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА (Виджет ставки) */}
        <div className="space-y-6">
          <div className="bg-[#111827] border-2 border-amber-500/20 rounded-3xl p-6 sticky top-24 shadow-[0_0_30px_rgba(245,158,11,0.05)]">
            
            {/* Позиция юзера */}
            {(userSharesApprove > 0 || userSharesReject > 0) && (
              <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <p className="text-xs text-amber-400 font-bold uppercase mb-2">Your Vote Tokens</p>
                {userSharesApprove > 0 && <p className="text-sm text-white font-mono">{userSharesApprove.toFixed(2)} vBUILD</p>}
                {userSharesReject > 0 && <p className="text-sm text-white font-mono">{userSharesReject.toFixed(2)} vREJECT</p>}
              </div>
            )}

            <h3 className="text-xl font-bold text-white mb-6">Cast Your Vote</h3>
            
            <div className="flex p-1 bg-black/40 rounded-xl mb-6">
              <button 
                onClick={() => setSelectedToken('APPROVE')}
                className={`flex-1 py-3 rounded-lg font-bold transition cursor-pointer ${selectedToken === 'APPROVE' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'text-gray-500 hover:text-white'}`}
              >
                LET BUILD <span className="text-xs block opacity-70">Odds: x{approveOdds}</span>
              </button>
              <button 
                onClick={() => setSelectedToken('REJECT')}
                className={`flex-1 py-3 rounded-lg font-bold transition cursor-pointer ${selectedToken === 'REJECT' ? 'bg-gray-700 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-gray-500 hover:text-white'}`}
              >
                REJECT <span className="text-xs block opacity-70">Odds: x{rejectOdds}</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold ml-1">Staking Amount</label>
                <div className="relative mt-2">
                  <input 
                    type="number" 
                    placeholder="0.0"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl py-4 px-4 text-white font-mono focus:border-amber-500 outline-none transition"
                  />
                  <span className="absolute right-4 top-4 text-gray-500 font-bold">ETH</span>
                </div>
              </div>

              <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-800 space-y-3 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Curation Fee (0.1%):</span>
                  <span className="font-mono">{protocolFee} ETH</span>
                </div>

                <div className="flex justify-between items-center border-t border-gray-800 pt-3 text-gray-400">
                  <span>Est. Vote Power:</span>
                  <div className="flex items-center gap-2">
                    {(isPending || isConfirming) && <Loader2 size={14} className="animate-spin text-amber-500" />}
                    <span className={`font-bold font-mono text-lg ${selectedToken === 'APPROVE' ? 'text-amber-400' : 'text-gray-300'}`}>
                      {potentialPayout} <span className="text-xs font-sans">shares</span>
                    </span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleVote}
                disabled={isPending || isConfirming || amountIn <= 0}
                className={`w-full text-black font-black py-4 rounded-xl transition transform active:scale-95 shadow-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${selectedToken === 'APPROVE' ? 'bg-amber-500 hover:bg-amber-400' : 'bg-gray-400 hover:bg-gray-300'}`}
              >
                {isPending ? 'CONFIRM IN WALLET...' : isConfirming ? 'STAKING...' : 'CONFIRM VOTE'}
              </button>

              {isConfirmed && (
                <div className="text-center text-sm font-bold text-amber-400 mt-2 animate-in fade-in zoom-in duration-300">
                  🏛️ Vote Cast Successfully!
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function KpiRow({ id, name, desc }) {
  return (
    <div className="p-4 border border-gray-800 rounded-xl flex gap-4 items-start bg-black/20">
      <div className="bg-amber-500/10 text-amber-500 border border-amber-500/20 w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 font-mono font-bold">
        {id}
      </div>
      <div>
        <h4 className="font-bold text-white text-sm">{name}</h4>
        <p className="text-sm text-gray-400 mt-1">{desc}</p>
      </div>
    </div>
  );
}