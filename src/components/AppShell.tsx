import { Link, useNavigate } from "@tanstack/react-router";
import { Home, BookOpen, Swords, Timer, User, Target, Users, Sparkles, LogOut, Moon, Sun, ChevronDown } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { learningQuery } from "@/lib/learning-query";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const nav = [
  { to: "/", label: "Sākums", icon: Home },
  { to: "/macibas", label: "Mācības", icon: BookOpen },
  { to: "/simulators", label: "Simulators", icon: Timer },
  { to: "/dueli", label: "Dueļi", icon: Swords },
] as const;

function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const d = localStorage.getItem("examio-theme") === "dark";
    setDark(d);
    document.documentElement.classList.toggle("dark", d);
  }, []);
  const toggle = () => {
    const d = !dark;
    setDark(d);
    document.documentElement.classList.toggle("dark", d);
    localStorage.setItem("examio-theme", d ? "dark" : "light");
  };
  return { dark, toggle };
}

function ProfileMenu({ trigger, side = "bottom" }: { trigger: ReactNode; side?: "top" | "bottom" }) {
  const { data } = useQuery({ ...learningQuery, enabled: false });
  const { dark, toggle } = useTheme();
  const client = useQueryClient();
  const navigate = useNavigate();
  const signOut = async () => {
    await client.cancelQueries(); client.clear();
    await supabase.auth.signOut();
    navigate({ to: "/pieslegties", replace: true });
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent side={side} align="end" className="w-60 rounded-2xl p-2">
        <DropdownMenuLabel className="font-display">
          {data?.profile.display_name || "Mans profils"}
          {data?.profile.xp != null && <div className="text-xs font-normal text-muted-foreground">Pieredzes punkti · {data.profile.xp}</div>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><Link to="/mans-plans"><Target /> Mans plāns</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link to="/macibas"><Timer /> Fokusa taimeris</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link to="/vecakiem"><Users /> Vecākiem</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link to="/cenas"><Sparkles /> Cenas</Link></DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); toggle(); }}>
          {dark ? <Sun /> : <Moon />} {dark ? "Gaišais režīms" : "Tumšais režīms"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={signOut} className="text-destructive focus:text-destructive"><LogOut /> Iziet</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { data } = useQuery({ ...learningQuery, enabled: false });
  const initials = data?.profile.display_name?.slice(0, 2).toUpperCase() || <User className="h-4 w-4" />;
  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <a href="#saturs" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-card focus:p-3">Pāriet uz saturu</a>
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl justify-between items-center gap-4 px-4 md:flex">
          <div className="flex min-w-0 items-center gap-3">
            <Link to="/" className="flex shrink-0 items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary font-display text-primary-foreground"><BookOpen aria-hidden="true" className="size-5" /></span>
              <span className="font-display text-2xl tracking-tight font-bold">Examio<span className="text-accent">.</span></span>
            </Link>

          </div>
          <nav aria-label="Galvenā navigācija" className="mx-auto hidden gap-1 md:flex">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
                activeProps={{ className: "bg-primary-soft !text-foreground" }}>
                <n.icon aria-hidden="true" className="size-4" />{n.label}
              </Link>
            ))}
          </nav>
          <div>
            <ProfileMenu trigger={
              <button aria-label="Profila izvēlne" className="flex items-center gap-1 rounded-full border bg-card py-1 pl-1 pr-2 hover:border-primary">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-primary-soft text-xs font-bold">{initials}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            } />
          </div>
        </div>
      </header>
      <main id="saturs" tabIndex={-1} className="mx-auto max-w-6xl px-4 py-6 md:py-10">{children}</main>

      <nav aria-label="Galvenā navigācija" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t bg-card pb-[env(safe-area-inset-bottom)] md:hidden">
        {nav.map((n) => (
          <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }}
            className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground"
            activeProps={{ className: "bg-primary-soft !text-primary-strong" }}>
            <n.icon className="h-5 w-5" />{n.label}
          </Link>
        ))}

      </nav>
    </div>
  );
}

export function PageTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
      {sub && <p className="mt-2 text-muted-foreground">{sub}</p>}
    </div>
  );
}
