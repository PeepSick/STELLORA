import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { loadAllNotes, loadFinanceNotes, loadGalleryFiles, fuzzyMatch } from '../src/utils/markdown.js';
import { join } from 'node:path';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';

const REPO_DATA_DIR = join(import.meta.dirname, '..', '..', '..', 'src', 'data');

describe('markdown utils — against the real (empty-by-default) repo data', () => {
  // Stellora ships with no sample notes/photos/finance articles — every user
  // starts from a clean template and drops their own files in. These loaders
  // must handle "folder only has a README.md placeholder" gracefully.

  it('loadAllNotes returns no notes when business/ops/product/sourcing are empty', () => {
    const notes = loadAllNotes(REPO_DATA_DIR);
    expect(notes.length).toBe(0);
  });

  it('loadFinanceNotes returns no notes when economy/finance is empty', () => {
    const notes = loadFinanceNotes(REPO_DATA_DIR);
    expect(notes.length).toBe(0);
  });

  it('loadGalleryFiles returns no photos when gallery is empty', () => {
    const photos = loadGalleryFiles(REPO_DATA_DIR);
    expect(photos.length).toBe(0);
  });

  it('fuzzyMatch works', () => {
    expect(fuzzyMatch('hello world', 'say hello world today')).toBe(true);
    expect(fuzzyMatch('hello', 'goodbye')).toBe(false);
  });
});

describe('markdown utils — parsing logic, against synthetic fixtures', () => {
  let fixtureDir: string;

  beforeAll(() => {
    fixtureDir = mkdtempSync(join(tmpdir(), 'stellora-mcp-test-'));
    mkdirSync(join(fixtureDir, 'business'), { recursive: true });
    mkdirSync(join(fixtureDir, 'ops'), { recursive: true });
    mkdirSync(join(fixtureDir, 'economy', 'finance'), { recursive: true });
    mkdirSync(join(fixtureDir, 'gallery'), { recursive: true });

    writeFileSync(
      join(fixtureDir, 'business', 'README.md'),
      '# Business notes\n\nDrop your own markdown notes here.\n'
    );
    writeFileSync(
      join(fixtureDir, 'business', 'Growth-Plan.md'),
      '---\ntitle: ignored\n---\n\n# Growth Plan\n\nExpand into [[New-Market]] next quarter.\n'
    );
    writeFileSync(join(fixtureDir, 'ops', 'Runbook.md'), '# Runbook\n\nRestart the thing.\n');
    writeFileSync(
      join(fixtureDir, 'economy', 'finance', 'README.md'),
      '# Finance corpus\n\nDrop reference articles here.\n'
    );
    writeFileSync(join(fixtureDir, 'economy', 'finance', 'Sample-Event.md'), '# Sample Event\n\nSomething happened.\n');
    writeFileSync(join(fixtureDir, 'gallery', 'README.md'), '# Photo gallery\n\nDrop photos here.\n');
    writeFileSync(join(fixtureDir, 'gallery', 'photo1.jpg'), 'not a real jpg, just testing file discovery');
  });

  afterAll(() => {
    rmSync(fixtureDir, { recursive: true, force: true });
  });

  it('loadAllNotes finds real notes but skips README.md placeholders', () => {
    const notes = loadAllNotes(fixtureDir);
    expect(notes.length).toBe(2);
    const ids = notes.map((n) => n.id);
    expect(ids).toContain('growth-plan');
    expect(ids).toContain('runbook');
    expect(ids.some((id) => id.includes('readme'))).toBe(false);
  });

  it('each note has required fields', () => {
    const notes = loadAllNotes(fixtureDir);
    for (const note of notes) {
      expect(note.id).toBeTruthy();
      expect(note.title).toBeTruthy();
      expect(note.content).toBeTruthy();
      expect(note.folder).toBeTruthy();
      expect(Array.isArray(note.wikiLinks)).toBe(true);
    }
  });

  it('loadNote strips frontmatter and extracts title + wikilinks', () => {
    const notes = loadAllNotes(fixtureDir);
    const growthPlan = notes.find((n) => n.id === 'growth-plan')!;
    expect(growthPlan.title).toBe('Growth Plan');
    expect(growthPlan.content).not.toContain('title: ignored');
    expect(growthPlan.wikiLinks).toContain('New-Market');
  });

  it('loadFinanceNotes finds real articles but skips README.md', () => {
    const notes = loadFinanceNotes(fixtureDir);
    expect(notes.length).toBe(1);
    expect(notes[0].id).toBe('sample-event');
  });

  it('loadGalleryFiles finds real photos but README.md never matches the image extensions', () => {
    const photos = loadGalleryFiles(fixtureDir);
    expect(photos.length).toBe(1);
    expect(photos[0].filename).toBe('photo1.jpg');
    expect(photos[0].filepath).toBeTruthy();
  });
});
