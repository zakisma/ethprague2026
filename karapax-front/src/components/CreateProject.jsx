import React, { useState } from 'react';
import { Plus, Trash2, Rocket, Globe, FileText, Target, Calendar } from 'lucide-react';

export default function CreateProject({ onProjectCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    description: '',
    reputation: 'Tier 3' // Default for new projects
  });

  const [milestones, setMilestones] = useState([
    { id: Date.now(), title: '', deadline: '', desc: '' }
  ]);

  const addMilestone = () => {
    setMilestones([...milestones, { id: Date.now(), title: '', deadline: '', desc: '' }]);
  };

  const removeMilestone = (id) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter(m => m.id !== id));
    }
  };

  const handleMilestoneChange = (id, field, value) => {
    setMilestones(milestones.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProject = {
      ...formData,
      milestones: milestones.map(m => ({
        ...m,
        yesPool: 0,
        noPool: 0
      }))
    };
    console.log("Submitting to FastAPI:", newProject);
    alert("Project and Roadmap sent to AI-Audit!");
    onProjectCreated(); // Return to markets
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-white mb-4">LAUNCH YOUR ROADMAP</h2>
        <p className="text-gray-400">Define your goals, set on-chain KPIs, and let the market fund your vision.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-20">
        
        {/* SECTION 1: Base Info */}
        <div className="bg-[#111827] border border-gray-800 rounded-3xl p-8 space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-4">
            <FileText className="text-emerald-400" /> Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Project Name</label>
              <input 
                required
                className="w-full bg-black/40 border border-gray-800 rounded-xl py-3 px-4 text-white focus:border-emerald-500 outline-none transition"
                placeholder="e.g. Uniswap V5"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Website URL</label>
              <div className="relative">
                <Globe className="absolute left-4 top-3.5 text-gray-600" size={18} />
                <input 
                  required
                  className="w-full bg-black/40 border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white focus:border-emerald-500 outline-none transition"
                  placeholder="https://project.com"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Short Description</label>
            <textarea 
              required
              rows="3"
              className="w-full bg-black/40 border border-gray-800 rounded-xl py-3 px-4 text-white focus:border-emerald-500 outline-none transition"
              placeholder="What are you building?"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>

        {/* SECTION 2: Dynamic Roadmap */}
        <div className="bg-[#111827] border border-gray-800 rounded-3xl p-8 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-800 pb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Target className="text-amber-400" /> Roadmap Milestones
            </h3>
            <button 
              type="button"
              onClick={addMilestone}
              className="text-emerald-400 text-sm font-bold flex items-center gap-1 hover:text-emerald-300 transition"
            >
              <Plus size={16} /> Add Milestone
            </button>
          </div>

          <div className="space-y-6">
            {milestones.map((milestone, index) => (
              <div key={milestone.id} className="relative p-6 bg-black/20 border border-gray-800 rounded-2xl space-y-4 group animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-start">
                  <span className="bg-gray-800 text-gray-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                    Milestone #{index + 1}
                  </span>
                  {milestones.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => removeMilestone(milestone.id)}
                      className="text-gray-600 hover:text-rose-500 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-600 uppercase">Goal Title</label>
                    <input 
                      required
                      placeholder="e.g. Mainnet Launch"
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-lg py-2 px-3 text-white focus:border-amber-500 outline-none text-sm transition"
                      value={milestone.title}
                      onChange={(e) => handleMilestoneChange(milestone.id, 'title', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-600 uppercase">Verification Deadline</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 text-gray-700" size={14} />
                      <input 
                        required
                        type="date"
                        className="w-full bg-[#0a0f1c] border border-gray-800 rounded-lg py-2 pl-9 pr-3 text-white focus:border-amber-500 outline-none text-sm transition color-scheme-dark"
                        value={milestone.deadline}
                        onChange={(e) => handleMilestoneChange(milestone.id, 'deadline', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase">On-chain KPI Description</label>
                  <input 
                    required
                    placeholder="e.g. Total volume > 1M ETH as verified by Etherscan"
                    className="w-full bg-[#0a0f1c] border border-gray-800 rounded-lg py-2 px-3 text-white focus:border-amber-500 outline-none text-sm transition"
                    value={milestone.desc}
                    onChange={(e) => handleMilestoneChange(milestone.id, 'desc', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-5 rounded-2xl text-xl flex items-center justify-center gap-3 transition transform active:scale-[0.98] shadow-[0_0_30px_rgba(16,185,129,0.2)]"
        >
          <Rocket size={24} /> LAUNCH PREDICTION MARKET
        </button>

      </form>
    </div>
  );
}