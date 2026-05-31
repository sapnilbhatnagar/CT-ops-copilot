import type { Admin, Campaign, Lead } from "./types";

export type HeatCounts = { hot: number; warm: number; cold: number; total: number };

export type CampaignTileVM = {
  id: string;
  name: string;
  destination: string | null;
  dateRange: string | null;
  status: Campaign["status"];
  heat: HeatCounts;
  seatsLabel: string | null;
  seatsFraction: number | null;
  leaderName: string | null;
};

export function formatDateRange(start: string | null, end: string | null): string | null {
  const fmt = (iso: string, withYear: boolean) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      ...(withYear ? { year: "numeric" } : {}),
    });
  };
  if (start && end) return `${fmt(start, false)} to ${fmt(end, true)}`;
  if (start) return fmt(start, true);
  if (end) return fmt(end, true);
  return null;
}

function heatFor(leads: Lead[], campaignId: string): HeatCounts {
  const mine = leads.filter((l) => l.campaignId === campaignId);
  return {
    hot: mine.filter((l) => l.classification === "hot").length,
    warm: mine.filter((l) => l.classification === "warm").length,
    cold: mine.filter((l) => l.classification === "cold").length,
    total: mine.length,
  };
}

export function campaignTileVM(campaign: Campaign, leads: Lead[], admins: Admin[]): CampaignTileVM {
  const seatsLabel =
    campaign.seatsTotal != null ? `${campaign.seatsBooked} / ${campaign.seatsTotal} booked` : null;
  const seatsFraction =
    campaign.seatsTotal != null && campaign.seatsTotal > 0
      ? Math.min(1, Math.max(0, campaign.seatsBooked / campaign.seatsTotal))
      : null;
  return {
    id: campaign.id,
    name: campaign.name,
    destination: campaign.destination || null,
    dateRange: formatDateRange(campaign.startDate, campaign.endDate),
    status: campaign.status,
    heat: heatFor(leads, campaign.id),
    seatsLabel,
    seatsFraction,
    leaderName: admins.find((a) => a.id === campaign.leaderId)?.name ?? null,
  };
}

const STATUS_ORDER: Record<Campaign["status"], number> = { live: 0, draft: 1, closed: 2 };

export function campaignTiles(
  campaigns: Campaign[],
  leads: Lead[],
  admins: Admin[],
): CampaignTileVM[] {
  return campaigns
    .map((c) => campaignTileVM(c, leads, admins))
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.name.localeCompare(b.name));
}

export type CampaignDraft = Pick<
  Campaign,
  "name" | "destination" | "status" | "startDate" | "endDate" | "pricePerPerson" | "seatsTotal"
>;
export type CampaignFormErrors = Partial<Record<keyof CampaignDraft, string>>;

export function validateCampaignDraft(d: CampaignDraft, seatsBooked: number): CampaignFormErrors {
  const errors: CampaignFormErrors = {};
  if (!d.name.trim()) errors.name = "Name is required.";
  if (d.startDate && d.endDate && d.endDate < d.startDate)
    errors.endDate = "End date must be on or after the start date.";
  if (d.pricePerPerson != null && d.pricePerPerson < 0)
    errors.pricePerPerson = "Price cannot be negative.";
  if (d.seatsTotal != null && d.seatsTotal < seatsBooked)
    errors.seatsTotal = `Seats cannot be below the ${seatsBooked} already booked.`;
  return errors;
}

export function canGoLive(c: Campaign): { ok: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!c.destination.trim()) missing.push("destination");
  if (!c.startDate || !c.endDate) missing.push("dates");
  if (c.itinerary.length === 0) missing.push("itinerary");
  return { ok: missing.length === 0, missing };
}
