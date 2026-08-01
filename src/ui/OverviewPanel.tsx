import React from 'react';
import { useStellarisStore } from '@/store';

export const OverviewPanel: React.FC = () => {
  const { galaxy, nodes } = useStellarisStore();

  const metrics = [
    { label: 'TOTAL STARS', value: (galaxy.starCount ?? 380000).toLocaleString() },
    { label: 'TOTAL SYSTEMS', value: nodes.length > 0 ? nodes.length.toString() : '106' },
    { label: 'PARTICLES', value: (galaxy.particleCount ? galaxy.particleCount * 39 : 393860).toLocaleString() },
    { label: 'PIXEL RATIO', value: '2.00' },
    { label: 'RENDER QUALITY', value: 'ULTRA' },
    { label: 'PERFORMANCE', value: '120 FPS', highlight: true },
  ];

  return (
    <div className="fixed top-20 right-6 w-[300px] z-30 bg-[#0a0b18]/50 backdrop-blur-2xl border border-white/15 rounded-2xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] font-mono">
      <h3 className="text-[10px] tracking-[0.2em] font-bold text-slate-400 uppercase mb-3 border-b border-white/10 pb-2">
        GALAXY OVERVIEW
      </h3>
      <div className="space-y-2">
        {metrics.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-xs">
            <span className="text-[10px] text-slate-400 tracking-wider">{item.label}</span>
            <span className={`font-semibold ${item.highlight ? 'text-cyan-400' : 'text-slate-100'}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
