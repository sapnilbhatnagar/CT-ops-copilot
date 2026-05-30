"use client";

import { cn } from "@/lib/utils";
import type { Lead, Admin } from "@/lib/types";
import { ClassificationBadge } from "./classification-badge";
import { AdminAvatar } from "./admin-avatar";
import { findAdmin } from "@/lib/hooks/use-admins";

function relativeTime(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.round(diff / 60)}m`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h`;
  return `${Math.round(diff / 86400)}d`;
}

export function LeadList({
  leads,
  admins,
  selectedId,
  onSelect,
  loading,
  emptyMessage = "No active intake conversations.",
}: {
  leads: Lead[];
  admins: Admin[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
  emptyMessage?: string;
}) {
  if (loading) {
    return (
      <div
        data-testid="lead-list-loading"
        className="flex h-full items-center justify-center text-[12.5px] text-mute"
      >
        Loading leads…
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div
        data-testid="lead-list-empty"
        className="flex h-full items-center justify-center px-6 text-center text-[13px] text-mute"
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <ul data-testid="lead-list" className="divide-y divide-rule">
      {leads.map((lead) => {
        const active = lead.id === selectedId;
        const admin = findAdmin(admins, lead.assignedToId);
        return (
          <li key={lead.id}>
            <button
              type="button"
              data-testid={`lead-row-${lead.id}`}
              data-active={active}
              onClick={() => onSelect(lead.id)}
              className={cn(
                "w-full px-4 py-2 text-left transition-colors",
                active ? "bg-rule/40" : "hover:bg-rule/20",
              )}
            >
              <div className="flex items-center gap-2.5">
                <AdminAvatar admin={admin} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-[13px] font-medium text-ink">
                      {lead.contactName ?? "Unnamed lead"}
                    </div>
                    <ClassificationBadge value={lead.classification} size="sm" />
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2 text-[11px] text-mute">
                    <span className="truncate">{lead.phoneMasked}</span>
                    <span className="shrink-0 tabular-nums">{relativeTime(lead.lastActivityAt)}</span>
                  </div>
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
