import React, { useState } from 'react';
import ProjectBlock from './components/ProjectBlock';
import About from './components/About';
import Details from './components/Details';
import VoteDetails from './components/VoteDetails'; 
import CreateProject from './components/CreateProject';
import AuditProcess from './components/AuditProcess';
import AuthButton from './components/AuthButton';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Rocket, ArrowRight, Activity, ShieldCheck, Zap, BarChart3, ShieldAlert } from 'lucide-react';
import MyProjects from './components/MyProjects';

// Моковые данные: Проекты -> Цели (Milestones)
const mockProjects = [
    { 
    id: 'p4', 
    name: "Buk Reservation System", 
    reputation: "Unverified", // Tier пока не присвоен, так как проект еще не на рынке
    website: "https://buk.technology",
    description: "A decentralized hotel inventory distribution protocol. Community is currently voting to approve their roadmap and open prediction markets.",
    isVoting: true, // ВАЖНО: этот флаг триггерит оранжевую карточку
    milestones: [] // Майлстоуны пока пустые, так как рынки еще не открыты
  },
  { 
    id: 'p1', 
    name: "Uniswap V4", 
    reputation: "Tier 1",
    website: "https://uniswap.org",
    description: "The largest decentralized exchange. Betting on the successful rollout of V4 Hooks ecosystem and specific TVL milestones.",
    milestones: [
      { id: 'm1', title: "Deploy V4 Core on Ethereum Mainnet", yesPool: 150, noPool: 20, deadline: "Nov 30, 2026", kpiWeight: 40 },
      { id: 'm2', title: "Reach $1B TVL in V4 Pools", yesPool: 45, noPool: 55, deadline: "Jan 15, 2027", kpiWeight: 60 }
    ]
  },
  { 
    id: 'p2', 
    name: "Aave GHO", 
    reputation: "Tier 1",
    website: "https://aave.com",
    description: "Decentralized stablecoin by Aave. Markets are focused on peg stability and cross-chain expansion.",
    milestones: [
      { id: 'm3', title: "Launch GHO natively on Arbitrum", yesPool: 80, noPool: 10, deadline: "Oct 20, 2026", kpiWeight: 50 },
      { id: 'm4', title: "Maintain $1.00 Peg for 30 consecutive days", yesPool: 30, noPool: 40, deadline: "Dec 01, 2026", kpiWeight: 50 }
    ]
  },
  { 
    id: 'p3', 
    name: "Lens Protocol", 
    reputation: "Tier 2",
    website: "https://lens.xyz",
    description: "Web3 social graph. Tracking developer adoption and active user metrics for their new Appchain.",
    milestones: [
      { id: 'm5', title: "Release Lens Appchain Public Testnet", yesPool: 25, noPool: 5, deadline: "Oct 15, 2026", kpiWeight: 100 }
    ]
  },
  // НОВЫЙ ПРОЕКТ СО СТАТУСОМ ГОЛОСОВАНИЯ
];

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  
  // 🛡️ Состояние для красивого модального окна авторизации
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleOpenMilestone = (project, milestone) => {
    setSelectedProject(project);
    setSelectedMilestone(milestone);
    setActiveTab('details');
  };

  const handleOpenVote = (project) => {
  setSelectedProject(project);
  setActiveTab('vote'); // Добавляем новый "таб"
};

  const handleBackToHome = () => {
    setActiveTab('home');
    setSelectedProject(null);
    setSelectedMilestone(null);
  };

  const handleGetFundedClick = () => {
    const isAuthenticated = !!localStorage.getItem('access_token');
    
    if (isAuthenticated) {
      setActiveTab('create');
    } else {
      // Вместо уродливого alert() открываем наше кастомное модальное окно
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen font-sans selection:bg-emerald-500/30 relative">
      
      {/* --- МОДАЛЬНОЕ ОКНО АВТОРИЗАЦИИ --- */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#111827] border border-emerald-500/30 rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(16,185,129,0.15)] relative animate-in zoom-in-95 duration-300">
            
            {/* Кнопка закрытия */}
            <button 
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors cursor-pointer text-xl"
            >
              ✕
            </button>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mb-6 border border-emerald-500/20">
                <ShieldAlert size={32} />
              </div>
              <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-wide">Verification Required</h3>
              <p className="text-gray-400 mb-8 leading-relaxed">
                To launch a roadmap and request funding, you must verify your Web3 identity. Please connect your wallet and sign a secure message.
              </p>
              
              {/* Рендерим кнопки RainbowKit и нашу AuthButton прямо внутри модалки! */}
              <div className="flex flex-col items-center gap-4 w-full bg-black/40 p-6 rounded-2xl border border-gray-800">
                <ConnectButton />
                <AuthButton />
                
                {!!localStorage.getItem('access_token') && (
                  <button 
                    onClick={() => {
                      setIsAuthModalOpen(false);
                      setActiveTab('create');
                    }}
                    className="mt-4 w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  >
                    Continue to Launch 🚀
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- НАВИГАЦИЯ --- */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-800 sticky top-0 bg-[#0a0f1c]/90 backdrop-blur-md z-50">
{/* Логотип */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={handleBackToHome}>
          <div className="w-10 h-10 flex items-center justify-center group-hover:scale-105 transition-transform">
            <img 
              src="/prooffund.png" 
              alt="ProofFund Logo" 
              className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
            />
          </div>
          <span className="text-xl font-bold tracking-widest text-white group-hover:text-emerald-400 transition-colors">
            ProofFund
          </span>
        </div>
        
        <div className="hidden md:flex gap-8 text-sm font-medium">
          <button onClick={handleBackToHome} className={`transition ${activeTab === 'home' ? 'text-emerald-400' : 'text-gray-400 hover:text-white'}`}>
            Home
          </button>
          <button onClick={() => setActiveTab('markets')} className={`transition ${activeTab === 'markets' ? 'text-emerald-400' : 'text-gray-400 hover:text-white'}`}>
            Markets
          </button>
          <button onClick={() => setActiveTab('about')} className={`transition ${activeTab === 'about' ? 'text-emerald-400' : 'text-gray-400 hover:text-white'}`}>
            About
          </button>
          {/* 🛡️ Кнопка "My Projects" показывается только авторизованным юзерам */}
          {!!localStorage.getItem('access_token') && (
            <button onClick={() => setActiveTab('my_projects')} className={`transition font-bold ${activeTab === 'my_projects' ? 'text-emerald-400' : 'text-gray-400 hover:text-white'}`}>
              My Projects
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <AuthButton />
          <ConnectButton />
        </div>
      </nav>

      {/* --- ОСНОВНОЙ КОНТЕНТ --- */}
      <main className="max-w-[1400px] mx-auto px-4 py-12">
        
        {/* ГЛАВНАЯ СТРАНИЦА */}
        {activeTab === 'home' && (
          <div className="flex flex-col items-center justify-center pt-10 pb-24 animate-in fade-in zoom-in-95 duration-700">
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-8 font-mono text-sm shadow-[0_0_20px_rgba(16,185,129,0.15)]">
              <Activity size={16} className="animate-pulse" /> V1.0 Live on Testnet
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-center text-white mb-6 uppercase tracking-tighter leading-tight">
              Fund the Future, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Verified by Math</span>
            </h1>
            
            <p className="text-gray-400 text-lg md:text-xl text-center max-w-3xl mb-12 leading-relaxed">
              Stop relying on biased committees and slow grant cycles. Set your milestones, let our AI audit your repository, and let the free prediction market fund your vision based on actual on-chain delivery.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 mb-24 w-full justify-center px-4">
              <button
                onClick={handleGetFundedClick}
                className="px-8 py-5 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-2xl text-xl flex items-center justify-center gap-3 transition transform hover:-translate-y-1 shadow-[0_0_40px_rgba(16,185,129,0.3)] w-full sm:w-auto"
              >
                <Rocket size={24} /> GET FUNDED
              </button>
              
              <button
                onClick={() => setActiveTab('markets')}
                className="px-8 py-5 bg-[#111827] hover:bg-gray-800 text-white font-bold rounded-2xl text-xl flex items-center justify-center gap-3 transition border border-gray-700 hover:border-emerald-500/50 w-full sm:w-auto group"
              >
                Explore Markets <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Блок со статистикой */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
              <div className="bg-black/40 border border-gray-800 p-6 rounded-3xl flex items-center gap-4 hover:border-emerald-500/30 transition-colors">
                <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400">
                  <BarChart3 size={28} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-bold uppercase">Total Market Volume</p>
                  <p className="text-white text-2xl font-black font-mono">$130</p>
                </div>
              </div>
              <div className="bg-black/40 border border-gray-800 p-6 rounded-3xl flex items-center gap-4 hover:border-blue-500/30 transition-colors">
                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-bold uppercase">AI Audits Passed</p>
                  <p className="text-white text-2xl font-black font-mono">0</p>
                </div>
              </div>
              <div className="bg-black/40 border border-gray-800 p-6 rounded-3xl flex items-center gap-4 hover:border-amber-500/30 transition-colors">
                <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-400">
                  <Zap size={28} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-bold uppercase">Grants Distributed</p>
                  <p className="text-white text-2xl font-black font-mono">0 ETH</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* СТРАНИЦА: РЫНКИ */}
        {activeTab === 'markets' && (
          <>
            <div className="text-center mb-12 animate-in fade-in duration-500">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white uppercase tracking-tighter">
                Ecosystem Roadmaps
              </h1>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Stake on specific milestones of tier-1 projects. Verifiable on-chain execution.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
              {mockProjects.map(project => (
                <ProjectBlock 
                  key={project.id} 
                  project={project} 
                  onOpenMilestone={handleOpenMilestone} 
                  onOpenVote={handleOpenVote} // Передаем функцию открытия голосования
                />
              ))}
            </div>
          </>
        )}

        {/* СТРАНИЦА: ABOUT */}
        {activeTab === 'about' && <About />}

        {/* СТРАНИЦА: ФОРМА СОЗДАНИЯ */}
        {activeTab === 'create' && (
          <CreateProject onProjectCreated={(newProject) => {
            
            // 🥷 ТОТ САМЫЙ ХАК: Запихиваем новый проект самым первым в твой список mockProjects!
            if (newProject) {
              mockProjects.unshift(newProject);
            }
            
            // И переключаем вкладку дальше
            setActiveTab('audit');
            
          }} /> 
        )}

        {/* СТРАНИЦА: ПРОЦЕСС АУДИТА */}
        {activeTab === 'audit' && (
          <AuditProcess onComplete={() => setActiveTab('markets')} /> 
        )}
        {/* СТРАНИЦА: МОИ ПРОЕКТЫ */}
        {activeTab === 'my_projects' && (
          <MyProjects onGetFunded={() => setActiveTab('create')} />
        )}
        {activeTab === 'vote' && (
  <VoteDetails 
    project={selectedProject} 
    onBack={() => setActiveTab('markets')} 
  />
)}
        {/* СТРАНИЦА: ДЕТАЛИ СТАВКИ */}
        {activeTab === 'details' && selectedProject && selectedMilestone && (
          <Details 
            project={selectedProject} 
            milestone={selectedMilestone}
            onBack={() => setActiveTab('markets')} 
          />
        )}
        
      </main>
    </div>
  );
}

export default App;