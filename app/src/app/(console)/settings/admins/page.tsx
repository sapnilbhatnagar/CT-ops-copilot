import { TopBar } from "@/components/console-shell/topbar";
import { AdminsPanel } from "@/components/settings/admins-panel";

export default function AdminsSettingsPage() {
  return (
    <>
      <TopBar section="Settings · Admins" />
      <main className="flex-1 px-8 py-10">
        <div className="mx-auto max-w-3xl">
          <header className="mb-8 max-w-xl">
            <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-mute">
              Team configuration
            </div>
            <h1 className="font-display text-[36px] leading-[1.05] tracking-tight text-ink">
              Who works the leads.
            </h1>
            <p className="mt-3 text-[14px] leading-relaxed text-mute">
              Admins are the people who can be assigned to a lead. Add a teammate to make them
              available in the assignment menu on the intake screen.
            </p>
          </header>
          <AdminsPanel />
        </div>
      </main>
    </>
  );
}
