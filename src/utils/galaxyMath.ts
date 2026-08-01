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

/** Generate star positions for the background starfield */
export function generateStarPositions(
  count: number,
  arms: number = SPIRAL_ARMS,
  radius: number = GALAXY_RADIUS,
  tightness: number = SPIRAL_TIGHTNESS
): { positions: Float32Array; colors: Float32Array; scales: Float32Array; randomness: Float32Array } {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const randomness = new Float32Array(count * 3);

  const insideColor = { r: 1.0, g: 0.82, b: 0.49 };   // #FFD27D gold
  const midColor = { r: 0.40, g: 0.84, b: 1.0 };       // #65D7FF cyan
  const outsideColor = { r: 0.66, g: 0.55, b: 1.0 };   // #A88BFF purple

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const r = Math.pow(Math.random(), 1.5) * radius; // concentrate near center
    const armIndex = i % arms;
    const branchAngle = (armIndex / arms) * Math.PI * 2;
    const spinAngle = r * tightness;

    positions[i3] = Math.cos(branchAngle + spinAngle) * r;
    positions[i3 + 1] = 0;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * r;

    // Randomness for dispersion
    const rPow = 2.5;
    const rx = Math.pow(Math.random(), rPow) * (Math.random() < 0.5 ? 1 : -1) * r * 0.35;
    const ry = Math.pow(Math.random(), rPow) * (Math.random() < 0.5 ? 1 : -1) * r * 0.08;
    const rz = Math.pow(Math.random(), rPow) * (Math.random() < 0.5 ? 1 : -1) * r * 0.35;

    randomness[i3] = rx;
    randomness[i3 + 1] = ry;
    randomness[i3 + 2] = rz;

    // Color based on distance
    const t = r / radius;
    let cr: number, cg: number, cb: number;
    if (t < 0.4) {
      const lt = t / 0.4;
      cr = insideColor.r + (midColor.r - insideColor.r) * lt;
      cg = insideColor.g + (midColor.g - insideColor.g) * lt;
      cb = insideColor.b + (midColor.b - insideColor.b) * lt;
    } else {
      const lt = (t - 0.4) / 0.6;
      cr = midColor.r + (outsideColor.r - midColor.r) * lt;
      cg = midColor.g + (outsideColor.g - midColor.g) * lt;
      cb = midColor.b + (outsideColor.b - midColor.b) * lt;
    }
    colors[i3] = cr;
    colors[i3 + 1] = cg;
    colors[i3 + 2] = cb;

    // Scale
    scales[i] = Math.random() * 1.5 + 0.3;
  }

  return { positions, colors, scales, randomness };
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

/** Generate a bezier curve between two points with perpendicular offset */
export function bezierCurvePoints(
  start: [number, number, number],
  end: [number, number, number],
  curvature: number = 0.3,
  segments: number = 50
): Float32Array {
  // Midpoint
  const mid: [number, number, number] = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
    (start[2] + end[2]) / 2,
  ];

  // Perpendicular offset for curve
  const dx = end[0] - start[0];
  const dz = end[2] - start[2];
  const len = Math.sqrt(dx * dx + dz * dz) || 1;
  const offset = len * curvature;

  const cp1: [number, number, number] = [
    mid[0] + (-dz / len) * offset,
    mid[1] + offset * 0.5,
    mid[2] + (dx / len) * offset,
  ];

  const positions = new Float32Array(segments * 3);
  for (let i = 0; i < segments; i++) {
    const t = i / (segments - 1);
    const t1 = 1 - t;
    // Quadratic bezier (start, cp1, end)
    positions[i * 3] = t1 * t1 * start[0] + 2 * t1 * t * cp1[0] + t * t * end[0];
    positions[i * 3 + 1] = t1 * t1 * start[1] + 2 * t1 * t * cp1[1] + t * t * end[1];
    positions[i * 3 + 2] = t1 * t1 * start[2] + 2 * t1 * t * cp1[2] + t * t * end[2];
  }

  return positions;
}

/** Gaussian random number (Box-Muller transform) */
export function gaussianRandom(mean: number = 0, stdDev: number = 1): number {
  const u1 = Math.random();
  const u2 = Math.random();
  return mean + stdDev * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}
