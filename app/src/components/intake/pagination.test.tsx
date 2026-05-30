import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination } from "./pagination";

describe("Pagination", () => {
  it("renders the range and total", () => {
    render(
      <Pagination page={1} totalPages={2} total={16} pageSize={10} onPageChange={() => {}} />,
    );
    expect(screen.getByText(/1–10 of 16/)).toBeInTheDocument();
  });

  it("renders the correct range on the last partial page", () => {
    render(
      <Pagination page={2} totalPages={2} total={16} pageSize={10} onPageChange={() => {}} />,
    );
    expect(screen.getByText(/11–16 of 16/)).toBeInTheDocument();
  });

  it("disables prev on page 1 and next on the last page", () => {
    const { rerender } = render(
      <Pagination page={1} totalPages={2} total={16} pageSize={10} onPageChange={() => {}} />,
    );
    expect(screen.getByTestId("pagination-prev")).toBeDisabled();
    expect(screen.getByTestId("pagination-next")).not.toBeDisabled();
    rerender(
      <Pagination page={2} totalPages={2} total={16} pageSize={10} onPageChange={() => {}} />,
    );
    expect(screen.getByTestId("pagination-prev")).not.toBeDisabled();
    expect(screen.getByTestId("pagination-next")).toBeDisabled();
  });

  it("calls onPageChange when a page number is clicked", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <Pagination page={1} totalPages={2} total={16} pageSize={10} onPageChange={onPageChange} />,
    );
    await user.click(screen.getByTestId("pagination-page-2"));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("renders 0 leads when total is 0", () => {
    render(
      <Pagination page={1} totalPages={1} total={0} pageSize={10} onPageChange={() => {}} />,
    );
    expect(screen.getByText(/0 leads/)).toBeInTheDocument();
  });
});
