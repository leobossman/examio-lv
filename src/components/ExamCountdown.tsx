import { useEffect, useState } from "react";
import { AlarmClock } from "lucide-react";

// Mock CE date for mathematics
const EXAM = { subject: "Matemātikā", date: new Date("2027-05-24T09:00:00+03:00") };

export function ExamCountdown() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  const diff = now === null ? 0 : Math.max(0, EXAM.date.getTime() - now);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);

  return (
    <section className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl bg-fire p-5 text-accent-foreground shadow-cta">
      <AlarmClock className="h-10 w-10 shrink-0 animate-pulse" />
      <div className="flex-1">
        <div className="text-sm font-semibold opacity-90">Līdz CE {EXAM.subject}</div>
        <div className="font-display text-2xl font-bold md:text-3xl">
          {now === null ? "…" : `${days} dienas ${hours}h`}
        </div>
      </div>
      <div className="text-sm font-medium opacity-90">{EXAM.date.toLocaleDateString("lv-LV", { day: "numeric", month: "long", year: "numeric" })}</div>
    </section>
  );
}
