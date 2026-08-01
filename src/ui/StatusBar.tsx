import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music, Moon, Sun } from 'lucide-react';
import { useStellarisStore } from '@/store';
import { audioManager } from '@/utils/audio';

export const StatusBar: React.FC = () => {
  const { galaxy, updateGalaxy } = useStellarisStore();
  const [timeString, setTimeString] = useState('21:48:37 UTC');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      setTimeString(`${hours}:${minutes}:${seconds} UTC`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleSound = () => {
    const next = !galaxy.soundEnabled;
    updateGalaxy({ soundEnabled: next });
    if (!next) {
      audioManager.mute();
    } else {
      audioManager.unmute();
    }
  };

  const toggleMusic = () => {
    const next = !galaxy.musicEnabled;
    updateGalaxy({ musicEnabled: next });
    if (next) {
      audioManager.playAmbient();
    }
  };

  const toggleDarkMode = () => {
    updateGalaxy({ darkMode: !galaxy.darkMode });
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-9 z-40 px-6 flex items-center justify-between bg-[#05060d]/90 border-t border-white/10 text-[11px] font-mono text-slate-400">
      {/* Left: OS Status */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
        <span className="text-slate-300 font-semibold tracking-wider">LEOSIS OS v2.7.1</span>
        <span className="text-slate-500">•</span>
        <span className="text-emerald-400 tracking-wider">CONNECTED</span>
      </div>

      {/* Center: Clock & Coordinates */}
      <div className="flex items-center gap-4 text-slate-400">
        <span className="text-slate-200 font-medium">{timeString}</span>
        <span className="text-slate-600">|</span>
        <span className="tracking-wider">RA 17-46-31.3</span>
        <span className="text-slate-600">|</span>
        <span className="tracking-wider">DEC -29° 00' 28"</span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-300">357.0°</span>
      </div>

      {/* Right: Audio / Theme Toggles */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSound}
          className={`flex items-center gap-1.5 hover:text-white transition-colors ${galaxy.soundEnabled ? 'text-slate-300' : 'text-slate-600'}`}
        >
          {galaxy.soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          <span>SOUND</span>
        </button>

        <button 
          onClick={toggleMusic}
          className={`flex items-center gap-1.5 hover:text-white transition-colors ${galaxy.musicEnabled ? 'text-purple-400' : 'text-slate-600'}`}
        >
          <Music size={13} />
          <span>MUSIC</span>
        </button>

        <button 
          onClick={toggleDarkMode}
          className="flex items-center gap-1.5 hover:text-white transition-colors text-slate-300"
        >
          {galaxy.darkMode ? <Moon size={13} /> : <Sun size={13} />}
          <span>DARK MODE</span>
        </button>
      </div>
    </footer>
  );
};
