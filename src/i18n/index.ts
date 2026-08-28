import { useStellarisStore } from '@/store';
import type { LanguageMode } from '@/types';
import { en, type TranslationKey } from './en';
import { tr } from './tr';

export type ResolvedLang = 'en' | 'tr';

/** Auto-detect: Turkish locale → tr, everything else → en (English is the base). */
export function resolveLanguage(mode: LanguageMode): ResolvedLang {
  if (mode === 'en') return 'en';
  if (mode === 'tr') return 'tr';
  const nav = typeof navigator !== 'undefined' ? navigator.language || '' : '';
  return nav.toLowerCase().startsWith('tr') ? 'tr' : 'en';
}

const dictionaries: Record<ResolvedLang, Partial<Record<TranslationKey, string>>> = {
  en,
  tr,
};

/** Translate a key to the currently selected language, falling back to English. */
export function translate(lang: ResolvedLang, key: TranslationKey): string {
  const dict = dictionaries[lang];
  return dict[key] ?? en[key] ?? key;
}

/**
 * React hook for components. Returns t(key), the resolved language, and a
 * setter that writes through to the feature store (persisted to localStorage).
 */
export function useTranslation() {
  const language = useStellarisStore((s) => s.features.language);
  const updateFeatures = useStellarisStore((s) => s.updateFeatures);
  const lang = resolveLanguage(language);

  const t = (key: TranslationKey): string => translate(lang, key);
  const setLanguage = (mode: LanguageMode) => updateFeatures({ language: mode });

  return { t, lang, setLanguage, language };
}
