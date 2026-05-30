import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HotLeadAlert } from "./hot-lead-alert";
import { MOCK_LEADS } from "@/lib/mock/leads";

describe("HotLeadAlert", () => {
  it("renders for a hot lead that has been notified", () => {
    const hotLead = MOCK_LEADS.find((l) => l.classification === "hot" && l.agentNotifiedAt)!;
    render(<HotLeadAlert lead={hotLead} />);
    expect(screen.getByTestId("hot-lead-alert")).toBeInTheDocument();
  });

  it("does not render for warm leads", () => {
    const warmLead = MOCK_LEADS.find((l) => l.classification === "warm")!;
    render(<HotLeadAlert lead={warmLead} />);
    expect(screen.queryByTestId("hot-lead-alert")).not.toBeInTheDocument();
  });

  it("does not render when a hot lead has not been notified yet", () => {
    const hotLead = MOCK_LEADS.find((l) => l.classification === "hot")!;
    const notYetNotified = { ...hotLead, agentNotifiedAt: undefined };
    render(<HotLeadAlert lead={notYetNotified} />);
    expect(screen.queryByTestId("hot-lead-alert")).not.toBeInTheDocument();
  });
});
