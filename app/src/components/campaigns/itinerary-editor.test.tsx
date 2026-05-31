import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ItineraryEditor } from "./itinerary-editor";
import { emptyCampaign, type Campaign } from "@/lib/types";

const campaign = (over: Partial<Campaign> = {}): Campaign => ({ ...emptyCampaign("Trip"), id: "c1", ...over });

describe("ItineraryEditor", () => {
  it("adds a day and saves the itinerary", async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();
    render(<ItineraryEditor campaign={campaign()} onSave={onSave} />);

    expect(screen.queryByTestId("day-0")).not.toBeInTheDocument();
    await user.click(screen.getByTestId("add-day"));
    expect(screen.getByTestId("day-0")).toBeInTheDocument();

    await user.click(screen.getByTestId("save-itinerary"));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ itinerary: [{ day: 1, title: "", detail: "" }] }),
    );
  });

  it("removes a day", async () => {
    const user = userEvent.setup();
    render(
      <ItineraryEditor
        campaign={campaign({ itinerary: [{ day: 1, title: "A", detail: "B" }] })}
        onSave={() => {}}
      />,
    );
    expect(screen.getByTestId("day-0")).toBeInTheDocument();
    await user.click(screen.getByTestId("remove-day-0"));
    expect(screen.queryByTestId("day-0")).not.toBeInTheDocument();
  });
});
