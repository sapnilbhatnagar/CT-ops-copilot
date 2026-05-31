import { describe, it, expect } from "vitest";
import { recordToCampaign, recordToLead, type RecordLike } from "./airtable";
import { DEFAULT_CRITERIA, emptyCampaign } from "@/lib/types";

/** A fake Airtable record backed by a plain field map. */
function rec(id: string, map: Record<string, unknown>): RecordLike {
  return { id, get: (k: string) => map[k] };
}

describe("recordToCampaign", () => {
  it("parses a fully populated record", () => {
    const c = recordToCampaign(
      rec("recC", {
        Name: "London Diwali 2026",
        Status: "live",
        Destination: "London",
        "Match keywords (JSON)": JSON.stringify(["london", "uk"]),
        "Start date": "2026-10-12",
        "End date": "2026-10-18",
        "Price per person": 185000,
        "Seats total": 12,
        "Seats booked": 4,
        "Itinerary (JSON)": JSON.stringify([{ day: 1, title: "Arrival", detail: "Heathrow pickup" }]),
        "Inclusions (JSON)": JSON.stringify(["Flights", "Hotel"]),
        "Exclusions (JSON)": JSON.stringify(["Visa"]),
        Leader: "admin_sapnil",
        "Criteria (JSON)": JSON.stringify(DEFAULT_CRITERIA),
      }),
    );
    expect(c).toMatchObject({
      id: "recC",
      name: "London Diwali 2026",
      status: "live",
      destination: "London",
      matchKeywords: ["london", "uk"],
      startDate: "2026-10-12",
      endDate: "2026-10-18",
      pricePerPerson: 185000,
      seatsTotal: 12,
      seatsBooked: 4,
      leaderId: "admin_sapnil",
    });
    expect(c.itinerary).toEqual([{ day: 1, title: "Arrival", detail: "Heathrow pickup" }]);
    expect(c.inclusions).toEqual(["Flights", "Hotel"]);
    expect(c.exclusions).toEqual(["Visa"]);
  });

  it("defaults every field on a legacy record (only Name, like the seeded row)", () => {
    const c = recordToCampaign(rec("rec7VQpQjCkNP6WA2", { Name: "Default campaign" }));
    expect(c).toMatchObject({
      name: "Default campaign",
      status: "draft",
      destination: "",
      matchKeywords: [],
      startDate: null,
      endDate: null,
      pricePerPerson: null,
      seatsTotal: null,
      seatsBooked: 0,
      itinerary: [],
      inclusions: [],
      exclusions: [],
      leaderId: null,
    });
    expect(c.criteria).toEqual(DEFAULT_CRITERIA);
  });

  it("survives malformed JSON in a JSON column", () => {
    const c = recordToCampaign(
      rec("recX", { Name: "X", "Itinerary (JSON)": "{not json", "Inclusions (JSON)": "oops" }),
    );
    expect(c.itinerary).toEqual([]);
    expect(c.inclusions).toEqual([]);
  });

  it("round-trips itinerary, inclusions, exclusions, and keywords", () => {
    const data = {
      ...emptyCampaign("Trip"),
      itinerary: [{ day: 1, title: "A", detail: "B" }],
      inclusions: ["x"],
      exclusions: ["y"],
      matchKeywords: ["k"],
    };
    const parsed = recordToCampaign(
      rec("rec1", {
        Name: data.name,
        "Itinerary (JSON)": JSON.stringify(data.itinerary),
        "Inclusions (JSON)": JSON.stringify(data.inclusions),
        "Exclusions (JSON)": JSON.stringify(data.exclusions),
        "Match keywords (JSON)": JSON.stringify(data.matchKeywords),
      }),
    );
    expect(parsed.itinerary).toEqual(data.itinerary);
    expect(parsed.inclusions).toEqual(data.inclusions);
    expect(parsed.exclusions).toEqual(data.exclusions);
    expect(parsed.matchKeywords).toEqual(data.matchKeywords);
  });
});

describe("recordToLead", () => {
  it("parses campaignId from the linked array and bookingStatus from the select", () => {
    const l = recordToLead(
      rec("recL", {
        "Phone hash": "hash1",
        Campaign: ["recC"],
        "Booking status": "booked",
        "Messages (JSON)": "[]",
        "Fields (JSON)": "[]",
      }),
    );
    expect(l.campaignId).toBe("recC");
    expect(l.bookingStatus).toBe("booked");
  });

  it("defaults to unrouted (null) and enquiry on a legacy lead", () => {
    const l = recordToLead(rec("recL2", { "Phone hash": "hash2" }));
    expect(l.campaignId).toBeNull();
    expect(l.bookingStatus).toBe("enquiry");
  });
});
