# BUILD REPORT — Arbor for Law + Audrey (priority 5), 2026-10-10

Repo: `~/workspace/audrey-v1` (one commit, local only — no push, auth paused).
Scope: the AUDe rename job per brief §9F + consumer-face brand fixes per §9G.

## What was built

1. **Rename (zero retired brand in customer-facing text).** The legal-software
   surface is now "Arbor for Law"; the consumer face is plain "Audrey".
   Renamed in `server.js`, `public/index.html`, `public/js/app.js`
   (incl. the `localStorage` notes key → `audrey_circle_notes_v1`), both
   providers (incl. the system prompt and mock model id), manifest, and docs.
   Old design language (noir/ivory/champagne) replaced with the §10 system.
2. **`/for-attorneys`** — new page, ink accent, Arbor Technologies look.
   Carries the exact §9F copy: "Arbor for Law: flat-fee successions without
   the paperwork. Charter seat $199/mo, 5 seats." "Book a demo" button opens
   a form (name/firm/email/phone/message) that submits to
   `POST /api/demo-request` → stored as JSONL in `data/demo_requests.jsonl`
   with an 8-char reference code shown on success. `GET/DELETE
   /api/demo-request/:ref` give export/delete by reference code; staff list
   at `GET /api/demo-requests?token=` (needs `ANALYTICS_TOKEN`).
   Attorney-ad copy: Thomas G. Donelon, Metairie, Louisiana; "general
   information, not legal advice"; "Software powered by Arbor. Arbor
   Technologies is a software company, not a law firm. It does not provide
   legal services, does not represent clients, and does not share in legal
   fees." The Arbor Group is never presented as a law firm.
3. **§10 design system**: paper #FAF8F4 / ink #1C1A17, Fraunces headlines +
   Inter body (self-hosted WOFF2, `public/fonts/` — no Google Fonts links),
   8pt spacing, §10 component specs (56px primary buttons, 2px focus ring,
   cards, pill badge), OS-following dark theme + header toggle stored on
   device, scroll reveals with reduced-motion state (no movement, all
   visible), WCAG 2.2 AA basics (skip link, visible focus, 44px+ targets,
   body ≥16px).
4. **Consumer Audrey (§9G only)**: morning brief is the main screen
   ("Good morning. 3 things are ready." — 3 draft cards, each labeled Demo,
   with Approve / Edit / Skip); "Ask Audrey" secondary; all sample data
   labeled Demo; new `/about` with the A.U.D.R.E.Y. acronym (About pages
   only); no checkout, no new features. Never opens on an empty prompt.
5. **Badge + footer**: "powered by Arbor" pill (inline-SVG nested-arch
   mark, live text) — footer on every page, header at ≥1200px. Footer line
   everywhere: "Powered by Arbor · The Arbor Group · She owns her data."
   Badge links to the Arbor Technologies site URL (TBD — see blocked).
6. **Trust**: the 10-point data charter word for word on `/data`, with
   working Export (Circle-notes download + demo-request lookup by ref) and
   Delete (notes wipe + demo-request delete by ref). `/faq` answers "Does
   Arbor use AI?" plainly. `/contact` = "Talk to a person."
7. **Deploy prep**: `render.yaml` (Node, autoDeploy on main,
   `healthCheckPath: /healthz`); `GET /healthz` → 200; CI workflow fails on
   the ephemeral-registry hostname in the repo, the retired brand name in
   customer-facing text, and any ®. The literal banned hostname appears only
   in `.github/workflows/ci.yml`, nowhere else.

## Verification (actual checks run)

- Booted locally on :3100 (mock mode, honest badge); **all 200**:
  `/`, `/for-attorneys`, `/about`, `/data`, `/faq`, `/contact`,
  `/healthz`, `/api/config`, `/styles.css`, `/js/site.js`, `/js/app.js`,
  `/fonts/fraunces-latin.woff2`, `/manifest.webmanifest`.
- `POST /api/demo-request` (valid) → `{ok:true, ref:"0A37661F"}`; row on
  disk; invalid email → 400. Killed the server, restarted, `GET
  /api/demo-request/0A37661F` → still returned (persistence across restart
  confirmed). `DELETE` → 200, then GET → 404; test row removed.
- `POST /api/counsel` (scheduling question) → topical answer, `demoMode:true`.
- Content checks: exact §9F copy found verbatim on /for-attorneys; charter
  point 10 verbatim on /data; "Does Arbor use AI?" on /faq; the A.U.D.R.E.Y.
  acronym on /about; attorney name + city on /for-attorneys.
- Greps: case-insensitive retired-brand pattern (`aude`/`a.u.d`) in
  `public/`, `server.js`, `providers/` → **zero hits**; ® → zero;
  avoid-list words (§3) in customer-facing HTML → zero; secrets in code →
  zero; banned registry hostname outside the CI yml → zero (present only in
  the yml, 2 occurrences).
- Git working tree clean after local commit. No push attempted (auth paused).

## Repo-split recommendation

**Keep it unified for now; split when the consumer face unpauses.**
Both products share one design system, one footer/badge, one charter, and
the same static server — splitting today would duplicate all of that for
no gain. Split into `arbor-for-law` + `audrey` repos the moment either (a)
gets its own Render service/paid tier, or the Audrey build unpauses, or the
surfaces diverge enough that deploys need independent release trains.

## Blocked on Sean (his tap-list)

1. **Arbor Technologies site URL** — the "powered by Arbor" badge currently
   links to `#` with a "coming soon" label; give me the URL and I wire it.
2. **`ANALYTICS_TOKEN`** — set it in the Render dashboard env so the
   token-gated views (`/api/stats`, `/api/waitlist`, `/api/demo-requests`)
   work in production. Never paste it in chat.
3. **Paid Render instance** — demo requests live on Render's ephemeral disk;
   free-tier restarts will wipe them. Paid Starter+ keeps them (matches the
   brief's paid-instance rule). Until then, export demo requests regularly.
4. **LLM key** (optional) — without `LLM_PROVIDER=openai` + `LLM_API_KEY`,
   counsel stays in honest demo mode (this is correct and labeled).
5. **Attorney review** — data charter, Arbor for Law terms, and the
   Thomas G. Donelon disclosure wording are built from the brief; lawyer
   sign-off still pending per §13.

## Follow-ups recorded (not blocked)

- Fonts are self-hosted WOFF2 (latin subsets only) — done, no follow-up
  needed.
- Reduced-motion: OS-setting state implemented for reveals and CSS motion.
- The old `shots/` PNGs still show the 9-29 brand styling — Sean's call
  whether to regenerate them.
