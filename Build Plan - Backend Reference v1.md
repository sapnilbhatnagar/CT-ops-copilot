# Build Plan: Connecting Traveller Agentic WhatsApp Automation

---

## Document Metadata

- **Client:** Connecting Traveller (India travel/tourism)
- **Problem:** ~388 warm WhatsApp leads per campaign receive zero follow-up after trip capacity (10-12 seats) is filled
- **Solution:** WhatsApp-native lead CRM with AI intake agent and re-engagement broadcast engine
- **Last Updated:** 2026-05-17

---

## Architecture Overview

**Core Data Flow (Intake):**
Incoming WhatsApp message (via AISensy webhook) → FastAPI webhook receiver → Claude Sonnet 4.6 intake agent → structured lead profile → Airtable storage → hot lead notification via AISensy outbound API → all traces logged to Langfuse

**Core Data Flow (Re-engagement):**
Human inputs new trip → FastAPI trigger → Airtable lead filter query → Claude Sonnet 4.6 message personalizer → AISensy broadcast API → responses re-enter intake flow

**Infrastructure:** Python + FastAPI, Docker (all services containerized), Langfuse self-hosted on Docker

---

## Phase 0: Pre-Build Validation

**Target Timeline:** 3-5 business days

**Phase Goal:** Resolve all open technical questions that block architecture decisions, confirm the complete tech stack is viable, and produce a signed-off specification document so that Phase 1 build work begins with zero ambiguity.

---

### 0.1 AISensy Capability Audit

**Inputs:**
- AISensy account credentials (client-owned)
- AISensy documentation and support channel access

**Outputs:**
- Written confirmation (yes/no) for each of the following: inbound webhook support, programmatic outbound API support, bulk/broadcast messaging support
- If webhooks exist: webhook payload schema (exact JSON structure of an inbound WhatsApp message)
- If outbound API exists: API endpoint reference, authentication method, rate limits, and message template requirements
- If broadcast exists: broadcast API reference, daily/hourly volume limits, and opt-out handling behavior

**Performed by:** Technical lead (manual API documentation review + test API calls against AISensy sandbox or live account)

**Decision gate:** If AISensy does NOT support inbound webhooks, the entire architecture collapses. Alternative WhatsApp API providers (360dialog, Wati, or direct Meta Cloud API) must be evaluated before Phase 1 begins. This decision must be made and documented before any Phase 1 work starts.

---

### 0.2 Zoho Bigin Integration vs. Replacement Decision

**Inputs:**
- Zoho Bigin account access and current data schema (what fields are already populated)
- Zoho Bigin API documentation (available contacts endpoint, sync frequency limits, webhook support)
- Client input on: does the sales team actively use Zoho Bigin daily? Is Zoho Bigin connected to any other tools (email, billing)?

**Outputs:**
- A single documented decision: **Option A (Integrate)** or **Option B (Replace)**
  - Option A (Integrate): Airtable is the AI/automation layer, Zoho Bigin remains CRM of record. New leads created in Airtable are synced to Zoho Bigin via API. Human agents work from Zoho Bigin. Adds API sync complexity but preserves existing workflow.
  - Option B (Replace): Airtable becomes sole source of truth. Zoho Bigin is deprecated for new leads. Simpler architecture, removes a sync dependency, but requires client to change their daily workflow.
- If Option A: Zoho Bigin API field mapping document (which Airtable fields map to which Zoho Bigin fields)
- If Option B: Zoho Bigin data export plan (migrate existing contacts to Airtable before Phase 1 goes live)

**Performed by:** Technical lead (API audit) + client stakeholder (workflow decision)

---

### 0.3 Airtable Schema Design

**Inputs:**
- Five qualifying fields confirmed by client: name, destination, travel dates, group size, budget
- Lead classification categories: hot, warm, cold (with client-confirmed definitions for each)
- Zoho Bigin decision output from 0.2 (affects whether additional CRM fields are needed)
- AISensy webhook payload schema from 0.1 (affects which metadata fields to capture: WhatsApp phone number format, message timestamp format)

**Outputs:**
- Airtable base schema document specifying: all table names, all field names, field types (single line text, number, date, single select, etc.), and which fields are required vs. optional
- Confirmed lead classification logic: exact rules that define hot vs. warm vs. cold (example: hot = budget above threshold AND travel date within 60 days AND group size above 2)
- Airtable API key and base ID provisioned for use in Phase 1

**Performed by:** Technical lead with client input on classification thresholds

---

### 0.4 Development Environment Setup

**Inputs:**
- Docker installed on development machine
- Python 3.11+ confirmed available
- Langfuse self-hosted Docker image (public registry)
- Claude API key provisioned (Anthropic Console)
- AISensy API credentials from 0.1
- Airtable API credentials from 0.3

**Outputs:**
- Docker Compose file spec (not yet built, just the service list and port assignments confirmed): FastAPI app, Langfuse server, Langfuse PostgreSQL database, Langfuse ClickHouse (for analytics), Redis (if needed for queue)
- All API credentials documented in a .env template (variable names only, no actual values in the plan document)
- Local development environment confirmed reachable: FastAPI app responds to health check, Langfuse UI is accessible at its local port
- Confirmed ngrok or equivalent tunneling method for exposing local webhook endpoint to AISensy during development

**Performed by:** Technical lead

---

### 0.5 Intake Agent Conversation Design

**Inputs:**
- Five qualifying fields from the business requirements
- Client input on: brand tone of voice, language preference (English/Hindi/Hinglish), and whether the agent should identify itself as AI or human
- Expected lead behavior: will most users send a first message from a Meta ad CTA? What does that first message typically look like?

**Outputs:**
- Conversation flow document specifying: opening greeting message, exact sequence of the five qualifying questions, how the agent handles non-answers or off-topic responses, how the agent closes the conversation and sets expectations for follow-up
- Edge case handling specification: user sends voice note (unsupported), user sends image, user responds in Hindi, user asks a question mid-qualification flow, user abandons conversation after 2 questions
- Confirmation of maximum conversation turns before the agent either escalates or parks the lead as incomplete

**Performed by:** Technical lead + client stakeholder

---

### Phase 0 Dependencies

- Client must provide AISensy account access and Zoho Bigin account access on Day 1
- Client must be available for a 1-hour decision meeting to resolve Zoho Bigin and conversation design questions
- No code is written in Phase 0

### Phase 0 Handoff to Phase 1

- AISensy capability matrix (confirmed yes/no for webhook, outbound API, broadcast)
- AISensy webhook payload schema (exact JSON)
- Zoho Bigin decision document (integrate or replace, with field mapping if integrate)
- Airtable schema specification document
- Conversation flow document with edge case handling
- Docker Compose service list with confirmed port assignments
- .env variable name template
- Claude API key active and tested (confirmed model claude-sonnet-4-6 responds)

### Phase 0 Success Criteria

- [ ] AISensy inbound webhook: confirmed supported or confirmed not supported (no ambiguity)
- [ ] AISensy outbound API: confirmed supported with at least one successful test message sent programmatically
- [ ] Zoho Bigin decision: documented as either Option A or Option B with client signature/approval
- [ ] Airtable schema: all fields named and typed, base created, API access confirmed with a successful test read/write
- [ ] Conversation flow: reviewed and approved by client, all five qualifying questions confirmed
- [ ] Local environment: FastAPI health check returns 200, Langfuse UI is accessible at localhost

---

## Phase 1: Lead Capture and Storage MVP

**Target Timeline:** 10-14 business days (begins after Phase 0 handoff is complete)

**Phase Goal:** Every WhatsApp message sent to the business number is received, processed by the AI intake agent, qualified through a structured conversation, and stored as a lead record in Airtable, with hot leads triggering an immediate WhatsApp notification to the human agent, and every AI interaction traceable in Langfuse.

---

### 1.1 FastAPI Webhook Receiver

**Inputs:**
- AISensy webhook payload schema (from Phase 0 handoff)
- Confirmed AISensy webhook authentication method (shared secret, HMAC signature, or none)

**Outputs:**
- A running FastAPI endpoint that receives POST requests from AISensy
- Request validation: rejects malformed payloads, verifies webhook signature if AISensy provides one
- Message routing: extracts sender phone number, message text, and timestamp from the raw payload and passes them to the session manager
- An acknowledgment response returned to AISensy within the required timeout window (typically 200 OK within 5 seconds)

**Performed by:** FastAPI application (Python)

---

### 1.2 Conversation Session Manager

**Inputs:**
- Extracted message data from 1.1 (phone number, message text, timestamp)
- Conversation flow document (from Phase 0 handoff)

**Outputs:**
- Per-user conversation state stored in memory or a lightweight persistence layer (Redis or in-process dict with TTL): tracks which qualifying question the user is currently on, and stores partial answers
- Session creation on first message from a new phone number
- Session retrieval on subsequent messages from the same phone number
- Session expiry logic: if a user has not responded in N hours (client-confirmed threshold), the session is marked abandoned and the incomplete lead is stored

**Performed by:** FastAPI application session management layer

---

### 1.3 Claude Sonnet 4.6 Intake Agent

**Inputs:**
- Current conversation state from 1.2 (conversation history, questions answered so far)
- Incoming user message
- System prompt defining: agent persona, qualifying question sequence, edge case handling rules (from Phase 0 conversation flow document)
- Claude API key

**Outputs:**
- Next agent message (the response to send back to the user via AISensy)
- Structured extraction result when all five qualifying fields are collected: name (string), destination (string), travel dates (date range), group size (integer), budget (range or number in INR)
- Lead classification: hot, warm, or cold (based on logic confirmed in Phase 0)
- Confidence score or reasoning note attached to classification (for human review)
- A Langfuse trace ID associated with this conversation turn (passed to 1.4)

**Performed by:** Claude API (claude-sonnet-4-6) called from FastAPI application

**Note on prompt design:** The system prompt must instruct the model to return structured JSON for extraction and classification alongside the conversational reply text. The FastAPI layer parses the structured portion and sends only the reply text to WhatsApp.

---

### 1.4 Langfuse Observability Integration

**Inputs:**
- Every Claude API call made by the intake agent (1.3): prompt, response, model parameters, token counts
- Conversation session metadata: session ID (derived from phone number hash), session start time, number of turns
- Lead classification result and extracted fields
- Langfuse self-hosted instance URL and API keys

**Outputs:**
- A Langfuse trace for every conversation turn: includes the full prompt sent to Claude, the full response received, latency in milliseconds, input/output token counts, and associated cost
- A Langfuse span grouping all turns in a single lead qualification conversation under one parent trace
- Custom Langfuse scores attached to each completed lead: classification (hot/warm/cold) and whether all five fields were successfully extracted
- Langfuse dashboard accessible at its self-hosted URL, showing trace volume, average latency, and token cost per lead

**Performed by:** Langfuse SDK (Python) called within the FastAPI application, reporting to self-hosted Langfuse Docker instance

**Why first-class:** Without Langfuse in production from Day 1 of Phase 1, there is no visibility into why leads are being misclassified, why the agent gets stuck in loops, or what the real cost per lead is. Retrofitting observability after the fact means losing all historical trace data.

---

### 1.5 Airtable Lead Writer

**Inputs:**
- Structured lead profile from 1.3: name, destination, travel dates, group size, budget, classification, phone number, conversation timestamp
- Airtable base ID and API key (from Phase 0)
- Airtable schema specification (from Phase 0)

**Outputs:**
- A new record created in the Airtable leads table for every completed qualification conversation
- A new record (or status update) created for abandoned sessions, marked as incomplete with whatever fields were captured
- Return value: the Airtable record ID, stored back in the session for future updates

**Performed by:** Airtable REST API called from FastAPI application

---

### 1.6 Hot Lead Notifier

**Inputs:**
- Lead classification from 1.3 (only triggers when classification = hot)
- Airtable record ID from 1.5
- Lead summary: name, destination, travel dates, group size, budget
- AISensy outbound API credentials
- Human agent WhatsApp number (client-configured)
- Approved WhatsApp message template for hot lead notification (must be pre-approved by Meta via AISensy)

**Outputs:**
- A WhatsApp message sent to the human agent's number within 2 minutes of lead classification, containing: lead name, destination, travel dates, group size, budget, and a direct link or reference to the Airtable record
- A timestamp written to the Airtable record: "agent_notified_at"
- If the AISensy outbound API call fails: a retry attempt after 30 seconds, and an error logged to Langfuse

**Performed by:** AISensy outbound API called from FastAPI application (async background task to avoid blocking the webhook response)

---

### 1.7 AISensy Outbound Reply Sender

**Inputs:**
- Agent reply text from 1.3
- Sender phone number from 1.1
- AISensy outbound API credentials
- Session state from 1.2 (to determine if this is a free-form reply or must use a Meta-approved template)

**Outputs:**
- WhatsApp message delivered to the lead's phone number
- Delivery confirmation or error logged to the session

**Performed by:** AISensy outbound API called from FastAPI application

**Note on Meta template restrictions:** WhatsApp Business API requires Meta-approved templates for the first outbound message to a user (or after 24 hours of inactivity). The conversation flow must account for this. The opening greeting sent to a new lead arriving from a Meta ad CTA must use an approved template. Subsequent replies within the 24-hour window can be free-form.

---

### 1.8 Zoho Bigin Sync (Conditional on Phase 0 Decision)

**Inputs (only if Option A was chosen in Phase 0):**
- Completed lead profile from Airtable (record ID + all fields)
- Zoho Bigin API credentials
- Field mapping document from Phase 0

**Outputs:**
- New contact record created in Zoho Bigin with mapped fields populated
- Zoho Bigin contact ID written back to the Airtable record as a reference field

**Performed by:** Zoho Bigin API called from FastAPI application (async background task, non-blocking)

**Note:** If Option B (replace) was chosen in Phase 0, this subcomponent is skipped entirely.

---

### Phase 1 Dependencies

- All Phase 0 handoff items must be complete and signed off
- Meta-approved WhatsApp message templates must be submitted and approved before Phase 1 testing begins (Meta approval can take 24-48 hours and must be initiated during Phase 0)
- Langfuse Docker containers must be running and reachable before the first test message is sent
- Airtable base must be created with the confirmed schema before 1.5 is built

### Phase 1 Handoff to Phase 2

- Live FastAPI service running in Docker, receiving real AISensy webhooks
- Airtable base populated with real lead records from test runs (minimum 20 test leads with varied inputs)
- Langfuse instance populated with traces from all test conversations
- Confirmed message templates (approved by Meta) for opening greeting and hot lead notification
- Session state management logic confirmed working for multi-turn conversations
- Hot lead notification confirmed delivered within 2 minutes in end-to-end tests
- Airtable record schema confirmed stable (no further schema changes expected)

### Phase 1 Success Criteria

- [ ] A WhatsApp message sent to the business number generates a Langfuse trace within 10 seconds
- [ ] A complete 5-question qualification conversation results in a new Airtable record with all five fields populated and a classification value
- [ ] A hot lead classification triggers a WhatsApp notification to the human agent within 2 minutes of the final qualifying answer
- [ ] An abandoned conversation (user stops responding) creates an Airtable record marked incomplete with whatever fields were captured
- [ ] Zero WhatsApp messages are lost: every inbound message from AISensy webhook creates at least one Langfuse trace
- [ ] Langfuse dashboard shows per-trace token counts and latency for 100% of intake agent calls (no untraced calls)
- [ ] If Zoho Bigin Option A: every completed lead in Airtable has a corresponding Zoho Bigin contact ID within 60 seconds

---

## Phase 2: Intelligence Layer

**Target Timeline:** 8-10 business days (begins after Phase 1 success criteria are met)

**Phase Goal:** Every lead in Airtable has a human-readable profile card with a conversation summary and enriched metadata, and the human agent can see all lead information in a structured Airtable dashboard without reading raw conversation transcripts.

---

### 2.1 Conversation Summarizer

**Inputs:**
- Full conversation transcript for a completed or abandoned session (stored in session state or reconstructed from Langfuse traces)
- Claude API (claude-sonnet-4-6)
- Langfuse trace context (parent trace ID for the conversation)

**Outputs:**
- A 2-4 sentence plain-language summary of the lead's travel intent, written for a human sales agent to read (example: "Priya is planning a group trip of 4 to Rajasthan in October. Budget is approximately Rs 15,000 per person. She seemed enthusiastic but was vague on exact dates.")
- Summary written to the Airtable lead record in a dedicated long-text field
- A new Langfuse trace for the summarization call (separate from intake traces, tagged as "summarization" generation type)

**Performed by:** Claude API called from FastAPI application as a post-conversation async task (triggered when a session closes)

---

### 2.2 Lead Profile Card Enrichment

**Inputs:**
- Structured fields from the Airtable lead record (Phase 1 output)
- Conversation summary from 2.1
- Lead classification and confidence note from Phase 1 intake agent

**Outputs:**
- Airtable record updated with enriched fields: trip type inference (adventure, leisure, pilgrimage, honeymoon, etc. based on destination and group composition), urgency score (derived from travel date proximity to today), and a human-readable "next action" suggestion (example: "Call within 24 hours. Pilgrimage group with fixed dates.")
- All enrichment fields written to existing Airtable fields (no schema changes from Phase 1)

**Performed by:** Claude API (enrichment prompt) called from FastAPI application, results written via Airtable API

---

### 2.3 Airtable Dashboard Configuration

**Inputs:**
- Stable Airtable schema from Phase 1
- Enriched fields from 2.1 and 2.2
- Client input on: which views are most useful (by classification, by destination, by travel date, by urgency score)

**Outputs:**
- Airtable views configured (this is configuration work inside Airtable, not code): one view per classification (hot/warm/cold), one view filtered to leads with travel dates within 30 days, one view sorted by urgency score descending
- Each record in the hot view shows: name, phone number, destination, travel dates, group size, budget, conversation summary, next action suggestion, and agent_notified_at timestamp
- A gallery or Kanban view for the human agent to move leads through a simple pipeline (New, Contacted, Booked, Lost)

**Performed by:** Technical lead configuring Airtable views (no code required)

---

### 2.4 Langfuse Analytics Enhancement

**Inputs:**
- All traces from Phase 1 (intake conversations)
- New traces from 2.1 (summarization)
- New traces from 2.2 (enrichment)

**Outputs:**
- Langfuse dataset created: a labeled set of completed lead conversations tagged with their final classification (hot/warm/cold), for future prompt evaluation
- Langfuse evaluations configured: automatic scoring of summarization output quality (using a separate LLM-as-judge call) to detect when summaries are too short, missing key fields, or hallucinating information not in the transcript
- Langfuse dashboard panels added: cost per lead (total tokens across intake + summarization + enrichment), average turns to qualification, abandonment rate by conversation turn

**Performed by:** Langfuse SDK and Langfuse UI configuration, called from FastAPI application

---

### Phase 2 Dependencies

- Phase 1 must be live with at least 20 real or realistic test lead records in Airtable before 2.3 dashboard configuration is meaningful
- Client must review and approve the conversation summary format (2.1) before it is added to Airtable as a permanent field (because the summary is what the human agent reads before calling a lead)
- Trip type inference categories (2.2) must be confirmed with the client before implementation (the client knows which trip types are relevant to their business)

### Phase 2 Handoff to Phase 3

- Airtable base with enriched lead records: every record has classification, summary, trip type, urgency score, and next action
- Confirmed Airtable field names for: destination (used for re-engagement filtering), travel date range (used for filtering), group size (used for filtering), classification (used for filtering)
- Langfuse dataset with labeled leads (used to evaluate re-engagement message quality in Phase 3)
- Client-approved Airtable dashboard views that the human agent is actively using

### Phase 2 Success Criteria

- [ ] Every completed lead conversation (from Phase 1 forward) has a conversation summary written to its Airtable record within 60 seconds of session close
- [ ] Every Airtable record has a non-null trip_type, urgency_score, and next_action field populated by the enrichment step
- [ ] The Airtable hot leads view shows all hot lead fields in a single view with no clicks to expand (all relevant fields visible in the table columns)
- [ ] Langfuse shows a separate span type for "summarization" calls, distinct from "intake" calls, with its own token cost tracked
- [ ] LLM-as-judge evaluation scores are appearing in Langfuse for at least 90% of summarization calls
- [ ] Client confirms (in writing or by Slack/email) that the Airtable dashboard is usable as their daily lead review tool

---

## Phase 3: Re-engagement Engine

**Target Timeline:** 10-14 business days (begins after Phase 2 success criteria are met)

**Phase Goal:** When the business launches a new trip, a human agent can input the trip details, and the system automatically identifies matching leads from Airtable, generates a personalized WhatsApp message for each match, sends the broadcast, and re-enters any responding leads into the intake qualification flow.

---

### 3.1 Trip Details Input Interface

**Inputs:**
- Human agent input: new trip destination, travel dates, price per person, available seats, trip highlights (free text), and any special offer or deadline

**Outputs:**
- A structured trip object stored in Airtable in a separate Trips table: destination, travel_date_start, travel_date_end, price_per_person, seats_available, highlights_text, offer_deadline, created_at, broadcast_status (pending/sent/complete)
- This can be a simple Airtable form (no custom UI required) or a minimal FastAPI endpoint that accepts a JSON body

**Performed by:** Human agent (data entry via Airtable form or API call), Airtable as storage

---

### 3.2 Lead Filter and Matching Engine

**Inputs:**
- Structured trip object from 3.1
- Airtable leads table (full dataset with enriched fields from Phase 2)
- Matching logic rules (client-confirmed in Phase 0 or Phase 2): match by destination overlap, travel date overlap (lead's desired dates within N weeks of trip dates), budget compatibility (lead budget >= trip price per person), and classification (warm + hot, exclude cold unless explicitly included)

**Outputs:**
- A filtered list of Airtable lead record IDs that match the trip criteria
- Match count logged before broadcast is triggered (human agent must confirm before send)
- Each matched lead record tagged with the trip ID in a "re_engagement_trips" field for tracking

**Performed by:** FastAPI application querying Airtable API with filter formulas, applying secondary filtering logic in Python

---

### 3.3 Personalized Message Generator

**Inputs:**
- Each matched lead's enriched profile (name, destination preference, trip type, conversation summary, budget range) from Airtable
- Trip details from 3.1 (destination, dates, price, highlights, offer)
- Claude API (claude-sonnet-4-6)
- Approved WhatsApp re-engagement message template (must be Meta-approved before Phase 3 begins)
- Brand tone and language guidelines (confirmed in Phase 0)

**Outputs:**
- A personalized message text for each lead (personalization uses the lead's name, their stated destination or trip type preference, and a relevant hook from the trip highlights)
- Messages are generated in batch but stored individually per lead record in Airtable (in a "pending_reengagement_message" field) before sending
- A Langfuse trace for each message generation call, tagged as "reengagement_generation", with the lead ID and trip ID as metadata

**Performed by:** Claude API called from FastAPI application (batch processing, rate-limited to avoid AISensy send limits)

**Note on Meta template compliance:** The re-engagement message must use a Meta-approved template structure. The personalization is injected into template variable slots, not sent as free-form text. The template must be designed in Phase 0 or early Phase 3 and submitted for Meta approval before this subcomponent runs in production.

---

### 3.4 Broadcast Send Orchestrator

**Inputs:**
- Matched lead list from 3.2
- Personalized messages from 3.3 (pre-staged in Airtable)
- Human agent confirmation (a manual approval step before broadcast begins)
- AISensy broadcast/bulk send API
- Send rate limit (AISensy and Meta limits on messages per second/minute)

**Outputs:**
- WhatsApp messages sent to all matched leads via AISensy, rate-limited to comply with API constraints
- Each Airtable lead record updated with: reengagement_sent_at timestamp, reengagement_message_text (what was sent), reengagement_trip_id (which trip triggered this)
- Trip record in Airtable updated: broadcast_status set to "sent", total_sent count populated
- All send attempts (success and failure) logged to Langfuse as events under the trip's broadcast trace

**Performed by:** FastAPI application async task, AISensy broadcast API

---

### 3.5 Re-engagement Response Handler

**Inputs:**
- Inbound WhatsApp replies from leads who respond to the broadcast
- These arrive via the same AISensy webhook as Phase 1 (1.1)
- Session state manager from Phase 1 (1.2)

**Outputs:**
- Responding leads are re-entered into the intake agent flow (Phase 1 module reused)
- The session is initialized with context: "this lead was previously qualified, they are responding to a trip re-engagement for [destination] on [dates]"
- The intake agent uses this context to skip re-asking questions already answered, and instead focuses on confirming interest and moving the lead to hot classification
- If the lead re-qualifies as hot, the hot lead notifier (1.6) is triggered with an updated notification that references the re-engagement context

**Performed by:** Phase 1 modules reused (1.2, 1.3, 1.6), with modified system prompt context for re-engagement sessions

---

### 3.6 Conversion Tracking

**Inputs:**
- Re-engagement session outcomes from 3.5
- Human agent input (manual): when a lead books, the agent marks the Airtable record as "Booked" and records which trip they booked

**Outputs:**
- Airtable records updated with: reengagement_response (yes/no), reengagement_reclassification (hot/warm/cold/no_response), booked (boolean), booked_trip_id
- Airtable view showing re-engagement funnel per trip: total sent, total responded, total reclassified as hot, total booked
- Langfuse dataset updated with re-engagement conversation outcomes (for future prompt improvement)

**Performed by:** FastAPI application (automated fields) + human agent (manual booking confirmation in Airtable)

---

### Phase 3 Dependencies

- Phase 2 Airtable enrichment fields (especially destination, travel_date, budget, classification) must be populated and stable before the filter engine (3.2) is built
- Meta-approved re-engagement message template must be approved before 3.3 can send to real leads
- AISensy bulk/broadcast API must have been confirmed in Phase 0 as supported (if not supported, an alternative send strategy using the standard outbound API in a loop must be designed)
- Client must confirm the lead matching criteria (destination overlap logic, date window, budget threshold) before 3.2 is built

### Phase 3 Handoff to Phase 4

- Re-engagement engine live and tested with at least one real trip broadcast (even a small batch)
- Conversion tracking in Airtable showing funnel data for at least one campaign
- Langfuse traces for broadcast generation and re-engagement conversations, distinct from intake traces
- Confirmed that re-engagement response handler correctly re-enters leads into the intake flow without re-asking answered questions
- Airtable Trips table schema confirmed stable

### Phase 3 Success Criteria

- [ ] A human agent can input a new trip and receive a filtered lead count within 60 seconds
- [ ] Personalized messages are generated for all matched leads before the agent clicks "confirm send" (staging is complete before broadcast begins)
- [ ] 100% of matched leads receive their WhatsApp message within the AISensy rate limit window (no silently dropped sends)
- [ ] Every send attempt (success or failure) is logged in Airtable and in Langfuse
- [ ] A lead who responds to a broadcast is re-entered into the intake flow and does not receive a duplicate opening question for information already collected in Phase 1
- [ ] A lead who re-qualifies as hot after re-engagement triggers a human agent notification within 2 minutes (same SLA as Phase 1)
- [ ] Airtable re-engagement funnel view shows accurate counts for sent, responded, and booked for at least one completed trip broadcast

---

## Phase 4: Community and Referral

**Target Timeline:** 10-14 business days (begins after Phase 3 success criteria are met)

**Phase Goal:** Leads who book a trip are automatically added to a WhatsApp community, receive a structured onboarding welcome, and the system captures referral information when a booked traveller shares the number with a friend.

---

### 4.1 Booking-Triggered Community Enrollment

**Inputs:**
- Airtable record update: booked field set to true (from Phase 3 conversion tracking)
- WhatsApp Community ID or Group ID (client must create and provide this)
- AISensy outbound API (for sending the community invite link, since AISensy may not support programmatic group addition)

**Outputs:**
- A WhatsApp message sent to the booked lead with a community invite link and a welcome note referencing their specific trip (destination and dates)
- Airtable record updated: community_invited_at timestamp, community_joined (boolean, updated manually or via webhook if AISensy supports group join events)

**Performed by:** FastAPI application watching Airtable for booked status changes (via polling or Airtable webhook), AISensy outbound API

**Note on WhatsApp Community mechanics:** Meta's WhatsApp API does not currently support programmatic addition of users to groups or communities. The automation can send the invite link but cannot force-add users. This must be confirmed with AISensy before 4.1 is built.

---

### 4.2 Member Welcome Flow

**Inputs:**
- Confirmed community join event (if AISensy supports it) or a manual trigger from the human agent
- Booked lead's Airtable profile: name, trip destination, travel dates, group size
- Claude API (claude-sonnet-4-6)
- Approved WhatsApp welcome message template

**Outputs:**
- A personalized welcome message sent to the new community member: uses their name, references their trip, sets expectations for what the community provides (trip updates, co-traveller introductions, packing tips)
- A follow-up message scheduled (or queued) for 48 hours later: a "meet your co-travellers" prompt if multiple members are on the same trip
- Airtable record updated: welcome_message_sent_at timestamp

**Performed by:** Claude API for message generation, AISensy outbound API for delivery, FastAPI for orchestration

---

### 4.3 Referral Capture

**Inputs:**
- Inbound WhatsApp messages from new phone numbers where the first message references a booked traveller's name or contains a referral signal (example: "Priya told me about your Rajasthan trip")
- These arrive via the Phase 1 webhook (1.1)

**Outputs:**
- The intake agent (Phase 1) is triggered as normal for the new lead
- The referral signal is detected in the first message (keyword matching or Claude classification)
- If a referral is detected: the new lead's Airtable record is created with a referral_source field populated with the referring traveller's name or phone number
- The referring traveller's Airtable record is updated: referral_count incremented
- A thank-you or acknowledgment message sent to the new lead that validates the referral context (example: "Priya has great taste! Let me help you plan your trip.")

**Performed by:** Phase 1 intake agent (modified system prompt to detect referral signals), FastAPI application for referral linking, Airtable API for record updates

---

### 4.4 Referral Analytics in Airtable and Langfuse

**Inputs:**
- Airtable lead records with referral_source populated
- Airtable booked traveller records with referral_count populated
- Langfuse traces tagged as "referral_intake" vs. "organic_intake"

**Outputs:**
- Airtable view: referral leaderboard (booked travellers sorted by referral_count descending)
- Airtable view: referral conversion rate (referred leads vs. referred leads who book)
- Langfuse tag: all intake conversations from referred leads tagged for comparison of qualification quality and conversion rate vs. organic leads

**Performed by:** Airtable view configuration (no code), Langfuse tagging in FastAPI application

---

### Phase 4 Dependencies

- Phase 3 conversion tracking (booked field in Airtable) must be live and populated before 4.1 can trigger
- Client must create and provide the WhatsApp Community or Group before 4.1 is built
- Meta-approved welcome message template must be submitted and approved before 4.2 goes live
- WhatsApp Community API mechanics must be confirmed (programmatic group addition vs. invite link only) before 4.1 architecture is finalized

### Phase 4 Handoff (Final System State)

- End-to-end automation live: new lead arrives via Meta ad, is qualified by AI, stored in Airtable, classified, human agent notified if hot, re-engaged when new trips launch, books a trip, joins community, and generates referrals that re-enter the top of the funnel
- Airtable is the single operational dashboard for all lead states
- Langfuse captures the full cost and quality profile of every AI call across all four modules
- All FastAPI services running in Docker with confirmed restart policies

### Phase 4 Success Criteria

- [ ] A lead whose Airtable record is marked "Booked" receives a community invite message within 10 minutes of the status change
- [ ] A new WhatsApp message containing a referral signal results in a lead record with a non-null referral_source field
- [ ] The referring traveller's referral_count in Airtable increments within 60 seconds of the referred lead's first message
- [ ] Airtable referral leaderboard view is populated and sortable with no manual data entry required
- [ ] Langfuse distinguishes referred intake traces from organic intake traces in its filtering interface

---

## Cross-Cutting Concerns (Applies to All Phases)

### Error Handling and Resilience

- Every AISensy API call must have a retry policy with exponential backoff (maximum 3 retries before logging to Langfuse as a failed event)
- Every Claude API call must have a fallback response for rate limit errors (a pre-written holding message sent to the user: "I'll be right with you")
- Every Airtable write must be confirmed with the returned record ID before the session proceeds

### Meta WhatsApp Policy Compliance

- All outbound messages outside the 24-hour user-initiated window must use Meta-approved templates
- Opt-out handling: any user who replies "STOP" or equivalent must be flagged in Airtable (opted_out = true) and excluded from all future broadcasts
- Template submissions must be planned 48-72 hours in advance of any phase go-live that introduces a new outbound message type

### Security and Secrets Management

- All API keys (Claude, AISensy, Airtable, Zoho Bigin, Langfuse) are stored in environment variables only, never in code
- Phone numbers in Langfuse traces are hashed (SHA-256 of phone number used as session ID), never stored as plaintext in the observability layer
- AISensy webhook endpoint must validate the webhook signature or shared secret on every incoming request

### Docker Service Architecture

- Services in Docker Compose: FastAPI app, Langfuse server, Langfuse PostgreSQL, Langfuse ClickHouse, Redis (session state cache)
- All services must have defined restart policies (restart: unless-stopped)
- Langfuse data must persist via Docker volumes (database files must survive container restarts)

---

## Summary Timeline

| Phase | Name | Duration | Cumulative |
|---|---|---|---|
| Phase 0 | Pre-Build Validation | 3-5 days | 3-5 days |
| Phase 1 | Lead Capture and Storage MVP | 10-14 days | 13-19 days |
| Phase 2 | Intelligence Layer | 8-10 days | 21-29 days |
| Phase 3 | Re-engagement Engine | 10-14 days | 31-43 days |
| Phase 4 | Community and Referral | 10-14 days | 41-57 days |

**Total estimated build time:** 41-57 business days from Phase 0 start to Phase 4 complete.
