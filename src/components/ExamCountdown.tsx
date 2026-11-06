import { useEffect, useState } from "react";
import { AlarmClock } from "lucide-react";
import { examDate, nextExamYears, subjectLocative } from "@/lib/exam-catalog";
import type { Exam } from "@/lib/profile";

export function ExamCountdown({ exams }: { exams: Exam[] }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  const year = exams.find((e) => e.year)?.year ?? nextExamYears()[0]!;
  const next = exams
    .map((e) => ({ subject: e.subject, date: examDate(e.subject, e.year ?? year) }))
    .filter((e) => now === null || e.date.getTime() > now)
    .sort((a, b) => a.date.getTime() - b.date.getTime())[0]
    ?? { subject: "Matemātika", date: examDate("Matemātika", year) };
  const diff = now === null ? 0 : Math.max(0, next.date.getTime() - now);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);

  return (
    <section className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl bg-fire p-5 text-accent-foreground shadow-cta">
      <AlarmClock className="h-10 w-10 shrink-0 animate-pulse" />
      <div className="flex-1">
        <div className="text-sm font-semibold opacity-90">Līdz eksāmenam {subjectLocative(next.subject)}</div>
        <div className="font-display text-2xl font-bold md:text-3xl">{now === null ? "…" : `${days} dienas ${hours}h`}</div>
      </div>
      <div className="text-sm font-medium opacity-90">{next.date.toLocaleDateString("lv-LV", { day: "numeric", month: "long", year: "numeric" })}</div>
    </section>
  );
}
