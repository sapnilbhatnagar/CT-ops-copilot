"use client";

import { useState } from "react";
import { SendHorizonal } from "lucide-react";

/**
 * Operator reply box. Sends the message into the thread; real delivery goes
 * through the WhatsApp Business API once connected (sim mode for now).
 */
export function MessageComposer({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState("");

  function submit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="shrink-0 border-t border-rule bg-panel px-6 py-3">
      <div className="flex items-end gap-2 rounded-2xl border border-rule bg-tile px-3 py-2 focus-within:border-accent">
        <textarea
          data-testid="composer-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder="Reply to this lead on WhatsApp…"
          className="max-h-32 min-h-[24px] flex-1 resize-none bg-transparent text-[14px] leading-relaxed text-ink placeholder:text-mute/60 focus:outline-none"
        />
        <button
          type="button"
          data-testid="composer-send"
          onClick={submit}
          disabled={text.trim().length === 0}
          aria-label="Send reply"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          <SendHorizonal className="size-4" />
        </button>
      </div>
      <div className="mt-1.5 px-1 text-[10.5px] text-mute">
        Sends via WhatsApp Business API · sim mode
      </div>
    </div>
  );
}
