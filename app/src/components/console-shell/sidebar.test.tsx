import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sidebar, NAV_ITEMS } from "./sidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/intake",
}));

describe("Sidebar", () => {
  it("renders the workspace label", () => {
    render(<Sidebar />);
    expect(screen.getByText(/Connecting/)).toBeInTheDocument();
    expect(screen.getByText(/Traveller/)).toBeInTheDocument();
  });

  it("renders every operational module link", () => {
    render(<Sidebar />);
    for (const item of NAV_ITEMS) {
      expect(screen.getByRole("link", { name: new RegExp(item.label, "i") })).toHaveAttribute(
        "href",
        item.href,
      );
    }
  });

  it("marks the active route", () => {
    render(<Sidebar />);
    const intakeLink = screen.getByRole("link", { name: /Intake/i });
    expect(intakeLink).toHaveAttribute("data-active", "true");

    const leadsLink = screen.getByRole("link", { name: /Leads/i });
    expect(leadsLink).toHaveAttribute("data-active", "false");
  });
});
