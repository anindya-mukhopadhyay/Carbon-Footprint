import { useState, useTransition } from "react";
import { Bot, Mic, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { askCoach, type CarbonInput } from "@/lib/api";

type CoachProps = {
  profile: CarbonInput;
};

const starterAnswer =
  "Switching from private car travel to public transport 3 times per week can reduce your yearly emissions by approximately 18%, especially if your commute is above 15 km per day. I would pair that with two low-meat meals and a weekend energy audit.";

export function Coach({ profile }: CoachProps) {
  const [message, setMessage] = useState("How can I reduce my travel footprint this month?");
  const [answer, setAnswer] = useState(starterAnswer);
  const [actions, setActions] = useState(["Try transit on Monday, Wednesday, Friday", "Set a 12 percent energy reduction goal"]);
  const [isListening, setIsListening] = useState(false);
  const [isPending, startTransition] = useTransition();

  function submit() {
    startTransition(() => {
      void askCoach(message, profile)
        .then((response) => {
          setAnswer(response.answer);
          setActions(response.actions);
        })
        .catch(() => {
          setAnswer(starterAnswer);
        });
    });
  }

  function speak() {
    const utterance = new SpeechSynthesisUtterance(answer);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }

  function listen() {
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) {
      setAnswer("Speech recognition is not supported in this browser, but keyboard input works fully.");
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) {
        setMessage(transcript);
      }
    };
    recognition.onend = () => setIsListening(false);
    setIsListening(true);
    recognition.start();
  }

  return (
    <section id="coach" aria-labelledby="coach-title" className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="bg-gradient-to-br from-soil to-tide text-paper">
        <Badge className="border-paper/20 bg-paper/10 text-sun">Gemini coach</Badge>
        <CardTitle id="coach-title" className="mt-4 text-paper">
          A sustainability coach that can explain, plan, and nudge.
        </CardTitle>
        <p className="mt-3 text-sm leading-7 text-paper/75">
          Gemini creates personalized roadmaps, simple explanations, and action plans grounded in
          the user footprint profile. Voice input and text-to-speech keep the experience inclusive.
        </p>

        <label className="mt-6 grid gap-2 text-sm font-bold">
          Ask EcoTrack AI
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={5}
            className="rounded-3xl border border-paper/20 bg-paper/95 p-4 text-soil"
          />
        </label>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={submit} disabled={isPending}>
            <Bot className="mr-2 h-4 w-4" aria-hidden />
            {isPending ? "Thinking..." : "Ask Gemini"}
          </Button>
          <Button variant="secondary" onClick={listen} aria-pressed={isListening}>
            <Mic className="mr-2 h-4 w-4" aria-hidden />
            {isListening ? "Listening" : "Voice input"}
          </Button>
        </div>
      </Card>

      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge>Personalized roadmap</Badge>
            <CardTitle className="mt-4">Coach response</CardTitle>
          </div>
          <Button variant="ghost" onClick={speak} aria-label="Read coach answer aloud">
            <Volume2 className="h-5 w-5" aria-hidden />
          </Button>
        </div>
        <p className="mt-5 rounded-3xl bg-mint/70 p-5 text-base leading-8 text-soil">{answer}</p>
        <ul className="mt-5 grid gap-3">
          {actions.map((action) => (
            <li key={action} className="rounded-2xl border border-soil/10 p-4 text-sm font-semibold text-soil">
              {action}
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}
