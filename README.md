# Audrey + Arbor for Law (web)

One repo, two surfaces, one design system (Arbor §10: paper `#FAF8F4`, ink `#1C1A17`, Fraunces + Inter, self-hosted WOFF2 in `public/fonts/`):

- **Audrey** (consumer, `/`) — paused build, brand fixes only. Morning brief is the main screen ("Good morning. 3 things are ready." with drafts to approve); "Ask Audrey" secondary; all sample content labeled **Demo**; About page carries the A.U.D.R.E.Y. acronym. No checkout.
- **Arbor for Law** (law software, `/for-attorneys`) — "For Attorneys" page with demo-request form that stores to `data/demo_requests.jsonl`. Attorney-ad copy: Thomas G. Donelon, Metairie, Louisiana; general information, not legal advice; Arbor Technologies is a software company, not a law firm.

## Run

```bash
npm install
npm start        # serves on PORT (default 3000)
```

## Endpoints

- `GET /healthz` → 200 liveness (Render `healthCheckPath`).
- `GET /api/config` — honest provider badge payload.
- `POST /api/counsel` — stateless counsel (mock demo or real LLM via `LLM_PROVIDER=openai` + `LLM_API_KEY`).
- `POST /api/demo-request` — Arbor for Law demo request → `{ ok, ref }`.
- `GET /api/demo-request/:ref` / `DELETE /api/demo-request/:ref` — export / delete one demo request.
- `GET /api/demo-requests?token=` — staff list (needs `ANALYTICS_TOKEN`).
- `POST /api/waitlist`, `GET /api/waitlist?token=` — Audrey beta waitlist.
- `POST /api/track`, `GET /api/stats?token=` — cookieless private analytics.

Pages: `/` (Audrey app) · `/for-attorneys` · `/about` · `/data` (charter + working Export/Delete) · `/faq` (answers "Does Arbor use AI?" plainly) · `/contact` (talk to a person).

## Real AI (optional)

```bash
LLM_PROVIDER=openai LLM_API_KEY=sk-... npm start
# optional overrides:
#   LLM_MODEL=gpt-4o-mini        (default)
#   LLM_BASE_URL=https://...     (any OpenAI-compatible endpoint)
```

The key stays server-side and is never sent to the browser.
`/api/config` tells the UI which provider is active so the badge is
always honest. Without a key, everything works in demo mode.

## Privacy & data handling

- Counsel questions are stateless: inputs exist only for the duration of the request.
- Circle notes live in the user's browser (localStorage). The server never receives them.
- Demo requests are stored only to follow up on the demo; exportable/deletable by reference code from `/data`.
- We do not train on user data. No third-party pixels or trackers.
- No calendar, email, contacts, or voice integration. The briefing is fictional demo data, labeled.

## Deploy

`render.yaml` — GitHub → Render, autoDeploy on main, `healthCheckPath: /healthz`. CI (`.github/workflows/ci.yml`) fails on the banned registry hostname, the retired brand name in customer-facing text, and any ®.

Secrets: only in env (`ANALYTICS_TOKEN`, `LLM_API_KEY`, `LLM_PROVIDER`) — never in code.
