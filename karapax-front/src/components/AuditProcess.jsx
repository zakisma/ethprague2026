import React, { useState, useEffect } from 'react';
import { Terminal, ShieldCheck, Loader2, CheckCircle2, Cpu, Info, Clock, ArrowRight, Target } from 'lucide-react';

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

export default function AuditProcess({ onComplete }) {
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [projectProgress, setProjectProgress] = useState(0);
  const [projectStatusText, setProjectStatusText] = useState('Initiating AI Agents...');

  useEffect(() => {
    // 1. Таймер для Истории (Sourcify Audit) - 6 секунд
    const historyTimer = setTimeout(() => {
      setHistoryLoaded(true);
    }, 6000);

    // 2. Таймер для проверки текущего проекта - 40 секунд (идем шагами по 1 сек)
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
        // Меняем текст в зависимости от прогресса
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
    <div className="max-w-6xl mx-auto py-8 animate-in fade-in duration-500 pb-20">
      
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mb-6 animate-pulse">
          <Cpu size={32} />
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 uppercase tracking-wider">
          AI Audit in Progress
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          ProofFund autonomous agents are verifying your identity, past on-chain history, and current project logic before opening the market.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* КАРТОЧКА 1: ИСТОРИЯ КОШЕЛЬКА (SOURCIFY) */}
        <div className="bg-[#111827] border border-gray-800 rounded-3xl p-8 flex flex-col relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
            <Terminal className="text-blue-400" />
            <h3 className="text-xl font-bold text-white">Sourcify Reliability Audit</h3>
            {historyLoaded && <span className="ml-auto text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-mono border border-emerald-500/30">✅ APPROVE</span>}
          </div>

          {!historyLoaded ? (
            // Состояние загрузки Истории
            <div className="flex-1 flex flex-col items-center justify-center space-y-6 py-12">
              <Loader2 className="text-blue-400 animate-spin w-12 h-12" />
              <p className="text-blue-400 font-mono text-sm animate-pulse">Fetching cross-chain developer history...</p>
            </div>
          ) : (
            // Результаты аудита
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-gray-800">
                <div>
                  <p className="text-gray-500 text-xs font-bold uppercase mb-1">Developer Address</p>
                  <p className="text-emerald-400 font-mono text-sm">0x41653...10Ec4142Cfb</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-xs font-bold uppercase mb-1">Total Score</p>
                  <p className="text-white font-black text-xl">0.671 <span className="text-gray-500 text-sm font-normal">/ 1.000</span></p>
                </div>
              </div>

              <div className="space-y-4">
                {SOURCIFY_DATA.map((item) => {
                  const percent = (item.got / item.max) * 100;
                  return (
                    <div key={item.id} className="group relative">
                      <div className="flex justify-between items-end mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-300 text-sm font-semibold">{item.name}</span>
                          {/* Тултип с описанием */}
                          <div className="relative flex items-center">
                            <Info size={14} className="text-gray-600 cursor-help group-hover:text-blue-400 transition" />
                            <div className="absolute left-6 bottom-1/2 translate-y-1/2 w-64 p-3 bg-black/90 border border-gray-700 rounded-lg text-xs text-gray-300 shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 hidden group-hover:block">
                              {item.desc}
                            </div>
                          </div>
                        </div>
                        <span className="text-gray-400 font-mono text-xs">{item.got.toFixed(3)} / {item.max.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-black/50 rounded-full h-2 mb-1 border border-gray-800 overflow-hidden">
                        <div 
                          className={`h-2 rounded-full ${percent > 70 ? 'bg-emerald-500' : percent > 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <p className="text-gray-500 font-mono text-[10px]">↳ {item.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* КАРТОЧКА 2: ПРОВЕРКА ТЕКУЩЕГО ПРОЕКТА */}
        <div className="bg-[#111827] border border-gray-800 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden min-h-[500px]">
          
          <div className="absolute top-8 left-8 flex items-center gap-3">
            <Target className="text-amber-400" />
            <h3 className="text-xl font-bold text-white">Roadmap Assessment</h3>
          </div>

          <div className="absolute top-8 right-8 flex items-center gap-2 text-gray-500 font-mono text-sm">
            <Clock size={16} />
            {40 - Math.floor((projectProgress / 100) * 40)}s
          </div>

          {/* Круговой прогресс */}
          <div className="relative flex items-center justify-center mt-8">
            <svg className="w-64 h-64 transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-800"
              />
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={120 * 2 * Math.PI}
                strokeDashoffset={120 * 2 * Math.PI - (projectProgress / 100) * (120 * 2 * Math.PI)}
                className={`${projectProgress === 100 ? 'text-emerald-500' : 'text-amber-500'} transition-all duration-1000 ease-out`}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              {projectProgress === 100 ? (
                <CheckCircle2 className="text-emerald-500 w-16 h-16 animate-in zoom-in duration-500" />
              ) : (
                <span className="text-4xl font-black text-white font-mono">{projectProgress}%</span>
              )}
            </div>
          </div>

          <p className={`mt-8 font-mono text-center ${projectProgress === 100 ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`}>
            {projectStatusText}
          </p>

          {/* Кнопка "Перейти на рынки", появляется только когда всё 100% */}
          {projectProgress === 100 && historyLoaded && (
            <button 
              onClick={onComplete}
              className="mt-8 bg-emerald-500 text-black font-bold py-3 px-8 rounded-xl flex items-center gap-2 hover:bg-emerald-400 transition-all animate-in slide-in-from-bottom-4 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              Enter Markets <ArrowRight size={18} />
            </button>
          )}

        </div>
      </div>
    </div>
  );
}
