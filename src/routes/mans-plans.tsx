import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Target, CalendarCheck } from "lucide-react";
import { AppShell, PageTitle } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { LearningBoundary, SignInToStudy } from "@/components/LearningBoundary";
import { TaskCard } from "@/components/TaskCard";
import { learningQuery } from "@/lib/learning-query";
import { dailyTasks, weakTopics } from "@/lib/plan";
import type { LearningTask } from "@/lib/learning";

export const Route = createFileRoute("/mans-plans")({
  head: () => ({
    meta: [
      { title: "Mans plāns — vājās tēmas un šodienas uzdevumi | Examio" },
      { name: "description", content: "Tavas vājākās tēmas un personalizēti 10 uzdevumi dienā ar atkārtošanu pēc 1, 3 un 7 dienām." },
      { property: "og:title", content: "Mans plāns | Examio" },
      { property: "og:description", content: "Personalizēts dienas uzdevumu plāns CE sagatavošanai." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <LearningBoundary><Plan /></LearningBoundary>,
});

function Plan() {
  const { data } = useSuspenseQuery(learningQuery);
  const [today, setToday] = useState<LearningTask[] | null>(null);
  if (!data) return <AppShell><SignInToStudy /></AppShell>;
  const weak = weakTopics(data.attempts, data.tasks);
  return (
    <AppShell>
      <PageTitle title="Mans plāns" sub="Vājākās tēmas pēc pēdējiem 20 mēģinājumiem katrā tēmā" />
      <section className="card-surface mb-6 p-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-accent"><Target className="h-4 w-4" /> Vājākās tēmas</div>
        {!weak.length ? <p className="mt-3 text-muted-foreground">Nav tēmu ar precizitāti zem 60%. Atrisini vairāk uzdevumu!</p> :
          <div className="mt-4 grid gap-3 sm:grid-cols-3">{weak.map(w => (
            <div key={w.topic} className="rounded-xl border border-accent p-4">
              <div className="font-semibold">{w.topic}</div>
              <div className="mt-1 font-display text-2xl font-bold text-accent">{w.accuracy}%</div>
              <div className="text-xs text-muted-foreground">{w.count} mēģinājumi</div>
            </div>))}</div>}
      </section>
      <Button variant="cta" size="lg" onClick={() => setToday(dailyTasks(data.tasks, data.attempts))}><CalendarCheck /> Šodienas 10 uzdevumi</Button>
      <p className="mt-2 text-sm text-muted-foreground">60% vājās tēmas · 30% vidējās · 10% jaunas. Kļūdas atkārtojas pēc 1, 3 un 7 dienām.</p>
      {today && <div className="mt-6 grid gap-4">{today.length ? today.map((t, i) => <TaskCard key={t.id} t={t} n={i + 1} />) : <p className="card-surface p-6 text-muted-foreground">Šodien nav pieejamu uzdevumu.</p>}</div>}
    </AppShell>
  );
}
