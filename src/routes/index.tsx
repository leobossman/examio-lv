import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { computeGap, goals, loadProfile, type Exam } from "@/lib/profile";
import { useEffect, useState } from "react";
import { Trophy, ArrowRight, Flame, Star, CalendarClock, ChevronDown } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { ExamCountdown } from "@/components/ExamCountdown";
import { summarize } from "@/lib/learning";
import { learningQuery } from "@/lib/learning-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { LearningBoundary } from "@/components/LearningBoundary";
import { catalogFor, examDate, nextExamYears } from "@/lib/exam-catalog";

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
      { name: "description", content: "Examio palīdz 9.–12. klases skolēniem sagatavoties CE ar AI pasniedzēju, dueļiem un simulatoru." },
      { property: "og:title", content: "Examio — gatavojies valsts eksāmeniem gudri" },
      { property: "og:description", content: "AI pasniedzējs, dueļi, kartītes un CE simulators latviešu skolēniem." },
    ],
  }),
  component: () => <LearningBoundary><Dashboard /></LearningBoundary>,
});

function Dashboard() {
  const { profile } = Route.useRouteContext();
  const { data } = useSuspenseQuery(learningQuery);
  const [more, setMore] = useState(false);
  const stats = summarize(data?.attempts ?? [], data?.tasks ?? []);
  const leaderboard = data?.leaders ?? [];
  const cat = catalogFor(profile.grade ?? "12. klase");
  const g = computeGap(profile.baseline, profile.goal);
  const goalLabel = goals.find((x) => x.v === profile.goal)?.l ?? "";
  const days = useDaysToExam(profile.exams);

  return (
    <AppShell>
      <section className="card-surface relative overflow-hidden p-7 md:p-10">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary-soft" aria-hidden />
        <div className="relative">
          <p className="text-sm font-semibold text-primary-strong">{profile.grade} · {profile.exams.length} eksāmeni</p>
          <h1 className="mt-2 text-3xl font-bold md:text-5xl">Sveiks, {profile.display_name || "skolēn"}! 👋</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">Šodien {g.dailyMin} minūtes, lai tuvotos mērķim: {goalLabel || `${g.target}%`}.</p>
          <Button asChild variant="cta" size="lg" className="mt-7 h-12 rounded-full px-7 text-base">
            <Link to="/macibas">Turpināt mācīties <ArrowRight /></Link>
          </Button>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-3 gap-3 md:gap-6">
        {[
          { icon: Flame, v: data?.profile.streak ?? 0, l: "dienu sērija" },
          { icon: Star, v: data?.profile.xp ?? 0, l: "XP" },
          { icon: CalendarClock, v: days ?? "…", l: "dienas līdz CE" },
        ].map((m) => (
          <div key={m.l} className="card-surface p-4 md:p-6">
            <m.icon className="h-5 w-5 text-primary-strong" />
            <div className="mt-2 font-display text-2xl font-bold md:text-3xl">{m.v}</div>
            <div className="text-xs text-muted-foreground md:text-sm">{m.l}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="card-surface p-6 md:p-7">
          <h2 className="text-lg font-bold">Tavs plāns</h2>
          <div className="mt-4 font-display text-3xl font-bold">~{g.cur}% → {g.target}%</div>
          <p className="mt-1 text-sm text-muted-foreground">{g.gap === 0 ? "Mērķis sasniegts" : `+${g.gap}% plaisa · ${g.intensity} intensitāte`}</p>
          <p className="mt-4 text-sm">Fokuss: <b>{profile.struggle}</b></p>
          <Link to="/mans-plans" className="mt-4 inline-block text-sm font-semibold text-primary-strong">Atvērt manu plānu →</Link>
        </section>
        <section className="card-surface p-6 md:p-7">
          <h2 className="text-lg font-bold">Rezultāti</h2>
          {!stats.count ? <p className="mt-4 text-muted-foreground">Atrisini pirmos uzdevumus</p> : <div className="mt-4 space-y-3">
            <div className="font-display text-3xl font-bold">{stats.average}% <span className="text-sm font-normal text-muted-foreground">vidēji</span></div>
            {stats.projected.slice(0, 3).map((p) => (
              <div key={p.subject} className="text-sm">
                <div className="mb-1 flex justify-between"><span>{p.subject}</span><b>{p.score}%</b></div>
                <div className="h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${p.score}%` }} /></div>
              </div>
            ))}
          </div>}
        </section>
      </div>

      <div className="mt-8 text-center">
        <Button variant="outline" className="rounded-full" onClick={() => setMore((m) => !m)}>
          {more ? "Rādīt mazāk" : "Skatīt vairāk"} <ChevronDown className={more ? "rotate-180 transition" : "transition"} />
        </Button>
      </div>

      {more && <div className="mt-6 space-y-6">
        <ExamCountdown exams={profile.exams} />
        {leaderboard.length >= 5 && <section className="card-surface p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold"><Trophy className="h-5 w-5 text-primary-strong" /> Līderu tabula</h2>
          <ol className="mt-4 space-y-2">
            {leaderboard.map((u, i) => (
              <li key={i} className={`flex items-center gap-3 rounded-xl p-2 ${u.is_self ? "bg-primary-soft" : ""}`}>
                <span className="w-5 font-display font-bold text-muted-foreground">{i + 1}</span>
                <span className="flex-1 font-medium">{u.is_self ? "Tu" : u.name}</span>
                <span className="text-sm font-bold">{u.xp.toLocaleString("lv")} XP</span>
              </li>
            ))}
          </ol>
        </section>}
        <section>
          <h2 className="mb-4 text-lg font-bold">Eksāmeni · {cat.label}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cat.subjects.map((s) => (
              <Link key={s} to="/macibas" className="card-surface p-5 transition hover:-translate-y-0.5">
                <div className="font-semibold">{s}</div>
                <div className="mt-1 text-xs text-muted-foreground">{profile.exams.find((e) => e.subject === s)?.level ?? cat.levels.join(" · ")}</div>
              </Link>
            ))}
          </div>
        </section>
      </div>}
    </AppShell>
  );
}

function useDaysToExam(exams: Exam[]) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Date.now()), []);
  if (now === null) return null;
  const year = exams.find((e) => e.year)?.year ?? nextExamYears()[0]!;
  const dates = (exams.length ? exams : [{ subject: "Matemātika" } as Exam])
    .map((e) => examDate(e.subject, e.year ?? year).getTime()).filter((t) => t > now).sort((a, b) => a - b);
  return dates[0] ? Math.ceil((dates[0] - now) / 86_400_000) : 0;
}
