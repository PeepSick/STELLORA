import { useEffect, useRef } from 'react';
import { useStellarisStore } from '@/store';
import { musicPlayer } from '@/utils/musicPlayer';

/**
 * Boots the default ambient music track on first user gesture (autoplay
 * policy, same pattern as useAudioEngine) and keeps it playing across
 * Memory node navigation — Memory nodes never touch music playback, only
 * Music nodes (type 'audio') and the Music Panel do, via musicPlayer.play()
 * called directly from their own click handlers.
 *
 * DEFAULT_TRACK prefers whichever loaded track's title/filename contains
 * "deep space" (case-insensitive) — matching Stellora's own bundled ambient
 * track by name, not by a hardcoded id, so a template user's differently
 * named files still fall back cleanly. If nothing matches, the first Music
 * node currently loaded (per loadMusicData's glob order) becomes the default.
 */
function pickDefaultTrack(nodes: { id: string; title: string; metadata?: unknown }[]) {
  const named = nodes.find((n) => n.title.toLowerCase().includes('deep space'));
  return named ?? nodes[0];
}

export function useMusicController(): void {
  const started = useRef(false);
  const musicGalaxyEnabled = useStellarisStore((s) => s.features.musicGalaxy);

  useEffect(() => {
    const boot = () => {
      if (started.current) return;
      started.current = true;
      const { features, musicNodes: nodes } = useStellarisStore.getState();
      if (features.musicGalaxy && nodes.length > 0) {
        const defaultTrack = pickDefaultTrack(nodes);
        const url = (defaultTrack.metadata as any)?.audioUrl as string | undefined;
        if (url) musicPlayer.play(defaultTrack.id, url);
      }
      window.removeEventListener('pointerdown', boot);
      window.removeEventListener('keydown', boot);
      window.removeEventListener('touchstart', boot);
    };
    window.addEventListener('pointerdown', boot);
    window.addEventListener('keydown', boot);
    window.addEventListener('touchstart', boot);
    return () => {
      window.removeEventListener('pointerdown', boot);
      window.removeEventListener('keydown', boot);
      window.removeEventListener('touchstart', boot);
    };
    // Only wire the listeners once — `boot` reads fresh state from the store
    // itself at fire time, so it doesn't need musicNodes/musicGalaxyEnabled
    // as reactive deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If the feature gets turned off entirely, stop music rather than leaving
  // a track playing behind a now-hidden galaxy source.
  useEffect(() => {
    if (!musicGalaxyEnabled) musicPlayer.stop();
  }, [musicGalaxyEnabled]);
}
