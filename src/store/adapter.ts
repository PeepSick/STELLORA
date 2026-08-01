import { StellarisNode, StellarisConnection } from '@/types';

export interface DataAdapterConfig<T> {
  mapNode: (item: T) => StellarisNode;
  buildConnections?: (nodes: StellarisNode[], originalData: T[]) => StellarisConnection[];
}

export function createAdapter<T>(config: DataAdapterConfig<T>) {
  return function processData(data: T[]): { nodes: StellarisNode[], connections: StellarisConnection[] } {
    const nodes = data.map(config.mapNode);
    let connections: StellarisConnection[] = [];

    if (config.buildConnections) {
      connections = config.buildConnections(nodes, data);
    } else {
      // Default connection builder: connect nodes with matching tags
      connections = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeA = nodes[i];
          const nodeB = nodes[j];
          
          if (!nodeA.tags || !nodeB.tags) continue;
          
          const sharedTags = nodeA.tags.filter(tag => nodeB.tags?.includes(tag));
          
          if (sharedTags.length > 0) {
            connections.push({
              source: nodeA.id,
              target: nodeB.id,
              strength: Math.min(sharedTags.length * 0.2, 1),
              type: 'default'
            });
          }
        }
      }
    }

    return { nodes, connections };
  };
}
