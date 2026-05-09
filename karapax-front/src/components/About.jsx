import React from 'react';
import { User, Cpu, TrendingUp, Lock, ShieldAlert, Globe, MessageSquare } from 'lucide-react';

// Моковые данные команды
const team = [
  { id: 1, name: "Damir", role: "Kazakh", image: "/team/damir.png" },
  { id: 2, name: "Shakhzod", role: "Uzbek", image: "/team/shakhzod.png" },
  { id: 3, name: "Zak", role: "Uzbek", image: "/team/zak.png" },
  { id: 4, name: "Alisher", role: "Kazakh", image: "/team/alisher.png" },
  { id: 5, name: "Ksenia", role: "Russian", image: "/team/ksenia.png" },
  { id: 6, name: "Farukh", role: "Uzbek", image: "/team/farukh.png" }
];

export default function About() {
  return (
    // Сделали главный контейнер еще шире: max-w-[1400px]
    <div className="max-w-[1400px] mx-auto space-y-16 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white">
          How <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">ProofFund</span> Works
        </h2>
        <p className="text-gray-400 text-lg">
          A decentralized treasury where decisions are made by mathematics and markets, not humans.
        </p>
      </div>

      {/* System Roles */}
      <section className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-2">System Roles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#111827] p-5 rounded-xl border border-gray-800 hover:border-emerald-500/30 transition duration-300">
            <div className="flex items-center gap-3 mb-2">
              <User className="text-emerald-400" />
              <h4 className="font-bold text-white text-lg">Developer (Applicant)</h4>
            </div>
            <p className="text-gray-400 text-sm">
              The person requesting a grant for their project. Provides a wallet address to receive funds.
            </p>
          </div>
          <div className="bg-[#111827] p-5 rounded-xl border border-gray-800 hover:border-purple-500/30 transition duration-300">
            <div className="flex items-center gap-3 mb-2">
              <Cpu className="text-purple-400" />
              <h4 className="font-bold text-white text-lg">AI Agent</h4>
            </div>
            <p className="text-gray-400 text-sm">
              Automated manager. Collects wallet data, launches prediction markets, and verifies on-chain results.
            </p>
          </div>
          <div className="bg-[#111827] p-5 rounded-xl border border-gray-800 hover:border-blue-500/30 transition duration-300">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="text-blue-400" />
              <h4 className="font-bold text-white text-lg">Traders</h4>
            </div>
            <p className="text-gray-400 text-sm">
              Individuals with their own capital. They earn yield by betting on whether the developer will meet the KPIs or not.
            </p>
          </div>
          <div className="bg-[#111827] p-5 rounded-xl border border-gray-800 hover:border-amber-500/30 transition duration-300">
            <div className="flex items-center gap-3 mb-2">
              <Lock className="text-amber-400" />
              <h4 className="font-bold text-white text-lg">Treasury</h4>
            </div>
            <p className="text-gray-400 text-sm">
              A smart contract holding untouched sponsor funds designated for grants.
            </p>
          </div>
        </div>
      </section>

      {/* Секция с командой */}
      <section className="pt-8 w-full">
        <div className="text-center mb-10 max-w-4xl mx-auto">
          <h3 className="text-3xl font-black text-white mb-3 hover:tracking-wider transition-all duration-500">
            Meet the Brains
          </h3>
          <p className="text-gray-400">
            Building the future of grants on 3 hours of sleep and pure red bull.
          </p>
        </div>

        {/* СЕТКА (Grid): На телефонах по 2 в ряд, на планшетах по 3, на компах (lg) - все 6 в один ряд! */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {team.map((member) => (
            <div 
              key={member.id} 
              // Убрали фиксированную ширину, теперь карточки сами подстраиваются под сетку. Высота h-80 (320px).
              className="w-full h-80 group rounded-2xl overflow-hidden relative border border-gray-800 hover:border-emerald-500/50 hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] transition-all duration-300 hover:-translate-y-2"
            >
              {/* Фон карточки */}
              <div className="absolute inset-0 bg-[#1a2436] flex items-center justify-center overflow-hidden">
                
                {/* ПОКА ЗАСКОММЕНТИРОВАНО (Раскомментируйте, когда закинете фото в папку public) */}
                <img src={member.image} alt={member.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />

              </div>
              
              {/* Градиент и текст (Уменьшили паддинги p-4, чтобы текст влезал на узких экранах) */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col items-start text-left">
                <h4 className="text-white font-bold text-xl mb-1 truncate w-full">{member.name}</h4>
                <p className="text-emerald-400 text-xs font-mono mb-3 px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  {member.role}
                </p>
                
                {/* Социалки */}
                <div className="flex gap-2 text-gray-400">
                  <a href="#" className="hover:text-emerald-400 transition"><Globe size={16} /></a>
                  <a href="#" className="hover:text-emerald-400 transition"><MessageSquare size={16} /></a>
                </div>
              </div>

            </div>
          ))}
        </div>
      </section>

    </div>
  );
}