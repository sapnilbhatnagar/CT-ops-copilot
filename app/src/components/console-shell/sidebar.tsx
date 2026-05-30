"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessagesSquare,
  Users,
  Map,
  Sparkles,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Intake",
    href: "/intake",
    icon: MessagesSquare,
    description: "Live WhatsApp conversations being qualified by the AI agent.",
  },
  {
    label: "Leads",
    href: "/leads",
    icon: Users,
    description: "Every lead across every campaign, filterable and pipelined.",
  },
  {
    label: "Trips",
    href: "/trips",
    icon: Map,
    description: "Compose a new trip and re-engage matched leads.",
  },
  {
    label: "Community",
    href: "/community",
    icon: Sparkles,
    description: "Booked travellers, welcomes, and the referral leaderboard.",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Schema, conversation flow, classification thresholds.",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      data-testid="console-sidebar"
      className="glass-dark sticky top-0 flex h-dvh w-60 shrink-0 flex-col text-sidebar-fg"
    >
      <div className="px-5 pt-7 pb-9">
        <div className="font-display text-[18px] leading-tight tracking-tight">
          Connecting
          <br />
          Traveller
        </div>
        <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-sidebar-fg-mute">
          Ops Console
        </div>
      </div>

      <nav className="flex-1 px-2.5">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  data-active={active}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] transition-colors",
                    active
                      ? "bg-white/12 text-sidebar-fg shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                      : "text-sidebar-fg-mute hover:bg-white/[0.07] hover:text-sidebar-fg",
                  )}
                >
                  <Icon className={cn("size-4 shrink-0", active ? "text-accent" : "")} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/5 px-5 py-4 text-[11px] text-sidebar-fg-mute">
        v0.1 · localhost
      </div>
    </aside>
  );
}
