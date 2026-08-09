/* KARVION AI - Cloudflare Worker
   Proxies Workers AI text-to-image so the browser never sees your API token.
   Also proxies Google Translate's FREE TTS (no API key needed) for premium voice chat.
   Deploy:  wrangler deploy worker.js
   Then set your URL in chat.html CONFIG.CLOUDFLARE. */

const ACCOUNT_ID = '5d7102fe95032b5979b68bad328cc6e9';
const API_TOKEN = 'cfut_QpU6KpQPhCSP8zl2Li5HqteM2Q455LFu7w4z1zCu698cc93b';
const MODEL = '@cf/black-forest-labs/flux-1-schnell';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    if (request.method === 'POST' && new URL(request.url).pathname.endsWith('/ai-image')) {
      try {
        const { prompt } = await request.json();
        if (!prompt) return json({ error: 'Missing prompt' }, 400);

        const res = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/${MODEL}`,
          {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + API_TOKEN,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt, num_steps: 4 })
          }
        );

        const data = await res.json();
        if (!res.ok || !data.success) {
          return json({ error: (data.errors && data.errors[0] && data.errors[0].message) || 'Workers AI error: ' + res.status }, 502);
        }

        const image = data.result && (data.result.image || (data.result.data && data.result.data[0] && data.result.data[0].image));
        if (!image) return json({ error: 'No image in Workers AI response' }, 502);

        const mimeType = image.indexOf('/9j/') === 0 ? 'image/jpeg'
          : image.indexOf('iVBORw0KGgo') === 0 ? 'image/png'
          : image.indexOf('UklGR') === 0 ? 'image/webp'
          : 'image/jpeg';

        return json({ image, mimeType }, 200);
      } catch (e) {
        return json({ error: String(e && e.message || e) }, 500);
      }
    }

    if (request.method === 'POST' && new URL(request.url).pathname.endsWith('/tts')) {
      try {
        const { text, lang } = await request.json();
        if (!text) return json({ error: 'Missing text' }, 400);
        const hasHindi = /[\u0900-\u097F]/.test(text);
        const tl = (hasHindi || (lang && lang.startsWith('hi'))) ? 'hi' : 'en';
        const clean = String(text).replace(/[#*`>_]/g, '').replace(/\s+/g, ' ').trim();
        if (!clean) return json({ error: 'Empty text' }, 400);

        const chunks = [];
        let t = clean;
        while (t.length > 180) {
          let cut = t.lastIndexOf(' ', 180);
          if (cut < 60) cut = 180;
          chunks.push(t.slice(0, cut).trim());
          t = t.slice(cut).trim();
        }
        if (t) chunks.push(t);

        const audio = await googleTranslateTTSBase64(chunks, tl);
        return json({ audio, mimeType: 'audio/mpeg', voice: 'gt-' + tl }, 200);
      } catch (e) {
        return json({ error: String(e && e.message || e) }, 500);
      }
    }

    return json({ ok: true, service: 'karvion-ai-image-worker' }, 200);
  }
};

async function googleTranslateTTSBase64(chunks, tl) {
  const parts = [];
  for (const chunk of chunks) {
    const url = 'https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=' + tl + '&q=' + encodeURIComponent(chunk);
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) throw new Error('Google Translate TTS HTTP ' + res.status);
    parts.push(new Uint8Array(await res.arrayBuffer()));
    if (chunks.length > 1) await new Promise(r => setTimeout(r, 150));
  }
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) { out.set(p, off); off += p.length; }
  let binary = '';
  for (let i = 0; i < out.length; i++) binary += String.fromCharCode(out[i]);
  return btoa(binary);
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}
