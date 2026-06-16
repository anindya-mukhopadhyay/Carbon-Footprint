import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

export type Theme = "light" | "dark";
type Contrast = "standard" | "high";

export interface AccessibilityPanelProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  fontScale: number;
  setFontScale: (scale: number) => void;
}

export function AccessibilityPanel({
  theme,
  setTheme,
  fontScale,
  setFontScale
}: AccessibilityPanelProps) {
  const [contrast, setContrast] = useState<Contrast>("standard");
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("data-contrast", contrast);
    document.documentElement.style.setProperty("--font-scale", String(fontScale));
    document.documentElement.lang = language;
  }, [contrast, fontScale, language, theme]);

  function runVoiceCommand() {
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) {
      window.alert("Voice commands are unavailable in this browser. Keyboard controls remain supported.");
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const command = event.results[0]?.[0]?.transcript.toLowerCase() ?? "";
      if (command.includes("dashboard")) {
        document.querySelector("#dashboard")?.scrollIntoView({ behavior: "smooth" });
      }
      if (command.includes("high contrast")) {
        setContrast("high");
      }
      if (command.includes("dark")) {
        setTheme("dark");
      }
    };
    recognition.start();
  }

  return (
    <section id="accessibility" aria-labelledby="accessibility-heading">
      <Card className="bg-gradient-to-r from-sun/30 via-paper to-skyglass/60">
        <Badge>WCAG 2.2 AA</Badge>
        <h2 id="accessibility-heading" className="text-2xl font-bold text-soil mt-4 mb-2">
          Accessibility Controls
        </h2>
        <CardTitle id="accessibility-title" className="text-sm text-soil/75 mt-1">
          These tools are product features, not afterthoughts.
        </CardTitle>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="grid gap-2">
            <label htmlFor="theme-select" className="text-sm font-bold text-soil">
              Theme
            </label>
            <select
              id="theme-select"
              value={theme}
              onChange={(event) => setTheme(event.target.value as Theme)}
              className="rounded-2xl border border-soil/20 bg-white px-4 py-3 text-black"
            >
              <option value="light" className="text-black bg-white">Light</option>
              <option value="dark" className="text-black bg-white">Dark</option>
            </select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="contrast-select" className="text-sm font-bold text-soil">
              Contrast
            </label>
            <select
              id="contrast-select"
              value={contrast}
              onChange={(event) => setContrast(event.target.value as Contrast)}
              className="rounded-2xl border border-soil/20 bg-white px-4 py-3 text-black"
            >
              <option value="standard" className="text-black bg-white">Standard</option>
              <option value="high" className="text-black bg-white">High contrast</option>
            </select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="font-size-slider" className="text-sm font-bold text-soil">
              Font size
            </label>
            <input
              id="font-size-slider"
              aria-label="Adjust font size"
              type="range"
              min="0.9"
              max="1.25"
              step="0.05"
              value={fontScale}
              onChange={(event) => setFontScale(Number(event.target.value))}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="language-select" className="text-sm font-bold text-soil">
              Language
            </label>
            <select
              id="language-select"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="rounded-2xl border border-soil/20 bg-white px-4 py-3 text-black"
            >
              <option value="en" className="text-black bg-white">English</option>
              <option value="hi" className="text-black bg-white">Hindi</option>
              <option value="bn" className="text-black bg-white">Bengali</option>
              <option value="es" className="text-black bg-white">Spanish</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={runVoiceCommand}>
            Try voice command
          </Button>
          <a className="rounded-full px-5 py-2.5 text-sm font-bold text-soil underline" href="#main-content">
            Return to main content
          </a>
        </div>
      </Card>
    </section>
  );
}
