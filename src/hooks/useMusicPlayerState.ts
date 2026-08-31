import { useSyncExternalStore } from 'react';
import { musicPlayer, type MusicPlaybackState } from '@/utils/musicPlayer';

/** Reactive read of the central music player's state — see utils/musicPlayer.ts. */
export function useMusicPlayerState(): MusicPlaybackState {
  return useSyncExternalStore(
    (cb) => musicPlayer.subscribe(cb),
    () => musicPlayer.getState(),
  );
}
