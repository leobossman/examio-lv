import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { computeGap, goals, loadProfile } from "@/lib/profile";
import { useState } from "react";
import { GraduationCap, Swords, Timer, Layers, PenLine, Trophy } from "lucide-react";
import { AppShell, PageTitle } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { ExamCountdown } from "@/components/ExamCountdown";
import { summarize } from "@/lib/learning";
import { learningQuery } from "@/lib/learning-query";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { LearningBoundary } from "@/components/LearningBoundary";
import { GRADES, catalogFor } from "@/lib/exam-catalog";

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
  const [grade, setGrade] = useState<string>(profile.grade ?? "12. klase");
  const { data } = useSuspenseQuery(learningQuery);
  const client = useQueryClient();
  const stats = summarize(data?.attempts ?? [], data?.tasks ?? []);
  const avg = stats.average;
  const projected = stats.projected;
  const leaderboard = data?.leaders ?? [];
  const cat = catalogFor(grade);
  const nav = useNavigate();
  const g = computeGap(profile.baseline, profile.goal);
  const goalLabel = goals.find((x) => x.v === profile.goal)?.l ?? "";
  const signOut = async () => { await client.cancelQueries(); client.clear(); await supabase.auth.signOut(); nav({ to: "/pieslegties", replace: true }); };

  return (
    <AppShell>
      <div className="flex items-start justify-between gap-4">
        <PageTitle title={`Sveiks, ${profile.display_name || "skolēn"}! 👋`} sub={`${profile.grade} · ${profile.exams.map((e) => `${e.subject} (${e.level})`).join(", ")}`} />
        <Button variant="outline" size="sm" onClick={signOut}>Iziet</Button>
      </div>

      <ExamCountdown exams={profile.exams} />
      <div className="mb-6 flex flex-wrap gap-6 font-semibold"><span>{data?.profile.xp ?? 0} XP</span><span>Dienu sērija: {data?.profile.streak ?? 0}</span></div>
      <section className={`card-surface mb-6 p-6 ${g.gap > 35 ? "border-accent" : "border-primary"}`}>
        <div className="text-sm font-semibold text-primary">Tavs personīgais plāns</div>
        <div className="mt-2 flex flex-wrap items-end gap-6">
          <div><div className="font-display text-3xl font-bold">~{g.cur}% → {g.target}%</div><div className="text-sm text-muted-foreground">{goalLabel}</div></div>
          <div><div className={`font-display text-3xl font-bold ${g.gap > 35 ? "text-accent" : "text-primary"}`}>{g.gap === 0 ? "Mērķis sasniegts" : `+${g.gap}%`}</div><div className="text-sm text-muted-foreground">plaisa līdz mērķim</div></div>
          <div><div className="font-display text-3xl font-bold">{g.dailyMin} min/dienā</div><div className="text-sm text-muted-foreground">{g.intensity} intensitāte</div></div>
        </div>
        <p className="mt-3 text-sm">Fokuss: <b>{profile.struggle}</b>. {g.gap > 35 ? "Sāc ar pamatiem katru dienu — bez izlaidumiem." : g.gap > 0 ? "Pastāvīgs ritms aizvedīs tevi līdz mērķim." : "Uzturi formu ar simulatoru un dueļiem."}</p>
      </section>
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card-surface p-6 lg:col-span-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <GraduationCap className="h-4 w-4" /> Uzdevumu rezultāti
          </div>
          {!stats.count ? <p className="mt-4 text-muted-foreground">Atrisini pirmos uzdevumus</p> : <div className="mt-4 flex flex-wrap items-end gap-6">
            <div>
              <div className="font-display text-5xl font-bold">{avg}%</div>
              <div className="text-sm text-muted-foreground">vidējais uzdevumu rezultāts</div>
            </div>
            <div className="grid flex-1 gap-3">
              {projected.map((p) => (
                <div key={p.subject} className="text-sm">
                  <div className="mb-1 flex justify-between"><span>{p.subject} <span className="text-muted-foreground">· {profile.exams.find(e => e.subject === p.subject)?.level ?? ""}</span></span><b>{p.score}%</b></div>
                  <div className="h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-brand" style={{ width: `${p.score}%` }} /></div>
                </div>
              ))}
            </div>
          </div>}
        </section>

        {leaderboard.length >= 5 && <section className="card-surface p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-accent"><Trophy className="h-4 w-4" /> Līderu tabula</div>
          <ol className="mt-4 space-y-2">
            {leaderboard.map((u, i) => (
              <li key={i} className={`flex items-center gap-3 rounded-lg p-2 ${u.is_self ? "bg-accent-soft" : ""}`}>
                <span className="w-5 font-display font-bold text-muted-foreground">{i + 1}</span>
                <span className="flex-1 font-medium">{u.is_self ? "Tu" : u.name}</span>
                <span className="text-sm font-bold">{u.xp.toLocaleString("lv")} XP</span>
              </li>
            ))}
          </ol>
          <Button asChild variant="cta" className="mt-4 w-full"><Link to="/dueli"><Swords /> Izaicināt uz dueli</Link></Button>
        </section>}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { to: "/macibas", icon: PenLine, t: "Eseju vērtētājs", d: "VISC kritēriji" },
          { to: "/macibas", icon: Layers, t: "Kartītes", d: "Velc pa labi vai kreisi" },
          { to: "/dueli", icon: Swords, t: "1v1 Dueļi", d: "5 minūšu cīņa" },
          { to: "/simulators", icon: Timer, t: "CE simulators", d: "3 stundu režīms" },
        ].map((c) => (
          <Link key={c.t} to={c.to} className="card-surface group p-5 transition hover:-translate-y-0.5">
            <c.icon className="h-6 w-6 text-primary" />
            <div className="mt-3 font-semibold">{c.t}</div>
            <div className="text-sm text-muted-foreground">{c.d}</div>
          </Link>
        ))}
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Eksāmeni · {cat.label}</h2>
          <div className="flex flex-wrap rounded-xl bg-muted p-1 text-sm">
            {GRADES.map((g) => (
              <button key={g} onClick={() => setGrade(g)}
                className={`rounded-lg px-3 py-1.5 font-medium ${grade === g ? "bg-card shadow-soft" : "text-muted-foreground"}`}>
                {g}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cat.subjects.map((s) => (
            <div key={s} className="card-surface p-4">
              <div className="font-semibold">{s}</div>
              <div className="mt-3 flex gap-2">
                {cat.levels.map((l) => (
                  <Link key={l} to="/macibas" className="rounded-full bg-primary-soft px-3 py-1 text-xs font-medium hover:bg-primary hover:text-primary-foreground">{l}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
