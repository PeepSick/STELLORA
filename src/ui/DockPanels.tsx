import React, { useMemo, useState } from 'react';
import { X, Star, Heart, Clock, RotateCcw, Eye, EyeOff, LayoutDashboard, KeyRound, Sparkles, Palette, Languages } from 'lucide-react';
import { useStellarisStore } from '@/store';
import { NODE_VISUALS } from '@/types';
import type { StellarisNode, StellorMemoryMetadata, AiProviderId, FeatureSettings, ThemePreset, LanguageMode } from '@/types';
import { readStellorMemory, writeStellorMark } from '@/hooks/useStellorMemory';
import { useAiConfig, AI_PROVIDER_LABELS } from '@/hooks/useAiConfig';
import { useTranslation } from '@/i18n';
import { exportGalaxy, importGalaxyFile, readStellorMarks, readAiConfig, STELLOR_MARK_PREFIX } from '@/services/exportImport';
import type { GalaxyExport } from '@/services/exportImport';
import { fetchGitHubCommits } from '@/services/gitHub';
import { maybePlayMusicNode } from '@/utils/musicPlayer';

function isMemoryNode(node: StellarisNode): boolean {
  return Array.isArray((node.metadata as any)?.photos);
}

const PANEL_TITLES: Record<string, string> = {
  dashboard: 'DASHBOARD',
  systems: 'SYSTEMS',
  orbs: 'ORBS',
  analytics: 'ANALYTICS',
  archive: 'ARCHIVE',
  settings: 'SETTINGS',
};

const Shell: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="w-[560px] max-w-[92vw] max-h-[75vh] flex flex-col bg-[#0a0b18]/95 border border-white/15 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] font-mono">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
        <h3 className="text-[11px] font-bold text-white tracking-[0.2em] uppercase">{title}</h3>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">{children}</div>
    </div>
  </div>
);

const DashboardContent: React.FC = () => {
  const { nodes, searchIndex, connections, galaxyProvider, setActiveDockTab } = useStellarisStore();
  const { t } = useTranslation();
  const memoryCount = nodes.filter(isMemoryNode).length;
  const archivedCount = nodes.filter((n) => isMemoryNode(n) && readStellorMemory(n.id).mark === 'archived').length;

  const stats = [
    { label: t('totalNodes'), value: nodes.length },
    { label: t('searchIndexLabel'), value: searchIndex.length },
    { label: t('connectionsLabel'), value: connections.length },
    { label: t('memoryDaysLabel'), value: memoryCount },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="bg-black/20 rounded-xl border border-white/5 p-3">
            <div className="text-[9px] text-slate-500 uppercase tracking-wider">{s.label}</div>
            <div className="text-lg font-bold text-white">{s.value}</div>
          </div>
        ))}
      </div>
      <div className="text-[10px] text-slate-400 flex items-center justify-between bg-black/20 rounded-xl border border-white/5 p-3">
        <span className="uppercase">{t('activeSourceLabel')}</span>
        <span className="text-purple-300 font-bold uppercase">{galaxyProvider}</span>
      </div>
      {archivedCount > 0 && (
        <button
          onClick={() => setActiveDockTab('archive')}
          className="w-full text-left text-[10px] text-slate-400 hover:text-slate-200 bg-black/20 hover:bg-black/30 rounded-xl border border-white/5 p-3 transition-colors"
        >
          {archivedCount} {t('archivedMemoriesLabel')} → {t('goToArchive')}
        </button>
      )}
      <div className="grid grid-cols-3 gap-2">
        {(['systems', 'analytics', 'settings'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveDockTab(tab)}
            className="h-9 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold text-slate-300 uppercase tracking-wider hover:bg-white/10"
          >
            {PANEL_TITLES[tab]}
          </button>
        ))}
      </div>
    </div>
  );
};

const SystemsContent: React.FC = () => {
  const { nodes, selectNode, focusOnNode, setActiveDockTab } = useStellarisStore();
  const { t } = useTranslation();
  const groups = useMemo(() => {
    const map = new Map<string, StellarisNode[]>();
    nodes.forEach((n) => {
      const key = n.type;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(n);
    });
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [nodes]);
  const [open, setOpen] = useState<string | null>(groups[0]?.[0] ?? null);

  return (
    <div className="space-y-2">
      {groups.map(([type, list]) => {
        const visual = NODE_VISUALS[type as keyof typeof NODE_VISUALS];
        return (
          <div key={type} className="bg-black/20 rounded-xl border border-white/5 overflow-hidden">
            <button
              onClick={() => setOpen(open === type ? null : type)}
              className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold text-slate-200 uppercase tracking-wider"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: visual?.color ?? '#a88bff' }} />
                {type}
              </span>
              <span className="text-slate-500">{list.length}</span>
            </button>
            {open === type && (
              <div className="px-3 pb-2 space-y-0.5 max-h-40 overflow-y-auto custom-scrollbar">
                {list.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      selectNode(n.id);
                      focusOnNode(n.id);
                      setActiveDockTab('galaxy');
                      maybePlayMusicNode(n);
                    }}
                    className="w-full text-left px-2 py-1 rounded-md text-[10px] text-slate-400 hover:text-white hover:bg-white/5 truncate"
                  >
                    {n.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
      {groups.length === 0 && <p className="text-[11px] text-slate-500 text-center py-6">{t('noNodesYet')}</p>}
    </div>
  );
};

const OrbsContent: React.FC = () => {
  const { nodes, selectNode, focusOnNode, setActiveDockTab } = useStellarisStore();
  const { t } = useTranslation();
  const sorted = useMemo(() => [...nodes].sort((a, b) => b.importance - a.importance), [nodes]);

  return (
    <div className="grid grid-cols-2 gap-1.5">
      {sorted.map((n) => {
        const visual = NODE_VISUALS[n.type];
        return (
          <button
            key={n.id}
            onClick={() => {
              selectNode(n.id);
              focusOnNode(n.id);
              setActiveDockTab('galaxy');
              maybePlayMusicNode(n);
            }}
            className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-black/20 border border-white/5 hover:border-white/20 text-left transition-colors"
          >
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: visual?.color ?? '#a88bff', boxShadow: `0 0 8px ${visual?.color ?? '#a88bff'}` }}
            />
            <span className="min-w-0">
              <div className="text-[10px] text-slate-200 truncate">{n.title}</div>
              <div className="text-[8px] text-slate-500 uppercase">{n.type} · {n.importance}/5</div>
            </span>
          </button>
        );
      })}
      {sorted.length === 0 && <p className="col-span-2 text-[11px] text-slate-500 text-center py-6">{t('noNodesYet')}</p>}
    </div>
  );
};

const AnalyticsContent: React.FC = () => {
  const { nodes, searchIndex, connections, galaxyProvider } = useStellarisStore();
  const { t } = useTranslation();

  const byType = useMemo(() => {
    const map = new Map<string, number>();
    nodes.forEach((n) => map.set(n.type, (map.get(n.type) ?? 0) + 1));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [nodes]);

  const bySource = useMemo(() => {
    let stellora = 0;
    let knowledge = 0;
    nodes.forEach((n) => (isMemoryNode(n) ? stellora++ : knowledge++));
    return { stellora, knowledge };
  }, [nodes]);

  const topTags = useMemo(() => {
    const map = new Map<string, number>();
    nodes.forEach((n) => n.tags.forEach((t) => map.set(t, (map.get(t) ?? 0) + 1)));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [nodes]);

  const marks = useMemo(() => {
    const counts = { favorite: 0, important: 0, archived: 0 };
    nodes.filter(isMemoryNode).forEach((n) => {
      const mark = readStellorMemory(n.id).mark;
      if (mark) counts[mark]++;
    });
    return counts;
  }, [nodes]);

  return (
    <div className="space-y-4 text-[11px]">
      <section>
        <h4 className="text-[9px] text-slate-500 uppercase tracking-wider mb-1.5">{t('generalLabel')}</h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-black/20 rounded-lg border border-white/5 p-2.5 flex items-center justify-between">
            <span className="text-slate-400">3D Node</span><span className="text-white font-bold">{nodes.length}</span>
          </div>
          <div className="bg-black/20 rounded-lg border border-white/5 p-2.5 flex items-center justify-between">
            <span className="text-slate-400">{t('searchIndexLabel')}</span><span className="text-white font-bold">{searchIndex.length}</span>
          </div>
          <div className="bg-black/20 rounded-lg border border-white/5 p-2.5 flex items-center justify-between">
            <span className="text-slate-400">{t('connectionsLabel')}</span><span className="text-white font-bold">{connections.length}</span>
          </div>
          <div className="bg-black/20 rounded-lg border border-white/5 p-2.5 flex items-center justify-between">
            <span className="text-slate-400">{t('activeSourceLabel')}</span><span className="text-purple-300 font-bold uppercase">{galaxyProvider}</span>
          </div>
        </div>
      </section>

      {(bySource.knowledge > 0 || bySource.stellora > 0) && (
        <section>
          <h4 className="text-[9px] text-slate-500 uppercase tracking-wider mb-1.5">{t('bySourceLabel')}</h4>
          <div className="space-y-1">
            <div className="flex items-center justify-between bg-black/20 rounded-lg border border-white/5 p-2">
              <span className="text-slate-400">Knowledge</span><span className="text-cyan-300 font-bold">{bySource.knowledge}</span>
            </div>
            <div className="flex items-center justify-between bg-black/20 rounded-lg border border-white/5 p-2">
              <span className="text-slate-400">Stellora</span><span className="text-amber-300 font-bold">{bySource.stellora}</span>
            </div>
          </div>
        </section>
      )}

      <section>
        <h4 className="text-[9px] text-slate-500 uppercase tracking-wider mb-1.5">{t('byTypeLabel')}</h4>
        <div className="space-y-1">
          {byType.map(([type, count]) => {
            const visual = NODE_VISUALS[type as keyof typeof NODE_VISUALS];
            const pct = Math.round((count / nodes.length) * 100);
            return (
              <div key={type} className="flex items-center gap-2">
                <span className="w-16 text-[9px] text-slate-400 uppercase truncate">{type}</span>
                <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: visual?.color ?? '#a88bff' }} />
                </div>
                <span className="w-6 text-right text-[9px] text-slate-500">{count}</span>
              </div>
            );
          })}
        </div>
      </section>

      {topTags.length > 0 && (
        <section>
          <h4 className="text-[9px] text-slate-500 uppercase tracking-wider mb-1.5">{t('topTagsLabel')}</h4>
          <div className="flex flex-wrap gap-1.5">
            {topTags.map(([tag, count]) => (
              <span key={tag} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] text-slate-300 font-mono">
                #{tag} · {count}
              </span>
            ))}
          </div>
        </section>
      )}

      {(marks.favorite + marks.important + marks.archived) > 0 && (
        <section>
          <h4 className="text-[9px] text-slate-500 uppercase tracking-wider mb-1.5">{t('memoryMarksLabel')}</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-black/20 rounded-lg border border-white/5 p-2 flex items-center gap-1.5">
              <Star size={11} className="text-amber-300" /><span className="text-white font-bold">{marks.favorite}</span>
            </div>
            <div className="bg-black/20 rounded-lg border border-white/5 p-2 flex items-center gap-1.5">
              <Heart size={11} className="text-pink-300" /><span className="text-white font-bold">{marks.important}</span>
            </div>
            <div className="bg-black/20 rounded-lg border border-white/5 p-2 flex items-center gap-1.5">
              <Clock size={11} className="text-slate-400" /><span className="text-white font-bold">{marks.archived}</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

const ArchiveContent: React.FC = () => {
  const { nodes, selectNode, focusOnNode, setActiveDockTab } = useStellarisStore();
  const { t } = useTranslation();
  const [, forceUpdate] = useState(0);
  const archived = nodes.filter((n) => isMemoryNode(n) && readStellorMemory(n.id).mark === 'archived');

  return (
    <div className="space-y-1.5">
      {archived.length === 0 && (
        <p className="text-[11px] text-slate-500 text-center py-6">{t('noArchivedMemories')}</p>
      )}
      {archived.map((n) => {
        const meta = n.metadata as unknown as StellorMemoryMetadata;
        return (
          <div key={n.id} className="flex items-center justify-between gap-2 bg-black/20 rounded-lg border border-white/5 p-2.5">
            <button
              onClick={() => {
                selectNode(n.id);
                focusOnNode(n.id);
                setActiveDockTab('galaxy');
              }}
              className="min-w-0 text-left"
            >
              <div className="text-[11px] text-slate-200 truncate">{n.title}</div>
              <div className="text-[9px] text-slate-500 truncate">{meta.photos.length} {t('photoUnit')} · {meta.daySummary}</div>
            </button>
            <button
              onClick={() => {
                writeStellorMark(n.id, null);
                forceUpdate((v) => v + 1);
              }}
              title={t('removeFromArchive')}
              className="shrink-0 w-7 h-7 rounded-md bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <RotateCcw size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

const PROVIDERS: AiProviderId[] = ['claude', 'openai', 'deepseek', 'zai', 'gemini', 'custom'];

type FeatureFlagKey = keyof FeatureSettings;

const FEATURE_FLAGS: { key: FeatureFlagKey; labelKey: 'featFinance3D' | 'featTimeline' | 'featMusic' | 'featGit' | 'featCollab' | 'featExport'; descKey: 'featFinance3DDesc' | 'featTimelineDesc' | 'featMusicDesc' | 'featGitDesc' | 'featCollabDesc' | 'featExportDesc' }[] = [
  { key: 'showFinance3D', labelKey: 'featFinance3D', descKey: 'featFinance3DDesc' },
  { key: 'timelineView', labelKey: 'featTimeline', descKey: 'featTimelineDesc' },
  { key: 'musicGalaxy', labelKey: 'featMusic', descKey: 'featMusicDesc' },
  { key: 'gitGalaxy', labelKey: 'featGit', descKey: 'featGitDesc' },
  { key: 'collaborativeMode', labelKey: 'featCollab', descKey: 'featCollabDesc' },
  { key: 'exportImport', labelKey: 'featExport', descKey: 'featExportDesc' },
];

const ToggleRow: React.FC<{ label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, desc, checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className="w-full flex items-center justify-between gap-3 bg-black/20 rounded-xl border border-white/5 px-3 py-2.5 text-left hover:border-white/15 transition-colors"
  >
    <span className="min-w-0">
      <span className="block text-[11px] text-slate-200 font-medium">{label}</span>
      <span className="block text-[9px] text-slate-500 leading-snug">{desc}</span>
    </span>
    <span className={`shrink-0 w-9 h-5 rounded-full flex items-center px-0.5 transition-colors ${checked ? 'bg-purple-500/70' : 'bg-white/10'}`}>
      <span className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </span>
  </button>
);

const SettingsContent: React.FC = () => {
  const { activeProvider, activeSettings, isConfigured, setActiveProvider, updateProviderSettings } = useAiConfig();
  const features = useStellarisStore((s) => s.features);
  const updateFeatures = useStellarisStore((s) => s.updateFeatures);
  const nodes = useStellarisStore((s) => s.nodes);
  const connections = useStellarisStore((s) => s.connections);
  const setAiActiveProvider = useStellarisStore((s) => s.setAiActiveProvider);
  const updateAiProviderSettings = useStellarisStore((s) => s.updateAiProviderSettings);
  const setNodes = useStellarisStore((s) => s.setNodes);
  const setConnections = useStellarisStore((s) => s.setConnections);
  const setGitNodes = useStellarisStore((s) => s.setGitNodes);
  const setGitConnections = useStellarisStore((s) => s.setGitConnections);
  const { t } = useTranslation();
  const [showKey, setShowKey] = useState(false);
  const [importMsg, setImportMsg] = useState<string>('');
  const [repoUrl, setRepoUrl] = useState<string>('');
  const [gitStatus, setGitStatus] = useState<string>('');

  const THEMES: { value: ThemePreset; labelKey: 'themeDark' | 'themeLight' | 'themeAurora' | 'themeCustom' }[] = [
    { value: 'dark', labelKey: 'themeDark' },
    { value: 'light', labelKey: 'themeLight' },
    { value: 'aurora', labelKey: 'themeAurora' },
    { value: 'custom', labelKey: 'themeCustom' },
  ];
  const LANGS: { value: LanguageMode; labelKey: 'langAuto' | 'langEn' | 'langTr' }[] = [
    { value: 'auto', labelKey: 'langAuto' },
    { value: 'en', labelKey: 'langEn' },
    { value: 'tr', labelKey: 'langTr' },
  ];

  return (
    <div className="space-y-5">
      <section>
        <h4 className="text-[9px] text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <KeyRound size={10} /> AI PROVIDER (bring-your-own-key)
        </h4>
        <p className="text-[10px] text-slate-500 leading-relaxed mb-2">
          {t('settings')}: client-only — your key stays in this browser and is sent straight to the provider.
        </p>
        <div className="grid grid-cols-6 gap-1 mb-3">
          {PROVIDERS.map((p) => (
            <button
              key={p}
              onClick={() => setActiveProvider(p)}
              className={`h-8 rounded-lg text-[9px] font-bold uppercase tracking-wide border transition-all ${
                activeProvider === p
                  ? 'bg-purple-500/20 border-purple-400/60 text-purple-200'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <div>
            <label className="text-[9px] text-slate-500 uppercase tracking-wider">API Key</label>
            <div className="flex items-center gap-1.5">
              <input
                type={showKey ? 'text' : 'password'}
                value={activeSettings.apiKey}
                onChange={(e) => updateProviderSettings(activeProvider, { apiKey: e.target.value })}
                placeholder={activeProvider === 'custom' ? 'not required for Ollama' : 'sk-… / AIza…'}
                className="flex-1 bg-black/30 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-400/50 font-mono"
              />
              <button
                onClick={() => setShowKey((v) => !v)}
                className="w-8 h-8 shrink-0 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-400"
              >
                {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
            {activeProvider === 'gemini' && (
              <p className="text-[9px] text-slate-500 mt-1 leading-relaxed">
                Get a free key from <code className="text-slate-400">aistudio.google.com/apikey</code>.
              </p>
            )}
          </div>
          <div>
            <label className="text-[9px] text-slate-500 uppercase tracking-wider">Base URL</label>
            <input
              type="text"
              value={activeSettings.baseUrl}
              onChange={(e) => updateProviderSettings(activeProvider, { baseUrl: e.target.value })}
              placeholder="https://api.example.com/v1"
              className="w-full bg-black/30 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-400/50 font-mono"
            />
          </div>
          <div>
            <label className="text-[9px] text-slate-500 uppercase tracking-wider">Model</label>
            <input
              type="text"
              value={activeSettings.model}
              onChange={(e) => updateProviderSettings(activeProvider, { model: e.target.value })}
              placeholder={t('modelNamePlaceholder')}
              className="w-full bg-black/30 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-400/50 font-mono"
            />
          </div>
        </div>

        <div className={`mt-2 text-[10px] flex items-center gap-1.5 ${isConfigured ? 'text-emerald-400' : 'text-slate-500'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isConfigured ? 'bg-emerald-400' : 'bg-slate-600'}`} />
          {isConfigured ? `${AI_PROVIDER_LABELS[activeProvider]} ready — click an orb to chat` : 'Not configured yet'}
        </div>
      </section>

      <section>
        <h4 className="text-[9px] text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Sparkles size={10} /> {t('settingsFeatures')}
        </h4>
        <div className="space-y-1.5">
          {FEATURE_FLAGS.map((f) => (
            <ToggleRow
              key={f.key}
              label={t(f.labelKey)}
              desc={t(f.descKey)}
              checked={features[f.key] as boolean}
              onChange={(v) => updateFeatures({ [f.key]: v } as Partial<FeatureSettings>)}
            />
          ))}
        </div>
      </section>

      <section>
        <h4 className="text-[9px] text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Palette size={10} /> {t('settingsAppearance')}
        </h4>
        <div className="space-y-3">
          <div>
            <label className="text-[9px] text-slate-500 uppercase tracking-wider">{t('settingsTheme')}</label>
            <div className="grid grid-cols-4 gap-1.5 mt-1.5">
              {THEMES.map((th) => (
                <button
                  key={th.value}
                  onClick={() => updateFeatures({ themePreset: th.value })}
                  className={`h-8 rounded-lg text-[9px] font-bold uppercase tracking-wide border transition-all ${
                    features.themePreset === th.value
                      ? 'bg-purple-500/20 border-purple-400/60 text-purple-200'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t(th.labelKey)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[9px] text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Languages size={10} /> {t('settingsLanguage')}
            </label>
            <div className="grid grid-cols-3 gap-1.5 mt-1.5">
              {LANGS.map((l) => (
                <button
                  key={l.value}
                  onClick={() => updateFeatures({ language: l.value })}
                  className={`h-8 rounded-lg text-[9px] font-bold uppercase tracking-wide border transition-all ${
                    features.language === l.value
                      ? 'bg-purple-500/20 border-purple-400/60 text-purple-200'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t(l.labelKey)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {features.exportImport && (
        <section>
          <h4 className="text-[9px] text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Sparkles size={10} /> {t('settingsData')}
          </h4>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() =>
                exportGalaxy({
                  nodes,
                  connections,
                  features,
                  aiConfig: readAiConfig(),
                  stellorMarks: readStellorMarks(),
                })
              }
              className="h-9 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-slate-200 uppercase tracking-wide hover:bg-white/10"
            >
              {t('exportJson')}
            </button>
            <label className="h-9 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-slate-200 uppercase tracking-wide hover:bg-white/10 flex items-center justify-center cursor-pointer">
              {t('importJson')}
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const data: GalaxyExport = await importGalaxyFile(file);
                    setNodes(data.nodes.map((n) => ({ ...n, position: n.position })));
                    setConnections(data.connections);
                    if (data.features) updateFeatures(data.features);
                    if (data.aiConfig) {
                      setAiActiveProvider(data.aiConfig.activeProvider);
                      (Object.keys(data.aiConfig.providers) as AiProviderId[]).forEach((p) =>
                        updateAiProviderSettings(p, data.aiConfig!.providers[p])
                      );
                    }
                    if (data.stellorMarks) {
                      Object.entries(data.stellorMarks).forEach(([key, value]) => {
                        const id = key.startsWith(STELLOR_MARK_PREFIX) ? key.slice(STELLOR_MARK_PREFIX.length) : key;
                        writeStellorMark(id, (value || null) as any);
                      });
                    }
                    setImportMsg('Imported ✓');
                  } catch {
                    setImportMsg('Invalid file');
                  }
                  setTimeout(() => setImportMsg(''), 2500);
                }}
              />
            </label>
          </div>
          {importMsg && <p className="text-[10px] text-emerald-400 mt-1.5">{importMsg}</p>}
        </section>
      )}

      {features.gitGalaxy && (
        <section>
          <h4 className="text-[9px] text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Sparkles size={10} /> {t('featGit')}
          </h4>
          <p className="text-[9px] text-slate-500 leading-relaxed mb-1.5">{t('featGitDesc')}</p>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder={t('gitPlaceholder')}
              className="flex-1 bg-black/30 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-400/50 font-mono"
            />
            <button
              onClick={async () => {
                setGitStatus('…');
                try {
                  const { nodes, connections } = await fetchGitHubCommits(repoUrl);
                  setGitNodes(nodes);
                  setGitConnections(connections);
                  setGitStatus(`${nodes.length} commits`);
                } catch (e: any) {
                  setGitStatus(e?.message ?? 'Error');
                }
              }}
              className="h-8 px-3 rounded-lg bg-purple-500/20 border border-purple-400/50 text-[10px] font-bold text-purple-200 hover:bg-purple-500/30"
            >
              {t('gitFetch')}
            </button>
          </div>
          {gitStatus && <p className="text-[10px] text-slate-400 mt-1.5">{gitStatus}</p>}
        </section>
      )}
    </div>
  );
};

export const DockPanels: React.FC = () => {
  const { activeDockTab, setActiveDockTab } = useStellarisStore();
  const { t } = useTranslation();
  const close = () => setActiveDockTab('galaxy');

  return (
    <Shell title={PANEL_TITLES[activeDockTab] ?? activeDockTab} onClose={close}>
      {activeDockTab === 'dashboard' && (
        <div className="flex items-center gap-1.5 text-[9px] text-slate-500 uppercase tracking-wider mb-3">
          <LayoutDashboard size={10} /> {t('overview')}
        </div>
      )}
      {activeDockTab === 'dashboard' && <DashboardContent />}
      {activeDockTab === 'systems' && <SystemsContent />}
      {activeDockTab === 'orbs' && <OrbsContent />}
      {activeDockTab === 'analytics' && <AnalyticsContent />}
      {activeDockTab === 'archive' && <ArchiveContent />}
      {activeDockTab === 'settings' && <SettingsContent />}
    </Shell>
  );
};
