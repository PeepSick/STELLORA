import type { StellarisNode, StellarisConnection, StellarisNodeType } from '@/types';

// Dynamically import all Markdown files from src/data
// NOTE: economy/finance is deliberately excluded here — it's a 1661-file
// reference corpus, not curated personal knowledge. Rendering all of it as
// spatial 3D orbs whites out the scene (thousands of overlapping additive
// glow sprites) and tanks performance. It's loaded separately, search-only,
// via loadFinanceSearchIndex() below.
// README.md placeholders (left in each empty data folder so a fresh clone
// still shows what goes where on GitHub) are explicitly excluded — they're
// instructions, not notes, and shouldn't become fake nodes.
const mdModules = import.meta.glob(
  [
    '/src/data/business/**/*.md',
    '/src/data/ops/**/*.md',
    '/src/data/product/**/*.md',
    '/src/data/sourcing/**/*.md',
    '!**/README.md',
  ],
  { query: '?raw', eager: true }
) as Record<string, any>;

const financeModules = import.meta.glob(
  ['/src/data/economy/finance/**/*.md', '!**/README.md'],
  { query: '?raw', eager: true }
) as Record<string, any>;

function buildNodesFromModules(
  modules: Record<string, any>
): { nodes: StellarisNode[]; connections: StellarisConnection[]; titleToId: Map<string, string> } {
  const nodesMap = new Map<string, StellarisNode>();
  const connections: StellarisConnection[] = [];
  const titleToId = new Map<string, string>();

  // First pass: create nodes
  Object.entries(modules).forEach(([filepath, moduleVal]) => {
    // Safely extract string content from Vite module
    let rawContent: string = typeof moduleVal === 'string'
      ? moduleVal
      : (moduleVal && typeof moduleVal === 'object' && 'default' in moduleVal)
        ? String(moduleVal.default)
        : String(moduleVal || '');

    // Strip leading YAML frontmatter (--- ... ---) — present on the scraped
    // economy/finance corpus, absent on hand-written business docs. Left in,
    // it leaks raw "title: ... tags: [...]" lines into descriptions/content.
    rawContent = rawContent.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').trim();

    // Extract filename without extension (e.g., "Business-Overview")
    const filename = filepath.split('/').pop()?.replace('.md', '') || 'Untitled';
    const folder = filepath.split('/').slice(-2, -1)[0] || 'general';

    // Extract title from `# Title` line or fallback to filename
    const titleMatch = rawContent.match(/^#\s+(.+)$/m);
    const title = (titleMatch ? titleMatch[1].trim() : filename.replace(/-/g, ' ')).replace(/_/g, ' ');

    const id = filename.toLowerCase().replace(/[^a-z0-9]/g, '-');
    titleToId.set(filename.toLowerCase(), id);
    titleToId.set(title.toLowerCase(), id);

    // Extract first paragraph for description preview
    const cleanContent = rawContent.replace(/^#\s+.+$/m, '').trim();
    const firstParagraph = cleanContent.split('\n\n')[0] || cleanContent;
    const description = firstParagraph.replace(/\[\[(.*?)\]\]/g, '$1').slice(0, 220);

    // Map folder to node type
    let type: StellarisNodeType = 'document';
    if (folder === 'business') type = 'project';
    else if (folder === 'ops') type = 'tool';
    else if (folder === 'product') type = 'memory';
    else if (folder === 'sourcing') type = 'collection';
    else if (folder === 'economy' || folder === 'finance') type = 'sector';

    // Node object
    const node: StellarisNode = {
      id,
      title,
      description,
      type,
      tags: [folder, type],
      importance: 3,
      connections: [],
      metadata: {
        rawMarkdown: rawContent,
        folder,
        filepath,
      },
    };

    nodesMap.set(id, node);
  });

  // Second pass: parse WikiLinks [[Target]] for connections
  nodesMap.forEach((node) => {
    const rawContent = (node.metadata?.rawMarkdown as string) || '';
    const matches = rawContent.matchAll(/\[\[(.*?)\]\]/g);

    for (const match of matches) {
      const targetName = match[1].trim();
      const targetId = titleToId.get(targetName.toLowerCase());

      if (targetId && targetId !== node.id) {
        if (!node.connections.includes(targetId)) {
          node.connections.push(targetId);
        }

        // Add connection edge
        connections.push({
          source: node.id,
          target: targetId,
          strength: 0.8,
          type: 'default',
        });
      }
    }
  });

  const nodes = Array.from(nodesMap.values());

  // Calculate importance based on incoming connection count
  nodes.forEach((node) => {
    const connCount = connections.filter(c => c.source === node.id || c.target === node.id).length;
    node.importance = Math.min(5, Math.max(1, Math.ceil(connCount * 1.2)));
  });

  return { nodes, connections, titleToId };
}

/** Curated, spatially-rendered knowledge nodes (business/ops/product/sourcing). */
export function loadRealNodesAndConnections(): { nodes: StellarisNode[]; connections: StellarisConnection[] } {
  const { nodes, connections } = buildNodesFromModules(mdModules);
  return { nodes, connections };
}

/**
 * Large reference corpus (economy/finance, 1661 files) — searchable via the
 * command palette but never passed through calculateNodePositions/setNodes,
 * so it's never rendered as a 3D orb. See note above mdModules.
 */
export function loadFinanceSearchIndex(): StellarisNode[] {
  const { nodes } = buildNodesFromModules(financeModules);
  return nodes;
}
