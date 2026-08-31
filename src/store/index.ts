import { create } from 'zustand';
import type {
  StellarisNode,
  StellarisConnection,
  StellarisConfig,
  GalaxySettings,
  GalaxyProvider,
  DockTabId,
  AiProviderId,
  AiProviderSettings,
  FeatureSettings,
  VoiceState,
} from '@/types';
import { DEFAULT_GALAXY_SETTINGS, DEFAULT_FEATURE_SETTINGS } from '@/types';

const FEATURES_STORAGE_KEY = 'stellora-features';

function readFeatures(): FeatureSettings {
  try {
    const raw = localStorage.getItem(FEATURES_STORAGE_KEY);
    if (raw) return { ...DEFAULT_FEATURE_SETTINGS, ...JSON.parse(raw) };
  } catch {
    /* corrupt storage — fall back to defaults */
  }
  return { ...DEFAULT_FEATURE_SETTINGS };
}
const INITIAL_FEATURES = readFeatures();

// Re-import defaults as values
const CONFIG_DEFAULTS: StellarisConfig = {
  showSearch: true,
  showLeftPanel: true,
  showRightPanel: true,
  showDock: true,
  showUniverseIntro: false,
  enableSound: true,
  enableIdleAnimation: true,
};

const GALAXY_DEFAULTS: GalaxySettings = {
  ...DEFAULT_GALAXY_SETTINGS,
};

// ─── AI provider config (Faz 5, bring-your-own-key) ───
// Client-only app, no backend — keys live in this browser's localStorage only,
// and are sent straight from here to whichever provider/base URL the user set.
const AI_CONFIG_STORAGE_KEY = 'stellora-ai-config';

const AI_PROVIDER_DEFAULTS: Record<AiProviderId, AiProviderSettings> = {
  claude: { apiKey: '', baseUrl: 'https://api.anthropic.com/v1/messages', model: 'claude-sonnet-4-5-20250929' },
  openai: { apiKey: '', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  deepseek: { apiKey: '', baseUrl: 'https://api.deepseek.com', model: 'deepseek-chat' },
  zai: { apiKey: '', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4-plus' },
  // Gemini is the default provider — a normal Google AI Studio API key (not a
  // service account), safe to keep client-side like every other provider here.
  gemini: { apiKey: '', baseUrl: 'https://generativelanguage.googleapis.com', model: 'gemini-2.5-flash' },
  // Custom ships pre-filled for a local Ollama server (OpenAI-compatible
  // endpoint, no real key needed) — the user can point it anywhere else.
  custom: { apiKey: 'ollama', baseUrl: 'http://localhost:11434/v1', model: 'llama3.2' },
};

function readAiConfig(): { activeProvider: AiProviderId; providers: Record<AiProviderId, AiProviderSettings> } {
  try {
    const raw = localStorage.getItem(AI_CONFIG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        activeProvider: parsed.activeProvider === 'vertex' ? 'gemini' : (parsed.activeProvider ?? 'gemini'),
        providers: { ...AI_PROVIDER_DEFAULTS, ...parsed.providers },
      };
    }
  } catch {
    // ignore corrupt storage
  }
  return { activeProvider: 'gemini', providers: AI_PROVIDER_DEFAULTS };
}

const INITIAL_AI_CONFIG = readAiConfig();

// ─── Store Interface ───
interface StellarisStore {
  // Galaxy Provider — which data source is currently rendered (exclusive; switching reloads the graph)
  galaxyProvider: GalaxyProvider;
  setGalaxyProvider: (provider: GalaxyProvider) => void;

  // Nodes
  nodes: StellarisNode[];
  connections: StellarisConnection[];
  // Searchable but not spatially rendered (e.g. large reference corpora like economy/finance)
  searchIndex: StellarisNode[];
  // Optional external node sources (Music/Git galaxies) — merged into the spatial
  // graph only when their feature flag is on (see StellarisGalaxy).
  musicNodes: StellarisNode[];
  gitNodes: StellarisNode[];
  gitConnections: StellarisConnection[];
  setMusicNodes: (nodes: StellarisNode[]) => void;
  setGitNodes: (nodes: StellarisNode[]) => void;
  setGitConnections: (connections: StellarisConnection[]) => void;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  filteredType: string | null;
  // Stellora: which photo within the selected memory node is focused — shared
  // between the 2D detail panel slider and the 3D cover so they stay in sync
  activePhotoIndex: number;
  setActivePhotoIndex: (i: number) => void;
  setNodes: (nodes: StellarisNode[]) => void;
  setConnections: (connections: StellarisConnection[]) => void;
  setSearchIndex: (nodes: StellarisNode[]) => void;
  selectNode: (id: string | null) => void;
  hoverNode: (id: string | null) => void;
  setFilteredType: (type: string | null) => void;
  getSelectedNode: () => StellarisNode | null;
  getNodeById: (id: string) => StellarisNode | undefined;
  getConnectedNodes: (id: string) => StellarisNode[];
  addConnection: (source: string, target: string, strength?: number) => { ok: boolean; message: string };

  // Bottom dock (Faz 4) — which overlay panel is open; 'galaxy'/'dashboard' show no overlay
  activeDockTab: DockTabId;
  setActiveDockTab: (tab: DockTabId) => void;

  // AI chat panel (Faz 5)
  isChatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  toggleChat: () => void;

  // Set by the orb's "Talk" button: open the chat panel AND start listening
  // immediately, for a one-click voice-only flow. ChatPanel consumes and
  // resets this on mount so it only fires once per click.
  voiceAutoStart: boolean;
  openChatWithVoice: () => void;
  clearVoiceAutoStart: () => void;

  // Voice interaction state, shared so the orb (ContextPanel) can react
  // visually to what ChatPanel's speech recognition/TTS is doing.
  voiceState: VoiceState;
  setVoiceState: (s: VoiceState) => void;

  // AI provider config (Faz 5, bring-your-own-key) — shared across Settings + Chat
  aiActiveProvider: AiProviderId;
  aiProviders: Record<AiProviderId, AiProviderSettings>;
  setAiActiveProvider: (provider: AiProviderId) => void;
  updateAiProviderSettings: (provider: AiProviderId, partial: Partial<AiProviderSettings>) => void;

  // Galaxy Settings
  galaxy: GalaxySettings;
  updateGalaxy: (partial: Partial<GalaxySettings>) => void;
  resetGalaxy: () => void;

  // Feature flags (Phase 0) — every optional feature is toggleable from Settings
  features: FeatureSettings;
  updateFeatures: (partial: Partial<FeatureSettings>) => void;
  resetFeatures: () => void;

  // UI
  isSearchOpen: boolean;
  isLeftPanelOpen: boolean;
  isRightPanelOpen: boolean;
  isFullscreen: boolean;
  isUniverseMode: boolean;
  isIdle: boolean;
  activeFilter: string;
  toggleSearch: () => void;
  setSearchOpen: (open: boolean) => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setFullscreen: (fs: boolean) => void;
  setUniverseMode: (mode: boolean) => void;
  setIdle: (idle: boolean) => void;
  setActiveFilter: (filter: string) => void;

  // Camera
  cameraTarget: [number, number, number];
  cameraZoom: number;
  isCameraAnimating: boolean;
  setCameraTarget: (target: [number, number, number]) => void;
  setCameraZoom: (zoom: number) => void;
  setCameraAnimating: (animating: boolean) => void;
  focusOnNode: (id: string) => void;
  resetCamera: () => void;

  // Config (from parent)
  config: StellarisConfig;
  setConfig: (config: Partial<StellarisConfig>) => void;
}

export const useStellarisStore = create<StellarisStore>((set, get) => ({
  // ─── Galaxy Provider ───
  galaxyProvider: 'all',
  setGalaxyProvider: (provider) => set({ galaxyProvider: provider, selectedNodeId: null, hoveredNodeId: null }),

  // ─── Nodes ───
  nodes: [],
  connections: [],
  searchIndex: [],
  musicNodes: [],
  gitNodes: [],
  gitConnections: [],
  setMusicNodes: (musicNodes) => set({ musicNodes }),
  setGitNodes: (gitNodes) => set({ gitNodes }),
  setGitConnections: (gitConnections) => set({ gitConnections }),
  selectedNodeId: null,
  hoveredNodeId: null,
  filteredType: null,
  activePhotoIndex: 0,
  setActivePhotoIndex: (i) => set({ activePhotoIndex: i }),

  setNodes: (nodes) => set({ nodes }),
  setConnections: (connections) => set({ connections }),
  setSearchIndex: (searchIndex) => set({ searchIndex }),
  selectNode: (id) => set({ selectedNodeId: id, activePhotoIndex: 0 }),
  hoverNode: (id) => set({ hoveredNodeId: id }),
  setFilteredType: (type) => set({ filteredType: type }),

  getSelectedNode: () => {
    const { nodes, searchIndex, selectedNodeId } = get();
    return nodes.find((n) => n.id === selectedNodeId) ?? searchIndex.find((n) => n.id === selectedNodeId) ?? null;
  },

  getNodeById: (id) => {
    const { nodes, searchIndex } = get();
    return nodes.find((n) => n.id === id) ?? searchIndex.find((n) => n.id === id);
  },

  getConnectedNodes: (id) => {
    const { nodes, searchIndex, connections } = get();
    const allNodes = [...nodes, ...searchIndex];
    const connectedIds = new Set<string>();
    connections.forEach((c) => {
      if (c.source === id) connectedIds.add(c.target);
      if (c.target === id) connectedIds.add(c.source);
    });
    // Also check node.connections array (covers search-index-only nodes like the finance corpus)
    const node = allNodes.find((n) => n.id === id);
    node?.connections.forEach((cid) => connectedIds.add(cid));
    return allNodes.filter((n) => connectedIds.has(n.id));
  },

  addConnection: (source, target, strength = 0.6) => {
    if (source === target) return { ok: false, message: 'A node cannot connect to itself.' };
    const { nodes, searchIndex, connections } = get();
    const allNodes = [...nodes, ...searchIndex];
    if (!allNodes.some((n) => n.id === source)) return { ok: false, message: `Node not found: ${source}` };
    if (!allNodes.some((n) => n.id === target)) return { ok: false, message: `Node not found: ${target}` };
    const exists = connections.some(
      (c) => (c.source === source && c.target === target) || (c.source === target && c.target === source)
    );
    if (exists) return { ok: false, message: 'These two nodes are already connected.' };
    set((s) => ({ connections: [...s.connections, { source, target, strength, type: 'default' }] }));
    return { ok: true, message: `Connection created: ${source} → ${target}` };
  },

  // ─── Bottom dock (Faz 4) ───
  activeDockTab: 'galaxy',
  setActiveDockTab: (tab) => set({ activeDockTab: tab }),

  // ─── AI chat (Faz 5) ───
  isChatOpen: false,
  setChatOpen: (open) => set({ isChatOpen: open }),
  toggleChat: () => set((s) => ({ isChatOpen: !s.isChatOpen })),

  voiceAutoStart: false,
  openChatWithVoice: () => set({ isChatOpen: true, voiceAutoStart: true }),
  clearVoiceAutoStart: () => set({ voiceAutoStart: false }),

  voiceState: 'idle',
  setVoiceState: (voiceState) => set({ voiceState }),

  // ─── AI provider config (Faz 5) ───
  aiActiveProvider: INITIAL_AI_CONFIG.activeProvider,
  aiProviders: INITIAL_AI_CONFIG.providers,
  setAiActiveProvider: (provider) => {
    set({ aiActiveProvider: provider });
    const { aiProviders } = get();
    localStorage.setItem(AI_CONFIG_STORAGE_KEY, JSON.stringify({ activeProvider: provider, providers: aiProviders }));
  },
  updateAiProviderSettings: (provider, partial) => {
    const providers = { ...get().aiProviders, [provider]: { ...get().aiProviders[provider], ...partial } };
    set({ aiProviders: providers });
    localStorage.setItem(AI_CONFIG_STORAGE_KEY, JSON.stringify({ activeProvider: get().aiActiveProvider, providers }));
  },

  // ─── Galaxy Settings ───
  galaxy: { ...GALAXY_DEFAULTS },
  updateGalaxy: (partial) =>
    set((s) => ({ galaxy: { ...s.galaxy, ...partial } })),
  resetGalaxy: () => set({ galaxy: { ...GALAXY_DEFAULTS } }),

  // ─── Feature flags (Phase 0) ───
  features: { ...INITIAL_FEATURES },
  updateFeatures: (partial) => {
    const features = { ...get().features, ...partial };
    set({ features });
    localStorage.setItem(FEATURES_STORAGE_KEY, JSON.stringify(features));
  },
  resetFeatures: () => {
    set({ features: { ...DEFAULT_FEATURE_SETTINGS } });
    localStorage.setItem(FEATURES_STORAGE_KEY, JSON.stringify(DEFAULT_FEATURE_SETTINGS));
  },

  // ─── UI ───
  isSearchOpen: false,
  isLeftPanelOpen: true,
  isRightPanelOpen: false,
  isFullscreen: false,
  isUniverseMode: false,
  isIdle: false,
  activeFilter: 'all',

  toggleSearch: () => set((s) => ({ isSearchOpen: !s.isSearchOpen })),
  setSearchOpen: (open) => set({ isSearchOpen: open }),
  toggleLeftPanel: () => set((s) => ({ isLeftPanelOpen: !s.isLeftPanelOpen })),
  toggleRightPanel: () => set((s) => ({ isRightPanelOpen: !s.isRightPanelOpen })),
  setFullscreen: (fs) => set({ isFullscreen: fs }),
  setUniverseMode: (mode) => set({ isUniverseMode: mode }),
  setIdle: (idle) => set({ isIdle: idle }),
  setActiveFilter: (filter) => set({ activeFilter: filter }),

  // ─── Camera ───
  cameraTarget: [0, 0, 0],
  cameraZoom: 1,
  isCameraAnimating: false,

  setCameraTarget: (target) => set({ cameraTarget: target }),
  setCameraZoom: (zoom) => set({ cameraZoom: zoom }),
  setCameraAnimating: (animating) => set({ isCameraAnimating: animating }),

  focusOnNode: (id) => {
    const { nodes, searchIndex } = get();
    const node = nodes.find((n) => n.id === id);
    if (node?.position) {
      set({
        cameraTarget: node.position,
        selectedNodeId: id,
        activePhotoIndex: 0,
        isCameraAnimating: true,
        isRightPanelOpen: true,
      });
      return;
    }
    // Search-index-only node (e.g. finance corpus) — no 3D position to fly to,
    // just open the detail panel without moving the camera.
    if (searchIndex.some((n) => n.id === id)) {
      set({ selectedNodeId: id, activePhotoIndex: 0, isRightPanelOpen: true });
    }
  },

  resetCamera: () =>
    set({
      cameraTarget: [0, 0, 0],
      cameraZoom: 1,
      isCameraAnimating: true,
      selectedNodeId: null,
      isRightPanelOpen: false,
    }),

  // ─── Config ───
  config: { ...CONFIG_DEFAULTS },
  setConfig: (partial) =>
    set((s) => ({ config: { ...s.config, ...partial } })),
}));
