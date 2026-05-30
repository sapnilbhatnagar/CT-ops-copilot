import { describe, it, expect } from "vitest";
import { seedState, addCriterion, removeCriterion, addCampaign } from "./use-campaigns";

describe("campaign criteria reducers", () => {
  it("seeds one campaign with the five default criteria", () => {
    const s = seedState();
    expect(s.campaigns).toHaveLength(1);
    expect(s.campaigns[0].criteria).toHaveLength(5);
    expect(s.activeId).toBe(s.campaigns[0].id);
    expect(s.campaigns[0].criteria.every((c) => !c.custom)).toBe(true);
  });

  it("adds a custom criterion to the named campaign", () => {
    const s = seedState();
    const next = addCriterion(s.campaigns, s.campaigns[0].id, "Occasion");
    const crit = next[0].criteria;
    expect(crit).toHaveLength(6);
    expect(crit[5]).toMatchObject({ label: "Occasion", custom: true });
  });

  it("ignores blank and duplicate criteria", () => {
    const s = seedState();
    let next = addCriterion(s.campaigns, s.campaigns[0].id, "   ");
    expect(next[0].criteria).toHaveLength(5);
    next = addCriterion(s.campaigns, s.campaigns[0].id, "Budget"); // dup of default label
    expect(next[0].criteria).toHaveLength(5);
  });

  it("removes a custom criterion but never a default", () => {
    const s = seedState();
    const withCustom = addCriterion(s.campaigns, s.campaigns[0].id, "Occasion");
    const customKey = withCustom[0].criteria[5].key;

    const removed = removeCriterion(withCustom, s.campaigns[0].id, customKey);
    expect(removed[0].criteria).toHaveLength(5);

    const defaultKey = withCustom[0].criteria[0].key; // a default
    const stillThere = removeCriterion(withCustom, s.campaigns[0].id, defaultKey);
    expect(stillThere[0].criteria).toHaveLength(6); // default not removed
  });

  it("creates a new campaign seeded with the defaults", () => {
    const s = seedState();
    const { campaigns, id } = addCampaign(s.campaigns, "Diwali Rajasthan");
    expect(campaigns).toHaveLength(2);
    const created = campaigns.find((c) => c.id === id);
    expect(created?.name).toBe("Diwali Rajasthan");
    expect(created?.criteria).toHaveLength(5);
  });
});
