import { describe, it, expect, beforeAll } from 'vitest';
import { loadAllNotes, loadFinanceNotes, loadGalleryFiles, fuzzyMatch } from '../src/utils/markdown.js';
import { join } from 'node:path';

const DATA_DIR = join(import.meta.dirname, '..', '..', '..', 'src', 'data');

describe('markdown utils', () => {
  it('loadAllNotes loads notes from business/ops/product/sourcing', () => {
    const notes = loadAllNotes(DATA_DIR);
    expect(notes.length).toBeGreaterThan(0);

    const folders = new Set(notes.map((n) => n.folder));
    expect(folders.has('business')).toBe(true);
    expect(folders.has('ops')).toBe(true);
  });

  it('each note has required fields', () => {
    const notes = loadAllNotes(DATA_DIR);
    for (const note of notes) {
      expect(note.id).toBeTruthy();
      expect(note.title).toBeTruthy();
      expect(note.content).toBeTruthy();
      expect(note.folder).toBeTruthy();
      expect(Array.isArray(note.wikiLinks)).toBe(true);
    }
  });

  it('loadFinanceNotes loads finance corpus', () => {
    const notes = loadFinanceNotes(DATA_DIR);
    expect(notes.length).toBeGreaterThan(100);
  });

  it('loadGalleryFiles loads photos', () => {
    const photos = loadGalleryFiles(DATA_DIR);
    expect(photos.length).toBeGreaterThan(0);
    for (const p of photos) {
      expect(p.filename).toBeTruthy();
      expect(p.filepath).toBeTruthy();
    }
  });

  it('fuzzyMatch works', () => {
    expect(fuzzyMatch('hello world', 'say hello world today')).toBe(true);
    expect(fuzzyMatch('hello', 'goodbye')).toBe(false);
  });
});
