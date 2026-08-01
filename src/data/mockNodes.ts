import { loadRealNodesAndConnections, loadFinanceSearchIndex } from './loadRealData';
import type { StellarisNode, StellarisConnection } from '@/types';

// Load real Markdown knowledge files from data/ directory
const { nodes: REAL_NODES, connections: REAL_CONNECTIONS } = loadRealNodesAndConnections();

export const mockNodes: StellarisNode[] = REAL_NODES;
export const mockConnections: StellarisConnection[] = REAL_CONNECTIONS;

// economy/finance corpus — searchable only, never rendered as 3D orbs (see loadRealData.ts)
export const financeSearchIndex: StellarisNode[] = loadFinanceSearchIndex();
