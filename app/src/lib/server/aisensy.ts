import "server-only";
import crypto from "node:crypto";
import { env } from "./env";

/**
 * AISensy outbound + webhook utilities.
 *
 * STATUS: scaffold. The exact API endpoint paths, payload shapes, and
 * signature scheme below are placeholders until Phase 1b.0 audit confirms
 * them against AISensy's documentation. The function signatures here
 * (sendText, sendTemplate, parseInboundWebhook, verifyWebhookSignature)
 * are stable and what the rest of the codebase imports — only the
 * implementation bodies should change after the audit.
 *
 * Phase 1b.0 audit checklist (fill these in before going live):
 *   - Outbound base URL                       : ?
 *   - Outbound auth header format             : ?
 *   - Outbound text endpoint + payload schema : ?
 *   - Template send endpoint + payload schema : ?
 *   - Inbound webhook payload schema          : ?
 *   - Signature header name + algorithm       : ?  (assumed HMAC-SHA256 below)
 *   - Rate limits                             : ?
 */

type SendResult = { ok: true; messageId?: string } | { ok: false; error: string };

const AISENSY_BASE_URL = "https://backend.aisensy.com"; // PLACEHOLDER — confirm in audit

export async function sendText(phone: string, text: string): Promise<SendResult> {
  try {
    const res = await fetch(`${AISENSY_BASE_URL}/api/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.aisensy.apiKey()}`,
      },
      body: JSON.stringify({ to: phone, type: "text", text: { body: text } }),
    });
    if (!res.ok) return { ok: false, error: `AISensy ${res.status}: ${await res.text()}` };
    const data = (await res.json()) as { messageId?: string };
    return { ok: true, messageId: data.messageId };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function sendTemplate(
  phone: string,
  templateName: string,
  variables: Record<string, string>,
): Promise<SendResult> {
  try {
    const res = await fetch(`${AISENSY_BASE_URL}/api/templates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.aisensy.apiKey()}`,
      },
      body: JSON.stringify({ to: phone, template: templateName, variables }),
    });
    if (!res.ok) return { ok: false, error: `AISensy ${res.status}: ${await res.text()}` };
    const data = (await res.json()) as { messageId?: string };
    return { ok: true, messageId: data.messageId };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * Inbound webhook payload as the audit will define it.
 * Shape below is the assumed-typical AISensy shape; revisit after audit.
 */
export type InboundWhatsappEvent = {
  phone: string;
  messageId: string;
  text: string | null;
  type: "text" | "voice" | "image" | "unknown";
  timestamp: string;
};

export function parseInboundWebhook(raw: unknown): InboundWhatsappEvent | null {
  if (typeof raw !== "object" || raw === null) return null;
  const body = raw as Record<string, unknown>;
  const phone = body.from ?? body.sender ?? body.phone;
  const text = body.text ?? body.body ?? body.message;
  const messageId = body.messageId ?? body.id;
  const timestamp = body.timestamp ?? new Date().toISOString();
  if (typeof phone !== "string" || typeof messageId !== "string") return null;
  return {
    phone,
    messageId,
    text: typeof text === "string" ? text : null,
    type:
      typeof text === "string"
        ? "text"
        : body.type === "voice"
        ? "voice"
        : body.type === "image"
        ? "image"
        : "unknown",
    timestamp: String(timestamp),
  };
}

/**
 * HMAC-SHA256 signature verification, assumed scheme.
 * Replace with AISensy's documented scheme after audit.
 */
export function verifyWebhookSignature(signature: string | null, rawBody: string): boolean {
  if (!signature) return false;
  const expected = crypto
    .createHmac("sha256", env.aisensy.webhookSecret())
    .update(rawBody, "utf8")
    .digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
