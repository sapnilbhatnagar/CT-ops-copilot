"use client";

import { Check, Pencil } from "lucide-react";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { ClassificationBadge } from "./classification-badge";
import type { Classification, ClassificationSource } from "@/lib/types";

const OPTIONS: { value: Classification; label: string }[] = [
  { value: "hot", label: "Hot" },
  { value: "warm", label: "Warm" },
  { value: "cold", label: "Cold" },
  { value: "unclassified", label: "Qualifying" },
];

export function ClassificationControl({
  value,
  source,
  onChange,
}: {
  value: Classification;
  source: ClassificationSource;
  onChange: (next: Classification) => void;
}) {
  return (
    <div className="inline-flex items-center gap-2">
      <Dropdown
        align="right"
        trigger={() => (
          <span className="inline-flex items-center gap-1.5">
            <ClassificationBadge value={value} />
            <Pencil className="size-3 text-mute" />
          </span>
        )}
      >
        {(close) => (
          <>
            <div className="px-3 pt-1.5 pb-1 text-[10px] uppercase tracking-[0.12em] text-mute">
              Reclassify
            </div>
            {OPTIONS.map((opt) => (
              <DropdownItem
                key={opt.value}
                active={value === opt.value}
                onClick={() => {
                  onChange(opt.value);
                  close();
                }}
              >
                <ClassificationBadge value={opt.value} size="sm" />
                <span>{opt.label}</span>
                {value === opt.value ? (
                  <Check className="ml-auto size-3.5 text-ok" />
                ) : null}
              </DropdownItem>
            ))}
          </>
        )}
      </Dropdown>
      {source === "user" ? (
        <span
          data-testid="classification-source-user"
          className="rounded-full bg-ok/10 px-1.5 py-0.5 text-[9.5px] uppercase tracking-[0.12em] text-ok"
          title="Manually classified by a team member"
        >
          by user
        </span>
      ) : null}
    </div>
  );
}
