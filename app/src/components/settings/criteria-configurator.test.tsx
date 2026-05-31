import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CriteriaConfigurator } from "./criteria-configurator";
import { DEFAULT_CRITERIA } from "@/lib/types";

describe("CriteriaConfigurator", () => {
  it("shows the five default criteria", () => {
    render(
      <CriteriaConfigurator
        campaign={{ id: "c1", criteria: DEFAULT_CRITERIA }}
        onAdd={() => {}}
        onRemove={() => {}}
      />,
    );
    expect(screen.getByTestId("criterion-name")).toBeInTheDocument();
    expect(screen.getAllByText("Default")).toHaveLength(5);
  });

  it("calls onAdd with the typed label", async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();
    render(
      <CriteriaConfigurator
        campaign={{ id: "c1", criteria: DEFAULT_CRITERIA }}
        onAdd={onAdd}
        onRemove={() => {}}
      />,
    );
    await user.type(screen.getByTestId("criterion-input"), "Occasion");
    await user.click(screen.getByTestId("add-criterion"));
    expect(onAdd).toHaveBeenCalledWith("Occasion");
  });

  it("calls onRemove for a custom criterion", async () => {
    const onRemove = vi.fn();
    const user = userEvent.setup();
    const criteria = [...DEFAULT_CRITERIA, { key: "c_occasion_ab12", label: "Occasion", custom: true }];
    render(
      <CriteriaConfigurator
        campaign={{ id: "c1", criteria }}
        onAdd={() => {}}
        onRemove={onRemove}
      />,
    );
    await user.click(screen.getByLabelText("Remove Occasion"));
    expect(onRemove).toHaveBeenCalledWith("c_occasion_ab12");
  });
});
