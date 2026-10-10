'use strict';
/* Audrey — app frontend.
 * Tabs, counsel client, private Circle notes (localStorage only),
 * morning-brief drafts with Approve / Edit / Skip.
 * No chat bubbles: counsel is a composed card, not a conversation. */

const $ = (id) => document.getElementById(id);

/* ---------- tabs ---------- */
document.querySelectorAll('.tab').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
    btn.classList.add('active');
    $('screen-' + btn.dataset.screen.replace('screen-', '')).classList.add('active');
    window.scrollTo({ top: 0 });
  });
});
function goTo(screenId) {
  const btn = document.querySelector(`.tab[data-screen="${screenId}"]`);
  if (btn) btn.click();
}
$('askAudreyBtn').addEventListener('click', () => goTo('screen-counsel'));

/* ---------- briefing: honest local date + time-of-day greeting ---------- */
(function initBriefing() {
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  $('briefDate').textContent =
    `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`.toUpperCase();
  const h = now.getHours();
  $('greeting').textContent =
    h < 12 ? 'Good morning.' : h < 18 ? 'Good afternoon.' : 'Good evening.';
})();

/* ---------- drafts: Approve / Edit / Skip (nothing sends on its own) ---------- */
document.querySelectorAll('[data-draft]').forEach((card) => {
  const actions = card.querySelector('.draft-actions');
  if (!actions) return;
  actions.addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-act]');
    if (!btn) return;
    const act = btn.dataset.act;
    if (act === 'approve') {
      card.classList.add('draft-approved');
      actions.innerHTML = '<p class="hint status-ok">Approved — Demo: nothing actually sent. You decide.</p>';
    } else if (act === 'skip') {
      card.style.display = 'none';
    } else if (act === 'edit') {
      goTo('screen-counsel');
      const input = $('counselInput');
      input.value = 'Revise the draft about: ' + card.querySelector('.body-lg').textContent.trim();
      input.focus();
    }
  });
});

/* ---------- provider badge (honest demo labeling) ---------- */
async function loadConfig() {
  const badge = $('modeBadge');
  try {
    const res = await fetch('/api/config');
    const cfg = await res.json();
    if (cfg.provider && cfg.provider.demoMode) {
      badge.textContent = 'Demo counsel · no AI key';
      badge.className = 'badge badge-demo';
    } else {
      badge.textContent = 'Live counsel · ' + (cfg.provider.model || 'AI');
      badge.className = 'badge badge-live';
    }
  } catch (e) {
    badge.textContent = 'Offline';
    badge.className = 'badge';
  }
}

/* ---------- counsel ---------- */
$('counselBtn').addEventListener('click', async () => {
  const q = $('counselInput').value.trim();
  const status = $('counselStatus');
  const result = $('counselResult');
  if (!q) { status.textContent = 'Ask me something first.'; return; }
  $('counselBtn').disabled = true;
  status.textContent = 'Consulting…';
  result.innerHTML = '';
  try {
    const res = await fetch('/api/counsel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: q })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Counsel failed.');
    const card = document.createElement('div');
    if (window.trackEvent) window.trackEvent('counsel_asked');
    card.className = 'answer-card';
    const topic = document.createElement('p');
    topic.className = 'topic';
    topic.textContent = data.topic || 'Counsel';
    const body = document.createElement('p');
    body.className = 'body';
    body.textContent = data.answer;
    const dis = document.createElement('p');
    dis.className = 'disclaimer';
    dis.textContent = (data.demoMode ? 'Demo counsel — templated, not AI. ' : '') + (data.disclaimer || '');
    card.append(topic, body);
    if (Array.isArray(data.factors) && data.factors.length) {
      const how = document.createElement('div');
      how.className = 'how-got-there';
      const ht = document.createElement('p');
      ht.className = 'how-title';
      ht.textContent = 'How I got there';
      how.appendChild(ht);
      const ul = document.createElement('ul');
      data.factors.forEach(f => {
        const li = document.createElement('li');
        li.textContent = f;
        ul.appendChild(li);
      });
      how.appendChild(ul);
      card.appendChild(how);
    }
    card.appendChild(dis);
    result.appendChild(card);
    status.textContent = '';
  } catch (e) {
    status.textContent = e.message || 'Counsel failed. Try again.';
  } finally {
    $('counselBtn').disabled = false;
  }
});

/* ---------- circle: private notes, this browser only ---------- */
const NOTES_KEY = 'audrey_circle_notes_v1';

function loadNotes() {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch (e) { return []; }
}
function saveNotes(notes) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

function renderNotes() {
  const notes = loadNotes();
  const list = $('noteList');
  list.innerHTML = '';
  if (!notes.length) {
    list.innerHTML = '<p class="empty">Nothing captured yet. Your circle starts with the first note.</p>';
    return;
  }
  notes.forEach((n, i) => {
    const item = document.createElement('div');
    item.className = 'note-item';
    const h = document.createElement('h4');
    h.textContent = n.title || 'Untitled';
    const p = document.createElement('p');
    p.textContent = n.body || '';
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = new Date(n.createdAt).toLocaleString();
    const del = document.createElement('button');
    del.className = 'btn btn-danger-ghost';
    del.textContent = 'Delete';
    del.addEventListener('click', () => {
      const cur = loadNotes();
      cur.splice(i, 1);
      saveNotes(cur);
      renderNotes();
    });
    item.append(h, p, meta, del);
    list.appendChild(item);
  });
}

$('saveNoteBtn').addEventListener('click', () => {
  const title = $('noteTitle').value.trim();
  const body = $('noteBody').value.trim();
  if (!title && !body) return;
  const notes = loadNotes();
  notes.unshift({ title: title || 'Untitled', body, createdAt: Date.now() });
  saveNotes(notes);
  $('noteTitle').value = '';
  $('noteBody').value = '';
  renderNotes();
});

$('exportNotesBtn').addEventListener('click', () => {
  const notes = loadNotes();
  if (!notes.length) return;
  const text = notes.map((n) =>
    `— ${n.title || 'Untitled'} (${new Date(n.createdAt).toLocaleString()})\n${n.body || ''}`
  ).join('\n\n');
  const blob = new Blob([`Audrey — Circle notes (exported ${new Date().toLocaleString()})\n\n${text}\n`], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'audrey-circle-notes.txt';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
});

$('clearNotesBtn').addEventListener('click', () => {
  if (!loadNotes().length) return;
  if (confirm('Delete all Circle notes from this browser? This cannot be undone.')) {
    saveNotes([]);
    renderNotes();
  }
});

/* ---------- beta waitlist ---------- */
$('waitJoinBtn').addEventListener('click', async () => {
  const email = $('waitEmail').value.trim();
  const status = $('waitStatus');
  if (!email) { status.textContent = 'Enter your email first.'; return; }
  $('waitJoinBtn').disabled = true;
  status.textContent = 'Joining…';
  try {
    const res = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (data.ok) {
      status.textContent = "You're on the list. Watch your inbox.";
      $('waitEmail').value = '';
    } else {
      status.textContent = data.error || 'Something went wrong — try again.';
    }
  } catch (e) {
    status.textContent = 'Could not reach the server — try again.';
  }
  $('waitJoinBtn').disabled = false;
});

/* ---------- boot ---------- */
loadConfig();
renderNotes();
