// ─── Stellaris Node Types ───
export type StellarisNodeType =
  | 'memory' | 'project' | 'agent' | 'folder' | 'document'
  | 'conversation' | 'skill' | 'tool' | 'prompt' | 'collection'
  | 'sector' | 'entity' | 'custom'
  | 'photo' | 'event' | 'audio' | 'commit';

// ─── Galaxy Provider (data source) ───
// 'knowledge' = markdown notes (existing). 'stellora' = photo/memory gallery.
// Git/Music/Timeline are placeholders for future providers — not wired to any
// data source yet.
export type GalaxyProvider = 'knowledge' | 'stellora' | 'all' | 'git' | 'music' | 'timeline';

// ─── Bottom dock tabs (Faz 4) ───
export type DockTabId = 'dashboard' | 'galaxy' | 'systems' | 'orbs' | 'analytics' | 'archive' | 'settings';

// ─── AI chat providers (Faz 5) — bring-your-own-key, never a key baked into the app ───
export type AiProviderId = 'claude' | 'openai' | 'deepseek' | 'zai' | 'custom';

export interface AiProviderSettings {
  apiKey: string;
  baseUrl: string;
  model: string;
}

/** One photo inside a Stellora memory day — not a standalone rendered node. */
export interface StellorPhotoMetadata {
  imageUrl: string;
  filename: string;           // stable key for user edits (imageUrl can change hash on rebuild)
  dateTaken: string | null;   // ISO string, null if EXIF has no date
  camera: string | null;
  lens: string | null;
  iso: number | null;
  focalLength: number | null; // mm
  fNumber: number | null;     // aperture, e.g. 1.8
  resolution: { width: number; height: number } | null;
  gps: { lat: number; lon: number } | null;
  scene: string;              // short scene description (one-time visual pass, see PROJELER.md)
  tags: string[];
  peopleObserved: number;     // count only — no identity/face recognition, see PROJELER.md
}

/**
 * The unit rendered as a single 3D node in Stellora mode: one calendar day,
 * carrying every photo taken that day. Solves "30 photos ≠ 30 nodes."
 */
export interface StellorMemoryMetadata {
  dayKey: string;              // YYYY-MM-DD, or 'unknown'
  dateLabel: string;
  photos: StellorPhotoMetadata[];
  peopleObserved: number;      // max across the day's photos
  daySummary: string;          // one-line hand-written synthesis of the day
}

export interface StellarisNode {
  id: string;
  title: string;
  description?: string;
  type: StellarisNodeType;
  tags: string[];
  importance: number;       // 1-5
  color?: string;
  size?: number;            // override default size
  position?: [number, number, number];
  connections: string[];    // connected node IDs
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface StellarisConnection {
  source: string;
  target: string;
  strength: number;         // 0-1
  type?: 'default' | 'strong' | 'weak' | 'data-flow';
}

// ─── Configuration ───
export interface StellarisConfig {
  showSearch: boolean;
  showLeftPanel: boolean;
  showRightPanel: boolean;
  showDock: boolean;
  showUniverseIntro: boolean;
  enableSound: boolean;
  enableIdleAnimation: boolean;
  dockItems?: DockItem[];
  theme?: Partial<StellarisTheme>;
  initialCameraPosition?: [number, number, number];
}

export interface DockItem {
  id: string;
  label: string;
  icon: string;  // lucide icon name
  active?: boolean;
  badge?: number;
}

export interface StellarisTheme {
  background: string;
  primary: string;
  accent: string;
  gold: string;
  glass: string;
  border: string;
  glow: string;
  text: string;
  textMuted: string;
}

export const DEFAULT_THEME: StellarisTheme = {
  background: '#070811',
  primary: '#A88BFF',
  accent: '#65D7FF',
  gold: '#FFD27D',
  glass: 'rgba(255,255,255,0.06)',
  border: 'rgba(255,255,255,0.12)',
  glow: '#9D7BFF',
  text: '#FFFFFF',
  textMuted: '#64748B',
};

export const DEFAULT_CONFIG: StellarisConfig = {
  showSearch: true,
  showLeftPanel: true,
  showRightPanel: true,
  showDock: true,
  showUniverseIntro: false,
  enableSound: true,
  enableIdleAnimation: true,
};

// ─── Galaxy Settings (3D Controls) ───
export interface GalaxySettings {
  // Screenshot controls
  starCount: number;           // e.g. 380,000
  spinVelocity: number;        // e.g. 2.45
  luminosity: number;          // e.g. 0.32
  nebulaDensity: number;       // e.g. 1.42
  spiralArms: number;          // e.g. 4
  coreBrightness: number;      // e.g. 1.85
  darkMatter: number;          // e.g. 0.67
  preset: 'AURELIA' | 'ORIONIS' | 'VORATH' | 'ZEPHYRA';

  // Audio & theme controls
  soundEnabled: boolean;
  musicEnabled: boolean;
  darkMode: boolean;

  // Render toggles & tuning
  nodeSize: number;            // 0.5-3
  connectionStrength: number;  // 0-1
  bloomIntensity: number;      // 0-3
  brightness: number;          // 0.5-2
  animationSpeed: number;      // 0-2
  particleCount: number;       // 1000-50000
  showLabels: boolean;
  showConnections: boolean;
  showParticles: boolean;
  showNebula: boolean;
  showOrbitLines: boolean;
}

export const DEFAULT_GALAXY_SETTINGS: GalaxySettings = {
  starCount: 380000,
  spinVelocity: 2.45,
  luminosity: 0.32,
  nebulaDensity: 1.42,
  spiralArms: 4,
  coreBrightness: 1.85,
  darkMatter: 0.67,
  preset: 'AURELIA',

  soundEnabled: true,
  musicEnabled: true,
  darkMode: true,

  nodeSize: 1,
  connectionStrength: 0.5,
  bloomIntensity: 1.5,
  brightness: 1,
  animationSpeed: 1,
  particleCount: 10000,
  showLabels: true,
  showConnections: true,
  showParticles: true,
  showNebula: true,
  showOrbitLines: true,
};

// ─── Feature flags & i18n (Phase 0) ───
export type LanguageMode = 'auto' | 'en' | 'tr';
export type ThemePreset = 'dark' | 'light' | 'aurora' | 'custom';

/**
 * Every optional galaxy feature is gated behind a flag so the user can enable
 * or disable it from Settings. Defaults keep the app lean (only the original
 * knowledge + stellora graphs active).
 */
export interface FeatureSettings {
  showFinance3D: boolean;      // A1: render the 1661-file economy/finance corpus as 3D nodes
  timelineView: boolean;       // temporal axis mode
  musicGalaxy: boolean;        // local music folder → galaxy
  gitGalaxy: boolean;          // GitHub repo URL → commit galaxy
  collaborativeMode: boolean;  // BroadcastChannel cross-tab sync
  exportImport: boolean;       // JSON serialize/restore
  themePreset: ThemePreset;
  language: LanguageMode;
}

export const DEFAULT_FEATURE_SETTINGS: FeatureSettings = {
  showFinance3D: false,
  timelineView: false,
  musicGalaxy: false,
  gitGalaxy: false,
  collaborativeMode: false,
  exportImport: false,
  themePreset: 'dark',
  language: 'auto',
};

// ─── Search ───
export interface SearchCommand {
  id: string;
  label: string;
  category: 'node' | 'command' | 'recent';
  icon?: string;
  action?: () => void;
  nodeId?: string;
}

export interface SearchResult {
  node: StellarisNode;
  score: number;
  matchField: string;
}

// ─── Node Visual Mapping ───
export interface NodeVisualConfig {
  color: string;
  emissiveIntensity: number;
  baseSize: number;
  glowStrength: number;
  pulseSpeed: number;
}

export const NODE_VISUALS: Record<StellarisNodeType, NodeVisualConfig> = {
  memory:       { color: '#A88BFF', emissiveIntensity: 1.2, baseSize: 1.0, glowStrength: 0.6, pulseSpeed: 0.5 },
  project:      { color: '#65D7FF', emissiveIntensity: 1.4, baseSize: 1.4, glowStrength: 0.8, pulseSpeed: 0.3 },
  agent:        { color: '#FFD27D', emissiveIntensity: 1.6, baseSize: 1.4, glowStrength: 1.0, pulseSpeed: 0.7 },
  folder:       { color: '#8B9BB4', emissiveIntensity: 0.8, baseSize: 0.7, glowStrength: 0.3, pulseSpeed: 0.2 },
  document:     { color: '#7DD3FC', emissiveIntensity: 1.0, baseSize: 1.0, glowStrength: 0.5, pulseSpeed: 0.4 },
  conversation: { color: '#C4B5FD', emissiveIntensity: 1.0, baseSize: 0.8, glowStrength: 0.4, pulseSpeed: 0.8 },
  skill:        { color: '#34D399', emissiveIntensity: 1.3, baseSize: 1.0, glowStrength: 0.7, pulseSpeed: 0.4 },
  tool:         { color: '#F472B6', emissiveIntensity: 1.1, baseSize: 1.0, glowStrength: 0.5, pulseSpeed: 0.6 },
  prompt:       { color: '#FCD34D', emissiveIntensity: 1.0, baseSize: 0.8, glowStrength: 0.5, pulseSpeed: 0.3 },
  collection:   { color: '#818CF8', emissiveIntensity: 1.3, baseSize: 1.3, glowStrength: 0.8, pulseSpeed: 0.5 },
  sector:       { color: '#A88BFF', emissiveIntensity: 2.0, baseSize: 2.0, glowStrength: 1.2, pulseSpeed: 0.2 },
  entity:       { color: '#94A3B8', emissiveIntensity: 0.9, baseSize: 0.9, glowStrength: 0.4, pulseSpeed: 0.3 },
  custom:       { color: '#E2E8F0', emissiveIntensity: 1.0, baseSize: 1.0, glowStrength: 0.5, pulseSpeed: 0.4 },
  photo:        { color: '#FDE68A', emissiveIntensity: 1.1, baseSize: 1.3, glowStrength: 0.6, pulseSpeed: 0.3 },
  event:        { color: '#FB923C', emissiveIntensity: 1.4, baseSize: 1.6, glowStrength: 0.9, pulseSpeed: 0.25 },
  audio:        { color: '#34D399', emissiveIntensity: 1.5, baseSize: 1.1, glowStrength: 0.7, pulseSpeed: 0.6 },
  commit:       { color: '#F472B6', emissiveIntensity: 1.2, baseSize: 0.9, glowStrength: 0.5, pulseSpeed: 0.4 },
};

// ─── Props for main component ───
export interface StellarisGalaxyProps {
  nodes: StellarisNode[];
  connections?: StellarisConnection[];
  /** Searchable but not spatially rendered — for large reference corpora that shouldn't become 3D orbs. */
  searchIndexNodes?: StellarisNode[];
  config?: Partial<StellarisConfig>;
  onNodeSelect?: (node: StellarisNode) => void;
  onNodeHover?: (node: StellarisNode | null) => void;
  onNodeAction?: (action: string, node: StellarisNode) => void;
  onSearch?: (query: string) => void;
  onDockItemClick?: (itemId: string) => void;
  fullscreen?: boolean;
  className?: string;
}
