"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import type { Campaign, ItineraryDay } from "@/lib/types";
import { addDay, removeDay, moveDay, editDay, addItem, removeItem } from "@/lib/itinerary-editor";
import { StringListEditor } from "./string-list-editor";

const inputCls =
  "w-full rounded-lg border border-rule bg-tile px-3 py-2 text-[13.5px] text-ink placeholder:text-mute/50 focus:border-accent focus:outline-none";
const iconBtn =
  "inline-flex size-7 items-center justify-center rounded-md text-mute transition-colors hover:bg-rule/50 hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent";

export function ItineraryEditor({
  campaign,
  onSave,
}: {
  campaign: Campaign;
  onSave: (partial: Partial<Campaign>) => void;
}) {
  const [days, setDays] = useState<ItineraryDay[]>(campaign.itinerary);
  const [inclusions, setInclusions] = useState<string[]>(campaign.inclusions);
  const [exclusions, setExclusions] = useState<string[]>(campaign.exclusions);

  const dirty =
    JSON.stringify(days) !== JSON.stringify(campaign.itinerary) ||
    JSON.stringify(inclusions) !== JSON.stringify(campaign.inclusions) ||
    JSON.stringify(exclusions) !== JSON.stringify(campaign.exclusions);

  return (
    <div className="tile space-y-4 p-5" data-testid="itinerary-editor">
      <div className="space-y-3">
        {days.map((d, i) => (
          <div key={i} data-testid={`day-${i}`} className="rounded-xl border border-rule bg-canvas/40 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="inline-flex size-6 items-center justify-center rounded-full bg-accent-quiet text-[11px] font-medium text-accent">
                {d.day}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Move day up"
                  disabled={i === 0}
                  onClick={() => setDays(moveDay(days, i, i - 1))}
                  className={iconBtn}
                >
                  <ChevronUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Move day down"
                  disabled={i === days.length - 1}
                  onClick={() => setDays(moveDay(days, i, i + 1))}
                  className={iconBtn}
                >
                  <ChevronDown className="size-3.5" />
                </button>
                <button
                  type="button"
                  aria-label={`Remove day ${d.day}`}
                  data-testid={`remove-day-${i}`}
                  onClick={() => setDays(removeDay(days, i))}
                  className={`${iconBtn} hover:text-hot`}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
            <input
              value={d.title}
              placeholder="Day title"
              onChange={(e) => setDays(editDay(days, i, { title: e.target.value }))}
              className={inputCls}
            />
            <textarea
              value={d.detail}
              placeholder="What happens this day"
              rows={2}
              onChange={(e) => setDays(editDay(days, i, { detail: e.target.value }))}
              className={`${inputCls} mt-2 resize-none`}
            />
          </div>
        ))}
        <button
          type="button"
          data-testid="add-day"
          onClick={() => setDays(addDay(days))}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-rule px-3 py-2 text-[12.5px] text-ink-soft transition-colors hover:text-ink"
        >
          <Plus className="size-3.5" />
          Add day
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 border-t border-rule pt-4 sm:grid-cols-2">
        <StringListEditor
          label="Inclusions"
          items={inclusions}
          onAdd={(v) => setInclusions(addItem(inclusions, v))}
          onRemove={(idx) => setInclusions(removeItem(inclusions, idx))}
        />
        <StringListEditor
          label="Exclusions"
          items={exclusions}
          onAdd={(v) => setExclusions(addItem(exclusions, v))}
          onRemove={(idx) => setExclusions(removeItem(exclusions, idx))}
        />
      </div>

      <div className="flex justify-end border-t border-rule pt-4">
        <button
          type="button"
          data-testid="save-itinerary"
          onClick={() => onSave({ itinerary: days, inclusions, exclusions })}
          disabled={!dirty}
          className="rounded-xl bg-accent px-4 py-2 text-[12.5px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          Save itinerary
        </button>
      </div>
    </div>
  );
}
