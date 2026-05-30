"use client";

import { Check, ChevronDown } from "lucide-react";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { AdminAvatar } from "./admin-avatar";
import { findAdmin } from "@/lib/hooks/use-admins";
import type { Admin } from "@/lib/types";

export function AssignmentControl({
  assignedToId,
  admins,
  onChange,
}: {
  assignedToId: string | null;
  admins: Admin[];
  onChange: (next: string | null) => void;
}) {
  const assignee = findAdmin(admins, assignedToId);

  return (
    <Dropdown
      align="left"
      trigger={() => (
        <span className="inline-flex items-center gap-2 rounded-full border border-rule bg-paper px-2 py-1 text-[12px] text-ink transition-colors hover:bg-rule/30">
          <AdminAvatar admin={assignee} size="xs" />
          <span className="font-medium">
            {assignee ? assignee.name.split(" ")[0] : "Unassigned"}
          </span>
          <ChevronDown className="size-3 text-mute" />
        </span>
      )}
    >
      {(close) => (
        <>
          <div className="px-3 pt-1.5 pb-1 text-[10px] uppercase tracking-[0.12em] text-mute">
            Assign lead
          </div>
          <DropdownItem
            active={assignedToId === null}
            onClick={() => {
              onChange(null);
              close();
            }}
          >
            <AdminAvatar admin={null} size="xs" />
            <span>Unassigned</span>
            {assignedToId === null ? (
              <Check className="ml-auto size-3.5 text-ok" />
            ) : null}
          </DropdownItem>
          {admins.map((a) => (
            <DropdownItem
              key={a.id}
              active={assignedToId === a.id}
              onClick={() => {
                onChange(a.id);
                close();
              }}
            >
              <AdminAvatar admin={a} size="xs" />
              <span>{a.name}</span>
              {assignedToId === a.id ? (
                <Check className="ml-auto size-3.5 text-ok" />
              ) : null}
            </DropdownItem>
          ))}
        </>
      )}
    </Dropdown>
  );
}
