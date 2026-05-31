"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useCampaigns } from "@/lib/hooks/use-campaigns";

export function NewCampaignButton() {
  const { create } = useCampaigns();
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    const id = await create(name.trim());
    router.push(`/campaigns/${id}`);
  }

  if (!adding) {
    return (
      <button
        type="button"
        data-testid="new-campaign"
        onClick={() => setAdding(true)}
        className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-[12.5px] font-medium text-white transition-opacity hover:opacity-90"
      >
        <Plus className="size-3.5" />
        New campaign
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <input
        autoFocus
        data-testid="new-campaign-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Campaign name"
        className="rounded-xl border border-rule bg-tile px-3 py-2 text-[13px] text-ink placeholder:text-mute/60 focus:outline-none"
      />
      <button
        type="submit"
        data-testid="create-campaign"
        disabled={busy}
        className="rounded-xl bg-accent px-3 py-2 text-[12.5px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {busy ? "Creating…" : "Create"}
      </button>
    </form>
  );
}
