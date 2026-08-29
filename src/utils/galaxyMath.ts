import type { StellarisNode, StellarisConnection } from '@/types';

// ─── Galaxy Math: spiral arm positioning ───

const SPIRAL_ARMS = 4;
const SPIRAL_TIGHTNESS = 0.65;
const GALAXY_RADIUS = 100;

/** Generate a position on a logarithmic spiral arm */
export function spiralPosition(
  distance: number,
  armIndex: number,
  totalArms: number = SPIRAL_ARMS,
  tightness: number = SPIRAL_TIGHTNESS,
  jitter: number = 0.6
): [number, number, number] {
  const armAngle = (armIndex / totalArms) * Math.PI * 2;
  const spiralAngle = distance * tightness;
  const angle = armAngle + spiralAngle;

  // Add controlled randomness
  const rx = (Math.random() - 0.5) * jitter * distance * 0.5;
  const rz = (Math.random() - 0.5) * jitter * distance * 0.5;
  const ry = (Math.random() - 0.5) * jitter * distance * 0.15; // thinner Y

  const x = Math.cos(angle) * distance + rx;
  const z = Math.sin(angle) * distance + rz;
  const y = ry;

  return [x, y, z];
}

/** Calculate galaxy positions for knowledge nodes — spread across spiral arms */
export function calculateNodePositions(nodes: StellarisNode[]): StellarisNode[] {
  const placedPositions: [number, number, number][] = [];
  const MIN_SPACING = 18; // Minimum distance between any two nodes

  return nodes.map((node, index) => {
    if (node.position) return node; // already has position

    const armIndex = index % SPIRAL_ARMS;
    
    // Key fix: minimum distance = 20 (was 5), so nothing sits on top of core
    // Importance only mildly affects distance — spread them across the full galaxy
    const maxDist = GALAXY_RADIUS * 0.85;
    const minDist = 20;
    
    // Spread nodes evenly along the arm, not clustered by importance
    const evenSpread = (index / Math.max(nodes.length - 1, 1));
    const baseDist = minDist + evenSpread * (maxDist - minDist);
    
    // Add some randomness but keep the even spread
    const distance = baseDist + (Math.random() - 0.5) * 15;

    // Try to find a position that doesn't overlap
    let position: [number, number, number];
    let attempts = 0;
    do {
      position = spiralPosition(
        Math.max(minDist, distance + (attempts > 0 ? (Math.random() - 0.5) * 20 : 0)),
        armIndex + (attempts > 5 ? Math.random() * 0.5 : 0),
        SPIRAL_ARMS,
        SPIRAL_TIGHTNESS,
        0.4
      );
      attempts++;
    } while (
      attempts < 20 &&
      placedPositions.some(p => {
        const dx = p[0] - position[0];
        const dy = p[1] - position[1];
        const dz = p[2] - position[2];
        return Math.sqrt(dx * dx + dy * dy + dz * dz) < MIN_SPACING;
      })
    );

    placedPositions.push(position);
    return { ...node, position };
  });
}
