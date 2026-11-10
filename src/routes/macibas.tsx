import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GRADES, catalogFor } from "@/lib/exam-catalog";
import { saveAttempt, explainTask } from "@/lib/learning.functions";
import { strings, type LearningTask, type AttemptResult } from "@/lib/learning";
import { learningQuery } from "@/lib/learning-query";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { LearningBoundary, SignInToStudy } from "@/components/LearningBoundary";
import { motion, useMotionValue, useTransform, AnimatePresence, type PanInfo } from "framer-motion";
import { Bot, Send, Check, X, RotateCcw, Mic, Sparkles, ChevronLeft, BookOpen, Calculator, Languages, Atom, FlaskConical, Leaf, Landmark, Users, Globe, Palette, PenTool, Code, type LucideIcon } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { flashcards } from "@/lib/data";
import { FocusTimer } from "@/components/HeaderTools";

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

const ICONS: Record<string, LucideIcon> = {
  "Matemātika": Calculator, "Latviešu valoda": BookOpen, "Angļu valoda": Languages, "Fizika": Atom, "Ķīmija": FlaskConical,
  "Bioloģija": Leaf, "Vēsture": Landmark, "Sociālās zinības": Users, "Ģeogrāfija": Globe, "Kultūra un māksla": Palette,
  "Dizains un tehnoloģijas": PenTool, "Programmēšana": Code,
};

function Ring({ pct }: { pct: number }) {
  const r = 18, c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 44 44" className="h-12 w-12 -rotate-90" aria-label={`${pct}% apgūts`}>
      <circle cx="22" cy="22" r={r} fill="none" stroke="var(--color-muted)" strokeWidth="5" />
      <circle cx="22" cy="22" r={r} fill="none" stroke="var(--color-primary)" strokeWidth="5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} />
      <text x="22" y="26" textAnchor="middle" className="rotate-90 fill-foreground text-[11px] font-bold" style={{ transformOrigin: "22px 22px" }}>{pct}%</text>
    </svg>
  );
}

function Study() {
  const { data: learning } = useSuspenseQuery(learningQuery);
  const [grade, setGrade] = useState<string>(learning?.profile?.grade ?? "12. klase");
  const [subject, setSubject] = useState<string | null>(null);
  const [session, setSession] = useState<{ topic: string; tasks: LearningTask[] } | null>(null);
  if (!learning) return <AppShell><SignInToStudy /></AppShell>;
  const cat = catalogFor(grade);
  const tasks = learning.tasks.filter((t) => t.grades.includes(grade));
  const solved = new Set(learning.attempts.filter((a) => a.correct).map((a) => a.task_id));
  const pct = (list: LearningTask[]) => list.length ? Math.round(list.filter((t) => solved.has(t.id)).length / list.length * 100) : 0;
  const start = (topic: string) => {
    const pool = tasks.filter((t) => t.subject === subject && t.topic === topic);
    const open = pool.filter((t) => !solved.has(t.id));
    setSession({ topic, tasks: (open.length ? open : pool).slice(0, 10) });
  };
  if (session && subject) return <Session subject={subject} topic={session.topic} tasks={session.tasks}
    onClose={() => setSession(null)} onAgain={() => start(session.topic)} />;

  return (
    <AppShell>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          {subject ? <button onClick={() => setSubject(null)} className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-primary-strong"><ChevronLeft className="h-4 w-4" /> Visi priekšmeti</button> : null}
          <h1 className="text-2xl font-bold md:text-3xl">{subject ?? "Mācības"}</h1>
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <select aria-label="Klase" value={grade} onChange={(e) => { setGrade(e.target.value); setSubject(null); }}
              className="rounded-full border bg-card px-3 py-1.5 text-xs font-semibold text-foreground">
              {GRADES.map((g) => <option key={g}>{g}</option>)}
            </select>
            <span>{cat.label}</span>
          </div>
        </div>
        <FocusTimer />
      </div>
      {subject ? <SubjectView subject={subject} tasks={tasks.filter((t) => t.subject === subject)} pct={pct} onStart={start} />
        : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cat.subjects.map((s) => {
            const list = tasks.filter((t) => t.subject === s);
            const Icon = ICONS[s] ?? BookOpen;
            const topics = new Set(list.map((t) => t.topic)).size;
            return (
              <button key={s} disabled={!list.length} onClick={() => setSubject(s)}
                className="card-surface flex items-center gap-4 p-5 text-left transition enabled:hover:-translate-y-0.5 disabled:opacity-60">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary-strong"><Icon className="h-6 w-6" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{s}</span>
                  <span className="text-sm text-muted-foreground">{list.length ? `${topics} ${topics === 1 ? "tēma" : "tēmas"}` : "Drīz būs"}</span>
                </span>
                {list.length > 0 && <Ring pct={pct(list)} />}
              </button>
            );
          })}
        </div>}
    </AppShell>
  );
}

function SubjectView({ subject, tasks, pct, onStart }: { subject: string; tasks: LearningTask[]; pct: (l: LearningTask[]) => number; onStart: (topic: string) => void }) {
  const [tab, setTab] = useState<"uzdevumi" | "eseja" | "kartites">("uzdevumi");
  const essay = ESSAY_SUBJECTS.includes(subject);
  const tabs: [typeof tab, string][] = [["uzdevumi", "Uzdevumi"], ...(essay ? [["eseja", "Eseja"] as [typeof tab, string]] : []), ["kartites", "Kartītes"]];
  const topics = [...new Set(tasks.map((t) => t.topic))];
  return (
    <>
      <div className="mb-6 inline-flex rounded-full bg-muted p-1 text-sm">
        {tabs.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`rounded-full px-5 py-2 font-semibold ${tab === k ? "bg-card shadow-soft" : "text-muted-foreground"}`}>{l}</button>
        ))}
      </div>
      {tab === "eseja" && essay ? <Essay /> : tab === "kartites" ? <Cards /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => {
            const list = tasks.filter((t) => t.topic === topic);
            const p = pct(list);
            return (
              <button key={topic} onClick={() => onStart(topic)} className="card-surface p-5 text-left transition hover:-translate-y-0.5">
                <div className="font-semibold">{topic}</div>
                <div className="mt-1 text-sm text-muted-foreground">{list.length} uzdevumi · {p}% apgūts</div>
                <div className="mt-4 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${p}%` }} /></div>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}

function Session({ subject, topic, tasks, onClose, onAgain }: { subject: string; topic: string; tasks: LearningTask[]; onClose: () => void; onAgain: () => void }) {
  const [i, setI] = useState(0);
  const [xp, setXp] = useState(0);
  const [right, setRight] = useState(0);
  const done = i >= tasks.length;
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="mx-auto flex w-full max-w-2xl items-center gap-4 px-4 py-4">
        <button onClick={onClose} aria-label="Aizvērt sesiju" className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-muted"><X /></button>
        <div className="h-3 flex-1 rounded-full bg-muted"><div className="h-3 rounded-full bg-primary transition-all" style={{ width: `${(Math.min(i, tasks.length) / tasks.length) * 100}%` }} /></div>
        <span className="shrink-0 text-sm font-semibold tabular-nums">{Math.min(i + 1, tasks.length)} no {tasks.length}</span>
      </div>
      {done ? (
        <div className="mx-auto grid w-full max-w-md flex-1 place-items-center px-4 text-center">
          <div>
            <div className="text-5xl">🎉</div>
            <h2 className="mt-4 text-2xl font-bold">Sesija pabeigta!</h2>
            <p className="mt-2 text-muted-foreground">{topic} · {right} no {tasks.length} pareizi</p>
            <div className="mt-6 font-display text-5xl font-bold text-primary-strong">+{xp} XP</div>
            <div className="mt-8 grid gap-3">
              <Button variant="cta" size="lg" className="h-12 rounded-full" onClick={onAgain}><RotateCcw /> Vēlreiz</Button>
              <Button variant="outline" size="lg" className="h-12 rounded-full" onClick={onClose}>Uz tēmām</Button>
            </div>
          </div>
        </div>
      ) : (
        <SessionTask key={tasks[i]!.id} t={tasks[i]!} subject={subject}
          onNext={(r) => { if (r?.correct) setRight((n) => n + 1); setXp((x) => x + (r?.xpEarned ?? 0)); setI((n) => n + 1); }} />
      )}
    </div>
  );
}

function SessionTask({ t, subject, onNext }: { t: LearningTask; subject: string; onNext: (r: AttemptResult | null) => void }) {
  const [val, setVal] = useState("");
  const [reveal, setReveal] = useState(false);
  const [selfPoints, setSelfPoints] = useState(0);
  const [started] = useState(() => Date.now());
  const [result, setResult] = useState<AttemptResult | null>(null);
  const client = useQueryClient();
  const submit = useServerFn(saveAttempt);
  const save = useMutation({ mutationFn: submit, onSuccess: (r) => { setResult(r); client.invalidateQueries({ queryKey: ["learning"] }); } });
  const explain = useMutation({ mutationFn: useServerFn(explainTask) });
  const send = () => save.mutate({ data: { taskId: t.id, answer: val, seconds: Math.min(10800, Math.round((Date.now() - started) / 1000)), ...(t.type === "open" ? { selfPoints } : {}) } });
  const label = t.type === "mc" ? "1. daļa · Izvēle" : t.type === "short" ? "Īsā atbilde" : `2. daļa · ${t.points} p.`;
  const ok = result?.correct;
  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-4 pb-72 pt-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary-strong">{subject} · {label}</div>
          <p className="mt-3 text-xl font-semibold leading-relaxed">{t.question}</p>
          {t.type === "mc" && <div className="mt-6 grid gap-3">
            {strings(t.options).map((o) => {
              const st = result && o === t.answer ? "border-success bg-success/10" : result && o === val ? "border-destructive bg-destructive/10" : val === o ? "border-primary bg-primary-soft" : "bg-card";
              return <button key={o} disabled={!!result || save.isPending} onClick={() => setVal(o)} className={`rounded-2xl border-2 p-4 text-left font-medium ${st}`}>{o}</button>;
            })}
          </div>}
          {t.type === "short" && <input autoFocus value={val} disabled={!!result} onChange={(e) => setVal(e.target.value)} placeholder="Tava atbilde"
            className="mt-6 w-full rounded-2xl border-2 bg-card p-4 text-lg outline-none focus:border-primary" />}
          {t.type === "open" && <textarea value={val} disabled={reveal} onChange={(e) => setVal(e.target.value)} rows={6} placeholder="Pieraksti risinājumu…"
            className="mt-6 w-full resize-none rounded-2xl border-2 bg-card p-4 outline-none focus:border-primary" />}
          {reveal && !result && <div className="card-surface mt-4 p-4 text-sm">
            <p>{t.explanation}</p>
            {strings(t.steps).length > 0 && <ol className="mt-2 list-decimal space-y-1 pl-5">{strings(t.steps).map((s) => <li key={s}>{s}</li>)}</ol>}
            {t.answer && <p className="mt-2 font-semibold">Atbilde: {t.answer}</p>}
            <label className="mt-3 flex items-center gap-2">Pašnovērtējums:
              <select aria-label="Pašnovērtējums" value={selfPoints} onChange={(e) => setSelfPoints(Number(e.target.value))} className="rounded-lg border bg-background p-2">
                {Array.from({ length: t.points + 1 }, (_, k) => <option key={k} value={k}>{k}/{t.points} p.</option>)}
              </select></label>
          </div>}
        </div>
      </div>
      {!result ? (
        <div className="border-t bg-card">
          <div className="mx-auto max-w-2xl px-4 py-4">
            {save.isError && <p role="alert" className="mb-2 text-sm text-destructive">{save.error.message}</p>}
            <Button variant="cta" size="lg" className="h-12 w-full rounded-full text-base" disabled={!val.trim() || save.isPending}
              onClick={() => t.type === "open" && !reveal ? setReveal(true) : send()}>
              {save.isPending ? "Saglabā…" : t.type === "open" && !reveal ? "Rādīt risinājumu" : "Pārbaudīt"}
            </Button>
          </div>
        </div>
      ) : (
        <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ type: "spring", damping: 26, stiffness: 260 }}
          className={`fixed inset-x-0 bottom-0 max-h-[70vh] overflow-y-auto rounded-t-[24px] border-t-4 bg-card shadow-soft ${ok ? "border-success" : "border-destructive"}`}>
          <div className="mx-auto max-w-2xl px-4 py-5">
            <div className={`flex items-center gap-2 text-lg font-bold ${ok ? "text-success" : "text-destructive"}`}>
              {ok ? <Check /> : <X />} {ok ? `Pareizi! +${result.xpEarned} XP` : t.type === "open" ? `${result.pointsEarned}/${t.points} p.` : "Nepareizi"}
            </div>
            {!ok && t.type !== "open" && <p className="mt-1 text-sm">Pareizā atbilde: <b>{t.answer}</b></p>}
            <p className="mt-3 text-sm">{t.explanation}</p>
            {t.type !== "open" && strings(t.steps).length > 0 && <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">{strings(t.steps).map((s) => <li key={s}>{s}</li>)}</ol>}
            {!ok && <Button variant="outline" size="sm" className="mt-3 rounded-full" disabled={explain.isPending} onClick={() => explain.mutate({ data: { taskId: t.id, answer: val } })}>
              <Sparkles /> {explain.isPending ? "Domā…" : "Paskaidro vēlreiz"}</Button>}
            {explain.data && <div className="mt-3 whitespace-pre-line rounded-xl bg-primary-soft p-3 text-sm">{explain.data.text}</div>}
            {explain.isError && <p role="alert" className="mt-2 text-sm text-destructive">{explain.error.message}</p>}
            <Button variant="cta" size="lg" className="mt-5 h-12 w-full rounded-full text-base" onClick={() => onNext(result)}>Tālāk</Button>
          </div>
        </motion.div>
      )}
    </>
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
