import { TopBar } from "@/components/console-shell/topbar";
import { SectionOpener } from "@/components/console-shell/section-opener";

export default function LeadsPage() {
  return (
    <>
      <TopBar section="Leads" />
      <main className="flex-1 px-8 py-14">
        <SectionOpener
          eyebrow="Module 2 of 5"
          title="Every lead, every campaign, one table."
          description="A filterable, sortable view of every qualified lead — hot, warm, cold — with the conversation summary and the next action. Phase 2a builds the table and the Kanban pipeline."
        />
      </main>
    </>
  );
}
