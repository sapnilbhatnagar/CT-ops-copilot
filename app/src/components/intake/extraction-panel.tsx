"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Circle, Sparkles } from "lucide-react";
import type { ExtractedField, QualifyingCriterion } from "@/lib/types";

function CriterionRow({ id, label, value }: { id: string; label: string; value: string | null }) {
  const present = value !== null && value !== "";
  return (
    <li
      data-testid={`field-${id}`}
      data-state={present ? "extracted" : "pending"}
      className="flex items-start justify-between gap-3 py-3"
    >
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-[0.13em] text-mute">{label}</div>
        <AnimatePresence mode="wait">
          <motion.div
            key={value ?? "empty"}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="mt-0.5 text-[14px] leading-snug text-ink"
          >
            {present ? value : <span className="text-mute/55">Awaiting</span>}
          </motion.div>
        </AnimatePresence>
      </div>
      <span
        aria-hidden
        className={
          present
            ? "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-ok text-white"
            : "mt-0.5 flex size-5 shrink-0 items-center justify-center text-mute/40"
        }
      >
        {present ? <Check className="size-3.5" /> : <Circle className="size-3.5" />}
      </span>
    </li>
  );
}

export function ExtractionPanel({
  criteria,
  fields,
  summary,
}: {
  criteria: QualifyingCriterion[];
  fields: ExtractedField[];
  summary?: string;
}) {
  const valueFor = (key: string) => fields.find((f) => f.key === key)?.value ?? null;
  const captured = criteria.filter((c) => {
    const v = valueFor(c.key);
    return v !== null && v !== "";
  }).length;

  return (
    <aside
      data-testid="extraction-panel"
      className="flex h-full w-[340px] shrink-0 flex-col gap-3 overflow-y-auto border-l border-rule bg-panel p-4"
    >
      <div className="flex items-baseline justify-between px-1">
        <span className="text-[11px] uppercase tracking-[0.16em] text-mute">Live extraction</span>
        <span className="text-[12px] tabular-nums text-mute">
          <span className="font-medium text-ink">{captured}</span> of {criteria.length}
        </span>
      </div>

      {summary ? (
        <div data-testid="extraction-summary" className="tile-blue-soft p-3.5">
          <div className="mb-1.5 flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-[0.13em] text-accent-ink">
            <Sparkles className="size-3 text-accent" />
            Summary
          </div>
          <p className="text-[12.5px] leading-relaxed text-ink">{summary}</p>
        </div>
      ) : null}

      <div className="tile flex-1 px-4 py-1">
        <ul className="divide-y divide-rule">
          {criteria.map((c) => (
            <CriterionRow key={c.key} id={c.key} label={c.label} value={valueFor(c.key)} />
          ))}
        </ul>
      </div>
    </aside>
  );
}
