import React, { useState } from 'react';
import { Play, Mic, MapPin, Clock, Sparkles, Image as ImageIcon, Music as MusicIcon, ArrowRight } from 'lucide-react';
import { Starfield } from '@/components/landing/Starfield';
import stelloraLogo from '@/img/stellora-logo-optimized.webp';

// Configurable per-deployment, never hardcoded — defaults keep dev/local
// working with zero setup, override with real env vars in production.
const DEMO_URL = import.meta.env.VITE_DEMO_URL || '/app';
const DEMO_VIDEO_URL = import.meta.env.VITE_DEMO_VIDEO_URL || '';
const GITHUB_URL = 'https://github.com/PeepSick/STELLORA';

const GitHubMark: React.FC<{ size?: number; className?: string }> = ({ size = 16, className }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor" aria-hidden="true">
    <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.79-.25.79-.55v-2.15c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.68 1.25 3.34.96.1-.74.4-1.25.73-1.54-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.18-3.1-.12-.3-.51-1.48.11-3.08 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.6.23 2.78.11 3.08.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.4-5.28 5.69.42.36.78 1.07.78 2.16v3.2c0 .3.21.66.79.55A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
  </svg>
);

function NebulaBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-1/3 left-1/4 w-[60vw] h-[60vw] rounded-full bg-purple-600/20 blur-[120px]" />
      <div className="absolute top-1/3 -right-1/4 w-[50vw] h-[50vw] rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="absolute inset-0">
        <Starfield />
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block px-3 py-1 rounded-full border border-white/15 bg-white/5 text-[10px] font-mono uppercase tracking-[0.25em] text-purple-300">
      {children}
    </span>
  );
}

export default function Landing() {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <div className="fixed inset-0 overflow-y-auto overflow-x-hidden bg-[#070811] text-slate-200" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-[#070811]/70 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono font-bold tracking-[0.2em] text-sm text-white">
            <span className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
              <img src={stelloraLogo} alt="" className="w-full h-full object-cover object-top scale-125" />
            </span>
            STELLORA
          </div>
          <div className="flex items-center gap-3">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-[12px] text-slate-400 hover:text-white transition-colors"
            >
              <GitHubMark size={15} />
              GitHub
            </a>
            <a
              href={DEMO_URL}
              className="px-4 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/50 text-purple-200 text-[12px] font-semibold hover:bg-purple-500/30 transition-colors"
            >
              Enter Live Demo
            </a>
          </div>
        </div>
      </nav>

      {/* ── 1. Hero ─────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center justify-center px-6 overflow-hidden">
        <NebulaBackdrop />
        <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center gap-6 py-24">
          <SectionLabel>A living memory galaxy</SectionLabel>
          <img
            src={stelloraLogo}
            alt="Stellora — Your Memories, In Orbit."
            className="w-full max-w-[280px] sm:max-w-xs drop-shadow-[0_0_60px_rgba(168,139,255,0.25)]"
          />
          <p className="text-base sm:text-lg text-slate-400 max-w-xl -mt-2">
            A spatial memory experience for your photos, moments and stories.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
            <a
              href={DEMO_URL}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-purple-500 hover:bg-purple-400 text-white font-semibold text-sm tracking-wide transition-colors shadow-[0_0_40px_rgba(168,139,255,0.35)]"
            >
              <Sparkles size={16} />
              Enter Live Demo
            </a>
            <button
              onClick={() => setVideoOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 hover:border-white/40 text-slate-200 font-semibold text-sm tracking-wide transition-colors"
            >
              <Play size={14} />
              Watch Demo
            </button>
          </div>
          <p className="text-[11px] text-slate-600 font-mono mt-1">No signup. No login. Just click in.</p>
        </div>
      </section>

      {/* ── 3. Video section ────────────────────────────────── */}
      <section className="relative py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-4 mb-10">
          <SectionLabel>Demo</SectionLabel>
          <h2 className="font-mono font-bold text-white text-2xl sm:text-3xl tracking-tight">
            See Stellora in action
          </h2>
        </div>
        <div className="max-w-4xl mx-auto">
          <VideoPanel open={videoOpen} onOpen={() => setVideoOpen(true)} />
        </div>
      </section>

      {/* ── 5. Talk / AI ────────────────────────────────────── */}
      <section className="relative py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-4">
            <SectionLabel>Voice</SectionLabel>
            <h2 className="font-mono font-bold text-white text-3xl sm:text-4xl tracking-tight">
              Just ask.
            </h2>
            <p className="text-slate-400 text-base max-w-md">
              Ask naturally. Find moments by date, place or memory — no filters, no folders to dig through.
            </p>
          </div>
          <TalkDemoCard />
        </div>
      </section>

      {/* ── 6. Galaxy / Spatial memory ──────────────────────── */}
      <section className="relative py-24 px-6 border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <Starfield density={0.7} />
        </div>
        <div className="relative max-w-4xl mx-auto text-center flex flex-col items-center gap-5">
          <SectionLabel>Spatial memory</SectionLabel>
          <h2 className="font-mono font-bold text-white text-3xl sm:text-4xl tracking-tight leading-tight">
            Not folders.<br />A galaxy.
          </h2>
          <p className="text-slate-400 text-base max-w-lg">
            Your memories are more than a list. Explore them through space, time and context.
          </p>
          <GalaxyMockup />
        </div>
      </section>

      {/* ── 7. Music ─────────────────────────────────────────── */}
      <section className="relative py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6 text-center">
          <SectionLabel>Atmosphere</SectionLabel>
          <h2 className="font-mono font-bold text-white text-2xl sm:text-3xl tracking-tight">
            Every memory has an atmosphere.
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            {['Deep Space', 'Cosmic Drift'].map((track) => (
              <div
                key={track}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/10 border border-amber-300/30 text-amber-200 text-[12px] font-mono"
              >
                <MusicIcon size={13} />
                {track}
              </div>
            ))}
          </div>
          <p className="text-slate-500 text-[13px] max-w-md">
            Click a music node in the galaxy and the whole space shifts with it.
          </p>
        </div>
      </section>

      {/* ── 8. Core features ─────────────────────────────────── */}
      <section className="relative py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: ImageIcon, title: 'Memory', desc: 'Photos, moments and stories.' },
            { icon: Clock, title: 'Time', desc: 'Explore memories across time.' },
            { icon: MapPin, title: 'Place', desc: 'Reconnect moments with where they happened.' },
            { icon: Mic, title: 'Voice', desc: 'Talk naturally with Stellora.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2">
              <Icon size={18} className="text-purple-300" />
              <span className="text-[12px] font-mono font-bold uppercase tracking-wider text-white">{title}</span>
              <span className="text-[12px] text-slate-500 leading-relaxed">{desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 9. Open source ───────────────────────────────────── */}
      <section className="relative py-24 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-4">
          <SectionLabel>Open source</SectionLabel>
          <h2 className="font-mono font-bold text-white text-2xl sm:text-3xl tracking-tight">Built in the open.</h2>
          <p className="text-slate-400 text-base max-w-md">
            Stellora is an open-source experiment exploring a different way to experience personal memory.
          </p>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 hover:border-white/40 text-slate-200 text-sm font-semibold transition-colors mt-1"
          >
            <GitHubMark size={15} />
            View on GitHub
          </a>
        </div>
      </section>

      {/* ── 10. Peepsick Labs ────────────────────────────────── */}
      <section className="relative py-16 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-3">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-600">Peepsick Labs</span>
          <p className="text-slate-500 text-[13px]">More experiments from Peepsick Labs.</p>
        </div>
      </section>

      {/* ── 11. Final CTA ─────────────────────────────────────── */}
      <section className="relative py-32 px-6 border-t border-white/5 overflow-hidden">
        <NebulaBackdrop />
        <div className="relative z-10 max-w-2xl mx-auto text-center flex flex-col items-center gap-6">
          <h2 className="font-mono font-bold text-white text-3xl sm:text-4xl tracking-tight leading-tight">
            Your memories are already a universe.
            <br />
            <span className="text-purple-300">Stellora lets you explore it.</span>
          </h2>
          <a
            href={DEMO_URL}
            className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-purple-500 hover:bg-purple-400 text-white font-semibold text-sm tracking-wide transition-colors shadow-[0_0_40px_rgba(168,139,255,0.35)]"
          >
            <Sparkles size={16} />
            Enter Stellora
            <ArrowRight size={15} />
          </a>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="relative py-8 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-slate-600">
          <span>© {new Date().getFullYear()} Stellora — Peepsick Labs</span>
          <div className="flex items-center gap-4">
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="hover:text-slate-300 transition-colors">GitHub</a>
            <a href={DEMO_URL} className="hover:text-slate-300 transition-colors">Live Demo</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/** Video area — a real embed when VITE_DEMO_VIDEO_URL is set, otherwise an
 *  honest "not recorded yet" placeholder. Never a fake/staged video. */
function VideoPanel({ open, onOpen }: { open: boolean; onOpen: () => void }) {
  if (DEMO_VIDEO_URL) {
    return (
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-black aspect-video">
        {open ? (
          <video src={DEMO_VIDEO_URL} controls autoPlay className="w-full h-full" />
        ) : (
          <button onClick={onOpen} className="relative w-full h-full flex items-center justify-center group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 to-cyan-900/20" />
            <span className="relative w-16 h-16 rounded-full bg-white/10 border border-white/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play size={22} className="text-white ml-1" />
            </span>
          </button>
        )}
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 aspect-video flex flex-col items-center justify-center gap-3 text-center px-6">
      <span className="w-14 h-14 rounded-full bg-white/5 border border-white/20 flex items-center justify-center">
        <Play size={20} className="text-slate-500 ml-0.5" />
      </span>
      <p className="text-slate-500 text-[13px] font-mono">Demo video coming soon</p>
      <p className="text-slate-600 text-[11px] max-w-xs">
        In the meantime, the live demo shows everything this video will.
      </p>
    </div>
  );
}

/** Static mock of the Talk → search → open flow — an honest illustration,
 *  not a recording, styled to match the real AI Chat panel. */
function TalkDemoCard() {
  return (
    <div className="rounded-2xl bg-[#0a0b18]/90 border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.5)] font-mono overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <Mic size={13} className="text-purple-400" />
        <span className="text-[11px] font-bold text-white tracking-wider uppercase">Talk to Stellora</span>
      </div>
      <div className="p-4 space-y-2.5">
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-xl px-3 py-2 text-[12px] bg-purple-500/20 border border-purple-400/30 text-purple-100">
            "Find the photo we took on December 24th."
          </div>
        </div>
        <div className="flex justify-start">
          <div className="max-w-[85%] rounded-xl px-3 py-2 text-[12px] bg-white/5 border border-white/10 text-slate-300">
            Found a memory — December 24, 2025, Portland. Opening it now.
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-px bg-white/5 border-t border-white/10 text-center">
        {[
          { icon: Clock, label: 'Dec 24, 2025' },
          { icon: MapPin, label: 'Portland' },
          { icon: ImageIcon, label: 'Memory' },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="bg-[#0a0b18] py-3 flex flex-col items-center gap-1">
            <Icon size={13} className="text-slate-500" />
            <span className="text-[10px] text-slate-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Static mock of clustered memory nodes — same visual language as the real
 *  galaxy (glowing orbs, connecting lines) without depending on the full
 *  Three.js engine or real user data. */
function GalaxyMockup() {
  const nodes = [
    { x: 30, y: 40, size: 14, color: '#A88BFF' },
    { x: 55, y: 20, size: 10, color: '#65D7FF' },
    { x: 70, y: 55, size: 16, color: '#FFD27D' },
    { x: 42, y: 65, size: 11, color: '#A88BFF' },
    { x: 20, y: 70, size: 9, color: '#65D7FF' },
    { x: 80, y: 30, size: 8, color: '#FBBF24' },
  ];
  return (
    <div className="relative w-full max-w-lg h-56 mt-4">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {nodes.slice(1).map((n, i) => (
          <line
            key={i}
            x1={nodes[0].x}
            y1={nodes[0].y}
            x2={n.x}
            y2={n.y}
            stroke="white"
            strokeOpacity={0.08}
            strokeWidth={0.4}
          />
        ))}
        {nodes.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={n.size / 6} fill={n.color} opacity={0.9}>
            <animate attributeName="opacity" values="0.6;1;0.6" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>
    </div>
  );
}
