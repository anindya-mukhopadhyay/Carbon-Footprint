import { useState } from "react";
import { Bot, Mic, Send, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { askCoach } from "@/lib/api";
import { defaultProfile } from "@/data/mock";

const fallback =
  "Replacing three short car trips each week with public transit can cut about 310 kg CO₂e per year. Start with the trip that has the most reliable route, then make it a repeating calendar habit.";

export function AICoach() {
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState(fallback);
  const [loading, setLoading] = useState(false);

  async function submit() {
    const prompt = message.trim();
    if (!prompt) return;
    setLoading(true);
    try {
      const response = await askCoach(prompt, defaultProfile);
      setAnswer(response.answer);
    } catch {
      setAnswer(
        "I can still help while the cloud coach is offline: start with one repeatable transport or energy change and track it for seven days."
      );
    } finally {
      setLoading(false);
      setMessage("");
    }
  }

  function listen() {
    const SpeechRecognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) setMessage(transcript);
    };
    recognition.start();
  }

  function speak() {
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(answer));
  }

  return (
    <section className="coach-card" aria-labelledby="coach-title">
      <div className="coach-header">
        <span className="coach-avatar">
          <Bot size={24} aria-hidden="true" />
        </span>
        <div>
          <h3 id="coach-title">Gemini sustainability coach</h3>
          <span className="online">Online · grounded in your footprint</span>
        </div>
      </div>
      <div className="coach-message">
        <p>{loading ? "Building your personalized action plan..." : answer}</p>
        <button aria-label="Read coach response aloud" onClick={speak} type="button">
          <Volume2 size={17} />
        </button>
      </div>
      <div className="quick-prompts" aria-label="Suggested questions">
        {["Lower my commute", "Create a 30-day plan", "Explain my score"].map((prompt) => (
          <button key={prompt} onClick={() => setMessage(prompt)} type="button" aria-label={`Ask coach: ${prompt}`}>
            {prompt}
          </button>
        ))}
      </div>
      <div className="coach-input">
        <label className="sr-only" htmlFor="coach-question">
          Ask your sustainability coach
        </label>
        <input
          id="coach-question"
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") void submit();
          }}
          placeholder="Ask how to lower your footprint..."
          value={message}
        />
        <div className="coach-actions">
          <button aria-label="Use speech to text" onClick={listen} type="button">
            <Mic size={18} />
          </button>
          <Button aria-label="Send question" onClick={() => void submit()} type="button">
            <Send size={17} />
          </Button>
        </div>
      </div>
    </section>
  );
}
