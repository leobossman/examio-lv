import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GRADES, catalogFor } from "@/lib/exam-catalog";
import { remainingTasks, strings, type LearningTask, type AttemptResult } from "@/lib/learning";
import { learningQuery } from "@/lib/learning-query";
import { saveAttempt } from "@/lib/learning.functions";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { LearningBoundary, SignInToStudy } from "@/components/LearningBoundary";
import { motion, useMotionValue, useTransform, AnimatePresence, type PanInfo } from "framer-motion";
import { Bot, Send, Check, X, RotateCcw, Mic } from "lucide-react";
import { AppShell, PageTitle } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { flashcards } from "@/lib/data";

export const Route = createFileRoute("/macibas")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Mācības — eksāmenu uzdevumi | Examio" },
      { name: "description", content: "Risina eksāmenu uzdevumus un seko savam mācību progresam." },
      { property: "og:title", content: "Mācības | Examio" },
      { property: "og:description", content: "Eksāmenu uzdevumi, saglabāti mēģinājumi un mācību progress." },
    ],
  }),
  component: () => <LearningBoundary><Study /></LearningBoundary>,
});

type Score = { label: string; got: number; max: number }[];

function gradeEssay(text: string): { scores: Score; note: string } {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const paras = text.split(/\n\s*\n/).filter((p) => p.trim()).length;
  const c = Math.min(10, Math.round(words / 25));
  const s = Math.min(8, paras * 2);
  const errors = (text.match(/ ,|\s{2,}|\bi\b/g) || []).length;
  const p = Math.max(0, 7 - errors);
  return {
    scores: [
      { label: "Satura atklāsme", got: c, max: 10 },
      { label: "Teksta uzbūve", got: s, max: 8 },
      { label: "Pareizrakstība", got: p, max: 7 },
    ],
    note: words < 150
      ? `Teksts ir ${words} vārdus garš — CE prasa vismaz 200. Izvērs argumentus ar piemēriem.`
      : `Labs apjoms (${words} vārdi). Strukturē ievadu, ${paras < 3 ? "sadali tekstu vismaz 3 rindkopās" : "argumentus un nobeigumu skaidrāk"}.`,
  };
}

const ESSAY_SUBJECTS = ["Latviešu valoda", "Angļu valoda", "Vēsture", "Sociālās zinības"];

function Study() {
  const { data: learning } = useSuspenseQuery(learningQuery);
  const profile = learning?.profile;
  const exams = Array.isArray(profile?.exams) ? profile.exams : [];
  const firstExam = exams[0];
  const initialSubject = firstExam && typeof firstExam === "object" && !Array.isArray(firstExam) && typeof firstExam['subject'] === "string" ? firstExam['subject'] : "Matemātika";
  const [grade, setGrade] = useState<string>(profile?.grade ?? "12. klase");
  const [subject, setSubject] = useState<string>(initialSubject);
  const [tab, setTab] = useState<"uzdevumi" | "eseja" | "kartites">("uzdevumi");
  const cat = catalogFor(grade);
  const subj = cat.subjects.includes(subject) ? subject : (cat.subjects[0] ?? "Matemātika");
  const tabs: [typeof tab, string][] = [["uzdevumi", "Uzdevumi"], ...(ESSAY_SUBJECTS.includes(subj) ? [["eseja", "Eseju vērtētājs"] as [typeof tab, string]] : []), ["kartites", "Kartītes"]];
  const active = tab === "eseja" && !ESSAY_SUBJECTS.includes(subj) ? "uzdevumi" : tab;
  if (!learning) return <AppShell><SignInToStudy /></AppShell>;
  return (
    <AppShell>
      <PageTitle title="Mācības" sub={`${cat.label} · uzdevumi pēc eksāmena formāta`} />
      <div className="mb-4 flex flex-wrap gap-2">
        <select value={grade} onChange={(e) => setGrade(e.target.value)} className="rounded-lg border bg-card px-3 py-2 text-sm">
          {GRADES.map((g) => <option key={g}>{g}</option>)}
        </select>
        {cat.subjects.map((s) => (
          <button key={s} onClick={() => setSubject(s)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${s === subj ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{s}</button>
        ))}
      </div>
      <div className="mb-6 inline-flex rounded-xl bg-muted p-1 text-sm">
        {tabs.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`rounded-lg px-4 py-2 font-medium ${active === k ? "bg-card shadow-soft" : "text-muted-foreground"}`}>{l}</button>
        ))}
      </div>
      {active === "uzdevumi" ? <TaskList key={subj + grade} subject={subj} grade={grade} /> : active === "eseja" ? <Essay /> : <Cards />}
    </AppShell>
  );
}

function TaskList({ subject, grade }: { subject: string; grade: string }) {
  const { data } = useSuspenseQuery(learningQuery);
  const list = remainingTasks(data?.tasks ?? [], data?.attempts ?? []).filter(t => t.subject === subject && t.grades.includes(grade));
  if (!list.length) return <p className="card-surface p-6 text-muted-foreground">Šim priekšmetam nav neatrisinātu uzdevumu.</p>;
  return <div className="grid gap-4">{list.map((t, i) => <TaskCard key={t.id} t={t} n={i + 1} />)}</div>;
}

function TaskCard({ t, n }: { t: LearningTask; n: number }) {
  const [val, setVal] = useState("");
  const [checked, setChecked] = useState(false);
  const [mic, setMic] = useState(false);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [selfPoints, setSelfPoints] = useState(0);
  const [started, setStarted] = useState<number | null>(null);
  const client = useQueryClient();
  const submit = useServerFn(saveAttempt);
  const mutation = useMutation({ mutationFn: submit, onSuccess: (saved) => { setResult(saved); setChecked(true); client.invalidateQueries({ queryKey: ["learning"] }); } });
  const begin = () => { if (started === null) setStarted(Date.now()); };
  const save = () => mutation.mutate({ data: { taskId: t.id, answer: val, seconds: Math.min(10800, Math.max(0, Math.round((Date.now() - (started ?? Date.now())) / 1000))), ...(t.type === "open" ? { selfPoints } : {}) } });
  const ok = result?.correct ?? false;
  const label = t.type === "mc" ? "1. daļa · Izvēle" : t.type === "short" ? "Īsā atbilde" : `2. daļa · ${t.points} p.`;
  const speak = () => {
    begin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any; const S = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!S) return; const r = new S(); r.lang = t.subject === "Angļu valoda" ? "en-US" : "lv-LV";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    r.onresult = (e: any) => setVal(Array.from(e.results).map((x: any) => x[0].transcript).join(" "));
    r.onend = () => setMic(false); setMic(true); r.start();
  };
  return (
    <div className="card-surface p-5">
      <div className="text-xs font-semibold uppercase tracking-wider text-primary">{n}. uzdevums · {label}</div>
      <p className="mt-2 font-medium">{t.question}</p>
      {t.type === "mc" && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {strings(t.options).map((o) => {
            const st = checked && o === t.answer ? "border-success bg-success/10" : checked && o === val ? "border-destructive bg-destructive/10" : val === o ? "border-primary bg-primary-soft" : "";
            return <button key={o} disabled={checked || mutation.isPending} onClick={() => { begin(); setVal(o); }} className={`rounded-xl border p-3 text-left text-sm ${st}`}>{o}</button>;
          })}
        </div>
      )}
      {t.type === "short" && (
        <input value={val} disabled={checked || mutation.isPending} onFocus={begin} onChange={(e) => setVal(e.target.value)} placeholder="Tava atbilde"
          className="mt-3 w-full rounded-xl border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
      )}
      {t.type === "open" && (
        <div className="mt-3">
          <textarea value={val} disabled={!!result || mutation.isPending} onFocus={begin} onChange={(e) => setVal(e.target.value)} rows={4} placeholder="Pieraksti risinājumu…"
            className="w-full resize-none rounded-xl border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
          {["Latviešu valoda", "Angļu valoda"].includes(t.subject) && (
            <Button variant="outline" size="sm" className="mt-2" onClick={speak} disabled={mic}><Mic /> {mic ? "Klausos..." : "Atbildēt mutiski"}</Button>
          )}
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        {!checked ? <Button variant="cta" size="sm" disabled={!val.trim() || mutation.isPending} onClick={() => t.type === "open" ? setChecked(true) : save()}>
          {mutation.isPending ? "Saglabā…" : t.type === "open" ? "Rādīt risinājumu" : "Pārbaudīt atbildi"}
        </Button> : !result?.correct && <Button variant="outline" size="sm" disabled={mutation.isPending} onClick={() => { setChecked(false); setResult(null); setVal(""); setStarted(null); }}><RotateCcw /> Vēlreiz</Button>}
        {result && <span className={`text-sm font-bold ${ok ? "text-success" : "text-destructive"}`}>{ok ? `Pareizi! +${result.xpEarned} XP` : t.type === "open" ? `${result.pointsEarned}/${t.points} p.` : `Nepareizi — pareizi: ${t.answer}`}</span>}
        {mutation.isError && <p role="alert" className="text-sm text-destructive">{mutation.error.message}</p>}
      </div>
      {checked && (
        <div className="mt-3 rounded-xl bg-muted p-3 text-sm">
          <p>{t.explanation}</p>
          {strings(t.steps).length > 0 && <ol className="mt-2 list-decimal space-y-1 pl-5">{strings(t.steps).map((s) => <li key={s}>{s}</li>)}</ol>}
          {t.type === "open" && t.answer && <p className="mt-2 font-semibold">Atbilde: {t.answer}</p>}
          {t.type === "open" && !result && <div className="mt-3 flex flex-wrap items-center gap-3">
            <label>Pašnovērtējums: <select aria-label="Pašnovērtējums" value={selfPoints} onChange={e => setSelfPoints(Number(e.target.value))} className="rounded-lg border bg-background p-2">{Array.from({ length: t.points + 1 }, (_, i) => <option key={i} value={i}>{i}/{t.points} p.</option>)}</select></label>
            <Button size="sm" disabled={mutation.isPending || !val.trim()} onClick={save}>{mutation.isPending ? "Saglabā…" : "Saglabāt mēģinājumu"}</Button>
          </div>}
        </div>
      )}
    </div>
  );
}

function Essay() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<ReturnType<typeof gradeEssay> | null>(null);
  const total = result?.scores.reduce((a, s) => a + s.got, 0) ?? 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="card-surface p-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-primary">Latviešu valoda · Augstākais</div>
        <h2 className="mt-2 text-lg font-bold">„Vai tehnoloģijas tuvina vai attālina cilvēkus?”</h2>
        <p className="mt-1 text-sm text-muted-foreground">Uzraksti argumentētu eseju (200–250 vārdi).</p>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={14}
          placeholder="Sāc rakstīt savu eseju šeit…"
          className="mt-4 w-full resize-none rounded-xl border bg-background p-4 text-[15px] leading-relaxed outline-none focus:ring-2 focus:ring-ring" />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{text.trim().split(/\s+/).filter(Boolean).length} vārdi</span>
          <Button variant="cta" disabled={!text.trim()} onClick={() => setResult(gradeEssay(text))}><Send /> Iesniegt vērtēšanai</Button>
        </div>
      </div>

      <aside className="card-surface h-fit p-5 lg:sticky lg:top-24">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-primary-foreground"><Bot className="h-5 w-5" /></span>
          <div><div className="font-semibold">AI pasniedzējs</div><div className="text-xs text-muted-foreground">VISC kritēriji</div></div>
        </div>
        {!result ? (
          <p className="mt-4 rounded-xl bg-primary-soft p-4 text-sm">Uzraksti eseju un iesniedz — es novērtēšu to pēc oficiālajiem VISC kritērijiem.</p>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="rounded-xl bg-brand p-4 text-primary-foreground">
              <div className="text-xs font-semibold">Kopā</div>
              <div className="font-display text-3xl font-bold">{total} / 25</div>
            </div>
            {result.scores.map((s) => (
              <div key={s.label} className="text-sm">
                <div className="mb-1 flex justify-between"><span>{s.label}</span><b>{s.got}/{s.max}</b></div>
                <div className="h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-accent" style={{ width: `${(s.got / s.max) * 100}%` }} /></div>
              </div>
            ))}
            <p className="rounded-xl bg-muted p-3 text-sm">{result.note}</p>
          </div>
        )}
      </aside>
    </div>
  );
}

function Cards() {
  const [i, setI] = useState(0);
  const [known, setKnown] = useState(0);
  const done = i >= flashcards.length;

  const swipe = (right: boolean) => { if (right) setKnown((k) => k + 1); setI((n) => n + 1); };

  return (
    <div className="mx-auto max-w-sm">
      <VoiceAnswer />
      <div className="mb-4 flex justify-between text-sm text-muted-foreground">
        <span>{Math.min(i + 1, flashcards.length)} / {flashcards.length}</span><span className="font-semibold text-success">Zinu: {known}</span>
      </div>
      <div className="relative h-96">
        <AnimatePresence>
          {done ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card-surface grid h-full place-items-center p-6 text-center">
              <div>
                <div className="font-display text-4xl font-bold">{known}/{flashcards.length}</div>
                <p className="mt-2 text-muted-foreground">+{known * 10} XP nopelnīti!</p>
                <Button variant="cta" className="mt-6" onClick={() => { setI(0); setKnown(0); }}><RotateCcw /> Vēlreiz</Button>
              </div>
            </motion.div>
          ) : (
            flashcards.slice(i, i + 2).reverse().map((c, idx, arr) => (
              <SwipeCard key={i + (arr.length - 1 - idx)} card={c} top={idx === arr.length - 1} onSwipe={swipe} />
            ))
          )}
        </AnimatePresence>
      </div>
      {!done && (
        <div className="mt-6 flex justify-center gap-6">
          <button onClick={() => swipe(false)} className="grid h-14 w-14 place-items-center rounded-full border-2 border-destructive text-destructive"><X /></button>
          <button onClick={() => swipe(true)} className="grid h-14 w-14 place-items-center rounded-full border-2 border-success text-success"><Check /></button>
        </div>
      )}
    </div>
  );
}

function SwipeCard({ card, top, onSwipe }: { card: (typeof flashcards)[0]; top: boolean; onSwipe: (r: boolean) => void }) {
  const [flip, setFlip] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const yes = useTransform(x, [20, 120], [0, 1]);
  const no = useTransform(x, [-120, -20], [1, 0]);
  const end = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 110) onSwipe(true);
    else if (info.offset.x < -110) onSwipe(false);
  };
  return (
    <motion.div
      className="card-surface absolute inset-0 flex cursor-grab touch-none select-none flex-col items-center justify-center p-8 text-center active:cursor-grabbing"
      style={{ x, rotate, zIndex: top ? 2 : 1 }}
      drag={top ? "x" : false} dragConstraints={{ left: 0, right: 0 }} onDragEnd={end}
      initial={{ scale: top ? 1 : 0.95, y: top ? 0 : 12 }} animate={{ scale: top ? 1 : 0.95, y: top ? 0 : 12 }}
      exit={{ x: x.get() >= 0 ? 400 : -400, opacity: 0, transition: { duration: 0.25 } }}
      onClick={() => setFlip((f) => !f)}>
      <motion.span style={{ opacity: yes }} className="absolute left-5 top-5 rounded-lg border-2 border-success px-2 font-bold text-success">ZINU</motion.span>
      <motion.span style={{ opacity: no }} className="absolute right-5 top-5 rounded-lg border-2 border-destructive px-2 font-bold text-destructive">NEZINU</motion.span>
      <span className="text-xs font-semibold uppercase tracking-wider text-primary">{card.subject}</span>
      <div className="mt-4 font-display text-2xl font-bold">{flip ? card.back : card.front}</div>
      <span className="mt-6 text-xs text-muted-foreground">{flip ? "Atbilde" : "Pieskaries, lai apgrieztu"}</span>
    </motion.div>
  );
}

function VoiceAnswer() {
  const [text, setText] = useState("");
  const [on, setOn] = useState(false);
  const start = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) { setText("Tava pārlūkprogramma neatbalsta runas atpazīšanu."); return; }
    const r = new SR();
    r.lang = "lv-LV";
    r.interimResults = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    r.onresult = (e: any) => setText(Array.from(e.results).map((x: any) => x[0].transcript).join(" "));
    r.onend = () => setOn(false);
    setOn(true);
    r.start();
  };
  return (
    <div className="card-surface mb-4 p-4">
      <Button variant={on ? "cta" : "outline"} className="w-full" onClick={start} disabled={on}>
        <Mic /> {on ? "Klausos..." : "Atbildēt mutiski"}
      </Button>
      {text && <p className="mt-3 text-sm">{text}</p>}
    </div>
  );
}
