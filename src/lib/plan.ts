import type { Attempt, LearningTask } from './learning';

const DAY = 86400000;
export const REVIEW_DAYS = [1, 3, 7];

/** Accuracy per topic over the last 20 attempts in that topic. */
export function topicAccuracy(attempts: Attempt[], tasks: LearningTask[]) {
  const byId = new Map(tasks.map(t => [t.id, t]));
  const groups = new Map<string, Attempt[]>();
  for (const a of [...attempts].sort((x, y) => x.created_at.localeCompare(y.created_at))) {
    const topic = byId.get(a.task_id)?.topic; if (!topic) continue;
    groups.set(topic, [...(groups.get(topic) ?? []), a]);
  }
  return [...groups].map(([topic, rows]) => { const last = rows.slice(-20); return { topic, accuracy: Math.round(last.filter(a => a.correct).length / last.length * 100), count: last.length }; });
}

export const weakTopics = (attempts: Attempt[], tasks: LearningTask[]) =>
  topicAccuracy(attempts, tasks).filter(t => t.accuracy < 60).sort((a, b) => a.accuracy - b.accuracy).slice(0, 3);

/** Wrong, still-unsolved tasks: 'due' when a 1/3/7-day review point since the first mistake has passed with no attempt since; otherwise 'waiting'. */
export function reviewState(taskId: string, attempts: Attempt[], now = new Date()): 'due' | 'waiting' | null {
  const rows = attempts.filter(a => a.task_id === taskId).sort((x, y) => x.created_at.localeCompare(y.created_at));
  if (!rows.length || rows.some(a => a.correct)) return null;
  const first = new Date(rows[0]!.created_at).getTime(); const last = new Date(rows.at(-1)!.created_at).getTime();
  return REVIEW_DAYS.some(d => now.getTime() >= first + d * DAY && last < first + d * DAY) ? 'due' : 'waiting';
}

/** 10 tasks: 60% weak topics, 30% medium topics, 10% new; due reviews go first, gaps are filled from the rest. */
export function dailyTasks(tasks: LearningTask[], attempts: Attempt[], now = new Date(), size = 10) {
  const acc = new Map(topicAccuracy(attempts, tasks).map(t => [t.topic, t.accuracy]));
  const weak = new Set(weakTopics(attempts, tasks).map(t => t.topic));
  const tried = new Set(attempts.map(a => a.task_id));
  const pool = tasks.filter(t => { const s = reviewState(t.id, attempts, now); return s === 'due' || (s === null && !attempts.some(a => a.task_id === t.id && a.correct)); });
  const due = (t: LearningTask) => reviewState(t.id, attempts, now) === 'due' ? 0 : 1;
  const sort = (l: LearningTask[]) => l.sort((a, b) => due(a) - due(b) || a.difficulty - b.difficulty || a.id.localeCompare(b.id));
  const weakL = sort(pool.filter(t => weak.has(t.topic)));
  const medL = sort(pool.filter(t => !weak.has(t.topic) && acc.has(t.topic)));
  const newL = sort(pool.filter(t => !acc.has(t.topic) && !tried.has(t.id)));
  const picked: LearningTask[] = [];
  const take = (l: LearningTask[], n: number) => { for (const t of l) { if (n <= 0 || picked.length >= size) break; if (!picked.includes(t)) { picked.push(t); n--; } } };
  take(weakL, Math.round(size * 0.6)); take(medL, Math.round(size * 0.3)); take(newL, size - Math.round(size * 0.6) - Math.round(size * 0.3));
  take(sort([...weakL, ...medL, ...newL, ...pool]), size);
  return picked;
}
