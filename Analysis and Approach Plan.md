# Connecting Traveller: Agentic Automation -- Analysis and Approach Plan

**Date:** 2026-05-16 (original), updated 2026-05-26 with UI-first pivot
**Prepared by:** Claude (Sapnil Bhatnagar, facilitator)
**Based on:** Discovery session transcript + Problem Space notes

---

## 2026-05-26 Pivot: UI-First Execution

The original phasing (Phase 0 validate APIs → Phase 1 build backend → Phase 2 build dashboard) has been flipped. The new approach is **UI-first, module-by-module**:

1. Scaffold a Next.js 15 + TypeScript + Tailwind + shadcn/ui app on localhost
2. Build each module's visual layer first, with mock data behind hooks (`useLeads`, `useConversation`, etc.)
3. Get Sapnil's sign-off on each module's UX before any backend code is written for it
4. Then design the backend (FastAPI, Claude, Airtable, AISensy, Langfuse) to satisfy the hook contracts the UI already needs
5. Push to GitHub after each sub-phase; deploy to Vercel only after v1 is signed off

**Why this is better for this project:**

- The retention loop is the product. We can validate whether the dashboard makes that loop legible to the travel team without spending a single token of Claude budget. If the screen doesn't make the team confident they can review 400 leads in 20 minutes, no backend will save it.
- Backend architecture problems (AISensy capability gaps, Zoho integration choice, Airtable schema) become solvable from a position of "we already know what data shape the UI needs" rather than guessing.
- Sapnil can show the client a working visual prototype within ~5 days without exposing them to backend complexity.

**What this trade-off costs:**

- AISensy webhook reality is not validated until backend phases. If the BSP layer has a fundamental gap, we discover it later than the original plan would have. Mitigation: the UI is BSP-agnostic, so a switch to WATI / 360dialog / Meta Cloud API has zero UI impact.
- Token cost and latency profile remain mock until backend phases. Acceptable risk — the dominant uncertainty is UX, not cost.

**Design language locked:** 60% Impeccable (impeccable.style — generous whitespace, restrained palette, hierarchy through weight, anti-flourish) / 40% Product Sanctum (productsanctum.com — modular content cards, narrative-led copy, real-UI-as-design). Warm terracotta accent (`#C8553D`) chosen to evade the AI-generated-purple-gradient trap and lean travel/India.

**TDD discipline:** Every component or hook ships with a Vitest + React Testing Library behavior test written first, per the `tdd` skill (red → green → refactor).

**Full phased breakdown:** see `Build Plan.md`. Original backend specs preserved in `Build Plan - Backend Reference v1.md` and consumed by the `b` sub-phases per module.

---

## What I Read

Two files: a problem space summary and a raw discovery transcript from 2026-05-16. Both point to the same core failure: a broken retention loop where 97.5% of warm, paid-for leads disappear after initial contact.

---

## First Principles Breakdown

### The Unit Economics Expose the Real Problem

- Rs 7,000 in Meta spend generates 400 leads
- Cost per lead: Rs 17.50
- Leads converted: 10-12 (due to limited trip capacity)
- Cost per converted lead: Rs 583-700
- Leads with zero follow-up: 388-390
- Sunk cost of churned leads: ~Rs 6,825 (97.5% of ad spend is wasted)

The business does not have an acquisition problem. It has a retention infrastructure problem. Every campaign restarts from zero because nothing is stored, nothing is tracked, and nothing is re-engaged.

---

### Inductive Reasoning: What the Data Tells Us

From the pattern across campaigns:

- 400 people who message are not random -- they responded to an ad, which means they have real travel intent
- The 390 who did not convert were not disqualified -- they were capacity-constrained. The trip was full, not their wallet empty.
- A capacity-constrained warm lead is the highest-quality prospect you can have for your next campaign
- Re-engaging them costs near zero vs. Rs 17.50 to acquire a new one from scratch

Conclusion: the 390 churned leads per campaign are an appreciating asset the business is currently throwing away.

---

### Deductive Reasoning: What Must Be True for the Solution to Work

For the system to convert future trips without re-running ads, three things must hold:

1. Lead data must be captured at first contact -- name, destination interest, travel dates, budget range, group size
2. Leads must be categorized -- hot (ready now, seat available), warm (interested, no seat | interested, different dates, | interested, different destination ), cold (browsing)
3. Warm leads must be stored and re-contactable -- so when Trip 2 launches, they get the first outreach

If any of these three are missing, the loop stays broken.

---

## The Actual Product: What It Is and Is Not

This is not a chatbot. A chatbot is just the interface. The actual product is:

> A WhatsApp-native lead CRM with an AI intake agent that captures, qualifies, profiles, and stores every lead -- then enables broadcast re-engagement when new trips launch.

Two distinct modules:

### Module 1: Intake Agent (real-time)

Runs the moment a user sends a WhatsApp message.

```
User messages
  --> AI agent greets + asks qualifying questions
  --> Extracts: name, destination, travel window, group size, budget
  --> Classifies: hot / warm / cold
  --> If hot: escalates to human agent immediately (Slack or WhatsApp ping)
  --> If warm/cold: sends value (trip info, itinerary, FAQ) + captures profile
  --> Stores everything in lead database
```

### Module 2: Re-engagement Engine (async)

Runs when a new trip is announced.

```
New trip created by human
  --> System filters lead database by matching criteria (destination, dates, budget)
  --> AI generates personalized WhatsApp broadcast per matching lead
  --> Tracks responses
  --> Re-qualifies respondents
  --> Escalates hot leads to human agent
```

Community engagement is a third workstream but lower priority -- address after the core lead loop is working.

---

## Proposed Approach: 4 Phases

> The phases below are the **original (2026-05-16) backend-first** reasoning. Superseded on 2026-05-26 by the UI-first execution model documented at the top of this file and in `Build Plan.md`. They are retained here as historical context — every backend concern listed below is now consumed by a `b` sub-phase in the new Build Plan.

### Phase 0: Discovery Gaps to Fill Before Building

Before writing code, these questions need answers:

1. WhatsApp access -- Do they have WhatsApp Business API, or only the mobile app? This is the make-or-break technical dependency. API providers to consider for India: WATI, Interakt, Twilio, 360dialog.
2. Current lead storage -- Where do conversations live today? Screenshots? Spreadsheets? Nothing?
3. Trip cadence -- How often do new trips launch? This determines re-engagement frequency.
4. Message volume timing -- Do the 400 messages arrive in a burst (right after the ad) or spread over days?
5. Team operating model -- Is there one human reviewer, or multiple? What tool do they currently use?

---

### Phase 1: MVP -- Lead Capture and Storage (Target: Week 1)

Goal: Zero leads fall through. Every conversation is recorded and classified.

- Connect via AISenseAid (existing WhatsApp API layer -- see Open Questions for capability flags)
- Automated intake flow: greeting + 5 qualifying questions via AI agent (Claude API)
- Lead profile extraction: destination, dates, group size, budget, current intent
- Lead classification logic: hot / warm / cold
- Storage: Airtable (MVP, no-code-friendly) or Supabase (if they want to scale)
- Hot lead notification: Slack or WhatsApp ping to human agent within 2 minutes

Success criteria: 100% of WhatsApp messages trigger the intake flow. Human gets notified within 2 minutes of a hot lead arriving.

---

### Phase 2: Intelligence Layer (Target: Week 2)

Goal: The human agent arrives with full context, not blind.

- Conversation summarization (Claude API) after each session ends
- Auto-generated user profile card: 5-line summary per lead
- Simple dashboard: all leads, their status, their profile, their last conversation
- Warm lead tagging: e.g. "Interested in Spiti Valley, budget Rs 15k, group of 4, available June"

Success criteria: Human agent can review all 400 leads in under 20 minutes using the dashboard, instead of reading raw WhatsApp threads.

---

### Phase 3: Re-engagement Engine (Target: Week 3)

Goal: New trip launch reaches warm leads before a new ad is run.

- Trip creation flow: human inputs trip details (destination, dates, price, seats)
- Automated matching: system filters leads by compatible profiles
- Personalized broadcast: AI generates per-lead WhatsApp message referencing their specific stated interest
- Response handling: replies re-enter the intake agent flow automatically
- Conversion tracking: which re-engaged leads convert to paid bookings

Success criteria: At least 20% of warm leads from Campaign 1 re-engage for Campaign 2, reducing ad spend needed to fill seats.

---

### Phase 4: Community and Referral (Target: Week 4)

Goal: WhatsApp community becomes an active growth channel.

- Weekly community content automation (travel tips, destination spotlights, trip announcements)
- New member welcome flow
- Referral capture: "Know someone who would love this trip? Share this link"

---

## Recommended Tech Stack

WhatsApp API layer: AISensy (existing, client-owned)
- Verify before building: see Open Questions -- capability flags are critical

AI Agent: Claude API (Sonnet 4.6)
- Reason: Conversational quality, structured output for profile extraction, summarization

Backend: Python, containerized on Docker
- Reason: Client preference, portable, self-hosted, works cleanly with FastAPI + webhooks

Lead Database: Airtable
- Reason: Confirmed acceptable. No-code dashboard the business user can operate without a developer

Existing CRM: Zoho Bigin (already in use)
- Decision pending: integrate (sync lead profiles via Zoho Bigin API) or replace with Airtable
- See Open Questions

Notifications: WhatsApp (human agent) via the same AISensy connection
- Hot lead alert sent as a WhatsApp message to the reviewing agent

AI Observability: Langfuse (self-hosted, Docker-compatible)
- See section below for full rationale

---

## AI Observability and Traceability

This is a first-class requirement, not an afterthought. When AI is talking to real customers on behalf of the business, we need full visibility into every interaction.

### What We Need to See

1. How the AI interacts with real humans
   - Full conversation logs: every message sent and received, with timestamps
   - Session-level view: entire conversation per lead, not just individual turns
   - Handoff events: when and why a conversation was escalated to a human

2. What outputs the AI generates
   - Raw LLM input (prompt + context) and raw LLM output (response) per call
   - Token usage and latency per call (for cost and performance tracking)
   - Lead profile extracted per conversation (structured output)
   - Classification decision made (hot / warm / cold) with the reasoning

3. How we evaluate quality
   - Human scoring: agent reviews flagged conversations and scores AI responses (1-5)
   - LLM-as-judge: automated evaluation of response relevance and tone
   - Classification accuracy: spot-check whether the hot/warm/cold label was correct

4. Where observability lives
   - Langfuse, self-hosted on the same Docker setup as the Python backend
   - Every Claude API call is wrapped with Langfuse tracing (input, output, metadata)
   - Dashboard shows: conversation traces, latency, token cost, evaluation scores
   - Alerts: flag conversations where AI confidence is low or user sentiment is negative

### Why Langfuse

- Open source, runs in Docker alongside the Python backend (no external SaaS dependency)
- Native support for multi-turn conversation tracing (sessions)
- Built-in evaluation framework (human + automated scoring)
- Works with Claude via the Anthropic SDK with minimal instrumentation overhead
- Stores prompt versions, so when the agent prompt changes, old traces remain interpretable

### Instrumentation Pattern (Python)

```python
from langfuse import Langfuse
from anthropic import Anthropic

langfuse = Langfuse()
client = Anthropic()

def run_intake_agent(user_message: str, session_id: str):
    trace = langfuse.trace(name="intake-agent", session_id=session_id)
    span = trace.span(name="claude-response")

    response = client.messages.create(
        model="claude-sonnet-4-6",
        messages=[{"role": "user", "content": user_message}],
        ...
    )

    span.end(output=response.content[0].text)
    trace.update(metadata={"lead_classification": classify(response)})
    return response
```

This pattern means every conversation is traceable from first message to lead classification, with full input/output logged.

---

## Open Questions for Next Session

Confirmed answers:
- WhatsApp API layer: AISenseAid (existing)
- Backend: Python on Docker
- Database/dashboard: Airtable
- Observability: Langfuse (self-hosted)
- Timeline: 4 weeks target

Still open -- flag these before the PRD is finalized:

1. AISenseAid capability verification (CRITICAL -- blocks Phase 1)
   - Does AISenseAid expose an inbound webhook so the Python backend can receive messages?
   - Does it support programmatic outbound messaging via API (not just the WhatsApp app UI)?
   - Does it support bulk/broadcast to multiple contacts (required for Phase 3)?
   - Does it handle Meta's template message approval flow?
   - If any of these are missing, we need to add a BSP layer (WATI or Interakt) on top of or instead of AISenseAid.

2. Zoho Bigin: integrate or replace?
   - Option A -- Integrate: Python backend pushes lead profiles to Zoho Bigin via its API. Zoho Bigin remains the CRM of record. Airtable is used only as a real-time intake dashboard.
   - Option B -- Replace: Airtable becomes the single source of truth. Zoho Bigin is retired for this use case.
   - Recommendation: If the sales team already lives in Zoho Bigin, integrate (Option A). If they are open to a new tool, Airtable alone is simpler.

3. Trip cadence -- how often does a new trip launch? (determines re-engagement frequency design)

4. Message volume timing -- do the 400 messages arrive in a 24-48 hour burst post-ad, or spread over a week? (determines rate limiting and queue design)

Once questions 1 and 2 are resolved, the PRD with user stories and acceptance criteria can be drafted.

---

*This document is a live working artifact. Update after each discovery session.*

---

*This document is a live working artifact. Update after each discovery session.*
