import { describe, it, expect } from "vitest";
import { addDay, removeDay, moveDay, editDay, addItem, removeItem } from "./itinerary-editor";

const days = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ day: i + 1, title: `T${i + 1}`, detail: `D${i + 1}` }));

describe("itinerary reducer", () => {
  it("addDay appends a blank numbered day", () => {
    const r = addDay(days(2));
    expect(r).toHaveLength(3);
    expect(r[2]).toEqual({ day: 3, title: "", detail: "" });
  });

  it("removeDay renumbers the remaining days", () => {
    const r = removeDay(days(3), 0);
    expect(r.map((d) => d.day)).toEqual([1, 2]);
    expect(r[0].title).toBe("T2");
  });

  it("moveDay reorders and renumbers", () => {
    const r = moveDay(days(3), 0, 2);
    expect(r.map((d) => d.title)).toEqual(["T2", "T3", "T1"]);
    expect(r.map((d) => d.day)).toEqual([1, 2, 3]);
  });

  it("editDay patches title/detail without touching day", () => {
    const r = editDay(days(2), 1, { title: "X" });
    expect(r[1]).toEqual({ day: 2, title: "X", detail: "D2" });
  });

  it("addItem trims, dedupes, ignores blank; removeItem splices", () => {
    expect(addItem(["Flights"], "  Hotel ")).toEqual(["Flights", "Hotel"]);
    expect(addItem(["Flights"], "flights")).toEqual(["Flights"]);
    expect(addItem(["Flights"], "  ")).toEqual(["Flights"]);
    expect(removeItem(["a", "b", "c"], 1)).toEqual(["a", "c"]);
  });
});
