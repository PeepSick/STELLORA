import React from 'react';
import { LayoutDashboard, Sparkles, Network, CircleDot, BarChart3, Archive, Settings } from 'lucide-react';
import { useStellarisStore } from '@/store';
import type { DockTabId } from '@/types';

const DOCK_ITEMS: Array<{ id: DockTabId; label: string; icon: typeof LayoutDashboard; badge?: number }> = [
  { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
  { id: 'galaxy', label: 'GALAXY', icon: Sparkles },
  { id: 'systems', label: 'SYSTEMS', icon: Network },
  { id: 'orbs', label: 'ORBS', icon: CircleDot },
  { id: 'analytics', label: 'ANALYTICS', icon: BarChart3 },
  { id: 'archive', label: 'ARCHIVE', icon: Archive },
  { id: 'settings', label: 'SETTINGS', icon: Settings },
];

export const BottomDock: React.FC = () => {
  const activeTab = useStellarisStore((s) => s.activeDockTab);
  const setActiveTab = useStellarisStore((s) => s.setActiveDockTab);
  const nodeCount = useStellarisStore((s) => s.nodes.length);

  return (
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-40">
      <div className="h-16 px-3 bg-[#090a16]/90 backdrop-blur-2xl border border-white/10 rounded-2xl flex items-center gap-1.5 shadow-[0_15px_40px_rgba(0,0,0,0.6)] font-mono">
        {DOCK_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`h-12 px-3.5 rounded-xl relative flex flex-col items-center justify-center gap-1 transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-b from-white/15 to-white/5 border border-white/20 text-white shadow-[0_0_15px_rgba(168,139,255,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {/* Live node count on the GALAXY tab */}
              {item.id === 'galaxy' && nodeCount > 0 && (
                <span className="absolute -top-1 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-purple-500 text-white shadow-[0_0_8px_rgba(168,139,255,0.8)]">
                  {nodeCount}
                </span>
              )}

              <Icon size={18} className={isActive ? 'text-purple-300' : 'group-hover:scale-110 transition-transform'} />
              <span className="text-[9px] font-bold tracking-wider uppercase">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
