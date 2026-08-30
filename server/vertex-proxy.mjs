#!/usr/bin/env node
/**
 * Vertex AI proxy — the ONLY place a Vertex service-account credential is
 * allowed to exist for Stellora. It never reaches the browser.
 *
 * Why this exists: every other AI provider in Stellora (Claude, OpenAI,
 * DeepSeek, Z.AI, Custom) is bring-your-own-key and stays 100% client-side —
 * that's safe because a leaked API key is the visitor's own key, their own
 * risk, and usually revocable/rate-limited per-key. A Vertex service account
 * is different: it's a long-lived credential with broad GCP project access,
 * signed with an RSA private key. Pasting that into a browser (localStorage,
 * memory, devtools) would hand out a real Google Cloud credential to anyone
 * who opens devtools on a public demo. So Vertex is proxied through this
 * tiny server instead: the browser sends {contents, systemInstruction,
 * tools, model}, this process signs the JWT, exchanges it for an OAuth2
 * token, calls Vertex's generateContent, and forwards back the raw
 * candidate response — untouched. Tool EXECUTION still happens in the
 * browser (gallery search, node selection, etc. all need live 3D-scene
 * state this server doesn't have) — this process only ever proxies the
 * model call itself.
 *
 * Setup:
 *   1. Put your service-account JSON somewhere OUTSIDE this repo (or in a
 *      gitignored path) and set GOOGLE_APPLICATION_CREDENTIALS to that path.
 *   2. Set VERTEX_PROJECT_ID and (optionally) VERTEX_LOCATION (default "global").
 *   3. node server/vertex-proxy.mjs   (default port 8787, override with PORT)
 *   4. In the app's Settings, set the Vertex provider's "API Key" field to
 *      this server's URL, e.g. http://localhost:8787/vertex-chat — that
 *      field holds a URL now, never a credential.
 *
 * This file intentionally has zero dependencies beyond Node's stdlib.
 */

import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import crypto from 'node:crypto';

const PORT = Number(process.env.PORT || 8787);
const SA_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const PROJECT_ID = process.env.VERTEX_PROJECT_ID;
const DEFAULT_LOCATION = process.env.VERTEX_LOCATION || 'global';
// Comma-separated allowlist so a public demo can't be used as an open relay
// from arbitrary origins. Defaults to localhost only.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

if (!SA_PATH) {
  console.error('GOOGLE_APPLICATION_CREDENTIALS is not set — point it at your service-account JSON file path.');
  process.exit(1);
}
if (!PROJECT_ID) {
  console.error('VERTEX_PROJECT_ID is not set.');
  process.exit(1);
}

const sa = JSON.parse(readFileSync(SA_PATH, 'utf8'));
if (!sa.client_email || !sa.private_key) {
  console.error('Service account JSON is missing client_email/private_key.');
  process.exit(1);
}

function base64url(input) {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

let tokenCache = null; // { accessToken, expiresAt }

async function getAccessToken() {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt - 60_000 > now) return tokenCache.accessToken;

  const nowSec = Math.floor(now / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    iat: nowSec,
    exp: nowSec + 3600,
  };
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claim))}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  const signature = signer.sign(sa.private_key).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const jwt = `${unsigned}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }).toString(),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Token exchange HTTP ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = await res.json();
  if (!data.access_token) throw new Error('No access_token in token response');
  tokenCache = { accessToken: data.access_token, expiresAt: now + (data.expires_in || 3600) * 1000 };
  return data.access_token;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function setCors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
}

const server = createServer(async (req, res) => {
  setCors(req, res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== 'POST' || req.url !== '/vertex-chat') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found. POST /vertex-chat' }));
    return;
  }

  try {
    const raw = await readBody(req);
    const { contents, systemInstruction, tools, model, location } = JSON.parse(raw || '{}');
    if (!Array.isArray(contents) || !model) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Body must include { contents: [...], model: "..." }' }));
      return;
    }

    const loc = location || DEFAULT_LOCATION;
    const host = loc === 'global' ? 'aiplatform.googleapis.com' : `${loc}-aiplatform.googleapis.com`;
    const url = `https://${host}/v1/projects/${PROJECT_ID}/locations/${loc}/publishers/google/models/${model}:generateContent`;

    const token = await getAccessToken();
    const vertexRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        contents,
        ...(systemInstruction ? { systemInstruction } : {}),
        ...(tools ? { tools } : {}),
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      }),
    });
    const data = await vertexRes.json();
    res.writeHead(vertexRes.status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: String(err?.message || err) }));
  }
});

server.listen(PORT, () => {
  console.log(`Vertex proxy listening on http://localhost:${PORT}/vertex-chat`);
  console.log(`  service account: ${sa.client_email}`);
  console.log(`  project: ${PROJECT_ID}, default location: ${DEFAULT_LOCATION}`);
  console.log(`  allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
});
