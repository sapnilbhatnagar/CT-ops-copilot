# Build Plan: Connecting Traveller Agentic WhatsApp Automation

> UI-first, module-by-module. Visualization drives backend design, not the other way around.

---

## Document Metadata

- **Client:** Connecting Traveller (India travel/tourism)
- **Problem:** ~388 warm WhatsApp leads per campaign receive zero follow-up after trip capacity (10-12 seats) is filled
- **Solution:** WhatsApp-native lead CRM with AI intake agent and re-engagement broadcast engine, with an internal ops console for the travel team
- **Last Updated:** 2026-05-26
- **Approach pivot:** Original plan (Build Plan - Backend Reference v1.md) was backend-first. This plan flips that: every module ships as a fully-styled UI on localhost first, with mock-data hooks. Only after Sapnil signs off on a module's UX do we design and wire its backend. The original backend specs are preserved verbatim in the reference file and consumed per module as backend sub-phases.

---

## Strategic Rationale

**Why UI-first:**

1. **Faster sign-off loop.** A visual artifact gets a yes/no in 10 minutes. A backend spec gets argued for 3 weeks.
2. **Backend contracts emerge from real UI needs.** Every API endpoint, every Airtable column, every Claude prompt structure can be reverse-engineered from "the UI needs this object to render this card." This eliminates speculative backend work.
3. **Client-shareable from Day 2.** The localhost build can be screen-recorded or deployed to Vercel for a client preview without a single line of production backend code.
4. **Risk surfaced earlier.** UX problems (a confusing classification badge, an unclear hot-lead alert) get caught before backend code locks them in.

**What this trades away:**

- We do not validate AISensy webhook reality until backend phases. If AISensy lacks webhooks, we pivot the WhatsApp Business Solution Provider (BSP) layer — but the UI stays exactly the same, because the UI does not know who delivers messages.
- We do not validate end-to-end latency or token costs until backend phases. Mock data is instant and free; real Claude calls are not.

**Acceptance for this trade:** Sapnil explicitly chose UI-first on 2026-05-26 to "see how things will look in the first pass" before committing to architecture.

---

## Tech Stack (Frontend)

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router, TypeScript) | Vercel-native deploy target, server components when we need them |
| Styling | Tailwind CSS v4 | Token-driven, fastest iteration |
| Components | shadcn/ui (Radix primitives + Tailwind) | Owned components, no lock-in, easy to theme |
| Icons | Lucide | Consistent with shadcn |
| State / Data | React Query + custom hooks (`useLeads`, `useConversation`) | Hook bodies return mock today, swap to fetch later |
| Tests | Vitest + React Testing Library | Behavior-first TDD per the `tdd` skill |
| Fonts | Inter (UI) + Fraunces or similar warm serif (display only) | Geometric sans for clarity, restrained serif for editorial moments |
| Animation | Framer Motion (only where it serves function) | Variant swaps when AI extraction updates a lead card |

**Tech Stack (Backend, deferred):** Unchanged from original plan — Python + FastAPI, Docker, Claude Sonnet 4.6, Airtable, Langfuse self-hosted, AISensy. See `Build Plan - Backend Reference v1.md` for the full backend specification.

---

## Visual Design Language

**60% Impeccable / 40% Product Sanctum blend** — locked with Sapnil 2026-05-26.

### Impeccable contributions (the frame)

- Generous whitespace; nothing fights for attention
- Hierarchy through weight and size, not color
- Restrained, near-monochrome palette
- Numbered, scannable sections
- Function-first motion (no decorative animation)
- Anti-patterns to avoid: italic-serif heroes, purple gradients, nested card hell, density-for-density's-sake

### Product Sanctum contributions (the content)

- Modular cards with real product UI inside them (live conversation thread, lead card with all five fields, classification badge)
- Narrative-led copy on empty states and section openers ("This lead just messaged from a Meta ad — let's qualify them")
- Bold display heads on section openers, then quiet body
- Photography-of-the-product feel: show real states, not abstract icons

### Design tokens (v1)

| Token | Value | Role |
|---|---|---|
| `--ink` | `#0E1014` | Headlines, primary text, sidebar background |
| `--paper` | `#FAFAF7` | Canvas |
| `--mute` | `#6B6B6B` | Secondary text, metadata |
| `--rule` | `#E8E6E0` | Dividers, borders |
| `--accent` | `#C8553D` | One warm terracotta — classification HOT, primary CTAs, focus rings (chosen to evade purple-gradient trap and lean travel/India warmth) |
| `--warm` | `#E8A87C` | Classification WARM |
| `--cool` | `#9DB4C0` | Classification COLD |
| `--ok` | `#5A8F5A` | Confirmations, success states |
| Font (UI) | Inter Variable | All body, controls, table content |
| Font (Display) | Fraunces 400/600 | Section openers, hero numbers — used sparingly |

---

## Phase Map (New)

Each numbered module ships **visual first, backend second**. No module's backend (`Xb`) starts until that module's UI (`Xa`) is signed off by Sapnil.

| Phase | Name | Type | Status |
|---|---|---|---|
| 0 | Visual Foundation | UI scaffold | Not started — next |
| 1a | Lead Intake — Visual | UI | Blocked on 0 |
| 1b | Lead Intake — Backend | API + Claude | Blocked on 1a sign-off |
| 2a | Leads Dashboard — Visual | UI | Blocked on 1a |
| 2b | Leads Dashboard — Backend | Airtable wiring | Blocked on 2a sign-off + 1b |
| 3a | Trips & Re-engagement — Visual | UI | Blocked on 2a |
| 3b | Trips & Re-engagement — Backend | Filter + broadcast | Blocked on 3a sign-off + 2b |
| 4a | Community & Referral — Visual | UI | Blocked on 3a |
| 4b | Community & Referral — Backend | Group invite + referral capture | Blocked on 4a sign-off + 3b |
| 5 | Settings, Schema Designer, Conversation Designer | UI + Backend together | Blocked on 1b (needs real schema concept) |
| 6 | Observability (Langfuse) — Cross-cutting | Backend | Threaded into every `b` phase |
| 7 | Vercel deploy + production hardening | Deploy | Final |

---

## Phase 0 — Visual Foundation

**Target:** 1-2 days. **Phase goal:** A running localhost Next.js app with the app shell, design tokens, sidebar navigation, empty module screens, and the test infrastructure ready. No real product content yet — this phase is the canvas.

### 0.1 Scaffold

**Inputs:** Stack decisions above.

**Outputs:**
- `app/` subfolder created inside `Connecting Traveller/` with Next.js 15 + TS
- Tailwind v4 configured, design tokens above wired into `globals.css` as CSS custom properties
- shadcn/ui initialized; primitives (Button, Card, Badge, Dialog, Input, Sheet, Tooltip, ScrollArea) installed
- Inter Variable + Fraunces loaded via `next/font`
- `pnpm dev` serves on http://localhost:3000

### 0.2 Test infrastructure

**Inputs:** TDD skill, Vitest + RTL choice.

**Outputs:**
- Vitest + RTL + jsdom configured, `pnpm test` runs
- One green smoke test (`app shell renders sidebar`)
- TDD loop documented in `app/README.md`: write failing test → make it pass → refactor

### 0.3 App shell + sidebar

**Inputs:** Operational sidebar shape (locked 2026-05-26).

**Outputs:**
- Left sidebar (charcoal `--ink`, paper-on-ink text) with sections: **Intake**, **Leads**, **Trips**, **Community**, **Settings**
- Top bar with workspace label "Connecting Traveller" + workspace switcher placeholder
- Empty-state page for each route, each with a section-opener heading in Fraunces and a 1-sentence narrative description
- Light/dark mode token wiring (single source of truth in CSS custom properties; toggle deferred to Phase 5)

### 0.4 Design system review

**Inputs:** Phase 0.3 output.

**Outputs:**
- Sapnil walks the shell, confirms the 60/40 blend reads correctly on screen, or requests adjustments
- Sign-off gate: do not start 1a until shell is approved

### 0.5 GitHub push (first)

**Inputs:** GitHub repo URL from Sapnil.

**Outputs:**
- `git init`, `.gitignore` for Next.js, initial commit, push to the provided repo
- `README.md` at repo root documenting localhost run instructions

**Note:** Sapnil will provide the repo URL when ready. Until then, work stays local.

### Phase 0 Success Criteria

- [ ] `pnpm dev` boots and `/` shows the shell with all five sidebar routes
- [ ] `pnpm test` shows at least one green test
- [ ] Sapnil signs off on visual shell (typography, spacing, color, sidebar feel)
- [ ] Repo pushed to GitHub (or marked deferred if URL not yet provided)

---

## Phase 1a — Lead Intake (Visual)

**Target:** 2-3 days. **Phase goal:** The signature screen of the product. A human user can open `/intake` and see a single in-progress lead conversation rendered with full visual fidelity, with the AI extraction filling in fields live, classification animating in, and the hot-lead alert firing — all driven by mock data behind hooks.

### 1a.1 Mock data model

**Inputs:** The five qualifying fields from Phase 0 reference (name, destination, travel dates, group size, budget) and the hot/warm/cold classification logic.

**Outputs:**
- TypeScript types in `app/lib/types.ts`: `Lead`, `Message`, `ExtractedField`, `Classification`
- Mock data file `app/lib/mock/leads.ts` with 8-12 hand-crafted lead conversations covering: a complete hot lead, a warm lead, a cold lead, an abandoned mid-flow lead, a Hindi/Hinglish lead, a referral lead
- Hooks: `useLeads()`, `useLead(id)`, `useConversation(id)` — all return mock data with realistic latency (200-400ms artificial delay) so loading states are testable

### 1a.2 Conversation thread component

**Inputs:** Mock conversation data.

**Outputs:**
- WhatsApp-flavored thread (right-aligned user, left-aligned AI agent, timestamp groups, read ticks for fidelity)
- Visual cue when the AI extracts a field from a message (subtle highlight + Framer Motion variant swap)
- Voice note placeholder ("voice note received — unsupported in v1") rendered as a distinct message type
- TDD: tests cover render order, message types, empty thread, extraction highlight

### 1a.3 Extraction panel

**Inputs:** `ExtractedField` data tied to the conversation.

**Outputs:**
- Right-side panel showing the five fields as a structured card
- Each field shows: label, value (or "—" if not yet extracted), confidence indicator
- Field card fills in with a fade-in as the conversation progresses
- TDD: tests cover empty state, partial extraction, complete extraction

### 1a.4 Classification badge + hot-lead alert

**Inputs:** Classification logic.

**Outputs:**
- Classification badge using the `--accent`/`--warm`/`--cool` tokens
- When a lead crosses to HOT in the mock timeline, a toast/banner fires "Hot lead — agent notified" with timestamp
- TDD: tests cover each classification state and the alert firing

### 1a.5 Intake list + detail layout

**Inputs:** Lead list mock data.

**Outputs:**
- `/intake` shows a left-column list of in-progress conversations
- Clicking a lead opens the conversation + extraction view
- Empty state when no in-progress conversations
- TDD: list render, selection, empty state

### Phase 1a Success Criteria

- [ ] `/intake` renders a list of in-progress leads from mock data
- [ ] Selecting a lead shows the conversation thread + extraction panel + classification badge
- [ ] A simulated incoming message updates the conversation, fills an extraction field, and (if applicable) animates the classification
- [ ] All components have behavior tests (Vitest + RTL); test suite is green
- [ ] Sapnil signs off on visual fidelity and interaction feel
- [ ] Pushed to GitHub

---

## Phase 1b — Lead Intake (Backend)

**Stack locked 2026-05-27** after a focused tradeoff discussion with Sapnil. Departing from the original (Python + FastAPI + self-hosted Docker stack) preserved in `Build Plan - Backend Reference v1.md`.

### Locked Stack

| Layer | Pick | Rationale |
|---|---|---|
| API framework | **Next.js 16 API routes** (in the same `app/` codebase) | Single TypeScript stack with the frontend, shared `Lead` / `Message` types across UI and API, one `vercel deploy` for everything, no Docker setup tax for v1 |
| LLM | **Claude Sonnet 4.6** via `@anthropic-ai/sdk` | Best conversational quality + structured extraction, official TS SDK is parity with Python |
| WhatsApp BSP | **AISensy** (with Meta Cloud API direct as documented fallback) | Client already owns the account, travel team can use AISensy's dashboard for manual messages. Pending audit confirmation of webhook + outbound + broadcast |
| Lead database | **Airtable** for v1 | Travel team reads and edits it directly; no admin UI needed. Migration trigger documented below |
| Observability | **Langfuse Cloud** (free tier) | 50k observations/month covers v1 easily, zero Docker setup, same SDK as self-hosted |
| Session state | In-memory `Map` for v1 → Vercel KV (Upstash Redis) when serverless cold-start drops state | Avoids premature infra |
| Deploy | **Vercel** for frontend + API routes | Same `git push` ships both. No separate backend host |
| WhatsApp policy compliance | Meta-approved templates for first-message and hot-lead notification | Approval submitted in Phase 1b.0 since it takes 24-48 hours |

**Migration triggers (documented now, not pre-built):**
- Airtable → Supabase Postgres when any of: 5,000+ leads, > $50/month Airtable cost, repeated 5 req/sec rate-limit errors
- AISensy → Meta Cloud API direct if Phase 1b.0 audit finds a missing capability
- Langfuse Cloud → self-hosted if a compliance review demands trace data residency in India

### Phase 1b.0 — Audit and credentials (half day, blocking)

Cannot start any code without these. **Performed by Sapnil + client:**

1. AISensy capability audit: send a test outbound message via API, confirm inbound webhook fires for a test inbound message, confirm broadcast API supports > 50 contacts per call
2. Provision API credentials: Anthropic, AISensy, Airtable (create empty base from the schema below), Langfuse Cloud (sign up, get keys)
3. Submit Meta-approved WhatsApp templates: opening greeting, hot-lead agent notification
4. Document the human agent's WhatsApp number for hot-lead notifications

### Phase 1b.1 — Backend dependencies and env (1-2 hours)

**Outputs:**
- `@anthropic-ai/sdk`, `airtable`, `langfuse` added to `app/package.json`
- `.env.local.example` documenting every required env var with a comment
- `.env.local` populated locally (gitignored)
- Vercel env vars set up in dashboard for preview and production

### Phase 1b.2 — Server library wrappers (3-4 hours)

`src/lib/server/` holds server-only clients. Imported only from API routes:

- `anthropic.ts`: Claude client, default model `claude-sonnet-4-6`, wrapped with Langfuse tracing helper
- `airtable.ts`: typed `leadsTable` helper, `createLead()`, `updateLead()`, `findLeadByPhone()`
- `aisensy.ts`: `sendMessage(phone, text)`, `sendTemplate(phone, templateName, params)`, `verifyWebhookSignature(headers, body)`
- `langfuse.ts`: shared Langfuse instance, helper to start a session trace

Each module reads env once at module load, throws clearly if a required var is missing.

### Phase 1b.3 — `/api/whatsapp/webhook` (1 day)

POST handler at `src/app/api/whatsapp/webhook/route.ts`:

- Verify AISensy signature or shared secret on every request
- Parse payload: `{ phone, text, timestamp, messageId, messageType }`
- Dispatch to session manager, get back the agent's reply
- Send the reply via AISensy outbound (async, do not block the webhook response)
- Return 200 within 5 seconds
- Log full exchange to Langfuse under a session keyed by SHA-256(phone)

**Tests:** vitest unit tests using a sample AISensy payload fixture for happy path, missing signature, malformed payload, voice note (unsupported).

### Phase 1b.4 — Session manager and intake agent (2 days)

`src/lib/server/intake-agent.ts`:

- Session = `Map<phoneHash, SessionState>` where `SessionState` holds conversation history + extracted fields + classification
- TTL: abandon after 24h of inactivity, mark session abandoned, write partial Airtable record
- Each turn calls Claude with: system prompt (qualifying agent persona + 5 questions + edge case rules from `Build Plan - Backend Reference v1.md` 0.5 and 1.3), full history, instruction to return JSON `{ reply, extractedFields, classification, classificationReason }`
- Parse JSON, return reply text to webhook handler, persist updated state
- Every Claude call wrapped in a Langfuse span under the session's parent trace

**Tests:** unit tests with a stubbed Claude client returning canned JSON; assert state transitions, extraction merging, classification updates.

### Phase 1b.5 — Airtable writes (4 hours)

On session complete or abandoned:
- `createLead({ ...session, status, classification, ... })` → returns Airtable record ID
- Field mapping mirrors the `Lead` TS type from `src/lib/types.ts` (1:1)
- Migration to Postgres later: this module's interface stays the same, only the implementation swaps

### Phase 1b.6 — Hot-lead notifier (4 hours)

On classification = hot AND not yet notified:
- Send Meta-approved template message to the human agent's WhatsApp number via AISensy outbound
- Template variables: lead name, destination, dates, group size, budget, Airtable record URL
- Write `agent_notified_at` timestamp back to the Airtable record
- Retry once after 30 seconds on AISensy failure, then log error to Langfuse and surface in `/intake` UI

### Phase 1b.7 — `/api/leads` and hook swap (1 day)

`GET /api/leads`: reads from Airtable, returns `Lead[]` matching the existing UI contract.
`GET /api/leads/[id]`: returns the full `Lead` including messages and extracted fields.
`PATCH /api/leads/[id]`: accepts partial Lead, supports manual classification override (sets `classificationSource: "user"`) and assignment changes (sets `assignedToId`).

Then update `src/lib/hooks/use-leads.ts` to `fetch()` from these endpoints instead of the mock store. The `MOCK_LEADS` import goes away. Every Phase 1a test must still pass against the live data source (verified with a test seed of 3 known Airtable records).

For live updates of the in-progress conversation, the dashboard polls `/api/leads/[id]` every 3 seconds when the lead is viewed (cheap, simple, good enough for v1). SSE deferred.

### Phase 1b.8 — Admins CRUD and lead assignment (4-6 hours)

**Added 2026-05-27** to support the team-assignment workflow shipped in the Phase 1a refresh.

**Airtable schema additions:**
- New `Admins` table: `Name`, `Email`, `Initials`, `Color`, `Active` (checkbox)
- New fields on `Leads` table: `Classification source` (single-select: model / user), `Assigned to` (link to Admins, single record)

**API endpoints:**
- `GET /api/admins`: returns active admins
- `POST /api/admins`: creates an admin (name + email; initials and color derived)
- `DELETE /api/admins/[id]`: soft-deletes an admin (sets active=false to preserve historical lead assignments)
- `PATCH /api/leads/[id]` (extended): accepts `assignedToId` and `classification` + `classificationSource: "user"` for manual overrides

**Hook swap:**
- `use-admins.ts` body swaps from in-memory `_state` to `fetch("/api/admins")`
- `addAdmin` / `removeAdmin` swap to POST / DELETE

**UI already shipped (Phase 1a refresh):**
- Pagination at 10 leads per page with prev/next + numbered controls
- Classification filter chips (All / Hot / Warm / Cold / Qualifying)
- Assignee filter (Everyone / Unassigned / per-admin)
- Classification override dropdown on the lead detail header (sets source=user)
- Assignment dropdown on the lead detail header
- `/settings/admins` config panel with add and remove

**Why these changes:** The team wants the model to do the initial classification but reserve the right to override per-lead, and the operations manager wants to fan out leads across teammates so two people can work the backlog without stepping on each other. Without these, "hot" and "warm" stay purely model-decided and there is no way to load-balance.

### Phase 1b Success Criteria

- [ ] AISensy audit complete with all three capabilities confirmed (or pivot decision documented)
- [ ] Webhook receives a real inbound message and returns 200 within 5 seconds
- [ ] A complete 5-question conversation creates an Airtable record with all fields populated and a classification
- [ ] Hot classification triggers an outbound WhatsApp template message to the human agent within 2 minutes
- [ ] Every Claude call shows up in Langfuse Cloud dashboard with prompt, response, token count, latency
- [ ] `/intake` UI shows real leads from Airtable via the swapped hooks
- [ ] Manual classification override from the UI persists to Airtable and shows `classificationSource: user` in the badge
- [ ] Lead assignment from the UI persists to Airtable and the assignee filter narrows the list correctly
- [ ] `/settings/admins` add/remove persists to the Airtable Admins table
- [ ] Every Phase 1a Vitest test still passes (no regression from the data source swap)
- [ ] Pushed to GitHub and deployed to a Vercel preview URL

---

## Phase 2a — Leads Dashboard (Visual)

**Target:** 2 days. **Phase goal:** The sales agent's daily workspace — a table view of all leads with filters by classification, destination, urgency, and travel date.

### 2a.1 Table component

**Outputs:**
- Sortable, filterable table at `/leads`
- Columns: name, phone (masked), destination, dates, group size, budget, classification badge, urgency, last activity
- Click row → opens detail drawer (reuses 1a conversation + extraction view)
- TDD: render with mock data, sort, filter, row selection

### 2a.2 Filter bar

**Outputs:**
- Classification chips (Hot / Warm / Cold) — multi-select
- Destination dropdown (populated from mock data)
- Travel date range picker
- Urgency slider
- TDD: filter combinations narrow the table correctly

### 2a.3 Pipeline view (alt layout)

**Outputs:**
- Kanban toggle on `/leads`: columns for New / Contacted / Booked / Lost
- Drag to move (mock-only, persists in local state)
- TDD: drag-drop changes column membership

### Phase 2a Success Criteria

- [ ] `/leads` shows 50+ mock leads in both table and Kanban views
- [ ] Filters compose correctly, all tests green
- [ ] Sign-off

---

## Phase 2b — Leads Dashboard (Backend)

**Begins after 2a sign-off + 1b complete.** Maps to reference sections 1.5 (Airtable lead writer), 1.8 (Zoho sync if Option A), plus Phase 2 of the original plan (conversation summarizer 2.1, lead profile enrichment 2.2, Airtable dashboard configuration 2.3, Langfuse analytics enhancement 2.4).

The frontend hooks (`useLeads`, `useLead`) now read from `/api/leads` which proxies Airtable. Filters in the UI become Airtable filter formulas server-side.

### Phase 2b Success Criteria

- Inherits all reference Phase 2 success criteria
- Phase 2a UI now renders real lead data with no visual regression

---

## Phase 3a — Trips & Re-engagement (Visual)

**Target:** 2-3 days. **Phase goal:** The agent inputs a new trip, sees matched leads filter live, previews personalized messages, and confirms send — all visualized end-to-end with mock data.

### 3a.1 New trip form

**Outputs:**
- `/trips/new` form: destination, date range, price per person, seats, highlights (rich text), offer deadline
- TDD: validation, required fields, submit handler

### 3a.2 Match preview

**Outputs:**
- After form submit (mock), preview screen shows: total matched leads, breakdown by classification, sample lead cards
- Each matched lead card shows: name, destination preference, budget, why-this-matched explanation (mock string)
- TDD: empty match, partial match, full match

### 3a.3 Personalized message preview

**Outputs:**
- For each matched lead, a generated message preview (mock from a small set of templates with lead-name interpolation)
- Edit-before-send affordance per message (optional, marked v2)
- TDD: message renders with lead context

### 3a.4 Broadcast confirmation

**Outputs:**
- "Send to N leads" confirmation modal with rate-limit warning
- Post-send: progress indicator (mock animates "sending… 12 of 50")
- Final state: send summary with success/failure counts (mock)
- TDD: confirm, progress, summary

### Phase 3a Success Criteria

- [ ] Full flow from trip-input → match preview → message preview → confirm → summary, all with mock data
- [ ] Sign-off

---

## Phase 3b — Trips & Re-engagement (Backend)

**Begins after 3a sign-off + 2b complete.** Maps to reference Phase 3 sections 3.1-3.6.

---

## Phase 4a — Community & Referral (Visual)

**Target:** 1-2 days. **Phase goal:** Booked travellers' community view + referral leaderboard.

### 4a.1 Community panel

**Outputs:**
- `/community` shows booked travellers by trip, invite-link send status, welcome message status
- TDD covers status transitions

### 4a.2 Referral leaderboard

**Outputs:**
- Sorted by `referral_count` desc, with each referring traveller's referral funnel (count, conversion)
- TDD: sort, empty state

### Phase 4a Success Criteria

- [ ] Both screens render mock data convincingly
- [ ] Sign-off

---

## Phase 4b — Community & Referral (Backend)

**Begins after 4a sign-off + 3b complete.** Maps to reference Phase 4 sections 4.1-4.4.

---

## Phase 5 — Settings, Schema Designer, Conversation Designer

**Target:** 2-3 days. **Phase goal:** Admin surfaces where the schema, classification thresholds, and conversation flow are editable through UI (visual + backend together because admin changes have no value without persistence).

### 5.1 Schema designer

**Outputs:**
- `/settings/schema` lets the user view the five qualifying fields, edit names/types, add custom fields
- Writes back to Airtable schema via Airtable Meta API or a config file

### 5.2 Conversation designer

**Outputs:**
- `/settings/conversation` shows the agent's system prompt with edit fields for greeting, question sequence, tone, language
- "Test conversation" affordance: send a fake user message, see Claude's response live

### 5.3 Classification threshold editor

**Outputs:**
- `/settings/classification` shows current hot/warm/cold rules, lets user adjust budget threshold, date proximity, group size
- Writes back to a config table in Airtable

### Phase 5 Success Criteria

- [ ] All three admin screens functional with persistence
- [ ] Round-trip test: edit schema → new field appears in intake → new lead writes new field

---

## Phase 6 — Observability (Cross-cutting)

Langfuse self-hosted, threaded into every `b` phase. Reference: original 1.4 + 2.4. Not a sequential phase — it ships as part of each backend wiring step.

---

## Phase 7 — Vercel Deploy & Hardening

**Begins when Sapnil declares v1 frontend done.** Reference: original Cross-Cutting Concerns section (error handling, Meta policy compliance, security, Docker).

### 7.1 Frontend to Vercel

- Connect GitHub repo to Vercel
- Set env vars (Airtable, Claude, AISensy, Langfuse URLs)
- Preview deployments per PR

### 7.2 Backend to managed Docker host (Railway / Fly.io / Render)

- Decision per cost + region (India proximity matters)
- Langfuse stays on its own managed instance

### Phase 7 Success Criteria

- Public Vercel URL serves the dashboard
- Backend on managed Docker, reachable from Vercel
- AISensy webhook URL pointed at production backend
- End-to-end live test: real WhatsApp message → real Claude → real Airtable record → real UI render

---

## Cross-Cutting Concerns

### TDD discipline (Vitest + RTL)

Every component or hook ships with a behavior test written **first**:
1. Write a failing test that describes the user-facing behavior
2. Implement the minimum to pass
3. Refactor

The `tdd` skill governs the loop. No "I'll write tests later." Tests are commits, not afterthoughts.

### Mock data discipline

Mocks live in `app/lib/mock/`. Hooks live in `app/lib/hooks/`. The hook body is the **only place** that knows whether data is mock or real. Components never import mock data directly. This is the swap point for Phase Xb wiring.

### GitHub push cadence

Push at the end of every sub-phase (1a.1, 1a.2, ...) so Sapnil can pull and review. PR-per-phase is fine but not required for v1.

### Original backend specs preserved

Every backend concern in the original plan (AISensy capability audit, Zoho Bigin decision, Airtable schema, conversation design, Docker, Meta template approvals, security, secrets) is preserved in `Build Plan - Backend Reference v1.md` and consumed by the `b` phases above.

---

## Summary Timeline (UI-first)

| Phase | Name | Duration | Cumulative |
|---|---|---|---|
| 0 | Visual Foundation | 1-2 days | 1-2 days |
| 1a | Lead Intake — Visual | 2-3 days | 3-5 days |
| 1b | Lead Intake — Backend | 5-7 days | 8-12 days |
| 2a | Leads Dashboard — Visual | 2 days | 10-14 days |
| 2b | Leads Dashboard — Backend | 4-5 days | 14-19 days |
| 3a | Trips — Visual | 2-3 days | 16-22 days |
| 3b | Trips — Backend | 6-8 days | 22-30 days |
| 4a | Community — Visual | 1-2 days | 23-32 days |
| 4b | Community — Backend | 4-5 days | 27-37 days |
| 5 | Admin & Designers | 2-3 days | 29-40 days |
| 6 | Observability | parallel | — |
| 7 | Vercel + production hardening | 2-3 days | 31-43 days |

**Total estimated build time:** 31-43 business days from Phase 0 start. ~10 days faster than the backend-first plan because visual sign-off on each module prevents downstream rework.
