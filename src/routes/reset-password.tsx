import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Jauna parole | Examio" },
      { name: "description", content: "Iestati jaunu Examio paroli." },
      { property: "og:title", content: "Jauna parole | Examio" },
      { property: "og:description", content: "Iestati jaunu paroli savam Examio kontam." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  const nav = useNavigate();
  const [ready, setReady] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (window.location.hash.includes("type=recovery")) setReady(true);
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    supabase.auth.getSession().then(({ data: s }) => { if (s.session) setReady(true); });
    return () => data.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (pw.length < 6 || pw.length > 72) return setErr("Parolei jābūt vismaz 6 simboliem");
    if (pw !== pw2) return setErr("Paroles nesakrīt");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return setErr(error.message);
    nav({ to: "/" });
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <form onSubmit={submit} className="card-surface w-full max-w-sm space-y-4 p-6">
        <h1 className="text-2xl font-bold">Jauna parole</h1>
        {!ready ? (
          <p className="text-sm text-muted-foreground">Atver šo lapu no saites, ko saņēmi e-pastā.</p>
        ) : (
          <>
            <input className="w-full rounded-lg border bg-background px-3 py-2" type="password" placeholder="Jaunā parole" value={pw} onChange={(e) => setPw(e.target.value)} />
            <input className="w-full rounded-lg border bg-background px-3 py-2" type="password" placeholder="Atkārto paroli" value={pw2} onChange={(e) => setPw2(e.target.value)} />
            {err && <p className="text-sm text-destructive">{err}</p>}
            <Button type="submit" variant="cta" className="w-full" disabled={busy}>{busy ? "..." : "Saglabāt paroli"}</Button>
          </>
        )}
      </form>
    </div>
  );
}
