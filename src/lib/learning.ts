export type LearningTask = { id: string; subject: string; grades: string[]; topic: string; type: string; question: string; options: unknown; answer: string; explanation: string; steps: unknown; points: number; difficulty: number };
export type Attempt = { task_id: string; correct: boolean; points_earned: number; time_spent_sec: number; created_at: string };
export type AttemptResult = { id: string; correct: boolean; pointsEarned: number; xpEarned: number };
export const strings = (value: unknown): string[] => Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
export const remainingTasks = (tasks: LearningTask[], attempts: Attempt[]) => {
  const solved = new Set(attempts.filter(a => a.correct).map(a => a.task_id));
  return tasks.filter(t => !solved.has(t.id));
};
export const leaderboardVisible = (users: number) => users >= 5;
const dayKey = (date: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Riga', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
export function summarize(attempts: Attempt[], tasks: LearningTask[], now = new Date()) {
  const byId = new Map(tasks.map(t => [t.id, t]));
  const percentage = (rows: Attempt[]) => {
    const max = rows.reduce((s, a) => s + (byId.get(a.task_id)?.points ?? 0), 0);
    return max ? Math.round(rows.reduce((s, a) => s + a.points_earned, 0) / max * 100) : 0;
  };
  const subjects = [...new Set(attempts.map(a => byId.get(a.task_id)?.subject).filter((s): s is string => !!s))];
  const topics = [...new Set(attempts.map(a => byId.get(a.task_id)?.topic).filter((s): s is string => !!s))];
  const weekly = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now.getTime() - (6 - i) * 86400000);
    const rows = attempts.filter(a => dayKey(new Date(a.created_at)) === dayKey(date));
    return { day: new Intl.DateTimeFormat('lv', { weekday: 'short', timeZone: 'Europe/Riga' }).format(date), min: Math.round(rows.reduce((s, a) => s + a.time_spent_sec, 0) / 60), score: rows.length ? percentage(rows) : null };
  });
  return { count: attempts.length, solved: new Set(attempts.filter(a => a.correct).map(a => a.task_id)).size, average: percentage(attempts), totalMin: Math.round(attempts.reduce((s, a) => s + a.time_spent_sec, 0) / 60), weekly,
    projected: subjects.map(subject => ({ subject, score: percentage(attempts.filter(a => byId.get(a.task_id)?.subject === subject)) })),
    weakSpots: topics.map(topic => ({ topic, value: percentage(attempts.filter(a => byId.get(a.task_id)?.topic === topic)) })).filter(t => t.value < 80).sort((a, b) => a.value - b.value) };
}