import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { resolve, join } from 'node:path';
import { existsSync } from 'node:fs';

import { loadAllNotes, loadFinanceNotes, loadGalleryFiles } from './utils/markdown.js';
import { registerNotesTools } from './tools/notes.js';
import { registerGalleryTools } from './tools/gallery.js';
import { registerFinanceTools } from './tools/finance.js';
import { registerGitTools } from './tools/git.js';
import { registerGalaxyTools } from './tools/galaxy.js';
import { registerNoteResources } from './resources/notes.js';
import { registerGalleryResources } from './resources/gallery.js';
import { registerFinanceResources } from './resources/finance.js';

export interface StelloraMcpOptions {
  dataDir?: string;
}

function findDataDir(): string {
  // Try environment variable first
  if (process.env['STELLORA_DATA_DIR']) {
    return process.env['STELLORA_DATA_DIR'];
  }

  // Try common locations relative to CWD
  const candidates = [
    join(process.cwd(), 'src', 'data'),
    join(process.cwd(), 'data'),
    resolve(process.cwd(), '..', 'src', 'data'),
    resolve(process.cwd(), '..', 'data'),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }

  // Default fallback
  return join(process.cwd(), 'src', 'data');
}

export async function createStelloraMcpServer(options: StelloraMcpOptions = {}) {
  const dataDir = options.dataDir ?? findDataDir();

  // Lazy-load data
  let notes = loadAllNotes(dataDir);
  let financeNotes = loadFinanceNotes(dataDir);
  let photos = loadGalleryFiles(dataDir);

  const getNotes = () => notes;
  const getFinanceNotes = () => financeNotes;
  const getPhotos = () => photos;

  // Create server
  const server = new McpServer({
    name: 'stellora',
    version: '1.0.0',
  });

  // Register tools
  registerNotesTools(server, getNotes);
  registerGalleryTools(server, getPhotos);
  registerFinanceTools(server, getFinanceNotes);
  registerGitTools(server);
  registerGalaxyTools(server, getNotes, getFinanceNotes, getPhotos);

  // Register resources
  registerNoteResources(server, getNotes);
  registerGalleryResources(server, getPhotos);
  registerFinanceResources(server, getFinanceNotes);

  // Connect via stdio
  const transport = new StdioServerTransport();
  await server.connect(transport);

  return { server, transport, dataDir };
}
