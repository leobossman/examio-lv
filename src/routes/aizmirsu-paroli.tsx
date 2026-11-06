import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/aizmirsu-paroli")({
  head: () => ({
    meta: [
      { title: "Aizmirsi paroli | Examio" },
      { name: "description", content: "Atjauno savu Examio paroli ar e-pasta saiti." },
      { property: "og:title", content: "Aizmirsi paroli | Examio" },
      { property: "og:description", content: "Saņem paroles atiestatīšanas saiti e-pastā." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const p = z.string().trim().email().max(255).safeParse(email);
    if (!p.success) return setErr("Nederīgs e-pasts");
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(p.data, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) return setErr(error.message);
    setSent(true);
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <form onSubmit={submit} className="card-surface w-full max-w-sm space-y-4 p-6">
        <h1 className="text-2xl font-bold">Aizmirsi paroli?</h1>
        {sent ? (
          <p className="text-sm text-success">Ja šis e-pasts ir reģistrēts, nosūtījām saiti paroles atjaunošanai. Pārbaudi arī mēstuļu mapi.</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">Ievadi e-pastu, un mēs atsūtīsim saiti jaunas paroles iestatīšanai.</p>
            <input className="w-full rounded-lg border bg-background px-3 py-2" type="email" placeholder="E-pasts" value={email} onChange={(e) => setEmail(e.target.value)} />
            {err && <p className="text-sm text-destructive">{err}</p>}
            <Button type="submit" variant="cta" className="w-full" disabled={busy}>{busy ? "..." : "Sūtīt saiti"}</Button>
          </>
        )}
        <p className="text-center text-sm"><Link to="/pieslegties" className="font-semibold text-primary">Atpakaļ uz pieslēgšanos</Link></p>
      </form>
    </div>
  );
}
