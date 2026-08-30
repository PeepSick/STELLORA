import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, basename, extname } from 'node:path';

export interface ParsedNote {
  id: string;
  title: string;
  description: string;
  content: string;
  rawMarkdown: string;
  folder: string;
  filepath: string;
  tags: string[];
  wikiLinks: string[];
}

export interface GalleryPhoto {
  filename: string;
  filepath: string;
  imageUrl: string;
}

export function stripFrontmatter(raw: string): string {
  return raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').trim();
}

export function extractTitle(raw: string, fallback: string): string {
  const match = raw.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : fallback.replace(/-/g, ' ').replace(/_/g, ' ');
}

export function extractDescription(raw: string): string {
  const clean = raw.replace(/^#\s+.+$/m, '').trim();
  const firstParagraph = clean.split('\n\n')[0] || clean;
  return firstParagraph.replace(/\[\[(.*?)\]\]/g, '$1').slice(0, 220);
}

export function extractWikiLinks(raw: string): string[] {
  const matches = [...raw.matchAll(/\[\[(.*?)\]\]/g)];
  return matches.map((m) => m[1].trim());
}

export function scanDirectory(dir: string, ext: string): string[] {
  const results: string[] = [];
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      // README.md is the "drop your files here" placeholder left in every
      // empty data folder — it's instructions, not a note, and shouldn't
      // show up as one.
      if (entry.toLowerCase() === 'readme.md') continue;
      const full = join(dir, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        results.push(...scanDirectory(full, ext));
      } else if (extname(entry) === ext) {
        results.push(full);
      }
    }
  } catch {
    // directory doesn't exist
  }
  return results;
}

export function loadNote(filepath: string, baseDir: string): ParsedNote {
  const raw = readFileSync(filepath, 'utf-8');
  const content = stripFrontmatter(raw);
  const filename = basename(filepath, '.md');
  const rel = relative(baseDir, filepath);
  const folder = rel.split(/[\\/]/)[0] ?? 'general';

  const title = extractTitle(content, filename);
  const description = extractDescription(content);
  const wikiLinks = extractWikiLinks(content);

  const id = filename.toLowerCase().replace(/[^a-z0-9]/g, '-');

  return {
    id,
    title,
    description,
    content,
    rawMarkdown: raw,
    folder,
    filepath,
    tags: [folder],
    wikiLinks,
  };
}

export function loadAllNotes(dataDir: string): ParsedNote[] {
  const folders = ['business', 'ops', 'product', 'sourcing'];
  const notes: ParsedNote[] = [];

  for (const folder of folders) {
    const folderPath = join(dataDir, folder);
    const files = scanDirectory(folderPath, '.md');
    for (const file of files) {
      notes.push(loadNote(file, dataDir));
    }
  }

  return notes;
}

export function loadFinanceNotes(dataDir: string): ParsedNote[] {
  const financeDir = join(dataDir, 'economy', 'finance');
  const files = scanDirectory(financeDir, '.md');
  return files.map((f) => loadNote(f, dataDir));
}

export function loadGalleryFiles(dataDir: string): GalleryPhoto[] {
  const galleryDir = join(dataDir, 'gallery');
  const files = scanDirectory(galleryDir, '.jpg')
    .concat(scanDirectory(galleryDir, '.jpeg'))
    .concat(scanDirectory(galleryDir, '.png'));

  return files.map((filepath) => ({
    filename: basename(filepath),
    filepath,
    imageUrl: filepath,
  }));
}

export function fuzzyMatch(query: string, text: string): boolean {
  const lower = query.toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);
  const textLower = text.toLowerCase();
  return words.every((w) => textLower.includes(w));
}
