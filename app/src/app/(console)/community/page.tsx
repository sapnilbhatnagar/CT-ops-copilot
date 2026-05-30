import { TopBar } from "@/components/console-shell/topbar";
import { SectionOpener } from "@/components/console-shell/section-opener";

export default function CommunityPage() {
  return (
    <>
      <TopBar section="Community" />
      <main className="flex-1 px-8 py-14">
        <SectionOpener
          eyebrow="Module 4 of 5"
          title="Booked travellers become the next campaign."
          description="Welcome flow, community invites, and a referral leaderboard. Phase 4a turns the loop's closing edge into something the team can see."
        />
      </main>
    </>
  );
}
