import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CriteriaConfigurator } from "./criteria-configurator";

beforeEach(() => {
  window.localStorage.clear();
});

describe("CriteriaConfigurator", () => {
  it("shows the five default criteria", () => {
    render(<CriteriaConfigurator />);
    expect(screen.getByTestId("criterion-name")).toBeInTheDocument();
    expect(screen.getByTestId("criterion-budget")).toBeInTheDocument();
    expect(screen.getAllByText("Default")).toHaveLength(5);
  });

  it("adds and removes a custom parameter", async () => {
    const user = userEvent.setup();
    render(<CriteriaConfigurator />);

    await user.type(screen.getByTestId("criterion-input"), "Occasion");
    await user.click(screen.getByTestId("add-criterion"));

    expect(screen.getByText("Occasion")).toBeInTheDocument();
    expect(screen.getByText("Custom")).toBeInTheDocument();

    const remove = screen.getByLabelText("Remove Occasion");
    await user.click(remove);
    expect(screen.queryByText("Occasion")).not.toBeInTheDocument();
  });
});
