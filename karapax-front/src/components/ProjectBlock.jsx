import React from 'react';
import { ExternalLink, Target, ShieldCheck, ChevronRight } from 'lucide-react';

export default function ProjectBlock({ project, onOpenMilestone }) {
  return (
    <div className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-colors duration-300 flex flex-col">
      {/* Шапка проекта */}
      <div className="p-6 border-b border-gray-800 bg-gradient-to-b from-gray-800/40 to-transparent">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-2xl font-black text-white">{project.name}</h2>
          <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-1 rounded-md border border-emerald-500/20 font-bold flex items-center gap-1">
            <ShieldCheck size={14} /> {project.reputation} Tier
          </span>
        </div>
        <a 
          href={project.website} 
          target="_blank" 
          rel="noreferrer"
          className="text-sm text-gray-400 hover:text-emerald-400 flex items-center gap-1 w-fit transition"
        >
          {project.website.replace('https://', '')} <ExternalLink size={12} />
        </a>
        <p className="text-gray-400 text-sm mt-4 leading-relaxed">
          {project.description}
        </p>
      </div>

      {/* Список целей из Roadmap */}
      <div className="p-4 flex-grow space-y-3 bg-[#0d131f]">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-2 mb-3 flex items-center gap-1">
          <Target size={14} /> Active Roadmap Goals
        </h3>
        
        {project.milestones.map((milestone) => {
          // Динамическая математика, которая подхватит изменения из Details.jsx
          const poolYes = milestone.yesPool;
          const poolNo = milestone.noPool;
          const totalPool = poolYes + poolNo;
          
          const yesPercent = totalPool > 0 ? Math.round((poolYes / totalPool) * 100) : 50;
          const noPercent = 100 - yesPercent;

          const yesOdds = (totalPool / poolNo).toFixed(2); 
          const noOdds = (totalPool / poolYes).toFixed(2);

          return (
            <div 
              key={milestone.id}
              onClick={() => onOpenMilestone(project, milestone)}
              className="bg-[#151e2e] border border-gray-800 rounded-xl p-4 cursor-pointer hover:border-emerald-500/40 hover:bg-[#1a2436] transition group"
            >
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-white text-sm group-hover:text-emerald-400 transition pr-4">
                  {milestone.title}
                </h4>
                <ChevronRight size={16} className="text-gray-600 group-hover:text-emerald-400 transition shrink-0" />
              </div>
              
              {/* Прогресс-бар */}
              <div className="flex items-center gap-3">
                <div className="flex-grow h-1.5 bg-gray-800 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 h-full transition-all duration-700" style={{ width: `${yesPercent}%` }}></div>
                  <div className="bg-rose-500 h-full transition-all duration-700" style={{ width: `${noPercent}%` }}></div>
                </div>
                <div className="text-xs font-mono text-gray-400 whitespace-nowrap">
                  Pool: {totalPool.toFixed(2)} ETH
                </div>
              </div>

              {/* Проценты и кэфы */}
              <div className="flex justify-between text-[10px] font-bold mt-2">
                <span className="text-emerald-500 flex gap-2">
                  <span>YES {yesPercent}%</span>
                  <span className="opacity-60">x{yesOdds}</span>
                </span>
                <span className="text-rose-500 flex gap-2">
                  <span className="opacity-60">x{noOdds}</span>
                  <span>NO {noPercent}%</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}