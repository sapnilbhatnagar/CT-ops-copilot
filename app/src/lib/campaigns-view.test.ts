import { describe, it, expect } from "vitest";
import { campaignTileVM, campaignTiles, validateCampaignDraft, canGoLive } from "./campaigns-view";
import { emptyCampaign, type Lead, type Admin, type Campaign } from "./types";

const admins: Admin[] = [
  { id: "admin_1", name: "Sapnil", email: "s@x.com", initials: "S", color: "#000", active: true },
];

const mkLead = (campaignId: string | null, classification: Lead["classification"]): Lead =>
  ({ campaignId, classification }) as Lead;

const campaign = (over: Partial<Campaign>): Campaign => ({ ...emptyCampaign("Trip"), id: "c1", ...over });

describe("campaignTileVM", () => {
  it("counts heat only for this campaign's leads and resolves leader + seats", () => {
    const c = campaign({ seatsBooked: 8, seatsTotal: 12, leaderId: "admin_1", destination: "London" });
    const leads = [mkLead("c1", "hot"), mkLead("c1", "warm"), mkLead("c2", "hot"), mkLead("c1", "cold")];
    const vm = campaignTileVM(c, leads, admins);
    expect(vm.heat).toEqual({ hot: 1, warm: 1, cold: 1, total: 3 });
    expect(vm.seatsLabel).toBe("8 / 12 booked");
    expect(vm.seatsFraction).toBeCloseTo(8 / 12);
    expect(vm.leaderName).toBe("Sapnil");
    expect(vm.destination).toBe("London");
  });

  it("nulls seats with no total and dateRange with no dates", () => {
    const vm = campaignTileVM(campaign({ seatsTotal: null }), [], admins);
    expect(vm.seatsLabel).toBeNull();
    expect(vm.seatsFraction).toBeNull();
    expect(vm.dateRange).toBeNull();
  });
});

describe("campaignTiles", () => {
  it("sorts live, then draft, then closed", () => {
    const tiles = campaignTiles(
      [
        campaign({ id: "a", name: "A", status: "closed" }),
        campaign({ id: "b", name: "B", status: "live" }),
        campaign({ id: "c", name: "C", status: "draft" }),
      ],
      [],
      admins,
    );
    expect(tiles.map((t) => t.id)).toEqual(["b", "c", "a"]);
  });
});

describe("validateCampaignDraft", () => {
  const base = {
    name: "Trip",
    destination: "London",
    status: "draft" as const,
    startDate: null,
    endDate: null,
    pricePerPerson: null,
    seatsTotal: null,
  };
  it("requires a name", () => {
    expect(validateCampaignDraft({ ...base, name: " " }, 0).name).toBeTruthy();
  });
  it("rejects end-before-start, negative price, seats below booked", () => {
    expect(validateCampaignDraft({ ...base, startDate: "2026-10-10", endDate: "2026-10-05" }, 0).endDate).toBeTruthy();
    expect(validateCampaignDraft({ ...base, pricePerPerson: -1 }, 0).pricePerPerson).toBeTruthy();
    expect(validateCampaignDraft({ ...base, seatsTotal: 3 }, 5).seatsTotal).toBeTruthy();
  });
  it("passes a valid draft", () => {
    expect(
      validateCampaignDraft(
        { ...base, startDate: "2026-10-01", endDate: "2026-10-08", pricePerPerson: 1000, seatsTotal: 10 },
        2,
      ),
    ).toEqual({});
  });
});

describe("canGoLive", () => {
  it("lists what is missing, ok when complete", () => {
    expect(canGoLive(campaign({ destination: "", startDate: null, endDate: null, itinerary: [] })).missing).toEqual([
      "destination",
      "dates",
      "itinerary",
    ]);
    expect(
      canGoLive(
        campaign({
          destination: "London",
          startDate: "2026-10-01",
          endDate: "2026-10-08",
          itinerary: [{ day: 1, title: "A", detail: "B" }],
        }),
      ),
    ).toEqual({ ok: true, missing: [] });
  });
});
