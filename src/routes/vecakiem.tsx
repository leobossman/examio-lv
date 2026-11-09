import { createFileRoute } from "@tanstack/react-router";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell, PageTitle } from "@/components/AppShell";
import { summarize } from "@/lib/learning";
import { learningQuery } from "@/lib/learning-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { LearningBoundary, SignInToStudy } from "@/components/LearningBoundary";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/vecakiem")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Vecāku panelis — sekojiet progresam | Examio" },
      { name: "description", content: "Vecāki redz bērna progresu, mācību laiku un vājās vietas eksāmenu sagatavošanā." },
      { property: "og:title", content: "Vecāku panelis | Examio" },
      { property: "og:description", content: "Progress, mācību laiks un vājās vietas vienā skatā." },
    ],
  }),
  component: () => <LearningBoundary><Parents /></LearningBoundary>,
});

function Parents() {
  const { data } = useSuspenseQuery(learningQuery);
  if (!data) return <AppShell><SignInToStudy /></AppShell>;
  const stats = summarize(data.attempts, data.tasks);
  const { weekly, weakSpots, totalMin } = stats;
  return (
    <AppShell>
      <div className="flex items-start justify-between gap-4">
        <PageTitle title="Vecāku panelis" sub={`${data.profile.display_name || "Tavs"} progress`} />
        <Button onClick={() => window.print()} className="no-print rounded-lg bg-accent px-4 py-2 text-sm font-bold text-accent-foreground">Lejupielādēt PDF atskaiti</Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Mācību laiks", `${Math.floor(totalMin / 60)} h ${totalMin % 60} min`],
          ["Vidējais rezultāts", stats.count ? `${stats.average}%` : "—"],
          ["Atrisināti uzdevumi", String(stats.solved)],
          ["XP", String(data.profile.xp)],
          ["Dienu sērija", String(data.profile.streak)],
        ].map(([l, v]) => (
          <div key={l} className="card-surface p-5"><div className="text-sm text-muted-foreground">{l}</div><div className="mt-1 font-display text-2xl font-bold">{v}</div></div>
        ))}
      </div>
      {!stats.count ? <p className="mt-6 text-muted-foreground">Atrisini pirmos uzdevumus</p> : <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card-surface p-5">
          <h2 className="mb-4 font-bold">Rezultātu dinamika</h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={weekly}>
              <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.4} /><stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip />
              <Area dataKey="score" name="Rezultāts %" stroke="var(--chart-1)" strokeWidth={3} fill="url(#g)" />
            </AreaChart>
          </ResponsiveContainer>
        </section>
        <section className="card-surface p-5">
          <h2 className="mb-4 font-bold">Mācību laiks (min)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weekly}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip />
              <Bar dataKey="min" name="Minūtes" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
        <section className="card-surface p-5 lg:col-span-2">
          <h2 className="mb-4 font-bold">Vājās vietas</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weakSpots} layout="vertical" margin={{ left: 40 }}>
              <XAxis type="number" domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis type="category" dataKey="topic" stroke="var(--muted-foreground)" fontSize={12} width={120} />
              <Tooltip />
              <Bar dataKey="value" name="Precizitāte %" fill="var(--chart-1)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>}
    </AppShell>
  );
}
