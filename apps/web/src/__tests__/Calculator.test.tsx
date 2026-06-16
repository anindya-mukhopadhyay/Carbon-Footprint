import { render, screen } from "@testing-library/react";
import { Calculator } from "@/components/Calculator";
import { expect, test } from "vitest";

test("renders Calculator correctly", () => {
  render(<Calculator />);
  expect(screen.getByText(/Your estimated footprint/i)).toBeInTheDocument();
});
