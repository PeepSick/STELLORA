import type { StellarisNode } from '@/types';

// Local music folder — drop audio files into src/data/music/ and they appear
// automatically (same auto-discovery pattern as the photo gallery). No external
// API key required. One node per file; metadata is derived from the filename.
const musicModules = import.meta.glob('/src/data/music/*.{mp3,wav,ogg,flac,m4a}', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function titleFromFilename(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/[_]+/g, ' ')
    .replace(/\b\d{2,4}\b/g, (m) => m) // keep years/track numbers
    .trim();
}

/**
 * Build audio nodes from the local music folder. Returns null for any file that
 * fails to resolve. Caller merges these into the spatial graph via the store
 * when the musicGalaxy feature is enabled.
 */
export function loadMusicNodes(): StellarisNode[] {
  return Object.entries(musicModules).map(([filepath, url]) => {
    const filename = filepath.split('/').pop() || 'track';
    const title = titleFromFilename(filename);
    return {
      id: 'audio-' + filename.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      title,
      description: `Audio · ${filename}`,
      type: 'audio',
      tags: ['music', 'audio'],
      importance: 2,
      connections: [],
      metadata: { audioUrl: url, filename },
    };
  });
}
