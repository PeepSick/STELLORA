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
      throw new Error(`Claude API hatası (${res.status}): ${errText.slice(0, 300)}`);
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
  return 'Araç çağrıları çok uzun sürdü, cevap alınamadı.';
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
      throw new Error(`${providerLabel} API hatası (${res.status}): ${errText.slice(0, 300)}`);
    }
    const data = await res.json();
    const message = data.choices?.[0]?.message;
    if (!message) throw new Error(`${providerLabel}: beklenmeyen cevap biçimi`);

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
  return 'Araç çağrıları çok uzun sürdü, cevap alınamadı.';
}

// ── Vertex AI (proxied — never client-side credentials) ──
// A Vertex service account is a long-lived, broad-access GCP credential
// signed with an RSA private key — unlike a per-user API key, it must never
// exist in browser-reachable storage (localStorage, memory, devtools). So
// unlike every other provider here, "Vertex" in Settings does not hold a
// credential at all: the "API Key" field holds the URL of a small local
// proxy (see server/vertex-proxy.mjs) that holds the real credential and
// does the JWT-sign → OAuth2 → generateContent dance server-side. This
// function only ever talks to that proxy, and the proxy only ever proxies —
// tool EXECUTION still happens here in the browser, since tools need live
// 3D-scene state (selected node, gallery contents, etc.) the proxy can't see.
async function runVertex(
  settings: AiProviderSettings,
  systemPrompt: string,
  history: ChatTurn[],
  tools: ChatTool[],
  executeTool: ToolExecutor
): Promise<string> {
  const proxyUrl = settings.apiKey; // holds a URL for this provider, not a credential
  if (!/^https?:\/\//.test(proxyUrl)) {
    throw new Error('Vertex: "API Key" alanına proxy URL\'i gir (örn. http://localhost:8787/vertex-chat) — bkz. server/vertex-proxy.mjs.');
  }
  const location = settings.baseUrl || 'global';

  const contents: Array<{ role: string; parts: any[] }> = history.map((t) => ({
    role: t.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: t.content }],
  }));
  const geminiTools = tools.length
    ? [{ functionDeclarations: tools.map((t) => ({ name: t.name, description: t.description, parameters: t.parameters })) }]
    : undefined;

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const res = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: systemPrompt }] },
        ...(geminiTools ? { tools: geminiTools } : {}),
        model: settings.model,
        location,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Vertex proxy hatası (${res.status}): ${body.slice(0, 300)}`);
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
  return 'Araç çağrıları çok uzun sürdü, cevap alınamadı.';
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
    throw new Error('AI sağlayıcı ayarları eksik — SETTINGS sekmesinden API key, base URL ve model gir.');
  }
  if (provider === 'claude') {
    return runAnthropic(settings, systemPrompt, history, tools, executeTool);
  }
  if (provider === 'vertex') {
    return runVertex(settings, systemPrompt, history, tools, executeTool);
  }
  const labels: Record<Exclude<AiProviderId, 'claude' | 'vertex'>, string> = {
    openai: 'OpenAI',
    deepseek: 'DeepSeek',
    zai: 'Z.AI',
    custom: 'Custom',
  };
  return runOpenAiCompatible(settings, labels[provider as Exclude<AiProviderId, 'claude' | 'vertex'>], systemPrompt, history, tools, executeTool);
}
