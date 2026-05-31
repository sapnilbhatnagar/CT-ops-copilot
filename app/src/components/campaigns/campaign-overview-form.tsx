"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { Campaign } from "@/lib/types";
import { validateCampaignDraft, canGoLive, type CampaignDraft } from "@/lib/campaigns-view";

const STATUSES: Campaign["status"][] = ["draft", "live", "closed"];

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] uppercase tracking-[0.13em] text-mute">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-[11.5px] text-hot">{error}</span> : null}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-rule bg-tile px-3 py-2 text-[13.5px] text-ink placeholder:text-mute/50 focus:border-accent focus:outline-none";

export function CampaignOverviewForm({
  campaign,
  onSave,
}: {
  campaign: Campaign;
  onSave: (partial: Partial<Campaign>) => void;
}) {
  const initial: CampaignDraft = {
    name: campaign.name,
    destination: campaign.destination,
    status: campaign.status,
    startDate: campaign.startDate,
    endDate: campaign.endDate,
    pricePerPerson: campaign.pricePerPerson,
    seatsTotal: campaign.seatsTotal,
  };
  const [draft, setDraft] = useState<CampaignDraft>(initial);

  const errors = validateCampaignDraft(draft, campaign.seatsBooked);
  const valid = Object.keys(errors).length === 0;
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  const live = canGoLive({ ...campaign, ...draft });

  const set = <K extends keyof CampaignDraft>(k: K, v: CampaignDraft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  function save() {
    if (!valid || !dirty) return;
    onSave(draft);
  }

  return (
    <div className="tile space-y-4 p-5" data-testid="overview-form">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Campaign name" error={errors.name}>
          <input
            data-testid="field-name"
            value={draft.name}
            onChange={(e) => set("name", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Destination">
          <input
            data-testid="field-destination"
            value={draft.destination}
            onChange={(e) => set("destination", e.target.value)}
            placeholder="e.g. London"
            className={inputCls}
          />
        </Field>
        <Field label="Status">
          <select
            data-testid="field-status"
            value={draft.status}
            onChange={(e) => set("status", e.target.value as Campaign["status"])}
            className={inputCls}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Price per person (₹)" error={errors.pricePerPerson}>
          <input
            type="number"
            value={draft.pricePerPerson ?? ""}
            onChange={(e) => set("pricePerPerson", e.target.value === "" ? null : Number(e.target.value))}
            className={inputCls}
          />
        </Field>
        <Field label="Start date">
          <input
            type="date"
            value={draft.startDate ?? ""}
            onChange={(e) => set("startDate", e.target.value || null)}
            className={inputCls}
          />
        </Field>
        <Field label="End date" error={errors.endDate}>
          <input
            type="date"
            value={draft.endDate ?? ""}
            onChange={(e) => set("endDate", e.target.value || null)}
            className={inputCls}
          />
        </Field>
        <Field label="Seats total" error={errors.seatsTotal}>
          <input
            type="number"
            value={draft.seatsTotal ?? ""}
            onChange={(e) => set("seatsTotal", e.target.value === "" ? null : Number(e.target.value))}
            className={inputCls}
          />
        </Field>
      </div>

      <div className="flex items-center justify-between border-t border-rule pt-4">
        <span className="text-[12px] text-mute">
          {live.ok ? (
            <span className="inline-flex items-center gap-1 text-accent">
              <Check className="size-3.5" /> Ready to go live
            </span>
          ) : (
            `To go live, add: ${live.missing.join(", ")}`
          )}
        </span>
        <button
          type="button"
          data-testid="save-overview"
          onClick={save}
          disabled={!valid || !dirty}
          className="rounded-xl bg-accent px-4 py-2 text-[12.5px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          Save
        </button>
      </div>
    </div>
  );
}
