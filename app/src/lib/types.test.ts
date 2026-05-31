import { describe, it, expect } from "vitest";
import { emptyCampaign, DEFAULT_CRITERIA } from "./types";

describe("emptyCampaign", () => {
  it("returns a draft campaign with all C0 defaults", () => {
    const c = emptyCampaign("London Diwali 2026");
    expect(c).toMatchObject({
      id: "",
      name: "London Diwali 2026",
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
  });

  it("seeds the five default criteria as a fresh copy", () => {
    const c = emptyCampaign("X");
    expect(c.criteria).toHaveLength(5);
    expect(c.criteria).toEqual(DEFAULT_CRITERIA);
    expect(c.criteria).not.toBe(DEFAULT_CRITERIA);
  });
});
