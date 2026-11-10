import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RotateCcw, Mic, Sparkles } from "lucide-react";
import { strings, type LearningTask, type AttemptResult } from "@/lib/learning";
import { saveAttempt, explainTask } from "@/lib/learning.functions";
import { Button } from "@/components/ui/button";

export function TaskCard({ t, n }: { t: LearningTask; n: number }) {
  const [val, setVal] = useState("");
  const [checked, setChecked] = useState(false);
  const [mic, setMic] = useState(false);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [selfPoints, setSelfPoints] = useState(0);
  const [started, setStarted] = useState<number | null>(null);
  const client = useQueryClient();
  const submit = useServerFn(saveAttempt);
  const mutation = useMutation({ mutationFn: submit, onSuccess: (saved) => { setResult(saved); setChecked(true); client.invalidateQueries({ queryKey: ["learning"] }); } });
  const explain = useMutation({ mutationFn: useServerFn(explainTask) });
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
        </Button> : !result?.correct && <Button variant="outline" size="sm" disabled={mutation.isPending} onClick={() => { setChecked(false); setResult(null); explain.reset(); setVal(""); setStarted(null); }}><RotateCcw /> Vēlreiz</Button>}
        {result && <span className={`text-sm font-bold ${ok ? "text-success" : "text-destructive"}`}>{ok ? `Pareizi! +${result.xpEarned} XP` : t.type === "open" ? `${result.pointsEarned}/${t.points} p.` : `Nepareizi — pareizi: ${t.answer}`}</span>}
        {result && !result.correct && <Button variant="outline" size="sm" disabled={explain.isPending} onClick={() => explain.mutate({ data: { taskId: t.id, answer: val } })}><Sparkles /> {explain.isPending ? "Domā…" : "Paskaidro vēlreiz"}</Button>}
        {mutation.isError && <p role="alert" className="text-sm text-destructive">{mutation.error.message}</p>}
      </div>
      {explain.data && <div className="mt-3 whitespace-pre-line rounded-xl border border-primary bg-primary-soft p-3 text-sm">{explain.data.text}</div>}
      {explain.isError && <p role="alert" className="mt-2 text-sm text-destructive">{explain.error.message}</p>}
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

