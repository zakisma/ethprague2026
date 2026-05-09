import React from 'react';
import { ExternalLink, Target, ShieldCheck, ChevronRight, Gavel, Users, AlertCircle } from 'lucide-react';

export default function ProjectBlock({ project, onOpenMilestone, onOpenVote }) {
  // Флаг, определяющий, находится ли проект на стадии первичного голосования
  const isVotingStage = project.isVoting; 

  return (
    <div className={`bg-[#111827] border ${isVotingStage ? 'border-amber-500/20 hover:border-amber-500/40' : 'border-gray-800 hover:border-gray-700'} rounded-2xl overflow-hidden transition-all duration-300 flex flex-col relative`}>
      
      {/* Декоративное свечение для проектов на стадии голосования */}
      {isVotingStage && (
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
      )}

      {/* Шапка проекта */}
      <div className="p-6 border-b border-gray-800 bg-gradient-to-b from-gray-800/40 to-transparent relative z-10">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-2xl font-black text-white">{project.name}</h2>
          <span className={`${isVotingStage ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'} text-xs px-2 py-1 rounded-md border font-bold flex items-center gap-1`}>
            {isVotingStage ? <AlertCircle size={14} /> : <ShieldCheck size={14} />}
            {isVotingStage ? 'Pending Approval' : `${project.reputation} Tier`}
          </span>
        </div>
        <a 
          href={project.website} 
          target="_blank" 
          rel="noreferrer"
          className="text-sm text-gray-400 hover:text-white flex items-center gap-1 w-fit transition"
        >
          {project.website.replace('https://', '')} <ExternalLink size={12} />
        </a>
        <p className="text-gray-400 text-sm mt-4 leading-relaxed">
          {project.description}
        </p>
      </div>

      <div className="p-4 flex-grow bg-[#0d131f] relative z-10 flex flex-col justify-center">
        
        {isVotingStage ? (
          /* =========================================
             СОСТОЯНИЕ 1: ПРОЕКТ НА СТАДИИ ГОЛОСОВАНИЯ
             ========================================= */
          <div className="space-y-4 py-2">
            <h3 className="text-xs font-bold text-amber-500/80 uppercase tracking-wider ml-2 flex items-center gap-1.5">
              <Gavel size={14} /> Initial Market Approval
            </h3>
            
            <div 
              onClick={() => onOpenVote && onOpenVote(project)}
              className="bg-gradient-to-br from-[#151e2e] to-[#1a1410] border border-amber-500/30 rounded-xl p-5 cursor-pointer hover:border-amber-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] transition group"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-white text-base flex items-center gap-2 group-hover:text-amber-400 transition">
                  Let this project into the market?
                </h4>
                <ChevronRight size={18} className="text-amber-600 group-hover:text-amber-400 transition shrink-0" />
              </div>
              
              {/* Прогресс-бар голосования */}
              <div className="flex items-center gap-4 mb-3">
                <div className="flex-grow h-2.5 bg-gray-900 rounded-full overflow-hidden flex border border-gray-800">
                  <div className="bg-gradient-to-r from-amber-600 to-amber-400 h-full transition-all duration-700" style={{ width: '78%' }}></div>
                  <div className="bg-gray-700 h-full transition-all duration-700" style={{ width: '22%' }}></div>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-mono text-gray-400 whitespace-nowrap bg-black/30 px-2 py-1 rounded-lg">
                  <Users size={14} className="text-amber-500/70" /> 1,420
                </div>
              </div>

              {/* Проценты */}
              <div className="flex justify-between text-xs font-black">
                <span className="text-amber-400 tracking-wider">LET BUILD 78%</span>
                <span className="text-gray-500 tracking-wider">REJECT 22%</span>
              </div>
            </div>
          </div>
        ) : (
          /* =========================================
             СОСТОЯНИЕ 2: ПРОЕКТ УЖЕ НА РЫНКЕ (ROADMAP)
             ========================================= */
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-2 flex items-center gap-1.5 mb-3">
              <Target size={14} /> Active Roadmap Markets
            </h3>
            
            {project.milestones?.map((milestone) => {
              const poolYes = milestone.yesPool;
              const poolNo = milestone.noPool;
              const totalPool = poolYes + poolNo;
              
              const yesPercent = totalPool > 0 ? Math.round((poolYes / totalPool) * 100) : 50;
              const noPercent = 100 - yesPercent;

              const yesOdds = totalPool > 0 ? (totalPool / poolYes).toFixed(2) : "1.00"; 
              const noOdds = totalPool > 0 ? (totalPool / poolNo).toFixed(2) : "1.00";

              return (
                <div 
                  key={milestone.id}
                  onClick={() => onOpenMilestone && onOpenMilestone(project, milestone)}
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
        )}

      </div>
    </div>
  );
}