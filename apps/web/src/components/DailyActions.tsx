import { useState } from "react";
import { CheckCircle2, Circle, ListTodo, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

interface ActionItem {
  id: string;
  title: string;
  description: string;
  points: number;
}

const DAILY_ACTIONS: ActionItem[] = [
  {
    id: "meatless",
    title: "Meatless Meal",
    description: "Chose a plant-based option today",
    points: 15,
  },
  {
    id: "walk",
    title: "Active Transit",
    description: "Walked or biked instead of driving",
    points: 20,
  },
  {
    id: "unplug",
    title: "Unplugged Idle Devices",
    description: "Saved phantom power load",
    points: 5,
  },
];

export function DailyActions() {
  const [completed, setCompleted] = useState<string[]>([]);

  const toggleAction = (id: string) => {
    if (completed.includes(id)) {
      setCompleted(completed.filter((a) => a !== id));
    } else {
      setCompleted([...completed, id]);
      
      // Fire a tiny confetti if it's the last one
      if (completed.length === DAILY_ACTIONS.length - 1) {
        void confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#74b98a', '#12372a', '#a3e4c4']
        });
      }
    }
  };

  const progress = Math.round((completed.length / DAILY_ACTIONS.length) * 100);

  return (
    <article className="panel daily-actions-panel">
      <div className="card-heading">
        <div>
          <span className="eyebrow flex items-center gap-1">
            <ListTodo size={14} /> Daily Simple Actions
          </span>
          <h3>Micro-Habits</h3>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-sm font-bold text-[#74b98a]">{progress}%</span>
          <div className="w-16 h-2 bg-[#173b2c] rounded-full overflow-hidden mt-1">
            <div 
              className="h-full bg-[#74b98a] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
      
      <p className="text-sm opacity-80 mb-4 mt-2">
        Small choices compound into measurable impact. Check off what you've done today.
      </p>

      <div className="flex flex-col gap-3">
        {DAILY_ACTIONS.map((action) => {
          const isDone = completed.includes(action.id);
          return (
            <button
              key={action.id}
              onClick={() => toggleAction(action.id)}
              className={`flex items-start text-left p-3 rounded-xl border transition-all duration-300 ${
                isDone 
                  ? "bg-[#74b98a]/10 border-[#74b98a]/50 opacity-80" 
                  : "bg-black/20 border-white/5 hover:border-white/20 hover:bg-black/30"
              }`}
            >
              <div className={`mt-0.5 mr-3 transition-colors ${isDone ? "text-[#74b98a]" : "text-white/40"}`}>
                {isDone ? <CheckCircle2 size={20} /> : <Circle size={20} />}
              </div>
              <div className="flex-1">
                <div className={`font-semibold text-sm transition-all ${isDone ? "text-[#74b98a] line-through decoration-[#74b98a]/50" : "text-white"}`}>
                  {action.title}
                </div>
                <div className="text-xs opacity-60 mt-0.5">{action.description}</div>
              </div>
              <div className={`text-xs font-bold px-2 py-1 rounded-full ${isDone ? "bg-[#74b98a]/20 text-[#74b98a]" : "bg-white/10 text-white/70"}`}>
                +{action.points}
              </div>
            </button>
          );
        })}
      </div>

      {progress === 100 && (
        <div className="mt-4 p-3 bg-[#74b98a]/20 rounded-xl border border-[#74b98a]/30 flex items-center justify-center gap-2 text-[#74b98a] font-bold text-sm animate-fade-in">
          <Sparkles size={16} /> All daily actions completed!
        </div>
      )}
    </article>
  );
}
