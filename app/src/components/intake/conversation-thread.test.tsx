import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConversationThread } from "./conversation-thread";
import type { Message } from "@/lib/types";

const m = (over: Partial<Message>): Message => ({
  id: "x",
  role: "user",
  type: "text",
  timestamp: "2026-05-26T10:00:00+05:30",
  content: "Hello",
  ...over,
});

describe("ConversationThread", () => {
  it("renders empty state when no messages", () => {
    render(<ConversationThread messages={[]} />);
    expect(screen.getByText(/no messages yet/i)).toBeInTheDocument();
  });

  it("renders user and agent messages with distinct roles", () => {
    render(
      <ConversationThread
        messages={[
          m({ id: "1", role: "user", content: "Hi" }),
          m({ id: "2", role: "agent", content: "Hello!" }),
        ]}
      />,
    );
    expect(screen.getByTestId("message-1")).toHaveAttribute("data-role", "user");
    expect(screen.getByTestId("message-2")).toHaveAttribute("data-role", "agent");
  });

  it("marks voice messages as unsupported type", () => {
    render(
      <ConversationThread
        messages={[m({ id: "v", type: "voice", content: "Voice note · 0:42" })]}
      />,
    );
    expect(screen.getByTestId("message-v")).toHaveAttribute("data-type", "voice");
    expect(screen.getByText(/voice note/i)).toBeInTheDocument();
  });

  it("renders extraction highlight chips on the message that extracted them", () => {
    render(
      <ConversationThread
        messages={[m({ id: "h", role: "user", highlights: ["name", "budget"] })]}
      />,
    );
    expect(screen.getByText(/^name$/i)).toBeInTheDocument();
    expect(screen.getByText(/^budget$/i)).toBeInTheDocument();
  });
});
