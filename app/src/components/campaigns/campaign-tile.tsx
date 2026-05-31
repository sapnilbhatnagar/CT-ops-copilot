import Link from "next/link";
import type { CampaignTileVM, HeatCounts } from "@/lib/campaigns-view";

const STATUS_STYLE: Record<CampaignTileVM["status"], string> = {
  draft: "bg-panel text-mute",
  live: "tile-blue-soft text-accent",
  closed: "bg-panel text-mute/70",
};

export function CampaignTile({ vm }: { vm: CampaignTileVM }) {
  const meta = [vm.destination, vm.dateRange ?? "Dates TBD", vm.leaderName].filter(Boolean).join(" · ");
  return (
    <Link
      href={`/campaigns/${vm.id}`}
      data-testid={`campaign-tile-${vm.id}`}
      className="tile flex items-center gap-4 px-5 py-4 transition-shadow hover:shadow-float"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-display text-[17px] leading-tight text-ink">{vm.name}</span>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10.5px] uppercase tracking-[0.1em] ${STATUS_STYLE[vm.status]}`}
          >
            {vm.status}
          </span>
        </div>
        <div className="mt-0.5 truncate text-[12.5px] tabular-nums text-mute">{meta}</div>
      </div>
      <HeatChips heat={vm.heat} />
      {vm.seatsLabel ? <Seats label={vm.seatsLabel} fraction={vm.seatsFraction ?? 0} /> : null}
    </Link>
  );
}

function HeatChips({ heat }: { heat: HeatCounts }) {
  const dot = (n: number, cls: string) => (
    <span className={`text-[12.5px] tabular-nums ${n > 0 ? cls : "text-mute/35"}`}>{n}</span>
  );
  return (
    <div className="flex shrink-0 items-center gap-2" title={`${heat.total} leads`}>
      {dot(heat.hot, "text-hot")}
      {dot(heat.warm, "text-warm")}
      {dot(heat.cold, "text-cold")}
    </div>
  );
}

function Seats({ label, fraction }: { label: string; fraction: number }) {
  return (
    <div className="w-24 shrink-0">
      <div className="text-right text-[11px] tabular-nums text-mute">{label}</div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-panel">
        <div className="h-full rounded-full bg-accent" style={{ width: `${Math.round(fraction * 100)}%` }} />
      </div>
    </div>
  );
}
