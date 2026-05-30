/**
 * Server-side env reader. Each accessor throws if the env var is missing,
 * so a misconfigured deploy fails on the first request rather than silently
 * sending undefined values to Claude / AISensy.
 *
 * Use the accessor functions, not direct process.env reads, so tests can
 * stub by setting process.env before requiring the module under test.
 */

function required(name: string): string {
  const val = process.env[name];
  if (!val || val.trim() === "") {
    throw new Error(
      `Missing required env var: ${name}. See app/env.example for the full list.`,
    );
  }
  return val;
}

function optional(name: string, fallback: string): string {
  const val = process.env[name];
  return val && val.trim() !== "" ? val : fallback;
}

export const env = {
  anthropic: {
    apiKey: () => required("ANTHROPIC_API_KEY"),
    model: () => optional("ANTHROPIC_MODEL", "claude-sonnet-4-6"),
  },
  aisensy: {
    apiKey: () => required("AISENSY_API_KEY"),
    webhookSecret: () => required("AISENSY_WEBHOOK_SECRET"),
    agentPhone: () => required("AISENSY_AGENT_PHONE"),
    templateHotLead: () => optional("AISENSY_TEMPLATE_HOT_LEAD", "hot_lead_notification_v1"),
    templateGreeting: () => optional("AISENSY_TEMPLATE_GREETING", "intake_greeting_v1"),
  },
  airtable: {
    apiKey: () => required("AIRTABLE_API_KEY"),
    baseId: () => required("AIRTABLE_BASE_ID"),
    leadsTable: () => optional("AIRTABLE_LEADS_TABLE", "Leads"),
    tripsTable: () => optional("AIRTABLE_TRIPS_TABLE", "Trips"),
  },
  langfuse: {
    publicKey: () => required("LANGFUSE_PUBLIC_KEY"),
    secretKey: () => required("LANGFUSE_SECRET_KEY"),
    host: () => optional("LANGFUSE_HOST", "https://cloud.langfuse.com"),
  },
};
