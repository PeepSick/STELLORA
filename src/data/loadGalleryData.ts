import { parse as parseExif } from 'exifr';
import type { StellarisNode, StellarisConnection, StellorPhotoMetadata, StellorMemoryMetadata } from '@/types';
import { useStellarisStore } from '@/store';
import { resolveLanguage } from '@/i18n';

// Actual gallery photos, served as URLs by Vite (not inlined/parsed as text)
const photoModules = import.meta.glob('/src/data/gallery/*.{jpg,jpeg,png}', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/**
 * Seed defaults only — a one-time hand-written pass for the first 9 photos.
 * The owner can rewrite scene/tags per photo in the panel (Faz 2: no AI
 * pipeline, the person who lived the memory writes it); user edits are
 * stored in localStorage and take priority over these, see
 * useStellorPhotoNote. New photos with no entry here start blank, editable.
 * No automated face/identity recognition — person counts only, no identity
 * claims (see PROJELER.md).
 */
// Optional per-photo overrides — leave empty or add entries for specific files.
// Any photo without an entry here gets dynamic defaults based on filename/time.
const PHOTO_NOTES: Record<string, { scene: string; tags: string[]; peopleObserved: number }> = {};

// Optional per-day summary overrides — empty by default.
// Any day without an entry gets a dynamic summary from the photo scene data.
const DAY_SUMMARIES: Record<string, string> = {};

/** Parses the Android camera filename convention YYYYMMDD_HHMMSS as a fallback when EXIF has no date. */
function dateFromFilename(filename: string): string | null {
  const m = filename.match(/^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/);
  if (!m) return null;
  const [, y, mo, d, h, mi, s] = m;
  return `${y}-${mo}-${d}T${h}:${mi}:${s}`;
}

function dayKeyFromIso(iso: string): string {
  return iso.slice(0, 10);
}

async function buildPhotoMeta(filepath: string, url: string): Promise<{ dayKey: string; meta: StellorPhotoMetadata }> {
  const filename = filepath.split('/').pop() || 'photo.jpg';
  const notes = PHOTO_NOTES[filename] ?? {
    scene: `Fotoğraf — ${filename}`,
    tags: [],
    peopleObserved: 0,
  };

  let dateTaken: string | null = null;
  let camera: string | null = null;
  let lens: string | null = null;
  let iso: number | null = null;
  let focalLength: number | null = null;
  let fNumber: number | null = null;
  let resolution: { width: number; height: number } | null = null;
  let gps: { lat: number; lon: number } | null = null;

  try {
    const exif = await parseExif(url, { tiff: true, exif: true, gps: true });
    if (exif?.DateTimeOriginal instanceof Date) {
      dateTaken = exif.DateTimeOriginal.toISOString();
    }
    if (exif?.Make || exif?.Model) {
      camera = [exif.Make, exif.Model].filter(Boolean).join(' ');
    }
    if (exif?.LensModel) lens = String(exif.LensModel);
    if (typeof exif?.ISO === 'number') iso = exif.ISO;
    if (typeof exif?.FocalLength === 'number') focalLength = exif.FocalLength;
    if (typeof exif?.FNumber === 'number') fNumber = exif.FNumber;
    const width = exif?.ExifImageWidth ?? exif?.PixelXDimension;
    const height = exif?.ExifImageHeight ?? exif?.PixelYDimension;
    if (typeof width === 'number' && typeof height === 'number') {
      resolution = { width, height };
    }
    if (typeof exif?.latitude === 'number' && typeof exif?.longitude === 'number') {
      gps = { lat: exif.latitude, lon: exif.longitude };
    }
  } catch {
    // No EXIF, or stripped by a messaging app — fall back to filename date below.
  }

  const fallbackDate = dateFromFilename(filename);
  const effectiveDate = dateTaken ?? fallbackDate;
  const dayKey = effectiveDate ? dayKeyFromIso(effectiveDate) : 'unknown';

  const meta: StellorPhotoMetadata = {
    imageUrl: url,
    filename,
    dateTaken,
    camera,
    lens,
    iso,
    focalLength,
    fNumber,
    resolution,
    gps,
    scene: notes.scene,
    tags: notes.tags,
    peopleObserved: notes.peopleObserved,
  };

  return { dayKey, meta };
}

/**
 * Loads the Stellora gallery as one node PER DAY (not per photo) — each node
 * carries every photo taken that day in metadata.photos[]. This is the
 * Phase 1 fix: a 30-photo day is one node with a browsable gallery inside,
 * not 30 separate 3D orbs. Real EXIF via exifr + a one-time hand-written
 * scene/person-count pass. No face/identity recognition (see PROJELER.md).
 */
export async function loadGalleryNodesAndConnections(): Promise<{
  nodes: StellarisNode[];
  connections: StellarisConnection[];
}> {
  const entries = Object.entries(photoModules);
  const results = await Promise.all(entries.map(([filepath, url]) => buildPhotoMeta(filepath, url)));

  const byDay = new Map<string, StellorPhotoMetadata[]>();
  results.forEach(({ dayKey, meta }) => {
    if (!byDay.has(dayKey)) byDay.set(dayKey, []);
    byDay.get(dayKey)!.push(meta);
  });

  const nodes: StellarisNode[] = [];
  byDay.forEach((photos, dayKey) => {
    photos.sort((a, b) => (a.dateTaken ?? '').localeCompare(b.dateTaken ?? ''));

    // Loading happens once (outside React), so this reads whatever language is
    // set at that moment rather than reacting live — switching language after
    // the gallery has already loaded won't retroactively reformat these labels
    // (reload the page after switching to pick up the new locale here).
    const lang = resolveLanguage(useStellarisStore.getState().features.language);
    const dateLocale = lang === 'tr' ? 'tr-TR' : 'en-US';
    const dateLabel = dayKey === 'unknown'
      ? (lang === 'tr' ? 'Bilinmeyen tarih' : 'Unknown date')
      : new Date(dayKey).toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' });

    const peopleObserved = photos.reduce((max, p) => Math.max(max, p.peopleObserved), 0);
    const daySummary = DAY_SUMMARIES[dayKey]
      ?? (lang === 'tr' ? `${dateLabel} — ${photos.length} fotoğraf çekildi.` : `${dateLabel} — ${photos.length} photo${photos.length === 1 ? '' : 's'} taken.`);

    const metadata: StellorMemoryMetadata = {
      dayKey,
      dateLabel,
      photos,
      peopleObserved,
      daySummary,
    };

    nodes.push({
      id: 'memory-' + dayKey,
      title: dateLabel,
      description: daySummary,
      type: 'event',
      tags: ['memory', dayKey],
      importance: Math.min(5, 2 + photos.length),
      connections: [],
      metadata: metadata as unknown as Record<string, unknown>,
    });
  });

  return { nodes, connections: [] };
}
