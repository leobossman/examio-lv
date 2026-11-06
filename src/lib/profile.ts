import { supabase } from "@/integrations/supabase/client";

import { GRADES } from "@/lib/exam-catalog";
export const grades = GRADES;
export const baselines = [
  { v: "lt40", l: "Zem 40% (Cīnos par izdzīvošanu)", mid: 30 },
  { v: "40-60", l: "40%-60% (Viduvēji)", mid: 50 },
  { v: "60-80", l: "60%-80% (Labi)", mid: 70 },
  { v: "80-100", l: "80%-100% (Teicami)", mid: 90 },
];
export const goals = [
  { v: "pass", l: "Nokārtot minimālo robežu", target: 10 },
  { v: "paid", l: "Tikt universitātē par maksu (50-60%)", target: 55 },
  { v: "budget", l: "Tikt budžeta vietā LU/RTU (75-85%)", target: 80 },
  { v: "excellence", l: "Izcilība (>90%)", target: 92 },
];
export const struggles = ["Teorijas un formulu iegaumēšana", "2. daļas atvērtie uzdevumi", "Laika plānošana un stress", "Motivācijas trūkums"];

export type Exam = { subject: string; level: string; year?: number };
export type Profile = {
  id: string; display_name: string | null; grade: string | null; exams: Exam[];
  baseline: string | null; goal: string | null; struggle: string | null; onboarded: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const profilesTable = () => (supabase as any).from("profiles");

export async function loadProfile(userId: string): Promise<Profile | null> {
  const { data } = await profilesTable().select("*").eq("id", userId).maybeSingle();
  return (data as Profile) ?? null;
}

/** Gap between current baseline midpoint and goal target, in percentage points. */
export function computeGap(baseline: string | null, goal: string | null) {
  const cur = baselines.find((b) => b.v === baseline)?.mid ?? 50;
  const target = goals.find((g) => g.v === goal)?.target ?? 55;
  const gap = Math.max(0, target - cur);
  const intensity = gap === 0 ? "uzturēšana" : gap <= 15 ? "mērena" : gap <= 35 ? "intensīva" : "maksimālā";
  const dailyMin = gap === 0 ? 20 : gap <= 15 ? 40 : gap <= 35 ? 70 : 100;
  return { cur, target, gap, intensity, dailyMin };
}
