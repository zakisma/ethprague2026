import React, { useState, useEffect } from 'react';
import { Terminal, Loader2, CheckCircle2, Cpu, Info, Clock, ArrowRight, Target, ShieldAlert, FileCode2, Activity } from 'lucide-react';

const SOURCIFY_DATA = [
  { 
    id: 'has_any_verified', name: 'Verified Contracts', got: 0.150, max: 0.15, text: '30 contracts (4 production)',
    desc: 'Сигналы: кол-во verified-контрактов и прод-контрактов. Логика: если нет verified-контрактов — это почти всегда новичок/скамер. 3–5 контрактов резко повышают доверие. Вес: 0.15 (входной билет).'
  },
  { 
    id: 'verification_quality', name: 'Verification Quality', got: 0.142, max: 0.25, text: 'Weighted match quality: 0.57',
    desc: 'Сигналы: creationMatch, runtimeMatch, metadataMatch. Логика: полнота и качество верификации — сильный прокси того, насколько аккуратно разработчик обращается с кодом и ценит прозрачность. Вес: 0.25.'
  },
  { 
    id: 'documentation', name: 'Documentation', got: 0.046, max: 0.20, text: 'Doc quality: 0.23 (devdoc/userdoc/storage)',
    desc: 'Сигналы: has_devdoc, has_userdoc, has_storage. Логика: признак инженерной культуры. Без документации проект сложнее поддерживать и проверять. Вес: 0.20.'
  },
  { 
    id: 'activity_history', name: 'Activity History', got: 0.138, max: 0.15, text: '1.7yr span, last 0mo ago',
    desc: 'Сигналы: span_years и months_since_last. Логика: важно, что человек деплоит не разово, а в течение долгого времени и недавно. Вес: 0.15.'
  },
  { 
    id: 'complexity', name: 'Complexity & Multichain', got: 0.095, max: 0.15, text: 'Complexity: 0.49, chains: [1, 8453]',
    desc: 'Сигналы: кол-во функций/ивентов + unique_prod_chains. Логика: сложные контракты и мультичейн-деплой свидетельствуют о более серьёзной инженерной нагрузке. Вес: 0.15.'
  },
  { 
    id: 'security', name: 'Security Patterns', got: 0.100, max: 0.10, text: 'Clean — no dangerous patterns',
    desc: 'Сигналы: использование известных опасных паттернов. Логика: базовый чек на отсутствие откровенных бэкдоров. Вес: 0.10.'
  }
];

// ДАННЫЕ ИЗ ФИНАЛЬНОЙ СИМУЛЯЦИИ ИИ (Без contract_execution_plan)
const AUDIT_RESULT = {
  final_status: "approved_for_market",
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

export default function AuditProcess({ onComplete }) {
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [projectProgress, setProjectProgress] = useState(0);
  const [projectStatusText, setProjectStatusText] = useState('Initiating AI Agents...');

  useEffect(() => {
    const historyTimer = setTimeout(() => {
      setHistoryLoaded(true);
    }, 6000);

    const totalTime = 40;
    let elapsed = 0;
    
    const projectTimer = setInterval(() => {
      elapsed++;
      const percent = Math.floor((elapsed / totalTime) * 100);
      
      if (percent >= 100) {
        setProjectProgress(100);
        setProjectStatusText('Market Generation Complete');
        clearInterval(projectTimer);
      } else {
        setProjectProgress(percent);
        if (percent > 80) setProjectStatusText('Finalizing Risk Assessment...');
        else if (percent > 60) setProjectStatusText('Simulating Tokenomics & Oracles...');
        else if (percent > 40) setProjectStatusText('Evaluating Roadmap Feasibility...');
        else if (percent > 20) setProjectStatusText('Auditing Smart Contract Logic...');
      }
    }, 1000);

    return () => {
      clearTimeout(historyTimer);
      clearInterval(projectTimer);
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-8 animate-in fade-in duration-500 pb-20 font-sans">
      
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 mb-6 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
          <Cpu size={32} />
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 uppercase tracking-wider">
          AI Audit in Progress
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto leading-relaxed">
          ProofFund autonomous agents are verifying your identity, past on-chain history, and current project logic before opening the market.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* КАРТОЧКА 1: ИСТОРИЯ КОШЕЛЬКА */}
        <div className="bg-gradient-to-b from-[#111827] to-[#0b101a] border border-gray-800 rounded-3xl p-8 flex flex-col relative overflow-hidden shadow-2xl">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-800/80 pb-4">
            <Terminal className="text-blue-400" />
            <h3 className="text-xl font-bold text-white tracking-wide">Sourcify Reliability</h3>
            {historyLoaded && <span className="ml-auto text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full font-mono border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]">✅ VERIFIED</span>}
          </div>

          {!historyLoaded ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6 py-12">
              <Loader2 className="text-blue-400 animate-spin w-12 h-12" />
              <p className="text-blue-400/80 font-mono text-sm animate-pulse">Fetching cross-chain developer history...</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center justify-between bg-black/40 p-5 rounded-2xl border border-gray-800/80 backdrop-blur-sm">
                <div>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Developer Address</p>
                  <p className="text-emerald-400 font-mono text-sm">0x41653...10Ec4142Cfb</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Score</p>
                  <p className="text-white font-black text-2xl">0.671 <span className="text-gray-600 text-sm font-normal">/ 1.0</span></p>
                </div>
              </div>

              <div className="space-y-5">
                {SOURCIFY_DATA.map((item) => {
                  const percent = (item.got / item.max) * 100;
                  return (
                    <div key={item.id} className="group relative">
                      <div className="flex justify-between items-end mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-300 text-sm font-medium tracking-wide">{item.name}</span>
                          <div className="relative flex items-center">
                            <Info size={14} className="text-gray-600 cursor-help group-hover:text-blue-400 transition-colors" />
                            <div className="absolute left-6 bottom-1/2 translate-y-1/2 w-64 p-3 bg-[#0b101a]/95 border border-gray-700 rounded-xl text-xs text-gray-300 shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 hidden group-hover:block leading-relaxed">
                              {item.desc}
                            </div>
                          </div>
                        </div>
                        <span className="text-gray-500 font-mono text-xs">{item.got.toFixed(3)} / {item.max.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-gray-900/80 rounded-full h-1.5 mb-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${percent > 70 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : percent > 40 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-rose-500 to-rose-400'}`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <p className="text-gray-600 font-mono text-[10px]">↳ {item.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* КАРТОЧКА 2: ПРОВЕРКА ПРОЕКТА И РЕЗУЛЬТАТЫ */}
        <div className={`bg-gradient-to-b from-[#111827] to-[#0b101a] border border-gray-800 rounded-3xl p-8 flex flex-col relative overflow-hidden min-h-[550px] shadow-2xl ${projectProgress < 100 ? 'items-center justify-center' : 'justify-start'}`}>
          
          {/* Декоративный фоновый элемент */}
          {projectProgress === 100 && (
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          )}

          {projectProgress < 100 ? (
            // --- СОСТОЯНИЕ ЗАГРУЗКИ ---
            <>
              <div className="absolute top-8 left-8 flex items-center gap-3">
                <Target className="text-amber-400 animate-pulse" />
                <h3 className="text-xl font-bold text-white tracking-wide">Roadmap Assessment</h3>
              </div>

              <div className="absolute top-8 right-8 flex items-center gap-2 text-gray-500 font-mono text-sm bg-black/40 px-3 py-1 rounded-full border border-gray-800">
                <Clock size={14} className="text-gray-400" />
                {40 - Math.floor((projectProgress / 100) * 40)}s
              </div>

              <div className="relative flex items-center justify-center mt-8">
                <svg className="w-64 h-64 transform -rotate-90">
                  <circle
                    cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-800/40"
                  />
                  <circle
                    cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="6" fill="transparent" strokeLinecap="round"
                    strokeDasharray={120 * 2 * Math.PI}
                    strokeDashoffset={120 * 2 * Math.PI - (projectProgress / 100) * (120 * 2 * Math.PI)}
                    className="text-amber-500 transition-all duration-1000 ease-out drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-white font-mono">{projectProgress}%</span>
                </div>
              </div>

              <p className="mt-10 font-mono text-center text-amber-400 animate-pulse text-sm">
                {projectStatusText}
              </p>
            </>
          ) : (
            // --- СОСТОЯНИЕ ЗАВЕРШЕНИЯ (БЕЗ CONTRACT EXECUTION PLAN) ---
            <div className="w-full h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
              
              <div className="flex items-center justify-between mb-8 border-b border-gray-800/80 pb-5">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                    <CheckCircle2 className="text-emerald-400" size={24} />
                  </div>
                  <h3 className="text-2xl font-extrabold text-white tracking-wide">Audit Complete</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] bg-amber-500/10 text-amber-400 px-3 py-1.5 rounded-md font-mono border border-amber-500/30 uppercase tracking-widest font-bold">
                    {AUDIT_RESULT.risk_level} RISK
                  </span>
                </div>
              </div>

              {/* Вывод главных рисков */}
              <div className="mb-8 bg-gradient-to-r from-amber-500/5 to-transparent border-l-2 border-amber-500 p-5 rounded-r-2xl">
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
              <div className="mb-8">
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
                    const glowClass = isHigh ? 'group-hover:shadow-[0_0_15px_rgba(16,185,129,0.1)]' : isMed ? 'group-hover:shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'group-hover:shadow-[0_0_15px_rgba(244,63,94,0.1)]';

                    return (
                      <div key={idx} className={`group bg-[#151c28] border border-gray-800 hover:border-gray-700 p-4 rounded-xl transition-all duration-300 ${glowClass}`}>
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

              {/* Кнопка действия */}
              <div className="mt-auto pt-2">
                <button 
                  onClick={onComplete}
                  className="w-full relative group overflow-hidden bg-emerald-500 text-black font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:-translate-y-0.5"
                >
                  <span className="relative z-10 tracking-widest text-sm">ENTER TO MARKET</span> 
                  <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1.5 transition-transform" />
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}