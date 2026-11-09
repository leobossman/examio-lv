import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Clock, Flag, X, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/simulators")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "CE simulators — īsta eksāmena režīms | Examio" },
      { name: "description", content: "3 stundu CE simulācija bez traucēkļiem ar laika plānošanas analīzi." },
      { property: "og:title", content: "CE simulators | Examio" },
      { property: "og:description", content: "Pilnekrāna 3 stundu eksāmena režīms." },
    ],
  }),
  component: Sim,
});

const parts = [
  { name: "1. daļa", desc: "Zināšanas un pamatprasmes", tasks: ["Aprēķini 2³ · 2⁻¹", "Vienkāršo (a+b)² − a²", "Atrisini 3x − 7 = 11"] },
  { name: "2. daļa", desc: "Zināšanu lietošana", tasks: ["Atrodi trijstūra laukumu, ja a=6, h=4", "Funkcija f(x)=2x+1. Atrodi f(3)"] },
  { name: "3. daļa", desc: "Problēmu risināšana", tasks: ["Pamato, kāpēc √2 ir iracionāls skaitlis"] },
];

const TOTAL = 3 * 3600;

function Sim() {
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(TOTAL);
  const [part, setPart] = useState(0);
  const [spent, setSpent] = useState([0, 0, 0]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setLeft((l) => Math.max(0, l - 1));
      setSpent((s) => s.map((v, i) => (i === part ? v + 1 : v)));
    }, 1000);
    return () => clearInterval(t);
  }, [running, part]);

  const fmt = (s: number) => `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const finish = () => { setRunning(false); setDone(true); };

  if (!running && !done) {
    return (
      <div className="grid min-h-screen place-items-center bg-background p-6">
        <div className="card-surface max-w-lg p-8 text-center">
          <Clock className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-4 text-2xl font-bold">Matemātika · Optimālais līmenis</h1>
          <p className="mt-2 text-muted-foreground">180 minūtes · 3 daļas · bez traucēkļiem. Simulācija atkārto īsta CE struktūru.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild variant="outline"><Link to="/">Atpakaļ</Link></Button>
            <Button variant="cta" onClick={() => { document.documentElement.requestFullscreen?.().catch(() => {}); setRunning(true); }}>Sākt eksāmenu</Button>
          </div>
        </div>
      </div>
    );
  }

  if (done) {
    const total = spent.reduce((a, b) => a + b, 0) || 1;
    const ideal = [25, 40, 35];
    return (
      <div className="grid min-h-screen place-items-center bg-background p-6">
        <div className="card-surface w-full max-w-xl p-8">
          <div className="flex items-center gap-2 font-semibold text-primary"><Bot className="h-5 w-5" /> AI laika plānošanas analīze</div>
          <div className="mt-6 space-y-4">
            {parts.map((p, i) => {
              const pct = Math.round(((spent[i] ?? 0) / total) * 100);
              return (
                <div key={p.name} className="text-sm">
                  <div className="mb-1 flex justify-between"><span>{p.name}</span><span>{pct}% (ieteicams {(ideal[i] ?? 0)}%)</span></div>
                  <div className="h-2 rounded-full bg-muted"><div className={`h-2 rounded-full ${Math.abs(pct - (ideal[i] ?? 0)) > 10 ? "bg-accent" : "bg-primary"}`} style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>
          <p className="mt-6 rounded-xl bg-primary-soft p-4 text-sm">
            Kopā izmantoji {fmt(TOTAL - left)}. {(spent[2] ?? 0) / total < 0.3 ? "3. daļai atvēli pārāk maz laika — tā dod visvairāk punktu. Nākamreiz 1. daļu pabeidz 45 minūtēs." : "Laiks sadalīts līdzsvaroti. Turpini tā!"}
          </p>
          <Button asChild variant="cta" className="mt-6 w-full"><Link to="/">Uz paneli</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b bg-card px-6 py-3">
        <div className="text-sm font-semibold">Matemātika CE · Optimālais</div>
        <div className={`font-display text-xl font-bold ${left < 900 ? "text-accent" : ""}`}>{fmt(left)}</div>
        <div className="flex gap-2">
          <Button variant="cta" size="sm" onClick={finish}><Flag /> Iesniegt</Button>
          <Button variant="ghost" size="icon" onClick={finish} aria-label="Iziet"><X /></Button>
        </div>
      </header>
      <div className="mx-auto grid max-w-5xl gap-6 p-6 md:grid-cols-[200px_1fr]">
        <nav className="space-y-2">
          {parts.map((p, i) => (
            <button key={p.name} onClick={() => setPart(i)} className={`w-full rounded-xl border p-3 text-left text-sm ${i === part ? "border-primary bg-primary-soft" : "bg-card"}`}>
              <div className="font-semibold">{p.name}</div><div className="text-xs text-muted-foreground">{p.desc}</div>
            </button>
          ))}
        </nav>
        <div className="space-y-4">
          {parts[part]!.tasks.map((t, i) => (
            <div key={t} className="card-surface p-5">
              <div className="text-xs font-semibold text-muted-foreground">{i + 1}. uzdevums</div>
              <div className="mt-1 font-medium">{t}</div>
              <textarea rows={3} className="mt-3 w-full rounded-lg border bg-background p-3 outline-none focus:ring-2 focus:ring-ring" placeholder="Tava atbilde…" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
