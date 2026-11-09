import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/cenas")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Plāni un cenas — Bāze, Fokuss, Izcilnieks | Examio" },
      { name: "description", content: "Izvēlies Examio plānu: Bāze bez maksas, Fokuss 10 €/mēn vai Izcilnieks 80 €/mēn." },
      { property: "og:title", content: "Plāni un cenas | Examio" },
      { property: "og:description", content: "Bāze, Fokuss un Izcilnieks plāni." },
    ],
  }),
  component: Pricing,
});

const plans = [
  { name: "Bāze", tag: "Sākumam", m: 0, feats: ["Pamata uzdevumi", "Pareizi / nepareizi atgriezeniskā saite", "Bez AI skaidrojumiem"] },
  { name: "Fokuss", tag: "Ikdienas mācībām", m: 10, feats: ["1300x AI lietojums", "Ātrākas atbildes", "Velkamās kartītes", "Pamata eksāmeni"] },
  { name: "Izcilnieks", tag: "Nopietnām mācībām", m: 80, glow: true, feats: ["Visi oficiālie CE eksāmeni", "VISC eseju vērtētājs", "CE simulators", "Prioritārs AI", "Neierobežoti 1v1 dueļi"] },
];

function Pricing() {
  const [yearly, setYearly] = useState(false);
  return (
    <div className="min-h-screen bg-ink px-4 py-16 text-ink-foreground">
      <div className="mx-auto max-w-6xl">
        <Link to="/" className="text-sm text-ink-muted hover:text-ink-foreground">← Atpakaļ</Link>
        <div className="mt-6 text-center">
          <h1 className="text-3xl font-bold md:text-5xl">Izvēlies savu <span className="text-primary">tempu</span></h1>
          <p className="mt-3 text-ink-muted">Gada plānā ietaupi 2 mēnešus.</p>
          <div className="mt-8 inline-flex rounded-xl bg-ink-card p-1 text-sm">
            {[false, true].map((y) => (
              <button key={String(y)} onClick={() => setYearly(y)}
                className={`rounded-lg px-5 py-2 font-semibold ${yearly === y ? "bg-primary text-primary-foreground" : "text-ink-muted"}`}>
                {y ? "Gadā" : "Mēnesī"}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <div key={p.name} className={`relative rounded-3xl bg-ink-card p-8 ${p.glow ? "shadow-glow md:-translate-y-3" : "border border-ink-muted/20"}`}>
              {p.glow && <span className="absolute -top-3 left-8 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">Populārākais</span>}
              <div className="text-sm font-semibold text-primary">{p.tag}</div>
              <h2 className="mt-1 text-2xl font-bold">{p.name}</h2>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold">{yearly ? p.m * 10 : p.m} €</span>
                <span className="text-ink-muted">/{yearly ? "gadā" : "mēn"}</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm">
                {p.feats.map((f) => <li key={f} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary" />{f}</li>)}
              </ul>
              <Button variant={p.glow ? "cta" : "outline"} className={`mt-8 w-full ${p.glow ? "" : "border-ink-muted/30 bg-transparent text-ink-foreground hover:bg-ink"}`}>
                {p.m === 0 ? "Sākt bez maksas" : "Izvēlēties"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
