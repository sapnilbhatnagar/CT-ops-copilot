import { TopBar } from "@/components/console-shell/topbar";
import { SectionOpener } from "@/components/console-shell/section-opener";

export default function TripsPage() {
  return (
    <>
      <TopBar section="Trips" />
      <main className="flex-1 px-8 py-14">
        <SectionOpener
          eyebrow="Module 3 of 5"
          title="Launch a trip. Re-engage the right leads."
          description="Compose a new trip, see the matched leads filter live, preview the personalized message per lead, confirm send. Phase 3a wires the full flow against mock data."
        />
      </main>
    </>
  );
}
