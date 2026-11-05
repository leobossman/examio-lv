import { useEffect, useState } from "react";
import { Moon, Sun, Timer, Play, Pause, RotateCcw } from "lucide-react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const d = localStorage.getItem("examio-theme") === "dark";
    setDark(d);
    document.documentElement.classList.toggle("dark", d);
  }, []);
  const toggle = () => {
    const d = !dark;
    setDark(d);
    document.documentElement.classList.toggle("dark", d);
    localStorage.setItem("examio-theme", d ? "dark" : "light");
  };
  return (
    <button onClick={toggle} aria-label={dark ? "Gaišais režīms" : "Tumšais režīms"}
      className="grid h-9 w-9 place-items-center rounded-full bg-muted text-foreground transition hover:bg-primary-soft">
      {dark ? <Sun className="h-4 w-4 text-primary" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

const FOCUS = 25 * 60, BREAK = 5 * 60;

export function FocusTimer() {
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [left, setLeft] = useState(FOCUS);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setLeft((s) => {
        if (s > 1) return s - 1;
        setMode((m) => {
          const next = m === "focus" ? "break" : "focus";
          setLeft(next === "focus" ? FOCUS : BREAK);
          return next;
        });
        return 0;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const reset = () => { setRunning(false); setMode("focus"); setLeft(FOCUS); };
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <div className="flex items-center gap-1 rounded-full border bg-card px-2 py-1 text-sm" title="Fokusa režīms">
      <Timer className={`h-4 w-4 ${mode === "focus" ? "text-primary" : "text-success"}`} />
      <span className="hidden text-xs text-muted-foreground lg:inline">{mode === "focus" ? "Fokuss" : "Pauze"}</span>
      <span className="w-12 text-center font-mono font-bold tabular-nums">{mm}:{ss}</span>
      <button onClick={() => setRunning((r) => !r)} aria-label={running ? "Pauzēt" : "Sākt"} className="rounded-full p-1 hover:bg-muted">
        {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
      </button>
      <button onClick={reset} aria-label="Atiestatīt" className="rounded-full p-1 hover:bg-muted"><RotateCcw className="h-3.5 w-3.5" /></button>
    </div>
  );
}
