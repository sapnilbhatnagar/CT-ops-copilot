import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ClassificationBadge } from "./classification-badge";

describe("ClassificationBadge", () => {
  it("renders Hot for hot leads", () => {
    render(<ClassificationBadge value="hot" />);
    const badge = screen.getByTestId("classification-badge");
    expect(badge).toHaveTextContent(/hot/i);
    expect(badge).toHaveAttribute("data-classification", "hot");
  });

  it("renders Warm for warm leads", () => {
    render(<ClassificationBadge value="warm" />);
    expect(screen.getByTestId("classification-badge")).toHaveTextContent(/warm/i);
  });

  it("renders Cold for cold leads", () => {
    render(<ClassificationBadge value="cold" />);
    expect(screen.getByTestId("classification-badge")).toHaveTextContent(/cold/i);
  });

  it("renders Qualifying for unclassified leads", () => {
    render(<ClassificationBadge value="unclassified" />);
    expect(screen.getByTestId("classification-badge")).toHaveTextContent(/qualifying/i);
  });
});
