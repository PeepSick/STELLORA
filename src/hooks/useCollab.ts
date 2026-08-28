import { useEffect, useRef } from 'react';
import { useStellarisStore } from '@/store';
import type { StellarisNode, StellarisConnection, FeatureSettings } from '@/types';

interface CollabMessage {
  type: 'state';
  nodes: StellarisNode[];
  connections: StellarisConnection[];
  features: FeatureSettings;
}

const CHANNEL = 'stellora-collab';

/**
 * Cross-tab sync via BroadcastChannel (no backend). When collaborativeMode is
 * on, every change to nodes/connections/features is broadcast to other tabs of
 * the same origin; incoming messages are applied locally. A ref guard prevents
 * echo loops.
 */
export function useCollabSync(): void {
  const enabled = useStellarisStore((s) => s.features.collaborativeMode);
  const applyingRemote = useRef(false);

  useEffect(() => {
    if (!enabled || typeof BroadcastChannel === 'undefined') return;

    const channel = new BroadcastChannel(CHANNEL);
    const store = useStellarisStore.getState;

    const broadcast = () => {
      if (applyingRemote.current) return;
      const { nodes, connections, features } = store();
      const msg: CollabMessage = { type: 'state', nodes, connections, features };
      channel.postMessage(msg);
    };

    // Broadcast whenever the synced slices change
    const unsub = useStellarisStore.subscribe((state, prev) => {
      if (
        state.nodes !== prev.nodes ||
        state.connections !== prev.connections ||
        state.features !== prev.features
      ) {
        broadcast();
      }
    });

    channel.onmessage = (e: MessageEvent<CollabMessage>) => {
      const data = e.data;
      if (!data || data.type !== 'state') return;
      applyingRemote.current = true;
      const s = store();
      s.setNodes(data.nodes);
      s.setConnections(data.connections);
      s.updateFeatures(data.features);
      // Release the guard after the store settles
      setTimeout(() => {
        applyingRemote.current = false;
      }, 0);
    };

    // Push current state to any newly opened tab
    broadcast();

    return () => {
      unsub();
      channel.close();
    };
  }, [enabled]);
}
