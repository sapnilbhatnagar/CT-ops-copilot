import "server-only";
import crypto from "node:crypto";

/**
 * SHA-256 hash of a phone number, used as the stable session/lead ID.
 * We never store raw phone numbers in Langfuse traces or session keys.
 */
export function hashPhone(phone: string): string {
  const normalized = phone.replace(/\D/g, "");
  return crypto.createHash("sha256").update(normalized).digest("hex").slice(0, 32);
}

/**
 * Mask the middle digits of a phone number for UI display.
 * "+919876543210" -> "+91 98••• ••210"
 */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return phone;
  const country = digits.length > 10 ? digits.slice(0, digits.length - 10) : "";
  const local = digits.slice(-10);
  const prefix = local.slice(0, 2);
  const suffix = local.slice(-3);
  return `${country ? `+${country} ` : ""}${prefix}••• ••${suffix}`;
}
