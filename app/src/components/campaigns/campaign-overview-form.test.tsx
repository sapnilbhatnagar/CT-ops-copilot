import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CampaignOverviewForm } from "./campaign-overview-form";
import { emptyCampaign, type Campaign } from "@/lib/types";

const campaign = (over: Partial<Campaign> = {}): Campaign => ({ ...emptyCampaign("Trip"), id: "c1", ...over });

describe("CampaignOverviewForm", () => {
  it("enables save only after an edit and passes the edited field", async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();
    render(<CampaignOverviewForm campaign={campaign()} onSave={onSave} />);

    const save = screen.getByTestId("save-overview");
    expect(save).toBeDisabled();

    await user.type(screen.getByTestId("field-destination"), "London");
    expect(save).toBeEnabled();

    await user.click(save);
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ destination: "London" }));
  });

  it("blocks save and shows an error when the name is cleared", async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();
    render(<CampaignOverviewForm campaign={campaign({ name: "Trip" })} onSave={onSave} />);

    await user.clear(screen.getByTestId("field-name"));
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByTestId("save-overview")).toBeDisabled();
    expect(onSave).not.toHaveBeenCalled();
  });
});
