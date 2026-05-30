import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LeadList } from "./lead-list";
import { MOCK_LEADS } from "@/lib/mock/leads";
import { MOCK_ADMINS } from "@/lib/mock/admins";

describe("LeadList", () => {
  it("renders the loading state", () => {
    render(
      <LeadList leads={[]} admins={MOCK_ADMINS} selectedId={null} onSelect={() => {}} loading />,
    );
    expect(screen.getByTestId("lead-list-loading")).toBeInTheDocument();
  });

  it("renders the empty state when no leads are present", () => {
    render(<LeadList leads={[]} admins={MOCK_ADMINS} selectedId={null} onSelect={() => {}} />);
    expect(screen.getByTestId("lead-list-empty")).toBeInTheDocument();
  });

  it("renders one row per lead", () => {
    render(
      <LeadList
        leads={MOCK_LEADS}
        admins={MOCK_ADMINS}
        selectedId={null}
        onSelect={() => {}}
      />,
    );
    for (const lead of MOCK_LEADS) {
      expect(screen.getByTestId(`lead-row-${lead.id}`)).toBeInTheDocument();
    }
  });

  it("marks the active lead with data-active=true", () => {
    render(
      <LeadList
        leads={MOCK_LEADS}
        admins={MOCK_ADMINS}
        selectedId="lead_priya_rajasthan"
        onSelect={() => {}}
      />,
    );
    expect(screen.getByTestId("lead-row-lead_priya_rajasthan")).toHaveAttribute(
      "data-active",
      "true",
    );
    expect(screen.getByTestId("lead-row-lead_rajesh_spiti")).toHaveAttribute(
      "data-active",
      "false",
    );
  });

  it("calls onSelect with the lead id when a row is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <LeadList
        leads={MOCK_LEADS}
        admins={MOCK_ADMINS}
        selectedId={null}
        onSelect={onSelect}
      />,
    );
    await user.click(screen.getByTestId("lead-row-lead_priya_rajasthan"));
    expect(onSelect).toHaveBeenCalledWith("lead_priya_rajasthan");
  });

  it("renders the assignee avatar when a lead has an admin", () => {
    const priya = MOCK_LEADS.find((l) => l.id === "lead_priya_rajasthan")!;
    render(
      <LeadList
        leads={[priya]}
        admins={MOCK_ADMINS}
        selectedId={null}
        onSelect={() => {}}
      />,
    );
    expect(screen.getByTestId(`admin-avatar-${priya.assignedToId}`)).toBeInTheDocument();
  });

  it("renders the unassigned avatar when a lead has no admin", () => {
    const unassigned = MOCK_LEADS.find((l) => l.assignedToId === null)!;
    render(
      <LeadList
        leads={[unassigned]}
        admins={MOCK_ADMINS}
        selectedId={null}
        onSelect={() => {}}
      />,
    );
    expect(screen.getByTestId("admin-avatar-unassigned")).toBeInTheDocument();
  });
});
