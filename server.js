'use strict';
/* =====================================================================
 * Arbor for Law + Audrey — server.
 *
 * One repo serves two surfaces:
 *  - Consumer face: Audrey (paused build; brand fixes only) — /
 *  - Law software: Arbor for Law (succession doc automation) — /for-attorneys
 *
 * Backend:
 *  - serves the static frontend (public/)
 *  - GET /healthz -> liveness for Render
 *  - POST /api/counsel        -> configured provider (mock or real LLM)
 *  - GET  /api/config         -> tells the UI which provider is active,
 *                                so it can label itself honestly
 *  - POST /api/demo-request   -> Arbor for Law demo request (stored as
 *                                JSONL on disk; persists across restarts)
 *  - GET  /api/demo-request/:ref -> export one demo request by reference
 *  - DELETE /api/demo-request/:ref -> delete one demo request by reference
 *  - POST /api/waitlist, GET /api/waitlist (token-gated)
 *  - POST /api/track, GET /api/stats (token-gated, cookieless analytics)
 *
 * Privacy posture: counsel questions exist only for the duration of the
 * request. Circle notes live in the user's own browser (localStorage) —
 * the server never sees them. Demo requests are stored only so we can
 * follow up on the demo; export or delete any time with the reference
 * code. See /data for the full data charter.
 * =================================================================== */
const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { getProvider, providerInfo } = require('./providers');

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.disable('x-powered-by');
app.use(express.json({ limit: '64kb' }));

/* Liveness probe. */
app.get('/healthz', (req, res) => res.status(200).json({ ok: true, app: 'arbor-for-law+audrey' }));

/* Serve the app. */
app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html'],
  setHeaders(res, filePath) {
    // Never cache the shell; assets are fine to cache briefly.
    if (filePath.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-store');
    }
  }
}));

/* Which brain is plugged in? The UI uses this for its honesty badge. */
app.get('/api/config', (req, res) => {
  res.json({
    app: 'Audrey',
    version: '2.0.0-arbor',
    provider: providerInfo(),
    privacy: {
      serverStoresInputs: false,
      serverStoresNotes: false,
      notesLocation: 'this browser only (localStorage)',
      trainsOnData: false,
      integrations: 'none — no calendar, email, or voice'
    }
  });
});

/* Ask Audrey. Stateless: nothing is persisted. */
app.post('/api/counsel', async (req, res) => {
  const question = String((req.body && req.body.question) || '').slice(0, 4000);
  if (!question.trim()) {
    return res.status(400).json({ error: 'Ask me something first.' });
  }
  try {
    const provider = getProvider();
    const result = await provider.counsel({ question });
    res.json(result);
  } catch (err) {
    // Log the failure mode, never the input.
    console.error('[arbor] counsel failed:', err.message);
    res.status(502).json({
      error: 'Counsel failed. Check your connection and try again. ' +
        (providerInfo().demoMode ? '' : 'If this persists, verify LLM_API_KEY / LLM_BASE_URL.')
    });
  }
});

/* ---- Arbor for Law demo requests ------------------------------------
 * Stored on disk (data/demo_requests.jsonl) so they survive restarts.
 * Each request gets a reference code the requester can use to export or
 * delete it from /data. Viewing the full list needs the analytics token. */
const DEMO_FILE = path.join(__dirname, 'data', 'demo_requests.jsonl');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function readJsonl(file) {
  try {
    return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean)
      .map((ln) => { try { return JSON.parse(ln); } catch (e) { return null; } })
      .filter(Boolean);
  } catch (e) { return []; }
}

app.post('/api/demo-request', (req, res) => {
  const b = req.body || {};
  const name = String(b.name || '').trim().slice(0, 120);
  const firm = String(b.firm || '').trim().slice(0, 160);
  const email = String(b.email || '').trim().toLowerCase().slice(0, 160);
  const phone = String(b.phone || '').trim().slice(0, 40);
  const message = String(b.message || '').trim().slice(0, 2000);
  if (!name) return res.status(400).json({ ok: false, error: 'Please tell us your name.' });
  if (!firm) return res.status(400).json({ ok: false, error: 'Please tell us your firm.' });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ ok: false, error: 'Enter a valid email address.' });
  const ref = crypto.randomBytes(4).toString('hex').toUpperCase();
  const line = JSON.stringify({
    ts: new Date().toISOString(), ref, name, firm, email,
    phone: phone || null, message: message || null
  }) + '\n';
  try {
    fs.appendFileSync(DEMO_FILE, line);
  } catch (e) {
    console.error('[arbor] demo-request save failed:', e.message);
    return res.status(500).json({ ok: false, error: 'Could not save — try again.' });
  }
  try {
    fs.appendFileSync(ANALYTICS_FILE, JSON.stringify({
      ts: new Date().toISOString(), page: '/for-attorneys', event: 'demo_request', ua: ''
    }) + '\n');
  } catch (e) { /* best effort */ }
  res.json({ ok: true, ref });
});

/* Export one demo request by reference code. */
app.get('/api/demo-request/:ref', (req, res) => {
  const ref = String(req.params.ref || '').toUpperCase();
  const found = readJsonl(DEMO_FILE).find((r) => r.ref === ref);
  if (!found) return res.status(404).json({ ok: false, error: 'No demo request found for that reference code.' });
  res.json({ ok: true, request: found });
});

/* Delete one demo request by reference code. */
app.delete('/api/demo-request/:ref', (req, res) => {
  const ref = String(req.params.ref || '').toUpperCase();
  const rows = readJsonl(DEMO_FILE);
  if (!rows.some((r) => r.ref === ref)) {
    return res.status(404).json({ ok: false, error: 'No demo request found for that reference code.' });
  }
  try {
    fs.writeFileSync(DEMO_FILE,
      rows.filter((r) => r.ref !== ref).map((r) => JSON.stringify(r)).join('\n') +
      (rows.length > 1 ? '\n' : ''));
  } catch (e) {
    console.error('[arbor] demo-request delete failed:', e.message);
    return res.status(500).json({ ok: false, error: 'Could not delete — try again.' });
  }
  res.json({ ok: true });
});

/* Staff view of all demo requests (analytics token required). */
app.get('/api/demo-requests', (req, res) => {
  const token = process.env.ANALYTICS_TOKEN;
  if (!token || req.query.token !== token) return res.status(403).json({ ok: false });
  const rows = readJsonl(DEMO_FILE);
  res.json({ ok: true, count: rows.length, requests: rows });
});

/* ---- Private analytics: pageviews + conversion events. No third parties,
 * no cookies, no fingerprinting, no PII. Page + event + timestamp only. ---- */
const ANALYTICS_FILE = path.join(__dirname, 'data', 'analytics.jsonl');
app.post('/api/track', (req, res) => {
  const body = req.body || {};
  const page = String(body.page || '').slice(0, 120);
  let event = String(body.event || 'pageview').slice(0, 40);
  if (!/^[a-z0-9_]+$/.test(event)) event = 'pageview';
  if (!page.startsWith('/')) return res.status(400).json({ ok: false });
  const line = JSON.stringify({ ts: new Date().toISOString(), page, event,
    ua: String(req.headers['user-agent'] || '').slice(0, 120) }) + '\n';
  try { fs.appendFileSync(ANALYTICS_FILE, line); } catch (e) { /* best effort */ }
  res.json({ ok: true });
});
app.get('/api/stats', (req, res) => {
  const token = process.env.ANALYTICS_TOKEN;
  if (!token || req.query.token !== token) return res.status(403).json({ ok: false });
  const lines = readJsonl(ANALYTICS_FILE);
  const cutoff = Date.now() - 30 * 24 * 3600 * 1000;
  const pageviewsByPage = {}, eventsByType = {};
  let totalPageviews = 0;
  for (const r of lines) {
    try {
      if (new Date(r.ts).getTime() < cutoff) continue;
      eventsByType[r.event] = (eventsByType[r.event] || 0) + 1;
      if (r.event === 'pageview') {
        totalPageviews++;
        pageviewsByPage[r.page] = (pageviewsByPage[r.page] || 0) + 1;
      }
    } catch (e) { /* skip bad lines */ }
  }
  res.json({ ok: true, days: 30, totalPageviews, pageviewsByPage, eventsByType });
});

/* ---- Audrey beta waitlist: email capture. Stored on the server's disk.
 * Viewable only with the analytics token. ---- */
const WAITLIST_FILE = path.join(__dirname, 'data', 'waitlist.jsonl');
app.post('/api/waitlist', (req, res) => {
  const email = String((req.body && req.body.email) || '').trim().toLowerCase().slice(0, 160);
  if (!EMAIL_RE.test(email)) return res.status(400).json({ ok: false, error: 'Enter a valid email address.' });
  const line = JSON.stringify({ ts: new Date().toISOString(), email }) + '\n';
  try { fs.appendFileSync(WAITLIST_FILE, line); }
  catch (e) { return res.status(500).json({ ok: false, error: 'Could not save — try again.' }); }
  try {
    fs.appendFileSync(ANALYTICS_FILE, JSON.stringify({
      ts: new Date().toISOString(), page: '/waitlist', event: 'waitlist_join', ua: ''
    }) + '\n');
  } catch (e) { /* best effort */ }
  res.json({ ok: true });
});
app.get('/api/waitlist', (req, res) => {
  const token = process.env.ANALYTICS_TOKEN;
  if (!token || req.query.token !== token) return res.status(403).json({ ok: false });
  res.json({ ok: true, signups: readJsonl(WAITLIST_FILE), count: readJsonl(WAITLIST_FILE).length });
});

/* Friendly 404 for API typos. */
app.use('/api', (req, res) => res.status(404).json({ error: 'Unknown API endpoint.' }));

/* JSON error responses for the API (malformed JSON bodies, etc.)
 * instead of Express's default HTML error page. */
app.use('/api', (err, req, res, next) => {
  console.error('[arbor] api error:', err.message);
  res.status(err.status || 400).json({ error: 'Bad request — expected JSON.' });
});

app.listen(PORT, () => {
  const info = providerInfo();
  console.log(`[arbor] Audrey + Arbor for Law listening on port ${PORT}`);
  console.log(`[arbor] provider=${info.id} demoMode=${info.demoMode} model=${info.model}`);
});
