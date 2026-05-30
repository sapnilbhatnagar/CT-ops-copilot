import "server-only";
import { Langfuse } from "langfuse";
import { env } from "./env";

let _client: Langfuse | null = null;

function client(): Langfuse {
  if (_client) return _client;
  _client = new Langfuse({
    publicKey: env.langfuse.publicKey(),
    secretKey: env.langfuse.secretKey(),
    baseUrl: env.langfuse.host(),
  });
  return _client;
}

/**
 * Start a session-scoped trace for a single conversation turn.
 * Session ID is SHA-256 of the lead's phone (never raw phone in traces).
 */
export function startTurnTrace(args: {
  sessionId: string;
  name: string;
  metadata?: Record<string, unknown>;
}) {
  return client().trace({
    name: args.name,
    sessionId: args.sessionId,
    metadata: args.metadata,
  });
}

/**
 * Ensures buffered events are flushed before serverless function shutdown.
 * Call at the end of every API route that uses Langfuse.
 */
export async function flushLangfuse(): Promise<void> {
  if (_client) {
    await _client.flushAsync();
  }
}
