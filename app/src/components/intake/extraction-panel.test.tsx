import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExtractionPanel } from "./extraction-panel";
import { emptyFields } from "@/lib/types";

describe("ExtractionPanel", () => {
  it("renders all five field rows", () => {
    render(<ExtractionPanel fields={emptyFields()} classification="unclassified" />);
    for (const key of ["name", "destination", "travel_dates", "group_size", "budget"]) {
      expect(screen.getByTestId(`field-${key}`)).toBeInTheDocument();
    }
  });

  it("marks unextracted fields as pending", () => {
    render(<ExtractionPanel fields={emptyFields()} classification="unclassified" />);
    expect(screen.getByTestId("field-name")).toHaveAttribute("data-state", "pending");
  });

  it("marks extracted fields and shows the value", () => {
    const fields = emptyFields().map((f) =>
      f.key === "name"
        ? { ...f, value: "Priya", confidence: 0.9, extractedAtMessageIndex: 0 }
        : f,
    );
    render(<ExtractionPanel fields={fields} classification="warm" />);
    const row = screen.getByTestId("field-name");
    expect(row).toHaveAttribute("data-state", "extracted");
    expect(row).toHaveTextContent("Priya");
  });

  it("shows the classification reason when provided", () => {
    render(
      <ExtractionPanel
        fields={emptyFields()}
        classification="hot"
        classificationReason="Group of 4, budget Rs 18k, October dates locked"
      />,
    );
    expect(screen.getByText(/group of 4/i)).toBeInTheDocument();
  });
});
