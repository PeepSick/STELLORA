// English is the BASE language. Turkish overrides exist in tr.ts.
// Every user-facing string in the app should route through t() so the UI
// can switch languages at runtime. Auto-detect: if the browser locale starts
// with "tr" we use Turkish, otherwise English (see resolveLanguage).

export const en = {
  // ─── Generic ───
  appName: 'Stellora',
  loading: 'Loading…',
  close: 'Close',
  open: 'Open',
  cancel: 'Cancel',
  save: 'Save',
  reset: 'Reset',
  enable: 'Enable',
  disable: 'Disable',
  on: 'On',
  off: 'Off',
  search: 'Search',
  all: 'All',

  // ─── Galaxy sources ───
  sourceKnowledge: 'Knowledge',
  sourceStellora: 'Stellora',
  sourceAll: 'All',
  galaxySource: 'Galaxy Source',

  // ─── Per-node source hover tag ───
  nodeSourceLabel: 'SOURCE',
  sourceBusiness: 'Business',
  sourceOps: 'Operations',
  sourceProduct: 'Product',
  sourceSourcing: 'Sourcing',
  sourceFinanceCorpus: 'Finance Corpus',
  sourceStelloraMemory: 'Stellora Memory',
  sourceMusicGalaxy: 'Music Galaxy',
  sourceGitGalaxy: 'Git Galaxy',
  sourceMismatchQuestion: 'Source mismatch?',
  sourceMismatchFlagged: 'Flagged as mismatch',
  openAiChat: 'Open AI Chat',

  // ─── Photo/memory detail panel ───
  photoUnit: 'photo',
  peopleUnit: 'people',
  noLocation: 'no location',
  noGpsData: 'No location data (no GPS in EXIF)',
  sceneLabel: 'Scene',
  editLabel: 'Edit',
  doneLabel: 'Done',
  previewLabel: 'Preview',
  scenePlaceholder: 'What was happening in this photo?',
  tagsPlaceholder: 'tags, comma separated…',
  writeScenePrompt: 'Write what was happening in this photo…',
  storyLabel: 'Story',
  storyPlaceholder: 'Write the story of this day… (markdown + [[wikilink]] supported)',
  writeStoryPrompt: 'Write the story of this day…',
  peopleLabel: 'People',
  peoplePlaceholder: 'add names, comma separated…',
  photosOfDay: "This day's photos",

  // ─── Dock panels: Dashboard / Systems / Orbs / Analytics / Archive ───
  overview: 'Overview',
  totalNodes: 'Total Nodes',
  searchIndexLabel: 'Search Index',
  connectionsLabel: 'Connections',
  memoryDaysLabel: 'Memory Days',
  activeSourceLabel: 'Active Source',
  archivedMemoriesLabel: 'archived memories',
  goToArchive: 'go to ARCHIVE',
  noNodesYet: 'No nodes yet.',
  generalLabel: 'General',
  bySourceLabel: 'By Source',
  byTypeLabel: 'By Type',
  topTagsLabel: 'Top Tags',
  memoryMarksLabel: 'Memory Marks',
  noArchivedMemories: 'No archived memories. Mark a memory with 🕓 in its panel to move it here.',
  removeFromArchive: 'Remove from archive',
  modelNamePlaceholder: 'model name',
  emptyReply: '(empty reply)',

  // ─── Settings panel ───
  settings: 'Settings',
  settingsFeatures: 'Features',
  settingsAppearance: 'Appearance',
  settingsLanguage: 'Language',
  settingsTheme: 'Theme',
  settingsData: 'Data',
  langAuto: 'Auto (detect)',
  langEn: 'English',
  langTr: 'Turkish',
  themeDark: 'Dark',
  themeLight: 'Light',
  themeAurora: 'Aurora',
  themeCustom: 'Custom',

  // ─── Feature labels ───
  featFinance3D: 'Finance Corpus in 3D',
  featFinance3DDesc: 'Render the 1,661-file economy/finance reference archive as 3D nodes.',
  featTimeline: 'Timeline View',
  featTimelineDesc: 'Add a temporal axis to navigate nodes by date.',
  featMusic: 'Music Galaxy',
  featMusicDesc: 'Turn a local music folder into a galaxy (like the photo gallery).',
  featGit: 'Git Galaxy',
  featGitDesc: 'Fetch a GitHub repository and render its commits as nodes.',
  featCollab: 'Collaborative Mode',
  featCollabDesc: 'Sync the galaxy across browser tabs via BroadcastChannel.',
  featExport: 'Export / Import',
  featExportDesc: 'Save or load the whole galaxy as a JSON file.',

  // ─── Finance ───
  financeCount: 'Finance articles',
  financeNotice: 'Finance corpus is searchable. Enable "Finance Corpus in 3D" to render it.',

  // ─── Music ───
  musicFolder: 'Music folder',
  musicAddHint: 'Drop audio files into src/data/music/ — they appear automatically.',

  // ─── Git ───
  gitRepoUrl: 'Repository URL',
  gitFetch: 'Fetch Commits',
  gitPlaceholder: 'https://github.com/owner/repo',

  // ─── Export / Import ───
  exportJson: 'Export JSON',
  importJson: 'Import JSON',

  // ─── Collaborative ───
  collabActive: 'Collaborative mode active — changes sync across tabs.',

  // ─── Dock tabs ───
  tabDashboard: 'Dashboard',
  tabGalaxy: 'Galaxy',
  tabSystems: 'Systems',
  tabOrbs: 'Orbs',
  tabAnalytics: 'Analytics',
  tabArchive: 'Archive',
  tabSettings: 'Settings',
};

export type TranslationKey = keyof typeof en;
