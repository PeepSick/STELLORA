/**
 * Central music playback controller — a single HTMLAudioElement at a time,
 * cross-fading between tracks. This is deliberately separate from
 * AmbientAudioManager (utils/audio.ts), which only synthesizes short UI
 * blips and a low drone via Web Audio oscillators; this plays real audio
 * FILES (Music Galaxy tracks) with real transport state (play/pause,
 * position, duration).
 *
 * One rule this file exists to enforce: at most one track plays at a time,
 * and switching tracks always fades the old one out before/while the new
 * one fades in — never a hard cut, never two tracks overlapping.
 */

export interface MusicPlaybackState {
  currentTrackId: string | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
}

// Plain "something changed" notifier — matches useSyncExternalStore's
// subscribe contract (React calls getState() itself for the snapshot).
type Listener = () => void;

const FADE_MS = 700;

class MusicPlayer {
  private audio: HTMLAudioElement | null = null;
  private fadeRaf: number | null = null;
  private currentTrackId: string | null = null;
  private volume = 0.6;
  private listeners = new Set<Listener>();
  private timeUpdateInterval: ReturnType<typeof setInterval> | null = null;
  // useSyncExternalStore requires getSnapshot to return a stable reference
  // when nothing has changed (React compares via Object.is) — recomputing a
  // fresh object on every call would trigger an infinite re-render loop.
  // Cache it and only replace the reference from emit().
  private cachedState: MusicPlaybackState = {
    currentTrackId: null,
    isPlaying: false,
    volume: this.volume,
    currentTime: 0,
    duration: 0,
  };

  subscribe(cb: Listener): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private emit() {
    this.cachedState = {
      currentTrackId: this.currentTrackId,
      isPlaying: !!this.audio && !this.audio.paused,
      volume: this.volume,
      currentTime: this.audio?.currentTime ?? 0,
      duration: this.audio?.duration || 0,
    };
    this.listeners.forEach((cb) => cb());
  }

  getState(): MusicPlaybackState {
    return this.cachedState;
  }

  /**
   * Play a track by id+url. If this exact track is already the current one,
   * this is a no-op — never restart or reset position on a re-click of the
   * same Music Node (see PROJELER.md music behavior spec).
   */
  play(trackId: string, url: string) {
    if (this.currentTrackId === trackId && this.audio) {
      if (this.audio.paused) {
        this.audio.play().catch(() => {});
        this.emit();
      }
      return;
    }
    this.crossfadeTo(trackId, url);
  }

  /** Pause/resume the current track without changing it. */
  toggle() {
    if (!this.audio) return;
    if (this.audio.paused) this.audio.play().catch(() => {});
    else this.audio.pause();
    this.emit();
  }

  /** Explicit pause — used by the status bar's MUSIC mute toggle, which
   *  needs a direction, not a flip (calling toggle() from two independent
   *  UI controls could fight over play/pause state). */
  pause() {
    this.audio?.pause();
    this.emit();
  }

  /** Explicit resume of whatever track is already loaded, if any. */
  resume() {
    if (this.audio?.paused) this.audio.play().catch(() => {});
    this.emit();
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.audio) this.audio.volume = this.volume;
    this.emit();
  }

  stop() {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
      this.timeUpdateInterval = null;
    }
    this.fadeOutAndStop(this.audio);
    this.audio = null;
    this.currentTrackId = null;
    this.emit();
  }

  private crossfadeTo(trackId: string, url: string) {
    const outgoing = this.audio;
    this.fadeOutAndStop(outgoing);

    const incoming = new Audio(url);
    incoming.loop = true;
    incoming.volume = 0;
    incoming.play().catch(() => {
      // Autoplay can still be blocked despite the caller having been
      // triggered by a click — nothing more we can do here; state still
      // reflects the attempted track so the UI shows what's selected.
    });

    this.audio = incoming;
    this.currentTrackId = trackId;
    this.emit();
    this.startTimeUpdates();

    const startedAt = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - startedAt) / FADE_MS);
      incoming.volume = this.volume * t;
      if (t < 1) {
        this.fadeRaf = requestAnimationFrame(step);
      } else {
        this.fadeRaf = null;
      }
    };
    if (this.fadeRaf) cancelAnimationFrame(this.fadeRaf);
    this.fadeRaf = requestAnimationFrame(step);
  }

  private fadeOutAndStop(el: HTMLAudioElement | null) {
    if (!el) return;
    const startVol = el.volume;
    const startedAt = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - startedAt) / FADE_MS);
      el.volume = startVol * (1 - t);
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        el.pause();
        el.src = '';
      }
    };
    requestAnimationFrame(step);
  }

  private startTimeUpdates() {
    if (this.timeUpdateInterval) clearInterval(this.timeUpdateInterval);
    // A few times a second is plenty for a progress bar — no need for
    // per-frame updates that would re-render UI 60x/sec for no visible gain.
    this.timeUpdateInterval = setInterval(() => this.emit(), 250);
  }
}

export const musicPlayer = new MusicPlayer();

/**
 * Shared entry point for every place a node can be selected (3D click,
 * Systems/Orbs list, search/command palette, chat's open_memory tool, …):
 * if the node is a Music node, select its track; for every other node type
 * (crucially, Memory nodes) this is a no-op — selection never touches music.
 */
export function maybePlayMusicNode(node: { type?: string; id: string; metadata?: unknown }): void {
  if (node.type !== 'audio') return;
  const url = (node.metadata as any)?.audioUrl as string | undefined;
  if (url) musicPlayer.play(node.id, url);
}
