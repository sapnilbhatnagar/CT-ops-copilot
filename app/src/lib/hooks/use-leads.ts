"use client";

import { useCallback, useEffect, useState } from "react";
import type { Lead, Classification, ExtractedField, Message } from "@/lib/types";
import { MOCK_LEADS } from "@/lib/mock/leads";

type LeadsState = {
  leads: Lead[];
  loading: boolean;
};

const MOCK_LATENCY_MS = 250;

function sortByActivity(leads: Lead[]): Lead[] {
  return [...leads].sort(
    (a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime(),
  );
}

let _state: Lead[] = sortByActivity(MOCK_LEADS);
const _subscribers = new Set<(next: Lead[]) => void>();
function publish() {
  for (const s of _subscribers) s([..._state]);
}

export function useLeads(): LeadsState & {
  updateLead: (id: string, partial: Partial<Lead>) => void;
  advanceConversation: (id: string) => void;
} {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => {
      setLeads([..._state]);
      setLoading(false);
    }, MOCK_LATENCY_MS);
    const onChange = (next: Lead[]) => setLeads(next);
    _subscribers.add(onChange);
    return () => {
      clearTimeout(id);
      _subscribers.delete(onChange);
    };
  }, []);

  const updateLead = useCallback((id: string, partial: Partial<Lead>) => {
    _state = _state.map((l) => (l.id === id ? { ...l, ...partial } : l));
    publish();
  }, []);

  const advanceConversation = useCallback((id: string) => {
    _state = _state.map((l) => {
      if (l.id !== id) return l;
      if (!l.pendingMessages || l.pendingMessages.length === 0) return l;
      const [next, ...rest] = l.pendingMessages;
      const messages: Message[] = [...l.messages, next];
      let extractedFields: ExtractedField[] = l.extractedFields;
      if (l.pendingExtractions) {
        extractedFields = l.extractedFields.map((f) => {
          const u = l.pendingExtractions?.find((p) => p.key === f.key);
          return u ?? f;
        });
      }
      const classification: Classification = l.pendingClassification ?? l.classification;
      return {
        ...l,
        messages,
        extractedFields,
        classification,
        lastActivityAt: next.timestamp,
        pendingMessages: rest.length > 0 ? rest : undefined,
      };
    });
    publish();
  }, []);

  return { leads, loading, updateLead, advanceConversation };
}
