import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { catalogFor, nextExamYears } from "@/lib/exam-catalog";
import { baselines, goals, grades, loadProfile, profilesTable, struggles, type Exam } from "@/lib/profile";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/pieslegties" });
    const p = await loadProfile(data.user.id);
    if (p?.onboarded) throw redirect({ to: "/" });
    return { userId: data.user.id };
  },
  head: () => ({
    meta: [
      { title: "Sākuma uzdevums | Examio" },
      { name: "description", content: "Pastāsti par sevi, lai Examio izveidotu tavu CE plānu." },
      { property: "og:title", content: "Sākuma uzdevums | Examio" },
      { property: "og:description", content: "Personalizē savu CE sagatavošanās plānu." },
    ],
  }),
  component: Onboarding,
});

function Opt({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={`w-full rounded-xl border p-4 text-left font-medium transition ${on ? "border-primary bg-primary-soft" : "hover:bg-muted"}`}>
      {children}
    </button>
  );
}

function Onboarding() {
  const { userId } = Route.useRouteContext();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [grade, setGrade] = useState("");
  const [exams, setExams] = useState<Exam[]>([]);
  const [year, setYear] = useState<number | null>(null);
  const cat = catalogFor(grade);
  const pickGrade = (g: string) => { if (g !== grade) setExams([]); setGrade(g); };
  const [baseline, setBaseline] = useState("");
  const [goal, setGoal] = useState("");
  const [struggle, setStruggle] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const toggle = (s: string) =>
    setExams((x) => (x.some((e) => e.subject === s) ? x.filter((e) => e.subject !== s) : [...x, { subject: s, level: cat.levels[0] ?? "" }]));
  const setLevel = (s: string, level: string) => setExams((x) => x.map((e) => (e.subject === s ? { ...e, level } : e)));

  const valid = [!!grade, exams.length > 0, !!year, !!baseline, !!goal, !!struggle][step];
  const titles = ["Kurā klasē tu mācies?", "Kurus CE eksāmenus tu kārtosi?", "Kurā gadā kārtosi eksāmenus?", "Kādi ir tavi rezultāti šobrīd?", "Kāds ir tavs mērķis (vēlamais rezultāts) eksāmenā?", "Kas tev sagādā vislielākās grūtības?"];

  async function finish() {
    setBusy(true);
    const { error } = await profilesTable().upsert({ id: userId, grade, exams: exams.map((e) => ({ ...e, year })), baseline, goal, struggle, onboarded: true });
    setBusy(false);
    if (error) return setErr("Neizdevās saglabāt. Mēģini vēlreiz.");
    nav({ to: "/" });
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <div className="card-surface w-full max-w-lg p-6">
        <div className="mb-6 flex gap-1">{titles.map((_, i) => <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-brand" : "bg-muted"}`} />)}</div>
        <div className="text-sm font-semibold text-accent">Solis {step + 1} no {titles.length}</div>
        <h1 className="mt-1 mb-5 text-2xl font-bold">{titles[step]}</h1>
        <div className="space-y-2">
          {step === 0 && grades.map((g) => <Opt key={g} on={grade === g} onClick={() => pickGrade(g)}>{g}</Opt>)}
          {step === 1 && cat.studyOnly && <p className="text-sm text-muted-foreground">10. klasē eksāmenu vēl nav — izvēlies priekšmetus, kuriem gatavoties jau tagad.</p>}
          {step === 1 && cat.subjects.map((s) => {
            const sel = exams.find((e) => e.subject === s);
            return (
              <div key={s} className={`rounded-xl border p-3 ${sel ? "border-primary bg-primary-soft" : ""}`}>
                <label className="flex cursor-pointer items-center gap-3 font-medium">
                  <input type="checkbox" checked={!!sel} onChange={() => toggle(s)} className="h-4 w-4 accent-[var(--primary)]" />{s}
                  {cat.levels.length === 1 && <span className="ml-auto text-xs text-muted-foreground">{cat.levels[0]}</span>}
                </label>
                {sel && cat.levels.length > 1 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {cat.levels.map((l) => (
                      <button key={l} type="button" onClick={() => setLevel(s, l)}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${sel.level === l ? "bg-primary text-primary-foreground" : "bg-card"}`}>{l}</button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {step === 2 && nextExamYears().map((y) => <Opt key={y} on={year === y} onClick={() => setYear(y)}>{y}. gads</Opt>)}
          {step === 3 && baselines.map((b) => <Opt key={b.v} on={baseline === b.v} onClick={() => setBaseline(b.v)}>{b.l}</Opt>)}
          {step === 4 && goals.map((g) => <Opt key={g.v} on={goal === g.v} onClick={() => setGoal(g.v)}>{g.l}</Opt>)}
          {step === 5 && struggles.map((s) => <Opt key={s} on={struggle === s} onClick={() => setStruggle(s)}>{s}</Opt>)}
        </div>
        {err && <p className="mt-3 text-sm text-destructive">{err}</p>}
        <div className="mt-6 flex justify-between">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Atpakaļ</Button>
          {step < titles.length - 1
            ? <Button disabled={!valid} onClick={() => setStep((s) => s + 1)}>Tālāk</Button>
            : <Button variant="cta" disabled={!valid || busy} onClick={finish}>Pabeigt</Button>}
        </div>
      </div>
    </div>
  );
}
