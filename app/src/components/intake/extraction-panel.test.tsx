import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExtractionPanel } from "./extraction-panel";
import { emptyFields, DEFAULT_CRITERIA } from "@/lib/types";

describe("ExtractionPanel", () => {
  it("renders a row per configured criterion", () => {
    render(<ExtractionPanel criteria={DEFAULT_CRITERIA} fields={emptyFields()} />);
    for (const key of ["name", "destination", "travel_dates", "group_size", "budget"]) {
      expect(screen.getByTestId(`field-${key}`)).toBeInTheDocument();
    }
  });

  it("marks an uncaptured criterion as pending", () => {
    render(<ExtractionPanel criteria={DEFAULT_CRITERIA} fields={emptyFields()} />);
    expect(screen.getByTestId("field-name")).toHaveAttribute("data-state", "pending");
  });

  it("marks a captured criterion and shows the value", () => {
    const fields = emptyFields().map((f) =>
      f.key === "name" ? { ...f, value: "Priya", confidence: 0.9, extractedAtMessageIndex: 0 } : f,
    );
    render(<ExtractionPanel criteria={DEFAULT_CRITERIA} fields={fields} />);
    const row = screen.getByTestId("field-name");
    expect(row).toHaveAttribute("data-state", "extracted");
    expect(row).toHaveTextContent("Priya");
  });

  it("renders a custom criterion as awaiting (no value yet)", () => {
    const criteria = [...DEFAULT_CRITERIA, { key: "c_occasion_ab12", label: "Occasion", custom: true }];
    render(<ExtractionPanel criteria={criteria} fields={emptyFields()} />);
    expect(screen.getByTestId("field-c_occasion_ab12")).toHaveAttribute("data-state", "pending");
  });

  it("shows the summary in its own tile when provided", () => {
    render(
      <ExtractionPanel
        criteria={DEFAULT_CRITERIA}
        fields={emptyFields()}
        summary="Group of 4, budget Rs 18k, October dates locked"
      />,
    );
    expect(screen.getByTestId("extraction-summary")).toHaveTextContent(/group of 4/i);
  });

  it("does not render a classification badge", () => {
    render(<ExtractionPanel criteria={DEFAULT_CRITERIA} fields={emptyFields()} />);
    expect(screen.queryByTestId("classification-badge")).not.toBeInTheDocument();
  });
});
