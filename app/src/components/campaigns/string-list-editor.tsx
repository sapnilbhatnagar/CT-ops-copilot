"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

export function StringListEditor({
  label,
  items,
  onAdd,
  onRemove,
}: {
  label: string;
  items: string[];
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
}) {
  const [value, setValue] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    onAdd(value);
    setValue("");
  }

  return (
    <div>
      <div className="mb-1.5 text-[11px] uppercase tracking-[0.13em] text-mute">{label}</div>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="inline-flex items-center gap-1 rounded-full bg-accent-quiet px-2.5 py-1 text-[12px] text-accent"
            >
              {item}
              <button
                type="button"
                aria-label={`Remove ${item}`}
                onClick={() => onRemove(i)}
                className="text-accent/70 transition-colors hover:text-hot"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
      <form onSubmit={submit} className="mt-2 flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`Add ${label.toLowerCase()}`}
          className="flex-1 rounded-lg border border-rule bg-tile px-3 py-1.5 text-[13px] text-ink placeholder:text-mute/60 focus:outline-none"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-1 rounded-lg border border-rule bg-tile px-2.5 py-1.5 text-[12px] text-ink-soft transition-colors hover:text-ink"
        >
          <Plus className="size-3.5" />
          Add
        </button>
      </form>
    </div>
  );
}
