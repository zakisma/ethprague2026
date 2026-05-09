import React, { useState, useEffect } from 'react';
import { Loader2, Rocket, FileText, Target, Calendar } from 'lucide-react';

export default function MyProjects({ onGetFunded }) {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Обязательно проверь, что тут правильный IP твоего бэкенда!
  const API_BASE = "http://192.168.11.198:8000";

  useEffect(() => {
    const fetchProjects = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError("Not authenticated");
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/projects`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Передаем токен для авторизации
          }
        });
        
        if (!res.ok) throw new Error("Failed to fetch projects");
        
        const data = await res.json();
        // В зависимости от того, как отвечает бэкенд, берем массив
        setProjects(Array.isArray(data) ? data : data.items || []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // 1. СОСТОЯНИЕ: ЗАГРУЗКА
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="text-emerald-500 animate-spin w-16 h-16 mb-6" />
        <p className="text-emerald-400 font-mono animate-pulse">Syncing with blockchain & backend...</p>
      </div>
    );
  }

  // 2. СОСТОЯНИЕ: ПУСТО (НЕТ ПРОЕКТОВ)
  if (projects.length === 0 || error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-gray-800/30 rounded-full flex items-center justify-center text-gray-600 mb-6 border border-gray-800 shadow-inner">
          <FileText size={48} />
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4 uppercase tracking-tighter">No Projects Found</h2>
        <p className="text-gray-400 max-w-md mx-auto mb-10 text-lg">
          You haven't launched any ecosystem roadmaps yet. Define your goals, pass the AI audit, and get funded.
        </p>
        <button 
          onClick={onGetFunded}
          className="px-8 py-5 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-2xl text-xl flex items-center justify-center gap-3 transition transform hover:-translate-y-1 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
        >
          <Rocket size={24} /> GET FUNDED
        </button>
      </div>
    );
  }

  // 3. СОСТОЯНИЕ: ЕСТЬ ПРОЕКТЫ (СПИСОК)
  return (
    <div className="max-w-5xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center justify-between mb-10 border-b border-gray-800 pb-6">
        <h2 className="text-3xl font-black text-white uppercase tracking-wider">
          My Projects
        </h2>
        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-xl font-mono text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          Total: {projects.length}
        </span>
      </div>

      <div className="space-y-8">
        {projects.map((project, idx) => (
          <div key={project.id || idx} className="bg-[#111827] border border-gray-800 rounded-3xl p-8 hover:border-gray-700 transition-colors shadow-lg relative overflow-hidden">
            
            {/* Декоративный градиентный блик */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 gap-4 relative z-10">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">{project.name}</h3>
                {project.website && (
                  <a href={project.website} target="_blank" rel="noreferrer" className="text-blue-400 text-sm hover:underline flex items-center gap-1">
                    {project.website}
                  </a>
                )}
              </div>
              <span className="bg-gray-800 text-gray-300 border border-gray-700 px-3 py-1 rounded-lg text-xs font-bold uppercase self-start">
                {project.reputation || 'Tier 3'}
              </span>
            </div>
            
            <p className="text-gray-400 text-sm mb-8 leading-relaxed relative z-10">{project.description}</p>
            
            {project.milestones && project.milestones.length > 0 && (
              <div className="space-y-4 relative z-10">
                <h4 className="text-sm font-bold text-gray-500 uppercase flex items-center gap-2 mb-4">
                  <Target size={16} className="text-amber-400" /> Milestones Roadmap
                </h4>
                {project.milestones.map((m, mIdx) => (
                  <div key={mIdx} className="bg-black/40 border border-gray-800/50 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm mb-1">{m.title}</p>
                      <p className="text-gray-500 text-xs leading-relaxed">{m.desc}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                      <div className="bg-gray-800/80 text-gray-300 px-3 py-2 rounded-lg flex items-center gap-2 border border-gray-700">
                        <Calendar size={14} className="text-gray-400"/>
                        {m.deadline}
                      </div>
                      {m.fundingAmount > 0 && (
                        <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-2 rounded-lg font-bold">
                          {m.fundingAmount} PRF
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}