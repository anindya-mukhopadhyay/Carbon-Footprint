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
          <label className="grid gap-2 text-sm font-bold text-soil">
            Theme
            <select value={theme} onChange={(event) => setTheme(event.target.value as Theme)} className="rounded-2xl border border-soil/20 bg-white px-4 py-3">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm font-bold text-soil">
            Contrast
            <select value={contrast} onChange={(event) => setContrast(event.target.value as Contrast)} className="rounded-2xl border border-soil/20 bg-white px-4 py-3">
              <option value="standard">Standard</option>
              <option value="high">High contrast</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm font-bold text-soil">
            Font size
            <input
              aria-label="Adjust font size"
              type="range"
              min="0.9"
              max="1.25"
              step="0.05"
              value={fontScale}
              onChange={(event) => setFontScale(Number(event.target.value))}
            />
          </label>

          <label className="grid gap-2 text-sm font-bold text-soil">
            Language
            <select value={language} onChange={(event) => setLanguage(event.target.value)} className="rounded-2xl border border-soil/20 bg-white px-4 py-3">
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="bn">Bengali</option>
              <option value="es">Spanish</option>
            </select>
          </label>
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
