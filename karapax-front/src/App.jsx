import React, { useState } from 'react';
import ProjectBlock from './components/ProjectBlock';
import About from './components/About';
import Details from './components/Details';
import CreateProject from './components/CreateProject';
import { ConnectButton } from '@rainbow-me/rainbowkit';

// Моковые данные: Проекты -> Цели (Milestones)
const mockProjects = [
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
  }
];

function App() {
  const [activeTab, setActiveTab] = useState('markets');
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  // Открытие деталей конкретной цели
  const handleOpenMilestone = (project, milestone) => {
    setSelectedProject(project);
    setSelectedMilestone(milestone);
    setActiveTab('details');
  };

  // Возврат на главную
  const handleBack = () => {
    setActiveTab('markets');
    setSelectedProject(null);
    setSelectedMilestone(null);
  };

  return (
    <div className="min-h-screen font-sans selection:bg-emerald-500/30">
      
      {/* --- НАВИГАЦИЯ --- */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-800 sticky top-0 bg-[#0a0f1c]/90 backdrop-blur-md z-50">
        
        {/* Логотип */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={handleBack}>
          <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-500/30 rounded-lg flex items-center justify-center text-emerald-400 font-bold text-xl shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            🛡️
          </div>
          <span className="text-xl font-bold tracking-widest text-white">ProofFund</span>
        </div>
        
        {/* Центральное меню */}
        <div className="hidden md:flex gap-8 text-sm font-medium">
          <button onClick={handleBack} className={`transition ${activeTab === 'markets' ? 'text-emerald-400' : 'text-gray-400 hover:text-white'}`}>
            Markets
          </button>
          <button onClick={() => setActiveTab('create')} className={`transition ${activeTab === 'create' ? 'text-emerald-400' : 'text-gray-400 hover:text-white'}`}>
            Launch Roadmap
          </button>
          <button onClick={() => setActiveTab('about')} className={`transition ${activeTab === 'about' ? 'text-emerald-400' : 'text-gray-400 hover:text-white'}`}>
            About
          </button>
        </div>

        {/* Правый блок: Авторизация + Кошелек */}
        <div className="flex items-center gap-4">
          <ConnectButton/>
        </div>
      </nav>

      {/* --- ОСНОВНОЙ КОНТЕНТ --- */}
      <main className="max-w-[1400px] mx-auto px-4 py-12">
        
        {/* Главная: Список рынков */}
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
                />
              ))}
            </div>
          </>
        )}

        {/* Страница: О проекте / Команда */}
        {activeTab === 'about' && <About />}

        {/* Страница: Создание проекта */}
        {activeTab === 'create' && (
          <CreateProject onProjectCreated={() => setActiveTab('markets')} />
        )}

        {/* Страница: Детали конкретной ставки */}
        {activeTab === 'details' && selectedProject && selectedMilestone && (
          <Details 
            project={selectedProject} 
            milestone={selectedMilestone}
            onBack={handleBack} 
          />
        )}
        
      </main>
    </div>
  );
}

export default App;