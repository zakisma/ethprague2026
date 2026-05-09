import { Activity } from 'lucide-react';

export default function MarketCard({ project }) {
  const totalPool = project.yesPool + project.noPool;
  const yesPercentage = totalPool > 0 ? Math.round((project.yesPool / totalPool) * 100) : 50;
  const noPercentage = 100 - yesPercentage;

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 hover:border-emerald-500/50 transition-colors duration-300 flex flex-col">
      {/* Шапка карточки */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">{project.name}</h3>
          <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
            <Activity size={14} className="text-emerald-400" /> Phase: {project.phase}
          </p>
        </div>
      </div>

      {/* Прогресс-бар вероятности */}
      <div className="my-5">
        <div className="flex justify-between text-sm font-semibold mb-2">
          <span className="text-emerald-400">YES [{yesPercentage}%]</span>
          <span className="text-rose-400">NO [{noPercentage}%]</span>
        </div>
        <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden flex">
          <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${yesPercentage}%` }}></div>
          <div className="bg-rose-500 h-full transition-all duration-500" style={{ width: `${noPercentage}%` }}></div>
        </div>
      </div>

      {/* Метрики */}
      <div className="space-y-2 text-sm text-gray-300 mb-6 flex-grow">
        <div className="flex justify-between">
          <span>Grant Pool:</span>
          <span className="font-mono text-white">{project.grantPool} ETH</span>
        </div>
        <div className="flex justify-between">
          <span>Total Stake:</span>
          <span className="font-mono text-white">{totalPool} ETH</span>
        </div>
        <div className="flex justify-between">
          <span>Deadline:</span>
          <span className="text-gray-400">{project.deadline}</span>
        </div>
      </div>

      {/* Кнопки действий */}
      <div className="flex gap-3 mt-auto">
        <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm font-medium transition cursor-pointer">
          Details
        </button>
        <button className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black py-2 rounded-lg text-sm font-bold transition cursor-pointer">
          BET
        </button>
      </div>
    </div>
  );
}