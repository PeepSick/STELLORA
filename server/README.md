# Vertex AI proxy

Stellora's AI chat is bring-your-own-key for Claude, OpenAI, DeepSeek, Z.AI,
and Custom — those run entirely client-side, which is safe because a leaked
key is the visitor's own key. A **Vertex AI service account** is different:
it's a long-lived credential with broad GCP project access, signed with an
RSA private key. That must never be pasted into a browser (localStorage,
memory, devtools are all reachable by anyone visiting the page).

So Vertex is the one provider that goes through a tiny local proxy instead.
The proxy holds the credential; the browser only ever talks to the proxy.

```
Stellora (browser) → this proxy → Vertex AI (Google)
```

Tool **execution** (gallery search, selecting/focusing a node, etc.) still
happens in the browser — the proxy only forwards the raw model call, since
it has no access to what's currently in your 3D scene.

## Setup

1. Get a Vertex-enabled service account JSON and put it **outside this repo**
   (or anywhere covered by `.gitignore` — never inside `server/`).
2. Set environment variables and run:

   ```bash
   GOOGLE_APPLICATION_CREDENTIALS=/path/to/your-service-account.json \
   VERTEX_PROJECT_ID=your-gcp-project-id \
   node server/vertex-proxy.mjs
   ```

   (or `npm run vertex-proxy` with the same env vars set first)

3. In the app's **Settings → AI Provider**, choose **Vertex**, and set:
   - **Proxy URL**: `http://localhost:8787/vertex-chat` (not a credential — just where this server is listening)
   - **Location**: `global` or a specific Vertex region (e.g. `us-central1`)
   - **Model**: e.g. `gemini-2.5-flash`

## Origin allowlist

By default the proxy only accepts requests from `localhost:5173-5176`. Set
`ALLOWED_ORIGINS` (comma-separated) if you're serving the app from somewhere
else — otherwise the proxy could be used as an open relay by any site.
