import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Swords, Zap } from "lucide-react";
import { AppShell, PageTitle } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { leaderboard } from "@/lib/data";

export const Route = createFileRoute("/dueli")({
  head: () => ({
    meta: [
      { title: "1v1 Dueļi — sacenties ar klasesbiedriem | Examio" },
      { name: "description", content: "Ātrās 5 minūšu viktorīnas pret klasesbiedriem. Nopelni XP un kāp līderu tabulā." },
      { property: "og:title", content: "1v1 Dueļi | Examio" },
      { property: "og:description", content: "5 minūšu viktorīnas pret klasesbiedriem." },
    ],
  }),
  component: Duels,
});

const qs = [
  { q: "Cik ir 7 · 8?", a: ["54", "56", "64", "48"], c: 1 },
  { q: "Kurā gadā Latvija iestājās ES?", a: ["2001", "2004", "2007", "1991"], c: 1 },
  { q: "Ķīmiskais simbols zeltam?", a: ["Ag", "Au", "Zn", "Go"], c: 1 },
  { q: "sin 90° = ?", a: ["0", "1", "½", "√2"], c: 1 },
  { q: "Garākā upe Latvijā?", a: ["Daugava", "Gauja", "Venta", "Lielupe"], c: 1 },
];

function Duels() {
  const [state, setState] = useState<"lobby" | "play" | "end">("lobby");
  const [qi, setQi] = useState(0);
  const [me, setMe] = useState(0);
  const [opp, setOpp] = useState(0);
  const [time, setTime] = useState(300);
  const [picked, setPicked] = useState<number | null>(null);

  useEffect(() => {
    if (state !== "play") return;
    const t = setInterval(() => setTime((s) => (s <= 1 ? (setState("end"), 0) : s - 1)), 1000);
    return () => clearInterval(t);
  }, [state]);

  const answer = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === qs[qi].c) setMe((m) => m + 100);
    if (Math.random() > 0.4) setOpp((o) => o + 100);
    setTimeout(() => {
      setPicked(null);
      if (qi + 1 >= qs.length) setState("end"); else setQi(qi + 1);
    }, 700);
  };
  const start = () => { setQi(0); setMe(0); setOpp(0); setTime(300); setState("play"); };

  return (
    <AppShell>
      <PageTitle title="1v1 Dueļi" sub="5 minūtes. Ātras atbildes. Uzvarētājs saņem XP." />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="card-surface p-6">
          {state === "lobby" && (
            <div className="py-10 text-center">
              <div className="flex items-center justify-center gap-6">
                <Avatar n="Tu" /><Swords className="h-10 w-10 text-accent" /><Avatar n="Elīza K." />
              </div>
              <Button variant="cta" size="lg" className="mt-8" onClick={start}><Zap /> Sākt dueli</Button>
            </div>
          )}
          {state === "play" && (
            <div>
              <div className="flex items-center justify-between">
                <Score n="Tu" s={me} /><span className="font-display text-xl font-bold text-accent">{Math.floor(time / 60)}:{String(time % 60).padStart(2, "0")}</span><Score n="Elīza" s={opp} />
              </div>
              <motion.div key={qi} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
                <div className="text-sm text-muted-foreground">Jautājums {qi + 1}/{qs.length}</div>
                <h2 className="mt-2 text-xl font-bold">{qs[qi].q}</h2>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {qs[qi].a.map((a, i) => (
                    <button key={a} onClick={() => answer(i)}
                      className={`rounded-xl border-2 p-4 text-left font-semibold transition ${picked === null ? "hover:border-primary" : i === qs[qi].c ? "border-success bg-success/10" : picked === i ? "border-destructive bg-destructive/10" : "opacity-50"}`}>
                      {a}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
          {state === "end" && (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-10 text-center">
              <div className="text-5xl">{me >= opp ? "🏆" : "💪"}</div>
              <h2 className="mt-4 text-2xl font-bold">{me > opp ? "Uzvara!" : me === opp ? "Neizšķirts" : "Nākamreiz!"}</h2>
              <p className="mt-2 text-muted-foreground">{me} pret {opp} · +{me > opp ? 150 : 50} XP</p>
              <Button variant="cta" className="mt-6" onClick={start}>Revanšs</Button>
            </motion.div>
          )}
        </section>
        <aside className="card-surface h-fit p-5">
          <h3 className="font-bold">Līderu tabula</h3>
          <ol className="mt-4 space-y-2 text-sm">
            {leaderboard.map((u, i) => (
              <li key={u.name} className="flex justify-between"><span>{i + 1}. {u.name}</span><b>{u.xp} XP</b></li>
            ))}
          </ol>
        </aside>
      </div>
    </AppShell>
  );
}

function Avatar({ n }: { n: string }) {
  return <div className="text-center"><div className="grid h-20 w-20 place-items-center rounded-full bg-brand font-display text-xl font-bold text-primary-foreground">{n[0]}</div><div className="mt-2 font-semibold">{n}</div></div>;
}
function Score({ n, s }: { n: string; s: number }) {
  return <div><div className="text-xs text-muted-foreground">{n}</div><div className="font-display text-2xl font-bold">{s}</div></div>;
}
