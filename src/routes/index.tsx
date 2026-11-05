import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { GraduationCap, Swords, Timer, Layers, PenLine, Trophy } from "lucide-react";
import { AppShell, PageTitle } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { leaderboard, levels, programs, projected, subjects12, subjects9 } from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Examio — gatavojies valsts eksāmeniem gudri" },
      { name: "description", content: "Examio palīdz 9.–12. klases skolēniem sagatavoties CE ar AI pasniedzēju, dueļiem un simulatoru." },
      { property: "og:title", content: "Examio — gatavojies valsts eksāmeniem gudri" },
      { property: "og:description", content: "AI pasniedzējs, dueļi, kartītes un CE simulators latviešu skolēniem." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [grade, setGrade] = useState<"9" | "12">("12");
  const avg = Math.round(projected.reduce((s, p) => s + p.score, 0) / projected.length);
  const subjects = grade === "12" ? subjects12 : subjects9;

  return (
    <AppShell>
      <PageTitle title="Sveiks, Lauri! 👋" sub="Līdz matemātikas CE atlikušas 47 dienas. Turpini tempu." />

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card-surface p-6 lg:col-span-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <GraduationCap className="h-4 w-4" /> Budžeta vietas kalkulators
          </div>
          <div className="mt-4 flex flex-wrap items-end gap-6">
            <div>
              <div className="font-display text-5xl font-bold">{avg}%</div>
              <div className="text-sm text-muted-foreground">prognozētais vidējais CE</div>
            </div>
            <div className="grid flex-1 gap-3">
              {projected.map((p) => (
                <div key={p.subject} className="text-sm">
                  <div className="mb-1 flex justify-between"><span>{p.subject} <span className="text-muted-foreground">· {p.level}</span></span><b>{p.score}%</b></div>
                  <div className="h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-brand" style={{ width: `${p.score}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {programs.map((pr) => {
              const ok = avg >= pr.need;
              return (
                <div key={pr.name} className={`rounded-xl border p-4 ${ok ? "bg-primary-soft" : "bg-accent-soft"}`}>
                  <div className="text-sm font-semibold">{pr.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Nepieciešams ~{pr.need}%</div>
                  <div className={`mt-2 text-sm font-bold ${ok ? "text-success" : "text-accent"}`}>
                    {ok ? "✓ Budžeta vieta" : `Trūkst ${pr.need - avg}%`}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="card-surface p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-accent"><Trophy className="h-4 w-4" /> Līderu tabula</div>
          <ol className="mt-4 space-y-2">
            {leaderboard.map((u, i) => (
              <li key={u.name} className={`flex items-center gap-3 rounded-lg p-2 ${u.name === "Tu" ? "bg-accent-soft" : ""}`}>
                <span className="w-5 font-display font-bold text-muted-foreground">{i + 1}</span>
                <span className="flex-1 font-medium">{u.name}</span>
                <span className="text-sm font-bold">{u.xp.toLocaleString("lv")} XP</span>
              </li>
            ))}
          </ol>
          <Button asChild variant="cta" className="mt-4 w-full"><Link to="/dueli"><Swords /> Izaicināt uz dueli</Link></Button>
        </section>
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
          <h2 className="text-xl font-bold">Eksāmeni</h2>
          <div className="flex rounded-xl bg-muted p-1 text-sm">
            {(["9", "12"] as const).map((g) => (
              <button key={g} onClick={() => setGrade(g)}
                className={`rounded-lg px-3 py-1.5 font-medium ${grade === g ? "bg-card shadow-soft" : "text-muted-foreground"}`}>
                {g === "9" ? "9. klases eksāmeni" : "12. klases CE"}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {subjects.map((s) => (
            <div key={s} className="card-surface p-4">
              <div className="font-semibold">{s}</div>
              <div className="mt-3 flex gap-2">
                {(grade === "12" ? levels : ["Pamatskola"]).map((l) => (
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
