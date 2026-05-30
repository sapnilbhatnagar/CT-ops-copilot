# Setup — What I Need From You to Wire Phase 1b

> Hand me everything in this doc and I can take Phase 1b from scaffold to live, end-to-end, in roughly 3-4 working days. Until I have it, the UI runs on mock data and the backend code is stubs only.

---

## TL;DR — the minimum I need

1. An Airtable base with two tables (Leads, Admins) created from the schema in §2
2. Six environment variable values (§1)
3. AISensy audit results (§3) — confirms our integration path or pivots to Meta direct
4. Two Meta-approved WhatsApp templates (§4) — submitted by you, approved by Meta over 24-48 hours
5. Your team's human-agent phone number (§5)

Everything else flows from these.

---

## 1. API credentials (six values)

| Var                                           | What it is                                                                                                      | Where to get it                                                                                                                                                 | Time    |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `ANTHROPIC_API_KEY`                           | Claude API key                                                                                                  | https://console.anthropic.com → Settings → API Keys → Create Key. Pick a workspace, add a payment method, set a monthly budget cap (suggest USD 50 for v1).     | 5 min   |
| `AISENSY_API_KEY`                             | AISensy API key                                                                                                 | AISensy dashboard → Settings → API → generate.                                                                                                                  | 2 min   |
| `AISENSY_WEBHOOK_SECRET`                      | A secret string you invent (any 32+ char random string) and configure in AISensy as the webhook signing secret. | You make this up. `openssl rand -hex 32` from a terminal.                                                                                                       | 1 min   |
| `AIRTABLE_API_KEY`                            | Airtable Personal Access Token                                                                                  | https://airtable.com/create/tokens → Create token. Scopes needed: `data.records:read`, `data.records:write`, `schema.bases:read`. Access: the new base from §2. | 3 min   |
| `AIRTABLE_BASE_ID`                            | ID of the base you create in §2                                                                                 | After creating the base, the ID is in the URL: `airtable.com/<BASE_ID>/...` (starts with `app`).                                                                | instant |
| `LANGFUSE_PUBLIC_KEY` + `LANGFUSE_SECRET_KEY` | Langfuse Cloud keys                                                                                             | https://cloud.langfuse.com → sign up → create project → Settings → API Keys. Free tier covers 50k observations/month, far above v1 volume.                      | 5 min   |

When you have all six, paste them to me (or, better, paste them into `app/.env.local` using `app/env.example` as the template). I will treat them as secrets and never echo them in code or commits.

---

## 2. Airtable schema (two tables)

Create one new base named "Connecting Traveller — Ops". Inside, build the two tables below. Field names matter and are case-sensitive — they map 1:1 to the fields the backend expects (see `app/src/lib/server/airtable.ts`).

### Table 1 — `Leads`

| Field name | Type | Notes |
|---|---|---|
| Phone (masked) | Single line text | Display only, e.g. "+91 98••• ••421" |
| Phone hash | Single line text | SHA-256 hash of the raw phone, used as the lead ID. Make this the primary field. |
| Name | Single line text |  |
| Destination | Single line text |  |
| Travel dates | Single line text | Freeform, e.g. "Oct 4 – Oct 10, 2026" |
| Group size | Single line text | Freeform, e.g. "4" or "2 (honeymoon)" |
| Budget | Single line text | Freeform, e.g. "₹15-20k / person" |
| Classification | Single select | Options: `hot`, `warm`, `cold`, `unclassified` |
| Classification source | Single select | Options: `model`, `user`. Tells whose call set the classification. |
| Classification reason | Long text | One sentence reasoning. |
| Assigned to | Link to another record → `Admins` (single record) | Who owns this lead. |
| Status | Single select | Options: `in_progress`, `complete`, `abandoned` |
| Source | Single select | Options: `meta_ad`, `referral`, `organic` |
| Language | Single select | Options: `en`, `hi`, `hinglish` |
| Started at | Single line text | ISO timestamp, e.g. "2026-05-27T14:00:00+05:30" |
| Last activity at | Single line text | ISO timestamp |
| Agent notified at | Single line text | ISO timestamp, blank until the hot-lead notification fires |
| Messages (JSON) | Long text | Serialized conversation transcript |
| Fields (JSON) | Long text | Serialized extracted fields with confidence |

### Table 2 — `Admins`

| Field name | Type | Notes |
|---|---|---|
| Name | Single line text | Primary field. |
| Email | Email |  |
| Initials | Single line text | 2-char, e.g. "SB" |
| Color | Single line text | Hex code, e.g. "#C8553D" |
| Active | Checkbox | Soft-delete flag. Inactive admins keep their lead-assignment history but are hidden from the assignment dropdown. |

Seed `Admins` with at least one row for yourself so I have something to test the assignment flow against.

Optional table 3 — `Trips` — comes later in Phase 3a. Don't worry about it for Phase 1b.

---

## 3. AISensy capability audit (half-day, you + their support)

We picked AISensy over Meta direct, but we agreed to confirm three capabilities first. The audit is a half-day of poking at their API. Find out:

### A. Inbound webhook

- [ ] Does AISensy let you point inbound WhatsApp messages at a custom HTTPS URL?
- [ ] What is the **exact JSON payload schema** of an inbound message webhook? Get a sample. Share it with me — I'll plug it into `app/src/lib/server/aisensy.ts` and replace the placeholder shape.
- [ ] What header carries the signature? Is the signature HMAC-SHA256? Of the raw body? With which secret?
- [ ] Maximum retry attempts on a non-2xx response?

### B. Outbound message API

- [ ] Endpoint URL for sending a text message to a phone number programmatically?
- [ ] Authentication scheme (Bearer token? Custom header?)?
- [ ] **Rate limits** — messages per second / minute / day?
- [ ] Endpoint URL for sending a template message (with variables)?

### C. Broadcast API

- [ ] Endpoint URL for sending the same template to a list of N contacts?
- [ ] Maximum contacts per call?
- [ ] Daily volume cap on broadcasts?

**Decision gate:** if all three are confirmed working in AISensy's sandbox, we stay with AISensy. If A or B fails, we pivot to Meta WhatsApp Cloud API direct — Phase 1b code stays the same except for the one file `aisensy.ts`, which becomes `meta-whatsapp.ts`.

A short bullet list of answers (with one sample webhook JSON pasted in a code block) is all I need from this audit.

---

## 4. Meta WhatsApp templates (you submit, Meta approves)

Two templates need Meta approval before Phase 1b goes live. Submit them through AISensy's template UI or Meta Business Manager. Approval takes 24-48 hours — start this on day one of Phase 1b.

### Template 1 — `intake_greeting_v1`

Category: **Utility**

Body (English; submit a Hindi version too if your audience needs it):

```
Hi {{1}}! Thanks for reaching out to Connecting Traveller. I'll help you plan your trip — can I get your name and where you'd like to go?
```

Variables:
- `{{1}}` — empty or "there" (we use this as a generic opener)

### Template 2 — `hot_lead_notification_v1`

Category: **Utility**

Body:

```
🌟 Hot lead

Name: {{1}}
Destination: {{2}}
Dates: {{3}}
Group: {{4}}
Budget: {{5}}

Open: {{6}}
```

Variables:
- `{{1}}` lead name
- `{{2}}` destination
- `{{3}}` travel dates
- `{{4}}` group size
- `{{5}}` budget
- `{{6}}` Airtable record URL (we generate this server-side)

If you want different copy, tell me before submitting — once Meta approves a template, changes require a new approval cycle.

---

## 5. Human-agent phone number

The phone number that receives the hot-lead notification messages. International format with country code, no spaces or dashes:

```
AISENSY_AGENT_PHONE=919876543210
```

This is the on-call sales person. Make sure they have WhatsApp installed on the number and have agreed to receive these alerts.

---

## 6. Local env setup (when you have all the values)

```bash
cd "/Users/sapnilbhatnagar/Documents/Product Prototypes/Connecting Traveller/app"
cp env.example .env.local
# open .env.local in your editor and paste in the six secrets + the two template names + the agent phone
```

Quick check that secrets load correctly:

```bash
npm run build   # should still pass; build doesn't actually call any external API
npm run dev     # localhost:3000 still runs against mocks until I swap the hook bodies in Phase 1b.7
```

---

## 7. GitHub repository (whenever you're ready)

You mentioned earlier that you'll provide a GitHub repo URL. Whenever it's ready:

1. Create the empty repo on GitHub
2. Share the URL with me, e.g. `git@github.com:yourname/connecting-traveller.git`

I will:
- `git remote add origin <url>` from `app/`
- Push the current branch
- Set up Vercel project linked to the repo
- Wire `.env.local` values into Vercel project env vars (preview + production)
- Confirm preview deploys on push

---

## 8. Order of operations once I have your inputs

| Day | Work | Blocker |
|---|---|---|
| 1 morning | Build `/api/admins` (CRUD), swap `useAdmins` hook to real | Airtable + keys |
| 1 afternoon | Build `/api/leads` (GET, GET/[id], PATCH), swap `useLeads` hook to real | Airtable + keys |
| 2 morning | Build `/api/whatsapp/webhook` route, parse + verify signature | AISensy audit complete |
| 2 afternoon | Build intake agent (Claude + Langfuse) | Anthropic + Langfuse keys |
| 3 morning | Wire outbound reply via AISensy, session state in memory | AISensy outbound confirmed |
| 3 afternoon | Wire hot-lead notifier, Airtable writes | Template approved |
| 4 morning | End-to-end test with a real WhatsApp number, fix issues |  |
| 4 afternoon | Deploy to Vercel preview, hand back to you for client demo | GitHub repo URL |

---

## Stuck on anything? Tell me at the moment of friction

Don't sit on a blocker waiting for an answer in the audit. Drop a single line in the conversation — "AISensy doesn't seem to have a broadcast endpoint, here's their docs link" — and I'll pivot the plan within an hour. The cost of an unresolved unknown compounds. The cost of asking compounds nothing.
