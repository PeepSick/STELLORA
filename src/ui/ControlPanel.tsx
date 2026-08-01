import React, { useState } from 'react';
import { Sparkles, Plus, Bookmark, Share2, Save, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Sliders, BookOpen, Image as ImageIcon, Layers } from 'lucide-react';
import { useStellarisStore } from '@/store';
import { GlassSlider } from './glass/GlassSlider';

const PRESETS = [
  { id: 'AURELIA', label: 'AURELIA', color: 'from-purple-600 to-indigo-900', activeColor: 'ring-purple-500 shadow-[0_0_15px_rgba(168,139,255,0.4)]' },
  { id: 'ORIONIS', label: 'ORIONIS', color: 'from-blue-600 to-cyan-900', activeColor: 'ring-blue-500 shadow-[0_0_15px_rgba(101,215,255,0.4)]' },
  { id: 'VORATH', label: 'VORATH', color: 'from-amber-600 to-orange-950', activeColor: 'ring-amber-500 shadow-[0_0_15px_rgba(255,210,125,0.4)]' },
  { id: 'ZEPHYRA', label: 'ZEPHYRA', color: 'from-emerald-600 to-teal-950', activeColor: 'ring-emerald-500 shadow-[0_0_15px_rgba(52,211,153,0.4)]' },
] as const;

export const ControlPanel: React.FC = () => {
  const { galaxy, updateGalaxy, galaxyProvider, setGalaxyProvider } = useStellarisStore();
  const [isOpen, setIsOpen] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateSetting = (key: keyof typeof galaxy, value: any) => {
    updateGalaxy({ [key]: value });
  };

  const handleSelectPreset = (presetId: typeof PRESETS[number]['id']) => {
    updateGalaxy({ preset: presetId });
    if (presetId === 'AURELIA') {
      updateGalaxy({ spinVelocity: 2.45, luminosity: 0.32, nebulaDensity: 1.42, spiralArms: 4, coreBrightness: 1.85, darkMatter: 0.67 });
    } else if (presetId === 'ORIONIS') {
      updateGalaxy({ spinVelocity: 3.10, luminosity: 0.50, nebulaDensity: 2.00, spiralArms: 2, coreBrightness: 2.20, darkMatter: 0.45 });
    } else if (presetId === 'VORATH') {
      updateGalaxy({ spinVelocity: 1.80, luminosity: 0.25, nebulaDensity: 0.90, spiralArms: 6, coreBrightness: 1.40, darkMatter: 0.85 });
    } else if (presetId === 'ZEPHYRA') {
      updateGalaxy({ spinVelocity: 2.80, luminosity: 0.40, nebulaDensity: 1.60, spiralArms: 3, coreBrightness: 1.95, darkMatter: 0.50 });
    }
  };

  return (
    <div
      className={`fixed top-20 bottom-14 left-6 w-[300px] z-30 flex transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-[285px]'
      }`}
    >
      <div className="w-full h-full bg-[#0a0b18]/50 backdrop-blur-2xl rounded-2xl flex flex-col border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden font-mono">
        
        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          
          {/* Header Branding */}
          <div className="border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[#ffcf77]" />
              <h2 className="text-xs font-extrabold tracking-[0.18em] text-white uppercase font-sans">
                STELLORA
              </h2>
            </div>
            <p className="text-[9px] tracking-[0.15em] text-slate-400 mt-0.5">
              PROCEDURAL GALAXY ENGINE
            </p>
            <p className="text-[8px] tracking-[0.15em] text-slate-500 mt-1 uppercase">
              SESSION 0X2F · LIVE RENDER · RA 12h 34m / DEC -11°
            </p>
          </div>

          {/* Galaxy Source — exclusive; switching reloads the entire graph */}
          <div className="space-y-1.5">
            <div className="text-[10px] tracking-[0.15em] font-bold text-slate-400">GALAXY SOURCE</div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => setGalaxyProvider('knowledge')}
                className={`h-9 rounded-xl flex items-center justify-center gap-1 text-[9px] font-bold tracking-wider border transition-all ${
                  galaxyProvider === 'knowledge'
                    ? 'bg-purple-500/20 border-purple-400/60 text-purple-200 shadow-[0_0_15px_rgba(168,139,255,0.25)]'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/25 hover:text-slate-200'
                }`}
              >
                <BookOpen size={11} />
                KNOWLEDGE
              </button>
              <button
                onClick={() => setGalaxyProvider('stellora')}
                className={`h-9 rounded-xl flex items-center justify-center gap-1 text-[9px] font-bold tracking-wider border transition-all ${
                  galaxyProvider === 'stellora'
                    ? 'bg-amber-500/20 border-amber-400/60 text-amber-200 shadow-[0_0_15px_rgba(253,230,138,0.25)]'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/25 hover:text-slate-200'
                }`}
              >
                <ImageIcon size={11} />
                STELLORA
              </button>
              <button
                onClick={() => setGalaxyProvider('all')}
                className={`h-9 rounded-xl flex items-center justify-center gap-1 text-[9px] font-bold tracking-wider border transition-all ${
                  galaxyProvider === 'all'
                    ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-200 shadow-[0_0_15px_rgba(103,232,249,0.25)]'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/25 hover:text-slate-200'
                }`}
              >
                <Layers size={11} />
                ALL
              </button>
            </div>
          </div>

          {/* Primary Sliders Header */}
          <div className="flex items-center justify-between text-[10px] tracking-[0.15em] font-bold text-slate-400">
            <span>GALAXY CONTROLS</span>
            <span className="text-purple-400 font-semibold">{galaxy.preset ?? 'AURELIA'}</span>
          </div>

          {/* Basic Mode: 3 Core Sliders */}
          <div className="space-y-3">
            <GlassSlider
              label="STAR COUNT"
              min={20000} max={400000} step={5000}
              value={galaxy.starCount ?? 120000}
              onChange={(v) => updateSetting('starCount', v)}
              formatValue={(v) => v.toLocaleString()}
            />
            <GlassSlider
              label="SPIRAL ARMS"
              min={2} max={8} step={1}
              value={galaxy.spiralArms ?? 4}
              onChange={(v) => updateSetting('spiralArms', v)}
              formatValue={(v) => String(v)}
            />
            <GlassSlider
              label="CORE BRIGHTNESS"
              min={0.5} max={3.5} step={0.05}
              value={galaxy.coreBrightness ?? 2.0}
              onChange={(v) => updateSetting('coreBrightness', v)}
              formatValue={(v) => v.toFixed(2)}
            />
          </div>

          {/* Collapsible Advanced Settings Accordion */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] tracking-[0.15em] text-slate-300 font-bold transition-all border border-white/5"
            >
              <div className="flex items-center gap-1.5">
                <Sliders size={12} className="text-purple-400" />
                <span>ADVANCED SETTINGS</span>
              </div>
              {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showAdvanced && (
              <div className="mt-3 space-y-3 pt-1 border-t border-white/5 animate-in fade-in duration-200">
                <GlassSlider
                  label="SPIN VELOCITY"
                  min={0} max={5} step={0.05}
                  value={galaxy.spinVelocity ?? 2.45}
                  onChange={(v) => updateSetting('spinVelocity', v)}
                  formatValue={(v) => v.toFixed(2)}
                />
                <GlassSlider
                  label="LUMINOSITY"
                  min={0.05} max={1} step={0.01}
                  value={galaxy.luminosity ?? 0.40}
                  onChange={(v) => updateSetting('luminosity', v)}
                  formatValue={(v) => v.toFixed(2)}
                />
                <GlassSlider
                  label="NEBULA DENSITY"
                  min={0} max={3} step={0.05}
                  value={galaxy.nebulaDensity ?? 1.42}
                  onChange={(v) => updateSetting('nebulaDensity', v)}
                  formatValue={(v) => v.toFixed(2)}
                />
                <GlassSlider
                  label="DARK MATTER"
                  min={0} max={1} step={0.01}
                  value={galaxy.darkMatter ?? 0.67}
                  onChange={(v) => updateSetting('darkMatter', v)}
                  formatValue={(v) => v.toFixed(2)}
                />
              </div>
            )}
          </div>

          <hr className="border-white/10" />

          {/* Preset Buttons */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] tracking-[0.15em] font-bold text-slate-400">
              <span>GALAXY PRESETS</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {PRESETS.map((preset) => {
                const isSelected = (galaxy.preset ?? 'AURELIA') === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`h-12 rounded-xl relative overflow-hidden bg-gradient-to-br ${preset.color} border border-white/10 transition-all flex flex-col items-center justify-end pb-1.5 group ${
                      isSelected ? `ring-2 ${preset.activeColor} border-transparent` : 'hover:border-white/30 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-40 group-hover:opacity-70 transition-opacity">
                      <div className="w-5 h-5 rounded-full border border-white/40 border-dashed animate-spin-slow" />
                    </div>
                    <span className="text-[8px] font-bold tracking-widest text-white z-10">
                      {preset.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Button & Links */}
          <div className="pt-1 space-y-2.5">
            <button
              onClick={() => {
                updateGalaxy({
                  spinVelocity: +(Math.random() * 3 + 1).toFixed(2),
                  luminosity: +(Math.random() * 0.4 + 0.2).toFixed(2),
                  coreBrightness: +(Math.random() * 1.5 + 1).toFixed(2),
                });
              }}
              className="w-full h-8 rounded-xl bg-gradient-to-r from-[#14152b] via-[#221c44] to-[#14152b] border border-white/20 hover:border-purple-400/60 text-[11px] font-semibold text-slate-100 flex items-center justify-center gap-2 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.4)] hover:shadow-[0_0_20px_rgba(168,139,255,0.3)] group"
            >
              <Plus size={13} className="text-purple-400 group-hover:rotate-90 transition-transform duration-300" />
              <span>NEW GALAXY</span>
            </button>

            <div className="flex items-center justify-around text-[10px] text-slate-400 font-medium pt-0.5">
              <button className="hover:text-white flex items-center gap-1 transition-colors">
                <Bookmark size={11} />
                <span>PRESETS</span>
              </button>
              <span className="text-slate-700">•</span>
              <button className="hover:text-white flex items-center gap-1 transition-colors">
                <Save size={11} />
                <span>SAVE</span>
              </button>
              <span className="text-slate-700">•</span>
              <button className="hover:text-white flex items-center gap-1 transition-colors">
                <Share2 size={11} />
                <span>SHARE</span>
              </button>
            </div>
          </div>

        </div>

        {/* Side Collapse Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -right-7 top-1/2 -translate-y-1/2 w-7 h-14 bg-[#080914]/90 border border-l-0 border-white/10 rounded-r-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

      </div>
    </div>
  );
};
