import React from 'react';
import { Search, SlidersHorizontal, Crown, Gem, Bell, Menu } from 'lucide-react';
import { useStellarisStore } from '@/store';
import stelloraLogo from '@/img/stellora-logo-optimized.webp';

export const TopHeader: React.FC = () => {
  const { toggleSearch, toggleChat, setActiveDockTab, activeDockTab } = useStellarisStore();

  const openPanel = (tab: 'dashboard' | 'orbs' | 'settings') =>
    setActiveDockTab(activeDockTab === tab ? 'galaxy' : tab);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-40 px-6 flex items-center justify-between bg-gradient-to-b from-[#070811]/90 via-[#070811]/50 to-transparent backdrop-blur-[2px]">
      {/* Left: Brand Logo & System Title */}
      <div className="flex items-center gap-3">
        {/* Stellora emblem */}
        <div className="w-9 h-9 rounded-lg overflow-hidden border border-[#ffcf77]/30 shadow-[0_0_15px_rgba(255,207,119,0.15)] group hover:border-[#ffcf77]/60 transition-all cursor-pointer">
          <img
            src={stelloraLogo}
            alt=""
            className="w-full h-full object-cover object-top scale-125 transform group-hover:rotate-12 transition-transform duration-500"
          />
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-[0.2em] text-white font-mono">STELLORA</h1>
          </div>
          <p className="text-[10px] tracking-[0.15em] text-slate-400 uppercase font-mono">GALAXY CORE SYSTEM</p>
        </div>
      </div>

      {/* Center: Search Bar with Living Plasma Orb & Glow */}
      <div 
        onClick={toggleSearch}
        className="w-[420px] h-10 rounded-xl bg-[#0e0f1d]/85 border border-white/10 hover:border-purple-400/50 flex items-center px-3.5 gap-3 cursor-pointer transition-all shadow-[0_4px_20px_rgba(0,0,0,0.4)] group hover:shadow-[0_0_25px_rgba(168,139,255,0.3)] relative overflow-hidden"
      >
        {/* Subtle top edge glow beam */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-purple-400/50 to-transparent group-hover:via-amber-300/70 transition-all" />

        {/* Living Floating Plasma Search Orb */}
        <div className="relative w-5 h-5 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-purple-500 via-indigo-400 to-amber-300 animate-spin-slow group-hover:scale-125 transition-transform duration-300 shadow-[0_0_12px_rgba(168,139,255,0.8)]" />
          <div className="absolute w-2 h-2 rounded-full bg-white blur-[0.5px]" />
        </div>

        <span className="text-xs text-slate-400 group-hover:text-slate-100 flex-1 truncate font-mono tracking-wide transition-colors">
          Search stars, systems, objects...
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); openPanel('settings'); }}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <SlidersHorizontal size={13} />
        </button>
      </div>

      {/* Right: Status Action Icons */}
      <div className="flex items-center gap-2">
        <button
          title="AI Chat"
          onClick={toggleChat}
          className="w-9 h-9 rounded-xl bg-[#0e0f1d]/80 border border-white/10 hover:border-white/25 flex items-center justify-center text-amber-300 hover:text-amber-200 hover:shadow-[0_0_12px_rgba(252,211,77,0.2)] transition-all"
        >
          <Crown size={16} />
        </button>
        <button
          title="Orbs"
          onClick={() => openPanel('orbs')}
          className="w-9 h-9 rounded-xl bg-[#0e0f1d]/80 border border-white/10 hover:border-white/25 flex items-center justify-center text-cyan-400 hover:text-cyan-300 hover:shadow-[0_0_12px_rgba(101,215,255,0.2)] transition-all"
        >
          <Gem size={16} />
        </button>
        <button
          title="Dashboard"
          onClick={() => openPanel('dashboard')}
          className="w-9 h-9 rounded-xl bg-[#0e0f1d]/80 border border-white/10 hover:border-white/25 flex items-center justify-center text-slate-300 hover:text-white transition-all"
        >
          <Bell size={16} />
        </button>
        <button
          title="Settings"
          onClick={() => openPanel('settings')}
          className="w-9 h-9 rounded-xl bg-[#0e0f1d]/80 border border-white/10 hover:border-white/25 flex items-center justify-center text-slate-300 hover:text-white transition-all"
        >
          <Menu size={16} />
        </button>
      </div>
    </header>
  );
};
