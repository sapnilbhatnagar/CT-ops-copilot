import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TopBar } from "@/components/console-shell/topbar";
import { SectionOpener } from "@/components/console-shell/section-opener";

const SETTINGS_LINKS = [
  {
    href: "/settings/admins",
    title: "Admins",
    description: "Add or remove the teammates who can be assigned to leads.",
    status: "Live",
  },
  {
    href: "/settings/schema",
    title: "Schema designer",
    description: "Field types and validation for the lead record. Phase 5 will let you edit them here.",
    status: "Phase 5",
  },
  {
    href: "/settings/conversation",
    title: "Conversation designer",
    description: "The agent's tone, opening message, and edge-case responses.",
    status: "Phase 5",
  },
  {
    href: "/settings/classification",
    title: "Classification thresholds",
    description:
      "Budget, dates, and group-size rules that decide hot vs warm vs cold automatically.",
    status: "Phase 5",
  },
];

export default function SettingsPage() {
  return (
    <>
      <TopBar section="Settings" />
      <main className="flex-1 px-8 py-14">
        <SectionOpener
          eyebrow="Module 5 of 5"
          title="The console, shaped by you."
          description="Schema designer, conversation designer, classification thresholds, and team management. Admins is live; the rest land in Phase 5 alongside the backend for those config screens."
        />
        <ul className="mt-12 grid max-w-3xl grid-cols-1 gap-px overflow-hidden rounded-lg border border-rule bg-rule">
          {SETTINGS_LINKS.map((item) => {
            const live = item.status === "Live";
            const content = (
              <div className="flex items-center justify-between gap-4 bg-paper px-5 py-4 transition-colors group-hover:bg-rule/30">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[14px] font-medium text-ink">{item.title}</h3>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] ${
                        live ? "bg-ok/10 text-ok" : "bg-rule text-mute"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12.5px] text-mute">{item.description}</p>
                </div>
                {live ? <ArrowRight className="size-4 text-mute" /> : null}
              </div>
            );
            return (
              <li key={item.href} className="group">
                {live ? <Link href={item.href}>{content}</Link> : content}
              </li>
            );
          })}
        </ul>
      </main>
    </>
  );
}
