import { describe, expect, it } from 'vitest';
import { dailyTasks, reviewState, weakTopics } from '@/lib/plan';
import type { Attempt, LearningTask } from '@/lib/learning';

const mk = (id: string, topic: string): LearningTask => ({ id, subject: 'M', grades: [], topic, type: 'short', question: '', options: [], answer: '', explanation: '', steps: [], points: 1, difficulty: 1 });
const at = (task_id: string, correct: boolean, created_at: string): Attempt => ({ task_id, correct, points_earned: correct ? 1 : 0, time_spent_sec: 0, created_at });
describe('Mans plāns', () => {
  it('weak topic = accuracy below 60%', () => {
    const tasks = [mk('a', 'A'), mk('b', 'B')];
    const w = weakTopics([at('a', false, '2026-11-01'), at('b', true, '2026-11-01')], tasks);
    expect(w.map(x => x.topic)).toEqual(['A']);
  });
  it('60% counts as not weak', () => {
    const tasks = [mk('a', 'A'), mk('a2', 'A'), mk('a3', 'A'), mk('a4', 'A'), mk('a5', 'A')];
    const rows = [at('a', true, '1'), at('a2', true, '2'), at('a3', true, '3'), at('a4', false, '4'), at('a5', false, '5')];
    expect(weakTopics(rows, tasks)).toEqual([]);
  });
  it('wrong task is due after 1 day, not before', () => {
    const rows = [at('a', false, '2026-11-01T10:00:00Z')];
    expect(reviewState('a', rows, new Date('2026-11-01T20:00:00Z'))).toBe('waiting');
    expect(reviewState('a', rows, new Date('2026-11-02T10:00:00Z'))).toBe('due');
  });
  it('after day-1 review, next due on day 3', () => {
    const rows = [at('a', false, '2026-11-01T10:00:00Z'), at('a', false, '2026-11-02T11:00:00Z')];
    expect(reviewState('a', rows, new Date('2026-11-03T10:00:00Z'))).toBe('waiting');
    expect(reviewState('a', rows, new Date('2026-11-04T10:00:00Z'))).toBe('due');
  });
  it('daily mix is 6 weak, 3 medium, 1 new', () => {
    const tasks = [...Array.from({ length: 8 }, (_, i) => mk(`w${i}`, 'W')), ...Array.from({ length: 8 }, (_, i) => mk(`m${i}`, 'M')), ...Array.from({ length: 8 }, (_, i) => mk(`n${i}`, 'N'))];
    const rows = [at('w0', true, '1'), at('w1', false, '2'), at('w2', false, '3'), at('m0', true, '1'), at('m1', true, '2'), at('m2', true, '3'), at('m3', false, '4')];
    const d = dailyTasks(tasks, rows, new Date('2026-11-10'));
    expect(d).toHaveLength(10);
    expect(d.filter(t => t.topic === 'W')).toHaveLength(6);
    expect(d.filter(t => t.topic === 'M')).toHaveLength(3);
    expect(d.filter(t => t.topic === 'N')).toHaveLength(1);
  });
});
