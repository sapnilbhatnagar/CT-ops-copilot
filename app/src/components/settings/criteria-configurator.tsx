"use client";

import { useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import type { Campaign } from "@/lib/types";

/** Controlled editor for one campaign's qualifying criteria. */
export function CriteriaConfigurator({
  campaign,
  onAdd,
  onRemove,
}: {
  campaign: Pick<Campaign, "id" | "criteria">;
  onAdd: (label: string) => void;
  onRemove: (key: string) => void;
}) {
  const [newParam, setNewParam] = useState("");

  function submitParam(e: React.FormEvent) {
    e.preventDefault();
    if (!newParam.trim()) return;
    onAdd(newParam);
    setNewParam("");
  }

  return (
    <div className="space-y-3" data-testid="criteria-configurator">
      <div className="tile overflow-hidden" data-testid="criteria-list">
        <ul className="divide-y divide-rule">
          {campaign.criteria.map((c) => (
            <li
              key={c.key}
              data-testid={`criterion-${c.key}`}
              className="flex items-center gap-3 px-4 py-3"
            >
              <span className="flex size-5 items-center justify-center rounded-full bg-accent-quiet text-accent">
                <Check className="size-3" />
              </span>
              <span className="flex-1 text-[13.5px] text-ink">{c.label}</span>
              <span className="text-[10.5px] uppercase tracking-[0.12em] text-mute">
                {c.custom ? "Custom" : "Default"}
              </span>
              {c.custom ? (
                <button
                  type="button"
                  data-testid={`remove-criterion-${c.key}`}
                  onClick={() => onRemove(c.key)}
                  aria-label={`Remove ${c.label}`}
                  className="inline-flex size-7 items-center justify-center rounded-md text-mute transition-colors hover:bg-rule/50 hover:text-hot"
                >
                  <Trash2 className="size-3.5" />
                </button>
              ) : (
                <span className="inline-block size-7" />
              )}
            </li>
          ))}
        </ul>

        <form
          onSubmit={submitParam}
          className="flex items-center gap-2 border-t border-rule bg-canvas/60 px-4 py-3"
        >
          <input
            data-testid="criterion-input"
            value={newParam}
            onChange={(e) => setNewParam(e.target.value)}
            placeholder="Add a parameter, e.g. Occasion, Past traveller"
            className="flex-1 rounded-lg border border-rule bg-tile px-3 py-2 text-[13px] text-ink placeholder:text-mute/60 focus:outline-none"
          />
          <button
            type="submit"
            data-testid="add-criterion"
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-[12.5px] font-medium text-white transition-opacity hover:opacity-90"
          >
            <Plus className="size-3.5" />
            Add
          </button>
        </form>
      </div>

      <p className="text-[12px] leading-relaxed text-mute">
        These parameters drive the Live extraction panel on the Intake screen, and the AI intake
        agent extracts them from new WhatsApp conversations for this campaign.
      </p>
    </div>
  );
}
