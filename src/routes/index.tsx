import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { loadProfile } from "@/lib/profile";

import { ArrowRight, BookOpen, ChartNoAxesColumnIncreasing, NotebookPen } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { summarize } from "@/lib/learning";
import { learningQuery } from "@/lib/learning-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { LearningBoundary } from "@/components/LearningBoundary";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/pieslegties" });
    const profile = await loadProfile(data.user.id);
    if (!profile?.onboarded) throw redirect({ to: "/onboarding" });
    return { profile };
  },
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Examio — gatavojies valsts eksāmeniem gudri" },
      { name: "description", content: "Gatavojies centralizētajiem eksāmeniem un seko saviem uzdevumu rezultātiem." },
      { property: "og:title", content: "Examio — gatavojies valsts eksāmeniem gudri" },
      { property: "og:description", content: "Tavi eksāmeni, mācību uzdevumi un rezultāti vienuviet." },
    ],
  }),
  component: () => <LearningBoundary><Dashboard /></LearningBoundary>,
});

function Dashboard() {
  const { profile } = Route.useRouteContext();
  const { data } = useSuspenseQuery(learningQuery);
  const stats = summarize(data?.attempts ?? [], data?.tasks ?? []);

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-3xl font-semibold md:text-4xl">Mans mācību galds</h1>
        {profile.grade && <span className="text-sm font-semibold text-muted-foreground">{profile.grade}</span>}
      </div>
      <section className="study-cover">
        <div className="relative z-10 max-w-lg">
          <h2 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
            {profile.display_name ? `Sveiki, ${profile.display_name}!` : "Sveiki!"}
          </h2>
          <p className="mt-3 max-w-sm leading-relaxed">Izvēlies priekšmetu un vingrinies eksāmena uzdevumu risināšanā.</p>
          <Button asChild variant="cta" size="lg" className="mt-6 rounded-xl px-5">
            <Link to="/macibas">{stats.count ? "Turpināt mācīties" : "Sākt mācīties"} <ArrowRight /></Link>
          </Button>
        </div>
        <div className="study-diagram" aria-hidden="true"><i /><b /><span /></div>
      </section>

      <div className="mt-6 grid items-start gap-6 md:grid-cols-[1.2fr_1fr]">
        <section className="card-surface p-5 sm:p-7">
          <h2 className="panel-title"><BookOpen /> Mani eksāmeni</h2>
          {profile.exams.length ? (
            <ul className="mt-3 divide-y">
              {profile.exams.map((exam, index) => (
                <li key={index} className="flex items-center justify-between gap-4 py-4 last:pb-0">
                  <div><p className="font-semibold">{exam.subject}</p>
                    {exam.level && <p className="mt-1 text-sm text-muted-foreground">{exam.level}</p>}
                  </div>
                  {exam.year && <span className="rounded-md bg-muted px-2.5 py-1 text-sm tabular-nums">{exam.year}</span>}
                </li>
              ))}
            </ul>
          ) : <p className="mt-4 text-muted-foreground">Vēl neesi izvēlējies eksāmenus. Mācību sadaļā vari apskatīt priekšmetus.</p>}
        </section>
        <section className="card-surface p-5 sm:p-7">
          <h2 className="panel-title"><ChartNoAxesColumnIncreasing /> Mani rezultāti</h2>
          {stats.count ? <>
            <div className="my-5 flex items-baseline gap-2"><strong className="font-display text-4xl">{stats.average}%</strong><span className="text-sm text-muted-foreground">vidēji</span></div>
            <ul className="space-y-4">
              {stats.projected.map(({ subject, score }) => <li key={subject}>
                <div className="mb-2 flex justify-between gap-4 text-sm"><span>{subject}</span><b>{score}%</b></div>
                <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${score}%` }} /></div>
              </li>)}
            </ul>
          </> : <div className="mt-5 rounded-xl bg-muted p-5">
            <NotebookPen className="mb-3 size-6 text-primary-strong" aria-hidden="true" />
            <p className="font-semibold">Tavs pirmais uzdevums vēl priekšā</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Kad atbildēsi uz uzdevumu, šeit redzēsi savu rezultātu.</p>
          </div>}
        </section>
      </div>
    </AppShell>
  );
}
