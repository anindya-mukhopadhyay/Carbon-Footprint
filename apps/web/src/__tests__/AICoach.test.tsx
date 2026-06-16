import { render, screen } from "@testing-library/react";
import { AICoach } from "@/components/AICoach";
import { expect, test, vi } from "vitest";

vi.mock("@/lib/api", () => ({
  askCoach: vi.fn().mockResolvedValue({ answer: "mock answer", actions: [], estimatedAnnualSavingsKg: 0 })
}));

test("renders AICoach correctly", () => {
  render(<AICoach />);
  expect(screen.getByText(/Gemini sustainability coach/i)).toBeInTheDocument();
});
