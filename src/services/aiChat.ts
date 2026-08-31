import type { AiProviderId, AiProviderSettings } from '@/types';

export interface ChatTool {
  name: string;
  description: string;
  parameters: { type: 'object'; properties: Record<string, unknown>; required?: string[] };
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export type ToolExecutor = (name: string, args: Record<string, unknown>) => Promise<string>;

const MAX_TOOL_ROUNDS = 4;

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

async function runAnthropic(
  settings: AiProviderSettings,
  systemPrompt: string,
  history: ChatTurn[],
  tools: ChatTool[],
  executeTool: ToolExecutor
): Promise<string> {
  const messages: Array<{ role: 'user' | 'assistant'; content: unknown }> = history.map((t) => ({
    role: t.role,
    content: t.content,
  }));
  const anthropicTools = tools.map((t) => ({ name: t.name, description: t.description, input_schema: t.parameters }));

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const res = await fetch(settings.baseUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': settings.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: settings.model,
        max_tokens: 1024,
        system: systemPrompt,
        messages,
        ...(anthropicTools.length > 0 ? { tools: anthropicTools } : {}),
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      throw new Error(`Claude API error (${res.status}): ${errText.slice(0, 300)}`);
    }
    const data = await res.json();
    const content: Array<Record<string, any>> = data.content ?? [];

    if (data.stop_reason === 'tool_use') {
      messages.push({ role: 'assistant', content });
      const toolResults: Array<Record<string, unknown>> = [];
      for (const block of content) {
        if (block.type === 'tool_use') {
          const result = await executeTool(block.name, block.input ?? {});
          toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: result });
        }
      }
      messages.push({ role: 'user', content: toolResults });
      continue;
    }

    return content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();
  }
  return 'Tool calls took too long — no reply received.';
}

async function runOpenAiCompatible(
  settings: AiProviderSettings,
  providerLabel: string,
  systemPrompt: string,
  history: ChatTurn[],
  tools: ChatTool[],
  executeTool: ToolExecutor
): Promise<string> {
  const messages: Array<Record<string, unknown>> = [
    { role: 'system', content: systemPrompt },
    ...history.map((t) => ({ role: t.role, content: t.content })),
  ];
  const openAiTools = tools.map((t) => ({ type: 'function', function: { name: t.name, description: t.description, parameters: t.parameters } }));
  const url = `${stripTrailingSlash(settings.baseUrl)}/chat/completions`;

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.model,
        messages,
        ...(openAiTools.length > 0 ? { tools: openAiTools, tool_choice: 'auto' } : {}),
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      throw new Error(`${providerLabel} API error (${res.status}): ${errText.slice(0, 300)}`);
    }
    const data = await res.json();
    const message = data.choices?.[0]?.message;
    if (!message) throw new Error(`${providerLabel}: unexpected response format`);

    if (message.tool_calls && message.tool_calls.length > 0) {
      messages.push(message);
      for (const call of message.tool_calls) {
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(call.function.arguments || '{}');
        } catch {
          // malformed tool args — pass empty, let the tool executor report the problem
        }
        const result = await executeTool(call.function.name, args);
        messages.push({ role: 'tool', tool_call_id: call.id, content: result });
      }
      continue;
    }

    return (message.content ?? '').trim();
  }
  return 'Tool calls took too long — no reply received.';
}

// ── Gemini (Google AI Studio API key — client-side like every other provider) ──
// This is a normal per-user API key with its own quota, not a GCP service
// account — safe to keep in browser localStorage and send straight to Google,
// exactly like the Claude/OpenAI/DeepSeek/Z.AI paths above. No proxy needed.
async function runGemini(
  settings: AiProviderSettings,
  systemPrompt: string,
  history: ChatTurn[],
  tools: ChatTool[],
  executeTool: ToolExecutor
): Promise<string> {
  const base = stripTrailingSlash(settings.baseUrl || 'https://generativelanguage.googleapis.com');
  const url = `${base}/v1beta/models/${encodeURIComponent(settings.model)}:generateContent?key=${encodeURIComponent(settings.apiKey)}`;

  const contents: Array<{ role: string; parts: any[] }> = history.map((t) => ({
    role: t.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: t.content }],
  }));
  const geminiTools = tools.length
    ? [{ functionDeclarations: tools.map((t) => ({ name: t.name, description: t.description, parameters: t.parameters })) }]
    : undefined;

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: systemPrompt }] },
        ...(geminiTools ? { tools: geminiTools } : {}),
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Gemini API error (${res.status}): ${body.slice(0, 300)}`);
    }
    const data = await res.json();
    const parts: any[] = data.candidates?.[0]?.content?.parts ?? [];
    const functionCalls = parts.filter((p) => p.functionCall);

    if (functionCalls.length > 0) {
      contents.push({ role: 'model', parts });
      const responseParts = [];
      for (const p of functionCalls) {
        const result = await executeTool(p.functionCall.name, p.functionCall.args ?? {});
        responseParts.push({ functionResponse: { name: p.functionCall.name, response: { result } } });
      }
      contents.push({ role: 'user', parts: responseParts });
      continue;
    }

    return parts.filter((p) => p.text).map((p) => p.text).join('\n').trim();
  }
  return 'Tool calls took too long — no reply received.';
}

/**
 * Bring-your-own-key chat: every call goes straight from this browser to
 * whichever provider/base URL the user configured in Settings — no proxy,
 * no key ever touches anything but the provider itself.
 */
export async function runChat(
  provider: AiProviderId,
  settings: AiProviderSettings,
  systemPrompt: string,
  history: ChatTurn[],
  tools: ChatTool[],
  executeTool: ToolExecutor
): Promise<string> {
  if (!settings.apiKey || !settings.baseUrl || !settings.model) {
    throw new Error('AI provider settings missing — enter an API key, base URL, and model in the SETTINGS tab.');
  }
  if (provider === 'claude') {
    return runAnthropic(settings, systemPrompt, history, tools, executeTool);
  }
  if (provider === 'gemini') {
    return runGemini(settings, systemPrompt, history, tools, executeTool);
  }
  const labels: Record<Exclude<AiProviderId, 'claude' | 'gemini'>, string> = {
    openai: 'OpenAI',
    deepseek: 'DeepSeek',
    zai: 'Z.AI',
    custom: 'Custom',
  };
  return runOpenAiCompatible(settings, labels[provider as Exclude<AiProviderId, 'claude' | 'gemini'>], systemPrompt, history, tools, executeTool);
}
