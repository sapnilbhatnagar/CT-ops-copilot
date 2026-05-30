# Session Memory: Connecting Traveller Automation

**Last updated:** 2026-05-16  
**Facilitator:** Sapnil Bhatnagar  
**To resume:** Ask Claude to "read MEMORY.md and gain context on the Connecting Traveller project"

---

## What This Project Is

Connecting Traveller is a travel and tourism business in India. They run Meta ads that generate ~400 WhatsApp leads per campaign (at Rs 7,000 spend). Trip capacity is 10-12 seats, so 388-390 warm leads are lost per campaign with zero follow-up.

The goal is to build an agentic automation system that:
1. Captures and qualifies every inbound WhatsApp lead automatically
2. Profiles each lead and stores them in a database
3. Re-engages warm leads when new trips launch (without running another ad)

Full analysis is in: `Analysis and Approach Plan.md`

---

## Decisions Made (Do Not Re-Debate These)

1. WhatsApp API layer: AISensy (client already has this)
2. Backend: Python, containerized on Docker
3. AI Agent: Claude API (Sonnet 4.6)
4. Lead database and client dashboard: Airtable
5. AI observability: Langfuse (self-hosted on Docker)
6. Timeline: 4 weeks, compress where possible
7. Existing CRM in use: Zoho Bigin (integrate vs. replace decision still open)

---

## Build Phases (4 Weeks)

- Week 1: MVP -- intake agent, lead capture, Airtable storage, hot lead notification
- Week 2: Intelligence layer -- conversation summarization, user profile cards, dashboard
- Week 3: Re-engagement engine -- trip creation flow, matching, personalized broadcast
- Week 4: Community and referral automation

---

## Open Questions (Must Resolve Before PRD)

These two are blockers. Do not start building until answered.

**1. AISensy capability verification (blocks Week 1)**
- Does AISensy expose an inbound webhook so the Python backend can receive messages?
- Does it support programmatic outbound messaging via API?
- Does it support bulk/broadcast to multiple contacts (needed for Week 3)?
- Does it handle Meta's template message approval flow?
- If any of these are missing, a BSP layer (WATI or Interakt) must be added.

**2. Zoho Bigin: integrate or replace?**
- Option A -- Integrate: Python backend pushes lead profiles to Zoho Bigin via API. Zoho Bigin stays as CRM of record. Airtable is a real-time intake dashboard only.
- Option B -- Replace: Airtable becomes the single source of truth. Zoho Bigin retired for this use case.
- Recommendation: If the sales team lives in Zoho Bigin today, integrate. Otherwise Airtable alone is simpler.

**3. Trip cadence** -- how often does a new trip launch? (determines re-engagement queue design)

**4. Message volume timing** -- do the 400 messages arrive in a 24-48 hour burst post-ad, or spread over a week? (determines rate limiting design)

---

## Next Steps When Resuming

1. Get answers to the four open questions above (especially AISensy webhook + broadcast)
2. Once AISensy is confirmed, draft the full PRD:
   - User stories per phase
   - Acceptance criteria per story
   - Data model (lead schema in Airtable)
   - API contract (AISensy webhook --> Python backend --> Claude --> Airtable)
3. Start Week 1 build

---

## Files in This Folder

- `Analysis and Approach Plan.md` -- full first-principles analysis, tech stack, phase breakdown, observability design
- `Problem Space.md` -- original problem framing
- `Product Discovery 1.md` -- raw transcript from 2026-05-16 discovery session
- `MEMORY.md` -- this file
