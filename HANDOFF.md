# HANDOFF — Audrey + Arbor for Law (rebuilt 2026-10-10)

Supersedes the 2026-09-30 handoff. The retired brand name is gone from
all customer-facing text; this repo now serves two surfaces under the
Arbor design system (§10: paper #FAF8F4, ink #1C1A17, Fraunces + Inter,
self-hosted WOFF2).

## What was built (2026-10-10)

- **Rename**: zero retired-brand strings in customer-facing text
  (HTML, JS, API responses). Consumer face is plain "Audrey"; the
  legal-software surface is "Arbor for Law".
- **`/for-attorneys`**: "Arbor for Law: flat-fee successions without the
  paperwork. Charter seat $199/mo, 5 seats." + "Book a demo" form that
  submits and persists (`data/demo_requests.jsonl`) across restarts.
  Attorney-ad copy: Thomas G. Donelon, Metairie, Louisiana; general
  information, not legal advice; Arbor Technologies is a software
  company, not a law firm.
- **Audrey consumer face (§9G brand fixes only)**: morning brief is the
  main screen ("Good morning. 3 things are ready." — 3 drafts with
  Approve / Edit / Skip); "Ask Audrey" secondary; all sample content
  labeled Demo; `/about` carries the A.U.D.R.E.Y. acronym; never opens
  on an empty prompt; no checkout.
- **`/data`**: the 10-point data charter word for word, with working
  Export (Circle notes download; demo-request lookup by reference
  code) and Delete (notes wipe; demo-request delete by reference code).
- **`/faq`**: answers "Does Arbor use AI?" plainly, plus demo-data,
  notes privacy, demo-request, law-firm, and contact questions.
- **`/contact`**: "Talk to a person".
- **Badge**: "powered by Arbor" pill (inline-SVG arch mark, live text) —
  footer always, header at ≥1200px. Footer line:
  "Powered by Arbor · The Arbor Group · She owns her data."
- **Deploy prep**: `render.yaml` (Node, autoDeploy on main,
  `healthCheckPath: /healthz`); `GET /healthz` → 200; CI fails on the
  banned registry hostname, the retired brand name in customer-facing
  text, and any ®.
- **WCAG 2.2 AA basics**: skip link, visible focus, 44px+ targets, body
  ≥16px, reduced-motion state (no movement, everything visible).

## What is demo

- Briefing content is fictional concept data, every item labeled Demo.
- Counsel without a key is templated, labeled "Demo counsel."
- No integrations, no voice, no sync, no accounts, no checkout.

## Verification (2026-10-10)

See BUILD-REPORT.md for the full check list: local boot, 200s on all
pages + /healthz, demo-request submit → persists across restart,
export/delete round-trip, zero retired-brand hits in customer-facing
text, zero ®, no secrets in code.
