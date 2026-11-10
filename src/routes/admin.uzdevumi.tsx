import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { GRADES, catalogFor } from "@/lib/exam-catalog";
import { strings } from "@/lib/learning";
import { checkAdmin, listDrafts, generateDrafts, updateDraft, approveDraft, deleteDraft } from "@/lib/admin-tasks.functions";
import { AppShell, PageTitle } from "@/components/AppShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/uzdevumi")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Uzdevumu pārvaldība | Examio" }, { name: "robots", content: "noindex" },
    { name: "description", content: "Uzdevumu melnrakstu ģenerēšana un apstiprināšana." },
    { property: "og:title", content: "Uzdevumu pārvaldība | Examio" }, { property: "og:description", content: "Administratora rīki." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: AdminTasks,
});

const field = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm";

function AdminTasks() {
  const check = useServerFn(checkAdmin);
  const admin = useQuery({ queryKey: ["is-admin"], queryFn: () => check(), retry: false });
  if (admin.isLoading) return <AppShell><p className="p-6 text-muted-foreground">Ielādē…</p></AppShell>;
  if (!admin.data?.isAdmin) return <AppShell><p className="p-6 text-muted-foreground">Lapa nav atrasta.</p></AppShell>;
  return <AppShell><PageTitle title="Uzdevumu pārvaldība" /><Generator /><Drafts /></AppShell>;
}

function Generator() {
  const qc = useQueryClient(); const gen = useServerFn(generateDrafts);
  const [grade, setGrade] = useState<string>(GRADES[4] ?? "12. klase");
  const subjects = catalogFor(grade as never).subjects as readonly string[];
  const [subject, setSubject] = useState(""); const [topic, setTopic] = useState("");
  const [type, setType] = useState<"mc" | "short" | "open">("mc"); const [difficulty, setDifficulty] = useState(2); const [count, setCount] = useState(5);
  const subj = subjects.includes(subject) ? subject : subjects[0] ?? "";
  const m = useMutation({ mutationFn: () => gen({ data: { subject: subj, grade, topic, type, difficulty, count } }), onSuccess: () => qc.invalidateQueries({ queryKey: ["drafts"] }) });
  return (
    <section className="mb-8 rounded-2xl border bg-card p-5">
      <h2 className="mb-4 text-lg font-bold">Ģenerēt ar AI</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm">Klase<select className={field} value={grade} onChange={e => setGrade(e.target.value)}>{GRADES.map(g => <option key={g}>{g}</option>)}</select></label>
        <label className="text-sm">Priekšmets<select className={field} value={subj} onChange={e => setSubject(e.target.value)}>{subjects.map(s => <option key={s}>{s}</option>)}</select></label>
        <label className="text-sm">Tēma<input className={field} value={topic} onChange={e => setTopic(e.target.value)} placeholder="piem. Kvadrātvienādojumi" /></label>
        <label className="text-sm">Tips<select className={field} value={type} onChange={e => setType(e.target.value as never)}><option value="mc">Izvēles jautājums</option><option value="short">Īsā atbilde</option><option value="open">2. daļa (atvērtais)</option></select></label>
        <label className="text-sm">Grūtība<select className={field} value={difficulty} onChange={e => setDifficulty(Number(e.target.value))}>{[1, 2, 3].map(d => <option key={d} value={d}>{d}</option>)}</select></label>
        <label className="text-sm">Skaits (5–20)<input type="number" min={5} max={20} className={field} value={count} onChange={e => setCount(Math.max(5, Math.min(20, Number(e.target.value) || 5)))} /></label>
      </div>
      <Button variant="cta" className="mt-4" disabled={!topic.trim() || !subj || m.isPending} onClick={() => m.mutate()}>{m.isPending ? "Ģenerē…" : "Ģenerēt"}</Button>
      {m.isSuccess && <p className="mt-2 text-sm text-primary">Izveidoti {m.data.created} melnraksti.</p>}
      {m.isError && <p className="mt-2 text-sm text-destructive">{(m.error as Error).message}</p>}
    </section>
  );
}

type Draft = Awaited<ReturnType<typeof listDrafts>>[number];

function Drafts() {
  const list = useServerFn(listDrafts);
  const q = useQuery({ queryKey: ["drafts"], queryFn: () => list() });
  if (q.isLoading) return <p className="text-muted-foreground">Ielādē melnrakstus…</p>;
  if (q.isError) return <p className="text-destructive">{(q.error as Error).message}</p>;
  return (
    <section>
      <h2 className="mb-4 text-lg font-bold">Melnraksti ({q.data?.length ?? 0})</h2>
      {!q.data?.length && <p className="text-muted-foreground">Melnrakstu nav.</p>}
      <div className="space-y-4">{q.data?.map(d => <DraftCard key={d.id} d={d} />)}</div>
    </section>
  );
}

function DraftCard({ d }: { d: Draft }) {
  const qc = useQueryClient(); const save = useServerFn(updateDraft); const approve = useServerFn(approveDraft); const del = useServerFn(deleteDraft);
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState({ topic: d.topic, type: d.type as "mc" | "short" | "open", question: d.question, options: strings(d.options).join("\n"), answer: d.answer, explanation: d.explanation, steps: strings(d.steps).join("\n"), points: d.points, difficulty: d.difficulty });
  const done = () => qc.invalidateQueries({ queryKey: ["drafts"] });
  const lines = (s: string) => s.split("\n").map(x => x.trim()).filter(Boolean);
  const mSave = useMutation({ mutationFn: () => save({ data: { id: d.id, ...f, options: lines(f.options), steps: lines(f.steps) } }), onSuccess: () => { setEdit(false); done(); } });
  const mApprove = useMutation({ mutationFn: () => approve({ data: { id: d.id } }), onSuccess: done });
  const mDel = useMutation({ mutationFn: () => del({ data: { id: d.id } }), onSuccess: done });
  const err = mSave.error || mApprove.error || mDel.error;
  return (
    <article className="rounded-2xl border bg-card p-4">
      <p className="mb-2 text-xs text-muted-foreground">{d.subject} · {d.grades.join(", ")} · {d.topic} · {d.type} · grūtība {d.difficulty} · {d.points} p. · {d.source}</p>
      {edit ? (
        <div className="space-y-2 text-sm">
          <input className={field} value={f.topic} onChange={e => setF({ ...f, topic: e.target.value })} />
          <textarea className={field} rows={3} value={f.question} onChange={e => setF({ ...f, question: e.target.value })} />
          {f.type === "mc" && <textarea className={field} rows={4} placeholder="Varianti (katrs savā rindā)" value={f.options} onChange={e => setF({ ...f, options: e.target.value })} />}
          <textarea className={field} rows={2} placeholder="Atbilde" value={f.answer} onChange={e => setF({ ...f, answer: e.target.value })} />
          <textarea className={field} rows={3} placeholder="Skaidrojums" value={f.explanation} onChange={e => setF({ ...f, explanation: e.target.value })} />
          {f.type === "open" && <textarea className={field} rows={4} placeholder="Vērtēšanas soļi (katrs savā rindā)" value={f.steps} onChange={e => setF({ ...f, steps: e.target.value })} />}
          <div className="flex gap-2">
            <input type="number" min={1} max={20} className={field} value={f.points} onChange={e => setF({ ...f, points: Number(e.target.value) || 1 })} />
            <input type="number" min={1} max={3} className={field} value={f.difficulty} onChange={e => setF({ ...f, difficulty: Number(e.target.value) || 1 })} />
          </div>
        </div>
      ) : (
        <div className="space-y-2 text-sm">
          <p className="whitespace-pre-wrap font-medium">{d.question}</p>
          {strings(d.options).length > 0 && <ul className="list-disc pl-5">{strings(d.options).map(o => <li key={o}>{o}</li>)}</ul>}
          <p><b>Atbilde:</b> <span className="whitespace-pre-wrap">{d.answer}</span></p>
          <p className="whitespace-pre-wrap text-muted-foreground"><b>Skaidrojums:</b> {d.explanation}</p>
          {strings(d.steps).length > 0 && <ol className="list-decimal pl-5">{strings(d.steps).map(s => <li key={s}>{s}</li>)}</ol>}
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {edit ? <><Button size="sm" onClick={() => mSave.mutate()} disabled={mSave.isPending}>Saglabāt</Button><Button size="sm" variant="outline" onClick={() => setEdit(false)}>Atcelt</Button></>
          : <><Button size="sm" variant="outline" onClick={() => setEdit(true)}>Rediģēt</Button><Button size="sm" onClick={() => mApprove.mutate()} disabled={mApprove.isPending}>Apstiprināt</Button>
            <Button size="sm" variant="destructive" onClick={() => confirm("Dzēst šo melnrakstu?") && mDel.mutate()} disabled={mDel.isPending}>Dzēst</Button></>}
      </div>
      {err && <p className="mt-2 text-sm text-destructive">{(err as Error).message}</p>}
    </article>
  );
}
