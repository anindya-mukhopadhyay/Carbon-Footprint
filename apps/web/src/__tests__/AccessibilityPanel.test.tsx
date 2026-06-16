import { fireEvent, render, screen } from "@testing-library/react";
import { AccessibilityPanel, type Theme } from "@/features/AccessibilityPanel";
import { vi } from "vitest";

describe("AccessibilityPanel Component", () => {
  const mockSetTheme = vi.fn();
  const mockSetFontScale = vi.fn();

  beforeEach(() => {
    mockSetTheme.mockClear();
    mockSetFontScale.mockClear();
  });

  it("renders all accessibility controls with labels", () => {
    render(
      <AccessibilityPanel
        theme="light"
        setTheme={mockSetTheme}
        fontScale={1}
        setFontScale={mockSetFontScale}
      />
    );

    expect(screen.getByText("Accessibility Controls")).toBeInTheDocument();
    expect(screen.getByLabelText("Theme")).toBeInTheDocument();
    expect(screen.getByLabelText("Contrast")).toBeInTheDocument();
    expect(screen.getByLabelText("Font size")).toBeInTheDocument();
    expect(screen.getByLabelText("Language")).toBeInTheDocument();
  });

  it("triggers setTheme callback when theme select value changes", () => {
    render(
      <AccessibilityPanel
        theme="light"
        setTheme={mockSetTheme}
        fontScale={1}
        setFontScale={mockSetFontScale}
      />
    );

    const themeSelect = screen.getByLabelText("Theme");
    fireEvent.change(themeSelect, { target: { value: "dark" } });

    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("triggers setFontScale callback when font size input changes", () => {
    render(
      <AccessibilityPanel
        theme="light"
        setTheme={mockSetTheme}
        fontScale={1}
        setFontScale={mockSetFontScale}
      />
    );

    const fontSlider = screen.getByLabelText("Font size");
    fireEvent.change(fontSlider, { target: { value: "1.15" } });

    expect(mockSetFontScale).toHaveBeenCalledWith(1.15);
  });
});
