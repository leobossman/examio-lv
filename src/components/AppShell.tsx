import { Link } from "@tanstack/react-router";
import { LayoutDashboard, BookOpen, Swords, Timer, Users, Sparkles, Target } from "lucide-react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { learningQuery } from "@/lib/learning-query";
import { FocusTimer, ThemeToggle } from "./HeaderTools";

const nav = [
  { to: "/", label: "Panelis", icon: LayoutDashboard },
  { to: "/macibas", label: "Mācības", icon: BookOpen },
  { to: "/mans-plans", label: "Plāns", icon: Target },
  { to: "/dueli", label: "Dueļi", icon: Swords },
  { to: "/simulators", label: "Simulators", icon: Timer },
  { to: "/vecakiem", label: "Vecākiem", icon: Users },
  { to: "/cenas", label: "Plāni", icon: Sparkles },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { data } = useQuery({ ...learningQuery, enabled: false });
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <header className="sticky top-0 z-30 border-b bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand font-display font-bold text-primary-foreground">E</span>
            <span className="font-display text-lg font-bold">Examio</span>
          </Link>
          <nav className="hidden gap-1 md:flex">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                activeProps={{ className: "bg-primary-soft text-foreground" }}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 md:gap-3">
            <FocusTimer />
            <ThemeToggle />
            <span className="hidden sm:inline rounded-full bg-accent-soft px-3 py-1 text-sm font-bold text-accent">🔥 {data?.profile.streak ?? 0} dienas</span>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-muted text-sm font-bold">{data?.profile.display_name?.slice(0, 2).toUpperCase() || "—"}</span>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-7 border-t bg-card md:hidden">
        {nav.map((n) => (
          <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }}
            className="flex flex-col items-center gap-1 py-2 text-[10px] text-muted-foreground"
            activeProps={{ className: "text-primary" }}>
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
