import { useEffect, useRef } from 'react';
import { useStellarisStore } from '@/store';
import { audioManager } from '@/utils/audio';

/**
 * Boots the built-in audio engine. Browsers block AudioContext until a user
 * gesture, so we resume + start the ambient drone on the first pointer/key
 * interaction. The store's soundEnabled/musicEnabled flags drive mute and the
 * ambient loop thereafter.
 */
export function useAudioEngine(): void {
  const started = useRef(false);
  const musicEnabled = useStellarisStore((s) => s.galaxy.musicEnabled);
  const soundEnabled = useStellarisStore((s) => s.galaxy.soundEnabled);

  // Start on first user gesture (autoplay policy)
  useEffect(() => {
    const boot = () => {
      if (started.current) return;
      started.current = true;
      audioManager.resume();
      const { galaxy } = useStellarisStore.getState();
      if (galaxy.musicEnabled) audioManager.playAmbient();
      if (!galaxy.soundEnabled) audioManager.mute();
      else audioManager.unmute();
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
  }, []);

  // React to music toggle
  useEffect(() => {
    if (!started.current) return;
    if (musicEnabled) audioManager.playAmbient();
    else audioManager.stopAmbient();
  }, [musicEnabled]);

  // React to sound (mute) toggle
  useEffect(() => {
    if (!started.current) return;
    if (soundEnabled) audioManager.unmute();
    else audioManager.mute();
  }, [soundEnabled]);
}
