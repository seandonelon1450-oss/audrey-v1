'use strict';
/* =====================================================================
 * Audrey V1 — MOCK provider (demo mode)
 * ---------------------------------------------------------------------
 * Deterministic, templated chief-of-staff counsel. THIS IS NOT AI.
 *
 * Purpose: the app runs end-to-end with zero API keys and zero cost.
 * It is CLEARLY LABELED as a demo in the API response, the UI badge,
 * and the README.
 *
 * When LLM_PROVIDER=openai (with a key), providers/index.js bypasses
 * this file entirely and the real provider takes over.
 * =================================================================== */

const PROVIDER_ID = 'mock-demo';
const DISCLAIMER =
  'DEMO COUNSEL — templated, not AI. Useful for trying the workflow. ' +
  'Add an LLM API key (see README) for real counsel.';

function pickTemplate(q) {
  const t = q.toLowerCase();

  if (/\b(schedule|calendar|meeting|appointment|book|reschedule|move\b.*\bmeeting)\b/.test(t)) {
    return {
      topic: 'Scheduling',
      _factors: ['You need an outcome before a calendar — so I started there, not with dates.', 'Open-ended asks stall, so I gave you the two-window move instead.', 'Your edges matter, so I protected the first and last 30 minutes of the day.'],
      answer:
        'Here is how I would handle the scheduling question.\n\n' +
        '1. Decide the outcome first. Before touching a calendar, name what "good" looks like: ' +
        'the decision you need, the people who must be there, and the latest date it can happen.\n\n' +
        '2. Offer two windows, not an open ask. "Tuesday between 10 and 12, or Thursday after 2 — ' +
        'which suits you?" Two options get answers; open questions get delays.\n\n' +
        '3. Protect the edges. Nothing important in the first or last 30 minutes of the day. ' +
        'Travel, thinking, and recovery time are appointments too — block them before the week fills.\n\n' +
        '4. Confirm in writing. After any verbal agreement, one short note: date, time, place, purpose. ' +
        'Misremembered meetings are where weeks go to die.\n\n' +
        'In demo mode I cannot see or change your real calendar — that is native-app territory. ' +
        'For now, treat this as the playbook and run the calendar yourself.'
    };
  }

  if (/\b(draft|write|email|letter|message|reply|respond|wording)\b/.test(t)) {
    return {
      topic: 'Drafting',
      _factors: ['The ask comes first — if it cannot fit in one sentence, the message is not ready.', 'Context serves the decision, so I cut everything that serves anxiety instead.', 'Tone is read on the recipient’s worst day, so I gave you the pressure-test.'],
      answer:
        'A chief-of-staff drafting frame — three passes, in this order.\n\n' +
        'Pass 1 — The ask. One sentence, first: what do you want them to do? ' +
        'If you cannot say the ask in one sentence, you are not ready to send.\n\n' +
        'Pass 2 — The minimum context. Give only what they need to say yes. ' +
        'Background is a courtesy; it is not the message. Cut everything that serves your anxiety rather than their decision.\n\n' +
        'Pass 3 — The tone check. Read it as the recipient, on their worst day. ' +
        'If any sentence could be read as pressure, rewrite it as a choice: "no rush — Thursday works, or tell me what does."\n\n' +
        'Structure that never fails: ask first, context second, deadline third, gracious exit last. ' +
        'Shorter is kinder. If it runs past 150 words, it is two emails.'
    };
  }

  if (/\b(decid|decision|choose|choice|should i|stuck|dilemma|weigh)\b/.test(t)) {
    return {
      topic: 'Decisions',
      _factors: ['Heavy decisions are usually two decisions in a trench coat — so I split reversible from irreversible.', 'The counsel you would give a friend is usually the counsel you already have — so I made you say it out loud.', 'The 10-10-10 test separates a hard decision from an uncomfortable conversation.'],
      answer:
        'When a decision feels heavy, it is usually two decisions wearing a trench coat. Separate them.\n\n' +
        '1. Reversible or not? Most decisions are reversible — those deserve 10 minutes, not 10 days. ' +
        'Reserve slow deliberation for the genuinely irreversible: money you cannot re-earn, trust you cannot rebuild, ' +
        'time you cannot recover.\n\n' +
        '2. What would you advise a friend? Say it out loud. The counsel you would give someone you respect ' +
        'is almost always the counsel you already have — you are just afraid to take it.\n\n' +
        '3. The 10-10-10 test. How will this feel in 10 minutes, 10 months, 10 years? ' +
        'Decisions that only hurt for 10 minutes are not hard decisions; they are uncomfortable conversations.\n\n' +
        '4. Decide once. A decided thing stops renting space in your head. If new facts arrive, ' +
        'you are allowed to re-decide — that is judgment, not flip-flopping.'
    };
  }

  if (/\b(remind|remember|don'?t forget|follow up|follow-up|deadline)\b/.test(t)) {
    return {
      topic: 'Follow-through',
      _factors: ['Capture beats memory — so the system starts with writing it down now, not later.', 'Vague tasks die quietly, so I shrank yours to one verb.', 'Undated items are wishes, so everything gets a date or a deliberate someday pile.'],
      answer:
        'A follow-through system that survives a busy life has three parts.\n\n' +
        '1. Capture immediately. The moment it occurs to you, it goes on the list — not "later," now. ' +
        'Your Circle notes in this app are a fine capture tray; they never leave this browser.\n\n' +
        '2. One next action, verb-sized. Not "handle the Lisbon property" — "email the agent the comparison questions." ' +
        'If the next step takes more than a sentence to describe, it is a project wearing a task costume. Break it.\n\n' +
        '3. A date or it is a wish. Every captured item gets either a calendar date or a deliberate "someday" pile ' +
        'you review weekly. Undated items are where good intentions go quiet.\n\n' +
        'Review the list every morning with coffee — five minutes — and the system runs itself. ' +
        'In demo mode I cannot set real reminders; that arrives with the native app.'
    };
  }

  if (/\b(prep|prepare|meeting|negotiat|difficult conversation|board|interview|pitch)\b/.test(t)) {
    return {
      topic: 'Preparation',
      _factors: ['Every meeting needs its win defined in one line — so we start there.', 'Everyone in the room wants something, so I had you learn their win too.', 'Openings set the temperature, so the first 90 seconds get rehearsed cold.'],
      answer:
        'Preparation is just rehearsal with intent. For anything that matters:\n\n' +
        '1. Define the win in one line. "I walk out with ___." If you cannot fill the blank, you are not ready — ' +
        'and neither is the meeting.\n\n' +
        '2. Learn their win too. Every person in the room wants something. Know what it is before you enter, ' +
        'and frame your ask as their win wearing your clothes.\n\n' +
        '3. Prepare the first 90 seconds. Openings set the temperature. Know your first sentence cold; ' +
        'the rest can be conversation.\n\n' +
        '4. Bring the hard question yourself. Raise the objection before they do — "you are probably wondering about ___." ' +
        'It disarms the room and proves you have done the thinking.\n\n' +
        '5. End with the next step, named and dated. Meetings that end with "let us circle back" never circle back.'
    };
  }

  if (/\b(morning|routine|day|plan|priorit|focus|overwhelm|too much)\b/.test(t)) {
    return {
      topic: 'The day',
      _factors: ['Ten priorities means none — so I cut it to three.', 'Willpower is a morning resource — so the hardest thing goes before 11.', 'Rest is part of the system, not a reward — so the day gets a closing ritual.'],
      answer:
        'A day, distilled — the chief-of-staff method.\n\n' +
        '1. Three things. Not ten — three. If everything is a priority, nothing is. ' +
        'Write them tonight for tomorrow; your morning self will thank your evening self.\n\n' +
        '2. Hardest first. Willpower is a morning resource. The task you most want to avoid is the one ' +
        'that unlocks the day — do it before 11.\n\n' +
        '3. One buffer block. Leave 30 unplanned minutes mid-day. The day will fill them; ' +
        'the question is whether it fills them on your terms.\n\n' +
        '4. A closing ritual. Five minutes at day\'s end: what moved, what stalled, what are tomorrow\'s three. ' +
        'Then stop. Rest is part of the system, not a reward for finishing it.'
    };
  }

  return {
    topic: 'Counsel',
    _factors: ['I named the outcome first — tangled problems untangle when the goal is plain.',
      'I shrank the next step to fifteen minutes — a heavy step is three steps in a coat.',
      'I asked who else needs to know — silence creates rework.'],
    answer:
      'A straight answer, chief-of-staff style.\n\n' +
      'Start with the outcome, not the activity. Ask yourself: "what does done look like, and by when?" ' +
      'Most tangled problems untangle the moment the goal is named plainly.\n\n' +
      'Then shrink the next step until it fits in fifteen minutes. If the next step feels heavy, ' +
      'it is not the next step — it is three steps in a coat. Take the coat off.\n\n' +
      'Finally, decide who else needs to know. Silence creates rework; a two-line note to the right person ' +
      'prevents a week of confusion. Communicate early, in writing, once.\n\n' +
      'That is the whole method: name the outcome, shrink the step, tell the room. ' +
      'Ask me about scheduling, drafting, decisions, preparation, or your day for more specific counsel.'
  };
}

async function counsel({ question }) {
  const q = String(question || '').trim();
  const picked = pickTemplate(q);
  return {
    provider: PROVIDER_ID,
    demoMode: true,
    topic: picked.topic,
    answer: picked.answer,
    factors: picked._factors || [],
    disclaimer: DISCLAIMER
  };
}

module.exports = { counsel, PROVIDER_ID };
