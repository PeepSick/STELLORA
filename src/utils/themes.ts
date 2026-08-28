import type { ThemePreset } from '@/types';

// Theme presets override the CSS custom properties declared in index.css
// (@theme block). We set them at runtime on :root so switching themes needs
// no rebuild. Canvas colours (Three.js) read the same variables where possible.
export interface ThemeVariables {
  bg: string;
  primary: string;
  accent: string;
  gold: string;
  glow: string;
  glass: string;
  border: string;
  text: string;
  muted: string;
}

export const THEME_PRESETS: Record<ThemePreset, ThemeVariables> = {
  dark: {
    bg: '#070811',
    primary: '#A88BFF',
    accent: '#65D7FF',
    gold: '#FFD27D',
    glow: '#9D7BFF',
    glass: 'rgba(9, 10, 22, 0.82)',
    border: 'rgba(255,255,255,0.12)',
    text: '#E2E8F0',
    muted: '#64748B',
  },
  light: {
    bg: '#EEF1F8',
    primary: '#6D4ED6',
    accent: '#0EA5C4',
    gold: '#B8860B',
    glow: '#7C5CFC',
    glass: 'rgba(255,255,255,0.72)',
    border: 'rgba(15,23,42,0.12)',
    text: '#0F172A',
    muted: '#64748B',
  },
  aurora: {
    bg: '#03060c',
    primary: '#7CFFB2',
    accent: '#5BC8FF',
    gold: '#FFE08A',
    glow: '#54F0C8',
    glass: 'rgba(6, 14, 20, 0.82)',
    border: 'rgba(124,255,178,0.18)',
    text: '#E6FBF2',
    muted: '#5E8C7E',
  },
  custom: {
    bg: '#0a0a12',
    primary: '#FF7AD9',
    accent: '#7AD7FF',
    gold: '#FFD27D',
    glow: '#FF7AD9',
    glass: 'rgba(16, 14, 28, 0.84)',
    border: 'rgba(255,255,255,0.14)',
    text: '#F3E8FF',
    muted: '#8B7BA8',
  },
};

const VAR_MAP: Record<keyof ThemeVariables, string> = {
  bg: '--color-stellaris-bg',
  primary: '--color-stellaris-primary',
  accent: '--color-stellaris-accent',
  gold: '--color-stellaris-gold',
  glow: '--color-stellaris-glow',
  glass: '--color-stellaris-glass',
  border: '--color-stellaris-border',
  text: '--color-stellaris-text',
  muted: '--color-stellaris-muted',
};

/** Apply a theme preset by writing CSS variables onto :root. */
export function applyTheme(preset: ThemePreset): void {
  if (typeof document === 'undefined') return;
  const vars = THEME_PRESETS[preset];
  const root = document.documentElement;
  (Object.keys(VAR_MAP) as (keyof ThemeVariables)[]).forEach((key) => {
    root.style.setProperty(VAR_MAP[key], vars[key]);
  });
  root.setAttribute('data-theme', preset);
}
