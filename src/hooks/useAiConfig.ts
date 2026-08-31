import { useStellarisStore } from '@/store';
import type { AiProviderId } from '@/types';

export const AI_PROVIDER_LABELS: Record<AiProviderId, string> = {
  claude: 'Claude (Anthropic)',
  openai: 'OpenAI',
  deepseek: 'DeepSeek',
  zai: 'Z.AI (GLM)',
  gemini: 'Gemini (Google)',
  custom: 'Custom (OpenAI-compatible)',
};

/**
 * Thin selector over the shared store — Settings and Chat both read/write the
 * same state this way, so a key saved in Settings is immediately usable in Chat.
 */
export function useAiConfig() {
  const { aiActiveProvider: activeProvider, aiProviders: providers, setAiActiveProvider: setActiveProvider, updateAiProviderSettings: updateProviderSettings } = useStellarisStore();

  const activeSettings = providers[activeProvider];
  const isConfigured = Boolean(activeSettings.apiKey && activeSettings.baseUrl && activeSettings.model);

  return {
    activeProvider,
    activeSettings,
    isConfigured,
    providers,
    setActiveProvider,
    updateProviderSettings,
  };
}
