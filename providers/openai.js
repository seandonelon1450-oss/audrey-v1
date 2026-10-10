'use strict';
/* =====================================================================
 * Audrey V1 — REAL provider (OpenAI-compatible API).
 *
 * Activated when LLM_PROVIDER=openai and LLM_API_KEY is set.
 * Works with OpenAI or any OpenAI-compatible endpoint
 * (override LLM_BASE_URL). The key stays server-side — it is never
 * sent to the browser.
 * =================================================================== */
const PROVIDER_ID = 'openai';
const TIMEOUT_MS = 45000;

const SYSTEM_PROMPT = [
  'You are Audrey, a private chief-of-staff for a busy principal.',
  'Give direct, practical counsel: name the outcome, shrink the next step, say who needs to know.',
  'Be concise and composed. No flattery, no filler, no moralizing.',
  'You do NOT have access to the user\'s calendar, email, contacts, or any accounts —',
  'never claim to check, book, send, or look anything up. Offer playbooks the user can run themselves.',
  'Keep answers under 300 words unless the question clearly needs more.'
].join(' ');

function config() {
  return {
    apiKey: process.env.LLM_API_KEY || '',
    model: process.env.LLM_MODEL || 'gpt-4o-mini',
    baseUrl: (process.env.LLM_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '')
  };
}

function isConfigured() {
  return config().apiKey.length > 0;
}

async function counsel({ question }) {
  const { apiKey, model, baseUrl } = config();
  if (!apiKey) throw new Error('LLM_API_KEY is not set.');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res;
  try {
    res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: String(question).slice(0, 3500) }
        ]
      })
    });
  } catch (e) {
    clearTimeout(timer);
    throw new Error(e.name === 'AbortError' ? 'LLM request timed out.' : `LLM request failed: ${e.message}`);
  }
  clearTimeout(timer);

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`LLM API ${res.status}: ${body.slice(0, 200)}`);
  }
  const json = await res.json();
  const content = json.choices && json.choices[0] && json.choices[0].message
    ? json.choices[0].message.content
    : null;
  if (!content || !String(content).trim()) throw new Error('LLM returned no content.');

  return {
    provider: PROVIDER_ID,
    demoMode: false,
    topic: 'Counsel',
    answer: String(content).trim().slice(0, 6000),
    disclaimer: 'AI-generated counsel. Audrey advises — you decide. She cannot see your calendar, email, or accounts.'
  };
}

module.exports = { counsel, PROVIDER_ID, isConfigured };
