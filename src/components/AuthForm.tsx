import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const schema = z.object({
  email: z.string().trim().email("Nederīgs e-pasts").max(255),
  password: z.string().min(6, "Parolei jābūt vismaz 6 simboliem").max(72),
  name: z.string().trim().max(60).optional(),
});

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setInfo(null);
    const p = schema.safeParse({ email, password, name: name || undefined });
    if (!p.success) return setErr(p.error.issues[0]!.message);
    setBusy(true);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email: p.data.email, password: p.data.password,
        options: { emailRedirectTo: `${window.location.origin}/onboarding`, data: { display_name: p.data.name } },
      });
      setBusy(false);
      if (error) return setErr(error.message);
      if (!data.session) return setInfo("Pārbaudi e-pastu un apstiprini kontu, tad pieslēdzies.");
      nav({ to: "/onboarding" });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: p.data.email, password: p.data.password });
      setBusy(false);
      if (error) return setErr("Nepareizs e-pasts vai parole.");
      nav({ to: "/" });
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <form onSubmit={submit} className="card-surface w-full max-w-sm space-y-4 p-6">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand font-display font-bold text-primary-foreground">E</span>
          <span className="font-display text-lg font-bold">Examio</span>
        </div>
        <h1 className="text-2xl font-bold">{mode === "login" ? "Pieslēgties" : "Reģistrēties"}</h1>
        {mode === "signup" && (
          <input className="w-full rounded-lg border bg-background px-3 py-2" placeholder="Vārds" value={name} onChange={(e) => setName(e.target.value)} />
        )}
        <input className="w-full rounded-lg border bg-background px-3 py-2" type="email" placeholder="E-pasts" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full rounded-lg border bg-background px-3 py-2" type="password" placeholder="Parole" value={password} onChange={(e) => setPassword(e.target.value)} />
        {mode === "login" && (
          <div className="text-right"><Link to="/aizmirsu-paroli" className="text-sm font-semibold text-primary">Aizmirsi paroli?</Link></div>
        )}
        {err && <p className="text-sm text-destructive">{err}</p>}
        {info && <p className="text-sm text-success">{info}</p>}
        <Button type="submit" variant="cta" className="w-full" disabled={busy}>{busy ? "..." : mode === "login" ? "Pieslēgties" : "Izveidot kontu"}</Button>
        <p className="text-center text-sm text-muted-foreground">
          {mode === "login" ? <>Nav konta? <Link to="/registreties" className="font-semibold text-primary">Reģistrēties</Link></>
            : <>Jau ir konts? <Link to="/pieslegties" className="font-semibold text-primary">Pieslēgties</Link></>}
        </p>
      </form>
    </div>
  );
}
