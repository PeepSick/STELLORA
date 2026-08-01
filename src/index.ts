// ─── @leosis/stellaris — Library Exports ───

// Main component
export { StellarisGalaxy } from './StellarisGalaxy';
export { default as StellarisGalaxyDefault } from './StellarisGalaxy';

// Adapter for external data integration
export { createAdapter } from './store/adapter';

// Store (for advanced usage)
export { useStellarisStore } from './store';

// Types
export type {
  StellarisNode,
  StellarisNodeType,
  StellarisConnection,
  StellarisConfig,
  StellarisTheme,
  StellarisGalaxyProps,
  GalaxySettings,
  DockItem,
  SearchCommand,
  SearchResult,
  NodeVisualConfig,
} from './types';

// Constants
export {
  DEFAULT_THEME,
  DEFAULT_CONFIG,
  DEFAULT_GALAXY_SETTINGS,
  NODE_VISUALS,
} from './types';

// Utilities
export { calculateNodePositions, spiralPosition } from './utils/galaxyMath';
export { fuzzySearch } from './utils/fuzzySearch';
