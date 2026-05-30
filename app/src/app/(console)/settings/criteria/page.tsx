import { TopBar } from "@/components/console-shell/topbar";
import { CriteriaConfigurator } from "@/components/settings/criteria-configurator";

export default function CriteriaPage() {
  return (
    <>
      <TopBar section="Settings" />
      <main className="min-h-0 flex-1 overflow-y-auto px-8 py-8">
        <div className="mb-6">
          <h1 className="font-display text-[24px] leading-tight text-ink">Qualifying criteria</h1>
          <p className="mt-1 max-w-xl text-[13px] text-mute">
            Choose what the intake agent qualifies a lead against, per campaign. The five defaults
            always apply; add your own for a specific campaign.
          </p>
        </div>
        <CriteriaConfigurator />
      </main>
    </>
  );
}
